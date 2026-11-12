import { safeGetItem, safeSetItem } from "./safe-storage";

const STORAGE_DEVICE_ID_KEY = "autocomm_device_id_v1";

function generateDeviceId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return `dev_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
    }
  } catch {
    // Fall through to Math.random fallback.
  }
  return `dev_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Returns the stable per-device identifier, creating and persisting it on
 * first use. Used to link backend activity to the issuing device.
 */
export function getOrCreateDeviceId(): string {
  const existing = safeGetItem(STORAGE_DEVICE_ID_KEY);
  if (existing) return existing;
  const created = generateDeviceId();
  safeSetItem(STORAGE_DEVICE_ID_KEY, created);
  return created;
}
