import { describe, it, expect } from "vitest";
import {
  searchChannel3Products,
  getChannel3ProductById,
  executeChannel3McpTool,
  CHANNEL3_MCP_TOOLS,
} from "../services/channel3Service";

describe("Channel3 Retail Product Search & MCP Integration", () => {
  it("exposes compliant Channel3 MCP tools definition", () => {
    expect(CHANNEL3_MCP_TOOLS.length).toBeGreaterThanOrEqual(3);
    const names = CHANNEL3_MCP_TOOLS.map((t) => t.name);
    expect(names).toContain("channel3_search_products");
    expect(names).toContain("channel3_get_product_details");
    expect(names).toContain("channel3_find_deals");
  });

  it("searches products across South African retailers in edge catalog fallback", async () => {
    const res = await searchChannel3Products("cheese", { limit: 5 });
    expect(res.results.length).toBeGreaterThan(0);
    expect(res.results[0]?.title.toLowerCase()).toContain("cheese");
    expect(res.results[0]?.retailer).toBe("Woolworths Food");
    expect(res.results[0]?.priceZAR).toBeGreaterThan(0);
    expect(res.results[0]?.priceUSD).toBeGreaterThan(0);
  });

  it("retrieves product details by ID", async () => {
    const product = await getChannel3ProductById("ch3_nike_003");
    expect(product).not.toBeNull();
    expect(product?.title).toContain("Nike");
    expect(product?.sku).toBe("NIKE-AIR-ZOOM-PEG-40");
    expect(product?.merchantBotAvailable).toBe(true);
  });

  it("executes channel3_search_products tool via MCP executor", async () => {
    const toolRes = await executeChannel3McpTool("channel3_search_products", {
      query: "hoodie",
      limit: 2,
    });
    expect(toolRes.success).toBe(true);
    const data = toolRes.result as { results: unknown[]; total: number };
    expect(data.results.length).toBeGreaterThan(0);
  });

  it("executes channel3_find_deals tool for active bargaining bots", async () => {
    const dealsRes = await executeChannel3McpTool("channel3_find_deals", {
      retailer: "zara",
    });
    expect(dealsRes.success).toBe(true);
    const data = dealsRes.result as { dealsCount: number; deals: unknown[] };
    expect(data.dealsCount).toBeGreaterThan(0);
  });
});
