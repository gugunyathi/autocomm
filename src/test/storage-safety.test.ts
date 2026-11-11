/**
 * Storage-safety regression tests.
 *
 * The app must keep working when `localStorage` is unavailable (SSR, private
 * browsing, or environments where storage access throws). These tests stub
 * storage as missing and require every persistence helper to degrade
 * gracefully instead of throwing.
 */
import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useWeb3Wallet } from "@/hooks/useWeb3Wallet";
import {
  clearSpecialOffersCache,
  loadSpecialOffersCache,
  saveSpecialOffersCache,
} from "@/lib/offers-cache";
import { getSafeLocalStorage, safeGetItem, safeRemoveItem, safeSetItem } from "@/lib/safe-storage";
import {
  getCurrentUser,
  getStoredUsers,
  setCurrentUser,
  signOutPasskey,
  type PasskeyUser,
} from "@/lib/passkey-auth";
import { getStoredA2AProfile } from "@/lib/agent-commerce";
import { getStoredCrawledSpecials } from "@/services/storeCrawlerService";
import { getStoredUserPersonalAgent, hasUserCreatedAgent } from "@/services/userAgentService";
import { setSelectedCurrency } from "@/utils/currencyRouter";

const probeUser: PasskeyUser = {
  id: "probe-user",
  name: "probe",
  displayName: "Probe User",
  credentialId: "cred-probe",
  createdAt: 1,
  lastLoginAt: 1,
  deviceType: "Security Key",
  agentBudget: 100,
  intentTags: [],
};

describe("app behavior when localStorage is unavailable", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("offers cache falls back to null without throwing", () => {
    expect(() => saveSpecialOffersCache([], [])).not.toThrow();
    expect(loadSpecialOffersCache()).toBeNull();
    expect(() => clearSpecialOffersCache()).not.toThrow();
  });

  it("passkey auth degrades without throwing", () => {
    expect(getStoredUsers()).toEqual([]);
    expect(getCurrentUser()).toBeNull();
    expect(() => setCurrentUser(probeUser)).not.toThrow();
    expect(() => signOutPasskey()).not.toThrow();
  });

  it("currency selection still resolves without throwing", () => {
    const profile = setSelectedCurrency("USD");
    expect(profile.code).toBe("USD");
  });

  it("agent and crawler getters fall back without throwing", () => {
    expect(hasUserCreatedAgent()).toBe(false);
    expect(getStoredUserPersonalAgent()).toBeNull();
    expect(getStoredA2AProfile("Probe")).toBeDefined();
    expect(getStoredCrawledSpecials()).toEqual({});
  });

  it("useWeb3Wallet mounts without throwing", () => {
    expect(() => renderHook(() => useWeb3Wallet())).not.toThrow();
  });

  it("reports storage as unavailable", () => {
    expect(getSafeLocalStorage()).toBeNull();
    expect(safeGetItem("anything")).toBeNull();
    expect(() => safeSetItem("anything", "value")).not.toThrow();
    expect(() => safeRemoveItem("anything")).not.toThrow();
  });
});

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => {
      store.clear();
    },
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    key: (index: number) => [...store.keys()][index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
  } as Storage;
}

describe("safe storage with working localStorage", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", createMemoryStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("round-trips values through the safe helpers", () => {
    expect(getSafeLocalStorage()).not.toBeNull();
    expect(safeGetItem("probe-key")).toBeNull();
    safeSetItem("probe-key", "probe-value");
    expect(safeGetItem("probe-key")).toBe("probe-value");
    safeRemoveItem("probe-key");
    expect(safeGetItem("probe-key")).toBeNull();
  });

  it("persists offers cache and passkey session", () => {
    saveSpecialOffersCache([], []);
    const payload = loadSpecialOffersCache();
    expect(payload).not.toBeNull();
    expect(payload?.matchedDeck).toEqual([]);

    setCurrentUser(probeUser);
    expect(getCurrentUser()).toEqual(probeUser);
    signOutPasskey();
    expect(getCurrentUser()).toBeNull();
  });
});
