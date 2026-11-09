/**
 * AutoCom PayPal Agent Commerce Integration Test
 * Verifies live PayPal Sandbox OAuth, Orders API, Agent Toolkit, and MCP server endpoints.
 */

import { describe, it, expect } from "vitest";
import {
  verifyPayPalCredentials,
  createRealPayPalOrder,
  captureRealPayPalOrder,
  convertZarToUsd,
  ZAR_TO_USD_EXCHANGE_RATE,
} from "../services/paypalService";
import {
  PAYPAL_AGENT_TOOLS,
  executePayPalAgentTool,
  handlePayPalMcpRequest,
} from "../services/paypalAgentToolkit";
import { handleApiRoute } from "../services/apiRouter";

describe("PayPal Autonomous Commerce & Agent Toolkit Integration", () => {
  it("converts ZAR to USD accurately with 2-decimal precision", () => {
    const priceZar = 220;
    const usd = convertZarToUsd(priceZar);
    expect(usd).toBe(Math.round(220 * ZAR_TO_USD_EXCHANGE_RATE * 100) / 100);
    expect(usd).toBe(11.88);
  });

  it("exposes all required PayPal Agent Toolkit tools per developer docs", () => {
    const toolNames = PAYPAL_AGENT_TOOLS.map((t) => t.name);
    expect(toolNames).toContain("paypal_create_order");
    expect(toolNames).toContain("paypal_capture_order");
    expect(toolNames).toContain("paypal_get_order_details");
    expect(toolNames).toContain("paypal_create_invoice");
    expect(toolNames).toContain("paypal_list_invoices");
    expect(toolNames).toContain("paypal_create_product");
    expect(toolNames).toContain("paypal_list_products");
    expect(toolNames).toContain("paypal_agent_autonomous_settle");
  });

  it("handles Model Context Protocol (MCP) tools/list request", async () => {
    const mcpResponse = await handlePayPalMcpRequest({
      jsonrpc: "2.0",
      id: "req_mcp_test_01",
      method: "tools/list",
    });

    expect(mcpResponse.jsonrpc).toBe("2.0");
    expect(mcpResponse.id).toBe("req_mcp_test_01");
    expect(mcpResponse.result.tools.length).toBeGreaterThanOrEqual(8);
  });

  it("executes paypal_create_order agent tool with valid structure", async () => {
    const result = await executePayPalAgentTool("paypal_create_order", {
      storeId: "zara-fashion",
      storeName: "Zara Fashion",
      priceZAR: 650,
      itemName: "Oversized Wool Hoodie",
    });

    expect(result.success).toBe(true);
    expect(result.tool).toBe("paypal_create_order");
    expect(result.result.orderId).toBeDefined();
    expect(result.result.amountUSD).toBe(35.1);
    expect(result.agentRationale).toContain("Zara Fashion");
  });

  it("routes /api/paypal/agent-toolkit/tools via HTTP API", async () => {
    const request = new Request("http://localhost:3000/api/paypal/agent-toolkit/tools", {
      method: "GET",
    });
    const url = new URL(request.url);
    const response = await handleApiRoute(request, url);

    expect(response).not.toBeNull();
    expect(response?.status).toBe(200);
    const data = await response?.json();
    expect(data.toolkit).toBe("@paypal/agent-toolkit");
    expect(data.tools.length).toBe(PAYPAL_AGENT_TOOLS.length);
  });

  it("routes /api/paypal/create-order and /api/paypal/checkout-settle via HTTP API", async () => {
    // 1. Create Order
    const createReq = new Request("http://localhost:3000/api/paypal/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeId: "woolworths-food",
        negotiatedPriceZAR: 220,
        itemName: "Artisan Sourdough & Cheese Platter",
      }),
    });
    const createRes = await handleApiRoute(createReq, new URL(createReq.url));
    expect(createRes?.status).toBe(201);
    const createData = await createRes?.json();
    expect(createData.orderId).toBeDefined();
    expect(createData.convertedUSD).toBe(11.88);

    // 2. Checkout Settle
    const settleReq = new Request("http://localhost:3000/api/paypal/checkout-settle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: createData.orderId,
      }),
    });
    const settleRes = await handleApiRoute(settleReq, new URL(settleReq.url));
    expect(settleRes?.status).toBe(200);
    const settleData = await settleRes?.json();
    expect(settleData.success).toBe(true);
    expect(settleData.transactionId).toBeDefined();
    expect(settleData.orderId).toBe(createData.orderId);
  });

  it("returns status from /api/paypal/status", async () => {
    const statusReq = new Request("http://localhost:3000/api/paypal/status", {
      method: "GET",
    });
    const statusRes = await handleApiRoute(statusReq, new URL(statusReq.url));
    expect(statusRes?.status).toBe(200);
    const statusData = await statusRes?.json();
    expect(statusData.aiToolkitCompliant).toBe(true);
    expect(statusData.environment).toBe("sandbox");
    expect(statusData.clientIdMasked).toBeDefined();
  });
});
