/**
 * AutoCom Decentralized Ad Server & Spatial Distribution Type Definitions
 * Covers AdCreatives, Spatial Corridors & Beacons Metadata, Multi-Channel Syndication & Micro-Escrow Payments.
 */

export type AdMediaType = "image" | "video" | "interactive_deal" | "spatial_card";

export type SyndicationNetworkStatus = "LIVE" | "PENDING" | "SYNCED" | "PAUSED" | "ERROR";

export type MicroPaymentMethod = "metamask_usdc" | "bank_card" | "erc_x402";

/**
 * Rich Media Creative Asset representation with compression and IPFS pinning telemetry
 */
export interface AdCreative {
  id: string;
  fileName: string;
  fileSizeKb: number;
  compressedSizeKb: number;
  compressionRatio: string; // e.g. "85.5% Saved"
  mediaUrl: string;
  mediaType: AdMediaType;
  ipfsCid: string; // Cryptographic IPFS CID hash (Qm...)
  pinningNodesCount: number;
  uploadedAt: number;
  aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3";
  resolution?: string;
  bitrateKbps?: number;
}

/**
 * Sub-meter indoor spatial corridor, physical mall and beacon anchor metadata
 */
export interface SpatialMetadata {
  targetMall: string;
  mallId?: string;
  targetCorridor: string;
  corridorId?: string;
  floorLevel?: string;
  beaconUuids: string[]; // e.g. ["BEAC-SANDTON-01-N", "UWB-CORR-NODE-89"]
  uwbAnchors?: string[];
  broadcastRadiusMeters: number; // 5m - 100m sub-meter accuracy
  spatialCoordinates?: {
    x: number;
    y: number;
    z?: number;
    storeId?: string;
    storeName?: string;
  };
  ipfsCid: string;
  compressedAssetSizeKb: number;
  originalAssetSizeKb: number;
  compressionRatio: string;
  processedAt: number;
  gpsBoundingBox?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

/**
 * Active Multi-Platform Syndication Status for Meta, Google, DOOH Billboards & Spatial Mesh
 */
export interface AdSyndicationStatus {
  metaAds: {
    enabled: boolean;
    status: SyndicationNetworkStatus;
    campaignId: string;
    impressions: number;
    reach: number;
    clicks: number;
    budgetDailyUsd: number;
    lastSyncedAt?: number;
    targetGeoRadiusKm?: number;
  };
  googleAds: {
    enabled: boolean;
    status: SyndicationNetworkStatus;
    campaignId: string;
    mapImpressions: number;
    searchClicks: number;
    budgetDailyUsd: number;
    lastSyncedAt?: number;
    promotedPins?: string[];
  };
  doohBillboards: {
    enabled: boolean;
    status: SyndicationNetworkStatus;
    billboardLocations: string[];
    vehicleDetections: number;
    amplifierPowerWatts: number;
    lastSyncedAt?: number;
    passingVelocityMaxKmh?: number;
  };
  autoComMesh: {
    enabled: boolean;
    status: SyndicationNetworkStatus;
    submeterBeaconsCount: number;
    a2aHandshakes: number;
    convertedDeals: number;
    submeterAccuracyMeters?: number;
  };
}

/**
 * Micro-Payment Escrow for Decentralized Cloud Hosting
 */
export interface AdMicroEscrowPayment {
  method: MicroPaymentMethod;
  feeAmountUsdc: number;
  feeAmountZar: number;
  txHash?: string;
  cardMask?: string;
  status: "PENDING" | "CONFIRMED" | "FAILED";
  timestamp: number;
  hostingDurationDays: number;
  pinningNodes: number;
}

/**
 * Complete Structured Payload for Merchant Ad Upload & Publishing
 */
export interface MerchantAdUploadPayload {
  title: string;
  merchantId: string;
  merchantName: string;
  merchantLogo: string;
  brandBgColor: string;
  brandTextColor: string;
  creative: AdCreative;
  spatialMetadata: SpatialMetadata;
  syndication: AdSyndicationStatus;
  discountPayload: {
    percentage: number;
    promoCode: string;
    description: string;
    originalPriceZar: number;
    discountedPriceZar: number;
    expiresAt: number;
    isAutoBagPriority: boolean; // True if percentage > 50%
  };
  attentionPoolUsdc: number;
  microEscrowPayment: AdMicroEscrowPayment;
  active: boolean;
  createdAt: number;
}
