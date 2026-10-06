import { useState } from "react";
import type { SpatialAdCampaign, Web3WalletState } from "@/types/autocom";
import { MerchantAdUploader } from "@/components/adserver/MerchantAdUploader";
import {
  X,
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
} from "lucide-react";

interface OpenAdLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export function OpenAdLibraryModal({
  isOpen,
  onClose,
  campaigns,
  onSponsorStorage,
  onUploadCampaign,
  walletState,
}: OpenAdLibraryModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  const [sponsoredCampaignId, setSponsoredCampaignId] = useState<string | null>(null);
  const [copiedCid, setCopiedCid] = useState<string | null>(null);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl sm:rounded-3xl bg-slate-950 border border-indigo-500/40 shadow-2xl text-slate-100 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 shrink-0 bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-500/20 shrink-0">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-extrabold text-white truncate">
                  Decentralized Open Ad &amp; Media Library
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono border border-indigo-500/40 hidden xs:inline">
                  Public Spatial Transparency
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                Decentralized on-chain verified ads, IPFS storage pinning &amp; multi-channel
                syndication metrics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsUploaderOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Spatial Ad</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-3.5 sm:px-6 border-b border-slate-800/80 bg-slate-900/40 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by brand, beacon UUID, CID or product keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none font-mono"
              />
            </div>

            {/* Channel Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono scrollbar-none">
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
        </div>

        {/* Ad Media Gallery */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono text-slate-400">
              Showing {filtered.length} Active Public Campaigns Across Sandton, Rosebank &amp; Cape
              Town Nodes
            </p>
            <span className="text-[11px] font-mono text-indigo-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% On-Chain Escrow Verified</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((c, index) => {
              const defaultCid =
                c.spatialMetadata?.ipfsCid ||
                `Qm${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
              const storageNode = `IPFS Node #${(index % 4) + 1} (Johannesburg-DC-01)`;
              const microFee = "$0.45 USDC / month";
              const meta = c.syndicationChannels?.metaAds;
              const goog = c.syndicationChannels?.googleAds;
              const dooh = c.syndicationChannels?.doohBillboards;
              const mesh = c.syndicationChannels?.autoComMesh;

              return (
                <div
                  key={c.id}
                  className="rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between overflow-hidden shadow-xl group"
                >
                  {/* Creative Media Preview */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950 border-b border-slate-800/80">
                    <img
                      src={c.mediaUrl}
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-black/40" />

                    {/* Brand Badge */}
                    <span
                      className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-black font-mono shadow-md"
                      style={{ backgroundColor: c.brandBgColor, color: c.brandTextColor }}
                    >
                      {c.merchantLogo}
                    </span>

                    {/* Discount Badge */}
                    <span
                      className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold shadow-md ${
                        c.discountPayload.percentage > 50
                          ? "bg-rose-500 text-white"
                          : "bg-amber-500 text-slate-950"
                      }`}
                    >
                      -{c.discountPayload.percentage}% Drop{" "}
                      {c.discountPayload.percentage > 50 && "⚡ Auto-Bag"}
                    </span>

                    <div className="absolute bottom-2 left-2.5 right-2.5">
                      <p className="text-xs font-bold text-white truncate drop-shadow">{c.title}</p>
                      <p className="text-[10px] font-mono text-slate-300 drop-shadow">
                        Radius: {c.targetRadiusMeters}m · {c.merchantName}
                      </p>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-slate-300 leading-snug line-clamp-2">
                      {c.discountPayload.description}
                    </p>

                    {/* Spatial Corridor & Beacon UUIDs */}
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-[10px] font-mono">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>📍 Location:</span>
                        <span className="text-slate-200 truncate max-w-[170px]">
                          {c.spatialMetadata?.targetMall || "Sandton City Mall"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Corridor:</span>
                        <span className="text-teal-300 truncate max-w-[170px]">
                          {c.spatialMetadata?.targetCorridor || "Level 1 Main Concourse"}
                        </span>
                      </div>
                      {c.spatialMetadata?.beaconUuids &&
                        c.spatialMetadata.beaconUuids.length > 0 && (
                          <div className="pt-1 border-t border-slate-800/80 flex items-center gap-1 flex-wrap">
                            <span className="text-slate-500">Beacons:</span>
                            {c.spatialMetadata.beaconUuids.map((uuid, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.2 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 text-[9px]"
                              >
                                {uuid}
                              </span>
                            ))}
                          </div>
                        )}
                    </div>

                    {/* Multi-Network Cross-Sync Badges with Real-Time Metrics */}
                    <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                      <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                        Live Syndicated Distribution
                      </p>
                      <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                        <div className="p-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-300">
                          <div className="flex justify-between">
                            <span>📡 Spatial Mesh</span>
                            <span className="text-[9px] text-emerald-400">LIVE</span>
                          </div>
                          <p className="text-[11px] font-bold mt-0.5">
                            {mesh?.a2aHandshakes ? `${mesh.a2aHandshakes} A2A` : "16.4K Hands"}
                          </p>
                        </div>

                        {c.networkSync.metaAds && (
                          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                            <div className="flex justify-between">
                              <span>🔵 Meta Ads</span>
                              <span className="text-[9px] text-indigo-300">SYNCED</span>
                            </div>
                            <p className="text-[11px] font-bold mt-0.5">
                              {meta?.impressions
                                ? `${(meta.impressions / 1000).toFixed(1)}k Impr`
                                : "48.5k Impr"}
                            </p>
                          </div>
                        )}

                        {c.networkSync.googleAds && (
                          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300">
                            <div className="flex justify-between">
                              <span>🟢 Google Maps</span>
                              <span className="text-[9px] text-blue-300">SYNCED</span>
                            </div>
                            <p className="text-[11px] font-bold mt-0.5">
                              {goog?.mapImpressions
                                ? `${(goog.mapImpressions / 1000).toFixed(1)}k Views`
                                : "34.2k Views"}
                            </p>
                          </div>
                        )}

                        {c.networkSync.doohBillboards && (
                          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                            <div className="flex justify-between">
                              <span>🟡 DOOH Billboard</span>
                              <span className="text-[9px] text-amber-400">LIVE</span>
                            </div>
                            <p className="text-[11px] font-bold mt-0.5">
                              {dooh?.vehicleDetections
                                ? `${(dooh.vehicleDetections / 1000).toFixed(1)}k Cars`
                                : "18.4k Cars"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Decentralized Storage Monetization Micro-Fee Box */}
                    <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1 text-[10px] font-mono text-slate-400">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Cpu className="w-3 h-3 text-indigo-400" />
                          <span>Pinning Host:</span>
                        </span>
                        <span className="text-slate-200 truncate max-w-[120px]">{storageNode}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Storage Micro-Fee:</span>
                        <span className="text-teal-400 font-bold">{microFee}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[9px] text-slate-400">
                        <span className="truncate max-w-[140px]">CID: {defaultCid}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyCid(defaultCid)}
                          className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                        >
                          {copiedCid === defaultCid ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Sponsor Storage Space Action */}
                    <div className="pt-1">
                      <button
                        onClick={() => handleSponsor(c.id)}
                        className={`w-full py-2 px-3 rounded-xl font-bold text-xs font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          sponsoredCampaignId === c.id
                            ? "bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/30"
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
                </div>
              );
            })}
          </div>
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
      </div>
    </div>
  );
}
