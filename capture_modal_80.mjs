import { spawn } from 'child_process';
import fs from 'fs';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9358;

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

    await client.send('Page.navigate', { url: 'http://localhost:3000/?revealed=1&test_time=9.5' });
    await sleep(2500);

    // Hero at 80% reference
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1800,
      height: 1125,
      deviceScaleFactor: 1,
      mobile: false,
      scale: 0.8
    });
    await sleep(500);
    await client.captureScreenshot('comp_80pct_ref_01_hero_revealed.png');

    // Hero at 100% normal
    await client.send('Emulation.clearDeviceMetricsOverride');
    await sleep(500);
    await client.captureScreenshot('comp_100pct_01_hero_revealed.png');

    // Scroll to granite
    await client.eval('window.scrollTo(0, 1100)');
    await sleep(800);

    // Open modal at 100%
    await client.eval('document.querySelector(".slab-item.is-active")?.click()');
    await sleep(600);
    await client.captureScreenshot('comp_100pct_03_modal_revealed.png');

    // Modal at 80% reference
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1800,
      height: 1125,
      deviceScaleFactor: 1,
      mobile: false,
      scale: 0.8
    });
    await sleep(500);
    await client.captureScreenshot('comp_80pct_ref_03_modal_revealed.png');

    client.close();
  } finally {
    edgeProcess.kill();
  }
}

run().catch(console.error);
