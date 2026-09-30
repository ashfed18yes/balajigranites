import { spawn } from 'child_process';
import fs from 'fs';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9345;

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

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval exception: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result ? res.result.value : undefined;
  }

  async captureScreenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(filename, Buffer.from(res.data, 'base64'));
    console.log(`📸 Screenshot saved: ${filename}`);
  }

  close() {
    this.ws.close();
  }
}

async function run() {
  console.log('🚀 Testing DRAG TO EXPLORE Full Slide to Balaji Tiles...');
  const edgeProcess = spawn(EDGE_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1440,900',
    'about:blank'
  ]);

  try {
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
    await client.send('Runtime.enable');

    await client.send('Page.navigate', { url: 'http://localhost:3000/' });
    await sleep(2000);

    // Transition into Tile section
    await client.eval('window.transitionToFinder()');
    await sleep(900);
    await client.eval('window.transitionToTiles()');
    await sleep(1200);

    // Verify Balaji Tiles button is removed
    console.log('\n--- TEST 1: Check Balaji Tiles button is REMOVED ---');
    const portalBtnExists = await client.eval(`document.getElementById('tile-portal-btn') !== null`);
    console.log(`Portal button exists: ${portalBtnExists}`);
    if (portalBtnExists) throw new Error('Portal button was not removed!');

    // Verify Side Label exists
    const sideLabelText = await client.eval(`document.querySelector('.tile-side-label')?.textContent.replace(/\\s+/g, ' ').trim()`);
    console.log(`Side label text: "${sideLabelText}"`);
    if (!sideLabelText.includes('EXPLORE OUR TILE COLLECTION')) throw new Error('Side label missing');

    await client.captureScreenshot('test_drag_pill_initial.png');

    // Test sliding simulation:
    console.log('\n--- TEST 2: Testing Drag to Explore sliding simulation ---');
    // Prevent actual page navigation during test so we can inspect DOM state
    await client.eval(`
      window.__interceptedUrl = null;
      // intercept navigation
      const origLocation = window.location;
      window.openBalajiTilesWebsite = () => {
        window.__interceptedUrl = 'https://balajitiles.com';
      };
    `);

    // Simulate clicking the arrow button to slide across
    console.log('Simulating full slide trigger...');
    await client.eval(`document.getElementById('drag-arrow-btn').click()`);
    await sleep(400);

    const slideState = await client.eval(`
      (() => {
        const pill = document.getElementById('tile-drag-pill');
        const handle = document.getElementById('drag-handle-wrap');
        const label = document.getElementById('drag-pill-label');
        return {
          isUnlocked: pill.classList.contains('is-unlocked'),
          labelText: label.textContent.trim(),
          handleTransform: window.getComputedStyle(handle).transform,
          interceptedUrl: window.__interceptedUrl
        };
      })()
    `);
    console.log('Full slide state:', slideState);
    if (!slideState.isUnlocked) throw new Error('Pill did not unlock');
    if (!slideState.labelText.includes('EXPLORING BALAJI TILES')) throw new Error('Label did not update');

    await client.captureScreenshot('test_drag_pill_unlocked.png');

    // Wait for navigation trigger
    await sleep(200);
    const triggeredUrl = await client.eval(`window.__interceptedUrl`);
    console.log(`Triggered navigation destination: ${triggeredUrl}`);
    if (triggeredUrl !== 'https://balajitiles.com') throw new Error('Destination URL is not https://balajitiles.com');

    console.log('\n🎉 ALL DRAG SLIDER TESTS PASSED! 🎉');

    client.close();
  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    edgeProcess.kill();
  }
}

run();
