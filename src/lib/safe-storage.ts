/**
 * Safe localStorage accessors.
 *
 * A defined `window` does not guarantee a working `localStorage` (SSR shims,
 * private browsing, blocked third-party storage, or test environments can
 * leave it undefined or throwing). Every read/write must go through these
 * helpers so persistence degrades gracefully instead of crashing the caller.
 */

export function getSafeLocalStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    const storage = window.localStorage;
    if (typeof storage === "undefined" || storage === null) return null;
    return storage;
  } catch {
    return null;
  }
}

export function safeGetItem(key: string): string | null {
  const storage = getSafeLocalStorage();
  if (!storage) return null;
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSetItem(key: string, value: string): void {
  const storage = getSafeLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(key, value);
  } catch {
    // Ignore quota / privacy-mode write failures: persistence is best-effort.
  }
}

export function safeRemoveItem(key: string): void {
  const storage = getSafeLocalStorage();
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch {
    // Ignore removal failures: callers must not depend on storage.
  }
}
