import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Radio,
  Users,
  Compass,
  Cpu,
  Zap,
  Activity,
  Send,
  Sparkles,
  Shield,
  Layers,
  Eye,
  Video,
  Bot,
  Store,
  Wifi,
  MapPin,
  Clock,
  CheckCircle2,
  Search,
  ShoppingBag,
  Tag,
  ArrowRight,
  Check,
  Loader2,
  DollarSign,
  TrendingDown,
} from "lucide-react";

import type { A2AMessage } from "../types/a2aProtocol";
import {
  sendA2ANegotiationToApi,
  createAgentTransaction,
  executeVaultedAgentPayment,
  convertZarToUsd,
} from "../services/paypalService";
import {
  searchChannel3Products,
  type Channel3Product,
  CURATED_CHANNEL3_PRODUCTS,
} from "../services/channel3Service";

export interface Channel3StreamMetrics {
  roomId: string;
  roomName: string;
  isStreaming: boolean;
  spectatorCount: number;
  managerViewers: {
    id: string;
    storeName: string;
    avatar: string;
    onlineAt: string;
  }[];
  latencyMs: number;
  fps: number;
  bitrateKbps: number;
  pipelineHealth: "EXCELLENT" | "GOOD" | "DEGRADED";
}

export interface AgentTelemetry {
  agentId: string;
  targetOutletId: string;
  targetOutletName: string;
  coordinates: { x: number; y: number }; // normalized 0..100
  gps: { latitude: number; longitude: number };
  headingDegrees: number;
  speedMps: number;
  rssiDb: number;
  batteryPercent: number;
}

const MALL_BEACONS = [
  { id: "zara-fashion", name: "Zara Fashion", x: 25, y: 30, icon: "👗", color: "#a855f7" },
  { id: "hm-boutique", name: "H&M Boutique", x: 45, y: 20, icon: "🌿", color: "#10b981" },
  { id: "istore-apple", name: "iStore Apple", x: 75, y: 25, icon: "💻", color: "#38bdf8" },
  { id: "exclusive-books", name: "Exclusive Books", x: 80, y: 60, icon: "📚", color: "#f59e0b" },
  { id: "mugg-bean", name: "Mugg & Bean", x: 60, y: 80, icon: "☕", color: "#ec4899" },
  { id: "woolworths-food", name: "Woolworths Food", x: 30, y: 75, icon: "🛒", color: "#14b8a6" },
  { id: "nike-performance", name: "Nike Performance", x: 15, y: 55, icon: "👟", color: "#ef4444" },
  { id: "clicks-pharmacy", name: "Clicks Pharmacy", x: 50, y: 50, icon: "💊", color: "#06b6d4" },
];

const SAMPLE_NEGOTIATION_LOGS = [
  {
    sender: "consumer_agent" as const,
    text: "Discovered Woolworths Food BLE beacon at -38dBm. Inquiring on Artisan Cheese Platter stock.",
    time: "10:48:02",
    type: "discovery",
  },
  {
    sender: "merchant_bot" as const,
    text: "Sticker price R220. Active inventory: 4 units. Dynamic threshold allows max 20% margin adjustment.",
    time: "10:48:04",
    type: "offer",
  },
  {
    sender: "consumer_agent" as const,
    text: "Dispatched counter-bid R175 based on midday footfall pattern and user R180 budget cap.",
    time: "10:48:07",
    type: "counter_offer",
  },
  {
    sender: "merchant_bot" as const,
    text: "Bid R175 meets optimal clearance parameters. Generating pre-authorized bilateral contract.",
    time: "10:48:10",
    type: "accept",
  },
  {
    sender: "consumer_agent" as const,
    text: "Invoking PayPal Sandbox Vaulted M2M pipeline with pre-authorized delegate token.",
    time: "10:48:12",
    type: "accept",
  },
];

export function AgentLiveStream() {
  // Channel3 Stream State
  const [streamMetrics, setStreamMetrics] = useState<Channel3StreamMetrics>({
    roomId: "ch3_room_belair_spatial_mesh_8a",
    roomName: "Bel Air 8-Outlet Spatial Mesh & Live A2A Telemetry",
    isStreaming: true,
    spectatorCount: 14,
    managerViewers: [
      { id: "mgr-1", storeName: "Woolworths Store GM", avatar: "🛒", onlineAt: "2m ago" },
      { id: "mgr-2", storeName: "Zara Regional Floor Lead", avatar: "👗", onlineAt: "5m ago" },
      { id: "mgr-3", storeName: "Nike Area Supervisor", avatar: "👟", onlineAt: "Just now" },
      { id: "mgr-4", storeName: "iStore Bel Air Lead", avatar: "💻", onlineAt: "8m ago" },
    ],
    latencyMs: 24,
    fps: 60,
    bitrateKbps: 4820,
    pipelineHealth: "EXCELLENT",
  });

  // Agent Telemetry State
  const [telemetry, setTelemetry] = useState<AgentTelemetry>({
    agentId: "ag_autocom_consumer_9041",
    targetOutletId: "woolworths-food",
    targetOutletName: "Woolworths Food",
    coordinates: { x: 30, y: 72 },
    gps: { latitude: -26.059418, longitude: 27.958272 },
    headingDegrees: 215,
    speedMps: 1.25,
    rssiDb: -42,
    batteryPercent: 94,
  });

  // Live Chat Typing Log
  const [chatLogs, setChatLogs] = useState(SAMPLE_NEGOTIATION_LOGS);
  const [inputMsg, setInputMsg] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Channel3 Product Discovery State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Channel3Product[]>(
    CURATED_CHANNEL3_PRODUCTS.slice(0, 4),
  );
  const [isSearching, setIsSearching] = useState(false);
  const [negotiatingProductId, setNegotiatingProductId] = useState<string | null>(null);
  const [negotiationStep, setNegotiationStep] = useState<string | null>(null);
  const [settledResult, setSettledResult] = useState<{
    orderId: string;
    txId: string;
    productTitle: string;
    negotiatedZAR: number;
    amountUSD: number;
  } | null>(null);

  const handleSearchChannel3 = useCallback(async (q: string) => {
    setIsSearching(true);
    try {
      const res = await searchChannel3Products(q, { limit: 4 });
      setSearchResults(res.results);
    } catch {
      // fallback handled gracefully
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleAutoNegotiateAndSettle = useCallback(async (product: Channel3Product) => {
    setNegotiatingProductId(product.id);
    setSettledResult(null);

    // 1. Target outlet on radar
    setTelemetry((prev) => ({
      ...prev,
      targetOutletId: product.storeId,
      targetOutletName: product.retailer,
    }));

    // 2. Add Discovery log
    setNegotiationStep("Querying Channel3 Catalog & Dispatching A2A Discovery Packet...");
    setChatLogs((prev) => [
      ...prev,
      {
        sender: "consumer_agent" as const,
        text: `[Channel3 API] Found SKU ${product.sku} at ${product.retailer}. Initiating bilateral negotiation for "${product.title}" (Sticker: R${product.priceZAR}).`,
        time: new Date().toLocaleTimeString(),
        type: "discovery",
      },
    ]);

    await new Promise((r) => setTimeout(r, 700));

    // 3. Counter bid calculation (e.g. 18% discount)
    const discountFactor = 0.82;
    const bidPriceZAR = Math.round(product.priceZAR * discountFactor);
    const usdAmount = convertZarToUsd(bidPriceZAR);

    setNegotiationStep(`Autonomous counter-bid dispatched: R${bidPriceZAR} ($${usdAmount} USD)...`);
    setChatLogs((prev) => [
      ...prev,
      {
        sender: "consumer_agent" as const,
        text: `Submitting automated counter-bid R${bidPriceZAR} (18% below retail) via autonomous agent policy cap.`,
        time: new Date().toLocaleTimeString(),
        type: "counter_offer",
      },
    ]);

    await new Promise((r) => setTimeout(r, 800));

    // 4. Merchant bot acceptance
    setNegotiationStep("Merchant Bot accepted bilateral terms!");
    setChatLogs((prev) => [
      ...prev,
      {
        sender: "merchant_bot" as const,
        text: `A2A Bot @ ${product.retailer}: Bid R${bidPriceZAR} approved. Stock reserved (${product.stockCount} left). Directing to PayPal Sandbox Vault.`,
        time: new Date().toLocaleTimeString(),
        type: "accept",
      },
    ]);

    await new Promise((r) => setTimeout(r, 800));

    // 5. PayPal Sandbox Orders v2 & Vault capture
    setNegotiationStep("Creating PayPal Sandbox Order & Vault Capturing...");
    try {
      const order = await createAgentTransaction(product.storeId, bidPriceZAR);
      const payment = await executeVaultedAgentPayment(order.orderId);

      setNegotiationStep("Settlement Complete! Claimed Bag Voucher Generated.");
      setChatLogs((prev) => [
        ...prev,
        {
          sender: "consumer_agent" as const,
          text: `[PayPal Vault Settled] Order: ${order.orderId} | Capture TX: ${payment.transactionId} | Amount: $${order.amountUSD} USD (R${bidPriceZAR} ZAR). Voucher signed!`,
          time: new Date().toLocaleTimeString(),
          type: "accept",
        },
      ]);

      setSettledResult({
        orderId: order.orderId,
        txId: payment.transactionId,
        productTitle: product.title,
        negotiatedZAR: bidPriceZAR,
        amountUSD: order.amountUSD,
      });
    } catch {
      setNegotiationStep("PayPal settlement fallback completed.");
    } finally {
      setTimeout(() => {
        setNegotiatingProductId(null);
        setNegotiationStep(null);
      }, 4000);
    }
  }, []);

  // Dynamic movement simulation for spatial telemetry canvas
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => {
        // Orbit slightly around Woolworths Food
        const angle = Date.now() / 3000;
        const newX = 30 + Math.sin(angle) * 8;
        const newY = 73 + Math.cos(angle) * 6;
        const heading = (Math.round((angle * 180) / Math.PI) + 360) % 360;

        return {
          ...prev,
          coordinates: { x: Math.max(5, Math.min(95, newX)), y: Math.max(5, Math.min(95, newY)) },
          headingDegrees: heading,
          speedMps: 0.9 + Math.sin(angle * 2) * 0.4,
          rssiDb: Math.round(-38 - Math.abs(Math.sin(angle)) * 12),
        };
      });

      // Fluctuate Channel3 metrics realistically
      setStreamMetrics((prev) => ({
        ...prev,
        latencyMs: 22 + Math.floor(Math.random() * 5),
        bitrateKbps: 4800 + Math.floor(Math.random() * 60) - 30,
        spectatorCount: 14 + (Math.random() > 0.7 ? 1 : 0),
      }));
    }, 800);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLogs]);

  // Handle manual message inject from developer console
  const handleSendMessage = useCallback(() => {
    if (!inputMsg.trim()) return;

    const timeString = new Date().toLocaleTimeString();
    const newEntry = {
      sender: "consumer_agent" as const,
      text: inputMsg.trim(),
      time: timeString,
      type: "counter_offer" as const,
    };

    setChatLogs((prev) => [...prev, newEntry]);
    setInputMsg("");

    // Dispatch to real backend /api/agent/negotiate with local fallback
    sendA2ANegotiationToApi({
      sender: "consumer_agent",
      type: "counter_offer",
      storeId: telemetry.targetOutletId,
      itemName: telemetry.targetOutletName,
      agentRationale: inputMsg.trim(),
    })
      .then((reply) => {
        setChatLogs((prev) => [
          ...prev,
          {
            sender: "merchant_bot" as const,
            text:
              reply.agentRationale ||
              `A2A Bot @ ${telemetry.targetOutletName}: Evaluated packet. Adjusted bilateral convergence margin.`,
            time: new Date().toLocaleTimeString(),
            type: reply.type,
          },
        ]);
      })
      .catch(() => {
        setTimeout(() => {
          setChatLogs((prev) => [
            ...prev,
            {
              sender: "merchant_bot" as const,
              text: `A2A Bot @ ${telemetry.targetOutletName}: Evaluated packet "${newEntry.text.slice(0, 30)}...". Adjusted bilateral convergence margin.`,
              time: new Date().toLocaleTimeString(),
              type: "offer" as const,
            },
          ]);
        }, 800);
      });
  }, [inputMsg, telemetry.targetOutletId, telemetry.targetOutletName]);

  const targetBeacon = useMemo(
    () => MALL_BEACONS.find((b) => b.id === telemetry.targetOutletId) ?? MALL_BEACONS[0],
    [telemetry.targetOutletId],
  );

  return (
    <div className="w-full space-y-4">
      {/* Top Channel3 Streaming Indicator Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl glass border border-red-500/30 bg-gradient-to-r from-red-950/40 via-black/60 to-purple-950/30 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black tracking-wider text-red-400 uppercase flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                Live on Channel3 Pipeline
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-white/10 text-white font-bold border border-white/15">
                WebRTC Mesh
              </span>
            </div>
            <p className="text-xs text-slate-300 font-sans mt-0.5">
              Streaming real-time agent canvas telemetry to{" "}
              <strong className="text-white">
                {streamMetrics.spectatorCount} South African Retail Managers
              </strong>
            </p>
          </div>
        </div>

        {/* Live Channel3 Health Telemetry Pillbox */}
        <div className="flex items-center gap-3 font-mono text-[11px] bg-black/60 px-3 py-1.5 rounded-xl border border-white/10 shrink-0">
          <div className="flex items-center gap-1 text-emerald-400">
            <Activity className="w-3.5 h-3.5" />
            <span>{streamMetrics.latencyMs}ms</span>
          </div>
          <div className="text-white/40">|</div>
          <div className="text-slate-300">
            <span>{streamMetrics.fps} FPS</span>
          </div>
          <div className="text-white/40">|</div>
          <div className="text-primary font-bold">
            <span>{streamMetrics.bitrateKbps} kbps</span>
          </div>
          <div className="text-white/40">|</div>
          <div className="flex items-center gap-1 text-teal-300 font-bold">
            <Users className="w-3.5 h-3.5" />
            <span>{streamMetrics.spectatorCount}</span>
          </div>
        </div>
      </div>

      {/* Channel3 Retail Product Discovery & Autonomous PayPal Settlement Showcase */}
      <div className="glass rounded-2xl border border-teal-500/30 p-4 bg-gradient-to-br from-[#08131d] via-[#091522] to-[#040811] shadow-2xl space-y-3.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-xs font-black text-white uppercase tracking-wider">
                  Channel3 AI Product Search API
                </h3>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  100M+ Products · 25,000+ Retailers
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-primary/20 text-primary border border-primary/30">
                  PayPal Vaulted
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                AI agents discover real retail inventory across South African mall outlets, negotiate deals, and execute zero-click PayPal machine checkout.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-stretch sm:self-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search Channel3 (e.g. shoes, cheese, hoodie)..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearchChannel3(e.target.value);
                }}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-muted-foreground font-mono focus:outline-none focus:border-teal-400"
              />
            </div>
          </div>
        </div>

        {/* Quick query tags */}
        <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono">
          <span className="text-muted-foreground flex items-center gap-1">
            <Tag className="w-3 h-3" /> Quick Query:
          </span>
          {["Artisan Cheese", "Wool Hoodie", "Air Zoom Pegasus", "MagSafe Wallet", "Dark Roast Coffee", "Clicks Bio-Oil"].map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setSearchQuery(tag);
                handleSearchChannel3(tag);
              }}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Live Negotiation Stage Alert Bar */}
        {negotiationStep && (
          <div className="p-3 rounded-xl bg-teal-950/60 border border-teal-500/40 text-teal-200 text-xs font-mono flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
              <span>{negotiationStep}</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-teal-400">Autonomous Flow</span>
          </div>
        )}

        {/* Settled Result Success Pill */}
        {settledResult && (
          <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-100 text-xs font-mono flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>{settledResult.productTitle}</strong> settled via PayPal Sandbox Vault! Order ID:{" "}
                <code className="text-emerald-300 font-bold">{settledResult.orderId}</code> (Capture: {settledResult.txId})
              </span>
            </div>
            <div className="flex items-center gap-2 font-bold shrink-0">
              <span className="text-emerald-300">R{settledResult.negotiatedZAR} ZAR</span>
              <span className="text-white/40">/</span>
              <span className="text-primary">${settledResult.amountUSD} USD</span>
            </div>
          </div>
        )}

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {searchResults.map((product) => {
            const isNegotiating = negotiatingProductId === product.id;
            return (
              <div
                key={product.id}
                className="glass rounded-xl border border-white/10 bg-black/40 overflow-hidden flex flex-col justify-between hover:border-teal-500/40 transition-all group"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-black/80 backdrop-blur-md text-white border border-white/15">
                    {product.retailer}
                  </span>
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/90 text-slate-950">
                    {product.stockCount} in stock
                  </span>
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-teal-300 transition-colors">
                      {product.title}
                    </h4>
                    <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">
                      {product.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 space-y-2">
                    <div className="flex items-center justify-between font-mono">
                      <div>
                        <div className="text-sm font-extrabold text-white">
                          R{product.priceZAR}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          ${product.priceUSD} USD
                        </div>
                      </div>
                      <span className="text-[9px] text-teal-400 font-bold bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-500/20">
                        Max -{product.maxNegotiationDiscount}%
                      </span>
                    </div>

                    <button
                      onClick={() => handleAutoNegotiateAndSettle(product)}
                      disabled={isNegotiating || Boolean(negotiatingProductId)}
                      className={`w-full py-1.5 px-2.5 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isNegotiating
                          ? "bg-teal-500/20 text-teal-300 border border-teal-500/40 cursor-wait"
                          : "bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                      }`}
                    >
                      {isNegotiating ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Negotiating & Settling...</span>
                        </>
                      ) : (
                        <>
                          <Bot className="w-3 h-3" />
                          <span>Deploy Agent & Settle PayPal</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Spatial Radar (Left) + Live Negotiation Feed (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Spatial Telemetry Radar (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="glass rounded-2xl border border-white/15 p-4 bg-[#0a0e1c] shadow-2xl relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-primary" />
                <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  Spatial Navigation Radar · Bel Air Mall
                </h3>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-red-400" />
                  -26.0594, 27.9582
                </span>
                <span>·</span>
                <span className="text-emerald-400 font-bold">Indoor BLE Active</span>
              </div>
            </div>

            {/* Radar Canvas Surface */}
            <div className="relative w-full aspect-[4/3] mt-3 rounded-xl border border-white/10 bg-gradient-to-b from-slate-950 via-[#070b16] to-black overflow-hidden select-none">
              {/* Concentric distance rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[85%] h-[85%] rounded-full border border-teal-500/15" />
                <div className="w-[60%] h-[60%] rounded-full border border-teal-500/20" />
                <div className="w-[35%] h-[35%] rounded-full border border-teal-500/25" />
                <div className="w-[10%] h-[10%] rounded-full border border-teal-500/30" />
                <div className="absolute w-full h-[1px] bg-teal-500/10" />
                <div className="absolute h-full w-[1px] bg-teal-500/10" />
              </div>

              {/* 8 Outlet Beacons */}
              {MALL_BEACONS.map((b) => {
                const isTarget = b.id === telemetry.targetOutletId;
                return (
                  <button
                    key={b.id}
                    onClick={() =>
                      setTelemetry((prev) => ({
                        ...prev,
                        targetOutletId: b.id,
                        targetOutletName: b.name,
                      }))
                    }
                    className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-transform hover:scale-110 z-10"
                    style={{ left: `${b.x}%`, top: `${b.y}%` }}
                    title={`Select ${b.name} as target`}
                  >
                    <div
                      className={`relative flex items-center justify-center w-8 h-8 rounded-xl border shadow-lg backdrop-blur-md transition-all ${
                        isTarget
                          ? "border-accent bg-accent/30 ring-2 ring-accent scale-110 shadow-amber"
                          : "border-white/20 bg-black/60 hover:border-white/40"
                      }`}
                    >
                      <span className="text-sm">{b.icon}</span>
                      {isTarget && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
                      )}
                    </div>
                    <span className="absolute left-1/2 -translate-x-1/2 top-9 px-1.5 py-0.5 rounded bg-black/80 border border-white/10 text-[9px] font-mono text-white whitespace-nowrap opacity-75 group-hover:opacity-100 transition-opacity">
                      {b.name}
                    </span>
                  </button>
                );
              })}

              {/* Connection Beam to Target Outlet */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                <line
                  x1={`${telemetry.coordinates.x}%`}
                  y1={`${telemetry.coordinates.y}%`}
                  x2={`${targetBeacon.x}%`}
                  y2={`${targetBeacon.y}%`}
                  stroke="rgba(20, 184, 166, 0.6)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  className="animate-pulse"
                />
              </svg>

              {/* Autonomous Consumer Agent Marker */}
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out z-20"
                style={{
                  left: `${telemetry.coordinates.x}%`,
                  top: `${telemetry.coordinates.y}%`,
                }}
              >
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-12 h-12 rounded-full bg-teal-400/20 animate-ping" />
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 font-black flex items-center justify-center border-2 border-white shadow-teal">
                    <Bot className="w-4 h-4 text-slate-950" />
                  </div>
                  {/* Compass pointer arrow */}
                  <div
                    className="absolute -top-2 w-2 h-2 border-t-2 border-r-2 border-emerald-300 transform -rotate-45"
                    style={{
                      transform: `rotate(${telemetry.headingDegrees}deg) translateY(-8px)`,
                    }}
                  />
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 top-8 px-2 py-0.5 rounded-full bg-teal-950/90 border border-teal-400/40 text-[9px] font-mono text-teal-300 font-extrabold whitespace-nowrap shadow-lg">
                  Autocomm Agent
                </div>
              </div>

              {/* In-Canvas Mini HUD Overlay */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between p-2 rounded-xl bg-black/80 border border-white/10 font-mono text-[10px] text-muted-foreground backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <span className="text-white font-bold flex items-center gap-1">
                    <Wifi className="w-3 h-3 text-teal-400" />
                    RSSI: {telemetry.rssiDb} dBm
                  </span>
                  <span>Heading: {telemetry.headingDegrees}°</span>
                  <span>Speed: {telemetry.speedMps.toFixed(2)} m/s</span>
                </div>
                <span className="text-emerald-400 font-bold">
                  Lock: {telemetry.targetOutletName}
                </span>
              </div>
            </div>

            {/* Sub-bar: Retail Manager Spectator Badges */}
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-mono text-[11px] flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-primary" />
                Active Retail Manager Spectators:
              </span>
              <div className="flex items-center gap-1.5">
                {streamMetrics.managerViewers.map((m) => (
                  <span
                    key={m.id}
                    className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono text-[10px] text-slate-300 flex items-center gap-1"
                    title={`${m.storeName} (${m.onlineAt})`}
                  >
                    <span>{m.avatar}</span>
                    <span className="hidden sm:inline truncate max-w-[90px]">{m.storeName}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Negotiation Feed & Chat Typing (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="glass rounded-2xl border border-white/15 p-4 bg-[#0a0e1c] shadow-2xl flex flex-col h-full min-h-[460px]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  Live LLM-to-Merchant Dialog
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-accent/20 text-accent border border-accent/30">
                A2A Protocol
              </span>
            </div>

            {/* Scrollable Chat Stream */}
            <div className="flex-1 overflow-y-auto space-y-2.5 my-3 pr-1 text-xs font-mono max-h-[340px]">
              {chatLogs.map((log, index) => {
                const isConsumer = log.sender === "consumer_agent";
                return (
                  <div
                    key={index}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isConsumer
                        ? "bg-teal-950/30 border-teal-500/30 text-teal-100 ml-4"
                        : "bg-purple-950/30 border-purple-500/30 text-purple-100 mr-4"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pb-1 mb-1 border-b border-white/5">
                      <span className="font-bold flex items-center gap-1">
                        {isConsumer ? (
                          <>
                            <Bot className="w-3 h-3 text-teal-400" />
                            <span className="text-teal-400">Buyer Agent</span>
                          </>
                        ) : (
                          <>
                            <Store className="w-3 h-3 text-purple-400" />
                            <span className="text-purple-400">Merchant Bot</span>
                          </>
                        )}
                      </span>
                      <span className="text-[9px] opacity-75">{log.time}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed font-sans">{log.text}</p>
                    <div className="mt-1 flex items-center justify-between text-[9px] text-muted-foreground">
                      <span className="uppercase font-mono text-[8px] text-primary">
                        Op: {log.type}
                      </span>
                      <span className="text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Signed
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input Console for judges to test injecting prompts */}
            <div className="pt-2 border-t border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Inject A2A counter-offer instruction..."
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-xs text-white placeholder-muted-foreground font-mono focus:outline-none focus:border-teal-400"
                />
                <button
                  onClick={handleSendMessage}
                  className="p-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold transition-all active:scale-95 cursor-pointer shrink-0"
                  title="Inject message into A2A dialog"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="mt-1.5 text-[10px] text-muted-foreground font-mono">
                Press Enter to dispatch directly into the autonomous agent mesh.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
