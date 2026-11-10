import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  Percent,
  Calendar,
  Zap,
  ArrowRight,
  ShieldCheck,
  Building2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import type { AgentPayLaterLoan, PayLaterInstallment } from "@/types/autocom";
import {
  getStoredPayLaterLoans,
  repayAgentPayLaterInstallment,
  calculatePayLaterPlan,
  requestAgentPayLaterLoan,
} from "@/services/paypalService";

export interface AgentPayLaterLoanCardProps {
  ownerAddress?: string;
  agentId?: string;
  agentName?: string;
  ownerName?: string;
  currentShortfallZAR?: number;
  onLoanCreated?: (loan: AgentPayLaterLoan) => void;
  showCreateSimulator?: boolean;
}

export function AgentPayLaterLoanCard({
  ownerAddress = "0x49B0E1F8C2224424B10a82B93E94d1F3238385a4",
  agentId = "bot_buyer_muse_za",
  agentName = "Muse-ZA (Autonomous Buyer)",
  ownerName = "Gugu",
  currentShortfallZAR,
  onLoanCreated,
  showCreateSimulator = false,
}: AgentPayLaterLoanCardProps) {
  const [loans, setLoans] = useState<AgentPayLaterLoan[]>([]);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [isRepaying, setIsRepaying] = useState<string | null>(null);
  const [repaySuccessMsg, setRepaySuccessMsg] = useState<string | null>(null);

  // Simulator / Quick Apply state
  const [simAmountZAR, setSimAmountZAR] = useState<number>(currentShortfallZAR || 450);
  const [simStore, setSimStore] = useState<string>("woolworths-food");
  const [simItem, setSimItem] = useState<string>("Artisan Sourdough & Gourmet Platter");
  const [isApplying, setIsApplying] = useState<boolean>(false);

  const calculatedPlan = calculatePayLaterPlan(simAmountZAR);

  const loadLoans = () => {
    const list = getStoredPayLaterLoans(ownerAddress);
    setLoans(list);
    if (list.length > 0 && !selectedLoanId) {
      setSelectedLoanId(list[0].id);
    }
  };

  useEffect(() => {
    loadLoans();
  }, [ownerAddress]);

  const handleApplyPayLaterCredit = async () => {
    if (simAmountZAR <= 0 || isApplying) return;
    setIsApplying(true);
    try {
      const res = await requestAgentPayLaterLoan({
        agentId,
        agentName,
        ownerAddress,
        ownerName,
        storeId: simStore,
        storeName: simStore === "woolworths-food" ? "Woolworths Food" : "Zara Fashion",
        itemTitle: simItem,
        principalZAR: simAmountZAR,
      });

      loadLoans();
      setSelectedLoanId(res.loan.id);
      if (onLoanCreated) {
        onLoanCreated(res.loan);
      }
      setRepaySuccessMsg(`🎉 Secured R${simAmountZAR.toFixed(2)} Credit via PayPal Pay Later (6-Month Plan). Merchant settled immediately.`);
      setTimeout(() => setRepaySuccessMsg(null), 5000);
    } catch (err: any) {
      console.error("[PayLater Apply]", err);
    } finally {
      setIsApplying(false);
    }
  };

  const handleRepayInstallment = async (loanId: string, installmentNumber: number) => {
    const repayKey = `${loanId}-${installmentNumber}`;
    setIsRepaying(repayKey);
    try {
      const res = await repayAgentPayLaterInstallment(loanId, installmentNumber);
      loadLoans();
      setRepaySuccessMsg(`✅ Month ${installmentNumber} of 6 installment (R${res.repaidInstallment.amountZAR.toFixed(2)}) settled via PayPal Sandbox.`);
      setTimeout(() => setRepaySuccessMsg(null), 4000);
    } catch (err: any) {
      console.error("[PayLater Repay]", err);
    } finally {
      setIsRepaying(null);
    }
  };

  const activeLoan = loans.find((l) => l.id === selectedLoanId) || loans[0];

  const totalOutstandingZAR = loans
    .filter((l) => l.status === "ACTIVE_REPAYMENT")
    .reduce((sum, l) => sum + l.remainingBalanceZAR, 0);

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl border border-sky-500/40 bg-gradient-to-br from-sky-950/40 via-blue-950/20 to-black/60 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-sky-500/20 border border-sky-400/30 text-sky-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white font-mono flex items-center gap-1.5">
                  PayPal Pay Later <span className="text-sky-400">6-Month Agent Credit</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Fixed 6-Mo Plan
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                Autonomous micro-credit facility for shopping agents with 0.5% platform protocol fee.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono font-bold text-muted-foreground">
              Agent Credit Limit:
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-black text-xs">
              R5,000.00 ZAR
            </span>
          </div>
        </div>

        {/* Global Credit Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 space-y-0.5">
            <span className="text-[10px] text-muted-foreground block">Active Loans</span>
            <span className="text-sm font-bold text-white">
              {loans.filter((l) => l.status === "ACTIVE_REPAYMENT").length} Active
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 space-y-0.5">
            <span className="text-[10px] text-muted-foreground block">Outstanding Balance</span>
            <span className="text-sm font-bold text-amber-400">
              R{totalOutstandingZAR.toFixed(2)}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 space-y-0.5">
            <span className="text-[10px] text-muted-foreground block">Platform Fee Rate</span>
            <span className="text-sm font-bold text-sky-400 flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-sky-400" /> 0.5% Flat
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 space-y-0.5">
            <span className="text-[10px] text-muted-foreground block">Maturity Tenure</span>
            <span className="text-sm font-bold text-white flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-primary" /> 6 Months
            </span>
          </div>
        </div>

        {/* Success toast / status */}
        {repaySuccessMsg && (
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{repaySuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Simulator / Fast Credit Advance Box (Shown if shortfall or requested) */}
      {(showCreateSimulator || currentShortfallZAR) && (
        <div className="p-4 rounded-2xl border border-accent/40 bg-accent/10 space-y-3 font-mono">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">⚡</span>
              <h4 className="text-xs sm:text-sm font-black text-white">
                Autonomous Shortfall Financing Simulator
              </h4>
            </div>
            <span className="text-[10px] text-accent font-bold px-2 py-0.5 rounded-full bg-accent/20 border border-accent/30">
              Underfunded Checkout Protection
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground">
            When an agent has insufficient wallet funds at checkout, this service automatically advances the required credit over 6 monthly installments.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-muted-foreground">Credit Amount (ZAR)</label>
              <input
                type="number"
                value={simAmountZAR}
                onChange={(e) => setSimAmountZAR(Math.max(10, Number(e.target.value)))}
                className="w-full bg-black/60 border border-white/20 rounded-xl p-2 text-xs text-white"
                min={10}
                step={10}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-muted-foreground">Store Outlet</label>
              <select
                value={simStore}
                onChange={(e) => setSimStore(e.target.value)}
                className="w-full bg-black/60 border border-white/20 rounded-xl p-2 text-xs text-white"
              >
                <option value="woolworths-food">Woolworths Food (Artisan Platter)</option>
                <option value="zara-fashion">Zara Fashion (Wool Hoodie)</option>
                <option value="nike-performance">Nike Performance (Air Zoom 40)</option>
                <option value="istore-apple">iStore Apple (MagSafe Wallet)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-muted-foreground">Plan Preview (6 Mos)</label>
              <div className="p-2 bg-black/60 border border-white/20 rounded-xl text-xs text-emerald-400 font-bold flex items-center justify-between">
                <span>R{calculatedPlan.monthlyInstallmentZAR.toFixed(2)}/mo</span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  +0.5% fee: R{calculatedPlan.platformFeeZAR.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="text-[11px] text-muted-foreground">
              Total to Repay: <strong className="text-white">R{calculatedPlan.totalSecuredZAR.toFixed(2)}</strong> across 6 monthly maturities.
            </div>
            <button
              onClick={handleApplyPayLaterCredit}
              disabled={isApplying}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-md"
            >
              <Zap className={`w-3.5 h-3.5 ${isApplying ? "animate-spin" : ""}`} />
              <span>{isApplying ? "Securing Credit..." : "Auto-Advance Credit"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Loans List & Repayment Schedule */}
      {loans.length === 0 ? (
        <div className="p-6 rounded-2xl border border-white/10 bg-black/30 text-center space-y-2 font-mono">
          <Clock className="w-8 h-8 mx-auto text-muted-foreground/40" />
          <h4 className="text-sm font-bold text-white">No Active Pay Later Credit Agreements</h4>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            When your agent purchases items exceeding wallet reserves, PayPal Pay Later will automatically generate a 6-month repayment schedule here.
          </p>
        </div>
      ) : (
        <div className="space-y-3 font-mono">
          {/* Loan Selector if multiple */}
          {loans.length > 1 && (
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {loans.map((loan) => (
                <button
                  key={loan.id}
                  onClick={() => setSelectedLoanId(loan.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                    activeLoan?.id === loan.id
                      ? "bg-sky-500/20 border-sky-400 text-sky-300"
                      : "bg-black/40 border-white/10 text-muted-foreground hover:text-white"
                  }`}
                >
                  {loan.itemTitle.slice(0, 22)}... (R{loan.remainingBalanceZAR.toFixed(0)} left)
                </button>
              ))}
            </div>
          )}

          {/* Active Loan Details & 6 Monthly Installments */}
          {activeLoan && (
            <div className="p-4 sm:p-5 rounded-2xl border border-white/15 bg-black/50 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{activeLoan.itemTitle}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        activeLoan.status === "SETTLED"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {activeLoan.status === "SETTLED" ? "COMPLETED / PAID OFF" : "ACTIVE 6-MO REPAYMENT"}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    Store: {activeLoan.storeName} · Loan ID: {activeLoan.id}
                  </span>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-muted-foreground block">Remaining Principal</span>
                  <span className="text-base font-black text-amber-400">
                    R{activeLoan.remainingBalanceZAR.toFixed(2)}{" "}
                    <span className="text-[10px] text-muted-foreground font-normal">
                      (${(activeLoan.remainingBalanceZAR * 0.054).toFixed(2)} USD)
                    </span>
                  </span>
                </div>
              </div>

              {/* Protocol Fee Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs p-3 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Principal Financed:</span>
                  <span className="font-bold text-white">R{activeLoan.principalZAR.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Platform Fee (0.5%):</span>
                  <span className="font-bold text-sky-400">
                    +R{activeLoan.platformFeeZAR.toFixed(2)}{" "}
                    <span className="text-[9px] text-muted-foreground font-normal">(Secured)</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Total with Fee:</span>
                  <span className="font-bold text-emerald-400">
                    R{activeLoan.totalSecuredZAR.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* The 6 Monthly Installments Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-bold uppercase tracking-wider text-[10px]">
                    6-Month Installment Repayment Schedule (Default)
                  </span>
                  <span>
                    {activeLoan.paidInstallmentsCount} of 6 Paid
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {activeLoan.installments.map((inst) => {
                    const isPaid = inst.status === "PAID";
                    const isProcessingThis = isRepaying === `${activeLoan.id}-${inst.installmentNumber}`;
                    const formattedDate = new Date(inst.dueDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });

                    return (
                      <div
                        key={inst.installmentNumber}
                        className={`p-3 rounded-xl border transition-all flex flex-col justify-between space-y-2 ${
                          isPaid
                            ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
                            : "bg-black/60 border-white/10 text-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold flex items-center gap-1.5">
                            {isPaid ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                            )}
                            Month {inst.installmentNumber} of 6
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              isPaid ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                            }`}
                          >
                            {isPaid ? "PAID" : "DUE"}
                          </span>
                        </div>

                        <div>
                          <div className="text-base font-black">
                            R{inst.amountZAR.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            ${inst.amountUSD.toFixed(2)} USD · Due: {formattedDate}
                          </div>
                        </div>

                        <div>
                          {isPaid ? (
                            <span className="text-[10px] text-emerald-400 font-bold block pt-1">
                              ✓ Captured via PayPal
                            </span>
                          ) : (
                            <button
                              onClick={() => handleRepayInstallment(activeLoan.id, inst.installmentNumber)}
                              disabled={Boolean(isRepaying)}
                              className="w-full py-1.5 px-2.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-300 font-bold text-[10px] transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1"
                            >
                              <RefreshCw className={`w-3 h-3 ${isProcessingThis ? "animate-spin" : ""}`} />
                              <span>{isProcessingThis ? "Settling..." : "Repay Installment"}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

