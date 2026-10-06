import React, { useState } from "react";
import type { SpatialAdCampaign, Web3WalletState } from "@/types/autocom";
import { MerchantAdUploader } from "@/components/merchant/MerchantAdUploader";
import {
  Search,
  Database,
  Radio,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Coins,
  Share2,
  CheckCircle2,
  Sparkles,
  Tv,
  Globe,
  Copy,
  Check,
  Zap,
  Plus,
  UploadCloud,
  Eye,
  Sliders,
  Filter,
} from "lucide-react";

export interface AdLibraryViewProps {
  campaigns: SpatialAdCampaign[];
  onSponsorStorage: (campaignId: string, amountUsdc: number) => void;
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
  walletState?: Web3WalletState;
}

export function AdLibraryView({
  campaigns,
  onSponsorStorage,
  onUploadCampaign,
  walletState,
}: AdLibraryViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  const [sponsoredCampaignId, setSponsoredCampaignId] = useState<string | null>(null);
  const [copiedCid, setCopiedCid] = useState<string | null>(null);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);

  const filtered = campaigns.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.discountPayload.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.spatialMetadata?.beaconUuids?.some((uuid) =>
        uuid.toLowerCase().includes(searchQuery.toLowerCase()),
      ) ??
        false) ||
      (c.spatialMetadata?.ipfsCid?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    const matchesCategory =
      selectedCategory === "all" ||
      c.targetCategories.some((cat) => cat.toLowerCase() === selectedCategory.toLowerCase());

    const matchesChannel =
      selectedChannel === "all" ||
      (selectedChannel === "meta" &&
        (c.syndicationChannels?.metaAds?.enabled || c.networkSync.metaAds)) ||
      (selectedChannel === "google" &&
        (c.syndicationChannels?.googleAds?.enabled || c.networkSync.googleAds)) ||
      (selectedChannel === "billboard" &&
        (c.syndicationChannels?.doohBillboards?.enabled || c.networkSync.doohBillboards)) ||
      (selectedChannel === "mesh" && (c.syndicationChannels?.autoComMesh?.enabled || true));

    return matchesSearch && matchesCategory && matchesChannel;
  });

  const handleSponsor = (campaignId: string) => {
    onSponsorStorage(campaignId, 1.5);
    setSponsoredCampaignId(campaignId);
    setTimeout(() => setSponsoredCampaignId(null), 3000);
  };

  const handleCopyCid = (cid: string) => {
    navigator.clipboard.writeText(cid);
    setCopiedCid(cid);
    setTimeout(() => setCopiedCid(null), 2000);
  };

  return (
    <section className="relative w-full rounded-3xl bg-slate-950/90 border border-indigo-500/40 shadow-2xl p-4 sm:p-8 space-y-6 text-slate-100 overflow-hidden backdrop-blur-xl my-8">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-md">
              <Database className="w-5 h-5 text-white" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Decentralized Open Ad &amp; Media Library
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono border border-indigo-500/40">
              Meta Ads Library Architecture
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Public transparency archive of all active spatial campaigns, beacon metadata, IPFS
            storage pinning, and multi-channel syndication status across Meta, Google &amp; DOOH
            Billboards.
          </p>
        </div>

        <button
          onClick={() => setIsUploaderOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Spatial Creative</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between font-mono text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by brand, beacon UUID, CID or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: "all", label: "All Networks" },
            { id: "mesh", label: "📡 Spatial Mesh" },
            { id: "meta", label: "🔵 Meta Ads" },
            { id: "google", label: "🟢 Google Ads" },
            { id: "billboard", label: "🟡 DOOH Billboards" },
          ].map((ch) => (
            <button
              key={ch.id}
              onClick={() => setSelectedChannel(ch.id)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap border text-[11px] ${
                selectedChannel === ch.id
                  ? "bg-indigo-600 text-white border-indigo-400 shadow-sm"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>
      </div>

      {/* Campaign Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((c) => {
          const defaultCid =
            c.spatialMetadata?.ipfsCid ||
            `Qm${c.merchantName.substring(0, 3).toLowerCase()}${Math.random().toString(36).substring(2, 10)}`;
          const daysLeft = c.cloudStorageEscrow?.daysRemaining || 30;

          return (
            <div
              key={c.id}
              className="rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between overflow-hidden shadow-lg group"
            >
              <div>
                {/* Media Preview Box */}
                <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                  <img
                    src={c.mediaUrl}
                    alt={c.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-[10px] font-mono font-extrabold text-teal-300 border border-teal-500/40 flex items-center gap-1">
                      <Radio className="w-3 h-3 text-teal-400" />
                      <span>{c.targetRadiusMeters}m Reach</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-600/90 text-[10px] font-mono font-bold text-white shadow-sm">
                      -{c.discountPayload.percentage}% Instant Drop
                    </span>
                  </div>

                  {/* Mall & Corridor Tag */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-mono text-slate-300">
                    <span className="truncate max-w-[180px] bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                      📍 {c.spatialMetadata?.targetMall || "Sandton City"}
                    </span>
                    <span className="bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 text-teal-400 font-bold">
                      {c.spatialMetadata?.compressionRatio || "85% Saved"}
                    </span>
                  </div>
                </div>

                {/* Content Box */}
                <div className="p-4 space-y-3 font-mono text-xs">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">
                        {c.merchantName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Pool: ${c.attentionPoolUsdc} USDC
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-white mt-0.5 leading-snug line-clamp-1">
                      {c.title}
                    </h3>
                  </div>

                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                    {c.discountPayload.description}
                  </p>

                  {/* Multi-Network Syndication Badges */}
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>Syndication Status</span>
                      <span className="text-emerald-400 font-bold">Live Synced</span>
                    </div>
                    <div className="flex flex-wrap gap-1 text-[9px]">
                      <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        🔵 Meta:{" "}
                        {(c.syndicationChannels?.metaAds?.impressions || 31200).toLocaleString()}{" "}
                        imp
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        🟢 Google:{" "}
                        {(
                          c.syndicationChannels?.googleAds?.mapImpressions || 24500
                        ).toLocaleString()}{" "}
                        maps
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        🟡 DOOH:{" "}
                        {(
                          c.syndicationChannels?.doohBillboards?.vehicleDetections || 15800
                        ).toLocaleString()}{" "}
                        veh
                      </span>
                    </div>
                  </div>

                  {/* IPFS CID Cryptographic Hash Box */}
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <div className="min-w-0 flex items-center gap-1.5">
                      <Globe className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span className="text-slate-400">IPFS:</span>
                      <span className="text-indigo-300 truncate max-w-[130px]">{defaultCid}</span>
                    </div>
                    <button
                      onClick={() => handleCopyCid(defaultCid)}
                      className="p-1 hover:text-white cursor-pointer"
                      title="Copy IPFS CID"
                    >
                      {copiedCid === defaultCid ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Sponsor Action */}
              <div className="p-4 pt-0">
                <button
                  onClick={() => handleSponsor(c.id)}
                  className={`w-full py-2 px-3 rounded-xl font-bold text-xs font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    sponsoredCampaignId === c.id
                      ? "bg-emerald-500 text-slate-950 font-black shadow-md"
                      : "bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40"
                  }`}
                >
                  {sponsoredCampaignId === c.id ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Storage Pinned ($1.50 USDC)</span>
                    </>
                  ) : (
                    <>
                      <Coins className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Sponsor Cloud Storage ($1.50)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Merchant Ad Uploader Modal Instance */}
      <MerchantAdUploader
        isOpen={isUploaderOpen}
        onClose={() => setIsUploaderOpen(false)}
        onUploadSuccess={(newCamp) => {
          if (onUploadCampaign) {
            onUploadCampaign(newCamp);
          }
          setIsUploaderOpen(false);
        }}
        walletState={walletState}
      />
    </section>
  );
}
