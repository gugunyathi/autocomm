import { useState } from "react";
import type {
  AutoDebitConfig,
  AutoDebitTier,
  AutoDebitSchedule,
  IntentWishlistItem,
} from "@/types/autocom";
import {
  X,
  CreditCard,
  Target,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  TrendingDown,
  Zap,
  ArrowRight,
} from "lucide-react";

interface AutoWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AutoDebitConfig;
  onUpdateConfig: (updates: Partial<AutoDebitConfig>) => void;
  wishlist: IntentWishlistItem[];
  onAddWishlistItem: (item: Omit<IntentWishlistItem, "id" | "status" | "createdAt">) => void;
  onRemoveWishlistItem: (id: string) => void;
}

export function AutoWalletModal({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  wishlist,
  onAddWishlistItem,
  onRemoveWishlistItem,
}: AutoWalletModalProps) {
  const [activeTab, setActiveTab] = useState<"debit" | "wishlist">("wishlist");
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Sportswear");
  const [newBrand, setNewBrand] = useState("Nike");
  const [newMinDiscount, setNewMinDiscount] = useState(40);
  const [newMaxPrice, setNewMaxPrice] = useState(1500);
  const [newAutoExecute, setNewAutoExecute] = useState(true);
  const [addItemOpen, setAddItemOpen] = useState(false);

  if (!isOpen) return null;

  const handleCreateWishlistItem = (e: React.FormEvent) => {
    e.preventDefault();
    onAddWishlistItem({
      title: newTitle || `${newBrand} ${newCategory}`,
      category: newCategory,
      targetBrand: newBrand,
      minDiscountPercent: newMinDiscount,
      maxPriceZar: newMaxPrice,
      autoExecute: newAutoExecute,
    });
    setNewTitle("");
    setAddItemOpen(false);
  };

  const handleSelectTier = (tier: AutoDebitTier) => {
    onUpdateConfig({ tier });
  };

  const handleSelectSchedule = (schedule: AutoDebitSchedule) => {
    onUpdateConfig({ schedule });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl sm:rounded-3xl bg-slate-950 border border-amber-500/40 shadow-2xl text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 shrink-0 bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-bold text-lg shadow-lg shadow-amber-500/20 shrink-0">
              <CreditCard className="w-5 h-5 text-slate-950" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-extrabold text-white truncate">
                  FinTech Auto-Wallet &amp; Intent Wishlist
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/40 hidden xs:inline">
                  Automated Algorithmic Checkout
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                Recurring debit order pool + autonomous intent wishlist bargaining engine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-3 pb-2 border-b border-slate-800 bg-slate-900/40">
          <button
            onClick={() => setActiveTab("wishlist")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeTab === "wishlist"
                ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Intent Wishlist ({wishlist.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("debit")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeTab === "debit"
                ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Debit Order Tier (R{config.tier})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: INTENT WISHLIST */}
          {activeTab === "wishlist" && (
            <div className="space-y-4">
              {/* Top Banner Stats */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Autonomous Intent Bargaining Engine</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Set target items &amp; required discount thresholds. When an AI agent discovers
                    a qualifying in-store deal, it buys automatically using your debit pool.
                  </p>
                </div>

                <button
                  onClick={() => setAddItemOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Wishlist Intent</span>
                </button>
              </div>

              {/* Wishlist Items List */}
              <div className="space-y-3">
                {wishlist.length === 0 ? (
                  <div className="text-center py-10 space-y-2">
                    <span className="text-3xl">🎯</span>
                    <p className="text-sm font-bold text-slate-300">No Intent Wishlist Items Set</p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Add products you want (e.g. Nike Shoes at 40% off) and your agent will monitor
                      all 50m spatial beacon drops.
                    </p>
                  </div>
                ) : (
                  wishlist.map((w) => (
                    <div
                      key={w.id}
                      className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-white truncate">{w.title}</h4>
                          <span className="px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                            Min {w.minDiscountPercent}% Drop
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                          <span>Max Price: R{w.maxPriceZar}</span>
                          <span>·</span>
                          <span>Category: {w.category}</span>
                          {w.targetBrand && (
                            <>
                              <span>·</span>
                              <span className="text-teal-400 font-bold">
                                Brand: {w.targetBrand}
                              </span>
                            </>
                          )}
                        </div>

                        {w.status === "ACTIVE_SCANNING" ? (
                          <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 pt-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                            <span>
                              🤖 Agent actively scanning spatial mesh &amp; DOOH billboards
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[11px] font-mono text-teal-300 pt-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                            <span>
                              Executed at {w.matchedDeal?.storeName} (-
                              {w.matchedDeal?.discountPercent}% OFF)
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {w.autoExecute && (
                          <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                            ⚡ Auto-Buy ON
                          </span>
                        )}
                        <button
                          onClick={() => onRemoveWishlistItem(w.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: DEBIT ORDER TIER */}
          {activeTab === "debit" && (
            <div className="space-y-5">
              {/* Balance Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-mono text-slate-400 uppercase">
                      Available Auto-Wallet Pool
                    </p>
                    <p className="text-2xl sm:text-3xl font-black text-white font-mono">
                      R{config.autoWalletBalanceZar.toLocaleString()}{" "}
                      <span className="text-sm font-normal text-amber-300">
                        (~${config.autoWalletBalanceUsdc.toFixed(1)} USDC)
                      </span>
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-right font-mono text-xs">
                    <p className="text-slate-500">Bank Debit Mandate</p>
                    <p className="text-slate-200 font-bold">{config.bankAccountMask}</p>
                    <p className="text-[10px] text-emerald-400">Status: Active &amp; Verified</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Next Automated Cycle: {config.nextDebitDate}</span>
                  <span className="text-teal-400 font-bold">
                    Total Automated Savings: R{config.totalAutomatedSavingsZar.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Tier Selection (R200, R500, R1000) */}
              <div className="space-y-3">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                  Select Recurring Debit Allocation Tier
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[200, 500, 1000].map((amount) => {
                    const isSelected = config.tier === amount;
                    return (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => handleSelectTier(amount as AutoDebitTier)}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer space-y-2 relative overflow-hidden ${
                          isSelected
                            ? "bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400"
                            : "bg-slate-900 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-black text-white font-mono">R{amount}</span>
                          {isSelected && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] font-mono">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300">
                          {amount === 200
                            ? "Casual Coffee & Small Retail Drops"
                            : amount === 500
                              ? "Balanced Fashion, Books & Tech Accessories"
                              : "Power Shopper for Footwear & Major Brand Flash Deals"}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Schedule Selection (Weekly vs Monthly) */}
              <div className="space-y-3">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                  Allocation Frequency
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(["weekly", "monthly"] as AutoDebitSchedule[]).map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => handleSelectSchedule(freq)}
                      className={`p-3.5 rounded-xl border text-center font-mono text-xs font-bold capitalize transition-all cursor-pointer ${
                        config.schedule === freq
                          ? "bg-teal-500/20 text-teal-300 border-teal-500"
                          : "bg-slate-900 text-slate-400 border-slate-800"
                      }`}
                    >
                      {freq} Allocation
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Wishlist Item Modal Overlay */}
      {addItemOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/90 backdrop-blur-lg animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-amber-500/50 p-5 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                <span>Add Intent Wishlist Requirement</span>
              </h3>
              <button
                onClick={() => setAddItemOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWishlistItem} className="space-y-3.5">
              <div>
                <label className="text-xs font-mono text-slate-400">
                  Target Product or Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nike Air Max Running Shoes"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-slate-400">Target Brand</label>
                  <input
                    type="text"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-400">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none"
                  >
                    <option value="Sportswear">Sportswear</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Leisure">Leisure &amp; Books</option>
                    <option value="Grocery">Grocery</option>
                    <option value="Health">Health</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-slate-400">
                    Min Discount Target (%)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="90"
                    value={newMinDiscount}
                    onChange={(e) => setNewMinDiscount(Number(e.target.value))}
                    className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-400">Max Price (ZAR)</label>
                  <input
                    type="number"
                    min="100"
                    value={newMaxPrice}
                    onChange={(e) => setNewMaxPrice(Number(e.target.value))}
                    className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-mono text-slate-300 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newAutoExecute}
                  onChange={(e) => setNewAutoExecute(e.target.checked)}
                  className="accent-amber-500 rounded"
                />
                <span>Auto-execute and buy immediately using debited wallet pool</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddItemOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Activate AI Scanning
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
