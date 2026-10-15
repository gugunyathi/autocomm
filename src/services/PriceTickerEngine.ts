/**
 * AutoCom Live Multi-Currency Conversion Engine
 * Resolves exact pricing parameters across all three rails instantly (Bitcoin Lightning, USDC L2, Local Fiat).
 */

export interface MultiRailPriceMatrix {
  currencyCode: string;
  localFiatAmount: number; // e.g. 450.00 ZAR or 22.50 EUR
  currencySymbol: string;
  satsAmount: number; // Dynamic Satoshi price
  usdcAmount: string; // Baseline USD token valuation formatted e.g. "25.00"
  btcPriceUSD: number;
  exchangeRateToUSD: number;
  timestamp: number;
}

const STATIC_FALLBACK_RATES: Record<string, { rateToUSD: number; symbol: string }> = {
  ZAR: { rateToUSD: 18.4, symbol: "R" },
  USD: { rateToUSD: 1.0, symbol: "$" },
  EUR: { rateToUSD: 0.92, symbol: "€" },
  GBP: { rateToUSD: 0.79, symbol: "£" },
  NGN: { rateToUSD: 1480.0, symbol: "₦" },
  KES: { rateToUSD: 129.5, symbol: "KSh" },
};

const DEFAULT_BTC_USD = 68000;

export class PriceTickerEngine {
  private static COINGECKO_API = "https://api.coingecko.com/api/v3/simple/price";
  private static cachedMatrix: Map<string, { data: MultiRailPriceMatrix; expiresAt: number }> =
    new Map();

  /**
   * Resolves exact pricing parameters across all three rails instantly
   * @param targetCurrency Target currency code detected from user location (e.g. "ZAR", "EUR", "USD")
   * @param baseFiatPriceInUSD The baseline merchant valuation fixed in standard USD credits
   */
  public static async calculateMultiRailPricing(
    targetCurrency = "ZAR",
    baseFiatPriceInUSD = 25.0,
  ): Promise<MultiRailPriceMatrix> {
    const currencyUpper = (targetCurrency || "ZAR").toUpperCase();
    const cacheKey = `${currencyUpper}_${baseFiatPriceInUSD}`;
    const now = Date.now();

    const cached = this.cachedMatrix.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return cached.data;
    }

    const currencyLower = currencyUpper.toLowerCase();
    const fallbackInfo = STATIC_FALLBACK_RATES[currencyUpper] || { rateToUSD: 1.0, symbol: "$" };

    try {
      // Fetch live price ratios for Bitcoin (BTC) and local fiat relative to standard USD channels
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const response = await fetch(
        `${this.COINGECKO_API}?ids=bitcoin&vs_currencies=usd,${currencyLower}`,
        { signal: controller.signal },
      );
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`CoinGecko HTTP ${response.status}`);
      }

      const priceData = await response.json();
      const btcInUSD = Number(priceData?.bitcoin?.usd) || DEFAULT_BTC_USD;
      const btcInLocalFiat =
        Number(priceData?.bitcoin?.[currencyLower]) || btcInUSD * fallbackInfo.rateToUSD;

      // Calculate local fiat conversion rate from USD
      const usdToLocalFiatRate =
        btcInLocalFiat > 0 && btcInUSD > 0 ? btcInLocalFiat / btcInUSD : fallbackInfo.rateToUSD;
      const localizedFiatCost = baseFiatPriceInUSD * usdToLocalFiatRate;

      // 1 Bitcoin = 100,000,000 Satoshis. Calculate cost in Satoshis.
      const rawSatsAmount = Math.max(1, Math.round((baseFiatPriceInUSD / btcInUSD) * 100_000_000));

      // Stablecoins closely trace flat pegged USD metrics.
      const formattedUSDCAmount = baseFiatPriceInUSD.toFixed(2);

      const result: MultiRailPriceMatrix = {
        currencyCode: currencyUpper,
        localFiatAmount: Number(localizedFiatCost.toFixed(2)),
        currencySymbol: fallbackInfo.symbol,
        satsAmount: rawSatsAmount,
        usdcAmount: formattedUSDCAmount,
        btcPriceUSD: btcInUSD,
        exchangeRateToUSD: Number(usdToLocalFiatRate.toFixed(2)),
        timestamp: now,
      };

      this.cachedMatrix.set(cacheKey, { data: result, expiresAt: now + 60000 }); // Cache 1 minute
      return result;
    } catch (err) {
      console.warn("Using resilient price oracle fallback metrics:", err);
      const usdToLocalFiatRate = fallbackInfo.rateToUSD;
      const localizedFiatCost = baseFiatPriceInUSD * usdToLocalFiatRate;
      const rawSatsAmount = Math.max(
        1,
        Math.round((baseFiatPriceInUSD / DEFAULT_BTC_USD) * 100_000_000),
      );

      const fallbackResult: MultiRailPriceMatrix = {
        currencyCode: currencyUpper,
        localFiatAmount: Number(localizedFiatCost.toFixed(2)),
        currencySymbol: fallbackInfo.symbol,
        satsAmount: rawSatsAmount,
        usdcAmount: baseFiatPriceInUSD.toFixed(2),
        btcPriceUSD: DEFAULT_BTC_USD,
        exchangeRateToUSD: usdToLocalFiatRate,
        timestamp: now,
      };

      this.cachedMatrix.set(cacheKey, { data: fallbackResult, expiresAt: now + 30000 });
      return fallbackResult;
    }
  }
}
