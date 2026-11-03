/**
 * Autocomm Personal Agent & Memory Vault Protocol Types
 * Defines data models for user-created autonomous shopping agents:
 * - Sovereign .agent name & ANS tier pricing
 * - Natural language shopping intents, sizes & reference links
 * - Memory vault for uploaded receipts, shopping bills & past lists
 * - Voice-to-text transcripts & voice profile
 * - 24/7 vs custom operating schedule
 * - Zero-knowledge privacy guarantees
 * - Pre-funded autonomous bargaining balance
 */

export type AgentDeviceMode = "auto" | "desktop" | "mobile" | "meta_ar" | "smartwatch";

export type AgentOperatingStatus = "ONLINE_24_7" | "ACTIVE" | "SLEEPING" | "NEGOTIATING";

export interface MemoryVaultBillItem {
  id: string;
  name: string;
  originalPriceZar: number;
  quantity?: number;
  category?: string;
  storeName?: string;
}

export interface MemoryVaultBill {
  id: string;
  fileName: string;
  fileSize: string;
  uploadedAt: number;
  storeName: string;
  totalSpentZar: number;
  extractedItems: MemoryVaultBillItem[];
  insights: string;
}

export interface VoiceIntentRecord {
  id: string;
  transcript: string;
  recordedAt: number;
  durationSeconds: number;
  detectedEntities?: {
    product?: string;
    size?: string;
    targetPriceZar?: number;
    stores?: string[];
  };
}

export interface UserPersonalAgent {
  id: string;
  name: string; // e.g. "lisa"
  fullName: string; // e.g. "lisa.agent"
  pricingUsd: number;
  pricingZar: number;
  isFreeTier: boolean;
  avatarIcon: string;
  avatarColor: string;

  // Shopping Intents & Specifications
  intent: {
    whatToBuy: string; // Primary item or search
    category: string;
    sizes: string; // "UK 9 / EU 43", "Medium", "32W"
    preferences: string; // "Black or Navy, breathable mesh"
    referenceLinks: string[]; // external web links (Nike.com, Amazon, Takealot)
    targetPriceZar: number;
    ceilingPriceZar: number;
    targetDiscountPercent: number; // e.g. 25 = 25% off
    stores: string[]; // store names or URLs
  };

  // Agent Long-Term Memory Core
  memoryVault: {
    bills: MemoryVaultBill[];
    shoppingLists: string[];
    learnedPreferencesCount: number;
  };

  // Voice Profile & Speech Transcripts
  voiceIntents: VoiceIntentRecord[];

  // Autonomous Operation Timing & Sleep Schedule
  schedule: {
    is24_7: boolean; // default true
    activeFrom: string; // e.g. "08:00"
    sleepAt: string; // e.g. "22:00"
    timezone: string;
    currentStatus: AgentOperatingStatus;
  };

  // Zero-Knowledge Privacy & Enclave Settings
  privacy: {
    zeroKnowledgeShield: boolean; // default true - hides human identity, cards, phone, address
    stealthBargaining: boolean; // hides presence until deal strike
    localEnclaveStorage: boolean; // keeps memory encrypted locally
  };

  // Pre-funded Wallet & Execution Rails
  funding: {
    preFundedBalanceZar: number;
    currency: "ZAR" | "USDC";
    paymentRail: "PAYSHAP_STITCH" | "BASE_USDC" | "CARD" | "SOLANA_PAY";
    autoExecuteDeals: boolean;
  };

  createdAt: number;
  lastActiveAt: number;
}

export interface CreateAgentFormData {
  agentName: string;
  whatToBuy: string;
  category: string;
  sizes: string;
  preferences: string;
  referenceUrlInput: string;
  referenceLinks: string[];
  targetPriceZar: number;
  ceilingPriceZar: number;
  targetDiscountPercent: number;
  storeInput: string;
  stores: string[];
  is24_7: boolean;
  activeFrom: string;
  sleepAt: string;
  preFundedBalanceZar: number;
  paymentRail: "PAYSHAP_STITCH" | "BASE_USDC" | "CARD" | "SOLANA_PAY";
  zeroKnowledgeShield: boolean;
  autoExecuteDeals: boolean;
}
