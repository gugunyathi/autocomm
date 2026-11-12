/**
 * Wishlist discover panel: searchable in-store inventory plus Channel3 online
 * results with one-click add and autofill suggestions.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { WishlistDiscoverPanel } from "../components/marketplace/WishlistDiscoverPanel";
import type { IntentWishlistItem } from "../types/autocom";

const PEGASUS = "Nike Pegasus 41 Road Running Shoes";

function renderPanel(wishlist: IntentWishlistItem[] = []) {
  const onAdd = vi.fn();
  render(<WishlistDiscoverPanel wishlist={wishlist} onAdd={onAdd} />);
  return { onAdd };
}

describe("WishlistDiscoverPanel", () => {
  it("shows popular in-store deals with one-click add buttons by default", () => {
    renderPanel();
    expect(screen.getByText("Popular in-store deals")).toBeInTheDocument();
    expect(screen.getByText(/items searchable/)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Add .* to wishlist/ }).length).toBeGreaterThan(0);
  });

  it("shows autofill suggestions while typing and quick-adds with mapped fields", () => {
    const { onAdd } = renderPanel();
    const input = screen.getByLabelText("Search products to add to wishlist");
    fireEvent.change(input, { target: { value: "pegasus" } });

    expect(screen.getByText(PEGASUS)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: `Add ${PEGASUS} to wishlist` }));
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith({
      title: PEGASUS,
      category: "Footwear",
      targetBrand: "Nike Performance",
      minDiscountPercent: 17,
      maxPriceZar: 2399,
      autoExecute: true,
    });
  });

  it("merges in-store matches with online results on submit", async () => {
    renderPanel();
    const input = screen.getByLabelText("Search products to add to wishlist");
    fireEvent.change(input, { target: { value: "nike" } });
    fireEvent.submit(input.closest("form") as HTMLFormElement);

    expect(await screen.findByText('Results for "nike"')).toBeInTheDocument();
    // In-store inventory match.
    expect(screen.getByText(PEGASUS)).toBeInTheDocument();
    // Channel3 edge-catalog online match merged after in-store cards.
    expect(
      await screen.findByText("Nike Air Zoom Pegasus 40 Road Running Shoes"),
    ).toBeInTheDocument();
  });

  it("marks items already in the wishlist as added", () => {
    renderPanel([
      {
        id: "w1",
        title: PEGASUS,
        category: "Footwear",
        minDiscountPercent: 17,
        maxPriceZar: 2399,
        autoExecute: true,
        status: "ACTIVE_SCANNING",
        createdAt: Date.now(),
      },
    ]);
    const input = screen.getByLabelText("Search products to add to wishlist");
    fireEvent.change(input, { target: { value: "pegasus" } });
    fireEvent.submit(input.closest("form") as HTMLFormElement);

    const addedButton = screen.getByRole("button", {
      name: `${PEGASUS} already in wishlist`,
    });
    expect(addedButton).toBeDisabled();
    expect(within(addedButton).getByText("Added")).toBeInTheDocument();
  });
});
