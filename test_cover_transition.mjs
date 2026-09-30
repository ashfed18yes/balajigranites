import { spawn } from 'child_process';
import fs from 'fs';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9333;

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

async function runTest() {
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
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) break;
    } catch(e) {}
  }

  const listRes = await fetch(`http://127.0.0.1:${PORT}/json`);
  const pages = await listRes.json();
  const targetPage = pages.find(p => p.type === 'page') || pages[0];
  const client = new CDPClient(targetPage.webSocketDebuggerUrl);
  await client.ready();

  await client.send('Page.enable');
  await client.send('Runtime.enable');

  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  // Load site with hero UI forced visible
  await client.send('Page.navigate', { url: 'http://localhost:3000/?revealed=1&test_time=7.5' });
  await sleep(1500);

  // Get total scrollable distance
  const scrollInfoRes = await client.send('Runtime.evaluate', {
    expression: `(() => {
      const track = document.getElementById('experience-track');
      const maxScroll = track ? (track.offsetHeight - window.innerHeight) : window.innerHeight;
      return { maxScroll, innerHeight: window.innerHeight };
    })()`,
    returnByValue: true
  });

  const maxScroll = scrollInfoRes.result.value.maxScroll;
  console.log('Max scroll distance:', maxScroll);

  const testPoints = [
    { name: 'scroll_00_hero.png', pct: 0 },
    { name: 'scroll_25_cover.png', pct: 0.25 },
    { name: 'scroll_50_cover.png', pct: 0.50 },
    { name: 'scroll_75_cover.png', pct: 0.75 },
    { name: 'scroll_90_cover.png', pct: 0.90 },
    { name: 'scroll_100_granite_revealed.png', pct: 1.00 }
  ];

  for (const pt of testPoints) {
    const targetY = Math.round(maxScroll * pt.pct);
    await client.send('Runtime.evaluate', {
      expression: `(() => {
        window.scrollTo(0, ${targetY});
        window.dispatchEvent(new Event('scroll'));
      })()`
    });
    await sleep(600);
    const shot = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`d:/BalajiGranites2/${pt.name}`, Buffer.from(shot.data, 'base64'));
    console.log(`Captured ${pt.name} at scrollY=${targetY} (${pt.pct * 100}%)`);
  }

  // Next slide test: click slider-next
  await client.send('Runtime.evaluate', {
    expression: `document.getElementById('slider-next').click();`
  });
  await sleep(800);
  let shot = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('d:/BalajiGranites2/scroll_slide_2_next.png', Buffer.from(shot.data, 'base64'));
  console.log('Captured scroll_slide_2_next.png');

  // Mobile test: 390x844
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await sleep(400);
  await client.send('Runtime.evaluate', {
    expression: `(() => {
      const track = document.getElementById('experience-track');
      const maxS = track ? (track.offsetHeight - window.innerHeight) : window.innerHeight;
      window.scrollTo(0, maxS);
      window.dispatchEvent(new Event('scroll'));
    })()`
  });
  await sleep(800);
  shot = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('d:/BalajiGranites2/scroll_mobile_100.png', Buffer.from(shot.data, 'base64'));
  console.log('Captured scroll_mobile_100.png');

  client.close();
  edgeProcess.kill();
  console.log('All tests completed successfully!');
}

runTest().catch(console.error);
