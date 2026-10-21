import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Wallet,
  Bot,
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Gavel,
  Tag,
  TrendingUp,
  X,
  Copy,
  Layers,
  Store,
  User,
  Flame,
  Award,
  Terminal,
  RefreshCw,
  Trophy,
  Users,
  Check,
  Trash2,
  PlusCircle,
  ShoppingBag,
  ExternalLink,
  Filter,
} from "lucide-react";

import {
  AgentNameRecord,
  calculateNamePricing,
  validateRegistrationBatch,
  PaymentMethodType,
  CryptoNetwork,
  OwnerDirectoryRecord,
  LeaderboardEntry,
  MarketType,
} from "../../types/agentNames";

import {
  searchAgentNames,
  claimAgentName,
  batchClaimAgentNames,
  placeAuctionBid,
  listOnSecondaryMarket,
  buyFromSecondaryMarket,
  getOwnerDirectory,
  getLeaderboard,
  getX402PaymentQuote,
  INITIAL_NAME_RECORDS,
} from "../../services/agentNameService";

export interface AgentNameServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPageMode?: boolean;
  initialTab?: "search" | "owners" | "leaderboard" | "auctions" | "secondary" | "x402";
  walletAddress?: string;
  userUsdcBalance?: number;
}

export function AgentNameServiceModal({
  isOpen,
  onClose,
  isPageMode = false,
  initialTab = "search",
  walletAddress = "0x71a4...99ef",
  userUsdcBalance = 285.5,
}: AgentNameServiceModalProps) {
  const [activeTab, setActiveTab] = useState<
    "search" | "owners" | "leaderboard" | "auctions" | "secondary" | "x402"
  >(initialTab);

  const [searchQuery, setSearchQuery] = useState("");
  const [isAgentMode, setIsAgentMode] = useState(false);
  const [records, setRecords] = useState<AgentNameRecord[]>(INITIAL_NAME_RECORDS);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Batch Registration Cart
  const [batchCart, setBatchCart] = useState<string[]>([]);
  const [isBatchDrawerOpen, setIsBatchDrawerOpen] = useState(false);

  // Directory of Owners State
  const [ownerSearchQuery, setOwnerSearchQuery] = useState("");
  const [ownerCategoryFilter, setOwnerCategoryFilter] = useState("ALL");
  const [ownerChainFilter, setOwnerChainFilter] = useState("ALL");
  const [ownerDirectory, setOwnerDirectory] = useState<OwnerDirectoryRecord[]>([]);

  // Leaderboard State
  const [leaderboardMarketFilter, setLeaderboardMarketFilter] = useState<string>("ALL");
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);

  // Single Claim Modal State
  const [claimTargetName, setClaimTargetName] = useState<string | null>(null);
  const [claimType, setClaimType] = useState<"personal" | "merchant">("personal");
  const [claimPaymentMethod, setClaimPaymentMethod] = useState<PaymentMethodType>("card");
  const [claimCryptoNetwork, setClaimCryptoNetwork] = useState<CryptoNetwork>("base");
  const [claimCardDetails, setClaimCardDetails] = useState({
    name: "Gugu Nyathi",
    cardNumber: "•••• •••• •••• 4242",
    expiry: "12/28",
    cvv: "•••",
  });
  const [claimAgentId, setClaimAgentId] = useState("agent_autocom_consumer_9041");
  const [isClaiming, setIsClaiming] = useState(false);

  // Auction Bid Modal State
  const [bidTargetRecord, setBidTargetRecord] = useState<AgentNameRecord | null>(null);
  const [bidAmountUsd, setBidAmountUsd] = useState<number>(0);
  const [bidMethod, setBidMethod] = useState<PaymentMethodType>("crypto");
  const [bidNetwork, setBidNetwork] = useState<CryptoNetwork>("base");
  const [isBidding, setIsBidding] = useState(false);

  // Secondary Listing Modal State
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [listNameInput, setListNameInput] = useState("");
  const [listPriceInput, setListPriceInput] = useState<number>(500);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard!`);
  };

  // Sync records from backend or local service
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await searchAgentNames(searchQuery, isAgentMode);
      setRecords(data.allRecords);
      setOwnerDirectory(
        getOwnerDirectory({
          search: ownerSearchQuery,
          category: ownerCategoryFilter,
          chain: ownerChainFilter,
        }),
      );
      setLeaderboardEntries(getLeaderboard(leaderboardMarketFilter));
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  }, [
    searchQuery,
    isAgentMode,
    ownerSearchQuery,
    ownerCategoryFilter,
    ownerChainFilter,
    leaderboardMarketFilter,
  ]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Derived search pricing calculations
  const searchPricing = useMemo(() => {
    return calculateNamePricing(searchQuery.trim() || "example", isAgentMode);
  }, [searchQuery, isAgentMode]);

  const existingMatch = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const clean = searchQuery
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "");
    return records.find((r) => r.name === clean) || null;
  }, [searchQuery, records]);

  // Batch validation
  const batchValidation = useMemo(() => {
    return validateRegistrationBatch(batchCart, isAgentMode);
  }, [batchCart, isAgentMode]);

  // Filtered views
  const liveAuctions = useMemo(() => {
    return records.filter((r) => r.status === "AUCTION_LIVE");
  }, [records]);

  const secondaryListings = useMemo(() => {
    return records.filter((r) => r.status === "SECONDARY_LISTED");
  }, [records]);

  // Add name to batch cart
  const handleAddToBatch = (rawName: string) => {
    const clean = rawName.toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (!clean) return;

    if (batchCart.includes(clean)) {
      showToast(`${clean}.agent is already in your registration batch.`);
      return;
    }

    const testBatch = [...batchCart, clean];
    const validation = validateRegistrationBatch(testBatch, isAgentMode);

    if (!validation.allowed && validation.reason) {
      showToast(validation.reason);
      return;
    }

    setBatchCart(testBatch);
    setIsBatchDrawerOpen(true);
    showToast(`Added ${clean}.agent to batch cart (${testBatch.length} items).`);
  };

  const handleRemoveFromBatch = (nameToRemove: string) => {
    setBatchCart(batchCart.filter((n) => n !== nameToRemove));
  };

  // Handle single name claim submit
  const handleExecuteClaim = async () => {
    if (!claimTargetName) return;
    setIsClaiming(true);

    try {
      const result = await claimAgentName({
        name: claimTargetName,
        type: claimType,
        paymentMethod: claimPaymentMethod,
        network: claimPaymentMethod === "crypto" ? claimCryptoNetwork : undefined,
        isAgent: claimPaymentMethod === "x402" || isAgentMode,
        agentId: claimPaymentMethod === "x402" ? claimAgentId : undefined,
        cardToken:
          claimPaymentMethod === "card"
            ? {
                last4: "4242",
                cardholderName: claimCardDetails.name,
                expiry: claimCardDetails.expiry,
              }
            : undefined,
      });

      showToast(result.message);
      setClaimTargetName(null);
      await refreshData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Claim failed");
    } finally {
      setIsClaiming(false);
    }
  };

  // Handle batch claim submit
  const handleExecuteBatchClaim = async () => {
    if (batchCart.length === 0) return;
    setIsClaiming(true);

    try {
      const result = await batchClaimAgentNames({
        names: batchCart,
        type: claimType,
        paymentMethod: claimPaymentMethod,
        network: claimPaymentMethod === "crypto" ? claimCryptoNetwork : undefined,
        isAgent: claimPaymentMethod === "x402" || isAgentMode,
        agentId: claimPaymentMethod === "x402" ? claimAgentId : undefined,
        cardToken:
          claimPaymentMethod === "card"
            ? {
                last4: "4242",
                cardholderName: claimCardDetails.name,
                expiry: claimCardDetails.expiry,
              }
            : undefined,
      });

      showToast(result.message);
      setBatchCart([]);
      setIsBatchDrawerOpen(false);
      await refreshData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Batch registration failed");
    } finally {
      setIsClaiming(false);
    }
  };

  // Handle auction bid submit
  const handleExecuteBid = async () => {
    if (!bidTargetRecord) return;
    setIsBidding(true);

    try {
      const result = await placeAuctionBid(
        bidTargetRecord.name,
        bidAmountUsd,
        bidMethod === "x402" ? claimAgentId : `${walletAddress} (${bidNetwork.toUpperCase()})`,
        bidMethod,
        bidNetwork,
      );

      showToast(result.message);
      setBidTargetRecord(null);
      await refreshData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Bid submission failed");
    } finally {
      setIsBidding(false);
    }
  };

  // Handle instant buy from secondary marketplace
  const handleBuySecondary = async (record: AgentNameRecord) => {
    try {
      const result = await buyFromSecondaryMarket(
        record.name,
        walletAddress,
        "crypto",
        record.secondaryListing?.network || "base",
      );
      showToast(result.message);
      await refreshData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Marketplace buy failed");
    }
  };

  // Handle secondary listing creation
  const handleCreateSecondaryListing = async () => {
    if (!listNameInput) return;
    try {
      const result = await listOnSecondaryMarket(
        listNameInput.toLowerCase().trim(),
        Number(listPriceInput),
        walletAddress,
        "base",
      );
      showToast(`Listed ${result.record.fullName} for $${listPriceInput} USD!`);
      setIsListModalOpen(false);
      setListNameInput("");
      await refreshData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Listing failed");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={
        isPageMode
          ? "relative min-h-[100dvh] w-full bg-background bg-aurora text-foreground p-3 sm:p-6 md:p-8 flex flex-col justify-start"
          : "fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in select-none"
      }
      onClick={isPageMode ? undefined : onClose}
    >
      <div
        className={
          isPageMode
            ? "w-full max-w-7xl mx-auto flex flex-col rounded-3xl glass border border-primary/40 bg-[#070b14]/95 shadow-2xl overflow-hidden"
            : "relative w-full max-w-6xl max-h-[94vh] flex flex-col rounded-3xl glass border border-primary/40 bg-[#070b14]/95 shadow-2xl overflow-hidden"
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 bg-gradient-to-r from-primary/20 via-black to-accent/20 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 via-primary to-accent flex items-center justify-center shadow-lg text-slate-950 font-black">
                <Tag className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    Agent Name Service &amp; Registry (.agent)
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    x402 Micropayments · Base · Arc · Solana · Cards
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-sans mt-0.5">
                  Sovereign merchant &amp; personal agent identity registry. Sliding length pricing,
                  Directory of Owners, Leaderboard, &amp; anti-spam protection.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Batch Cart Button */}
              {batchCart.length > 0 && (
                <button
                  onClick={() => setIsBatchDrawerOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-mono font-black shadow-lg animate-pulse transition-all cursor-pointer"
                  title="View batch registration cart"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Batch ({batchCart.length}/20)</span>
                  <span className="text-[10px] bg-slate-950/20 px-1.5 rounded font-mono">
                    ${batchValidation.totalCostUsd}
                  </span>
                </button>
              )}

              {/* Anti-Spam Persona Toggle */}
              <button
                onClick={() => {
                  const next = !isAgentMode;
                  setIsAgentMode(next);
                  showToast(
                    next
                      ? "Switched to AI Agent Mode: 7+ char names are $0.20 (Anti-Spam protocol fee)."
                      : "Switched to Human Mode: 7+ char names are FREE ($0.00).",
                  );
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                  isAgentMode
                    ? "bg-purple-500/20 border-purple-400/50 text-purple-300"
                    : "bg-emerald-500/20 border-emerald-400/50 text-emerald-300"
                }`}
                title="Toggle between Human (Free 7+ chars) and AI Agent ($0.20 anti-spam) mode"
              >
                {isAgentMode ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">
                  {isAgentMode ? "Agent Mode ($0.20 7+)" : "Human Mode (Free 7+)"}
                </span>
                <span className="sm:hidden">{isAgentMode ? "Agent" : "Human"}</span>
              </button>

              <button
                onClick={refreshData}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors cursor-pointer"
                title="Refresh directory & leaderboard"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-primary" : ""}`} />
              </button>
              {!isPageMode && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Sliding Scale Pricing Bar Reference */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center font-mono text-[11px]">
            <div className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30">
              <div className="text-[9px] text-muted-foreground uppercase">1 Char (Batch ≤20)</div>
              <div className="text-white font-extrabold text-sm">$1,000</div>
              <div className="text-[9px] text-cyan-300">1000 USDC</div>
            </div>
            <div className="p-2 rounded-xl bg-teal-950/40 border border-teal-500/30">
              <div className="text-[9px] text-muted-foreground uppercase">2 Chars (Batch ≤20)</div>
              <div className="text-white font-extrabold text-sm">$600</div>
              <div className="text-[9px] text-teal-300">600 USDC</div>
            </div>
            <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/30">
              <div className="text-[9px] text-muted-foreground uppercase">3 Chars (Batch ≤20)</div>
              <div className="text-white font-extrabold text-sm">$300</div>
              <div className="text-[9px] text-amber-300">300 USDC</div>
            </div>
            <div className="p-2 rounded-xl bg-blue-950/40 border border-blue-500/30">
              <div className="text-[9px] text-muted-foreground uppercase">4 Chars (Max 1)</div>
              <div className="text-white font-extrabold text-sm">$20</div>
              <div className="text-[9px] text-blue-300">20 USDC</div>
            </div>
            <div className="p-2 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
              <div className="text-[9px] text-muted-foreground uppercase">5 Chars (Max 1)</div>
              <div className="text-white font-extrabold text-sm">$2</div>
              <div className="text-[9px] text-indigo-300">2 USDC</div>
            </div>
            <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/30">
              <div className="text-[9px] text-muted-foreground uppercase">6 Chars (Max 1)</div>
              <div className="text-white font-extrabold text-sm">$1</div>
              <div className="text-[9px] text-purple-300">1 USDC</div>
            </div>
            <div className="col-span-2 sm:col-span-1 p-2 rounded-xl bg-emerald-950/50 border border-emerald-500/40">
              <div className="text-[9px] text-muted-foreground uppercase">7+ Chars (Max 1)</div>
              <div className="text-emerald-300 font-extrabold text-sm">
                {isAgentMode ? "$0.20" : "FREE"}
              </div>
              <div className="text-[9px] text-slate-300">
                {isAgentMode ? "Agent Anti-Spam" : "Free for Humans"}
              </div>
            </div>
          </div>

          {/* Navigation Tabs (6 Primary Sections) */}
          <div className="mt-4 flex items-center gap-1.5 p-1 rounded-2xl bg-black/60 border border-white/10 max-w-full overflow-x-auto">
            <button
              onClick={() => setActiveTab("search")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "search"
                  ? "bg-cyan-400 text-slate-950 shadow-md"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Name Search &amp; Claim
            </button>

            <button
              onClick={() => setActiveTab("owners")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "owners"
                  ? "bg-teal-400 text-slate-950 shadow-md"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Directory of Owners ({ownerDirectory.length})
            </button>

            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "leaderboard"
                  ? "bg-amber-400 text-slate-950 shadow-md"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              Top Leaderboard
            </button>

            <button
              onClick={() => setActiveTab("auctions")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "auctions"
                  ? "bg-purple-400 text-slate-950 shadow-md"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Special Auctions ({liveAuctions.length})
            </button>

            <button
              onClick={() => setActiveTab("secondary")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "secondary"
                  ? "bg-blue-400 text-slate-950 shadow-md"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Secondary Marketplace ({secondaryListings.length})
            </button>

            <button
              onClick={() => setActiveTab("x402")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "x402"
                  ? "bg-rose-400 text-slate-950 shadow-md"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              x402 Agent Skill
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: SEARCH & CLAIM */}
          {activeTab === "search" && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Anti-Spam Notice */}
              <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-start sm:items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <span className="font-bold text-cyan-300">
                      Anti-Spam Registration Enforcement:
                    </span>
                    <span className="text-slate-300 ml-1 font-sans">
                      Standard handles (4+ characters, including 7+ free handles) are strictly
                      limited to <strong>1 name per registration</strong>. Premium 1, 2, and
                      3-character handles and auction items allow batch purchases up to 20 names.
                    </span>
                  </div>
                </div>
              </div>

              {/* Search Bar Input */}
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400" />
                <input
                  type="text"
                  placeholder="Search available handles or check length (e.g. x, 007, ai, bot, shop, alpha, trends, coffee)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-black/60 border border-cyan-500/40 text-sm text-white placeholder-muted-foreground font-mono focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 shadow-xl"
                  autoFocus
                />
              </div>

              {/* Instant Search Result Card */}
              {searchQuery.trim() && (
                <div className="p-5 rounded-2xl glass border border-white/15 bg-gradient-to-b from-black/80 to-[#0a1120] shadow-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl sm:text-2xl font-black text-white font-mono">
                          {searchPricing.fullName}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-slate-300">
                          {searchPricing.length} {searchPricing.length === 1 ? "char" : "chars"}
                        </span>
                        {searchPricing.canBatchBuy ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            Batch Up to 20
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                            Max 1 Per Reg
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 font-sans">
                        AutoCom Sovereign Agent Identifier · Sub-second routing beacon
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-xl sm:text-2xl font-black text-cyan-300 font-mono">
                        {searchPricing.isFreeTier ? (
                          <span className="text-emerald-400">FREE ($0.00)</span>
                        ) : (
                          `$${searchPricing.priceUsd.toLocaleString()}`
                        )}
                        <span className="text-xs text-muted-foreground font-normal ml-1">USDC</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        R{searchPricing.priceZar.toLocaleString()} ZAR · {searchPricing.tierLabel}
                      </div>
                    </div>
                  </div>

                  {/* Status Banner */}
                  {existingMatch?.status === "AUCTION_LIVE" ? (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Gavel className="w-5 h-5 text-amber-400 animate-pulse" />
                        <div>
                          <div className="text-amber-300 font-bold text-xs font-mono">
                            Reserved for Special Auction
                          </div>
                          <div className="text-[11px] text-slate-300 font-sans">
                            Current highest bid: $
                            {existingMatch.auction?.currentBidUsd.toLocaleString()} USD (
                            {existingMatch.auction?.bidsCount} bids)
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setBidTargetRecord(existingMatch);
                          setBidAmountUsd(existingMatch.auction?.minNextBidUsd || 1000);
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
                      >
                        Bid in Auction
                      </button>
                    </div>
                  ) : existingMatch?.status === "SECONDARY_LISTED" ? (
                    <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <TrendingUp className="w-5 h-5 text-teal-400" />
                        <div>
                          <div className="text-teal-300 font-bold text-xs font-mono">
                            Listed on Secondary Marketplace
                          </div>
                          <div className="text-[11px] text-slate-300 font-sans">
                            Seller asking: $
                            {existingMatch.secondaryListing?.listedPriceUsd.toLocaleString()} USD on{" "}
                            {existingMatch.secondaryListing?.network.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleBuySecondary(existingMatch)}
                        className="px-4 py-2 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-mono text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
                      >
                        Buy from Market
                      </button>
                    </div>
                  ) : existingMatch?.status === "CLAIMED" ? (
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="w-5 h-5 text-red-400" />
                        <div>
                          <div className="text-red-300 font-bold text-xs font-mono">
                            Already Claimed &amp; Registered
                          </div>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            Owner: {existingMatch.ownerAgentId || existingMatch.ownerAddress}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setOwnerSearchQuery(searchPricing.cleanName);
                          setActiveTab("owners");
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-xs cursor-pointer"
                      >
                        View Owner
                      </button>
                    </div>
                  ) : searchPricing.isAuctionReserved ? (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Award className="w-5 h-5 text-amber-400" />
                        <div>
                          <div className="text-amber-300 font-bold text-xs font-mono">
                            Pre-Reserved Iconic Handle
                          </div>
                          <div className="text-[11px] text-slate-300 font-sans">
                            Single characters and legendary IDs are sold via the Special Auction.
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab("auctions")}
                        className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
                      >
                        View Auctions
                      </button>
                    </div>
                  ) : searchPricing.isBrandReserved ? (
                    <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Store className="w-5 h-5 text-purple-400" />
                        <div>
                          <div className="text-purple-300 font-bold text-xs font-mono">
                            Mainstream Brand Trademark Reserved
                          </div>
                          <div className="text-[11px] text-slate-300 font-sans">
                            Curated enterprise auction with merchant validation.
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab("auctions")}
                        className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-mono text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                      >
                        Go to Brand Auction
                      </button>
                    </div>
                  ) : (
                    /* AVAILABLE TO CLAIM */
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div>
                          <div className="text-emerald-300 font-bold text-xs font-mono">
                            Available for Instant Registration!
                          </div>
                          <div className="text-[11px] text-slate-300 font-sans">
                            {searchPricing.isFreeTier
                              ? "Free registration for humans! (Cards, Base, Arc, Solana supported)"
                              : `Pay $${searchPricing.priceUsd} with Card, Crypto (Base/Arc/Solana), or x402 Micropayments.`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {searchPricing.canBatchBuy && (
                          <button
                            onClick={() => handleAddToBatch(searchPricing.cleanName)}
                            className="px-3.5 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Add to Batch</span>
                          </button>
                        )}
                        <button
                          onClick={() => setClaimTargetName(searchPricing.cleanName)}
                          className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 text-slate-950 font-mono text-xs font-black shadow-lg transition-all active:scale-95 cursor-pointer shrink-0"
                        >
                          Claim {searchPricing.fullName}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sample Popular Suggestions with Updated Pricing Scale */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    Updated Sliding Scale Length Pricing
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400">Click to preview</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 font-mono text-xs">
                  {[
                    { name: "q", tier: "$1,000 (1 Char)", batch: true },
                    { name: "za", tier: "$600 (2 Chars)", batch: true },
                    { name: "gpt", tier: "$300 (3 Chars)", batch: true },
                    { name: "mall", tier: "$20 (4 Chars)", batch: false },
                    { name: "store", tier: "$2 (5 Chars)", batch: false },
                    { name: "market", tier: "$1 (6 Chars)", batch: false },
                    {
                      name: "southafrica",
                      tier: isAgentMode ? "$0.20 (7+ Chars)" : "FREE (7+ Chars)",
                      batch: false,
                    },
                  ].map((s) => (
                    <button
                      key={s.name}
                      onClick={() => setSearchQuery(s.name)}
                      className="p-3 rounded-xl glass border border-white/10 hover:border-cyan-400/50 bg-black/40 text-left transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      <div className="text-white font-bold truncate">{s.name}.agent</div>
                      <div className="text-[10px] text-cyan-300 mt-1">{s.tier}</div>
                      <div className="text-[8.5px] text-muted-foreground mt-0.5">
                        {s.batch ? "Batch ≤20" : "1 per reg"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DIRECTORY OF OWNERS */}
          {activeTab === "owners" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
                <div>
                  <h3 className="text-sm font-extrabold text-white font-mono flex items-center gap-2">
                    <Users className="w-4 h-4 text-teal-400" />
                    Directory of .agent Name Owners
                  </h3>
                  <p className="text-xs text-muted-foreground font-sans">
                    Public verifiable registry of registered personal agents, merchant stores, and
                    corporate handles.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-teal-400/20 text-teal-300 border border-teal-400/30">
                  {ownerDirectory.length} Registered Handles
                </span>
              </div>

              {/* Owner Filters & Search Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="relative col-span-1 sm:col-span-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search name, owner, or agent ID..."
                    value={ownerSearchQuery}
                    onChange={(e) => setOwnerSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs placeholder-muted-foreground focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-muted-foreground">Type:</span>
                  {(["ALL", "PERSONAL", "MERCHANT"] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setOwnerCategoryFilter(cat)}
                      className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                        ownerCategoryFilter === cat
                          ? "bg-teal-400 text-slate-950 border-teal-400"
                          : "bg-black/40 text-muted-foreground border-white/10 hover:text-white"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-muted-foreground">Chain:</span>
                  {(["ALL", "Base", "Solana", "Arc", "x402"] as const).map((net) => (
                    <button
                      key={net}
                      onClick={() => setOwnerChainFilter(net)}
                      className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                        ownerChainFilter === net
                          ? "bg-cyan-400 text-slate-950 border-cyan-400"
                          : "bg-black/40 text-muted-foreground border-white/10 hover:text-white"
                      }`}
                    >
                      {net}
                    </button>
                  ))}
                </div>
              </div>

              {/* Owner Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 font-mono text-xs">
                {ownerDirectory.map((owner) => (
                  <div
                    key={owner.id}
                    className="p-4 rounded-2xl glass border border-white/10 bg-[#0a1120]/80 shadow space-y-2.5 hover:border-teal-400/50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-black text-white">{owner.fullName}</span>
                        {owner.verified && (
                          <ShieldCheck
                            className="w-4 h-4 text-cyan-400"
                            title="Verified Enterprise or Anchor Store"
                          />
                        )}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[9.5px] font-bold ${
                          owner.category === "MERCHANT"
                            ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                            : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        }`}
                      >
                        {owner.category}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">Owner Identifier:</span>
                        <span className="text-slate-300 truncate max-w-[150px]">
                          {owner.ownerIdentifier}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">Rail / Chain:</span>
                        <span className="text-cyan-300 font-bold">{owner.chainOrProtocol}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">Claimed Date:</span>
                        <span className="text-slate-400">
                          {new Date(owner.claimedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <span className="text-muted-foreground">{owner.length} chars</span>
                      <span className="text-emerald-400 font-bold">
                        {owner.priceUsd === 0 ? "FREE" : `$${owner.priceUsd.toLocaleString()} USD`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: LEADERBOARD OF TOP SALES */}
          {activeTab === "leaderboard" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
                <div>
                  <h3 className="text-sm font-extrabold text-white font-mono flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    AutoCom Agent Name Sales Leaderboard
                  </h3>
                  <p className="text-xs text-muted-foreground font-sans">
                    All-time highest value transactions across Primary Registrations, Secondary
                    Market, &amp; Special Auctions.
                  </p>
                </div>

                {/* Filter buttons */}
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  {(["ALL", "AUCTION", "SECONDARY", "PRIMARY"] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setLeaderboardMarketFilter(filter)}
                      className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                        leaderboardMarketFilter === filter
                          ? "bg-amber-400 text-slate-950 border-amber-400 shadow"
                          : "bg-black/40 text-muted-foreground border-white/10 hover:text-white"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary Metric KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono text-xs">
                <div className="p-3 rounded-2xl glass border border-amber-500/30 bg-amber-950/20">
                  <div className="text-[10px] text-muted-foreground uppercase">
                    All-Time Record Sale
                  </div>
                  <div className="text-lg font-black text-amber-400 mt-0.5">$95,000 USD</div>
                  <div className="text-[9px] text-slate-400">apple.agent (Auction)</div>
                </div>

                <div className="p-3 rounded-2xl glass border border-cyan-500/30 bg-cyan-950/20">
                  <div className="text-[10px] text-muted-foreground uppercase">
                    Total Top 20 Volume
                  </div>
                  <div className="text-lg font-black text-cyan-300 mt-0.5">$546,023 USD</div>
                  <div className="text-[9px] text-slate-400">R10,101,425 ZAR Equiv</div>
                </div>

                <div className="p-3 rounded-2xl glass border border-teal-500/30 bg-teal-950/20">
                  <div className="text-[10px] text-muted-foreground uppercase">Secondary ATH</div>
                  <div className="text-lg font-black text-teal-400 mt-0.5">$14,500 USD</div>
                  <div className="text-[9px] text-slate-400">ai.agent (Base)</div>
                </div>

                <div className="p-3 rounded-2xl glass border border-purple-500/30 bg-purple-950/20">
                  <div className="text-[10px] text-muted-foreground uppercase">
                    Active Settlement Rails
                  </div>
                  <div className="text-lg font-black text-purple-300 mt-0.5">x402 · SOL · BASE</div>
                  <div className="text-[9px] text-slate-400">Zero-Click Autonomous</div>
                </div>
              </div>

              {/* Ranked Leaderboard Table */}
              <div className="rounded-2xl glass border border-white/10 overflow-hidden font-mono text-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-black/60 text-[10px] text-muted-foreground uppercase border-b border-white/10">
                      <tr>
                        <th className="py-3 px-4">Rank</th>
                        <th className="py-3 px-4">Agent Handle</th>
                        <th className="py-3 px-4">Market</th>
                        <th className="py-3 px-4">Sale Price (USD)</th>
                        <th className="py-3 px-4">Buyer / Agent</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4 text-right">Payment Rail</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {leaderboardEntries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4">
                            <span
                              className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-bold text-[10px] ${
                                entry.rank === 1
                                  ? "bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/30"
                                  : entry.rank === 2
                                    ? "bg-slate-300 text-slate-950 font-black"
                                    : entry.rank === 3
                                      ? "bg-amber-700 text-white font-black"
                                      : "bg-white/10 text-muted-foreground"
                              }`}
                            >
                              {entry.rank}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-white">
                            <span>{entry.fullName}</span>
                            <span className="text-[9px] text-muted-foreground ml-1.5">
                              ({entry.length}c)
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                entry.marketType === "AUCTION"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : entry.marketType === "SECONDARY"
                                    ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                                    : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              }`}
                            >
                              {entry.marketType}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-black text-cyan-300">
                            ${entry.priceUsd.toLocaleString()}
                            <span className="text-[9px] text-muted-foreground block font-normal">
                              R{entry.priceZar.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            <div className="flex items-center gap-1.5">
                              {entry.buyerType === "AI_AGENT" ? (
                                <Bot className="w-3.5 h-3.5 text-purple-400" />
                              ) : (
                                <User className="w-3.5 h-3.5 text-cyan-400" />
                              )}
                              <span className="truncate max-w-[140px]">{entry.buyer}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground text-[11px]">
                            {new Date(entry.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10 text-[9.5px] font-bold text-slate-300 uppercase">
                              {entry.paymentMethod === "x402"
                                ? "x402 M2M"
                                : entry.network
                                  ? entry.network
                                  : entry.paymentMethod}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SPECIAL AUCTIONS */}
          {activeTab === "auctions" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
                <div>
                  <h3 className="text-sm font-extrabold text-white font-mono flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    Iconic &amp; Mainstream Brand Name Auctions
                  </h3>
                  <p className="text-xs text-muted-foreground font-sans">
                    High-demand single characters (0, 1, x), secret codes (007), and pre-reserved
                    brand names (Nike, Coke, Apple, Zara). Eligible for batch buying up to 20
                    records!
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {liveAuctions.length} Live Auctions
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {liveAuctions.map((rec) => {
                  const auc = rec.auction!;
                  return (
                    <div
                      key={rec.id}
                      className="p-4 sm:p-5 rounded-2xl glass border border-white/15 bg-gradient-to-b from-black/70 to-[#0a0f1d] shadow-xl space-y-3 relative overflow-hidden group hover:border-amber-400/50 transition-all font-mono"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-black text-white">{rec.fullName}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[9.5px] font-bold ${
                              rec.category === "PREMIUM_BRAND"
                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            {rec.category === "PREMIUM_BRAND"
                              ? "Brand Trademark"
                              : "Ultra-Rare Handle"}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          2d left
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 font-sans line-clamp-2">
                        {rec.description}
                      </p>

                      <div className="p-3 rounded-xl bg-black/50 border border-white/10 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-[10px] text-muted-foreground uppercase">Top Bid</div>
                          <div className="text-amber-400 font-extrabold text-sm">
                            ${auc.currentBidUsd.toLocaleString()} USD
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            by {auc.highestBidder}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-muted-foreground uppercase">
                            Next Min Bid
                          </div>
                          <div className="text-white font-bold text-sm">
                            ${auc.minNextBidUsd.toLocaleString()} USD
                          </div>
                          <div className="text-[10px] text-emerald-400 font-semibold">
                            {auc.bidsCount} bids recorded
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => handleAddToBatch(rec.name)}
                          className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Batch Buy Eligible</span>
                        </button>
                        <button
                          onClick={() => {
                            setBidTargetRecord(rec);
                            setBidAmountUsd(auc.minNextBidUsd);
                          }}
                          className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
                        >
                          Place Bid
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: SECONDARY MARKETPLACE */}
          {activeTab === "secondary" && (
            <div className="space-y-4 font-mono">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-teal-400" />
                    Secondary Agent Name Trading Marketplace
                  </h3>
                  <p className="text-xs text-muted-foreground font-sans">
                    Buy and trade registered sovereign agent handles peer-to-peer.
                  </p>
                </div>
                <button
                  onClick={() => setIsListModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow transition-all cursor-pointer"
                >
                  + List Name for Sale
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {secondaryListings.map((rec) => {
                  const sec = rec.secondaryListing!;
                  return (
                    <div
                      key={rec.id}
                      className="p-4 rounded-2xl glass border border-teal-500/30 bg-[#0a1220]/80 shadow-lg space-y-3 hover:border-teal-400 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-black text-white">{rec.fullName}</div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                          {sec.network.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 font-sans line-clamp-2">
                        {rec.description}
                      </p>

                      <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-muted-foreground uppercase">
                            Asking Price
                          </div>
                          <div className="text-sm font-black text-teal-400">
                            ${sec.listedPriceUsd.toLocaleString()} USD
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-muted-foreground uppercase">Seller</div>
                          <div className="text-xs text-slate-300 truncate max-w-[100px]">
                            {sec.seller}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleBuySecondary(rec)}
                        className="w-full py-2 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-black shadow transition-all active:scale-95 cursor-pointer"
                      >
                        Buy Now (${sec.listedPriceUsd.toLocaleString()})
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: x402 AGENT TERMINAL & SKILL */}
          {activeTab === "x402" && (
            <div className="space-y-4 max-w-4xl mx-auto font-mono text-xs">
              <div className="glass p-5 rounded-2xl border border-purple-500/30 bg-purple-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-purple-400" />
                    <h3 className="text-base font-extrabold text-white">
                      x402 Autonomous Machine-to-Machine Payment Protocol
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    HTTP 402 Standard
                  </span>
                </div>

                <p className="text-slate-300 font-sans text-xs leading-relaxed">
                  Autonomous AI agents navigate and purchase .agent handles programmatically without
                  requiring human click approvals. Anti-spam protection charges $0.20 for 7+
                  character handles, preventing bot swarm squatting attacks.
                </p>

                {/* Sample x402 Challenge Preview */}
                <div className="p-3.5 rounded-xl bg-black/80 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-muted-foreground text-[10px]">
                    <span>Sample Live x402 Header Response (HTTP 402)</span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          JSON.stringify(getX402PaymentQuote("mybot", true), null, 2),
                          "x402 Sample JSON",
                        )
                      }
                      className="flex items-center gap-1 text-purple-400 hover:text-white cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      Copy JSON
                    </button>
                  </div>
                  <pre className="text-[11px] text-teal-300 overflow-x-auto p-2 bg-black/60 rounded">
                    {JSON.stringify(getX402PaymentQuote("mybot", true), null, 2)}
                  </pre>
                </div>

                {/* Example cURL for Autonomous Agent */}
                <div className="p-3.5 rounded-xl bg-black/80 border border-white/10 space-y-2">
                  <div className="text-muted-foreground text-[10px]">
                    Autonomous AI Agent 1-Liner cURL:
                  </div>
                  <div className="p-2.5 rounded bg-black/60 text-amber-300 text-[11px] overflow-x-auto flex items-center justify-between">
                    <code>
                      curl -X POST /api/names/claim -H "X-402-Payment-Token: vault_agent_token" -d '
                      {'{"name":"alpha","type":"merchant","paymentMethod":"x402"}'}'
                    </code>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `curl -X POST /api/names/claim -H "X-402-Payment-Token: vault_agent_token" -d '{"name":"alpha","type":"merchant","paymentMethod":"x402"}'`,
                          "Agent cURL",
                        )
                      }
                      className="ml-2 text-white/60 hover:text-white cursor-pointer shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BATCH REGISTRATION CART DRAWER */}
        {isBatchDrawerOpen && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md"
            onClick={() => setIsBatchDrawerOpen(false)}
          >
            <div
              className="w-full max-w-lg p-5 sm:p-6 rounded-3xl glass border border-cyan-500/40 bg-[#070d18] shadow-2xl space-y-4 font-mono text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-base font-extrabold text-white">
                    Batch Registration Queue ({batchCart.length}/20)
                  </h3>
                </div>
                <button
                  onClick={() => setIsBatchDrawerOpen(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Anti-spam rule alert */}
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-slate-300 font-sans">
                <strong>Batch Policy:</strong> Up to 20 names allowed for 1, 2, and 3-character
                handles. If registering standard 4+ character handles, only 1 name per registration
                is permitted.
              </div>

              {/* Cart items list */}
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {batchCart.map((name) => {
                  const p = calculateNamePricing(name, isAgentMode);
                  return (
                    <div
                      key={name}
                      className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-white font-bold">{name}.agent</span>
                        <span className="text-[10px] text-muted-foreground ml-2">
                          ({p.length} chars · {p.tierLabel})
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-cyan-300 font-bold">
                          {p.isFreeTier ? "FREE" : `$${p.priceUsd}`}
                        </span>
                        <button
                          onClick={() => handleRemoveFromBatch(name)}
                          className="text-red-400 hover:text-red-300 cursor-pointer"
                          title="Remove from batch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Summary */}
              <div className="p-3 rounded-xl bg-black/80 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">
                    Total Batch Cost
                  </div>
                  <div className="text-lg font-black text-cyan-300">
                    ${batchValidation.totalCostUsd.toLocaleString()} USDC
                  </div>
                </div>
                <div className="text-right text-[10px] text-muted-foreground">
                  R{Math.round(batchValidation.totalCostUsd * 18.5).toLocaleString()} ZAR
                </div>
              </div>

              {/* Validation Warning */}
              {!batchValidation.allowed && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{batchValidation.reason}</span>
                </div>
              )}

              {/* Batch Checkout Button */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setBatchCart([])}
                  className="px-3 py-2.5 rounded-xl border border-white/10 text-muted-foreground hover:text-white transition-all cursor-pointer"
                >
                  Clear
                </button>
                <button
                  onClick={handleExecuteBatchClaim}
                  disabled={!batchValidation.allowed || isClaiming || batchCart.length === 0}
                  className="flex-1 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Zap className={`w-4 h-4 ${isClaiming ? "animate-spin" : ""}`} />
                  <span>
                    {isClaiming
                      ? "Securing Batch..."
                      : `Batch Register (${batchCart.length} Handles)`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SINGLE CLAIM MODAL DRAWER OVERLAY */}
        {claimTargetName && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md"
            onClick={() => setClaimTargetName(null)}
          >
            <div
              className="w-full max-w-lg p-5 sm:p-6 rounded-3xl glass border border-cyan-500/40 bg-[#070d18] shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-base font-extrabold text-white font-mono">
                    Claim {claimTargetName}.agent
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Select payment rail: Card, Multi-Chain Crypto, or Autonomous x402.
                  </p>
                </div>
                <button
                  onClick={() => setClaimTargetName(null)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Price & Length breakdown */}
              {(() => {
                const p = calculateNamePricing(claimTargetName, isAgentMode);
                return (
                  <div className="p-3 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between font-mono text-xs">
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase">
                        {p.tierLabel}
                      </div>
                      <div className="text-white font-bold">{p.length} Characters</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-cyan-300">
                        {p.isFreeTier ? "FREE ($0.00)" : `$${p.priceUsd} USDC`}
                      </div>
                      <div className="text-[10px] text-muted-foreground">R{p.priceZar} ZAR</div>
                    </div>
                  </div>
                );
              })()}

              {/* Handle Purpose */}
              <div className="space-y-1.5 font-mono text-xs">
                <label className="text-[10px] text-muted-foreground uppercase">
                  Agent Designation
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setClaimType("personal")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      claimType === "personal"
                        ? "border-cyan-400 bg-cyan-500/20 text-cyan-300"
                        : "border-white/10 bg-black/40 text-muted-foreground"
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    Personal Agent
                  </button>
                  <button
                    onClick={() => setClaimType("merchant")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      claimType === "merchant"
                        ? "border-cyan-400 bg-cyan-500/20 text-cyan-300"
                        : "border-white/10 bg-black/40 text-muted-foreground"
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" />
                    Merchant Store
                  </button>
                </div>
              </div>

              {/* Payment Rail Selector */}
              <div className="space-y-1.5 font-mono text-xs">
                <label className="text-[10px] text-muted-foreground uppercase">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setClaimPaymentMethod("card")}
                    className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      claimPaymentMethod === "card"
                        ? "border-cyan-400 bg-cyan-500/20 text-cyan-300"
                        : "border-white/10 bg-black/40 text-muted-foreground"
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Credit Card</span>
                  </button>

                  <button
                    onClick={() => setClaimPaymentMethod("crypto")}
                    className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      claimPaymentMethod === "crypto"
                        ? "border-teal-400 bg-teal-500/20 text-teal-300"
                        : "border-white/10 bg-black/40 text-muted-foreground"
                    }`}
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Crypto</span>
                  </button>

                  <button
                    onClick={() => setClaimPaymentMethod("x402")}
                    className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      claimPaymentMethod === "x402"
                        ? "border-purple-400 bg-purple-500/20 text-purple-300"
                        : "border-white/10 bg-black/40 text-muted-foreground"
                    }`}
                  >
                    <Bot className="w-4 h-4" />
                    <span>x402 Agent</span>
                  </button>
                </div>
              </div>

              {/* Sub-form: Card Details */}
              {claimPaymentMethod === "card" && (
                <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Cardholder Tokenization</span>
                    <span className="text-emerald-400">Verified Stripe/Passkey</span>
                  </div>
                  <input
                    type="text"
                    value={claimCardDetails.name}
                    onChange={(e) =>
                      setClaimCardDetails({ ...claimCardDetails, name: e.target.value })
                    }
                    className="w-full p-2 rounded-lg bg-black border border-white/15 text-white text-xs"
                    placeholder="Full Name"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={claimCardDetails.cardNumber}
                      className="col-span-2 p-2 rounded-lg bg-black border border-white/15 text-white text-xs"
                      readOnly
                    />
                    <input
                      type="text"
                      value={claimCardDetails.expiry}
                      className="p-2 rounded-lg bg-black border border-white/15 text-white text-xs text-center"
                      readOnly
                    />
                  </div>
                </div>
              )}

              {/* Sub-form: Crypto Network Selector */}
              {claimPaymentMethod === "crypto" && (
                <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Select Settlement Network</span>
                    <span className="text-cyan-300">${userUsdcBalance} USDC Avail</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(["base", "arc", "solana"] as CryptoNetwork[]).map((net) => (
                      <button
                        key={net}
                        onClick={() => setClaimCryptoNetwork(net)}
                        className={`p-2 rounded-lg border text-xs uppercase font-bold transition-all cursor-pointer ${
                          claimCryptoNetwork === net
                            ? "border-teal-400 bg-teal-500/20 text-teal-300"
                            : "border-white/10 bg-black/60 text-muted-foreground"
                        }`}
                      >
                        {net}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-form: x402 Autonomous Agent */}
              {claimPaymentMethod === "x402" && (
                <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Autonomous Agent ID</span>
                    <span className="text-purple-400">Zero-Click Protocol</span>
                  </div>
                  <input
                    type="text"
                    value={claimAgentId}
                    onChange={(e) => setClaimAgentId(e.target.value)}
                    className="w-full p-2 rounded-lg bg-black border border-white/15 text-purple-300 text-xs"
                    placeholder="agent_identifier"
                  />
                  <div className="text-[10px] text-slate-400 font-sans">
                    Agent will dispatch signed HTTP 402 proof voucher directly to AutoCom
                    clearinghouse.
                  </div>
                </div>
              )}

              {/* Execute Claim Button */}
              <button
                onClick={handleExecuteClaim}
                disabled={isClaiming}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 text-slate-950 font-mono text-xs font-black shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap className={`w-4 h-4 ${isClaiming ? "animate-spin" : ""}`} />
                {isClaiming ? "Settling Ownership..." : `Confirm & Secure ${claimTargetName}.agent`}
              </button>
            </div>
          </div>
        )}

        {/* AUCTION BID MODAL OVERLAY */}
        {bidTargetRecord && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md"
            onClick={() => setBidTargetRecord(null)}
          >
            <div
              className="w-full max-w-lg p-5 sm:p-6 rounded-3xl glass border border-amber-500/40 bg-[#0c0d18] shadow-2xl space-y-4 font-mono text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-extrabold text-white">
                    Bid on {bidTargetRecord.fullName}
                  </h3>
                </div>
                <button
                  onClick={() => setBidTargetRecord(null)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">Current Bid</div>
                  <div className="text-base font-black text-amber-400">
                    ${bidTargetRecord.auction?.currentBidUsd.toLocaleString()} USD
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-muted-foreground uppercase">Minimum Next</div>
                  <div className="text-sm font-bold text-white">
                    ${bidTargetRecord.auction?.minNextBidUsd.toLocaleString()} USD
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground uppercase">
                  Your Bid (USD)
                </label>
                <input
                  type="number"
                  min={bidTargetRecord.auction?.minNextBidUsd}
                  value={bidAmountUsd}
                  onChange={(e) => setBidAmountUsd(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-black border border-amber-500/40 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground uppercase">
                  Payment / Escrow Rail
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setBidMethod("crypto")}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      bidMethod === "crypto"
                        ? "border-teal-400 bg-teal-500/20 text-teal-300"
                        : "border-white/10 bg-black/40 text-muted-foreground"
                    }`}
                  >
                    Multi-Chain Crypto
                  </button>
                  <button
                    onClick={() => setBidMethod("x402")}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      bidMethod === "x402"
                        ? "border-purple-400 bg-purple-500/20 text-purple-300"
                        : "border-white/10 bg-black/40 text-muted-foreground"
                    }`}
                  >
                    x402 Agent Escrow
                  </button>
                </div>
              </div>

              {bidMethod === "crypto" && (
                <div className="grid grid-cols-3 gap-2">
                  {(["base", "arc", "solana"] as CryptoNetwork[]).map((net) => (
                    <button
                      key={net}
                      onClick={() => setBidNetwork(net)}
                      className={`p-2 rounded-lg border text-xs uppercase font-bold cursor-pointer ${
                        bidNetwork === net
                          ? "border-amber-400 bg-amber-500/20 text-amber-300"
                          : "border-white/10 bg-black/40 text-muted-foreground"
                      }`}
                    >
                      {net}
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={handleExecuteBid}
                disabled={
                  isBidding || bidAmountUsd < (bidTargetRecord.auction?.minNextBidUsd || 1000)
                }
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <Gavel className={`w-4 h-4 ${isBidding ? "animate-spin" : ""}`} />
                {isBidding
                  ? "Broadcasting Bid..."
                  : `Submit $${bidAmountUsd.toLocaleString()} USD Bid`}
              </button>
            </div>
          </div>
        )}

        {/* SECONDARY LISTING MODAL OVERLAY */}
        {isListModalOpen && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md"
            onClick={() => setIsListModalOpen(false)}
          >
            <div
              className="w-full max-w-md p-5 rounded-3xl glass border border-teal-500/40 bg-[#071018] shadow-2xl space-y-4 font-mono text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-base font-extrabold text-white">List Your .agent Name</h3>
                <button
                  onClick={() => setIsListModalOpen(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground uppercase">Handle Name</label>
                <input
                  type="text"
                  placeholder="e.g. shopper99, mesh, alpha"
                  value={listNameInput}
                  onChange={(e) => setListNameInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-black border border-white/15 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground uppercase">
                  Asking Price (USD)
                </label>
                <input
                  type="number"
                  min="1"
                  value={listPriceInput}
                  onChange={(e) => setListPriceInput(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-black border border-white/15 text-white font-bold"
                />
              </div>

              <button
                onClick={handleCreateSecondaryListing}
                className="w-full py-2.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-black shadow-lg transition-all cursor-pointer"
              >
                Post to Secondary Marketplace
              </button>
            </div>
          </div>
        )}

        {/* TOAST POPUP */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-70 max-w-md p-4 rounded-2xl glass border border-cyan-400/50 bg-[#070e1c] shadow-2xl text-xs font-mono text-cyan-200 animate-slide-up flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
            <span className="flex-1 font-sans">{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="p-1 hover:text-white text-muted-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
