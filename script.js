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
  const videoBg = document.getElementById('cinematic-video-bg');
  const heroUi = document.getElementById('hero-ui');
  const navbarWrapper = document.getElementById('navbar');

  if (!video || !heroUi) return;

  // Reset video and UI state on initial page load / reload
  video.pause();
  try {
    video.currentTime = 0;
  } catch (e) { }

  if (videoBg) {
    videoBg.muted = true;
    videoBg.defaultMuted = true;
    videoBg.setAttribute('playsinline', '');
    videoBg.setAttribute('webkit-playsinline', '');
    videoBg.pause();
    try {
      videoBg.currentTime = 0;
    } catch (e) { }
  }

  function syncVideoBg() {
    if (!videoBg) return;
    try {
      if (Math.abs(videoBg.currentTime - video.currentTime) > 0.12) {
        videoBg.currentTime = video.currentTime;
      }
      if (video.paused && !videoBg.paused) {
        videoBg.pause();
      } else if (!video.paused && videoBg.paused) {
        videoBg.play().catch(() => {});
      }
    } catch (e) {}
  }

  heroUi.classList.remove('is-revealed');
  if (navbarWrapper) navbarWrapper.classList.remove('is-revealed');

  // Ensure mandatory autoplay attributes
  video.muted = true;
  video.defaultMuted = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');

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

    syncVideoBg();

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
      syncVideoBg();
      triggerUiReveal();
      if (rafId) cancelAnimationFrame(rafId);
      return;
    }

    rafId = requestAnimationFrame(monitorPlayback);
  }

  // Backup handlers for standard video events
  video.addEventListener('timeupdate', () => {
    syncVideoBg();
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
      syncVideoBg();
    }
  });

  video.addEventListener('ended', (e) => {
    e.preventDefault();
    hasEnded = true;
    video.pause();
    video.currentTime = Math.max(0, (video.duration || 10) - 0.15);
    syncVideoBg();
    triggerUiReveal();
    if (rafId) cancelAnimationFrame(rafId);
  });

  video.addEventListener('play', () => {
    syncVideoBg();
    if (!hasEnded) {
      rafId = requestAnimationFrame(monitorPlayback);
    }
  });

  // Safe Autoplay Initiation
  const startAutoplay = () => {
    if (videoBg) videoBg.play().catch(() => {});
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          syncVideoBg();
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
      desc: "Deep crystalline obsidian embedded with natural star-like golden bronzite flecks.",
      finish: "Mirror Polished",
      character: "Golden Bronzite Specks",
      detailedDesc: "Black Galaxy is a world-renowned Indian granite celebrated for its deep obsidian bedrock infused with reflective copper-gold bronzite flecks. Highly impervious and sculpturally dramatic, it elevates luxury kitchen islands, executive foyers, bathroom vanities, and monolithic feature walls with unmatched brilliance.",
      features: ["Highly Durable", "Premium Appearance", "Ideal for Interiors & Exteriors"],
      applications: ["kitchen", "floor", "staircase", "other"],
      tone: "dark",
      finishes: ["polished", "honed"],
      image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.24 PM.jpeg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.24 PM.jpeg" },
        { label: "Macro Grain", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.24 PM.jpeg", isMacro: true },
        { label: "Kitchen Island", src: "assets/applications/black_galaxy_countertop.jpg" },
        { label: "Villa Flooring", src: "assets/applications/black_galaxy_flooring.jpg" }
      ]
    },
    {
      id: "02",
      name: "KASHMIR WHITE",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Luminous warm alabaster canvas patterned with fine garnet clusters and subtle mica.",
      finish: "Diamond Polished",
      character: "Wine Garnet Crystals on Alabaster",
      detailedDesc: "Kashmir White presents a tranquil ivory and dove-grey ground dusted with delicate wine-colored garnet deposits. Its gentle, luminous aesthetic creates an airy, sophisticated atmosphere in open-concept residences, bespoke kitchen countertops, and light-filled architectural bath retreats.",
      features: ["Heat & Scratch Resistant", "Refined Luminescence", "Interiors & Covered Cladding"],
      applications: ["kitchen", "floor", "other"],
      tone: "light",
      finishes: ["polished", "honed"],
      image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.16 PM (2).jpeg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.16 PM (2).jpeg" },
        { label: "Macro Grain", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.16 PM (2).jpeg", isMacro: true }
      ]
    },
    {
      id: "03",
      name: "VISCOUNT WHITE",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Architectural white marble-granite characterized by dramatic sweeping graphite veining.",
      finish: "High Gloss Polished",
      character: "Sweeping Graphite Rivering",
      detailedDesc: "Viscount White combines the dramatic, fluid aesthetic of fine Calacatta marble with the superior density and stain-resistance of natural granite. Its sweeping ribbons of charcoal and slate across a frosted white canvas make it a showstopper for bookmatched waterfall counters and signature feature walls.",
      features: ["Marble Aesthetics, Granite Strength", "Bookmatch Ready", "Interiors & Facades"],
      applications: ["kitchen", "floor", "staircase", "other"],
      tone: "light",
      finishes: ["polished", "honed"],
      image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.16 PM.jpeg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.16 PM.jpeg" },
        { label: "Macro Grain", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.16 PM.jpeg", isMacro: true }
      ]
    },
    {
      id: "04",
      name: "TAN BROWN",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Rich dark chocolate matrix enriched with cognac-toned feldspar crystals.",
      finish: "Mirror Polished",
      character: "Cognac & Espresso Crystalline Matrix",
      detailedDesc: "Tan Brown showcases an intricate crystalline arrangement of warm burnt umber, chocolate, and copper-tinted feldspar grains embedded in a dark mineral base. Exceptionally durable and low-maintenance, it is favored for high-traffic luxury flooring, hospitality bars, and robust outdoor culinary spaces.",
      features: ["High Compressive Strength", "Deep Warm Tones", "Ideal for Heavy Traffic"],
      applications: ["kitchen", "floor", "staircase"],
      tone: "warm",
      finishes: ["polished", "honed"],
      image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.18 PM (1).jpeg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.18 PM (1).jpeg" },
        { label: "Macro Grain", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.18 PM (1).jpeg", isMacro: true }
      ]
    },
    {
      id: "05",
      name: "STEEL GREY",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Monolithic medium-charcoal granite featuring shimmering silver facets and uniform grain.",
      finish: "Honed & Polished",
      character: "Silver Pearlescence on Charcoal",
      detailedDesc: "Steel Grey delivers a poised, contemporary architectural foundation with uniform gunmetal and charcoal hues enriched by subtle silvery mica inclusions. Its restrained, understated color palette effortlessly harmonizes with minimalist cabinetry, brushed brass, and modern urban stone architecture.",
      features: ["Uniform Grain Structure", "Low Porosity", "Interiors & Exterior Paving"],
      applications: ["kitchen", "floor", "staircase", "other"],
      tone: "dark",
      finishes: ["polished", "honed"],
      image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.18 PM (2).jpeg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.18 PM (2).jpeg" },
        { label: "Macro Grain", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.18 PM (2).jpeg", isMacro: true }
      ]
    },
    {
      id: "06",
      name: "RUBY RED",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Intense crimson stone offering striking architectural warmth and diamond durability.",
      finish: "High Gloss Polished",
      character: "Vibrant Jewel Crimson with Dark Minerals",
      detailedDesc: "Celebrated as one of the hardest natural granites quarried, Ruby Red boasts a vibrant ruby-crimson ground interwoven with charcoal and quartz flecks. Its commanding presence brings regal distinction to grand building portals, civic monuments, stately flooring, and executive counters.",
      features: ["Extreme Hardness & Density", "Color Stability", "High Traffic & Exteriors"],
      applications: ["floor", "staircase", "other"],
      tone: "warm",
      finishes: ["polished"],
      image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.19 PM (1).jpeg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.19 PM (1).jpeg" },
        { label: "Macro Grain", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.19 PM (1).jpeg", isMacro: true }
      ]
    },
    {
      id: "07",
      name: "EMERALD GREEN",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Majestic deep serpentine green stone crisscrossed by fine crystalline calcite fissures.",
      finish: "Mirror Polished",
      character: "Forest Serpentine with Calcite Veins",
      detailedDesc: "Emerald Green evokes lush botanical depths with its deep jade and bottle-green body adorned with delicate white and mint mineral veining. An opulent choice for statement vanity tops, bespoke bar islands, and jewel-box powder rooms seeking dramatic biophilic luxury.",
      features: ["Rich Natural Luster", "Distinctive Mineral Veining", "Luxury Interior Living"],
      applications: ["kitchen", "other"],
      tone: "warm",
      finishes: ["polished"],
      image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.19 PM (2).jpeg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.19 PM (2).jpeg" },
        { label: "Macro Grain", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.19 PM (2).jpeg", isMacro: true }
      ]
    },
    {
      id: "08",
      name: "DESERT GOLD",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Warm honey and sand hues cascading in delicate undulating geological ribbons.",
      finish: "Diamond Polished",
      character: "Golden Dunes & Ivory Flowing Grain",
      detailedDesc: "Desert Gold captures the sun-drenched tranquility of rolling golden sand dunes, blending warm ocher, amber, and cream crystalline bands. Its welcoming, sun-kissed warmth enhances Mediterranean-style villas, warm modern kitchen islands, and luminous exterior poolside terraces.",
      features: ["Warm Natural Undertone", "Weather Resistant", "Interiors, Pools & Patios"],
      applications: ["kitchen", "floor", "other"],
      tone: "warm",
      finishes: ["polished"],
      image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.17 PM.jpeg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.17 PM.jpeg" },
        { label: "Macro Grain", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.17 PM.jpeg", isMacro: true }
      ]
    },
    {
      id: "09",
      name: "RED MULTICOLOR",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Interlaced crimson ribbons and charcoal quartz creating expressive movement.",
      finish: "High Gloss Polished",
      character: "Banded Terracotta and Charcoal Waves",
      detailedDesc: "Featuring expressive ribbons of terracotta, rust red, and deep charcoal banding, Red Multicolor is an inherently dynamic natural stone. Each slab exhibits unique wavy metamorphic strata, making it an artistic focal point for large-format reception desks, stair treads, and fireplace surrounds.",
      features: ["Expressive Geological Flow", "Stain & Acid Resistant", "Architectural Statement Walls"],
      applications: ["floor", "staircase", "other"],
      tone: "warm",
      finishes: ["polished"],
      image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.16 PM (1).jpeg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.16 PM (1).jpeg" },
        { label: "Macro Grain", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.16 PM (1).jpeg", isMacro: true }
      ]
    },
    {
      id: "10",
      name: "MOON WHITE",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Soft snowy white ground complemented by smoky silver ripples and micro-garnets.",
      finish: "Mirror Polished",
      character: "Silvery Fog on Snowy Feldspar Matrix",
      detailedDesc: "Moon White is celebrated for its finely distributed, serene composition of cool white quartz, delicate ivory feldspar, and tiny garnet flecks. Its clean, bright countenance makes spaces feel open and illuminated, serving as the gold standard for bright transitional and contemporary kitchens.",
      features: ["Luminous Ambient Light", "Uniform Micro-Structure", "Kitchens, Baths & Flooring"],
      applications: ["kitchen", "floor", "other"],
      tone: "light",
      finishes: ["polished", "honed"],
      image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.18 PM.jpeg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.18 PM.jpeg" },
        { label: "Macro Grain", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.18 PM.jpeg", isMacro: true }
      ]
    },
    {
      id: "11",
      name: "LAKHA RED",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Dense, homogeneous vermilion granite prized for its rich, unwavering hue.",
      finish: "Diamond Polished",
      character: "Uniform Vermilion & Deep Coral Grains",
      detailedDesc: "Quarried in Rajasthan, Lakha Red provides a rich, saturated red hue characterized by a dense micro-crystalline texture. Its exceptional structural resilience against UV exposure and weathering makes it a favored choice for landmark facades, commercial entrances, and resilient kitchen counters.",
      features: ["UV & Fade Resistant", "Heavy Duty Load Bearing", "Exteriors, Portals & Steps"],
      applications: ["floor", "staircase", "other"],
      tone: "warm",
      finishes: ["polished"],
      image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.19 PM.jpeg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.19 PM.jpeg" },
        { label: "Macro Grain", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.19 PM.jpeg", isMacro: true }
      ]
    },
    {
      id: "12",
      name: "ROSY PINK",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Subtle blush crystalline composition featuring balanced grey and quartz flecks.",
      finish: "High Gloss Polished",
      character: "Pale Coral Blush with Quartz Interlock",
      detailedDesc: "Rosy Pink offers a gentle pastel blush background delicately balanced with grey and white crystalline aggregates. Soft yet durable, this stone lends warmth and approachability to large residential flooring areas, garden stairways, and heritage architectural restorations.",
      features: ["Gentle Pastel Tone", "High Thermal Resistance", "Flooring, Patios & Facades"],
      applications: ["floor", "staircase", "other"],
      tone: "warm",
      finishes: ["polished"],
      image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.17 PM (1).jpeg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.17 PM (1).jpeg" },
        { label: "Macro Grain", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.17 PM (1).jpeg", isMacro: true }
      ]
    },
    {
      id: "13",
      name: "BLUE PEARL",
      category: "IMPORTED GRANITE",
      origin: "Premium Granite",
      desc: "Iconic metallic blue stone reflecting pearlescent light from volcanic feldspar crystals.",
      finish: "Mirror Polished",
      character: "Pearlescent Steel Blue Mica Luster",
      detailedDesc: "Renowned worldwide for its mesmerizing optical brilliance, Blue Pearl contains iridescent blue and silver feldspar schillers that dance with incoming light. An ultra-luxury stone that imparts undeniable glamor to high-end bathroom suites, bar countertops, and architectural focal elements.",
      features: ["Iridescent Optical Crystals", "Zero Water Absorption", "Ultra-Luxury Countertops"],
      applications: ["kitchen", "other"],
      tone: "dark",
      finishes: ["polished"],
      image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.20 PM.jpeg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.20 PM.jpeg" },
        { label: "Macro Grain", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.20 PM.jpeg", isMacro: true }
      ]
    },
    {
      id: "14",
      name: "MAHOGANY WAVE",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Warm russet and deep espresso strata woven in sweeping architectural currents.",
      finish: "High Gloss Polished",
      character: "Auburn Geological Ribboning",
      detailedDesc: "Mahogany Wave is defined by sweeping fluid waves of deep espresso, walnut, and warm auburn. Its organic geological flow lends warmth and timeless earthy character, serving as an ideal medium for custom dining tables, executive conference surfaces, and grand fireplace hearths.",
      features: ["Rich Earthy Tone", "Natural Fluid Motion", "Dining Surfaces & Cladding"],
      applications: ["kitchen", "other"],
      tone: "warm",
      finishes: ["polished"],
      image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.20 PM (1).jpeg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.20 PM (1).jpeg" },
        { label: "Macro Grain", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.20 PM (1).jpeg", isMacro: true }
      ]
    },
    {
      id: "15",
      name: "JHANSI RED",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Monumental carmine red stone celebrated for timeless heritage durability.",
      finish: "Mirror Polished",
      character: "Bold Crimson Feldspar Aggregates",
      detailedDesc: "Quarried from legendary geological formations in Central India, Jhansi Red has built an enduring legacy of strength. Featuring robust carmine-red feldspar aggregates laced with smoky quartz, it withstands decades of extreme climatic exposure without losing its majestic luster.",
      features: ["Century-Proven Strength", "Extreme Weather Proof", "Heritage Facades & Monoliths"],
      applications: ["floor", "staircase", "other"],
      tone: "warm",
      finishes: ["polished"],
      image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.21 PM (1).jpeg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.21 PM (1).jpeg" },
        { label: "Macro Grain", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.21 PM (1).jpeg", isMacro: true }
      ]
    },
    {
      id: "16",
      name: "ABSOLUTE BLACK",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Pure, deep obsidian black granite offering ultra-refined minimalism.",
      finish: "Mirror Polished",
      character: "Monolithic Jet Black Density",
      detailedDesc: "Absolute Black represents the pinnacle of pure, unbroken dark stone luxury. Its dense basaltic composition yields a deep, void-like black surface that reflects mirror-sharp highlights. The quintessential stone for modern architectural minimalism, luxury worktops, and sleek monuments.",
      features: ["Near-Zero Porosity", "Mirror-Grade Reflection", "Kitchens, Spas & Modern Facades"],
      applications: ["kitchen", "floor", "staircase", "other"],
      tone: "dark",
      finishes: ["polished", "honed"],
      image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.21 PM.jpeg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.21 PM.jpeg" },
        { label: "Macro Grain", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.21 PM.jpeg", isMacro: true }
      ]
    },
    {
      id: "17",
      name: "BLACK FOREST",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Dramatic obsidian bedrock punctuated by ethereal silver and alabaster rivering.",
      finish: "Diamond Polished",
      character: "Organic Alabaster Veining on Deep Dark",
      detailedDesc: "Black Forest presents an intense ebony background traversed by sweeping, organic veins of crystalline white and silver. Reminiscent of misty winter canopies, its high-contrast aesthetic makes it an extraordinary choice for dramatic bookmatched island slabs, bar fronts, and shower walls.",
      features: ["Dramatic High Contrast", "Marble-Style Swirls", "Statement Islands & Cladding"],
      applications: ["kitchen", "staircase", "other"],
      tone: "dark",
      finishes: ["polished", "honed"],
      image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.22 PM (1).jpeg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.22 PM (1).jpeg" },
        { label: "Macro Grain", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.22 PM (1).jpeg", isMacro: true }
      ]
    },
    {
      id: "18",
      name: "PARADISO CLASSIQUE",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Nuanced swirls of soft lavender, violet-grey, and smoky feldspar waves.",
      finish: "High Gloss Polished",
      character: "Swirling Lavender & Charcoal Bands",
      detailedDesc: "A rare and poetic natural creation, Paradiso Classique exhibits a mesmerizing swirl of soft violet, lilac-grey, and misty charcoal. Its serene, chromatic sophistication lends tranquil beauty to master baths, sculptural stairways, and distinctive luxury living room floors.",
      features: ["Rare Violet-Grey Chromatics", "Smooth Flow Pattern", "Flooring, Vanities & Steps"],
      applications: ["floor", "staircase", "other"],
      tone: "warm",
      finishes: ["polished"],
      image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.22 PM.jpeg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.22 PM.jpeg" },
        { label: "Macro Grain", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.22 PM.jpeg", isMacro: true }
      ]
    },
    {
      id: "19",
      name: "BALTIC BROWN",
      category: "PREMIUM GRANITE",
      origin: "Premium Granite",
      desc: "Sculptural circular orbicular brown crystals embedded in a dense granite matrix.",
      finish: "Mirror Polished",
      character: "Orbicular Feldspar Rosettes in Charcoal",
      detailedDesc: "Baltic Brown is celebrated for its unique geological formation characterized by large circular 'rapakivi' rosettes of rich brown and tan feldspar ringed with green-black minerals. Its distinctive sculptural texture delivers bold, tactile richness to traditional and rustic-modern spaces.",
      features: ["Distinctive Rosette Grains", "High Resistance to Stains", "Kitchen Islands & Bar Tops"],
      applications: ["kitchen", "floor", "other"],
      tone: "dark",
      finishes: ["polished"],
      image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.23 PM (1).jpeg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.23 PM (1).jpeg" },
        { label: "Macro Grain", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.23 PM (1).jpeg", isMacro: true }
      ]
    },
    {
      id: "20",
      name: "CHIMA PINK",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Soft rose-toned fine-grained granite delivering subtle warmth to modern interiors.",
      finish: "High Gloss Polished",
      character: "Soft Rose Quartz Granulation",
      detailedDesc: "Chima Pink features a uniform, soft coral-pink body composed of tightly interlocked quartz and microcline crystals. Renowned for its consistency across expansive areas, it provides gentle warmth and timeless durability to residential terraces, commercial corridors, and architectural facades.",
      features: ["Uniform Color Consistency", "Frost & Slip Resistant Options", "Large Format Flooring & Cladding"],
      applications: ["floor", "staircase", "other"],
      tone: "warm",
      finishes: ["polished"],
      image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.23 PM (2).jpeg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.23 PM (2).jpeg" },
        { label: "Macro Grain", src: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.23 PM (2).jpeg", isMacro: true }
      ]
    },
    {
      id: "21",
      name: "TITANIUM BLACK",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Dramatic dark obsidian base highlighted with flowing silver and gold quartz veins.",
      finish: "Mirror Polished",
      character: "Luminous Silver & Gold Waves",
      detailedDesc: "Titanium Black features a rich dark charcoal bedrock laced with expressive silver-white and golden quartz movement. Its high-contrast crystalline pattern makes it a stunning choice for luxury kitchen counters, statement waterfall islands, and modern feature walls.",
      features: ["High Durability", "Dramatic Veining", "Ideal for Kitchens & Walls"],
      applications: ["kitchen", "floor", "other"],
      tone: "dark",
      finishes: ["polished", "honed"],
      image: "Granite Images/new granite images/11184401-13b0-455d-827a-25ec11280813.jpg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/new granite images/11184401-13b0-455d-827a-25ec11280813.jpg" },
        { label: "Macro Grain", src: "Granite Images/new granite images/11184401-13b0-455d-827a-25ec11280813.jpg", isMacro: true }
      ]
    },
    {
      id: "22",
      name: "ALASKA WHITE",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Frosty white background interspersed with cool grey quartz and dark mineral accents.",
      finish: "Diamond Polished",
      character: "Crystalline Frost Matrix",
      detailedDesc: "Alaska White blends icy ivory tones with rich graphite and feldspar deposits. Loved for its bright and versatile aesthetic, it enhances natural lighting in residential kitchens, bathroom vanities, and expansive floor layouts.",
      features: ["Luminous Finish", "Stain Resistant", "Interiors & Countertops"],
      applications: ["kitchen", "floor", "other"],
      tone: "light",
      finishes: ["polished", "honed"],
      image: "Granite Images/new granite images/20f680fd-d983-4a71-a2e6-6b5edc3cb12c.jpg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/new granite images/20f680fd-d983-4a71-a2e6-6b5edc3cb12c.jpg" },
        { label: "Macro Grain", src: "Granite Images/new granite images/20f680fd-d983-4a71-a2e6-6b5edc3cb12c.jpg", isMacro: true }
      ]
    },
    {
      id: "23",
      name: "COLONIAL GOLD",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Warm honey cream canvas enriched with subtle amber and burgundy mineral flecks.",
      finish: "High Gloss Polished",
      character: "Warm Golden Amber Texture",
      detailedDesc: "Colonial Gold offers a welcoming palette of creamy gold, pale taupe, and deep garnet specks. Perfect for bringing understated warmth to traditional or transitional spaces, island countertops, and grand foyer flooring.",
      features: ["Warm Color Palette", "Consistent Grains", "Kitchen & Flooring"],
      applications: ["kitchen", "floor", "staircase"],
      tone: "warm",
      finishes: ["polished"],
      image: "Granite Images/new granite images/2283f8d4-ffa9-4a58-a73c-2238852b7c35.jpg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/new granite images/2283f8d4-ffa9-4a58-a73c-2238852b7c35.jpg" },
        { label: "Macro Grain", src: "Granite Images/new granite images/2283f8d4-ffa9-4a58-a73c-2238852b7c35.jpg", isMacro: true }
      ]
    },
    {
      id: "24",
      name: "ASTORIA WHITE",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Soft alabaster stone featuring fine charcoal veining and pearlescent mica.",
      finish: "Mirror Polished",
      character: "Fine Slate Veining on Ivory",
      detailedDesc: "Astoria White displays delicate streams of slate grey and chocolate across a serene off-white backdrop. Its smooth aesthetic and high density make it ideal for sleek contemporary surfaces and low-maintenance kitchen worktops.",
      features: ["Refined Appearance", "Scratch Resistant", "Countertops & Flooring"],
      applications: ["kitchen", "floor", "other"],
      tone: "light",
      finishes: ["polished", "honed"],
      image: "Granite Images/new granite images/24b83827-17a1-4d9c-aaaf-bf882c77611e.jpg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/new granite images/24b83827-17a1-4d9c-aaaf-bf882c77611e.jpg" },
        { label: "Macro Grain", src: "Granite Images/new granite images/24b83827-17a1-4d9c-aaaf-bf882c77611e.jpg", isMacro: true }
      ]
    },
    {
      id: "25",
      name: "HIMALAYAN BLUE",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Deep steel blue matrix accented by rust-orange and grey metamorphic waves.",
      finish: "High Gloss Polished",
      character: "Swirling Mineral Waves",
      detailedDesc: "Himalayan Blue exhibits a captivating blend of cool blue-grey bedrock and warm reddish mineral bands. Known for extreme weather resistance and dynamic movement, it shines in exterior cladding, stair treads, and main foyers.",
      features: ["Weather Resistant", "Dynamic Flow Pattern", "Flooring & Facades"],
      applications: ["floor", "staircase", "other"],
      tone: "dark",
      finishes: ["polished"],
      image: "Granite Images/new granite images/394ca5b1-6819-44cb-84e7-aff7486acd87.jpg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/new granite images/394ca5b1-6819-44cb-84e7-aff7486acd87.jpg" },
        { label: "Macro Grain", src: "Granite Images/new granite images/394ca5b1-6819-44cb-84e7-aff7486acd87.jpg", isMacro: true }
      ]
    },
    {
      id: "26",
      name: "CRYSTAL YELLOW",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Vibrant golden-yellow granite studded with reflective quartz crystals.",
      finish: "Diamond Polished",
      character: "Golden Crystalline Sparkle",
      detailedDesc: "Crystal Yellow brings cheerful energy and rich golden texture to both residential and commercial spaces. Its dense, crystalline composition resists fading and scratching, making it a reliable option for high-traffic walkways and steps.",
      features: ["Vibrant Tone", "Heavy Duty Load Bearing", "Patios & Staircases"],
      applications: ["floor", "staircase", "other"],
      tone: "warm",
      finishes: ["polished"],
      image: "Granite Images/new granite images/3fad6ce4-9b51-4517-a3c8-835ed8f787b0.jpg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/new granite images/3fad6ce4-9b51-4517-a3c8-835ed8f787b0.jpg" },
        { label: "Macro Grain", src: "Granite Images/new granite images/3fad6ce4-9b51-4517-a3c8-835ed8f787b0.jpg", isMacro: true }
      ]
    },
    {
      id: "27",
      name: "BLACK PEARL",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Midnight black bedrock dotted with subtle silver, gold, and green micro-specks.",
      finish: "Mirror Polished",
      character: "Iridescent Metallic Specks",
      detailedDesc: "Black Pearl provides a dense, sophisticated black ground enriched with subtle mineral shimmer. Highly versatile and low-maintenance, it is an enduring favorite for polished kitchen counters, sleek vanity surfaces, and modern floor tiles.",
      features: ["Low Maintenance", "Refined Metallic Shimmer", "Kitchens & Bathrooms"],
      applications: ["kitchen", "floor", "staircase", "other"],
      tone: "dark",
      finishes: ["polished", "honed"],
      image: "Granite Images/new granite images/51eeaa9c-62d5-4287-8da2-350998d1be15.jpg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/new granite images/51eeaa9c-62d5-4287-8da2-350998d1be15.jpg" },
        { label: "Macro Grain", src: "Granite Images/new granite images/51eeaa9c-62d5-4287-8da2-350998d1be15.jpg", isMacro: true }
      ]
    },
    {
      id: "28",
      name: "PATAGONIA GOLD",
      category: "PREMIUM GRANITE",
      origin: "Premium Granite",
      desc: "Exotic stone featuring translucent quartz clusters and warm earthy banding.",
      finish: "Mirror Polished",
      character: "Translucent Quartz Breccia",
      detailedDesc: "Patagonia Gold is an extraordinary natural stone combining translucent quartz fragments, warm amber feldspar, and dark basalt pockets. A statement masterpiece for feature walls, illuminated bar tops, and luxury island counters.",
      features: ["Exotic Aesthetic", "High Specular Luster", "Luxury Statement Walls"],
      applications: ["kitchen", "other"],
      tone: "warm",
      finishes: ["polished"],
      image: "Granite Images/new granite images/53143084-62e0-458a-86d7-00cabdd7b33b.jpg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/new granite images/53143084-62e0-458a-86d7-00cabdd7b33b.jpg" },
        { label: "Macro Grain", src: "Granite Images/new granite images/53143084-62e0-458a-86d7-00cabdd7b33b.jpg", isMacro: true }
      ]
    },
    {
      id: "29",
      name: "SILVER WAVE",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Dramatic black stone defined by sweeping horizontal bands of silver and white.",
      finish: "High Gloss Polished",
      character: "Parallel Silver Flow",
      detailedDesc: "Silver Wave offers a striking monochrome palette with sweeping linear movement. Its architectural contrast makes it a popular choice for bookmatched feature walls, reception desks, and modern bathroom enclosures.",
      features: ["Striking Monochrome", "Linear Movement", "Walls & Waterfall Slabs"],
      applications: ["kitchen", "staircase", "other"],
      tone: "dark",
      finishes: ["polished", "honed"],
      image: "Granite Images/new granite images/56fc91f1-de8d-49ce-ab40-0037848188d3.jpg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/new granite images/56fc91f1-de8d-49ce-ab40-0037848188d3.jpg" },
        { label: "Macro Grain", src: "Granite Images/new granite images/56fc91f1-de8d-49ce-ab40-0037848188d3.jpg", isMacro: true }
      ]
    },
    {
      id: "30",
      name: "COSMIC BLACK",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Deep obsidian canvas swirling with streaks of gold, copper, and silver quartz.",
      finish: "Mirror Polished",
      character: "Celestial Metallic Currents",
      detailedDesc: "Cosmic Black captures celestial grandeur with its dark background and dramatic ribbons of warm gold and white crystals. Exceptionally hard and stain-resistant, it elevates island countertops and luxury dining surfaces.",
      features: ["Celestial Aesthetics", "Thermal Stability", "Kitchen Slabs & Bar Tops"],
      applications: ["kitchen", "floor", "other"],
      tone: "dark",
      finishes: ["polished"],
      image: "Granite Images/new granite images/669fe13e-0b3b-4428-96f8-a9ccc33dc99e.jpg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/new granite images/669fe13e-0b3b-4428-96f8-a9ccc33dc99e.jpg" },
        { label: "Macro Grain", src: "Granite Images/new granite images/669fe13e-0b3b-4428-96f8-a9ccc33dc99e.jpg", isMacro: true }
      ]
    },
    {
      id: "31",
      name: "BIANCO ANTICO",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Luminous white feldspar background studded with brown taupe deposits and quartz.",
      finish: "Diamond Polished",
      character: "Taupe & Quartz Clusters on White",
      detailedDesc: "Bianco Antico is a classic light granite featuring warm taupe and burgundy mineral inclusions floating within a soft white quartz field. It offers timeless elegance for light-filled kitchens and spacious residential interiors.",
      features: ["Luminous & Warm", "Scratch Resistant", "Kitchens & Bathrooms"],
      applications: ["kitchen", "floor", "other"],
      tone: "light",
      finishes: ["polished", "honed"],
      image: "Granite Images/new granite images/7b037bc1-312d-47d7-97fb-b775c7f2d2ec.jpg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/new granite images/7b037bc1-312d-47d7-97fb-b775c7f2d2ec.jpg" },
        { label: "Macro Grain", src: "Granite Images/new granite images/7b037bc1-312d-47d7-97fb-b775c7f2d2ec.jpg", isMacro: true }
      ]
    },
    {
      id: "32",
      name: "COPPER SILK",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Rich espresso and copper-bronze ribbons flowing smoothly across dense granite matrix.",
      finish: "High Gloss Polished",
      character: "Silken Auburn Waves",
      detailedDesc: "Copper Silk presents an organic blend of deep chocolate, bronze, and copper-toned strata. Its warm, flowing character creates a cozy yet opulent mood in dining rooms, fireplace surrounds, and commercial lobbies.",
      features: ["Rich Earth Tones", "Smooth Vein Flow", "Flooring & Dining Tops"],
      applications: ["floor", "staircase", "other"],
      tone: "warm",
      finishes: ["polished"],
      image: "Granite Images/new granite images/8e2bd52f-8831-45f3-bb78-c41f263f5e33.jpg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/new granite images/8e2bd52f-8831-45f3-bb78-c41f263f5e33.jpg" },
        { label: "Macro Grain", src: "Granite Images/new granite images/8e2bd52f-8831-45f3-bb78-c41f263f5e33.jpg", isMacro: true }
      ]
    },
    {
      id: "33",
      name: "VERDE UNIK",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Deep emerald green body woven with sage and crystalline white mineral veins.",
      finish: "Mirror Polished",
      character: "Botanical Forest Veining",
      detailedDesc: "Verde Unik captures organic biophilic beauty with its deep forest green shade and subtle mint veining. Ideal for creating memorable vanity tops, custom bar counters, and decorative interior focal points.",
      features: ["Biophilic Elegance", "High Luster", "Luxury Countertops & Features"],
      applications: ["kitchen", "other"],
      tone: "warm",
      finishes: ["polished"],
      image: "Granite Images/new granite images/9e01b390-9d4b-4d95-8110-71e81150d2a0.jpg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/new granite images/9e01b390-9d4b-4d95-8110-71e81150d2a0.jpg" },
        { label: "Macro Grain", src: "Granite Images/new granite images/9e01b390-9d4b-4d95-8110-71e81150d2a0.jpg", isMacro: true }
      ]
    },
    {
      id: "34",
      name: "MUSHROOM BROWN",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Subtle taupe-brown stone featuring uniform micro-crystalline feldspar grains.",
      finish: "Honed & Polished",
      character: "Uniform Warm Taupe Texture",
      detailedDesc: "Mushroom Brown provides a balanced neutral background with soft brown and warm grey tones. Its consistent pattern and easy maintenance suit large floorings, corridor steps, and modern kitchen countertops.",
      features: ["Consistent Grain", "Neutral Tone", "Flooring & Steps"],
      applications: ["kitchen", "floor", "staircase"],
      tone: "warm",
      finishes: ["polished", "honed"],
      image: "Granite Images/new granite images/b1e786d4-d447-4fa4-99f5-04a5fdfbebdb.jpg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/new granite images/b1e786d4-d447-4fa4-99f5-04a5fdfbebdb.jpg" },
        { label: "Macro Grain", src: "Granite Images/new granite images/b1e786d4-d447-4fa4-99f5-04a5fdfbebdb.jpg", isMacro: true }
      ]
    },
    {
      id: "35",
      name: "ICE BLUE",
      category: "PREMIUM GRANITE",
      origin: "Premium Granite",
      desc: "Cool translucent icy blue quartz interspersed with charcoal metamorphic bands.",
      finish: "Mirror Polished",
      character: "Glacial Quartz Formations",
      detailedDesc: "Ice Blue is a rare gem among natural granites, displaying translucent icy quartz layers interwoven with dark slate veining. Highly prized for executive boardrooms, island waterfalls, and spa retreats.",
      features: ["Rare Glacial Hues", "High Specular Luster", "Executive Slabs & Vanities"],
      applications: ["kitchen", "other"],
      tone: "light",
      finishes: ["polished"],
      image: "Granite Images/new granite images/b715623e-5728-4582-af3a-e05d7d5faac1.jpg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/new granite images/b715623e-5728-4582-af3a-e05d7d5faac1.jpg" },
        { label: "Macro Grain", src: "Granite Images/new granite images/b715623e-5728-4582-af3a-e05d7d5faac1.jpg", isMacro: true }
      ]
    },
    {
      id: "36",
      name: "NEBULA BLACK",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Dark void bedrock illuminated by fine golden mica dust and silver crystalline flecks.",
      finish: "Diamond Polished",
      character: "Fine Golden Mica Dust",
      detailedDesc: "Nebula Black features a jet-black surface dusted with fine metallic mica particles that catch light like distant stars. Ideal for sleek contemporary kitchens, bathroom vanity tops, and luxury floor accents.",
      features: ["Refined Metallic Flecks", "High Hardness", "Kitchen & Floor Slabs"],
      applications: ["kitchen", "floor", "staircase", "other"],
      tone: "dark",
      finishes: ["polished"],
      image: "Granite Images/new granite images/c83126bd-077a-4658-ae0c-102eed8cd723.jpg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/new granite images/c83126bd-077a-4658-ae0c-102eed8cd723.jpg" },
        { label: "Macro Grain", src: "Granite Images/new granite images/c83126bd-077a-4658-ae0c-102eed8cd723.jpg", isMacro: true }
      ]
    },
    {
      id: "37",
      name: "SOLARIS GOLD",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Radiant golden ocher matrix with rich chocolate and rust-colored mineral veins.",
      finish: "High Gloss Polished",
      character: "Radiant Golden Quartz Flow",
      detailedDesc: "Solaris Gold brings sunlit brightness with dynamic waves of amber, honey, and dark garnet. Highly durable and stain resistant, it shines on kitchen waterfall countertops and villa flooring.",
      features: ["Sunlit Warmth", "Stain & Heat Resistant", "Kitchen Islands & Flooring"],
      applications: ["kitchen", "floor", "other"],
      tone: "warm",
      finishes: ["polished"],
      image: "Granite Images/new granite images/cc40ba81-7f62-4ef7-b2a0-cbb4c8eb4350.jpg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/new granite images/cc40ba81-7f62-4ef7-b2a0-cbb4c8eb4350.jpg" },
        { label: "Macro Grain", src: "Granite Images/new granite images/cc40ba81-7f62-4ef7-b2a0-cbb4c8eb4350.jpg", isMacro: true }
      ]
    },
    {
      id: "38",
      name: "MONTE CARLO",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Elegant silver-grey background interlaced with charcoal rivers and white quartz.",
      finish: "Mirror Polished",
      character: "Charcoal Rivers on Silver",
      detailedDesc: "Monte Carlo delivers modern sophistication with fluid charcoal and platinum grey veining on a bright quartz canvas. An excellent choice for bookmatched accent walls and contemporary kitchen islands.",
      features: ["Architectural Contrast", "Smooth Texture", "Countertops & Facades"],
      applications: ["kitchen", "floor", "other"],
      tone: "light",
      finishes: ["polished", "honed"],
      image: "Granite Images/new granite images/d6fbba9d-f629-4204-babe-06aad7bd3950.jpg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/new granite images/d6fbba9d-f629-4204-babe-06aad7bd3950.jpg" },
        { label: "Macro Grain", src: "Granite Images/new granite images/d6fbba9d-f629-4204-babe-06aad7bd3950.jpg", isMacro: true }
      ]
    },
    {
      id: "39",
      name: "IMPERIAL RED",
      category: "INDIAN GRANITE",
      origin: "Indian Granite",
      desc: "Deep regal crimson granite with dense dark mineral interlocking matrix.",
      finish: "Diamond Polished",
      character: "Rich Regal Vermilion Matrix",
      detailedDesc: "Imperial Red is prized for its intense crimson hue and structural resilience. Popular for grand building entrances, staircases, civic monuments, and durable kitchen work surfaces.",
      features: ["Regal Color Stability", "Extreme Density", "Portals, Steps & Counters"],
      applications: ["floor", "staircase", "other"],
      tone: "warm",
      finishes: ["polished"],
      image: "Granite Images/new granite images/dc94342c-2a1e-440d-a60a-5e044764e859.jpg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/new granite images/dc94342c-2a1e-440d-a60a-5e044764e859.jpg" },
        { label: "Macro Grain", src: "Granite Images/new granite images/dc94342c-2a1e-440d-a60a-5e044764e859.jpg", isMacro: true }
      ]
    },
    {
      id: "40",
      name: "AMAZONITE LUX",
      category: "PREMIUM GRANITE",
      origin: "Premium Granite",
      desc: "Exotic turquoise-green granite with golden amber fissures and white quartz.",
      finish: "Mirror Polished",
      character: "Turquoise Jade & Amber Fissures",
      detailedDesc: "Amazonite Lux presents a breathtaking turquoise and mint green ground woven with warm golden veins. A rare, ultra-luxury stone that creates unforgettable powder room vanities, statement bar tops, and artwork slabs.",
      features: ["Rare Turquoise Tone", "Mirror Reflection", "Luxury Feature Slabs"],
      applications: ["kitchen", "other"],
      tone: "warm",
      finishes: ["polished"],
      image: "Granite Images/new granite images/dd88a3e5-1fec-4286-9558-55f7203c0bd7.jpg",
      thumbnails: [
        { label: "Full Slab", src: "Granite Images/new granite images/dd88a3e5-1fec-4286-9558-55f7203c0bd7.jpg" },
        { label: "Macro Grain", src: "Granite Images/new granite images/dd88a3e5-1fec-4286-9558-55f7203c0bd7.jpg", isMacro: true }
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
      finish: "Matte Velvet",
      desc: "Deep moody graphite with subtle white crystalline mineral fissures."
    },
    {
      id: "crema-marfil",
      name: "Crema Marfil Classic",
      category: "WARM NEUTRAL TILES",
      image: "assets/tiles/crema_marfil.jpg",
      size: "1200 x 1800 mm",
      finish: "Soft Sheen",
      desc: "Gentle creamy beige base with feather-soft cinnamon and ivory veining."
    },
    {
      id: "calacatta-gold",
      name: "Calacatta Gold Porcelain",
      category: "LUXURY SLAB TILES",
      image: "assets/tiles/calacatta_gold.jpg",
      size: "1200 x 2400 mm",
      finish: "High Gloss Glazed",
      desc: "Sublime Italian marble aesthetics with warm golden veining and crystal white clarity."
    },
    {
      id: "silver-river",
      name: "Silver River Polished",
      category: "CONTEMPORARY TILES",
      image: "assets/tiles/silver_river.jpg",
      size: "1200 x 1800 mm",
      finish: "Silk Polish",
      desc: "Harmonious smoky grey veining cascading across an architectural limestone tone."
    },
    {
      id: "sand-travertine",
      name: "Navona Sand Travertine",
      category: "NATURAL STONE TILES",
      image: "assets/tiles/sand_travertine.jpg",
      size: "800 x 1600 mm",
      finish: "Satin Honed",
      desc: "Earthy warmth and linear porous textures inspired by classical Roman architecture."
    },
    {
      id: "portoro-gold",
      name: "Nero Portoro Royale",
      category: "EXOTIC LUXE SLABS",
      image: "assets/tiles/portoro_gold.jpg",
      size: "1200 x 2400 mm",
      finish: "Mirror Polish",
      desc: "Dramatic obsidian black canvas shot with deep molten gold and amber lightning veins."
    },
    {
      id: "arabescato-white",
      name: "Arabescato Corchia",
      category: "ARCHITECTURAL SLABS",
      image: "assets/tiles/arabescato_white.jpg",
      size: "1200 x 2400 mm",
      finish: "Polished Glaze",
      desc: "Classic Italian arabesque marble with expressive slate-charcoal brecciated webbing."
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

    if (graniteInner && !isFinderActive && !isTileActive && !isTransitioning) {
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
    } else if (currentScrollProgress >= 0.88) {
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
    if (isTransitioning || isTransitionCooldown) return;

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
    if (isTransitioning || isTransitionCooldown) return;
    if (mobileGestureHandled) return;
    if (!e.touches || e.touches.length === 0) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = mobileTouchStartX - currentX;
    const diffY = mobileTouchStartY - currentY; // positive = swipe up (advance), negative = swipe down (back)
    const absX = Math.abs(diffX);
    const absY = Math.abs(diffY);

    // Filter out horizontal swipes (e.g., granite slabs or tile cards)
    if (absX >= absY || absY < 45) return;

    const trackH = experienceTrack ? experienceTrack.offsetHeight : window.innerHeight * 2.2;
    const maxScroll = Math.max(1, trackH - window.innerHeight);

    // Strictly enforce: ONE intentional swipe = ONE adjacent section transition
    if (mobileTouchSection === 'HERO') {
      if (diffY > 0) {
        // Swipe UP on Hero -> Smoothly transition to Granite Collection ONLY (cannot skip into Finder)
        mobileGestureHandled = true;
        e.preventDefault();
        window.scrollTo({ top: maxScroll, behavior: 'smooth' });
      }
    } else if (mobileTouchSection === 'GRANITE') {
      if (diffY > 0) {
        // Swipe UP on Granite Collection -> Transition to Granite Finder ONLY (cannot skip into Tiles)
        mobileGestureHandled = true;
        e.preventDefault();
        transitionToFinder();
      } else if (diffY < 0) {
        // Swipe DOWN on Granite Collection -> Smoothly transition back to Hero ONLY
        mobileGestureHandled = true;
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (mobileTouchSection === 'FINDER') {
      const finderTop = graniteFinder ? graniteFinder.scrollTop : 0;
      const isFinderAtEnd = graniteFinder ? (graniteFinder.scrollTop + graniteFinder.clientHeight) >= (graniteFinder.scrollHeight - 15) : true;

      if (diffY < 0 && finderTop <= 4) {
        // Swipe DOWN at top of Finder -> Transition back to Granite Collection ONLY (cannot skip into Hero)
        mobileGestureHandled = true;
        e.preventDefault();
        transitionBackToCollection();
      } else if (diffY > 0 && isFinderAtEnd) {
        // Swipe UP at bottom of Finder -> Transition to Tile Collection ONLY
        mobileGestureHandled = true;
        e.preventDefault();
        transitionToTiles();
      }
      // If within scrollable body of Finder, native smooth scrolling is untouched
    } else if (mobileTouchSection === 'TILES') {
      const tileTop = tileSection ? tileSection.scrollTop : 0;
      if (diffY < 0 && tileTop <= 4) {
        // Swipe DOWN at top of Tile Section -> Transition back to Granite Finder ONLY
        mobileGestureHandled = true;
        e.preventDefault();
        transitionBackToFinder();
      }
    }
  }, { passive: false });

  window.addEventListener('touchend', () => {
    // If user released halfway between Hero and Granite without triggering threshold, snap to nearest clean state
    if (!mobileGestureHandled && !isFinderActive && !isTileActive && !isTransitioning && !isTransitionCooldown) {
      const trackH = experienceTrack ? experienceTrack.offsetHeight : window.innerHeight * 2.2;
      const maxScroll = Math.max(1, trackH - window.innerHeight);

      if (mobileTouchSection === 'HERO' && currentScrollProgress > 0.35) {
        window.scrollTo({ top: maxScroll, behavior: 'smooth' });
      } else if (mobileTouchSection === 'HERO' && currentScrollProgress <= 0.35 && currentScrollProgress > 0.02) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (mobileTouchSection === 'GRANITE' && currentScrollProgress < 0.65) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (mobileTouchSection === 'GRANITE' && currentScrollProgress >= 0.65 && currentScrollProgress < 0.98) {
        window.scrollTo({ top: maxScroll, behavior: 'smooth' });
      }
    }
    mobileGestureHandled = false;
  }, { passive: true });

  window.addEventListener('touchcancel', () => {
    mobileGestureHandled = false;
  }, { passive: true });

  window.addEventListener('keydown', (e) => {
    if (modalBackdrop && modalBackdrop.classList.contains('is-open')) return;
    if (textureLightbox && textureLightbox.classList.contains('is-open')) return;
    if (isTransitioning || isTransitionCooldown) return;

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

  // Connect "EXPLORE GRANITE" CTA button to smooth slide into collection
  if (exploreCtaBtn) {
    exploreCtaBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const trackH = experienceTrack ? experienceTrack.offsetHeight : window.innerHeight * 2.2;
      const targetScroll = trackH - window.innerHeight;
      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    });
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

  // Connect Navbar "Products" link to smooth scroll as well
  if (navProductsLink) {

    navProductsLink.addEventListener('click', (e) => {
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
  const modalBtnQuote = document.getElementById('modal-btn-quote');
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

    // 6. Dynamic Quote Request Mailto
    if (modalBtnQuote) {
      const quoteSubject = `Quote Request: ${item.name} Granite`;
      const quoteBody = `Hello Balaji Granites Team,\n\nI would like to request a quotation for ${item.name} granite.\n\nFinish: ${item.finish}\nApplication: Countertops / Flooring / Wall Cladding\nEstimated Quantity:\nLocation:\n\nDirect Owner Contact: +91 ${BALAJI_OWNER_PHONE}\nThank you!`;
      modalBtnQuote.href = `mailto:sales@balajigranites.com?subject=${encodeURIComponent(quoteSubject)}&body=${encodeURIComponent(quoteBody)}`;
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
