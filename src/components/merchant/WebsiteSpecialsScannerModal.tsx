import React, { useState, useEffect, useCallback, useRef } from "react";
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
  ChevronUp,
  ChevronLeft,
  ChevronRight,
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

  // Tab horizontal scrolling refs and indicators
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [canTabScrollLeft, setCanTabScrollLeft] = useState(false);
  const [canTabScrollRight, setCanTabScrollRight] = useState(false);

  // Body vertical scrolling refs and indicators
  const bodyScrollRef = useRef<HTMLDivElement>(null);
  const [canBodyScrollUp, setCanBodyScrollUp] = useState(false);
  const [canBodyScrollDown, setCanBodyScrollDown] = useState(false);

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

  const updateTabsScrollIndicators = useCallback(() => {
    const el = tabsContainerRef.current;
    if (!el) return;
    const canLeft = el.scrollLeft > 6;
    const canRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 6;
    setCanTabScrollLeft(canLeft);
    setCanTabScrollRight(canRight);
  }, []);

  const updateBodyScrollIndicators = useCallback(() => {
    const el = bodyScrollRef.current;
    if (!el) return;
    const canUp = el.scrollTop > 10;
    const canDown = el.scrollTop < el.scrollHeight - el.clientHeight - 10;
    setCanBodyScrollUp(canUp);
    setCanBodyScrollDown(canDown);
  }, []);

  const scrollTabs = (direction: "left" | "right") => {
    if (!tabsContainerRef.current) return;
    const offset = direction === "left" ? -180 : 180;
    tabsContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    setTimeout(updateTabsScrollIndicators, 250);
  };

  const scrollBody = (direction: "up" | "down") => {
    if (!bodyScrollRef.current) return;
    const offset = direction === "up" ? -220 : 220;
    bodyScrollRef.current.scrollBy({ top: offset, behavior: "smooth" });
    setTimeout(updateBodyScrollIndicators, 250);
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
      const timer = setTimeout(() => {
        updateTabsScrollIndicators();
        updateBodyScrollIndicators();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, refreshData, updateTabsScrollIndicators, updateBodyScrollIndicators]);

  // Recalculate scroll indicators on window resize and tab switch
  useEffect(() => {
    const handleResize = () => {
      updateTabsScrollIndicators();
      updateBodyScrollIndicators();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateTabsScrollIndicators, updateBodyScrollIndicators]);

  useEffect(() => {
    // Reset body scroll position on tab switch and update indicators
    if (bodyScrollRef.current) {
      bodyScrollRef.current.scrollTop = 0;
    }
    const timer = setTimeout(() => {
      updateBodyScrollIndicators();
      updateTabsScrollIndicators();
    }, 100);
    return () => clearTimeout(timer);
  }, [activeTab, updateBodyScrollIndicators, updateTabsScrollIndicators]);

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
      className="fixed inset-0 z-[10001] flex items-center justify-center p-1 sm:p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200 select-none overflow-hidden"
    >
      <div className="w-full max-w-4xl h-[95vh] sm:h-auto sm:max-h-[88vh] bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* HEADER - Mobile Optimized */}
        <div className="px-3.5 sm:px-6 py-2.5 sm:py-3.5 bg-slate-950/95 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-slate-950 shadow-md shrink-0">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2
                  id="crawler-modal-title"
                  className="text-xs sm:text-base font-bold text-slate-100 truncate"
                >
                  <span className="sm:hidden">Specials &amp; Billboard Crawler</span>
                  <span className="hidden sm:inline">
                    Store Website &amp; Billboard Specials Crawler
                  </span>
                </h2>
                <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  24/7 Sync
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate max-w-[280px] sm:max-w-xl hidden xs:block">
                Crawls store websites (Mr Price, Woolies) &amp; billboards to push deals to
                sovereign agents
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handleTriggerCrawl}
              disabled={isScanning}
              title="Crawl all store websites and roadside billboards now"
              className="py-1.5 px-2.5 sm:px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
              <span className="hidden md:inline">
                {isScanning ? "Scanning..." : "Crawl Websites Now"}
              </span>
              <span className="inline md:hidden text-[11px]">
                {isScanning ? "Crawl..." : "Crawl"}
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer active:scale-95 shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TABS - Horizontally Scrollable on Mobile with Subtle Arrows */}
        <div className="relative bg-slate-950/80 border-b border-slate-800 shrink-0 px-2 sm:px-4 py-2">
          {/* Subtle Left Scroll Arrow (Visible when scrolled) */}
          {canTabScrollLeft && (
            <button
              type="button"
              onClick={() => scrollTabs("left")}
              aria-label="Scroll tabs left"
              className="absolute left-0.5 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-slate-900/95 border border-cyan-500/40 text-cyan-300 shadow-lg flex items-center justify-center hover:bg-cyan-950 transition-all active:scale-90"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Left subtle fade gradient when scrollable */}
          {canTabScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-slate-950 to-transparent pointer-events-none z-10" />
          )}

          {/* Tab buttons row with smooth horizontal scroll and no scrollbars */}
          <div
            ref={tabsContainerRef}
            onScroll={updateTabsScrollIndicators}
            className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scrollbar-none whitespace-nowrap touch-pan-x px-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <button
              type="button"
              onClick={() => setActiveTab("specials")}
              className={`py-1.5 px-3 sm:px-3.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 ${
                activeTab === "specials"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Delivered Specials</span>
              {deliveredCards.length > 0 && (
                <span className="min-w-4 h-4 px-1 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
                  {deliveredCards.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("ingest")}
              className={`py-1.5 px-3 sm:px-3.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 ${
                activeTab === "ingest"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>Merchant / App Ingest URL</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("logs")}
              className={`py-1.5 px-3 sm:px-3.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 ${
                activeTab === "logs"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <Tv className="w-3.5 h-3.5 shrink-0" />
              <span>Billboard &amp; Crawler Feed</span>
            </button>

            {/* Target Agent Pill */}
            <div className="ml-auto pl-2 text-[10px] sm:text-[11px] text-slate-400 font-mono hidden sm:flex items-center gap-1.5 shrink-0">
              <span>Target:</span>
              <strong className="text-emerald-400 font-bold truncate max-w-[120px]">
                {activeAgent ? `@${activeAgent.fullName}` : "@default.agent"}
              </strong>
            </div>
          </div>

          {/* Right subtle fade gradient when scrollable */}
          {canTabScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none z-10" />
          )}

          {/* Subtle Right Scroll Arrow (Visible when more tabs to the right) */}
          {canTabScrollRight && (
            <button
              type="button"
              onClick={() => scrollTabs("right")}
              aria-label="Scroll tabs right"
              className="absolute right-0.5 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-slate-900/95 border border-cyan-500/40 text-cyan-300 shadow-lg flex items-center justify-center hover:bg-cyan-950 transition-all active:scale-90"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* BODY VIEWPORT - Mobile Optimized Vertical Scroll with Min-H-0 and subtle scroll buttons */}
        <div className="relative flex-1 min-h-0 flex flex-col">
          {/* Subtle Top Scroll Indicator if scrolled down */}
          {canBodyScrollUp && (
            <button
              type="button"
              onClick={() => scrollBody("up")}
              aria-label="Scroll content up"
              className="absolute top-2 right-4 z-20 w-7 h-7 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 shadow-md flex items-center justify-center hover:bg-slate-800 hover:text-emerald-400 transition-all active:scale-90"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          )}

          <div
            ref={bodyScrollRef}
            onScroll={updateBodyScrollIndicators}
            className="flex-1 min-h-0 overflow-y-auto no-scrollbar scrollbar-none p-3 sm:p-6 space-y-3 sm:space-y-4 touch-pan-y"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
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

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-black text-xs tracking-wider shadow shrink-0">
                        MRP
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <h3 className="text-xs sm:text-sm font-black text-white">
                            Mr Price: Black Friday 50% Off Special
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-amber-400 text-slate-950 shrink-0">
                            HOT SALE
                          </span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-red-300 font-semibold mt-0.5">
                          Buy 2 Denim Shorts, Get 50% Off Lowest Priced Item
                        </p>
                      </div>
                    </div>

                    <a
                      href="https://www.mrp.com/en_za/black-friday/denim-shorts-buy-2-get-50-off-the-lowest-priced-item"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto justify-center py-1.5 px-3 rounded-xl bg-red-500 hover:bg-red-400 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow shrink-0 active:scale-95"
                    >
                      <span>View on mrp.com</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* DEPARTMENT DIRECT LINKS (MENS, WOMENS, KIDS) */}
                  <div className="p-2.5 sm:p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 mb-3">
                    <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider flex flex-col xs:flex-row xs:items-center justify-between gap-1">
                      <span>Department Direct Specials Links</span>
                      <span className="text-emerald-400 font-normal text-[10px]">
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
                            <div className="text-[10px] text-slate-400">
                              High-rise &amp; mom cuts
                            </div>
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
                        No special cards delivered yet. Click &quot;Crawl Websites Now&quot; above
                        to check all store websites and billboards!
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
                    updates the store inventory cards and immediately delivers the deal to
                    users&apos; active agents.
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
                <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Radio className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
                      <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                        Live DOOH Billboard &amp; Store Web Crawl Feeds
                      </h3>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-mono text-emerald-400 shrink-0">
                      4 Billboards Active · 40 Stores Tracked
                    </span>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    {recentLogs.length > 0 ? (
                      recentLogs.map((log) => (
                        <div
                          key={log.id}
                          className="p-2 sm:p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-2 sm:gap-2.5"
                        >
                          <span className="text-emerald-400 text-[10px] shrink-0 mt-0.5">
                            [{new Date(log.timestamp).toLocaleTimeString()}]
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-slate-200">{log.storeName}: </span>
                            <span className="text-slate-300 break-words">{log.message}</span>
                            {log.url && (
                              <a
                                href={log.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-400 hover:underline block text-[10px] mt-0.5 break-all"
                              >
                                {log.url}
                              </a>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-500 py-6 text-center text-xs">
                        Click &quot;Crawl Websites Now&quot; above to initiate live crawl across all
                        stores.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Subtle Bottom Scroll Indicator if more content below */}
          {canBodyScrollDown && (
            <button
              type="button"
              onClick={() => scrollBody("down")}
              aria-label="Scroll content down"
              className="absolute bottom-2 right-4 z-20 w-7 h-7 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 shadow-md flex items-center justify-center hover:bg-slate-800 hover:text-emerald-400 transition-all active:scale-90"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* FOOTER - Responsive */}
        <div className="px-3.5 sm:px-6 py-2.5 sm:py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate text-[10px] sm:text-xs">
              Agent Privacy Shield: Zero personal tracking sent to retail websites
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-3.5 sm:px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors cursor-pointer shrink-0 active:scale-95 text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
