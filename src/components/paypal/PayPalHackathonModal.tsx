import React, { useState } from "react";
import { X, ShieldCheck, Zap, CreditCard, DollarSign } from "lucide-react";

interface PayPalHackathonModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
}

export const PayPalHackathonModal: React.FC<PayPalHackathonModalProps> = ({
  isOpen,
  onClose,
  initialTab = "overview",
}) => {
  const [tab, setTab] = useState(initialTab);
  const [status, setStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🅿️💳</span>
            <div>
              <h3 className="font-bold text-base">PayPal & ZAR Fiat Gateway</h3>
              <p className="text-xs text-slate-400 font-mono">
                Instant Settlement & Agent Escrow for South African Malls
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 px-6 gap-2">
          {["overview", "checkout", "settlement"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-xs font-mono font-semibold capitalize border-b-2 transition-all ${
                tab === t
                  ? "border-primary text-primary bg-primary/10"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
          {tab === "overview" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-primary">Autonomous PayPal Escrow</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Seamless integration bridging AI Agent micropayments (USDC/Stablecoins) with
                    global PayPal merchant accounts and local South African ZAR payouts via Instant
                    EFT.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                    <Zap className="w-4 h-4" /> Instant ZAR Conversion
                  </div>
                  <p className="text-xs text-slate-400">
                    Real-time exchange rates from ZAR to USDC/USD with zero slippage through
                    liquidity bridge partners.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <CreditCard className="w-4 h-4" /> Merchant Payouts
                  </div>
                  <p className="text-xs text-slate-400">
                    Merchants at Bel Air, Fourways, Northgate, Blueberry, and Jackal Creek receive
                    instant settlements.
                  </p>
                </div>
              </div>
            </div>
          )}

          {tab === "checkout" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
                <h4 className="font-bold text-sm text-white">Simulate PayPal Express Checkout</h4>
                <p className="text-xs text-slate-400">
                  Test autonomous cart checkout for mall items with PayPal sandbox tokens.
                </p>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-xs text-slate-300">Test Cart Total:</span>
                  <span className="font-mono font-bold text-primary">R 450.00 (~$25.00 USD)</span>
                </div>
                <button
                  onClick={() => {
                    setStatus("Processing PayPal secure payment...");
                    setTimeout(
                      () => setStatus("Payment successful! ZAR settled to merchant."),
                      1500,
                    );
                  }}
                  className="w-full py-3 rounded-xl bg-primary text-black font-bold text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-lg"
                >
                  Pay with PayPal / Instant EFT 🚀
                </button>
                {status && (
                  <p className="text-xs text-center font-mono text-emerald-400 animate-pulse">
                    {status}
                  </p>
                )}
              </div>
            </div>
          )}

          {tab === "settlement" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                <h4 className="font-bold text-sm text-white">Multi-Mall Settlement Ledger</h4>
                <p className="text-xs text-slate-400">
                  Recent autonomous agent transactions settled via PayPal gateway:
                </p>
                <div className="space-y-2 mt-3">
                  {[
                    {
                      id: "TX-901",
                      mall: "Fourways Mall",
                      store: "Checkers Hyper",
                      amount: "R 899.00",
                      status: "Settled",
                    },
                    {
                      id: "TX-902",
                      mall: "Bel Air",
                      store: "Woolworths Food",
                      amount: "R 345.50",
                      status: "Settled",
                    },
                    {
                      id: "TX-903",
                      mall: "Northgate",
                      store: "Dis-Chem",
                      amount: "R 180.00",
                      status: "Settled",
                    },
                  ].map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                    >
                      <div>
                        <span className="font-mono text-primary font-bold">{tx.id}</span>
                        <span className="text-slate-400 ml-2">
                          ({tx.mall} - {tx.store})
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold">{tx.amount}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))}
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
