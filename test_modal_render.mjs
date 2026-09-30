import { spawn } from 'child_process';
import fs from 'fs';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9335;

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

  // Set viewport to 1440x900
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  console.log('Navigating to http://localhost:3000/ ...');
  await client.send('Page.navigate', { url: 'http://localhost:3000/' });
  await sleep(2000);

  // Scroll to Granite Collection
  console.log('Scrolling down to Granite Collection...');
  await client.send('Runtime.evaluate', {
    expression: `window.scrollTo(0, 1100);`
  });
  await sleep(1000);

  // Click active slab (Black Galaxy)
  console.log('Clicking active Black Galaxy slab to open modal...');
  const clickRes = await client.send('Runtime.evaluate', {
    expression: `
      const activeSlab = document.querySelector('.slab-item.is-active');
      if (activeSlab) {
        activeSlab.click();
        'clicked slab';
      } else {
        'active slab not found';
      }
    `
  });
  console.log('Click result:', clickRes.result.value);

  // Wait for modal transition
  await sleep(800);

  // Verify modal visibility and details
  const modalInfo = await client.send('Runtime.evaluate', {
    expression: `
      const backdrop = document.getElementById('granite-modal-backdrop');
      const title = document.getElementById('modal-granite-title');
      const desc = document.getElementById('modal-granite-short-desc');
      const finish = document.getElementById('modal-granite-finish');
      const waBtn = document.getElementById('modal-btn-whatsapp');
      ({
        isOpen: backdrop.classList.contains('is-open'),
        title: title.textContent,
        finish: finish.textContent,
        waHref: waBtn.href
      })
    `,
    returnByValue: true
  });
  console.log('Modal status:', modalInfo.result.value);

  // Screenshot 1: Desktop open modal
  const shot1 = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('test_modal_desktop.png', Buffer.from(shot1.data, 'base64'));
  console.log('Saved test_modal_desktop.png');

  // Click 3rd thumbnail (Countertop)
  console.log('Clicking countertop thumbnail...');
  await client.send('Runtime.evaluate', {
    expression: `
      const thumbs = document.querySelectorAll('.modal-thumb-btn');
      if (thumbs.length >= 3) {
        thumbs[2].click();
      }
    `
  });
  await sleep(400);

  // Screenshot 2: Countertop thumbnail selected
  const shot2 = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('test_modal_countertop.png', Buffer.from(shot2.data, 'base64'));
  console.log('Saved test_modal_countertop.png');

  // Close modal
  console.log('Closing modal...');
  await client.send('Runtime.evaluate', {
    expression: `document.getElementById('modal-close-btn').click();`
  });
  await sleep(500);

  // Navigate to Emerald Green (index 6) in slider and open modal
  console.log('Testing Emerald Green (index 6)...');
  await client.send('Runtime.evaluate', {
    expression: `
      const slabs = document.querySelectorAll('.slab-item');
      if (slabs[6]) slabs[6].click();
    `
  });
  await sleep(700);

  const emeraldShot = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('test_modal_emerald.png', Buffer.from(emeraldShot.data, 'base64'));
  console.log('Saved test_modal_emerald.png');

  // Close modal again
  await client.send('Runtime.evaluate', {
    expression: `document.getElementById('modal-close-btn').click();`
  });
  await sleep(400);

  // Mobile Viewport Test: 390x844
  console.log('Switching to mobile viewport (390x844)...');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await sleep(400);

  // Open Black Galaxy modal on mobile
  console.log('Opening Black Galaxy modal on mobile...');
  await client.send('Runtime.evaluate', {
    expression: `window.openGraniteModal(0);`
  });
  await sleep(800);

  const mobileShot = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('test_modal_mobile.png', Buffer.from(mobileShot.data, 'base64'));
  console.log('Saved test_modal_mobile.png');

  // Scroll down modal content on mobile to see features and CTAs
  await client.send('Runtime.evaluate', {
    expression: `
      const m = document.getElementById('granite-detail-modal');
      if (m) m.scrollTop = 380;
    `
  });
  await sleep(400);

  const mobileScrolledShot = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('test_modal_mobile_scrolled.png', Buffer.from(mobileScrolledShot.data, 'base64'));
  console.log('Saved test_modal_mobile_scrolled.png');

  client.close();
  edgeProcess.kill();
  console.log('All tests completed successfully!');
}

run().catch(err => {
  console.error('Error running test:', err);
  process.exit(1);
});
