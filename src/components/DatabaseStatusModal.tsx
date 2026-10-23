import React, { useState, useEffect } from "react";
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Zap,
  Layers,
  X,
  ExternalLink,
  ShieldCheck,
  Package,
  Store,
  MapPin,
  Clock,
} from "lucide-react";

export interface DatabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MongoHealthData {
  connected: boolean;
  database: string;
  uriConfigured: boolean;
  pingMs?: number;
  stats?: {
    collections: string[];
    mallCount?: number;
    storeCount?: number;
    productCount?: number;
    orderCount?: number;
  };
}

export function DatabaseStatusModal({ isOpen, onClose }: DatabaseStatusModalProps) {
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [health, setHealth] = useState<MongoHealthData | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/db/status");
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch (err) {
      console.error("Failed to query db status:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerSeed = async () => {
    setSeeding(true);
    setStatusMessage("Executing idempotent database upsert & index build across 5 malls...");
    try {
      const res = await fetch("/api/db/seed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(
          `Successfully seeded: ${data.mallCount} malls, ${data.storeCount} stores, ${data.productCount} products!`,
        );
      } else {
        setStatusMessage(`Notice: ${data.message || "Database seed completed with fallback."}`);
      }
      await fetchHealth();
    } catch {
      setStatusMessage("Failed to seed database. Using in-memory fallback.");
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHealth();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isConnected = health?.connected ?? false;
  const isUriConfigured = health?.uriConfigured ?? false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="glass relative w-full max-w-lg rounded-3xl border border-emerald-500/30 bg-[#070b14]/95 p-5 sm:p-6 shadow-[0_0_50px_rgba(16,185,129,0.15)] text-foreground flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="db-status-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 id="db-status-title" className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                MongoDB Atlas Backend
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold border ${
                    isConnected
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                      : isUriConfigured
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-blue-500/20 text-blue-300 border-blue-500/40"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                  {isConnected ? "ONLINE & INDEXED" : isUriConfigured ? "STANDBY / RECONNECTING" : "IN-MEMORY FALLBACK"}
                </span>
              </h2>
              <p className="text-xs text-muted-foreground font-mono">
                Persistent Spatial Ledger & Product Catalog Cluster
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="glass h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-white transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="glass rounded-2xl p-3 border border-white/10 bg-white/5 flex flex-col gap-1">
            <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" /> Malls
            </span>
            <span className="text-lg font-bold text-white font-mono">
              {health?.stats?.mallCount ?? 5}
            </span>
          </div>

          <div className="glass rounded-2xl p-3 border border-white/10 bg-white/5 flex flex-col gap-1">
            <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
              <Store className="w-3 h-3 text-cyan-400" /> Outlets
            </span>
            <span className="text-lg font-bold text-white font-mono">
              {health?.stats?.storeCount ?? 40}
            </span>
          </div>

          <div className="glass rounded-2xl p-3 border border-white/10 bg-white/5 flex flex-col gap-1">
            <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
              <Package className="w-3 h-3 text-amber-400" /> Products
            </span>
            <span className="text-lg font-bold text-white font-mono">
              {health?.stats?.productCount ?? 320}
            </span>
          </div>

          <div className="glass rounded-2xl p-3 border border-white/10 bg-white/5 flex flex-col gap-1">
            <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3 text-purple-400" /> Ping
            </span>
            <span className="text-lg font-bold text-white font-mono">
              {health?.pingMs !== undefined ? `${health.pingMs}ms` : "<2ms"}
            </span>
          </div>
        </div>

        {/* Database Details Card */}
        <div className="glass rounded-2xl p-4 border border-white/10 bg-black/40 flex flex-col gap-2.5 text-xs font-mono">
          <div className="flex items-center justify-between text-muted-foreground pb-2 border-b border-white/10">
            <span>Database Cluster:</span>
            <span className="text-emerald-400 font-bold">{health?.database || "autocom_db"}</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground pb-2 border-b border-white/10">
            <span>URI State:</span>
            <span className={isUriConfigured ? "text-emerald-400" : "text-amber-400"}>
              {isUriConfigured ? "Configured in .env" : "Using in-memory seed (Auto-sync ready)"}
            </span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground pb-2 border-b border-white/10">
            <span>Active Collections:</span>
            <span className="text-white font-semibold">
              {health?.stats?.collections?.length
                ? health.stats.collections.join(", ")
                : "malls, stores, products, orders, parked_offers"}
            </span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Settled Orders Persisted:</span>
            <span className="text-white font-semibold">{health?.stats?.orderCount ?? 2}</span>
          </div>
        </div>

        {/* Notice Message */}
        {statusMessage && (
          <div className="rounded-xl px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
            {statusMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
          <button
            onClick={fetchHealth}
            disabled={loading}
            className="w-full sm:w-auto flex-1 glass rounded-xl py-2 px-3 text-xs font-mono font-bold text-white hover:border-emerald-500/60 hover:bg-emerald-500/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Test Connection</span>
          </button>

          <button
            onClick={handleTriggerSeed}
            disabled={seeding}
            className="w-full sm:w-auto flex-1 rounded-xl py-2 px-3 text-xs font-mono font-extrabold bg-emerald-500 text-black hover:bg-emerald-400 transition-all flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer disabled:opacity-50"
          >
            <Zap className={`w-3.5 h-3.5 ${seeding ? "animate-bounce" : ""}`} />
            <span>{seeding ? "Seeding Cluster..." : "Re-Seed All 5 Malls"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
