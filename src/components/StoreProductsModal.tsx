import React, { useState } from "react";
import type { Store } from "@/lib/acn-data";
import type { RealProduct } from "@/lib/mall-types";
import { findProductsByStoreId } from "@/lib/malls";
import { X, Search, ShoppingBag, Bookmark, Check, ExternalLink, Zap } from "lucide-react";

interface StoreProductsModalProps {
  store: Store | null;
  isOpen: boolean;
  onClose: () => void;
  onBuyProduct?: (product: RealProduct, store: Store) => void;
  onParkProduct?: (product: RealProduct, store: Store) => void;
}

export const StoreProductsModal: React.FC<StoreProductsModalProps> = ({
  store,
  isOpen,
  onClose,
  onBuyProduct,
  onParkProduct,
}) => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [boughtIds, setBoughtIds] = useState<string[]>([]);
  const [parkedIds, setParkedIds] = useState<string[]>([]);

  if (!isOpen || !store) return null;

  // Retrieve the 8 real products from the store object or via store registry lookup
  const products: RealProduct[] =
    store.products && store.products.length > 0 ? store.products : findProductsByStoreId(store.id);

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBuy = (product: RealProduct) => {
    setBoughtIds((prev) => [...prev, product.id]);
    onBuyProduct?.(product, store);
  };

  const handlePark = (product: RealProduct) => {
    setParkedIds((prev) => [...prev, product.id]);
    onParkProduct?.(product, store);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="store-products-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in p-0 sm:p-4 pointer-events-auto"
      onClick={onClose}
    >
      <div
        className="glass w-full max-w-3xl rounded-t-3xl sm:rounded-3xl border border-primary/40 bg-[#090d19]/98 shadow-2xl p-4 sm:p-6 max-h-[90dvh] sm:max-h-[85dvh] flex flex-col text-white animate-slideup"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Strip */}
        <div className="flex items-start justify-between pb-3 border-b border-white/10 gap-2 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {store.companyLogoSymbol ? (
              <div
                className="px-2.5 py-1 rounded-xl text-xs font-bold tracking-wider shadow-md shrink-0 border border-white/20"
                style={{
                  backgroundColor: store.brandBgColor || "#0f172a",
                  color: store.brandTextColor || "#ffffff",
                }}
              >
                {store.companyLogoSymbol}
              </div>
            ) : (
              <span className="text-3xl shrink-0">{store.icon}</span>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  id="store-products-title"
                  className="text-base sm:text-lg font-extrabold text-white truncate"
                >
                  {store.name}
                </h2>
                <span className="rounded-full bg-primary/20 text-primary border border-primary/40 font-mono text-[9px] px-2 py-0.5 font-bold">
                  8 Real Products
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-300 mt-0.5 truncate">
                <span className="text-accent font-semibold">{store.cat}</span>
                <span>·</span>
                <span>{store.mallName || "Shopping Centre"}</span>
                {store.mallUrl && (
                  <>
                    <span>·</span>
                    <a
                      href={store.mallUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-0.5 font-bold"
                    >
                      <span>Google Maps</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            aria-label="Close Products Modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Promo details banner */}
        {store.promoDetails && (
          <div className="my-2.5 p-2.5 rounded-xl border border-accent/40 bg-accent/10 flex items-center gap-2 text-xs text-amber-200 shrink-0">
            <Zap className="h-4 w-4 text-accent shrink-0" />
            <span className="font-mono text-[11px] leading-tight">{store.promoDetails}</span>
          </div>
        )}

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row gap-2 my-2 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${products.length} products...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-primary transition-all font-mono"
            />
          </div>

          {categories.length > 2 && (
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === c
                      ? "bg-primary text-black font-extrabold shadow-teal"
                      : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Grid (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-3 min-h-0 pt-1">
          {filtered.map((prod) => {
            const isBought = boughtIds.includes(prod.id);
            const isParked = parkedIds.includes(prod.id);

            return (
              <div
                key={prod.id}
                className="rounded-2xl border border-white/15 bg-[#0f1423]/90 hover:border-primary/50 transition-all p-3 flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="relative h-32 w-full rounded-xl overflow-hidden mb-2 border border-white/10 bg-black/40">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    {prod.specialBadge && (
                      <span className="absolute top-1.5 left-1.5 rounded-md bg-accent text-accent-foreground font-mono text-[8px] font-black px-1.5 py-0.5 shadow-sm">
                        ⚡ {prod.specialBadge}
                      </span>
                    )}

                    <span className="absolute top-1.5 right-1.5 rounded-md bg-black/75 backdrop-blur-sm text-emerald-400 border border-emerald-500/30 font-mono text-[8.5px] font-bold px-1.5 py-0.5">
                      SAVE {prod.discountPercent}%
                    </span>

                    <div className="absolute bottom-1.5 left-2 right-2 flex items-baseline justify-between">
                      <span className="font-extrabold text-white text-base font-mono drop-shadow-md">
                        R{prod.priceZAR.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400 line-through font-mono">
                        R{prod.originalPriceZAR.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mb-1">
                    <span className="text-primary font-bold">{prod.category}</span>
                    <span className="text-[8px] opacity-75">SKU: {prod.sku}</span>
                  </div>

                  <h3 className="text-xs font-bold text-white line-clamp-1 group-hover:text-primary transition-colors">
                    {prod.name}
                  </h3>
                  <p className="text-[10px] text-slate-300 line-clamp-2 mt-0.5 leading-snug">
                    {prod.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handlePark(prod)}
                    className={`flex-1 py-1.5 rounded-xl font-mono text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer border ${
                      isParked
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-white/5 hover:bg-white/10 text-white border-white/15 active:scale-95"
                    }`}
                  >
                    <span>🅿️</span>
                    <span>{isParked ? "Parked ✓" : "Park"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleBuy(prod)}
                    className={`flex-1 py-1.5 rounded-xl font-mono text-[10px] font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      isBought
                        ? "bg-emerald-500 text-black shadow-emerald-500/30"
                        : "bg-primary text-black hover:bg-primary/90 active:scale-95 shadow-teal"
                    }`}
                  >
                    {isBought ? (
                      <>
                        <Check className="h-3 w-3 stroke-[3]" />
                        <span>Bought ✓</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="h-3 w-3" />
                        <span>Buy R{prod.priceZAR.toFixed(0)}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
