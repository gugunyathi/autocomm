import React, { useState } from "react";
import { X, Globe, Sparkles, CheckCircle2, Shield } from "lucide-react";

interface AgentNameServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
  walletAddress?: string;
  userUsdcBalance?: number;
}

export const AgentNameServiceModal: React.FC<AgentNameServiceModalProps> = ({
  isOpen,
  onClose,
  initialTab = "search",
  walletAddress = "0xAuto...9012",
  userUsdcBalance = 250,
}) => {
  const [tab, setTab] = useState(initialTab);
  const [query, setQuery] = useState("");
  const [registered, setRegistered] = useState<string[]>(["muse.za", "nibble.za"]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRegister = (name: string) => {
    const formatted = name.endsWith(".za") ? name : `${name}.za`;
    if (!registered.includes(formatted)) {
      setRegistered([...registered, formatted]);
      setSuccessMsg(`Successfully registered ${formatted} for your AI Agent!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌐🏷️</span>
            <div>
              <h3 className="font-bold text-base">Agent Name Service (.za ANS)</h3>
              <p className="text-xs text-slate-400 font-mono">
                Decentralized Identifiers for Autonomous Mall Agents
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 px-6 gap-2">
          {["search", "my-agents", "resolver"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-xs font-mono font-semibold capitalize border-b-2 transition-all ${
                tab === t
                  ? "border-primary text-primary bg-primary/10"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              {t.replace("-", " ")}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
          {tab === "search" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> Claim your Agent Domain (.za)
                </h4>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="e.g. fourways-shopper"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-primary"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">
                      .za
                    </span>
                  </div>
                  <button
                    onClick={() => query && handleRegister(query)}
                    className="px-5 py-2.5 bg-primary text-black font-bold text-xs rounded-xl hover:opacity-95 transition-all shadow-md shrink-0"
                  >
                    Register ⚡
                  </button>
                </div>

                {successMsg && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-mono text-slate-400">Popular Suggested Agent Names:</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { name: "fourways-bargain.za", price: "10 USDC" },
                    { name: "belair-nibble.za", price: "10 USDC" },
                    { name: "northgate-courier.za", price: "15 USDC" },
                    { name: "jackal-shopper.za", price: "10 USDC" },
                  ].map((sug) => (
                    <div
                      key={sug.name}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs"
                    >
                      <span className="font-mono text-white font-bold">{sug.name}</span>
                      <button
                        onClick={() => handleRegister(sug.name)}
                        className="px-3 py-1 rounded-lg bg-primary/20 text-primary hover:bg-primary hover:text-black font-mono transition-all font-semibold"
                      >
                        Claim ({sug.price})
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "my-agents" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
                <h4 className="font-bold text-sm text-white">Registered Agent Handles</h4>
                <p className="text-xs text-slate-400">
                  Wallet: <span className="font-mono text-primary">{walletAddress}</span> (Balance:{" "}
                  {userUsdcBalance} USDC)
                </p>

                <div className="space-y-2 mt-3">
                  {registered.map((domain) => (
                    <div
                      key={domain}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" />
                        <span className="font-mono font-bold text-white">{domain}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                        Active & Resolved
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "resolver" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-teal-400" /> Decentralized Agent Resolver
                </h4>
                <p className="text-xs text-slate-400">
                  Resolves `.za` agent identifiers to secure multi-sig smart contracts and P2P mesh
                  relay nodes across Johannesburg malls.
                </p>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                  <div>Status: Online (Zero-Knowledge Verified)</div>
                  <div>Mesh Protocol: Libp2p / Bitchat Multi-Hop</div>
                  <div>Latency: 12ms (Johannesburg Edge Node)</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
