/**
 * Balaji Tiles — Cinematic Hero Experience
 * Controller for video timeline synchronization and seamless UI materialization.
 */

// 1. Disable browser automatic scroll restoration immediately
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// 2. Prevent html { scroll-behavior: smooth } from animating the initial reset
document.documentElement.style.scrollBehavior = 'auto';

// 3. Clear stale hashes from previous sessions so browser does not jump to anchors
if (window.location.hash && window.location.hash !== '#home') {
  try {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  } catch (e) { }
}

// 4. Force scroll position to top instantly before anything renders or restores
try {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
} catch (e) {
  window.scrollTo(0, 0);
}

// 4. Handle browser pageshow / bfcache restoration
window.addEventListener('pageshow', (event) => {
  document.documentElement.style.scrollBehavior = 'auto';
  try {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  } catch (e) {
    window.scrollTo(0, 0);
  }
  requestAnimationFrame(() => {
    document.documentElement.style.scrollBehavior = '';
  });
});

// 5. Ensure scroll is at 0 before page unloads so reloads always start at top
window.addEventListener('beforeunload', () => {
  document.documentElement.style.scrollBehavior = 'auto';
  window.scrollTo(0, 0);
});

document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('cinematic-video');
  const heroUi = document.getElementById('hero-ui');
  const navbarWrapper = document.getElementById('navbar');

  if (!video || !heroUi) return;

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (window.matchMedia && window.matchMedia('(max-width: 768px)').matches) ||
    ('ontouchstart' in window && window.innerWidth <= 1024);

  heroUi.classList.remove('is-revealed');
  if (navbarWrapper) navbarWrapper.classList.remove('is-revealed');

  if (isMobile) {
    // Mobile: Strict compliance with mobile autoplay policy (muted + inline)
    // Do NOT immediately pause the video — allow native autoplay to proceed
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
  } else {
    // Desktop: Preserve existing behavior exactly as before
    video.pause();
    try {
      video.currentTime = 0;
    } catch (e) { }

    video.muted = false;
    video.defaultMuted = false;
    video.removeAttribute('muted');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
  }

  let isRevealed = false;
  let hasEnded = false;
  let rafId = null;

  // Support automated verification via URL query params
  const urlParams = new URLSearchParams(window.location.search);
  const testTime = urlParams.get('test_time');
  const forcedRevealed = urlParams.get('revealed');

  if (testTime !== null) {
    const t = parseFloat(testTime);
    video.pause();
    video.currentTime = t;
    if (forcedRevealed === '1') {
      isRevealed = true;
      heroUi.classList.add('is-revealed');
      if (navbarWrapper) navbarWrapper.classList.add('is-revealed');
    }
  }

  /**
   * Determine reveal timestamp based on ~35% remaining duration
   * Video is ~10s, so reveal begins around ~6.5s while video is STILL PLAYING
   */
  function getRevealTime() {
    const duration = video.duration;
    if (duration && !isNaN(duration) && duration > 0) {
      // Final 35% of video
      return duration * (1 - 0.35);
    }
    return 6.5; // Resilient fallback
  }

  function triggerUiReveal() {
    if (isRevealed) return;
    isRevealed = true;
    heroUi.classList.add('is-revealed');
    if (navbarWrapper) navbarWrapper.classList.add('is-revealed');
  }

  /**
   * High-precision monitor using requestAnimationFrame
   * Guarantees smooth, jitter-free timeline synchronization
   */
  function monitorPlayback() {
    if (hasEnded) return;

    const currentTime = video.currentTime;
    const duration = video.duration || 10;
    const revealTime = getRevealTime();

    // Trigger UI reveal while video is actively playing
    if (currentTime >= revealTime && !isRevealed) {
      triggerUiReveal();
    }

    // Seamlessly freeze on final frame just before EOF to prevent blank frame / reset
    if (duration > 0 && currentTime >= duration - 0.15) {
      hasEnded = true;
      video.pause();
      video.currentTime = duration - 0.15;
      triggerUiReveal();
      if (rafId) cancelAnimationFrame(rafId);
      return;
    }

    rafId = requestAnimationFrame(monitorPlayback);
  }

  // Backup handlers for standard video events
  video.addEventListener('timeupdate', () => {
    const currentTime = video.currentTime;
    const duration = video.duration || 10;
    const revealTime = getRevealTime();
    if (currentTime >= revealTime && !isRevealed) {
      triggerUiReveal();
    }
    if (duration > 0 && currentTime >= duration - 0.15) {
      hasEnded = true;
      video.pause();
      video.currentTime = duration - 0.15;
    }
  });

  video.addEventListener('ended', (e) => {
    e.preventDefault();
    hasEnded = true;
    video.pause();
    video.currentTime = Math.max(0, (video.duration || 10) - 0.15);
    triggerUiReveal();
    if (rafId) cancelAnimationFrame(rafId);
  });

  video.addEventListener('play', () => {
    if (!hasEnded) {
      rafId = requestAnimationFrame(monitorPlayback);
    }
  });

  // Safe Autoplay Initiation
  if (isMobile) {
    const playMobileVideo = () => {
      if (video.paused) {
        const p = video.play();
        if (p !== undefined) {
          p.then(() => {
            if (!hasEnded) rafId = requestAnimationFrame(monitorPlayback);
          }).catch(err => {
            console.warn('Mobile autoplay deferred:', err);
          });
        }
      } else {
        if (!hasEnded) rafId = requestAnimationFrame(monitorPlayback);
      }
    };

    if (video.readyState >= 2) {
      playMobileVideo();
    } else {
      video.addEventListener('loadedmetadata', playMobileVideo, { once: true });
      video.addEventListener('canplay', playMobileVideo, { once: true });
    }

    // Unmute on first user interaction on mobile
    const enableAudioOnMobileInteraction = () => {
      video.muted = false;
      if (video.paused) {
        video.play().catch(() => {});
      }
    };
    window.addEventListener('touchstart', enableAudioOnMobileInteraction, { once: true, passive: true });
    window.addEventListener('click', enableAudioOnMobileInteraction, { once: true, passive: true });
  } else {
    // Desktop: Preserve existing behavior exactly as before
    const startAutoplay = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            rafId = requestAnimationFrame(monitorPlayback);
          })
          .catch(err => {
            console.warn('Autoplay prevented or deferred:', err);
            // Wait for first user interaction to resume
            const resumeOnInteraction = () => {
              video.play().then(() => {
                rafId = requestAnimationFrame(monitorPlayback);
              });
              window.removeEventListener('click', resumeOnInteraction);
              window.removeEventListener('keydown', resumeOnInteraction);
              window.removeEventListener('touchstart', resumeOnInteraction);
            };
            window.addEventListener('click', resumeOnInteraction);
            window.addEventListener('keydown', resumeOnInteraction);
            window.addEventListener('touchstart', resumeOnInteraction);
          });
      }
    };

    // If already playing or can play
    if (video.readyState >= 2) {
      startAutoplay();
    } else {
      video.addEventListener('canplay', startAutoplay, { once: true });
    }
  }

  // Fallback: If video takes too long to load or fails, ensure UI is visible
  setTimeout(() => {
    if (!isRevealed && (video.paused || video.readyState === 0)) {
      triggerUiReveal();
    }
  }, 9000);

  /* ==========================================================================
     Granite Collection Showcase & Slider Implementation
     ========================================================================== */

  const GRANITE_COLLECTION = [
    {
      id: "01",
      name: "BLACK GALAXY",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Black Granite",
      finish: "Polished",
      character: "Gold Flecks",
      detailedDesc: "Black Granite",
      features: ["High Durability", "Mirror Luster", "Interiors • Exteriors"],
      applications: ["kitchen", "floor", "staircase", "other"],
      tone: "dark",
      finishes: ["polished", "honed"],
      image: "Granite Images/optimized/01_black_galaxy.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/01_black_galaxy.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/01_black_galaxy.webp", isMacro: true },
        { label: "Kitchen Island", src: "assets/applications/01-black-galaxy-application.jpg" },
        { label: "Villa Flooring", src: "assets/applications/05-steel-grey-application.jpg" }
      ]
    },
    {
      id: "02",
      name: "KASHMIR WHITE",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "White Granite",
      finish: "Polished",
      character: "Garnet Crystals",
      detailedDesc: "White Granite",
      features: ["Heat Resistant", "Fine Quartz", "Interiors • Cladding"],
      applications: ["kitchen", "floor", "other"],
      tone: "light",
      finishes: ["polished", "honed"],
      image: "Granite Images/optimized/02_kashmir_white.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/02_kashmir_white.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/02_kashmir_white.webp", isMacro: true }
      ]
    },
    {
      id: "03",
      name: "VISCOUNT WHITE",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "White Granite",
      finish: "Polished",
      character: "Graphite Veins",
      detailedDesc: "White Granite",
      features: ["Calacatta Flow", "Bookmatch Ready", "Interiors • Facades"],
      applications: ["kitchen", "floor", "staircase", "other"],
      tone: "light",
      finishes: ["polished", "honed"],
      image: "Granite Images/optimized/03_viscount_white.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/03_viscount_white.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/03_viscount_white.webp", isMacro: true }
      ]
    },
    {
      id: "04",
      name: "TAN BROWN",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Brown Granite",
      finish: "Polished",
      character: "Copper Grains",
      detailedDesc: "Brown Granite",
      features: ["High Strength", "Warm Tone", "Heavy Traffic"],
      applications: ["kitchen", "floor", "staircase"],
      tone: "warm",
      finishes: ["polished", "honed"],
      image: "Granite Images/optimized/04_tan_brown.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/04_tan_brown.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/04_tan_brown.webp", isMacro: true }
      ]
    },
    {
      id: "05",
      name: "STEEL GREY",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Charcoal Granite",
      finish: "Polished",
      character: "Silver Veins",
      detailedDesc: "Charcoal Granite",
      features: ["Uniform Grain", "Low Porosity", "Interiors • Paving"],
      applications: ["kitchen", "floor", "staircase", "other"],
      tone: "dark",
      finishes: ["polished", "honed"],
      image: "Granite Images/optimized/05_steel_grey.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/05_steel_grey.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/05_steel_grey.webp", isMacro: true }
      ]
    },
    {
      id: "06",
      name: "RUBY RED",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Red Granite",
      finish: "Polished",
      character: "Crimson Feldspar",
      detailedDesc: "Red Granite",
      features: ["High Hardness", "Color Fast", "Heavy Traffic"],
      applications: ["floor", "staircase", "other"],
      tone: "warm",
      finishes: ["polished"],
      image: "Granite Images/optimized/06_ruby_red.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/06_ruby_red.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/06_ruby_red.webp", isMacro: true }
      ]
    },
    {
      id: "07",
      name: "EMERALD GREEN",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Green Granite",
      finish: "Polished",
      character: "Emerald Quartz",
      detailedDesc: "Green Granite",
      features: ["Jade Tone", "Mineral Veins", "Interior Living"],
      applications: ["kitchen", "other"],
      tone: "warm",
      finishes: ["polished"],
      image: "Granite Images/optimized/07_emerald_green.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/07_emerald_green.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/07_emerald_green.webp", isMacro: true }
      ]
    },
    {
      id: "08",
      name: "DESERT GOLD",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Gold Granite",
      finish: "Polished",
      character: "Amber Waves",
      detailedDesc: "Gold Granite",
      features: ["Warm Undertone", "Weather Proof", "Interiors • Patios"],
      applications: ["kitchen", "floor", "other"],
      tone: "warm",
      finishes: ["polished"],
      image: "Granite Images/optimized/08_desert_gold.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/08_desert_gold.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/08_desert_gold.webp", isMacro: true }
      ]
    },
    {
      id: "09",
      name: "RED MULTICOLOR",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Red Granite",
      finish: "Polished",
      character: "Terracotta Waves",
      detailedDesc: "Red Granite",
      features: ["Fluid Waves", "Stain Resistant", "Feature Walls"],
      applications: ["floor", "staircase", "other"],
      tone: "warm",
      finishes: ["polished"],
      image: "Granite Images/optimized/09_red_multicolor.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/09_red_multicolor.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/09_red_multicolor.webp", isMacro: true }
      ]
    },
    {
      id: "10",
      name: "MOON WHITE",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "White Granite",
      finish: "Polished",
      character: "Silvery Fog",
      detailedDesc: "White Granite",
      features: ["Fine Grain", "Uniform Texture", "Flooring • Counters"],
      applications: ["kitchen", "floor", "other"],
      tone: "light",
      finishes: ["polished", "honed"],
      image: "Granite Images/optimized/10_moon_white.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/10_moon_white.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/10_moon_white.webp", isMacro: true }
      ]
    },
    {
      id: "11",
      name: "LAKHA RED",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Red Granite",
      finish: "Polished",
      character: "Vermilion Grains",
      detailedDesc: "Red Granite",
      features: ["UV Resistant", "Heavy Duty", "Exteriors • Steps"],
      applications: ["floor", "staircase", "other"],
      tone: "warm",
      finishes: ["polished"],
      image: "Granite Images/optimized/11_lakha_red.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/11_lakha_red.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/11_lakha_red.webp", isMacro: true }
      ]
    },
    {
      id: "12",
      name: "ROSY PINK",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Pink Granite",
      finish: "Polished",
      character: "Coral Blush",
      detailedDesc: "Pink Granite",
      features: ["Pastel Tone", "Thermal Resistant", "Flooring • Facades"],
      applications: ["floor", "staircase", "other"],
      tone: "warm",
      finishes: ["polished"],
      image: "Granite Images/optimized/12_rosy_pink.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/12_rosy_pink.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/12_rosy_pink.webp", isMacro: true }
      ]
    },
    {
      id: "13",
      name: "BLUE PEARL",
      category: "IMPORTED GRANITE",
      origin: "Premium Granite",
      desc: "Blue Granite",
      finish: "Polished",
      character: "Pearlescent Blue",
      detailedDesc: "Blue Granite",
      features: ["Blue Luster", "Zero Absorption", "Luxury Counters"],
      applications: ["kitchen", "other"],
      tone: "dark",
      finishes: ["polished"],
      image: "Granite Images/optimized/13_blue_pearl.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/13_blue_pearl.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/13_blue_pearl.webp", isMacro: true }
      ]
    },
    {
      id: "14",
      name: "MAHOGANY WAVE",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Brown Granite",
      finish: "Polished",
      character: "Auburn Waves",
      detailedDesc: "Brown Granite",
      features: ["Earthy Tone", "Fluid Ribboning", "Tables • Cladding"],
      applications: ["kitchen", "other"],
      tone: "warm",
      finishes: ["polished"],
      image: "Granite Images/optimized/14_mahogany_wave.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/14_mahogany_wave.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/14_mahogany_wave.webp", isMacro: true }
      ]
    },
    {
      id: "15",
      name: "JHANSI RED",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Red Granite",
      finish: "Polished",
      character: "Crimson Aggregates",
      detailedDesc: "Red Granite",
      features: ["High Strength", "Weather Proof", "Heritage Facades"],
      applications: ["floor", "staircase", "other"],
      tone: "warm",
      finishes: ["polished"],
      image: "Granite Images/optimized/15_jhansi_red.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/15_jhansi_red.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/15_jhansi_red.webp", isMacro: true }
      ]
    },
    {
      id: "16",
      name: "ABSOLUTE BLACK",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Black Granite",
      finish: "Honed",
      character: "Jet Black",
      detailedDesc: "Black Granite",
      features: ["Zero Porosity", "Mirror Polish", "Kitchens • Facades"],
      applications: ["kitchen", "floor", "staircase", "other"],
      tone: "dark",
      finishes: ["polished", "honed"],
      image: "Granite Images/optimized/16_absolute_black.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/16_absolute_black.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/16_absolute_black.webp", isMacro: true }
      ]
    },
    {
      id: "17",
      name: "BLACK FOREST",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Black Granite",
      finish: "Polished",
      character: "White Veins",
      detailedDesc: "Black Granite",
      features: ["High Contrast", "Alabaster Veins", "Islands • Walls"],
      applications: ["kitchen", "staircase", "other"],
      tone: "dark",
      finishes: ["polished", "honed"],
      image: "Granite Images/optimized/17_black_forest.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/17_black_forest.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/17_black_forest.webp", isMacro: true }
      ]
    },
    {
      id: "18",
      name: "PARADISO CLASSIQUE",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Lavender Granite",
      finish: "Polished",
      character: "Lavender Swirls",
      detailedDesc: "Lavender Granite",
      features: ["Violet-Grey", "Flowing Pattern", "Floors • Vanities"],
      applications: ["floor", "staircase", "other"],
      tone: "warm",
      finishes: ["polished"],
      image: "Granite Images/optimized/18_paradiso_classique.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/18_paradiso_classique.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/18_paradiso_classique.webp", isMacro: true }
      ]
    },
    {
      id: "19",
      name: "BALTIC BROWN",
      category: "PREMIUM GRANITE",
      origin: "Premium Granite",
      desc: "Brown Granite",
      finish: "Polished",
      character: "Feldspar Rosettes",
      detailedDesc: "Brown Granite",
      features: ["Rosette Grains", "Stain Resistant", "Islands • Bar Tops"],
      applications: ["kitchen", "floor", "other"],
      tone: "dark",
      finishes: ["polished"],
      image: "Granite Images/optimized/19_baltic_brown.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/19_baltic_brown.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/19_baltic_brown.webp", isMacro: true }
      ]
    },
    {
      id: "20",
      name: "CHIMA PINK",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Pink Granite",
      finish: "Polished",
      character: "Rose Quartz",
      detailedDesc: "Pink Granite",
      features: ["Color Uniform", "Frost Resistant", "Flooring • Cladding"],
      applications: ["floor", "staircase", "other"],
      tone: "warm",
      finishes: ["polished"],
      image: "Granite Images/optimized/20_chima_pink.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/20_chima_pink.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/20_chima_pink.webp", isMacro: true }
      ]
    },
    {
      id: "21",
      name: "TITANIUM BLACK",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Black Granite",
      finish: "Polished",
      character: "Gold Waves",
      detailedDesc: "Black Granite",
      features: ["High Contrast", "Luminous Waves", "Kitchens • Walls"],
      applications: ["kitchen", "floor", "other"],
      tone: "dark",
      finishes: ["polished", "honed"],
      image: "Granite Images/optimized/21_titanium_black.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/21_titanium_black.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/21_titanium_black.webp", isMacro: true }
      ]
    },
    {
      id: "22",
      name: "ALASKA WHITE",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "White Granite",
      finish: "Polished",
      character: "Crystalline Frost",
      detailedDesc: "White Granite",
      features: ["Bright Tone", "Stain Resistant", "Counters • Islands"],
      applications: ["kitchen", "floor", "other"],
      tone: "light",
      finishes: ["polished", "honed"],
      image: "Granite Images/optimized/22_alaska_white.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/22_alaska_white.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/22_alaska_white.webp", isMacro: true }
      ]
    },
    {
      id: "23",
      name: "COLONIAL GOLD",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Gold Granite",
      finish: "Polished",
      character: "Amber Grains",
      detailedDesc: "Gold Granite",
      features: ["Warm Palette", "Golden Grains", "Lobbies • Kitchens"],
      applications: ["kitchen", "floor", "staircase"],
      tone: "warm",
      finishes: ["polished"],
      image: "Granite Images/optimized/23_colonial_gold.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/23_colonial_gold.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/23_colonial_gold.webp", isMacro: true }
      ]
    },
    {
      id: "24",
      name: "ASTORIA WHITE",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "White Granite",
      finish: "Polished",
      character: "Slate Veins",
      detailedDesc: "White Granite",
      features: ["Slate Veining", "High Density", "Kitchens • Interiors"],
      applications: ["kitchen", "floor", "other"],
      tone: "light",
      finishes: ["polished", "honed"],
      image: "Granite Images/optimized/24_astoria_white.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/24_astoria_white.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/24_astoria_white.webp", isMacro: true }
      ]
    },
    {
      id: "25",
      name: "HIMALAYAN BLUE",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Blue Granite",
      finish: "Polished",
      character: "Mineral Waves",
      detailedDesc: "Blue Granite",
      features: ["Weather Proof", "Mineral Waves", "Stairs • Facades"],
      applications: ["floor", "staircase", "other"],
      tone: "dark",
      finishes: ["polished"],
      image: "Granite Images/optimized/25_himalayan_blue.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/25_himalayan_blue.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/25_himalayan_blue.webp", isMacro: true }
      ]
    },
    {
      id: "26",
      name: "CRYSTAL YELLOW",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Yellow Granite",
      finish: "Polished",
      character: "Crystal Sparkle",
      detailedDesc: "Yellow Granite",
      features: ["Vibrant Tone", "Heavy Duty", "Terraces • Walkways"],
      applications: ["floor", "staircase", "other"],
      tone: "warm",
      finishes: ["polished"],
      image: "Granite Images/optimized/26_crystal_yellow.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/26_crystal_yellow.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/26_crystal_yellow.webp", isMacro: true }
      ]
    },
    {
      id: "27",
      name: "BLACK PEARL",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Black Granite",
      finish: "Polished",
      character: "Metallic Specks",
      detailedDesc: "Black Granite",
      features: ["Metallic Specks", "Low Maintenance", "Kitchens • Spas"],
      applications: ["kitchen", "floor", "staircase", "other"],
      tone: "dark",
      finishes: ["polished", "honed"],
      image: "Granite Images/optimized/27_black_pearl.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/27_black_pearl.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/27_black_pearl.webp", isMacro: true }
      ]
    },
    {
      id: "28",
      name: "PATAGONIA GOLD",
      category: "PREMIUM GRANITE",
      origin: "Premium Granite",
      desc: "Gold Granite",
      finish: "Polished",
      character: "Quartz Breccia",
      detailedDesc: "Gold Granite",
      features: ["Translucent Quartz", "Amber Matrix", "Bars • Features"],
      applications: ["kitchen", "other"],
      tone: "warm",
      finishes: ["polished"],
      image: "Granite Images/optimized/28_patagonia_gold.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/28_patagonia_gold.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/28_patagonia_gold.webp", isMacro: true }
      ]
    },
    {
      id: "29",
      name: "SILVER WAVE",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Black Granite",
      finish: "Polished",
      character: "Silver Waves",
      detailedDesc: "Black Granite",
      features: ["Linear Waves", "High Contrast", "Walls • Waterfalls"],
      applications: ["kitchen", "staircase", "other"],
      tone: "dark",
      finishes: ["polished", "honed"],
      image: "Granite Images/optimized/29_silver_wave.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/29_silver_wave.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/29_silver_wave.webp", isMacro: true }
      ]
    },
    {
      id: "30",
      name: "COSMIC BLACK",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Black Granite",
      finish: "Polished",
      character: "Gold Streams",
      detailedDesc: "Black Granite",
      features: ["Gold Streams", "Stain Resistant", "Slabs • Counters"],
      applications: ["kitchen", "floor", "other"],
      tone: "dark",
      finishes: ["polished"],
      image: "Granite Images/optimized/30_cosmic_black.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/30_cosmic_black.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/30_cosmic_black.webp", isMacro: true }
      ]
    },
    {
      id: "31",
      name: "BIANCO ANTICO",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "White Granite",
      finish: "Polished",
      character: "Taupe Clusters",
      detailedDesc: "White Granite",
      features: ["Taupe Clusters", "Warm White", "Kitchens • Bathrooms"],
      applications: ["kitchen", "floor", "other"],
      tone: "light",
      finishes: ["polished", "honed"],
      image: "Granite Images/optimized/31_bianco_antico.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/31_bianco_antico.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/31_bianco_antico.webp", isMacro: true }
      ]
    },
    {
      id: "32",
      name: "COPPER SILK",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Brown Granite",
      finish: "Polished",
      character: "Bronze Waves",
      detailedDesc: "Brown Granite",
      features: ["Bronze Waves", "Warm Strata", "Floors • Dining"],
      applications: ["floor", "staircase", "other"],
      tone: "warm",
      finishes: ["polished"],
      image: "Granite Images/optimized/32_copper_silk.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/32_copper_silk.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/32_copper_silk.webp", isMacro: true }
      ]
    },
    {
      id: "33",
      name: "VERDE UNIK",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Green Granite",
      finish: "Polished",
      character: "Forest Veins",
      detailedDesc: "Green Granite",
      features: ["Forest Green", "High Luster", "Vanities • Tops"],
      applications: ["kitchen", "other"],
      tone: "warm",
      finishes: ["polished"],
      image: "Granite Images/optimized/33_verde_unik.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/33_verde_unik.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/33_verde_unik.webp", isMacro: true }
      ]
    },
    {
      id: "34",
      name: "MUSHROOM BROWN",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Brown Granite",
      finish: "Honed",
      character: "Taupe Texture",
      detailedDesc: "Brown Granite",
      features: ["Warm Taupe", "Uniform Grain", "Floors • Stairs"],
      applications: ["kitchen", "floor", "staircase"],
      tone: "warm",
      finishes: ["polished", "honed"],
      image: "Granite Images/optimized/34_mushroom_brown.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/34_mushroom_brown.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/34_mushroom_brown.webp", isMacro: true }
      ]
    },
    {
      id: "35",
      name: "ICE BLUE",
      category: "PREMIUM GRANITE",
      origin: "Premium Granite",
      desc: "Blue Granite",
      finish: "Polished",
      character: "Glacial Quartz",
      detailedDesc: "Blue Granite",
      features: ["Glacial Quartz", "Icy Blue", "Boardrooms • Spas"],
      applications: ["kitchen", "other"],
      tone: "light",
      finishes: ["polished"],
      image: "Granite Images/optimized/35_ice_blue.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/35_ice_blue.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/35_ice_blue.webp", isMacro: true }
      ]
    },
    {
      id: "36",
      name: "NEBULA BLACK",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Black Granite",
      finish: "Polished",
      character: "Gold Mica",
      detailedDesc: "Black Granite",
      features: ["Jet Black", "Golden Mica", "Kitchens • Vanities"],
      applications: ["kitchen", "floor", "staircase", "other"],
      tone: "dark",
      finishes: ["polished"],
      image: "Granite Images/optimized/36_nebula_black.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/36_nebula_black.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/36_nebula_black.webp", isMacro: true }
      ]
    },
    {
      id: "37",
      name: "SOLARIS GOLD",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Gold Granite",
      finish: "Polished",
      character: "Quartz Waves",
      detailedDesc: "Gold Granite",
      features: ["Golden Waves", "Heat Resistant", "Waterfalls • Floors"],
      applications: ["kitchen", "floor", "other"],
      tone: "warm",
      finishes: ["polished"],
      image: "Granite Images/optimized/37_solaris_gold.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/37_solaris_gold.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/37_solaris_gold.webp", isMacro: true }
      ]
    },
    {
      id: "38",
      name: "MONTE CARLO",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "White Granite",
      finish: "Polished",
      character: "Charcoal Rivers",
      detailedDesc: "White Granite",
      features: ["Charcoal Rivers", "Platinum White", "Walls • Islands"],
      applications: ["kitchen", "floor", "other"],
      tone: "light",
      finishes: ["polished", "honed"],
      image: "Granite Images/optimized/38_monte_carlo.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/38_monte_carlo.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/38_monte_carlo.webp", isMacro: true }
      ]
    },
    {
      id: "39",
      name: "IMPERIAL RED",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Red Granite",
      finish: "Polished",
      character: "Vermilion Matrix",
      detailedDesc: "Red Granite",
      features: ["Regal Crimson", "High Density", "Entrances • Steps"],
      applications: ["floor", "staircase", "other"],
      tone: "warm",
      finishes: ["polished"],
      image: "Granite Images/optimized/39_imperial_red.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/39_imperial_red.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/39_imperial_red.webp", isMacro: true }
      ]
    },
    {
      id: "40",
      name: "AMAZONITE LUX",
      category: "PREMIUM GRANITE",
      origin: "Premium Granite",
      desc: "Green Granite",
      finish: "Polished",
      character: "Amber Fissures",
      detailedDesc: "Green Granite",
      features: ["Turquoise Jade", "Golden Veins", "Vanities • Bars"],
      applications: ["kitchen", "other"],
      tone: "warm",
      finishes: ["polished"],
      image: "Granite Images/optimized/40_amazonite_lux.webp",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/optimized/40_amazonite_lux.webp" },
        { label: "Macro Grain", src: "Granite Images/optimized/40_amazonite_lux.webp", isMacro: true }
      ]
    },
    {
      id: "41",
      name: "ALASKA WHITE GRANITE",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "White Granite",
      finish: "Polished",
      character: "Silver Veins",
      detailedDesc: "White Granite",
      features: ["Lustrous Quartz", "Pale Silver Veins", "Countertops • Islands"],
      applications: ["kitchen", "floor", "other"],
      tone: "light",
      finishes: ["polished", "honed"],
      image: "assets/New Granites/Alaska White Granite.jpg",
      thumbnails: [
        { label: "Full Slab", src: "assets/New Granites/Alaska White Granite.jpg" },
        { label: "Macro Grain", src: "assets/New Granites/Alaska White Granite.jpg", isMacro: true },
        { label: "Residential Setting", src: "assets/New Granites/Alaska White Granite Application.jpg" }
      ]
    },
    {
      id: "42",
      name: "CHERRY RED",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Red Granite",
      finish: "Polished",
      character: "Crimson Grain",
      detailedDesc: "Red Granite",
      features: ["Deep Crimson", "Uniform Grain", "Flooring • Facades"],
      applications: ["floor", "staircase", "other"],
      tone: "warm",
      finishes: ["polished"],
      image: "assets/New Granites/Cherry Red.jpg",
      thumbnails: [
        { label: "Full Slab", src: "assets/New Granites/Cherry Red.jpg" },
        { label: "Macro Grain", src: "assets/New Granites/Cherry Red.jpg", isMacro: true },
        { label: "Residential Setting", src: "assets/New Granites/Cherry Red Application.jpg" }
      ]
    },
    {
      id: "43",
      name: "COFFEE BROWN GRANITE",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Brown Granite",
      finish: "Polished",
      character: "Espresso Grains",
      detailedDesc: "Brown Granite",
      features: ["Rich Espresso", "Golden Brown Flecks", "Kitchen • Stairs"],
      applications: ["kitchen", "floor", "staircase", "other"],
      tone: "warm",
      finishes: ["polished", "honed"],
      image: "assets/New Granites/Coffee Brown Granite.jpg",
      thumbnails: [
        { label: "Full Slab", src: "assets/New Granites/Coffee Brown Granite.jpg" },
        { label: "Macro Grain", src: "assets/New Granites/Coffee Brown Granite.jpg", isMacro: true },
        { label: "Residential Setting", src: "assets/New Granites/Coffee Brown Granite Application.jpg" }
      ]
    },
    {
      id: "44",
      name: "FISH BLACK GRANITE",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Black Granite",
      finish: "Polished",
      character: "Silver Flecks",
      detailedDesc: "Black Granite",
      features: ["Jet Black Matrix", "Silver Fish Scales", "Kitchens • Countertops"],
      applications: ["kitchen", "floor", "staircase", "other"],
      tone: "dark",
      finishes: ["polished", "honed"],
      image: "assets/New Granites/Fish Black Granite.jpg",
      thumbnails: [
        { label: "Full Slab", src: "assets/New Granites/Fish Black Granite.jpg" },
        { label: "Macro Grain", src: "assets/New Granites/Fish Black Granite.jpg", isMacro: true },
        { label: "Residential Setting", src: "assets/New Granites/Fish Black Granite Application.jpg" }
      ]
    },
    {
      id: "45",
      name: "GALAXY BLACK GRANITE",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Black Granite",
      finish: "Polished",
      character: "Golden Crystals",
      detailedDesc: "Black Granite",
      features: ["Deep Black", "Reflective Copper Bronzite", "Interiors • Countertops"],
      applications: ["kitchen", "floor", "staircase", "other"],
      tone: "dark",
      finishes: ["polished", "honed"],
      image: "assets/New Granites/Galaxy Black Granite.jpg",
      thumbnails: [
        { label: "Full Slab", src: "assets/New Granites/Galaxy Black Granite.jpg" },
        { label: "Macro Grain", src: "assets/New Granites/Galaxy Black Granite.jpg", isMacro: true },
        { label: "Residential Setting", src: "assets/New Granites/Galaxy Black Granite Application.jpg" }
      ]
    },
    {
      id: "46",
      name: "MODERN BROWN",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Brown Granite",
      finish: "Polished",
      character: "Walnut Texture",
      detailedDesc: "Brown Granite",
      features: ["Contemporary Walnut", "Earthy Swirls", "Flooring • Accent Walls"],
      applications: ["floor", "staircase", "other"],
      tone: "warm",
      finishes: ["polished"],
      image: "assets/New Granites/Mordern Brown.jpg",
      thumbnails: [
        { label: "Full Slab", src: "assets/New Granites/Mordern Brown.jpg" },
        { label: "Macro Grain", src: "assets/New Granites/Mordern Brown.jpg", isMacro: true },
        { label: "Residential Setting", src: "assets/New Granites/Mordern Brown Application.jpg" }
      ]
    },
    {
      id: "47",
      name: "P WHITE GRANITE",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "White Granite",
      finish: "Polished",
      character: "Platinum Flecks",
      detailedDesc: "White Granite",
      features: ["Milky White Base", "Subtle Grey Minerals", "Countertops • Flooring"],
      applications: ["kitchen", "floor", "other"],
      tone: "light",
      finishes: ["polished", "honed"],
      image: "assets/New Granites/P-White Granite.jpg",
      thumbnails: [
        { label: "Full Slab", src: "assets/New Granites/P-White Granite.jpg" },
        { label: "Macro Grain", src: "assets/New Granites/P-White Granite.jpg", isMacro: true },
        { label: "Residential Setting", src: "assets/New Granites/P White Granite application.jpg" }
      ]
    },
    {
      id: "48",
      name: "Z-BLACK SOUTH",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Black Granite",
      finish: "Polished",
      character: "Deep Obsidian",
      detailedDesc: "Black Granite",
      features: ["Absolute Dark Density", "Zero Variation", "Kitchen Counters • Stairs"],
      applications: ["kitchen", "floor", "staircase", "other"],
      tone: "dark",
      finishes: ["polished", "honed"],
      image: "assets/New Granites/Z-Black South.jpg",
      thumbnails: [
        { label: "Full Slab", src: "assets/New Granites/Z-Black South.jpg" },
        { label: "Macro Grain", src: "assets/New Granites/Z-Black South.jpg", isMacro: true },
        { label: "Residential Setting", src: "assets/New Granites/Z-Black South Application.jpg" }
      ]
    }
  ];

  const slabsStage = document.getElementById('slabs-stage');
  const counterCurrent = document.getElementById('counter-current');
  const counterTotal = document.getElementById('counter-total');
  const graniteTitle = document.getElementById('granite-title');
  const graniteOrigin = document.getElementById('granite-origin');
  const graniteDesc = document.getElementById('granite-desc');
  const graniteFinish = document.getElementById('granite-finish');
  const graniteCharacter = document.getElementById('granite-character');
  const btnPrev = document.getElementById('slider-prev');
  const btnNext = document.getElementById('slider-next');
  const progressTrack = document.getElementById('slider-progress-track');
  const graniteSection = document.getElementById('granite-collection');
  const exploreCtaBtn = document.getElementById('cta-explore-granite');
  const heroScrollIndicator = document.getElementById('hero-scroll-indicator');
  const heroContainer = document.getElementById('hero');

  if (!slabsStage) return;

  let currentGraniteIndex = 0;
  const totalGranites = GRANITE_COLLECTION.length;
  const slabElements = [];
  const progressDashes = [];

  // 1. Build Physical Slabs in the DOM
  GRANITE_COLLECTION.forEach((item, index) => {
    const slab = document.createElement('div');
    slab.className = 'slab-item is-hidden';
    slab.dataset.index = index;
    slab.setAttribute('role', 'group');
    slab.setAttribute('aria-label', `${item.name} (${index + 1} of ${totalGranites})`);

    const img = document.createElement('img');
    img.className = 'slab-image';
    img.src = item.image;
    img.alt = `${item.name} Granite Slab`;
    img.loading = index < 5 ? 'eager' : 'lazy';

    const sheen = document.createElement('div');
    sheen.className = 'slab-sheen';

    const bevel = document.createElement('div');
    bevel.className = 'slab-bevel';

    const floorShadow = document.createElement('div');
    floorShadow.className = 'slab-floor-shadow';

    slab.appendChild(img);
    slab.appendChild(sheen);
    slab.appendChild(bevel);
    slab.appendChild(floorShadow);

    slab.addEventListener('click', (e) => {
      if (wasDragging) return;
      if (index !== currentGraniteIndex) {
        goToSlide(index);
      }
      openGraniteModal(index);
    });

    slabsStage.appendChild(slab);
    slabElements.push(slab);

    // Build Progress Dashes
    if (progressTrack) {
      const dash = document.createElement('div');
      dash.className = 'progress-dash' + (index === 0 ? ' is-active' : '');
      dash.dataset.index = index;
      dash.setAttribute('aria-label', `Go to slide ${index + 1}`);
      dash.addEventListener('click', () => goToSlide(index));
      progressTrack.appendChild(dash);
      progressDashes.push(dash);
    }
  });

  // 2. Slider State Management & Spatial Layout
  function renderSliderState(targetIdx) {
    currentGraniteIndex = (targetIdx + totalGranites) % totalGranites;

    const activeIdx = currentGraniteIndex;
    const prevIdx = (activeIdx - 1 + totalGranites) % totalGranites;
    const nextIdx = (activeIdx + 1) % totalGranites;
    const farPrevIdx = (activeIdx - 2 + totalGranites) % totalGranites;
    const farNextIdx = (activeIdx + 2) % totalGranites;

    slabElements.forEach((slab, idx) => {
      slab.className = 'slab-item';
      if (idx === activeIdx) {
        slab.classList.add('is-active');
      } else if (idx === prevIdx) {
        slab.classList.add('is-prev');
      } else if (idx === nextIdx) {
        slab.classList.add('is-next');
      } else if (idx === farPrevIdx) {
        slab.classList.add('is-far-prev');
      } else if (idx === farNextIdx) {
        slab.classList.add('is-far-next');
      } else {
        slab.classList.add('is-hidden');
      }
    });

    // Update Counter
    if (counterCurrent) {
      counterCurrent.textContent = String(activeIdx + 1).padStart(2, '0');
    }
    if (counterTotal) {
      counterTotal.textContent = String(totalGranites).padStart(2, '0');
    }

    // Update Progress Dashes
    progressDashes.forEach((dash, idx) => {
      if (idx === activeIdx) {
        dash.classList.add('is-active');
      } else {
        dash.classList.remove('is-active');
      }
    });

    // Update Editorial Info Card
    const currentItem = GRANITE_COLLECTION[activeIdx];
    if (graniteTitle && graniteDesc) {
      graniteTitle.style.opacity = '0';
      graniteDesc.style.opacity = '0';
      setTimeout(() => {
        if (graniteOrigin) graniteOrigin.textContent = currentItem.origin;
        if (graniteTitle) graniteTitle.textContent = currentItem.name;
        if (graniteDesc) graniteDesc.textContent = currentItem.desc;
        if (graniteFinish) graniteFinish.textContent = currentItem.finish;
        if (graniteCharacter) graniteCharacter.textContent = currentItem.character;

        graniteTitle.style.opacity = '1';
        graniteDesc.style.opacity = '1';
      }, 180);
    }
  }

  function goToSlide(index) {
    renderSliderState(index);
  }

  // Initial render
  renderSliderState(0);

  // Navigation Button Handlers
  if (btnPrev) {
    btnPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      goToSlide(currentGraniteIndex - 1);
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', (e) => {
      e.stopPropagation();
      goToSlide(currentGraniteIndex + 1);
    });
  }

  // Keyboard Arrow Navigation
  window.addEventListener('keydown', (e) => {
    // Only navigate if granite section is in or near viewport
    if (graniteSection) {
      const rect = graniteSection.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          goToSlide(currentGraniteIndex - 1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          goToSlide(currentGraniteIndex + 1);
        }
      }
    }
  });

  // Touch Swipe & Mouse Drag Support
  let touchStartX = 0;
  let touchEndX = 0;
  let wasDragging = false;

  slabsStage.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    wasDragging = false;
  }, { passive: true });

  slabsStage.addEventListener('touchmove', (e) => {
    if (Math.abs(e.changedTouches[0].screenX - touchStartX) > 35) {
      wasDragging = true;
    }
  }, { passive: true });

  slabsStage.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const swipeDistance = touchEndX - touchStartX;
    if (Math.abs(swipeDistance) > 45) {
      wasDragging = true;
      handleSwipeGesture();
      setTimeout(() => { wasDragging = false; }, 100);
    } else {
      wasDragging = false;
    }
  }, { passive: true });

  function handleSwipeGesture() {
    const swipeDistance = touchEndX - touchStartX;
    if (swipeDistance > 45) {
      goToSlide(currentGraniteIndex - 1);
    } else if (swipeDistance < -45) {
      goToSlide(currentGraniteIndex + 1);
    }
  }

  // Desktop Mouse Drag Gesture
  let isPointerDown = false;
  let pointerStartX = 0;

  slabsStage.addEventListener('mousedown', (e) => {
    // Only drag with primary mouse button
    if (e.button !== 0) return;
    isPointerDown = true;
    pointerStartX = e.clientX;
    wasDragging = false;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isPointerDown) return;
    if (Math.abs(e.clientX - pointerStartX) > 35) {
      wasDragging = true;
    }
  });

  window.addEventListener('mouseup', (e) => {
    if (!isPointerDown) return;
    isPointerDown = false;
    const dragDistance = e.clientX - pointerStartX;
    if (Math.abs(dragDistance) > 45) {
      wasDragging = true;
      if (dragDistance > 45) {
        goToSlide(currentGraniteIndex - 1);
      } else if (dragDistance < -45) {
        goToSlide(currentGraniteIndex + 1);
      }
      setTimeout(() => { wasDragging = false; }, 100);
    } else {
      wasDragging = false;
    }
  });

  // 3. Scroll-Driven White Sheet Cover & Soft Granite UI Reveal
  const experienceTrack = document.getElementById('experience-track');
  const warmCurtain = document.getElementById('warm-ivory-curtain');
  const graniteInner = document.getElementById('granite-collection-inner');
  const navHomeLink = document.getElementById('nav-home');
  const navAboutLink = document.getElementById('nav-about');
  const navProductsLink = document.getElementById('nav-products');

  // Granite Finder DOM Elements
  const finderCurtain = document.getElementById('finder-ivory-curtain');
  const graniteFinder = document.getElementById('granite-finder');
  const finderInner = document.getElementById('granite-finder-inner');
  const finderCardWrapper = document.getElementById('finder-card-wrapper');
  const finderCard = document.getElementById('finder-card');
  const finderSubmitBtn = document.getElementById('finder-submit-btn');
  const finderResultsView = document.getElementById('finder-results-view');
  const finderResultsGrid = document.getElementById('finder-results-grid');
  const finderResultsCount = document.getElementById('finder-results-count');
  const finderResultsTitle = document.getElementById('finder-results-title');
  const finderResultsSubtitle = document.getElementById('finder-results-subtitle');
  const finderChangePrefBtn = document.getElementById('finder-change-pref-btn');

  // Tile Collection DOM Elements
  const tileCurtain = document.getElementById('tile-ivory-curtain');
  const tileSection = document.getElementById('tile-section');
  const tileSectionInner = document.getElementById('tile-section-inner');
  const tileStageViewport = document.getElementById('tile-stage-viewport');
  const tileSlabsTrack = document.getElementById('tile-slabs-track');
  const tilePagination = document.getElementById('tile-pagination');
  const tileDragPill = document.getElementById('tile-drag-pill');
  const dragHandleWrap = document.getElementById('drag-handle-wrap');
  const dragArrowBtn = document.getElementById('drag-arrow-btn');
  const dragPillLabel = document.getElementById('drag-pill-label');
  const dragPillArrowRight = document.getElementById('drag-pill-arrow-right');
  const dragTrackFill = document.getElementById('drag-track-fill');

  let scrollRafId = null;
  let currentScrollProgress = 0;
  let isFinderActive = false;
  let isTileActive = false;
  let isTransitioning = false;
  let isHeroTransitioning = false;
  let heroTransitionRaf = null;
  let finderTouchStartY = 0;
  let currentTileIndex = 0; // Starts at initial valid state (index 0)
  let isTransitionCooldown = false;
  let mobileTouchStartX = 0;
  let mobileTouchStartY = 0;
  let mobileTouchSection = 'HERO';
  let mobileGestureHandled = false;

  // Premium Architectural Tile Collection Data
  const TILE_COLLECTION = [
    {
      id: "slate-charcoal",
      name: "Graphite Charcoal Marble",
      category: "MINIMALIST TILES",
      image: "assets/tiles/slate_charcoal.jpg",
      size: "800 x 1600 mm",
      finish: "Matte",
      desc: "Charcoal Tile"
    },
    {
      id: "crema-marfil",
      name: "Crema Marfil Classic",
      category: "WARM NEUTRAL TILES",
      image: "assets/tiles/crema_marfil.jpg",
      size: "1200 x 1800 mm",
      finish: "Honed",
      desc: "Beige Tile"
    },
    {
      id: "calacatta-gold",
      name: "Calacatta Gold Porcelain",
      category: "LUXURY SLAB TILES",
      image: "assets/tiles/calacatta_gold.jpg",
      size: "1200 x 2400 mm",
      finish: "Polished",
      desc: "White Tile"
    },
    {
      id: "silver-river",
      name: "Silver River Polished",
      category: "CONTEMPORARY TILES",
      image: "assets/tiles/silver_river.jpg",
      size: "1200 x 1800 mm",
      finish: "Polished",
      desc: "Grey Tile"
    },
    {
      id: "sand-travertine",
      name: "Navona Sand Travertine",
      category: "NATURAL STONE TILES",
      image: "assets/tiles/sand_travertine.jpg",
      size: "800 x 1600 mm",
      finish: "Honed",
      desc: "Sand Tile"
    },
    {
      id: "portoro-gold",
      name: "Nero Portoro Royale",
      category: "EXOTIC LUXE SLABS",
      image: "assets/tiles/portoro_gold.jpg",
      size: "1200 x 2400 mm",
      finish: "Polished",
      desc: "Black Tile"
    },
    {
      id: "arabescato-white",
      name: "Arabescato Corchia",
      category: "ARCHITECTURAL SLABS",
      image: "assets/tiles/arabescato_white.jpg",
      size: "1200 x 2400 mm",
      finish: "Polished",
      desc: "White Tile"
    }
  ];

  function updateTransition() {
    scrollRafId = null;
    const scrollY = window.scrollY || window.pageYOffset;
    const windowH = window.innerHeight;
    const trackH = experienceTrack ? experienceTrack.offsetHeight : windowH * 2.2;
    const maxScroll = Math.max(1, trackH - windowH);

    // Normalized progress across the scroll track from 0 to 1
    const progress = Math.min(1, Math.max(0, scrollY / maxScroll));
    currentScrollProgress = progress;

    // If user starts scrolling before timed reveal, smoothly materialize UI
    if (progress > 0.05 && !isRevealed) {
      triggerUiReveal();
    }

    // When the user scrolls all the way back to the very top (scrollY <= 2), ensure the Hero is in its clean initial visual state.
    if (scrollY <= 2) {
      if (heroScrollIndicator) {
        heroScrollIndicator.style.opacity = '';
        heroScrollIndicator.style.pointerEvents = '';
      }
      if (warmCurtain) {
        warmCurtain.style.transition = 'none';
        warmCurtain.style.transform = 'translate3d(0, 100%, 0)';
      }
      if (graniteInner) {
        graniteInner.style.transition = 'none';
        graniteInner.style.opacity = '0';
        graniteInner.style.transform = 'translate3d(0, 20px, 0)';
        graniteInner.style.filter = 'blur(6px)';
        graniteInner.style.visibility = 'hidden';
      }
      if (graniteSection) {
        graniteSection.style.visibility = 'hidden';
        graniteSection.style.pointerEvents = 'none';
      }
      if (heroContainer) {
        heroContainer.style.transform = 'none';
        heroContainer.style.opacity = '1';
      }
      return;
    }

    // Phase A: Warm Ivory Curtain Cover (0% to 70% of scroll)
    // Curtains moves from translateY(100%) to translateY(0%)
    // At progress 0% -> translateY(100%) [Hero 100% visible]
    // At progress 70% -> translateY(0%) [Screen is 100% covered in warm ivory]
    const curtainProgress = Math.min(1, progress / 0.70);
    const curtainY = (1 - curtainProgress) * 100;

    if (warmCurtain) {
      warmCurtain.style.transition = 'none';
      warmCurtain.style.transform = `translate3d(0, ${curtainY}%, 0)`;
    }

    if (heroScrollIndicator) {
      heroScrollIndicator.style.opacity = progress > 0.05 ? '0' : '';
      heroScrollIndicator.style.pointerEvents = progress > 0.05 ? 'none' : '';
    }

    // Hero stays strictly stationary: NO transform, NO scale, NO movement
    if (heroContainer) {
      heroContainer.style.transform = 'none';
      heroContainer.style.opacity = '1';
    }

    // Phase B: Granite Collection Emergence / Dissolve (78% to 100% of scroll)
    // Buffer zone (70% to 78%): Screen is 100% solid warm ivory curtain covering the hero.
    // Above 78%, Granite softly emerges. In reverse, Granite dissolves completely by 78%,
    // before curtain starts dropping at 70%, guaranteeing Granite is 100% hidden before Hero appears.
    const revealProgress = Math.max(0, Math.min(1, (progress - 0.78) / 0.22));

    if (graniteInner && !isFinderActive && !isTileActive && (!isTransitioning || isHeroTransitioning)) {
      graniteInner.style.transition = 'none';
      if (revealProgress > 0) {
        graniteInner.style.visibility = 'visible';
        graniteInner.style.opacity = revealProgress.toFixed(3);
        graniteInner.style.transform = `translate3d(0, ${(1 - revealProgress) * 20}px, 0)`;
        graniteInner.style.filter = `blur(${((1 - revealProgress) * 6).toFixed(1)}px)`;
      } else {
        graniteInner.style.visibility = 'hidden';
        graniteInner.style.opacity = '0';
        graniteInner.style.transform = 'translate3d(0, 20px, 0)';
        graniteInner.style.filter = 'blur(6px)';
      }
    }

    if (graniteSection && !isFinderActive && !isTileActive) {
      if (revealProgress > 0) {
        graniteSection.style.visibility = 'visible';
        graniteSection.style.pointerEvents = revealProgress > 0.7 ? 'auto' : 'none';
      } else {
        graniteSection.style.visibility = 'hidden';
        graniteSection.style.pointerEvents = 'none';
      }
    }
  }

  function resetExperienceToTop() {
    isFinderActive = false;
    isTileActive = false;
    isTransitioning = false;
    isHeroTransitioning = false;
    if (heroTransitionRaf) {
      cancelAnimationFrame(heroTransitionRaf);
      heroTransitionRaf = null;
    }
    isTransitionCooldown = false;
    mobileGestureHandled = false;
    mobileTouchSection = 'HERO';

    // Reset tile curtain & inner
    if (tileCurtain) {
      tileCurtain.style.transition = 'none';
      tileCurtain.style.transform = 'translate3d(0, 100%, 0)';
    }

    if (tileSectionInner) {
      tileSectionInner.style.transition = 'none';
      tileSectionInner.style.opacity = '0';
      tileSectionInner.style.transform = 'translate3d(0, 20px, 0)';
      tileSectionInner.style.filter = 'blur(4px)';
    }

    if (tileSection) {
      tileSection.style.pointerEvents = 'none';
      tileSection.style.visibility = 'hidden';
      tileSection.scrollTop = 0;
    }

    currentTileIndex = 0;
    renderTileSlider(0);
    if (typeof resetPillHandle === 'function') {
      resetPillHandle();
    }

    // Reset finder curtain
    if (finderCurtain) {
      finderCurtain.style.transition = 'none';
      finderCurtain.style.transform = 'translate3d(0, 100%, 0)';
    }

    // Reset finder inner
    if (finderInner) {
      finderInner.style.transition = 'none';
      finderInner.style.opacity = '0';
      finderInner.style.transform = 'translate3d(0, 20px, 0)';
      finderInner.style.filter = 'blur(5px)';
    }

    if (graniteFinder) {
      graniteFinder.style.pointerEvents = 'none';
      graniteFinder.style.visibility = 'hidden';
      graniteFinder.scrollTop = 0;
    }

    if (finderCardWrapper) {
      finderCardWrapper.classList.remove('is-results-active');
    }

    // 1. Force instantaneous reset of scroll offset without animation
    document.documentElement.style.scrollBehavior = 'auto';
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch (e) {
      window.scrollTo(0, 0);
    }

    // 2. Reset slider to granite #1
    currentGraniteIndex = 0;
    renderSliderState(0);

    // 3. Reset curtain to completely below viewport
    if (warmCurtain) {
      warmCurtain.style.transition = 'none';
      warmCurtain.style.transform = 'translate3d(0, 100%, 0)';
    }

    // 4. Reset granite collection reveal
    if (graniteInner) {
      graniteInner.style.transition = 'none';
      graniteInner.style.opacity = '0';
      graniteInner.style.transform = 'translate3d(0, 20px, 0)';
      graniteInner.style.filter = 'blur(6px)';
      graniteInner.style.visibility = 'hidden';
    }

    if (graniteSection) {
      graniteSection.style.pointerEvents = 'none';
      graniteSection.style.visibility = 'hidden';
    }

    // 5. Hero stays visible and stationary
    if (heroContainer) {
      heroContainer.style.transform = 'none';
      heroContainer.style.opacity = '1';
    }

    // 6. Reset video playback
    if (video) {
      video.pause();
      try {
        video.currentTime = 0;
      } catch (e) { }
    }

    // Restore smooth scroll behavior for in-page anchors after reset
    requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = '';
    });
  }

  /* ==========================================================================
     Hero → Granite Collection Controlled Transition
     ========================================================================== */

  function transitionHeroToCollection(onComplete) {
    if (isHeroTransitioning || (isTransitioning && !isHeroTransitioning) || isTransitionCooldown) return;
    if (isFinderActive || isTileActive) return;

    isHeroTransitioning = true;
    isTransitioning = true;
    if (heroTransitionRaf) {
      cancelAnimationFrame(heroTransitionRaf);
      heroTransitionRaf = null;
    }

    const trackH = experienceTrack ? experienceTrack.offsetHeight : window.innerHeight * 2.2;
    const maxScroll = Math.max(1, trackH - window.innerHeight);
    const startY = window.scrollY || window.pageYOffset;
    const targetY = maxScroll;
    const distance = targetY - startY;

    if (Math.abs(distance) < 2) {
      window.scrollTo(0, targetY);
      updateTransition();
      isHeroTransitioning = false;
      isTransitioning = false;
      if (onComplete) onComplete();
      return;
    }

    const preventScrollFight = (e) => {
      if (e.cancelable) e.preventDefault();
    };
    window.addEventListener('wheel', preventScrollFight, { passive: false });
    window.addEventListener('touchmove', preventScrollFight, { passive: false });

    const startTime = performance.now();
    const duration = Math.min(750, Math.max(450, (Math.abs(distance) / maxScroll) * 700));

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);
      const nextY = startY + distance * ease;

      window.scrollTo(0, nextY);
      updateTransition();

      if (progress < 1) {
        heroTransitionRaf = requestAnimationFrame(step);
      } else {
        heroTransitionRaf = null;
        window.scrollTo(0, targetY);
        updateTransition();

        // Enforce 100% complete state for Granite Collection
        if (graniteInner) {
          graniteInner.style.visibility = 'visible';
          graniteInner.style.opacity = '1';
          graniteInner.style.transform = 'translate3d(0, 0, 0)';
          graniteInner.style.filter = 'blur(0px)';
        }
        if (graniteSection) {
          graniteSection.style.visibility = 'visible';
          graniteSection.style.pointerEvents = 'auto';
        }
        if (warmCurtain) {
          warmCurtain.style.transform = 'translate3d(0, 0%, 0)';
        }

        window.removeEventListener('wheel', preventScrollFight);
        window.removeEventListener('touchmove', preventScrollFight);

        isHeroTransitioning = false;
        isTransitioning = false;
        isTransitionCooldown = true;
        setTimeout(() => {
          isTransitionCooldown = false;
        }, 200);

        if (onComplete) onComplete();
      }
    }

    heroTransitionRaf = requestAnimationFrame(step);
  }

  function transitionCollectionToHero(onComplete) {
    if (isHeroTransitioning || (isTransitioning && !isHeroTransitioning) || isTransitionCooldown) return;
    if (isFinderActive || isTileActive) return;

    isHeroTransitioning = true;
    isTransitioning = true;
    if (heroTransitionRaf) {
      cancelAnimationFrame(heroTransitionRaf);
      heroTransitionRaf = null;
    }

    const startY = window.scrollY || window.pageYOffset;
    const targetY = 0;
    const distance = targetY - startY;

    if (Math.abs(distance) < 2) {
      window.scrollTo(0, 0);
      updateTransition();
      isHeroTransitioning = false;
      isTransitioning = false;
      if (onComplete) onComplete();
      return;
    }

    const preventScrollFight = (e) => {
      if (e.cancelable) e.preventDefault();
    };
    window.addEventListener('wheel', preventScrollFight, { passive: false });
    window.addEventListener('touchmove', preventScrollFight, { passive: false });

    const startTime = performance.now();
    const trackH = experienceTrack ? experienceTrack.offsetHeight : window.innerHeight * 2.2;
    const maxScroll = Math.max(1, trackH - window.innerHeight);
    const duration = Math.min(750, Math.max(450, (Math.abs(distance) / maxScroll) * 700));

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);
      const nextY = startY + distance * ease;

      window.scrollTo(0, nextY);
      updateTransition();

      if (progress < 1) {
        heroTransitionRaf = requestAnimationFrame(step);
      } else {
        heroTransitionRaf = null;
        window.scrollTo(0, 0);
        updateTransition();

        // Enforce 100% clean state for Hero
        if (heroScrollIndicator) {
          heroScrollIndicator.style.opacity = '';
          heroScrollIndicator.style.pointerEvents = '';
        }
        if (warmCurtain) {
          warmCurtain.style.transform = 'translate3d(0, 100%, 0)';
        }
        if (graniteInner) {
          graniteInner.style.opacity = '0';
          graniteInner.style.transform = 'translate3d(0, 20px, 0)';
          graniteInner.style.filter = 'blur(6px)';
          graniteInner.style.visibility = 'hidden';
        }
        if (graniteSection) {
          graniteSection.style.visibility = 'hidden';
          graniteSection.style.pointerEvents = 'none';
        }
        if (heroContainer) {
          heroContainer.style.transform = 'none';
          heroContainer.style.opacity = '1';
        }

        window.removeEventListener('wheel', preventScrollFight);
        window.removeEventListener('touchmove', preventScrollFight);

        isHeroTransitioning = false;
        isTransitioning = false;
        isTransitionCooldown = true;
        setTimeout(() => {
          isTransitionCooldown = false;
        }, 200);

        if (onComplete) onComplete();
      }
    }

    heroTransitionRaf = requestAnimationFrame(step);
  }

  /* ==========================================================================
     Granite Collection → Granite Finder Cinematic Transition
     ========================================================================== */

  function transitionToFinder() {
    if (isFinderActive || isTransitioning) return;
    isTransitioning = true;

    // STEP 3: Temporarily take control of transition.
    // Prevent normal scrolling from fighting the animation during this short transition.
    const preventScrollFight = (e) => {
      e.preventDefault();
    };
    window.addEventListener('wheel', preventScrollFight, { passive: false });
    window.addEventListener('touchmove', preventScrollFight, { passive: false });

    // STEP 5: As the ivory layer rises, Granite Collection UI subtly disappears behind it
    if (graniteInner) {
      graniteInner.style.transition = 'opacity 0.45s ease, filter 0.45s ease';
      graniteInner.style.opacity = '0';
      graniteInner.style.filter = 'blur(5px)';
    }

    // STEP 4: The warm ivory curtain begins rising from bottom: translateY(100%) → translateY(0%)
    // Duration: 850ms, cubic-bezier(0.16, 1, 0.3, 1)
    if (finderCurtain) {
      finderCurtain.style.transition = 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)';
      finderCurtain.style.transform = 'translate3d(0, 0%, 0)';
    }

    // STEP 6: Once ivory layer has covered ~70–80% (~550ms), reveal Granite Finder
    setTimeout(() => {
      if (graniteFinder) {
        graniteFinder.style.visibility = 'visible';
      }
      if (finderInner) {
        finderInner.style.transition = 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), filter 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        finderInner.style.opacity = '1';
        finderInner.style.transform = 'translate3d(0, 0, 0)';
        finderInner.style.filter = 'blur(0px)';
      }
    }, 550);

    // STEP 7 & 8: Curtain reaches full coverage, release temporary scroll lock, normal scrolling resumes
    setTimeout(() => {
      isFinderActive = true;
      isTransitioning = false;
      isTransitionCooldown = true;
      setTimeout(() => {
        isTransitionCooldown = false;
      }, 350);
      window.removeEventListener('wheel', preventScrollFight);
      window.removeEventListener('touchmove', preventScrollFight);

      if (graniteFinder) {
        graniteFinder.style.visibility = 'visible';
        graniteFinder.style.pointerEvents = 'auto';
      }
      if (graniteSection) {
        graniteSection.style.pointerEvents = 'none';
        graniteSection.style.visibility = 'hidden';
      }
      if (graniteInner) {
        graniteInner.style.transition = 'none';
        graniteInner.style.visibility = 'hidden';
      }
    }, 850);
  }

  function transitionBackToCollection() {
    if (!isFinderActive || isTransitioning) return;
    isTransitioning = true;

    const preventScrollFight = (e) => {
      e.preventDefault();
    };
    window.addEventListener('wheel', preventScrollFight, { passive: false });
    window.addEventListener('touchmove', preventScrollFight, { passive: false });

    if (graniteFinder) {
      graniteFinder.style.pointerEvents = 'none';
    }

    if (finderInner) {
      finderInner.style.transition = 'opacity 0.35s ease, transform 0.35s ease, filter 0.35s ease';
      finderInner.style.opacity = '0';
      finderInner.style.transform = 'translate3d(0, 20px, 0)';
      finderInner.style.filter = 'blur(5px)';
    }

    if (finderCurtain) {
      finderCurtain.style.transition = 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)';
      finderCurtain.style.transform = 'translate3d(0, 100%, 0)';
    }

    setTimeout(() => {
      if (graniteInner) {
        graniteInner.style.transition = 'opacity 0.5s ease, filter 0.5s ease';
        graniteInner.style.opacity = '1';
        graniteInner.style.filter = 'blur(0px)';
      }
    }, 350);

    setTimeout(() => {
      isFinderActive = false;
      isTransitioning = false;
      isTransitionCooldown = true;
      setTimeout(() => {
        isTransitionCooldown = false;
      }, 350);
      window.removeEventListener('wheel', preventScrollFight);
      window.removeEventListener('touchmove', preventScrollFight);

      if (graniteFinder) {
        graniteFinder.style.visibility = 'hidden';
      }
      if (graniteSection) {
        graniteSection.style.pointerEvents = 'auto';
        graniteSection.style.visibility = 'visible';
      }
      if (graniteInner) {
        graniteInner.style.transition = 'none';
        graniteInner.style.visibility = 'visible';
      }
    }, 850);
  }

  /* ==========================================================================
     Granite Finder → Tile Collection Cinematic Transition (Bidirectional)
     ========================================================================== */

  function transitionToTiles() {
    if (isTileActive || isTransitioning) return;
    isTransitioning = true;

    // STEP 3: Temporarily take control of transition.
    // Prevent normal scrolling from fighting the animation during this short transition.
    const preventScrollFight = (e) => {
      e.preventDefault();
    };
    window.addEventListener('wheel', preventScrollFight, { passive: false });
    window.addEventListener('touchmove', preventScrollFight, { passive: false });

    // STEP 4: As the ivory layer rises, Granite Finder subtly blurs/dims
    if (finderInner) {
      finderInner.style.transition = 'opacity 0.45s ease, filter 0.45s ease';
      finderInner.style.opacity = '0';
      finderInner.style.filter = 'blur(4px)';
    }

    // STEP 4: The full-screen warm ivory layer begins rising from the bottom
    // translateY(100%) → translateY(0%) over 850ms, cubic-bezier(0.16, 1, 0.3, 1)
    if (tileCurtain) {
      tileCurtain.style.transition = 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)';
      tileCurtain.style.transform = 'translate3d(0, 0%, 0)';
    }

    // STEP 5: Once ivory layer has covered ~70–80% (~550ms), reveal Tile section
    setTimeout(() => {
      if (tileSection) {
        tileSection.style.visibility = 'visible';
      }
      if (tileSectionInner) {
        tileSectionInner.style.transition = 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), filter 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        tileSectionInner.style.opacity = '1';
        tileSectionInner.style.transform = 'translate3d(0, 0, 0)';
        tileSectionInner.style.filter = 'blur(0px)';
      }
    }, 550);

    // STEP 6: Curtain reaches full coverage, release temporary scroll lock, normal scrolling resumes
    setTimeout(() => {
      isTileActive = true;
      isTransitioning = false;
      isTransitionCooldown = true;
      setTimeout(() => {
        isTransitionCooldown = false;
      }, 350);
      window.removeEventListener('wheel', preventScrollFight);
      window.removeEventListener('touchmove', preventScrollFight);

      if (tileSection) {
        tileSection.style.visibility = 'visible';
        tileSection.style.pointerEvents = 'auto';
      }
      if (graniteFinder) {
        graniteFinder.style.pointerEvents = 'none';
        graniteFinder.style.visibility = 'hidden';
      }
    }, 850);
  }

  function transitionBackToFinder() {
    if (!isTileActive || isTransitioning) return;
    isTransitioning = true;

    const preventScrollFight = (e) => {
      e.preventDefault();
    };
    window.addEventListener('wheel', preventScrollFight, { passive: false });
    window.addEventListener('touchmove', preventScrollFight, { passive: false });

    if (tileSection) {
      tileSection.style.pointerEvents = 'none';
    }

    if (tileSectionInner) {
      tileSectionInner.style.transition = 'opacity 0.35s ease, transform 0.35s ease, filter 0.35s ease';
      tileSectionInner.style.opacity = '0';
      tileSectionInner.style.transform = 'translate3d(0, 20px, 0)';
      tileSectionInner.style.filter = 'blur(4px)';
    }

    if (tileCurtain) {
      tileCurtain.style.transition = 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)';
      tileCurtain.style.transform = 'translate3d(0, 100%, 0)';
    }

    setTimeout(() => {
      if (graniteFinder) {
        graniteFinder.style.visibility = 'visible';
      }
      if (finderInner) {
        finderInner.style.transition = 'opacity 0.5s ease, filter 0.5s ease';
        finderInner.style.opacity = '1';
        finderInner.style.filter = 'blur(0px)';
      }
    }, 350);

    setTimeout(() => {
      isTileActive = false;
      isTransitioning = false;
      isTransitionCooldown = true;
      setTimeout(() => {
        isTransitionCooldown = false;
      }, 350);
      window.removeEventListener('wheel', preventScrollFight);
      window.removeEventListener('touchmove', preventScrollFight);

      if (tileSection) {
        tileSection.style.visibility = 'hidden';
      }
      if (graniteFinder) {
        graniteFinder.style.pointerEvents = 'auto';
        graniteFinder.style.visibility = 'visible';
      }
    }, 850);
  }

  // Expose on window for verification
  window.transitionHeroToCollection = transitionHeroToCollection;
  window.transitionCollectionToHero = transitionCollectionToHero;
  window.transitionToFinder = transitionToFinder;
  window.transitionBackToCollection = transitionBackToCollection;
  window.transitionToTiles = transitionToTiles;
  window.transitionBackToFinder = transitionBackToFinder;

  // Controlled Gesture Listeners for Mobile & Desktop Section Progression
  // Guarantees ONE intentional mobile swipe = ONE section transition (never skips sections)
  window.addEventListener('touchstart', (e) => {
    if (!e.touches || e.touches.length === 0) return;
    mobileTouchStartX = e.touches[0].clientX;
    mobileTouchStartY = e.touches[0].clientY;
    finderTouchStartY = e.touches[0].clientY;
    mobileGestureHandled = false;

    // Detect section at the exact moment touch begins
    if (isTileActive) {
      mobileTouchSection = 'TILES';
    } else if (isFinderActive) {
      mobileTouchSection = 'FINDER';
    } else if (currentScrollProgress >= 0.70) {
      mobileTouchSection = 'GRANITE';
    } else {
      mobileTouchSection = 'HERO';
    }
  }, { passive: true });

  window.addEventListener('wheel', (e) => {
    // Safety: ignore if modal or lightbox is open, or during other drags/transitions
    if (modalBackdrop && modalBackdrop.classList.contains('is-open')) return;
    if (textureLightbox && textureLightbox.classList.contains('is-open')) return;
    if (wasDragging || isPointerDown || isPillDragging || isStageDragging) return;
    if (isTransitioning || isTransitionCooldown || isHeroTransitioning) return;

    // 1. One downward scroll gesture at end of Granite Collection -> Finder
    if (!isFinderActive && !isTileActive && currentScrollProgress >= 0.95) {
      if (e.deltaY > 15) {
        e.preventDefault();
        transitionToFinder();
      }
    }
    // 2. Upward scroll gesture at top of Granite Finder -> Collection
    else if (isFinderActive && !isTileActive) {
      const finderTop = graniteFinder ? graniteFinder.scrollTop : 0;
      if (finderTop <= 2 && e.deltaY < -15) {
        e.preventDefault();
        transitionBackToCollection();
      } else {
        // 3. Downward scroll gesture at end of Granite Finder -> Tile Section
        const isFinderAtEnd = graniteFinder ? (graniteFinder.scrollTop + graniteFinder.clientHeight) >= (graniteFinder.scrollHeight - 15) : true;
        if (isFinderAtEnd && e.deltaY > 15) {
          e.preventDefault();
          transitionToTiles();
        }
      }
    }
    // 4. Upward scroll gesture at top of Tile Section -> Finder
    else if (isTileActive) {
      const tileTop = tileSection ? tileSection.scrollTop : 0;
      if (tileTop <= 2 && e.deltaY < -15) {
        e.preventDefault();
        transitionBackToFinder();
      }
    }
  }, { passive: false });

  window.addEventListener('touchmove', (e) => {
    // Safety: do not intercept if modal/lightbox is open, during transitions or drags
    if (modalBackdrop && modalBackdrop.classList.contains('is-open')) return;
    if (textureLightbox && textureLightbox.classList.contains('is-open')) return;
    if (wasDragging || isPointerDown || isPillDragging || isStageDragging) return;
    if (isTransitioning || isTransitionCooldown || isHeroTransitioning) {
      if (e.cancelable) e.preventDefault();
      return;
    }
    if (mobileGestureHandled) {
      if (e.cancelable) e.preventDefault();
      return;
    }
    if (!e.touches || e.touches.length === 0) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = mobileTouchStartX - currentX;
    const diffY = mobileTouchStartY - currentY; // positive = swipe up (advance), negative = swipe down (back)
    const absX = Math.abs(diffX);
    const absY = Math.abs(diffY);

    // Filter out horizontal swipes (e.g., granite slabs or tile cards)
    if (absX >= absY || absY < 45) return;

    // Strictly enforce: ONE intentional swipe = ONE adjacent section transition
    if (mobileTouchSection === 'HERO') {
      if (diffY > 0) {
        // Swipe UP on Hero -> Smoothly transition to Granite Collection ONLY (cannot skip into Finder)
        mobileGestureHandled = true;
        if (e.cancelable) e.preventDefault();
        transitionHeroToCollection();
      }
    } else if (mobileTouchSection === 'GRANITE') {
      if (diffY > 0) {
        // Swipe UP on Granite Collection -> Transition to Granite Finder ONLY (cannot skip into Tiles)
        mobileGestureHandled = true;
        if (e.cancelable) e.preventDefault();
        transitionToFinder();
      } else if (diffY < 0) {
        // Swipe DOWN on Granite Collection -> Smoothly transition back to Hero ONLY
        mobileGestureHandled = true;
        if (e.cancelable) e.preventDefault();
        transitionCollectionToHero();
      }
    } else if (mobileTouchSection === 'FINDER') {
      const finderTop = graniteFinder ? graniteFinder.scrollTop : 0;
      const isFinderAtEnd = graniteFinder ? (graniteFinder.scrollTop + graniteFinder.clientHeight) >= (graniteFinder.scrollHeight - 15) : true;

      if (diffY < 0 && finderTop <= 4) {
        // Swipe DOWN at top of Finder -> Transition back to Granite Collection ONLY (cannot skip into Hero)
        mobileGestureHandled = true;
        if (e.cancelable) e.preventDefault();
        transitionBackToCollection();
      } else if (diffY > 0 && isFinderAtEnd) {
        // Swipe UP at bottom of Finder -> Transition to Tile Collection ONLY
        mobileGestureHandled = true;
        if (e.cancelable) e.preventDefault();
        transitionToTiles();
      }
      // If within scrollable body of Finder, native smooth scrolling is untouched
    } else if (mobileTouchSection === 'TILES') {
      const tileTop = tileSection ? tileSection.scrollTop : 0;
      if (diffY < 0 && tileTop <= 4) {
        // Swipe DOWN at top of Tile Section -> Transition back to Granite Finder ONLY
        mobileGestureHandled = true;
        if (e.cancelable) e.preventDefault();
        transitionBackToFinder();
      }
    }
  }, { passive: false });

  window.addEventListener('touchend', () => {
    // If not transitioning and page is in an intermediate state between Hero and Granite,
    // snap cleanly to either Hero or Granite Collection (never remain in a washed-out intermediate state!)
    if (!isFinderActive && !isTileActive && !isTransitioning && !isHeroTransitioning && !isTransitionCooldown) {
      if (currentScrollProgress > 0.02 && currentScrollProgress < 0.98) {
        if (currentScrollProgress >= 0.40) {
          transitionHeroToCollection();
        } else {
          transitionCollectionToHero();
        }
      }
    }
    mobileGestureHandled = false;
  }, { passive: true });

  window.addEventListener('touchcancel', () => {
    if (!isFinderActive && !isTileActive && !isTransitioning && !isHeroTransitioning && !isTransitionCooldown) {
      if (currentScrollProgress > 0.02 && currentScrollProgress < 0.98) {
        if (currentScrollProgress >= 0.40) {
          transitionHeroToCollection();
        } else {
          transitionCollectionToHero();
        }
      }
    }
    mobileGestureHandled = false;
  }, { passive: true });

  window.addEventListener('keydown', (e) => {
    if (modalBackdrop && modalBackdrop.classList.contains('is-open')) return;
    if (textureLightbox && textureLightbox.classList.contains('is-open')) return;
    if (isTransitioning || isTransitionCooldown || isHeroTransitioning) return;

    if (!isFinderActive && !isTileActive && currentScrollProgress >= 0.95) {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        transitionToFinder();
      }
    } else if (isFinderActive && !isTileActive && !isTransitioning) {
      const finderTop = graniteFinder ? graniteFinder.scrollTop : 0;
      if (finderTop <= 2 && (e.key === 'ArrowUp' || e.key === 'PageUp')) {
        e.preventDefault();
        transitionBackToCollection();
      } else {
        const isFinderAtEnd = graniteFinder ? (graniteFinder.scrollTop + graniteFinder.clientHeight) >= (graniteFinder.scrollHeight - 15) : true;
        if (isFinderAtEnd && (e.key === 'ArrowDown' || e.key === 'PageDown')) {
          e.preventDefault();
          transitionToTiles();
        }
      }
    } else if (isTileActive && !isTransitioning) {
      const tileTop = tileSection ? tileSection.scrollTop : 0;
      if (tileTop <= 2 && (e.key === 'ArrowUp' || e.key === 'PageUp')) {
        e.preventDefault();
        transitionBackToFinder();
      } else if (e.key === 'ArrowLeft') {
        goToTileSlide(currentTileIndex - 1);
      } else if (e.key === 'ArrowRight') {
        goToTileSlide(currentTileIndex + 1);
      }
    }
  });

  /* ==========================================================================
     Tile Collection Slider Showcase Engine & Drag Controls
     ========================================================================== */

  let isPillDragging = false;
  let pillDragStartX = 0;
  let pillCurrentDeltaX = 0;
  let isPillUnlocked = false;

  let isStageDragging = false;
  let stageDragMoved = false;
  let stageDragStartX = 0;

  function getMaxPillSlide() {
    if (!tileDragPill || !dragHandleWrap) return 240;
    const pillWidth = tileDragPill.clientWidth || 320;
    const handleWidth = dragHandleWrap.offsetWidth || 42;
    return Math.max(100, pillWidth - handleWidth - 23);
  }

  function completePillSlide() {
    if (isPillUnlocked) return;
    isPillUnlocked = true;

    const maxSlide = getMaxPillSlide();

    if (dragHandleWrap) {
      dragHandleWrap.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
      dragHandleWrap.style.transform = `translate3d(${maxSlide}px, 0, 0)`;
    }

    if (dragTrackFill) {
      dragTrackFill.style.transition = 'width 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
      dragTrackFill.style.width = '100%';
    }

    if (dragPillLabel) {
      dragPillLabel.textContent = 'EXPLORING BALAJI TILES...';
      dragPillLabel.style.opacity = '1';
    }

    if (tileDragPill) {
      tileDragPill.classList.add('is-unlocked');
    }

    setTimeout(() => {
      if (typeof window.openBalajiTilesWebsite === 'function') {
        window.openBalajiTilesWebsite();
      } else {
        window.location.href = 'https://balajitiles.com';
      }
    }, 320);
  }

  window.openBalajiTilesWebsite = function () {
    window.location.href = 'https://balajitiles.com';
  };

  function resetPillHandle() {
    isPillDragging = false;
    pillCurrentDeltaX = 0;

    if (isPillUnlocked) return;

    if (dragHandleWrap) {
      dragHandleWrap.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      dragHandleWrap.style.transform = 'translate3d(0, 0, 0)';
    }

    if (dragTrackFill) {
      dragTrackFill.style.transition = 'width 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
      dragTrackFill.style.width = '0%';
      setTimeout(() => {
        if (dragTrackFill && !isPillDragging) dragTrackFill.style.transition = '';
      }, 350);
    }

    if (dragPillLabel) {
      dragPillLabel.textContent = 'DRAG TO EXPLORE';
      dragPillLabel.style.opacity = '1';
    }

    if (dragPillArrowRight) {
      dragPillArrowRight.style.transform = 'none';
    }

    if (tileDragPill) {
      tileDragPill.classList.remove('is-unlocked');
      tileDragPill.classList.remove('is-dragging');
    }
  }

  window.completePillSlide = completePillSlide;
  window.resetPillHandle = resetPillHandle;

  function renderTileSlider(activeIdx) {
    const totalTiles = TILE_COLLECTION.length;
    currentTileIndex = ((activeIdx % totalTiles) + totalTiles) % totalTiles;
    const slabs = tileSlabsTrack ? tileSlabsTrack.querySelectorAll('.tile-slab-item') : [];
    const isMobile = window.innerWidth <= 640;
    const isTablet = window.innerWidth > 640 && window.innerWidth <= 1024;

    slabs.forEach((slab, idx) => {
      let diff = (idx - currentTileIndex) % totalTiles;
      if (diff < -Math.floor(totalTiles / 2)) diff += totalTiles;
      if (diff > Math.floor(totalTiles / 2)) diff -= totalTiles;

      let transform = '';
      let opacity = 0;
      let zIndex = 0;
      let pointerEvents = 'none';
      let boxShadow = 'none';

      if (diff === 0) {
        // Central Hero Slab
        transform = isMobile
          ? 'translate3d(0, 0, 40px) scale(1)'
          : 'translate3d(0, 0, 80px) scale(1) rotateY(0deg)';
        opacity = 1;
        zIndex = 10;
        pointerEvents = 'auto';
        boxShadow = '0 28px 60px rgba(0, 0, 0, 0.22), 0 8px 24px rgba(0, 0, 0, 0.12)';
      } else if (diff === -1) {
        // Mid Left Slab
        transform = isMobile
          ? 'translate3d(-65%, 0, 0px) scale(0.78)'
          : isTablet
            ? 'translate3d(-55%, 0, 10px) scale(0.82) rotateY(6deg)'
            : 'translate3d(-58%, 0, 20px) scale(0.84) rotateY(8deg)';
        opacity = 0.92;
        zIndex = 5;
        pointerEvents = 'auto';
        boxShadow = '0 16px 36px rgba(0, 0, 0, 0.14)';
      } else if (diff === 1) {
        // Mid Right Slab
        transform = isMobile
          ? 'translate3d(65%, 0, 0px) scale(0.78)'
          : isTablet
            ? 'translate3d(55%, 0, 10px) scale(0.82) rotateY(-6deg)'
            : 'translate3d(58%, 0, 20px) scale(0.84) rotateY(-8deg)';
        opacity = 0.92;
        zIndex = 5;
        pointerEvents = 'auto';
        boxShadow = '0 16px 36px rgba(0, 0, 0, 0.14)';
      } else if (diff === -2 && !isMobile) {
        // Far Left Slab
        transform = isTablet
          ? 'translate3d(-96%, 0, -30px) scale(0.68) rotateY(10deg)'
          : 'translate3d(-102%, 0, -40px) scale(0.72) rotateY(12deg)';
        opacity = 0.72;
        zIndex = 2;
        pointerEvents = 'auto';
        boxShadow = '0 10px 24px rgba(0, 0, 0, 0.1)';
      } else if (diff === 2 && !isMobile) {
        // Far Right Slab
        transform = isTablet
          ? 'translate3d(96%, 0, -30px) scale(0.68) rotateY(-10deg)'
          : 'translate3d(102%, 0, -40px) scale(0.72) rotateY(-12deg)';
        opacity = 0.72;
        zIndex = 2;
        pointerEvents = 'auto';
        boxShadow = '0 10px 24px rgba(0, 0, 0, 0.1)';
      } else if (diff < -2) {
        // Offstage Left
        transform = 'translate3d(-150%, 0, -100px) scale(0.6) rotateY(15deg)';
        opacity = 0;
        zIndex = 0;
        pointerEvents = 'none';
      } else if (diff > 2) {
        // Offstage Right
        transform = 'translate3d(150%, 0, -100px) scale(0.6) rotateY(-15deg)';
        opacity = 0;
        zIndex = 0;
        pointerEvents = 'none';
      }

      if (Math.abs(diff) >= 3) {
        slab.style.transition = 'none';
      } else {
        slab.style.transition = '';
      }

      slab.style.transform = transform;
      slab.style.opacity = opacity;
      slab.style.zIndex = zIndex;
      slab.style.pointerEvents = pointerEvents;
      slab.style.boxShadow = boxShadow;
    });

    // Update minimal pagination dots
    if (tilePagination) {
      const dots = tilePagination.querySelectorAll('.tile-dot');
      dots.forEach((dot, idx) => {
        if (idx === currentTileIndex) {
          dot.classList.add('is-active');
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.classList.remove('is-active');
          dot.removeAttribute('aria-current');
        }
      });
    }

    // Next arrow button is always interactive (continuous infinite carousel)
    if (dragArrowBtn) {
      dragArrowBtn.style.opacity = '1';
      dragArrowBtn.style.cursor = 'pointer';
    }
  }

  function goToTileSlide(targetIdx) {
    const totalTiles = TILE_COLLECTION.length;
    const nextIdx = ((targetIdx % totalTiles) + totalTiles) % totalTiles;
    renderTileSlider(nextIdx);
  }

  function renderTilePagination() {
    if (!tilePagination) return;
    tilePagination.innerHTML = '';
    TILE_COLLECTION.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `tile-dot ${idx === currentTileIndex ? 'is-active' : ''}`;
      dot.setAttribute('aria-label', `Go to tile ${idx + 1}`);
      dot.addEventListener('click', () => {
        goToTileSlide(idx);
      });
      tilePagination.appendChild(dot);
    });
  }

  function initTileShowcase() {
    if (!tileSlabsTrack) return;
    tileSlabsTrack.innerHTML = '';

    TILE_COLLECTION.forEach((tile, idx) => {
      const slab = document.createElement('div');
      slab.className = 'tile-slab-item';
      slab.dataset.index = idx;
      slab.setAttribute('role', 'button');
      slab.setAttribute('tabindex', '0');
      slab.setAttribute('aria-label', `${tile.name} Tile Slab`);

      slab.innerHTML = `
        <img class="tile-slab-img" src="${tile.image}" alt="${tile.name} Tile" loading="lazy">
        <div class="tile-slab-sheen"></div>
        <div class="tile-slab-shadow"></div>
      `;

      slab.addEventListener('click', () => {
        if (idx !== currentTileIndex) {
          goToTileSlide(idx);
        }
      });

      slab.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goToTileSlide(idx);
        }
      });

      tileSlabsTrack.appendChild(slab);
    });

    renderTilePagination();
    renderTileSlider(currentTileIndex);

    // Interactive Minimal DRAG TO EXPLORE Control (Dragging left/right switches tiles infinitely)
    if (tileDragPill) {
      let isPillDragging = false;
      let pillDragStartX = 0;
      let pillDeltaX = 0;
      let pillStartTime = 0;

      tileDragPill.addEventListener('pointerdown', (e) => {
        if (e.button !== undefined && e.button !== 0) return;
        isPillDragging = true;
        pillDragStartX = e.clientX;
        pillDeltaX = 0;
        pillStartTime = performance.now();
        tileDragPill.classList.add('is-dragging');
        try {
          tileDragPill.setPointerCapture(e.pointerId);
        } catch (err) { }
        if (dragHandleWrap) {
          dragHandleWrap.style.transition = 'none';
        }
      });

      tileDragPill.addEventListener('pointermove', (e) => {
        if (!isPillDragging || isPillUnlocked) return;
        pillDeltaX = e.clientX - pillDragStartX;
        const maxSlide = getMaxPillSlide();
        const clampedX = Math.max(0, Math.min(maxSlide, pillDeltaX));
        if (dragHandleWrap) {
          dragHandleWrap.style.transform = `translate3d(${clampedX}px, 0, 0)`;
        }
        if (dragTrackFill) {
          const pct = Math.min(100, (clampedX / maxSlide) * 100);
          dragTrackFill.style.width = `${pct}%`;
        }
      });

      const onPillEnd = (e) => {
        if (!isPillDragging) return;
        isPillDragging = false;
        tileDragPill.classList.remove('is-dragging');
        try {
          tileDragPill.releasePointerCapture(e.pointerId);
        } catch (err) { }

        if (isPillUnlocked) return;

        const maxSlide = getMaxPillSlide();
        const elapsed = performance.now() - pillStartTime;
        const velocity = pillDeltaX / Math.max(1, elapsed);

        // Completion threshold: dragged >= 60% of total distance, or swift forward drag (>= 35% with velocity > 0.35)
        const threshold = maxSlide * 0.60;
        if (pillDeltaX >= threshold || (pillDeltaX >= maxSlide * 0.35 && velocity > 0.35)) {
          completePillSlide();
        } else {
          // If released early or just clicked -> reset smoothly without navigating
          resetPillHandle();
        }
      };

      tileDragPill.addEventListener('pointerup', onPillEnd);
      tileDragPill.addEventListener('pointercancel', onPillEnd);
    }

    // Direct Track / Viewport Drag Support
    if (tileStageViewport) {
      tileStageViewport.addEventListener('pointerdown', (e) => {
        isStageDragging = true;
        stageDragMoved = false;
        stageDragStartX = e.clientX;
      });

      tileStageViewport.addEventListener('pointermove', (e) => {
        if (!isStageDragging) return;
        if (Math.abs(e.clientX - stageDragStartX) > 8) {
          stageDragMoved = true;
        }
      });

      const endStageDrag = (e) => {
        if (!isStageDragging) return;
        isStageDragging = false;
        if (stageDragMoved) {
          const deltaX = e.clientX - stageDragStartX;
          if (deltaX < -40) {
            goToTileSlide(currentTileIndex + 1);
          } else if (deltaX > 40) {
            goToTileSlide(currentTileIndex - 1);
          }
        }
      };

      tileStageViewport.addEventListener('pointerup', endStageDrag);
      tileStageViewport.addEventListener('pointercancel', endStageDrag);
    }
  }

  // Initialize tile showcase immediately
  initTileShowcase();

  // Expose tile functions for verification
  window.goToTileSlide = goToTileSlide;
  window.renderTileSlider = renderTileSlider;
  window.getCurrentTileIndex = () => currentTileIndex;

  function onScroll() {
    if (!scrollRafId) {
      scrollRafId = requestAnimationFrame(updateTransition);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    onScroll();
    renderTileSlider(currentTileIndex);
  }, { passive: true });

  // Initial reset and transition state
  resetExperienceToTop();
  updateTransition();

  // Additional safety on window 'load'
  window.addEventListener('load', () => {
    if (window.scrollY > 0) {
      resetExperienceToTop();
      updateTransition();
    }
  });

  // Connect "EXPLORE GRANITE" CTA button & scroll indicator to smooth slide into collection
  const scrollToCollection = (e) => {
    e.preventDefault();
    if (isTileActive) transitionBackToFinder();
    if (isFinderActive) transitionBackToCollection();
    transitionHeroToCollection();
  };

  if (exploreCtaBtn) {
    exploreCtaBtn.addEventListener('click', scrollToCollection);
  }
  if (heroScrollIndicator) {
    heroScrollIndicator.addEventListener('click', scrollToCollection);
  }

  // Connect Navbar "About" link (navigate to /about if linked to dedicated page)
  if (navAboutLink) {
    navAboutLink.addEventListener('click', (e) => {
      const href = navAboutLink.getAttribute('href');
      if (href && (href === '/about' || href.startsWith('/about') || href.includes('about.html'))) {
        return; // Allow native navigation to dedicated About page
      }
      e.preventDefault();
      if (isTileActive) {
        transitionBackToFinder();
      }
      if (isFinderActive) {
        transitionBackToCollection();
      }
      const trackH = experienceTrack ? experienceTrack.offsetHeight : window.innerHeight * 2.2;
      const targetScroll = trackH - window.innerHeight;
      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    });
  }

  // Connect Navbar "Products" link (navigate to /products if linked to dedicated page)
  if (navProductsLink) {
    navProductsLink.addEventListener('click', (e) => {
      const href = navProductsLink.getAttribute('href');
      if (href && (href === '/products' || href.startsWith('/products') || href.includes('products.html'))) {
        return; // Allow native navigation to dedicated Products page
      }
      e.preventDefault();
      if (isTileActive) {
        transitionBackToFinder();
      }
      if (isFinderActive) {
        transitionBackToCollection();
      }
      const trackH = experienceTrack ? experienceTrack.offsetHeight : window.innerHeight * 2.2;
      const targetScroll = trackH - window.innerHeight;
      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    });
  }

  // Connect Navbar "Home" link & Brand Badge to smooth scroll back to hero
  const brandBadge = document.querySelector('.brand-badge');
  const navigateToHome = (e) => {
    e.preventDefault();
    if (isTileActive) {
      transitionBackToFinder();
    }
    if (isFinderActive) {
      transitionBackToCollection();
    }
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (navHomeLink) {
    navHomeLink.addEventListener('click', navigateToHome);
  }
  if (brandBadge) {
    brandBadge.addEventListener('click', navigateToHome);
  }

  // Mobile Navigation Menu Toggle & Auto-Close
  const mobileNavToggle = document.getElementById('mobile-nav-toggle');
  const pillNavbar = document.getElementById('pill-navbar');

  if (mobileNavToggle && pillNavbar) {
    mobileNavToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = pillNavbar.classList.toggle('menu-open');
      mobileNavToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (pillNavbar.classList.contains('menu-open') && !pillNavbar.contains(e.target)) {
        pillNavbar.classList.remove('menu-open');
        mobileNavToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close mobile menu when clicking any nav link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (pillNavbar.classList.contains('menu-open')) {
          pillNavbar.classList.remove('menu-open');
          mobileNavToggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  /* ==========================================================================
     Granite Finder: Selection, Tolerant Filtering & Results Experience
     ========================================================================== */

  const finderTiles = document.querySelectorAll('.finder-tile');

  // Single deterministic source of truth for Finder State
  const finderState = {
    application: 'kitchen',
    tone: 'dark',
    finish: 'polished',
    results: []
  };

  // Provide seamless alias getters/setters for .app
  Object.defineProperty(finderState, 'app', {
    get() { return this.application; },
    set(v) { this.application = v; },
    enumerable: true
  });

  finderTiles.forEach(tile => {
    tile.addEventListener('click', () => {
      const group = tile.dataset.group;
      const value = tile.dataset.value;
      if (!group || !value) return;

      if (group === 'app' || group === 'application') {
        finderState.application = value;
      } else if (group === 'tone') {
        finderState.tone = value;
      } else if (group === 'finish') {
        finderState.finish = value;
      }

      document.querySelectorAll(`.finder-tile[data-group="${group}"]`).forEach(t => {
        t.classList.remove('is-selected');
        t.setAttribute('aria-checked', 'false');
      });
      tile.classList.add('is-selected');
      tile.setAttribute('aria-checked', 'true');
    });
  });

  function filterGranites(prefs) {
    const app = prefs.application || prefs.app;
    const tone = prefs.tone;
    const finish = prefs.finish;

    // Level 1: Strict exact match (application + tone + finish)
    let matches = GRANITE_COLLECTION.map((item, idx) => ({ ...item, originalIndex: idx }))
      .filter(item => {
        const matchApp = !app || (item.applications && item.applications.includes(app));
        const matchTone = !tone || (item.tone === tone);
        const matchFinish = !finish || (item.finishes && item.finishes.includes(finish));
        return matchApp && matchTone && matchFinish;
      });

    let matchQuality = 'exact';

    // Level 2: Progressive Relaxation (Application + Tone)
    if (matches.length === 0) {
      matches = GRANITE_COLLECTION.map((item, idx) => ({ ...item, originalIndex: idx }))
        .filter(item => {
          const matchApp = !app || (item.applications && item.applications.includes(app));
          const matchTone = !tone || (item.tone === tone);
          return matchApp && matchTone;
        });
      matchQuality = 'relaxed';
    }

    // Level 3: Tone + Finish
    if (matches.length === 0) {
      matches = GRANITE_COLLECTION.map((item, idx) => ({ ...item, originalIndex: idx }))
        .filter(item => {
          const matchTone = !tone || (item.tone === tone);
          const matchFinish = !finish || (item.finishes && item.finishes.includes(finish));
          return matchTone && matchFinish;
        });
      matchQuality = 'relaxed';
    }

    // Level 4: Tone only
    if (matches.length === 0) {
      matches = GRANITE_COLLECTION.map((item, idx) => ({ ...item, originalIndex: idx }))
        .filter(item => item.tone === tone);
      matchQuality = 'relaxed';
    }

    // Level 5: Safe fallback - never show broken or blank state
    if (matches.length === 0) {
      matches = GRANITE_COLLECTION.slice(0, 4).map((item, idx) => ({ ...item, originalIndex: idx }));
      matchQuality = 'fallback';
    }

    return { matches, matchQuality };
  }

  function showFinderResults() {
    const { matches, matchQuality } = filterGranites(finderState);
    finderState.results = matches;

    if (finderResultsCount) {
      finderResultsCount.textContent = `${matches.length} GRANITES MATCHED`;
    }

    if (finderResultsTitle) {
      finderResultsTitle.textContent = "Granites for You";
    }

    if (finderResultsSubtitle) {
      if (matchQuality === 'exact') {
        const appVal = finderState.application || 'all';
        const appName = appVal.charAt(0).toUpperCase() + appVal.slice(1);
        const toneName = finderState.tone.charAt(0).toUpperCase() + finderState.tone.slice(1);
        const finishName = finderState.finish.charAt(0).toUpperCase() + finderState.finish.slice(1);
        finderResultsSubtitle.textContent = `Based on your preferences (${appName} · ${toneName} · ${finishName}), here are the stones that match.`;
      } else {
        finderResultsSubtitle.textContent = "Here are some close matches based on your preferences.";
      }
    }

    if (finderResultsGrid) {
      finderResultsGrid.innerHTML = '';
      matches.forEach((item, idx) => {
        const card = document.createElement('div');
        card.className = 'finder-result-card';
        card.dataset.index = item.originalIndex;
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `View details for ${item.name} Granite`);

        const toneLabel = item.tone ? item.tone.charAt(0).toUpperCase() + item.tone.slice(1) : 'Natural';

        card.innerHTML = `
          <div class="result-card-media">
            <img src="${item.image}" alt="${item.name} Granite Slab" loading="lazy">
            <span class="result-card-badge">${item.category || 'INDIAN GRANITE'}</span>
          </div>
          <div class="result-card-body">
            <h4 class="result-card-title">${item.name}</h4>
            <p class="result-card-desc">${item.desc || item.character || ''}</p>
            <div class="result-card-specs">
              <span class="result-spec-pill">${item.finish || 'Polished'}</span>
              <span class="result-spec-pill">${toneLabel} Tone</span>
            </div>
            <div class="result-card-footer">
              <span class="result-view-details">
                <span>VIEW DETAILS</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </span>
            </div>
          </div>
        `;

        card.addEventListener('click', () => {
          openGraniteModal(item.originalIndex);
        });

        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openGraniteModal(item.originalIndex);
          }
        });

        finderResultsGrid.appendChild(card);

        // Staggered reveal (~50-60ms delay)
        setTimeout(() => {
          card.classList.add('is-visible');
        }, idx * 60);
      });
    }

    if (finderCardWrapper) {
      finderCardWrapper.classList.add('is-results-active');
    }
  }

  if (finderSubmitBtn) {
    finderSubmitBtn.addEventListener('click', () => {
      showFinderResults();
    });
  }

  if (finderChangePrefBtn) {
    finderChangePrefBtn.addEventListener('click', () => {
      if (finderCardWrapper) {
        finderCardWrapper.classList.remove('is-results-active');
      }
      if (graniteFinder) {
        graniteFinder.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // Expose finder state & methods
  window.finderState = finderState;
  window.showFinderResults = showFinderResults;

  /* ==========================================================================
     Granite Product Detail Modal & High-Resolution Lightbox System
     ========================================================================== */

  // Owner Contact & WhatsApp Number (9660222886)
  const BALAJI_WHATSAPP_NUMBER = "919660222886";
  const BALAJI_OWNER_PHONE = "9660222886";

  // Modal DOM Elements
  const modalBackdrop = document.getElementById('granite-modal-backdrop');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalMainImg = document.getElementById('modal-main-img');
  const modalZoomBtn = document.getElementById('modal-zoom-btn');
  const modalThumbnailsRow = document.getElementById('modal-thumbnails-row');
  const modalCategory = document.getElementById('modal-granite-category');
  const modalTitle = document.getElementById('modal-granite-title');
  const modalShortDesc = document.getElementById('modal-granite-short-desc');
  const modalFinish = document.getElementById('modal-granite-finish');
  const modalCharacter = document.getElementById('modal-granite-character');
  const modalOrigin = document.getElementById('modal-granite-origin');
  const modalDetailedDesc = document.getElementById('modal-granite-detailed-desc');
  const modalFeaturesRow = document.getElementById('modal-features-row');
  const modalBtnWhatsapp = document.getElementById('modal-btn-whatsapp');
  const modalBtnCall = document.getElementById('modal-btn-call') || document.getElementById('modal-btn-quote');
  const graniteInfoPanel = document.getElementById('granite-info');

  // Lightbox DOM Elements
  const textureLightbox = document.getElementById('texture-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');

  // Allow clicking on editorial info card in slider to open modal
  if (graniteInfoPanel) {
    graniteInfoPanel.style.cursor = 'pointer';
    graniteInfoPanel.setAttribute('title', 'Click to view product details');
    graniteInfoPanel.addEventListener('click', () => {
      openGraniteModal(currentGraniteIndex);
    });
  }

  // Feature Pill HTML Generator with Architectural Line Icons
  function renderFeaturePill(text, index) {
    let iconSvg = '';
    if (index === 0) {
      // Shield Icon
      iconSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
    } else if (index === 1) {
      // Stacked Layers / Diamond Icon
      iconSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`;
    } else {
      // Architectural Structure / Home Icon
      iconSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
    }
    return `<span class="modal-feature-pill">${iconSvg}<span>${text}</span></span>`;
  }

  // Open Granite Detail Modal dynamically populated for the given index
  function openGraniteModal(index) {
    const item = GRANITE_COLLECTION[index];
    if (!item) return;

    // 1. Populate Text Information
    if (modalCategory) modalCategory.textContent = item.category || 'INDIAN GRANITE';
    if (modalTitle) modalTitle.textContent = item.name;
    if (modalShortDesc) modalShortDesc.textContent = item.desc;
    if (modalFinish) modalFinish.textContent = item.finish;
    if (modalCharacter) modalCharacter.textContent = item.character;
    if (modalOrigin) modalOrigin.textContent = item.origin;
    if (modalDetailedDesc) modalDetailedDesc.textContent = item.detailedDesc || item.desc;

    // 2. Main Image Presentation
    if (modalMainImg) {
      modalMainImg.src = item.image;
      modalMainImg.alt = `${item.name} Granite Texture`;
      modalMainImg.style.transform = 'none';
      modalMainImg.style.opacity = '1';
    }

    // 3. Render Feature Pills
    if (modalFeaturesRow) {
      const features = item.features || ["Highly Durable", "Premium Appearance", "Ideal for Interiors & Exteriors"];
      modalFeaturesRow.innerHTML = features.map((f, i) => renderFeaturePill(f, i)).join('');
    }

    // 4. Render Thumbnails Row
    if (modalThumbnailsRow) {
      modalThumbnailsRow.innerHTML = '';
      const thumbs = item.thumbnails || [{ label: 'Full Slab', src: item.image }];

      thumbs.forEach((th, tIdx) => {
        const thumbBtn = document.createElement('button');
        thumbBtn.type = 'button';
        thumbBtn.className = 'modal-thumb-btn' + (tIdx === 0 ? ' is-active' : '');
        thumbBtn.setAttribute('aria-label', `${th.label || 'View ' + (tIdx + 1)}`);

        const thumbImg = document.createElement('img');
        thumbImg.src = th.src;
        thumbImg.alt = `${item.name} - ${th.label || 'Thumbnail'}`;

        if (th.isMacro) {
          thumbImg.style.transform = 'scale(2.2)';
          thumbImg.style.transformOrigin = 'center';
        }

        thumbBtn.appendChild(thumbImg);

        thumbBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (modalMainImg) {
            modalMainImg.style.opacity = '0.35';
            setTimeout(() => {
              modalMainImg.src = th.src;
              if (th.isMacro) {
                modalMainImg.style.transform = 'scale(1.4)';
              } else {
                modalMainImg.style.transform = 'none';
              }
              modalMainImg.style.opacity = '1';
            }, 120);
          }

          modalThumbnailsRow.querySelectorAll('.modal-thumb-btn').forEach(btn => btn.classList.remove('is-active'));
          thumbBtn.classList.add('is-active');
        });

        modalThumbnailsRow.appendChild(thumbBtn);
      });
    }

    // 5. Dynamic WhatsApp Message Generation
    if (modalBtnWhatsapp) {
      const waMessage = `Hello Balaji Granites, I am interested in ${item.name} granite. Please share the price, availability and details.`;
      modalBtnWhatsapp.href = `https://wa.me/${BALAJI_WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;
    }

    // 6. Dynamic Phone Call Link
    if (modalBtnCall) {
      modalBtnCall.href = `tel:+91${BALAJI_OWNER_PHONE}`;
    }

    // 7. Reveal Modal Backdrop & Float In Card
    if (modalBackdrop) {
      modalBackdrop.classList.add('is-open');
      modalBackdrop.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  // Close Granite Detail Modal
  function closeGraniteModal() {
    if (modalBackdrop) {
      modalBackdrop.classList.remove('is-open');
      modalBackdrop.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
  }

  // Expose on window
  window.openGraniteModal = openGraniteModal;
  window.closeGraniteModal = closeGraniteModal;

  // Lightbox Zoom Functions
  function openTextureLightbox(src) {
    if (lightboxImg && textureLightbox) {
      lightboxImg.src = src;
      textureLightbox.classList.add('is-open');
      textureLightbox.setAttribute('aria-hidden', 'false');
    }
  }

  function closeTextureLightbox() {
    if (textureLightbox) {
      textureLightbox.classList.remove('is-open');
      textureLightbox.setAttribute('aria-hidden', 'true');
    }
  }

  // Zoom Button Click Handler
  if (modalZoomBtn) {
    modalZoomBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (modalMainImg) {
        openTextureLightbox(modalMainImg.src);
      }
    });
  }

  // Lightbox Close Handlers
  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeTextureLightbox();
    });
  }

  if (textureLightbox) {
    textureLightbox.addEventListener('click', (e) => {
      if (e.target === textureLightbox) {
        closeTextureLightbox();
      }
    });
  }

  // Modal Close Button Handler
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeGraniteModal();
    });
  }

  // Backdrop Click Handler (dismisses when clicking outside card)
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closeGraniteModal();
      }
    });
  }

  // Keyboard Escape Handler
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (textureLightbox && textureLightbox.classList.contains('is-open')) {
        closeTextureLightbox();
      } else if (modalBackdrop && modalBackdrop.classList.contains('is-open')) {
        closeGraniteModal();
      }
    }
  });
});
