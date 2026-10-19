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
} from "lucide-react";

import type { A2AMessage } from "../types/a2aProtocol";
import { sendA2ANegotiationToApi } from "../services/paypalService";

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
                  AutoCom Agent
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
