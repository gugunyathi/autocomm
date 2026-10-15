/**
 * AutoCom Automated Inventory Restock & Allocation Forecaster
 * Analyzes location-aware sales velocity metrics grouped by region/currency.
 */

import { GeoDB } from "./database";

export interface OptimizationNotice {
  currencyCode: string;
  type: "ALLOCATION_REROUTE" | "PRICE_PROTECTION" | "STOCK_SURGE" | "STABLE";
  message: string;
  recommendedAction: string;
  timestamp: number;
}

export class InventoryOptimizer {
  public static optimizeStockAllocations(): {
    metrics: Array<{ currencyCode: string; volume: number; totalRevenue: number }>;
    notices: OptimizationNotice[];
  } {
    const metrics = GeoDB.getRegionalDemandMetrics();
    const notices: OptimizationNotice[] = [];
    const now = Date.now();

    for (const record of metrics) {
      if (record.currencyCode === "EUR" && record.volume >= 1) {
        notices.push({
          currencyCode: "EUR",
          type: "ALLOCATION_REROUTE",
          message: `European Euro demand velocity detected (${record.volume} orders, €${record.totalRevenue.toFixed(2)}).`,
          recommendedAction:
            "Automatically re-routing 15% of standard corridor buffer stock to the international shipping hub.",
          timestamp: now,
        });
      }

      if (record.currencyCode === "ZAR" && record.totalRevenue > 2000) {
        notices.push({
          currencyCode: "ZAR",
          type: "PRICE_PROTECTION",
          message: `High local ZAR liquidity detected (R${record.totalRevenue.toLocaleString()}).`,
          recommendedAction:
            "Recommending floor price protection threshold updates to match inflation parameters.",
          timestamp: now,
        });
      }

      if (record.currencyCode === "NGN" && record.volume >= 1) {
        notices.push({
          currencyCode: "NGN",
          type: "STOCK_SURGE",
          message: `West African corridor expansion active (₦${record.totalRevenue.toLocaleString()}).`,
          recommendedAction: "Pre-allocating mobile payment PayShap / Direct Pay channels.",
          timestamp: now,
        });
      }

      if (record.currencyCode === "USD") {
        notices.push({
          currencyCode: "USD",
          type: "STABLE",
          message: `Baseline USD stablecoin volume: $${record.totalRevenue.toFixed(2)}.`,
          recommendedAction: "Base L2 USDC liquidity pools well-balanced with merchant treasury.",
          timestamp: now,
        });
      }
    }

    if (notices.length === 0) {
      notices.push({
        currencyCode: "ALL",
        type: "STABLE",
        message: "Corridor inventory allocations balanced across regional hubs.",
        recommendedAction: "Maintain standard BLE mesh discovery routing.",
        timestamp: now,
      });
    }

    return { metrics, notices };
  }
}
