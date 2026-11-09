import React, { useState, useMemo } from "react";
import type {
  MonetizationStreamKey,
  MonetizationTier,
  AgentApiCredential,
  ArbitrageLedgerEntry,
  ShopifyIntegrationConfig,
  PriceElasticityPoint,
  SyndicatedCampaign,
  AttentionBiddingPool,
  Web3WalletState,
  ChainNetwork,
} from "@/types/autocom";
import {
  Code2,
  Store,
  Radio,
  Eye,
  Cpu,
  Sparkles,
  Zap,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Play,
  Layers,
  ArrowRight,
  Sliders,
  DollarSign,
  ChevronRight,
  Coins,
  RefreshCw,
  Share2,
  Building2,
  Tv,
  Globe,
  Lock,
  ExternalLink,
  Activity,
  BarChart3,
  Flame,
  Terminal,
  FileCode,
  SlidersHorizontal,
} from "lucide-react";

export interface MonetizationMatrixProps {
  walletState: Web3WalletState;
  apiCredentials: AgentApiCredential[];
  arbitrageLedger: ArbitrageLedgerEntry[];
  shopifyIntegration: ShopifyIntegrationConfig;
  priceElasticityCurve: PriceElasticityPoint[];
  syndicatedCampaigns: SyndicatedCampaign[];
  attentionPools: AttentionBiddingPool[];
  onGenerateApiKey: (tier?: "DEVELOPER_SANDBOX" | "ENTERPRISE_QUANTUM") => AgentApiCredential;
  onRecordArbitrageSavings: (params: {
    agentId: string;
    merchantStore: string;
    dealItem: string;
    originalPriceZar: number;
    negotiatedPriceZar: number;
    settlementChain?: ChainNetwork;
  }) => ArbitrageLedgerEntry;
  onRunElasticitySimulation: (params: {
    targetProduct: string;
    simulatedAgentCount: number;
    minDiscount: number;
    maxDiscount: number;
  }) => PriceElasticityPoint[];
  onClaimAffiliatePayout: (campaignId: string) => number;
  onUpdateAttentionBidPool: (
    poolId: string,
    maxBidUsdc: number,
    additionalBudgetUsdc: number,
  ) => void;
  onOpenAdUploader?: () => void;
  onOpenAdLibrary?: () => void;
  onOpenMarketplace?: () => void;
  onOpenAgentPortal?: () => void;
}

const MONETIZATION_TIERS: Record<MonetizationStreamKey, MonetizationTier[]> = {
  DEVELOPER_API_SANDBOX: [
    {
      id: "tier-dev-sandbox",
      stream: "DEVELOPER_API_SANDBOX",
      name: "Developer Sandbox Tier",
      priceMonthlyUsd: 49,
      priceMonthlyZar: 890,
      billingPeriod: "monthly",
      popular: true,
      badge: "Fast Track",
      description:
        "Ideal for Web3 & AI agent developers testing bot negotiation models in the high-density grid simulator.",
      specs: [
        "Up to 5 active autonomous agent bots",
        "50,000 spatial corridor simulation ticks/mo",
        "Standard WebSocket protocol access (Muse-ZA & Nibble-ZA)",
        "1.5% Arbitrage Protocol Fee on saved deal value",
        "Live testnet settlement on Base Sepolia & Arc Testnet",
      ],
      limits: {
        activeAgentBots: 5,
        spatialCorridorTicksMonthly: 50000,
        arbitrageProtocolFeePercent: 1.5,
      },
      ctaText: "Launch Developer Sandbox ($49/mo)",
    },
    {
      id: "tier-enterprise-quantum",
      stream: "DEVELOPER_API_SANDBOX",
      name: "Enterprise Quantum Tier",
      priceMonthlyUsd: 299,
      priceMonthlyZar: 5400,
      billingPeriod: "monthly",
      badge: "Zero Tolls",
      description:
        "High-throughput programmatic infrastructure for quant trading desks, retail consortia, and autonomous shopping fleets.",
      specs: [
        "Unlimited concurrent agent bots",
        "Unlimited spatial simulation ticks & sub-meter beacons",
        "Dedicated low-latency WebSocket & Webhook pipelines",
        "0% Protocol Arbitrage Fee (Keep 100% of saved value)",
        "Priority match queue with <2ms execution latency",
      ],
      limits: {
        activeAgentBots: "unlimited",
        spatialCorridorTicksMonthly: "unlimited",
        arbitrageProtocolFeePercent: 0,
      },
      ctaText: "Deploy Enterprise Fleet ($299/mo)",
    },
  ],

  SHOPIFY_SYNTHETIC_TRAFFIC: [
    {
      id: "tier-shopify-starter",
      stream: "SHOPIFY_SYNTHETIC_TRAFFIC",
      name: "Starter Sync Tier",
      priceMonthlyUsd: 19,
      priceMonthlyZar: 345,
      billingPeriod: "monthly",
      description:
        "Connect your single Shopify flagship and stress-test introductory pricing models against synthetic shopper agents.",
      specs: [
        "1 Connected Shopify Storefront",
        "Up to 100 synchronized inventory items",
        "1,000 synthetic agent passes per month",
        "Basic sub-meter indoor map node pinning",
        "Weekly automated pricing elasticity snapshot",
      ],
      limits: {
        shopifyStorefronts: 1,
        inventoryItemsMax: 100,
        syntheticAgentPassesMonthly: 1000,
        arbitrageProtocolFeePercent: 0,
      },
      ctaText: "Connect Starter Store ($19/mo)",
    },
    {
      id: "tier-shopify-dynamic",
      stream: "SHOPIFY_SYNTHETIC_TRAFFIC",
      name: "Dynamic Engine Tier",
      priceMonthlyUsd: 79,
      priceMonthlyZar: 1420,
      billingPeriod: "monthly",
      popular: true,
      badge: "Most Popular",
      description:
        "Full programmatic elasticity engine simulating live foot traffic surges, elasticity curves, and automated discount tuning.",
      specs: [
        "Unlimited Shopify Storefront connections",
        "Unlimited inventory items & variants sync",
        "50,000 synthetic agent passes per month",
        "Real-time Price Elasticity Simulator & Curve Visualizer",
        "Automated margin-maximizing dynamic discount trigger",
      ],
      limits: {
        shopifyStorefronts: "unlimited",
        inventoryItemsMax: "unlimited",
        syntheticAgentPassesMonthly: 50000,
        arbitrageProtocolFeePercent: 0,
      },
      ctaText: "Activate Dynamic Engine ($79/mo)",
    },
  ],

  BILLBOARD_AFFILIATE_NETWORK: [
    {
      id: "tier-cloud-syndicate",
      stream: "BILLBOARD_AFFILIATE_NETWORK",
      name: "Cloud Syndicate Tier",
      priceMonthlyUsd: 10,
      priceMonthlyZar: 180,
      billingPeriod: "monthly",
      description:
        "Digital content creators and marketers syndicate brand campaigns into the open ad library and earn tracking kickbacks.",
      specs: [
        "Up to 50 active syndicated spatial campaigns",
        "5% Operator Tracking Kickback on all fulfilled sales",
        "2% Autocomm platform facilitation fee retention",
        "Automated syndication to Meta & Google Location APIs",
        "Instant on-chain USDC wallet payouts",
      ],
      limits: {
        syndicatedCampaignsMax: 50,
        affiliateKickbackPercent: 5,
        platformFacilitationFeePercent: 2,
        arbitrageProtocolFeePercent: 0,
      },
      ctaText: "Join Cloud Syndicate ($10/mo)",
    },
    {
      id: "tier-pro-operator",
      stream: "BILLBOARD_AFFILIATE_NETWORK",
      name: "Pro Operator Franchise",
      priceMonthlyUsd: 149,
      priceMonthlyZar: 2700,
      billingPeriod: "upfront_hardware",
      popular: true,
      badge: "Hardware Included",
      description:
        "Physical node operators deploy Wide-Band Bluetooth Broadcasters & Roadside DOOH Amplifiers to capture local spatial revenue.",
      specs: [
        "Includes Physical Wide-Band BLE Broadcaster & Amplifier (100m reach)",
        "6-Month Prioritized Ad Cloud Server hosting allocation",
        "5% Operator Tracking Kickback + 1.5% Hardware Beacon Bonus",
        "Pairing with roadside programmatic DOOH billboards",
        "Lifetime sub-meter node ownership registration on Base",
      ],
      limits: {
        syndicatedCampaignsMax: "unlimited",
        affiliateKickbackPercent: 6.5,
        platformFacilitationFeePercent: 2,
        arbitrageProtocolFeePercent: 0,
      },
      ctaText: "Order Hardware Franchise ($149)",
    },
  ],

  TOKENIZED_ATTENTION_POOL: [
    {
      id: "tier-attention-per-tick",
      stream: "TOKENIZED_ATTENTION_POOL",
      name: "Anti-Ad-Block Tokenized Attention Rail",
      priceMonthlyUsd: 0.05,
      priceMonthlyZar: 0.9,
      billingPeriod: "per_tick",
      popular: true,
      badge: "Web3 Utility",
      description:
        "Brands deposit USDC into tokenized pools to bypass consumer ad-blockers and push verified spatial deals directly to personal AI agents.",
      specs: [
        "Dynamic bidding starting at $0.05 per verified agent attention tick",
        "80% pool value distributed directly to consumer agents/wallets",
        "20% locked by Autocomm Protocol as network utility facilitation fee",
        "Zero ad-block filtering: Cryptographically signed on Base & ARC",
        "Sub-meter proximity trigger verification before payout release",
      ],
      limits: {
        costPerAttentionVerificationTickUsdc: 0.05,
        networkUtilityLockPercent: 20,
        arbitrageProtocolFeePercent: 0,
      },
      ctaText: "Fund Attention Bidding Pool",
    },
  ],
};

export function MonetizationMatrix({
  walletState,
  apiCredentials,
  arbitrageLedger,
  shopifyIntegration,
  priceElasticityCurve,
  syndicatedCampaigns,
  attentionPools,
  onGenerateApiKey,
  onRecordArbitrageSavings,
  onRunElasticitySimulation,
  onClaimAffiliatePayout,
  onUpdateAttentionBidPool,
  onOpenAdUploader,
  onOpenAdLibrary,
  onOpenMarketplace,
  onOpenAgentPortal,
}: MonetizationMatrixProps) {
  const [activeStream, setActiveStream] = useState<MonetizationStreamKey>("DEVELOPER_API_SANDBOX");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Playground 1: Developer Bot Simulation States
  const [simAgentType, setSimAgentType] = useState<"Muse-ZA (Aggressive)" | "Nibble-ZA (Value)">(
    "Muse-ZA (Aggressive)",
  );
  const [simOriginalPrice, setSimOriginalPrice] = useState<number>(1899);
  const [simTargetDiscount, setSimTargetDiscount] = useState<number>(45);
  const [simSimulatingBot, setSimSimulatingBot] = useState(false);
  const [lastSimResult, setLastSimResult] = useState<ArbitrageLedgerEntry | null>(null);

  // Playground 2: Shopify Synthetic Traffic States
  const [simTrafficVolume, setSimTrafficVolume] = useState<number>(2500);
  const [simMinDiscount, setSimMinDiscount] = useState<number>(15);
  const [simMaxDiscount, setSimMaxDiscount] = useState<number>(55);
  const [simRunningElasticity, setSimRunningElasticity] = useState(false);

  // Playground 3: Billboard Affiliate States
  const [simBillboardFootTraffic, setSimBillboardFootTraffic] = useState<number>(12500);
  const [simConversionRate, setSimConversionRate] = useState<number>(3.5);
  const [claimedNotice, setClaimedNotice] = useState<string | null>(null);

  // Playground 4: Attention Bidding States
  const [bidSliderValue, setBidSliderValue] = useState<number>(0.08);
  const [additionalDepositUsdc, setAdditionalDepositUsdc] = useState<number>(150);
  const [updatedPoolNotice, setUpdatedPoolNotice] = useState(false);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Run Bot Negotiation Simulation
  const handleExecuteBotNegotiation = () => {
    setSimSimulatingBot(true);
    setTimeout(() => {
      const negotiatedPrice = Math.round(simOriginalPrice * (1 - simTargetDiscount / 100));
      const entry = onRecordArbitrageSavings({
        agentId:
          simAgentType === "Muse-ZA (Aggressive)" ? "bot-muse-za-live" : "bot-nibble-za-live",
        merchantStore: "Zara Fashion Sandton",
        dealItem: "Urban Wool Trench Coat",
        originalPriceZar: simOriginalPrice,
        negotiatedPriceZar: negotiatedPrice,
        settlementChain: walletState.network,
      });
      setLastSimResult(entry);
      setSimSimulatingBot(false);
    }, 600);
  };

  // Run Shopify Elasticity Recalculation
  const handleTriggerElasticityRecalc = () => {
    setSimRunningElasticity(true);
    setTimeout(() => {
      onRunElasticitySimulation({
        targetProduct: "Zara Wool Trench Coat",
        simulatedAgentCount: simTrafficVolume,
        minDiscount: simMinDiscount,
        maxDiscount: simMaxDiscount,
      });
      setSimRunningElasticity(false);
    }, 500);
  };

  // Claim Affiliate Payout
  const handleClaimPayout = (campId: string) => {
    const amount = onClaimAffiliatePayout(campId);
    setClaimedNotice(
      `Successfully claimed $${amount.toFixed(2)} USDC to your connected Web3 wallet!`,
    );
    setTimeout(() => setClaimedNotice(null), 3500);
  };

  // Update Attention Pool
  const handleUpdateBidPoolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAttentionBidPool("pool-zara-1", bidSliderValue, additionalDepositUsdc);
    setUpdatedPoolNotice(true);
    setTimeout(() => setUpdatedPoolNotice(false), 3000);
  };

  // Total Arbitrage Protocol Fees
  const totalArbitrageCollected = useMemo(() => {
    return arbitrageLedger.reduce((acc, curr) => acc + curr.arbitrageFeeCollectedUsdc, 0);
  }, [arbitrageLedger]);

  const totalValueSavedByAgents = useMemo(() => {
    return arbitrageLedger.reduce((acc, curr) => acc + curr.totalValueSavedUsdc, 0);
  }, [arbitrageLedger]);

  return (
    <section className="relative w-full rounded-3xl bg-slate-950/90 border border-teal-500/30 shadow-2xl p-4 sm:p-8 space-y-8 overflow-hidden backdrop-blur-xl text-slate-100 my-8">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-teal-500/20 to-emerald-500/20 text-teal-300 font-mono text-xs font-extrabold border border-teal-500/40 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>COMMERCIALIZATION ENGINE · V3</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[11px] border border-indigo-500/40">
              4 Monetization Rails Active
            </span>
          </div>

          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            Next-Gen Spatial Commerce &amp; Agentic Monetization Matrix
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Monetizing autonomous agent bot simulations, Shopify dynamic pricing, decentralized
            billboard node franchises, and tokenized attention anti-ad-block pools.
          </p>
        </div>

        {/* Quick Protocol Stats */}
        <div className="grid grid-cols-2 gap-3 shrink-0 font-mono text-xs">
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-teal-500/30 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">
              Protocol Arbitrage Tolls
            </span>
            <p className="text-base font-extrabold text-teal-300">
              ${totalArbitrageCollected.toFixed(2)} USDC
            </p>
            <p className="text-[10px] text-slate-400">1.5% saved value slice</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-indigo-500/30 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">
              Agent Deal Value Saved
            </span>
            <p className="text-base font-extrabold text-indigo-300">
              ${totalValueSavedByAgents.toFixed(2)} USDC
            </p>
            <p className="text-[10px] text-slate-400">Autonomous Negotiations</p>
          </div>
        </div>
      </div>

      {/* 4 Stream Navigation Tabs */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-2.5 bg-slate-900/70 p-1.5 rounded-2xl border border-slate-800">
        {[
          {
            id: "DEVELOPER_API_SANDBOX" as MonetizationStreamKey,
            label: "1. Developer API Sandbox",
            icon: Code2,
            tag: "$49–$299/mo",
            color: "teal",
          },
          {
            id: "SHOPIFY_SYNTHETIC_TRAFFIC" as MonetizationStreamKey,
            label: "2. Shopify Elasticity Hub",
            icon: Store,
            tag: "$19–$79/mo",
            color: "emerald",
          },
          {
            id: "BILLBOARD_AFFILIATE_NETWORK" as MonetizationStreamKey,
            label: "3. Billboard Node Affiliate",
            icon: Radio,
            tag: "5% Kickback + $149",
            color: "indigo",
          },
          {
            id: "TOKENIZED_ATTENTION_POOL" as MonetizationStreamKey,
            label: "4. Tokenized Attention Pools",
            icon: Eye,
            tag: "$0.05/Tick",
            color: "purple",
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeStream === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveStream(tab.id)}
              className={`p-3 rounded-xl font-bold text-xs transition-all flex flex-col items-start gap-1 cursor-pointer text-left ${
                isActive
                  ? "bg-gradient-to-r from-teal-500/25 to-emerald-500/20 text-white border border-teal-500/60 shadow-lg shadow-teal-500/10 scale-[1.01]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <Icon className={`w-4 h-4 ${isActive ? "text-teal-400" : "text-slate-400"}`} />
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950/80 text-teal-300 border border-teal-500/30">
                  {tab.tag}
                </span>
              </div>
              <span className="font-extrabold text-slate-100 text-xs truncate w-full">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          STREAM 1: B2B DEVELOPER AGENTIC API SANDBOXES & SIMULATION TOLLS
         ========================================================================= */}
      {activeStream === "DEVELOPER_API_SANDBOX" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Stream Overview */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-950/40 via-slate-900/60 to-slate-950 border border-teal-500/40 space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/40">
                <Code2 className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  B2B Developer Agentic API Sandboxes &amp; Simulation Tolls
                </h3>
                <p className="text-xs text-slate-300">
                  Monetize high-frequency AI bot traffic testing A2A micro-deal negotiation
                  protocols in the sub-meter corridor simulation before real-world human deployment.
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Commercial Pricing Tiers
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MONETIZATION_TIERS.DEVELOPER_API_SANDBOX.map((tier) => (
                <div
                  key={tier.id}
                  className={`p-5 rounded-2xl bg-slate-900/80 border flex flex-col justify-between space-y-4 ${
                    tier.popular
                      ? "border-teal-500 shadow-xl shadow-teal-500/10"
                      : "border-slate-800"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-extrabold text-base text-white">{tier.name}</h5>
                      {tier.badge && (
                        <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-mono font-bold border border-teal-500/40">
                          {tier.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1.5 font-mono">
                      <span className="text-3xl font-black text-white">
                        ${tier.priceMonthlyUsd}
                      </span>
                      <span className="text-xs text-slate-400">
                        / month (R{tier.priceMonthlyZar})
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{tier.description}</p>
                    <ul className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                      {tier.specs.map((spec, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span>{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      if (onOpenAgentPortal) {
                        onOpenAgentPortal();
                      } else {
                        onGenerateApiKey(
                          tier.id === "tier-enterprise-quantum"
                            ? "ENTERPRISE_QUANTUM"
                            : "DEVELOPER_SANDBOX",
                        );
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs font-mono shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    <span>{tier.ctaText}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Clean Visual Showcase Callout Card (Developer Tools Moved to Dedicated Page) */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-950/70 via-slate-900/90 to-slate-950 border border-teal-500/40 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl text-left font-mono">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  <Terminal className="w-5 h-5 text-teal-400" />
                </span>
                <div>
                  <h4 className="text-base sm:text-lg font-black text-white">
                    Agent API Tokens, 1.5% Arbitrage Ledger &amp; Live Playground
                  </h4>
                  <p className="text-xs text-teal-300 font-bold">
                    Now accessible via the Navigation Menu in the dedicated Developer Portal.
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                To keep the landing page optimized for visually selling the app, all programmatic
                agent token generation, live 1.5% Web3 toll split ledgers, bot negotiation
                playgrounds, and WebSocket how-to guides have been organized into the dedicated
                Developer Hub.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <button
                onClick={onOpenAgentPortal}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-black text-xs font-mono shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Code2 className="w-4 h-4" />
                <span>Launch Developer Portal →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STREAM 2: SHOPIFY "SYNTHETIC TRAFFIC" PRICING SANDBOX
         ========================================================================= */}
      {activeStream === "SHOPIFY_SYNTHETIC_TRAFFIC" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-slate-950 border border-emerald-500/40 space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <Store className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Shopify "Synthetic Traffic" Pricing Sandbox
                </h3>
                <p className="text-xs text-slate-300">
                  Allow Shopify merchants to sync active inventory, simulate agentic foot traffic
                  passing virtual store nodes, and stress-test automated dynamic pricing engines.
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Merchant Subscription Tiers
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MONETIZATION_TIERS.SHOPIFY_SYNTHETIC_TRAFFIC.map((tier) => (
                <div
                  key={tier.id}
                  className={`p-5 rounded-2xl bg-slate-900/80 border flex flex-col justify-between space-y-4 ${
                    tier.popular
                      ? "border-emerald-500 shadow-xl shadow-emerald-500/10"
                      : "border-slate-800"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-extrabold text-base text-white">{tier.name}</h5>
                      {tier.badge && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/40">
                          {tier.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1.5 font-mono">
                      <span className="text-3xl font-black text-white">
                        ${tier.priceMonthlyUsd}
                      </span>
                      <span className="text-xs text-slate-400">
                        / month (R{tier.priceMonthlyZar})
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{tier.description}</p>
                    <ul className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                      {tier.specs.map((spec, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs font-mono shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2">
                    <Store className="w-4 h-4" />
                    <span>{tier.ctaText}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Price Elasticity Visualizer */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-emerald-500/40 space-y-6 font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h4 className="font-black text-sm text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Price Elasticity Simulator &amp; Conversion Curve</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Simulating synthetic agent acceptances/rejections across discount increments.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleTriggerElasticityRecalc}
                  disabled={simRunningElasticity}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs shadow-md hover:bg-emerald-400 transition-all cursor-pointer flex items-center gap-2"
                >
                  {simRunningElasticity ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  <span>Recalculate Curve</span>
                </button>
              </div>
            </div>

            {/* Elasticity Visual Bar Chart */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {priceElasticityCurve.map((pt) => (
                <div
                  key={pt.discountPercent}
                  className={`p-3.5 rounded-2xl border flex flex-col justify-between text-center space-y-3 transition-all ${
                    pt.optimalElasticityScore >= 90
                      ? "bg-emerald-500/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/10"
                      : "bg-slate-950 border-slate-800 text-slate-300"
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-base font-extrabold text-white">
                      -{pt.discountPercent}%
                    </span>
                    <p className="text-[10px] text-slate-400">Discount</p>
                  </div>

                  {/* Visual Bar Height */}
                  <div className="w-full bg-slate-900 rounded-full h-16 relative flex items-end p-1">
                    <div
                      className="w-full bg-gradient-to-t from-emerald-500 to-teal-300 rounded-lg transition-all duration-500"
                      style={{ height: `${pt.conversionRatePercent}%` }}
                    />
                  </div>

                  <div className="space-y-0.5 text-[10px]">
                    <p className="font-bold text-emerald-400">{pt.conversionRatePercent}% Conv</p>
                    <p className="text-slate-400">Net R{pt.netMarginZar.toLocaleString()}</p>
                    {pt.optimalElasticityScore >= 90 && (
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-emerald-400 text-slate-950 font-black text-[9px]">
                        OPTIMAL
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Config Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Synthetic Agent Passes:</span>
                  <strong className="text-emerald-400">
                    {simTrafficVolume.toLocaleString()} bots/hr
                  </strong>
                </div>
                <input
                  type="range"
                  min="500"
                  max="10000"
                  step="500"
                  value={simTrafficVolume}
                  onChange={(e) => setSimTrafficVolume(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Shopify Connected Node:</span>
                  <strong className="text-teal-300">{shopifyIntegration.merchantName}</strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-300 truncate">
                  Corridor Anchor: {shopifyIntegration.spatialFloorMapping.corridorAnchor}
                </div>
              </div>
            </div>
          </div>

          {/* Technical Guide Callout */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <FileCode className="w-4 h-4 text-emerald-400" />
              </span>
              <div>
                <p className="font-bold text-white">Shopify Spatial Node Sync Webhooks</p>
                <p className="text-[11px] text-slate-400 font-sans">
                  Automated webhooks mapping real-time catalog SKUs to sub-meter indoor beacons.
                </p>
              </div>
            </div>
            {onOpenAgentPortal && (
              <button
                onClick={onOpenAgentPortal}
                className="shrink-0 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span>View Webhook Docs in Dev Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          STREAM 3: THE DISTRIBUTED BILLBOARD AFFILIATE & CONTENT CREATOR NETWORK
         ========================================================================= */}
      {activeStream === "BILLBOARD_AFFILIATE_NETWORK" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-slate-950 border border-indigo-500/40 space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                <Radio className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  The Distributed Billboard Affiliate &amp; Content Creator Network
                </h3>
                <p className="text-xs text-slate-300">
                  Incentivize local creators and node operators to host physical beacon hardware or
                  digital ad slots. Earn 5% tracking kickbacks on fulfilled agent deals.
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Franchise &amp; Syndicate Packages
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MONETIZATION_TIERS.BILLBOARD_AFFILIATE_NETWORK.map((tier) => (
                <div
                  key={tier.id}
                  className={`p-5 rounded-2xl bg-slate-900/80 border flex flex-col justify-between space-y-4 ${
                    tier.popular
                      ? "border-indigo-500 shadow-xl shadow-indigo-500/10"
                      : "border-slate-800"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-extrabold text-base text-white">{tier.name}</h5>
                      {tier.badge && (
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold border border-indigo-500/40">
                          {tier.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1.5 font-mono">
                      <span className="text-3xl font-black text-white">
                        ${tier.priceMonthlyUsd}
                      </span>
                      <span className="text-xs text-slate-400">
                        {tier.billingPeriod === "upfront_hardware"
                          ? "one-time (R2,700)"
                          : "/ month (R180)"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{tier.description}</p>
                    <ul className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                      {tier.specs.map((spec, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={onOpenMarketplace}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs font-mono shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Radio className="w-4 h-4" />
                    <span>{tier.ctaText}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Active Campaigns Tracker & Payout Claims */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-indigo-500/40 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-black text-sm text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <span>Active Syndicated Campaigns &amp; 5% Kickback Ledger</span>
              </h4>
              <span className="text-[10px] text-indigo-300 font-bold">
                2% Platform Facilitation Fee Retained
              </span>
            </div>

            {claimedNotice && (
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{claimedNotice}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {syndicatedCampaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-white text-xs">{camp.campaignTitle}</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                      {camp.operatorTier}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div className="p-2 rounded-lg bg-slate-900">
                      <p className="text-slate-400 uppercase text-[8px]">Gross Sales</p>
                      <p className="font-bold text-slate-200">
                        R{camp.grossSalesGeneratedZar.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900">
                      <p className="text-slate-400 uppercase text-[8px]">5% Kickback</p>
                      <p className="font-bold text-emerald-400">
                        ${camp.operatorAffiliateKickbackUsdc.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900">
                      <p className="text-slate-400 uppercase text-[8px]">2% Protocol</p>
                      <p className="font-bold text-teal-300">
                        ${camp.platformFeeRetainedUsdc.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleClaimPayout(camp.id)}
                    disabled={camp.operatorAffiliateKickbackUsdc <= 0}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-bold text-[11px] shadow-sm transition-all active:scale-95 disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>
                      {camp.operatorAffiliateKickbackUsdc > 0
                        ? `Claim Payout ($${camp.operatorAffiliateKickbackUsdc.toFixed(2)} USDC)`
                        : "Payout Settled On-Chain"}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STREAM 4: TOKENIZED PREMIUM ATTENTION (ANTI-AD-BLOCK POOLS)
         ========================================================================= */}
      {activeStream === "TOKENIZED_ATTENTION_POOL" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900/60 to-slate-950 border border-purple-500/40 space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40">
                <Eye className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Tokenized Premium Attention (Anti-Ad-Block Pools)
                </h3>
                <p className="text-xs text-slate-300">
                  Brands bid in an active Web3 pool using USDC to push verified promotional payloads
                  directly past user-agent filters and onto the user's active shopping stack.
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Framework & Economics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                Starting Bid Rate
              </span>
              <p className="text-2xl font-black text-white">$0.05 USDC</p>
              <p className="text-slate-300 text-[11px]">Per verified agent attention tick</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/40 space-y-2">
              <span className="text-[10px] text-purple-300 uppercase tracking-wider">
                Protocol Network Utility
              </span>
              <p className="text-2xl font-black text-purple-300">20% Locked</p>
              <p className="text-slate-300 text-[11px]">
                Autocomm platform facilitation utility fee
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/40 space-y-2">
              <span className="text-[10px] text-emerald-300 uppercase tracking-wider">
                Consumer Agent Share
              </span>
              <p className="text-2xl font-black text-emerald-400">80% Rewarded</p>
              <p className="text-slate-300 text-[11px]">Directly credited to shopper wallet pool</p>
            </div>
          </div>

          {/* Interactive Attention Bidding Matrix Slider */}
          <form
            onSubmit={handleUpdateBidPoolSubmit}
            className="p-6 rounded-2xl bg-slate-900/90 border border-purple-500/40 space-y-5 font-mono text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-black text-sm text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-purple-400" />
                <span>Advertiser Dynamic Bidding Matrix &amp; Attention Slider</span>
              </h4>
              <span className="text-[10px] text-purple-300 font-bold">
                Base &amp; ARC Smart Escrow
              </span>
            </div>

            {updatedPoolNotice && (
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Bidding pool bounds and escrow budget successfully updated!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Max Bid Per Attention Tick:</span>
                  <strong className="text-purple-300 font-extrabold text-sm">
                    ${bidSliderValue.toFixed(2)} USDC
                  </strong>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.50"
                  step="0.01"
                  value={bidSliderValue}
                  onChange={(e) => setBidSliderValue(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400">
                  Higher bids guarantee top ranking in consumer agent negotiation queues.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Additional Escrow Pool Deposit:</span>
                  <strong className="text-emerald-400 font-extrabold text-sm">
                    +${additionalDepositUsdc} USDC
                  </strong>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="50"
                  value={additionalDepositUsdc}
                  onChange={(e) => setAdditionalDepositUsdc(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400">
                  20% (${(additionalDepositUsdc * 0.2).toFixed(1)} USDC) locked as network utility.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Coins className="w-4 h-4" />
                <span>Deposit &amp; Activate Attention Escrow</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
