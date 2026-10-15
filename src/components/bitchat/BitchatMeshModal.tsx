import React, { useState, useEffect, useId } from "react";
import {
  X,
  Radio,
  Zap,
  Shield,
  Wifi,
  WifiOff,
  Bluetooth,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  Cpu,
  Lock,
  Layers,
  Sparkles,
  Smartphone,
  Send,
  Sliders,
  DollarSign,
  QrCode,
  CreditCard,
  ExternalLink,
  Globe,
  Coins,
  ShieldAlert,
  Ticket,
  BarChart3,
} from "lucide-react";
import { useBitchat } from "@/hooks/useBitchat";
import { StablecoinPaymentEngine } from "./StablecoinPaymentEngine";
import { AgentDealConsole } from "./AgentDealConsole";
import {
  SUPPORTED_CURRENCIES,
  detectLocalCurrencyProfile,
  setSelectedCurrency,
  type CurrencyProfile,
} from "@/utils/currencyRouter";
import { InventoryOptimizer, type OptimizationNotice } from "@/services/Optimizer";
import {
  HandoverVerificationEngine,
  type VerificationResult,
} from "@/services/HandoverVerification";
import { DB, GeoDB } from "@/services/database";
import type { BitchatPeer, BitchatNegotiationSession } from "@/types/bitchat";

interface BitchatMeshModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEngageDealInSim?: (peer: BitchatPeer) => void;
}

export function BitchatMeshModal({ isOpen, onClose, onEngageDealInSim }: BitchatMeshModalProps) {
  const {
    identity,
    telemetry,
    peers,
    sessions,
    currentSession,
    selectedSessionId,
    setSelectedSessionId,
    isScanningBt,
    scanMessage,
    corridorMap,
    broadcastPresence,
    broadcastFlashSale,
    startNegotiation,
    sendCounterOffer,
    settleLightning,
    settleStablecoinL2,
    settleFiatCard,
    scanWebBluetooth,
    toggleBle,
    toggleOfflineMode,
    topUpSats,
    flushOfflineQueue,
    setLocation,
    resetKeys,
  } = useBitchat();

  const [activeTab, setActiveTab] = useState<
    "radar" | "negotiate" | "lightning" | "recovery" | "relays" | "guide"
  >("radar");

  const [currentCurrency, setCurrentCurrency] = useState<CurrencyProfile>(SUPPORTED_CURRENCIES[0]);
  const [cashierTicketInput, setCashierTicketInput] = useState<string>("");
  const [cashierVerificationResult, setCashierVerificationResult] =
    useState<VerificationResult | null>(null);
  const [isVerifyingCashierTicket, setIsVerifyingCashierTicket] = useState(false);
  const [optimizationReport, setOptimizationReport] = useState(() =>
    InventoryOptimizer.optimizeStockAllocations(),
  );

  useEffect(() => {
    detectLocalCurrencyProfile().then(setCurrentCurrency);
  }, []);

  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedInvoice, setCopiedInvoice] = useState(false);
  const [counterOfferInput, setCounterOfferInput] = useState<number>(22000);
  const [counterNote, setCounterNote] = useState<string>("");
  const [isSettling, setIsSettling] = useState(false);
  const [settleSuccess, setSettleSuccess] = useState<string | null>(null);
  const [activeCorridorKey, setActiveCorridorKey] = useState<string>("zara-corridor");
  const [showRawCiphertext, setShowRawCiphertext] = useState(false);

  // Broadcast flash sale modal form
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [flashProduct, setFlashProduct] = useState("Artisan Silk Scarf");
  const [flashSats, setFlashSats] = useState(14000);
  const [flashDiscount, setFlashDiscount] = useState(25);

  const [selectedPaymentRail, setSelectedPaymentRail] = useState<
    "bitcoin_lightning" | "stablecoin_l2" | "fiat_card"
  >("bitcoin_lightning");
  const [selectedL2Network, setSelectedL2Network] = useState<"base" | "polygon" | "arbitrum">(
    "base",
  );
  const [selectedL2Token, setSelectedL2Token] = useState<"USDC" | "USDT">("USDC");
  const [cardholderName, setCardholderName] = useState("Sipho Dlamini");
  const [cardLast4, setCardLast4] = useState("8842");
  const [cardProvider, setCardProvider] = useState<"Yoco" | "PayFast" | "Stripe">("Yoco");

  const canvasId = useId();

  if (!isOpen) return null;

  const handleCopyNpub = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(identity.npub);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleCopyInvoice = (bolt11: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(bolt11);
      setCopiedInvoice(true);
      setTimeout(() => setCopiedInvoice(false), 2000);
    }
  };

  const handleQuickNegotiate = async (peer: BitchatPeer) => {
    if (peer.activePromo) {
      await startNegotiation(
        peer,
        peer.activePromo.item,
        peer.activePromo.priceSats,
        peer.activePromo.discountPercent,
      );
      setActiveTab("negotiate");
    }
  };

  const handleSendCounter = async () => {
    if (!currentSession) return;
    await sendCounterOffer(currentSession.sessionId, counterOfferInput, counterNote || undefined);
    setCounterNote("");
  };

  const handleExecuteLightningPayment = async () => {
    if (!currentSession || !currentSession.invoiceBolt11) return;
    setIsSettling(true);
    setSettleSuccess(null);
    try {
      const res = await settleLightning(currentSession.sessionId);
      setSettleSuccess(`Preimage verified: ${res.preimage.substring(0, 24)}... (Bolt11 Settled)`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Settlement failed");
    } finally {
      setIsSettling(false);
    }
  };

  const handleExecuteStablecoinPayment = async () => {
    if (!currentSession) return;
    setIsSettling(true);
    setSettleSuccess(null);
    try {
      const res = await settleStablecoinL2(
        currentSession.sessionId,
        selectedL2Network,
        selectedL2Token,
      );
      setSettleSuccess(
        `L2 Stablecoin Settled! Broadcasted tx: ${res.txHash.substring(0, 20)}... on ${selectedL2Network.toUpperCase()} · Voucher: ${res.voucherToken}`,
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Stablecoin settlement failed");
    } finally {
      setIsSettling(false);
    }
  };

  const handleExecuteFiatCardPayment = async () => {
    if (!currentSession) return;
    setIsSettling(true);
    setSettleSuccess(null);
    try {
      const res = await settleFiatCard(currentSession.sessionId, {
        name: cardholderName,
        last4: cardLast4,
        provider: cardProvider,
      });
      setSettleSuccess(
        `Card Authorized! Webhook Hook verified (${res.receiptId}) via ${cardProvider} · Voucher: ${res.voucherToken}`,
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Fiat Card settlement failed");
    } finally {
      setIsSettling(false);
    }
  };

  const handleCorridorChange = (key: string) => {
    setActiveCorridorKey(key);
    setLocation(key);
  };

  const handleCreateBroadcast = async () => {
    await broadcastFlashSale(flashProduct, flashSats, flashDiscount);
    setShowBroadcastModal(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bitchat-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none"
    >
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[900px] flex flex-col rounded-3xl border border-teal-500/30 bg-[#070b14]/95 text-foreground shadow-2xl overflow-hidden backdrop-blur-2xl ring-1 ring-white/10">
        {/* Top Control Bar / Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 border-b border-white/10 bg-gradient-to-r from-teal-950/40 via-background to-purple-950/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-500/20 border border-teal-400/40 text-teal-300 shadow-[0_0_15px_rgba(20,184,166,0.3)]">
              <Radio className="h-5 w-5 animate-pulse" />
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-black text-[9px] border border-teal-400">
                ⚡
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="bitchat-modal-title"
                  className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5"
                >
                  BitChat Mesh Network
                  <span className="rounded-md bg-teal-500/20 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-teal-300 border border-teal-500/30">
                    NIP-04 + BLE
                  </span>
                </h2>
              </div>
              <p className="font-mono text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1.5">
                <span>📍 {telemetry.corridorName}</span>
                <span className="text-teal-400 font-bold">({telemetry.currentGeohash})</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics & Faucet */}
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-between sm:justify-end">
            {/* Sats Wallet Balance Badge */}
            <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-xs font-mono text-amber-300">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-bold">{telemetry.satsBalance.toLocaleString()} Sats</span>
              <span className="text-[10px] text-amber-400/70">
                (≈R{Math.round(telemetry.satsBalance / 35)})
              </span>
              <button
                onClick={() => topUpSats(50000)}
                className="ml-1 rounded bg-amber-500/20 hover:bg-amber-500/40 text-amber-200 px-1.5 py-0.2 text-[9px] font-bold transition-all"
                title="Top up +50k Sats from testnet faucet"
              >
                +50k
              </button>
            </div>

            {/* Offline Tunnel Switch */}
            <button
              onClick={() => toggleOfflineMode(!telemetry.isOfflineMode)}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-mono transition-all cursor-pointer border ${
                telemetry.isOfflineMode
                  ? "bg-rose-500/20 border-rose-500 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                  : "bg-white/5 border-white/20 text-muted-foreground hover:border-teal-400 hover:text-white"
              }`}
              title="Simulate subterranean basement / tunnel where cellular & WiFi drops, forcing BLE mesh store-and-forward"
            >
              {telemetry.isOfflineMode ? (
                <>
                  <WifiOff className="h-3 w-3 text-rose-400" />
                  <span className="font-bold text-[10px]">Tunnel Mode (Off-Grid)</span>
                </>
              ) : (
                <>
                  <Wifi className="h-3 w-3 text-teal-400" />
                  <span className="text-[10px]">Hybrid Sync</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close BitChat Mesh Modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Identity & Protocol Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b border-white/5 bg-[#0a0f1d] text-xs font-mono">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-muted-foreground">Sovereign Identity:</span>
            <button
              onClick={handleCopyNpub}
              className="flex items-center gap-1 rounded bg-white/5 hover:bg-white/10 px-2 py-0.5 text-teal-300 border border-white/10 transition-all truncate max-w-[220px] sm:max-w-[320px]"
              title="Click to copy Nostr npub"
            >
              <span className="truncate">{identity.npub}</span>
              {copiedKey ? (
                <Check className="h-3 w-3 text-green-400 shrink-0" />
              ) : (
                <Copy className="h-3 w-3 shrink-0" />
              )}
            </button>
            <span className="rounded bg-teal-500/20 px-1.5 py-0.5 text-[10px] text-teal-300 uppercase">
              {identity.role}
            </span>

            {/* Currency Locale Picker */}
            <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/10 ml-1">
              <Globe className="h-3 w-3 text-cyan-400" />
              <select
                value={currentCurrency.code}
                onChange={(e) => {
                  const updated = setSelectedCurrency(e.target.value);
                  setCurrentCurrency(updated);
                }}
                className="bg-transparent text-white text-[10px] font-mono font-bold focus:outline-none cursor-pointer"
                title="Select localized fiat currency"
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                    {c.flag} {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3 text-teal-400" />
              <span>Peers: {peers.length}</span>
            </span>
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3 text-purple-400" />
              <span>NIP-04 ECDH</span>
            </span>
            {telemetry.offlineQueueCount > 0 && (
              <button
                onClick={() => flushOfflineQueue()}
                className="flex items-center gap-1 text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/40 hover:bg-amber-500/30"
                title="Flush queued store-and-forward packets to Nostr relays"
              >
                <span>Queue: {telemetry.offlineQueueCount} (Flush)</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 pt-2 border-b border-white/10 bg-[#090d18] overflow-x-auto scrollbar-none shrink-0">
          <button
            onClick={() => setActiveTab("radar")}
            className={`flex items-center gap-1.5 px-3.5 py-2 font-mono text-xs font-semibold rounded-t-xl transition-all cursor-pointer border-t border-x ${
              activeTab === "radar"
                ? "bg-[#0c1222] text-teal-300 border-teal-500/40 shadow-sm"
                : "text-muted-foreground border-transparent hover:text-white"
            }`}
          >
            <Radio className="h-3.5 w-3.5 text-teal-400" />
            <span>BLE Mesh Radar</span>
            <span className="rounded-full bg-teal-500/20 text-teal-300 px-1.5 py-0.2 text-[9px]">
              {peers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("negotiate")}
            className={`flex items-center gap-1.5 px-3.5 py-2 font-mono text-xs font-semibold rounded-t-xl transition-all cursor-pointer border-t border-x ${
              activeTab === "negotiate"
                ? "bg-[#0c1222] text-teal-300 border-teal-500/40 shadow-sm"
                : "text-muted-foreground border-transparent hover:text-white"
            }`}
          >
            <Lock className="h-3.5 w-3.5 text-purple-400" />
            <span>Encrypted A2A Stream</span>
            {sessions.length > 0 && (
              <span className="rounded-full bg-purple-500/20 text-purple-300 px-1.5 py-0.2 text-[9px]">
                {sessions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("lightning")}
            className={`flex items-center gap-1.5 px-3.5 py-2 font-mono text-xs font-semibold rounded-t-xl transition-all cursor-pointer border-t border-x ${
              activeTab === "lightning"
                ? "bg-[#0c1222] text-amber-300 border-amber-500/40 shadow-sm"
                : "text-muted-foreground border-transparent hover:text-white"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Multi-Rail Settlements</span>
          </button>

          <button
            onClick={() => setActiveTab("recovery")}
            className={`flex items-center gap-1.5 px-3.5 py-2 font-mono text-xs font-semibold rounded-t-xl transition-all cursor-pointer border-t border-x ${
              activeTab === "recovery"
                ? "bg-[#0c1222] text-rose-300 border-rose-500/40 shadow-sm"
                : "text-muted-foreground border-transparent hover:text-white"
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
            <span>Recovery & Handoffs</span>
          </button>

          <button
            onClick={() => setActiveTab("relays")}
            className={`flex items-center gap-1.5 px-3.5 py-2 font-mono text-xs font-semibold rounded-t-xl transition-all cursor-pointer border-t border-x ${
              activeTab === "relays"
                ? "bg-[#0c1222] text-teal-300 border-teal-500/40 shadow-sm"
                : "text-muted-foreground border-transparent hover:text-white"
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-blue-400" />
            <span>Relays & Geohash</span>
          </button>

          <button
            onClick={() => setActiveTab("guide")}
            className={`flex items-center gap-1.5 px-3.5 py-2 font-mono text-xs font-semibold rounded-t-xl transition-all cursor-pointer border-t border-x ${
              activeTab === "guide"
                ? "bg-[#0c1222] text-teal-300 border-teal-500/40 shadow-sm"
                : "text-muted-foreground border-transparent hover:text-white"
            }`}
          >
            <Cpu className="h-3.5 w-3.5 text-teal-400" />
            <span>How Bitchat Works</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#080d19]/90 space-y-6">
          {/* TAB 1: BLE MESH RADAR & PEERS */}
          {activeTab === "radar" && (
            <div className="space-y-6">
              {/* Corridor Geohash Selector Strip */}
              <div className="flex items-center justify-between flex-wrap gap-2 p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">
                    Active Corridor Geohash:
                  </span>
                  <select
                    value={activeCorridorKey}
                    onChange={(e) => handleCorridorChange(e.target.value)}
                    className="bg-[#0b101e] border border-teal-500/40 text-teal-300 rounded-lg px-2.5 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-teal-400 cursor-pointer"
                  >
                    {Object.entries(corridorMap).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.corridor} ({val.geohash})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowBroadcastModal(true)}
                    className="flex items-center gap-1 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/50 text-teal-200 px-3 py-1.5 text-xs font-mono font-semibold transition-all cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-teal-300" />
                    <span>Broadcast Flash Deal</span>
                  </button>

                  <button
                    onClick={scanWebBluetooth}
                    disabled={isScanningBt}
                    className="flex items-center gap-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-200 px-3 py-1.5 text-xs font-mono font-semibold transition-all cursor-pointer"
                    title="Pair real Bluetooth device via Chrome Web Bluetooth API"
                  >
                    <Bluetooth className={`h-3.5 w-3.5 ${isScanningBt ? "animate-spin" : ""}`} />
                    <span>{isScanningBt ? "Scanning BLE..." : "Scan Web Bluetooth"}</span>
                  </button>
                </div>
              </div>

              {scanMessage && (
                <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-mono">
                  {scanMessage}
                </div>
              )}

              {/* Grid: 2D Radar Simulation & Peers List */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 2D Circular Radar Canvas Visualizer */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-3xl bg-[#0b1120] border border-white/10 relative overflow-hidden">
                  <div className="absolute top-3 left-3 text-[10px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-teal-400 animate-ping" />
                    BLE Proximity Radar (15m Radius)
                  </div>

                  <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-4 flex items-center justify-center">
                    {/* Concentric distance rings */}
                    <div className="absolute inset-0 rounded-full border border-teal-500/20" />
                    <div className="absolute inset-8 rounded-full border border-teal-500/20" />
                    <div className="absolute inset-16 rounded-full border border-teal-500/20" />
                    <div className="absolute inset-24 rounded-full border border-teal-500/30" />

                    {/* Crosshairs */}
                    <div className="absolute inset-x-0 top-1/2 h-px bg-teal-500/20" />
                    <div className="absolute inset-y-0 left-1/2 w-px bg-teal-500/20" />

                    {/* Center: Self Sovereign Agent */}
                    <div className="relative z-10 flex flex-col items-center justify-center">
                      <div className="h-6 w-6 rounded-full bg-teal-400 border-2 border-white flex items-center justify-center shadow-[0_0_15px_#2dd4bf]">
                        <span className="text-[10px]">🤖</span>
                      </div>
                      <span className="font-mono text-[8px] text-teal-300 font-bold mt-1">
                        MUSE-ZA
                      </span>
                    </div>

                    {/* Peer blips rendered with geometric trigonometry */}
                    {peers.map((peer, idx) => {
                      const angle = (idx * (360 / peers.length) * Math.PI) / 180;
                      const radiusFraction = Math.min(1, peer.distanceMeters / 15);
                      const maxPixelRadius = 110;
                      const x = Math.cos(angle) * (radiusFraction * maxPixelRadius);
                      const y = Math.sin(angle) * (radiusFraction * maxPixelRadius);

                      return (
                        <div
                          key={peer.id}
                          style={{
                            transform: `translate(${x}px, ${y}px)`,
                          }}
                          className="absolute flex flex-col items-center justify-center group cursor-pointer"
                          onClick={() => handleQuickNegotiate(peer)}
                        >
                          <div
                            className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-125 ${
                              peer.role === "merchant"
                                ? "bg-emerald-400 border-white shadow-[0_0_10px_#34d399]"
                                : peer.role === "relay_node"
                                  ? "bg-purple-400 border-white shadow-[0_0_10px_#c084fc]"
                                  : "bg-blue-400 border-white shadow-[0_0_10px_#60a5fa]"
                            }`}
                          >
                            <span className="text-[7px]">
                              {peer.role === "merchant"
                                ? "🏪"
                                : peer.role === "relay_node"
                                  ? "📡"
                                  : "👤"}
                            </span>
                          </div>
                          <span className="font-mono text-[7px] text-white/90 bg-black/70 px-1 rounded mt-0.5 whitespace-nowrap">
                            {peer.alias.substring(0, 10)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="w-full flex items-center justify-between text-[10px] font-mono text-muted-foreground border-t border-white/5 pt-2">
                    <span className="text-emerald-400">● Merchant Node</span>
                    <span className="text-purple-400">● Relay Repeater</span>
                    <span className="text-blue-400">● Shopper Node</span>
                  </div>
                </div>

                {/* Nearby Peers List Cards */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                      Discovered Mesh Nodes ({peers.length})
                    </h3>
                    <span className="text-[11px] font-mono text-teal-400">
                      Transport: {telemetry.mode.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                    {peers.map((peer) => (
                      <div
                        key={peer.id}
                        className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                      >
                        <div className="min-w-0 flex items-start gap-3">
                          <div
                            className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border ${
                              peer.role === "merchant"
                                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                                : peer.role === "relay_node"
                                  ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                                  : "bg-blue-500/20 border-blue-500/40 text-blue-300"
                            }`}
                          >
                            <span className="text-base">
                              {peer.role === "merchant"
                                ? "🏪"
                                : peer.role === "relay_node"
                                  ? "📡"
                                  : "🤖"}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white truncate">
                                {peer.alias}
                              </h4>
                              <span className="rounded bg-white/10 px-1.5 py-0.2 font-mono text-[9px] uppercase text-muted-foreground">
                                {peer.hopCount === 1 ? "1-Hop Direct" : `${peer.hopCount}-Hop Mesh`}
                              </span>
                            </div>

                            <p className="font-mono text-[11px] text-muted-foreground truncate">
                              {peer.corridorName} · {peer.distanceMeters.toFixed(1)}m away
                            </p>

                            {peer.activePromo && (
                              <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                                <span className="rounded bg-teal-500/20 text-teal-300 border border-teal-500/40 px-2 py-0.5 text-[10px] font-mono font-semibold">
                                  {peer.activePromo.item}
                                </span>
                                <span className="text-amber-300 font-mono text-[11px] font-bold">
                                  ⚡ {peer.activePromo.priceSats.toLocaleString()} Sats (-
                                  {peer.activePromo.discountPercent}%)
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Signal & Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <div className="text-right font-mono text-[10px]">
                            <div className="text-teal-400 font-bold">{peer.rssi} dBm</div>
                            <div className="text-muted-foreground">
                              Bat: {peer.batteryPercent ? `${peer.batteryPercent}%` : "Mains"}
                            </div>
                          </div>

                          {peer.role === "merchant" && peer.activePromo && (
                            <button
                              onClick={() => handleQuickNegotiate(peer)}
                              className="flex items-center gap-1 rounded-xl bg-teal-500 hover:bg-teal-400 text-black px-3 py-1.5 text-xs font-mono font-bold transition-all shadow-md hover:scale-105 cursor-pointer"
                            >
                              <span>A2A Deal</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ENCRYPTED A2A NEGOTIATION STREAM */}
          {activeTab === "negotiate" && (
            <div className="space-y-4">
              {currentSession ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Chat & Proof stream */}
                  <div className="lg:col-span-8 flex flex-col rounded-3xl bg-[#0b101f] border border-white/10 p-4 min-h-[440px]">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div>
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-purple-400" />
                          <h3 className="text-sm font-bold text-white">
                            {currentSession.productTitle}
                          </h3>
                          <span className="rounded bg-purple-500/20 text-purple-300 font-mono text-[10px] px-1.5 py-0.5 border border-purple-500/40">
                            {currentSession.phase}
                          </span>
                        </div>
                        <p className="font-mono text-[11px] text-muted-foreground mt-0.5">
                          Negotiating with {currentSession.merchantAlias} over Geohash{" "}
                          <span className="text-teal-400">{currentSession.geohash}</span>
                        </p>
                      </div>

                      <button
                        onClick={() => setShowRawCiphertext(!showRawCiphertext)}
                        className="rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white px-2 py-1 font-mono text-[10px] transition-all"
                      >
                        {showRawCiphertext ? "View Plaintext" : "View NIP-04 Ciphertext"}
                      </button>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
                      {currentSession.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-3 rounded-2xl max-w-[85%] text-xs font-mono border ${
                            msg.sender === "shopper"
                              ? "ml-auto bg-teal-950/40 border-teal-500/30 text-teal-100"
                              : msg.sender === "merchant"
                                ? "mr-auto bg-purple-950/40 border-purple-500/30 text-purple-100"
                                : "mx-auto bg-amber-950/40 border-amber-500/30 text-amber-100"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4 text-[9px] text-muted-foreground mb-1">
                            <span className="font-bold uppercase tracking-wider">
                              {msg.sender === "shopper"
                                ? "Muse-ZA (Consumer)"
                                : msg.sender === "merchant"
                                  ? "Nibble-ZA (Merchant)"
                                  : "System"}
                            </span>
                            <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                          </div>

                          <p className="text-white text-xs leading-relaxed">
                            {showRawCiphertext ? msg.ciphertext : msg.plaintext}
                          </p>

                          {msg.satsValue && (
                            <div className="mt-1.5 text-[10px] font-bold text-amber-300 flex items-center gap-2">
                              <span>⚡ {msg.satsValue.toLocaleString()} Sats</span>
                              <span className="text-muted-foreground">(≈R{msg.zarValue})</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Interactive Counter-Offer Cockpit */}
                    <div className="pt-3 border-t border-white/10 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">
                          Counter-Offer:
                        </span>
                        <input
                          type="number"
                          value={counterOfferInput}
                          onChange={(e) => setCounterOfferInput(Number(e.target.value))}
                          className="w-32 bg-background border border-white/20 rounded-lg px-2.5 py-1 text-xs font-mono text-amber-300"
                          step={1000}
                        />
                        <span className="text-xs font-mono text-muted-foreground">Sats</span>
                        <span className="text-xs font-mono text-teal-400">
                          (≈R{Math.round(counterOfferInput / 35)})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Optional strategy note (e.g. Willing to settle immediately for 25% off)..."
                          value={counterNote}
                          onChange={(e) => setCounterNote(e.target.value)}
                          className="flex-1 bg-background border border-white/20 rounded-lg px-3 py-1.5 text-xs font-mono text-white placeholder:text-muted-foreground"
                        />
                        <button
                          onClick={handleSendCounter}
                          className="flex items-center gap-1 rounded-xl bg-teal-500 hover:bg-teal-400 text-black px-4 py-1.5 text-xs font-mono font-bold transition-all cursor-pointer"
                        >
                          <Send className="h-3 w-3" />
                          <span>Dispatch DM</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right: Deal Summary & Lightning Settlement trigger */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="p-4 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                        Deal Terms & Lightning Lock
                      </h4>

                      <div className="space-y-2 font-mono text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Original Price:</span>
                          <span className="text-white">
                            ⚡ {currentSession.originalPriceSats.toLocaleString()} Sats (R
                            {currentSession.originalPriceZar})
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Current Negotiated:</span>
                          <span className="text-amber-300 font-bold">
                            ⚡ {currentSession.currentOfferSats.toLocaleString()} Sats (R
                            {currentSession.currentOfferZar})
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Discount Achieved:</span>
                          <span className="text-emerald-400 font-bold">
                            -{currentSession.discountPercent}% OFF
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-white/10 pt-2">
                          <span className="text-muted-foreground">Value Saved:</span>
                          <span className="text-teal-300 font-bold">
                            ⚡{" "}
                            {(
                              currentSession.originalPriceSats - currentSession.currentOfferSats
                            ).toLocaleString()}{" "}
                            Sats
                          </span>
                        </div>
                      </div>

                      {/* MULTI-RAIL PAYMENT MATRIX (Bitchat Protocol Rail) */}
                      {(currentSession.invoiceBolt11 || currentSession.paymentRequest) && (
                        <div className="pt-3 border-t border-white/10 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                              <Sparkles className="h-3 w-3 text-amber-400" />
                              Multi-Rail Payment Request
                            </span>
                            <span className="rounded bg-teal-500/20 text-teal-300 font-mono text-[9px] px-1.5 py-0.5">
                              Bitchat Rail
                            </span>
                          </div>

                          {/* Off-Grid Dynamic Detection Alert */}
                          {telemetry.isOfflineMode ? (
                            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-[10px] font-mono text-amber-200 space-y-1">
                              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                                <WifiOff className="h-3.5 w-3.5" />
                                <span>Off-Grid Basement Corridor Detected</span>
                              </div>
                              <p className="text-muted-foreground leading-relaxed">
                                Offline mesh fallback active. Settling via pure Bitchat + BLE Mesh +
                                Bitcoin/Cashu. Stablecoin L2 & Card rails unhide automatically once
                                mall Wi-Fi/LTE is detected.
                              </p>
                            </div>
                          ) : (
                            /* Rail Selector Pills (Visible when Online) */
                            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-black/60 border border-white/10">
                              <button
                                onClick={() => setSelectedPaymentRail("bitcoin_lightning")}
                                className={`py-1.5 px-1.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                                  selectedPaymentRail === "bitcoin_lightning"
                                    ? "bg-amber-500 text-black shadow-md font-black"
                                    : "text-muted-foreground hover:text-white"
                                }`}
                              >
                                <Zap className="h-3 w-3" />
                                <span>Lightning</span>
                              </button>
                              <button
                                onClick={() => setSelectedPaymentRail("stablecoin_l2")}
                                className={`py-1.5 px-1.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                                  selectedPaymentRail === "stablecoin_l2"
                                    ? "bg-cyan-500 text-black shadow-md font-black"
                                    : "text-muted-foreground hover:text-white"
                                }`}
                              >
                                <Coins className="h-3 w-3" />
                                <span>L2 USDC</span>
                              </button>
                              <button
                                onClick={() => setSelectedPaymentRail("fiat_card")}
                                className={`py-1.5 px-1.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                                  selectedPaymentRail === "fiat_card"
                                    ? "bg-purple-500 text-white shadow-md font-black"
                                    : "text-muted-foreground hover:text-white"
                                }`}
                              >
                                <CreditCard className="h-3 w-3" />
                                <span>Card (ZAR)</span>
                              </button>
                            </div>
                          )}

                          {/* SETTLED RECEIPT STATE */}
                          {currentSession.phase === "PAID" ? (
                            <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono space-y-2">
                              <div className="flex items-center justify-between text-xs font-bold">
                                <span>✓ SETTLED & CONFIRMED</span>
                                <span className="uppercase text-[10px] px-2 py-0.5 bg-emerald-500/30 rounded">
                                  {currentSession.settledRail || "Lightning"}
                                </span>
                              </div>
                              {currentSession.paymentPreimage && (
                                <p className="text-[9px] text-muted-foreground break-all">
                                  Preimage: {currentSession.paymentPreimage.substring(0, 32)}...
                                </p>
                              )}
                              {currentSession.settledTxHash && (
                                <p className="text-[9px] text-muted-foreground break-all">
                                  TxHash: {currentSession.settledTxHash.substring(0, 32)}...
                                </p>
                              )}
                              {currentSession.settlementProof?.voucherQrToken && (
                                <div className="p-2 rounded-lg bg-black/60 border border-emerald-500/30 text-center font-mono font-bold text-teal-300 text-xs">
                                  🎟️ Voucher: {currentSession.settlementProof.voucherQrToken}
                                </div>
                              )}
                            </div>
                          ) : (
                            /* UNSETTLED RAIL OPTIONS */
                            <div className="space-y-3 font-mono">
                              {/* RAIL 1: BITCOIN LIGHTNING */}
                              {(selectedPaymentRail === "bitcoin_lightning" ||
                                telemetry.isOfflineMode) && (
                                <div className="space-y-2 p-3 rounded-2xl bg-black/40 border border-amber-500/30">
                                  <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold">
                                    <span>Rail 1: Bolt11 Invoice</span>
                                    <button
                                      onClick={() =>
                                        handleCopyInvoice(currentSession.invoiceBolt11!)
                                      }
                                      className="flex items-center gap-1 text-[10px] text-teal-300 hover:underline cursor-pointer"
                                    >
                                      {copiedInvoice ? "Copied!" : "Copy Bolt11"}
                                    </button>
                                  </div>
                                  <div className="p-2 rounded bg-black/80 font-mono text-[9px] text-muted-foreground break-all border border-white/5">
                                    {currentSession.invoiceBolt11?.substring(0, 48)}...
                                  </div>
                                  <button
                                    onClick={handleExecuteLightningPayment}
                                    disabled={isSettling}
                                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black py-2 text-xs font-mono font-bold transition-all shadow-amber cursor-pointer"
                                  >
                                    <Zap className="h-4 w-4" />
                                    <span>
                                      {isSettling
                                        ? "Settling with WebLN..."
                                        : `Pay with WebLN (${currentSession.currentOfferSats.toLocaleString()} Sats)`}
                                    </span>
                                  </button>
                                </div>
                              )}

                              {/* RAIL 2: STABLECOIN L2 (USDC/USDT) */}
                              {!telemetry.isOfflineMode &&
                                selectedPaymentRail === "stablecoin_l2" && (
                                  <div className="space-y-2.5 p-3 rounded-2xl bg-black/40 border border-cyan-500/30">
                                    <div className="flex items-center justify-between text-[11px] text-cyan-300 font-bold">
                                      <span>Rail 2: Stablecoin (Layer-2)</span>
                                      <span className="text-[10px] text-muted-foreground">
                                        ≈ ${(currentSession.currentOfferZar / 18.2).toFixed(2)} USDC
                                      </span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-1">
                                      {(["base", "polygon", "arbitrum"] as const).map((net) => (
                                        <button
                                          key={net}
                                          onClick={() => setSelectedL2Network(net)}
                                          className={`py-1 text-[9px] font-mono rounded-lg uppercase font-bold border cursor-pointer ${
                                            selectedL2Network === net
                                              ? "bg-cyan-500/30 border-cyan-400 text-cyan-200"
                                              : "border-white/10 text-muted-foreground hover:bg-white/5"
                                          }`}
                                        >
                                          {net}
                                        </button>
                                      ))}
                                    </div>

                                    <div className="p-2 rounded bg-black/80 text-[9px] text-muted-foreground space-y-1 border border-white/5">
                                      <div className="flex justify-between">
                                        <span>Token:</span>
                                        <span className="text-white font-bold">
                                          {selectedL2Token}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Merchant EVM:</span>
                                        <span className="text-white font-mono">0x742d...f44e</span>
                                      </div>
                                    </div>

                                    <StablecoinPaymentEngine
                                      merchantAddress={
                                        currentSession.paymentRequest?.rails.stablecoin_l2
                                          ?.targetAddress ||
                                        "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
                                      }
                                      amountUSDC={
                                        currentSession.paymentRequest?.rails.stablecoin_l2
                                          ?.amountFormatted
                                          ? currentSession.paymentRequest.rails.stablecoin_l2.amountFormatted.toString()
                                          : (currentSession.currentOfferZar / 18.2).toFixed(2)
                                      }
                                      onPaymentSubmitted={async (txHash) => {
                                        await handleExecuteStablecoinPayment();
                                      }}
                                    />
                                  </div>
                                )}

                              {/* RAIL 3: FIAT CREDIT / DEBIT CARD (YOCO / PAYFAST) */}
                              {!telemetry.isOfflineMode && selectedPaymentRail === "fiat_card" && (
                                <div className="space-y-2.5 p-3 rounded-2xl bg-black/40 border border-purple-500/30">
                                  <div className="flex items-center justify-between text-[11px] text-purple-300 font-bold">
                                    <span>Rail 3: Fiat Card Web-Checkout</span>
                                    <span className="text-[10px] text-emerald-400 font-bold">
                                      R{currentSession.currentOfferZar} ZAR
                                    </span>
                                  </div>

                                  <div className="p-2 rounded bg-black/80 text-[9px] text-muted-foreground space-y-1.5 border border-white/5">
                                    <div className="flex items-center justify-between">
                                      <span>Gateway:</span>
                                      <div className="flex gap-1.5">
                                        {(["Yoco", "PayFast", "Stripe"] as const).map((prov) => (
                                          <button
                                            key={prov}
                                            onClick={() => setCardProvider(prov)}
                                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold cursor-pointer ${
                                              cardProvider === prov
                                                ? "bg-purple-500 text-white"
                                                : "bg-white/10 text-muted-foreground"
                                            }`}
                                          >
                                            {prov}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span>Cardholder:</span>
                                      <input
                                        type="text"
                                        value={cardholderName}
                                        onChange={(e) => setCardholderName(e.target.value)}
                                        className="bg-transparent border-b border-white/20 text-white text-[9px] font-mono text-right w-24"
                                      />
                                    </div>
                                  </div>

                                  <button
                                    onClick={handleExecuteFiatCardPayment}
                                    disabled={isSettling}
                                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white py-2 text-xs font-mono font-bold transition-all shadow-purple cursor-pointer"
                                  >
                                    <CreditCard className="h-4 w-4" />
                                    <span>
                                      {isSettling
                                        ? "Verifying Webhook..."
                                        : `Pay R${currentSession.currentOfferZar} via ${cardProvider} Hook`}
                                    </span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 space-y-3">
                  <Lock className="h-10 w-10 text-muted-foreground mx-auto" />
                  <p className="text-sm font-mono text-white">No active negotiation session</p>
                  <p className="text-xs font-mono text-muted-foreground">
                    Select a merchant node from the BLE Mesh Radar tab to engage in sovereign A2A
                    negotiation.
                  </p>
                  <button
                    onClick={() => setActiveTab("radar")}
                    className="rounded-xl bg-teal-500 text-black font-mono text-xs font-bold px-4 py-2 hover:bg-teal-400 transition-all cursor-pointer"
                  >
                    Open Radar
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MULTI-RAIL LIQUIDITY & SETTLEMENTS */}
          {activeTab === "lightning" && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Header Banner */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950/30 via-[#0b1122] to-cyan-950/30 border border-amber-500/30 text-center space-y-2">
                <div className="inline-flex h-12 w-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 items-center justify-center text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.25)] mb-1">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  🗺️ The Multi-Rail Architecture Matrix
                </h3>
                <p className="text-xs font-mono text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Bitchat is the communication rail, not the payment processor. Raw JSON negotiation
                  payloads over BLE mesh & Nostr transport dispatch multi-option agreements across
                  Bitcoin Lightning, Stablecoin L2, and Traditional Cards.
                </p>
              </div>

              {/* Real-Time Off-Grid Fallback Interactive Simulator */}
              <div className="p-4 rounded-2xl bg-[#080d19] border border-white/10 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {telemetry.isOfflineMode ? (
                      <WifiOff className="h-4 w-4 text-rose-400" />
                    ) : (
                      <Wifi className="h-4 w-4 text-emerald-400" />
                    )}
                    <span className="text-xs font-mono font-bold text-white">
                      Corridor Environment Status:{" "}
                      <span
                        className={telemetry.isOfflineMode ? "text-rose-400" : "text-emerald-400"}
                      >
                        {telemetry.isOfflineMode
                          ? "Off-Grid Basement (No Internet)"
                          : "Connected (Mall Wi-Fi / 5G)"}
                      </span>
                    </span>
                  </div>

                  <button
                    onClick={() => toggleOfflineMode(!telemetry.isOfflineMode)}
                    className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
                      telemetry.isOfflineMode
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/50"
                        : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                    }`}
                  >
                    {telemetry.isOfflineMode
                      ? "Simulate Exit to Mall Wi-Fi"
                      : "Simulate Entering Basement Corridor"}
                  </button>
                </div>

                <p className="text-[11px] font-mono text-muted-foreground leading-relaxed">
                  {telemetry.isOfflineMode ? (
                    <span className="text-rose-300">
                      ⚠️ In this basement corridor without cellular or Wi-Fi, the platform
                      automatically suppresses online-dependent rails (L2 RPCs & Card Gateway) and
                      falls back to pure Bitchat + local offline Bluetooth mesh + Bitcoin/Cashu.
                    </span>
                  ) : (
                    <span className="text-emerald-300">
                      ✓ Connected near mall Wi-Fi zone: All 3 rails (Bitcoin Lightning, Base/Polygon
                      Stablecoins, and Yoco/PayFast Card Checkout) are unhidden and active for
                      automatic execution.
                    </span>
                  )}
                </p>
              </div>

              {/* 3 Rails Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* RAIL 1: BITCOIN LIGHTNING */}
                <div className="p-4 rounded-2xl bg-[#0b1020] border border-amber-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center">
                        <Zap className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-xs text-white">Rail 1: Lightning</span>
                    </div>
                    <span className="rounded bg-amber-500/20 text-amber-300 font-mono text-[9px] px-1.5 py-0.5 font-bold">
                      Off-Grid Ready
                    </span>
                  </div>

                  <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">
                    Bolt11 invoices settled in seconds via WebLN (
                    <code className="text-amber-300">window.webln.sendPayment</code>). Operates
                    offline over BLE Mesh.
                  </p>

                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 font-mono text-xs space-y-1">
                    <div className="text-muted-foreground text-[10px]">Your Sats Balance:</div>
                    <div className="text-amber-300 font-bold text-sm">
                      ⚡ {telemetry.satsBalance.toLocaleString()} Sats
                    </div>
                    <div className="text-[9px] text-muted-foreground">
                      ≈ R{Math.round(telemetry.satsBalance / 35)} ZAR
                    </div>
                  </div>

                  <button
                    onClick={() => topUpSats(50000)}
                    className="w-full py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-mono text-xs font-bold transition-all cursor-pointer"
                  >
                    ⚡ Faucet +50,000 Sats
                  </button>
                </div>

                {/* RAIL 2: STABLECOIN L2 */}
                <div
                  className={`p-4 rounded-2xl bg-[#0b1020] border transition-all space-y-3 ${
                    telemetry.isOfflineMode
                      ? "border-white/10 opacity-50"
                      : "border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                        <Coins className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-xs text-white">Rail 2: Stablecoin L2</span>
                    </div>
                    {telemetry.isOfflineMode ? (
                      <span className="rounded bg-rose-500/20 text-rose-300 font-mono text-[9px] px-1.5 py-0.5 font-bold">
                        🔒 Hidden Off-Grid
                      </span>
                    ) : (
                      <span className="rounded bg-cyan-500/20 text-cyan-300 font-mono text-[9px] px-1.5 py-0.5 font-bold">
                        Base / Polygon
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">
                    Merchant specifies wallet & network in{" "}
                    <code className="text-cyan-300">stablecoin_l2</code> block. Frontend triggers
                    passkey/MetaMask and pings tx-hash back over Bitchat.
                  </p>

                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 font-mono text-xs space-y-1">
                    <div className="text-muted-foreground text-[10px]">Supported Chains:</div>
                    <div className="text-cyan-300 font-bold text-[11px]">
                      Base · Polygon · Arbitrum
                    </div>
                    <div className="text-[9px] text-muted-foreground">Tokens: USDC / USDT</div>
                  </div>

                  <div className="text-center font-mono text-[10px] text-muted-foreground py-1">
                    {telemetry.isOfflineMode
                      ? "Requires Wi-Fi / LTE to sign RPC"
                      : "✓ Ready for 1-click EVM Settlement"}
                  </div>
                </div>

                {/* RAIL 3: CREDIT / DEBIT CARD (FIAT) */}
                <div
                  className={`p-4 rounded-2xl bg-[#0b1020] border transition-all space-y-3 ${
                    telemetry.isOfflineMode
                      ? "border-white/10 opacity-50"
                      : "border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-xs text-white">Rail 3: Fiat Cards</span>
                    </div>
                    {telemetry.isOfflineMode ? (
                      <span className="rounded bg-rose-500/20 text-rose-300 font-mono text-[9px] px-1.5 py-0.5 font-bold">
                        🔒 Hidden Off-Grid
                      </span>
                    ) : (
                      <span className="rounded bg-purple-500/20 text-purple-300 font-mono text-[9px] px-1.5 py-0.5 font-bold">
                        Yoco / PayFast
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">
                    Card data is never broadcast over mesh. Headless agent generates a secure
                    single-use checkout URL attached to{" "}
                    <code className="text-purple-300">fiat_card_url</code> with Apple Pay.
                  </p>

                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 font-mono text-xs space-y-1">
                    <div className="text-muted-foreground text-[10px]">Supported Gateways:</div>
                    <div className="text-purple-300 font-bold text-[11px]">
                      Yoco · PayFast · Stripe · Apple Pay
                    </div>
                    <div className="text-[9px] text-muted-foreground">
                      Instant Webhook Verifications
                    </div>
                  </div>

                  <div className="text-center font-mono text-[10px] text-muted-foreground py-1">
                    {telemetry.isOfflineMode
                      ? "Requires Web Connection"
                      : "✓ Secure PCI-DSS Gateway Hook"}
                  </div>
                </div>
              </div>

              {/* Settlement History / Stats */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
                <div>
                  <span className="text-muted-foreground">Total Settled via Bitchat Rails: </span>
                  <span className="text-teal-300 font-bold">
                    ⚡ {telemetry.totalSettledSats.toLocaleString()} Sats (≈{" "}
                    {currentCurrency.symbol}
                    {Math.round(
                      (telemetry.totalSettledSats / 35) *
                        (currentCurrency.code === "ZAR" ? 1 : currentCurrency.multiplier || 1),
                    )}{" "}
                    {currentCurrency.code})
                  </span>
                </div>
                <div className="text-muted-foreground text-[11px]">
                  0% Intermediary Take Rate · Sovereign Mesh
                </div>
              </div>
            </div>
          )}

          {/* TAB: CROSS-RAIL RECOVERY, OFF-GRID HANDOFF & OPTIMIZER */}
          {activeTab === "recovery" && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Header Banner */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-rose-950/40 via-[#0b1122] to-purple-950/40 border border-rose-500/30 text-center space-y-2">
                <div className="inline-flex h-12 w-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 items-center justify-center text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.25)] mb-1">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  🛡️ Cross-Rail Recovery, Off-Grid Verification & Geo Optimizer
                </h3>
                <p className="text-xs font-mono text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Prevents cart abandonment by automatically converting failed traditional card
                  charges into sovereign WebLN / Base USDC crypto settlements over Bitchat, with
                  cryptographically signed BLE handover tickets.
                </p>
              </div>

              {/* Grid: Checkout Station on Left, Cashier Verifier on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* 1. Agent Deal Console Component */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-mono font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-rose-400" />
                      Shopper Deal & Recovery Engine
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      Client-Side Intercept
                    </span>
                  </div>
                  <AgentDealConsole
                    itemId="zara-leather-jacket-09"
                    itemTitle="Zara Biker Leather Jacket"
                    originalPriceZar={1199}
                    onPaymentSuccess={(proof, rail) => {
                      setOptimizationReport(InventoryOptimizer.optimizeStockAllocations());
                    }}
                  />
                </div>

                {/* 2. Store Counter: Off-Grid Handover Verifier (Kind 30079) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-mono font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                      <QrCode className="h-3.5 w-3.5 text-teal-400" />
                      Store Counter Handover Terminal
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      0% Internet Required
                    </span>
                  </div>

                  <div className="p-5 rounded-3xl bg-slate-900/90 border border-teal-500/30 space-y-4 text-xs font-mono">
                    <div>
                      <h4 className="font-bold text-white text-sm">
                        Offline BLE Ticket Authenticator
                      </h4>
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        Cashier verifies cryptographic Nostr signatures (Kind 30079) locally over
                        Bluetooth mesh with zero cloud or internet connectivity.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] text-muted-foreground uppercase font-bold">
                          Received BLE Ticket JSON:
                        </label>
                        <button
                          onClick={async () => {
                            // Seed a realistic valid test ticket
                            const testSecretKey = new Uint8Array(32);
                            for (let i = 0; i < 32; i++) testSecretKey[i] = (i * 3 + 7) % 256;
                            const sampleTicket = await generateOfflineCollectionTicket(
                              "zara-leather-jacket-09",
                              `proof_hash_${Date.now()}`,
                              testSecretKey,
                            );
                            setCashierTicketInput(sampleTicket);
                          }}
                          className="text-[10px] text-teal-300 hover:underline cursor-pointer"
                        >
                          Generate Sample Signed Ticket
                        </button>
                      </div>

                      <textarea
                        rows={4}
                        value={cashierTicketInput}
                        onChange={(e) => setCashierTicketInput(e.target.value)}
                        placeholder="Paste Nostr Kind 30079 signed event JSON or intercept over Bluetooth mesh..."
                        className="w-full p-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-[10px] placeholder:text-muted-foreground focus:outline-none focus:border-teal-400"
                      />
                    </div>

                    <button
                      onClick={async () => {
                        if (!cashierTicketInput.trim()) return;
                        setIsVerifyingCashierTicket(true);
                        try {
                          const res =
                            await HandoverVerificationEngine.verifyHandoverTicket(
                              cashierTicketInput,
                            );
                          setCashierVerificationResult(res);
                          setOptimizationReport(InventoryOptimizer.optimizeStockAllocations());
                        } finally {
                          setIsVerifyingCashierTicket(false);
                        }
                      }}
                      disabled={isVerifyingCashierTicket || !cashierTicketInput.trim()}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-black font-bold text-xs transition-all shadow-md cursor-pointer"
                    >
                      <Ticket className="h-4 w-4" />
                      <span>
                        {isVerifyingCashierTicket
                          ? "Authenticating Cryptographic Key..."
                          : "Authenticate Ticket & Authorize Handover"}
                      </span>
                    </button>

                    {cashierVerificationResult && (
                      <div
                        className={`p-3.5 rounded-2xl border text-xs font-mono space-y-1.5 ${
                          cashierVerificationResult.success
                            ? "bg-emerald-950/70 border-emerald-500/50 text-emerald-200"
                            : "bg-rose-950/70 border-rose-500/50 text-rose-200"
                        }`}
                      >
                        <div className="font-bold flex items-center gap-1.5">
                          {cashierVerificationResult.success
                            ? "✓ HANDOVER AUTHORIZED"
                            : "❌ REDEMPTION REJECTED"}
                        </div>
                        <p className="text-[11px] leading-relaxed">
                          {cashierVerificationResult.message}
                        </p>
                        {cashierVerificationResult.proofHash && (
                          <p className="text-[9px] text-muted-foreground break-all">
                            Proof: {cashierVerificationResult.proofHash}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. SQLite Location History Aggregation & Inventory Optimizer View */}
              <div className="p-5 rounded-3xl bg-[#0b1020] border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-cyan-400" />
                    <div>
                      <h4 className="font-bold text-white text-sm">
                        SQLite Regional Demand & Inventory Optimizer
                      </h4>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        Automated stock allocation and floor price protection heuristics grouped by
                        localized currency.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setOptimizationReport(InventoryOptimizer.optimizeStockAllocations());
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold transition-all border border-white/20 cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Run Optimization Heuristics</span>
                  </button>
                </div>

                {/* Metrics Breakdown Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 font-mono">
                  {optimizationReport.metrics.map((m) => (
                    <div
                      key={m.currencyCode}
                      className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1"
                    >
                      <div className="text-[10px] text-muted-foreground flex items-center justify-between">
                        <span className="font-bold text-white">{m.currencyCode}</span>
                        <span>{m.volume} orders</span>
                      </div>
                      <div className="text-cyan-300 font-bold text-xs truncate">
                        {m.totalRevenue.toLocaleString()} {m.currencyCode}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Optimization Notices / Strategic Recommendations */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground tracking-wider">
                    Automated Restock & Strategy Notices:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 font-mono text-xs">
                    {optimizationReport.notices.map((n, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1"
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-amber-400">{n.type}</span>
                          <span className="text-muted-foreground">{n.currencyCode}</span>
                        </div>
                        <p className="text-white text-[11px] font-semibold">{n.message}</p>
                        <p className="text-teal-300 text-[10px] leading-relaxed">
                          💡 Action: {n.recommendedAction}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RELAYS & GEOHASH CHANNELS */}
          {activeTab === "relays" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Nostr Relay Pool & WebSocket Fallback
                  </h3>
                  <p className="text-xs font-mono text-muted-foreground">
                    Internet transport syncing physical BLE mesh events to regional geohash rooms.
                  </p>
                </div>
                <div className="font-mono text-xs text-teal-400">
                  Packets Sent: {telemetry.packetsSent} · Recv: {telemetry.packetsReceived}
                </div>
              </div>

              <div className="space-y-3">
                {telemetry.relays.map((relay) => (
                  <div
                    key={relay.url}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-white font-semibold">{relay.url}</span>
                    </div>

                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span>{relay.messagesReceived} events</span>
                      <span className="text-teal-400 font-bold">{relay.latencyMs}ms</span>
                      <span className="rounded bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-[10px]">
                        CONNECTED
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-[#0b1120] border border-white/10 space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase text-muted-foreground">
                  Offline Store-and-Forward Buffer
                </h4>
                <p className="text-xs font-mono text-muted-foreground">
                  When disconnected from Nostr relays in subterranean mall tunnels, packets are
                  queued in local indexed storage and dispatched over BLE mesh.
                </p>
                <div className="flex items-center justify-between pt-2">
                  <span className="font-mono text-xs text-amber-300">
                    Pending Packets: {telemetry.offlineQueueCount}
                  </span>
                  <button
                    onClick={() => flushOfflineQueue()}
                    disabled={telemetry.offlineQueueCount === 0}
                    className="rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 px-3 py-1 text-xs font-mono font-semibold transition-all cursor-pointer disabled:opacity-40"
                  >
                    Flush to Relays
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: HOW BITCHAT WORKS (GUIDE) */}
          {activeTab === "guide" && (
            <div className="max-w-3xl mx-auto space-y-6 font-mono text-xs text-muted-foreground leading-relaxed">
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-teal-400" />
                  <span>BitChat Architecture in AutoCom</span>
                </h3>

                <p className="text-white/90">
                  BitChat enables{" "}
                  <strong className="text-teal-300">
                    serverless, off-grid peer-to-peer commerce
                  </strong>
                  . When consumers walk through shopping centers, their autonomous agents
                  communicate over Bluetooth Low Energy (BLE) and Nostr relays without central
                  brokers.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                    <span className="text-teal-300 font-bold">1. Geohash Discovery</span>
                    <p className="text-[11px]">
                      Converts mall GPS coordinates to 7-char geohashes (e.g.{" "}
                      <code className="text-white">k3v6v1w</code>), scoping deals to the exact
                      physical corridor.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                    <span className="text-purple-300 font-bold">2. NIP-04 Encrypted DMs</span>
                    <p className="text-[11px]">
                      Agents (Muse-ZA & Nibble-ZA) negotiate discounts over encrypted Nostr DMs
                      using secp256k1 key pairs.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                    <span className="text-amber-300 font-bold">3. Lightning Sats Settlement</span>
                    <p className="text-[11px]">
                      Agreed transactions are settled in milliseconds via Bitcoin Lightning Network
                      (WebLN) with cryptographic preimage proofs.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button onClick={resetKeys} className="text-rose-400 hover:underline text-[11px]">
                    Regenerate Sovereign Nostr Key Pair
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Broadcast Flash Sale Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#0b1020] border border-teal-500/40 space-y-4 text-xs font-mono">
            <h3 className="text-base font-bold text-white">Broadcast Flash Deal to Corridor</h3>
            <div className="space-y-2">
              <div>
                <label className="text-muted-foreground block mb-1">Product Title:</label>
                <input
                  type="text"
                  value={flashProduct}
                  onChange={(e) => setFlashProduct(e.target.value)}
                  className="w-full bg-background border border-white/20 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">Price (Sats):</label>
                <input
                  type="number"
                  value={flashSats}
                  onChange={(e) => setFlashSats(Number(e.target.value))}
                  className="w-full bg-background border border-white/20 rounded-xl px-3 py-2 text-amber-300"
                />
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">Discount %:</label>
                <input
                  type="number"
                  value={flashDiscount}
                  onChange={(e) => setFlashDiscount(Number(e.target.value))}
                  className="w-full bg-background border border-white/20 rounded-xl px-3 py-2 text-teal-300"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="px-4 py-2 rounded-xl text-muted-foreground hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBroadcast}
                className="px-4 py-2 rounded-xl bg-teal-500 text-black font-bold hover:bg-teal-400"
              >
                Broadcast to Mesh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
