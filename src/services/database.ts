/**
 * AutoCom Sovereign Database & Ledger Engine
 * In-memory & Persistent SQLite-compatible Store for Inventory, Multi-Currency Ledger, Geo-Sales, and Handoff Tokens.
 */

export interface GeoSaleRecord {
  id: string;
  itemId: string;
  currencyCode: string;
  amountFiat: number;
  timestamp: number;
}

export interface StoredTransaction {
  id: string;
  paymentHash: string;
  itemId: string;
  amountSats: number;
  amountFiat?: number;
  currencyCode?: string;
  rail: "BITCOIN_LIGHTNING" | "STABLECOIN_L2" | "FIAT_CARD" | "CARD";
  status: "CONFIRMED" | "CLAIMED" | "PENDING" | "FAILED";
  timestamp: number;
  buyerPubkey?: string;
}

export interface InventoryItem {
  id: string;
  title: string;
  category: string;
  baseUsdValue: number;
  stockCount: number;
  targetCurrencyCode: string;
}

const STORAGE_KEY_GEO_SALES = "autocom_geo_sales_history_v1";
const STORAGE_KEY_TRANSACTIONS = "autocom_transactions_ledger_v1";
const STORAGE_KEY_INVENTORY = "autocom_inventory_items_v1";

const DEFAULT_INVENTORY: InventoryItem[] = [
  {
    id: "zara-leather-jacket-09",
    title: "Zara Biker Leather Jacket",
    category: "Apparel",
    baseUsdValue: 65.0,
    stockCount: 14,
    targetCurrencyCode: "ZAR",
  },
  {
    id: "istore-airpods-pro2",
    title: "AirPods Pro (2nd Gen) USB-C",
    category: "Electronics",
    baseUsdValue: 199.0,
    stockCount: 8,
    targetCurrencyCode: "ZAR",
  },
  {
    id: "silk-scarf-exclusive",
    title: "Artisan Silk Runway Scarf",
    category: "Accessories",
    baseUsdValue: 28.0,
    stockCount: 22,
    targetCurrencyCode: "ZAR",
  },
  {
    id: "nike-airmax-pulse",
    title: "Nike Air Max Pulse Runner",
    category: "Sportswear",
    baseUsdValue: 135.0,
    stockCount: 12,
    targetCurrencyCode: "ZAR",
  },
];

class AutoComDatabase {
  private geoSales: GeoSaleRecord[] = [];
  private transactions: StoredTransaction[] = [];
  private inventory: Map<string, InventoryItem> = new Map();

  constructor() {
    this.init();
  }

  private init() {
    // Seed default inventory
    DEFAULT_INVENTORY.forEach((item) => this.inventory.set(item.id, { ...item }));

    if (typeof window !== "undefined") {
      try {
        const storedSales = localStorage.getItem(STORAGE_KEY_GEO_SALES);
        if (storedSales) this.geoSales = JSON.parse(storedSales);

        const storedTx = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
        if (storedTx) this.transactions = JSON.parse(storedTx);

        const storedInv = localStorage.getItem(STORAGE_KEY_INVENTORY);
        if (storedInv) {
          const parsed = JSON.parse(storedInv) as InventoryItem[];
          parsed.forEach((it) => this.inventory.set(it.id, it));
        }
      } catch (e) {
        console.warn("Storage sync warning:", e);
      }
    }

    // Seed some initial geo-sales for realistic regional demand metrics if empty
    if (this.geoSales.length === 0) {
      this.geoSales = [
        {
          id: "g1",
          itemId: "zara-leather-jacket-09",
          currencyCode: "ZAR",
          amountFiat: 1199.0,
          timestamp: Date.now() - 3600000,
        },
        {
          id: "g2",
          itemId: "istore-airpods-pro2",
          currencyCode: "ZAR",
          amountFiat: 3999.0,
          timestamp: Date.now() - 7200000,
        },
        {
          id: "g3",
          itemId: "zara-leather-jacket-09",
          currencyCode: "EUR",
          amountFiat: 65.0,
          timestamp: Date.now() - 10800000,
        },
        {
          id: "g4",
          itemId: "nike-airmax-pulse",
          currencyCode: "USD",
          amountFiat: 135.0,
          timestamp: Date.now() - 14400000,
        },
        {
          id: "g5",
          itemId: "silk-scarf-exclusive",
          currencyCode: "GBP",
          amountFiat: 22.0,
          timestamp: Date.now() - 18000000,
        },
        {
          id: "g6",
          itemId: "zara-leather-jacket-09",
          currencyCode: "NGN",
          amountFiat: 95000.0,
          timestamp: Date.now() - 21600000,
        },
      ];
      this.persistGeoSales();
    }
  }

  private persistGeoSales() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY_GEO_SALES, JSON.stringify(this.geoSales));
      } catch (_e) {
        // Storage unavailable in test/SSR
      }
    }
  }

  private persistTransactions() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(this.transactions));
      } catch (_e) {
        // Storage unavailable in test/SSR
      }
    }
  }

  private persistInventory() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          STORAGE_KEY_INVENTORY,
          JSON.stringify(Array.from(this.inventory.values())),
        );
      } catch (_e) {
        // Storage unavailable in test/SSR
      }
    }
  }

  public getInventoryItem(itemId: string): InventoryItem | undefined {
    return this.inventory.get(itemId);
  }

  public getAllInventory(): InventoryItem[] {
    return Array.from(this.inventory.values());
  }

  public decrementStock(itemId: string): number {
    const item = this.inventory.get(itemId);
    if (item && item.stockCount > 0) {
      item.stockCount -= 1;
      this.persistInventory();
      return item.stockCount;
    }
    return item ? item.stockCount : 0;
  }

  public logGeoSale(itemId: string, currencyCode: string, amount: number): GeoSaleRecord {
    const record: GeoSaleRecord = {
      id: `geo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      itemId,
      currencyCode: currencyCode.toUpperCase(),
      amountFiat: amount,
      timestamp: Math.floor(Date.now() / 1000),
    };
    this.geoSales.unshift(record);
    this.persistGeoSales();
    return record;
  }

  public getRegionalDemandMetrics(): Array<{
    currencyCode: string;
    volume: number;
    totalRevenue: number;
  }> {
    const map = new Map<string, { volume: number; totalRevenue: number }>();

    for (const record of this.geoSales) {
      const code = record.currencyCode;
      const current = map.get(code) || { volume: 0, totalRevenue: 0 };
      current.volume += 1;
      current.totalRevenue += record.amountFiat;
      map.set(code, current);
    }

    return Array.from(map.entries())
      .map(([currencyCode, data]) => ({
        currencyCode,
        volume: data.volume,
        totalRevenue: Math.round(data.totalRevenue * 100) / 100,
      }))
      .sort((a, b) => b.volume - a.volume);
  }

  public logTransaction(
    paymentHash: string,
    itemId: string,
    amountSats: number,
    rail: StoredTransaction["rail"],
    status: StoredTransaction["status"] = "CONFIRMED",
    buyerPubkey?: string,
    amountFiat?: number,
    currencyCode = "ZAR",
  ): StoredTransaction {
    const tx: StoredTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      paymentHash,
      itemId,
      amountSats,
      amountFiat,
      currencyCode,
      rail,
      status,
      timestamp: Date.now(),
      buyerPubkey,
    };
    this.transactions.unshift(tx);
    this.persistTransactions();
    return tx;
  }

  public getTransactionByProof(
    paymentProofHash: string,
    itemId?: string,
  ): StoredTransaction | undefined {
    return this.transactions.find(
      (t) => t.paymentHash === paymentProofHash && (!itemId || t.itemId === itemId),
    );
  }

  public claimTransaction(paymentProofHash: string): boolean {
    const tx = this.transactions.find((t) => t.paymentHash === paymentProofHash);
    if (!tx) return false;
    if (tx.status === "CLAIMED") return false; // Double spend prevented!
    tx.status = "CLAIMED";
    this.persistTransactions();
    return true;
  }

  public getAllTransactions(): StoredTransaction[] {
    return [...this.transactions];
  }
}

export const DB = new AutoComDatabase();
export const GeoDB = {
  logGeoSale: (itemId: string, currencyCode: string, amount: number) =>
    DB.logGeoSale(itemId, currencyCode, amount),
  getRegionalDemandMetrics: () => DB.getRegionalDemandMetrics(),
  decrementStock: (itemId: string) => DB.decrementStock(itemId),
  logTransaction: (
    txRef: string,
    itemId: string,
    amountSats: number,
    rail: StoredTransaction["rail"],
    status?: StoredTransaction["status"],
    buyerPubkey?: string,
  ) => DB.logTransaction(txRef, itemId, amountSats, rail, status, buyerPubkey),
  getTransactionByProof: (proof: string, itemId?: string) =>
    DB.getTransactionByProof(proof, itemId),
  claimTransaction: (proof: string) => DB.claimTransaction(proof),
};
