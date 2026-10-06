import { useState } from "react";
import { MARKETPLACE_CATALOGUE } from "@/hooks/useAutoComPayments";
import type { MarketplaceProduct, MarketplaceCategory } from "@/types/autocom";
import {
  X,
  ShoppingBag,
  Cpu,
  Radio,
  Cloud,
  ShieldCheck,
  CreditCard,
  Building2,
  CheckCircle2,
  DollarSign,
  Zap,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface AutoComMarketplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseItem: (
    product: MarketplaceProduct,
    paymentMethod: "USDC" | "ERC-X402" | "ZAR_DEBIT",
  ) => void;
  walletUsdcBalance: number;
}

export function AutoComMarketplaceModal({
  isOpen,
  onClose,
  onPurchaseItem,
  walletUsdcBalance,
}: AutoComMarketplaceModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    "ALL" | "HARDWARE" | "CLOUD" | "FINTECH"
  >("ALL");
  const [purchasedItemId, setPurchasedItemId] = useState<string | null>(null);
  const [checkoutProduct, setCheckoutProduct] = useState<MarketplaceProduct | null>(null);
  const [selectedPayMethod, setSelectedPayMethod] = useState<"USDC" | "ERC-X402" | "ZAR_DEBIT">(
    "USDC",
  );

  if (!isOpen) return null;

  const filtered = MARKETPLACE_CATALOGUE.filter((p) => {
    if (selectedCategory === "ALL") return true;
    if (selectedCategory === "HARDWARE") {
      return (
        p.category === "HARDWARE_BEACON" ||
        p.category === "EDGE_DEVICE" ||
        p.category === "BLUETOOTH_AMPLIFIER"
      );
    }
    if (selectedCategory === "CLOUD") {
      return p.category === "CLOUD_STORAGE";
    }
    if (selectedCategory === "FINTECH") {
      return (
        p.category === "MERCHANT_SUBSCRIPTION" ||
        p.category === "CONSUMER_INSURANCE" ||
        p.category === "BNPL_PLAN" ||
        p.category === "POS_MICRO_LOAN"
      );
    }
    return true;
  });

  const handleConfirmPurchase = () => {
    if (!checkoutProduct) return;
    onPurchaseItem(checkoutProduct, selectedPayMethod);
    setPurchasedItemId(checkoutProduct.id);
    setCheckoutProduct(null);
    setTimeout(() => setPurchasedItemId(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div
        className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl sm:rounded-3xl bg-slate-950 border border-teal-500/40 shadow-2xl text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 shrink-0 bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 text-slate-950 flex items-center justify-center font-bold text-lg shadow-lg shadow-teal-500/20 shrink-0">
              <ShoppingBag className="w-5 h-5 text-slate-950" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-extrabold text-white truncate">
                  AutoCom Hardware &amp; FinTech Store
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-mono border border-teal-500/40 hidden xs:inline">
                  B2B &amp; Consumer Rail
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                Proximity beacons, edge AI nodes, cloud ad hosting &amp; embedded FinTech credit
                rails
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

        {/* Category Tabs */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-3 pb-2 border-b border-slate-800 bg-slate-900/40 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap border ${
              selectedCategory === "ALL"
                ? "bg-teal-500/20 text-teal-300 border-teal-500/50 shadow-sm"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            All Marketplace Items ({MARKETPLACE_CATALOGUE.length})
          </button>
          <button
            onClick={() => setSelectedCategory("HARDWARE")}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap border ${
              selectedCategory === "HARDWARE"
                ? "bg-teal-500/20 text-teal-300 border-teal-500/50 shadow-sm"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            📡 Physical Spatial Hardware (3)
          </button>
          <button
            onClick={() => setSelectedCategory("CLOUD")}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap border ${
              selectedCategory === "CLOUD"
                ? "bg-teal-500/20 text-teal-300 border-teal-500/50 shadow-sm"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            ☁️ Cloud Storage &amp; Pinning (1)
          </button>
          <button
            onClick={() => setSelectedCategory("FINTECH")}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap border ${
              selectedCategory === "FINTECH"
                ? "bg-teal-500/20 text-teal-300 border-teal-500/50 shadow-sm"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            💳 FinTech &amp; Credit Rails (4)
          </button>
        </div>

        {/* Product Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/40 transition-all flex flex-col justify-between overflow-hidden shadow-lg p-4 space-y-3.5 relative"
              >
                {/* Header with Emoji & Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                    {item.iconEmoji}
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-mono font-bold">
                      {item.badge}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-white leading-snug">{item.name}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>

                {/* Specs List */}
                <div className="space-y-1 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  {item.specs.map((spec, i) => (
                    <p
                      key={i}
                      className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 truncate"
                    >
                      <span className="text-teal-400">✓</span>
                      <span>{spec}</span>
                    </p>
                  ))}
                </div>

                {/* Pricing & Checkout Button */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-base font-extrabold text-white font-mono">
                      {item.priceZar === 0 ? "FREE" : `R${item.priceZar.toLocaleString()}`}
                      {item.monthlySubscription && (
                        <span className="text-[10px] text-slate-400 font-normal"> / mo</span>
                      )}
                    </p>
                    {item.priceUsdc > 0 && (
                      <p className="text-[10px] font-mono text-teal-400">
                        (${item.priceUsdc} USDC)
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => setCheckoutProduct(item)}
                    className={`py-2 px-3.5 rounded-xl font-bold text-xs font-mono transition-all flex items-center gap-1 cursor-pointer ${
                      purchasedItemId === item.id
                        ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 font-black"
                        : "bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md shadow-teal-500/20"
                    }`}
                  >
                    {purchasedItemId === item.id ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Purchased!</span>
                      </>
                    ) : (
                      <>
                        <span>Buy Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Checkout Modal Overlay */}
      {checkoutProduct && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/90 backdrop-blur-lg animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-teal-500/50 p-5 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{checkoutProduct.iconEmoji}</span>
                <span>Checkout: {checkoutProduct.name}</span>
              </h3>
              <button
                onClick={() => setCheckoutProduct(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 font-mono">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Item Total:</span>
                <span className="text-white font-bold">
                  R{checkoutProduct.priceZar} (${checkoutProduct.priceUsdc} USDC)
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Network Protocol:</span>
                <span className="text-teal-400">Base Mainnet (8453)</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400">Select Payment Rail</label>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setSelectedPayMethod("USDC")}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 cursor-pointer ${
                    selectedPayMethod === "USDC"
                      ? "bg-teal-500/20 text-teal-300 border-teal-500"
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  <DollarSign className="w-4 h-4 text-teal-400" />
                  <span>Native USDC</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPayMethod("ERC-X402")}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 cursor-pointer ${
                    selectedPayMethod === "ERC-X402"
                      ? "bg-purple-500/20 text-purple-300 border-purple-500"
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span>ERC-X402</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPayMethod("ZAR_DEBIT")}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 cursor-pointer ${
                    selectedPayMethod === "ZAR_DEBIT"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500"
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>Auto-Debit</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCheckoutProduct(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPurchase}
                className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm Purchase</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
