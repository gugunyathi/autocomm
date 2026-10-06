export * from "./adserver";

export type ChainNetwork = "base" | "abstract" | "arbitrum";

export type TokenAsset = "USDC" | "ERC-X402" | "ZAR_FIAT";

export interface Web3Transaction {
  id: string;
  hash: string;
  timestamp: number;
  chain: ChainNetwork;
  token: TokenAsset;
  amount: number;
  usdEquivalent: number;
  type:
    | "MALL_DEAL_PURCHASE"
    | "AD_ATTENTION_POOL"
    | "AUTO_DEBIT"
    | "STORAGE_FEE"
    | "BNPL_INSTALLMENT"
    | "FAUCET_TOPUP";
  status: "confirmed" | "pending" | "failed";
  recipient: string;
  metadata?: {
    storeName?: string;
    itemTitle?: string;
    discountPercent?: number;
    campaignId?: string;
    tier?: string;
  };
}

export interface Web3WalletState {
  address: string;
  chainId: number;
  network: ChainNetwork;
  balances: {
    USDC: number;
    ERC_X402: number;
    ZAR: number;
  };
  isConnected: boolean;
  isConnecting: boolean;
  transactions: Web3Transaction[];
}

// --- Shopify Integration Layer ---
export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  vendor: string;
  category: string;
  priceZar: number;
  priceUsdc: number;
  inventoryQuantity: number;
  sku: string;
  imageUrl: string;
  tags: string[];
  spatialCoordinates: {
    storeId: string;
    storeName: string;
    x: number;
    y: number;
    floor: string;
  };
  activeDynamicPromo?: {
    discountPercent: number;
    promoCode: string;
    autoComAgentEligible: boolean;
  };
}

export interface ShopifyStoreConfig {
  apiKey: string;
  shopDomain: string;
  merchantName: string;
  isConnected: boolean;
  lastSyncTime: number | null;
  autoMapCoordinates: boolean;
  syncedProductsCount: number;
}

// --- Tokenized Attention Ad Server & Distribution ---
export interface SpatialMetadataPayload {
  targetMall: string;
  targetCorridor: string;
  beaconUuids: string[];
  broadcastRadiusMeters: number;
  ipfsCid: string;
  compressedAssetSizeKb: number;
  originalAssetSizeKb: number;
  compressionRatio: string;
  processedAt: number;
}

export interface CloudStorageEscrowState {
  feePaidUsdc: number;
  feePaidToken: TokenAsset;
  escrowTxHash: string;
  pinningNodes: number;
  hostingStatus: "ACTIVE_PINNED" | "LOW_BALANCE" | "EXPIRED";
  daysRemaining: number;
}

export interface SyndicationChannelStatus {
  metaAds: {
    enabled: boolean;
    status: "LIVE" | "PENDING" | "SYNCED" | "PAUSED";
    campaignId: string;
    impressions: number;
    reach: number;
    clicks: number;
    budgetDailyUsd: number;
  };
  googleAds: {
    enabled: boolean;
    status: "LIVE" | "PENDING" | "SYNCED" | "PAUSED";
    campaignId: string;
    mapImpressions: number;
    searchClicks: number;
    budgetDailyUsd: number;
  };
  doohBillboards: {
    enabled: boolean;
    status: "LIVE" | "PENDING" | "SYNCED" | "PAUSED";
    billboardLocations: string[];
    vehicleDetections: number;
    amplifierPowerWatts: number;
  };
  autoComMesh: {
    enabled: boolean;
    status: "LIVE";
    submeterBeaconsCount: number;
    a2aHandshakes: number;
    convertedDeals: number;
  };
}

export interface SpatialAdCampaign {
  id: string;
  title: string;
  merchantId: string;
  merchantName: string;
  merchantLogo: string;
  brandBgColor: string;
  brandTextColor: string;
  mediaUrl: string;
  mediaType: "image" | "video" | "interactive_deal";
  targetRadiusMeters: number;
  targetCategories: string[];
  spatialCoordinates: {
    storeId: string;
    x: number;
    y: number;
  };
  discountPayload: {
    percentage: number;
    promoCode: string;
    description: string;
    minSpendZar?: number;
    originalPriceZar: number;
    discountedPriceZar: number;
    expiresAt: number;
  };
  // Tokenized Attention Economics
  attentionPoolUsdc: number;
  spentAttentionUsdc: number;
  costPerAgentImpressionUsdc: number;
  cpaRewardUsdc: number;
  impressionsCount: number;
  agentConversionsCount: number;
  instantAutoBagCount: number; // For >50% discount conversions
  active: boolean;
  // Deep-Dive Spatial Metadata & Beacon UUIDs
  spatialMetadata?: SpatialMetadataPayload;
  // Cloud Space Micro-Payment Escrow
  cloudStorageEscrow?: CloudStorageEscrowState;
  // Active Multi-Platform Syndication Channels
  syndicationChannels?: SyndicationChannelStatus;
  // Multi-Network Cross-Sync
  networkSync: {
    googleAds: boolean;
    metaAds: boolean;
    doohBillboards: boolean;
    doohBillboardLocations?: string[];
  };
}

export interface AgentAdAuctionBid {
  id: string;
  campaignId: string;
  campaignTitle: string;
  advertiserAddress: string;
  bidAmountUsdc: number;
  agentAttentionScore: number;
  status: "WON" | "OUTBID" | "ROUTED_TO_AGENT";
  timestamp: number;
}

// --- Recurring FinTech Engine & Auto-Wallet ---
export type AutoDebitTier = 200 | 500 | 1000;
export type AutoDebitSchedule = "weekly" | "monthly";

export interface AutoDebitConfig {
  enabled: boolean;
  tier: AutoDebitTier;
  schedule: AutoDebitSchedule;
  nextDebitDate: string;
  autoWalletBalanceZar: number;
  autoWalletBalanceUsdc: number;
  mandateSigned: boolean;
  bankAccountMask: string;
  autoExecuteWishlist: boolean;
  totalAutomatedSavingsZar: number;
}

export interface IntentWishlistItem {
  id: string;
  title: string;
  category: string;
  minDiscountPercent: number; // e.g. 40 means >= 40%
  maxPriceZar: number;
  targetBrand?: string;
  autoExecute: boolean; // Auto-spend from debit pool if found
  status: "ACTIVE_SCANNING" | "EXECUTED" | "EXPIRED";
  createdAt: number;
  matchedAt?: number;
  matchedDeal?: {
    storeName: string;
    originalPrice: number;
    discountedPrice: number;
    discountPercent: number;
    promoCode: string;
  };
  executedTxHash?: string;
}

// --- Decentralized Open Ad Library & Storage Monetization ---
export interface PublicAdMediaItem {
  id: string;
  campaignId: string;
  brandName: string;
  brandLogo: string;
  brandBgColor: string;
  headline: string;
  creativeUrl: string;
  mediaType: "image" | "video" | "interactive_deal";
  targetRadius: string;
  discountPercentage: number;
  activeChains: ChainNetwork[];
  storageNodeHost: string;
  storageFeeMicroUsdcPerDay: number;
  sponsoredByAgent: string;
  verifiedOnChainProof: string;
  syncedNetworks: string[];
  totalViews24h: number;
}

// --- Hardware & FinTech Marketplace Store ---
export type MarketplaceCategory =
  | "HARDWARE_BEACON"
  | "EDGE_DEVICE"
  | "BLUETOOTH_AMPLIFIER"
  | "CLOUD_STORAGE"
  | "MERCHANT_SUBSCRIPTION"
  | "CONSUMER_INSURANCE"
  | "BNPL_PLAN"
  | "POS_MICRO_LOAN";

export interface MarketplaceProduct {
  id: string;
  name: string;
  category: MarketplaceCategory;
  priceZar: number;
  priceUsdc: number;
  monthlySubscription?: boolean;
  description: string;
  specs: string[];
  badge?: string;
  inStock: boolean;
  rating: number;
  reviewsCount: number;
  iconEmoji: string;
  gradient: string;
}

// --- PART 1 & 3: The Commercialization Engine (Early-Stage Monetization Architectures) ---

export type MonetizationStreamKey =
  | "DEVELOPER_API_SANDBOX"
  | "SHOPIFY_SYNTHETIC_TRAFFIC"
  | "BILLBOARD_AFFILIATE_NETWORK"
  | "TOKENIZED_ATTENTION_POOL";

export interface MonetizationTier {
  id: string;
  stream: MonetizationStreamKey;
  name: string;
  priceMonthlyUsd: number;
  priceMonthlyZar?: number;
  billingPeriod: "monthly" | "upfront_hardware" | "per_tick";
  badge?: string;
  popular?: boolean;
  description: string;
  specs: string[];
  limits: {
    activeAgentBots?: number | "unlimited";
    spatialCorridorTicksMonthly?: number | "unlimited";
    arbitrageProtocolFeePercent: number; // e.g. 1.5% or 0%
    shopifyStorefronts?: number | "unlimited";
    inventoryItemsMax?: number | "unlimited";
    syntheticAgentPassesMonthly?: number | "unlimited";
    syndicatedCampaignsMax?: number | "unlimited";
    affiliateKickbackPercent?: number; // e.g. 5%
    platformFacilitationFeePercent?: number; // e.g. 2%
    costPerAttentionVerificationTickUsdc?: number; // e.g. $0.05
    networkUtilityLockPercent?: number; // e.g. 20%
  };
  ctaText: string;
}

export interface AgentApiCredential {
  id: string;
  apiKey: string;
  apiSecret: string;
  tier: "DEVELOPER_SANDBOX" | "ENTERPRISE_QUANTUM";
  activeAgentBotsCount: number;
  totalCorridorTicksUsed: number;
  totalTicksLimit: number | "unlimited";
  arbitrageFeeRate: number; // 0.015 (1.5%) or 0
  totalValueSavedUsdc: number;
  protocolArbitrageFeesCollectedUsdc: number;
  webhookUrl?: string;
  createdAt: number;
  lastActiveAt: number;
  status: "ACTIVE" | "REVOKED" | "RATE_LIMITED";
}

export interface ArbitrageLedgerEntry {
  id: string;
  txHash: string;
  timestamp: number;
  agentId: string;
  merchantStore: string;
  dealItem: string;
  originalPriceZar: number;
  negotiatedPriceZar: number;
  totalValueSavedZar: number;
  totalValueSavedUsdc: number;
  arbitrageFeeSlicePercent: number; // 1.5%
  arbitrageFeeCollectedUsdc: number;
  settlementChain: ChainNetwork;
  status: "CONFIRMED_ON_CHAIN" | "PENDING_ARBITRAGE";
}

export interface ShopifyIntegrationConfig {
  shopUrl: string;
  accessToken: string;
  merchantName: string;
  tier: "STARTER_SYNC" | "DYNAMIC_ENGINE";
  isConnected: boolean;
  lastSyncTimestamp: number | null;
  syncedInventoryCount: number;
  maxInventoryLimit: number | "unlimited";
  syntheticAgentPassesMonthly: number;
  maxPassesMonthly: number | "unlimited";
  autoPriceElasticityReports: boolean;
  spatialFloorMapping: {
    mallName: string;
    storeNodeId: string;
    corridorAnchor: string;
    beaconUuid: string;
  };
}

export interface PriceElasticityPoint {
  discountPercent: number;
  simulatedAgentPasses: number;
  agentAcceptances: number;
  agentRejections: number;
  conversionRatePercent: number;
  grossRevenueZar: number;
  netMarginZar: number;
  optimalElasticityScore: number;
}

export interface SyndicatedCampaign {
  id: string;
  operatorAddress: string;
  operatorTier: "CLOUD_SYNDICATE" | "PRO_OPERATOR_FRANCHISE";
  campaignTitle: string;
  brandName: string;
  creativeUrl: string;
  targetMall: string;
  targetCorridor: string;
  beaconUuids: string[];
  broadcastChannels: {
    metaAds: boolean;
    googleAds: boolean;
    doohBillboards: boolean;
    autoComMesh: boolean;
  };
  totalImpressions: number;
  fulfilledTransactionsCount: number;
  grossSalesGeneratedZar: number;
  operatorAffiliateKickbackUsdc: number; // 5% tracking kickback
  platformFeeRetainedUsdc: number; // 2% facilitation fee
  payoutStatus: "ACCUMULATING" | "PAID_OUT";
  hardwareAmplifierPaired?: boolean;
}

export interface AttentionBiddingPool {
  id: string;
  brandName: string;
  advertiserWalletAddress: string;
  activeBudgetUsdc: number;
  maxBidPerAttentionTickUsdc: number; // starting at $0.05
  networkUtilityLockPercent: number; // 20%
  lockedUtilityFeeUsdc: number;
  targetDemographics: {
    minDiscountPreference: number;
    preferredCategories: string[];
    maxWalkingVelocityKmh: number;
    spatialCorridorNodes: string[];
  };
  verifiedTicksCount: number;
  totalTokensRedeemedByAgents: number;
  status: "ACTIVE_BIDDING" | "DEPLETED" | "PAUSED";
}

export interface WalletChainContext {
  activeChain: ChainNetwork;
  nativeUsdcBalance: number;
  ercX402Balance: number;
  fiatFallbackBalanceZar: number;
  autoWalletBalanceZar: number;
  selectedTopupScheduleTier: AutoDebitTier;
  targetWishlist: WishlistItem[];
}

export interface WishlistItem {
  id: string;
  title: string;
  category: string;
  minDiscountPercent: number; // strictly checked against agent negotiated deals
  maxBudgetZar: number;
  targetBrand?: string;
  autoCheckoutEnabled: boolean;
  status: "WATCHING" | "EXECUTED" | "EXPIRED";
  matchedDeal?: {
    dealId: string;
    merchantName: string;
    originalPriceZar: number;
    discountedPriceZar: number;
    discountPercentage: number;
    executedTxHash: string;
    qrVoucherCode: string;
    timestamp: number;
  };
}
