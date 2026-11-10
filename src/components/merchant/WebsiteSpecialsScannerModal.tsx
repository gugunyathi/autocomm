import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Globe,
  Radio,
  Sparkles,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Tv,
  ArrowRight,
  Plus,
  Send,
  Zap,
  Tag,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  Store,
  ChevronDown,
  Layers,
  Flame,
} from "lucide-react";
import {
  runStoreCrawlerCheck,
  ingestStoreDiscountUrl,
  getStoredCrawledSpecials,
  getDeliveredAgentCards,
  saveDeliveredAgentCards,
  PRESET_WEBSITE_TARGETS,
  type CrawlReport,
  type DeliveredSpecialCard,
  type CrawlLogEntry,
} from "@/services/storeCrawlerService";
import { getStoredUserPersonalAgent } from "@/services/userAgentService";

interface WebsiteSpecialsScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimDeal?: (card: DeliveredSpecialCard) => void;
}

export const WebsiteSpecialsScannerModal: React.FC<WebsiteSpecialsScannerModalProps> = ({
  isOpen,
  onClose,
  onClaimDeal,
}) => {
  const [activeTab, setActiveTab] = useState<"specials" | "ingest" | "logs">("specials");
  const [crawledSpecials, setCrawledSpecials] = useState(getStoredCrawledSpecials());
  const [deliveredCards, setDeliveredCards] =
    useState<DeliveredSpecialCard[]>(getDeliveredAgentCards());
  const [isScanning, setIsScanning] = useState(false);
  const [scanReport, setScanReport] = useState<CrawlReport | null>(null);
  const [recentLogs, setRecentLogs] = useState<CrawlLogEntry[]>([]);

  // Ingest URL form state
  const [urlInput, setUrlInput] = useState(
    "https://www.mrp.com/en_za/black-friday/denim-shorts-buy-2-get-50-off-the-lowest-priced-item",
  );
  const [targetStoreId, setTargetStoreId] = useState("mrprice-blueberry");
  const [discountPercent, setDiscountPercent] = useState(50);
  const [promoTitle, setPromoTitle] = useState(
    "Mr Price Black Friday 50% Off: Buy 2 Denim Shorts, Get 50% Off Lowest Priced Item",
  );
  const [ruleText, setRuleText] = useState(
    "Buy 2 Get 50% Off lowest priced item across Men's, Women's & Kids' Denim Shorts",
  );
  const [mensUrl, setMensUrl] = useState(
    "https://www.mrp.com/en_za/men/clothing/shorts/denim-shorts",
  );
  const [womensUrl, setWomensUrl] = useState(
    "https://www.mrp.com/en_za/women/clothing/shorts/denim-shorts",
  );
  const [kidsUrl, setKidsUrl] = useState("https://www.mrp.com/en_za/kids/clothing/shorts");
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestSuccessMsg, setIngestSuccessMsg] = useState<string | null>(null);

  const activeAgent = getStoredUserPersonalAgent();

  const refreshData = useCallback(() => {
    setCrawledSpecials(getStoredCrawledSpecials());
    setDeliveredCards(getDeliveredAgentCards());
  }, []);

  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen, refreshData]);

  // Handle immediate manual trigger of store crawler
  const handleTriggerCrawl = async () => {
    setIsScanning(true);
    try {
      const report = await runStoreCrawlerCheck();
      setScanReport(report);
      setRecentLogs(report.recentLogs);
      refreshData();
    } finally {
      setIsScanning(false);
    }
  };

  // Handle manual merchant ingest
  const handleIngestUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsIngesting(true);
    setIngestSuccessMsg(null);

    try {
      const target = PRESET_WEBSITE_TARGETS.find((t) => t.storeId === targetStoreId);
      const res = await ingestStoreDiscountUrl({
        url: urlInput,
        storeId: targetStoreId,
        storeName: target?.storeName || "Retail Outlet",
        mallId: target?.mallId || "blueberry-square",
        mallName: target?.mallName || "Blueberry Square Shopping Mall",
        discountPercent,
        promoTitle,
        ruleText,
        departmentLinks: {
          mens: mensUrl || undefined,
          womens: womensUrl || undefined,
          kids: kidsUrl || undefined,
        },
        billboardLocations: target?.billboardLocations || ["M1 North Highway Billboard #4"],
      });

      setIngestSuccessMsg(res.message);
      refreshData();
      setActiveTab("specials");
    } finally {
      setIsIngesting(false);
    }
  };

  const handleClaim = (card: DeliveredSpecialCard) => {
    const updated = deliveredCards.map((c) => (c.id === card.id ? { ...c, isClaimed: true } : c));
    setDeliveredCards(updated);
    saveDeliveredAgentCards(updated);
    onClaimDeal?.(card);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="crawler-modal-title"
      className="fixed inset-0 z-[10001] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200 select-none overflow-hidden"
    >
      <div className="w-full max-w-4xl max-h-[92vh] sm:max-h-[88vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* HEADER */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-slate-950 shadow-md">
              <Globe className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="crawler-modal-title"
                  className="text-base font-bold text-slate-100 flex items-center gap-2"
                >
                  <span>Store Website & Billboard Specials Crawler</span>
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  24/7 Periodic Sync
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Periodically crawls mall store websites (Mr Price, Woolworths, etc.) & roadside DOOH
                billboards and pushes discounts directly to sovereign agents
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTriggerCrawl}
              disabled={isScanning}
              className="py-1.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">
                {isScanning ? "Scanning All Websites..." : "Crawl Websites Now"}
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="px-5 sm:px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("specials")}
              className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "specials"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Delivered Specials</span>
              {deliveredCards.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
                  {deliveredCards.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("ingest")}
              className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "ingest"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Merchant / App Ingest URL</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("logs")}
              className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "logs"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Billboard & Crawler Feed</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 font-mono hidden md:flex items-center gap-2">
            <span>Target Agent:</span>
            <strong className="text-emerald-400 font-bold">
              {activeAgent ? `@${activeAgent.fullName}` : "@default.agent (Auto-Active)"}
            </strong>
          </div>
        </div>

        {/* BODY VIEWPORT */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 sm:p-6 space-y-4">
          {ingestSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{ingestSuccessMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setIngestSuccessMsg(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* TAB 1: DELIVERED SPECIALS & LIVE MR PRICE 50% BLACK FRIDAY */}
          {activeTab === "specials" && (
            <div className="space-y-4">
              {/* FEATURED: MR PRICE 50% BLACK FRIDAY BANNER */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-950/60 via-slate-900 to-slate-950 border border-red-500/40 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-black text-xs tracking-wider shadow">
                      MRP
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-white">
                          Mr Price: Black Friday 50% Off Special
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                          HOT SALE
                        </span>
                      </div>
                      <p className="text-xs text-red-300 font-semibold mt-0.5">
                        Buy 2 Denim Shorts, Get 50% Off Lowest Priced Item
                      </p>
                    </div>
                  </div>

                  <a
                    href="https://www.mrp.com/en_za/black-friday/denim-shorts-buy-2-get-50-off-the-lowest-priced-item"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 rounded-xl bg-red-500 hover:bg-red-400 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow"
                  >
                    <span>View on mrp.com</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* DEPARTMENT DIRECT LINKS (MENS, WOMENS, KIDS) */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 mb-3">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Department Direct Specials Links</span>
                    <span className="text-emerald-400 font-normal">
                      Auto-Parsed by Autocomm Crawler
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <a
                      href="https://www.mrp.com/en_za/men/clothing/shorts/denim-shorts"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-red-500/40 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">👔</span>
                        <div>
                          <div className="text-xs font-bold text-slate-200 group-hover:text-red-400">
                            Men&apos;s Denim Shorts
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Vintage &amp; stretch cuts
                          </div>
                        </div>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-red-400" />
                    </a>

                    <a
                      href="https://www.mrp.com/en_za/women/clothing/shorts/denim-shorts"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-red-500/40 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">👗</span>
                        <div>
                          <div className="text-xs font-bold text-slate-200 group-hover:text-red-400">
                            Women&apos;s Denim Shorts
                          </div>
                          <div className="text-[10px] text-slate-400">High-rise &amp; mom cuts</div>
                        </div>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-red-400" />
                    </a>

                    <a
                      href="https://www.mrp.com/en_za/kids/clothing/shorts"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-red-500/40 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">🧒</span>
                        <div>
                          <div className="text-xs font-bold text-slate-200 group-hover:text-red-400">
                            Kids&apos; Denim Shorts
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Comfort elasticated shorts
                          </div>
                        </div>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-red-400" />
                    </a>
                  </div>
                </div>

                {/* BILLBOARD SYNC BADGE */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Tv className="w-3.5 h-3.5 text-amber-400" />
                    <span>Synchronized with:</span>
                    <span className="font-semibold text-slate-200">
                      M1 North Highway Billboard #4 &amp; Sandton City Tower
                    </span>
                  </div>
                  <div className="text-emerald-400 font-mono text-[11px] font-semibold">
                    ✓ Verified Live on mrp.com
                  </div>
                </div>
              </div>

              {/* LIST OF DELIVERED SPECIAL CARDS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Delivered to Sovereign Shopping Agents ({deliveredCards.length})
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Auto-delivered based on 24/7 background web checks
                  </span>
                </div>

                {deliveredCards.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
                    <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 font-medium">
                      No special cards delivered yet. Click &quot;Crawl Websites Now&quot; above to
                      check all store websites and billboards!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {deliveredCards.map((card) => (
                      <div
                        key={card.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          card.isClaimed
                            ? "bg-slate-950/50 border-slate-800 opacity-75"
                            : "bg-slate-950 border-emerald-500/30 hover:border-emerald-500/60 shadow-lg"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-2">
                            <div
                              className="px-2 py-0.5 rounded text-[10px] font-black tracking-wider"
                              style={{
                                backgroundColor: card.brandBgColor || "#0f172a",
                                color: card.brandTextColor || "#ffffff",
                              }}
                            >
                              {card.brandLogoSymbol || "DEAL"}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white leading-tight">
                                {card.storeName}
                              </div>
                              <div className="text-[10px] text-slate-400">{card.mallName}</div>
                            </div>
                          </div>

                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                            {card.discountPercent}% OFF
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-200 mb-1 leading-snug">
                          {card.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                          {card.subtitle}
                        </p>

                        {/* DEPARTMENT BUTTONS */}
                        {card.departmentLinks && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {card.departmentLinks.mens && (
                              <a
                                href={card.departmentLinks.mens}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="py-1 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[10px] text-slate-300 font-semibold flex items-center gap-1 transition-colors"
                              >
                                <span>Men&apos;s</span>
                                <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                              </a>
                            )}
                            {card.departmentLinks.womens && (
                              <a
                                href={card.departmentLinks.womens}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="py-1 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[10px] text-slate-300 font-semibold flex items-center gap-1 transition-colors"
                              >
                                <span>Women&apos;s</span>
                                <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                              </a>
                            )}
                            {card.departmentLinks.kids && (
                              <a
                                href={card.departmentLinks.kids}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="py-1 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[10px] text-slate-300 font-semibold flex items-center gap-1 transition-colors"
                              >
                                <span>Kids&apos;</span>
                                <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                              </a>
                            )}
                            {card.sourceUrl && (
                              <a
                                href={card.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="py-1 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                              >
                                <span>Store Link</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                          <div className="text-[10px] text-slate-400 truncate">
                            Delivered to:{" "}
                            <strong className="text-emerald-400">{card.deliveredToAgent}</strong>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleClaim(card)}
                            disabled={card.isClaimed}
                            className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                              card.isClaimed
                                ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                                : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md"
                            }`}
                          >
                            {card.isClaimed ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Claimed</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Auto-Claim Deal</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MERCHANT INGEST DISCOUNT URL */}
          {activeTab === "ingest" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">
                    Merchant Discounted URL Ingestion &amp; Agent Broadcast
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Merchants can paste the live URL of their discounted items (e.g. Mr Price Black
                  Friday link) or let the automated periodic crawler check the site. Ingesting
                  updates the store inventory cards and immediately delivers the deal to users&apos;
                  active agents.
                </p>

                <form onSubmit={handleIngestUrl} className="space-y-4">
                  <div>
                    <label
                      htmlFor="ingest-url-input"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                    >
                      Store Discount / Promotion URL
                    </label>
                    <div className="relative">
                      <input
                        id="ingest-url-input"
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://www.mrp.com/en_za/black-friday/..."
                        required
                        className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl py-2.5 pl-3.5 pr-10 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none"
                      />
                      <ExternalLink className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="ingest-store-select"
                        className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                      >
                        Target Mall Retail Store
                      </label>
                      <select
                        id="ingest-store-select"
                        value={targetStoreId}
                        onChange={(e) => setTargetStoreId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl py-2.5 px-3 text-xs text-slate-100 focus:outline-none"
                      >
                        {PRESET_WEBSITE_TARGETS.map((t) => (
                          <option key={t.storeId} value={t.storeId}>
                            {t.storeName} ({t.mallName})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="ingest-discount-input"
                        className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                      >
                        Discount Percentage (% OFF)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          id="ingest-discount-input"
                          type="range"
                          min="10"
                          max="90"
                          step="5"
                          value={discountPercent}
                          onChange={(e) => setDiscountPercent(Number(e.target.value))}
                          className="flex-1 accent-emerald-500"
                        />
                        <span className="font-mono text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                          {discountPercent}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="ingest-title-input"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                    >
                      Campaign / Sale Title
                    </label>
                    <input
                      id="ingest-title-input"
                      type="text"
                      value={promoTitle}
                      onChange={(e) => setPromoTitle(e.target.value)}
                      placeholder="e.g. Mr Price Black Friday 50% Off Special"
                      className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="ingest-rule-input"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                    >
                      Promotional Deal Rule / Condition
                    </label>
                    <input
                      id="ingest-rule-input"
                      type="text"
                      value={ruleText}
                      onChange={(e) => setRuleText(e.target.value)}
                      placeholder="e.g. Buy 2 Get 50% Off lowest priced item"
                      className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none"
                    />
                  </div>

                  {/* CATEGORY / DEPARTMENT LINKS */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                    <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                      <span>Specific Department Links (Mens, Womens, Kids)</span>
                      <span className="text-[10px] text-slate-500">Optional specific URLs</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block mb-1">
                          👔 Men&apos;s Link
                        </span>
                        <input
                          type="url"
                          value={mensUrl}
                          onChange={(e) => setMensUrl(e.target.value)}
                          placeholder="https://.../men/..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-[11px] font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block mb-1">
                          👗 Women&apos;s Link
                        </span>
                        <input
                          type="url"
                          value={womensUrl}
                          onChange={(e) => setWomensUrl(e.target.value)}
                          placeholder="https://.../women/..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-[11px] font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block mb-1">
                          🧒 Kids&apos; Link
                        </span>
                        <input
                          type="url"
                          value={kidsUrl}
                          onChange={(e) => setKidsUrl(e.target.value)}
                          placeholder="https://.../kids/..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-[11px] font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isIngesting}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isIngesting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Ingesting URL &amp; Parsing Inventory...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 stroke-[2.5]" />
                        <span>Ingest URL &amp; Deliver to Sovereign Agents</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: BILLBOARD & CRAWLER LOGS */}
          {activeTab === "logs" && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <h3 className="text-sm font-bold text-white">
                      Live DOOH Billboard &amp; Store Web Crawl Feeds
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400">
                    4 Billboards Active · 40 Stores Tracked
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  {recentLogs.length > 0 ? (
                    recentLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-2.5"
                      >
                        <span className="text-emerald-400 text-[10px] shrink-0 mt-0.5">
                          [{new Date(log.timestamp).toLocaleTimeString()}]
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-slate-200">{log.storeName}: </span>
                          <span className="text-slate-300">{log.message}</span>
                          {log.url && (
                            <a
                              href={log.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:underline block text-[10px] mt-0.5 truncate"
                            >
                              {log.url}
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 py-4 text-center">
                      Click &quot;Crawl Websites Now&quot; above to initiate live crawl across all
                      stores.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-5 sm:px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Agent Privacy Shield: Zero personal tracking sent to retail websites</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
