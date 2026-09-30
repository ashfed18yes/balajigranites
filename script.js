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

// 3. Force scroll position to top instantly before anything renders or restores
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

  if (!video || !heroUi) return;

  // Reset video and UI state on initial page load / reload
  video.pause();
  try {
    video.currentTime = 0;
  } catch (e) {}

  heroUi.classList.remove('is-revealed');

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
    }
  ];

  const slabsStage = document.getElementById('slabs-stage');
  const counterCurrent = document.getElementById('counter-current');
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
    if (Math.abs(e.changedTouches[0].screenX - touchStartX) > 12) {
      wasDragging = true;
    }
  }, { passive: true });

  slabsStage.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipeGesture();
    setTimeout(() => { wasDragging = false; }, 80);
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
    if (Math.abs(e.clientX - pointerStartX) > 10) {
      wasDragging = true;
    }
  });

  window.addEventListener('mouseup', (e) => {
    if (!isPointerDown) return;
    isPointerDown = false;
    const dragDistance = e.clientX - pointerStartX;
    if (dragDistance > 55) {
      goToSlide(currentGraniteIndex - 1);
    } else if (dragDistance < -55) {
      goToSlide(currentGraniteIndex + 1);
    }
    setTimeout(() => { wasDragging = false; }, 80);
  });

  // 3. Scroll-Driven White Sheet Cover & Soft Granite UI Reveal
  const experienceTrack = document.getElementById('experience-track');
  const warmCurtain = document.getElementById('warm-ivory-curtain');
  const graniteInner = document.getElementById('granite-collection-inner');
  const navHomeLink = document.getElementById('nav-home');
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

  let scrollRafId = null;
  let currentScrollProgress = 0;
  let isFinderActive = false;
  let isTransitioning = false;
  let finderTouchStartY = 0;

  function updateTransition() {
    scrollRafId = null;
    const scrollY = window.scrollY || window.pageYOffset;
    const windowH = window.innerHeight;
    const trackH = experienceTrack ? experienceTrack.offsetHeight : windowH * 2.2;
    const maxScroll = Math.max(1, trackH - windowH);

    // Normalized progress across the scroll track from 0 to 1
    const progress = Math.min(1, Math.max(0, scrollY / maxScroll));
    currentScrollProgress = progress;

    // When the user scrolls all the way back to the very top (scrollY <= 2), ensure the Hero is in its clean initial visual state.
    if (scrollY <= 2) {
      if (warmCurtain) {
        warmCurtain.style.transform = 'translate3d(0, 100%, 0)';
      }
      if (graniteInner) {
        graniteInner.style.opacity = '0';
        graniteInner.style.transform = 'translate3d(0, 20px, 0)';
        graniteInner.style.filter = 'blur(6px)';
      }
      if (graniteSection) {
        graniteSection.style.pointerEvents = 'none';
      }
      if (heroContainer) {
        heroContainer.style.transform = 'none';
        heroContainer.style.opacity = '1';
      }
      return;
    }

    // Phase A: Warm Ivory Curtain Cover (0% to 88% of scroll)
    // Curtains moves from translateY(100%) to translateY(0%)
    // At progress 0% -> translateY(100%) [Hero 100% visible]
    // At progress 25% -> translateY(71.6%) [Hero bottom 28.4% covered, top 71.6% stationary]
    // At progress 50% -> translateY(43.2%) [Hero bottom 56.8% covered, top 43.2% stationary]
    // At progress 75% -> translateY(14.8%) [Hero bottom 85.2% covered, top 14.8% stationary]
    // At progress 88% -> translateY(0%) [Screen is 100% covered in warm ivory]
    const curtainProgress = Math.min(1, progress / 0.88);
    const curtainY = (1 - curtainProgress) * 100;

    if (warmCurtain) {
      warmCurtain.style.transform = `translate3d(0, ${curtainY}%, 0)`;
    }

    // Hero stays strictly stationary: NO transform, NO scale, NO movement
    if (heroContainer) {
      heroContainer.style.transform = 'none';
      heroContainer.style.opacity = '1';
    }

    // Phase B: Granite Collection Emergence / Dissolve (85% to 100% of scroll)
    // Once the white curtain has covered the hero, the granite slider softly emerges
    // from opacity: 0, translateY(20px), blur(6px) to opacity: 1, translateY(0), blur(0)
    const revealProgress = Math.max(0, Math.min(1, (progress - 0.85) / 0.15));

    if (graniteInner && !isFinderActive && !isTransitioning) {
      graniteInner.style.opacity = revealProgress.toFixed(3);
      graniteInner.style.transform = `translate3d(0, ${(1 - revealProgress) * 20}px, 0)`;
      graniteInner.style.filter = `blur(${((1 - revealProgress) * 6).toFixed(1)}px)`;
    }

    if (graniteSection && !isFinderActive) {
      graniteSection.style.pointerEvents = revealProgress > 0.7 ? 'auto' : 'none';
    }
  }

  function resetExperienceToTop() {
    isFinderActive = false;
    isTransitioning = false;

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
      warmCurtain.style.transform = 'translate3d(0, 100%, 0)';
    }

    // 4. Reset granite collection reveal
    if (graniteInner) {
      graniteInner.style.opacity = '0';
      graniteInner.style.transform = 'translate3d(0, 20px, 0)';
      graniteInner.style.filter = 'blur(6px)';
    }

    if (graniteSection) {
      graniteSection.style.pointerEvents = 'none';
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
      } catch (e) {}
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
      window.removeEventListener('wheel', preventScrollFight);
      window.removeEventListener('touchmove', preventScrollFight);

      if (graniteFinder) {
        graniteFinder.style.pointerEvents = 'auto';
      }
      if (graniteSection) {
        graniteSection.style.pointerEvents = 'none';
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
      window.removeEventListener('wheel', preventScrollFight);
      window.removeEventListener('touchmove', preventScrollFight);

      if (graniteSection) {
        graniteSection.style.pointerEvents = 'auto';
      }
    }, 850);
  }

  // Expose on window for verification
  window.transitionToFinder = transitionToFinder;
  window.transitionBackToCollection = transitionBackToCollection;

  // Controlled Gesture Listeners for Granite Collection <-> Granite Finder
  window.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length > 0) {
      finderTouchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('wheel', (e) => {
    // Safety: ignore if modal or lightbox is open, or if dragging
    if (modalBackdrop && modalBackdrop.classList.contains('is-open')) return;
    if (textureLightbox && textureLightbox.classList.contains('is-open')) return;
    if (wasDragging || isPointerDown) return;

    // 1. One downward scroll gesture at end of Granite Collection
    if (!isFinderActive && !isTransitioning && currentScrollProgress >= 0.95) {
      if (e.deltaY > 15) {
        e.preventDefault();
        transitionToFinder();
      }
    }
    // 2. Upward scroll gesture at top of Granite Finder
    else if (isFinderActive && !isTransitioning) {
      const finderTop = graniteFinder ? graniteFinder.scrollTop : 0;
      if (finderTop <= 2 && e.deltaY < -15) {
        e.preventDefault();
        transitionBackToCollection();
      }
    }
  }, { passive: false });

  window.addEventListener('touchmove', (e) => {
    if (modalBackdrop && modalBackdrop.classList.contains('is-open')) return;
    if (textureLightbox && textureLightbox.classList.contains('is-open')) return;
    if (wasDragging || isPointerDown) return;
    if (!e.touches || e.touches.length === 0) return;

    const currentY = e.touches[0].clientY;
    const diffY = finderTouchStartY - currentY; // positive = swipe up = scroll down

    if (!isFinderActive && !isTransitioning && currentScrollProgress >= 0.95) {
      if (diffY > 30) {
        e.preventDefault();
        transitionToFinder();
      }
    } else if (isFinderActive && !isTransitioning) {
      const finderTop = graniteFinder ? graniteFinder.scrollTop : 0;
      if (finderTop <= 2 && diffY < -30) {
        e.preventDefault();
        transitionBackToCollection();
      }
    }
  }, { passive: false });

  window.addEventListener('keydown', (e) => {
    if (modalBackdrop && modalBackdrop.classList.contains('is-open')) return;
    if (textureLightbox && textureLightbox.classList.contains('is-open')) return;

    if (!isFinderActive && !isTransitioning && currentScrollProgress >= 0.95) {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        transitionToFinder();
      }
    } else if (isFinderActive && !isTransitioning) {
      const finderTop = graniteFinder ? graniteFinder.scrollTop : 0;
      if (finderTop <= 2 && (e.key === 'ArrowUp' || e.key === 'PageUp')) {
        e.preventDefault();
        transitionBackToCollection();
      }
    }
  });

  function onScroll() {
    if (!scrollRafId) {
      scrollRafId = requestAnimationFrame(updateTransition);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

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

  // Connect Navbar "Products" link to smooth scroll as well
  if (navProductsLink) {
    navProductsLink.addEventListener('click', (e) => {
      e.preventDefault();
      const trackH = experienceTrack ? experienceTrack.offsetHeight : window.innerHeight * 2.2;
      const targetScroll = trackH - window.innerHeight;
      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    });
  }

  // Connect Navbar "Home" link to smooth scroll back to hero
  if (navHomeLink) {
    navHomeLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (isFinderActive) {
        transitionBackToCollection();
      }
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  /* ==========================================================================
     Granite Finder: Selection, Tolerant Filtering & Results Experience
     ========================================================================== */

  const finderTiles = document.querySelectorAll('.finder-tile');
  let selectedPreferences = {
    app: 'kitchen',
    tone: 'dark',
    finish: 'polished'
  };

  finderTiles.forEach(tile => {
    tile.addEventListener('click', () => {
      const group = tile.dataset.group;
      const value = tile.dataset.value;
      if (!group || !value) return;

      selectedPreferences[group] = value;

      document.querySelectorAll(`.finder-tile[data-group="${group}"]`).forEach(t => {
        t.classList.remove('is-selected');
        t.setAttribute('aria-checked', 'false');
      });
      tile.classList.add('is-selected');
      tile.setAttribute('aria-checked', 'true');
    });
  });

  function filterGranites(prefs) {
    const app = prefs.app;
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
    const { matches, matchQuality } = filterGranites(selectedPreferences);

    if (finderResultsCount) {
      finderResultsCount.textContent = `${matches.length} GRANITES MATCHED`;
    }

    if (finderResultsTitle) {
      finderResultsTitle.textContent = "Granites for You";
    }

    if (finderResultsSubtitle) {
      if (matchQuality === 'exact') {
        const appName = selectedPreferences.app.charAt(0).toUpperCase() + selectedPreferences.app.slice(1);
        const toneName = selectedPreferences.tone.charAt(0).toUpperCase() + selectedPreferences.tone.slice(1);
        const finishName = selectedPreferences.finish.charAt(0).toUpperCase() + selectedPreferences.finish.slice(1);
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
