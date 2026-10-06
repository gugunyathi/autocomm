import { useState, useEffect, useCallback, useRef } from "react";
import type {
  ChainNetwork,
  TokenAsset,
  Web3WalletState,
  Web3Transaction,
  ShopifyProduct,
  ShopifyStoreConfig,
  SpatialAdCampaign,
  AutoDebitConfig,
  AutoDebitTier,
  AutoDebitSchedule,
  IntentWishlistItem,
  PublicAdMediaItem,
  MarketplaceProduct,
  AgentApiCredential,
  ArbitrageLedgerEntry,
  ShopifyIntegrationConfig,
  PriceElasticityPoint,
  SyndicatedCampaign,
  AttentionBiddingPool,
} from "@/types/autocom";
import type { ParkedOffer } from "@/components/ParkingLotModal";
import type { BoughtItem } from "@/components/BoughtItemsModal";

const STORAGE_WEB3_KEY = "autocom_web3_wallet_v2";
const STORAGE_DEBIT_KEY = "autocom_fintech_debit_v2";
const STORAGE_WISHLIST_KEY = "autocom_intent_wishlist_v2";
const STORAGE_SHOPIFY_KEY = "autocom_shopify_config_v2";
const STORAGE_CAMPAIGNS_KEY = "autocom_spatial_campaigns_v2";
const STORAGE_API_CREDENTIALS_KEY = "autocom_api_credentials_v2";
const STORAGE_ARBITRAGE_LEDGER_KEY = "autocom_arbitrage_ledger_v2";
const STORAGE_AFFILIATES_KEY = "autocom_affiliates_v2";
const STORAGE_ATTENTION_POOLS_KEY = "autocom_attention_pools_v2";

// Seed Shopify Products with Physical Indoor Map Coordinates
export const INITIAL_SHOPIFY_PRODUCTS: ShopifyProduct[] = [
  {
    id: "sp-1",
    title: "Zara Urban Wool Trench Coat",
    handle: "zara-wool-trench",
    vendor: "Zara Fashion",
    category: "Apparel",
    priceZar: 1899,
    priceUsdc: 105,
    inventoryQuantity: 24,
    sku: "ZAR-WTC-904",
    imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&q=80",
    tags: ["outerwear", "winter", "luxury"],
    spatialCoordinates: {
      storeId: "s1",
      storeName: "Zara Fashion",
      x: 175,
      y: 150,
      floor: "Level 1 North",
    },
    activeDynamicPromo: {
      discountPercent: 55, // >50% triggers instant auto-bag!
      promoCode: "ZARA55-AUTO",
      autoComAgentEligible: true,
    },
  },
  {
    id: "sp-2",
    title: "Nike Air Max Pulse Performance",
    handle: "nike-air-max-pulse",
    vendor: "Nike Performance",
    category: "Sportswear",
    priceZar: 2499,
    priceUsdc: 138,
    inventoryQuantity: 18,
    sku: "NKE-AMP-002",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    tags: ["shoes", "running", "airmax"],
    spatialCoordinates: {
      storeId: "s6",
      storeName: "Nike Performance",
      x: 487,
      y: 820,
      floor: "Level 1 South",
    },
    activeDynamicPromo: {
      discountPercent: 40,
      promoCode: "NIKE40-AIR",
      autoComAgentEligible: true,
    },
  },
  {
    id: "sp-3",
    title: "Apple iPhone 16 Pro FineWoven Case",
    handle: "apple-finewoven-case",
    vendor: "iStore Apple",
    category: "Electronics",
    priceZar: 1199,
    priceUsdc: 66,
    inventoryQuantity: 42,
    sku: "APP-FWC-16P",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80",
    tags: ["apple", "accessories", "magsafe"],
    spatialCoordinates: {
      storeId: "s3",
      storeName: "iStore Apple",
      x: 635,
      y: 150,
      floor: "Level 1 Tech Hub",
    },
    activeDynamicPromo: {
      discountPercent: 60, // >50% triggers instant auto-bag!
      promoCode: "APPLE60-MAG",
      autoComAgentEligible: true,
    },
  },
  {
    id: "sp-4",
    title: "Exclusive Books Collector's Hardcover",
    handle: "exclusive-books-hardcover",
    vendor: "Exclusive Books",
    category: "Leisure",
    priceZar: 450,
    priceUsdc: 25,
    inventoryQuantity: 30,
    sku: "EXB-BK-881",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80",
    tags: ["books", "coffeeclub", "bestseller"],
    spatialCoordinates: {
      storeId: "s4",
      storeName: "Exclusive Books",
      x: 840,
      y: 150,
      floor: "Level 1 East",
    },
    activeDynamicPromo: {
      discountPercent: 35,
      promoCode: "EB-COFFEE35",
      autoComAgentEligible: true,
    },
  },
  {
    id: "sp-5",
    title: "Woolworths Artisan Sourdough & Cheese Basket",
    handle: "woolies-gourmet-basket",
    vendor: "Woolworths Food",
    category: "Grocery",
    priceZar: 380,
    priceUsdc: 21,
    inventoryQuantity: 50,
    sku: "WW-GRM-090",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80",
    tags: ["gourmet", "organic", "bakery"],
    spatialCoordinates: {
      storeId: "s5",
      storeName: "Woolworths Food",
      x: 210,
      y: 800,
      floor: "Level 1 Market",
    },
    activeDynamicPromo: {
      discountPercent: 52, // >50% triggers instant auto-bag!
      promoCode: "WW-52FLASH",
      autoComAgentEligible: true,
    },
  },
  {
    id: "sp-6",
    title: "Clicks Pure Vitamin C & Immune Pack",
    handle: "clicks-vitamin-c-pack",
    vendor: "Clicks Pharmacy",
    category: "Health",
    priceZar: 299,
    priceUsdc: 16.5,
    inventoryQuantity: 65,
    sku: "CLK-VIT-301",
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80",
    tags: ["health", "vitamins", "clubcard"],
    spatialCoordinates: {
      storeId: "s7",
      storeName: "Clicks Pharmacy",
      x: 775,
      y: 820,
      floor: "Level 1 Health Wing",
    },
    activeDynamicPromo: {
      discountPercent: 45,
      promoCode: "CLICKS-45IMM",
      autoComAgentEligible: true,
    },
  },
];

// Seed Spatial Campaigns with Full Spatial Metadata, Escrow & Multi-Channel Syndication
export const INITIAL_SPATIAL_CAMPAIGNS: SpatialAdCampaign[] = [
  {
    id: "camp-1",
    title: "Zara Winter Clearance · 55% Algorithmic Flash",
    merchantId: "m-zara",
    merchantName: "Zara Fashion",
    merchantLogo: "ZARA",
    brandBgColor: "#000000",
    brandTextColor: "#ffffff",
    mediaUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80",
    mediaType: "interactive_deal",
    targetRadiusMeters: 35,
    targetCategories: ["Apparel", "Fashion", "Outerwear"],
    spatialCoordinates: { storeId: "s1", x: 175, y: 150 },
    discountPayload: {
      percentage: 55, // Strictly > 50%
      promoCode: "ZARA-INSTANT55",
      description: "Winter Trench coats & blazers algorithmic drop for passing agents",
      originalPriceZar: 1899,
      discountedPriceZar: 854,
      expiresAt: 1775500000000 + 86400000 * 3,
    },
    attentionPoolUsdc: 450,
    spentAttentionUsdc: 82.4,
    costPerAgentImpressionUsdc: 0.005,
    cpaRewardUsdc: 1.5,
    impressionsCount: 16480,
    agentConversionsCount: 840,
    instantAutoBagCount: 312,
    active: true,
    spatialMetadata: {
      targetMall: "Sandton City Mall",
      targetCorridor: "Level 1 North Passage Corridor #2",
      beaconUuids: ["BEAC-SANDTON-01-N", "BEAC-ZARA-CORRIDOR-04", "UWB-CORR-NODE-89"],
      broadcastRadiusMeters: 35,
      ipfsCid: "QmZar89FaXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1m",
      compressedAssetSizeKb: 142,
      originalAssetSizeKb: 980,
      compressionRatio: "85.5% Saved",
      processedAt: 1775500000000 - 3600000 * 12,
    },
    cloudStorageEscrow: {
      feePaidUsdc: 0.45,
      feePaidToken: "USDC",
      escrowTxHash: "0x78ab12...99ef",
      pinningNodes: 12,
      hostingStatus: "ACTIVE_PINNED",
      daysRemaining: 28,
    },
    syndicationChannels: {
      metaAds: {
        enabled: true,
        status: "LIVE",
        campaignId: "META-ACT-982104-ZARA",
        impressions: 48500,
        reach: 32100,
        clicks: 1420,
        budgetDailyUsd: 25.0,
      },
      googleAds: {
        enabled: true,
        status: "LIVE",
        campaignId: "GOOG-MAP-LOC-4412",
        mapImpressions: 34200,
        searchClicks: 980,
        budgetDailyUsd: 20.0,
      },
      doohBillboards: {
        enabled: true,
        status: "LIVE",
        billboardLocations: ["Sandton City High-Speed Tower", "M1 North Highway Billboard #4"],
        vehicleDetections: 18450,
        amplifierPowerWatts: 45,
      },
      autoComMesh: {
        enabled: true,
        status: "LIVE",
        submeterBeaconsCount: 8,
        a2aHandshakes: 16480,
        convertedDeals: 840,
      },
    },
    networkSync: {
      googleAds: true,
      metaAds: true,
      doohBillboards: true,
      doohBillboardLocations: ["Sandton City High-Speed Tower", "M1 North Highway Billboard #4"],
    },
  },
  {
    id: "camp-2",
    title: "Nike Air Max Week · 40% A2A Bargain Pass",
    merchantId: "m-nike",
    merchantName: "Nike Performance",
    merchantLogo: "NIKE",
    brandBgColor: "#0f172a",
    brandTextColor: "#ffffff",
    mediaUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    mediaType: "interactive_deal",
    targetRadiusMeters: 50,
    targetCategories: ["Sportswear", "Shoes", "Athletic"],
    spatialCoordinates: { storeId: "s6", x: 487, y: 820 },
    discountPayload: {
      percentage: 40,
      promoCode: "NIKE-AIR40",
      description: "Air Max Pulse exclusive discount for active mesh runners",
      originalPriceZar: 2499,
      discountedPriceZar: 1499,
      expiresAt: 1775500000000 + 86400000 * 2,
    },
    attentionPoolUsdc: 380,
    spentAttentionUsdc: 114.5,
    costPerAgentImpressionUsdc: 0.006,
    cpaRewardUsdc: 2.0,
    impressionsCount: 19080,
    agentConversionsCount: 620,
    instantAutoBagCount: 0,
    active: true,
    spatialMetadata: {
      targetMall: "Sandton City Mall",
      targetCorridor: "Level 1 South Concourse Wing",
      beaconUuids: ["BEAC-NIKE-SOUTH-02", "UWB-ATHLETIC-HUB-11"],
      broadcastRadiusMeters: 50,
      ipfsCid: "QmNkeAir40Pulse99KnFiJnKLwHCnL72vedxjQkDDP2w",
      compressedAssetSizeKb: 188,
      originalAssetSizeKb: 1240,
      compressionRatio: "84.8% Saved",
      processedAt: 1775500000000 - 3600000 * 24,
    },
    cloudStorageEscrow: {
      feePaidUsdc: 0.45,
      feePaidToken: "USDC",
      escrowTxHash: "0x44cd88...12aa",
      pinningNodes: 12,
      hostingStatus: "ACTIVE_PINNED",
      daysRemaining: 26,
    },
    syndicationChannels: {
      metaAds: {
        enabled: false,
        status: "PAUSED",
        campaignId: "META-ACT-771209-NIKE",
        impressions: 0,
        reach: 0,
        clicks: 0,
        budgetDailyUsd: 0,
      },
      googleAds: {
        enabled: true,
        status: "LIVE",
        campaignId: "GOOG-MAP-LOC-8821",
        mapImpressions: 21500,
        searchClicks: 640,
        budgetDailyUsd: 15.0,
      },
      doohBillboards: {
        enabled: true,
        status: "LIVE",
        billboardLocations: ["Cape Town Waterfront Digital Pylon"],
        vehicleDetections: 14200,
        amplifierPowerWatts: 40,
      },
      autoComMesh: {
        enabled: true,
        status: "LIVE",
        submeterBeaconsCount: 6,
        a2aHandshakes: 19080,
        convertedDeals: 620,
      },
    },
    networkSync: {
      googleAds: true,
      metaAds: false,
      doohBillboards: true,
      doohBillboardLocations: ["Cape Town Waterfront Digital Pylon"],
    },
  },
  {
    id: "camp-3",
    title: "Apple iStore 60% Ecosystem Bundle Drop",
    merchantId: "m-apple",
    merchantName: "iStore Apple",
    merchantLogo: " iStore",
    brandBgColor: "#0f172a",
    brandTextColor: "#ffffff",
    mediaUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80",
    mediaType: "interactive_deal",
    targetRadiusMeters: 25,
    targetCategories: ["Electronics", "Apple", "Accessories"],
    spatialCoordinates: { storeId: "s3", x: 635, y: 150 },
    discountPayload: {
      percentage: 60, // Strictly > 50%
      promoCode: "APPLE-60BUNDLE",
      description: "FineWoven Cases & MagSafe Chargers flash liquidation",
      originalPriceZar: 1199,
      discountedPriceZar: 479,
      expiresAt: 1775500000000 + 86400000 * 4,
    },
    attentionPoolUsdc: 600,
    spentAttentionUsdc: 210.0,
    costPerAgentImpressionUsdc: 0.008,
    cpaRewardUsdc: 3.0,
    impressionsCount: 26250,
    agentConversionsCount: 1240,
    instantAutoBagCount: 580,
    active: true,
    spatialMetadata: {
      targetMall: "Rosebank Mall",
      targetCorridor: "Level 1 Tech Hub Corridor #1",
      beaconUuids: ["BEAC-ISTORE-TECH-03", "UWB-APPLE-HUB-09"],
      broadcastRadiusMeters: 25,
      ipfsCid: "QmApple60EcoBundleWknFiJnKLwHCnL72vedxjQkDDP7z",
      compressedAssetSizeKb: 165,
      originalAssetSizeKb: 1100,
      compressionRatio: "85.0% Saved",
      processedAt: 1775500000000 - 3600000 * 18,
    },
    cloudStorageEscrow: {
      feePaidUsdc: 0.45,
      feePaidToken: "USDC",
      escrowTxHash: "0x19ff55...78cc",
      pinningNodes: 12,
      hostingStatus: "ACTIVE_PINNED",
      daysRemaining: 29,
    },
    syndicationChannels: {
      metaAds: {
        enabled: true,
        status: "LIVE",
        campaignId: "META-ACT-332190-APPLE",
        impressions: 62000,
        reach: 41000,
        clicks: 2100,
        budgetDailyUsd: 35.0,
      },
      googleAds: {
        enabled: true,
        status: "LIVE",
        campaignId: "GOOG-MAP-LOC-9901",
        mapImpressions: 48000,
        searchClicks: 1800,
        budgetDailyUsd: 30.0,
      },
      doohBillboards: {
        enabled: true,
        status: "LIVE",
        billboardLocations: ["Rosebank Gautrain Station Billboard #1"],
        vehicleDetections: 28400,
        amplifierPowerWatts: 50,
      },
      autoComMesh: {
        enabled: true,
        status: "LIVE",
        submeterBeaconsCount: 10,
        a2aHandshakes: 26250,
        convertedDeals: 1240,
      },
    },
    networkSync: {
      googleAds: true,
      metaAds: true,
      doohBillboards: true,
      doohBillboardLocations: ["Rosebank Gautrain Station Billboard #1"],
    },
  },
];

// Seed Marketplace Products
export const MARKETPLACE_CATALOGUE: MarketplaceProduct[] = [
  // 1. Physical Hardware Assets
  {
    id: "hw-beacon-submeter",
    name: "AutoCom Sub-Meter Proximity Beacon (v3.2)",
    category: "HARDWARE_BEACON",
    priceZar: 1450,
    priceUsdc: 80,
    description:
      "Ultra-precise Bluetooth Low Energy 5.4 + UWB spatial anchor with 5-year coin battery life and 0.2m corridor resolution.",
    specs: [
      "Sub-meter 0.2m Accuracy",
      "BLE 5.4 + Ultra-Wideband (UWB)",
      "AES-256 Cryptographic Beacon Signing",
      "IP67 Weatherproof Casing",
    ],
    badge: "Bestseller Hardware",
    inStock: true,
    rating: 4.9,
    reviewsCount: 128,
    iconEmoji: "📡",
    gradient: "from-blue-600 to-cyan-500",
  },
  {
    id: "hw-edge-gateway",
    name: "AutoCom Edge AI Smart Retail Gateway",
    category: "EDGE_DEVICE",
    priceZar: 5800,
    priceUsdc: 320,
    description:
      "On-premise hardware node running local A2A negotiation server. Connects 250 concurrent consumer agents with <10ms latency.",
    specs: [
      "Local Muse-ZA/Nibble-ZA Protocol Core",
      "Dual Gigabit Ethernet + Wi-Fi 6E",
      "Processes 250 A2A Handshakes/sec",
      "Plug-and-Play POS Integration",
    ],
    badge: "Enterprise Ready",
    inStock: true,
    rating: 4.95,
    reviewsCount: 64,
    iconEmoji: "🖲️",
    gradient: "from-indigo-600 to-purple-600",
  },
  {
    id: "hw-wideband-amplifier",
    name: "Wide-Band 500m Bluetooth Billboard Amplifier",
    category: "BLUETOOTH_AMPLIFIER",
    priceZar: 8900,
    priceUsdc: 490,
    description:
      "High-power long-range transmitter for outdoor digital billboards and highway transit corridors. Reaches passing vehicles at 120km/h.",
    specs: [
      "500m Broadcast Radius",
      "Highway Doppler Compensation Engine",
      "Direct Billboard DOOH API Controller",
      "Solar & Mains Power Compatible",
    ],
    badge: "Billboard Grade",
    inStock: true,
    rating: 4.88,
    reviewsCount: 42,
    iconEmoji: "📻",
    gradient: "from-amber-600 to-rose-600",
  },
  // 2. Decentralized Storage & Cloud Packages
  {
    id: "cloud-storage-node-pro",
    name: "Decentralized Ad Server Cloud Hosting (25GB)",
    category: "CLOUD_STORAGE",
    priceZar: 350,
    priceUsdc: 19.5,
    monthlySubscription: true,
    description:
      "Decentralized IPFS Pinning and distributed CDN edge delivery across 12 African & Global validator nodes for spatial media creatives.",
    specs: [
      "25GB High-Speed Pinning Space",
      "Unlimited Agent Ad Impression Bandwidth",
      "12 Redundant Validator Storage Nodes",
      "Real-time IPFS Hash Verification",
    ],
    badge: "Ad Server Cloud",
    inStock: true,
    rating: 4.85,
    reviewsCount: 210,
    iconEmoji: "☁️",
    gradient: "from-teal-600 to-emerald-600",
  },
  // 3. FinTech & Merchant Subscriptions
  {
    id: "fin-merchant-growth",
    name: "Merchant Dynamic Yield SaaS (Tier-2 Pro)",
    category: "MERCHANT_SUBSCRIPTION",
    priceZar: 1799,
    priceUsdc: 99,
    monthlySubscription: true,
    description:
      "Algorithmic dynamic pricing salesman bot, Shopify real-time catalog sync, and automated cross-network ad bidding on Google/Meta/Billboards.",
    specs: [
      "24/7 Agentic Salesman Automation",
      "Shopify & WooCommerce Real-time Sync",
      "Multi-Network Google/Meta/DOOH Sync",
      "Full Spatial Heatmap Analytics",
    ],
    badge: "Popular Plan",
    inStock: true,
    rating: 4.92,
    reviewsCount: 178,
    iconEmoji: "🏢",
    gradient: "from-violet-600 to-indigo-600",
  },
  {
    id: "fin-consumer-shield",
    name: "AutoCom Deal Protection & Micro-Insurance",
    category: "CONSUMER_INSURANCE",
    priceZar: 75,
    priceUsdc: 4.2,
    monthlySubscription: true,
    description:
      "Underwritten spatial guarantee: if any retailer rejects an agent-negotiated voucher or price changes, instant 100% wallet refund + R100 credit.",
    specs: [
      "100% Instant Refund Protection",
      "Merchant Non-compliance Guarantee",
      "Zero-Deductible Automatic Claims",
      "Covers up to R15,000 / month in deals",
    ],
    badge: "FinTech Shield",
    inStock: true,
    rating: 4.97,
    reviewsCount: 312,
    iconEmoji: "🛡️",
    gradient: "from-emerald-600 to-teal-500",
  },
  {
    id: "fin-bnpl-split4",
    name: "AutoCom BNPL 4-Pay Pass (0% Interest)",
    category: "BNPL_PLAN",
    priceZar: 0,
    priceUsdc: 0,
    description:
      "Split any in-store deal into 4 equal bi-weekly interest-free installments, executed with decentralized smart contract escrow.",
    specs: [
      "0% Interest & Zero Hidden Fees",
      "4 Bi-Weekly Automated Micro-Debits",
      "Instant In-Store POS Approval",
      "Backed by Base / Arbitrum Smart Escrow",
    ],
    badge: "Free Activation",
    inStock: true,
    rating: 4.94,
    reviewsCount: 450,
    iconEmoji: "💳",
    gradient: "from-pink-600 to-rose-500",
  },
  {
    id: "fin-pos-microloan",
    name: "Point-of-Sale Micro-Credit Line (Up to R5,000)",
    category: "POS_MICRO_LOAN",
    priceZar: 45,
    priceUsdc: 2.5,
    monthlySubscription: true,
    description:
      "Instant revolving credit buffer for high-value spatial flash deals (+50% drops) when your debit wallet is low. 30 days interest-free.",
    specs: [
      "Up to R5,000 Instant Credit Buffer",
      "30-Day Zero-Interest Grace Window",
      "Automatic Repayment via Auto-Wallet",
      "Zero Credit Score Impact",
    ],
    badge: "Instant Liquidity",
    inStock: true,
    rating: 4.89,
    reviewsCount: 184,
    iconEmoji: "🏦",
    gradient: "from-amber-500 to-orange-600",
  },
];

export function useAutoComPayments() {
  const isLoadedFromStorageRef = useRef(false);

  // 1. Web3 Multi-Chain Wallet State
  const [walletState, setWalletState] = useState<Web3WalletState>({
    address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    chainId: 8453, // Base Mainnet
    network: "base",
    balances: {
      USDC: 285.5,
      ERC_X402: 1420.0,
      ZAR: 3450.0,
    },
    isConnected: true,
    isConnecting: false,
    transactions: [
      {
        id: "tx-init-1",
        hash: "0x89ab...71ef",
        timestamp: 1775500000000,
        chain: "base",
        token: "USDC",
        amount: 15.0,
        usdEquivalent: 15.0,
        type: "MALL_DEAL_PURCHASE",
        status: "confirmed",
        recipient: "Zara Fashion Spatial Node",
        metadata: { storeName: "Zara Fashion", itemTitle: "Winter Coat", discountPercent: 30 },
      },
    ],
  });

  // 2. Shopify Integration State
  const [shopifyConfig, setShopifyConfig] = useState<ShopifyStoreConfig>({
    apiKey: "shpat_98fa7210b38c29188eaf",
    shopDomain: "sandton-city-mall.myshopify.com",
    merchantName: "Sandton Retail Cluster",
    isConnected: true,
    lastSyncTime: 1775500000000,
    autoMapCoordinates: true,
    syncedProductsCount: INITIAL_SHOPIFY_PRODUCTS.length,
  });

  const [shopifyProducts, setShopifyProducts] =
    useState<ShopifyProduct[]>(INITIAL_SHOPIFY_PRODUCTS);

  // 3. Spatial Campaigns State
  const [campaigns, setCampaigns] = useState<SpatialAdCampaign[]>(INITIAL_SPATIAL_CAMPAIGNS);

  // 4. FinTech Automated Debit Order Configuration
  const [autoDebitConfig, setAutoDebitConfig] = useState<AutoDebitConfig>({
    enabled: true,
    tier: 500,
    schedule: "monthly",
    nextDebitDate: "2026-10-20",
    autoWalletBalanceZar: 1500,
    autoWalletBalanceUsdc: 83.3,
    mandateSigned: true,
    bankAccountMask: "•••• 8912 (FNB Cheque)",
    autoExecuteWishlist: true,
    totalAutomatedSavingsZar: 2850,
  });

  // 5. Intent Wishlist Items
  const [wishlist, setWishlist] = useState<IntentWishlistItem[]>([
    {
      id: "wish-1",
      title: "Nike Air Max Shoes",
      category: "Sportswear",
      minDiscountPercent: 40,
      maxPriceZar: 1600,
      targetBrand: "Nike",
      autoExecute: true,
      status: "ACTIVE_SCANNING",
      createdAt: 1775400000000,
    },
    {
      id: "wish-2",
      title: "Winter Wool Coat",
      category: "Apparel",
      minDiscountPercent: 50,
      maxPriceZar: 1000,
      targetBrand: "Zara",
      autoExecute: true,
      status: "ACTIVE_SCANNING",
      createdAt: 1775450000000,
    },
  ]);

  // 6. Developer Agentic API Sandboxes & Arbitrage Ledger
  const [apiCredentials, setApiCredentials] = useState<AgentApiCredential[]>([
    {
      id: "cred-dev-1",
      apiKey: "ac_live_7f89ab12cd34ef5601",
      apiSecret: "sec_grid_8921af74bc29801",
      tier: "DEVELOPER_SANDBOX",
      activeAgentBotsCount: 3,
      totalCorridorTicksUsed: 14250,
      totalTicksLimit: 50000,
      arbitrageFeeRate: 0.015,
      totalValueSavedUsdc: 420.5,
      protocolArbitrageFeesCollectedUsdc: 6.3,
      webhookUrl: "https://agent-mesh.cloud/api/autocom/negotiate-v1",
      createdAt: 1775300000000,
      lastActiveAt: 1775500000000,
      status: "ACTIVE",
    },
  ]);

  const [arbitrageLedger, setArbitrageLedger] = useState<ArbitrageLedgerEntry[]>([
    {
      id: "arb-1",
      txHash: "0x3b891a9e7829cd10",
      timestamp: 1775502000000,
      agentId: "bot-muse-za-04",
      merchantStore: "Zara Fashion",
      dealItem: "Urban Wool Trench Coat",
      originalPriceZar: 1899,
      negotiatedPriceZar: 854,
      totalValueSavedZar: 1045,
      totalValueSavedUsdc: 58.05,
      arbitrageFeeSlicePercent: 1.5,
      arbitrageFeeCollectedUsdc: 0.87,
      settlementChain: "base",
      status: "CONFIRMED_ON_CHAIN",
    },
    {
      id: "arb-2",
      txHash: "0x78fe90cd34ab5612",
      timestamp: 1775498000000,
      agentId: "bot-nibble-za-09",
      merchantStore: "Nike Performance",
      dealItem: "Air Max Pulse Runner",
      originalPriceZar: 2499,
      negotiatedPriceZar: 1499,
      totalValueSavedZar: 1000,
      totalValueSavedUsdc: 55.55,
      arbitrageFeeSlicePercent: 1.5,
      arbitrageFeeCollectedUsdc: 0.83,
      settlementChain: "arbitrum",
      status: "CONFIRMED_ON_CHAIN",
    },
    {
      id: "arb-3",
      txHash: "0x12dc45ba9012cd87",
      timestamp: 1775492000000,
      agentId: "bot-quantum-za-01",
      merchantStore: "iStore Apple",
      dealItem: "iPhone MagSafe Bundle",
      originalPriceZar: 1199,
      negotiatedPriceZar: 479,
      totalValueSavedZar: 720,
      totalValueSavedUsdc: 40.0,
      arbitrageFeeSlicePercent: 1.5,
      arbitrageFeeCollectedUsdc: 0.6,
      settlementChain: "abstract",
      status: "CONFIRMED_ON_CHAIN",
    },
  ]);

  // 7. Shopify Synthetic Traffic Configuration
  const [shopifyIntegration, setShopifyIntegration] = useState<ShopifyIntegrationConfig>({
    shopUrl: "https://sandton-retail-flagship.myshopify.com",
    accessToken: "shpat_98fa7210b38c29188eaf",
    merchantName: "Sandton Retail Flagship",
    tier: "DYNAMIC_ENGINE",
    isConnected: true,
    lastSyncTimestamp: 1775500000000,
    syncedInventoryCount: 42,
    maxInventoryLimit: "unlimited",
    syntheticAgentPassesMonthly: 18450,
    maxPassesMonthly: 50000,
    autoPriceElasticityReports: true,
    spatialFloorMapping: {
      mallName: "Sandton City Mall",
      storeNodeId: "node-zara-s1",
      corridorAnchor: "Level 1 North Passage",
      beaconUuid: "BEAC-SANDTON-01-N",
    },
  });

  const [priceElasticityCurve, setPriceElasticityCurve] = useState<PriceElasticityPoint[]>([
    {
      discountPercent: 10,
      simulatedAgentPasses: 1000,
      agentAcceptances: 42,
      agentRejections: 958,
      conversionRatePercent: 4.2,
      grossRevenueZar: 71778,
      netMarginZar: 32400,
      optimalElasticityScore: 48,
    },
    {
      discountPercent: 20,
      simulatedAgentPasses: 1000,
      agentAcceptances: 128,
      agentRejections: 872,
      conversionRatePercent: 12.8,
      grossRevenueZar: 194457,
      netMarginZar: 76800,
      optimalElasticityScore: 68,
    },
    {
      discountPercent: 30,
      simulatedAgentPasses: 1000,
      agentAcceptances: 340,
      agentRejections: 660,
      conversionRatePercent: 34.0,
      grossRevenueZar: 451962,
      netMarginZar: 142800,
      optimalElasticityScore: 84,
    },
    {
      discountPercent: 40,
      simulatedAgentPasses: 1000,
      agentAcceptances: 620,
      agentRejections: 380,
      conversionRatePercent: 62.0,
      grossRevenueZar: 706428,
      netMarginZar: 186000,
      optimalElasticityScore: 96,
    },
    {
      discountPercent: 50,
      simulatedAgentPasses: 1000,
      agentAcceptances: 880,
      agentRejections: 120,
      conversionRatePercent: 88.0,
      grossRevenueZar: 835560,
      netMarginZar: 176000,
      optimalElasticityScore: 92,
    },
    {
      discountPercent: 60,
      simulatedAgentPasses: 1000,
      agentAcceptances: 960,
      agentRejections: 40,
      conversionRatePercent: 96.0,
      grossRevenueZar: 729216,
      netMarginZar: 96000,
      optimalElasticityScore: 74,
    },
  ]);

  // 8. Distributed Billboard Affiliate & Content Creator Network
  const [syndicatedCampaigns, setSyndicatedCampaigns] = useState<SyndicatedCampaign[]>([
    {
      id: "synd-1",
      operatorAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      operatorTier: "PRO_OPERATOR_FRANCHISE",
      campaignTitle: "Zara Winter Flash Corridor Drop",
      brandName: "Zara Fashion",
      creativeUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&q=80",
      targetMall: "Sandton City Mall",
      targetCorridor: "Level 1 North Passage Corridor #2",
      beaconUuids: ["BEAC-SANDTON-01-N", "UWB-CORR-NODE-89"],
      broadcastChannels: {
        metaAds: true,
        googleAds: true,
        doohBillboards: true,
        autoComMesh: true,
      },
      totalImpressions: 48200,
      fulfilledTransactionsCount: 142,
      grossSalesGeneratedZar: 121268,
      operatorAffiliateKickbackUsdc: 336.85,
      platformFeeRetainedUsdc: 134.74,
      payoutStatus: "ACCUMULATING",
      hardwareAmplifierPaired: true,
    },
    {
      id: "synd-2",
      operatorAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      operatorTier: "CLOUD_SYNDICATE",
      campaignTitle: "Nike Performance Roadside DOOH Amplification",
      brandName: "Nike Performance",
      creativeUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
      targetMall: "Rosebank Mall",
      targetCorridor: "Transit Concourse Hub",
      beaconUuids: ["BEAC-ROSEBANK-03", "DOOH-TOWER-M1-N"],
      broadcastChannels: {
        metaAds: true,
        googleAds: false,
        doohBillboards: true,
        autoComMesh: true,
      },
      totalImpressions: 62400,
      fulfilledTransactionsCount: 98,
      grossSalesGeneratedZar: 146902,
      operatorAffiliateKickbackUsdc: 408.06,
      platformFeeRetainedUsdc: 163.22,
      payoutStatus: "ACCUMULATING",
      hardwareAmplifierPaired: false,
    },
  ]);

  // 9. Tokenized Premium Attention (Anti-Ad-Block Pools)
  const [attentionPools, setAttentionPools] = useState<AttentionBiddingPool[]>([
    {
      id: "pool-zara-1",
      brandName: "Zara Fashion",
      advertiserWalletAddress: "0x981A4b61C8d72835eB1bdb0ACB33d3FA3351EE43",
      activeBudgetUsdc: 450.0,
      maxBidPerAttentionTickUsdc: 0.08,
      networkUtilityLockPercent: 20,
      lockedUtilityFeeUsdc: 90.0,
      targetDemographics: {
        minDiscountPreference: 35,
        preferredCategories: ["Apparel", "Luxury", "Winter"],
        maxWalkingVelocityKmh: 4.5,
        spatialCorridorNodes: ["Level 1 North Passage", "Corridor #2"],
      },
      verifiedTicksCount: 3420,
      totalTokensRedeemedByAgents: 273.6,
      status: "ACTIVE_BIDDING",
    },
    {
      id: "pool-nike-2",
      brandName: "Nike Performance",
      advertiserWalletAddress: "0x12bA4b61C8d72835eB1bdb0ACB33d3FA3351EE99",
      activeBudgetUsdc: 600.0,
      maxBidPerAttentionTickUsdc: 0.12,
      networkUtilityLockPercent: 20,
      lockedUtilityFeeUsdc: 120.0,
      targetDemographics: {
        minDiscountPreference: 40,
        preferredCategories: ["Sportswear", "Running"],
        maxWalkingVelocityKmh: 6.0,
        spatialCorridorNodes: ["South Concourse Wing", "Athletic Hub"],
      },
      verifiedTicksCount: 4180,
      totalTokensRedeemedByAgents: 501.6,
      status: "ACTIVE_BIDDING",
    },
  ]);

  // Client-side hydration from localStorage after initial render
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedWeb3 = localStorage.getItem(STORAGE_WEB3_KEY);
      if (storedWeb3) setWalletState(JSON.parse(storedWeb3));

      const storedShopify = localStorage.getItem(STORAGE_SHOPIFY_KEY);
      if (storedShopify) setShopifyConfig(JSON.parse(storedShopify));

      const storedCampaigns = localStorage.getItem(STORAGE_CAMPAIGNS_KEY);
      if (storedCampaigns) setCampaigns(JSON.parse(storedCampaigns));

      const storedDebit = localStorage.getItem(STORAGE_DEBIT_KEY);
      if (storedDebit) setAutoDebitConfig(JSON.parse(storedDebit));

      const storedWishlist = localStorage.getItem(STORAGE_WISHLIST_KEY);
      if (storedWishlist) setWishlist(JSON.parse(storedWishlist));

      const storedCreds = localStorage.getItem(STORAGE_API_CREDENTIALS_KEY);
      if (storedCreds) setApiCredentials(JSON.parse(storedCreds));

      const storedLedger = localStorage.getItem(STORAGE_ARBITRAGE_LEDGER_KEY);
      if (storedLedger) setArbitrageLedger(JSON.parse(storedLedger));

      const storedAffiliates = localStorage.getItem(STORAGE_AFFILIATES_KEY);
      if (storedAffiliates) setSyndicatedCampaigns(JSON.parse(storedAffiliates));

      const storedAttention = localStorage.getItem(STORAGE_ATTENTION_POOLS_KEY);
      if (storedAttention) setAttentionPools(JSON.parse(storedAttention));
    } catch {
      // ignore
    } finally {
      isLoadedFromStorageRef.current = true;
    }
  }, []);

  // Save states to local storage
  useEffect(() => {
    if (typeof window !== "undefined" && isLoadedFromStorageRef.current) {
      localStorage.setItem(STORAGE_WEB3_KEY, JSON.stringify(walletState));
    }
  }, [walletState]);

  useEffect(() => {
    if (typeof window !== "undefined" && isLoadedFromStorageRef.current) {
      localStorage.setItem(STORAGE_SHOPIFY_KEY, JSON.stringify(shopifyConfig));
    }
  }, [shopifyConfig]);

  useEffect(() => {
    if (typeof window !== "undefined" && isLoadedFromStorageRef.current) {
      localStorage.setItem(STORAGE_CAMPAIGNS_KEY, JSON.stringify(campaigns));
    }
  }, [campaigns]);

  useEffect(() => {
    if (typeof window !== "undefined" && isLoadedFromStorageRef.current) {
      localStorage.setItem(STORAGE_DEBIT_KEY, JSON.stringify(autoDebitConfig));
    }
  }, [autoDebitConfig]);

  useEffect(() => {
    if (typeof window !== "undefined" && isLoadedFromStorageRef.current) {
      localStorage.setItem(STORAGE_WISHLIST_KEY, JSON.stringify(wishlist));
    }
  }, [wishlist]);

  useEffect(() => {
    if (typeof window !== "undefined" && isLoadedFromStorageRef.current) {
      localStorage.setItem(STORAGE_API_CREDENTIALS_KEY, JSON.stringify(apiCredentials));
    }
  }, [apiCredentials]);

  useEffect(() => {
    if (typeof window !== "undefined" && isLoadedFromStorageRef.current) {
      localStorage.setItem(STORAGE_ARBITRAGE_LEDGER_KEY, JSON.stringify(arbitrageLedger));
    }
  }, [arbitrageLedger]);

  useEffect(() => {
    if (typeof window !== "undefined" && isLoadedFromStorageRef.current) {
      localStorage.setItem(STORAGE_AFFILIATES_KEY, JSON.stringify(syndicatedCampaigns));
    }
  }, [syndicatedCampaigns]);

  useEffect(() => {
    if (typeof window !== "undefined" && isLoadedFromStorageRef.current) {
      localStorage.setItem(STORAGE_ATTENTION_POOLS_KEY, JSON.stringify(attentionPools));
    }
  }, [attentionPools]);

  // Network Switch Handler
  const handleSwitchNetwork = useCallback((network: ChainNetwork) => {
    const chainIds: Record<ChainNetwork, number> = {
      base: 8453,
      abstract: 2741,
      arbitrum: 42161,
    };
    setWalletState((prev) => ({
      ...prev,
      network,
      chainId: chainIds[network],
    }));
  }, []);

  // Faucet Top-up Emulation
  const handleFaucetTopup = useCallback((asset: TokenAsset, amount: number) => {
    const newTx: Web3Transaction = {
      id: `faucet-${Date.now()}`,
      hash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      timestamp: Date.now(),
      chain: "base",
      token: asset,
      amount,
      usdEquivalent: asset === "USDC" ? amount : asset === "ERC-X402" ? amount * 0.05 : amount / 18,
      type: "FAUCET_TOPUP",
      status: "confirmed",
      recipient: "User Autonomous Wallet",
    };

    setWalletState((prev) => ({
      ...prev,
      balances: {
        ...prev.balances,
        [asset === "ERC-X402" ? "ERC_X402" : asset]:
          (prev.balances[asset === "ERC-X402" ? "ERC_X402" : asset] || 0) + amount,
      },
      transactions: [newTx, ...prev.transactions],
    }));
  }, []);

  // Shopify Sync Trigger
  const handleSyncShopify = useCallback((apiKey?: string, shopDomain?: string) => {
    const updatedKey = apiKey || "shpat_custom_" + Math.random().toString(36).substring(2, 8);
    const updatedDomain = shopDomain || "sandton-store.myshopify.com";

    setShopifyConfig({
      apiKey: updatedKey,
      shopDomain: updatedDomain,
      merchantName: "Sandton Retail Hub",
      isConnected: true,
      lastSyncTime: Date.now(),
      autoMapCoordinates: true,
      syncedProductsCount: INITIAL_SHOPIFY_PRODUCTS.length,
    });
    setShopifyProducts(INITIAL_SHOPIFY_PRODUCTS);
  }, []);

  // Create or Update Spatial Ad Campaign
  const handleCreateCampaign = useCallback(
    (
      newCampaign: Omit<
        SpatialAdCampaign,
        | "id"
        | "impressionsCount"
        | "agentConversionsCount"
        | "instantAutoBagCount"
        | "spentAttentionUsdc"
      >,
    ) => {
      const created: SpatialAdCampaign = {
        ...newCampaign,
        id: `camp-${Date.now()}`,
        impressionsCount: 0,
        agentConversionsCount: 0,
        instantAutoBagCount: 0,
        spentAttentionUsdc: 0,
      };

      setCampaigns((prev) => [created, ...prev]);

      // Deduct budget pool from Web3 Wallet if advertiser paid
      if (newCampaign.attentionPoolUsdc > 0) {
        const tx: Web3Transaction = {
          id: `tx-adpool-${Date.now()}`,
          hash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
          timestamp: Date.now(),
          chain: "base",
          token: "USDC",
          amount: newCampaign.attentionPoolUsdc,
          usdEquivalent: newCampaign.attentionPoolUsdc,
          type: "AD_ATTENTION_POOL",
          status: "confirmed",
          recipient: "Decentralized Ad Attention Pool Escrow",
          metadata: { campaignId: created.id, storeName: created.merchantName },
        };

        setWalletState((prev) => ({
          ...prev,
          balances: {
            ...prev.balances,
            USDC: Math.max(0, prev.balances.USDC - newCampaign.attentionPoolUsdc),
          },
          transactions: [tx, ...prev.transactions],
        }));
      }

      return created;
    },
    [],
  );

  // Toggle or Update Syndication Channel for a Campaign
  const handleToggleSyndicationChannel = useCallback(
    (campaignId: string, channel: "metaAds" | "googleAds" | "doohBillboards", enabled: boolean) => {
      setCampaigns((prev) =>
        prev.map((c) => {
          if (c.id !== campaignId) return c;
          const currentChannels = c.syndicationChannels || {
            metaAds: {
              enabled: true,
              status: "LIVE",
              campaignId: `META-${c.id}`,
              impressions: 12000,
              reach: 8000,
              clicks: 350,
              budgetDailyUsd: 20,
            },
            googleAds: {
              enabled: true,
              status: "LIVE",
              campaignId: `GOOG-${c.id}`,
              mapImpressions: 9500,
              searchClicks: 210,
              budgetDailyUsd: 15,
            },
            doohBillboards: {
              enabled: true,
              status: "LIVE",
              billboardLocations: ["Sandton High-Speed Tower"],
              vehicleDetections: 4500,
              amplifierPowerWatts: 45,
            },
            autoComMesh: {
              enabled: true,
              status: "LIVE",
              submeterBeaconsCount: 8,
              a2aHandshakes: 1500,
              convertedDeals: 120,
            },
          };
          return {
            ...c,
            networkSync: {
              ...c.networkSync,
              [channel]: enabled,
            },
            syndicationChannels: {
              ...currentChannels,
              [channel]: {
                ...currentChannels[channel],
                enabled,
                status: enabled ? "LIVE" : "PAUSED",
              },
            },
          };
        }),
      );
    },
    [],
  );

  // Trigger Mock Outward-Bound Syndication Sync API Dispatch
  const handleTriggerSyndicationSync = useCallback(
    async (campaignId: string): Promise<{ success: boolean; syncedChannels: string[] }> => {
      setCampaigns((prev) =>
        prev.map((c) => {
          if (c.id !== campaignId || !c.syndicationChannels) return c;
          return {
            ...c,
            syndicationChannels: {
              ...c.syndicationChannels,
              metaAds: { ...c.syndicationChannels.metaAds, status: "PENDING" },
              googleAds: { ...c.syndicationChannels.googleAds, status: "PENDING" },
              doohBillboards: { ...c.syndicationChannels.doohBillboards, status: "PENDING" },
            },
          };
        }),
      );

      await new Promise((r) => setTimeout(r, 1000));

      setCampaigns((prev) =>
        prev.map((c) => {
          if (c.id !== campaignId || !c.syndicationChannels) return c;
          return {
            ...c,
            syndicationChannels: {
              ...c.syndicationChannels,
              metaAds: {
                ...c.syndicationChannels.metaAds,
                status: "LIVE",
                impressions:
                  c.syndicationChannels.metaAds.impressions + Math.floor(Math.random() * 500 + 100),
                reach: c.syndicationChannels.metaAds.reach + Math.floor(Math.random() * 300 + 50),
              },
              googleAds: {
                ...c.syndicationChannels.googleAds,
                status: "LIVE",
                mapImpressions:
                  c.syndicationChannels.googleAds.mapImpressions +
                  Math.floor(Math.random() * 400 + 80),
                searchClicks:
                  c.syndicationChannels.googleAds.searchClicks + Math.floor(Math.random() * 20 + 5),
              },
              doohBillboards: {
                ...c.syndicationChannels.doohBillboards,
                status: "LIVE",
                vehicleDetections:
                  c.syndicationChannels.doohBillboards.vehicleDetections +
                  Math.floor(Math.random() * 250 + 40),
              },
            },
          };
        }),
      );

      return {
        success: true,
        syncedChannels: [
          "Meta Ads API",
          "Google Ads API",
          "Programmatic DOOH Billboards",
          "AutoCom Spatial Mesh",
        ],
      };
    },
    [],
  );

  // Sponsor Cloud Storage on IPFS for Open Ad Library
  const handleSponsorStorage = useCallback(
    (campaignId: string, amountUsdc = 1.5, token: TokenAsset = "USDC") => {
      const tx: Web3Transaction = {
        id: `tx-storage-${Date.now()}`,
        hash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
        timestamp: Date.now(),
        chain: walletState.network,
        token,
        amount: token === "ERC-X402" ? amountUsdc * 20 : amountUsdc,
        usdEquivalent: amountUsdc,
        type: "STORAGE_FEE",
        status: "confirmed",
        recipient: "Decentralized IPFS Pinning Pool Contract",
        metadata: { campaignId },
      };

      setWalletState((prev) => {
        const tokenKey = token === "ERC-X402" ? "ERC_X402" : token === "USDC" ? "USDC" : "ZAR";
        return {
          ...prev,
          balances: {
            ...prev.balances,
            [tokenKey]: Math.max(0, prev.balances[tokenKey] - tx.amount),
          },
          transactions: [tx, ...prev.transactions],
        };
      });

      setCampaigns((prev) =>
        prev.map((c) => {
          if (c.id !== campaignId) return c;
          const currentEscrow = c.cloudStorageEscrow || {
            feePaidUsdc: 0.45,
            feePaidToken: "USDC",
            escrowTxHash: tx.hash,
            pinningNodes: 12,
            hostingStatus: "ACTIVE_PINNED",
            daysRemaining: 30,
          };
          return {
            ...c,
            cloudStorageEscrow: {
              ...currentEscrow,
              feePaidUsdc: currentEscrow.feePaidUsdc + amountUsdc,
              daysRemaining: currentEscrow.daysRemaining + 30,
              hostingStatus: "ACTIVE_PINNED",
            },
          };
        }),
      );
    },
    [walletState.network],
  );

  // Smart Offer Routing Engine Core Algorithm
  // If discount percentage is STRICTLY HIGHER than 50% (>50%), automatically trigger instant checkout and push directly into Active Shopping Bag!
  // Otherwise, route into Parked Offers.
  const handleRouteOfferPayload = useCallback(
    ({
      item,
      discountPercent,
      originalPriceZar,
      storeName,
      storeId,
      promoCode,
      category,
      imageUrl,
      onInstantBagAdded,
      onParkedAdded,
    }: {
      item: string;
      discountPercent: number;
      originalPriceZar: number;
      storeName: string;
      storeId: string;
      promoCode?: string;
      category?: string;
      imageUrl?: string;
      onInstantBagAdded?: (bought: BoughtItem) => void;
      onParkedAdded?: (parked: ParkedOffer) => void;
    }): {
      routedTo: "SHOPPING_BAG" | "PARKED_OFFERS";
      boughtItem?: BoughtItem;
      parkedOffer?: ParkedOffer;
    } => {
      const isPriorityInstantDrop = discountPercent > 50;
      const discountedPrice = Math.round(originalPriceZar * (1 - discountPercent / 100));
      const code =
        promoCode || `AUTO-${storeName.substring(0, 3).toUpperCase()}-${discountPercent}`;

      if (isPriorityInstantDrop) {
        // STRICTLY HIGHER than 50% -> Instant Conversion to Shopping Bag (🛍)
        const boughtItem: BoughtItem = {
          store: {
            id: storeId,
            name: storeName,
            cat: category || "Retail",
            item: item,
            open: originalPriceZar,
            floor: discountedPrice,
            dist: 12,
            icon: "⚡",
            image: imageUrl,
            specialBadge: `Instant ${discountPercent}% Drop`,
          },
          price: discountedPrice,
          counter: 1,
          expires: Date.now() + 86400000 * 7,
          total: 86400,
          boughtAt: Date.now(),
          orderNumber: `AUTOBAG-${Date.now().toString().slice(-6)}`,
          posPasskeyToken: `PASSKEY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        };

        // Record on-chain transaction
        const tx: Web3Transaction = {
          id: `tx-instant-${Date.now()}`,
          hash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
          timestamp: Date.now(),
          chain: walletState.network,
          token: "USDC",
          amount: Math.round((discountedPrice / 18) * 10) / 10,
          usdEquivalent: Math.round((discountedPrice / 18) * 10) / 10,
          type: "MALL_DEAL_PURCHASE",
          status: "confirmed",
          recipient: `${storeName} Spatial Settlement Contract`,
          metadata: {
            storeName,
            itemTitle: item,
            discountPercent,
          },
        };

        setWalletState((prev) => ({
          ...prev,
          transactions: [tx, ...prev.transactions],
        }));

        // Update campaign stats
        setCampaigns((prev) =>
          prev.map((c) =>
            c.merchantName.toLowerCase() === storeName.toLowerCase()
              ? {
                  ...c,
                  agentConversionsCount: c.agentConversionsCount + 1,
                  instantAutoBagCount: c.instantAutoBagCount + 1,
                  spentAttentionUsdc:
                    c.spentAttentionUsdc + c.costPerAgentImpressionUsdc + c.cpaRewardUsdc,
                }
              : c,
          ),
        );

        if (onInstantBagAdded) onInstantBagAdded(boughtItem);
        return { routedTo: "SHOPPING_BAG", boughtItem };
      } else {
        // Standard <= 50% discount -> Route to Parked Offers (🅿)
        const parkedOffer: ParkedOffer = {
          id: `parked-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          store: {
            id: storeId,
            name: storeName,
            cat: category || "Retail",
            item: item,
            open: originalPriceZar,
            floor: discountedPrice,
            dist: 18,
            icon: "🏷️",
            image: imageUrl,
            specialBadge: `${discountPercent}% Off`,
          },
          price: discountedPrice,
          originalPrice: originalPriceZar,
          discountPercent: discountPercent,
          parkedAt: Date.now(),
          expiresAt: Date.now() + 86400000 * 3,
        };

        if (onParkedAdded) onParkedAdded(parkedOffer);
        return { routedTo: "PARKED_OFFERS", parkedOffer };
      }
    },
    [walletState.network],
  );

  // Intent Wishlist Management
  const handleAddWishlistItem = useCallback(
    (item: Omit<IntentWishlistItem, "id" | "status" | "createdAt">) => {
      const created: IntentWishlistItem = {
        ...item,
        id: `wish-${Date.now()}`,
        status: "ACTIVE_SCANNING",
        createdAt: Date.now(),
      };
      setWishlist((prev) => [created, ...prev]);
    },
    [],
  );

  const handleRemoveWishlistItem = useCallback((id: string) => {
    setWishlist((prev) => prev.filter((w) => w.id !== id));
  }, []);

  // Check and Execute Intent Wishlist Matches against incoming deals
  const handleCheckWishlistMatch = useCallback(
    (deal: {
      item: string;
      storeName: string;
      originalPrice: number;
      discountedPrice: number;
      discountPercent: number;
      category?: string;
    }): IntentWishlistItem | null => {
      const match = wishlist.find(
        (w) =>
          w.status === "ACTIVE_SCANNING" &&
          deal.discountPercent >= w.minDiscountPercent &&
          deal.discountedPrice <= w.maxPriceZar &&
          (deal.item.toLowerCase().includes(w.title.toLowerCase()) ||
            w.title.toLowerCase().includes(deal.item.toLowerCase())),
      );

      if (
        match &&
        match.autoExecute &&
        autoDebitConfig.autoWalletBalanceZar >= deal.discountedPrice
      ) {
        // Execute automatic purchase using debited wallet pool
        const txHash = `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`;

        // Deduct from auto-wallet balance
        setAutoDebitConfig((prev) => ({
          ...prev,
          autoWalletBalanceZar: prev.autoWalletBalanceZar - deal.discountedPrice,
          autoWalletBalanceUsdc: Math.max(
            0,
            (prev.autoWalletBalanceZar - deal.discountedPrice) / 18,
          ),
          totalAutomatedSavingsZar:
            prev.totalAutomatedSavingsZar + (deal.originalPrice - deal.discountedPrice),
        }));

        // Update wishlist item status
        setWishlist((prev) =>
          prev.map((w) =>
            w.id === match.id
              ? {
                  ...w,
                  status: "EXECUTED",
                  matchedAt: Date.now(),
                  executedTxHash: txHash,
                  matchedDeal: {
                    storeName: deal.storeName,
                    originalPrice: deal.originalPrice,
                    discountedPrice: deal.discountedPrice,
                    discountPercent: deal.discountPercent,
                    promoCode: `WISHLIST-${deal.storeName.substring(0, 3).toUpperCase()}-${deal.discountPercent}`,
                  },
                }
              : w,
          ),
        );

        return match;
      }

      return null;
    },
    [wishlist, autoDebitConfig.autoWalletBalanceZar],
  );

  // Update Auto-Debit Settings
  const handleUpdateAutoDebit = useCallback((updates: Partial<AutoDebitConfig>) => {
    setAutoDebitConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  // Buy Marketplace Product with Web3 or Fiat
  const handlePurchaseMarketplaceItem = useCallback(
    (product: MarketplaceProduct, paymentMethod: "USDC" | "ERC-X402" | "ZAR_DEBIT") => {
      const tx: Web3Transaction = {
        id: `tx-market-${Date.now()}`,
        hash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
        timestamp: Date.now(),
        chain: walletState.network,
        token: paymentMethod === "ZAR_DEBIT" ? "ZAR_FIAT" : paymentMethod,
        amount:
          paymentMethod === "USDC"
            ? product.priceUsdc
            : paymentMethod === "ERC-X402"
              ? product.priceUsdc * 20
              : product.priceZar,
        usdEquivalent: product.priceUsdc,
        type:
          product.category === "CLOUD_STORAGE"
            ? "STORAGE_FEE"
            : product.category === "BNPL_PLAN"
              ? "BNPL_INSTALLMENT"
              : "MALL_DEAL_PURCHASE",
        status: "confirmed",
        recipient: "AutoCom Protocol Treasury Node",
        metadata: { itemTitle: product.name, tier: product.category },
      };

      setWalletState((prev) => {
        const tokenKey =
          paymentMethod === "USDC" ? "USDC" : paymentMethod === "ERC-X402" ? "ERC_X402" : "ZAR";
        return {
          ...prev,
          balances: {
            ...prev.balances,
            [tokenKey]: Math.max(0, prev.balances[tokenKey] - tx.amount),
          },
          transactions: [tx, ...prev.transactions],
        };
      });

      return tx;
    },
    [walletState.network],
  );

  // Commercialization Stream Handlers:

  // 1. Generate Developer API Key
  const handleGenerateApiKey = useCallback(
    (tier: "DEVELOPER_SANDBOX" | "ENTERPRISE_QUANTUM" = "DEVELOPER_SANDBOX") => {
      const isEnterprise = tier === "ENTERPRISE_QUANTUM";
      const newCred: AgentApiCredential = {
        id: `cred-${Date.now()}`,
        apiKey: `ac_${isEnterprise ? "quant" : "dev"}_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 6)}`,
        apiSecret: `sec_grid_${Math.random().toString(36).substring(2, 12)}`,
        tier,
        activeAgentBotsCount: 1,
        totalCorridorTicksUsed: 0,
        totalTicksLimit: isEnterprise ? "unlimited" : 50000,
        arbitrageFeeRate: isEnterprise ? 0 : 0.015,
        totalValueSavedUsdc: 0,
        protocolArbitrageFeesCollectedUsdc: 0,
        webhookUrl: "https://agent-mesh.cloud/api/autocom/negotiate-v1",
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
        status: "ACTIVE",
      };

      setApiCredentials((prev) => [newCred, ...prev]);
      return newCred;
    },
    [],
  );

  // 2. Record simulated Agent Arbitrage Savings & 1.5% Fee Slice
  const handleRecordArbitrageSavings = useCallback(
    (params: {
      agentId: string;
      merchantStore: string;
      dealItem: string;
      originalPriceZar: number;
      negotiatedPriceZar: number;
      settlementChain?: ChainNetwork;
    }) => {
      const savedZar = Math.max(0, params.originalPriceZar - params.negotiatedPriceZar);
      const savedUsdc = Math.round((savedZar / 18) * 100) / 100;
      const feeUsdc = Math.round(savedUsdc * 0.015 * 100) / 100; // 1.5% protocol arbitrage slice

      const entry: ArbitrageLedgerEntry = {
        id: `arb-${Date.now()}`,
        txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
        timestamp: Date.now(),
        agentId: params.agentId,
        merchantStore: params.merchantStore,
        dealItem: params.dealItem,
        originalPriceZar: params.originalPriceZar,
        negotiatedPriceZar: params.negotiatedPriceZar,
        totalValueSavedZar: savedZar,
        totalValueSavedUsdc: savedUsdc,
        arbitrageFeeSlicePercent: 1.5,
        arbitrageFeeCollectedUsdc: feeUsdc,
        settlementChain: params.settlementChain || walletState.network,
        status: "CONFIRMED_ON_CHAIN",
      };

      setArbitrageLedger((prev) => [entry, ...prev]);
      setApiCredentials((prev) =>
        prev.map((c) => ({
          ...c,
          totalCorridorTicksUsed: c.totalCorridorTicksUsed + 120,
          totalValueSavedUsdc: c.totalValueSavedUsdc + savedUsdc,
          protocolArbitrageFeesCollectedUsdc:
            c.protocolArbitrageFeesCollectedUsdc + (c.arbitrageFeeRate > 0 ? feeUsdc : 0),
          lastActiveAt: Date.now(),
        })),
      );

      return entry;
    },
    [walletState.network],
  );

  // 3. Run Shopify Price Elasticity Simulator
  const handleRunElasticitySimulation = useCallback(
    (params: {
      targetProduct: string;
      simulatedAgentCount: number;
      minDiscount: number;
      maxDiscount: number;
    }) => {
      const step = 10;
      const points: PriceElasticityPoint[] = [];

      for (let disc = 10; disc <= 70; disc += step) {
        // Acceptance curve model: higher discount -> higher acceptance rate
        const baseAcceptanceRate = Math.min(
          0.98,
          Math.max(0.02, Math.pow(disc / 60, 1.8) * (1 + (Math.random() * 0.08 - 0.04))),
        );
        const acceptances = Math.round(params.simulatedAgentCount * baseAcceptanceRate);
        const rejections = params.simulatedAgentCount - acceptances;
        const baseUnitOriginalPrice = 1899;
        const discountedUnit = baseUnitOriginalPrice * (1 - disc / 100);
        const grossRev = Math.round(acceptances * discountedUnit);
        const unitCost = 900;
        const netMarg = Math.round(acceptances * (discountedUnit - unitCost));
        const elasticityScore = Math.min(
          100,
          Math.max(20, Math.round((netMarg / (params.simulatedAgentCount * 500)) * 100)),
        );

        points.push({
          discountPercent: disc,
          simulatedAgentPasses: params.simulatedAgentCount,
          agentAcceptances: acceptances,
          agentRejections: rejections,
          conversionRatePercent: Math.round(baseAcceptanceRate * 1000) / 10,
          grossRevenueZar: grossRev,
          netMarginZar: netMarg,
          optimalElasticityScore: elasticityScore,
        });
      }

      setPriceElasticityCurve(points);
      setShopifyIntegration((prev) => ({
        ...prev,
        syntheticAgentPassesMonthly: prev.syntheticAgentPassesMonthly + params.simulatedAgentCount,
        lastSyncTimestamp: Date.now(),
      }));

      return points;
    },
    [],
  );

  // 4. Claim Billboard Operator Affiliate Payout
  const handleClaimAffiliatePayout = useCallback((campaignId: string) => {
    let claimedUsdc = 0;
    setSyndicatedCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== campaignId) return c;
        claimedUsdc = c.operatorAffiliateKickbackUsdc;
        return {
          ...c,
          operatorAffiliateKickbackUsdc: 0,
          payoutStatus: "PAID_OUT",
        };
      }),
    );

    if (claimedUsdc > 0) {
      setWalletState((prev) => ({
        ...prev,
        balances: {
          ...prev.balances,
          USDC: prev.balances.USDC + claimedUsdc,
        },
      }));
    }
    return claimedUsdc;
  }, []);

  // 5. Update Attention Bidding Pool bounds
  const handleUpdateAttentionBidPool = useCallback(
    (poolId: string, maxBidUsdc: number, additionalBudgetUsdc: number) => {
      setAttentionPools((prev) =>
        prev.map((p) => {
          if (p.id !== poolId) return p;
          const newBudget = p.activeBudgetUsdc + additionalBudgetUsdc;
          const utilityLock = Math.round(newBudget * (p.networkUtilityLockPercent / 100) * 10) / 10;
          return {
            ...p,
            maxBidPerAttentionTickUsdc: maxBidUsdc,
            activeBudgetUsdc: newBudget,
            lockedUtilityFeeUsdc: utilityLock,
          };
        }),
      );
    },
    [],
  );

  return {
    walletState,
    handleSwitchNetwork,
    handleFaucetTopup,
    shopifyConfig,
    shopifyProducts,
    handleSyncShopify,
    campaigns,
    handleCreateCampaign,
    handleToggleSyndicationChannel,
    handleTriggerSyndicationSync,
    handleSponsorStorage,
    handleRouteOfferPayload,
    autoDebitConfig,
    handleUpdateAutoDebit,
    wishlist,
    handleAddWishlistItem,
    handleRemoveWishlistItem,
    handleCheckWishlistMatch,
    handlePurchaseMarketplaceItem,
    // Early-Stage Monetization Streams State & Handlers
    apiCredentials,
    arbitrageLedger,
    shopifyIntegration,
    priceElasticityCurve,
    syndicatedCampaigns,
    attentionPools,
    handleGenerateApiKey,
    handleRecordArbitrageSavings,
    handleRunElasticitySimulation,
    handleClaimAffiliatePayout,
    handleUpdateAttentionBidPool,
  };
}
