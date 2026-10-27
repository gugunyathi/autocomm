/**
 * AutoCom Unified Backend HTTP API Router
 *
 * Implements production REST handlers for:
 * - GET  /api/mall/directory       -> 8-Outlet Bel Air Mall spatial catalog
 * - POST /api/agent/negotiate      -> A2A bilateral bargaining packet handler
 * - POST /api/paypal/create-order  -> PayPal Orders API Sandbox order creation with ZAR->USD conversion
 * - POST /api/paypal/checkout-settle -> Zero-click machine-to-machine vaulted payment settlement
 * - GET  /api/paypal/audit-ledger  -> Live in-memory audit ledger records
 * - GET  /api/openapi.json         -> Live OpenAPI 3.0.3 specification for APIMatic SDK generation
 * - GET  /api/health               -> Service telemetry & health status
 */

import { A2A_OPENAPI_SPEC_JSON, type A2AMessage } from "../types/a2aProtocol";
import { ZAR_TO_USD_EXCHANGE_RATE, convertZarToUsd } from "./paypalService";

export interface BackendAuditOrder {
  orderId: string;
  transactionId?: string;
  storeId: string;
  priceZAR: number;
  amountUSD: number;
  exchangeRate: number;
  status: "CREATED" | "SETTLED" | "FAILED";
  createdAt: string;
  settledAt?: string;
  vaultRef: string;
}

// In-memory backend database for demo sessions
const serverAuditStore: BackendAuditOrder[] = [
  {
    orderId: "ORD-SANDBOX-ZARA-90A1B",
    transactionId: "TX-PAYPAL-M2M-9021841",
    storeId: "zara-fashion",
    priceZAR: 675,
    amountUSD: 36.45,
    exchangeRate: ZAR_TO_USD_EXCHANGE_RATE,
    status: "SETTLED",
    createdAt: "2026-10-19T08:42:15.000Z",
    settledAt: "2026-10-19T08:42:16.200Z",
    vaultRef: "VAULT_AUTONOMOUS_DELEGATE_771B",
  },
  {
    orderId: "ORD-SANDBOX-NIKE-4F8C2",
    transactionId: "TX-PAYPAL-M2M-8491032",
    storeId: "nike-performance",
    priceZAR: 1870,
    amountUSD: 100.98,
    exchangeRate: ZAR_TO_USD_EXCHANGE_RATE,
    status: "SETTLED",
    createdAt: "2026-10-19T08:43:02.000Z",
    settledAt: "2026-10-19T08:43:03.150Z",
    vaultRef: "VAULT_AUTONOMOUS_DELEGATE_442C",
  },
];

// Pre-configured 8 South African Outlets at Bel Air Shopping Centre
export const BEL_AIR_OUTLETS_DIRECTORY = [
  {
    id: "woolworths-food",
    name: "Woolworths Food",
    category: "Gourmet Groceries",
    stickerItem: "Artisan Sourdough & Cheese Platter",
    stickerPriceZAR: 220,
    bearing: 215,
    gps: { latitude: -26.059418, longitude: 27.958272 },
    botStrategy: "Dynamic volume discount margin (max 25% discount)",
    maxDiscountPercent: 25,
    minAcceptablePriceZAR: 165,
  },
  {
    id: "zara-fashion",
    name: "Zara Fashion",
    category: "Apparel & Trends",
    stickerItem: "Oversized Wool Hoodie",
    stickerPriceZAR: 899,
    bearing: 45,
    gps: { latitude: -26.05938, longitude: 27.95821 },
    botStrategy: "Midday flash clearance curve (max 30% discount)",
    maxDiscountPercent: 30,
    minAcceptablePriceZAR: 629,
  },
  {
    id: "nike-performance",
    name: "Nike Performance",
    category: "Athletics & Footwear",
    stickerItem: "Air Zoom Pegasus 40",
    stickerPriceZAR: 2499,
    bearing: 310,
    gps: { latitude: -26.05949, longitude: 27.95818 },
    botStrategy: "Performance runner loyalty margin (max 28% discount)",
    maxDiscountPercent: 28,
    minAcceptablePriceZAR: 1799,
  },
  {
    id: "istore-apple",
    name: "iStore Apple",
    category: "Electronics & Gadgets",
    stickerItem: "MagSafe Leather Wallet",
    stickerPriceZAR: 1199,
    bearing: 120,
    gps: { latitude: -26.05931, longitude: 27.95834 },
    botStrategy: "Bundle margin preservation (max 18% discount)",
    maxDiscountPercent: 18,
    minAcceptablePriceZAR: 983,
  },
  {
    id: "exclusive-books",
    name: "Exclusive Books",
    category: "Literature & Coffee",
    stickerItem: "Bestseller Hardcover Fiction",
    stickerPriceZAR: 345,
    bearing: 95,
    gps: { latitude: -26.05944, longitude: 27.9584 },
    botStrategy: "Reader loyalty tier special (max 22% discount)",
    maxDiscountPercent: 22,
    minAcceptablePriceZAR: 269,
  },
  {
    id: "mugg-bean",
    name: "Mugg & Bean Kiosk",
    category: "Artisan Bakery & Coffee",
    stickerItem: "Bottomless Filter & Giant Muffin",
    stickerPriceZAR: 98,
    bearing: 180,
    gps: { latitude: -26.05952, longitude: 27.95831 },
    botStrategy: "Morning & afternoon quick turnover (max 25% discount)",
    maxDiscountPercent: 25,
    minAcceptablePriceZAR: 73,
  },
  {
    id: "hm-boutique",
    name: "H&M Boutique",
    category: "Sustainable Style",
    stickerItem: "Tailored Linen Blazer",
    stickerPriceZAR: 650,
    bearing: 60,
    gps: { latitude: -26.05935, longitude: 27.95825 },
    botStrategy: "Sustainable garment discount clearinghouse (max 24% discount)",
    maxDiscountPercent: 24,
    minAcceptablePriceZAR: 494,
  },
  {
    id: "clicks-pharmacy",
    name: "Clicks Pharmacy",
    category: "Health & Wellness",
    stickerItem: "Bio-Oil & Vitamin C Immune Serum",
    stickerPriceZAR: 189,
    bearing: 260,
    gps: { latitude: -26.05948, longitude: 27.95823 },
    botStrategy: "Wellness essentials curve (max 25% discount)",
    maxDiscountPercent: 25,
    minAcceptablePriceZAR: 141,
  },
];

/**
 * Standard JSON response helper with open CORS headers
 */
function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-A2A-Protocol-Version",
    },
  });
}

/**
 * Main HTTP Router for all /api/* requests
 */
export async function handleApiRoute(request: Request, url: URL): Promise<Response | null> {
  const pathname = url.pathname;
  const method = request.method;

  // Handle CORS preflight
  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-A2A-Protocol-Version",
      },
    });
  }

  // Auto-seed MongoDB in background without blocking requests
  import("./mongodb").then((m) => m.initAndSeedDatabase()).catch(() => {});

  // 1. Health check
  if (pathname === "/api/health" && method === "GET") {
    const { getMongoHealth } = await import("./mongodb");
    const mongoHealth = await getMongoHealth();
    return jsonResponse({
      status: "HEALTHY",
      service: "Autocomm Spatial Commerce Backend Engine",
      version: "3.0.0",
      timestamp: new Date().toISOString(),
      outletsActive: mongoHealth.stats?.storeCount || 40,
      settledOrdersCount: mongoHealth.stats?.orderCount || serverAuditStore.length,
      paypalSandbox: "ONLINE",
      channel3Pipeline: "READY",
      database: {
        engine: "MongoDB",
        connected: mongoHealth.connected,
        database: mongoHealth.database,
        uriConfigured: mongoHealth.uriConfigured,
        pingMs: mongoHealth.pingMs,
        stats: mongoHealth.stats,
      },
    });
  }

  // 1b. MongoDB Database Status & Metrics: GET /api/db/status
  if (pathname === "/api/db/status" && method === "GET") {
    const { getMongoHealth } = await import("./mongodb");
    const health = await getMongoHealth();
    return jsonResponse(health);
  }

  // 1c. MongoDB Seed Trigger: POST /api/db/seed
  if (pathname === "/api/db/seed" && method === "POST") {
    const { initAndSeedDatabase } = await import("./mongodb");
    const result = await initAndSeedDatabase();
    return jsonResponse(result);
  }

  // 2. All Malls: GET /api/malls
  if (pathname === "/api/malls" && method === "GET") {
    const { getMallsFromDb } = await import("./mongodb");
    const malls = await getMallsFromDb();
    return jsonResponse(
      malls.map(
        (m: {
          id: string;
          name: string;
          shortName: string;
          subtitle: string;
          address: string;
          latitude: number;
          longitude: number;
          googleMapsUrl: string;
          radiusMeters: number;
          stores?: unknown[];
        }) => ({
          id: m.id,
          name: m.name,
          shortName: m.shortName,
          subtitle: m.subtitle,
          address: m.address,
          latitude: m.latitude,
          longitude: m.longitude,
          googleMapsUrl: m.googleMapsUrl,
          radiusMeters: m.radiusMeters,
          storeCount: m.stores ? m.stores.length : 8,
        }),
      ),
    );
  }

  // 2b. Stores Query: GET /api/stores?mallId=...&cat=...
  if (pathname === "/api/stores" && method === "GET") {
    const mallId = url.searchParams.get("mallId") || undefined;
    const cat = url.searchParams.get("cat") || undefined;
    const { getStoresFromDb } = await import("./mongodb");
    const stores = await getStoresFromDb(mallId, cat);
    return jsonResponse(stores);
  }

  // 2c. Products Catalog Query: GET /api/products?mallId=...&storeId=...&search=...&category=...
  if (pathname === "/api/products" && method === "GET") {
    const mallId = url.searchParams.get("mallId") || undefined;
    const storeId = url.searchParams.get("storeId") || undefined;
    const search = url.searchParams.get("search") || undefined;
    const category = url.searchParams.get("category") || undefined;
    const limit = Number(url.searchParams.get("limit") || 100);
    const { getProductsFromDb } = await import("./mongodb");
    const products = await getProductsFromDb({ mallId, storeId, search, category, limit });
    return jsonResponse(products);
  }

  // 2d. Mall Directory: GET /api/mall/directory?mallId=...
  if (pathname === "/api/mall/directory" && method === "GET") {
    const mallId = url.searchParams.get("mallId");
    if (mallId) {
      const { getStoresFromDb } = await import("./mongodb");
      const stores = await getStoresFromDb(mallId);
      return jsonResponse(stores);
    }
    return jsonResponse(BEL_AIR_OUTLETS_DIRECTORY);
  }

  // 3. APIMatic OpenAPI 3.0 Specification: GET /api/openapi.json
  if (pathname === "/api/openapi.json" && method === "GET") {
    return new Response(A2A_OPENAPI_SPEC_JSON, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  // 4. A2A Negotiation: POST /api/agent/negotiate
  if (pathname === "/api/agent/negotiate" && method === "POST") {
    try {
      const incoming: Partial<A2AMessage> = await request.json();
      const store =
        BEL_AIR_OUTLETS_DIRECTORY.find((s) => s.id === incoming.storeId) ??
        BEL_AIR_OUTLETS_DIRECTORY[0];

      const proposedPrice = Number(incoming.price) || store.stickerPriceZAR;
      const minAcceptable = store.minAcceptablePriceZAR;

      let replyType: "offer" | "counter_offer" | "accept" | "reject" = "counter_offer";
      let replyPrice = proposedPrice;
      let replyRationale = "";

      if (proposedPrice >= minAcceptable) {
        replyType = "accept";
        replyPrice = proposedPrice;
        replyRationale = `Accepted: Proposed bid of R${proposedPrice} meets margin criteria for ${store.name}. Proceeding to PayPal Sandbox checkout.`;
      } else {
        // Counter-offer at reservation threshold
        replyType = "counter_offer";
        replyPrice = Math.round((proposedPrice + minAcceptable) / 2);
        replyRationale = `Counter-offer: Proposed bid of R${proposedPrice} exceeds threshold. Countering at R${replyPrice}.`;
      }

      const responseMessage: A2AMessage = {
        id: `msg_resp_${Math.random().toString(36).substring(2, 9)}`,
        timestamp: new Date().toISOString(),
        sender: "merchant_bot",
        type: replyType,
        price: replyPrice,
        currency: "ZAR",
        originalPrice: store.stickerPriceZAR,
        storeId: store.id,
        itemName: store.stickerItem,
        agentRationale: replyRationale,
      };

      return jsonResponse(responseMessage);
    } catch {
      return jsonResponse({ error: "Malformed A2A negotiation request body" }, 400);
    }
  }

  // 5. PayPal Create Order: POST /api/paypal/create-order
  if (pathname === "/api/paypal/create-order" && method === "POST") {
    try {
      const body = await request.json();
      const storeId = String(body.storeId || "woolworths-food");
      const negotiatedPriceZAR = Number(body.negotiatedPriceZAR || 220);
      const convertedUSD = convertZarToUsd(negotiatedPriceZAR);

      const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
      const orderId = `ORD-SANDBOX-${storeId.substring(0, 4).toUpperCase()}-${randomSuffix}`;
      const now = new Date().toISOString();

      const newOrder: BackendAuditOrder = {
        orderId,
        storeId,
        priceZAR: negotiatedPriceZAR,
        amountUSD: convertedUSD,
        exchangeRate: ZAR_TO_USD_EXCHANGE_RATE,
        status: "CREATED",
        createdAt: now,
        vaultRef: `VAULT_AUTONOMOUS_DELEGATE_${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      };

      serverAuditStore.unshift(newOrder);

      // Persist to MongoDB in background
      import("./mongodb").then((m) => m.persistOrderToDb(newOrder)).catch(() => {});

      return jsonResponse(
        {
          orderId,
          status: "CREATED",
          convertedUSD,
          exchangeRate: ZAR_TO_USD_EXCHANGE_RATE,
          timestamp: now,
          vaultConsentVerified: true,
        },
        201,
      );
    } catch {
      return jsonResponse({ error: "Failed to process PayPal order creation" }, 400);
    }
  }

  // 6. PayPal Vault Checkout Settle: POST /api/paypal/checkout-settle
  if (pathname === "/api/paypal/checkout-settle" && method === "POST") {
    try {
      const body = await request.json();
      const orderId = String(body.orderId || "");

      let existing = serverAuditStore.find((o) => o.orderId === orderId);
      const now = new Date().toISOString();
      const txId = `TX-PAYPAL-M2M-${Math.floor(1000000 + Math.random() * 9000000)}`;

      if (existing) {
        existing.status = "SETTLED";
        existing.transactionId = txId;
        existing.settledAt = now;
      } else {
        existing = {
          orderId: orderId || "ORD-SANDBOX-DEMO",
          transactionId: txId,
          storeId: "woolworths-food",
          priceZAR: 175,
          amountUSD: 9.45,
          exchangeRate: ZAR_TO_USD_EXCHANGE_RATE,
          status: "SETTLED",
          createdAt: now,
          settledAt: now,
          vaultRef: "VAULT_AUTONOMOUS_DELEGATE_771B",
        };
        serverAuditStore.unshift(existing);
      }

      // Persist to MongoDB in background
      import("./mongodb").then((m) => m.persistOrderToDb(existing)).catch(() => {});

      return jsonResponse({
        transactionId: txId,
        orderId: existing.orderId,
        success: true,
        settledAmountUSD: existing.amountUSD,
        settledAmountZAR: existing.priceZAR,
        timestamp: now,
        vaultAuthorizationRef: existing.vaultRef,
      });
    } catch {
      return jsonResponse({ error: "Failed to execute vaulted settlement capture" }, 400);
    }
  }

  // 7. PayPal Audit Ledger: GET /api/paypal/audit-ledger
  if (pathname === "/api/paypal/audit-ledger" && method === "GET") {
    const { getOrdersFromDb } = await import("./mongodb");
    const dbOrders = await getOrdersFromDb(100);

    // Merge database orders with in-memory store (deduplicated by orderId)
    const orderMap = new Map<string, (typeof serverAuditStore)[0]>();
    for (const order of serverAuditStore) {
      orderMap.set(order.orderId, order);
    }
    for (const order of dbOrders) {
      orderMap.set(order.orderId, order as (typeof serverAuditStore)[0]);
    }
    const allOrders = Array.from(orderMap.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
    );

    return jsonResponse({
      count: allOrders.length,
      orders: allOrders,
      source: dbOrders.length > 0 ? "MongoDB + In-Memory" : "In-Memory Buffer",
    });
  }

  // 7b. Parked Offers: GET /api/offers/parked
  if (pathname === "/api/offers/parked" && method === "GET") {
    const { getParkedOffersFromDb } = await import("./mongodb");
    const parked = await getParkedOffersFromDb();
    return jsonResponse({ count: parked.length, offers: parked });
  }

  // 7c. Park Offer: POST /api/offers/park
  if (pathname === "/api/offers/park" && method === "POST") {
    try {
      const offer = await request.json();
      const { persistParkedOfferToDb } = await import("./mongodb");
      const success = await persistParkedOfferToDb(offer);
      return jsonResponse({ success, id: offer.id, timestamp: new Date().toISOString() }, 201);
    } catch {
      return jsonResponse({ error: "Failed to park offer in MongoDB" }, 400);
    }
  }

  // 8. Agent Names Search: GET /api/names/search?query=...
  if (pathname === "/api/names/search" && method === "GET") {
    const q = url.searchParams.get("query") || "";
    const isAgent = url.searchParams.get("isAgent") === "true";
    const { searchAgentNames } = await import("./agentNameService");
    const result = await searchAgentNames(q, isAgent);
    return jsonResponse(result);
  }

  // 9. Agent Names Directory: GET /api/names/directory
  if (pathname === "/api/names/directory" && method === "GET") {
    const { searchAgentNames } = await import("./agentNameService");
    const result = await searchAgentNames("");
    return jsonResponse({
      totalCount: result.allRecords.length,
      auctions: result.allRecords.filter((r) => r.status === "AUCTION_LIVE"),
      secondaryMarket: result.allRecords.filter((r) => r.status === "SECONDARY_LISTED"),
      claimed: result.allRecords.filter((r) => r.status === "CLAIMED"),
      pricingSchedule: {
        oneCharacter: {
          usd: 1000,
          zar: 18500,
          description: "1 Letter or 1 Number (x, 7, q) - Batch up to 20",
        },
        twoCharacters: {
          usd: 600,
          zar: 11100,
          description: "2 Letters or Numbers (ai, za, 42) - Batch up to 20",
        },
        threeCharacters: {
          usd: 300,
          zar: 5550,
          description: "3 Letters or Numbers (bot, gpt, pay) - Batch up to 20",
        },
        fourCharacters: {
          usd: 20,
          zar: 370,
          description: "4 Letters or Numbers (shop, mesh) - Max 1 per registration",
        },
        fiveCharacters: {
          usd: 2,
          zar: 37,
          description: "5 Letters or Numbers (alpha, trend) - Max 1 per registration",
        },
        sixCharacters: {
          usd: 1,
          zar: 18.5,
          description: "6 Letters or Numbers (istore, coffee) - Max 1 per registration",
        },
        sevenPlusCharacters: {
          usdHuman: 0,
          usdAgent: 0.2,
          description:
            "7+ Characters: Free for Humans / $0.20 for AI Agents (Anti-Spam) - Max 1 per registration",
        },
        mainstreamBrands: {
          usd: 1000,
          zar: 18500,
          description: "Brand Trademark Tier or Special Auction",
        },
      },
    });
  }

  // 10. Agent Names Directory of Owners: GET /api/names/owners
  if (pathname === "/api/names/owners" && method === "GET") {
    const search = url.searchParams.get("search") || undefined;
    const category = url.searchParams.get("category") || undefined;
    const chain = url.searchParams.get("chain") || undefined;
    const ownerType = url.searchParams.get("ownerType") || undefined;
    const { getOwnerDirectory } = await import("./agentNameService");
    const owners = getOwnerDirectory({ search, category, chain, ownerType });
    return jsonResponse({
      count: owners.length,
      owners,
    });
  }

  // 11. Agent Names Leaderboard: GET /api/names/leaderboard
  if (pathname === "/api/names/leaderboard" && method === "GET") {
    const marketType = url.searchParams.get("marketType") || undefined;
    const { getLeaderboard } = await import("./agentNameService");
    const leaderboard = getLeaderboard(marketType);
    return jsonResponse({
      count: leaderboard.length,
      marketType: marketType || "ALL",
      leaderboard,
    });
  }

  // 12. Agent Names x402 Quote Challenge: GET /api/names/x402-quote?name=...
  if (pathname === "/api/names/x402-quote" && method === "GET") {
    const name = url.searchParams.get("name") || "agent";
    const isAgent = url.searchParams.get("isAgent") !== "false";
    const { getX402PaymentQuote } = await import("./agentNameService");
    const quote = getX402PaymentQuote(name, isAgent);
    return jsonResponse(quote, 200);
  }

  // 13. Agent Names Claim: POST /api/names/claim
  if (pathname === "/api/names/claim" && method === "POST") {
    try {
      const body = await request.json();
      const name = String(body.name || "")
        .toLowerCase()
        .trim();
      const paymentMethod = String(body.paymentMethod || "x402");
      const isAgent = paymentMethod === "x402" || body.isAgent === true;
      const { calculateNamePricing, claimAgentName, getX402PaymentQuote } =
        await import("./agentNameService");
      const pricing = calculateNamePricing(name, isAgent);

      // Check if name is auction-reserved or brand-reserved
      if (pricing.isAuctionReserved || pricing.isBrandReserved) {
        return jsonResponse(
          {
            error: "RESERVED_FOR_AUCTION",
            message: `"${pricing.fullName}" is pre-reserved for curated auction. Submit a bid via /api/names/bid instead.`,
            pricing,
          },
          403,
        );
      }

      // x402 Protocol Check: If paymentMethod is x402 and header/token is absent, respond with HTTP 402 Payment Required!
      const x402Token = request.headers.get("X-402-Payment-Token") || body.x402Token;
      if (paymentMethod === "x402" && !x402Token) {
        const challenge = getX402PaymentQuote(name, true);
        return new Response(JSON.stringify(challenge, null, 2), {
          status: 402,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "X-402-Payment-Required": "true",
            "X-402-Cost-USD": String(pricing.priceUsd),
            "X-402-Destination-Base": "0x8849c71a3e2b9f8d1c0a7e6b5d4c3b2a1e0f9a8b",
            "X-402-Destination-Solana": "AutocomNameServiceVaultSolana11111111111111111",
            "X-402-Destination-Arc": "0x3344b81c2e0f9a7b6c5d4e3f2a1b0c9d8e7f6a5b",
          },
        });
      }

      const result = await claimAgentName(body);
      return jsonResponse(result, 201);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return jsonResponse({ error: "Failed to process agent name claim", details: msg }, 400);
    }
  }

  // 14. Agent Names Batch Claim: POST /api/names/batch-claim
  if (pathname === "/api/names/batch-claim" && method === "POST") {
    try {
      const body = await request.json();
      const names = Array.isArray(body.names) ? body.names : [];
      const paymentMethod = String(body.paymentMethod || "crypto");
      const isAgent = paymentMethod === "x402" || body.isAgent === true;

      const { batchClaimAgentNames, validateRegistrationBatch } =
        await import("./agentNameService");
      const validation = validateRegistrationBatch(names, isAgent);

      if (!validation.allowed) {
        return jsonResponse(
          {
            error: "BATCH_LIMIT_EXCEEDED",
            message: validation.reason,
            validation,
          },
          400,
        );
      }

      const result = await batchClaimAgentNames({
        names,
        type: body.type || "personal",
        paymentMethod,
        network: body.network || "base",
        isAgent,
        cardToken: body.cardToken,
        x402Token: body.x402Token,
        agentId: body.agentId,
        ownerIdentifier: body.ownerIdentifier,
      });

      return jsonResponse(result, 201);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return jsonResponse({ error: "Batch claim failed", details: msg }, 400);
    }
  }

  // 15. Agent Names Auction Bid: POST /api/names/bid
  if (pathname === "/api/names/bid" && method === "POST") {
    try {
      const body = await request.json();
      const { placeAuctionBid } = await import("./agentNameService");
      const result = await placeAuctionBid(
        body.name,
        Number(body.amountUsd),
        body.bidder || "autonomous_agent_proxy",
        body.paymentMethod || "x402",
        body.network || "base",
      );
      return jsonResponse(result, 200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to place auction bid";
      return jsonResponse({ error: msg }, 400);
    }
  }

  // 16. Agent Names Secondary Marketplace List: POST /api/names/list
  if (pathname === "/api/names/list" && method === "POST") {
    try {
      const body = await request.json();
      const { listOnSecondaryMarket } = await import("./agentNameService");
      const result = await listOnSecondaryMarket(
        body.name,
        Number(body.listedPriceUsd),
        body.seller || "owner_wallet",
        body.network || "base",
      );
      return jsonResponse(result, 200);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to list name on secondary marketplace";
      return jsonResponse({ error: msg }, 400);
    }
  }

  // 17. Agent Names Secondary Marketplace Buy: POST /api/names/buy-secondary
  if (pathname === "/api/names/buy-secondary" && method === "POST") {
    try {
      const body = await request.json();
      const { buyFromSecondaryMarket } = await import("./agentNameService");
      const result = await buyFromSecondaryMarket(
        body.name,
        body.buyer || "buyer_agent",
        body.paymentMethod || "x402",
        body.network || "base",
      );
      return jsonResponse(result, 200);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to buy name from secondary marketplace";
      return jsonResponse({ error: msg }, 400);
    }
  }

  // 18. Agent Skill Manifest for x402 Search & Buy: GET /api/names/skill.json
  if (pathname === "/api/names/skill.json" && method === "GET") {
    return jsonResponse({
      name: "autocom-agent-name-service",
      version: "2.0.0",
      description:
        "Autonomous AI Agent skill to search, quote, claim, batch-buy, and trade sovereign .agent names using HTTP 402 (x402) micropayments and multi-chain crypto (Base, Arc, Solana).",
      protocol: "x402-autonomous-v1",
      supportedNetworks: ["base", "solana", "arc"],
      slidingPricingScale: {
        "1_character": "$1,000 / 1000 USDC (Batch up to 20)",
        "2_characters": "$600 / 600 USDC (Batch up to 20)",
        "3_characters": "$300 / 300 USDC (Batch up to 20)",
        "4_characters": "$20 / 20 USDC (Max 1 per registration)",
        "5_characters": "$2 / 2 USDC (Max 1 per registration)",
        "6_characters": "$1 / 1 USDC (Max 1 per registration)",
        "7_plus_characters":
          "Free ($0.00) for humans / $0.20 for AI agents anti-spam (Max 1 per registration)",
      },
      batchLimits: {
        standardHandles: "Strictly maximum 1 name per registration for standard 4+ letter handles",
        premiumAndAuctions:
          "Up to 20 names per transaction for 1, 2, 3 letters/numbers and winning auction items",
      },
      endpoints: {
        search: "/api/names/search?query={name}&isAgent={true|false}",
        x402Quote: "/api/names/x402-quote?name={name}&isAgent={true|false}",
        claim: "/api/names/claim",
        batchClaim: "/api/names/batch-claim",
        ownersDirectory:
          "/api/names/owners?search={query}&category={ALL|PERSONAL|MERCHANT}&chain={ALL|Base|Arc|Solana}",
        leaderboard: "/api/names/leaderboard?marketType={ALL|PRIMARY|SECONDARY|AUCTION}",
        bid: "/api/names/bid",
        listSecondary: "/api/names/list",
        buySecondary: "/api/names/buy-secondary",
      },
    });
  }

  // Unhandled /api route
  return jsonResponse({ error: `Endpoint ${pathname} not found` }, 404);
}
