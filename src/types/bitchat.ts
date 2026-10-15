/**
 * AutoCom x BitChat Integration Protocol: Type Definitions
 * Unifies Bluetooth Low Energy (BLE) Mesh Networking, Nostr Geohash Channels (NIP-01, NIP-04, NIP-44),
 * and Bitcoin Lightning / WebLN Micro-Settlements for Agent-to-Agent (A2A) Commerce.
 */

export type BitchatTransportMode = "hybrid" | "ble_only" | "nostr_only" | "offline_store_forward";

export type BitchatAgentRole = "merchant" | "shopper" | "relay_node" | "beacon";

export interface BitchatIdentity {
  pubkey: string; // 32-byte hex public key
  npub: string; // bech32 encoded pubkey
  secretKeyHex: string;
  alias: string;
  role: BitchatAgentRole;
  createdAt: number;
}

export interface BitchatPeer {
  id: string;
  pubkey: string;
  npub: string;
  alias: string;
  role: BitchatAgentRole;
  rssi: number; // dBm, e.g. -45 (strong) to -88 (weak)
  signalQuality: "excellent" | "good" | "fair" | "weak";
  hopCount: number; // 1 = direct BLE connection, 2+ = multi-hop mesh repeat
  distanceMeters: number; // calculated via BLE path loss
  geohash: string; // 7 or 8 character geohash, e.g. "k3v6v1w"
  corridorName: string; // e.g. "Zara Corridor"
  lastSeenTimestamp: number;
  bleConnected: boolean;
  batteryPercent?: number;
  activePromo?: {
    item: string;
    priceSats: number;
    priceZar: number;
    discountPercent: number;
    expiresAt: number;
  };
}

export interface BitchatPacket {
  id: string;
  kind: number; // 30078: Discovery, 1: Deal Broadcast, 4: Encrypted DM, 9735: Lightning Zap/Invoice
  fromPubkey: string;
  fromAlias: string;
  toPubkey?: string;
  toAlias?: string;
  encrypted: boolean;
  geohash: string;
  corridor: string;
  timestamp: number;
  payload: unknown;
  transport: "ble_mesh" | "nostr_websocket" | "store_and_forward_cache";
  hops: string[];
  signature?: string;
}

export type BitchatNegotiationPhase =
  "DISCOVERY" | "OFFER" | "COUNTER_OFFER" | "AGREED" | "MULTI_RAIL_REQUESTED" | "PAID" | "FAILED";

/**
 * Multi-Rail Payment Request dispatched over Bitchat Mesh
 * Allows buyer agent to pick between Bitcoin Lightning, L2 Stablecoins (USDC/USDT), or Fiat Card
 */
export interface MultiRailPaymentRequest {
  action: "PAYMENT_REQUEST";
  itemId: string;
  itemTitle?: string;
  amountSats: number;
  fiatAmountZAR: number; // e.g., R450.00 ZAR equivalent
  rails: {
    bitcoin_lightning: string; // Bolt11 Invoice
    stablecoin_l2?: {
      network: "base" | "polygon" | "arbitrum";
      token: "USDC" | "USDT";
      targetAddress: string;
      amountUnits: string; // e.g. "2500000" for 6 decimals
      amountFormatted: number; // e.g. 2.50
    };
    fiat_card_url?: string; // Secure web-checkout hook (Yoco, PayFast, Stripe)
  };
  nonce: string;
  createdAt: number;
  expiresAt: number;
}

/**
 * Cryptographic settlement proof pinged back over Bitchat as confirmation
 */
export interface MultiRailSettlementProof {
  action: "PAYMENT_CONFIRMATION";
  sessionId: string;
  itemId: string;
  railChosen: "bitcoin_lightning" | "stablecoin_l2" | "fiat_card";
  amountPaid: {
    value: number;
    unit: "SATS" | "USDC" | "ZAR";
  };
  proof: {
    preimage?: string; // Lightning preimage
    txHash?: string; // Blockchain transaction hash
    network?: string;
    checkoutReceiptId?: string; // Fiat Card transaction ID
    paidAt: number;
  };
  voucherQrToken: string;
  nonce: string;
}

export interface BitchatEncryptedMessage {
  id: string;
  sender: "shopper" | "merchant" | "system";
  senderPubkey: string;
  ciphertext: string;
  plaintext: string;
  timestamp: number;
  satsValue?: number;
  zarValue?: number;
  verifiedSignature: boolean;
}

export interface BitchatNegotiationSession {
  sessionId: string;
  merchantPubkey: string;
  merchantAlias: string;
  shopperPubkey: string;
  shopperAlias: string;
  productTitle: string;
  originalPriceSats: number;
  originalPriceZar: number;
  currentOfferSats: number;
  currentOfferZar: number;
  discountPercent: number;
  phase: BitchatNegotiationPhase;
  messages: BitchatEncryptedMessage[];
  paymentRequest?: MultiRailPaymentRequest;
  settlementProof?: MultiRailSettlementProof;
  invoiceBolt11?: string;
  paymentPreimage?: string;
  settledRail?: "bitcoin_lightning" | "stablecoin_l2" | "fiat_card";
  settledTxHash?: string;
  settledAt?: number;
  geohash: string;
  corridorName: string;
}

export interface BitchatRelayStatus {
  url: string;
  status: "connected" | "connecting" | "disconnected" | "fallback";
  latencyMs: number;
  messagesReceived: number;
}

export interface BitchatMeshTelemetry {
  bleSupported: boolean;
  bleActive: boolean;
  isOfflineMode: boolean;
  activePeersCount: number;
  currentGeohash: string;
  corridorName: string;
  relays: BitchatRelayStatus[];
  offlineQueueCount: number;
  satsBalance: number;
  totalSettledSats: number;
  mode: BitchatTransportMode;
  packetsSent: number;
  packetsReceived: number;
}
