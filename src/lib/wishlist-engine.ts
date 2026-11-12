import type { IntentWishlistItem } from "../types/autocom";
import type { Store } from "./acn-data";

/** Pre-approved autonomous micro-credit ceiling shared with the Pay Later rail. */
export const WISHLIST_BNPL_CREDIT_LIMIT_ZAR = 5000;

/** Default merchant margin: bilateral floor when no advertised discount exists. */
export const DEFAULT_MERCHANT_MAX_DISCOUNT = 0.25;

export interface WishlistCandidate {
  storeId: string;
  storeName: string;
  store: Store;
  itemTitle: string;
  stickerPrice: number;
  /** Advertised discount (0-100). 0 when the merchant shows no special. */
  listedDiscount: number;
  inStock: boolean;
  source: "mesh-store" | "mall-product" | "live-deal";
  /** Pre-negotiated live-deal price when source is live-deal. */
  livePrice?: number;
}

export interface WishlistFunds {
  /** Personal agent session budget. */
  budget: number;
  /** Auto-debit wallet pool balance. */
  autoWalletZar: number;
  /** Available Buy-Now-Pay-Later headroom (limit minus outstanding). */
  bnplAvailable: number;
}

export interface WishlistNegotiation {
  price: number;
  discountPercent: number;
  accepted: boolean;
  rounds: number;
}

export type WishlistDecision =
  | {
      action: "buy";
      candidate: WishlistCandidate;
      negotiated: WishlistNegotiation;
      payFromBudget: number;
      payFromAutoWallet: number;
      bnplShortfall: number;
    }
  | {
      action: "park";
      candidate: WishlistCandidate;
      negotiated: WishlistNegotiation;
      reason: string;
    }
  | { action: "wait"; candidate: WishlistCandidate | null; reason: string };

export function normalizeTitle(value: string): string {
  return value.toLowerCase().trim();
}

export function titlesMatch(a: string, b: string): boolean {
  const t1 = normalizeTitle(a);
  const t2 = normalizeTitle(b);
  return t1.length > 0 && t2.length > 0 && (t1.includes(t2) || t2.includes(t1));
}

/**
 * Returns in-stock candidates whose title matches the wishlist item,
 * best advertised discount first.
 */
export function matchWishlistCandidates(
  item: Pick<IntentWishlistItem, "title">,
  candidates: WishlistCandidate[],
): WishlistCandidate[] {
  return candidates
    .filter((c) => c.inStock && titlesMatch(item.title, c.itemTitle))
    .sort((a, b) => b.listedDiscount - a.listedDiscount);
}

/**
 * Two-round bilateral negotiation mirroring the backend merchant bot:
 * accept when the bid clears the merchant floor, else counter at the
 * midpoint and settle on round two. Live-deal prices are already settled.
 */
export function negotiateWishlistPrice(
  candidate: WishlistCandidate,
  maxPriceZar: number,
): WishlistNegotiation {
  if (candidate.source === "live-deal" && typeof candidate.livePrice === "number") {
    const price = Math.max(0, candidate.livePrice);
    return {
      price,
      discountPercent:
        candidate.stickerPrice > 0
          ? Math.max(0, Math.round((1 - price / candidate.stickerPrice) * 100))
          : 0,
      accepted: true,
      rounds: 0,
    };
  }
  const sticker = Math.max(0, candidate.stickerPrice);
  if (sticker <= 0) {
    return { price: 0, discountPercent: 0, accepted: true, rounds: 0 };
  }
  const merchantMaxDiscount = Math.max(
    candidate.listedDiscount / 100,
    DEFAULT_MERCHANT_MAX_DISCOUNT,
  );
  const floor = sticker * (1 - merchantMaxDiscount);
  const bid = Math.min(Math.max(0, maxPriceZar), sticker);

  if (bid >= floor) {
    return {
      price: Math.round(bid * 100) / 100,
      discountPercent: Math.max(0, Math.round((1 - bid / sticker) * 100)),
      accepted: true,
      rounds: 1,
    };
  }
  const counter = (bid + floor) / 2;
  const price = Math.round(counter * 100) / 100;
  return {
    price,
    discountPercent: Math.max(0, Math.round((1 - price / sticker) * 100)),
    accepted: true,
    rounds: 2,
  };
}

/**
 * Picks the best negotiated candidate meeting the item thresholds, then
 * decides buy / park / wait from liquid funds plus BNPL headroom.
 */
export function decideWishlistOutcome(
  item: Pick<IntentWishlistItem, "maxPriceZar" | "minDiscountPercent" | "autoExecute">,
  candidates: WishlistCandidate[],
  funds: WishlistFunds,
): WishlistDecision {
  let best: { candidate: WishlistCandidate; negotiated: WishlistNegotiation } | null = null;
  for (const candidate of candidates) {
    const negotiated = negotiateWishlistPrice(candidate, item.maxPriceZar);
    if (negotiated.discountPercent < item.minDiscountPercent) continue;
    if (negotiated.price > item.maxPriceZar) continue;
    if (!best || negotiated.discountPercent > best.negotiated.discountPercent) {
      best = { candidate, negotiated };
    }
  }
  if (!best) {
    return {
      action: "wait",
      candidate: candidates[0] ?? null,
      reason: "No candidate currently meets the discount and price thresholds.",
    };
  }
  if (!item.autoExecute) {
    return {
      action: "park",
      candidate: best.candidate,
      negotiated: best.negotiated,
      reason: "Auto-buy is off: holding the negotiated deal for manual approval.",
    };
  }
  const price = best.negotiated.price;
  const liquid = Math.max(0, funds.budget) + Math.max(0, funds.autoWalletZar);
  if (price <= liquid) {
    const payFromBudget = Math.min(Math.max(0, funds.budget), price);
    return {
      action: "buy",
      candidate: best.candidate,
      negotiated: best.negotiated,
      payFromBudget: Math.round(payFromBudget * 100) / 100,
      payFromAutoWallet: Math.round((price - payFromBudget) * 100) / 100,
      bnplShortfall: 0,
    };
  }
  const headroom = Math.max(0, funds.bnplAvailable);
  if (price <= liquid + headroom) {
    const payFromBudget = Math.min(Math.max(0, funds.budget), price);
    const remainder = price - payFromBudget;
    const payFromAutoWallet = Math.min(Math.max(0, funds.autoWalletZar), remainder);
    return {
      action: "buy",
      candidate: best.candidate,
      negotiated: best.negotiated,
      payFromBudget: Math.round(payFromBudget * 100) / 100,
      payFromAutoWallet: Math.round(payFromAutoWallet * 100) / 100,
      bnplShortfall: Math.round((price - payFromBudget - payFromAutoWallet) * 100) / 100,
    };
  }
  return {
    action: "park",
    candidate: best.candidate,
    negotiated: best.negotiated,
    reason: `R${price.toLocaleString()} exceeds liquid funds plus BNPL headroom: holding the deal.`,
  };
}

/**
 * Computes remaining Buy-Now-Pay-Later headroom from the credit ceiling
 * minus outstanding active-repayment balances.
 */
export function computeBnplAvailable(
  loans: { status: string; remainingBalanceZAR?: number }[],
  creditLimitZar = WISHLIST_BNPL_CREDIT_LIMIT_ZAR,
): number {
  const outstanding = loans
    .filter((l) => l.status === "ACTIVE_REPAYMENT")
    .reduce((sum, l) => sum + Math.max(0, l.remainingBalanceZAR ?? 0), 0);
  return Math.max(0, Math.round((creditLimitZar - outstanding) * 100) / 100);
}
