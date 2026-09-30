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

async function capture() {
  const edgeProcess = spawn(EDGE_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1440,900',
    'about:blank'
  ]);

  edgeProcess.on('error', (err) => console.error('Edge process error:', err));

  // Wait for debug endpoint to become available
  let version = null;
  for (let i = 0; i < 30; i++) {
    await sleep(250);
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) {
        version = await res.json();
        break;
      }
    } catch (e) {}
  }

  if (!version) {
    console.error('Failed to connect to Edge debug port');
    edgeProcess.kill();
    return;
  }

  const listRes = await fetch(`http://127.0.0.1:${PORT}/json`);
  const pages = await listRes.json();
  const targetPage = pages.find(p => p.type === 'page') || pages[0];

  const client = new CDPClient(targetPage.webSocketDebuggerUrl);
  await client.ready();

  console.log('Connected to CDP');
  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('DOM.enable');

  // Set desktop viewport
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  // Navigate to local site
  await client.send('Page.navigate', { url: 'http://localhost:3000/?revealed=1&test_time=7.5' });
  await sleep(1500);

  // 1. Capture Hero resting state
  let shot = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('test_hero_resting.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved test_hero_resting.png');

  // 2. Scroll half-way to showcase vertical slide transition
  await client.send('Runtime.evaluate', { expression: 'window.scrollTo(0, 450); window.dispatchEvent(new Event("scroll"));' });
  await sleep(600);
  shot = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('test_scroll_reveal_half.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved test_scroll_reveal_half.png');

  // 3. Scroll to full Granite Collection section
  await client.send('Runtime.evaluate', { expression: 'window.scrollTo(0, 900); window.dispatchEvent(new Event("scroll"));' });
  await sleep(800);
  shot = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('test_granite_collection_full.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved test_granite_collection_full.png');

  // 4. Click Next Granite Slab button
  await client.send('Runtime.evaluate', { expression: 'document.getElementById("slider-next").click();' });
  await sleep(900);
  shot = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('test_granite_slide_2.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved test_granite_slide_2.png');

  // 5. Test Mobile viewport
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await client.send('Runtime.evaluate', { expression: 'window.scrollTo(0, 844); window.dispatchEvent(new Event("scroll"));' });
  await sleep(800);
  shot = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('test_granite_mobile.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved test_granite_mobile.png');

  client.close();
  edgeProcess.kill();
  console.log('Capture completed successfully');
}

capture().catch(console.error);
