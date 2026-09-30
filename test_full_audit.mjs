import { spawn } from 'child_process';
import fs from 'fs';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9349;

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
  console.log('=====================================================');
  console.log('FULL FUNCTIONALITY AUDIT & STABILIZATION VERIFICATION');
  console.log('=====================================================');

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

    // 1. Initial Page Load
    console.log('\n--- 1. INITIAL LOAD & HERO AUDIT ---');
    await client.send('Page.navigate', { url: 'http://localhost:3000/' });
    await sleep(2000);

    const initialScroll = await client.eval('window.scrollY');
    console.log(`[PASS] Initial scroll position: ${initialScroll}px`);
    if (initialScroll !== 0) throw new Error('Did not initialize at top');

    // Check Hero Buttons & Links
    const heroAudit = await client.eval(`
      (() => {
        return {
          navHome: document.getElementById('nav-home')?.getAttribute('href'),
          navAbout: document.getElementById('nav-about') !== null,
          navProducts: document.getElementById('nav-products')?.getAttribute('href'),
          navContact: document.getElementById('nav-contact')?.getAttribute('href'),
          ctaBalajiTiles: document.getElementById('cta-balaji-tiles')?.getAttribute('href'),
          ctaExploreGranite: document.getElementById('cta-explore-granite')?.getAttribute('href')
        };
      })()
    `);
    console.log('[PASS] Hero navigation targets:', heroAudit);
    if (!heroAudit.navAbout) throw new Error('nav-about missing');
    if (!heroAudit.navContact.includes('9660222886')) throw new Error('nav-contact missing phone 9660222886');
    if (!heroAudit.ctaBalajiTiles.includes('balajitiles.com')) throw new Error('cta-balaji-tiles destination error');

    // 2. Granite Collection Initial State & Slider Navigation
    console.log('\n--- 2. GRANITE COLLECTION SLIDER AUDIT ---');
    await client.eval(`window.scrollTo(0, 1000)`);
    await sleep(600);

    const initialSliderState = await client.eval(`
      (() => {
        return {
          counter: document.getElementById('counter-current')?.textContent.trim(),
          title: document.getElementById('granite-title')?.textContent.trim(),
          activeDashIdx: Array.from(document.querySelectorAll('.progress-dash')).findIndex(d => d.classList.contains('is-active'))
        };
      })()
    `);
    console.log('[PASS] Granite Slider initial state:', initialSliderState);
    if (initialSliderState.counter !== '01') throw new Error('Slider did not start at 01');
    if (initialSliderState.title !== 'BLACK GALAXY') throw new Error('First granite is not Black Galaxy');
    if (initialSliderState.activeDashIdx !== 0) throw new Error('Active progress dash is not 0');

    // Test NEXT button
    console.log('Clicking NEXT button (01 -> 02)...');
    await client.eval(`document.getElementById('slider-next').click()`);
    await sleep(350);

    const nextSliderState = await client.eval(`
      (() => {
        return {
          counter: document.getElementById('counter-current')?.textContent.trim(),
          title: document.getElementById('granite-title')?.textContent.trim(),
          activeDashIdx: Array.from(document.querySelectorAll('.progress-dash')).findIndex(d => d.classList.contains('is-active'))
        };
      })()
    `);
    console.log('[PASS] Granite Slider after NEXT:', nextSliderState);
    if (nextSliderState.counter !== '02') throw new Error('Slider did not advance to 02');

    // Test PREVIOUS button
    console.log('Clicking PREV button (02 -> 01)...');
    await client.eval(`document.getElementById('slider-prev').click()`);
    await sleep(350);

    const prevSliderState = await client.eval(`
      document.getElementById('counter-current')?.textContent.trim()
    `);
    console.log(`[PASS] Granite Slider returned to: ${prevSliderState}`);
    if (prevSliderState !== '01') throw new Error('Slider did not return to 01');

    // 3. Granite Modal Audit
    console.log('\n--- 3. GRANITE DETAIL MODAL AUDIT ---');
    console.log('Clicking active Black Galaxy slab to open modal...');
    await client.eval(`document.querySelectorAll('.slab-item')[0].click()`);
    await sleep(400);

    const modalData = await client.eval(`
      (() => {
        const backdrop = document.getElementById('granite-modal-backdrop');
        return {
          isOpen: backdrop.classList.contains('is-open'),
          title: document.getElementById('modal-granite-title')?.textContent.trim(),
          finish: document.getElementById('modal-granite-finish')?.textContent.trim(),
          origin: document.getElementById('modal-granite-origin')?.textContent.trim(),
          waHref: document.getElementById('modal-btn-whatsapp')?.getAttribute('href'),
          quoteHref: document.getElementById('modal-btn-quote')?.getAttribute('href'),
          bodyOverflow: document.body.style.overflow
        };
      })()
    `);
    console.log('[PASS] Granite Modal open data:', modalData);
    if (!modalData.isOpen) throw new Error('Granite detail modal failed to open');
    if (modalData.title !== 'BLACK GALAXY') throw new Error('Wrong granite title in modal');
    if (!modalData.waHref.includes('9660222886')) throw new Error('WhatsApp missing owner phone 9660222886');
    if (modalData.bodyOverflow !== 'hidden') throw new Error('Body overflow was not locked');

    // Test Close Modal
    console.log('Closing modal via close button...');
    await client.eval(`document.getElementById('modal-close-btn').click()`);
    await sleep(300);

    const modalClosed = await client.eval(`
      (() => {
        const backdrop = document.getElementById('granite-modal-backdrop');
        return {
          isOpen: backdrop.classList.contains('is-open'),
          bodyOverflow: document.body.style.overflow,
          docOverflow: document.documentElement.style.overflow
        };
      })()
    `);
    console.log('[PASS] Modal closed state:', modalClosed);
    if (modalClosed.isOpen) throw new Error('Modal did not close');
    if (modalClosed.bodyOverflow !== '') throw new Error('Body overflow not restored');

    // Test clicking a neighbor slab (e.g. index 1: Kashmir White)
    console.log('Clicking neighbor slab (index 1: Kashmir White)...');
    await client.eval(`document.querySelectorAll('.slab-item')[1].click()`);
    await sleep(400);

    const neighborModal = await client.eval(`
      (() => {
        const backdrop = document.getElementById('granite-modal-backdrop');
        return {
          isOpen: backdrop.classList.contains('is-open'),
          title: document.getElementById('modal-granite-title')?.textContent.trim(),
          waHref: document.getElementById('modal-btn-whatsapp')?.getAttribute('href')
        };
      })()
    `);
    console.log('[PASS] Neighbor slab modal data:', neighborModal);
    if (!neighborModal.isOpen || neighborModal.title !== 'KASHMIR WHITE') {
      throw new Error('Neighbor slab failed to open modal with correct data');
    }
    await client.eval(`document.getElementById('modal-close-btn').click()`);
    await sleep(300);

    // 4. Granite Finder Audit
    console.log('\n--- 4. GRANITE FINDER AUDIT ---');
    console.log('Transitioning to Granite Finder...');
    await client.eval('window.transitionToFinder()');
    await sleep(950);

    const finderReady = await client.eval(`
      (() => {
        const finder = document.getElementById('granite-finder');
        return {
          pointerEvents: window.getComputedStyle(finder).pointerEvents,
          state: window.finderState
        };
      })()
    `);
    console.log('[PASS] Finder ready state:', finderReady);

    // Test selection changes
    console.log('Selecting Floor (Question 1)...');
    await client.eval(`document.querySelector('.finder-tile[data-group="app"][data-value="floor"]').click()`);
    console.log('Selecting Warm (Question 2)...');
    await client.eval(`document.querySelector('.finder-tile[data-group="tone"][data-value="warm"]').click()`);
    console.log('Selecting Honed (Question 3)...');
    await client.eval(`document.querySelector('.finder-tile[data-group="finish"][data-value="honed"]').click()`);
    await sleep(200);

    const updatedFinderState = await client.eval(`window.finderState`);
    console.log('[PASS] Updated finderState:', updatedFinderState);
    if (updatedFinderState.application !== 'floor' || updatedFinderState.tone !== 'warm' || updatedFinderState.finish !== 'honed') {
      throw new Error('finderState did not update correctly');
    }

    // Click SHOW MY GRANITES
    console.log('Clicking SHOW MY GRANITES...');
    await client.eval(`document.getElementById('finder-submit-btn').click()`);
    await sleep(400);

    const finderResults = await client.eval(`
      (() => {
        const wrapper = document.getElementById('finder-card-wrapper');
        const count = document.getElementById('finder-results-count')?.textContent.trim();
        const cards = Array.from(document.querySelectorAll('.finder-result-card'));
        return {
          isResultsActive: wrapper.classList.contains('is-results-active'),
          countText: count,
          cardsCount: cards.length,
          firstTitle: cards[0]?.querySelector('.result-card-title')?.textContent.trim()
        };
      })()
    `);
    console.log('[PASS] Finder results view:', finderResults);
    if (!finderResults.isResultsActive) throw new Error('Results view is not active');
    if (finderResults.cardsCount !== 1) throw new Error('Expected 1 match for Floor+Warm+Honed (Tan Brown)');
    if (finderResults.firstTitle !== 'TAN BROWN') throw new Error('First match is not Tan Brown');

    // Click Result Card to open modal
    console.log('Clicking Tan Brown result card to open modal...');
    await client.eval(`document.querySelectorAll('.finder-result-card')[0].click()`);
    await sleep(400);

    const finderCardModal = await client.eval(`
      (() => {
        const backdrop = document.getElementById('granite-modal-backdrop');
        return {
          isOpen: backdrop.classList.contains('is-open'),
          title: document.getElementById('modal-granite-title')?.textContent.trim()
        };
      })()
    `);
    console.log('[PASS] Modal opened from Finder card:', finderCardModal);
    if (!finderCardModal.isOpen || finderCardModal.title !== 'TAN BROWN') {
      throw new Error('Result card failed to open correct modal');
    }
    await client.eval(`document.getElementById('modal-close-btn').click()`);
    await sleep(300);

    // Test CHANGE PREFERENCES button
    console.log('Clicking CHANGE PREFERENCES...');
    await client.eval(`document.getElementById('finder-change-pref-btn').click()`);
    await sleep(300);

    const returnedToQuestions = await client.eval(`
      !document.getElementById('finder-card-wrapper').classList.contains('is-results-active')
    `);
    console.log('[PASS] Returned to questions view:', returnedToQuestions);
    if (!returnedToQuestions) throw new Error('CHANGE PREFERENCES failed to return to question UI');

    // 5. Tile Collection Section & Controls Audit
    console.log('\n--- 5. TILE COLLECTION SECTION & CONTROLS AUDIT ---');
    console.log('Transitioning to Tile Section...');
    await client.eval('window.transitionToTiles()');
    await sleep(950);

    const initialTileState = await client.eval(`
      (() => {
        const activeDot = document.querySelector('.tile-dot.is-active');
        const allDots = Array.from(document.querySelectorAll('.tile-dot'));
        const activeIdx = allDots.indexOf(activeDot);
        const arrowOpacity = window.getComputedStyle(document.getElementById('drag-arrow-btn')).opacity;
        const portalHref = document.getElementById('tile-portal-btn')?.getAttribute('href');
        return {
          activeDotIndex: activeIdx,
          arrowOpacity: parseFloat(arrowOpacity),
          portalHref: portalHref
        };
      })()
    `);
    console.log('[PASS] Initial Tile Slider state:', initialTileState);
    if (initialTileState.activeDotIndex !== 0) throw new Error(`Tile slider did not initialize at index 0 (got ${initialTileState.activeDotIndex})`);
    if (!initialTileState.portalHref.includes('balajitiles.com')) throw new Error('Portal CTA button missing');

    // Test Tile Arrow Button (click -> next tile)
    console.log('Clicking tile arrow button (0 -> 1)...');
    await client.eval(`document.getElementById('drag-arrow-btn').click()`);
    await sleep(400);

    const tileIndexAfterArrow = await client.eval(`
      (() => {
        const activeDot = document.querySelector('.tile-dot.is-active');
        const allDots = Array.from(document.querySelectorAll('.tile-dot'));
        return allDots.indexOf(activeDot);
      })()
    `);
    console.log(`[PASS] Tile index after arrow click: ${tileIndexAfterArrow}`);
    if (tileIndexAfterArrow !== 1) throw new Error('Arrow button failed to advance tile index');

    // Advance to final tile and test bounds protection
    console.log('Advancing to final tile to test bounds & disabled state...');
    await client.eval(`
      for (let i = 0; i < 10; i++) {
        document.getElementById('drag-arrow-btn').click();
      }
    `);
    await sleep(400);

    const finalTileState = await client.eval(`
      (() => {
        const activeDot = document.querySelector('.tile-dot.is-active');
        const allDots = Array.from(document.querySelectorAll('.tile-dot'));
        const arrow = document.getElementById('drag-arrow-btn');
        return {
          finalIdx: allDots.indexOf(activeDot),
          totalDots: allDots.length,
          arrowOpacity: parseFloat(window.getComputedStyle(arrow).opacity),
          isDisabled: arrow.getAttribute('aria-disabled') === 'true'
        };
      })()
    `);
    console.log('[PASS] Final tile state:', finalTileState);
    if (finalTileState.finalIdx !== finalTileState.totalDots - 1) throw new Error('Final index does not match last dot');
    if (finalTileState.arrowOpacity > 0.5) throw new Error('Arrow button was not visually reduced at end');

    // 6. Reverse Transitions Audit
    console.log('\n--- 6. REVERSE TRANSITIONS AUDIT ---');
    console.log('Reverse transitioning: Tile -> Finder...');
    await client.eval('window.transitionBackToFinder()');
    await sleep(950);

    const backToFinderState = await client.eval(`
      (() => {
        const finder = document.getElementById('granite-finder');
        const tile = document.getElementById('tile-section');
        return {
          finderPointerEvents: window.getComputedStyle(finder).pointerEvents,
          tilePointerEvents: window.getComputedStyle(tile).pointerEvents
        };
      })()
    `);
    console.log('[PASS] Back to Finder state:', backToFinderState);
    if (backToFinderState.finderPointerEvents !== 'auto' || backToFinderState.tilePointerEvents !== 'none') {
      throw new Error('Reverse transition to Finder failed');
    }

    console.log('Reverse transitioning: Finder -> Granite Collection...');
    await client.eval('window.transitionBackToCollection()');
    await sleep(950);

    const backToCollectionState = await client.eval(`
      (() => {
        const collection = document.getElementById('granite-collection');
        const inner = document.getElementById('granite-collection-inner');
        return {
          pointerEvents: window.getComputedStyle(collection).pointerEvents,
          opacity: parseFloat(window.getComputedStyle(inner).opacity)
        };
      })()
    `);
    console.log('[PASS] Back to Collection state:', backToCollectionState);
    if (backToCollectionState.pointerEvents !== 'auto' || backToCollectionState.opacity < 0.9) {
      throw new Error('Reverse transition to Collection failed');
    }

    // 7. Fresh Page Reload
    console.log('\n--- 7. FRESH PAGE RELOAD AUDIT ---');
    await client.send('Page.reload');
    await sleep(2000);

    const postReloadState = await client.eval(`
      (() => {
        const activeTileDot = document.querySelector('.tile-dot.is-active');
        const allTileDots = Array.from(document.querySelectorAll('.tile-dot'));
        return {
          scrollY: window.scrollY,
          graniteCounter: document.getElementById('counter-current')?.textContent.trim(),
          tileIndex: allTileDots.indexOf(activeTileDot)
        };
      })()
    `);
    console.log('[PASS] Post reload state:', postReloadState);
    if (postReloadState.scrollY !== 0) throw new Error('Reload did not reset scroll to 0');
    if (postReloadState.graniteCounter !== '01') throw new Error('Granite slider did not reset to 01');
    if (postReloadState.tileIndex !== 0) throw new Error('Tile slider did not reset to 0');

    console.log('\n=====================================================');
    console.log('🎉 ALL AUDIT & STABILIZATION CHECKS PASSED PERFECTLY!');
    console.log('=====================================================');

    client.close();
  } catch (err) {
    console.error('❌ Audit failure:', err);
    process.exit(1);
  } finally {
    edgeProcess.kill();
  }
}

run();
