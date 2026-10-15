/**
 * AutoCom Location-Aware Geolocation Currency Router
 * Reads user's localized domain to dynamically calculate exchange rates and fiat parameters.
 */

export interface CurrencyProfile {
  code: string; // e.g., "ZAR", "EUR", "NGN", "USD", "GBP", "KES"
  symbol: string; // e.g., "R", "€", "₦", "$", "£", "KSh"
  multiplier: number; // Conversion math reference standard
  countryName: string;
  flag: string;
}

// Global mapping fallback library matching standard country domain networks
export const COUNTRY_CURRENCY_MAP: Record<
  string,
  { code: string; symbol: string; countryName: string; flag: string }
> = {
  ZA: { code: "ZAR", symbol: "R", countryName: "South Africa", flag: "🇿🇦" },
  US: { code: "USD", symbol: "$", countryName: "United States", flag: "🇺🇸" },
  EU: { code: "EUR", symbol: "€", countryName: "European Union", flag: "🇪🇺" },
  DE: { code: "EUR", symbol: "€", countryName: "Germany", flag: "🇩🇪" },
  FR: { code: "EUR", symbol: "€", countryName: "France", flag: "🇫🇷" },
  GB: { code: "GBP", symbol: "£", countryName: "United Kingdom", flag: "🇬🇧" },
  NG: { code: "NGN", symbol: "₦", countryName: "Nigeria", flag: "🇳🇬" },
  KE: { code: "KES", symbol: "KSh", countryName: "Kenya", flag: "🇰🇪" },
};

export const SUPPORTED_CURRENCIES: CurrencyProfile[] = [
  { code: "ZAR", symbol: "R", multiplier: 18.4, countryName: "South Africa", flag: "🇿🇦" },
  { code: "USD", symbol: "$", multiplier: 1.0, countryName: "United States", flag: "🇺🇸" },
  { code: "EUR", symbol: "€", multiplier: 0.92, countryName: "European Union", flag: "🇪🇺" },
  { code: "GBP", symbol: "£", multiplier: 0.79, countryName: "United Kingdom", flag: "🇬🇧" },
  { code: "NGN", symbol: "₦", multiplier: 1480.0, countryName: "Nigeria", flag: "🇳🇬" },
  { code: "KES", symbol: "KSh", multiplier: 129.5, countryName: "Kenya", flag: "🇰🇪" },
];

let cachedProfile: CurrencyProfile | null = null;

export async function detectLocalCurrencyProfile(): Promise<CurrencyProfile> {
  if (cachedProfile) {
    return cachedProfile;
  }

  // Check stored preference first
  if (typeof window !== "undefined") {
    const storedCode = localStorage.getItem("autocom_selected_currency");
    if (storedCode) {
      const match = SUPPORTED_CURRENCIES.find((c) => c.code === storedCode);
      if (match) {
        cachedProfile = match;
        return match;
      }
    }
  }

  try {
    // 1. Fetch lightweight geo-coordinates using a privacy-first lookup service with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch("https://ipapi.co/json/", {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const countryCode = data.country_code as string; // e.g. "ZA" or "US"
      const match = COUNTRY_CURRENCY_MAP[countryCode] || COUNTRY_CURRENCY_MAP["ZA"];

      cachedProfile = {
        code: match.code,
        symbol: match.symbol,
        multiplier: 1.0,
        countryName: match.countryName,
        flag: match.flag,
      };
      return cachedProfile;
    }
  } catch (error) {
    console.warn(
      "Location detection network timed out or offline. Falling back to default baseline South African ZAR profile.",
      error,
    );
  }

  // Default to South Africa (AutoCom primary flagship hub) or browser locale
  const defaultProfile: CurrencyProfile = {
    code: "ZAR",
    symbol: "R",
    multiplier: 18.4,
    countryName: "South Africa",
    flag: "🇿🇦",
  };

  cachedProfile = defaultProfile;
  return defaultProfile;
}

export function setSelectedCurrency(currencyCode: string): CurrencyProfile {
  const match =
    SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode) || SUPPORTED_CURRENCIES[0];
  cachedProfile = match;
  if (typeof window !== "undefined") {
    localStorage.setItem("autocom_selected_currency", match.code);
  }
  return match;
}
