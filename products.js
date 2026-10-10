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
    desc: "Black Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Gold Flecks",
    application: "Kitchen",
    tone: "dark",
    image: "Granite Images/optimized/01_black_galaxy.webp",
    macroImage: "Granite Images/optimized/01_black_galaxy.webp",
    archImage: "assets/applications/01-black-galaxy-stairs.jpg",
    applicationImages: [
      { type: "stairs", label: "Stairs", src: "assets/applications/01-black-galaxy-stairs.jpg" },
      { type: "kitchen", label: "Kitchen Countertop", src: "assets/applications/01-black-galaxy-kitchen.jpg" },
      { type: "floor", label: "Floor", src: "assets/applications/01-black-galaxy-floor.jpg" }
    ]
  },
  {
    id: "02",
    name: "Kashmir White",
    category: "Indian Granite",
    origin: "Tamil Nadu, India",
    desc: "White Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Garnet Crystals",
    application: "Countertops",
    tone: "light",
    image: "Granite Images/optimized/02_kashmir_white.webp",
    macroImage: "Granite Images/optimized/02_kashmir_white.webp",
    archImage: "assets/applications/02-kashmir-white-stairs.jpg",
    applicationImages: [
      { type: "stairs", label: "Stairs", src: "assets/applications/02-kashmir-white-stairs.jpg" },
      { type: "kitchen", label: "Kitchen Countertop", src: "assets/applications/02-kashmir-white-kitchen.jpg" },
      { type: "floor", label: "Floor", src: "assets/applications/02-kashmir-white-floor.jpg" }
    ]
  },
  {
    id: "03",
    name: "Viscount White",
    category: "Indian Granite",
    origin: "Madurai, India",
    desc: "White Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Graphite Veins",
    application: "Countertops",
    tone: "light",
    image: "Granite Images/optimized/03_viscount_white.webp",
    macroImage: "Granite Images/optimized/03_viscount_white.webp",
    archImage: "assets/applications/03-viscount-white-stairs.jpg",
    applicationImages: [
      { type: "stairs", label: "Stairs", src: "assets/applications/03-viscount-white-stairs.jpg" },
      { type: "kitchen", label: "Kitchen Countertop", src: "assets/applications/03-viscount-white-kitchen.jpg" },
      { type: "floor", label: "Floor", src: "assets/applications/03-viscount-white-floor.jpg" }
    ]
  },
  {
    id: "04",
    name: "Tan Brown",
    category: "Indian Granite",
    origin: "Telangana, India",
    desc: "Brown Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Copper Grains",
    application: "Flooring",
    tone: "warm",
    image: "Granite Images/optimized/04_tan_brown.webp",
    macroImage: "Granite Images/optimized/04_tan_brown.webp",
    archImage: "assets/applications/04-tan-brown-stairs.jpg",
    applicationImages: [
      { type: "stairs", label: "Stairs", src: "assets/applications/04-tan-brown-stairs.jpg" },
      { type: "kitchen", label: "Kitchen Countertop", src: "assets/applications/04-tan-brown-kitchen.jpg" },
      { type: "floor", label: "Floor", src: "assets/applications/04-tan-brown-floor.jpg" }
    ]
  },
  {
    id: "05",
    name: "Steel Grey",
    category: "Indian Granite",
    origin: "Andhra Pradesh, India",
    desc: "Charcoal Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Silver Veins",
    application: "Kitchen",
    tone: "dark",
    image: "Granite Images/optimized/05_steel_grey.webp",
    macroImage: "Granite Images/optimized/05_steel_grey.webp",
    archImage: "assets/applications/05-steel-grey-stairs.jpg",
    applicationImages: [
      { type: "stairs", label: "Stairs", src: "assets/applications/05-steel-grey-stairs.jpg" },
      { type: "kitchen", label: "Kitchen Countertop", src: "assets/applications/05-steel-grey-kitchen.jpg" },
      { type: "floor", label: "Floor", src: "assets/applications/05-steel-grey-floor.jpg" }
    ]
  },
  {
    id: "06",
    name: "Ruby Red",
    category: "Indian Granite",
    origin: "Jhansi, India",
    desc: "Red Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Crimson Feldspar",
    application: "Flooring",
    tone: "warm",
    image: "Granite Images/optimized/06_ruby_red.webp",
    macroImage: "Granite Images/optimized/06_ruby_red.webp",
    archImage: "assets/applications/06-ruby-red-stairs.jpg",
    applicationImages: [
      { type: "stairs", label: "Stairs", src: "assets/applications/06-ruby-red-stairs.jpg" },
      { type: "kitchen", label: "Kitchen Countertop", src: "assets/applications/06-ruby-red-kitchen.jpg" },
      { type: "floor", label: "Floor", src: "assets/applications/06-ruby-red-floor.jpg" }
    ]
  },
  {
    id: "07",
    name: "Emerald Green",
    category: "Indian Granite",
    origin: "Hassan, India",
    desc: "Green Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Emerald Quartz",
    application: "Vanities",
    tone: "warm",
    image: "Granite Images/optimized/07_emerald_green.webp",
    macroImage: "Granite Images/optimized/07_emerald_green.webp",
    archImage: "assets/applications/07-emerald-green-stairs.jpg",
    applicationImages: [
      { type: "stairs", label: "Stairs", src: "assets/applications/07-emerald-green-stairs.jpg" },
      { type: "kitchen", label: "Kitchen Countertop", src: "assets/applications/07-emerald-green-kitchen.jpg" },
      { type: "floor", label: "Floor", src: "assets/applications/07-emerald-green-floor.jpg" }
    ]
  },
  {
    id: "08",
    name: "Desert Gold",
    category: "Indian Granite",
    origin: "Rajasthan, India",
    desc: "Gold Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Amber Waves",
    application: "Flooring",
    tone: "warm",
    image: "Granite Images/optimized/08_desert_gold.webp",
    macroImage: "Granite Images/optimized/08_desert_gold.webp",
    archImage: "assets/applications/08-desert-gold-stairs.jpg",
    applicationImages: [
      { type: "stairs", label: "Stairs", src: "assets/applications/08-desert-gold-stairs.jpg" },
      { type: "kitchen", label: "Kitchen Countertop", src: "assets/applications/08-desert-gold-kitchen.jpg" },
      { type: "floor", label: "Floor", src: "assets/applications/08-desert-gold-floor.jpg" }
    ]
  },
  {
    id: "09",
    name: "Red Multicolor",
    category: "Indian Granite",
    origin: "Karnataka, India",
    desc: "Red Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Terracotta Waves",
    application: "Staircases",
    tone: "warm",
    image: "Granite Images/optimized/09_red_multicolor.webp",
    macroImage: "Granite Images/optimized/09_red_multicolor.webp",
    archImage: "assets/applications/09-red-multicolor-stairs.jpg",
    applicationImages: [
      { type: "stairs", label: "Stairs", src: "assets/applications/09-red-multicolor-stairs.jpg" },
      { type: "kitchen", label: "Kitchen Countertop", src: "assets/applications/09-red-multicolor-kitchen.jpg" },
      { type: "floor", label: "Floor", src: "assets/applications/09-red-multicolor-floor.jpg" }
    ]
  },
  {
    id: "10",
    name: "Moon White",
    category: "Indian Granite",
    origin: "Kashmir, India",
    desc: "White Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Silvery Fog",
    application: "Kitchen",
    tone: "light",
    image: "Granite Images/optimized/10_moon_white.webp",
    macroImage: "Granite Images/optimized/10_moon_white.webp",
    archImage: "assets/applications/10-moon-white-stairs.jpg",
    applicationImages: [
      { type: "stairs", label: "Stairs", src: "assets/applications/10-moon-white-stairs.jpg" },
      { type: "kitchen", label: "Kitchen Countertop", src: "assets/applications/10-moon-white-kitchen.jpg" },
      { type: "floor", label: "Floor", src: "assets/applications/10-moon-white-floor.jpg" }
    ]
  },
  {
    id: "11",
    name: "Lakha Red",
    category: "Indian Granite",
    origin: "Jodhpur, India",
    desc: "Red Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Vermilion Grains",
    application: "Exteriors",
    tone: "warm",
    image: "Granite Images/optimized/11_lakha_red.webp",
    macroImage: "Granite Images/optimized/11_lakha_red.webp",
    archImage: "assets/applications/11-lakha-red-application.jpg"
  },
  {
    id: "12",
    name: "Rosy Pink",
    category: "Indian Granite",
    origin: "Rajasthan, India",
    desc: "Pink Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Coral Blush",
    application: "Flooring",
    tone: "warm",
    image: "Granite Images/optimized/12_rosy_pink.webp",
    macroImage: "Granite Images/optimized/12_rosy_pink.webp",
    archImage: "assets/applications/12-rosy-pink-application.jpg"
  },
  {
    id: "13",
    name: "Blue Pearl",
    category: "Premium Granite",
    origin: "Larvik, Norway",
    desc: "Blue Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Pearlescent Blue",
    application: "Countertops",
    tone: "dark",
    image: "Granite Images/optimized/13_blue_pearl.webp",
    macroImage: "Granite Images/optimized/13_blue_pearl.webp",
    archImage: "assets/applications/13-blue-pearl-application.jpg"
  },
  {
    id: "14",
    name: "Mahogany Wave",
    category: "Indian Granite",
    origin: "Tamil Nadu, India",
    desc: "Brown Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Auburn Waves",
    application: "Dining Tables",
    tone: "warm",
    image: "Granite Images/optimized/14_mahogany_wave.webp",
    macroImage: "Granite Images/optimized/14_mahogany_wave.webp",
    archImage: "assets/applications/14-mahogany-wave-application.jpg"
  },
  {
    id: "15",
    name: "Jhansi Red",
    category: "Indian Granite",
    origin: "Central India",
    desc: "Red Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Crimson Aggregates",
    application: "Flooring",
    tone: "warm",
    image: "Granite Images/optimized/15_jhansi_red.webp",
    macroImage: "Granite Images/optimized/15_jhansi_red.webp",
    archImage: "assets/applications/15-jhansi-red-application.jpg"
  },
  {
    id: "16",
    name: "Absolute Black",
    category: "Indian Granite",
    origin: "Khammam, India",
    desc: "Black Granite",
    finish: "Honed",
    thickness: "20mm / 30mm",
    character: "Jet Black",
    application: "Flooring",
    tone: "dark",
    image: "Granite Images/optimized/16_absolute_black.webp",
    macroImage: "Granite Images/optimized/16_absolute_black.webp",
    archImage: "assets/applications/16-absolute-black-application.jpg"
  },
  {
    id: "17",
    name: "Black Forest",
    category: "Indian Granite",
    origin: "Andhra Pradesh, India",
    desc: "Black Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "White Veins",
    application: "Kitchen",
    tone: "dark",
    image: "Granite Images/optimized/17_black_forest.webp",
    macroImage: "Granite Images/optimized/17_black_forest.webp",
    archImage: "assets/applications/17-black-forest-application.jpg"
  },
  {
    id: "18",
    name: "Paradiso Classique",
    category: "Indian Granite",
    origin: "Karnataka, India",
    desc: "Lavender Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Lavender Swirls",
    application: "Flooring",
    tone: "warm",
    image: "Granite Images/optimized/18_paradiso_classique.webp",
    macroImage: "Granite Images/optimized/18_paradiso_classique.webp",
    archImage: "assets/applications/18-paradiso-classique-application.jpg"
  },
  {
    id: "19",
    name: "Baltic Brown",
    category: "Premium Granite",
    origin: "Finland",
    desc: "Brown Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Feldspar Rosettes",
    application: "Kitchen",
    tone: "dark",
    image: "Granite Images/optimized/19_baltic_brown.webp",
    macroImage: "Granite Images/optimized/19_baltic_brown.webp",
    archImage: "assets/applications/19-baltic-brown-application.jpg"
  },
  {
    id: "20",
    name: "Chima Pink",
    category: "Indian Granite",
    origin: "Rajasthan, India",
    desc: "Pink Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Rose Quartz",
    application: "Flooring",
    tone: "warm",
    image: "Granite Images/optimized/20_chima_pink.webp",
    macroImage: "Granite Images/optimized/20_chima_pink.webp",
    archImage: "assets/applications/20-chima-pink-application.jpg"
  },
  {
    id: "21",
    name: "Titanium Black",
    category: "Indian Granite",
    origin: "Rajasthan, India",
    desc: "Black Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Gold Waves",
    application: "Countertops",
    tone: "dark",
    image: "Granite Images/optimized/21_titanium_black.webp",
    macroImage: "Granite Images/optimized/21_titanium_black.webp",
    archImage: "assets/applications/21-titanium-black-application.jpg"
  },
  {
    id: "22",
    name: "Alaska White",
    category: "Indian Granite",
    origin: "Rajasthan, India",
    desc: "White Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Crystalline Frost",
    application: "Kitchen",
    tone: "light",
    image: "Granite Images/optimized/22_alaska_white.webp",
    macroImage: "Granite Images/optimized/22_alaska_white.webp",
    archImage: "assets/applications/22-alaska-white-application.jpg"
  },
  {
    id: "23",
    name: "Colonial Gold",
    category: "Indian Granite",
    origin: "Tamil Nadu, India",
    desc: "Gold Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Amber Grains",
    application: "Flooring",
    tone: "warm",
    image: "Granite Images/optimized/23_colonial_gold.webp",
    macroImage: "Granite Images/optimized/23_colonial_gold.webp",
    archImage: "assets/applications/23-colonial-gold-application.jpg"
  },
  {
    id: "24",
    name: "Astoria White",
    category: "Indian Granite",
    origin: "Andhra Pradesh, India",
    desc: "White Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Slate Veins",
    application: "Kitchen",
    tone: "light",
    image: "Granite Images/optimized/24_astoria_white.webp",
    macroImage: "Granite Images/optimized/24_astoria_white.webp",
    archImage: "assets/applications/24-astoria-white-application.jpg"
  },
  {
    id: "25",
    name: "Himalayan Blue",
    category: "Indian Granite",
    origin: "Karnataka, India",
    desc: "Blue Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Mineral Waves",
    application: "Staircases",
    tone: "dark",
    image: "Granite Images/optimized/25_himalayan_blue.webp",
    macroImage: "Granite Images/optimized/25_himalayan_blue.webp",
    archImage: "assets/applications/25-himalayan-blue-application.jpg"
  },
  {
    id: "26",
    name: "Crystal Yellow",
    category: "Indian Granite",
    origin: "Gujarat, India",
    desc: "Yellow Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Crystal Sparkle",
    application: "Flooring",
    tone: "warm",
    image: "Granite Images/optimized/26_crystal_yellow.webp",
    macroImage: "Granite Images/optimized/26_crystal_yellow.webp",
    archImage: "assets/applications/26-crystal-yellow-application.jpg"
  },
  {
    id: "27",
    name: "Black Pearl",
    category: "Indian Granite",
    origin: "Andhra Pradesh, India",
    desc: "Black Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Metallic Specks",
    application: "Kitchen",
    tone: "dark",
    image: "Granite Images/optimized/27_black_pearl.webp",
    macroImage: "Granite Images/optimized/27_black_pearl.webp",
    archImage: "assets/applications/27-black-pearl-application.jpg"
  },
  {
    id: "28",
    name: "Patagonia Gold",
    category: "Premium Granite",
    origin: "Brazil / India",
    desc: "Gold Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Quartz Breccia",
    application: "Bar Tops",
    tone: "warm",
    image: "Granite Images/optimized/28_patagonia_gold.webp",
    macroImage: "Granite Images/optimized/28_patagonia_gold.webp",
    archImage: "assets/applications/28-patagonia-gold-application.jpg"
  },
  {
    id: "29",
    name: "Silver Wave",
    category: "Indian Granite",
    origin: "Rajasthan, India",
    desc: "Black Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Silver Waves",
    application: "Feature Walls",
    tone: "dark",
    image: "Granite Images/optimized/29_silver_wave.webp",
    macroImage: "Granite Images/optimized/29_silver_wave.webp",
    archImage: "assets/applications/29-silver-wave-application.jpg"
  },
  {
    id: "30",
    name: "Cosmic Black",
    category: "Indian Granite",
    origin: "Andhra Pradesh, India",
    desc: "Black Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Gold Streams",
    application: "Countertops",
    tone: "dark",
    image: "Granite Images/optimized/30_cosmic_black.webp",
    macroImage: "Granite Images/optimized/30_cosmic_black.webp",
    archImage: "assets/applications/30-cosmic-black-application.jpg"
  },
  {
    id: "31",
    name: "Bianco Antico",
    category: "Indian Granite",
    origin: "Rajasthan, India",
    desc: "White Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Taupe Clusters",
    application: "Kitchen",
    tone: "light",
    image: "Granite Images/optimized/31_bianco_antico.webp",
    macroImage: "Granite Images/optimized/31_bianco_antico.webp",
    archImage: "assets/applications/31-bianco-antico-application.jpg"
  },
  {
    id: "32",
    name: "Copper Silk",
    category: "Indian Granite",
    origin: "Tamil Nadu, India",
    desc: "Brown Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Bronze Waves",
    application: "Flooring",
    tone: "warm",
    image: "Granite Images/optimized/32_copper_silk.webp",
    macroImage: "Granite Images/optimized/32_copper_silk.webp",
    archImage: "assets/applications/32-copper-silk-application.jpg"
  },
  {
    id: "33",
    name: "Verde Unik",
    category: "Indian Granite",
    origin: "Hassan, India",
    desc: "Green Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Forest Veins",
    application: "Vanities",
    tone: "warm",
    image: "Granite Images/optimized/33_verde_unik.webp",
    macroImage: "Granite Images/optimized/33_verde_unik.webp",
    archImage: "assets/applications/33-verde-unik-application.jpg"
  },
  {
    id: "34",
    name: "Mushroom Brown",
    category: "Indian Granite",
    origin: "Rajasthan, India",
    desc: "Brown Granite",
    finish: "Honed",
    thickness: "20mm / 30mm",
    character: "Taupe Texture",
    application: "Flooring",
    tone: "warm",
    image: "Granite Images/optimized/34_mushroom_brown.webp",
    macroImage: "Granite Images/optimized/34_mushroom_brown.webp",
    archImage: "assets/applications/34-mushroom-brown-application.jpg"
  },
  {
    id: "35",
    name: "Ice Blue",
    category: "Premium Granite",
    origin: "Norway / India",
    desc: "Blue Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Glacial Quartz",
    application: "Bathrooms",
    tone: "light",
    image: "Granite Images/optimized/35_ice_blue.webp",
    macroImage: "Granite Images/optimized/35_ice_blue.webp",
    archImage: "assets/applications/35-ice-blue-application.jpg"
  },
  {
    id: "36",
    name: "Nebula Black",
    category: "Indian Granite",
    origin: "Andhra Pradesh, India",
    desc: "Black Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Gold Mica",
    application: "Kitchen",
    tone: "dark",
    image: "Granite Images/optimized/36_nebula_black.webp",
    macroImage: "Granite Images/optimized/36_nebula_black.webp",
    archImage: "assets/applications/36-nebula-black-application.jpg"
  },
  {
    id: "37",
    name: "Solaris Gold",
    category: "Indian Granite",
    origin: "Rajasthan, India",
    desc: "Gold Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Quartz Waves",
    application: "Countertops",
    tone: "warm",
    image: "Granite Images/optimized/37_solaris_gold.webp",
    macroImage: "Granite Images/optimized/37_solaris_gold.webp",
    archImage: "assets/applications/37-solaris-gold-application.jpg"
  },
  {
    id: "38",
    name: "Monte Carlo",
    category: "Indian Granite",
    origin: "Karnataka, India",
    desc: "White Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Charcoal Rivers",
    application: "Kitchen",
    tone: "light",
    image: "Granite Images/optimized/38_monte_carlo.webp",
    macroImage: "Granite Images/optimized/38_monte_carlo.webp",
    archImage: "assets/applications/38-monte-carlo-application.jpg"
  },
  {
    id: "39",
    name: "Imperial Red",
    category: "Indian Granite",
    origin: "Jhansi, India",
    desc: "Red Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Vermilion Matrix",
    application: "Exteriors",
    tone: "warm",
    image: "Granite Images/optimized/39_imperial_red.webp",
    macroImage: "Granite Images/optimized/39_imperial_red.webp",
    archImage: "assets/applications/39-imperial-red-application.jpg"
  },
  {
    id: "40",
    name: "Amazonite Lux",
    category: "Premium Granite",
    origin: "Brazil / India",
    desc: "Green Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Amber Fissures",
    application: "Vanities",
    tone: "warm",
    image: "Granite Images/optimized/40_amazonite_lux.webp",
    macroImage: "Granite Images/optimized/40_amazonite_lux.webp",
    archImage: "assets/applications/40-amazonite-lux-application.jpg"
  },
  {
    id: "41",
    name: "Alaska White Granite",
    category: "Indian Granite",
    origin: "Rajasthan, India",
    desc: "White Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Silver Veins",
    application: "Countertops",
    tone: "light",
    image: "assets/New Granites/Alaska White Granite.jpg",
    macroImage: "assets/New Granites/Alaska White Granite.jpg",
    archImage: "assets/New Granites/Alaska White Granite Application.jpg",
    applicationImages: [
      { type: "residential", label: "Residential Living", src: "assets/New Granites/Alaska White Granite Application.jpg" }
    ]
  },
  {
    id: "42",
    name: "Cherry Red",
    category: "Indian Granite",
    origin: "Madhya Pradesh, India",
    desc: "Red Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Crimson Grain",
    application: "Flooring",
    tone: "warm",
    image: "assets/New Granites/Cherry Red.jpg",
    macroImage: "assets/New Granites/Cherry Red.jpg",
    archImage: "assets/New Granites/Cherry Red Application.jpg",
    applicationImages: [
      { type: "residential", label: "Residential Living", src: "assets/New Granites/Cherry Red Application.jpg" }
    ]
  },
  {
    id: "43",
    name: "Coffee Brown Granite",
    category: "Indian Granite",
    origin: "Telangana, India",
    desc: "Brown Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Espresso Grains",
    application: "Countertops",
    tone: "warm",
    image: "assets/New Granites/Coffee Brown Granite.jpg",
    macroImage: "assets/New Granites/Coffee Brown Granite.jpg",
    archImage: "assets/New Granites/Coffee Brown Granite Application.jpg",
    applicationImages: [
      { type: "residential", label: "Residential Living", src: "assets/New Granites/Coffee Brown Granite Application.jpg" }
    ]
  },
  {
    id: "44",
    name: "Fish Black Granite",
    category: "Indian Granite",
    origin: "Andhra Pradesh, India",
    desc: "Black Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Silver Flecks",
    application: "Kitchen",
    tone: "dark",
    image: "assets/New Granites/Fish Black Granite.jpg",
    macroImage: "assets/New Granites/Fish Black Granite.jpg",
    archImage: "assets/New Granites/Fish Black Granite Application.jpg",
    applicationImages: [
      { type: "residential", label: "Residential Living", src: "assets/New Granites/Fish Black Granite Application.jpg" }
    ]
  },
  {
    id: "45",
    name: "Galaxy Black Granite",
    category: "Indian Granite",
    origin: "Andhra Pradesh, India",
    desc: "Black Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Golden Crystals",
    application: "Countertops",
    tone: "dark",
    image: "assets/New Granites/Galaxy Black Granite.jpg",
    macroImage: "assets/New Granites/Galaxy Black Granite.jpg",
    archImage: "assets/New Granites/Galaxy Black Granite Application.jpg",
    applicationImages: [
      { type: "residential", label: "Residential Living", src: "assets/New Granites/Galaxy Black Granite Application.jpg" }
    ]
  },
  {
    id: "46",
    name: "Modern Brown",
    category: "Indian Granite",
    origin: "Rajasthan, India",
    desc: "Brown Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Walnut Texture",
    application: "Flooring",
    tone: "warm",
    image: "assets/New Granites/Mordern Brown.jpg",
    macroImage: "assets/New Granites/Mordern Brown.jpg",
    archImage: "assets/New Granites/Mordern Brown Application.jpg",
    applicationImages: [
      { type: "residential", label: "Residential Living", src: "assets/New Granites/Mordern Brown Application.jpg" }
    ]
  },
  {
    id: "47",
    name: "P White Granite",
    category: "Indian Granite",
    origin: "Rajasthan, India",
    desc: "White Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Platinum Flecks",
    application: "Countertops",
    tone: "light",
    image: "assets/New Granites/P-White Granite.jpg",
    macroImage: "assets/New Granites/P-White Granite.jpg",
    archImage: "assets/New Granites/P White Granite application.jpg",
    applicationImages: [
      { type: "residential", label: "Residential Living", src: "assets/New Granites/P White Granite application.jpg" }
    ]
  },
  {
    id: "48",
    name: "Z-Black South",
    category: "Indian Granite",
    origin: "Tamil Nadu, India",
    desc: "Black Granite",
    finish: "Polished",
    thickness: "20mm / 30mm",
    character: "Deep Obsidian",
    application: "Countertops",
    tone: "dark",
    image: "assets/New Granites/Z-Black South.jpg",
    macroImage: "assets/New Granites/Z-Black South.jpg",
    archImage: "assets/New Granites/Z-Black South Application.jpg",
    applicationImages: [
      { type: "residential", label: "Residential Living", src: "assets/New Granites/Z-Black South Application.jpg" }
    ]
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
  const galleryStage = document.getElementById('gallery-stage');
  const galleryStageImg = document.getElementById('gallery-stage-img');
  const galleryBadgeLabel = document.getElementById('gallery-badge-label');
  const galleryArrowPrev = document.getElementById('gallery-arrow-prev');
  const galleryArrowNext = document.getElementById('gallery-arrow-next');
  
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
  let currentAppSlideIndex = 0; // 0: Stairs, 1: Kitchen Countertop, 2: Floor

  const resolveSrc = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) return path;
    return '/' + path;
  };

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
  document.querySelectorAll('a[href="/"], a[href^="/#"], a[href^="/index.html"], a[href^="index.html"], a[href^="/about"], a[href^="about"], a[href^="/contact"], a[href^="contact"]').forEach(link => {
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

  // 5. Preload All Application Images into memory cache for instant, zero-latency switching
  function preloadApplicationImages() {
    GRANITE_PRODUCTS.forEach(product => {
      if (Array.isArray(product.applicationImages)) {
        product.applicationImages.forEach(app => {
          const img = new Image();
          img.src = resolveSrc(app.src);
        });
      }
    });
  }
  preloadApplicationImages();

  // Architectural Application Slider (Auto-advancing every 1 second: Stairs -> Kitchen Countertop -> Floor)
  let appSlideTimer = null;

  function stopAppSlideTimer() {
    if (appSlideTimer) {
      clearInterval(appSlideTimer);
      appSlideTimer = null;
    }
  }

  function startAppSlideTimer() {
    stopAppSlideTimer();
    const item = GRANITE_PRODUCTS[currentProductIndex];
    if (!item || !Array.isArray(item.applicationImages) || item.applicationImages.length <= 1) {
      return;
    }
    appSlideTimer = setInterval(() => {
      renderAppSlide(currentAppSlideIndex + 1);
    }, 1000);
  }

  function renderAppSlide(slideIdx) {
    const item = GRANITE_PRODUCTS[currentProductIndex];
    if (!item) return;

    const hasApps = Array.isArray(item.applicationImages) && item.applicationImages.length > 0;

    if (galleryArrowPrev) galleryArrowPrev.style.display = hasApps ? 'flex' : 'none';
    if (galleryArrowNext) galleryArrowNext.style.display = hasApps ? 'flex' : 'none';

    if (!hasApps) {
      stopAppSlideTimer();
      if (galleryStageImg) {
        galleryStageImg.onerror = null;
        galleryStageImg.src = resolveSrc(item.archImage || item.image);
        galleryStageImg.alt = `${item.name} Architectural Installation`;
      }
      if (galleryBadgeLabel) {
        galleryBadgeLabel.textContent = `${item.name} · Architectural Environment`;
      }
      return;
    }

    const totalSlides = item.applicationImages.length;
    currentAppSlideIndex = ((slideIdx % totalSlides) + totalSlides) % totalSlides;
    const currentApp = item.applicationImages[currentAppSlideIndex];

    if (galleryBadgeLabel) {
      galleryBadgeLabel.textContent = `${item.name} · ${currentApp.label}`;
    }

    if (galleryStageImg) {
      const targetSrc = resolveSrc(currentApp.src);
      galleryStageImg.onerror = null;
      galleryStageImg.src = targetSrc;
      galleryStageImg.alt = `${item.name} installed in ${currentApp.label}`;
    }
  }

  // 6. Select Active Granite Product
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

    // Update Main Slab Image immediately
    if (productSlabImg) {
      productSlabImg.onerror = null;
      productSlabImg.src = resolveSrc(item.image);
      productSlabImg.alt = `${item.name} Granite Slab`;
    }

    // Render Application Slider immediately for selected granite (Slide 1: Stairs) & start 1s auto-advance
    renderAppSlide(0);
    startAppSlideTimer();

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

  // 7. View Switcher Mode
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

    if (viewIdx === 0) {
      productSlabImg.src = resolveSrc(item.image);
    } else if (viewIdx === 1) {
      productSlabImg.src = resolveSrc(item.macroImage);
    } else {
      productSlabImg.onerror = null;
      productSlabImg.src = resolveSrc(item.archImage);
    }
  }

  viewDots.forEach((dot, idx) => {
    dot.addEventListener('click', () => setViewMode(idx));
  });
  verticalDots.forEach((dot, idx) => {
    dot.addEventListener('click', () => setViewMode(idx));
  });

  // 8. Application Slider Controls & Swipe Support
  if (galleryArrowPrev) {
    galleryArrowPrev.addEventListener('click', () => {
      renderAppSlide(currentAppSlideIndex - 1);
      startAppSlideTimer();
    });
  }

  if (galleryArrowNext) {
    galleryArrowNext.addEventListener('click', () => {
      renderAppSlide(currentAppSlideIndex + 1);
      startAppSlideTimer();
    });
  }

  // Touch Swipe Support for Application Slider
  if (galleryStage) {
    let touchStartX = 0;
    galleryStage.addEventListener('touchstart', (e) => {
      if (e.changedTouches && e.changedTouches[0]) {
        touchStartX = e.changedTouches[0].screenX;
      }
    }, { passive: true });

    galleryStage.addEventListener('touchend', (e) => {
      if (e.changedTouches && e.changedTouches[0]) {
        const touchEndX = e.changedTouches[0].screenX;
        const diffX = touchEndX - touchStartX;
        if (Math.abs(diffX) > 40) {
          if (diffX < 0) {
            renderAppSlide(currentAppSlideIndex + 1);
          } else {
            renderAppSlide(currentAppSlideIndex - 1);
          }
          startAppSlideTimer();
        }
      }
    }, { passive: true });
  }

  // Auto-advance visibility handling (pause when tab hidden, resume when visible)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAppSlideTimer();
    } else {
      startAppSlideTimer();
    }
  });

  // 9. Render All Granites in Carousel
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
          <img src="${resolveSrc(item.image)}" alt="${item.name} Swatch" loading="lazy">
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

  // 10. Carousel Controls
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
