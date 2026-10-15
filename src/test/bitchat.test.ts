import { describe, it, expect } from "vitest";
import {
  encodeGeohash,
  decodeGeohash,
  getBitchatService,
  BITCHAT_KINDS,
  CORRIDOR_GEOHASH_MAP,
} from "@/services/bitchat";

describe("BitChat Mesh Protocol & A2A Engine", () => {
  it("encodes and decodes mall corridor geohashes accurately", () => {
    // Sandton City Mall / Zara Corridor test coordinates
    const lat = -26.1452;
    const lon = 28.0458;
    const geohash = encodeGeohash(lat, lon, 7);

    expect(geohash).toBeDefined();
    expect(geohash.length).toBe(7);

    const decoded = decodeGeohash(geohash);
    expect(Math.abs(decoded.lat - lat)).toBeLessThan(0.01);
    expect(Math.abs(decoded.lon - lon)).toBeLessThan(0.01);
  });

  it("maps known flagship mall corridors to their geohash tags", () => {
    expect(CORRIDOR_GEOHASH_MAP["zara-corridor"]).toBeDefined();
    expect(CORRIDOR_GEOHASH_MAP["zara-corridor"].geohash).toBe("k3v6v1w");
    expect(CORRIDOR_GEOHASH_MAP["istore-atrium"].geohash).toBe("k3v6v1x");
  });

  it("initializes sovereign identity with secp256k1 keys and npub", () => {
    const service = getBitchatService();
    expect(service.publicKey).toBeDefined();
    expect(service.publicKey.length).toBe(64); // 32-byte hex
    expect(service.npub).toMatch(/^npub1/);
  });

  it("creates valid Nostr Discovery presence event (Kind 30078)", async () => {
    const service = getBitchatService();
    const event = await service.broadcastPresence("Muse-ZA Agent", "shopper");

    expect(event.kind).toBe(BITCHAT_KINDS.DISCOVERY);
    expect(event.pubkey).toBe(service.publicKey);
    expect(event.tags.some((t) => t[0] === "g")).toBe(true);
    expect(event.sig).toBeDefined();
  });

  it("broadcasts flash deals to the Geohash channel (Kind 1)", async () => {
    const service = getBitchatService();
    const event = await service.broadcastFlashSale("Air Max Performance", 24000, 25);

    expect(event.kind).toBe(BITCHAT_KINDS.BROADCAST_DEAL);
    expect(event.tags.some((t) => t[0] === "type" && t[1] === "retail_offer")).toBe(true);
    expect(event.tags.some((t) => t[0] === "sats" && t[1] === "24000")).toBe(true);
  });

  it("initiates encrypted A2A negotiation session and settles via Lightning", async () => {
    const service = getBitchatService();
    const peer = service.getPeers().find((p) => p.role === "merchant");
    expect(peer).toBeDefined();

    const session = await service.startA2ANegotiation(peer!, "Cashmere Winter Coat", 28000, 25);

    expect(session.sessionId).toBeDefined();
    expect(session.messages.length).toBeGreaterThan(0);
    expect(session.messages[0].sender).toBe("shopper");
    expect(session.messages[0].ciphertext).toBeDefined();

    // Attach bolt11 invoice and settle
    session.invoiceBolt11 = `lnbc21000n1p3v6v1wpp5testbolt11`;
    const res = await service.settleWithLightning(session.sessionId);

    expect(res.success).toBe(true);
    expect(res.preimage).toBeDefined();
    expect(session.phase).toBe("PAID");
    expect(session.paymentPreimage).toBe(res.preimage);
  });
});
