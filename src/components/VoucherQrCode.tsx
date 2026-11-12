import { useState, useEffect } from "react";
import QRCode from "qrcode";

interface VoucherQrCodeProps {
  /** Payload encoded into the QR matrix (voucher token + receipt fields). */
  value: string;
  /** Display size in px. */
  size?: number;
  /** Accessible label for the code. */
  label?: string;
}

/**
 * Renders a genuine scannable QR code (SVG matrix, no canvas dependency)
 * for a bought-item receipt voucher. Falls back to the raw token text when
 * encoding fails so the voucher stays redeemable by code.
 */
export function VoucherQrCode({ value, size = 156, label }: VoucherQrCodeProps) {
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setSvg(null);
    setFailed(false);
    QRCode.toString(value, {
      type: "svg",
      width: size,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#0a0f1e", light: "#ffffff" },
    })
      .then((markup) => {
        if (!cancelled) setSvg(markup);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (failed || !value) {
    return (
      <div
        className="flex items-center justify-center bg-white rounded-xl px-3 text-center"
        style={{ width: size, height: size }}
        role="img"
        aria-label={label ?? "Voucher code"}
      >
        <span className="font-mono text-[10px] font-bold text-slate-900 break-all">{value}</span>
      </div>
    );
  }

  if (!svg) {
    return (
      <div
        className="bg-white rounded-xl animate-pulse"
        style={{ width: size, height: size }}
        aria-label="Generating QR code"
      />
    );
  }

  return (
    <div
      className="bg-white rounded-xl overflow-hidden [&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
      style={{ width: size, height: size }}
      role="img"
      aria-label={label ?? "Voucher QR code"}
      // QR matrix generated locally by the qrcode encoder (offline-safe).
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
