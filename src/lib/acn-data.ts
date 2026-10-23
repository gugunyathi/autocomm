export type Hue = "teal" | "purple" | "amber";

export type Store = {
  id: string;
  name: string;
  icon: string;
  cat: string;
  hue: Hue;
  dist: number; // in meters (20m - 50m outdoor, 5m - 20m indoor)
  item: string;
  open: number;
  tag: string;
  image: string; // Product photo of the item on special
  specialBadge?: string;
  lat: number; // simulated GPS latitude offset
  lng: number; // simulated GPS longitude offset
  bearing: number; // 0-360 degrees bearing angle from user location
  bleBeaconId?: string; // Indoor Bluetooth Low Energy node UUID
  rssi?: number; // BLE signal strength in dBm (-35 to -85)
  // Company logo & mall metadata
  companyLogoSymbol?: string; // Official brand badge / text logo
  brandBgColor?: string; // Official brand background color
  brandTextColor?: string; // Official brand text color
  mallName?: string; // e.g. "Bel Air Shopping Centre"
  mallUrl?: string; // Google Maps link to the shopping centre
  promoDetails?: string; // Extended sale / deal offer promo description
  mallId?: string;
  products?: import("./mall-types").RealProduct[];
};

export {
  ALL_MALLS,
  MALL_MAP,
  getMallById,
  findStoreById,
  findProductsByStoreId,
  BEL_AIR_MALL,
  JACKAL_CREEK_MALL,
  BLUEBERRY_SQUARE_MALL,
  NORTHGATE_MALL,
  FOURWAYS_MALL,
} from "./malls";

// Curated high-quality, fast-loading Unsplash product photos for items on special
// 8 Real-World Retail Outlets physically located at Bel Air Shopping Centre (North Riding, Randburg)
export const BEL_AIR_STORES: Store[] = [
  {
    id: "woolworths-belair",
    name: "Woolworths Food",
    icon: "🛒",
    cat: "Gourmet Grocery",
    hue: "teal",
    dist: 8,
    item: "Fresh Organic Produce Box & Baguette",
    open: 350,
    tag: "Grocery",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
    specialBadge: "SAVE R105 · FRESH HARVEST",
    lat: -26.05942,
    lng: 27.95827,
    bearing: 45, // North-East Promenade
    bleBeaconId: "acn-belair-woolies-01",
    rssi: -42,
    companyLogoSymbol: "WOOLWORTHS",
    brandBgColor: "#000000",
    brandTextColor: "#ffffff",
    mallName: "Bel Air Shopping Centre",
    mallUrl: "https://maps.app.goo.gl/GQsaq4NcCUjDWZEt8",
    promoDetails:
      "Daily Difference: Save R105 instantly on premium fresh produce and bakery bundle.",
  },
  {
    id: "clicks-belair",
    name: "Clicks Pharmacy",
    icon: "💊",
    cat: "Health & Beauty",
    hue: "teal",
    dist: 12,
    item: "Vitamin C + Zinc Immunity Pack",
    open: 280,
    tag: "Skincare",
    image:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
    specialBadge: "3-FOR-2 · FEEL GOOD",
    lat: -26.05938,
    lng: 27.95835,
    bearing: 90, // East Wing
    bleBeaconId: "acn-belair-clicks-02",
    rssi: -48,
    companyLogoSymbol: "💊 CLICKS",
    brandBgColor: "#0284c7",
    brandTextColor: "#ffffff",
    mallName: "Bel Air Shopping Centre",
    mallUrl: "https://maps.app.goo.gl/GQsaq4NcCUjDWZEt8",
    promoDetails:
      "Feel Good Savings: 3-for-2 across all natural health vitamins, skincare & supplements.",
  },
  {
    id: "mugg-belair",
    name: "Mugg & Bean Kiosk",
    icon: "☕",
    cat: "Artisan Cafe",
    hue: "amber",
    dist: 6,
    item: "Mega Cappuccino + Giant Muffin",
    open: 95,
    tag: "Coffee",
    image:
      "https://images.unsplash.com/photo-1509785307050-d4066910ec1e?auto=format&fit=crop&w=600&q=80",
    specialBadge: "FREE MUFFIN COMBO",
    lat: -26.05945,
    lng: 27.95822,
    bearing: 135, // Upper Concourse
    bleBeaconId: "acn-belair-mugg-03",
    rssi: -38,
    companyLogoSymbol: "☕ M&B",
    brandBgColor: "#78350f",
    brandTextColor: "#fef3c7",
    mallName: "Bel Air Shopping Centre",
    mallUrl: "https://maps.app.goo.gl/GQsaq4NcCUjDWZEt8",
    promoDetails:
      "Muffin Combo: Get a freshly baked giant muffin with any mega artisan cappuccino.",
  },
  {
    id: "exclusive-belair",
    name: "Exclusive Books",
    icon: "📚",
    cat: "Books & Leisure",
    hue: "teal",
    dist: 14,
    item: "Sunday Times Bestseller & Journal",
    open: 420,
    tag: "Books",
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
    specialBadge: "2X COFFEE CLUB PTS",
    lat: -26.05948,
    lng: 27.95831,
    bearing: 180, // South Aisle
    bleBeaconId: "acn-belair-books-04",
    rssi: -52,
    companyLogoSymbol: "📚 EB",
    brandBgColor: "#15803d",
    brandTextColor: "#ffffff",
    mallName: "Bel Air Shopping Centre",
    mallUrl: "https://maps.app.goo.gl/GQsaq4NcCUjDWZEt8",
    promoDetails: "Coffee Club Members receive double points on all top-selling hardcovers today.",
  },
  {
    id: "istore-belair",
    name: "iStore Apple",
    icon: "📱",
    cat: "Electronics",
    hue: "teal",
    dist: 16,
    item: "AirPods Pro 2 Active ANC",
    open: 5499,
    tag: "Audio",
    image:
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80",
    specialBadge: "R700 TRADE-IN BONUS",
    lat: -26.05935,
    lng: 27.95825,
    bearing: 225, // West Wing
    bleBeaconId: "acn-belair-apple-05",
    rssi: -55,
    companyLogoSymbol: " iStore",
    brandBgColor: "#0f172a",
    brandTextColor: "#ffffff",
    mallName: "Bel Air Shopping Centre",
    mallUrl: "https://maps.app.goo.gl/GQsaq4NcCUjDWZEt8",
    promoDetails:
      "Instant trade-in discount voucher applicable on AirPods Pro 2 and Mac accessories.",
  },
  {
    id: "zara-belair",
    name: "Zara Fashion",
    icon: "👗",
    cat: "Fashion",
    hue: "purple",
    dist: 9,
    item: "Oversized Tailored Wool Overcoat",
    open: 1499,
    tag: "Hoodies",
    image:
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80",
    specialBadge: "FLASH 40% OFF",
    lat: -26.05949,
    lng: 27.9582,
    bearing: 270, // Central Mall Galleria
    bleBeaconId: "acn-belair-zara-06",
    rssi: -45,
    companyLogoSymbol: "ZARA",
    brandBgColor: "#000000",
    brandTextColor: "#ffffff",
    mallName: "Bel Air Shopping Centre",
    mallUrl: "https://maps.app.goo.gl/GQsaq4NcCUjDWZEt8",
    promoDetails:
      "Runway Clearance: 40% off all structured wool coats and premium knitwear collections.",
  },
  {
    id: "nike-belair",
    name: "Nike Performance",
    icon: "👟",
    cat: "Sportswear",
    hue: "teal",
    dist: 11,
    item: "Pegasus 41 Road Running Shoes",
    open: 2599,
    tag: "Shoes",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    specialBadge: "RUNNER DROP 30%",
    lat: -26.05944,
    lng: 27.95838,
    bearing: 315, // North Wing
    bleBeaconId: "acn-belair-nike-07",
    rssi: -49,
    companyLogoSymbol: "✔️ NIKE",
    brandBgColor: "#0f172a",
    brandTextColor: "#ffffff",
    mallName: "Bel Air Shopping Centre",
    mallUrl: "https://maps.app.goo.gl/GQsaq4NcCUjDWZEt8",
    promoDetails:
      "Air Max Week: 30% instant rebate on performance footwear and dri-fit accessories.",
  },
  {
    id: "hm-belair",
    name: "H&M Boutique",
    icon: "🧥",
    cat: "Fashion",
    hue: "purple",
    dist: 15,
    item: "Recycled Down Puffer Jacket",
    open: 1299,
    tag: "Jackets",
    image:
      "https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=600&q=80",
    specialBadge: "SEASON CLEARANCE",
    lat: -26.05939,
    lng: 27.95818,
    bearing: 0, // True North Concourse
    bleBeaconId: "acn-belair-hm-08",
    rssi: -58,
    companyLogoSymbol: "H&M",
    brandBgColor: "#e11d48",
    brandTextColor: "#ffffff",
    mallName: "Bel Air Shopping Centre",
    mallUrl: "https://maps.app.goo.gl/GQsaq4NcCUjDWZEt8",
    promoDetails: "End of Season Sale: 45% off seasonal outerwear, puffers and winter knitwear.",
  },
];

// Curated high-quality, fast-loading product photos for items on special
export const INDOOR: Store[] = [
  ...BEL_AIR_STORES,
  {
    id: "nespresso",
    name: "Nespresso Bar",
    icon: "☕",
    cat: "Coffee aisle",
    hue: "amber",
    dist: 9,
    item: "Flat White + Croissant",
    open: 85,
    tag: "Coffee",
    image:
      "https://images.unsplash.com/photo-1509785307050-d4066910ec1e?auto=format&fit=crop&w=600&q=80",
    specialBadge: "MORNING COMBO",
    lat: -26.05942,
    lng: 27.95832,
    bearing: 90, // East (Central atrium)
    bleBeaconId: "acn-ble-nesp-02",
    rssi: -48,
    companyLogoSymbol: "NESPRESSO",
    brandBgColor: "#3e2723",
    brandTextColor: "#ffffff",
    mallName: "Bel Air Shopping Centre",
    mallUrl: "https://maps.app.goo.gl/GQsaq4NcCUjDWZEt8",
  },
  {
    id: "sushi",
    name: "Kauai Sushi Bar",
    icon: "🍣",
    cat: "Food court",
    hue: "purple",
    dist: 17,
    item: "Salmon Rainbow Platter",
    open: 189,
    tag: "Sushi",
    image:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80",
    specialBadge: "CHEF SPECIAL",
    lat: -26.05948,
    lng: 27.95828,
    bearing: 225, // South-West
    bleBeaconId: "acn-ble-sushi-05",
    rssi: -64,
    companyLogoSymbol: "KAUAI",
    brandBgColor: "#047857",
    brandTextColor: "#ffffff",
    mallName: "Bel Air Shopping Centre",
    mallUrl: "https://maps.app.goo.gl/GQsaq4NcCUjDWZEt8",
  },
  {
    id: "aesop",
    name: "Aesop",
    icon: "🧴",
    cat: "Beauty",
    hue: "amber",
    dist: 8,
    item: "Resurrection Hand Balm",
    open: 520,
    tag: "Skincare",
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80",
    specialBadge: "LUXURY GIFT",
    lat: -26.05945,
    lng: 27.95832,
    bearing: 270, // West
    bleBeaconId: "acn-ble-aesop-06",
    rssi: -45,
    companyLogoSymbol: "AESOP",
    brandBgColor: "#292524",
    brandTextColor: "#f5f5f4",
    mallName: "Bel Air Shopping Centre",
    mallUrl: "https://maps.app.goo.gl/GQsaq4NcCUjDWZEt8",
  },
  {
    id: "lindt",
    name: "Lindt Boutique",
    icon: "🍫",
    cat: "Confectionery",
    hue: "amber",
    dist: 5,
    item: "Truffle Gift Box",
    open: 320,
    tag: "Gifts",
    image:
      "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80",
    specialBadge: "BUY 1 GET 1",
    lat: -26.05944,
    lng: 27.95828,
    bearing: 60, // North-East
    bleBeaconId: "acn-ble-lindt-09",
    rssi: -38,
    companyLogoSymbol: "LINDT",
    brandBgColor: "#78350f",
    brandTextColor: "#fef3c7",
    mallName: "Bel Air Shopping Centre",
    mallUrl: "https://maps.app.goo.gl/GQsaq4NcCUjDWZEt8",
  },
];

export const OUTDOOR: Store[] = [
  {
    id: "vida",
    name: "Vida e Caffè",
    icon: "☕",
    cat: "Street café",
    hue: "amber",
    dist: 22,
    item: "Double Cappuccino",
    open: 48,
    tag: "Coffee",
    image:
      "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80",
    specialBadge: "2-FOR-1 COMMUTE",
    lat: -26.05952,
    lng: 27.95845,
    bearing: 30, // North-North-East
    bleBeaconId: "acn-gps-vida-10",
    rssi: -72,
    companyLogoSymbol: "VIDA",
    brandBgColor: "#dc2626",
    brandTextColor: "#ffffff",
    mallName: "Bel Air Shopping Centre",
    mallUrl: "https://maps.app.goo.gl/GQsaq4NcCUjDWZEt8",
  },
  {
    id: "incredible",
    name: "Incredible Connection",
    icon: "💻",
    cat: "Electronics",
    hue: "teal",
    dist: 41,
    item: "Mechanical Keyboard",
    open: 1899,
    tag: "Tech",
    image:
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=600&q=80",
    specialBadge: "GAMER DEALS",
    lat: -26.05958,
    lng: 27.95855,
    bearing: 75, // East-North-East
    bleBeaconId: "acn-gps-tech-11",
    rssi: -79,
    companyLogoSymbol: "INCREDIBLE",
    brandBgColor: "#0284c7",
    brandTextColor: "#ffffff",
    mallName: "Bel Air Shopping Centre",
    mallUrl: "https://maps.app.goo.gl/GQsaq4NcCUjDWZEt8",
  },
  {
    id: "adidas",
    name: "Adidas Originals",
    icon: "👟",
    cat: "Sneakers",
    hue: "teal",
    dist: 35,
    item: "Samba OG",
    open: 2199,
    tag: "Shoes",
    image:
      "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&w=600&q=80",
    specialBadge: "LIMITED DROP",
    lat: -26.05962,
    lng: 27.95842,
    bearing: 120, // East-South-East
    bleBeaconId: "acn-gps-adidas-12",
    rssi: -76,
    companyLogoSymbol: "ADIDAS",
    brandBgColor: "#000000",
    brandTextColor: "#ffffff",
    mallName: "Bel Air Shopping Centre",
    mallUrl: "https://maps.app.goo.gl/GQsaq4NcCUjDWZEt8",
  },
  {
    id: "kfc",
    name: "Mochi Ramen House",
    icon: "🍜",
    cat: "Restaurant",
    hue: "purple",
    dist: 28,
    item: "Tonkotsu Ramen",
    open: 165,
    tag: "Ramen",
    image:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80",
    specialBadge: "LUNCH SPECIAL",
    lat: -26.05954,
    lng: 27.95825,
    bearing: 160, // South-South-East
    bleBeaconId: "acn-gps-ramen-13",
    rssi: -74,
    companyLogoSymbol: "MOCHI RAMEN",
    brandBgColor: "#e11d48",
    brandTextColor: "#ffffff",
    mallName: "Bel Air Shopping Centre",
    mallUrl: "https://maps.app.goo.gl/GQsaq4NcCUjDWZEt8",
  },
  {
    id: "markham",
    name: "Markham",
    icon: "👔",
    cat: "Menswear",
    hue: "purple",
    dist: 46,
    item: "Slim Chino + Tee Combo",
    open: 799,
    tag: "Fashion",
    image:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
    specialBadge: "SUMMER ESSENTIAL",
    lat: -26.05965,
    lng: 27.95815,
    bearing: 200, // South-South-West
    bleBeaconId: "acn-gps-mark-14",
    rssi: -82,
    companyLogoSymbol: "MARKHAM",
    brandBgColor: "#0f172a",
    brandTextColor: "#ffffff",
    mallName: "Bel Air Shopping Centre",
    mallUrl: "https://maps.app.goo.gl/GQsaq4NcCUjDWZEt8",
  },
  {
    id: "dischem",
    name: "Dis-Chem",
    icon: "💊",
    cat: "Pharmacy",
    hue: "teal",
    dist: 31,
    item: "Vitamin C Bundle",
    open: 260,
    tag: "Health",
    image:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
    specialBadge: "HEALTH REWARDS",
    lat: -26.05951,
    lng: 27.95812,
    bearing: 240, // West-South-West
    bleBeaconId: "acn-gps-pharm-15",
    rssi: -75,
    companyLogoSymbol: "DIS-CHEM",
    brandBgColor: "#059669",
    brandTextColor: "#ffffff",
    mallName: "Bel Air Shopping Centre",
    mallUrl: "https://maps.app.goo.gl/GQsaq4NcCUjDWZEt8",
  },
  {
    id: "woolies",
    name: "Woolworths Food",
    icon: "🥑",
    cat: "Grocer",
    hue: "amber",
    dist: 49,
    item: "Weekend Brunch Box",
    open: 410,
    tag: "Groceries",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
    specialBadge: "FRESH HARVEST",
    lat: -33.9254,
    lng: 18.4236,
    bearing: 280, // West-North-West
    bleBeaconId: "acn-gps-wool-16",
    rssi: -84,
  },
  {
    id: "cotton",
    name: "Cotton On",
    icon: "🧢",
    cat: "Streetwear",
    hue: "purple",
    dist: 38,
    item: "Graphic Hoodie",
    open: 499,
    tag: "Hoodies",
    image:
      "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=600&q=80",
    specialBadge: "STREETWEAR DROP",
    lat: -33.92512,
    lng: 18.4235,
    bearing: 310, // North-West
    bleBeaconId: "acn-gps-cotton-17",
    rssi: -78,
  },
  {
    id: "sushi2",
    name: "Tokyo Street Sushi",
    icon: "🍣",
    cat: "Takeaway",
    hue: "amber",
    dist: 25,
    item: "Dragon Roll Combo",
    open: 210,
    tag: "Sushi",
    image:
      "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=600&q=80",
    specialBadge: "DAILY SPECIAL",
    lat: -33.92475,
    lng: 18.42368,
    bearing: 345, // North-North-West
    bleBeaconId: "acn-gps-sushi2-18",
    rssi: -73,
  },
  {
    id: "samsung",
    name: "Samsung Experience",
    icon: "⌚",
    cat: "Electronics",
    hue: "teal",
    dist: 44,
    item: "Galaxy Watch 7",
    open: 5999,
    tag: "Wearables",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
    specialBadge: "FLAGSHIP LAUNCH",
    lat: -33.92465,
    lng: 18.4242,
    bearing: 15, // North-North-East
    bleBeaconId: "acn-gps-sam-19",
    rssi: -80,
  },
  {
    id: "bike",
    name: "Cycle Lab",
    icon: "🚲",
    cat: "Outdoor",
    hue: "purple",
    dist: 33,
    item: "Smart Bike Light",
    open: 690,
    tag: "Cycling",
    image:
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80",
    specialBadge: "COMMUTER PACK",
    lat: -33.9249,
    lng: 18.42445,
    bearing: 100, // East
    bleBeaconId: "acn-gps-bike-20",
    rssi: -77,
  },
];

export const TICKS = [
  "Agent negotiating {tag}…",
  "Price dropped by {n}%…",
  "Checking stock levels…",
  "Loyalty points verified",
  "Counter-offer sent: R{p}",
  "Bundling discount detected",
  "Handshake signed ✓",
  "Comparing 3 nearby rivals…",
];

export const hueVar: Record<Hue, string> = {
  teal: "var(--primary)",
  purple: "var(--secondary)",
  amber: "var(--accent)",
};

export const fill = (t: string, s: Store) =>
  t
    .replace("{tag}", s.tag.toLowerCase())
    .replace("{n}", String(5 + Math.floor(Math.random() * 20)))
    .replace("{p}", String(Math.round(s.open * (0.7 + Math.random() * 0.2))));
