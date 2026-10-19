import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import {
  ColDef,
  ICellRendererParams,
  ModuleRegistry,
  ValueFormatterParams,
} from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";

import {
  TrendingUp,
  ShieldCheck,
  Zap,
  DollarSign,
  Filter,
  Download,
  Play,
  RotateCcw,
  Sparkles,
  Bot,
  Store,
  ExternalLink,
} from "lucide-react";

import type { A2ANegotiationStatus } from "../types/a2aProtocol";
import { A2A_OPENAPI_SPEC_JSON } from "../types/a2aProtocol";
import {
  createAgentTransaction,
  executeVaultedAgentPayment,
  convertZarToUsd,
} from "../services/paypalService";

// Register AG Grid Community client-side row model module once
ModuleRegistry.registerModules([ClientSideRowModelModule]);

export interface A2ALedgerRow {
  id: string;
  timestamp: string;
  outletId: string;
  outletName: string;
  category: string;
  itemName: string;
  originalPriceZAR: number;
  negotiatedPriceZAR: number;
  totalSavingsZAR: number;
  savingsPercent: number;
  status: A2ANegotiationStatus;
  paypalOrderId?: string;
  paypalTxId?: string;
  usdEquivalent: number;
}

/**
 * 8 South African Mall Retail Outlets at Bel Air Shopping Centre
 */
const SOUTH_AFRICAN_OUTLETS = [
  {
    id: "zara-fashion",
    name: "Zara Fashion",
    category: "Apparel & Trends",
    sampleItem: "Oversized Wool Hoodie",
    basePrice: 899,
  },
  {
    id: "hm-boutique",
    name: "H&M Boutique",
    category: "Sustainable Style",
    sampleItem: "Tailored Linen Blazer",
    basePrice: 650,
  },
  {
    id: "istore-apple",
    name: "iStore Apple",
    category: "Electronics & Gadgets",
    sampleItem: "MagSafe Leather Wallet",
    basePrice: 1199,
  },
  {
    id: "exclusive-books",
    name: "Exclusive Books",
    category: "Literature & Coffee",
    sampleItem: "Bestseller Hardcover Fiction",
    basePrice: 345,
  },
  {
    id: "mugg-bean",
    name: "Mugg & Bean Kiosk",
    category: "Artisan Bakery & Coffee",
    sampleItem: "Bottomless Filter & Giant Muffin",
    basePrice: 98,
  },
  {
    id: "woolworths-food",
    name: "Woolworths Food",
    category: "Gourmet Groceries",
    sampleItem: "Artisan Sourdough & Cheese Platter",
    basePrice: 220,
  },
  {
    id: "nike-performance",
    name: "Nike Performance",
    category: "Athletics & Footwear",
    sampleItem: "Air Zoom Pegasus 40",
    basePrice: 2499,
  },
  {
    id: "clicks-pharmacy",
    name: "Clicks Pharmacy",
    category: "Health & Wellness",
    sampleItem: "Bio-Oil & Vitamin C Immune Serum",
    basePrice: 189,
  },
];

/**
 * Initial reactive seed data for the 8 outlets
 */
const INITIAL_LEDGER_DATA: A2ALedgerRow[] = [
  {
    id: "a2a-tx-001",
    timestamp: "10:42:15 AM",
    outletId: "zara-fashion",
    outletName: "Zara Fashion",
    category: "Apparel & Trends",
    itemName: "Oversized Wool Hoodie",
    originalPriceZAR: 899,
    negotiatedPriceZAR: 675,
    totalSavingsZAR: 224,
    savingsPercent: 24.9,
    status: "SETTLED_VIA_PAYPAL",
    paypalOrderId: "ORD-SANDBOX-ZARA-7A9B1",
    paypalTxId: "TX-PAYPAL-M2M-9021841",
    usdEquivalent: 36.45,
  },
  {
    id: "a2a-tx-002",
    timestamp: "10:43:02 AM",
    outletId: "nike-performance",
    outletName: "Nike Performance",
    category: "Athletics & Footwear",
    itemName: "Air Zoom Pegasus 40",
    originalPriceZAR: 2499,
    negotiatedPriceZAR: 1870,
    totalSavingsZAR: 629,
    savingsPercent: 25.2,
    status: "SETTLED_VIA_PAYPAL",
    paypalOrderId: "ORD-SANDBOX-NIKE-4F8C2",
    paypalTxId: "TX-PAYPAL-M2M-8491032",
    usdEquivalent: 100.98,
  },
  {
    id: "a2a-tx-003",
    timestamp: "10:44:19 AM",
    outletId: "woolworths-food",
    outletName: "Woolworths Food",
    category: "Gourmet Groceries",
    itemName: "Artisan Sourdough & Cheese Platter",
    originalPriceZAR: 220,
    negotiatedPriceZAR: 175,
    totalSavingsZAR: 45,
    savingsPercent: 20.5,
    status: "OFFER_ACCEPTED",
    paypalOrderId: "ORD-SANDBOX-WOOL-3E1D9",
    usdEquivalent: 9.45,
  },
  {
    id: "a2a-tx-004",
    timestamp: "10:45:00 AM",
    outletId: "istore-apple",
    outletName: "iStore Apple",
    category: "Electronics & Gadgets",
    itemName: "MagSafe Leather Wallet",
    originalPriceZAR: 1199,
    negotiatedPriceZAR: 999,
    totalSavingsZAR: 200,
    savingsPercent: 16.7,
    status: "PAYMENT_PENDING",
    paypalOrderId: "ORD-SANDBOX-ISTO-9B2F4",
    usdEquivalent: 53.95,
  },
  {
    id: "a2a-tx-005",
    timestamp: "10:45:34 AM",
    outletId: "mugg-bean",
    outletName: "Mugg & Bean Kiosk",
    category: "Artisan Bakery & Coffee",
    itemName: "Bottomless Filter & Giant Muffin",
    originalPriceZAR: 98,
    negotiatedPriceZAR: 75,
    totalSavingsZAR: 23,
    savingsPercent: 23.5,
    status: "BARGAINING",
    usdEquivalent: 4.05,
  },
  {
    id: "a2a-tx-006",
    timestamp: "10:46:11 AM",
    outletId: "clicks-pharmacy",
    outletName: "Clicks Pharmacy",
    category: "Health & Wellness",
    itemName: "Bio-Oil & Vitamin C Immune Serum",
    originalPriceZAR: 189,
    negotiatedPriceZAR: 145,
    totalSavingsZAR: 44,
    savingsPercent: 23.3,
    status: "SETTLED_VIA_PAYPAL",
    paypalOrderId: "ORD-SANDBOX-CLIC-8A1B6",
    paypalTxId: "TX-PAYPAL-M2M-7719230",
    usdEquivalent: 7.83,
  },
  {
    id: "a2a-tx-007",
    timestamp: "10:46:58 AM",
    outletId: "exclusive-books",
    outletName: "Exclusive Books",
    category: "Literature & Coffee",
    itemName: "Bestseller Hardcover Fiction",
    originalPriceZAR: 345,
    negotiatedPriceZAR: 280,
    totalSavingsZAR: 65,
    savingsPercent: 18.8,
    status: "OFFER_ACCEPTED",
    paypalOrderId: "ORD-SANDBOX-EXCL-5D3E2",
    usdEquivalent: 15.12,
  },
  {
    id: "a2a-tx-008",
    timestamp: "10:47:20 AM",
    outletId: "hm-boutique",
    outletName: "H&M Boutique",
    category: "Sustainable Style",
    itemName: "Tailored Linen Blazer",
    originalPriceZAR: 650,
    negotiatedPriceZAR: 510,
    totalSavingsZAR: 140,
    savingsPercent: 21.5,
    status: "BARGAINING",
    usdEquivalent: 27.54,
  },
];

/**
 * Status Badge Cell Renderer for AG Grid
 */
const StatusCellRenderer: React.FC<ICellRendererParams<A2ALedgerRow, A2ANegotiationStatus>> = (
  params,
) => {
  const status = params.value;
  if (!status) return null;

  switch (status) {
    case "SETTLED_VIA_PAYPAL":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          SETTLED VIA PAYPAL
        </span>
      );
    case "OFFER_ACCEPTED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
          <Sparkles className="w-3 h-3 text-teal-300" />
          OFFER ACCEPTED
        </span>
      );
    case "PAYMENT_PENDING":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          <DollarSign className="w-3 h-3 text-amber-300 animate-pulse" />
          PAYMENT PENDING
        </span>
      );
    case "BARGAINING":
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
          <Bot className="w-3 h-3 text-purple-300" />
          BARGAINING
        </span>
      );
  }
};

/**
 * PayPal Reference Cell Renderer with clickable link indicator
 */
const PayPalRefCellRenderer: React.FC<ICellRendererParams<A2ALedgerRow, string>> = (params) => {
  const row = params.data;
  if (!row) return null;

  if (row.paypalTxId) {
    return (
      <div className="flex items-center gap-1 font-mono text-[11px] text-emerald-300">
        <span className="truncate max-w-[120px]">{row.paypalTxId}</span>
        <span className="text-[9px] text-muted-foreground px-1 bg-white/5 rounded border border-white/10">
          ${row.usdEquivalent.toFixed(2)}
        </span>
      </div>
    );
  }

  if (row.paypalOrderId) {
    return (
      <span className="font-mono text-[11px] text-amber-300/90 truncate max-w-[120px]">
        {row.paypalOrderId}
      </span>
    );
  }

  return <span className="font-mono text-[11px] text-muted-foreground italic">Awaiting terms</span>;
};

export function A2ATransactionAuditLedger() {
  const [rowData, setRowData] = useState<A2ALedgerRow[]>(INITIAL_LEDGER_DATA);
  const [quickFilterText, setQuickFilterText] = useState<string>("");
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"grid" | "apimatic">("grid");

  // Listen for real-time PayPal events dispatched by paypalService
  useEffect(() => {
    const handleOrderCreated = (event: Event) => {
      const customEvent = event as CustomEvent<{
        orderId: string;
        storeId: string;
        priceZAR: number;
        amountUSD: number;
      }>;
      const detail = customEvent.detail;
      setRowData((prev) =>
        prev.map((item) =>
          item.outletId === detail.storeId
            ? {
                ...item,
                paypalOrderId: detail.orderId,
                status: "PAYMENT_PENDING" as A2ANegotiationStatus,
                usdEquivalent: detail.amountUSD,
              }
            : item,
        ),
      );
    };

    const handlePaymentSettled = (event: Event) => {
      const customEvent = event as CustomEvent<{
        orderId: string;
        transactionId: string;
        storeId: string;
        settledUSD: number;
        settledZAR: number;
      }>;
      const detail = customEvent.detail;
      setRowData((prev) =>
        prev.map((item) =>
          item.paypalOrderId === detail.orderId || item.outletId === detail.storeId
            ? {
                ...item,
                paypalTxId: detail.transactionId,
                status: "SETTLED_VIA_PAYPAL" as A2ANegotiationStatus,
                negotiatedPriceZAR: detail.settledZAR,
                totalSavingsZAR: Math.max(0, item.originalPriceZAR - detail.settledZAR),
                usdEquivalent: detail.settledUSD,
              }
            : item,
        ),
      );
    };

    window.addEventListener("autocom:paypal-order-created", handleOrderCreated);
    window.addEventListener("autocom:paypal-payment-settled", handlePaymentSettled);

    // Sync backend orders if available
    fetch("/api/paypal/audit-ledger")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.orders) && data.orders.length > 0) {
          setRowData((prev) => {
            const next = [...prev];
            data.orders.forEach(
              (backendOrder: {
                storeId: string;
                orderId: string;
                transactionId?: string;
                status: string;
              }) => {
                const idx = next.findIndex(
                  (r) =>
                    r.outletId === backendOrder.storeId || r.paypalOrderId === backendOrder.orderId,
                );
                if (idx >= 0) {
                  next[idx] = {
                    ...next[idx],
                    paypalOrderId: backendOrder.orderId,
                    paypalTxId: backendOrder.transactionId || next[idx].paypalTxId,
                    status: (backendOrder.status === "SETTLED"
                      ? "SETTLED_VIA_PAYPAL"
                      : next[idx].status) as A2ANegotiationStatus,
                  };
                }
              },
            );
            return next;
          });
        }
      })
      .catch(() => {});

    return () => {
      window.removeEventListener("autocom:paypal-order-created", handleOrderCreated);
      window.removeEventListener("autocom:paypal-payment-settled", handlePaymentSettled);
    };
  }, []);

  // Calculate Cumulative Summary Metrics
  const summaryMetrics = useMemo(() => {
    const totalSavings = rowData.reduce((acc, row) => acc + row.totalSavingsZAR, 0);
    const totalSettledCount = rowData.filter((r) => r.status === "SETTLED_VIA_PAYPAL").length;
    const totalBargainingCount = rowData.filter((r) => r.status === "BARGAINING").length;
    const avgDiscount =
      rowData.reduce((acc, row) => acc + row.savingsPercent, 0) / (rowData.length || 1);

    return {
      totalSavings,
      totalSettledCount,
      totalBargainingCount,
      avgDiscount: Math.round(avgDiscount * 10) / 10,
    };
  }, [rowData]);

  // AG Grid Column Definitions
  const columnDefs = useMemo<ColDef<A2ALedgerRow>[]>(
    () => [
      {
        field: "timestamp",
        headerName: "Time",
        width: 105,
        sortable: true,
        filter: true,
        cellClass: "font-mono text-xs text-muted-foreground",
      },
      {
        field: "outletName",
        headerName: "Outlet Name",
        width: 155,
        sortable: true,
        filter: true,
        cellRenderer: (params: ICellRendererParams<A2ALedgerRow>) => (
          <div className="flex items-center gap-1.5 font-bold text-white text-xs">
            <Store className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">{params.value}</span>
          </div>
        ),
      },
      {
        field: "category",
        headerName: "Category",
        width: 150,
        sortable: true,
        filter: true,
        cellClass: "text-xs text-slate-300 truncate",
      },
      {
        field: "originalPriceZAR",
        headerName: "Sticker (ZAR)",
        width: 120,
        sortable: true,
        valueFormatter: (params: ValueFormatterParams) => `R${params.value?.toLocaleString()}`,
        cellClass: "font-mono text-xs text-muted-foreground line-through",
      },
      {
        field: "negotiatedPriceZAR",
        headerName: "Negotiated (ZAR)",
        width: 135,
        sortable: true,
        valueFormatter: (params: ValueFormatterParams) => `R${params.value?.toLocaleString()}`,
        cellClass: "font-mono text-xs font-bold text-teal-400",
      },
      {
        field: "totalSavingsZAR",
        headerName: "Savings (ZAR)",
        width: 130,
        sortable: true,
        cellRenderer: (params: ICellRendererParams<A2ALedgerRow>) => (
          <div className="font-mono text-xs font-black text-emerald-400 flex items-center gap-1">
            <span>+R{params.value}</span>
            <span className="text-[10px] text-emerald-500 font-semibold">
              ({params.data?.savingsPercent}%)
            </span>
          </div>
        ),
      },
      {
        field: "status",
        headerName: "Negotiation Status",
        width: 195,
        sortable: true,
        filter: true,
        cellRenderer: StatusCellRenderer,
      },
      {
        field: "paypalTxId",
        headerName: "PayPal Sandbox Ref",
        width: 195,
        sortable: true,
        filter: true,
        cellRenderer: PayPalRefCellRenderer,
      },
    ],
    [],
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      resizable: true,
      suppressMovable: false,
    }),
    [],
  );

  // Trigger high-speed autonomous simulation loop
  const triggerAutonomousStep = useCallback(async () => {
    setIsSimulating(true);
    const randomOutlet =
      SOUTH_AFRICAN_OUTLETS[Math.floor(Math.random() * SOUTH_AFRICAN_OUTLETS.length)];
    const discountRate = 0.15 + Math.random() * 0.18; // 15% to 33% discount
    const negotiatedZAR = Math.round(randomOutlet.basePrice * (1 - discountRate));
    const savingsZAR = randomOutlet.basePrice - negotiatedZAR;
    const savingsPercent = Math.round((savingsZAR / randomOutlet.basePrice) * 100 * 10) / 10;
    const timeNow = new Date().toLocaleTimeString();

    const newId = `a2a-tx-${Date.now().toString().slice(-4)}`;

    // Phase 1: Post initial bargaining row
    const provisionalRow: A2ALedgerRow = {
      id: newId,
      timestamp: timeNow,
      outletId: randomOutlet.id,
      outletName: randomOutlet.name,
      category: randomOutlet.category,
      itemName: randomOutlet.sampleItem,
      originalPriceZAR: randomOutlet.basePrice,
      negotiatedPriceZAR: negotiatedZAR,
      totalSavingsZAR: savingsZAR,
      savingsPercent,
      status: "BARGAINING",
      usdEquivalent: convertZarToUsd(negotiatedZAR),
    };

    setRowData((prev) => [provisionalRow, ...prev]);

    // Phase 2: Bot accepts offer after bilateral convergence
    await new Promise((r) => setTimeout(r, 650));
    setRowData((prev) =>
      prev.map((r) => (r.id === newId ? { ...r, status: "OFFER_ACCEPTED" } : r)),
    );

    // Phase 3: Automated PayPal order creation
    await new Promise((r) => setTimeout(r, 700));
    const order = await createAgentTransaction(randomOutlet.id, negotiatedZAR);
    setRowData((prev) =>
      prev.map((r) =>
        r.id === newId
          ? {
              ...r,
              paypalOrderId: order.orderId,
              status: "PAYMENT_PENDING",
              usdEquivalent: order.amountUSD,
            }
          : r,
      ),
    );

    // Phase 4: Vaulted M2M payment capture
    await new Promise((r) => setTimeout(r, 800));
    const payment = await executeVaultedAgentPayment(order.orderId);
    setRowData((prev) =>
      prev.map((r) =>
        r.id === newId
          ? {
              ...r,
              paypalTxId: payment.transactionId,
              status: "SETTLED_VIA_PAYPAL",
            }
          : r,
      ),
    );

    setIsSimulating(false);
  }, []);

  const downloadOpenApiSpec = useCallback(() => {
    const blob = new Blob([A2A_OPENAPI_SPEC_JSON], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "autocom-a2a-openapi-3.0.json";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="w-full space-y-4">
      {/* Top Banner & KPI Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Cumulative Savings across all Agents */}
        <div className="glass p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Cumulative Agent Savings
            </span>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 font-black border border-emerald-500/30">
              LIVE
            </span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-white font-mono flex items-baseline gap-1.5">
            <span>R{summaryMetrics.totalSavings.toLocaleString()}</span>
            <span className="text-xs text-emerald-400 font-sans font-bold">ZAR Total</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-300">
            Across 8 Bel Air Shopping Centre merchant bots
          </p>
        </div>

        {/* PayPal Settlements */}
        <div className="glass p-4 rounded-2xl border border-primary/30 bg-primary/10 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-primary font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              PayPal Sandbox Settled
            </span>
            <span className="text-xs font-mono font-bold text-white">M2M Loop</span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {summaryMetrics.totalSettledCount}
            <span className="text-xs text-muted-foreground ml-2 font-normal">Vaulted captures</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-300">Zero-click autonomous checkout</p>
        </div>

        {/* Average Discount Margin */}
        <div className="glass p-4 rounded-2xl border border-teal-500/30 bg-teal-950/20 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-teal-300 font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-teal-400" />
              Average A2A Discount
            </span>
            <span className="text-xs font-mono font-bold text-teal-400">
              {summaryMetrics.avgDiscount}%
            </span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {summaryMetrics.avgDiscount}%
            <span className="text-xs text-muted-foreground ml-2 font-normal">Discount yield</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-300">Real-time bilateral auction efficiency</p>
        </div>

        {/* Active Negotiations */}
        <div className="glass p-4 rounded-2xl border border-purple-500/30 bg-purple-950/20 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-purple-300 font-bold flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              Active A2A Sessions
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-500/20 text-purple-300 font-bold">
              8 Outlets
            </span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {summaryMetrics.totalBargainingCount}
            <span className="text-xs text-muted-foreground ml-2 font-normal">in flight</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-300">Synchronized via Channel3 pipelines</p>
        </div>
      </div>

      {/* Grid Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl glass border border-white/10 bg-[#0c101d]">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter outlets, statuses, items..."
              value={quickFilterText}
              onChange={(e) => setQuickFilterText(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-muted-foreground focus:outline-none focus:border-primary/60 font-mono"
            />
          </div>

          <div className="flex rounded-xl bg-black/40 p-1 border border-white/10">
            <button
              onClick={() => setActiveTab("grid")}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === "grid"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              AG Grid Ledger
            </button>
            <button
              onClick={() => setActiveTab("apimatic")}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === "apimatic"
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              APIMatic Spec
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={triggerAutonomousStep}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-extrabold shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Simulate an incoming autonomous agent negotiation and vaulted PayPal capture"
          >
            <Play className={`w-3.5 h-3.5 ${isSimulating ? "animate-spin" : ""}`} />
            {isSimulating ? "Settling…" : "Simulate A2A + PayPal"}
          </button>

          <button
            onClick={() => setRowData(INITIAL_LEDGER_DATA)}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-muted-foreground hover:text-white transition-colors cursor-pointer"
            title="Reset Ledger Data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={downloadOpenApiSpec}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-mono text-xs transition-colors cursor-pointer"
            title="Download OpenAPI 3.0 JSON for APIMatic SDK generation"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">APIMatic Export</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === "grid" ? (
        <div className="rounded-2xl overflow-hidden border border-white/15 shadow-2xl glass bg-[#080d19]/90">
          <div className="px-4 py-2.5 border-b border-white/10 flex items-center justify-between text-xs font-mono text-muted-foreground bg-black/40">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-white">
                AG Grid Enterprise-Grade Real-Time Transaction Engine
              </span>
              <span>·</span>
              <span>8 South African Mall Outlets</span>
            </div>
            <span className="text-[10px] text-teal-400 font-semibold">
              Client-Side Row Model · High-Frequency Filter Safe
            </span>
          </div>

          <div
            className="ag-theme-quartz-dark w-full"
            style={{
              height: "420px",
              fontFamily:
                'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
            }}
          >
            <AgGridReact<A2ALedgerRow>
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              quickFilterText={quickFilterText}
              animateRows={true}
              rowSelection="single"
              headerHeight={38}
              rowHeight={44}
            />
          </div>
        </div>
      ) : (
        /* APIMatic Spec Viewer Tab */
        <div className="rounded-2xl border border-white/15 glass bg-[#080d19]/95 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-white font-mono flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-accent" />
                APIMatic OpenAPI 3.0.3 Contract Generator
              </h3>
              <p className="text-xs text-muted-foreground">
                Validated schema ready for 1-click SDK compilation (TypeScript, Python, C#, PHP,
                Java, Go).
              </p>
            </div>
            <button
              onClick={downloadOpenApiSpec}
              className="px-3.5 py-1.5 rounded-xl bg-accent text-accent-foreground font-mono text-xs font-bold shadow-md hover:bg-accent/90 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download JSON Spec
            </button>
          </div>

          <pre className="max-h-96 overflow-auto p-4 rounded-xl bg-black/80 border border-white/10 font-mono text-[11px] text-teal-300 leading-relaxed">
            {A2A_OPENAPI_SPEC_JSON}
          </pre>
        </div>
      )}
    </div>
  );
}
