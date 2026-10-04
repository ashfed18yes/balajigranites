/**
 * Balaji Granites — Dedicated Products Page Logic
 * Manages vertical curtain reveal, product switcher across all 20 granites,
 * multi-view slab inspection, tone filtering, and WhatsApp inquiry.
 */

const GRANITE_PRODUCTS = [
  {
    id: "01",
    name: "Black Galaxy",
    category: "Indian Granite",
    origin: "Andhra Pradesh, India",
    desc: "Black Galaxy is a world-renowned Indian granite celebrated for its deep obsidian bedrock infused with reflective copper-gold bronzite flecks. Highly impervious and sculpturally dramatic, it elevates luxury kitchen islands, executive foyers, bathroom vanities, and monolithic feature walls with unmatched brilliance.",
    finish: "Mirror Polished",
    thickness: "20mm / 30mm",
    character: "Golden Bronzite Specks on Obsidian",
    application: "Countertops, Flooring, Feature Walls",
    tone: "dark",
    image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.24 PM.jpeg",
    macroImage: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.24 PM.jpeg",
    archImage: "assets/applications/black_galaxy_countertop.jpg"
  },
  {
    id: "02",
    name: "Kashmir White",
    category: "Indian Granite",
    origin: "Tamil Nadu, India",
    desc: "Kashmir White presents a tranquil ivory and dove-grey ground dusted with delicate wine-colored garnet deposits. Its gentle, luminous aesthetic creates an airy, sophisticated atmosphere in open-concept residences, bespoke kitchen countertops, and light-filled architectural bath retreats.",
    finish: "Diamond Polished",
    thickness: "20mm / 30mm",
    character: "Wine Garnet Crystals on Alabaster",
    application: "Kitchen Counters, Island Tops, Bathrooms",
    tone: "light",
    image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.16 PM (2).jpeg",
    macroImage: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.16 PM (2).jpeg",
    archImage: "assets/about/luxury_kitchen_granite.jpg"
  },
  {
    id: "03",
    name: "Viscount White",
    category: "Indian Granite",
    origin: "Madurai, India",
    desc: "Viscount White combines the dramatic, fluid aesthetic of fine Calacatta marble with the superior density and stain-resistance of natural granite. Its sweeping ribbons of charcoal and slate across a frosted white canvas make it a showstopper for bookmatched waterfall counters and signature feature walls.",
    finish: "High Gloss Polished",
    thickness: "20mm / 30mm",
    character: "Sweeping Graphite Rivering",
    application: "Waterfall Counters, Bookmatched Walls, Flooring",
    tone: "light",
    image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.16 PM.jpeg",
    macroImage: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.16 PM.jpeg",
    archImage: "assets/about/about_hero_granite.jpg"
  },
  {
    id: "04",
    name: "Tan Brown",
    category: "Indian Granite",
    origin: "Telangana, India",
    desc: "Tan Brown showcases an intricate crystalline arrangement of warm burnt umber, chocolate, and copper-tinted feldspar grains embedded in a dark mineral base. Exceptionally durable and low-maintenance, it is favored for high-traffic luxury flooring, hospitality bars, and robust outdoor culinary spaces.",
    finish: "Mirror Polished",
    thickness: "20mm / 30mm",
    character: "Cognac & Espresso Crystalline Matrix",
    application: "Flooring, Commercial Lobbies, Kitchens",
    tone: "warm",
    image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.18 PM (1).jpeg",
    macroImage: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.18 PM (1).jpeg",
    archImage: "assets/applications/other_vanity.jpg"
  },
  {
    id: "05",
    name: "Steel Grey",
    category: "Indian Granite",
    origin: "Andhra Pradesh, India",
    desc: "Steel Grey delivers a poised, contemporary architectural foundation with uniform gunmetal and charcoal hues enriched by subtle silvery mica inclusions. Its restrained, understated color palette effortlessly harmonizes with minimalist cabinetry, brushed brass, and modern urban stone architecture.",
    finish: "Honed & Polished",
    thickness: "20mm / 30mm",
    character: "Silver Pearlescence on Charcoal",
    application: "Kitchens, Exterior Paving, Minimalist Interiors",
    tone: "dark",
    image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.18 PM (2).jpeg",
    macroImage: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.18 PM (2).jpeg",
    archImage: "assets/about/granite_in_architecture.jpg"
  },
  {
    id: "06",
    name: "Ruby Red",
    category: "Indian Granite",
    origin: "Jhansi, India",
    desc: "Celebrated as one of the hardest natural granites quarried, Ruby Red boasts a vibrant ruby-crimson ground interwoven with charcoal and quartz flecks. Its commanding presence brings regal distinction to grand building portals, civic monuments, stately flooring, and executive counters.",
    finish: "High Gloss Polished",
    thickness: "20mm / 30mm",
    character: "Vibrant Jewel Crimson with Dark Minerals",
    application: "Grand Portals, Staircases, Monumental Flooring",
    tone: "warm",
    image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.19 PM (1).jpeg",
    macroImage: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.19 PM (1).jpeg",
    archImage: "assets/applications/staircase.jpg"
  },
  {
    id: "07",
    name: "Emerald Green",
    category: "Indian Granite",
    origin: "Hassan, India",
    desc: "Emerald Green evokes lush botanical depths with its deep jade and bottle-green body adorned with delicate white and mint mineral veining. An opulent choice for statement vanity tops, bespoke bar islands, and jewel-box powder rooms seeking dramatic biophilic luxury.",
    finish: "Mirror Polished",
    thickness: "20mm / 30mm",
    character: "Forest Serpentine with Calcite Veins",
    application: "Luxury Bar Tops, Vanities, Feature Walls",
    tone: "warm",
    image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.19 PM (2).jpeg",
    macroImage: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.19 PM (2).jpeg",
    archImage: "assets/about/luxury_kitchen_granite.jpg"
  },
  {
    id: "08",
    name: "Desert Gold",
    category: "Indian Granite",
    origin: "Rajasthan, India",
    desc: "Desert Gold captures the sun-drenched tranquility of rolling golden sand dunes, blending warm ocher, amber, and cream crystalline bands. Its welcoming, sun-kissed warmth enhances Mediterranean-style villas, warm modern kitchen islands, and luminous exterior poolside terraces.",
    finish: "Diamond Polished",
    thickness: "20mm / 30mm",
    character: "Golden Dunes & Ivory Flowing Grain",
    application: "Villa Flooring, Kitchen Islands, Terraces",
    tone: "warm",
    image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.17 PM.jpeg",
    macroImage: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.17 PM.jpeg",
    archImage: "assets/about/about_hero_granite.jpg"
  },
  {
    id: "09",
    name: "Red Multicolor",
    category: "Indian Granite",
    origin: "Karnataka, India",
    desc: "Featuring expressive ribbons of terracotta, rust red, and deep charcoal banding, Red Multicolor is an inherently dynamic natural stone. Each slab exhibits unique wavy metamorphic strata, making it an artistic focal point for large-format reception desks, stair treads, and fireplace surrounds.",
    finish: "High Gloss Polished",
    thickness: "20mm / 30mm",
    character: "Banded Terracotta & Charcoal Waves",
    application: "Feature Fireplaces, Staircases, Accent Flooring",
    tone: "warm",
    image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.16 PM (1).jpeg",
    macroImage: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.16 PM (1).jpeg",
    archImage: "assets/applications/staircase.jpg"
  },
  {
    id: "10",
    name: "Moon White",
    category: "Indian Granite",
    origin: "Kashmir, India",
    desc: "Moon White is celebrated for its finely distributed, serene composition of cool white quartz, delicate ivory feldspar, and tiny garnet flecks. Its clean, bright countenance makes spaces feel open and illuminated, serving as the gold standard for bright transitional and contemporary kitchens.",
    finish: "Mirror Polished",
    thickness: "20mm / 30mm",
    character: "Silvery Fog on Snowy Feldspar Matrix",
    application: "Bright Kitchens, Spa Bathrooms, Open Flooring",
    tone: "light",
    image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.18 PM.jpeg",
    macroImage: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.18 PM.jpeg",
    archImage: "assets/applications/black_galaxy_countertop.jpg"
  },
  {
    id: "11",
    name: "Lakha Red",
    category: "Indian Granite",
    origin: "Jodhpur, India",
    desc: "Quarried in Rajasthan, Lakha Red provides a rich, saturated red hue characterized by a dense micro-crystalline texture. Its exceptional structural resilience against UV exposure and weathering makes it a favored choice for landmark facades, commercial entrances, and resilient kitchen counters.",
    finish: "Diamond Polished",
    thickness: "20mm / 30mm",
    character: "Uniform Vermilion & Deep Coral Grains",
    application: "Exteriors, Portals, Heavy Duty Steps",
    tone: "warm",
    image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.19 PM.jpeg",
    macroImage: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.19 PM.jpeg",
    archImage: "assets/applications/staircase.jpg"
  },
  {
    id: "12",
    name: "Rosy Pink",
    category: "Indian Granite",
    origin: "Rajasthan, India",
    desc: "Rosy Pink offers a gentle pastel blush background delicately balanced with grey and white crystalline aggregates. Soft yet durable, this stone lends warmth and approachability to large residential flooring areas, garden stairways, and heritage architectural restorations.",
    finish: "High Gloss Polished",
    thickness: "20mm / 30mm",
    character: "Pale Coral Blush with Quartz Interlock",
    application: "Residential Patios, Flooring, Steps",
    tone: "warm",
    image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.17 PM (1).jpeg",
    macroImage: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.17 PM (1).jpeg",
    archImage: "assets/about/luxury_kitchen_granite.jpg"
  },
  {
    id: "13",
    name: "Blue Pearl",
    category: "Premium Granite",
    origin: "Larvik, Norway",
    desc: "Renowned worldwide for its mesmerizing optical brilliance, Blue Pearl contains iridescent blue and silver feldspar schillers that dance with incoming light. An ultra-luxury stone that imparts undeniable glamor to high-end bathroom suites, bar countertops, and architectural focal elements.",
    finish: "Mirror Polished",
    thickness: "20mm / 30mm",
    character: "Pearlescent Steel Blue Mica Luster",
    application: "Ultra-Luxury Countertops, Executive Suites, Vanities",
    tone: "dark",
    image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.20 PM.jpeg",
    macroImage: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.20 PM.jpeg",
    archImage: "assets/about/about_hero_granite.jpg"
  },
  {
    id: "14",
    name: "Mahogany Wave",
    category: "Indian Granite",
    origin: "Tamil Nadu, India",
    desc: "Mahogany Wave is defined by sweeping fluid waves of deep espresso, walnut, and warm auburn. Its organic geological flow lends warmth and timeless earthy character, serving as an ideal medium for custom dining tables, executive conference surfaces, and grand fireplace hearths.",
    finish: "High Gloss Polished",
    thickness: "20mm / 30mm",
    character: "Auburn Geological Ribboning",
    application: "Dining Tables, Conference Surfaces, Fireplaces",
    tone: "warm",
    image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.20 PM (1).jpeg",
    macroImage: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.20 PM (1).jpeg",
    archImage: "assets/applications/other_vanity.jpg"
  },
  {
    id: "15",
    name: "Jhansi Red",
    category: "Indian Granite",
    origin: "Central India",
    desc: "Quarried from legendary geological formations in Central India, Jhansi Red has built an enduring legacy of strength. Featuring robust carmine-red feldspar aggregates laced with smoky quartz, it withstands decades of extreme climatic exposure without losing its majestic luster.",
    finish: "Mirror Polished",
    thickness: "20mm / 30mm",
    character: "Bold Crimson Feldspar Aggregates",
    application: "Heritage Monuments, Cladding, Heavy Traffic Flooring",
    tone: "warm",
    image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.21 PM (1).jpeg",
    macroImage: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.21 PM (1).jpeg",
    archImage: "assets/applications/staircase.jpg"
  },
  {
    id: "16",
    name: "Absolute Black",
    category: "Indian Granite",
    origin: "Khammam, India",
    desc: "Absolute Black represents the pinnacle of pure, unbroken dark stone luxury. Its dense basaltic composition yields a deep, void-like black surface that reflects mirror-sharp highlights. The quintessential stone for modern architectural minimalism, luxury worktops, and sleek monuments.",
    finish: "Mirror Polished & Honed",
    thickness: "20mm / 30mm",
    character: "Monolithic Jet Black Density",
    application: "Kitchens, Minimalist Spas, Signature Facades",
    tone: "dark",
    image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.21 PM.jpeg",
    macroImage: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.21 PM.jpeg",
    archImage: "assets/applications/black_galaxy_countertop.jpg"
  },
  {
    id: "17",
    name: "Black Forest",
    category: "Indian Granite",
    origin: "Andhra Pradesh, India",
    desc: "Black Forest presents an intense ebony background traversed by sweeping, organic veins of crystalline white and silver. Reminiscent of misty winter canopies, its high-contrast aesthetic makes it an extraordinary choice for dramatic bookmatched island slabs, bar fronts, and shower walls.",
    finish: "Diamond Polished",
    thickness: "20mm / 30mm",
    character: "Organic Alabaster Veining on Ebony",
    application: "Bookmatched Islands, Bar Fronts, Feature Bathrooms",
    tone: "dark",
    image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.22 PM (1).jpeg",
    macroImage: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.22 PM (1).jpeg",
    archImage: "assets/about/luxury_kitchen_granite.jpg"
  },
  {
    id: "18",
    name: "Paradiso Classique",
    category: "Indian Granite",
    origin: "Karnataka, India",
    desc: "A rare and poetic natural creation, Paradiso Classique exhibits a mesmerizing swirl of soft violet, lilac-grey, and misty charcoal. Its serene, chromatic sophistication lends tranquil beauty to master baths, sculptural stairways, and distinctive luxury living room floors.",
    finish: "High Gloss Polished",
    thickness: "20mm / 30mm",
    character: "Swirling Lavender & Charcoal Bands",
    application: "Sculptural Stairs, Master Baths, Living Area Floors",
    tone: "warm",
    image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.22 PM.jpeg",
    macroImage: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.22 PM.jpeg",
    archImage: "assets/applications/other_vanity.jpg"
  },
  {
    id: "19",
    name: "Baltic Brown",
    category: "Premium Granite",
    origin: "Finland",
    desc: "Baltic Brown is celebrated for its unique geological formation characterized by large circular 'rapakivi' rosettes of rich brown and tan feldspar ringed with green-black minerals. Its distinctive sculptural texture delivers bold, tactile richness to traditional and rustic-modern spaces.",
    finish: "Mirror Polished",
    thickness: "20mm / 30mm",
    character: "Orbicular Feldspar Rosettes in Charcoal",
    application: "Kitchen Islands, Bar Counters, Architectural Paving",
    tone: "dark",
    image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.23 PM (1).jpeg",
    macroImage: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.23 PM (1).jpeg",
    archImage: "assets/about/about_hero_granite.jpg"
  },
  {
    id: "20",
    name: "Chima Pink",
    category: "Indian Granite",
    origin: "Rajasthan, India",
    desc: "Chima Pink features a uniform, soft coral-pink body composed of tightly interlocked quartz and microcline crystals. Renowned for its consistency across expansive areas, it provides gentle warmth and timeless durability to residential terraces, commercial corridors, and architectural facades.",
    finish: "High Gloss Polished",
    thickness: "20mm / 30mm",
    character: "Soft Rose Quartz Granulation",
    application: "Residential Terraces, Commercial Corridors, Facades",
    tone: "warm",
    image: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.23 PM (2).jpeg",
    macroImage: "Granite Images/WhatsApp Image 2026-09-29 at 1.42.23 PM (2).jpeg",
    archImage: "assets/applications/staircase.jpg"
  }
];

document.addEventListener('DOMContentLoaded', () => {
  const pillNavbar = document.getElementById('pill-navbar');
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const navLinksMenu = document.getElementById('nav-links-menu');
  const curtainOverlay = document.getElementById('products-curtain-overlay');
  const contentWrap = document.getElementById('products-content-wrap');

  // DOM Elements for Product Details
  const breadcrumbName = document.getElementById('breadcrumb-product-name');
  const productEyebrow = document.getElementById('product-eyebrow');
  const productTitle = document.getElementById('product-title');
  const productDesc = document.getElementById('product-desc');
  const productSlabImg = document.getElementById('product-slab-img');
  const galleryStageImg = document.getElementById('gallery-stage-img');
  const galleryBadgeLabel = document.getElementById('gallery-badge-label');
  
  // Specs Elements
  const specFinish = document.getElementById('spec-finish');
  const specThickness = document.getElementById('spec-thickness');
  const specOrigin = document.getElementById('spec-origin');
  const specCharacter = document.getElementById('spec-character');
  const specApplication = document.getElementById('spec-application');

  // Action Buttons
  const btnWhatsappTop = document.getElementById('btn-whatsapp-top');
  const btnWhatsappSpecs = document.getElementById('btn-whatsapp-specs');
  const btnQuoteTop = document.getElementById('btn-quote-top');
  const btnQuoteSpecs = document.getElementById('btn-quote-specs');

  // Carousel & Filters
  const swatchesTrack = document.getElementById('related-swatches-track');
  const carouselPrevBtn = document.getElementById('carousel-prev-btn');
  const carouselNextBtn = document.getElementById('carousel-next-btn');
  const toneFilterSelect = document.getElementById('tone-filter-select');

  // View switch dots
  const viewDots = document.querySelectorAll('.view-dot-btn');
  const verticalDots = document.querySelectorAll('.vertical-dot');

  let currentProductIndex = 0;
  let currentViewMode = 'slab'; // 'slab' | 'macro' | 'arch'

  // 1. Vertical White/Ivory Transition Curtain Reveal on Load
  if (curtainOverlay) {
    requestAnimationFrame(() => {
      setTimeout(() => {
        curtainOverlay.classList.add('is-dismissed');
        if (contentWrap) contentWrap.classList.add('is-revealed');
      }, 70);
    });
  }

  // 2. Smooth vertical curtain transition when navigating back to home, about or contact
  document.querySelectorAll('a[href^="/index.html"], a[href^="index.html"], a[href^="/about"], a[href^="about"], a[href^="/contact"], a[href^="contact"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetHref = link.getAttribute('href');
      if (!targetHref) return;
      e.preventDefault();

      if (curtainOverlay) {
        curtainOverlay.style.transition = 'none';
        curtainOverlay.style.transform = 'translate3d(0, 100%, 0)';
        void curtainOverlay.offsetWidth;
        curtainOverlay.style.transition = 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)';
        curtainOverlay.style.transform = 'translate3d(0, 0, 0)';
      }

      setTimeout(() => {
        window.location.href = targetHref;
      }, 500);
    });
  });

  // 3. Navbar Scroll State
  const updateNavbarScroll = () => {
    if (!pillNavbar) return;
    if (window.scrollY > 40) {
      pillNavbar.classList.add('is-scrolled');
    } else {
      pillNavbar.classList.remove('is-scrolled');
    }
  };
  window.addEventListener('scroll', updateNavbarScroll, { passive: true });
  updateNavbarScroll();

  // 4. Mobile Nav Toggle
  if (mobileToggle && pillNavbar) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = pillNavbar.classList.toggle('menu-open');
      mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.addEventListener('click', (e) => {
      if (pillNavbar.classList.contains('menu-open') && !pillNavbar.contains(e.target)) {
        pillNavbar.classList.remove('menu-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });

    if (navLinksMenu) {
      navLinksMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          pillNavbar.classList.remove('menu-open');
          mobileToggle.setAttribute('aria-expanded', 'false');
        });
      });
    }
  }

  // 5. Select Active Granite Product
  function selectProduct(index, smoothScroll = false) {
    if (index < 0 || index >= GRANITE_PRODUCTS.length) return;
    currentProductIndex = index;
    const item = GRANITE_PRODUCTS[index];
    currentViewMode = 'slab';

    // Update Text Content
    if (breadcrumbName) breadcrumbName.textContent = item.name;
    if (productEyebrow) productEyebrow.textContent = `Natural ${item.category}`;
    if (productTitle) productTitle.textContent = item.name;
    if (productDesc) productDesc.textContent = item.desc;

    // Update Specs
    if (specFinish) specFinish.textContent = item.finish;
    if (specThickness) specThickness.textContent = item.thickness;
    if (specOrigin) specOrigin.textContent = item.origin;
    if (specCharacter) specCharacter.textContent = item.character;
    if (specApplication) specApplication.textContent = item.application;

    // Update Main Slab Image
    if (productSlabImg) {
      productSlabImg.style.opacity = '0';
      setTimeout(() => {
        productSlabImg.src = item.image;
        productSlabImg.alt = `${item.name} Granite Slab`;
        productSlabImg.style.opacity = '1';
      }, 150);
    }

    // Update Gallery Image
    if (galleryStageImg) {
      galleryStageImg.src = item.archImage;
      galleryStageImg.alt = `${item.name} Architectural Installation`;
    }
    if (galleryBadgeLabel) {
      galleryBadgeLabel.textContent = `${item.name} · Architectural Environment`;
    }

    // Update WhatsApp & Quote links
    const waText = encodeURIComponent(`Hello Balaji Granites, I am interested in ${item.name} granite. Please share details and availability.`);
    const waUrl = `https://wa.me/919660222886?text=${waText}`;
    const quoteUrl = `mailto:sales@balajigranites.com?subject=Quote%20Request%3A%20${encodeURIComponent(item.name)}%20Granite&body=Hello%20Balaji%20Granites%20Team%2C%0A%0AI%20would%20like%20to%20request%20information%20for%20${encodeURIComponent(item.name)}%20granite.%0A%0AApplication%3A%0AEstimated%20Quantity%3A%0ALocation%3A%0A%0AThank%20you!`;

    if (btnWhatsappTop) btnWhatsappTop.href = waUrl;
    if (btnWhatsappSpecs) btnWhatsappSpecs.href = waUrl;
    if (btnQuoteTop) btnQuoteTop.href = quoteUrl;
    if (btnQuoteSpecs) btnQuoteSpecs.href = quoteUrl;

    // Update view switcher dots
    updateViewDots(0);

    // Update selected state in carousel
    document.querySelectorAll('.related-product-card').forEach((card, idx) => {
      card.classList.toggle('is-selected', card.dataset.id === item.id);
    });

    if (smoothScroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // 6. View Switcher Mode
  function updateViewDots(viewIdx) {
    viewDots.forEach((dot, idx) => {
      dot.classList.toggle('is-active', idx === viewIdx);
    });
    verticalDots.forEach((dot, idx) => {
      dot.classList.toggle('is-active', idx === viewIdx);
    });
  }

  function setViewMode(viewIdx) {
    const item = GRANITE_PRODUCTS[currentProductIndex];
    if (!item || !productSlabImg) return;
    updateViewDots(viewIdx);

    productSlabImg.style.opacity = '0';
    setTimeout(() => {
      if (viewIdx === 0) {
        productSlabImg.src = item.image;
      } else if (viewIdx === 1) {
        productSlabImg.src = item.macroImage;
      } else {
        productSlabImg.src = item.archImage;
      }
      productSlabImg.style.opacity = '1';
    }, 120);
  }

  viewDots.forEach((dot, idx) => {
    dot.addEventListener('click', () => setViewMode(idx));
  });
  verticalDots.forEach((dot, idx) => {
    dot.addEventListener('click', () => setViewMode(idx));
  });

  // 7. Render All 20 Granites in Carousel
  function renderCarousel(filteredList = GRANITE_PRODUCTS) {
    if (!swatchesTrack) return;
    swatchesTrack.innerHTML = '';

    filteredList.forEach(item => {
      const card = document.createElement('div');
      card.className = 'related-product-card';
      card.dataset.id = item.id;
      if (item.id === GRANITE_PRODUCTS[currentProductIndex].id) {
        card.classList.add('is-selected');
      }

      card.innerHTML = `
        <div class="card-swatch-media">
          <img src="${item.image}" alt="${item.name} Swatch" loading="lazy">
        </div>
        <div class="card-body">
          <span class="card-product-name">${item.name}</span>
          <span class="card-product-cat">${item.finish}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        const fullIndex = GRANITE_PRODUCTS.findIndex(p => p.id === item.id);
        if (fullIndex !== -1) {
          selectProduct(fullIndex, true);
        }
      });

      swatchesTrack.appendChild(card);
    });
  }

  // 8. Carousel Controls
  if (carouselPrevBtn && swatchesTrack) {
    carouselPrevBtn.addEventListener('click', () => {
      swatchesTrack.scrollBy({ left: -320, behavior: 'smooth' });
    });
  }

  if (carouselNextBtn && swatchesTrack) {
    carouselNextBtn.addEventListener('click', () => {
      swatchesTrack.scrollBy({ left: 320, behavior: 'smooth' });
    });
  }

  // 9. Tone Filter Dropdown
  if (toneFilterSelect) {
    toneFilterSelect.addEventListener('change', () => {
      const selectedTone = toneFilterSelect.value;
      if (selectedTone === 'all') {
        renderCarousel(GRANITE_PRODUCTS);
      } else {
        const filtered = GRANITE_PRODUCTS.filter(p => p.tone === selectedTone);
        renderCarousel(filtered);
      }
    });
  }

  // 10. Check URL query/hash for deep-linking (e.g. ?id=03)
  const urlParams = new URLSearchParams(window.location.search);
  const requestedId = urlParams.get('id') || window.location.hash.replace('#', '');
  if (requestedId) {
    const foundIdx = GRANITE_PRODUCTS.findIndex(p => p.id === requestedId || p.name.toLowerCase() === requestedId.toLowerCase());
    if (foundIdx !== -1) {
      currentProductIndex = foundIdx;
    }
  }

  // Initial render
  renderCarousel();
  selectProduct(currentProductIndex, false);
});
