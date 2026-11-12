/**
 * AutoWallet wishlist modal behavior.
 *
 * The top-bar Wishlist button opens this modal directly on the wishlist tab:
 * - wishlist tab is the default and honors initialTab
 * - wishlist items render with live count, remove actions fire per item
 * - debit tab content stays reachable via tab switch
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AutoWalletModal } from "../components/marketplace/AutoWalletModal";
import type { AutoDebitConfig, IntentWishlistItem } from "../types/autocom";

const config: AutoDebitConfig = {
  enabled: true,
  tier: 500,
  schedule: "monthly",
  nextDebitDate: "2026-12-01",
  autoWalletBalanceZar: 2500,
  autoWalletBalanceUsdc: 135,
  mandateSigned: true,
  bankAccountMask: "****4242",
  autoExecuteWishlist: true,
  totalAutomatedSavingsZar: 640,
};

const wishlist: IntentWishlistItem[] = [
  {
    id: "w1",
    title: "Nike Air Max Running Shoes",
    category: "Sportswear",
    minDiscountPercent: 40,
    maxPriceZar: 1500,
    targetBrand: "Nike",
    autoExecute: true,
    status: "ACTIVE_SCANNING",
    createdAt: Date.now(),
  },
  {
    id: "w2",
    title: "Bestseller Hardcover Fiction",
    category: "Leisure",
    minDiscountPercent: 25,
    maxPriceZar: 400,
    autoExecute: false,
    status: "ACTIVE_SCANNING",
    createdAt: Date.now(),
  },
];

function renderModal(overrides: Partial<React.ComponentProps<typeof AutoWalletModal>> = {}) {
  const props = {
    isOpen: true,
    onClose: vi.fn(),
    config,
    onUpdateConfig: vi.fn(),
    wishlist,
    onAddWishlistItem: vi.fn(),
    onRemoveWishlistItem: vi.fn(),
    ...overrides,
  };
  render(<AutoWalletModal {...props} />);
  return props;
}

describe("AutoWalletModal wishlist page", () => {
  it("renders nothing when closed", () => {
    renderModal({ isOpen: false });
    expect(screen.queryByText(/Intent Wishlist \(2\)/)).not.toBeInTheDocument();
  });

  it("opens on the wishlist tab by default with live item count", () => {
    renderModal();
    expect(screen.getByText(/Intent Wishlist \(2\)/)).toBeInTheDocument();
    expect(screen.getByText("Nike Air Max Running Shoes")).toBeInTheDocument();
    expect(screen.getByText("Bestseller Hardcover Fiction")).toBeInTheDocument();
    expect(screen.getByText(/Autonomous Intent Bargaining Engine/)).toBeInTheDocument();
  });

  it("honors initialTab for the debit page", () => {
    renderModal({ initialTab: "debit" });
    expect(screen.getByText(/Available Auto-Wallet Pool/)).toBeInTheDocument();
    expect(screen.queryByText("Nike Air Max Running Shoes")).not.toBeInTheDocument();
  });

  it("switches between wishlist and debit tabs", () => {
    renderModal({ initialTab: "debit" });
    fireEvent.click(screen.getByRole("tab", { name: /Intent Wishlist/ }));
    expect(screen.getByText("Nike Air Max Running Shoes")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: /Debit Order Tier/ }));
    expect(screen.getByText(/Available Auto-Wallet Pool/)).toBeInTheDocument();
  });

  it("fires remove with the item id", () => {
    const props = renderModal();
    fireEvent.click(screen.getByRole("button", { name: "Remove Nike Air Max Running Shoes" }));
    expect(props.onRemoveWishlistItem).toHaveBeenCalledWith("w1");
  });

  it("shows the empty state when the wishlist has no items", () => {
    renderModal({ wishlist: [] });
    expect(screen.getByText(/No Intent Wishlist Items Set/)).toBeInTheDocument();
  });
});
