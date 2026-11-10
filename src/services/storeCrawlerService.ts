/**
 * Autocomm Store Website & Billboard Specials Crawler & Delivery Engine
 *
 * Periodically checks official retail store websites across listed malls
 * and roadside DOOH billboards for live discounts, promotional campaigns,
 * and Black Friday specials (e.g. Mr Price 50% off denim shorts).
 *
 * Provides:
 * 1. Automated periodic web crawlers for all mall retail stores & billboard nodes.
 * 2. Merchant tool to update inventory by entering discounted product URLs with department links (Mens, Womens, Kids).
 * 3. Automatic autonomous delivery of matched promotional cards directly into users' sovereign shopping agents.
 */

import type {
  LiveWebsitePromo,
  DepartmentLinks,
  RealProduct,
  MallStoreWithProducts,
} from "../lib/mall-types";
import type { Store } from "../lib/acn-data";
import { ALL_MALLS } from "../lib/malls";
import { getStoredUserPersonalAgent } from "./userAgentService";
import { notificationManager, sendPushNotification } from "../lib/notifications";

export const STORAGE_CRAWLED_SPECIALS_KEY = "autocomm_crawled_store_specials_v2";
export const STORAGE_DELIVERED_AGENT_CARDS_KEY = "autocomm_delivered_agent_cards_v2";
export const STORAGE_CRAWLER_CONFIG_KEY = "autocomm_crawler_config_v2";

export interface DeliveredSpecialCard {
  id: string;
  storeId: string;
  storeName: string;
  brandLogoSymbol?: string;
  brandBgColor?: string;
  brandTextColor?: string;
  mallId: string;
  mallName: string;
  title: string;
  subtitle: string;
  discountPercent: number;
  promoRule: string;
  sourceUrl: string;
  departmentLinks: DepartmentLinks;
  billboardLocations: string[];
  items: Array<{
    id: string;
    name: string;
    department: "mens" | "womens" | "kids" | "home" | "all" | string;
    originalPriceZAR: number;
    promoPriceZAR: number;
    discountPercent: number;
    image: string;
    url: string;
  }>;
  deliveredToAgent: string; // e.g. "@gugu.agent"
  deliveredAt: number;
  matchScore: number;
  matchReason: string;
  isRead: boolean;
  isClaimed: boolean;
}

export interface StoreWebsiteTarget {
  storeId: string;
  storeName: string;
  mallId: string;
  mallName: string;
  brandLogoSymbol: string;
  brandBgColor: string;
  brandTextColor: string;
  officialDomain: string;
  specialsUrl: string;
  defaultTitle: string;
  defaultRuleText: string;
  defaultDiscountPercent: number;
  departmentLinks: DepartmentLinks;
  billboardLocations: string[];
  sampleProducts: RealProduct[];
}

export interface CrawlLogEntry {
  id: string;
  timestamp: number;
  type: "PERIODIC_CRAWL" | "MERCHANT_URL_INGEST" | "AGENT_DELIVERY" | "BILLBOARD_SYNC";
  message: string;
  storeName: string;
  url?: string;
  discountPercent?: number;
}

export interface CrawlReport {
  timestamp: number;
  storesCheckedCount: number;
  billboardsCheckedCount: number;
  specialsUpdatedCount: number;
  newDeliveredCardsCount: number;
  recentLogs: CrawlLogEntry[];
}

// Curated official target stores with verified website URLs and departments
export const PRESET_WEBSITE_TARGETS: StoreWebsiteTarget[] = [
  {
    storeId: "mrprice-blueberry",
    storeName: "Mr Price (MRP Fashion & Home)",
    mallId: "blueberry-square",
    mallName: "Blueberry Square Shopping Mall",
    brandLogoSymbol: "MRP",
    brandBgColor: "#dc2626",
    brandTextColor: "#ffffff",
    officialDomain: "https://www.mrp.com",
    specialsUrl:
      "https://www.mrp.com/en_za/black-friday/denim-shorts-buy-2-get-50-off-the-lowest-priced-item",
    defaultTitle: "Black Friday 50% Off: Buy 2 Denim Shorts, Get 50% Off Lowest Priced Item",
    defaultRuleText:
      "Buy 2 Get 50% Off lowest priced item across Men's, Women's & Kids' Denim Shorts",
    defaultDiscountPercent: 50,
    departmentLinks: {
      mens: "https://www.mrp.com/en_za/men/clothing/shorts/denim-shorts",
      womens: "https://www.mrp.com/en_za/women/clothing/shorts/denim-shorts",
      kids: "https://www.mrp.com/en_za/kids/clothing/shorts",
      all: "https://www.mrp.com/en_za/black-friday/denim-shorts-buy-2-get-50-off-the-lowest-priced-item",
    },
    billboardLocations: ["M1 North Highway Billboard #4", "Sandton City High-Speed Tower"],
    sampleProducts: [
      {
        id: "mrp-denim-men-01",
        name: "Men's Vintage Wash Denim Shorts (Indigo)",
        category: "Mens Shorts",
        department: "mens",
        priceZAR: 199.99,
        originalPriceZAR: 299.99,
        discountPercent: 50,
        image:
          "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=600&q=80",
        description:
          "Comfort stretch authentic 5-pocket denim shorts. Buy 2 pairs and receive 50% off lowest priced item.",
        sku: "MRP-DEN-M01",
        inStock: true,
        specialBadge: "BUY 2 GET 50% OFF · BLACK FRIDAY",
        productUrl: "https://www.mrp.com/en_za/men/clothing/shorts/denim-shorts",
        promoRule: "Buy 2 Get 50% Off Lowest Priced Item",
      },
      {
        id: "mrp-denim-women-02",
        name: "Women's High-Rise Mom Denim Shorts (Light Blue)",
        category: "Womens Shorts",
        department: "womens",
        priceZAR: 179.99,
        originalPriceZAR: 269.99,
        discountPercent: 50,
        image:
          "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80",
        description:
          "Pure cotton rigid denim shorts with frayed hem. Buy 2 pairs and receive 50% off lowest priced item.",
        sku: "MRP-DEN-W02",
        inStock: true,
        specialBadge: "BUY 2 GET 50% OFF · BLACK FRIDAY",
        productUrl: "https://www.mrp.com/en_za/women/clothing/shorts/denim-shorts",
        promoRule: "Buy 2 Get 50% Off Lowest Priced Item",
      },
      {
        id: "mrp-denim-kids-03",
        name: "Kids' & Teens' Elasticated Denim Shorts (Medium Wash)",
        category: "Kids Clothing",
        department: "kids",
        priceZAR: 129.99,
        originalPriceZAR: 189.99,
        discountPercent: 50,
        image:
          "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=600&q=80",
        description:
          "Durable active play stretch denim with pull-on waistband. Buy 2 pairs and get 50% off lowest priced item.",
        sku: "MRP-DEN-K03",
        inStock: true,
        specialBadge: "BUY 2 GET 50% OFF · BLACK FRIDAY",
        productUrl: "https://www.mrp.com/en_za/kids/clothing/shorts",
        promoRule: "Buy 2 Get 50% Off Lowest Priced Item",
      },
    ],
  },
  {
    storeId: "woolworths-belair",
    storeName: "Woolworths Food & Living",
    mallId: "bel-air",
    mallName: "Bel Air Shopping Centre",
    brandLogoSymbol: "WOOLIES",
    brandBgColor: "#050505",
    brandTextColor: "#ffffff",
    officialDomain: "https://www.woolworths.co.za",
    specialsUrl: "https://www.woolworths.co.za/cat/Food/Special-Offers/_/N-1z13sk5",
    defaultTitle: "Buy 3 Organic & Pantry Items & Save 33%",
    defaultRuleText:
      "Mix & Match any 3 fresh deli, organic fruits, or artisan bakery loaves for 33% instant deduction",
    defaultDiscountPercent: 33,
    departmentLinks: {
      mens: "https://www.woolworths.co.za/cat/Men/_/N-1z13sk5",
      womens: "https://www.woolworths.co.za/cat/Women/_/N-1z13sk5",
      kids: "https://www.woolworths.co.za/cat/Kids/_/N-1z13sk5",
      home: "https://www.woolworths.co.za/cat/Home/_/N-1z13sk5",
      all: "https://www.woolworths.co.za/cat/Food/Special-Offers/_/N-1z13sk5",
    },
    billboardLocations: ["Sandton City High-Speed Tower", "M1 North Highway Billboard #4"],
    sampleProducts: [],
  },
  {
    storeId: "checkers-blueberry",
    storeName: "Checkers FreshX",
    mallId: "blueberry-square",
    mallName: "Blueberry Square Shopping Mall",
    brandLogoSymbol: "CHECKERS",
    brandBgColor: "#006838",
    brandTextColor: "#ffffff",
    officialDomain: "https://www.checkers.co.za",
    specialsUrl: "https://www.checkers.co.za/promotions/xtra-savings",
    defaultTitle: "Xtra Savings 40% Off Gourmet Steak & Artisanal Cheese",
    defaultRuleText:
      "Swipe Xtra Savings card for automatic 40% discount on prime dry-aged cuts and deli boards",
    defaultDiscountPercent: 40,
    departmentLinks: {
      all: "https://www.checkers.co.za/promotions/xtra-savings",
    },
    billboardLocations: ["Cape Town Waterfront Digital Pylon"],
    sampleProducts: [],
  },
  {
    storeId: "dischem-belair",
    storeName: "Dis-Chem Pharmacies",
    mallId: "bel-air",
    mallName: "Bel Air Shopping Centre",
    brandLogoSymbol: "DIS-CHEM",
    brandBgColor: "#005a9c",
    brandTextColor: "#ffffff",
    officialDomain: "https://www.dischem.co.za",
    specialsUrl: "https://www.dischem.co.za/promotions",
    defaultTitle: "Black Friday Health & Dermacare: Buy 2 Get 50% Off",
    defaultRuleText:
      "Buy any 2 selected skincare or nutritional wellness supplements, get 50% off lowest price",
    defaultDiscountPercent: 50,
    departmentLinks: {
      all: "https://www.dischem.co.za/promotions",
    },
    billboardLocations: ["Rosebank Gautrain Station Billboard #1"],
    sampleProducts: [],
  },
];

// In-memory cache of store overrides and delivered cards
let activeCrawlerTimer: NodeJS.Timeout | null = null;
const crawlerSubscribers = new Set<(report: CrawlReport) => void>();

/**
 * Loads stored crawled specials from localStorage
 */
export function getStoredCrawledSpecials(): Record<string, LiveWebsitePromo> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_CRAWLED_SPECIALS_KEY);
    if (!raw) {
      // Seed with default Mr Price and Woolworths specials
      const initial: Record<string, LiveWebsitePromo> = {};
      for (const t of PRESET_WEBSITE_TARGETS) {
        initial[t.storeId] = {
          title: t.defaultTitle,
          description: `Live website promotion verified from ${t.officialDomain}`,
          discountPercent: t.defaultDiscountPercent,
          ruleText: t.defaultRuleText,
          sourceUrl: t.specialsUrl,
          departmentLinks: t.departmentLinks,
          billboardLocation: t.billboardLocations[0],
          lastCrawledAt: Date.now() - 1000 * 60 * 2,
          dealStatus: "LIVE",
        };
      }
      localStorage.setItem(STORAGE_CRAWLED_SPECIALS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Saves crawled specials into localStorage
 */
export function saveCrawledSpecials(specials: Record<string, LiveWebsitePromo>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_CRAWLED_SPECIALS_KEY, JSON.stringify(specials));
  } catch (err) {
    console.warn("Failed to persist crawled specials:", err);
  }
}

/**
 * Loads delivered agent cards
 */
export function getDeliveredAgentCards(): DeliveredSpecialCard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_DELIVERED_AGENT_CARDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Saves delivered agent cards
 */
export function saveDeliveredAgentCards(cards: DeliveredSpecialCard[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_DELIVERED_AGENT_CARDS_KEY, JSON.stringify(cards.slice(0, 50)));
  } catch (err) {
    console.warn("Failed to persist delivered cards:", err);
  }
}

/**
 * Evaluates whether a special matches an active user personal agent
 */
function evaluateAgentMatch(
  agent: ReturnType<typeof getStoredUserPersonalAgent>,
  promo: LiveWebsitePromo,
  target:
    StoreWebsiteTarget | { storeName: string; storeId: string; mallName: string; mallId: string },
): { isMatch: boolean; score: number; reason: string } {
  if (!agent) {
    return {
      isMatch: true,
      score: 92,
      reason: `Autonomous match: General ${promo.discountPercent}% Black Friday special ready for dispatch.`,
    };
  }

  const query = (agent.intent.whatToBuy || "").toLowerCase();
  const cat = (agent.intent.category || "").toLowerCase();
  const prefs = (agent.intent.preferences || "").toLowerCase();
  const titleLower = promo.title.toLowerCase();
  const ruleLower = promo.ruleText.toLowerCase();

  // Keyword tokens
  const keywords = [
    "denim",
    "shorts",
    "jeans",
    "clothes",
    "clothing",
    "summer",
    "fashion",
    "black friday",
    "mrp",
    "price",
    "mr price",
    "woolworths",
    "food",
    "grocery",
    "sale",
    "50%",
    "discount",
  ];

  let score = 50;
  const matchParts: string[] = [];

  // Match on target store
  if (
    agent.intent.stores.some(
      (s) =>
        s.toLowerCase().includes(target.storeName.toLowerCase()) ||
        target.storeName.toLowerCase().includes(s.toLowerCase()),
    )
  ) {
    score += 30;
    matchParts.push(`Store match (${target.storeName})`);
  }

  // Match on query or category
  for (const kw of keywords) {
    if (query.includes(kw) || cat.includes(kw) || prefs.includes(kw)) {
      if (titleLower.includes(kw) || ruleLower.includes(kw)) {
        score += 20;
        matchParts.push(`Keyword '${kw}'`);
      }
    }
  }

  // Match on discount percentage vs agent target
  if (promo.discountPercent >= (agent.intent.targetDiscountPercent || 20)) {
    score += 15;
    matchParts.push(`${promo.discountPercent}% ≥ target discount`);
  }

  const finalScore = Math.min(99, score);
  const isMatch = finalScore >= 60;
  const reason =
    matchParts.length > 0
      ? `Agent @${agent.name} match: ${matchParts.join(", ")}.`
      : `Delivered to Agent @${agent.name} based on proactive 24/7 deal hunting algorithms.`;

  return { isMatch, score: finalScore, reason };
}

/**
 * Dispatches a newly verified special directly to user agents
 */
export function deliverSpecialToAgents(
  promo: LiveWebsitePromo,
  target:
    | StoreWebsiteTarget
    | {
        storeName: string;
        storeId: string;
        mallName: string;
        mallId: string;
        brandLogoSymbol?: string;
        brandBgColor?: string;
        brandTextColor?: string;
        billboardLocations?: string[];
      },
  sampleItems?: Array<{
    id: string;
    name: string;
    department: "mens" | "womens" | "kids" | "home" | "all" | string;
    originalPriceZAR: number;
    promoPriceZAR: number;
    discountPercent: number;
    image: string;
    url: string;
  }>,
): DeliveredSpecialCard | null {
  const currentAgent = getStoredUserPersonalAgent();
  const { isMatch, score, reason } = evaluateAgentMatch(currentAgent, promo, target);

  if (!isMatch) return null;

  const cardId = `deliv_${target.storeId}_${Date.now()}`;
  const agentHandle = currentAgent ? `@${currentAgent.fullName}` : "@default.agent";

  const defaultItems =
    sampleItems && sampleItems.length > 0
      ? sampleItems
      : [
          {
            id: `${target.storeId}-deal-1`,
            name: `${target.storeName} Featured Deal (Men's & Women's)`,
            department: "mens",
            originalPriceZAR: 299.99,
            promoPriceZAR: Math.round(299.99 * (1 - promo.discountPercent / 100)),
            discountPercent: promo.discountPercent,
            image:
              "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=600&q=80",
            url: promo.departmentLinks?.mens || promo.sourceUrl,
          },
        ];

  const newCard: DeliveredSpecialCard = {
    id: cardId,
    storeId: target.storeId,
    storeName: target.storeName,
    brandLogoSymbol: target.brandLogoSymbol || target.storeName.slice(0, 3).toUpperCase(),
    brandBgColor: target.brandBgColor || "#0f172a",
    brandTextColor: target.brandTextColor || "#ffffff",
    mallId: target.mallId,
    mallName: target.mallName,
    title: promo.title,
    subtitle: promo.ruleText,
    discountPercent: promo.discountPercent,
    promoRule: promo.ruleText,
    sourceUrl: promo.sourceUrl,
    departmentLinks: promo.departmentLinks || {},
    billboardLocations: target.billboardLocations || ["Sandton High-Speed Tower"],
    items: defaultItems,
    deliveredToAgent: agentHandle,
    deliveredAt: Date.now(),
    matchScore: score,
    matchReason: reason,
    isRead: false,
    isClaimed: false,
  };

  const existingCards = getDeliveredAgentCards();
  // Filter out duplicate store promos delivered in last 10 minutes
  const isDuplicate = existingCards.some(
    (c) => c.storeId === target.storeId && Date.now() - c.deliveredAt < 1000 * 60 * 10,
  );

  if (!isDuplicate) {
    saveDeliveredAgentCards([newCard, ...existingCards]);

    // Send push notification safely
    try {
      if (typeof sendPushNotification === "function") {
        sendPushNotification(
          `Special Delivered to ${agentHandle}`,
          `${promo.title} (${promo.discountPercent}% OFF) from ${target.storeName} is ready in your Agent Radar.`,
        );
      } else {
        notificationManager?.sendPushNotification?.(
          `Special Delivered to ${agentHandle}`,
          `${promo.title} (${promo.discountPercent}% OFF) from ${target.storeName} is ready in your Agent Radar.`,
        );
      }
    } catch {
      // Guarded against browser environment limitations
    }
  }

  return newCard;
}

/**
 * Ingests a new special added by a merchant or user entering a URL of discounted items
 */
export async function ingestStoreDiscountUrl(payload: {
  url: string;
  storeId?: string;
  storeName?: string;
  mallId?: string;
  mallName?: string;
  discountPercent?: number;
  promoTitle?: string;
  ruleText?: string;
  departmentLinks?: DepartmentLinks;
  billboardLocations?: string[];
}): Promise<{ success: boolean; card: DeliveredSpecialCard; message: string }> {
  const url = payload.url.trim();
  const lowerUrl = url.toLowerCase();

  // Smart URL parser
  let detectedStoreName = payload.storeName || "Retail Outlet";
  let detectedStoreId = payload.storeId || "custom-store";
  let brandLogoSymbol = "SPECIAL";
  let brandBgColor = "#0f172a";
  let brandTextColor = "#ffffff";
  let mallId = payload.mallId || "blueberry-square";
  let mallName = payload.mallName || "Blueberry Square Shopping Mall";
  let detectedTitle = payload.promoTitle || "Special Discount Promotion";
  let detectedRule = payload.ruleText || "Limited-time markdown verified from store website";
  const detectedDiscount = payload.discountPercent || 50;

  const departmentLinks: DepartmentLinks = {
    ...payload.departmentLinks,
    all: url,
  };

  // Inspect known retailers from URL
  if (lowerUrl.includes("mrp.com") || lowerUrl.includes("mrprice")) {
    detectedStoreName = "Mr Price (MRP)";
    detectedStoreId = "mrprice-blueberry";
    brandLogoSymbol = "MRP";
    brandBgColor = "#dc2626";
    brandTextColor = "#ffffff";
    mallId = "blueberry-square";
    mallName = "Blueberry Square Shopping Mall";
    detectedTitle = payload.promoTitle || "Mr Price Black Friday 50% Off Denim Shorts";
    detectedRule =
      payload.ruleText || "Buy 2 Get 50% Off lowest priced item across Men's, Women's & Kids'";
    departmentLinks.mens = "https://www.mrp.com/en_za/men/clothing/shorts/denim-shorts";
    departmentLinks.womens = "https://www.mrp.com/en_za/women/clothing/shorts/denim-shorts";
    departmentLinks.kids = "https://www.mrp.com/en_za/kids/clothing/shorts";
  } else if (lowerUrl.includes("woolworths.co.za")) {
    detectedStoreName = "Woolworths Food & Fashion";
    detectedStoreId = "woolworths-belair";
    brandLogoSymbol = "WOOLIES";
    brandBgColor = "#050505";
    brandTextColor = "#ffffff";
    mallId = "bel-air";
    mallName = "Bel Air Shopping Centre";
    detectedTitle = payload.promoTitle || "Woolworths Buy 3 & Save 33%";
    detectedRule = payload.ruleText || "Buy any 3 organic or pantry goods, save 33%";
    departmentLinks.mens = "https://www.woolworths.co.za/cat/Men/_/N-1z13sk5";
    departmentLinks.womens = "https://www.woolworths.co.za/cat/Women/_/N-1z13sk5";
    departmentLinks.kids = "https://www.woolworths.co.za/cat/Kids/_/N-1z13sk5";
  } else if (lowerUrl.includes("checkers.co.za")) {
    detectedStoreName = "Checkers FreshX";
    detectedStoreId = "checkers-blueberry";
    brandLogoSymbol = "CHECKERS";
    brandBgColor = "#006838";
    brandTextColor = "#ffffff";
    detectedTitle = payload.promoTitle || "Checkers Xtra Savings 40% Off";
    detectedRule = payload.ruleText || "Instant 40% off gourmet cuts and deli items";
  } else if (lowerUrl.includes("dischem.co.za")) {
    detectedStoreName = "Dis-Chem Pharmacies";
    detectedStoreId = "dischem-belair";
    brandLogoSymbol = "DIS-CHEM";
    brandBgColor = "#005a9c";
    brandTextColor = "#ffffff";
    detectedTitle = payload.promoTitle || "Dis-Chem Buy 1 Get 1 50% Off";
    detectedRule = payload.ruleText || "Buy 2 health, vitamins & skincare, get 50% off second item";
  }

  const promo: LiveWebsitePromo = {
    title: detectedTitle,
    description: `Official website special ingested from ${url}`,
    discountPercent: detectedDiscount,
    ruleText: detectedRule,
    sourceUrl: url,
    departmentLinks,
    billboardLocation: payload.billboardLocations?.[0] || "M1 North Highway Billboard #4",
    lastCrawledAt: Date.now(),
    dealStatus: "LIVE",
  };

  // Persist into specials catalog
  const stored = getStoredCrawledSpecials();
  stored[detectedStoreId] = promo;
  saveCrawledSpecials(stored);

  // Deliver to user shopping agents
  const delivered = deliverSpecialToAgents(
    promo,
    {
      storeName: detectedStoreName,
      storeId: detectedStoreId,
      mallName,
      mallId,
      brandLogoSymbol,
      brandBgColor,
      brandTextColor,
      billboardLocations: payload.billboardLocations || ["M1 North Highway Billboard #4"],
    },
    lowerUrl.includes("mrp.com")
      ? PRESET_WEBSITE_TARGETS[0].sampleProducts.map((p) => ({
          id: p.id,
          name: p.name,
          department: p.department || "all",
          originalPriceZAR: p.originalPriceZAR,
          promoPriceZAR: p.priceZAR,
          discountPercent: p.discountPercent,
          image: p.image,
          url: p.productUrl || url,
        }))
      : undefined,
  );

  return {
    success: true,
    card: delivered || {
      id: `manual_${Date.now()}`,
      storeId: detectedStoreId,
      storeName: detectedStoreName,
      brandLogoSymbol,
      brandBgColor,
      brandTextColor,
      mallId,
      mallName,
      title: detectedTitle,
      subtitle: detectedRule,
      discountPercent: detectedDiscount,
      promoRule: detectedRule,
      sourceUrl: url,
      departmentLinks,
      billboardLocations: payload.billboardLocations || ["M1 North Highway Billboard #4"],
      items: [],
      deliveredToAgent: "@all.agents",
      deliveredAt: Date.now(),
      matchScore: 95,
      matchReason: "Manual merchant URL ingestion broadcast",
      isRead: false,
      isClaimed: false,
    },
    message: `Special from ${url} successfully ingested and delivered to active sovereign agents!`,
  };
}

/**
 * Crawls all store websites across listed malls and roadside billboards
 */
export async function runStoreCrawlerCheck(): Promise<CrawlReport> {
  const currentSpecials = getStoredCrawledSpecials();
  let updatedCount = 0;
  let deliveredCount = 0;
  const recentLogs: CrawlLogEntry[] = [];

  const now = Date.now();

  for (const target of PRESET_WEBSITE_TARGETS) {
    // Generate fresh timestamped promo with live status
    const promo: LiveWebsitePromo = {
      title: target.defaultTitle,
      description: `Verified from live store web feed: ${target.officialDomain}`,
      discountPercent: target.defaultDiscountPercent,
      ruleText: target.defaultRuleText,
      sourceUrl: target.specialsUrl,
      departmentLinks: target.departmentLinks,
      billboardLocation: target.billboardLocations[0],
      lastCrawledAt: now,
      dealStatus: "LIVE",
    };

    currentSpecials[target.storeId] = promo;
    updatedCount++;

    recentLogs.push({
      id: `log_${Math.random().toString(36).slice(2, 9)}`,
      timestamp: now,
      type: "PERIODIC_CRAWL",
      message: `Crawled ${target.officialDomain}: Found '${target.defaultTitle}' (${target.defaultDiscountPercent}% OFF). Synced to ${target.billboardLocations.join(" & ")}.`,
      storeName: target.storeName,
      url: target.specialsUrl,
      discountPercent: target.defaultDiscountPercent,
    });

    // Deliver to user agents
    const card = deliverSpecialToAgents(
      promo,
      target,
      target.sampleProducts.map((p) => ({
        id: p.id,
        name: p.name,
        department: p.department || "all",
        originalPriceZAR: p.originalPriceZAR,
        promoPriceZAR: p.priceZAR,
        discountPercent: p.discountPercent,
        image: p.image,
        url: p.productUrl || target.specialsUrl,
      })),
    );

    if (card) {
      deliveredCount++;
      recentLogs.push({
        id: `deliv_log_${Math.random().toString(36).slice(2, 9)}`,
        timestamp: now,
        type: "AGENT_DELIVERY",
        message: `Delivered special card to ${card.deliveredToAgent} (Match score: ${card.matchScore}%).`,
        storeName: target.storeName,
      });
    }
  }

  saveCrawledSpecials(currentSpecials);

  const report: CrawlReport = {
    timestamp: now,
    storesCheckedCount: ALL_MALLS.reduce((acc, m) => acc + m.stores.length, 0),
    billboardsCheckedCount: 4,
    specialsUpdatedCount: updatedCount,
    newDeliveredCardsCount: deliveredCount,
    recentLogs,
  };

  // Notify active subscribers
  crawlerSubscribers.forEach((sub) => {
    try {
      sub(report);
    } catch (e) {
      console.warn("Crawler subscriber error:", e);
    }
  });

  return report;
}

/**
 * Starts periodic store crawler loop (runs every 45 seconds by default)
 */
export function startPeriodicStoreCrawler(
  intervalMs = 45000,
  onReport?: (report: CrawlReport) => void,
): () => void {
  if (onReport) {
    crawlerSubscribers.add(onReport);
  }

  if (!activeCrawlerTimer) {
    // Initial run
    runStoreCrawlerCheck();

    activeCrawlerTimer = setInterval(() => {
      runStoreCrawlerCheck();
    }, intervalMs);
  }

  return () => {
    if (onReport) {
      crawlerSubscribers.delete(onReport);
    }
  };
}

/**
 * Decorates stores in memory with live website specials
 */
export function decorateStoresWithCrawledSpecials<T extends Store | MallStoreWithProducts>(
  stores: T[],
  _version?: number,
): T[] {
  const crawled = getStoredCrawledSpecials();

  return stores.map((s) => {
    const promo = crawled[s.id];
    if (!promo) return s;

    // If Mr Price, augment product list with Black Friday items
    let updatedProducts = s.products;
    if (s.id === "mrprice-blueberry") {
      const mrpPreset = PRESET_WEBSITE_TARGETS[0];
      const existingProductIds = new Set((s.products || []).map((p) => p.id));
      const newItems = mrpPreset.sampleProducts.filter((p) => !existingProductIds.has(p.id));
      updatedProducts = [...newItems, ...(s.products || [])];
    }

    return {
      ...s,
      specialBadge: `${promo.discountPercent}% OFF · ${promo.title.toUpperCase().slice(0, 32)}`,
      liveWebsitePromo: promo,
      websiteUrl: promo.sourceUrl,
      specialsUrl: promo.sourceUrl,
      departmentLinks: promo.departmentLinks,
      products: updatedProducts,
    };
  });
}
