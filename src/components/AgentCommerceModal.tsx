import { useState, useEffect, useRef } from "react";
import {
  AIBot,
  UserProfile,
  ProductItem,
  NegotiationLog,
  AgentTransaction,
  DEFAULT_CONSUMER_BOT,
  DEFAULT_MERCHANT_BOT,
  getStoredA2AProfile,
  saveA2AProfile,
  getStoredA2ATransactions,
  saveA2ATransaction,
  updateA2ATransactionStatus,
  runAgentNegotiation,
} from "@/lib/agent-commerce";
import type { Store, BoughtItem } from "@/lib/acn-data";

interface AgentCommerceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { name?: string; displayName?: string } | null;
  availableStores: Store[];
  onClaimItem: (boughtItem: BoughtItem) => void;
}

export function AgentCommerceModal({
  isOpen,
  onClose,
  currentUser,
  availableStores,
  onClaimItem,
}: AgentCommerceModalProps) {
  // User & Bot Profile
  const [profile, setProfile] = useState<UserProfile>(() =>
    getStoredA2AProfile(currentUser?.displayName || currentUser?.name || "Gugu"),
  );

  // Available sample/store products
  const defaultProducts: ProductItem[] = [
    {
      id: "prod_sneakers_01",
      title: "Limited Edition Local Sneakers",
      originalPriceZAR: 1200,
      merchantId: "merch_threads_braam",
      category: "Apparel",
      stockLevel: 8,
    },
    {
      id: "prod_coffee_02",
      title: "Artisan Single-Origin Espresso (Batch)",
      originalPriceZAR: 320,
      merchantId: "merch_roastery_za",
      category: "Beverage",
      stockLevel: 25,
    },
    {
      id: "prod_hoodie_03",
      title: "Streetwear Cyber Techwear Hoodie",
      originalPriceZAR: 850,
      merchantId: "merch_downtown_fashion",
      category: "Apparel",
      stockLevel: 14,
    },
    {
      id: "prod_tech_04",
      title: "Noise-Canceling Spatial Wireless Earbuds",
      originalPriceZAR: 1500,
      merchantId: "merch_electro_hub",
      category: "Electronics",
      stockLevel: 5,
    },
  ];

  // Merge with live stores from the 3D Radar
  const allProducts: ProductItem[] = [
    ...availableStores.map((s) => ({
      id: `store_prod_${s.id}`,
      title: `${s.item} (${s.name})`,
      originalPriceZAR: s.open,
      merchantId: s.id,
      category: s.category,
      stockLevel: 10 + (s.open % 15),
      storeRef: s,
    })),
    ...defaultProducts,
  ];

  const [selectedProduct, setSelectedProduct] = useState<ProductItem>(allProducts[0]);
  const [merchantBot, setMerchantBot] = useState<AIBot>(DEFAULT_MERCHANT_BOT);

  // Negotiation state
  const [logs, setLogs] = useState<NegotiationLog[]>([]);
  const [negotiating, setNegotiating] = useState<boolean>(false);
  const [settledPrice, setSettledPrice] = useState<number | null>(null);
  const [settledTradeoff, setSettledTradeoff] = useState<string | null>(null);
  const [negotiationFailed, setNegotiationFailed] = useState<string | null>(null);

  // Settlement & Payment state
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [awaitingBankApproval, setAwaitingBankApproval] = useState<boolean>(false);
  const [currentTx, setCurrentTx] = useState<AgentTransaction | null>(null);
  const [topUpModalOpen, setTopUpModalOpen] = useState<boolean>(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(500);
  const [recentTransactions, setRecentTransactions] = useState<AgentTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<"negotiate" | "settings" | "transactions">(
    "negotiate",
  );

  const cancelNegotiationRef = useRef<(() => void) | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Sync profile when current user changes
  useEffect(() => {
    if (currentUser?.displayName || currentUser?.name) {
      const newName = currentUser.displayName || currentUser.name || "Gugu";
      setProfile((prev) => {
        if (prev.name === newName) return prev;
        const updated = { ...prev, name: newName };
        saveA2AProfile(updated);
        return updated;
      });
    }
  }, [currentUser]);

  // Load transactions
  useEffect(() => {
    setRecentTransactions(getStoredA2ATransactions());
  }, [isOpen]);

  // Scroll logs automatically
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Handle Strategy Parameter Updates
  const handleUpdateTargetDiscount = (val: number) => {
    const updated: UserProfile = {
      ...profile,
      allocatedBot: {
        ...profile.allocatedBot,
        parameters: {
          ...profile.allocatedBot.parameters,
          targetDiscount: val,
        },
      },
    };
    setProfile(updated);
    saveA2AProfile(updated);
  };

  const handleUpdateCeiling = (val: number) => {
    const updated: UserProfile = {
      ...profile,
      allocatedBot: {
        ...profile.allocatedBot,
        parameters: {
          ...profile.allocatedBot.parameters,
          absoluteCeiling: val,
        },
      },
    };
    setProfile(updated);
    saveA2AProfile(updated);
  };

  const handleUpdatePaymentPreference = (pref: "A" | "B") => {
    const updated: UserProfile = {
      ...profile,
      paymentPreference: pref,
    };
    setProfile(updated);
    saveA2AProfile(updated);
  };

  // Start Autonomous M2M Negotiation
  const handleStartNegotiation = () => {
    if (negotiating) return;
    setLogs([]);
    setSettledPrice(null);
    setSettledTradeoff(null);
    setNegotiationFailed(null);
    setNegotiating(true);

    if (cancelNegotiationRef.current) {
      cancelNegotiationRef.current();
    }

    const cancel = runAgentNegotiation(
      selectedProduct,
      profile.allocatedBot,
      merchantBot,
      {
        onLog: (newLog) => {
          setLogs((prev) => [...prev, newLog]);
        },
        onSuccess: (finalPrice, tradeOff) => {
          setSettledPrice(finalPrice);
          setSettledTradeoff(tradeOff);
          setNegotiating(false);
          if (typeof navigator !== "undefined" && "vibrate" in navigator) {
            navigator.vibrate?.([40, 60, 100]);
          }
        },
        onFail: (reason) => {
          setNegotiationFailed(reason);
          setNegotiating(false);
          if (typeof navigator !== "undefined" && "vibrate" in navigator) {
            navigator.vibrate?.([80, 50, 80]);
          }
        },
      },
      1100,
    );

    cancelNegotiationRef.current = cancel;
  };

  // Top Up Wallet (Option A Fund Flow)
  const handleTopUpWallet = (amount: number) => {
    const newBalance = profile.walletBalance + amount;
    const updated = { ...profile, walletBalance: newBalance };
    setProfile(updated);
    saveA2AProfile(updated);
    setTopUpModalOpen(false);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.([30, 50]);
    }
  };

  // Execute Clearance & Settlement
  const handleExecuteClearance = () => {
    if (!settledPrice) return;
    setIsProcessingPayment(true);

    const txId = `TX-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const token = `AUTOCOM-${selectedProduct.title.slice(0, 4).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${new Date().getFullYear()}`;
    const discountPercent = Math.round(
      ((selectedProduct.originalPriceZAR - settledPrice) / selectedProduct.originalPriceZAR) * 100,
    );

    // -----------------------------------------------------------------
    // OPTION A: PRE-FUNDED APP WALLET (Instant zero-latency debit)
    // -----------------------------------------------------------------
    if (profile.paymentPreference === "A") {
      if (profile.walletBalance < settledPrice) {
        setIsProcessingPayment(false);
        setTopUpModalOpen(true);
        return;
      }

      // Debit ledger balance immediately
      const newBalance = profile.walletBalance - settledPrice;
      const updatedProfile = { ...profile, walletBalance: newBalance };
      setProfile(updatedProfile);
      saveA2AProfile(updatedProfile);

      const newTx: AgentTransaction = {
        id: txId,
        type: "Wallet",
        userId: profile.id,
        merchantId: selectedProduct.merchantId,
        amountZAR: settledPrice,
        productTitle: selectedProduct.title,
        status: "COMPLETED",
        qrToken: token,
        timestamp: Date.now(),
        negotiatedDiscountPercent: discountPercent,
        originalPriceZAR: selectedProduct.originalPriceZAR,
      };

      saveA2ATransaction(newTx);
      setCurrentTx(newTx);
      setRecentTransactions((prev) => [newTx, ...prev]);
      setIsProcessingPayment(false);

      // Create voucher into Claimed Bag
      const bought: BoughtItem = {
        id: `bought_${Date.now()}_${txId}`,
        store: selectedProduct.storeRef || {
          id: selectedProduct.merchantId,
          name: selectedProduct.title.split("(")[0].trim(),
          bearing: 0,
          dist: 25,
          icon: "🛍️",
          category: selectedProduct.category,
          open: selectedProduct.originalPriceZAR,
          color: "oklch(0.8 0.17 70)",
          item: selectedProduct.title,
        },
        item: selectedProduct.title,
        price: settledPrice,
        open: selectedProduct.originalPriceZAR,
        boughtAt: Date.now(),
        qrToken: token,
      };
      onClaimItem(bought);

      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate?.([60, 40, 100]);
      }
    }

    // -----------------------------------------------------------------
    // OPTION B: DIRECT MOBILE PAYMENT LINK / PAYSHAP / CAPITEC PAY
    // -----------------------------------------------------------------
    else {
      const stitchReqId = `stitch_${Math.random().toString(36).slice(2, 10)}`;
      const pendingTx: AgentTransaction = {
        id: txId,
        type: "Direct_Pay",
        userId: profile.id,
        merchantId: selectedProduct.merchantId,
        amountZAR: settledPrice,
        productTitle: selectedProduct.title,
        status: "PENDING_USER_APPROVAL",
        stitchId: stitchReqId,
        qrToken: token,
        timestamp: Date.now(),
        negotiatedDiscountPercent: discountPercent,
        originalPriceZAR: selectedProduct.originalPriceZAR,
      };

      saveA2ATransaction(pendingTx);
      setCurrentTx(pendingTx);
      setRecentTransactions((prev) => [pendingTx, ...prev]);
      setAwaitingBankApproval(true);

      // Simulate Real-Time PayShap Push & Bank Webhook Resolution (2.8s)
      setTimeout(() => {
        updateA2ATransactionStatus(txId, "COMPLETED");
        setRecentTransactions((prev) =>
          prev.map((t) => (t.id === txId ? { ...t, status: "COMPLETED" } : t)),
        );
        setAwaitingBankApproval(false);
        setIsProcessingPayment(false);

        // Claim and dispatch item
        const bought: BoughtItem = {
          id: `bought_${Date.now()}_${txId}`,
          store: selectedProduct.storeRef || {
            id: selectedProduct.merchantId,
            name: selectedProduct.title.split("(")[0].trim(),
            bearing: 0,
            dist: 25,
            icon: "🛍️",
            category: selectedProduct.category,
            open: selectedProduct.originalPriceZAR,
            color: "oklch(0.8 0.17 70)",
            item: selectedProduct.title,
          },
          item: selectedProduct.title,
          price: settledPrice,
          open: selectedProduct.originalPriceZAR,
          boughtAt: Date.now(),
          qrToken: token,
        };
        onClaimItem(bought);

        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate?.([50, 30, 90]);
        }
      }, 2600);
    }
  };

  // Reversal / In-App Refund Trigger
  const handleRefundTransaction = (tx: AgentTransaction) => {
    if (tx.status === "REFUNDED") return;

    if (tx.type === "Wallet") {
      const restored = profile.walletBalance + tx.amountZAR;
      const updated = { ...profile, walletBalance: restored };
      setProfile(updated);
      saveA2AProfile(updated);
    }

    updateA2ATransactionStatus(tx.id, "REFUNDED");
    setRecentTransactions((prev) =>
      prev.map((t) => (t.id === tx.id ? { ...t, status: "REFUNDED" } : t)),
    );

    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.([40, 60]);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Agent-to-Agent Commerce Core Hub"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-xl animate-fade-in"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#090d19]/98 border border-white/20 shadow-2xl backdrop-blur-2xl overflow-hidden ring-1 ring-white/10 text-foreground">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/5 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-9 w-9 rounded-2xl items-center justify-center bg-primary/20 text-primary border border-primary/40 font-black text-lg shrink-0">
              🤖
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white truncate">
                  Agent-to-Agent (A2A) Commerce Core
                </h2>
                <span className="rounded-full bg-primary/20 text-primary border border-primary/40 font-mono text-[9px] px-2 py-0.5 font-bold uppercase shrink-0">
                  M2M Live
                </span>
              </div>
              <p className="text-[11px] font-mono text-muted-foreground truncate">
                Autonomous M2M Negotiator & South African ZAR Settlement Rails (Stitch / PayShap)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Wallet Quick Pill */}
            <button
              onClick={() => setTopUpModalOpen(true)}
              className="glass hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono text-primary hover:border-primary/80 transition-colors cursor-pointer"
              title="Click to top up your pre-funded wallet"
            >
              <span>💳</span>
              <span>R{profile.walletBalance.toFixed(2)}</span>
              <span className="text-[10px] text-accent font-bold">＋ Top Up</span>
            </button>

            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-colors text-sm cursor-pointer"
              aria-label="Close A2A Hub"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-white/10 bg-black/20 text-xs font-mono shrink-0">
          <button
            onClick={() => setActiveTab("negotiate")}
            className={`px-3.5 py-2 rounded-t-xl font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === "negotiate"
                ? "border-primary text-primary bg-primary/10"
                : "border-transparent text-muted-foreground hover:text-white"
            }`}
          >
            ⚡ Live Negotiation & Bargaining
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-3.5 py-2 rounded-t-xl font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === "settings"
                ? "border-primary text-primary bg-primary/10"
                : "border-transparent text-muted-foreground hover:text-white"
            }`}
          >
            ⚙️ Bot Strategy & Payment Rails
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={`px-3.5 py-2 rounded-t-xl font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === "transactions"
                ? "border-primary text-primary bg-primary/10"
                : "border-transparent text-muted-foreground hover:text-white"
            }`}
          >
            <span>📜 Clearances & Vouchers</span>
            {recentTransactions.length > 0 && (
              <span className="rounded-full bg-accent/30 text-accent font-mono text-[9px] px-1.5 py-0.2">
                {recentTransactions.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: LIVE NEGOTIATION */}
          {activeTab === "negotiate" && (
            <div className="space-y-6">
              {/* Profile Overview Bar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Consumer Bot Card */}
                <div className="glass p-3.5 sm:p-4 rounded-2xl border border-primary/30 bg-primary/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
                      Onboarded Consumer Agent
                    </span>
                    <span className="rounded-md bg-primary/20 text-primary font-mono text-[9px] px-1.5 py-0.5 font-bold">
                      {profile.paymentPreference === "A"
                        ? "Option A: Wallet"
                        : "Option B: Direct Pay"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🤖</span>
                    <div>
                      <h4 className="font-bold text-white text-sm">{profile.allocatedBot.name}</h4>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        User: {profile.name} · Ceiling: R
                        {profile.allocatedBot.parameters.absoluteCeiling}
                      </p>
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/10 text-[11px] font-mono text-gray-300">
                    Strategy:{" "}
                    <span className="text-primary font-bold">
                      {((profile.allocatedBot.parameters.targetDiscount ?? 0.25) * 100).toFixed(0)}%
                      Target Discount
                    </span>{" "}
                    | BATNA Hard Anchoring
                  </div>
                </div>

                {/* Merchant Bot Card */}
                <div className="glass p-3.5 sm:p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                      Onboarded Merchant Agent
                    </span>
                    <span className="rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[9px] px-1.5 py-0.5 font-bold">
                      Store Shield
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏪</span>
                    <div>
                      <h4 className="font-bold text-white text-sm">{merchantBot.name}</h4>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        Merchant: {selectedProduct.merchantId}
                      </p>
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/10 text-[11px] font-mono text-gray-300">
                    Constraint:{" "}
                    <span className="text-emerald-400 font-bold">
                      {((merchantBot.parameters.maxDiscountAllowed ?? 0.2) * 100).toFixed(0)}% Max
                      Margin Floor
                    </span>{" "}
                    | Programmatic Protection
                  </div>
                </div>
              </div>

              {/* Product Selection & Negotiation Trigger */}
              <div className="glass p-4 sm:p-5 rounded-2xl border border-white/20 bg-white/5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
                      Select Store Item for M2M Bargaining
                    </label>
                    <select
                      value={selectedProduct.id}
                      onChange={(e) => {
                        const found = allProducts.find((p) => p.id === e.target.value);
                        if (found) {
                          setSelectedProduct(found);
                          setSettledPrice(null);
                          setLogs([]);
                        }
                      }}
                      className="glass font-mono text-xs text-white rounded-xl px-3 py-2 border border-white/20 bg-[#090d19] focus:outline-none focus:border-primary w-full sm:w-80 cursor-pointer"
                    >
                      {allProducts.map((p) => (
                        <option key={p.id} value={p.id} className="bg-[#090d19] text-white">
                          {p.title} — R{p.originalPriceZAR}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-[10px] font-mono text-muted-foreground">
                        Original Listed Price
                      </p>
                      <p className="text-lg font-mono font-black text-rose-400 line-through">
                        R{selectedProduct.originalPriceZAR.toFixed(2)}
                      </p>
                    </div>

                    <button
                      onClick={handleStartNegotiation}
                      disabled={negotiating}
                      className={`px-5 py-2.5 rounded-2xl font-mono text-xs font-bold text-white transition-all shadow-xl cursor-pointer flex items-center gap-2 ${
                        negotiating
                          ? "bg-muted cursor-not-allowed opacity-60"
                          : "bg-gradient-to-r from-primary to-teal-400 text-black hover:opacity-95 shadow-teal active:scale-95"
                      }`}
                    >
                      {negotiating ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          <span>Agents Bargaining...</span>
                        </>
                      ) : (
                        <>
                          <span>⚡</span>
                          <span>Deploy Bots to Negotiate</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Real-time M2M Stream Feed */}
              <div className="rounded-2xl border border-white/20 bg-[#050811] p-4 font-mono text-xs overflow-hidden flex flex-col">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10 text-[10px] text-accent font-bold">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                    </span>
                    <span>// ACTIVE A2A (AGENT-TO-AGENT) MACHINE STREAM</span>
                  </div>
                  <span className="text-muted-foreground font-normal">
                    Protocol: MCP / Model Context Protocol v2
                  </span>
                </div>

                <div className="h-64 overflow-y-auto space-y-2.5 pr-1 scrollbar-none">
                  {logs.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center p-4">
                      <span className="text-3xl mb-2 opacity-50">🤖🤝🏪</span>
                      <p className="text-xs">No active agent negotiation stream.</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">
                        Click "Deploy Bots to Negotiate" to watch Muse-ZA and Nibble-ZA argue over
                        margins and settlement terms in real time.
                      </p>
                    </div>
                  )}

                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-2.5 rounded-xl border leading-relaxed animate-fade-in ${
                        log.sender === "consumer_bot"
                          ? "bg-primary/10 border-primary/30 text-primary-foreground"
                          : log.sender === "merchant_bot"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                            : "bg-white/5 border-white/15 text-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[9px] text-muted-foreground mb-1">
                        <span className="font-bold uppercase tracking-wider">
                          {log.sender === "consumer_bot"
                            ? `🔵 ${profile.allocatedBot.name}`
                            : log.sender === "merchant_bot"
                              ? `🟢 ${merchantBot.name}`
                              : "⚙️ AUTOCOM MESH ENGINE"}
                        </span>
                        <div className="flex items-center gap-2">
                          {log.telemetryMetric && (
                            <span className="text-accent font-semibold">{log.telemetryMetric}</span>
                          )}
                          <span>[{log.timestamp}]</span>
                        </div>
                      </div>
                      <p className="text-[11.5px] text-white">{log.message}</p>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              </div>

              {/* Settlement Confirmation & Instant Clearance Action Box */}
              {settledPrice !== null && (
                <div className="glass p-5 rounded-3xl border-2 border-accent bg-accent/15 shadow-amber animate-scale-in space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <span className="rounded-full bg-accent text-accent-foreground font-mono text-[9px] font-black px-2.5 py-0.5 uppercase tracking-wider">
                        🎉 Parameter Alignment Succeeded
                      </span>
                      <h3 className="text-lg font-black text-white mt-1">
                        Final Negotiated Rate: R{settledPrice.toFixed(2)}
                      </h3>
                      <p className="text-xs text-accent font-mono">
                        Saved R{(selectedProduct.originalPriceZAR - settledPrice).toFixed(2)} (-
                        {Math.round(
                          ((selectedProduct.originalPriceZAR - settledPrice) /
                            selectedProduct.originalPriceZAR) *
                            100,
                        )}
                        % discount from R{selectedProduct.originalPriceZAR})
                      </p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        onClick={handleExecuteClearance}
                        disabled={isProcessingPayment}
                        className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-accent text-accent-foreground font-mono text-xs font-black hover:bg-accent/90 shadow-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shrink-0"
                      >
                        {isProcessingPayment ? (
                          <>
                            <span className="animate-spin">⏳</span>
                            <span>Settling Rails...</span>
                          </>
                        ) : (
                          <>
                            <span>💳</span>
                            <span>
                              {profile.paymentPreference === "A"
                                ? `Clear via Wallet (R${settledPrice.toFixed(2)})`
                                : `PayShap Request-to-Pay (R${settledPrice.toFixed(2)})`}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Negotiation Failed Box */}
              {negotiationFailed && (
                <div className="glass p-4 rounded-2xl border border-rose-500/50 bg-rose-500/10 text-rose-300 text-xs font-mono space-y-2">
                  <p className="font-bold">❌ Walkaway Triggered:</p>
                  <p>{negotiationFailed}</p>
                  <p className="text-[10px] text-muted-foreground">
                    Try adjusting your target discount ceiling in Settings tab or select a different
                    store product.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BOT STRATEGY & PAYMENT SETTLEMENT RAILS */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              {/* Payment Rail Toggle Switch (Option A vs Option B) */}
              <div className="glass p-5 rounded-2xl border border-white/20 bg-white/5 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🇿🇦</span>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Agent Settlement Method (South Africa Rails)
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      Configure how your autonomous agent clears payments with merchant stores
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Option A Card */}
                  <div
                    onClick={() => handleUpdatePaymentPreference("A")}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                      profile.paymentPreference === "A"
                        ? "border-primary bg-primary/15 shadow-teal ring-2 ring-primary/40"
                        : "border-white/15 bg-black/30 hover:border-white/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                            profile.paymentPreference === "A"
                              ? "border-primary bg-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {profile.paymentPreference === "A" && (
                            <span className="h-1.5 w-1.5 rounded-full bg-black" />
                          )}
                        </span>
                        <h4 className="text-xs font-bold text-white">
                          OPTION A: Pre-funded App Wallet
                        </h4>
                      </div>
                      <span className="rounded-full bg-primary/20 text-primary font-mono text-[9px] px-2 py-0.5 font-bold">
                        Zero-Latency
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 font-mono text-xs flex items-center justify-between">
                      <span className="text-muted-foreground">Current Balance:</span>
                      <span className="font-bold text-white text-sm">
                        R{profile.walletBalance.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-[11px] text-primary leading-relaxed font-mono">
                      👉 "Let my agent buy and clear instantly without bothering me or interrupting
                      phone screens."
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTopUpModalOpen(true);
                      }}
                      className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-[11px] font-bold transition-all border border-white/20"
                    >
                      ＋ Top Up Wallet via Stitch Cash-In
                    </button>
                  </div>

                  {/* Option B Card */}
                  <div
                    onClick={() => handleUpdatePaymentPreference("B")}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                      profile.paymentPreference === "B"
                        ? "border-accent bg-accent/15 shadow-amber ring-2 ring-accent/40"
                        : "border-white/15 bg-black/30 hover:border-white/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                            profile.paymentPreference === "B"
                              ? "border-accent bg-accent"
                              : "border-muted-foreground"
                          }`}
                        >
                          {profile.paymentPreference === "B" && (
                            <span className="h-1.5 w-1.5 rounded-full bg-black" />
                          )}
                        </span>
                        <h4 className="text-xs font-bold text-white">
                          OPTION B: Direct Mobile PayShap Link
                        </h4>
                      </div>
                      <span className="rounded-full bg-accent/20 text-accent font-mono text-[9px] px-2 py-0.5 font-bold">
                        Biometric Prompt
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 font-mono text-xs flex items-center justify-between">
                      <span className="text-muted-foreground">Linked Provider:</span>
                      <span className="font-bold text-accent">Stitch / Capitec Pay / PayShap</span>
                    </div>
                    <p className="text-[11px] text-accent leading-relaxed font-mono">
                      👉 "My agent must ping my banking app with a push prompt to manually approve
                      each deal."
                    </p>
                  </div>
                </div>
              </div>

              {/* Bot Strategy Controls */}
              <div className="glass p-5 rounded-2xl border border-white/20 bg-white/5 space-y-5">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider text-primary">
                  Consumer Bot Strategy: {profile.allocatedBot.name}
                </h3>

                <div className="space-y-4 font-mono text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-muted-foreground">Target Discount Goal</span>
                      <span className="font-bold text-primary">
                        {((profile.allocatedBot.parameters.targetDiscount ?? 0.25) * 100).toFixed(
                          0,
                        )}
                        % Off
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.05}
                      max={0.5}
                      step={0.05}
                      value={profile.allocatedBot.parameters.targetDiscount ?? 0.25}
                      onChange={(e) => handleUpdateTargetDiscount(parseFloat(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                      <span>5% (Gentle)</span>
                      <span>25% (Standard)</span>
                      <span>50% (Aggressive BATNA)</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-muted-foreground">Absolute Wallet Budget Ceiling</span>
                      <span className="font-bold text-accent">
                        R{profile.allocatedBot.parameters.absoluteCeiling ?? 1500}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={200}
                      max={4000}
                      step={100}
                      value={profile.allocatedBot.parameters.absoluteCeiling ?? 1500}
                      onChange={(e) => handleUpdateCeiling(parseInt(e.target.value, 10))}
                      className="w-full accent-accent cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRANSACTIONS & REVERSAL LOOP */}
          {activeTab === "transactions" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white font-mono">
                  Agent Transaction Ledger & Settlement Tokens
                </h3>
                <span className="text-xs font-mono text-muted-foreground">
                  {recentTransactions.length} Recorded Clearances
                </span>
              </div>

              {recentTransactions.length === 0 ? (
                <div className="glass p-8 rounded-2xl border border-white/10 text-center text-muted-foreground font-mono text-xs">
                  No clearance transactions yet. Run an A2A negotiation to execute your first
                  autonomous deal.
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="glass p-4 rounded-2xl border border-white/15 bg-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{tx.productTitle}</span>
                          <span
                            className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                              tx.status === "COMPLETED"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                : tx.status === "REFUNDED"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                  : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                            }`}
                          >
                            {tx.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          ID: {tx.id} · Token: {tx.qrToken} · Rail:{" "}
                          {tx.type === "Wallet" ? "Option A (Wallet)" : "Option B (PayShap)"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">
                            R{tx.amountZAR.toFixed(2)}
                          </p>
                          <p className="text-[9px] text-muted-foreground">
                            -{tx.negotiatedDiscountPercent}%
                          </p>
                        </div>

                        {tx.status === "COMPLETED" && (
                          <button
                            onClick={() => handleRefundTransaction(tx)}
                            className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-rose-500/20 hover:border-rose-500/40 text-muted-foreground hover:text-rose-300 border border-white/20 transition-all text-[10px] cursor-pointer"
                            title="Trigger In-App Reversal / Refund Loop"
                          >
                            ↩️ Reversal
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* TOP UP MODAL (Option A Cash-In) */}
        {topUpModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="glass p-6 rounded-3xl border border-primary/40 bg-[#090d19] w-full max-w-sm space-y-4 shadow-teal font-mono text-xs">
              <h3 className="text-base font-bold text-white">💳 Top Up App Wallet</h3>
              <p className="text-muted-foreground text-[11px]">
                Pre-fund your autonomous agent wallet via Stitch Instant EFT / Capitec Pay for
                zero-latency checkout.
              </p>

              <div className="grid grid-cols-3 gap-2">
                {[200, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setTopUpAmount(amt)}
                    className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                      topUpAmount === amt
                        ? "bg-primary text-black border-primary"
                        : "bg-white/5 border-white/15 text-white hover:bg-white/10"
                    }`}
                  >
                    R{amt}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setTopUpModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 text-muted-foreground hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleTopUpWallet(topUpAmount)}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-black font-bold shadow-teal cursor-pointer"
                >
                  Deposit R{topUpAmount}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* OPTION B ASYNC BANK POLLING MODAL */}
        {awaitingBankApproval && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
            <div className="glass p-6 rounded-3xl border border-accent bg-[#0c101c] w-full max-w-md space-y-4 text-center shadow-amber font-mono">
              <div className="flex justify-center">
                <span className="relative flex h-14 w-14">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex rounded-full h-14 w-14 bg-accent/20 border border-accent items-center justify-center text-2xl">
                    📲
                  </span>
                </span>
              </div>
              <h3 className="text-base font-bold text-white">
                Waiting for Mobile Banking App Biometric Approval...
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Stitch & PayShap request dispatched to your mobile device. Please authorize with
                Face ID / Biometrics in your Capitec, Standard Bank, or FNB app.
              </p>
              <div className="p-3 rounded-2xl bg-black/50 border border-white/10 text-accent text-[11px] font-bold">
                ⚡ The moment you approve, merchant staff will start packing your items instantly!
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
