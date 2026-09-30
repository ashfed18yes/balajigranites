import { spawn } from 'child_process';
import fs from 'fs';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9338;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && this.callbacks.has(data.id)) {
        const { resolve, reject } = this.callbacks.get(data.id);
        this.callbacks.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    };
  }

  async ready() {
    if (this.ws.readyState === WebSocket.OPEN) return;
    return new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });
  }

  send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.ws.close();
  }
}

async function run() {
  const edgeProcess = spawn(EDGE_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1440,900',
    'about:blank'
  ]);

  for (let i = 0; i < 30; i++) {
    await sleep(200);
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json`);
      if (res.ok) break;
    } catch (e) {}
  }

  const listRes = await fetch(`http://127.0.0.1:${PORT}/json`);
  const tabs = await listRes.json();
  const pageTab = tabs.find(t => t.type === 'page');
  const client = new CDPClient(pageTab.webSocketDebuggerUrl);
  await client.ready();

  await client.send('Page.enable');
  await client.send('DOM.enable');

  console.log('=== TEST 1 & 4: Initial Navigation, Scroll to Granite #7, and Reload ===');
  await client.send('Page.navigate', { url: 'http://localhost:3000/' });
  await sleep(1500);

  // Initial scroll check
  let initialScroll = await client.send('Runtime.evaluate', {
    expression: 'window.scrollY'
  });
  console.log('Initial scrollY on first load:', initialScroll.result.value);

  // Scroll down to Granite Collection
  console.log('Scrolling down to Granite Collection...');
  await client.send('Runtime.evaluate', {
    expression: 'window.scrollTo(0, 1100);'
  });
  await sleep(600);

  // Move slider to granite #7 (index 6, Emerald Green)
  console.log('Navigating slider to granite #7 (Emerald Green)...');
  await client.send('Runtime.evaluate', {
    expression: `
      const slabs = document.querySelectorAll('.slab-item');
      if (slabs[6]) slabs[6].click();
      document.getElementById('modal-close-btn').click();
    `
  });
  await sleep(400);

  let stateBeforeReload = await client.send('Runtime.evaluate', {
    expression: `
      ({
        scrollY: window.scrollY,
        counter: document.getElementById('counter-current').textContent,
        title: document.getElementById('granite-title').textContent
      })
    `,
    returnByValue: true
  });
  console.log('State before reload:', stateBeforeReload.result.value);

  // Press browser reload via CDP Page.reload
  console.log('Executing Page.reload()...');
  await client.send('Page.reload');
  await sleep(800);

  // Immediately inspect viewport after reload
  let stateAfterReload = await client.send('Runtime.evaluate', {
    expression: `
      ({
        scrollY: window.scrollY,
        curtainY: document.getElementById('warm-ivory-curtain').style.transform,
        counter: document.getElementById('counter-current').textContent,
        title: document.getElementById('granite-title').textContent,
        graniteInnerOpacity: document.getElementById('granite-collection-inner').style.opacity,
        videoTime: document.getElementById('cinematic-video').currentTime
      })
    `,
    returnByValue: true
  });
  console.log('State immediately after reload (TEST 1 & 4):', stateAfterReload.result.value);

  const shot1 = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('test_reload_hero.png', Buffer.from(shot1.data, 'base64'));
  console.log('Saved test_reload_hero.png');

  // Verify TEST 1: when scrolling down again, Granite Collection starts at granite #1
  console.log('Scrolling down after reload to verify granite #1...');
  await client.send('Runtime.evaluate', {
    expression: 'window.scrollTo(0, 1100);'
  });
  await sleep(600);

  let stateAfterScrollDown = await client.send('Runtime.evaluate', {
    expression: `
      ({
        scrollY: window.scrollY,
        counter: document.getElementById('counter-current').textContent,
        title: document.getElementById('granite-title').textContent
      })
    `,
    returnByValue: true
  });
  console.log('State after scrolling down post-reload:', stateAfterScrollDown.result.value);

  const shotAfterScroll = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('test_reload_slider_starts_at_1.png', Buffer.from(shotAfterScroll.data, 'base64'));
  console.log('Saved test_reload_slider_starts_at_1.png');

  console.log('=== TEST 2: Move to granite #12, Reload, wait without scrolling ===');
  await client.send('Runtime.evaluate', {
    expression: `
      const slabs = document.querySelectorAll('.slab-item');
      if (slabs[11]) slabs[11].click();
      document.getElementById('modal-close-btn').click();
    `
  });
  await sleep(400);

  let state12 = await client.send('Runtime.evaluate', {
    expression: `
      ({
        counter: document.getElementById('counter-current').textContent,
        title: document.getElementById('granite-title').textContent
      })
    `,
    returnByValue: true
  });
  console.log('At granite #12:', state12.result.value);

  console.log('Reloading while at granite #12...');
  await client.send('Page.reload');
  await sleep(800);

  let test2Result = await client.send('Runtime.evaluate', {
    expression: `
      ({
        scrollY: window.scrollY,
        curtainY: document.getElementById('warm-ivory-curtain').style.transform,
        counter: document.getElementById('counter-current').textContent,
        title: document.getElementById('granite-title').textContent,
        graniteInnerOpacity: document.getElementById('granite-collection-inner').style.opacity
      })
    `,
    returnByValue: true
  });
  console.log('TEST 2 result immediately on reload (no scrolling):', test2Result.result.value);

  console.log('=== TEST 3: Scroll Hero -> Granite -> Hero (Reverse Transition) ===');
  // Scroll down
  await client.send('Runtime.evaluate', {
    expression: 'window.scrollTo(0, 1100);'
  });
  await sleep(500);

  let scrolledDownState = await client.send('Runtime.evaluate', {
    expression: `
      ({
        scrollY: window.scrollY,
        curtainY: document.getElementById('warm-ivory-curtain').style.transform,
        graniteInnerOpacity: document.getElementById('granite-collection-inner').style.opacity
      })
    `,
    returnByValue: true
  });
  console.log('At granite stage:', scrolledDownState.result.value);

  // Scroll back to Hero (top)
  console.log('Scrolling back up to Hero...');
  await client.send('Runtime.evaluate', {
    expression: 'window.scrollTo(0, 0);'
  });
  await sleep(500);

  let returnToHeroState = await client.send('Runtime.evaluate', {
    expression: `
      ({
        scrollY: window.scrollY,
        curtainY: document.getElementById('warm-ivory-curtain').style.transform,
        graniteInnerOpacity: document.getElementById('granite-collection-inner').style.opacity,
        heroTransform: document.getElementById('hero').style.transform
      })
    `,
    returnByValue: true
  });
  console.log('Back at Hero (TEST 3):', returnToHeroState.result.value);

  const shotReverse = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('test_reverse_transition_hero.png', Buffer.from(shotReverse.data, 'base64'));
  console.log('Saved test_reverse_transition_hero.png');

  client.close();
  edgeProcess.kill();
  console.log('ALL TESTS COMPLETED!');
}

run().catch(err => {
  console.error('Error in test:', err);
  process.exit(1);
});
