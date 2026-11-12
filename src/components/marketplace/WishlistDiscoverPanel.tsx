import { useState, useMemo, useCallback } from "react";
import { Search, Plus, Check, X, Loader2, Store, Globe, BadgePercent } from "lucide-react";
import { getAllMallStores } from "@/lib/malls";
import { searchChannel3Products, type Channel3Product } from "@/services/channel3Service";
import type { IntentWishlistItem } from "@/types/autocom";

export type WishlistDiscoverPayload = Omit<IntentWishlistItem, "id" | "status" | "createdAt">;

interface WishlistDiscoverPanelProps {
  wishlist: IntentWishlistItem[];
  onAdd: (item: WishlistDiscoverPayload) => void;
}

interface DiscoverCard {
  key: string;
  title: string;
  location: string;
  category: string;
  priceZAR: number;
  originalPriceZAR: number;
  discountPercent: number;
  image: string;
  inStock: boolean;
  online: boolean;
  payload: WishlistDiscoverPayload;
}

interface InventoryEntry {
  key: string;
  name: string;
  category: string;
  storeName: string;
  priceZAR: number;
  originalPriceZAR: number;
  discountPercent: number;
  image: string;
  inStock: boolean;
}

function collectInventory(): InventoryEntry[] {
  const entries: InventoryEntry[] = [];
  for (const store of getAllMallStores()) {
    for (const product of store.products ?? []) {
      entries.push({
        key: `store-${store.id}-${product.id}`,
        name: product.name,
        category: product.category,
        storeName: store.name,
        priceZAR: product.priceZAR,
        originalPriceZAR: product.originalPriceZAR,
        discountPercent: product.discountPercent,
        image: product.image,
        inStock: product.inStock,
      });
    }
  }
  return entries;
}

function normalize(value: string): string {
  return value.toLowerCase().trim();
}

function matchesQuery(haystack: string, tokens: string[]): boolean {
  const hay = normalize(haystack);
  return tokens.every((token) => hay.includes(token));
}

function inventoryToCard(entry: InventoryEntry): DiscoverCard {
  return {
    key: entry.key,
    title: entry.name,
    location: entry.storeName,
    category: entry.category,
    priceZAR: entry.priceZAR,
    originalPriceZAR: entry.originalPriceZAR,
    discountPercent: entry.discountPercent,
    image: entry.image,
    inStock: entry.inStock,
    online: false,
    payload: {
      title: entry.name,
      category: entry.category,
      targetBrand: entry.storeName,
      minDiscountPercent: entry.discountPercent > 0 ? entry.discountPercent : 15,
      maxPriceZar: entry.priceZAR,
      autoExecute: true,
    },
  };
}

function channel3ToCard(product: Channel3Product): DiscoverCard {
  return {
    key: `online-${product.id}`,
    title: product.title,
    location: product.retailer,
    category: product.category,
    priceZAR: product.priceZAR,
    originalPriceZAR: product.originalPriceZAR,
    discountPercent: product.maxNegotiationDiscount,
    image: product.imageUrl,
    inStock: product.inStock,
    online: true,
    payload: {
      title: product.title,
      category: product.category,
      targetBrand: product.brand,
      minDiscountPercent: product.maxNegotiationDiscount || 15,
      maxPriceZar: product.priceZAR,
      autoExecute: true,
    },
  };
}

/**
 * Searchable product discovery for the wishlist: autofill suggestions plus
 * one-click add cards from in-mall inventory and Channel3 online results.
 */
export function WishlistDiscoverPanel({ wishlist, onAdd }: WishlistDiscoverPanelProps) {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [onlineResults, setOnlineResults] = useState<Channel3Product[]>([]);
  const [onlineLive, setOnlineLive] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [addedKeys, setAddedKeys] = useState<Set<string>>(new Set());

  const inventory = useMemo(() => collectInventory(), []);
  const wishlistTitles = useMemo(
    () => new Set(wishlist.map((w) => normalize(w.title))),
    [wishlist],
  );

  const tokens = useMemo(() => normalize(query).split(/\s+/).filter(Boolean), [query]);

  // Autofill suggestions from local inventory only: instant, no network.
  const suggestions = useMemo(() => {
    if (tokens.length === 0) return [];
    return inventory
      .filter((entry) => matchesQuery(`${entry.name} ${entry.storeName} ${entry.category}`, tokens))
      .slice(0, 6);
  }, [inventory, tokens]);

  const submittedTokens = useMemo(
    () => (submittedQuery ?? "").toLowerCase().split(/\s+/).filter(Boolean),
    [submittedQuery],
  );

  const localCards = useMemo<DiscoverCard[]>(() => {
    if (submittedTokens.length === 0) {
      // Browse mode: most-discounted in-stock inventory first.
      return [...inventory]
        .filter((entry) => entry.inStock)
        .sort((a, b) => b.discountPercent - a.discountPercent)
        .slice(0, 6)
        .map(inventoryToCard);
    }
    return inventory
      .filter((entry) =>
        matchesQuery(`${entry.name} ${entry.storeName} ${entry.category}`, submittedTokens),
      )
      .slice(0, 12)
      .map(inventoryToCard);
  }, [inventory, submittedTokens]);

  // Merge online results after in-store cards, dropping title duplicates.
  const cards = useMemo<DiscoverCard[]>(() => {
    const seen = new Set(localCards.map((card) => normalize(card.title)));
    const merged = [...localCards];
    for (const product of onlineResults) {
      if (!seen.has(normalize(product.title))) {
        seen.add(normalize(product.title));
        merged.push(channel3ToCard(product));
      }
    }
    return merged;
  }, [localCards, onlineResults]);

  const runSearch = useCallback(async (rawQuery: string) => {
    const trimmed = rawQuery.trim();
    setSuggestionsOpen(false);
    setSubmittedQuery(trimmed.length > 0 ? trimmed : null);
    setOnlineResults([]);
    setSearchError(null);
    if (trimmed.length === 0) return;
    setIsSearching(true);
    try {
      const response = await searchChannel3Products(trimmed, { limit: 8 });
      setOnlineResults(response.results);
      setOnlineLive(response.source === "channel3_live_api");
    } catch {
      setSearchError("Online search unavailable — showing in-store inventory.");
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleAdd = useCallback(
    (card: DiscoverCard) => {
      onAdd(card.payload);
      setAddedKeys((prev) => new Set(prev).add(card.key));
    },
    [onAdd],
  );

  const isAdded = useCallback(
    (card: DiscoverCard) => addedKeys.has(card.key) || wishlistTitles.has(normalize(card.title)),
    [addedKeys, wishlistTitles],
  );

  return (
    <div className="space-y-3">
      {/* Search + autofill */}
      <div className="relative">
        {suggestionsOpen && suggestions.length > 0 && (
          <div
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setSuggestionsOpen(false)}
            aria-hidden="true"
          />
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void runSearch(query);
          }}
          className="relative z-20 flex items-center gap-2"
        >
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSuggestionsOpen(true);
              }}
              onFocus={() => setSuggestionsOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setSuggestionsOpen(false);
              }}
              placeholder="Search inventory & online stores to add…"
              aria-label="Search products to add to wishlist"
              className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-amber-500 min-h-[42px]"
            />
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSuggestionsOpen(false);
                  void runSearch("");
                }}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 cursor-pointer touch-manipulation"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-400 disabled:opacity-60 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer touch-manipulation min-h-[42px] shrink-0 flex items-center gap-1.5"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span className="hidden min-[420px]:inline">Search</span>
          </button>
        </form>

        {/* Autofill suggestion dropdown */}
        {suggestionsOpen && suggestions.length > 0 && (
          <div className="scroll-y-touch absolute z-20 left-0 right-0 top-full mt-1.5 max-h-64 overflow-y-auto overscroll-contain rounded-xl bg-slate-900 border border-slate-700 shadow-2xl divide-y divide-slate-800">
            {suggestions.map((entry) => {
              const card = inventoryToCard(entry);
              const added = isAdded(card);
              return (
                <div
                  key={entry.key}
                  className="flex items-center gap-2.5 p-2 hover:bg-slate-800/60 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setQuery(entry.name);
                      void runSearch(entry.name);
                    }}
                    className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer"
                  >
                    {entry.image ? (
                      <img
                        src={entry.image}
                        alt=""
                        loading="lazy"
                        className="w-9 h-9 rounded-lg object-cover bg-slate-800 shrink-0"
                      />
                    ) : (
                      <span className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-sm shrink-0">
                        🛍️
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-bold text-white truncate">
                        {entry.name}
                      </span>
                      <span className="block text-[10px] font-mono text-slate-400 truncate">
                        {entry.storeName} · R{entry.priceZAR.toLocaleString()}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdd(card)}
                    disabled={added}
                    aria-label={
                      added ? `${entry.name} already in wishlist` : `Add ${entry.name} to wishlist`
                    }
                    className={`p-2 rounded-lg transition-colors cursor-pointer touch-manipulation shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center ${
                      added
                        ? "text-emerald-400 bg-emerald-500/10 cursor-default"
                        : "text-amber-300 bg-amber-500/15 hover:bg-amber-500/30 active:bg-amber-500/30"
                    }`}
                  >
                    {added ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Results heading */}
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <h4 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-1.5">
          <BadgePercent className="w-3.5 h-3.5 text-amber-400" />
          {submittedQuery ? `Results for "${submittedQuery}"` : "Popular in-store deals"}
        </h4>
        <span className="text-[10px] font-mono text-slate-500">
          {submittedQuery && onlineLive
            ? "In-store + live online results"
            : submittedQuery
              ? "In-store inventory"
              : `${inventory.length} items searchable`}
        </span>
      </div>

      {searchError && <p className="text-[11px] font-mono text-amber-300/90">{searchError}</p>}

      {/* Product cards */}
      {cards.length === 0 && !isSearching ? (
        <div className="text-center py-6 space-y-1.5 rounded-2xl border border-dashed border-slate-700">
          <p className="text-xs font-bold text-slate-300">No matching products found</p>
          <p className="text-[11px] text-slate-500">
            Try fewer keywords, or add a custom intent below.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-2.5">
          {cards.map((card) => {
            const added = isAdded(card);
            return (
              <div
                key={card.key}
                className="flex gap-2.5 p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all min-w-0"
              >
                {card.image ? (
                  <img
                    src={card.image}
                    alt=""
                    loading="lazy"
                    className="w-16 h-16 rounded-xl object-cover bg-slate-800 shrink-0"
                  />
                ) : (
                  <span className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center text-2xl shrink-0">
                    🛍️
                  </span>
                )}
                <div className="min-w-0 flex-1 flex flex-col justify-between gap-1">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white leading-snug line-clamp-2">
                      {card.title}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400 truncate flex items-center gap-1 mt-0.5">
                      {card.online ? (
                        <Globe className="w-3 h-3 text-sky-400 shrink-0" />
                      ) : (
                        <Store className="w-3 h-3 text-emerald-400 shrink-0" />
                      )}
                      <span className="truncate">
                        {card.online ? `Online · ${card.location}` : card.location}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-mono min-w-0">
                      <span className="text-xs font-black text-white">
                        R{card.priceZAR.toLocaleString()}
                      </span>{" "}
                      {card.discountPercent > 0 && (
                        <span className="text-[10px] font-bold text-emerald-400">
                          -{card.discountPercent}%
                        </span>
                      )}
                      {!card.inStock && (
                        <span className="block text-[10px] text-rose-400">Out of stock</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAdd(card)}
                      disabled={added}
                      aria-label={
                        added
                          ? `${card.title} already in wishlist`
                          : `Add ${card.title} to wishlist`
                      }
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer touch-manipulation shrink-0 min-h-[32px] ${
                        added
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 cursor-default"
                          : "bg-amber-500 hover:bg-amber-400 active:bg-amber-400 text-slate-950 shadow-sm active:scale-95"
                      }`}
                    >
                      {added ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
