/**
 * Autocomm Agent-to-Agent (A2A) Autonomous Commerce Protocol
 * Specification & OpenAPI 3.0 Document Definition for APIMatic SDK Generation
 *
 * Designed for Machine-to-Machine (M2M) Micro-Negotiations across
 * 8 Spatial Outlets in South African Mall Ecosystems.
 */

/**
 * Valid actors in the Autocomm autonomous bargaining lifecycle.
 */
export type A2ASender = "consumer_agent" | "merchant_bot";

/**
 * State transitions representing discrete stages in a real-time bilateral price auction.
 */
export type A2AMessageType = "discovery" | "offer" | "counter_offer" | "accept" | "reject";

/**
 * Settled lifecycle status for audit ledgers and automated PayPal checkout triggers.
 */
export type A2ANegotiationStatus =
  "BARGAINING" | "OFFER_ACCEPTED" | "PAYMENT_PENDING" | "SETTLED_VIA_PAYPAL" | "REJECTED";

/**
 * Standard supported currency code for Autocomm domestic settlements.
 */
export type A2ACurrency = "ZAR" | "USD";

/**
 * Real-time atomic message exchanged between autonomous shopping agents and retail bots.
 */
export interface A2AMessage {
  /**
   * Unique UUID v4 identifying this specific message frame.
   * @example "msg_9f2e3d8c-4a1b-4d7e-8c2f-1a9e8d7c6b5a"
   */
  id: string;

  /**
   * ISO 8601 UTC timestamp capturing microsecond dispatch time.
   * @example "2026-10-19T08:45:00.123Z"
   */
  timestamp: string;

  /**
   * Originating entity of the bargaining packet.
   * - 'consumer_agent': Autonomous buyer proxy operating on consumer budget constraints.
   * - 'merchant_bot': Autonomous retail seller bot operating on inventory margin curves.
   */
  sender: A2ASender;

  /**
   * Intent payload type governing state transitions in the negotiation engine.
   */
  type: A2AMessageType;

  /**
   * Current proposed transactional price in the designated currency.
   * @minimum 0.01
   * @example 649.00
   */
  price: number;

  /**
   * Domestic currency denomination for South African retail compliance.
   * @default "ZAR"
   */
  currency: "ZAR";

  /**
   * Published catalog sticker price before algorithmic discounting.
   * @example 899.00
   */
  originalPrice: number;

  /**
   * Identifier of the target retail outlet inside the Bel Air Shopping Centre directory.
   * Valid IDs: 'zara-fashion', 'hm-boutique', 'istore-apple', 'exclusive-books',
   * 'mugg-bean', 'woolworths-food', 'nike-performance', 'clicks-pharmacy'.
   * @example "zara-fashion"
   */
  storeId: string;

  /**
   * Item descriptor or stock-keeping identifier under active price negotiation.
   * @example "Oversized Wool Hoodie - Charcoal Slate (M)"
   */
  itemName?: string;

  /**
   * Optional reasoning payload emitted by the autonomous agent's LLM engine.
   * @example "Counter-offer within 12% margin tolerance based on historical afternoon foot traffic."
   */
  agentRationale?: string;
}

/**
 * Full state snapshot for an ongoing or finalized negotiation session.
 */
export interface A2ANegotiationSession {
  sessionId: string;
  storeId: string;
  storeName: string;
  category: string;
  itemName: string;
  originalPriceZAR: number;
  currentOfferZAR: number;
  savingsZAR: number;
  status: A2ANegotiationStatus;
  history: A2AMessage[];
  paypalOrderId?: string;
  paypalTransactionId?: string;
  settledAt?: string;
}

/**
 * Payload sent to trigger an automated autonomous PayPal order generation.
 */
export interface A2APayPalOrderRequest {
  storeId: string;
  negotiatedPriceZAR: number;
  originalPriceZAR: number;
  sessionId: string;
  sku: string;
  vaultedAgentConsent: boolean;
}

/**
 * Result returned by the autonomous settlement service.
 */
export interface A2APayPalOrderResponse {
  orderId: string;
  status: "CREATED" | "SAVED" | "APPROVED" | "VOIDED" | "COMPLETED";
  convertedUSD: number;
  exchangeRate: number;
  timestamp: string;
}

/**
 * Result from executing a vaulted M2M machine payment.
 */
export interface A2AVaultedPaymentResult {
  transactionId: string;
  orderId: string;
  success: boolean;
  settledAmountUSD: number;
  settledAmountZAR: number;
  timestamp: string;
  vaultAuthorizationRef: string;
}

/**
 * OpenAPI 3.0.3 specification JSON string formatted for direct APIMatic SDK generation.
 * Can be exported or fed directly into APIMatic API Transformer to generate client SDKs in
 * TypeScript, Python, C#, PHP, Java, and Go.
 */
export const A2A_OPENAPI_SPEC_JSON: string = JSON.stringify(
  {
    openapi: "3.0.3",
    info: {
      title: "Autocomm Agent-to-Agent (A2A) Autonomous Commerce API",
      version: "1.0.0",
      description:
        "Production OpenAPI specification for Autocomm bilateral machine-to-machine negotiation and automated PayPal Sandbox micro-settlements for South African retail outlets. Optimized for APIMatic SDK generation.",
      contact: {
        name: "Autocomm Engineering · Silvernest Pty Ltd",
        url: "https://autocomm.xyz",
        email: "hello@autocomm.xyz",
      },
      license: {
        name: "Apache 2.0",
        url: "https://www.apache.org/licenses/LICENSE-2.0.html",
      },
    },
    servers: [
      {
        url: "https://api.autocomm.xyz/v1",
        description: "Autocomm Live Agent Mesh Production Gateway",
      },
      {
        url: "https://sandbox.autocomm.xyz/v1",
        description: "Autocomm PayPal Sandbox / Test Mesh",
      },
    ],
    paths: {
      "/api/mall/directory": {
        get: {
          summary: "Retrieve 8-Outlet Bel Air Mall Spatial Directory",
          operationId: "getMallDirectory",
          description:
            "Returns the spatial beacon coordinates, active stock items, and merchant bot listening parameters for all 8 South African mall outlets.",
          responses: {
            "200": {
              description: "Successful retrieval of spatial outlet directory.",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/MallOutlet",
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/agent/negotiate": {
        post: {
          summary: "Submit A2A Negotiation Message Frame",
          operationId: "sendA2AMessage",
          description:
            "Dispatches an autonomous discovery, offer, counter-offer, acceptance, or rejection packet between consumer proxy and merchant bot.",
          requestBody: {
            required: true,
            description: "A2A message packet modeling the bargaining state transition.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/A2AMessage",
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Merchant bot counter-response or status transition acknowledgement.",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/A2AMessage",
                  },
                },
              },
            },
            "400": {
              description: "Invalid price range, unparsable currency, or schema validation error.",
            },
          },
        },
      },
      "/api/paypal/create-order": {
        post: {
          summary: "Create Autonomous PayPal Sandbox Order with ZAR-USD Conversion",
          operationId: "createPayPalAgentOrder",
          description:
            "Initializes a pre-authorized PayPal Orders API v2 transaction converted from ZAR to USD at real-time index rates.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/A2APayPalOrderRequest",
                },
              },
            },
          },
          responses: {
            "201": {
              description: "PayPal Sandbox order created and awaiting vaulted agent settlement.",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/A2APayPalOrderResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/api/paypal/checkout-settle": {
        post: {
          summary: "Execute Vaulted Agent-to-Agent Machine Settlement",
          operationId: "executeVaultedSettlement",
          description:
            "Executes zero-click autonomous settlement using pre-authorized agent vault tokens once bilateral negotiation criteria are satisfied.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["orderId"],
                  properties: {
                    orderId: {
                      type: "string",
                      description: "PayPal Sandbox order reference ID to capture.",
                      example: "ORD-SANDBOX-8A7B2C9D1E",
                    },
                    agentAuthorizationHash: {
                      type: "string",
                      description: "Cryptographic proof of user-delegated spending authorization.",
                      example: "sha256:4b9f8a2c1e7d3f0a...",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Payment successfully captured via PayPal Sandbox ledger.",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/A2AVaultedPaymentResult",
                  },
                },
              },
            },
          },
        },
      },
      "/api/paypal/agent-toolkit/tools": {
        get: {
          summary: "PayPal AI Agent Toolkit Standard Tools Manifest",
          operationId: "getPayPalAgentTools",
          description:
            "Lists compliant PayPal AI Agent tools (Orders v2, Invoicing, Product Catalog, Vaulted Settlement) per developer.paypal.com/ai-tools/toolkit/.",
          responses: {
            "200": {
              description: "Available PayPal AI Agent tools manifest.",
            },
          },
        },
      },
      "/api/paypal/agent-toolkit/execute": {
        post: {
          summary: "Execute PayPal AI Agent Toolkit Tool",
          operationId: "executePayPalAgentTool",
          description:
            "Invokes an individual PayPal Agent Toolkit tool by name with structured arguments.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "arguments"],
                  properties: {
                    name: { type: "string", example: "paypal_create_order" },
                    arguments: { type: "object" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Successful tool execution result." },
            "400": { description: "Execution error." },
          },
        },
      },
      "/api/paypal/mcp": {
        post: {
          summary: "PayPal Model Context Protocol (MCP) JSON-RPC Endpoint",
          operationId: "handlePayPalMcpRpc",
          description:
            "Handles Model Context Protocol JSON-RPC 2.0 requests (tools/list, tools/call) for LLM agents.",
          responses: {
            "200": { description: "Standard MCP JSON-RPC 2.0 response." },
          },
        },
      },
      "/api/channel3/search": {
        get: {
          summary: "Channel3 Retail Product Search API",
          operationId: "searchChannel3Products",
          description:
            "Searches across 100M+ real retail products from 25,000+ retailers. Returns real price, stock status, and merchant bargaining bots.",
          parameters: [
            {
              name: "query",
              in: "query",
              required: true,
              schema: { type: "string", example: "Air Jordan 1" },
            },
            {
              name: "limit",
              in: "query",
              required: false,
              schema: { type: "integer", default: 10 },
            },
          ],
          responses: {
            "200": { description: "Matching Channel3 product cards." },
          },
        },
      },
      "/api/channel3/mcp": {
        post: {
          summary: "Channel3 Model Context Protocol (MCP) Server",
          operationId: "handleChannel3McpRpc",
          description:
            "MCP JSON-RPC 2.0 endpoint exposing Channel3 product discovery tools to AI agents.",
          responses: {
            "200": { description: "Standard MCP JSON-RPC 2.0 response." },
          },
        },
      },
      "/api/paypal/audit-ledger": {
        get: {
          summary: "Retrieve Live A2A Audit Ledger Records",
          operationId: "getAuditLedgerRecords",
          description:
            "Streams verified bilateral negotiation settlements and PayPal Sandbox transaction tokens.",
          responses: {
            "200": { description: "List of settled and pending A2A transactions." },
          },
        },
      },
      "/api/paypal/pay-later/plan": {
        get: {
          summary: "Calculate 6-Month PayPal Pay Later Repayment Plan",
          operationId: "calculatePayLaterPlan",
          description:
            "Generates an exact 6-month repayment schedule for an autonomous agent with a 0.5% platform fee.",
          parameters: [
            {
              name: "priceZAR",
              in: "query",
              required: true,
              schema: { type: "number", example: 1200 },
              description: "Negotiated checkout amount in South African Rand (ZAR).",
            },
            {
              name: "balance",
              in: "query",
              required: false,
              schema: { type: "number", example: 200 },
              description:
                "Current shopping agent wallet balance to auto-calculate credit shortfall.",
            },
          ],
          responses: {
            "200": {
              description: "6-month payment plan with 0.5% platform fee and monthly breakdown.",
            },
          },
        },
      },
      "/api/paypal/pay-later/apply": {
        post: {
          summary: "Request PayPal Pay Later Autonomous Agent Credit",
          operationId: "requestAgentPayLaterLoan",
          description:
            "Auto-approves and clears purchases when agent wallet balance is insufficient, financing the shortfall over 6 months.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["principalZAR"],
                  properties: {
                    agentId: { type: "string", example: "bot_buyer_muse_za" },
                    agentName: { type: "string", example: "Muse-ZA (Autonomous Buyer)" },
                    ownerAddress: {
                      type: "string",
                      example: "0x49B0E1F8C2224424B10a82B93E94d1F3238385a4",
                    },
                    ownerName: { type: "string", example: "Gugu" },
                    storeId: { type: "string", example: "woolworths-food" },
                    storeName: { type: "string", example: "Woolworths Food" },
                    itemTitle: { type: "string", example: "Artisan Sourdough & Cheese Platter" },
                    principalZAR: { type: "number", example: 1200 },
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description:
                "Pay Later loan generated and immediate PayPal Sandbox settlement executed.",
            },
          },
        },
      },
      "/api/paypal/pay-later/loans": {
        get: {
          summary: "Query Active and Settled Pay Later Loans",
          operationId: "getAgentPayLaterLoans",
          description:
            "Fetches stored Pay Later credit lines, 6-month repayment schedules, and remaining balances by owner or agent.",
          parameters: [
            {
              name: "ownerAddress",
              in: "query",
              required: false,
              schema: { type: "string" },
            },
            {
              name: "agentId",
              in: "query",
              required: false,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "Array of Pay Later loans with installment details." },
          },
        },
      },
      "/api/paypal/pay-later/repay": {
        post: {
          summary: "Repay Monthly Pay Later Installment",
          operationId: "repayAgentPayLaterInstallment",
          description: "Submits repayment for an individual installment on an active 6-month loan.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["loanId", "installmentNumber"],
                  properties: {
                    loanId: { type: "string", example: "LOAN-PAYLATER-1794267964000-A1B2" },
                    installmentNumber: { type: "integer", minimum: 1, maximum: 6, example: 1 },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Updated loan with marked installment and decremented balance." },
          },
        },
      },
      "/api/crawler/specials": {
        get: {
          summary: "Retrieve Live Crawled Store & Billboard Specials",
          operationId: "getCrawledStoreSpecials",
          description: "Streams verified website discounts, promotional campaigns, and roadside billboard specials across mall stores.",
          responses: {
            "200": { description: "Dictionary of store specials indexed by storeId." },
          },
        },
      },
      "/api/crawler/delivered-cards": {
        get: {
          summary: "List Delivered Promotional Cards for Sovereign Shopping Agents",
          operationId: "getDeliveredAgentCards",
          description: "Returns autonomous promotional cards matched and delivered directly into consumer agents.",
          parameters: [
            {
              name: "agentId",
              in: "query",
              required: false,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "List of delivered special cards." },
          },
        },
      },
      "/api/crawler/trigger": {
        post: {
          summary: "Trigger Store & Billboard Web Crawl Radar",
          operationId: "triggerStoreCrawlerCheck",
          description: "Periodically checks store websites across listed malls and roadside billboards for Black Friday and seasonal promos.",
          responses: {
            "200": { description: "Crawl report with scanned targets and matched specials." },
          },
        },
      },
      "/api/crawler/ingest": {
        post: {
          summary: "Ingest Store Discount URL with Department Links",
          operationId: "ingestStoreDiscountUrl",
          description: "Allows retail merchants to input promotional URLs and department links (Mens, Womens, Kids) to auto-update inventory and deliver cards to agents.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["storeId", "url"],
                  properties: {
                    storeId: { type: "string", example: "mrprice-blueberry" },
                    url: { type: "string", example: "https://www.mrp.com/en_za/black-friday/denim-shorts" },
                    discountPercent: { type: "number", example: 50 },
                    title: { type: "string" },
                    promoRule: { type: "string" },
                    departmentLinks: {
                      type: "object",
                      properties: {
                        mens: { type: "string" },
                        womens: { type: "string" },
                        kids: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Special ingested and delivered to matched shopping agents." },
          },
        },
      },
    },
    components: {
      schemas: {
        A2AMessage: {
          type: "object",
          description: "Atomic message frame exchanged between autonomous agents.",
          required: [
            "id",
            "timestamp",
            "sender",
            "type",
            "price",
            "currency",
            "originalPrice",
            "storeId",
          ],
          properties: {
            id: {
              type: "string",
              description: "Unique message identifier UUID.",
              example: "msg_8a129f-34bc-418b-b892-d34e9c8f01a7",
            },
            timestamp: {
              type: "string",
              format: "date-time",
              description: "ISO-8601 UTC timestamp of message dispatch.",
              example: "2026-10-19T08:45:12.450Z",
            },
            sender: {
              type: "string",
              enum: ["consumer_agent", "merchant_bot"],
              description: "Entity dispatching this packet.",
            },
            type: {
              type: "string",
              enum: ["discovery", "offer", "counter_offer", "accept", "reject"],
              description: "Bargaining state transition operator.",
            },
            price: {
              type: "number",
              format: "float",
              minimum: 0.01,
              description: "Proposed price in South African Rand (ZAR).",
              example: 649.0,
            },
            currency: {
              type: "string",
              enum: ["ZAR"],
              description: "Fixed domestic settlement currency.",
              default: "ZAR",
            },
            originalPrice: {
              type: "number",
              format: "float",
              description: "Base sticker price of the retail item.",
              example: 899.0,
            },
            storeId: {
              type: "string",
              description: "Target South African mall retailer identifier.",
              example: "zara-fashion",
            },
            itemName: {
              type: "string",
              description: "Display name of the catalog product.",
              example: "Oversized Wool Hoodie",
            },
            agentRationale: {
              type: "string",
              description: "Autonomous agent decision engine reasoning.",
              example: "Accepted: Counter-offer falls within optimal 15% discount window.",
            },
          },
        },
        MallOutlet: {
          type: "object",
          required: ["id", "name", "category", "stickerItem", "stickerPriceZAR", "bearing"],
          properties: {
            id: {
              type: "string",
              example: "woolworths-food",
            },
            name: {
              type: "string",
              example: "Woolworths Food",
            },
            category: {
              type: "string",
              example: "Gourmet Groceries",
            },
            stickerItem: {
              type: "string",
              example: "Artisan Sourdough & Cheese Platter",
            },
            stickerPriceZAR: {
              type: "number",
              example: 220.0,
            },
            bearing: {
              type: "number",
              description: "Spatial compass azimuth from mall center in degrees.",
              example: 215,
            },
            botStrategy: {
              type: "string",
              example: "Dynamic volume discount margin (max 30% discount)",
            },
          },
        },
        A2APayPalOrderRequest: {
          type: "object",
          required: ["storeId", "negotiatedPriceZAR", "originalPriceZAR", "sessionId"],
          properties: {
            storeId: {
              type: "string",
              example: "nike-performance",
            },
            negotiatedPriceZAR: {
              type: "number",
              example: 1850.0,
            },
            originalPriceZAR: {
              type: "number",
              example: 2499.0,
            },
            sessionId: {
              type: "string",
              example: "sess_nike_a2a_908",
            },
            sku: {
              type: "string",
              example: "NIKE-AIR-ZOOM-ZAR-01",
            },
            vaultedAgentConsent: {
              type: "boolean",
              default: true,
              description: "Flag verifying machine payment delegation consent.",
            },
          },
        },
        A2APayPalOrderResponse: {
          type: "object",
          required: ["orderId", "status", "convertedUSD", "exchangeRate", "timestamp"],
          properties: {
            orderId: {
              type: "string",
              example: "ORD-SANDBOX-99A8B7C6",
            },
            status: {
              type: "string",
              example: "CREATED",
            },
            convertedUSD: {
              type: "number",
              example: 99.9,
            },
            exchangeRate: {
              type: "number",
              example: 0.054,
            },
            timestamp: {
              type: "string",
              format: "date-time",
            },
          },
        },
        A2AVaultedPaymentResult: {
          type: "object",
          required: ["transactionId", "orderId", "success", "settledAmountUSD", "settledAmountZAR"],
          properties: {
            transactionId: {
              type: "string",
              example: "TX-PAYPAL-M2M-8491032",
            },
            orderId: {
              type: "string",
              example: "ORD-SANDBOX-99A8B7C6",
            },
            success: {
              type: "boolean",
              example: true,
            },
            settledAmountUSD: {
              type: "number",
              example: 99.9,
            },
            settledAmountZAR: {
              type: "number",
              example: 1850.0,
            },
            timestamp: {
              type: "string",
              format: "date-time",
            },
            vaultAuthorizationRef: {
              type: "string",
              example: "VAULT-AUTONOMOUS-TOKEN-771B",
            },
          },
        },
      },
    },
  },
  null,
  2,
);
