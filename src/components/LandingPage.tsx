import { useState } from "react";
import heroStoreImage from "@/assets/images/hero_autonomous_store_1790899130361.jpg";
import { type PasskeyUser, signOutPasskey } from "@/lib/passkey-auth";
import { AutoComLogo } from "@/components/AutoComLogo";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import { PitchDeckModal } from "@/components/PitchDeckModal";
import MallSimulator from "@/components/MallSimulator";
import { downloadPitchDeckPDF } from "@/lib/pitch-deck-pdf";
import { MonetizationMatrix } from "@/components/home/MonetizationMatrix";
import { AdLibraryView } from "@/components/adserver/AdLibraryView";
import type {
  Web3WalletState,
  AgentApiCredential,
  ArbitrageLedgerEntry,
  ShopifyIntegrationConfig,
  PriceElasticityPoint,
  SyndicatedCampaign,
  AttentionBiddingPool,
  SpatialAdCampaign,
  ChainNetwork,
} from "@/types/autocom";
import {
  Download,
  FileText,
  Sparkles,
  CheckCircle2,
  Store,
  Database,
  CreditCard,
  ShoppingBag,
  Wallet,
  Zap,
  Radio,
  Layers,
  ArrowRight,
} from "lucide-react";

interface LandingPageProps {
  currentUser: PasskeyUser | null;
  onOpenPasskeyModal: (mode: "signin" | "signup") => void;
  onLaunchLiveMesh: () => void;
  onOpenWalkthrough: () => void;
  onSignOut: () => void;
  onOpenMerchantDashboard?: () => void;
  onOpenOpenAdLibrary?: () => void;
  onOpenAutoWallet?: () => void;
  onOpenMarketplace?: () => void;
  onOpenWeb3Wallet?: () => void;
  walletUsdcBalance?: number;
  activeChain?: string;
  // Commercialization Engine & Ad Library Props
  walletState?: Web3WalletState;
  apiCredentials?: AgentApiCredential[];
  arbitrageLedger?: ArbitrageLedgerEntry[];
  shopifyIntegration?: ShopifyIntegrationConfig;
  priceElasticityCurve?: PriceElasticityPoint[];
  syndicatedCampaigns?: SyndicatedCampaign[];
  attentionPools?: AttentionBiddingPool[];
  campaigns?: SpatialAdCampaign[];
  onGenerateApiKey?: (tier?: "DEVELOPER_SANDBOX" | "ENTERPRISE_QUANTUM") => AgentApiCredential;
  onRecordArbitrageSavings?: (params: {
    agentId: string;
    merchantStore: string;
    dealItem: string;
    originalPriceZar: number;
    negotiatedPriceZar: number;
    settlementChain?: ChainNetwork;
  }) => ArbitrageLedgerEntry;
  onRunElasticitySimulation?: (params: {
    targetProduct: string;
    simulatedAgentCount: number;
    minDiscount: number;
    maxDiscount: number;
  }) => PriceElasticityPoint[];
  onClaimAffiliatePayout?: (campaignId: string) => number;
  onUpdateAttentionBidPool?: (
    poolId: string,
    maxBidUsdc: number,
    additionalBudgetUsdc: number,
  ) => void;
  onSponsorStorage?: (campaignId: string, amountUsdc: number) => void;
  onUploadCampaign?: (
    campaign: Omit<
      SpatialAdCampaign,
      | "id"
      | "impressionsCount"
      | "agentConversionsCount"
      | "instantAutoBagCount"
      | "spentAttentionUsdc"
    >,
  ) => void;
}

export function LandingPage({
  currentUser,
  onOpenPasskeyModal,
  onLaunchLiveMesh,
  onOpenWalkthrough,
  onSignOut,
  onOpenMerchantDashboard,
  onOpenOpenAdLibrary,
  onOpenAutoWallet,
  onOpenMarketplace,
  onOpenWeb3Wallet,
  walletUsdcBalance = 285.5,
  activeChain = "base",
  walletState = {
    address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    chainId: 8453,
    network: "base",
    balances: { USDC: 285.5, ERC_X402: 1420.0, ZAR: 3450.0 },
    isConnected: true,
    isConnecting: false,
    transactions: [],
  },
  apiCredentials = [],
  arbitrageLedger = [],
  shopifyIntegration = {
    shopUrl: "https://sandton-retail-flagship.myshopify.com",
    accessToken: "shpat_98fa7210b38c29188eaf",
    merchantName: "Sandton Retail Flagship",
    tier: "DYNAMIC_ENGINE",
    isConnected: true,
    lastSyncTimestamp: Date.now(),
    syncedInventoryCount: 42,
    maxInventoryLimit: "unlimited",
    syntheticAgentPassesMonthly: 18450,
    maxPassesMonthly: 50000,
    autoPriceElasticityReports: true,
    spatialFloorMapping: {
      mallName: "Sandton City Mall",
      storeNodeId: "node-zara-s1",
      corridorAnchor: "Level 1 North Passage",
      beaconUuid: "BEAC-SANDTON-01-N",
    },
  },
  priceElasticityCurve = [],
  syndicatedCampaigns = [],
  attentionPools = [],
  campaigns = [],
  onGenerateApiKey = () => ({
    id: "cred-default",
    apiKey: "ac_dev_dummy",
    apiSecret: "sec_dummy",
    tier: "DEVELOPER_SANDBOX",
    activeAgentBotsCount: 1,
    totalCorridorTicksUsed: 0,
    totalTicksLimit: 50000,
    arbitrageFeeRate: 0.015,
    totalValueSavedUsdc: 0,
    protocolArbitrageFeesCollectedUsdc: 0,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
    status: "ACTIVE",
  }),
  onRecordArbitrageSavings = () => ({
    id: "arb-default",
    txHash: "0x0",
    timestamp: Date.now(),
    agentId: "agent-0",
    merchantStore: "Store",
    dealItem: "Item",
    originalPriceZar: 100,
    negotiatedPriceZar: 80,
    totalValueSavedZar: 20,
    totalValueSavedUsdc: 1.1,
    arbitrageFeeSlicePercent: 1.5,
    arbitrageFeeCollectedUsdc: 0.01,
    settlementChain: "base",
    status: "CONFIRMED_ON_CHAIN",
  }),
  onRunElasticitySimulation = () => [],

  onClaimAffiliatePayout = () => 0,
  onUpdateAttentionBidPool = () => {},
  onSponsorStorage = () => {},
  onUploadCampaign,
}: LandingPageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pitchDeckOpen, setPitchDeckOpen] = useState(false);
  const [isDirectDownloading, setIsDirectDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDirectDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsDirectDownloading(true);
      await downloadPitchDeckPDF();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error("Direct PDF download error:", err);
    } finally {
      setIsDirectDownloading(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] w-full bg-background bg-aurora text-foreground select-none overflow-x-hidden pb-16 sm:pb-0">
      {/* 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3.5 py-3 sm:px-6 sm:py-4">
          {/* Zone 1: Wordmark */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2.5 text-left cursor-pointer group shrink-0"
          >
            <AutoComLogo size="md" />
            <span className="text-base sm:text-xl font-extrabold tracking-tight text-foreground">
              AutoCom
            </span>
          </button>

          {/* Zone 2: Clean Nav Links on Desktop */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-5 text-xs font-medium text-muted-foreground">
            <button
              onClick={onOpenMerchantDashboard}
              className="hover:text-teal-300 transition-colors cursor-pointer flex items-center gap-1.5 font-bold"
            >
              <Store className="w-3.5 h-3.5 text-teal-400" />
              <span>Merchant &amp; Shopify</span>
            </button>
            <button
              onClick={onOpenOpenAdLibrary}
              className="hover:text-indigo-300 transition-colors cursor-pointer flex items-center gap-1.5 font-bold"
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>Ad Library</span>
            </button>
            <button
              onClick={onOpenAutoWallet}
              className="hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1.5 font-bold"
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              <span>Auto-Wallet</span>
            </button>
            <button
              onClick={onOpenMarketplace}
              className="hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5 font-bold"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hardware Store</span>
            </button>
            <button
              onClick={() => setPitchDeckOpen(true)}
              className="text-amber-400 hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Pitch Deck</span>
            </button>
          </nav>

          {/* Zone 3: Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Web3 Multi-Chain Wallet Button */}
            {onOpenWeb3Wallet && (
              <button
                onClick={onOpenWeb3Wallet}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-teal-500/40 text-xs font-mono font-bold shadow-sm transition-all active:scale-95 cursor-pointer ring-1 ring-teal-500/20"
                title="Open Web3 Multi-Chain Rail"
              >
                <Wallet className="w-3.5 h-3.5 text-teal-400" />
                <span className="hidden sm:inline">${walletUsdcBalance.toFixed(1)} USDC</span>
                <span className="px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 text-[10px] font-mono capitalize">
                  {activeChain}
                </span>
              </button>
            )}

            {/* Direct PDF Download Quick Button */}
            <button
              onClick={handleDirectDownload}
              disabled={isDirectDownloading}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-teal-500/20 to-emerald-500/20 hover:from-teal-500/30 hover:to-emerald-500/30 text-teal-300 border border-teal-500/40 text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              title="Direct Download Pitch Deck PDF"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>PDF Downloaded</span>
                </>
              ) : isDirectDownloading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                  <span>Generating…</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-teal-400" />
                  <span>Pitch Deck (PDF)</span>
                </>
              )}
            </button>

            <PWAInstallButton className="hidden md:flex" />

            {currentUser ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="hidden sm:flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-mono text-primary">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="truncate max-w-[110px]">{currentUser.displayName}</span>
                </div>
                <button
                  onClick={onLaunchLiveMesh}
                  className="bg-cta rounded-xl px-3 sm:px-4 py-2 text-xs font-bold text-accent-foreground shadow-amber hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap min-h-[40px] flex items-center gap-1"
                >
                  <span>Launch 3D</span>
                  <span>→</span>
                </button>
                <button
                  onClick={() => {
                    signOutPasskey();
                    onSignOut();
                  }}
                  className="rounded-xl border border-border/80 px-2 sm:px-2.5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer min-h-[40px]"
                  title="Sign out"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => onOpenPasskeyModal("signin")}
                  className="rounded-xl border border-primary/40 bg-primary/10 px-2.5 sm:px-3.5 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors flex items-center gap-1 min-h-[40px] cursor-pointer"
                >
                  <span>🔑</span>
                  <span className="hidden xs:inline sm:inline">Passkey Sign In</span>
                  <span className="inline xs:hidden sm:hidden">Sign In</span>
                </button>
                <button
                  onClick={onLaunchLiveMesh}
                  className="bg-cta hidden sm:inline-flex rounded-xl px-4 py-2 text-xs font-bold text-accent-foreground shadow-amber hover:scale-105 active:scale-95 transition-all cursor-pointer min-h-[40px] items-center"
                >
                  Explore Mesh
                </button>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-border/50 bg-background/95 px-4 py-3 space-y-2 text-xs font-mono animate-in fade-in">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenMerchantDashboard) onOpenMerchantDashboard();
              }}
              className="block w-full text-left py-2 text-teal-300 font-bold hover:text-white"
            >
              🛍️ Merchant &amp; Shopify Hub
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenOpenAdLibrary) onOpenOpenAdLibrary();
              }}
              className="block w-full text-left py-2 text-indigo-300 font-bold hover:text-white"
            >
              📢 Open Ad &amp; Media Library
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenAutoWallet) onOpenAutoWallet();
              }}
              className="block w-full text-left py-2 text-amber-300 font-bold hover:text-white"
            >
              🎯 FinTech Auto-Wallet &amp; Wishlist
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenMarketplace) onOpenMarketplace();
              }}
              className="block w-full text-left py-2 text-cyan-300 font-bold hover:text-white"
            >
              📡 Hardware &amp; FinTech Store
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenWeb3Wallet) onOpenWeb3Wallet();
              }}
              className="block w-full text-left py-2 text-purple-300 font-bold hover:text-white"
            >
              🔵 Web3 Multi-Chain Wallet (${walletUsdcBalance.toFixed(1)} USDC)
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenWalkthrough();
              }}
              className="block w-full text-left py-2 text-primary font-bold hover:text-white"
            >
              💡 Interactive Walkthrough Guide
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setPitchDeckOpen(true);
              }}
              className="block w-full text-left py-2 text-amber-400 font-bold hover:text-white"
            >
              📄 View Pitch Deck
            </button>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section
        id="protocol"
        className="relative mx-auto max-w-5xl px-3.5 pt-8 pb-14 sm:px-6 sm:pt-16 sm:pb-24 text-center flex flex-col items-center"
      >
        {/* Unboxed Metadata Kicker */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-mono text-primary leading-tight">
          <span>AutoCom Mesh</span>
          <span aria-hidden="true">·</span>
          <span>WebAuthn FIDO2</span>
          <span aria-hidden="true">·</span>
          <span>50m Instant Settlement</span>
          <span aria-hidden="true">·</span>
          <span className="text-amber-400">Seed Stage</span>
        </div>

        {/* Big Headline */}
        <h1 className="mt-4 text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground text-balance leading-[1.08] sm:leading-[1.05] max-w-4xl mx-auto">
          Autonomous Realtime Commerce Network
        </h1>

        {/* Subheading */}
        <h2 className="mt-3.5 sm:mt-5 text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-accent text-balance leading-snug max-w-3xl mx-auto">
          Where personal AI shopping agents negotiate deals with merchant agents live within 50
          meters of retail stores and billboards
        </h2>

        {/* Descriptive Body */}
        <p className="mt-4 text-xs sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Never miss any brand specials, discounts, or promotions again. Your personal AI agent
          negotiates &gt;50% discounts for everything you love, pass by, or never walk into—while
          merchants push dynamic real-time deals to foot and commuter traffic 24/7/365.
        </p>

        {/* Responsive CTA Group */}
        <div className="mt-6 flex flex-col xs:flex-row sm:flex-row items-center justify-center gap-3 w-full sm:w-auto flex-wrap">
          <button
            onClick={onLaunchLiveMesh}
            className="bg-cta w-full sm:w-auto rounded-2xl px-6 sm:px-8 py-3.5 text-sm sm:text-base font-bold text-accent-foreground shadow-amber hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
          >
            <span>Launch 3D Proximity Mesh</span>
            <span>→</span>
          </button>

          {/* Interactive Pitch Deck Button */}
          <button
            onClick={() => setPitchDeckOpen(true)}
            className="rounded-2xl border border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 px-5 sm:px-6 py-3.5 text-sm sm:text-base font-bold text-amber-300 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px] w-full sm:w-auto shadow-lg shadow-amber-500/10"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>View Pitch Deck</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </button>

          {/* Direct Download Pitch Deck PDF */}
          <button
            onClick={handleDirectDownload}
            disabled={isDirectDownloading}
            className="rounded-2xl border border-teal-500/50 bg-teal-500/10 hover:bg-teal-500/20 px-5 sm:px-6 py-3.5 text-sm sm:text-base font-bold text-teal-300 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px] w-full sm:w-auto shadow-lg shadow-teal-500/10 disabled:opacity-50"
          >
            {downloadSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>PDF Downloaded!</span>
              </>
            ) : isDirectDownloading ? (
              <>
                <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                <span>Generating PDF…</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-teal-400" />
                <span>Download Deck (PDF)</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Proof Metrics */}
        <div className="mt-8 pt-5 grid grid-cols-3 gap-2 sm:gap-6 border-t border-border/40 w-full max-w-lg mx-auto text-center">
          <div className="p-1 sm:p-2">
            <p className="font-mono text-xl sm:text-3xl font-bold text-primary tabular-nums">
              20-50m
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Micro-Mesh Radius</p>
          </div>
          <div className="p-1 sm:p-2">
            <p className="font-mono text-xl sm:text-3xl font-bold text-accent tabular-nums">
              &lt;25ms
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">A2A Handshake</p>
          </div>
          <div className="p-1 sm:p-2">
            <p className="font-mono text-xl sm:text-3xl font-bold text-foreground tabular-nums">
              +50% OFF
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Avg Agent Bargain</p>
          </div>
        </div>

        {/* Ambient Distribution: 5 Surfaces Banner Section */}
        <div className="mt-12 sm:mt-16 w-full max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-mono font-bold">
            <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
            <span>Multi-Device Omnipresence</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight max-w-3xl mx-auto">
            Ambient distribution: One commerce layer. Five surfaces. Zero missed intent
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto">
            From smartphones, smartwatches, pocket AI devices to AR spatial glasses and connected
            vehicle dashboards; AutoCom unifies real-time agentic deal bargaining across every
            surface you interact with.
          </p>

          <div className="glass relative rounded-2xl sm:rounded-3xl p-2 sm:p-3 border border-teal-500/30 shadow-2xl overflow-hidden group">
            <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-border/80 bg-slate-950">
              <img
                src="/autocom-5-surfaces.jpg"
                alt="Ambient distribution: One commerce layer. Five surfaces. Zero missed intent"
                className="w-full h-auto object-cover rounded-xl shadow-lg transition-transform duration-500 group-hover:scale-[1.01]"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* 5 Surfaces Quick Navigation Grid Badges */}
            <div className="mt-3 grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2 text-left pt-1">
              <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900/80 border border-teal-500/20 space-y-0.5">
                <div className="text-teal-400 font-mono text-[10px] sm:text-xs font-black tracking-wider flex items-center gap-1">
                  <span>📱</span> PHONE
                </div>
                <p className="text-[10px] sm:text-xs font-medium text-slate-300">
                  Full spatial deal deck
                </p>
              </div>

              <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900/80 border border-teal-500/20 space-y-0.5">
                <div className="text-teal-400 font-mono text-[10px] sm:text-xs font-black tracking-wider flex items-center gap-1">
                  <span>⌚</span> WATCH
                </div>
                <p className="text-[10px] sm:text-xs font-medium text-slate-300">
                  Negotiation at a glance
                </p>
              </div>

              <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900/80 border border-teal-500/20 space-y-0.5">
                <div className="text-teal-400 font-mono text-[10px] sm:text-xs font-black tracking-wider flex items-center gap-1">
                  <span>🧭</span> MUSE
                </div>
                <p className="text-[10px] sm:text-xs font-medium text-slate-300">
                  Pocket ambient commerce
                </p>
              </div>

              <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900/80 border border-teal-500/20 space-y-0.5">
                <div className="text-teal-400 font-mono text-[10px] sm:text-xs font-black tracking-wider flex items-center gap-1">
                  <span>👓</span> AR GLASSES
                </div>
                <p className="text-[10px] sm:text-xs font-medium text-slate-300">
                  Offers inside the world
                </p>
              </div>

              <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900/80 border border-teal-500/20 space-y-0.5 col-span-2 xs:col-span-1 sm:col-span-1">
                <div className="text-teal-400 font-mono text-[10px] sm:text-xs font-black tracking-wider flex items-center gap-1">
                  <span>🚘</span> IN-CAR
                </div>
                <p className="text-[10px] sm:text-xs font-medium text-slate-300">
                  Offers on the dashboard
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Showcase: Live Mall Simulator Auto Grid Walk */}
        <div className="mt-10 sm:mt-14 w-full max-w-4xl mx-auto text-center space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-mono font-bold">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span>Interactive Live Simulation</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Mall Passage Walk × Agentic Commerce Simulation
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
            Watch autonomous AI shopping agents navigate indoor passage corridors, enter shops, and
            trigger real-time micro-deal negotiations.
          </p>

          <div className="pt-2 glass relative rounded-2xl sm:rounded-3xl p-2 sm:p-3 border border-border/80 shadow-2xl overflow-hidden group text-left">
            <MallSimulator compactEmbed={true} onLaunch3D={onLaunchLiveMesh} />
          </div>
        </div>

        {/* Commercialization Engine (Early-Stage Monetization Architectures) */}
        <div className="mt-12 sm:mt-20 w-full max-w-7xl mx-auto text-left">
          <MonetizationMatrix
            walletState={walletState}
            apiCredentials={apiCredentials}
            arbitrageLedger={arbitrageLedger}
            shopifyIntegration={shopifyIntegration}
            priceElasticityCurve={priceElasticityCurve}
            syndicatedCampaigns={syndicatedCampaigns}
            attentionPools={attentionPools}
            onGenerateApiKey={onGenerateApiKey}
            onRecordArbitrageSavings={onRecordArbitrageSavings}
            onRunElasticitySimulation={onRunElasticitySimulation}
            onClaimAffiliatePayout={onClaimAffiliatePayout}
            onUpdateAttentionBidPool={onUpdateAttentionBidPool}
            onOpenAdUploader={onOpenMerchantDashboard}
            onOpenAdLibrary={onOpenOpenAdLibrary}
            onOpenMarketplace={onOpenMarketplace}
          />
        </div>

        {/* Decentralized Open Ad & Media Library Public Showcase */}
        <div className="mt-12 sm:mt-16 w-full max-w-7xl mx-auto text-left">
          <AdLibraryView
            campaigns={campaigns}
            onSponsorStorage={onSponsorStorage}
            onUploadCampaign={onUploadCampaign}
            walletState={walletState}
          />
        </div>
      </section>

      {/* Value Proposition Grid: Consumers, Merchants & Brands */}
      <section className="py-12 sm:py-20 px-3.5 sm:px-6 max-w-7xl mx-auto border-t border-border/40">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <span className="text-xs font-mono text-primary uppercase tracking-widest font-bold">
            Tri-Sided Autonomous Marketplace
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground mt-2">
            Why Consumers, Merchants &amp; Brands Win with AutoCom
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            Converting passive impressions and lost foot traffic into guaranteed spatial commerce.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-6">
          {/* 1. Consumer Pillar */}
          <div className="glass p-5 sm:p-6 rounded-3xl border border-teal-500/30 space-y-3.5 relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center text-xl font-bold mb-3">
                🛍️
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">Consumers</h3>
              <p className="text-xs font-semibold text-teal-300 mt-1 mb-3">
                Never miss any brand specials, discounts, or promotions again.
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-teal-400 font-bold">✓</span>
                  <span>
                    <strong>+50% Algorithmic Discounts:</strong> Personal AI agent negotiates deep
                    bargains for items you love before you step inside.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-400 font-bold">✓</span>
                  <span>
                    <strong>Everything You Walk Past:</strong> Spatial radar captures live in-store
                    flash markdowns within 20m–50m.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-400 font-bold">✓</span>
                  <span>
                    <strong>Shops You Never Walk Into:</strong> Discovers boutique hidden gems and
                    secures unlisted vouchers automatically.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-400 font-bold">✓</span>
                  <span>
                    <strong>Passkey QR Checkout:</strong> Biometric checkout vouchers ready
                    instantly for the cashier.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* 2. Merchant Pillar */}
          <div className="glass p-5 sm:p-6 rounded-3xl border border-amber-500/30 space-y-3.5 relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-bold mb-3">
                🏬
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">Merchants</h3>
              <p className="text-xs font-semibold text-amber-300 mt-1 mb-3">
                An agentic salesman that never sleeps—monetizing all foot &amp; drive-by traffic.
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">✓</span>
                  <span>
                    <strong>Foot &amp; Commuter Drive-By:</strong> Pushes dynamic promos to walkers
                    and vehicles within 50m of your storefront 24/7/365.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">✓</span>
                  <span>
                    <strong>Dynamic Sales Targets:</strong> Pricing engine adjusts discounts based
                    on time of day, inventory surplus, and daily revenue quotas.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">✓</span>
                  <span>
                    <strong>Guaranteed Foot Traffic:</strong> Turns passive mall passersby into
                    paying walk-in customers with verified conversion.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">✓</span>
                  <span>
                    <strong>Zero POS Friction:</strong> Compatible with any existing retail POS
                    scanner via standard 2D QR token verification.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* 3. Brand Pillar */}
          <div className="glass p-5 sm:p-6 rounded-3xl border border-purple-500/30 space-y-3.5 relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-xl font-bold mb-3">
                🏷️
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                Brands &amp; Advertisers
              </h3>
              <p className="text-xs font-semibold text-purple-300 mt-1 mb-3">
                Converts billboard and digital adverts directly into closed in-store sales.
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">✓</span>
                  <span>
                    <strong>Never Miss Promotional Ads:</strong> Replaces unseen desktop ads with
                    direct, transactional pushes to nearby consumer AI agents.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">✓</span>
                  <span>
                    <strong>Billboard-to-Sale Conversion:</strong> Connected outdoor road network
                    billboards broadcast instant micro-deals to commuters.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">✓</span>
                  <span>
                    <strong>100% Attribution &amp; High ROI:</strong> Pay strictly on verified
                    redemptions and in-store basket sales rather than empty clicks.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">✓</span>
                  <span>
                    <strong>Co-Op Marketing Power:</strong> Brands co-fund localized retailer
                    promotions with real-time budget allocation controls.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team Section */}
      <section className="py-12 sm:py-16 px-3.5 sm:px-6 max-w-5xl mx-auto border-t border-border/40">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <span className="text-xs font-mono text-primary uppercase tracking-widest font-bold">
            Leadership Team
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground mt-1">
            Built by Pioneers in AI &amp; Spatial Commerce
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <div className="glass p-5 sm:p-6 rounded-2xl border border-border/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">Gugu Nyathi</h3>
                <p className="text-xs text-primary font-mono font-semibold">
                  Chief Executive Officer (CEO)
                </p>
              </div>
              <a
                href="https://www.linkedin.com/in/gugunyathi/"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 rounded-lg bg-[#0077b5]/20 text-[#0077b5] hover:bg-[#0077b5]/30 text-xs font-bold font-mono flex items-center gap-1 border border-[#0077b5]/40"
              >
                <span>LinkedIn</span>
                <span>↗</span>
              </a>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Spatial protocol architecture, autonomous AI agent bargaining networks, decentralized
              commerce infrastructure &amp; product vision.
            </p>
          </div>

          <div className="glass p-5 sm:p-6 rounded-2xl border border-border/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">Thami Nyathi</h3>
                <p className="text-xs text-accent font-mono font-semibold">
                  Chief Operating Officer (COO)
                </p>
              </div>
              <a
                href="https://www.linkedin.com/in/thaminyathi/"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 rounded-lg bg-[#0077b5]/20 text-[#0077b5] hover:bg-[#0077b5]/30 text-xs font-bold font-mono flex items-center gap-1 border border-[#0077b5]/40"
              >
                <span>LinkedIn</span>
                <span>↗</span>
              </a>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Commercial retail partnerships, merchant network onboarding, supply chain operations
              &amp; nationwide retail rollout execution.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/80 py-8 px-4 text-center text-xs text-muted-foreground space-y-3">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={() => setPitchDeckOpen(true)}
            className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Pitch Deck</span>
          </button>
          <span>·</span>
          <button
            onClick={handleDirectDownload}
            className="text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Deck PDF</span>
          </button>
          <span>·</span>
          <a href="mailto:hello@ribbonprotocol.org" className="hover:text-foreground">
            Contact: hello@ribbonprotocol.org
          </a>
        </div>
        <p>© 2026 AutoCom · Ribbon Protocol Inc. All rights reserved.</p>
      </footer>

      {/* Interactive Pitch Deck Modal */}
      <PitchDeckModal isOpen={pitchDeckOpen} onClose={() => setPitchDeckOpen(false)} />
    </div>
  );
}
