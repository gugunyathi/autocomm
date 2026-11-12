/**
 * Voucher QR codes: bought-item receipts render a genuine scannable QR
 * matrix (not a placeholder), with a deterministic receipt payload.
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VoucherQrCode } from "../components/VoucherQrCode";
import { buildVoucherQrPayload } from "../lib/voucher";

describe("buildVoucherQrPayload", () => {
  it("encodes token, store, price, and timestamp deterministically", () => {
    const payload = buildVoucherQrPayload({
      qrToken: "AUTOCOM-WOO-AB12-2026",
      store: "Woolworths Food",
      price: 175,
      boughtAt: new Date("2026-11-12T07:44:14.000Z").getTime(),
    });
    expect(payload).toBe(
      "AUTOCOM-VOUCHER:AUTOCOM-WOO-AB12-2026:Woolworths Food:R175:2026-11-12T07:44:14.000Z",
    );
  });
});

describe("VoucherQrCode", () => {
  it("renders an SVG QR matrix for the voucher payload", async () => {
    render(<VoucherQrCode value="AUTOCOM-VOUCHER:TOKEN-1:Store:R100:2026-01-01" size={144} />);
    const code = await screen.findByRole("img", { name: "Voucher QR code" });
    const svg = code.querySelector("svg");
    expect(svg).not.toBeNull();
    // A real matrix encodes many modules into long path data, not a static drawing.
    const pathData = Array.from(code.querySelectorAll("svg path"))
      .map((p) => p.getAttribute("d") ?? "")
      .join("");
    expect(pathData.length).toBeGreaterThan(200);
  });

  it("produces distinct matrices for distinct vouchers", async () => {
    const first = render(<VoucherQrCode value="AUTOCOM-VOUCHER:A" />);
    const firstSvg = (await screen.findByRole("img", { name: "Voucher QR code" })).innerHTML;
    first.unmount();
    render(<VoucherQrCode value="AUTOCOM-VOUCHER:B" />);
    const secondSvg = (await screen.findByRole("img", { name: "Voucher QR code" })).innerHTML;
    expect(firstSvg).not.toBe(secondSvg);
  });
});
