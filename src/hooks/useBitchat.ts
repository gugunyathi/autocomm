import { useState, useEffect, useCallback } from "react";
import { getBitchatService, CORRIDOR_GEOHASH_MAP } from "@/services/bitchat";
import type { BitchatPeer, BitchatNegotiationSession, BitchatMeshTelemetry } from "@/types/bitchat";

export function useBitchat() {
  const service = getBitchatService();

  const [telemetry, setTelemetry] = useState<BitchatMeshTelemetry>(() => service.getTelemetry());
  const [peers, setPeers] = useState<BitchatPeer[]>(() => service.getPeers());
  const [sessions, setSessions] = useState<BitchatNegotiationSession[]>(() =>
    service.getSessions(),
  );
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isScanningBt, setIsScanningBt] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubTelemetry = service.subscribeToTelemetry((t) => {
      setTelemetry({ ...t });
    });

    const unsubPeers = service.subscribeToPeers((p) => {
      setPeers([...p]);
    });

    const unsubSessions = service.subscribeToSessions((s) => {
      setSessions((prev) => {
        const idx = prev.findIndex((item) => item.sessionId === s.sessionId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...s };
          return updated;
        }
        return [s, ...prev];
      });
    });

    return () => {
      unsubTelemetry();
      unsubPeers();
      unsubSessions();
    };
  }, [service]);

  const currentSession =
    sessions.find((s) => s.sessionId === selectedSessionId) ||
    (sessions.length > 0 ? sessions[0] : null);

  const handleBroadcastPresence = useCallback(
    async (
      alias?: string,
      role?: "shopper" | "merchant" | "relay_node" | "beacon",
      location?: string,
    ) => {
      return service.broadcastPresence(alias, role, location);
    },
    [service],
  );

  const handleBroadcastFlashSale = useCallback(
    async (product: string, basePriceSats: number, discountPercent = 25, category = "Apparel") => {
      return service.broadcastFlashSale(product, basePriceSats, discountPercent, category);
    },
    [service],
  );

  const handleStartNegotiation = useCallback(
    async (
      merchantPeer: BitchatPeer,
      productTitle: string,
      basePriceSats: number,
      targetDiscount = 25,
    ) => {
      const sess = await service.startA2ANegotiation(
        merchantPeer,
        productTitle,
        basePriceSats,
        targetDiscount,
      );
      setSelectedSessionId(sess.sessionId);
      return sess;
    },
    [service],
  );

  const handleSendCounterOffer = useCallback(
    async (sessionId: string, counterOfferSats: number, note?: string) => {
      return service.sendCounterOffer(sessionId, counterOfferSats, note);
    },
    [service],
  );

  const handleSettleLightning = useCallback(
    async (sessionId: string) => {
      return service.settleWithLightning(sessionId);
    },
    [service],
  );

  const handleSettleStablecoinL2 = useCallback(
    async (
      sessionId: string,
      network: "base" | "polygon" | "arbitrum" = "base",
      token: "USDC" | "USDT" = "USDC",
    ) => {
      return service.settleWithStablecoinL2(sessionId, network, token);
    },
    [service],
  );

  const handleSettleFiatCard = useCallback(
    async (
      sessionId: string,
      cardInfo: { name: string; last4: string; provider?: string } = {
        name: "Cardholder",
        last4: "4242",
        provider: "Yoco",
      },
    ) => {
      return service.settleWithFiatCard(sessionId, cardInfo);
    },
    [service],
  );

  const handleScanWebBluetooth = useCallback(async () => {
    setIsScanningBt(true);
    setScanMessage(null);
    try {
      const msg = await service.scanWebBluetooth();
      setScanMessage(msg);
      return msg;
    } catch (err: unknown) {
      setScanMessage(err instanceof Error ? err.message : "Failed to scan Bluetooth devices.");
      throw err;
    } finally {
      setIsScanningBt(false);
    }
  }, [service]);

  const handleToggleBle = useCallback(
    (enabled: boolean) => {
      service.toggleBleMesh(enabled);
    },
    [service],
  );

  const handleToggleOfflineMode = useCallback(
    (offline: boolean) => {
      service.toggleOfflineTunnelMode(offline);
    },
    [service],
  );

  const handleTopUpSats = useCallback(
    (amountSats = 50000) => {
      service.topUpSats(amountSats);
    },
    [service],
  );

  const handleFlushOfflineQueue = useCallback(() => {
    return service.flushOfflineQueue();
  }, [service]);

  const handleSetLocation = useCallback(
    (corridorKey: string, lat?: number, lon?: number) => {
      service.setSpatialLocation(corridorKey, lat, lon);
    },
    [service],
  );

  const handleResetKeys = useCallback(() => {
    service.resetKeys();
  }, [service]);

  return {
    identity: {
      pubkey: service.publicKey,
      npub: service.npub,
      alias: service.alias,
      role: service.role,
    },
    telemetry,
    peers,
    sessions,
    currentSession,
    selectedSessionId,
    setSelectedSessionId,
    isScanningBt,
    scanMessage,
    corridorMap: CORRIDOR_GEOHASH_MAP,
    broadcastPresence: handleBroadcastPresence,
    broadcastFlashSale: handleBroadcastFlashSale,
    startNegotiation: handleStartNegotiation,
    sendCounterOffer: handleSendCounterOffer,
    settleLightning: handleSettleLightning,
    settleStablecoinL2: handleSettleStablecoinL2,
    settleFiatCard: handleSettleFiatCard,
    scanWebBluetooth: handleScanWebBluetooth,
    toggleBle: handleToggleBle,
    toggleOfflineMode: handleToggleOfflineMode,
    topUpSats: handleTopUpSats,
    flushOfflineQueue: handleFlushOfflineQueue,
    setLocation: handleSetLocation,
    resetKeys: handleResetKeys,
  };
}
