import React, { useState, useRef } from "react";
import type { SpatialAdCampaign, Web3WalletState } from "@/types/autocom";
import type {
  AdCreative,
  SpatialMetadata,
  AdSyndicationStatus,
  MerchantAdUploadPayload,
} from "@/types/adserver";
import { useWeb3Wallet, SUPPORTED_CHAINS, type SupportedChainId } from "@/hooks/useWeb3Wallet";
import {
  UploadCloud,
  X,
  Sparkles,
  Radio,
  Globe,
  Coins,
  CreditCard,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  Share2,
  Tv,
  Copy,
  Check,
  RefreshCw,
  Lock,
  Zap,
  Building2,
  Sliders,
  DollarSign,
  AlertCircle,
  Store,
  Wallet,
  ChevronDown,
} from "lucide-react";

export interface MerchantAdUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: (
    campaign: Omit<
      SpatialAdCampaign,
      | "id"
      | "impressionsCount"
      | "agentConversionsCount"
      | "instantAutoBagCount"
      | "spentAttentionUsdc"
    >,
  ) => void;
  walletState?: Web3WalletState;
}

const PRESET_CREATIVES = [
  {
    title: "Zara Urban Winter Trench Flash",
    merchant: "Zara Fashion",
    url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&q=80",
    category: "Apparel",
    originalPrice: 1899,
    discount: 55,
    mall: "Sandton City Mall",
    corridor: "Level 1 North Passage Corridor #2",
    beacons: ["BEAC-SANDTON-01-N", "BEAC-ZARA-CORRIDOR-04", "UWB-CORR-NODE-89"],
  },
  {
    title: "Nike Air Max Pulse Runner Pass",
    merchant: "Nike Performance",
    url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    category: "Sportswear",
    originalPrice: 2499,
    discount: 40,
    mall: "Sandton City Mall",
    corridor: "Level 1 South Concourse Wing",
    beacons: ["BEAC-NIKE-SOUTH-02", "UWB-ATHLETIC-HUB-11"],
  },
  {
    title: "Apple iPhone 16 MagSafe Bundle",
    merchant: "iStore Apple",
    url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80",
    category: "Electronics",
    originalPrice: 1199,
    discount: 60,
    mall: "Rosebank Mall",
    corridor: "Level 1 Tech Hub Corridor #1",
    beacons: ["BEAC-ISTORE-TECH-03", "UWB-APPLE-HUB-09"],
  },
  {
    title: "Woolworths Gourmet Bakery Basket",
    merchant: "Woolworths Food",
    url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80",
    category: "Grocery",
    originalPrice: 380,
    discount: 52,
    mall: "V&A Waterfront",
    corridor: "Gourmet Fresh Market Passage",
    beacons: ["BEAC-WOOLIES-FOOD-05", "UWB-WATERFRONT-MKT"],
  },
];

export function MerchantAdUploader({
  isOpen,
  onClose,
  onUploadSuccess,
  walletState,
}: MerchantAdUploaderProps) {
  // Web3 Multi-Chain Provider Hook (Arc, Base, Ethereum, Avax, Robinhood, Tempo, Tether)
  const {
    isMetaMaskInstalled,
    isConnected: isMetaMaskConnected,
    isConnecting: isMetaMaskConnecting,
    address: metaMaskAddress,
    selectedChainId,
    currentChainConfig,
    balances: web3Balances,
    connectMetaMask,
    switchChain,
    authorizeUsdcMicroPayment,
    supportedChains,
  } = useWeb3Wallet();

  // 1. Drag-and-drop & asset upload state
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedCreativeUrl, setUploadedCreativeUrl] = useState<string>(PRESET_CREATIVES[0].url);
  const [uploadedFileName, setUploadedFileName] = useState<string>("zara_trench_campaign_4k.webp");
  const [mediaType, setMediaType] = useState<"image" | "video" | "interactive_deal">(
    "interactive_deal",
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Asset compression pipeline state
  const [isProcessingAsset, setIsProcessingAsset] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(100);
  const [compressionStatus, setCompressionStatus] = useState("Ready for sub-meter broadcast");
  const [originalSizeKb, setOriginalSizeKb] = useState(1150);
  const [compressedSizeKb, setCompressedSizeKb] = useState(142);
  const [ipfsCid, setIpfsCid] = useState("QmZar89FaXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1m");
  const [copiedCid, setCopiedCid] = useState(false);

  // 2. Metadata Form Fields: Corridors, Beacons & Deal Parameters
  const [campaignTitle, setCampaignTitle] = useState("Zara Urban Winter Trench Flash · 55% Drop");
  const [merchantName, setMerchantName] = useState("Zara Fashion");
  const [selectedMall, setSelectedMall] = useState("Sandton City Mall");
  const [targetCorridor, setTargetCorridor] = useState("Level 1 North Passage Corridor #2");
  const [broadcastRadius, setBroadcastRadius] = useState(35);
  const [beaconUuids, setBeaconUuids] = useState<string[]>([
    "BEAC-SANDTON-01-N",
    "BEAC-ZARA-CORRIDOR-04",
    "UWB-CORR-NODE-89",
  ]);
  const [newBeaconInput, setNewBeaconInput] = useState("");
  const [originalPriceZar, setOriginalPriceZar] = useState(1899);
  const [discountPercent, setDiscountPercent] = useState(55);
  const [attentionPoolUsdc, setAttentionPoolUsdc] = useState(250);
  const [campaignDescription, setCampaignDescription] = useState(
    "Autonomous personal shopping agent instant 55% discount drop within 35m corridor beacon coverage.",
  );

  // Multi-Channel Syndication Checkboxes
  const [syncMeta, setSyncMeta] = useState(true);
  const [syncGoogle, setSyncGoogle] = useState(true);
  const [syncBillboards, setSyncBillboards] = useState(true);

  // 3. Simulated Micro-Fee Payment State
  const [paymentMethod, setPaymentMethod] = useState<"metamask" | "card">("metamask");
  const [isPaying, setIsPaying] = useState(false);
  const [paymentStep, setPaymentStep] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [escrowTxHash, setEscrowTxHash] = useState<string | null>(null);

  // Card details state
  const [cardNumber, setCardNumber] = useState("4532 •••• •••• 8921");
  const [cardExpiry, setCardExpiry] = useState("08/28");
  const [cardCvc, setCardCvc] = useState("742");
  const [cardHolder, setCardHolder] = useState("Alex Vance");

  if (!isOpen) return null;

  const handleSimulateAssetProcessing = (fileName: string, url: string) => {
    setIsProcessingAsset(true);
    setCompressionProgress(20);
    setCompressionStatus("1/4: Analyzing rich media bitrate & color quantization...");
    setUploadedFileName(fileName);
    setUploadedCreativeUrl(url);

    setTimeout(() => {
      setCompressionProgress(55);
      setCompressionStatus(
        "2/4: Applying WebP/AVIF vector compression (85% bandwidth reduction)...",
      );
    }, 350);

    setTimeout(() => {
      setCompressionProgress(85);
      setCompressionStatus("3/4: Appending spatial anchor metadata & corridor beacon UUIDs...");
      const orig = Math.floor(Math.random() * 600 + 850);
      const comp = Math.floor(orig * 0.13);
      setOriginalSizeKb(orig);
      setCompressedSizeKb(comp);
      const newCid = `Qm${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
      setIpfsCid(newCid);
    }, 700);

    setTimeout(() => {
      setCompressionProgress(100);
      setCompressionStatus("4/4: IPFS CID hash generated & verified for sub-meter broadcast!");
      setIsProcessingAsset(false);
    }, 1050);
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

  const handleProcessMicroPaymentAndPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPaying(true);

    let finalTxHash = `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`;

    if (paymentMethod === "metamask") {
      setPaymentStep(`1/3: Requesting MetaMask Web3 signature on ${currentChainConfig.name}...`);
      await new Promise((r) => setTimeout(r, 650));

      setPaymentStep(
        `2/3: Executing on-chain $0.45 USDC micro-escrow lockup on ${currentChainConfig.shortName}...`,
      );
      const authRes = await authorizeUsdcMicroPayment({
        amountUsdc: 0.45,
        campaignId: `camp-${Date.now()}`,
        purpose: `Decentralized Storage Escrow (${selectedMall} Corridor Node)`,
      });
      finalTxHash = authRes.txHash;

      setPaymentStep("3/3: Pinning encrypted creative across 12 IPFS validator nodes...");
      await new Promise((r) => setTimeout(r, 600));
    } else {
      setPaymentStep("1/3: Verifying card token & 3D Secure bank gateway authorization...");
      await new Promise((r) => setTimeout(r, 700));

      setPaymentStep(
        "2/3: Settling R8.50 ($0.45 USDC eq.) storage micro-fee via Visa/Mastercard...",
      );
      await new Promise((r) => setTimeout(r, 800));

      setPaymentStep("3/3: Pinning encrypted creative across 12 IPFS validator nodes...");
      await new Promise((r) => setTimeout(r, 600));
    }

    setEscrowTxHash(finalTxHash);
    setIsPaying(false);
    setPaymentSuccess(true);

    const discounted = Math.round(originalPriceZar * (1 - discountPercent / 100));

    if (onUploadSuccess) {
      onUploadSuccess({
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
          expiresAt: 1775500000000 + 86400000 * 3,
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
          processedAt: 1775500000000,
        },
        cloudStorageEscrow: {
          feePaidUsdc: 0.45,
          feePaidToken: paymentMethod === "metamask" ? "USDC" : "ZAR_FIAT",
          escrowTxHash: finalTxHash,
          pinningNodes: 12,
          hostingStatus: "ACTIVE_PINNED",
          daysRemaining: 30,
        },
        syndicationChannels: {
          metaAds: {
            enabled: syncMeta,
            status: syncMeta ? "LIVE" : "PAUSED",
            campaignId: `META-ACT-${Math.floor(Math.random() * 800000 + 100000)}`,
            impressions: syncMeta ? 31200 : 0,
            reach: syncMeta ? 21400 : 0,
            clicks: syncMeta ? 940 : 0,
            budgetDailyUsd: 25,
          },
          googleAds: {
            enabled: syncGoogle,
            status: syncGoogle ? "LIVE" : "PAUSED",
            campaignId: `GOOG-MAP-LOC-${Math.floor(Math.random() * 8000 + 1000)}`,
            mapImpressions: syncGoogle ? 24500 : 0,
            searchClicks: syncGoogle ? 680 : 0,
            budgetDailyUsd: 20,
          },
          doohBillboards: {
            enabled: syncBillboards,
            status: syncBillboards ? "LIVE" : "PAUSED",
            billboardLocations: ["Sandton High-Speed Tower", "M1 North Highway Billboard #4"],
            vehicleDetections: syncBillboards ? 15800 : 0,
            amplifierPowerWatts: 45,
          },
          autoComMesh: {
            enabled: true,
            status: "LIVE",
            submeterBeaconsCount: beaconUuids.length,
            a2aHandshakes: 12400,
            convertedDeals: 580,
          },
        },
        networkSync: {
          googleAds: syncGoogle,
          metaAds: syncMeta,
          doohBillboards: syncBillboards,
          doohBillboardLocations: ["Sandton High-Speed Tower", "M1 North Highway Billboard #4"],
        },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl sm:rounded-3xl bg-slate-950 border border-teal-500/50 shadow-2xl text-slate-100 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 shrink-0 bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 flex items-center justify-center font-bold text-lg shadow-lg shadow-teal-500/20 shrink-0">
              <UploadCloud className="w-5 h-5 text-slate-950" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-extrabold text-white truncate">
                  Merchant Ad Uploader &amp; Spatial Router
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-mono border border-teal-500/40 hidden xs:inline">
                  Decentralized Ad Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                Upload creative, configure target corridors &amp; beacons, and settle decentralized
                hosting escrow via MetaMask or Bank Card
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

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {paymentSuccess ? (
            /* Success View */
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-emerald-500/40 text-center space-y-5 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-lg sm:text-xl font-extrabold text-white">
                  Spatial Ad Pinned &amp; Syndicated!
                </h3>
                <p className="text-xs text-slate-300">
                  Your creative asset is compressed for sub-meter BLE transmission, pinned to 12
                  IPFS validator nodes, and live on the Open Ad Library across{" "}
                  {currentChainConfig.name}.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">IPFS CID Hash</span>
                  <p className="text-teal-300 font-bold truncate">{ipfsCid}</p>
                  <p className="text-[10px] text-slate-400">12 Pinning Nodes Active</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">
                    Micro-Escrow Tx Proof
                  </span>
                  <p className="text-emerald-400 font-bold truncate">
                    {escrowTxHash || "0x78ab12...99ef"}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Settled on {currentChainConfig.shortName} via{" "}
                    {paymentMethod === "metamask" ? "MetaMask USDC" : "Bank Card (Visa)"}
                  </p>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  View In Open Ad Library
                </button>
              </div>
            </div>
          ) : (
            /* Upload & Config Form */
            <form onSubmit={handleProcessMicroPaymentAndPublish} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 1. Drag & Drop File Zone (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <UploadCloud className="w-4 h-4 text-teal-400" />
                      <span>1. Drag-and-Drop Creative File</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Drop marketing visuals, short video loops or spatial cards.
                    </p>
                  </div>

                  {/* Drop Zone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 overflow-hidden group ${
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
                        Drop media creative or <span className="text-teal-400">browse file</span>
                      </p>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                        PNG, WebP, MP4 Video Loops (Max 25MB)
                      </p>
                    </div>

                    <div className="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300 truncate max-w-full">
                      {uploadedFileName}
                    </div>
                  </div>

                  {/* Quick Preset Picker */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-400 uppercase">
                      Quick Preset Creatives:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {PRESET_CREATIVES.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setCampaignTitle(preset.title);
                            setMerchantName(preset.merchant);
                            setOriginalPriceZar(preset.originalPrice);
                            setDiscountPercent(preset.discount);
                            setSelectedMall(preset.mall);
                            setTargetCorridor(preset.corridor);
                            setBeaconUuids(preset.beacons);
                            handleSimulateAssetProcessing(
                              `${preset.merchant.toLowerCase()}_asset.webp`,
                              preset.url,
                            );
                          }}
                          className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                            uploadedCreativeUrl === preset.url
                              ? "bg-teal-500/20 border-teal-500/60 text-white shadow-sm"
                              : "bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700"
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.title}
                            className="w-8 h-8 rounded-lg object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold truncate">{preset.merchant}</p>
                            <p className="text-[9px] font-mono text-teal-400">
                              -{preset.discount}% · R{preset.originalPrice}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Vector Compression & IPFS CID Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300 font-bold flex items-center gap-1.5">
                        <Cpu
                          className={`w-3.5 h-3.5 ${isProcessingAsset ? "animate-spin text-teal-400" : "text-emerald-400"}`}
                        />
                        <span>BLE Vector Compression</span>
                      </span>
                      <span className="text-teal-400 font-bold">{compressionProgress}%</span>
                    </div>

                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full transition-all duration-300"
                        style={{ width: `${compressionProgress}%` }}
                      />
                    </div>

                    <p className="text-[10px] font-mono text-slate-400 truncate">
                      {compressionStatus}
                    </p>

                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80 text-center font-mono">
                      <div className="p-1.5 rounded-lg bg-slate-950">
                        <p className="text-[8px] text-slate-500 uppercase">Original</p>
                        <p className="text-[11px] font-bold text-slate-300">{originalSizeKb} KB</p>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-950">
                        <p className="text-[8px] text-slate-500 uppercase">BLE Compressed</p>
                        <p className="text-[11px] font-bold text-teal-300">{compressedSizeKb} KB</p>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-950">
                        <p className="text-[8px] text-slate-500 uppercase">Saved</p>
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

                {/* 2. Metadata Form Fields: Corridors & Beacons (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <Radio className="w-4 h-4 text-teal-400" />
                      <span>2. Spatial Corridor &amp; Beacon Targeting Metadata</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Configure sub-meter indoor mall coordinates, broadcast reach &amp; deal
                      economics.
                    </p>
                  </div>

                  {/* Title & Brand */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-mono text-slate-400">Campaign Title</label>
                      <input
                        type="text"
                        required
                        value={campaignTitle}
                        onChange={(e) => setCampaignTitle(e.target.value)}
                        className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-teal-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-slate-400">
                        Merchant Brand Name
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

                  {/* Mall & Corridor Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-mono text-slate-400">
                        Target Mall Facility
                      </label>
                      <select
                        value={selectedMall}
                        onChange={(e) => setSelectedMall(e.target.value)}
                        className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
                      >
                        <option value="Sandton City Mall">Sandton City Mall (Gauteng)</option>
                        <option value="Rosebank Mall">Rosebank Mall (Transit Hub)</option>
                        <option value="V&A Waterfront">V&amp;A Waterfront (Cape Town)</option>
                        <option value="Gateway Theatre of Shopping">Gateway (Durban)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-slate-400">
                        Target Floor Corridor Node
                      </label>
                      <input
                        type="text"
                        required
                        value={targetCorridor}
                        onChange={(e) => setTargetCorridor(e.target.value)}
                        className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  {/* Broadcast Radius Slider */}
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Sub-Meter Broadcast Radius:</span>
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

                  {/* Targeted Beacon UUIDs Tag Manager */}
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <label className="text-[10px] font-mono text-slate-400 uppercase">
                      Targeted Beacon / UWB Anchor UUIDs ({beaconUuids.length}):
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {beaconUuids.map((uuid, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-lg bg-teal-500/15 text-teal-300 border border-teal-500/30 text-[10px] font-mono flex items-center gap-1.5"
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
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-200 outline-none focus:border-teal-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddBeacon}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl text-slate-200 cursor-pointer"
                      >
                        + Add UUID
                      </button>
                    </div>
                  </div>

                  {/* Pricing, Discount & Dynamic Auto-Bag */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-mono text-slate-400">
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
                      <label className="text-[11px] font-mono text-slate-400">Discount %</label>
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
                      <label className="text-[11px] font-mono text-slate-400">
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

                  {/* Multi-Network Cross-Sync Checkboxes */}
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <p className="text-[11px] font-mono text-slate-300 font-bold">
                      Multi-Network Cross-Syndication Channels
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                      <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={syncMeta}
                          onChange={(e) => setSyncMeta(e.target.checked)}
                          className="accent-indigo-500 rounded"
                        />
                        <span>🔵 Meta Ads</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={syncGoogle}
                          onChange={(e) => setSyncGoogle(e.target.checked)}
                          className="accent-blue-500 rounded"
                        />
                        <span>🟢 Google Ads</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={syncBillboards}
                          onChange={(e) => setSyncBillboards(e.target.checked)}
                          className="accent-amber-500 rounded"
                        />
                        <span>🟡 DOOH Billboard</span>
                      </label>
                    </div>
                  </div>

                  {/* =========================================================
                      3. MULTI-CHAIN METAMASK & CARD MICRO-FEE PAYMENT HANDLER
                     ========================================================= */}
                  <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/50 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-indigo-400" />
                        <h4 className="text-xs font-mono font-bold text-white">
                          3. Decentralized Storage Micro-Fee Payment ($0.45 USDC / R8.50)
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                        12 Validator Nodes
                      </span>
                    </div>

                    {/* Payment Mode Selector Tabs */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("metamask")}
                        className={`py-2 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          paymentMethod === "metamask"
                            ? "bg-indigo-600 text-white shadow-md"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <span className="text-base">🦊</span>
                        <span>MetaMask (USDC Multi-Chain)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("card")}
                        className={`py-2 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          paymentMethod === "card"
                            ? "bg-indigo-600 text-white shadow-md"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Bank Card (Visa/MC)</span>
                      </button>
                    </div>

                    {/* Method 1: MetaMask Web3 Multi-Chain Wallet Provider */}
                    {paymentMethod === "metamask" && (
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs font-mono">
                        {/* Blockchain Network Selector (Arc, Base, Ethereum, Avax, Robinhood, Tempo, Tether) */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] text-slate-400">
                            <span>Select Settlement Blockchain Rail:</span>
                            <span className="text-teal-400">
                              {currentChainConfig.isTestnet
                                ? "Testnet Faucet Active"
                                : "Mainnet Gas Rail"}
                            </span>
                          </div>

                          <div className="relative">
                            <select
                              value={selectedChainId}
                              onChange={(e) => switchChain(e.target.value as SupportedChainId)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                            >
                              <optgroup label="Arc (Arbitrum Arc & Abstract)">
                                <option value="arc_mainnet">
                                  ⚡ Arc Blockchain Mainnet (Chain ID: 2741)
                                </option>
                                <option value="arc_testnet">
                                  🧪 Arc Sepolia Testnet (Chain ID: 11124)
                                </option>
                              </optgroup>
                              <optgroup label="Base (Coinbase L2)">
                                <option value="base_mainnet">
                                  🔵 Base Mainnet (Chain ID: 8453)
                                </option>
                                <option value="base_sepolia">
                                  🧪 Base Sepolia Testnet (Chain ID: 84532)
                                </option>
                              </optgroup>
                              <optgroup label="Ethereum">
                                <option value="eth_mainnet">
                                  ⟠ Ethereum Mainnet (Chain ID: 1)
                                </option>
                                <option value="eth_sepolia">
                                  🧪 Ethereum Sepolia (Chain ID: 11155111)
                                </option>
                              </optgroup>
                              <optgroup label="Avalanche (Avax)">
                                <option value="avax_mainnet">
                                  🔺 Avalanche C-Chain (Chain ID: 43114)
                                </option>
                                <option value="avax_fuji">
                                  🧪 Avax Fuji Testnet (Chain ID: 43113)
                                </option>
                              </optgroup>
                              <optgroup label="Robinhood Chain">
                                <option value="robinhood_mainnet">
                                  🏹 Robinhood Settlement Rail (Chain ID: 70001)
                                </option>
                                <option value="robinhood_testnet">
                                  🧪 Robinhood Devnet (Chain ID: 70002)
                                </option>
                              </optgroup>
                              <optgroup label="Tempo Network">
                                <option value="tempo_mainnet">
                                  🎵 Tempo Micropayment Mainnet (Chain ID: 80001)
                                </option>
                                <option value="tempo_testnet">
                                  🧪 Tempo Testnet (Chain ID: 80002)
                                </option>
                              </optgroup>
                              <optgroup label="Tether Settlement Rail">
                                <option value="tether_mainnet">
                                  ₮ Tether WDK Mainnet (Chain ID: 90001)
                                </option>
                                <option value="tether_testnet">
                                  🧪 Tether WDK Testnet (Chain ID: 90002)
                                </option>
                              </optgroup>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>
                        </div>

                        {/* Connection Status & Balances */}
                        <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                              <span>MetaMask Status:</span>
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-teal-300 font-bold">
                                {metaMaskAddress
                                  ? `${metaMaskAddress.substring(0, 6)}...${metaMaskAddress.substring(38)}`
                                  : "0x742d...f44e"}
                              </span>
                              {!isMetaMaskConnected && (
                                <button
                                  type="button"
                                  onClick={connectMetaMask}
                                  className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-bold"
                                >
                                  Connect
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-slate-400">
                            <span>USDC Balance on {currentChainConfig.shortName}:</span>
                            <span className="text-teal-300 font-bold">
                              ${web3Balances.USDC} USDC
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-slate-400">
                            <span>Gas Token:</span>
                            <span className="text-slate-200">
                              {web3Balances.NATIVE} {currentChainConfig.nativeCurrency.symbol}{" "}
                              (~$0.001 gas)
                            </span>
                          </div>
                        </div>

                        <div className="pt-1 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Decentralized Storage Escrow:</span>
                          <span className="text-emerald-400 font-bold">
                            $0.45 USDC (1 Month 12-Node Pinning)
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Method 2: Bank Card Gateway */}
                    {paymentMethod === "card" && (
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs font-mono">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="col-span-2">
                            <label className="text-[10px] text-slate-400">Card Number</label>
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              className="mt-0.5 w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs outline-none"
                              placeholder="4532 •••• •••• 8921"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400">Expiry (MM/YY)</label>
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              className="mt-0.5 w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs outline-none"
                              placeholder="08/28"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400">CVC</label>
                            <input
                              type="password"
                              maxLength={4}
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value)}
                              className="mt-0.5 w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs outline-none"
                              placeholder="742"
                            />
                          </div>
                        </div>

                        <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Amount to Charge:</span>
                          <span className="text-emerald-400 font-bold">
                            R8.50 ZAR (~$0.45 USDC)
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Payment step in progress */}
                    {isPaying && paymentStep && (
                      <div className="p-3 rounded-xl bg-indigo-900/40 border border-indigo-500/40 text-xs font-mono text-indigo-200 flex items-center gap-2 animate-pulse">
                        <RefreshCw className="w-4 h-4 animate-spin text-teal-400 shrink-0" />
                        <span>{paymentStep}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isPaying}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-teal-500/20 transition-all active:scale-95 cursor-pointer flex items-center gap-2 disabled:opacity-50"
                    >
                      {isPaying ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Processing Micro-Fee...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>
                            Pay $0.45 via{" "}
                            {paymentMethod === "metamask"
                              ? `MetaMask (${currentChainConfig.shortName})`
                              : "Bank Card"}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
export default MerchantAdUploader;
