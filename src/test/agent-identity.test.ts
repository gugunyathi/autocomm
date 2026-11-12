/**
 * Agent identity system: device ids, backend agent registry, and
 * agent-linked usage history across negotiate/order/settle endpoints.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { getOrCreateDeviceId } from "../lib/device-identity";
import {
  getCurrentUser,
  setCurrentUser,
  patchCurrentUser,
  hasExplicitSignOut,
  signOutPasskey,
  type PasskeyUser,
} from "../lib/passkey-auth";
import { handleApiRoute } from "../services/apiRouter";

function installMemoryStorage() {
  const store = new Map<string, string>();
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
      setItem: (key: string, value: string) => {
        store.set(key, String(value));
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
      clear: () => {
        store.clear();
      },
      key: (index: number) => [...store.keys()][index] ?? null,
      get length() {
        return store.size;
      },
    },
    writable: true,
    configurable: true,
  });
}

function postJson(path: string, body: Record<string, unknown>): Request {
  return new Request(`https://autocom.dev${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const testUser: PasskeyUser = {
  id: "usr_test_1",
  name: "lisa",
  displayName: "@lisa.agent",
  credentialId: "cred_test",
  createdAt: Date.now(),
  lastLoginAt: Date.now(),
  deviceType: "Biometric Enclave",
  agentBudget: 1500,
  intentTags: ["Sneakers"],
};

describe("device identity", () => {
  beforeEach(() => {
    installMemoryStorage();
  });

  it("returns a stable id across calls and persists it", () => {
    const first = getOrCreateDeviceId();
    const second = getOrCreateDeviceId();
    expect(first).toBe(second);
    expect(first.startsWith("dev_")).toBe(true);
    expect(window.localStorage.getItem("autocomm_device_id_v1")).toBe(first);
  });
});

describe("passkey session identity", () => {
  beforeEach(() => {
    installMemoryStorage();
  });

  it("links an agent to the persisted session user", () => {
    setCurrentUser(testUser);
    const linked = patchCurrentUser({ agentId: "agent-lisa-1", agentName: "lisa" });
    expect(linked?.agentName).toBe("lisa");
    expect(getCurrentUser()?.agentId).toBe("agent-lisa-1");
  });

  it("tracks explicit sign-out so restore can respect it", () => {
    expect(hasExplicitSignOut()).toBe(false);
    setCurrentUser(testUser);
    signOutPasskey();
    expect(getCurrentUser()).toBeNull();
    expect(hasExplicitSignOut()).toBe(true);
    setCurrentUser(testUser);
    expect(hasExplicitSignOut()).toBe(false);
  });
});

describe("agent registry endpoints", () => {
  it("registers an agent and upserts on repeat with login counting", async () => {
    const first = await handleApiRoute(
      postJson("/api/agents/register", {
        name: "TestPilot",
        fullName: "TestPilot.agent",
        agentId: "agent-testpilot-1",
        ownerUserId: "usr_test_1",
        deviceId: "dev_a",
      }),
    );
    expect(first!.status).toBe(201);
    const firstData = await first!.json();
    expect(firstData.created).toBe(true);
    expect(firstData.agent.name).toBe("testpilot");
    expect(firstData.agent.deviceIds).toEqual(["dev_a"]);

    const second = await handleApiRoute(
      postJson("/api/agents/register", {
        name: "testpilot",
        agentId: "agent-testpilot-1",
        deviceId: "dev_b",
      }),
    );
    expect(second!.status).toBe(200);
    const secondData = await second!.json();
    expect(secondData.created).toBe(false);
    expect(secondData.agent.loginCount).toBe(2);
    expect(secondData.agent.deviceIds).toEqual(["dev_a", "dev_b"]);
  });

  it("rejects registration without a name", async () => {
    const res = await handleApiRoute(postJson("/api/agents/register", {}));
    expect(res!.status).toBe(400);
  });

  it("looks up agents by name and returns 404 when unknown", async () => {
    await handleApiRoute(postJson("/api/agents/register", { name: "lookupme" }));
    const hit = await handleApiRoute(new Request("https://autocom.dev/api/agents?name=LookUpMe"));
    expect(hit!.status).toBe(200);
    expect((await hit!.json()).agent.name).toBe("lookupme");

    const miss = await handleApiRoute(
      new Request("https://autocom.dev/api/agents?name=nobodyhere12345"),
    );
    expect(miss!.status).toBe(404);
  });
});

describe("agent usage history", () => {
  it("appends and reads back activity events", async () => {
    const posted = await handleApiRoute(
      postJson("/api/agents/activity", {
        agentName: "historybob",
        deviceId: "dev_hist",
        type: "session_restored",
        details: { via: "agent_device" },
      }),
    );
    expect(posted!.status).toBe(201);

    const history = await handleApiRoute(
      new Request("https://autocom.dev/api/agents/activity?agent=historybob"),
    );
    const data = await history!.json();
    expect(data.count).toBeGreaterThanOrEqual(1);
    expect(data.events[0].type).toBe("session_restored");
    expect(data.events[0].agentName).toBe("historybob");
  });

  it("rejects activity without identity or type", async () => {
    const noIdentity = await handleApiRoute(
      postJson("/api/agents/activity", { type: "session_restored" }),
    );
    expect(noIdentity!.status).toBe(400);
    const noType = await handleApiRoute(
      postJson("/api/agents/activity", { agentName: "historybob" }),
    );
    expect(noType!.status).toBe(400);
  });

  it("links negotiations to the agent identity", async () => {
    const res = await handleApiRoute(
      postJson("/api/agent/negotiate", {
        sender: "consumer_agent",
        type: "counter_offer",
        storeId: "woolworths-food",
        price: 175,
        agentId: "agent-negotiator-1",
        agentName: "negotiator",
        deviceId: "dev_neg",
      }),
    );
    expect(res!.status).toBe(200);

    const history = await handleApiRoute(
      new Request("https://autocom.dev/api/agents/activity?agent=negotiator"),
    );
    const data = await history!.json();
    expect(data.events.some((e: { type: string }) => e.type === "negotiation")).toBe(true);
  });

  it("links created orders to the agent identity", async () => {
    const res = await handleApiRoute(
      postJson("/api/paypal/create-order", {
        storeId: "zara-fashion",
        negotiatedPriceZAR: 650,
        agentId: "agent-orderer-1",
        agentName: "orderer",
        deviceId: "dev_ord",
      }),
    );
    expect(res!.status).toBe(201);
    const order = await res!.json();
    expect(order.agentName).toBe("orderer");

    const history = await handleApiRoute(
      new Request("https://autocom.dev/api/agents/activity?agent=orderer"),
    );
    const data = await history!.json();
    expect(data.events.some((e: { type: string }) => e.type === "order_created")).toBe(true);
  });
});
