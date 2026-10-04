// ============================================================================
// AutoCom Protocol: Agent-to-Agent (A2A) Commerce Core & Settlement Engine
// Autonomous Realtime Machine-to-Machine (M2M) Parameter Negotiation & Rails
// ============================================================================

import type { Store } from "./acn-data";

export interface AIBot {
  id: string;
  name: string;
  type: "consumer" | "merchant";
  strategy: string;
  strategyType: "BATNA" | "Logrolling" | "MarginProtection" | "ElasticityCurve";
  parameters: {
    maxDiscountAllowed?: number; // For Merchant (e.g. 0.25 = 25% max floor)
    targetDiscount?: number; // For Consumer (e.g. 0.30 = wants 30% off)
    absoluteCeiling?: number; // Maximum consumer budget in ZAR
    minHoldingStock?: number;
    logrollIncentive?:
      "immediate_settlement" | "extended_warranty" | "bundled_accessory" | "loyalty_token";
  };
}

export interface UserProfile {
  id: string;
  name: string;
  role: "buyer" | "merchant";
  allocatedBot: AIBot;
  walletBalance: number; // Pre-funded balance in ZAR (Option A)
  paymentPreference: "A" | "B"; // 'A' = Wallet Ledger, 'B' = Direct PayShap/Stitch Prompt
  linkedBankId?: string;
}

export interface ProductItem {
  id: string;
  title: string;
  originalPriceZAR: number;
  merchantId: string;
  category: string;
  stockLevel: number;
  storeRef?: Store;
}

export interface NegotiationLog {
  id: string;
  sender: "consumer_bot" | "merchant_bot" | "system";
  message: string;
  timestamp: string;
  currentOfferZAR: number;
  phase: "Discovery" | "Anchoring" | "Logrolling" | "Alignment" | "Settlement" | "Rejected";
  telemetryMetric?: string;
}

export interface AgentTransaction {
  id: string;
  type: "Wallet" | "Direct_Pay";
  userId: string;
  merchantId: string;
  amountZAR: number;
  productTitle: string;
  status: "COMPLETED" | "PENDING_USER_APPROVAL" | "REFUNDED" | "FAILED";
  stitchId?: string;
  qrToken: string;
  timestamp: number;
  negotiatedDiscountPercent: number;
  originalPriceZAR: number;
}

const STORAGE_A2A_USER_KEY = "autocom_a2a_user_profile_v1";
const STORAGE_A2A_TXS_KEY = "autocom_a2a_transactions_v1";

// Default preset South African bots
export const DEFAULT_CONSUMER_BOT: AIBot = {
  id: "bot_buyer_muse_za",
  name: "Muse-ZA (Autonomous Buyer)",
  type: "consumer",
  strategy: "Hard Boundary Anchoring (BATNA Enforcements)",
  strategyType: "BATNA",
  parameters: {
    targetDiscount: 0.25, // 25% target discount
    absoluteCeiling: 1500, // ZAR 1,500 ceiling
    logrollIncentive: "immediate_settlement",
  },
};

export const DEFAULT_MERCHANT_BOT: AIBot = {
  id: "bot_merch_nibble_za",
  name: "Nibble-ZA (Margin Shield)",
  type: "merchant",
  strategy: "Dynamic Programmatic Margin Protection",
  strategyType: "MarginProtection",
  parameters: {
    maxDiscountAllowed: 0.2, // 20% max margin discount
    minHoldingStock: 12,
  },
};

export function getStoredA2AProfile(userName = "Consumer Agent"): UserProfile {
  if (typeof window === "undefined") {
    return {
      id: "usr_auto_01",
      name: userName,
      role: "buyer",
      allocatedBot: { ...DEFAULT_CONSUMER_BOT },
      walletBalance: 1250.0,
      paymentPreference: "A",
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_A2A_USER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as UserProfile;
      return parsed;
    }
  } catch {
    // ignore
  }

  const initial: UserProfile = {
    id: `usr_${Date.now().toString(36)}`,
    name: userName,
    role: "buyer",
    allocatedBot: { ...DEFAULT_CONSUMER_BOT },
    walletBalance: 1250.0,
    paymentPreference: "A",
    linkedBankId: "stitch-bank-capitec-za",
  };
  saveA2AProfile(initial);
  return initial;
}

export function saveA2AProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_A2A_USER_KEY, JSON.stringify(profile));
  } catch {
    // ignore
  }
}

export function getStoredA2ATransactions(): AgentTransaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_A2A_TXS_KEY);
    return raw ? (JSON.parse(raw) as AgentTransaction[]) : [];
  } catch {
    return [];
  }
}

export function saveA2ATransaction(tx: AgentTransaction): void {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredA2ATransactions();
    const updated = [tx, ...current.filter((t) => t.id !== tx.id)];
    localStorage.setItem(STORAGE_A2A_TXS_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function updateA2ATransactionStatus(txId: string, status: AgentTransaction["status"]): void {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredA2ATransactions();
    const updated = current.map((t) => (t.id === txId ? { ...t, status } : t));
    localStorage.setItem(STORAGE_A2A_TXS_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

// ============================================================================
// Core Agent Negotiation Engine (M2M Mathematical Parameter Alignment)
// ============================================================================

export interface NegotiationCallbacks {
  onLog: (log: NegotiationLog) => void;
  onSuccess: (finalPrice: number, tradeOff: string | null) => void;
  onFail: (reason: string) => void;
}

export function runAgentNegotiation(
  product: ProductItem,
  buyerBot: AIBot,
  merchantBot: AIBot,
  callbacks: NegotiationCallbacks,
  onTurnDelay = 1200,
): () => void {
  let isCancelled = false;
  let attempts = 0;
  const maxAttempts = 5;

  const originalPrice = product.originalPriceZAR;
  const maxMerchantDiscount = merchantBot.parameters.maxDiscountAllowed ?? 0.2;
  const targetConsumerDiscount = buyerBot.parameters.targetDiscount ?? 0.25;
  const absoluteFloor = originalPrice * (1 - maxMerchantDiscount);
  const ceiling = buyerBot.parameters.absoluteCeiling ?? originalPrice * 1.5;

  let currentConsumerOffer = originalPrice * (1 - targetConsumerDiscount);
  let currentMerchantCounter = originalPrice;

  // Log initial system discovery
  callbacks.onLog({
    id: `log_${Date.now()}_0`,
    sender: "system",
    message: `🚀 [MCP Handshake] Discovery Phase initialized for ${product.title}. Base price: R${originalPrice.toFixed(2)}. Micro-mesh latency: 28ms.`,
    timestamp: new Date().toLocaleTimeString(),
    currentOfferZAR: originalPrice,
    phase: "Discovery",
    telemetryMetric: "Latency: 28ms · BATNA Protocol: Active",
  });

  const intervalId = setInterval(() => {
    if (isCancelled) {
      clearInterval(intervalId);
      return;
    }

    attempts++;

    // -------------------------------------------------------------
    // Phase 1 / 2: Consumer Bot Turn (Anchoring & BATNA enforcement)
    // -------------------------------------------------------------
    if (attempts === 1) {
      callbacks.onLog({
        id: `log_${Date.now()}_${attempts}_c`,
        sender: "consumer_bot",
        message: `[${buyerBot.name}] Hard Boundary Anchoring: Probing floor with opening bid R${currentConsumerOffer.toFixed(2)} (-${(targetConsumerDiscount * 100).toFixed(0)}% off). Verifiable market data attached.`,
        timestamp: new Date().toLocaleTimeString(),
        currentOfferZAR: currentConsumerOffer,
        phase: "Anchoring",
        telemetryMetric: `BATNA Floor: R${currentConsumerOffer.toFixed(2)}`,
      });
    } else {
      callbacks.onLog({
        id: `log_${Date.now()}_${attempts}_c`,
        sender: "consumer_bot",
        message: `[${buyerBot.name}] Multi-Variable Re-anchor: Adjusting offer to R${currentConsumerOffer.toFixed(2)} backed by dwell-time & instant AP2 settlement guarantee.`,
        timestamp: new Date().toLocaleTimeString(),
        currentOfferZAR: currentConsumerOffer,
        phase: "Logrolling",
        telemetryMetric: `Target: R${currentConsumerOffer.toFixed(2)}`,
      });
    }

    // Check if merchant floor is met by consumer offer
    if (currentConsumerOffer >= absoluteFloor) {
      callbacks.onLog({
        id: `log_${Date.now()}_match_m`,
        sender: "merchant_bot",
        message: `[${merchantBot.name}] Offer accepts margin threshold constraint (Floor: R${absoluteFloor.toFixed(2)}). Match confirmed at R${currentConsumerOffer.toFixed(2)}!`,
        timestamp: new Date().toLocaleTimeString(),
        currentOfferZAR: currentConsumerOffer,
        phase: "Alignment",
        telemetryMetric: `Margin: +${(((currentConsumerOffer - absoluteFloor) / originalPrice) * 100).toFixed(1)}%`,
      });

      callbacks.onLog({
        id: `log_${Date.now()}_settle`,
        sender: "system",
        message: `✅ [A2A Alignment Confirmed] Deal finalized at R${currentConsumerOffer.toFixed(2)} (Saved R${(originalPrice - currentConsumerOffer).toFixed(2)} / -${Math.round(((originalPrice - currentConsumerOffer) / originalPrice) * 100)}%). Single-use checkout token generated!`,
        timestamp: new Date().toLocaleTimeString(),
        currentOfferZAR: currentConsumerOffer,
        phase: "Settlement",
      });

      clearInterval(intervalId);
      callbacks.onSuccess(currentConsumerOffer, null);
      return;
    }

    // -------------------------------------------------------------
    // Merchant Bot Counter-Proposal (Margin Protection & Concession Step)
    // -------------------------------------------------------------
    const merchantCompromiseStep = (originalPrice - absoluteFloor) / maxAttempts;
    currentMerchantCounter = Math.max(
      absoluteFloor,
      currentMerchantCounter - merchantCompromiseStep,
    );

    if (attempts === 2) {
      callbacks.onLog({
        id: `log_${Date.now()}_${attempts}_m`,
        sender: "merchant_bot",
        message: `[${merchantBot.name}] Bid R${currentConsumerOffer.toFixed(2)} breaches margin ceiling. Logrolling counter-offer: R${currentMerchantCounter.toFixed(2)} with instant fulfillment voucher.`,
        timestamp: new Date().toLocaleTimeString(),
        currentOfferZAR: currentMerchantCounter,
        phase: "Logrolling",
        telemetryMetric: `Floor Margin: ${(maxMerchantDiscount * 100).toFixed(0)}% max`,
      });
    } else {
      callbacks.onLog({
        id: `log_${Date.now()}_${attempts}_m`,
        sender: "merchant_bot",
        message: `[${merchantBot.name}] Dynamic Programmatic Concession: Stepping down to R${currentMerchantCounter.toFixed(2)} to prevent buyer abandonment.`,
        timestamp: new Date().toLocaleTimeString(),
        currentOfferZAR: currentMerchantCounter,
        phase: "Logrolling",
      });
    }

    // Check if merchant counter falls inside consumer wallet ceiling
    if (currentMerchantCounter <= ceiling && attempts >= 2) {
      // High chance of agreement if counter is reasonably close
      const gap = currentMerchantCounter - currentConsumerOffer;
      if (gap < originalPrice * 0.08 || attempts >= 3) {
        const settledPrice = Math.max(
          absoluteFloor,
          (currentConsumerOffer + currentMerchantCounter) / 2,
        );

        callbacks.onLog({
          id: `log_${Date.now()}_agree_c`,
          sender: "consumer_bot",
          message: `[${buyerBot.name}] Counter R${settledPrice.toFixed(2)} falls inside maximum wallet ceiling (R${ceiling}). Accepting parameter agreement!`,
          timestamp: new Date().toLocaleTimeString(),
          currentOfferZAR: settledPrice,
          phase: "Alignment",
        });

        callbacks.onLog({
          id: `log_${Date.now()}_agree_sys`,
          sender: "system",
          message: `✅ [A2A Alignment Confirmed] Settled at R${settledPrice.toFixed(2)}. Saved R${(originalPrice - settledPrice).toFixed(2)} (-${Math.round(((originalPrice - settledPrice) / originalPrice) * 100)}%). Ready for settlement execution.`,
          timestamp: new Date().toLocaleTimeString(),
          currentOfferZAR: settledPrice,
          phase: "Settlement",
        });

        clearInterval(intervalId);
        callbacks.onSuccess(settledPrice, "Guaranteed Instant Settlement");
        return;
      }
    }

    // Increment consumer offer slightly for next iteration
    currentConsumerOffer = Math.min(
      absoluteFloor + 5,
      currentConsumerOffer + merchantCompromiseStep * 0.85,
    );

    if (attempts >= maxAttempts) {
      callbacks.onLog({
        id: `log_${Date.now()}_fail`,
        sender: "system",
        message: `❌ [Negotiation Walkaway] No mathematical parameter overlap achieved between ${buyerBot.name} and ${merchantBot.name}. Autonomous agent walked away without ego.`,
        timestamp: new Date().toLocaleTimeString(),
        currentOfferZAR: originalPrice,
        phase: "Rejected",
      });

      clearInterval(intervalId);
      callbacks.onFail(
        "Parameter overlap could not be established within algorithmic boundary rules.",
      );
    }
  }, onTurnDelay);

  return () => {
    isCancelled = true;
    clearInterval(intervalId);
  };
}
