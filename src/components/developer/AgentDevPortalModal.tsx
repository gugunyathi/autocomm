import React, { useState, useMemo } from "react";
import type {
  Web3WalletState,
  AgentApiCredential,
  ArbitrageLedgerEntry,
  ChainNetwork,
} from "@/types/autocom";
import {
  X,
  Terminal,
  Code2,
  Play,
  Activity,
  Copy,
  Check,
  Zap,
  RefreshCw,
  Sparkles,
  FileCode,
  Sliders,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  Layers,
  CheckCircle2,
  ChevronRight,
  Lock,
  Globe,
  Radio,
  DollarSign,
  TrendingUp,
  Cpu,
  Store,
  BookOpen,
  Filter,
} from "lucide-react";

export interface AgentDevPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletState: Web3WalletState;
  apiCredentials: AgentApiCredential[];
  arbitrageLedger: ArbitrageLedgerEntry[];
  onGenerateApiKey: (tier?: "DEVELOPER_SANDBOX" | "ENTERPRISE_QUANTUM") => AgentApiCredential;
  onRecordArbitrageSavings: (params: {
    agentId: string;
    merchantStore: string;
    dealItem: string;
    originalPriceZar: number;
    negotiatedPriceZar: number;
    settlementChain?: ChainNetwork;
  }) => ArbitrageLedgerEntry;
  initialTab?: "all" | "tokens" | "ledger" | "playground" | "guide";
  isPageMode?: boolean;
}

type DevPortalTab = "all" | "tokens" | "ledger" | "playground" | "guide";

export function AgentDevPortalModal({
  isOpen,
  onClose,
  walletState,
  apiCredentials,
  arbitrageLedger,
  onGenerateApiKey,
  onRecordArbitrageSavings,
  initialTab = "all",
  isPageMode = false,
}: AgentDevPortalModalProps) {
  const [activeTab, setActiveTab] = useState<DevPortalTab>(initialTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Playground simulation states
  const [simAgentType, setSimAgentType] = useState<"Muse-ZA (Aggressive)" | "Nibble-ZA (Value)">(
    "Muse-ZA (Aggressive)",
  );
  const [simStore, setSimStore] = useState<string>("Zara Fashion Sandton");
  const [simDealItem, setSimDealItem] = useState<string>("Urban Wool Trench Coat");
  const [simOriginalPrice, setSimOriginalPrice] = useState<number>(1899);
  const [simTargetDiscount, setSimTargetDiscount] = useState<number>(45);
  const [simSimulatingBot, setSimSimulatingBot] = useState(false);
  const [simSettlementChain, setSimSettlementChain] = useState<ChainNetwork>("base");
  const [lastSimResult, setLastSimResult] = useState<ArbitrageLedgerEntry | null>(null);
  const [simLogs, setSimLogs] = useState<string[]>([
    "Agent bot daemon initialized. Standing by for corridor beacons...",
  ]);

  // How-To Guide subtab
  const [activeGuideTab, setActiveGuideTab] = useState<"websocket" | "a2a" | "bitchat" | "shopify">(
    "websocket",
  );

  // Copy helper
  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Run Bot Negotiation Simulation
  const handleExecuteBotNegotiation = () => {
    setSimSimulatingBot(true);
    const ts = new Date().toLocaleTimeString();
    setSimLogs((prev) => [
      `[${ts}] 📡 Subscribed to Sandton Level 1 North corridor (beacon: BEAC-SANDTON-01-N)`,
      `[${ts}] ⚡ Detected proximity: 14.2m from ${simStore}`,
      `[${ts}] 🤖 ${simAgentType} dispatched counter-offer: ${simTargetDiscount}% discount on ${simDealItem}`,
      ...prev.slice(0, 8),
    ]);

    setTimeout(() => {
      const negotiatedPrice = Math.round(simOriginalPrice * (1 - simTargetDiscount / 100));
      const entry = onRecordArbitrageSavings({
        agentId:
          simAgentType === "Muse-ZA (Aggressive)" ? "bot-muse-za-live" : "bot-nibble-za-live",
        merchantStore: simStore,
        dealItem: simDealItem,
        originalPriceZar: simOriginalPrice,
        negotiatedPriceZar: negotiatedPrice,
        settlementChain: simSettlementChain,
      });
      setLastSimResult(entry);
      setSimSimulatingBot(false);

      const confirmTs = new Date().toLocaleTimeString();
      setSimLogs((prev) => [
        `[${confirmTs}] ✅ Counter-offer ACCEPTED by merchant! R${entry.totalValueSavedZar} saved ($${entry.totalValueSavedUsdc.toFixed(2)} USDC)`,
        `[${confirmTs}] 🪙 1.5% Arbitrage Protocol Toll: $${entry.arbitrageFeeCollectedUsdc.toFixed(2)} USDC locked on ${simSettlementChain.toUpperCase()}`,
        `[${confirmTs}] 🔒 Biometric passkey voucher generated and signed for handoff`,
        ...prev.slice(0, 10),
      ]);
    }, 700);
  };

  // Ledger stats
  const totalArbitrageCollected = useMemo(() => {
    return arbitrageLedger.reduce((acc, curr) => acc + curr.arbitrageFeeCollectedUsdc, 0);
  }, [arbitrageLedger]);

  const totalValueSavedByAgents = useMemo(() => {
    return arbitrageLedger.reduce((acc, curr) => acc + curr.totalValueSavedUsdc, 0);
  }, [arbitrageLedger]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={
        isPageMode
          ? "min-h-screen w-full bg-slate-950 flex flex-col items-center justify-start p-3 sm:p-6 lg:p-8 animate-in fade-in duration-200"
          : "fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      }
    >
      <div
        className={
          isPageMode
            ? "relative w-full max-w-6xl flex flex-col rounded-3xl bg-slate-950 border border-teal-500/40 shadow-[0_0_60px_rgba(20,184,166,0.2)] overflow-hidden text-slate-100"
            : "relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-950 border border-teal-500/40 shadow-[0_0_60px_rgba(20,184,166,0.2)] overflow-hidden text-slate-100"
        }
      >
        {/* Top Gradient Ambient Accent */}
        <div className="absolute top-0 left-1/4 w-1/2 h-24 bg-gradient-to-r from-teal-500/20 via-emerald-500/20 to-indigo-500/20 blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 sm:p-6 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/40 text-teal-300">
              <Terminal className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                  Autocomm Agent API &amp; Developer Hub
                </h2>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[10px] font-mono font-bold">
                  v3.2 Live
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Agent API Tokens, 1.5% Arbitrage Protocol Toll Ledger, Live Negotiation Playground
                &amp; Integration Guides
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Quick Stats Pill */}
            <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400">1.5% Tolls: </span>
                <strong className="text-teal-300">${totalArbitrageCollected.toFixed(2)}</strong>
              </div>
              <div className="h-3 w-px bg-slate-800" />
              <div>
                <span className="text-[10px] text-slate-400">Saved: </span>
                <strong className="text-emerald-300">${totalValueSavedByAgents.toFixed(2)}</strong>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
              aria-label="Close Developer Portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation */}
        <div className="relative z-10 px-5 pt-3 border-b border-slate-800 bg-slate-900/40 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: "all", label: "Full Dashboard", icon: Layers },
            {
              id: "tokens",
              label: "Agent API Tokens",
              icon: Terminal,
              badge: `${apiCredentials.length}`,
            },
            {
              id: "ledger",
              label: "1.5% Arbitrage Ledger",
              icon: Activity,
              badge: `${arbitrageLedger.length}`,
            },
            { id: "playground", label: "Live Demo Playground", icon: Play },
            { id: "guide", label: "Technical How-To Guides", icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as DevPortalTab)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-bold font-mono transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? "bg-slate-950 text-teal-300 border-teal-400 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/60"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${isSelected ? "text-teal-400" : "text-slate-400"}`}
                />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${
                      isSelected ? "bg-teal-500/20 text-teal-300" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-8 flex-1">
          {/* ====================================================================
              1. AGENT API TOKENS SECTION
             ==================================================================== */}
          {(activeTab === "all" || activeTab === "tokens") && (
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-teal-500/10 text-teal-300 border border-teal-500/30">
                    <Terminal className="w-4 h-4 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-white">
                      Agent API Tokens &amp; Credentials
                    </h3>
                    <p className="text-xs text-slate-400">
                      Provision programmatic Bearer keys for autonomous agent shopping bots, quant
                      trading fleets, and corridor scanners.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onGenerateApiKey("DEVELOPER_SANDBOX")}
                    className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold font-mono transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>+ Generate Sandbox Key ($49/mo)</span>
                  </button>
                  <button
                    onClick={() => onGenerateApiKey("ENTERPRISE_QUANTUM")}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-300 border border-teal-500/40 text-xs font-bold font-mono transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>+ Enterprise (0% Toll)</span>
                  </button>
                </div>
              </div>

              {/* API Credentials Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {apiCredentials.map((cred) => (
                  <div
                    key={cred.id}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 font-mono text-xs hover:border-teal-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-teal-300 text-xs">{cred.tier}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                          {cred.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        Arbitrage Toll: {cred.arbitrageFeeRate * 100}%
                      </span>
                    </div>

                    {/* API Key Box */}
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="truncate max-w-[260px] sm:max-w-xs text-slate-300 font-mono">
                        {cred.apiKey}
                      </div>
                      <button
                        onClick={() => handleCopyText(cred.apiKey, cred.id)}
                        className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Copy API Key"
                      >
                        {copiedKey === cred.id ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Secret & Endpoint */}
                    <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
                      <span className="truncate">Secret: {cred.apiSecret}</span>
                      <button
                        onClick={() => handleCopyText(cred.apiSecret, `sec-${cred.id}`)}
                        className="text-slate-500 hover:text-slate-300 text-[9px] underline cursor-pointer"
                      >
                        {copiedKey === `sec-${cred.id}` ? "Copied" : "Copy Secret"}
                      </button>
                    </div>

                    {/* Metric Bars */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800/80">
                      <div className="space-y-0.5">
                        <span className="text-slate-400 text-[10px] block">Corridor Ticks:</span>
                        <span className="font-bold text-white">
                          {cred.totalCorridorTicksUsed.toLocaleString()}
                          {cred.totalTicksLimit !== "unlimited" &&
                            ` / ${cred.totalTicksLimit.toLocaleString()}`}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-slate-400 text-[10px] block">
                          1.5% Arbitrage Tolls:
                        </span>
                        <span className="font-bold text-teal-300">
                          ${cred.protocolArbitrageFeesCollectedUsdc.toFixed(2)} USDC
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick cURL Snippet */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 font-mono text-[11px] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="truncate text-slate-300">
                  <span className="text-teal-400 font-bold">Base Endpoint: </span>
                  <code className="text-slate-400">
                    wss://grid.autocom.network/v1/stream?token=
                    {apiCredentials[0]?.apiKey || "ac_live_sandbox"}
                  </code>
                </div>
                <button
                  onClick={() =>
                    handleCopyText(
                      `curl -H "Authorization: Bearer ${apiCredentials[0]?.apiKey || "ac_live_sandbox"}" https://grid.autocom.network/v1/corridor/sandton_city`,
                      "curl-snip",
                    )
                  }
                  className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === "curl-snip" ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>Copy cURL</span>
                </button>
              </div>
            </section>
          )}

          {/* ====================================================================
              2. 1.5% ARBITRAGE PROTOCOL FEE LEDGER SECTION
             ==================================================================== */}
          {(activeTab === "all" || activeTab === "ledger") && (
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    <Activity className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-white">
                        1.5% Arbitrage Protocol Fee Ledger (Web3 On-Chain)
                      </h3>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Real-time immutable ledger of agent-negotiated deal spreads and 1.5% protocol
                      toll settlements.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/30 text-emerald-300">
                    <span className="text-[10px] text-slate-400 block">Total Tolls:</span>
                    <strong>${totalArbitrageCollected.toFixed(2)} USDC</strong>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-teal-500/30 text-teal-300">
                    <span className="text-[10px] text-slate-400 block">Total Saved:</span>
                    <strong>${totalValueSavedByAgents.toFixed(2)} USDC</strong>
                  </div>
                </div>
              </div>

              {/* Ledger Table */}
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden font-mono text-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-950 border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">TX Hash &amp; Agent</th>
                        <th className="py-3 px-4">Merchant &amp; Deal Item</th>
                        <th className="py-3 px-4">Pricing Spread</th>
                        <th className="py-3 px-4">Value Saved</th>
                        <th className="py-3 px-4 text-right">1.5% Autocomm Toll</th>
                        <th className="py-3 px-4 text-center">Settlement Rail</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {arbitrageLedger.map((entry) => (
                        <tr key={entry.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <p className="font-bold text-teal-300">{entry.agentId}</p>
                            <span className="text-[9.5px] text-slate-500 truncate max-w-[100px] block">
                              {entry.txHash}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-white">{entry.merchantStore}</p>
                            <p className="text-[10px] text-slate-400">{entry.dealItem}</p>
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            <span className="line-through text-slate-500 text-[10px]">
                              R{entry.originalPriceZar}
                            </span>
                            <span className="ml-1.5 font-bold text-white">
                              R{entry.negotiatedPriceZar}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-emerald-400 font-bold">
                            +R{entry.totalValueSavedZar}{" "}
                            <span className="text-[10px] text-emerald-300/80 font-normal">
                              (${entry.totalValueSavedUsdc.toFixed(2)})
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-extrabold text-teal-300">
                            ${entry.arbitrageFeeCollectedUsdc.toFixed(2)} USDC
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-700 text-[9px] uppercase font-bold text-slate-300">
                              {entry.settlementChain}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* ====================================================================
              3. LIVE DEMO PLAYGROUND SECTION
             ==================================================================== */}
          {(activeTab === "all" || activeTab === "playground") && (
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-teal-500/10 text-teal-300 border border-teal-500/30">
                    <Play className="w-4 h-4 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-white">
                      Live Demo Playground: Autonomous Agent Negotiation &amp; 1.5% Toll Split
                    </h3>
                    <p className="text-xs text-slate-400">
                      Simulate machine-to-machine deal counter-offers, calculate live 1.5% protocol
                      toll distributions, and log to the on-chain ledger.
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-mono font-bold border border-teal-500/40">
                  Interactive Simulation
                </span>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-teal-500/40 space-y-5 font-mono text-xs shadow-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                      Agent Bot Model
                    </label>
                    <select
                      value={simAgentType}
                      onChange={(e) =>
                        setSimAgentType(
                          e.target.value as "Muse-ZA (Aggressive)" | "Nibble-ZA (Value)",
                        )
                      }
                      className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500 cursor-pointer"
                    >
                      <option value="Muse-ZA (Aggressive)">
                        Muse-ZA (Aggressive / High-Velocity)
                      </option>
                      <option value="Nibble-ZA (Value)">
                        Nibble-ZA (Value-Maxing / Micro-Spread)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                      Target Merchant Store
                    </label>
                    <select
                      value={simStore}
                      onChange={(e) => {
                        setSimStore(e.target.value);
                        if (e.target.value.includes("Zara"))
                          setSimDealItem("Urban Wool Trench Coat");
                        else if (e.target.value.includes("Starbucks"))
                          setSimDealItem("Venti Blonde Roast & Pastry");
                        else if (e.target.value.includes("Nike"))
                          setSimDealItem("Air Zoom Alphafly Pro");
                        else setSimDealItem("Smart Wireless Noise-Cancelling Buds");
                      }}
                      className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500 cursor-pointer"
                    >
                      <option value="Zara Fashion Sandton">Zara Fashion Sandton</option>
                      <option value="Starbucks Reserve Gateway">Starbucks Reserve Gateway</option>
                      <option value="Nike Flagship V&A">Nike Flagship V&A</option>
                      <option value="iStore Tech Corridor">iStore Tech Corridor</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                      Original Price (ZAR)
                    </label>
                    <input
                      type="number"
                      value={simOriginalPrice}
                      onChange={(e) => setSimOriginalPrice(Math.max(50, Number(e.target.value)))}
                      className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold flex justify-between">
                      <span>Target Discount:</span>
                      <strong className="text-teal-400">{simTargetDiscount}%</strong>
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="65"
                      value={simTargetDiscount}
                      onChange={(e) => setSimTargetDiscount(Number(e.target.value))}
                      className="mt-2 w-full accent-teal-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Simulation Action Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-800">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={handleExecuteBotNegotiation}
                      disabled={simSimulatingBot}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {simSimulatingBot ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4" />
                      )}
                      <span>Simulate Autonomous Negotiation</span>
                    </button>

                    <div className="hidden sm:flex items-center gap-1.5 text-slate-400 text-[10px]">
                      <span>Rail:</span>
                      <select
                        value={simSettlementChain}
                        onChange={(e) => setSimSettlementChain(e.target.value as ChainNetwork)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-teal-300 text-[10px] outline-none"
                      >
                        <option value="base">Base Sepolia</option>
                        <option value="abstract">Abstract Mainnet</option>
                        <option value="arbitrum">Arbitrum One</option>
                      </select>
                    </div>
                  </div>

                  {lastSimResult && (
                    <div className="w-full sm:w-auto p-3 rounded-xl bg-slate-950 border border-emerald-500/40 text-xs text-slate-300 flex flex-wrap items-center gap-3">
                      <span>
                        Negotiated:{" "}
                        <strong className="text-white">R{lastSimResult.negotiatedPriceZar}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Saved:{" "}
                        <strong className="text-emerald-400">
                          +R{lastSimResult.totalValueSavedZar}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>
                        1.5% Autocomm Toll:{" "}
                        <strong className="text-teal-300">
                          ${lastSimResult.arbitrageFeeCollectedUsdc} USDC
                        </strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Simulation Terminal Log Stream */}
                <div className="mt-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-800/80 pb-1 mb-2">
                    <span className="flex items-center gap-1">
                      <Terminal className="w-3 h-3 text-teal-400" />
                      <span>Live Simulation Telemetry Log</span>
                    </span>
                    <span>Sub-Meter Corridor Active</span>
                  </div>
                  {simLogs.slice(0, 5).map((log, idx) => (
                    <p
                      key={idx}
                      className={
                        idx === 0 ? "text-teal-300 font-semibold" : "text-slate-400 text-[10.5px]"
                      }
                    >
                      {log}
                    </p>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ====================================================================
              4. HOW-TO GUIDE SECTION
             ==================================================================== */}
          {(activeTab === "all" || activeTab === "guide") && (
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-white">
                      Technical How-To Guides: Autonomous Agent &amp; Node Integration
                    </h3>
                    <p className="text-xs text-slate-400">
                      Step-by-step developer documentation for connecting bots over Web3 WebSockets,
                      subscribing to beacons, and processing micro-deals.
                    </p>
                  </div>
                </div>

                {/* Guide Sub-Tabs */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono">
                  <button
                    onClick={() => setActiveGuideTab("websocket")}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      activeGuideTab === "websocket"
                        ? "bg-teal-500/20 text-teal-300 font-bold border border-teal-500/40"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    1. WebSocket Stream
                  </button>
                  <button
                    onClick={() => setActiveGuideTab("a2a")}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      activeGuideTab === "a2a"
                        ? "bg-teal-500/20 text-teal-300 font-bold border border-teal-500/40"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    2. A2A Negotiation
                  </button>
                  <button
                    onClick={() => setActiveGuideTab("bitchat")}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      activeGuideTab === "bitchat"
                        ? "bg-teal-500/20 text-teal-300 font-bold border border-teal-500/40"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    3. BitChat BLE Mesh
                  </button>
                  <button
                    onClick={() => setActiveGuideTab("shopify")}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      activeGuideTab === "shopify"
                        ? "bg-teal-500/20 text-teal-300 font-bold border border-teal-500/40"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    4. Shopify Sync
                  </button>
                </div>
              </div>

              {/* Guide Code Content */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
                {activeGuideTab === "websocket" && (
                  <>
                    <div className="flex items-center justify-between text-teal-400 font-bold">
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4" />
                        <span>How-To Guide: Connecting Your Autonomous Agent via WebSockets</span>
                      </div>
                      <button
                        onClick={() =>
                          handleCopyText(
                            `const ws = new WebSocket("wss://grid.autocom.network/v1/stream?token=${apiCredentials[0]?.apiKey || "ac_live_sandbox"}");\n\nws.onopen = () => {\n  ws.send(JSON.stringify({\n    action: "SUBSCRIBE_CORRIDOR",\n    mallId: "sandton_city",\n    corridorId: "level1_north",\n    beaconRadiusMeters: 35,\n    agentModel: "MUSE_ZA_V3"\n  }));\n};`,
                            "code-ws",
                          )
                        }
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === "code-ws" ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>Copy Code</span>
                      </button>
                    </div>
                    <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
                      {`// 1. Initialize WebSocket connection to the Autocomm Grid Engine
const ws = new WebSocket("wss://grid.autocom.network/v1/stream?token=${apiCredentials[0]?.apiKey || "ac_live_sandbox"}");

ws.onopen = () => {
  // Subscribe to sub-meter corridor ticks in Sandton City Mall
  ws.send(JSON.stringify({
    action: "SUBSCRIBE_CORRIDOR",
    mallId: "sandton_city",
    corridorId: "level1_north",
    beaconRadiusMeters: 35,
    agentModel: "MUSE_ZA_V3"
  }));
};

// 2. Handle live spatial micro-deal negotiation payloads
ws.onmessage = (event) => {
  const deal = JSON.parse(event.data);
  if (deal.type === "DEAL_PAYLOAD_AVAILABLE") {
    // Autonomous counter-offer negotiation
    const counterOfferZar = deal.originalPriceZar * 0.55;
    ws.send(JSON.stringify({
      action: "SUBMIT_COUNTER_OFFER",
      dealId: deal.id,
      proposedPriceZar: counterOfferZar,
      settlementToken: "USDC",
      chain: "base"
    }));
  }
};`}
                    </pre>
                  </>
                )}

                {activeGuideTab === "a2a" && (
                  <>
                    <div className="flex items-center justify-between text-teal-400 font-bold">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4" />
                        <span>
                          How-To Guide: Machine-to-Machine (A2A) Deal Settlement &amp; 1.5% Toll
                          Split
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          handleCopyText(
                            `// Execute on-chain split on Base / Arbitrum\nconst tx = await autoComContract.settleNegotiatedDeal(\n  dealId,\n  merchantAddress,\n  negotiatedAmountUsdc,\n  protocolFeeUsdc // 1.5% of saved value\n);`,
                            "code-a2a",
                          )
                        }
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === "code-a2a" ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>Copy Code</span>
                      </button>
                    </div>
                    <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
                      {`// 1. Calculate the 1.5% Protocol Toll on saved discount
const savedAmountZar = originalPriceZar - negotiatedPriceZar;
const savedAmountUsdc = savedAmountZar / 18.2;
const protocolTollUsdc = savedAmountUsdc * 0.015; // 1.5% toll slice

// 2. Transact on-chain over Base or Arbitrum Smart Contract
const receipt = await autoComEscrow.executeDealSettlement({
  dealId: "deal-zara-8910",
  agentSigner: userPasskeySigner,
  merchantWallet: "0x897a...90f2",
  finalPriceUsdc: negotiatedPriceZar / 18.2,
  protocolTollUsdc: protocolTollUsdc,
  chain: "base-sepolia"
});

console.log("Settlement Hash:", receipt.transactionHash);`}
                    </pre>
                  </>
                )}

                {activeGuideTab === "bitchat" && (
                  <>
                    <div className="flex items-center justify-between text-teal-400 font-bold">
                      <div className="flex items-center gap-2">
                        <Radio className="w-4 h-4" />
                        <span>
                          How-To Guide: Nostr NIP-04 Signing over BitChat BLE Mesh (Off-Grid
                          Handoffs)
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          handleCopyText(
                            `import { signEvent } from "nostr-tools";\n// Offline P2P payload signing over BLE mesh\nconst event = signEvent({ kind: 4, content: "DEAL_VOUCHER_ENCRYPTED", tags: [["p", merchantPubkey]] }, privKey);`,
                            "code-mesh",
                          )
                        }
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === "code-mesh" ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>Copy Code</span>
                      </button>
                    </div>
                    <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
                      {`// Operates down in underground parking basements and tunnel grid blackouts
import { BitchatMeshNode } from "@autocom/bitchat-ble";

const node = new BitchatMeshNode({ channel: "za_sandton_mesh" });

// Broadcast signed Nostr deal voucher over Bluetooth Low Energy
node.broadcastDealVoucher({
  dealId: "deal-coffee-771",
  nostrSignature: "npub1...signed_proof",
  offlineRedemptionPin: "AC-4981",
  expiresInSeconds: 300
});`}
                    </pre>
                  </>
                )}

                {activeGuideTab === "shopify" && (
                  <>
                    <div className="flex items-center justify-between text-teal-400 font-bold">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4" />
                        <span>
                          How-To Guide: Syncing Shopify Inventory to Sub-Meter Indoor Nodes
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          handleCopyText(
                            `POST /api/v1/shopify/sync-spatial-matrix\nHeaders: { "X-Autocomm-Key": "${apiCredentials[0]?.apiKey || "ac_live_sandbox"}" }\nBody: {\n  "shopUrl": "flagship.myshopify.com",\n  "corridorNode": "level1_north_passage"\n}`,
                            "code-shopify",
                          )
                        }
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === "code-shopify" ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>Copy Code</span>
                      </button>
                    </div>
                    <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
                      {`POST /api/v1/shopify/sync-spatial-matrix
Headers: {
  "Authorization": "Bearer ${apiCredentials[0]?.apiKey || "ac_live_sandbox"}",
  "Content-Type": "application/json"
}
Body: {
  "shopUrl": "sandton-flagship.myshopify.com",
  "storeCoordinates": {
    "mallId": "sandton_city_mall",
    "corridorNode": "level1_north_passage",
    "beaconUuid": "BEAC-SANDTON-01-N"
  },
  "enableDynamicElasticity": true
}`}
                    </pre>
                  </>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>Connected to Autocomm Decentralized Grid API · Sandton Mesh Gateway</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
