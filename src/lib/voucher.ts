/**
 * Builds the deterministic receipt payload encoded into bought-item QR codes:
 * token, store, settled price, and purchase timestamp.
 */
export function buildVoucherQrPayload(args: {
  qrToken: string;
  store: string;
  price: number;
  boughtAt: number;
}): string {
  return [
    "AUTOCOM-VOUCHER",
    args.qrToken,
    args.store,
    `R${args.price}`,
    new Date(args.boughtAt).toISOString(),
  ].join(":");
}
