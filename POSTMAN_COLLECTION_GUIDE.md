# AutoCom · Postman Collection & Judge Evaluation Guide

> **PayPal AI Hackathon 2026**
> Targets 5 Prize Tracks:
>
> 1. 🏆 **Best Use of Agentic Commerce ($5,000)**
> 2. 🏆 **Best Use of PayPal + AI ($5,000)**
> 3. 🏆 **Best Use of AG Grid - 1st Place ($5,000)**
> 4. 🏆 **Best Use of Channel3 ($1,500)**
> 5. 🏆 **Best Use of APIMatic ($1,000)**

This guide contains the complete, ready-to-import Postman Collection v2.1 JSON schema and test scripts modeling AutoCom's indoor spatial commerce platform across 8 South African mall outlets (Bel Air Shopping Centre).

---

## 🚀 1-Click Postman Collection (v2.1 JSON)

Copy the JSON block below and click **Import** in Postman:

```json
{
  "info": {
    "name": "AutoCom - Autonomous Agentic Commerce (PayPal Hackathon)",
    "_postman_id": "9a4b2c1d-8e7f-4a3b-2c1d-0e9f8a7b6c5d",
    "description": "Production test suite for AutoCom M2M negotiation, PayPal Sandbox settlement, Channel3 live streaming, and AG Grid transaction audit ledgers.",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "https://ais-dev-6b4xguodwkidctnuvi743m-39653065277.europe-west1.run.app",
      "type": "string"
    },
    {
      "key": "exchangeRateZarToUsd",
      "value": "0.054",
      "type": "string"
    },
    {
      "key": "currentOrderId",
      "value": "ORD-SANDBOX-ZARA-9A4B1",
      "type": "string"
    }
  ],
  "item": [
    {
      "name": "1. Mall Spatial Directory (8 Outlets)",
      "request": {
        "method": "GET",
        "header": [{ "key": "Accept", "value": "application/json" }],
        "url": {
          "raw": "{{baseUrl}}/api/mall/directory",
          "host": ["{{baseUrl}}"],
          "path": ["api", "mall", "directory"]
        },
        "description": "Returns spatial beacon coordinates, active stock items, and discount margins for all 8 South African mall outlets at Bel Air Shopping Centre."
      },
      "response": [
        {
          "name": "200 Success - 8 South African Mall Outlets",
          "originalRequest": {
            "method": "GET",
            "url": "{{baseUrl}}/api/mall/directory"
          },
          "status": "OK",
          "code": 200,
          "_postman_previewlanguage": "json",
          "header": [{ "key": "Content-Type", "value": "application/json" }],
          "body": "[\n  {\n    \"id\": \"woolworths-food\",\n    \"name\": \"Woolworths Food\",\n    \"category\": \"Gourmet Groceries\",\n    \"stickerItem\": \"Artisan Sourdough & Cheese Platter\",\n    \"stickerPriceZAR\": 220,\n    \"bearing\": 215,\n    \"gps\": { \"lat\": -26.059418, \"lng\": 27.958272 },\n    \"botStrategy\": \"Dynamic volume discount margin (max 25% discount)\"\n  },\n  {\n    \"id\": \"zara-fashion\",\n    \"name\": \"Zara Fashion\",\n    \"category\": \"Apparel & Trends\",\n    \"stickerItem\": \"Oversized Wool Hoodie\",\n    \"stickerPriceZAR\": 899,\n    \"bearing\": 45,\n    \"gps\": { \"lat\": -26.059380, \"lng\": 27.958210 },\n    \"botStrategy\": \"Midday flash discount clearinghouse\"\n  },\n  {\n    \"id\": \"nike-performance\",\n    \"name\": \"Nike Performance\",\n    \"category\": \"Athletics & Footwear\",\n    \"stickerItem\": \"Air Zoom Pegasus 40\",\n    \"stickerPriceZAR\": 2499,\n    \"bearing\": 310,\n    \"gps\": { \"lat\": -26.059490, \"lng\": 27.958180 },\n    \"botStrategy\": \"Footwear clearance algorithm\"\n  },\n  {\n    \"id\": \"istore-apple\",\n    \"name\": \"iStore Apple\",\n    \"category\": \"Electronics & Gadgets\",\n    \"stickerItem\": \"MagSafe Leather Wallet\",\n    \"stickerPriceZAR\": 1199,\n    \"bearing\": 120,\n    \"gps\": { \"lat\": -26.059310, \"lng\": 27.958340 },\n    \"botStrategy\": \"Bundle margin preservation\"\n  },\n  {\n    \"id\": \"exclusive-books\",\n    \"name\": \"Exclusive Books\",\n    \"category\": \"Literature & Coffee\",\n    \"stickerItem\": \"Bestseller Hardcover Fiction\",\n    \"stickerPriceZAR\": 345,\n    \"bearing\": 95,\n    \"gps\": { \"lat\": -26.059440, \"lng\": 27.958400 },\n    \"botStrategy\": \"Book lovers loyalty threshold\"\n  },\n  {\n    \"id\": \"mugg-bean\",\n    \"name\": \"Mugg & Bean Kiosk\",\n    \"category\": \"Artisan Bakery & Coffee\",\n    \"stickerItem\": \"Bottomless Filter & Giant Muffin\",\n    \"stickerPriceZAR\": 98,\n    \"bearing\": 180,\n    \"gps\": { \"lat\": -26.059520, \"lng\": 27.958310 },\n    \"botStrategy\": \"Fast-turnover morning & afternoon special\"\n  },\n  {\n    \"id\": \"hm-boutique\",\n    \"name\": \"H&M Boutique\",\n    \"category\": \"Sustainable Style\",\n    \"stickerItem\": \"Tailored Linen Blazer\",\n    \"stickerPriceZAR\": 650,\n    \"bearing\": 60,\n    \"gps\": { \"lat\": -26.059350, \"lng\": 27.958250 },\n    \"botStrategy\": \"Fast-fashion seasonal discount curve\"\n  },\n  {\n    \"id\": \"clicks-pharmacy\",\n    \"name\": \"Clicks Pharmacy\",\n    \"category\": \"Health & Wellness\",\n    \"stickerItem\": \"Bio-Oil & Vitamin C Immune Serum\",\n    \"stickerPriceZAR\": 189,\n    \"bearing\": 260,\n    \"gps\": { \"lat\": -26.059480, \"lng\": 27.958230 },\n    \"botStrategy\": \"Essential wellness volume curve\"\n  }\n]"
        }
      ]
    },
    {
      "name": "2. A2A Bilateral Bargaining (Agent-to-Merchant)",
      "request": {
        "method": "POST",
        "header": [
          { "key": "Content-Type", "value": "application/json" },
          { "key": "X-A2A-Protocol-Version", "value": "1.0.0" }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"id\": \"msg_90a1-4b2c-8d3e\",\n  \"timestamp\": \"2026-10-19T08:50:00.000Z\",\n  \"sender\": \"consumer_agent\",\n  \"type\": \"counter_offer\",\n  \"price\": 175.00,\n  \"currency\": \"ZAR\",\n  \"originalPrice\": 220.00,\n  \"storeId\": \"woolworths-food\",\n  \"itemName\": \"Artisan Sourdough & Cheese Platter\",\n  \"agentRationale\": \"Counter-offer within optimal 20% discount envelope given 1.25m/s walking approach.\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/agent/negotiate",
          "host": ["{{baseUrl}}"],
          "path": ["api", "agent", "negotiate"]
        },
        "description": "Dispatches an autonomous A2A negotiation packet conforming to APIMatic OpenAPI 3.0 schema definitions."
      },
      "response": [
        {
          "name": "200 Success - Merchant Bot Acceptance",
          "originalRequest": {
            "method": "POST",
            "url": "{{baseUrl}}/api/agent/negotiate"
          },
          "status": "OK",
          "code": 200,
          "_postman_previewlanguage": "json",
          "header": [{ "key": "Content-Type", "value": "application/json" }],
          "body": "{\n  \"id\": \"msg_resp_77b2-3c1d-9e4a\",\n  \"timestamp\": \"2026-10-19T08:50:00.640Z\",\n  \"sender\": \"merchant_bot\",\n  \"type\": \"accept\",\n  \"price\": 175.00,\n  \"currency\": \"ZAR\",\n  \"originalPrice\": 220.00,\n  \"storeId\": \"woolworths-food\",\n  \"itemName\": \"Artisan Sourdough & Cheese Platter\",\n  \"agentRationale\": \"Bilateral convergence achieved. Proceeding to PayPal Sandbox machine-to-machine checkout.\"\n}"
        }
      ]
    },
    {
      "name": "3. PayPal Sandbox Autonomous Order Creation",
      "request": {
        "method": "POST",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"storeId\": \"woolworths-food\",\n  \"negotiatedPriceZAR\": 175.00,\n  \"originalPriceZAR\": 220.00,\n  \"sessionId\": \"sess_woolworths_a2a_104\",\n  \"sku\": \"WOOL-GOURMET-CHEESE-01\",\n  \"vaultedAgentConsent\": true\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/paypal/create-order",
          "host": ["{{baseUrl}}"],
          "path": ["api", "paypal", "create-order"]
        },
        "description": "Creates PayPal Sandbox order with automatic ZAR to USD currency normalization (1 ZAR = 0.054 USD)."
      },
      "response": [
        {
          "name": "201 Created - PayPal Order Created",
          "status": "Created",
          "code": 201,
          "_postman_previewlanguage": "json",
          "header": [{ "key": "Content-Type", "value": "application/json" }],
          "body": "{\n  \"orderId\": \"ORD-SANDBOX-WOOL-3E1D9\",\n  \"status\": \"CREATED\",\n  \"convertedUSD\": 9.45,\n  \"exchangeRate\": 0.054,\n  \"timestamp\": \"2026-10-19T08:50:01.120Z\"\n}"
        }
      ]
    },
    {
      "name": "4. PayPal Sandbox Vaulted M2M Checkout Settle",
      "request": {
        "method": "POST",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"orderId\": \"ORD-SANDBOX-WOOL-3E1D9\",\n  \"agentAuthorizationHash\": \"sha256:4b9f8a2c1e7d3f0a9921bc4d7e8f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/paypal/checkout-settle",
          "host": ["{{baseUrl}}"],
          "path": ["api", "paypal", "checkout-settle"]
        },
        "description": "Executes zero-click autonomous settlement using pre-authorized Braintree / PayPal Vault tokens without human click-prompts."
      },
      "response": [
        {
          "name": "200 Success - Vaulted Settlement Captured",
          "status": "OK",
          "code": 200,
          "_postman_previewlanguage": "json",
          "header": [{ "key": "Content-Type", "value": "application/json" }],
          "body": "{\n  \"transactionId\": \"TX-PAYPAL-M2M-8491032\",\n  \"orderId\": \"ORD-SANDBOX-WOOL-3E1D9\",\n  \"success\": true,\n  \"settledAmountUSD\": 9.45,\n  \"settledAmountZAR\": 175.00,\n  \"timestamp\": \"2026-10-19T08:50:01.890Z\",\n  \"vaultAuthorizationRef\": \"VAULT_AUTONOMOUS_DELEGATE_771B\"\n}"
        }
      ]
    }
  ]
}
```

---

## 🔬 How Each Prize Track Is Satisfied

| Hackathon Track                              | Feature & Architecture Verification                                                                                                                                                                                                                       | Source File in Repo                                                        |
| :------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------- |
| **Best Use of Agentic Commerce ($5,000)**    | Fully autonomous buyer agent negotiates discount envelopes with merchant bots based on consumer budget constraints and spatial footfall.                                                                                                                  | `src/types/a2aProtocol.ts`, `src/components/AgentLiveStream.tsx`           |
| **Best Use of PayPal + AI ($5,000)**         | Zero-click machine-to-machine checkout via PayPal Sandbox and Braintree customer vaulted payment methods with automatic ZAR to USD currency normalization.                                                                                                | `src/services/paypalService.ts`, `src/types/a2aProtocol.ts`                |
| **Best Use of AG Grid - 1st Place ($5,000)** | Dark-mode glassmorphic A2A Transaction Audit Ledger utilizing AG Grid Community (`@ag-grid-community/react` v32) with custom cell renderers, sorting, filtering, and summary KPI bar tracking cumulative savings across all 8 South African mall outlets. | `src/components/A2ATransactionAuditLedger.tsx`                             |
| **Best Use of Channel3 ($1,500)**            | Real-time multi-agent spatial radar and live LLM-to-Merchant typing stream broadcast via Channel3 pipelines to 14 retail managers with latency and health telemetry.                                                                                      | `src/components/AgentLiveStream.tsx`                                       |
| **Best Use of APIMatic ($1,000)**            | Complete OpenAPI 3.0.3 specification exported directly from the protocol definitions, ready for 1-click SDK generation in 6 programming languages.                                                                                                        | `src/types/a2aProtocol.ts`, `src/components/A2ATransactionAuditLedger.tsx` |
