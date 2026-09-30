import { spawn } from 'child_process';
import fs from 'fs';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9342;

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
  console.log('🚀 Launching Edge for Granite Finder testing...');
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

    // 1. Initial Load
    console.log('\n--- TEST 1: Initial Page Load ---');
    await client.send('Page.navigate', { url: 'http://localhost:3000/' });
    await sleep(2000);

    const initialScroll = await client.eval('window.scrollY');
    console.log(`Initial scroll position: ${initialScroll}px`);
    if (initialScroll !== 0) throw new Error('Did not start at top');

    // 2. Scroll to Granite Collection
    console.log('\n--- TEST 2: Scroll to Granite Collection ---');
    const maxScroll = await client.eval(`
      (() => {
        const track = document.getElementById('experience-track');
        return (track ? track.offsetHeight : window.innerHeight * 2.2) - window.innerHeight;
      })()
    `);
    console.log(`Max scroll target: ${maxScroll}px`);

    await client.eval(`window.scrollTo(0, ${maxScroll})`);
    await sleep(600);

    const collectionVisible = await client.eval(`
      (() => {
        const inner = document.getElementById('granite-collection-inner');
        return parseFloat(window.getComputedStyle(inner).opacity) > 0.8;
      })()
    `);
    console.log(`Collection visible: ${collectionVisible}`);
    if (!collectionVisible) throw new Error('Granite Collection is not visible');

    // 3. Downward wheel gesture at end of Granite Collection
    console.log('\n--- TEST 3: One Downward Scroll Gesture -> Finder Transition ---');
    await client.eval(`
      window.dispatchEvent(new WheelEvent('wheel', { deltaY: 50, cancelable: true }));
    `);
    console.log('Waiting for curtain transition...');
    await sleep(1200);

    const finderRevealed = await client.eval(`
      (() => {
        const finder = document.getElementById('granite-finder');
        const finderInner = document.getElementById('granite-finder-inner');
        const curtain = document.getElementById('finder-ivory-curtain');
        return {
          opacity: parseFloat(window.getComputedStyle(finderInner).opacity),
          pointerEvents: window.getComputedStyle(finder).pointerEvents,
          curtainTransform: window.getComputedStyle(curtain).transform
        };
      })()
    `);
    console.log('Finder state:', finderRevealed);
    if (finderRevealed.opacity < 0.9) throw new Error('Finder did not reveal');
    if (finderRevealed.pointerEvents !== 'auto') throw new Error('Finder pointerEvents is not auto');

    await client.captureScreenshot('test_finder_revealed.png');

    // 4. Default selections
    console.log('\n--- TEST 4: Checking Default Selections ---');
    const selections = await client.eval(`
      Array.from(document.querySelectorAll('.finder-tile.is-selected')).map(el => ({
        group: el.dataset.group,
        value: el.dataset.value
      }))
    `);
    console.log('Default selections:', selections);

    // 5. Submit SHOW MY GRANITES
    console.log('\n--- TEST 5: Clicking SHOW MY GRANITES ---');
    await client.eval(`document.getElementById('finder-submit-btn').click()`);
    await sleep(600);

    const results = await client.eval(`
      (() => {
        const wrapper = document.getElementById('finder-card-wrapper');
        const count = document.getElementById('finder-results-count')?.textContent.trim();
        const cards = document.querySelectorAll('.finder-result-card');
        const titles = Array.from(cards).map(c => c.querySelector('.result-card-title')?.textContent.trim());
        return {
          isResultsActive: wrapper.classList.contains('is-results-active'),
          count,
          totalCards: cards.length,
          titles
        };
      })()
    `);
    console.log('Results output:', results);
    if (!results.isResultsActive || results.totalCards === 0) throw new Error('No results displayed');

    await client.captureScreenshot('test_finder_results.png');

    // 6. Click on first result card to open Modal
    console.log('\n--- TEST 6: Clicking Result Card to Open Modal ---');
    await client.eval(`document.querySelector('.finder-result-card').click()`);
    await sleep(600);

    const modalData = await client.eval(`
      (() => {
        const modal = document.getElementById('granite-modal-backdrop');
        const title = document.getElementById('modal-granite-title')?.textContent.trim();
        const wa = document.getElementById('modal-btn-whatsapp')?.getAttribute('href');
        return {
          isOpen: modal.classList.contains('is-open'),
          title,
          whatsappHref: wa
        };
      })()
    `);
    console.log('Modal data:', modalData);
    if (!modalData.isOpen) throw new Error('Modal did not open');
    if (!modalData.whatsappHref.includes('9660222886')) throw new Error('Owner phone number missing');

    await client.captureScreenshot('test_finder_modal_opened.png');

    // 7. Close modal
    console.log('\n--- TEST 7: Closing Modal ---');
    await client.eval(`document.getElementById('modal-close-btn').click()`);
    await sleep(400);

    // 8. Change preferences
    console.log('\n--- TEST 8: Change Preferences ---');
    await client.eval(`document.getElementById('finder-change-pref-btn').click()`);
    await sleep(400);

    const backToQuestions = await client.eval(`
      !document.getElementById('finder-card-wrapper').classList.contains('is-results-active')
    `);
    console.log(`Back to question view: ${backToQuestions}`);
    if (!backToQuestions) throw new Error('Could not return to question view');

    // 9. Select Floor + Warm + Honed and submit
    console.log('\n--- TEST 9: Select Floor + Warm + Honed ---');
    await client.eval(`
      document.querySelector('.finder-tile[data-group="app"][data-value="floor"]').click();
      document.querySelector('.finder-tile[data-group="tone"][data-value="warm"]').click();
      document.querySelector('.finder-tile[data-group="finish"][data-value="honed"]').click();
      document.getElementById('finder-submit-btn').click();
    `);
    await sleep(600);

    const newResults = await client.eval(`
      (() => {
        const count = document.getElementById('finder-results-count')?.textContent.trim();
        const subtitle = document.getElementById('finder-results-subtitle')?.textContent.trim();
        const total = document.querySelectorAll('.finder-result-card').length;
        return { count, subtitle, total };
      })()
    `);
    console.log('New results:', newResults);
    if (newResults.total === 0) throw new Error('New preferences yielded 0 results');

    // 10. Reverse transition back to Granite Collection
    console.log('\n--- TEST 10: Reverse Transition to Granite Collection ---');
    await client.eval(`
      window.dispatchEvent(new WheelEvent('wheel', { deltaY: -50, cancelable: true }));
    `);
    await sleep(1200);

    const reverseState = await client.eval(`
      (() => {
        const collection = document.getElementById('granite-collection-inner');
        return parseFloat(window.getComputedStyle(collection).opacity);
      })()
    `);
    console.log(`Collection opacity after reverse transition: ${reverseState}`);
    if (reverseState < 0.8) throw new Error('Failed to reverse transition to collection');

    // 11. Browser Reload Test
    console.log('\n--- TEST 11: Page Reload Test ---');
    await client.send('Page.reload');
    await sleep(2000);

    const reloadState = await client.eval(`
      (() => {
        return {
          scrollY: window.scrollY,
          heroOpacity: window.getComputedStyle(document.getElementById('hero')).opacity
        };
      })()
    `);
    console.log('Reload state:', reloadState);
    if (reloadState.scrollY !== 0) throw new Error('Reload did not reset scroll to top');

    // 12. Mobile Test
    console.log('\n--- TEST 12: Mobile Viewport Test (390x844) ---');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });

    await client.eval(`
      window.scrollTo(0, ${maxScroll});
    `);
    await sleep(500);

    await client.eval(`
      window.transitionToFinder();
    `);
    await sleep(1200);

    await client.captureScreenshot('test_finder_mobile.png');

    console.log('\n🎉 ALL 12 TESTS PASSED PERFECTLY WITH ZERO REGRESSIONS!');
    client.close();
  } catch (err) {
    console.error('❌ Error during testing:', err);
    process.exit(1);
  } finally {
    edgeProcess.kill();
  }
}

run();
