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
    image: "Granite Images/optimized/01_black_galaxy.webp",
    macroImage: "Granite Images/optimized/01_black_galaxy.webp",
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
    image: "Granite Images/optimized/02_kashmir_white.webp",
    macroImage: "Granite Images/optimized/02_kashmir_white.webp",
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
    image: "Granite Images/optimized/03_viscount_white.webp",
    macroImage: "Granite Images/optimized/03_viscount_white.webp",
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
    image: "Granite Images/optimized/04_tan_brown.webp",
    macroImage: "Granite Images/optimized/04_tan_brown.webp",
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
    image: "Granite Images/optimized/05_steel_grey.webp",
    macroImage: "Granite Images/optimized/05_steel_grey.webp",
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
    image: "Granite Images/optimized/06_ruby_red.webp",
    macroImage: "Granite Images/optimized/06_ruby_red.webp",
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
    image: "Granite Images/optimized/07_emerald_green.webp",
    macroImage: "Granite Images/optimized/07_emerald_green.webp",
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
    image: "Granite Images/optimized/08_desert_gold.webp",
    macroImage: "Granite Images/optimized/08_desert_gold.webp",
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
    image: "Granite Images/optimized/09_red_multicolor.webp",
    macroImage: "Granite Images/optimized/09_red_multicolor.webp",
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
    image: "Granite Images/optimized/10_moon_white.webp",
    macroImage: "Granite Images/optimized/10_moon_white.webp",
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
    image: "Granite Images/optimized/11_lakha_red.webp",
    macroImage: "Granite Images/optimized/11_lakha_red.webp",
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
    image: "Granite Images/optimized/12_rosy_pink.webp",
    macroImage: "Granite Images/optimized/12_rosy_pink.webp",
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
    image: "Granite Images/optimized/13_blue_pearl.webp",
    macroImage: "Granite Images/optimized/13_blue_pearl.webp",
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
    image: "Granite Images/optimized/14_mahogany_wave.webp",
    macroImage: "Granite Images/optimized/14_mahogany_wave.webp",
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
    image: "Granite Images/optimized/15_jhansi_red.webp",
    macroImage: "Granite Images/optimized/15_jhansi_red.webp",
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
    image: "Granite Images/optimized/16_absolute_black.webp",
    macroImage: "Granite Images/optimized/16_absolute_black.webp",
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
    image: "Granite Images/optimized/17_black_forest.webp",
    macroImage: "Granite Images/optimized/17_black_forest.webp",
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
    image: "Granite Images/optimized/18_paradiso_classique.webp",
    macroImage: "Granite Images/optimized/18_paradiso_classique.webp",
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
    image: "Granite Images/optimized/19_baltic_brown.webp",
    macroImage: "Granite Images/optimized/19_baltic_brown.webp",
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
    image: "Granite Images/optimized/20_chima_pink.webp",
    macroImage: "Granite Images/optimized/20_chima_pink.webp",
    archImage: "assets/applications/staircase.jpg"
  },
  {
    id: "21",
    name: "Titanium Black",
    category: "Indian Granite",
    origin: "Rajasthan, India",
    desc: "Titanium Black features a rich dark charcoal bedrock laced with expressive silver-white and golden quartz movement. Its high-contrast crystalline pattern makes it a stunning choice for luxury kitchen counters, statement waterfall islands, and modern feature walls.",
    finish: "Mirror Polished",
    thickness: "20mm / 30mm",
    character: "Luminous Silver & Gold Waves",
    application: "Countertops, Flooring, Feature Walls",
    tone: "dark",
    image: "Granite Images/optimized/21_titanium_black.webp",
    macroImage: "Granite Images/optimized/21_titanium_black.webp",
    archImage: "assets/applications/black_galaxy_countertop.jpg"
  },
  {
    id: "22",
    name: "Alaska White",
    category: "Indian Granite",
    origin: "Rajasthan, India",
    desc: "Alaska White blends icy ivory tones with rich graphite and feldspar deposits. Loved for its bright and versatile aesthetic, it enhances natural lighting in residential kitchens, bathroom vanities, and expansive floor layouts.",
    finish: "Diamond Polished",
    thickness: "20mm / 30mm",
    character: "Crystalline Frost Matrix",
    application: "Kitchen Counters, Island Tops, Bathrooms",
    tone: "light",
    image: "Granite Images/optimized/22_alaska_white.webp",
    macroImage: "Granite Images/optimized/22_alaska_white.webp",
    archImage: "assets/about/luxury_kitchen_granite.jpg"
  },
  {
    id: "23",
    name: "Colonial Gold",
    category: "Indian Granite",
    origin: "Tamil Nadu, India",
    desc: "Colonial Gold offers a welcoming palette of creamy gold, pale taupe, and deep garnet specks. Perfect for bringing understated warmth to traditional or transitional spaces, island countertops, and grand foyer flooring.",
    finish: "High Gloss Polished",
    thickness: "20mm / 30mm",
    character: "Warm Golden Amber Texture",
    application: "Flooring, Commercial Lobbies, Kitchens",
    tone: "warm",
    image: "Granite Images/optimized/23_colonial_gold.webp",
    macroImage: "Granite Images/optimized/23_colonial_gold.webp",
    archImage: "assets/about/about_hero_granite.jpg"
  },
  {
    id: "24",
    name: "Astoria White",
    category: "Indian Granite",
    origin: "Andhra Pradesh, India",
    desc: "Astoria White displays delicate streams of slate grey and chocolate across a serene off-white backdrop. Its smooth aesthetic and high density make it ideal for sleek contemporary surfaces and low-maintenance kitchen worktops.",
    finish: "Mirror Polished",
    thickness: "20mm / 30mm",
    character: "Fine Slate Veining on Ivory",
    application: "Kitchens, Exterior Paving, Minimalist Interiors",
    tone: "light",
    image: "Granite Images/optimized/24_astoria_white.webp",
    macroImage: "Granite Images/optimized/24_astoria_white.webp",
    archImage: "assets/about/granite_in_architecture.jpg"
  },
  {
    id: "25",
    name: "Himalayan Blue",
    category: "Indian Granite",
    origin: "Karnataka, India",
    desc: "Himalayan Blue exhibits a captivating blend of cool blue-grey bedrock and warm reddish mineral bands. Known for extreme weather resistance and dynamic movement, it shines in exterior cladding, stair treads, and main foyers.",
    finish: "High Gloss Polished",
    thickness: "20mm / 30mm",
    character: "Swirling Mineral Waves",
    application: "Grand Portals, Staircases, Monumental Flooring",
    tone: "dark",
    image: "Granite Images/optimized/25_himalayan_blue.webp",
    macroImage: "Granite Images/optimized/25_himalayan_blue.webp",
    archImage: "assets/applications/staircase.jpg"
  },
  {
    id: "26",
    name: "Crystal Yellow",
    category: "Indian Granite",
    origin: "Gujarat, India",
    desc: "Crystal Yellow brings cheerful energy and rich golden texture to both residential and commercial spaces. Its dense, crystalline composition resists fading and scratching, making it a reliable option for high-traffic walkways and steps.",
    finish: "Diamond Polished",
    thickness: "20mm / 30mm",
    character: "Golden Crystalline Sparkle",
    application: "Villa Flooring, Kitchen Islands, Terraces",
    tone: "warm",
    image: "Granite Images/optimized/26_crystal_yellow.webp",
    macroImage: "Granite Images/optimized/26_crystal_yellow.webp",
    archImage: "assets/about/about_hero_granite.jpg"
  },
  {
    id: "27",
    name: "Black Pearl",
    category: "Indian Granite",
    origin: "Andhra Pradesh, India",
    desc: "Black Pearl provides a dense, sophisticated black ground enriched with subtle mineral shimmer. Highly versatile and low-maintenance, it is an enduring favorite for polished kitchen counters, sleek vanity surfaces, and modern floor tiles.",
    finish: "Mirror Polished",
    thickness: "20mm / 30mm",
    character: "Iridescent Metallic Specks",
    application: "Kitchens, Minimalist Spas, Signature Facades",
    tone: "dark",
    image: "Granite Images/optimized/27_black_pearl.webp",
    macroImage: "Granite Images/optimized/27_black_pearl.webp",
    archImage: "assets/applications/black_galaxy_countertop.jpg"
  },
  {
    id: "28",
    name: "Patagonia Gold",
    category: "Premium Granite",
    origin: "Brazil / India",
    desc: "Patagonia Gold is an extraordinary natural stone combining translucent quartz fragments, warm amber feldspar, and dark basalt pockets. A statement masterpiece for feature walls, illuminated bar tops, and luxury island counters.",
    finish: "Mirror Polished",
    thickness: "20mm / 30mm",
    character: "Translucent Quartz Breccia",
    application: "Luxury Bar Tops, Vanities, Feature Walls",
    tone: "warm",
    image: "Granite Images/optimized/28_patagonia_gold.webp",
    macroImage: "Granite Images/optimized/28_patagonia_gold.webp",
    archImage: "assets/about/luxury_kitchen_granite.jpg"
  },
  {
    id: "29",
    name: "Silver Wave",
    category: "Indian Granite",
    origin: "Rajasthan, India",
    desc: "Silver Wave offers a striking monochrome palette with sweeping linear movement. Its architectural contrast makes it a popular choice for bookmatched feature walls, reception desks, and modern bathroom enclosures.",
    finish: "High Gloss Polished",
    thickness: "20mm / 30mm",
    character: "Parallel Silver Flow",
    application: "Bookmatched Walls, Waterfall Slabs",
    tone: "dark",
    image: "Granite Images/optimized/29_silver_wave.webp",
    macroImage: "Granite Images/optimized/29_silver_wave.webp",
    archImage: "assets/applications/other_vanity.jpg"
  },
  {
    id: "30",
    name: "Cosmic Black",
    category: "Indian Granite",
    origin: "Andhra Pradesh, India",
    desc: "Cosmic Black captures celestial grandeur with its dark background and dramatic ribbons of warm gold and white crystals. Exceptionally hard and stain-resistant, it elevates island countertops and luxury dining surfaces.",
    finish: "Mirror Polished",
    thickness: "20mm / 30mm",
    character: "Celestial Metallic Currents",
    application: "Kitchen Slabs, Bar Countertops",
    tone: "dark",
    image: "Granite Images/optimized/30_cosmic_black.webp",
    macroImage: "Granite Images/optimized/30_cosmic_black.webp",
    archImage: "assets/applications/black_galaxy_countertop.jpg"
  },
  {
    id: "31",
    name: "Bianco Antico",
    category: "Indian Granite",
    origin: "Rajasthan, India",
    desc: "Bianco Antico is a classic light granite featuring warm taupe and burgundy mineral inclusions floating within a soft white quartz field. It offers timeless elegance for light-filled kitchens and spacious residential interiors.",
    finish: "Diamond Polished",
    thickness: "20mm / 30mm",
    character: "Taupe & Quartz Clusters on White",
    application: "Bright Kitchens, Spa Bathrooms",
    tone: "light",
    image: "Granite Images/optimized/31_bianco_antico.webp",
    macroImage: "Granite Images/optimized/31_bianco_antico.webp",
    archImage: "assets/about/luxury_kitchen_granite.jpg"
  },
  {
    id: "32",
    name: "Copper Silk",
    category: "Indian Granite",
    origin: "Tamil Nadu, India",
    desc: "Copper Silk presents an organic blend of deep chocolate, bronze, and copper-toned strata. Its warm, flowing character creates a cozy yet opulent mood in dining rooms, fireplace surrounds, and commercial lobbies.",
    finish: "High Gloss Polished",
    thickness: "20mm / 30mm",
    character: "Silken Auburn Waves",
    application: "Flooring, Dining Surfaces",
    tone: "warm",
    image: "Granite Images/optimized/32_copper_silk.webp",
    macroImage: "Granite Images/optimized/32_copper_silk.webp",
    archImage: "assets/applications/other_vanity.jpg"
  },
  {
    id: "33",
    name: "Verde Unik",
    category: "Indian Granite",
    origin: "Hassan, India",
    desc: "Verde Unik captures organic biophilic beauty with its deep forest green shade and subtle mint veining. Ideal for creating memorable vanity tops, custom bar counters, and decorative interior focal points.",
    finish: "Mirror Polished",
    thickness: "20mm / 30mm",
    character: "Botanical Forest Veining",
    application: "Vanities, Feature Tops",
    tone: "warm",
    image: "Granite Images/optimized/33_verde_unik.webp",
    macroImage: "Granite Images/optimized/33_verde_unik.webp",
    archImage: "assets/about/luxury_kitchen_granite.jpg"
  },
  {
    id: "34",
    name: "Mushroom Brown",
    category: "Indian Granite",
    origin: "Rajasthan, India",
    desc: "Mushroom Brown provides a balanced neutral background with soft brown and warm grey tones. Its consistent pattern and easy maintenance suit large floorings, corridor steps, and modern kitchen countertops.",
    finish: "Honed & Polished",
    thickness: "20mm / 30mm",
    character: "Uniform Warm Taupe Texture",
    application: "Flooring, Staircases, Kitchens",
    tone: "warm",
    image: "Granite Images/optimized/34_mushroom_brown.webp",
    macroImage: "Granite Images/optimized/34_mushroom_brown.webp",
    archImage: "assets/applications/staircase.jpg"
  },
  {
    id: "35",
    name: "Ice Blue",
    category: "Premium Granite",
    origin: "Norway / India",
    desc: "Ice Blue is a rare gem among natural granites, displaying translucent icy quartz layers interwoven with dark slate veining. Highly prized for executive boardrooms, island waterfalls, and spa retreats.",
    finish: "Mirror Polished",
    thickness: "20mm / 30mm",
    character: "Glacial Quartz Formations",
    application: "Executive Boardrooms, Spa Retreats",
    tone: "light",
    image: "Granite Images/optimized/35_ice_blue.webp",
    macroImage: "Granite Images/optimized/35_ice_blue.webp",
    archImage: "assets/about/about_hero_granite.jpg"
  },
  {
    id: "36",
    name: "Nebula Black",
    category: "Indian Granite",
    origin: "Andhra Pradesh, India",
    desc: "Nebula Black features a jet-black surface dusted with fine metallic mica particles that catch light like distant stars. Ideal for sleek contemporary kitchens, bathroom vanity tops, and luxury floor accents.",
    finish: "Diamond Polished",
    thickness: "20mm / 30mm",
    character: "Fine Golden Mica Dust",
    application: "Contemporary Kitchens, Vanity Tops",
    tone: "dark",
    image: "Granite Images/optimized/36_nebula_black.webp",
    macroImage: "Granite Images/optimized/36_nebula_black.webp",
    archImage: "assets/applications/black_galaxy_countertop.jpg"
  },
  {
    id: "37",
    name: "Solaris Gold",
    category: "Indian Granite",
    origin: "Rajasthan, India",
    desc: "Solaris Gold brings sunlit brightness with dynamic waves of amber, honey, and dark garnet. Highly durable and stain resistant, it shines on kitchen waterfall countertops and villa flooring.",
    finish: "High Gloss Polished",
    thickness: "20mm / 30mm",
    character: "Radiant Golden Quartz Flow",
    application: "Kitchen Waterfall Countertops, Flooring",
    tone: "warm",
    image: "Granite Images/optimized/37_solaris_gold.webp",
    macroImage: "Granite Images/optimized/37_solaris_gold.webp",
    archImage: "assets/about/about_hero_granite.jpg"
  },
  {
    id: "38",
    name: "Monte Carlo",
    category: "Indian Granite",
    origin: "Karnataka, India",
    desc: "Monte Carlo delivers modern sophistication with fluid charcoal and platinum grey veining on a bright quartz canvas. An excellent choice for bookmatched accent walls and contemporary kitchen islands.",
    finish: "Mirror Polished",
    thickness: "20mm / 30mm",
    character: "Charcoal Rivers on Silver",
    application: "Bookmatched Accent Walls, Kitchen Islands",
    tone: "light",
    image: "Granite Images/optimized/38_monte_carlo.webp",
    macroImage: "Granite Images/optimized/38_monte_carlo.webp",
    archImage: "assets/about/granite_in_architecture.jpg"
  },
  {
    id: "39",
    name: "Imperial Red",
    category: "Indian Granite",
    origin: "Jhansi, India",
    desc: "Imperial Red is prized for its intense crimson hue and structural resilience. Popular for grand building entrances, staircases, civic monuments, and durable kitchen work surfaces.",
    finish: "Diamond Polished",
    thickness: "20mm / 30mm",
    character: "Rich Regal Vermilion Matrix",
    application: "Building Entrances, Staircases, Monuments",
    tone: "warm",
    image: "Granite Images/optimized/39_imperial_red.webp",
    macroImage: "Granite Images/optimized/39_imperial_red.webp",
    archImage: "assets/applications/staircase.jpg"
  },
  {
    id: "40",
    name: "Amazonite Lux",
    category: "Premium Granite",
    origin: "Brazil / India",
    desc: "Amazonite Lux presents a breathtaking turquoise and mint green ground woven with warm golden veins. A rare, ultra-luxury stone that creates unforgettable powder room vanities, statement bar tops, and artwork slabs.",
    finish: "Mirror Polished",
    thickness: "20mm / 30mm",
    character: "Turquoise Jade & Amber Fissures",
    application: "Powder Room Vanities, Bar Tops, Artwork Slabs",
    tone: "warm",
    image: "Granite Images/optimized/40_amazonite_lux.webp",
    macroImage: "Granite Images/optimized/40_amazonite_lux.webp",
    archImage: "assets/about/luxury_kitchen_granite.jpg"
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
