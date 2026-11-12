/**
 * Wishlist autopilot engine: title matching, bilateral negotiation,
 * and buy / park / wait decisions from liquid funds plus BNPL headroom.
 */
import { describe, it, expect } from "vitest";
import {
  titlesMatch,
  matchWishlistCandidates,
  negotiateWishlistPrice,
  decideWishlistOutcome,
  computeBnplAvailable,
  type WishlistCandidate,
} from "../lib/wishlist-engine";
import type { Store } from "../lib/acn-data";

const store = { id: "s1", name: "Test Store" } as Store;

function candidate(overrides: Partial<WishlistCandidate> = {}): WishlistCandidate {
  return {
    storeId: "s1",
    storeName: "Test Store",
    store,
    itemTitle: "Nike Pegasus Running Shoes",
    stickerPrice: 2000,
    listedDiscount: 0,
    inStock: true,
    source: "mesh-store",
    ...overrides,
  };
}

describe("titlesMatch", () => {
  it("matches substrings either way, case-insensitive", () => {
    expect(titlesMatch("Nike Pegasus Running Shoes", "pegasus")).toBe(true);
    expect(titlesMatch("pegasus", "Nike Pegasus Running Shoes")).toBe(true);
    expect(titlesMatch("Nike Pegasus", "Adidas Hoodie")).toBe(false);
    expect(titlesMatch("", "Pegasus")).toBe(false);
  });
});

describe("matchWishlistCandidates", () => {
  it("returns in-stock title matches, best discount first", () => {
    const matches = matchWishlistCandidates({ title: "pegasus" }, [
      candidate({ itemTitle: "Unrelated Jacket" }),
      candidate({ itemTitle: "Nike Pegasus Running Shoes", listedDiscount: 10 }),
      candidate({
        itemTitle: "Nike Pegasus Trail",
        listedDiscount: 30,
        storeId: "s2",
      }),
      candidate({ itemTitle: "Nike Pegasus Sold Out", inStock: false }),
    ]);
    expect(matches.map((m) => m.itemTitle)).toEqual([
      "Nike Pegasus Trail",
      "Nike Pegasus Running Shoes",
    ]);
  });
});

describe("negotiateWishlistPrice", () => {
  it("accepts the bid when it clears the merchant floor", () => {
    // Floor: 2000 * (1 - 0.25) = 1500; bid 1700 clears it.
    const result = negotiateWishlistPrice(candidate(), 1700);
    expect(result.accepted).toBe(true);
    expect(result.rounds).toBe(1);
    expect(result.price).toBe(1700);
    expect(result.discountPercent).toBe(15);
  });

  it("counters at the midpoint when the bid is below the floor", () => {
    // Floor 1500, bid 1300 -> counter (1300+1500)/2 = 1400.
    const result = negotiateWishlistPrice(candidate(), 1300);
    expect(result.accepted).toBe(true);
    expect(result.rounds).toBe(2);
    expect(result.price).toBe(1400);
    expect(result.discountPercent).toBe(30);
  });

  it("uses live-deal prices as already settled", () => {
    const result = negotiateWishlistPrice(
      candidate({ source: "live-deal", livePrice: 1200 }),
      1500,
    );
    expect(result.rounds).toBe(0);
    expect(result.price).toBe(1200);
    expect(result.discountPercent).toBe(40);
  });
});

describe("decideWishlistOutcome", () => {
  const item = { maxPriceZar: 1800, minDiscountPercent: 10, autoExecute: true };

  it("buys from budget first, then the debit pool", () => {
    const decision = decideWishlistOutcome(item, [candidate()], {
      budget: 1000,
      autoWalletZar: 900,
      bnplAvailable: 0,
    });
    expect(decision.action).toBe("buy");
    if (decision.action !== "buy") throw new Error("expected buy");
    expect(decision.negotiated.price).toBe(1800);
    expect(decision.payFromBudget).toBe(1000);
    expect(decision.payFromAutoWallet).toBe(800);
    expect(decision.bnplShortfall).toBe(0);
  });

  it("buys with a BNPL shortfall when liquid funds fall short", () => {
    const decision = decideWishlistOutcome(item, [candidate()], {
      budget: 500,
      autoWalletZar: 500,
      bnplAvailable: 5000,
    });
    expect(decision.action).toBe("buy");
    if (decision.action !== "buy") throw new Error("expected buy");
    expect(decision.payFromBudget).toBe(500);
    expect(decision.payFromAutoWallet).toBe(500);
    expect(decision.bnplShortfall).toBe(800);
  });

  it("parks when auto-buy is off", () => {
    const decision = decideWishlistOutcome({ ...item, autoExecute: false }, [candidate()], {
      budget: 5000,
      autoWalletZar: 5000,
      bnplAvailable: 5000,
    });
    expect(decision.action).toBe("park");
  });

  it("parks when price exceeds funds plus credit", () => {
    const decision = decideWishlistOutcome(item, [candidate()], {
      budget: 100,
      autoWalletZar: 100,
      bnplAvailable: 100,
    });
    expect(decision.action).toBe("park");
  });

  it("waits when no candidate meets the thresholds", () => {
    const strict = { maxPriceZar: 1000, minDiscountPercent: 60, autoExecute: true };
    const decision = decideWishlistOutcome(strict, [candidate()], {
      budget: 5000,
      autoWalletZar: 5000,
      bnplAvailable: 5000,
    });
    expect(decision.action).toBe("wait");
  });
});

describe("computeBnplAvailable", () => {
  it("subtracts outstanding active balances from the ceiling", () => {
    expect(
      computeBnplAvailable([
        { status: "ACTIVE_REPAYMENT", remainingBalanceZAR: 1200 },
        { status: "ACTIVE_REPAYMENT", remainingBalanceZAR: 800 },
        { status: "SETTLED", remainingBalanceZAR: 0 },
      ]),
    ).toBe(3000);
  });

  it("floors at zero", () => {
    expect(computeBnplAvailable([{ status: "ACTIVE_REPAYMENT", remainingBalanceZAR: 99999 }])).toBe(
      0,
    );
  });
});
