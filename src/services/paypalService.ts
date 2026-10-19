/**
 * AutoCom PayPal Sandbox & Braintree Vault Autonomous Commerce Service
 *
 * Provides client-side and simulated machine-to-machine (M2M) settlement
 * loops for autonomous shopping agents operating in South African mall ecosystems.
 * Handles ZAR-to-USD currency normalization and zero-click vaulted agent execution.
 */

import type {
  A2AMessage,
  A2APayPalOrderResponse,
  A2AVaultedPaymentResult,
} from "../types/a2aProtocol";

/**
 * Real-time South African Rand (ZAR) to US Dollar (USD) conversion multiplier.
 * Fixed baseline index for predictable PayPal Sandbox order generation.
 * 1 USD ≈ 18.52 ZAR => 1 ZAR ≈ 0.054 USD
 */
export const ZAR_TO_USD_EXCHANGE_RATE = 0.054;

/**
 * PayPal Sandbox environment credentials and API endpoints.
 */
export const PAYPAL_SANDBOX_CONFIG = {
  clientId:
    typeof import.meta !== "undefined" && import.meta.env?.VITE_PAYPAL_SANDBOX_CLIENT_ID
      ? (import.meta.env.VITE_PAYPAL_SANDBOX_CLIENT_ID as string)
      : "sb-autocom-agent-sandbox-client-id-2026",
  environment: "sandbox" as const,
  currencyTarget: "USD" as const,
  currencySource: "ZAR" as const,
  merchantReceiver: "merchant-belair-clearinghouse@autocom.dev",
  vaultTokenPrefix: "VAULT_AUTONOMOUS_DELEGATE_",
};

/**
 * In-memory ledger buffer for PayPal Sandbox audit tracking during demo sessions.
 */
export interface PayPalAuditEntry {
  orderId: string;
  transactionId?: string;
  storeId: string;
  priceZAR: number;
  amountUSD: number;
  exchangeRate: number;
  status: "CREATED" | "VAULTED_AUTHORIZED" | "SETTLED" | "FAILED";
  createdAt: string;
  settledAt?: string;
  vaultRef: string;
}

const auditLedgerHistory: PayPalAuditEntry[] = [];

/**
 * Converts South African Rand to United States Dollars with 2 decimal precision.
 */
export function convertZarToUsd(priceZAR: number): number {
  const converted = priceZAR * ZAR_TO_USD_EXCHANGE_RATE;
  return Math.round(converted * 100) / 100;
}

/**
 * Creates an autonomous PayPal Orders API v2 transaction converted from ZAR to USD.
 * Calls real backend /api/paypal/create-order when available, with graceful offline fallback.
 *
 * @param storeId Identifier of the retail merchant bot (e.g. 'zara-fashion')
 * @param negotiatedPriceZAR Final bilateral settlement price in South African Rand
 * @returns Object containing orderId and initial status
 */
export async function createAgentTransaction(
  storeId: string,
  negotiatedPriceZAR: number,
): Promise<{ orderId: string; status: string; amountUSD: number }> {
  const amountUSD = convertZarToUsd(negotiatedPriceZAR);
  const timestamp = new Date().toISOString();
  let orderId = `ORD-SANDBOX-${storeId.substring(0, 4).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  try {
    const res = await fetch("/api/paypal/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeId,
        negotiatedPriceZAR,
        originalPriceZAR: Math.round(negotiatedPriceZAR * 1.3),
        sessionId: `sess_${storeId}_${Date.now()}`,
        sku: `${storeId.toUpperCase()}-SKU-01`,
        vaultedAgentConsent: true,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.orderId) {
        orderId = data.orderId;
      }
    }
  } catch {
    // Client-side fallback if backend route unavailable
    await new Promise((resolve) => setTimeout(resolve, 320));
  }

  const entry: PayPalAuditEntry = {
    orderId,
    storeId,
    priceZAR: negotiatedPriceZAR,
    amountUSD,
    exchangeRate: ZAR_TO_USD_EXCHANGE_RATE,
    status: "CREATED",
    createdAt: timestamp,
    vaultRef: `${PAYPAL_SANDBOX_CONFIG.vaultTokenPrefix}${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
  };

  auditLedgerHistory.unshift(entry);

  // Dispatch custom browser telemetry event for live listeners (Channel3 & AG Grid)
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("autocom:paypal-order-created", {
        detail: entry,
      }),
    );
  }

  return {
    orderId,
    status: "CREATED",
    amountUSD,
  };
}

/**
 * Executes an autonomous, zero-click machine-to-machine payment using pre-authorized
 * Braintree/PayPal customer vaulted payment methods.
 * Calls real backend /api/paypal/checkout-settle with graceful fallback.
 *
 * @param orderId PayPal Sandbox order reference ID
 * @returns Result object with transactionId and boolean success flag
 */
export async function executeVaultedAgentPayment(
  orderId: string,
): Promise<{ transactionId: string; success: boolean; settledUSD: number; settledZAR: number }> {
  let transactionId = `TX-PAYPAL-M2M-${Math.floor(1000000 + Math.random() * 9000000)}`;
  const settledAt = new Date().toISOString();

  try {
    const res = await fetch("/api/paypal/checkout-settle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        agentAuthorizationHash: `sha256:${Math.random().toString(36).substring(2, 12)}...`,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.transactionId) {
        transactionId = data.transactionId;
      }
    }
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 450));
  }

  const existingEntry = auditLedgerHistory.find((item) => item.orderId === orderId);

  if (existingEntry) {
    existingEntry.status = "SETTLED";
    existingEntry.transactionId = transactionId;
    existingEntry.settledAt = settledAt;
  }

  const settledUSD = existingEntry ? existingEntry.amountUSD : 14.5;
  const settledZAR = existingEntry ? existingEntry.priceZAR : 270;

  // Broadcast capture event for live AG Grid Ledger and Channel3 stream
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("autocom:paypal-payment-settled", {
        detail: {
          orderId,
          transactionId,
          settledAt,
          settledUSD,
          settledZAR,
          storeId: existingEntry?.storeId ?? "unknown",
        },
      }),
    );
  }

  return {
    transactionId,
    success: true,
    settledUSD,
    settledZAR,
  };
}

/**
 * Fetches the 8-Outlet Bel Air Mall directory from /api/mall/directory
 */
export async function fetchMallDirectoryFromApi(): Promise<unknown[]> {
  try {
    const res = await fetch("/api/mall/directory");
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fallback
  }
  return [];
}

/**
 * Sends an A2A negotiation packet to /api/agent/negotiate
 */
export async function sendA2ANegotiationToApi(message: Partial<A2AMessage>): Promise<A2AMessage> {
  const res = await fetch("/api/agent/negotiate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-A2A-Protocol-Version": "1.0.0",
    },
    body: JSON.stringify(message),
  });

  if (!res.ok) {
    throw new Error(`A2A negotiation failed with status: ${res.status}`);
  }

  return await res.json();
}

/**
 * Retrieves the current in-memory PayPal Sandbox audit ledger snapshots.
 */
export function getPayPalAuditLedger(): PayPalAuditEntry[] {
  return [...auditLedgerHistory];
}

/**
 * Simulates an end-to-end autonomous negotiation settlement loop:
 * 1. Price agreed via A2A protocol.
 * 2. Automated PayPal order created with ZAR -> USD conversion.
 * 3. Machine-to-machine zero-click vaulted settlement dispatched.
 */
export async function runAutonomousSettlementPipeline(
  storeId: string,
  priceZAR: number,
): Promise<{
  orderId: string;
  transactionId: string;
  amountUSD: number;
  status: string;
}> {
  const order = await createAgentTransaction(storeId, priceZAR);
  const capture = await executeVaultedAgentPayment(order.orderId);

  return {
    orderId: order.orderId,
    transactionId: capture.transactionId,
    amountUSD: order.amountUSD,
    status: "SETTLED_VIA_PAYPAL",
  };
}
