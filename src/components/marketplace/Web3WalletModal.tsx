import { useState } from "react";
import type { Web3WalletState, ChainNetwork, TokenAsset } from "@/types/autocom";
import {
  X,
  Wallet,
  Coins,
  Zap,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Plus,
} from "lucide-react";

interface Web3WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletState: Web3WalletState;
  onSwitchNetwork: (network: ChainNetwork) => void;
  onFaucetTopup: (asset: TokenAsset, amount: number) => void;
}

export function Web3WalletModal({
  isOpen,
  onClose,
  walletState,
  onSwitchNetwork,
  onFaucetTopup,
}: Web3WalletModalProps) {
  const [faucetSuccess, setFaucetSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTopup = (asset: TokenAsset, amount: number) => {
    onFaucetTopup(asset, amount);
    setFaucetSuccess(`Added +${amount} ${asset}`);
    setTimeout(() => setFaucetSuccess(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl sm:rounded-3xl bg-slate-950 border border-teal-500/40 shadow-2xl text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 shrink-0 bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-blue-500 text-slate-950 flex items-center justify-center font-bold text-lg shadow-lg shadow-teal-500/20 shrink-0">
              <Wallet className="w-5 h-5 text-slate-950" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white truncate">
                  Autocomm Multi-Chain Web3 Rail
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-mono border border-teal-500/40">
                  ERC-X402 Ready
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                {walletState.address.substring(0, 6)}...
                {walletState.address.substring(walletState.address.length - 4)}
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

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* Chain Switcher */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Active Network Rail
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => onSwitchNetwork("base")}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  walletState.network === "base"
                    ? "bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/20 font-bold"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                <span>🔵 Base</span>
              </button>

              <button
                type="button"
                onClick={() => onSwitchNetwork("abstract")}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  walletState.network === "abstract"
                    ? "bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-500/20 font-bold"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                <span>🟢 Abstract</span>
              </button>

              <button
                type="button"
                onClick={() => onSwitchNetwork("arbitrum")}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  walletState.network === "arbitrum"
                    ? "bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-500/20 font-bold"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                <span>🔷 Arbitrum</span>
              </button>
            </div>
          </div>

          {/* Balances Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-teal-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase">
                Multi-Asset Liquid Portfolio
              </span>
              {faucetSuccess && (
                <span className="text-xs font-mono font-bold text-emerald-400 animate-pulse">
                  {faucetSuccess}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono text-teal-400 flex items-center gap-1 font-bold">
                  <DollarSign className="w-3 h-3" /> Native USDC
                </div>
                <p className="text-lg font-black text-white font-mono">
                  ${walletState.balances.USDC.toFixed(1)}
                </p>
                <button
                  onClick={() => handleTopup("USDC", 50)}
                  className="w-full mt-1 py-1 rounded bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-[10px] font-mono font-bold border border-teal-500/30 transition-colors"
                >
                  + Top Up 50
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono text-purple-400 flex items-center gap-1 font-bold">
                  <Zap className="w-3 h-3" /> ERC-X402
                </div>
                <p className="text-lg font-black text-white font-mono">
                  {walletState.balances.ERC_X402.toLocaleString()}
                </p>
                <button
                  onClick={() => handleTopup("ERC-X402", 250)}
                  className="w-full mt-1 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[10px] font-mono font-bold border border-purple-500/30 transition-colors"
                >
                  + Top Up 250
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono text-amber-400 flex items-center gap-1 font-bold">
                  <span>🇿🇦</span> Fiat ZAR
                </div>
                <p className="text-lg font-black text-white font-mono">
                  R{walletState.balances.ZAR.toLocaleString()}
                </p>
                <button
                  onClick={() => handleTopup("ZAR_FIAT", 500)}
                  className="w-full mt-1 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30 transition-colors"
                >
                  + Top Up R500
                </button>
              </div>
            </div>
          </div>

          {/* Recent Multi-Chain Transactions Ledger */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Recent On-Chain Settlement Ledger ({walletState.transactions.length})
            </h4>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {walletState.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between text-xs font-mono"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-teal-400 font-bold">{tx.type.replace(/_/g, " ")}</span>
                      <span className="text-[10px] text-slate-500 uppercase">({tx.chain})</span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">
                      Hash: {tx.hash} · {tx.recipient}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-bold text-white">
                      -{tx.amount} {tx.token}
                    </p>
                    <span className="text-[10px] text-emerald-400 flex items-center justify-end gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Confirmed</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
