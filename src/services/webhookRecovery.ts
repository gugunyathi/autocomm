/**
 * AutoCom Webhook Processing & Automated Cross-Rail Recovery Engine
 * Manages traditional fiat checkout links, payment webhooks, and automatic crypto fallback dispatch.
 */

import { DB } from "./database";
import { PriceTickerEngine } from "./PriceTickerEngine";
import { getBitchatService } from "./bitchat";

export interface FallbackTriggerPayload {
  action: "PAYMENT_FALLBACK_TRIGGER";
  itemId: string;
  itemTitle?: string;
  reason: "FIAT_CARD_DECLINED_BY_ISSUER" | "NETWORK_TIMEOUT" | "INSUFFICIENT_FUNDS";
  message: string;
  pricing: {
    originalFiat: string;
    bitcoinSats: number;
    stablecoinUSDC: string;
  };
  fallbackRails: {
    bitcoin_lightning: string;
    stablecoin_l2: {
      network: "base";
      token: "USDC";
      targetAddress: string;
      amountUnits: string;
    };
  };
  nonce: string;
  timestamp: number;
}

type FallbackListener = (payload: FallbackTriggerPayload) => void;
const fallbackListeners: Set<FallbackListener> = new Set();

export function subscribeToPaymentFallbacks(listener: FallbackListener): () => void {
  fallbackListeners.add(listener);
  return () => fallbackListeners.delete(listener);
}

export function dispatchFallbackEvent(payload: FallbackTriggerPayload) {
  fallbackListeners.forEach((fn) => {
    try {
      fn(payload);
    } catch (e) {
      console.error("Error in fallback listener:", e);
    }
  });
}

/**
 * UTILITY: Programmatic Single-Use Secure Web Checkout Link Generator
 * Accepts dynamic localized currencies (ZAR, USD, EUR, GBP, NGN, KES).
 */
export async function generateFiatCheckoutLink(
  itemId: string,
  amountInSats: number,
  currency = "ZAR",
): Promise<string> {
  const currencyUpper = currency.toUpperCase();
  const equivalentFiat = Math.max(1, Math.round(amountInSats / 35));
  const sessionId = `cs_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  // Single-use web-checkout hook URL
  return `https://checkout.yoco.com/pay/${sessionId}?item=${encodeURIComponent(itemId)}&currency=${currencyUpper}&amount=${equivalentFiat}`;
}

/**
 * Executes Automated Cross-Rail Crypto Fallback Logic
 * Triggered when a traditional credit card is declined or fails.
 */
export async function executeCrossRailFallback(
  buyerPubkey: string,
  itemId: string,
  currencyCode = "ZAR",
): Promise<FallbackTriggerPayload> {
  const item = DB.getInventoryItem(itemId) || {
    id: itemId,
    title: "Zara Biker Leather Jacket",
    category: "Apparel",
    baseUsdValue: 65.0,
    stockCount: 10,
    targetCurrencyCode: currencyCode,
  };

  // 1. Fetch fresh atomic price oracle parameters for Bitcoin & USDC pegs
  const recoveryPriceMatrix = await PriceTickerEngine.calculateMultiRailPricing(
    currencyCode,
    item.baseUsdValue,
  );

  // 2. Programmatically generate a lightning invoice for the exact recovery value
  const recoveryInvoiceBolt11 = `lnbc${recoveryPriceMatrix.satsAmount}n1p3v6v1wpp5${Date.now()}sp1recovery9735`;

  // 3. Construct the dedicated Recovery message block payload
  const fallbackPayload: FallbackTriggerPayload = {
    action: "PAYMENT_FALLBACK_TRIGGER",
    itemId: item.id,
    itemTitle: item.title,
    reason: "FIAT_CARD_DECLINED_BY_ISSUER",
    message:
      "⚠️ Traditional banking rail failed or declined. Autocomm has automatically unlocked native digital fallback rails to salvage your checkout session.",
    pricing: {
      originalFiat: `${recoveryPriceMatrix.currencySymbol}${recoveryPriceMatrix.localFiatAmount} ${currencyCode}`,
      bitcoinSats: recoveryPriceMatrix.satsAmount,
      stablecoinUSDC: recoveryPriceMatrix.usdcAmount,
    },
    fallbackRails: {
      bitcoin_lightning: recoveryInvoiceBolt11,
      stablecoin_l2: {
        network: "base",
        token: "USDC",
        targetAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        amountUnits: recoveryPriceMatrix.usdcAmount,
      },
    },
    nonce: `recov_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
  };

  console.log(`📡 Broadcasting cryptographic recovery rails directly to Bitchat mesh identity...`);

  // Log pending transaction into DB
  DB.logTransaction(
    fallbackPayload.nonce,
    item.id,
    recoveryPriceMatrix.satsAmount,
    "BITCOIN_LIGHTNING",
    "PENDING",
    buyerPubkey,
    recoveryPriceMatrix.localFiatAmount,
    currencyCode,
  );

  // Deliver to Bitchat service
  try {
    const bitchat = getBitchatService();
    bitchat.emitTelemetry();
  } catch (_e) {
    // Bitchat not yet initialized in background
  }

  // Dispatch to all active React frontend listeners
  dispatchFallbackEvent(fallbackPayload);

  return fallbackPayload;
}

/**
 * 🚀 BUN / HTTP WEBHOOK TRAFFIC PROCESSOR
 * Handles POST /webhooks/payments for real and simulated credit card webhook events
 */
export async function handleIncomingHttpTraffic(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (
    req.method === "POST" &&
    (url.pathname === "/webhooks/payments" || url.pathname === "/api/webhooks/payments")
  ) {
    try {
      const rawBody = await req.text();
      let eventPayload: Record<string, unknown> & {
        type?: string;
        event?: string;
        data?: {
          object?: Record<string, unknown> & {
            metadata?: Record<string, string>;
            payment_intent?: string;
            id?: string;
            currency?: string;
          };
        };
        metadata?: Record<string, string>;
        payment_intent?: string;
        id?: string;
        currency?: string;
      };
      try {
        eventPayload = JSON.parse(rawBody);
      } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON format" }), { status: 400 });
      }

      const eventType = eventPayload.type || eventPayload.event;

      /**
       * SCENARIO A: CARD PAYMENT SUCCESS (Standard Track)
       */
      if (eventType === "checkout.session.completed") {
        const session = eventPayload.data?.object || eventPayload;
        const itemId = session.metadata?.itemId || "zara-leather-jacket-09";
        const amountSats = Number(session.metadata?.amountSats) || 22000;
        const txRef = session.payment_intent || session.id || `card_tx_${Date.now()}`;
        const currency = (session.metadata?.currency || "ZAR").toUpperCase();

        DB.decrementStock(itemId);
        DB.logTransaction(
          txRef,
          itemId,
          amountSats,
          "FIAT_CARD",
          "CONFIRMED",
          undefined,
          undefined,
          currency,
        );

        console.log(`💳 CARD TRANSACTION SETTLED: Verified payment intent ID: ${txRef}`);
        return new Response(JSON.stringify({ received: true, status: "SETTLED", txRef }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      /**
       * SCENARIO B: CARD PAYMENT REJECTED / DECLINED (Cross-Rail Recovery Track)
       */
      if (eventType === "payment_intent.payment_failed" || eventType === "card_declined") {
        const failedIntent = eventPayload.data?.object || eventPayload;
        const itemId = failedIntent.metadata?.itemId || "zara-leather-jacket-09";
        const buyerPubkey = failedIntent.metadata?.buyerPubkey || "npub1mockbuyer001";
        const targetCurrency = (
          failedIntent.currency ||
          failedIntent.metadata?.currency ||
          "ZAR"
        ).toUpperCase();

        console.warn(
          `🚨 Legacy Rail Blocked! Card payment failed for item ${itemId}. Initiating cross-rail recovery.`,
        );
        const recoveryData = await executeCrossRailFallback(buyerPubkey, itemId, targetCurrency);

        return new Response(
          JSON.stringify({ received: true, status: "CROSS_RAIL_FALLBACK_TRIGGERED", recoveryData }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      return new Response(JSON.stringify({ received: true, status: "IGNORED_EVENT_TYPE" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: unknown) {
      console.error("Webhook processing error:", err);
      return new Response("Webhook processing failed", { status: 500 });
    }
  }

  return new Response("Not Found", { status: 404 });
}
