/**
 * AutoCom Agent Name Service (.agent) Protocol Types
 * Supports sliding scale pricing:
 * - 1 letter/number: $1,000 / 1000 USDC
 * - 2 letters/numbers: $600 / 600 USDC
 * - 3 letters/numbers: $300 / 300 USDC
 * - 4 letters/numbers: $20 / 20 USDC
 * - 5 letters/numbers: $2 / 2 USDC
 * - 6 letters/numbers: $1 / 1 USDC
 * - 7+ letters/numbers: Free ($0.00) for humans / $0.20 for AI agents (Anti-Spam rate)
 *
 * Registration Limits:
 * - Standard registrations (4+ chars): Maximum 1 name per human/agent registration
 * - Premium tier (1, 2, 3 chars) & Auction items: Batch buy up to 20 names per transaction
 *
 * Features:
 * - Directory of Owners with full search & verification
 * - Leaderboard of top sales across Primary, Secondary, and Auction markets
 * - Autonomous x402 payments (HTTP 402) & Multi-chain crypto (Base, Arc, Solana) + Cards
 */

export type NameCategory = "PERSONAL" | "MERCHANT" | "PREMIUM_BRAND" | "AUCTION_ICONIC";

export type NameStatus = "AVAILABLE" | "AUCTION_LIVE" | "CLAIMED" | "SECONDARY_LISTED";

export type PaymentMethodType = "x402" | "crypto" | "card";

export type CryptoNetwork = "base" | "arc" | "solana";

export type OwnerType = "AI_AGENT" | "HUMAN_WALLET" | "MERCHANT_ENTERPRISE";

export type MarketType = "PRIMARY" | "SECONDARY" | "AUCTION";

export interface AuctionBid {
  id: string;
  bidder: string;
  bidderType: "AI_AGENT" | "HUMAN";
  amountUsd: number;
  timestamp: string;
  paymentMethod: PaymentMethodType;
  network?: CryptoNetwork;
}

export interface AuctionDetails {
  currentBidUsd: number;
  highestBidder: string;
  bidderType: "AI_AGENT" | "HUMAN";
  bidsCount: number;
  endsAt: string;
  minNextBidUsd: number;
  reservePriceUsd: number;
  isBrandAuction: boolean;
  trademarkNotice?: string;
  history: AuctionBid[];
}

export interface SecondaryListing {
  listedPriceUsd: number;
  listedAt: string;
  seller: string;
  sellerType: "AI_AGENT" | "HUMAN";
  acceptedCurrencies: Array<"USDC" | "SOL" | "ETH" | "CARD" | "X402">;
  network: CryptoNetwork;
}

export interface AgentNameRecord {
  id: string;
  name: string; // e.g. "x", "007", "coke", "nike", "ai", "bot", "store"
  fullName: string; // e.g. "x.agent"
  category: NameCategory;
  status: NameStatus;
  length: number;
  priceUsd: number;
  priceZar: number;
  description: string;
  isRare: boolean;
  isBrandReserved?: boolean;
  ownerType?: OwnerType;
  ownerAddress?: string;
  ownerAgentId?: string;
  claimedAt?: string;
  paymentProtocol?: PaymentMethodType;
  cryptoNetwork?: CryptoNetwork;
  transactionHash?: string;
  cardReceiptId?: string;
  auction?: AuctionDetails;
  secondaryListing?: SecondaryListing;
}

export interface OwnerDirectoryRecord {
  id: string;
  name: string;
  fullName: string;
  category: NameCategory;
  ownerType: OwnerType;
  ownerIdentifier: string; // Wallet address, merchant corporate ID, or agent ID
  chainOrProtocol: string; // "Base", "Solana", "Arc", "x402 Autonomous", "Credit Card"
  claimedAt: string;
  priceUsd: number;
  length: number;
  verified: boolean;
  status: NameStatus;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  fullName: string;
  marketType: MarketType;
  priceUsd: number;
  priceZar: number;
  date: string;
  buyer: string;
  buyerType: "AI_AGENT" | "HUMAN";
  paymentMethod: PaymentMethodType;
  network?: CryptoNetwork;
  length: number;
}

/**
 * Sliding scale pricing tier calculation:
 * - 1 letter or 1 number: $1,000 / 1000 USDC
 * - 2 letters or numbers: $600 / 600 USDC
 * - 3 letters or numbers: $300 / 300 USDC
 * - 4 letters or numbers: $20 / 20 USDC
 * - 5 letters or numbers: $2 / 2 USDC
 * - 6 letters or numbers: $1 / 1 USDC
 * - 7+ letters/numbers: FREE ($0.00) for humans, $0.20 for AI agents (anti-spam fee)
 * - Brand names: $1,000 baseline / reserved for auction
 */
export function calculateNamePricing(
  rawName: string,
  isAgent: boolean = false,
): {
  cleanName: string;
  fullName: string;
  length: number;
  priceUsd: number;
  priceZar: number;
  tierLabel: string;
  isAuctionReserved: boolean;
  isBrandReserved: boolean;
  isFreeTier: boolean;
  canBatchBuy: boolean;
} {
  const cleanName = rawName.toLowerCase().replace(/[^a-z0-9_-]/g, "");
  const length = cleanName.length;
  const fullName = `${cleanName}.agent`;

  // 1. Single character names (all 26 letters a-z and 10 digits 0-9)
  const AUCTION_SINGLE_CHARS = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
  ];

  // 2. High-demand double character names
  const AUCTION_DOUBLE_CHARS = [
    "ai",
    "io",
    "os",
    "vr",
    "ar",
    "ui",
    "ux",
    "ip",
    "it",
    "db",
    "id",
    "ml",
    "fx",
    "za",
    "us",
    "eu",
    "uk",
    "sa",
    "vc",
    "lp",
    "me",
    "we",
    "go",
    "to",
    "ok",
    "on",
    "tv",
    "hi",
    "no",
    "up",
    "in",
    "at",
    "by",
    "00",
    "11",
    "22",
    "33",
    "44",
    "55",
    "66",
    "77",
    "88",
    "99",
    "69",
    "42",
    "10",
    "24",
  ];

  // 3. High-demand iconic triple character names
  const AUCTION_TRIPLE_CHARS = [
    "007",
    "777",
    "888",
    "999",
    "123",
    "404",
    "420",
    "100",
    "911",
    "666",
    "111",
    "222",
    "333",
    "555",
    "god",
    "vip",
    "bot",
    "dex",
    "pay",
    "app",
    "web",
    "btc",
    "eth",
    "sol",
    "nft",
    "dao",
    "ceo",
    "cfo",
    "cto",
    "api",
    "fly",
    "top",
    "one",
    "pro",
    "max",
    "lux",
    "win",
    "car",
    "hub",
    "key",
    "net",
    "law",
    "tax",
    "fit",
    "gym",
    "run",
    "buy",
    "eco",
    "sky",
    "red",
    "sun",
    "art",
    "fox",
    "ace",
    "neo",
    "zen",
    "raw",
    "wow",
    "dev",
    "lab",
    "gen",
    "gps",
    "sim",
    "pos",
    "tap",
    "box",
    "pub",
    "bar",
  ];

  // 4. Pre-reserved Mainstream & Popular Brands ($1,000+ Auction Floor)
  const BRAND_RESERVED = [
    // Big Tech & Social Platforms
    "apple",
    "google",
    "microsoft",
    "amazon",
    "meta",
    "tesla",
    "nvidia",
    "netflix",
    "uber",
    "spotify",
    "tiktok",
    "youtube",
    "samsung",
    "sony",
    "intel",
    "ibm",
    "oracle",
    "cisco",
    "openai",
    "stripe",
    "paypal",
    "adobe",
    "salesforce",
    "airbnb",
    // Iconic Retail, Fashion & Luxury Brands
    "nike",
    "adidas",
    "zara",
    "gucci",
    "prada",
    "chanel",
    "dior",
    "louisvuitton",
    "hermes",
    "rolex",
    "cartier",
    "costco",
    "walmart",
    "ikea",
    "lego",
    "disney",
    "target",
    "hm",
    "gap",
    "puma",
    "burberry",
    "versace",
    // Food & Beverage Giants
    "coke",
    "pepsi",
    "starbucks",
    "mcdonalds",
    "subway",
    "kfc",
    "redbull",
    "nestle",
    "heineken",
    "monster",
    // Automotive & Luxury
    "bmw",
    "mercedes",
    "porsche",
    "ferrari",
    "audi",
    "toyota",
    "honda",
    "ford",
    "lexus",
    "lamborghini",
    // Payments & Finance
    "visa",
    "mastercard",
    "amex",
    "revolut",
    "chase",
    "citibank",
    // South African Anchors
    "woolworths",
    "clicks",
    "mugg",
    "checkers",
    "picknpay",
    "mtn",
    "vodacom",
    "discovery",
  ];

  const isSingleChar = length === 1 || AUCTION_SINGLE_CHARS.includes(cleanName);
  const isDoubleIconic = AUCTION_DOUBLE_CHARS.includes(cleanName);
  const isTripleIconic = AUCTION_TRIPLE_CHARS.includes(cleanName);
  const isBrandReserved = BRAND_RESERVED.includes(cleanName);

  // Reserved for Special Auction: Single chars, curated double/triple chars, and iconic handles
  const isAuctionReserved = isSingleChar || isDoubleIconic || isTripleIconic || isBrandReserved;

  let priceUsd = 0;
  let tierLabel = "";
  let isFreeTier = false;

  if (length === 1) {
    priceUsd = 1000;
    tierLabel = "Ultra-Rare 1-Character Auction Reserved ($1,000+ Floor)";
  } else if (length === 2) {
    priceUsd = 600;
    tierLabel = isDoubleIconic
      ? "Iconic 2-Character Auction Reserved ($1,000+ Floor)"
      : "Premium 2-Character ($600)";
  } else if (length === 3) {
    priceUsd = 300;
    tierLabel = isTripleIconic
      ? "Iconic 3-Character Auction Reserved ($1,000+ Floor)"
      : "High-Demand 3-Character ($300)";
  } else if (length === 4) {
    priceUsd = 20;
    tierLabel = isBrandReserved
      ? "Enterprise Brand Trademark Auction ($1,000+ Floor)"
      : "Short 4-Character ($20)";
  } else if (length === 5) {
    priceUsd = 2;
    tierLabel = isBrandReserved
      ? "Enterprise Brand Trademark Auction ($1,000+ Floor)"
      : "Accessible 5-Character ($2)";
  } else if (length === 6) {
    priceUsd = 1;
    tierLabel = isBrandReserved
      ? "Enterprise Brand Trademark Auction ($1,000+ Floor)"
      : "Value 6-Character ($1)";
  } else {
    // 7+ characters
    if (isBrandReserved) {
      priceUsd = 1000;
      tierLabel = "Enterprise Brand Trademark Tier ($1,000+ Auction Floor)";
    } else if (isAgent) {
      priceUsd = 0.2;
      tierLabel = "7+ Characters ($0.20 Anti-Spam Agent Rate)";
    } else {
      priceUsd = 0;
      tierLabel = "7+ Characters (Free for Humans)";
      isFreeTier = true;
    }
  }

  if (isBrandReserved) {
    priceUsd = Math.max(priceUsd, 1000);
    tierLabel = "Enterprise Brand Trademark Tier ($1,000+ Auction Floor)";
  } else if (isAuctionReserved && (isSingleChar || isDoubleIconic || isTripleIconic)) {
    priceUsd = Math.max(priceUsd, length === 1 ? 1000 : length === 2 ? 600 : 300);
  }

  const priceZar = Math.round(priceUsd * 18.5);
  // 1, 2, 3 letter names and auction names can batch buy up to 20
  const canBatchBuy = length <= 3 || isAuctionReserved || isBrandReserved;

  return {
    cleanName,
    fullName,
    length,
    priceUsd,
    priceZar,
    tierLabel,
    isAuctionReserved,
    isBrandReserved,
    isFreeTier,
    canBatchBuy,
  };
}

/**
 * Validates registration batch limits:
 * - 1, 2, 3 character names and auction items: Can batch buy up to 20 names
 * - 4+ character names (including free 7+ names): Maximum 1 name per registration
 */
export function validateRegistrationBatch(
  names: string[],
  isAgent: boolean = false,
): {
  allowed: boolean;
  maxAllowed: number;
  reason?: string;
  totalCostUsd: number;
  items: Array<{ name: string; priceUsd: number; canBatchBuy: boolean }>;
} {
  const items = names.map((n) => {
    const pricing = calculateNamePricing(n, isAgent);
    return {
      name: pricing.cleanName,
      priceUsd: pricing.priceUsd,
      canBatchBuy: pricing.canBatchBuy,
    };
  });

  const totalCostUsd = items.reduce((sum, item) => sum + item.priceUsd, 0);

  // If there are standard names (length >= 4 and not auction), only 1 name is allowed per registration
  const hasStandardTier = items.some((item) => !item.canBatchBuy);

  if (hasStandardTier && names.length > 1) {
    return {
      allowed: false,
      maxAllowed: 1,
      reason:
        "Standard names (4+ characters, including free 7+ handles) are strictly limited to maximum 1 name per registration to prevent spam hoarding. Premium 1, 2, and 3-character handles and auction items allow up to 20 per transaction.",
      totalCostUsd,
      items,
    };
  }

  if (names.length > 20) {
    return {
      allowed: false,
      maxAllowed: 20,
      reason: "Maximum batch purchase limit is 20 names per registration.",
      totalCostUsd,
      items,
    };
  }

  return {
    allowed: true,
    maxAllowed: hasStandardTier ? 1 : 20,
    totalCostUsd,
    items,
  };
}

/**
 * x402 HTTP micropayment specification headers & payload
 */
export interface X402PaymentChallenge {
  statusCode: 402;
  protocol: "x402-autonomous-v1";
  resourceName: string;
  costUsd: number;
  costUnits: {
    USDC: number;
    SOL: number;
    ETH: number;
  };
  destinationWallets: {
    base: string;
    solana: string;
    arc: string;
  };
  agentNonce: string;
  challengeHash: string;
  instructions: string;
}

export interface ClaimNamePayload {
  name: string;
  type: "personal" | "merchant";
  paymentMethod: PaymentMethodType;
  network?: CryptoNetwork;
  isAgent?: boolean;
  // If card payment:
  cardToken?: {
    last4: string;
    cardholderName: string;
    expiry: string;
  };
  // If crypto payment:
  cryptoTxHash?: string;
  // If x402 autonomous payment:
  x402Token?: string;
  agentId?: string;
  ownerIdentifier?: string;
}

export interface BatchClaimPayload {
  names: string[];
  type: "personal" | "merchant";
  paymentMethod: PaymentMethodType;
  network?: CryptoNetwork;
  isAgent?: boolean;
  cardToken?: {
    last4: string;
    cardholderName: string;
    expiry: string;
  };
  cryptoTxHash?: string;
  x402Token?: string;
  agentId?: string;
  ownerIdentifier?: string;
}
