import React, { useState } from "react";
import {
  Trophy,
  X,
  Radio,
  FileCode,
  DollarSign,
  Download,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Bot,
  Zap,
} from "lucide-react";

import { A2ATransactionAuditLedger } from "./A2ATransactionAuditLedger";
import { AgentLiveStream } from "./AgentLiveStream";
import { A2A_OPENAPI_SPEC_JSON } from "../types/a2aProtocol";
import {
  createAgentTransaction,
  executeVaultedAgentPayment,
  convertZarToUsd,
  ZAR_TO_USD_EXCHANGE_RATE,
} from "../services/paypalService";

export interface PayPalHackathonModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "ag-grid" | "channel3" | "paypal" | "apimatic";
}

export function PayPalHackathonModal({
  isOpen,
  onClose,
  initialTab = "ag-grid",
}: PayPalHackathonModalProps) {
  const [activeTab, setActiveTab] = useState<"ag-grid" | "channel3" | "paypal" | "apimatic">(
    initialTab,
  );

  // Standalone PayPal Sandbox Tester State
  const [testStore, setTestStore] = useState<string>("woolworths-food");
  const [testPriceZar, setTestPriceZar] = useState<number>(220);
  const [testOrderId, setTestOrderId] = useState<string | null>(null);
  const [testTxId, setTestTxId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [stepLog, setStepLog] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleRunPayPalPipeline = async () => {
    setIsProcessing(true);
    setTestOrderId(null);
    setTestTxId(null);
    setStepLog(["[1/3] Initiating A2A bilateral price validation for ZAR " + testPriceZar + "..."]);

    await new Promise((r) => setTimeout(r, 450));
    const usd = convertZarToUsd(testPriceZar);
    setStepLog((prev) => [
      ...prev,
      `[2/3] Converted ZAR ${testPriceZar} to USD $${usd} (Multiplier: ${ZAR_TO_USD_EXCHANGE_RATE}). Creating PayPal Sandbox Order...`,
    ]);

    const order = await createAgentTransaction(testStore, testPriceZar);
    setTestOrderId(order.orderId);

    setStepLog((prev) => [
      ...prev,
      `[2/3] PayPal Order Generated: ${order.orderId}. Executing autonomous Braintree/PayPal Vault payment method...`,
    ]);

    await new Promise((r) => setTimeout(r, 600));
    const capture = await executeVaultedAgentPayment(order.orderId);
    setTestTxId(capture.transactionId);

    setStepLog((prev) => [
      ...prev,
      `[3/3] ✅ Machine Settlement Captured: ${capture.transactionId}. Zero human clicks required.`,
    ]);
    setIsProcessing(false);
  };

  const downloadOpenApiSpec = () => {
    const blob = new Blob([A2A_OPENAPI_SPEC_JSON], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "autocom-a2a-openapi-3.0.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xl animate-fade-in select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-3xl glass border border-primary/40 bg-[#070b14]/95 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header with Hackathon Badge Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-primary/20 via-black to-accent/20 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-400 to-primary flex items-center justify-center shadow-lg text-slate-950 font-black">
                <Trophy className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                    PayPal Hub
                  </h2>
                </div>
                <p className="text-xs text-slate-300 font-sans">
                  AutoCom Spatial Commerce · AG Grid, Channel3, PayPal Sandbox, APIMatic SDKs
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors cursor-pointer shrink-0"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-4 flex items-center gap-1.5 p-1 rounded-2xl bg-black/60 border border-white/10 max-w-full overflow-x-auto">
            <button
              onClick={() => setActiveTab("ag-grid")}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "ag-grid"
                  ? "bg-amber-400 text-slate-950 shadow-md"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              AG Grid A2A Ledger
            </button>

            <button
              onClick={() => setActiveTab("channel3")}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "channel3"
                  ? "bg-red-500 text-white shadow-md"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              Channel3 Live Stream
            </button>

            <button
              onClick={() => setActiveTab("paypal")}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "paypal"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              PayPal Sandbox M2M
            </button>

            <button
              onClick={() => setActiveTab("apimatic")}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "apimatic"
                  ? "bg-purple-500 text-white shadow-md"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              APIMatic OpenAPI Spec
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5">
          {activeTab === "ag-grid" && <A2ATransactionAuditLedger />}

          {activeTab === "channel3" && <AgentLiveStream />}

          {activeTab === "paypal" && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <div className="glass p-5 rounded-2xl border border-primary/30 bg-primary/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-white font-mono flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                      Autonomous PayPal Sandbox Vault Execution Engine
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Simulate machine-to-machine settlement without human clicks once bilateral
                      negotiation thresholds converge.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-primary/20 text-primary border border-primary/30">
                    Braintree Vaulted Delegate
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">
                      Select Outlet
                    </span>
                    <select
                      value={testStore}
                      onChange={(e) => setTestStore(e.target.value)}
                      className="w-full bg-black/80 border border-white/15 rounded-lg p-2 text-xs text-white font-mono"
                    >
                      <option value="woolworths-food">Woolworths Food (Artisan Platter)</option>
                      <option value="zara-fashion">Zara Fashion (Wool Hoodie)</option>
                      <option value="nike-performance">Nike Performance (Air Zoom 40)</option>
                      <option value="istore-apple">iStore Apple (MagSafe Wallet)</option>
                      <option value="clicks-pharmacy">Clicks Pharmacy (Immune Serum)</option>
                      <option value="hm-boutique">H&M Boutique (Linen Blazer)</option>
                      <option value="exclusive-books">Exclusive Books (Hardcover Fiction)</option>
                      <option value="mugg-bean">Mugg & Bean (Giant Muffin)</option>
                    </select>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">
                      Negotiated Price (ZAR)
                    </span>
                    <input
                      type="number"
                      value={testPriceZar}
                      onChange={(e) => setTestPriceZar(Number(e.target.value))}
                      className="w-full bg-black/80 border border-white/15 rounded-lg p-2 text-xs text-white font-mono"
                      min={10}
                      step={10}
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">
                      PayPal Converted (USD)
                    </span>
                    <div className="w-full bg-black/80 border border-white/15 rounded-lg p-2 text-xs text-emerald-400 font-mono font-bold flex items-center justify-between">
                      <span>${convertZarToUsd(testPriceZar).toFixed(2)} USD</span>
                      <span className="text-[9px] text-muted-foreground">@ 0.054 Multiplier</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="text-xs text-muted-foreground font-mono">
                    Zero-click checkout satisfies the Agentic Commerce challenge.
                  </div>
                  <button
                    onClick={handleRunPayPalPipeline}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-teal-400 hover:from-primary/90 text-slate-950 font-mono text-xs font-black shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <Zap className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`} />
                    {isProcessing ? "Executing Vault Loop…" : "Trigger Zero-Click M2M Payment"}
                  </button>
                </div>
              </div>

              {/* Execution Telemetry Log */}
              {stepLog.length > 0 && (
                <div className="p-4 rounded-2xl glass border border-white/15 bg-black/60 space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10 text-muted-foreground text-[10px] uppercase">
                    <span>Autonomous Settlement Dispatcher Output</span>
                    <span className="text-emerald-400 font-bold">Sandbox Verified</span>
                  </div>
                  {stepLog.map((log, idx) => (
                    <div key={idx} className="text-teal-300 leading-relaxed">
                      {log}
                    </div>
                  ))}
                  {testTxId && (
                    <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span className="text-white font-bold">
                          PayPal Sandbox Capture Success:
                        </span>
                        <span className="text-emerald-400">{testTxId}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">Vault Token #771B</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "apimatic" && (
            <div className="space-y-4 max-w-5xl mx-auto">
              <div className="glass p-5 rounded-2xl border border-purple-500/30 bg-purple-950/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-white font-mono flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-purple-400" />
                    APIMatic OpenAPI 3.0.3 Contract
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Production-grade specification for generating SDKs in TypeScript, Python, C#,
                    Java, PHP, and Go.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadOpenApiSpec}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-mono text-xs font-bold shadow-md transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download JSON Spec
                  </button>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/90 p-4">
                <div className="absolute top-3 right-3 text-[10px] font-mono text-muted-foreground px-2 py-0.5 rounded bg-white/10">
                  OpenAPI 3.0.3 · APIMatic Ready
                </div>
                <pre className="max-h-[500px] overflow-auto font-mono text-[11px] text-teal-300 leading-relaxed pr-2">
                  {A2A_OPENAPI_SPEC_JSON}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
