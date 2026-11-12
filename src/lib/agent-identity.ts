import { getOrCreateDeviceId } from "./device-identity";
import { getStoredUserPersonalAgent } from "../services/userAgentService";

export interface ActiveAgentIdentity {
  agentId: string;
  agentName: string;
  deviceId: string;
}

/**
 * Returns the identity of the user's created personal agent plus this device,
 * or null when no agent exists yet. API clients attach this to request bodies
 * so the backend links usage history to the agent.
 */
export function getActiveAgentIdentity(): ActiveAgentIdentity | null {
  const agent = getStoredUserPersonalAgent();
  if (!agent) return null;
  return {
    agentId: agent.id,
    agentName: agent.name,
    deviceId: getOrCreateDeviceId(),
  };
}

/**
 * Merges the active agent identity into an outbound API body. Returns the
 * body unchanged when no agent identity is available.
 */
export function withAgentIdentity<T extends Record<string, unknown>>(body: T): T {
  const identity = getActiveAgentIdentity();
  if (!identity) return body;
  return { ...body, ...identity };
}

/**
 * Fire-and-forget usage-history ping. Never throws; failures are swallowed so
 * telemetry can never break the shopping flow.
 */
export async function reportAgentActivity(
  type: string,
  details?: Record<string, unknown>,
): Promise<void> {
  try {
    const identity = getActiveAgentIdentity();
    if (!identity) return;
    await fetch("/api/agents/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...identity, type, details: details ?? {} }),
    });
  } catch {
    // Telemetry is best-effort.
  }
}
