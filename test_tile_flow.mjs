import { spawn } from 'child_process';
import fs from 'fs';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9343;

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
  console.log('🚀 Launching Edge for Tile Collection testing...');
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
    await client.eval(`window.scrollTo(0, ${maxScroll})`);
    await sleep(600);

    // 3. Downward gesture -> Finder transition
    console.log('\n--- TEST 3: Downward Scroll -> Finder Transition ---');
    await client.eval(`
      window.dispatchEvent(new WheelEvent('wheel', { deltaY: 50, cancelable: true }));
    `);
    await sleep(1200);

    const finderState = await client.eval(`
      (() => {
        const inner = document.getElementById('granite-finder-inner');
        return parseFloat(window.getComputedStyle(inner).opacity) > 0.8;
      })()
    `);
    console.log('Finder revealed:', finderState);
    if (!finderState) throw new Error('Granite Finder did not reveal');

    // 4. Downward gesture at end of Finder -> Tile Section transition
    console.log('\n--- TEST 4: One Downward Scroll Gesture -> Tile Section Transition ---');
    await client.eval(`
      window.dispatchEvent(new WheelEvent('wheel', { deltaY: 50, cancelable: true }));
    `);
    console.log('Waiting for Tile Section curtain transition...');
    await sleep(1400);

    const tileState = await client.eval(`
      (() => {
        const section = document.getElementById('tile-section');
        const inner = document.getElementById('tile-section-inner');
        const curtain = document.getElementById('tile-ivory-curtain');
        const slabs = document.querySelectorAll('.tile-slab-item');
        const activeSlab = slabs[2]; // Calacatta Gold
        return {
          opacity: parseFloat(window.getComputedStyle(inner).opacity),
          pointerEvents: window.getComputedStyle(section).pointerEvents,
          curtainTransform: window.getComputedStyle(curtain).transform,
          totalSlabs: slabs.length,
          activeSlabTransform: window.getComputedStyle(activeSlab).transform,
          activeSlabOpacity: parseFloat(window.getComputedStyle(activeSlab).opacity)
        };
      })()
    `);
    console.log('Tile Section state:', tileState);
    if (tileState.opacity < 0.9) throw new Error('Tile section inner not fully revealed');
    if (tileState.pointerEvents !== 'auto') throw new Error('Tile section pointerEvents is not auto');
    if (tileState.totalSlabs < 5) throw new Error('Tile slabs not rendered');

    await client.captureScreenshot('test_tile_revealed.png');

    // 5. Test Slab Navigation via Pagination Dot
    console.log('\n--- TEST 5: Clicking Pagination Dot to Switch Slab ---');
    await client.eval(`document.querySelectorAll('.tile-dot')[3].click()`);
    await sleep(700);

    const advancedState = await client.eval(`
      (() => {
        const slabs = document.querySelectorAll('.tile-slab-item');
        const activeDot = document.querySelector('.tile-dot.is-active');
        const allDots = Array.from(document.querySelectorAll('.tile-dot'));
        const activeIdx = allDots.indexOf(activeDot);
        return {
          activeDotIndex: activeIdx,
          newActiveSlabOpacity: parseFloat(window.getComputedStyle(slabs[3]).opacity)
        };
      })()
    `);
    console.log('Advanced Tile state after dot click:', advancedState);
    if (advancedState.activeDotIndex !== 3) throw new Error('Active index did not advance to 3');

    await client.captureScreenshot('test_tile_next_slab.png');

    // 6. Test DRAG TO EXPLORE Pill & Portal Destination
    console.log('\n--- TEST 6: Verifying DRAG TO EXPLORE slide setup ---');
    const pillExists = await client.eval(`document.getElementById('tile-drag-pill') !== null`);
    const portalBtnRemoved = await client.eval(`document.getElementById('tile-portal-btn') === null`);
    console.log(`Pill exists: ${pillExists}, Old button removed: ${portalBtnRemoved}`);
    if (!pillExists || !portalBtnRemoved) throw new Error('Pill setup incorrect');

    // 7. Test Upward Transition Back to Granite Finder
    console.log('\n--- TEST 7: Upward Scroll -> Reverse Transition to Granite Finder ---');
    await client.eval(`
      window.dispatchEvent(new WheelEvent('wheel', { deltaY: -50, cancelable: true }));
    `);
    await sleep(1400);

    const reversedToFinder = await client.eval(`
      (() => {
        const finder = document.getElementById('granite-finder');
        const finderInner = document.getElementById('granite-finder-inner');
        const tileCurtain = document.getElementById('tile-ivory-curtain');
        const tileSection = document.getElementById('tile-section');
        return {
          finderOpacity: parseFloat(window.getComputedStyle(finderInner).opacity),
          finderPointerEvents: window.getComputedStyle(finder).pointerEvents,
          tilePointerEvents: window.getComputedStyle(tileSection).pointerEvents
        };
      })()
    `);
    console.log('Reversed to Finder state:', reversedToFinder);
    if (reversedToFinder.finderOpacity < 0.9) throw new Error('Finder did not restore opacity');
    if (reversedToFinder.finderPointerEvents !== 'auto') throw new Error('Finder pointerEvents is not auto');
    if (reversedToFinder.tilePointerEvents !== 'none') throw new Error('Tile section pointerEvents is not none');

    // 8. Test Page Reload Scroll Reset
    console.log('\n--- TEST 8: Page Reload Fresh Reset ---');
    await client.send('Page.reload');
    await sleep(2000);

    const reloadScroll = await client.eval('window.scrollY');
    console.log(`Scroll position after reload: ${reloadScroll}px`);
    if (reloadScroll !== 0) throw new Error('Reload did not start at top');

    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉');

    client.close();
  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    edgeProcess.kill();
  }
}

run();
