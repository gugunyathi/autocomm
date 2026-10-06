import { useState, useRef } from "react";
import type {
  SpatialAdCampaign,
  ShopifyProduct,
  ShopifyStoreConfig,
  Web3WalletState,
  TokenAsset,
} from "@/types/autocom";
import {
  X,
  Store,
  Layers,
  BarChart3,
  Globe,
  Radio,
  Plus,
  RefreshCw,
  CheckCircle2,
  Sliders,
  DollarSign,
  TrendingUp,
  Share2,
  Sparkles,
  Zap,
  UploadCloud,
  FileImage,
  Cpu,
  ShieldCheck,
  Coins,
  ArrowUpRight,
  ExternalLink,
  Lock,
  Tv,
  Eye,
  Activity,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";

interface MerchantDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopifyConfig: ShopifyStoreConfig;
  shopifyProducts: ShopifyProduct[];
  onSyncShopify: (apiKey?: string, domain?: string) => void;
  campaigns: SpatialAdCampaign[];
  onCreateCampaign: (
    campaign: Omit<
      SpatialAdCampaign,
      | "id"
      | "impressionsCount"
      | "agentConversionsCount"
      | "instantAutoBagCount"
      | "spentAttentionUsdc"
    >,
  ) => void;
  onToggleSyndicationChannel?: (
    campaignId: string,
    channel: "metaAds" | "googleAds" | "doohBillboards",
    enabled: boolean,
  ) => void;
  onTriggerSyndicationSync?: (
    campaignId: string,
  ) => Promise<{ success: boolean; syncedChannels: string[] }>;
  walletState?: Web3WalletState;
}

const SAMPLE_CREATIVES = [
  {
    title: "Zara Urban Winter Trench Flash",
    merchant: "Zara Fashion",
    url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&q=80",
    category: "Apparel",
    originalPrice: 1899,
    discount: 55,
  },
  {
    title: "Nike Air Max Pulse Runner Pass",
    merchant: "Nike Performance",
    url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    category: "Sportswear",
    originalPrice: 2499,
    discount: 40,
  },
  {
    title: "Apple iPhone 16 MagSafe Bundle",
    merchant: "iStore Apple",
    url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80",
    category: "Electronics",
    originalPrice: 1199,
    discount: 60,
  },
  {
    title: "Woolworths Gourmet Bakery Basket",
    merchant: "Woolworths Food",
    url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80",
    category: "Grocery",
    originalPrice: 380,
    discount: 52,
  },
];

export function MerchantDashboardModal({
  isOpen,
  onClose,
  shopifyConfig,
  shopifyProducts,
  onSyncShopify,
  campaigns,
  onCreateCampaign,
  onToggleSyndicationChannel,
  onTriggerSyndicationSync,
  walletState,
}: MerchantDashboardModalProps) {
  const [activeTab, setActiveTab] = useState<
    "upload" | "syndication" | "campaigns" | "shopify" | "analytics"
  >("upload");
  const [isSyncingShopify, setIsSyncingShopify] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(shopifyConfig.apiKey);
  const [domainInput, setDomainInput] = useState(shopifyConfig.shopDomain);

  // Drag-and-Drop & Processing State
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedCreativeUrl, setUploadedCreativeUrl] = useState<string>(SAMPLE_CREATIVES[0].url);
  const [uploadedFileName, setUploadedFileName] = useState<string>("zara_trench_campaign_4k.webp");
  const [mediaType, setMediaType] = useState<"image" | "video" | "interactive_deal">(
    "interactive_deal",
  );
  const [isProcessingAsset, setIsProcessingAsset] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(100);
  const [processingStage, setProcessingStage] = useState<string>("Ready for spatial broadcast");
  const [compressedSizeKb, setCompressedSizeKb] = useState(142);
  const [originalSizeKb, setOriginalSizeKb] = useState(1150);
  const [ipfsCid, setIpfsCid] = useState("QmZar89FaXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1m");

  // Spatial Targeting & Beacons Form State
  const [selectedMall, setSelectedMall] = useState("Sandton City Mall");
  const [targetCorridor, setTargetCorridor] = useState("Level 1 North Passage Corridor #2");
  const [broadcastRadius, setBroadcastRadius] = useState(35);
  const [beaconUuids, setBeaconUuids] = useState<string[]>([
    "BEAC-SANDTON-01-N",
    "BEAC-ZARA-CORRIDOR-04",
    "UWB-CORR-NODE-89",
  ]);
  const [newBeaconInput, setNewBeaconInput] = useState("");

  // Campaign Details Form State
  const [campaignTitle, setCampaignTitle] = useState("Zara Urban Winter Trench Flash · 55% Drop");
  const [merchantName, setMerchantName] = useState("Zara Fashion");
  const [discountPercent, setDiscountPercent] = useState(55);
  const [originalPriceZar, setOriginalPriceZar] = useState(1899);
  const [attentionPoolUsdc, setAttentionPoolUsdc] = useState(250);
  const [campaignDescription, setCampaignDescription] = useState(
    "Autonomous personal shopping agent instant 55% discount drop within 35m corridor beacon coverage.",
  );

  // Micro-Payment Escrow State
  const [escrowToken, setEscrowToken] = useState<TokenAsset>("USDC");
  const [escrowFeeUsdc, setEscrowFeeUsdc] = useState(0.45); // $0.45 / month
  const [isEscrowPaid, setIsEscrowPaid] = useState(true);
  const [escrowTxHash, setEscrowTxHash] = useState("0x78ab12...99ef");

  // Multi-Platform Syndication Toggles & Status
  const [metaEnabled, setMetaEnabled] = useState(true);
  const [googleEnabled, setGoogleEnabled] = useState(true);
  const [billboardEnabled, setBillboardEnabled] = useState(true);
  const [metaBudgetDaily, setMetaBudgetDaily] = useState(25);
  const [googleBudgetDaily, setGoogleBudgetDaily] = useState(20);
  const [selectedBillboards, setSelectedBillboards] = useState<string[]>([
    "Sandton City High-Speed Tower",
    "M1 North Highway Billboard #4",
  ]);
  const [amplifierWatts, setAmplifierWatts] = useState(45);

  // Interactive UI helpers
  const [copiedCid, setCopiedCid] = useState(false);
  const [isSyndicating, setIsSyndicating] = useState(false);
  const [syndicationSuccessMsg, setSyndicationSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleTriggerShopifySync = () => {
    setIsSyncingShopify(true);
    setTimeout(() => {
      onSyncShopify(apiKeyInput, domainInput);
      setIsSyncingShopify(false);
    }, 800);
  };

  const handleSimulateAssetProcessing = (fileOrSampleName: string, url: string) => {
    setIsProcessingAsset(true);
    setProcessingProgress(15);
    setProcessingStage("1/4: Analyzing rich media bitrate & vector quantization...");
    setUploadedFileName(fileOrSampleName);
    setUploadedCreativeUrl(url);

    setTimeout(() => {
      setProcessingProgress(45);
      setProcessingStage("2/4: Compressing WebP/AVIF spatial layout (85% bandwidth reduction)...");
    }, 400);

    setTimeout(() => {
      setProcessingProgress(80);
      setProcessingStage(
        "3/4: Appending spatial anchor coordinates & sub-meter BLE Beacon UUIDs...",
      );
      const orig = Math.floor(Math.random() * 800 + 800);
      const comp = Math.floor(orig * 0.14);
      setOriginalSizeKb(orig);
      setCompressedSizeKb(comp);
      const newCid = `Qm${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
      setIpfsCid(newCid);
    }, 800);

    setTimeout(() => {
      setProcessingProgress(100);
      setProcessingStage("4/4: IPFS CID generated & cryptographic micro-escrow pinned!");
      setIsProcessingAsset(false);
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const objectUrl = URL.createObjectURL(file);
      handleSimulateAssetProcessing(file.name, objectUrl);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const objectUrl = URL.createObjectURL(file);
      handleSimulateAssetProcessing(file.name, objectUrl);
    }
  };

  const handleAddBeacon = () => {
    if (!newBeaconInput.trim()) return;
    setBeaconUuids((prev) => [...prev, newBeaconInput.trim().toUpperCase()]);
    setNewBeaconInput("");
  };

  const handleRemoveBeacon = (index: number) => {
    setBeaconUuids((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCopyCid = () => {
    navigator.clipboard.writeText(ipfsCid);
    setCopiedCid(true);
    setTimeout(() => setCopiedCid(false), 2000);
  };

  const handlePublishAndSyndicate = (e: React.FormEvent) => {
    e.preventDefault();
    const discounted = Math.round(originalPriceZar * (1 - discountPercent / 100));
    const txHash = `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`;
    setEscrowTxHash(txHash);
    setIsEscrowPaid(true);

    onCreateCampaign({
      title: campaignTitle || `${merchantName} Dynamic Promo Drop`,
      merchantId: `m-${merchantName.toLowerCase().replace(/\s+/g, "")}`,
      merchantName: merchantName,
      merchantLogo: merchantName.substring(0, 4).toUpperCase(),
      brandBgColor: "#0f172a",
      brandTextColor: "#ffffff",
      mediaUrl: uploadedCreativeUrl,
      mediaType: mediaType,
      targetRadiusMeters: broadcastRadius,
      targetCategories: ["Retail", "Deals", "Lifestyle"],
      spatialCoordinates: { storeId: "s1", x: 175, y: 150 },
      discountPayload: {
        percentage: discountPercent,
        promoCode: `${merchantName.substring(0, 3).toUpperCase()}-${discountPercent}AUTO`,
        description: campaignDescription,
        originalPriceZar: originalPriceZar,
        discountedPriceZar: discounted,
        expiresAt: Date.now() + 86400000 * 3,
      },
      attentionPoolUsdc: attentionPoolUsdc,
      costPerAgentImpressionUsdc: 0.005,
      cpaRewardUsdc: 1.5,
      active: true,
      spatialMetadata: {
        targetMall: selectedMall,
        targetCorridor: targetCorridor,
        beaconUuids: beaconUuids,
        broadcastRadiusMeters: broadcastRadius,
        ipfsCid: ipfsCid,
        compressedAssetSizeKb: compressedSizeKb,
        originalAssetSizeKb: originalSizeKb,
        compressionRatio: `${Math.round((1 - compressedSizeKb / originalSizeKb) * 100)}% Saved`,
        processedAt: Date.now(),
      },
      cloudStorageEscrow: {
        feePaidUsdc: escrowFeeUsdc,
        feePaidToken: escrowToken,
        escrowTxHash: txHash,
        pinningNodes: 12,
        hostingStatus: "ACTIVE_PINNED",
        daysRemaining: 30,
      },
      syndicationChannels: {
        metaAds: {
          enabled: metaEnabled,
          status: metaEnabled ? "LIVE" : "PAUSED",
          campaignId: `META-ACT-${Math.floor(Math.random() * 800000 + 100000)}`,
          impressions: metaEnabled ? 28400 : 0,
          reach: metaEnabled ? 18900 : 0,
          clicks: metaEnabled ? 840 : 0,
          budgetDailyUsd: metaBudgetDaily,
        },
        googleAds: {
          enabled: googleEnabled,
          status: googleEnabled ? "LIVE" : "PAUSED",
          campaignId: `GOOG-MAP-LOC-${Math.floor(Math.random() * 8000 + 1000)}`,
          mapImpressions: googleEnabled ? 19200 : 0,
          searchClicks: googleEnabled ? 520 : 0,
          budgetDailyUsd: googleBudgetDaily,
        },
        doohBillboards: {
          enabled: billboardEnabled,
          status: billboardEnabled ? "LIVE" : "PAUSED",
          billboardLocations: selectedBillboards,
          vehicleDetections: billboardEnabled ? 12400 : 0,
          amplifierPowerWatts: amplifierWatts,
        },
        autoComMesh: {
          enabled: true,
          status: "LIVE",
          submeterBeaconsCount: beaconUuids.length,
          a2aHandshakes: 8400,
          convertedDeals: 312,
        },
      },
      networkSync: {
        googleAds: googleEnabled,
        metaAds: metaEnabled,
        doohBillboards: billboardEnabled,
        doohBillboardLocations: selectedBillboards,
      },
    });

    setSyndicationSuccessMsg(
      `🎉 Campaign "${campaignTitle}" Published! Pinned to IPFS & Syndicated across Meta, Google & DOOH Billboards.`,
    );
    setTimeout(() => {
      setSyndicationSuccessMsg(null);
      setActiveTab("syndication");
    }, 1800);
  };

  const handleTriggerManualSyndication = async (campaignId: string) => {
    setIsSyndicating(true);
    if (onTriggerSyndicationSync) {
      const res = await onTriggerSyndicationSync(campaignId);
      setIsSyndicating(false);
      setSyndicationSuccessMsg(
        `✅ Cross-Network Sync Completed! Synced to ${res.syncedChannels.join(", ")}`,
      );
      setTimeout(() => setSyndicationSuccessMsg(null), 3000);
    } else {
      setTimeout(() => {
        setIsSyndicating(false);
        setSyndicationSuccessMsg(
          "✅ Cross-Network Sync Completed! Meta, Google & DOOH metrics refreshed.",
        );
        setTimeout(() => setSyndicationSuccessMsg(null), 3000);
      }, 900);
    }
  };

  // Aggregate Metrics
  const totalImpressions = campaigns.reduce((acc, c) => acc + c.impressionsCount, 0);
  const totalConversions = campaigns.reduce((acc, c) => acc + c.agentConversionsCount, 0);
  const totalInstantBags = campaigns.reduce((acc, c) => acc + c.instantAutoBagCount, 0);
  const totalPoolSpent = campaigns.reduce((acc, c) => acc + c.spentAttentionUsdc, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl sm:rounded-3xl bg-slate-950 border border-teal-500/40 shadow-2xl text-slate-100 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 shrink-0 bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 flex items-center justify-center font-bold text-lg shadow-lg shadow-teal-500/20 shrink-0">
              <Store className="w-5 h-5 text-slate-950" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-extrabold text-white truncate">
                  Merchant Central &amp; Spatial Ad Studio
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-mono border border-teal-500/40 hidden xs:inline">
                  Syndication Router v3.0
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                Upload rich media, compress for BLE, pin to IPFS &amp; syndicate to Meta, Google
                &amp; DOOH Billboards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {walletState && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
                <Coins className="w-3.5 h-3.5 text-teal-400" />
                <span className="text-slate-400">Escrow Balance:</span>
                <span className="text-teal-300 font-bold">${walletState.balances.USDC} USDC</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-3 sm:px-6 pt-3 pb-2 border-b border-slate-800 bg-slate-900/50 overflow-x-auto text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap border ${
              activeTab === "upload"
                ? "bg-teal-500/20 text-teal-300 border-teal-500/50 shadow-sm"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <UploadCloud className="w-4 h-4 text-teal-400" />
            <span>1. Creative Upload &amp; Escrow</span>
          </button>

          <button
            onClick={() => setActiveTab("syndication")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap border ${
              activeTab === "syndication"
                ? "bg-teal-500/20 text-teal-300 border-teal-500/50 shadow-sm"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <Share2 className="w-4 h-4 text-indigo-400" />
            <span>2. Syndication Channels Router</span>
          </button>

          <button
            onClick={() => setActiveTab("campaigns")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap border ${
              activeTab === "campaigns"
                ? "bg-teal-500/20 text-teal-300 border-teal-500/50 shadow-sm"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <Radio className="w-4 h-4 text-emerald-400" />
            <span>Active Campaigns ({campaigns.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("shopify")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap border ${
              activeTab === "shopify"
                ? "bg-teal-500/20 text-teal-300 border-teal-500/50 shadow-sm"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Shopify Sync ({shopifyProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap border ${
              activeTab === "analytics"
                ? "bg-teal-500/20 text-teal-300 border-teal-500/50 shadow-sm"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <BarChart3 className="w-4 h-4 text-rose-400" />
            <span>Agent Analytics</span>
          </button>
        </div>

        {/* Global Toast / Success Message */}
        {syndicationSuccessMsg && (
          <div className="px-4 py-2.5 bg-emerald-500/20 border-b border-emerald-500/40 text-emerald-200 text-xs font-mono flex items-center justify-between animate-in slide-in-from-top">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{syndicationSuccessMsg}</span>
            </span>
            <button
              onClick={() => setSyndicationSuccessMsg(null)}
              className="text-emerald-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* =========================================================================
              TAB 1: CREATIVE UPLOAD, ASSET PROCESSING PIPELINE & ESCROW PAYMENT
             ========================================================================= */}
          {activeTab === "upload" && (
            <form onSubmit={handlePublishAndSyndicate} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Col: Drag & Drop + Processing Specs (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <UploadCloud className="w-4 h-4 text-teal-400" />
                      <span>Rich Media Asset Upload &amp; Compression Pipeline</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Upload images, video loops or spatial cards. Media is compressed and appended
                      with sub-meter beacon anchors.
                    </p>
                  </div>

                  {/* Drag & Drop Zone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 overflow-hidden group ${
                      isDragging
                        ? "border-teal-400 bg-teal-500/15 scale-[1.01]"
                        : "border-slate-700 bg-slate-900/60 hover:border-teal-500/60 hover:bg-slate-900/90"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-6 h-6" />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-white">
                        Drop media creative here or <span className="text-teal-400">browse</span>
                      </p>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                        Supports WebP, JPEG, MP4 loops &amp; interactive deal payloads
                      </p>
                    </div>

                    <div className="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300">
                      File: {uploadedFileName}
                    </div>
                  </div>

                  {/* Quick Preset Creatives Picker */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono text-slate-400">
                      Or select preset store creative:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {SAMPLE_CREATIVES.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setCampaignTitle(s.title);
                            setMerchantName(s.merchant);
                            setOriginalPriceZar(s.originalPrice);
                            setDiscountPercent(s.discount);
                            handleSimulateAssetProcessing(
                              `${s.merchant.toLowerCase()}_asset.webp`,
                              s.url,
                            );
                          }}
                          className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                            uploadedCreativeUrl === s.url
                              ? "bg-teal-500/20 border-teal-500/60 text-white"
                              : "bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700"
                          }`}
                        >
                          <img
                            src={s.url}
                            alt={s.title}
                            className="w-8 h-8 rounded-lg object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold truncate">{s.merchant}</p>
                            <p className="text-[9px] font-mono text-teal-400">
                              -{s.discount}% · R{s.originalPrice}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Asset Processing & Compression Pipeline Card */}
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300 font-bold flex items-center gap-1.5">
                        <Cpu
                          className={`w-3.5 h-3.5 ${isProcessingAsset ? "animate-spin text-teal-400" : "text-emerald-400"}`}
                        />
                        <span>BLE Vector Compression</span>
                      </span>
                      <span className="text-teal-400 font-bold">{processingProgress}%</span>
                    </div>

                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full transition-all duration-300"
                        style={{ width: `${processingProgress}%` }}
                      />
                    </div>

                    <p className="text-[10px] font-mono text-slate-400 truncate">
                      {processingStage}
                    </p>

                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80 text-center font-mono">
                      <div className="p-1.5 rounded-lg bg-slate-950">
                        <p className="text-[8px] text-slate-500 uppercase">Original</p>
                        <p className="text-[11px] font-bold text-slate-300">{originalSizeKb} KB</p>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-950">
                        <p className="text-[8px] text-slate-500 uppercase">Compressed</p>
                        <p className="text-[11px] font-bold text-teal-300">{compressedSizeKb} KB</p>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-950">
                        <p className="text-[8px] text-slate-500 uppercase">Bandwidth Saved</p>
                        <p className="text-[11px] font-bold text-emerald-400">
                          {Math.round((1 - compressedSizeKb / originalSizeKb) * 100)}%
                        </p>
                      </div>
                    </div>

                    {/* IPFS CID Pin */}
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-[10px] font-mono">
                      <div className="min-w-0 flex items-center gap-1.5">
                        <Globe className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span className="text-slate-400">IPFS:</span>
                        <span className="text-indigo-300 truncate max-w-[140px]">{ipfsCid}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyCid}
                        className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
                        title="Copy IPFS CID"
                      >
                        {copiedCid ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Col: Spatial Metadata, Deal Economics & Escrow (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Campaign Title & Merchant Header */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-mono text-slate-400">Campaign Title</label>
                      <input
                        type="text"
                        required
                        value={campaignTitle}
                        onChange={(e) => setCampaignTitle(e.target.value)}
                        className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-teal-500 outline-none"
                        placeholder="e.g. Zara Runway Winter Outerwear Flash"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-slate-400">
                        Merchant Store Brand
                      </label>
                      <select
                        value={merchantName}
                        onChange={(e) => setMerchantName(e.target.value)}
                        className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
                      >
                        <option value="Zara Fashion">Zara Fashion</option>
                        <option value="Nike Performance">Nike Performance</option>
                        <option value="iStore Apple">iStore Apple</option>
                        <option value="Woolworths Food">Woolworths Food</option>
                        <option value="Exclusive Books">Exclusive Books</option>
                        <option value="Clicks Pharmacy">Clicks Pharmacy</option>
                      </select>
                    </div>
                  </div>

                  {/* Pricing, Discount & Dynamic Auto-Bag */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-mono text-slate-400">
                        Original Price (ZAR)
                      </label>
                      <input
                        type="number"
                        min="20"
                        value={originalPriceZar}
                        onChange={(e) => setOriginalPriceZar(Number(e.target.value))}
                        className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-slate-400">Discount %</label>
                      <input
                        type="number"
                        min="5"
                        max="90"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(Number(e.target.value))}
                        className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-slate-400">
                        Attention Pool (USDC)
                      </label>
                      <input
                        type="number"
                        min="10"
                        value={attentionPoolUsdc}
                        onChange={(e) => setAttentionPoolUsdc(Number(e.target.value))}
                        className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-teal-300 outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  {/* Calculated Price & Auto-Bag Notice */}
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">
                      Calculated Final Price:{" "}
                      <strong className="text-white">
                        R{Math.round(originalPriceZar * (1 - discountPercent / 100))}
                      </strong>
                    </span>
                    {discountPercent > 50 ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                        ⚡ &gt;50%: Instant Auto-Bag Activated!
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                        🅿️ Routes to Parked Offers
                      </span>
                    )}
                  </div>

                  {/* Spatial Location & Beacon Targeting Sub-Section */}
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-mono font-bold text-white flex items-center gap-2">
                      <Radio className="w-3.5 h-3.5 text-teal-400" />
                      <span>Spatial Micro-Location &amp; Beacon Anchors</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-mono text-slate-400">
                          Target Mall Node
                        </label>
                        <select
                          value={selectedMall}
                          onChange={(e) => setSelectedMall(e.target.value)}
                          className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 outline-none"
                        >
                          <option value="Sandton City Mall">Sandton City Mall (Gauteng)</option>
                          <option value="Rosebank Mall">Rosebank Mall (Transit Hub)</option>
                          <option value="V&A Waterfront">V&amp;A Waterfront (Cape Town)</option>
                          <option value="Gateway Theatre of Shopping">Gateway (Durban)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-mono text-slate-400">
                          Corridor / Floor Node
                        </label>
                        <input
                          type="text"
                          value={targetCorridor}
                          onChange={(e) => setTargetCorridor(e.target.value)}
                          className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-mono text-slate-200 outline-none"
                        />
                      </div>
                    </div>

                    {/* Proximity Broadcast Radius Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-slate-400">Proximity Broadcast Radius:</span>
                        <span className="text-teal-400 font-bold">{broadcastRadius} meters</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        step="5"
                        value={broadcastRadius}
                        onChange={(e) => setBroadcastRadius(Number(e.target.value))}
                        className="w-full accent-teal-500 cursor-pointer"
                      />
                    </div>

                    {/* Beacon UUID Tags */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-slate-400 uppercase">
                        Targeted Sub-Meter Beacon UUIDs ({beaconUuids.length}):
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {beaconUuids.map((uuid, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-lg bg-teal-500/15 text-teal-300 border border-teal-500/30 text-[10px] font-mono flex items-center gap-1"
                          >
                            <span>{uuid}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveBeacon(i)}
                              className="text-slate-400 hover:text-rose-400"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          value={newBeaconInput}
                          onChange={(e) => setNewBeaconInput(e.target.value)}
                          placeholder="e.g. BEAC-ZARA-ENTRANCE-01"
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs font-mono text-slate-200 outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddBeacon}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl text-slate-200 cursor-pointer"
                        >
                          + Add UUID
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Cloud Space Micro-Payment Escrow Box */}
                  <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-indigo-400" />
                        <h4 className="text-xs font-mono font-bold text-indigo-200">
                          Decentralized Cloud Space Micro-Payment Escrow
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                        12 Pinning Nodes
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-snug">
                      Your connected Web3 wallet automatically funds the decentralized IPFS storage
                      node hosting fee to maintain public availability on the Open Ad Library.
                    </p>

                    <div className="grid grid-cols-2 gap-3 items-center">
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] font-mono text-slate-400">
                          Escrow Asset:
                        </label>
                        <select
                          value={escrowToken}
                          onChange={(e) => setEscrowToken(e.target.value as TokenAsset)}
                          className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs font-mono text-indigo-300"
                        >
                          <option value="USDC">$0.45 USDC / Month</option>
                          <option value="ERC-X402">9.0 ERC-X402 / Month</option>
                        </select>
                      </div>

                      <div className="text-right text-[11px] font-mono text-slate-400">
                        Escrow Status:{" "}
                        <span className="text-emerald-400 font-bold">AUTO-FUNDED</span>
                      </div>
                    </div>
                  </div>

                  {/* Submit / Publish Button */}
                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-teal-500/20 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Pin to IPFS &amp; Launch Spatial Campaign</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* =========================================================================
              TAB 2: MULTI-PLATFORM SYNDICATION CHANNELS ROUTER
             ========================================================================= */}
          {activeTab === "syndication" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-indigo-400" />
                    <span>Active Multi-Platform Syndication Router</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Automatically syndicates spatial creatives &amp; budget caps out to Meta Ads,
                    Google Ads &amp; Roadside DOOH Billboards.
                  </p>
                </div>

                <button
                  onClick={() => handleTriggerManualSyndication(campaigns[0]?.id || "camp-1")}
                  disabled={isSyndicating}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyndicating ? "animate-spin" : ""}`} />
                  <span>
                    {isSyndicating ? "Broadcasting REST APIs..." : "Trigger Full Network Sync"}
                  </span>
                </button>
              </div>

              {/* Syndication Channels Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Meta Ads API (Instagram & Facebook) */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3.5 relative overflow-hidden flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
                          f
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-white">Meta Ads API</h4>
                          <p className="text-[10px] font-mono text-slate-400">
                            Instagram &amp; FB Local
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={metaEnabled}
                          onChange={(e) => {
                            setMetaEnabled(e.target.checked);
                            if (onToggleSyndicationChannel && campaigns[0]) {
                              onToggleSyndicationChannel(
                                campaigns[0].id,
                                "metaAds",
                                e.target.checked,
                              );
                            }
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5 text-[10px] font-mono">
                      <div className="flex justify-between text-slate-400">
                        <span>Sync Status:</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{metaEnabled ? "LIVE_SYNCED" : "PAUSED"}</span>
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Campaign ID:</span>
                        <span className="text-slate-200">META-ACT-982104</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Daily Budget Cap:</span>
                        <span className="text-indigo-300 font-bold">${metaBudgetDaily}/day</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center font-mono">
                      <div className="p-2 rounded-xl bg-slate-950">
                        <p className="text-[8px] text-slate-500 uppercase">Live Impressions</p>
                        <p className="text-xs font-bold text-white">48,500</p>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950">
                        <p className="text-[8px] text-slate-500 uppercase">Geo Reach</p>
                        <p className="text-xs font-bold text-indigo-400">32,100</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                    <span>Target: 5km Local Sandton</span>
                    <span className="text-indigo-400">1,420 Clicks</span>
                  </div>
                </div>

                {/* 2. Google Ads API (Maps & Local Search) */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3.5 relative overflow-hidden flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                          G
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-white">Google Ads API</h4>
                          <p className="text-[10px] font-mono text-slate-400">
                            Maps Pins &amp; Local Search
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={googleEnabled}
                          onChange={(e) => {
                            setGoogleEnabled(e.target.checked);
                            if (onToggleSyndicationChannel && campaigns[0]) {
                              onToggleSyndicationChannel(
                                campaigns[0].id,
                                "googleAds",
                                e.target.checked,
                              );
                            }
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5 text-[10px] font-mono">
                      <div className="flex justify-between text-slate-400">
                        <span>Sync Status:</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{googleEnabled ? "LIVE_SYNCED" : "PAUSED"}</span>
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Campaign ID:</span>
                        <span className="text-slate-200">GOOG-MAP-LOC-4412</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Daily Budget Cap:</span>
                        <span className="text-blue-300 font-bold">${googleBudgetDaily}/day</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center font-mono">
                      <div className="p-2 rounded-xl bg-slate-950">
                        <p className="text-[8px] text-slate-500 uppercase">Map Impressions</p>
                        <p className="text-xs font-bold text-white">34,200</p>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950">
                        <p className="text-[8px] text-slate-500 uppercase">Search Clicks</p>
                        <p className="text-xs font-bold text-blue-400">980</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                    <span>Promoted Pin: Sandton Mall</span>
                    <span className="text-blue-400">CTR: 2.86%</span>
                  </div>
                </div>

                {/* 3. Programmatic DOOH Billboards */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3.5 relative overflow-hidden flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold">
                          <Tv className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-white">DOOH Billboards</h4>
                          <p className="text-[10px] font-mono text-slate-400">
                            Digital Roadside Pylons
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={billboardEnabled}
                          onChange={(e) => {
                            setBillboardEnabled(e.target.checked);
                            if (onToggleSyndicationChannel && campaigns[0]) {
                              onToggleSyndicationChannel(
                                campaigns[0].id,
                                "doohBillboards",
                                e.target.checked,
                              );
                            }
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                      </label>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5 text-[10px] font-mono">
                      <div className="flex justify-between text-slate-400">
                        <span>Sync Status:</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{billboardEnabled ? "LIVE_BROADCASTING" : "PAUSED"}</span>
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Amplifier Power:</span>
                        <span className="text-amber-400 font-bold">
                          {amplifierWatts}W (500m reach)
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400 truncate">
                        <span>Active Towers:</span>
                        <span className="text-slate-200">2 Billboard Pylons</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center font-mono">
                      <div className="p-2 rounded-xl bg-slate-950">
                        <p className="text-[8px] text-slate-500 uppercase">Vehicles Detected</p>
                        <p className="text-xs font-bold text-white">18,450</p>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950">
                        <p className="text-[8px] text-slate-500 uppercase">A2A In-Car Deals</p>
                        <p className="text-xs font-bold text-amber-400">420</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                    <span>Sandton Tower + M1 Highway</span>
                    <span className="text-amber-400">120km/h Handshake</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 3: SPATIAL AD CAMPAIGNS OVERVIEW
             ========================================================================= */}
          {activeTab === "campaigns" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Live Spatial &amp; Billboard Campaigns
                  </h3>
                  <p className="text-xs text-slate-400">
                    Tokenized attention distribution across indoor corridor nodes and DOOH highway
                    billboards.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("upload")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Campaign</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campaigns.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 transition-all space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-black font-mono shadow-sm"
                          style={{ backgroundColor: c.brandBgColor, color: c.brandTextColor }}
                        >
                          {c.merchantLogo}
                        </span>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm text-white truncate">
                            {c.title}
                          </h4>
                          <p className="text-[10px] font-mono text-slate-400">{c.merchantName}</p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          c.discountPayload.percentage > 50
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        }`}
                      >
                        -{c.discountPayload.percentage}% Drop{" "}
                        {c.discountPayload.percentage > 50 && "⚡ Auto-Bag"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-snug">
                      {c.discountPayload.description}
                    </p>

                    {/* Attention Pool & Conversion Stats */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-center font-mono">
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase">Attention Pool</p>
                        <p className="text-xs font-bold text-teal-300">
                          ${c.attentionPoolUsdc} USDC
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase">Impressions</p>
                        <p className="text-xs font-bold text-white">
                          {c.impressionsCount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase">A2A Conversions</p>
                        <p className="text-xs font-bold text-emerald-400">
                          {c.agentConversionsCount}
                        </p>
                      </div>
                    </div>

                    {/* Network Cross-Sync Badges */}
                    <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-slate-800/80">
                      <span className="text-slate-400">Radius: {c.targetRadiusMeters}m</span>
                      <div className="flex items-center gap-1.5">
                        {c.networkSync.googleAds && (
                          <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            Google
                          </span>
                        )}
                        {c.networkSync.metaAds && (
                          <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Meta
                          </span>
                        )}
                        {c.networkSync.doohBillboards && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            DOOH Billboard
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 4: SHOPIFY INTEGRATION
             ========================================================================= */}
          {activeTab === "shopify" && (
            <div className="space-y-5">
              {/* API Connection Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <span className="text-[#95BF47] font-black">🛍️ Shopify</span>
                      <span>Store Connection Gateway</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Direct inventory sync maps web SKUs directly to sub-meter physical mall
                      coordinates.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Live Synced</span>
                    </span>
                    <button
                      onClick={handleTriggerShopifySync}
                      disabled={isSyncingShopify}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${isSyncingShopify ? "animate-spin text-teal-400" : ""}`}
                      />
                      <span>{isSyncingShopify ? "Syncing..." : "Sync Catalog"}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] font-mono text-slate-400">
                      Shopify API Access Token
                    </label>
                    <input
                      type="password"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:border-teal-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-slate-400">Store Domain</label>
                    <input
                      type="text"
                      value={domainInput}
                      onChange={(e) => setDomainInput(e.target.value)}
                      className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:border-teal-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Synced Products Table with Spatial Coordinate Pins */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Mapped Physical Store Products ({shopifyProducts.length})
                  </h4>
                  <span className="text-xs font-mono text-teal-400">
                    Auto-Coordinates Mapped: Active
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {shopifyProducts.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 transition-colors flex gap-3.5 items-start"
                    >
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0 bg-slate-950"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-mono font-bold text-teal-400 px-1.5 py-0.2 rounded bg-teal-500/10 border border-teal-500/20">
                            {p.vendor}
                          </span>
                          <span className="text-xs font-bold text-white font-mono">
                            R{p.priceZar}{" "}
                            <span className="text-[10px] text-slate-400">(${p.priceUsdc})</span>
                          </span>
                        </div>
                        <h5 className="font-bold text-xs text-white truncate">{p.title}</h5>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                          <span>SKU: {p.sku}</span>
                          <span>·</span>
                          <span>Stock: {p.inventoryQuantity}</span>
                        </div>

                        {/* Spatial Floor Pin */}
                        <div className="mt-1 flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] font-mono">
                          <span className="text-slate-400 flex items-center gap-1">
                            <span>📍</span>
                            <span>
                              {p.spatialCoordinates.storeName} ({p.spatialCoordinates.x},{" "}
                              {p.spatialCoordinates.y})
                            </span>
                          </span>
                          {p.activeDynamicPromo && (
                            <span
                              className={`px-1.5 py-0.2 rounded font-bold ${
                                p.activeDynamicPromo.discountPercent > 50
                                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                  : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              }`}
                            >
                              {p.activeDynamicPromo.discountPercent}% Off{" "}
                              {p.activeDynamicPromo.discountPercent > 50 && "⚡ Auto-Bag"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 5: AGENT ANALYTICS
             ========================================================================= */}
          {activeTab === "analytics" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <p className="text-[10px] font-mono text-slate-400 uppercase">
                    Total Agent Impressions
                  </p>
                  <p className="text-xl sm:text-2xl font-black text-white font-mono">
                    {totalImpressions.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-teal-400 font-mono">100% Ad-blocker Bypass</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <p className="text-[10px] font-mono text-slate-400 uppercase">
                    A2A Closed Conversions
                  </p>
                  <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                    {totalConversions.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-emerald-300 font-mono">Instant Voucher Redeemed</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <p className="text-[10px] font-mono text-slate-400 uppercase">
                    &gt;50% Auto-Bag Purchases
                  </p>
                  <p className="text-xl sm:text-2xl font-black text-rose-400 font-mono">
                    {totalInstantBags.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-rose-300 font-mono">Instant Cart Execution</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <p className="text-[10px] font-mono text-slate-400 uppercase">
                    Attention Pool Spent
                  </p>
                  <p className="text-xl sm:text-2xl font-black text-teal-300 font-mono">
                    ${totalPoolSpent.toFixed(2)} USDC
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">Avg CPA: $1.82 USDC</p>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                  Tokenized Attention Economics: Why AutoCom Outperforms Google &amp; Meta
                </h4>
                <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
                  <p>
                    Traditional banner ads suffer from 42% ad-blocker drop-off and less than 1.2%
                    click-through. AutoCom replaces passive ads with{" "}
                    <strong>spatial tokenized micro-deals</strong> consumed directly by autonomous
                    software agents acting on behalf of nearby consumers.
                  </p>
                  <p>
                    Advertisers deposit micro-fractions of USDC into the attention pool. When a
                    consumer agent approaches within 50 meters, the agent negotiates, signs
                    cryptographic proof of intent, and automatically closes the sale before the
                    shopper walks out of range.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
