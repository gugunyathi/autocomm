# 🛒 AutoCom | Autonomous Spatial Commerce & Agent-to-Agent (A2A) Retail Engine

> **Next-Generation Indoor Spatial Micro-Location Commerce Platform & Autonomous Machine-to-Machine (A2A) Micro-Deal Settlement Engine**

![TypeScript](https://img.shields.io/badge/TypeScript-5.8-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19.2-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-8.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![AG Grid](https://img.shields.io/badge/AG_Grid-v32_Community-E0234E?style=for-the-badge&logo=ag-grid&logoColor=white)
![PayPal Sandbox](https://img.shields.io/badge/PayPal-Sandbox_Orders_v2-003087?style=for-the-badge&logo=paypal&logoColor=white)
![Channel3](https://img.shields.io/badge/Channel3-WebRTC_Stream-FF4500?style=for-the-badge)
![APIMatic](https://img.shields.io/badge/APIMatic-OpenAPI_3.0-4B0082?style=for-the-badge)
![x402 Protocol](https://img.shields.io/badge/x402-HTTP_402_Agent_Payments-00E5FF?style=for-the-badge)
![Multi--Chain](https://img.shields.io/badge/Crypto-Base_%7C_Arc_%7C_Solana-6366F1?style=for-the-badge)
![Agent Names](https://img.shields.io/badge/.agent-Name_Registry_%26_Auctions-10B981?style=for-the-badge)
![PWA Ready](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)

---

## 🌟 Executive Overview

**AutoCom** is an indoor spatial commerce platform and autonomous machine-to-machine bargaining network deployed across physical retail corridors. Modeled on an 8-outlet ecosystem at **Bel Air Shopping Centre** (North Riding, Randburg, Johannesburg, South Africa), AutoCom empowers consumer AI agents to physically navigate mall concourses, detect merchant BLE beacons, negotiate bilateral dynamic discounts within consumer budget limits, and execute zero-click machine-to-machine settlements via the **PayPal Sandbox** using **Braintree Customer Vaulting**.

AutoCom bridges the physical and agentic commerce worlds by providing:

1. **Real-Time Backend REST API**: Production HTTP handlers for catalog discovery, bilateral bargaining, PayPal Sandbox order generation, and vaulted capture.
2. **AG Grid Enterprise-Grade Audit Ledger**: High-performance dark-mode glassmorphic transaction audit dashboard tracking cumulative savings, discount yields, and settlement statuses.
3. **Channel3 Multi-Agent Streaming Pipeline**: Low-latency canvas telemetry broadcasting 2D radar positions, RSSI beacon signals, and live LLM-to-Merchant chat streams to mall retail managers.
4. **APIMatic OpenAPI 3.0 Contract**: Validated schema and live endpoint (`/api/openapi.json`) for 1-click SDK generation in TypeScript, Python, C#, Java, Go, and PHP.
5. **Spatial Indoor Positioning System (IPS)**: Architectural passage navigation, compass azimuth heading tracking, and proximity-accelerated pacing.

---

## 🏛️ System Architecture

```
                                  [ Consumer Autonomous Agent ]
                                                │
                                    (Spatial Compass & BLE)
                                                ▼
                         ┌──────────────────────────────────────────────┐
                         │      AutoCom Indoor Navigation Mesh          │
                         │    (Bel Air Mall: -26.0594, 27.9582)         │
                         └──────────────────────┬───────────────────────┘
                                                │
                   ┌────────────────────────────┼────────────────────────────┐
                   ▼                            ▼                            ▼
      [ A2A Bilateral Bargaining ]     [ Channel3 Pipeline ]        [ PayPal Sandbox Vault ]
      POST /api/agent/negotiate       Live Telemetry Radar         POST /api/paypal/create-order
      • Margin evaluation             • 60 FPS, 24ms latency       • ZAR -> USD (0.054 Rate)
      • Dynamic price convergence     • 14 Manager Spectators      • M2M Zero-Click Settle
                   │                            │                            │
                   └────────────────────────────┼────────────────────────────┘
                                                ▼
                         ┌──────────────────────────────────────────────┐
                         │       AG Grid Community Audit Ledger         │
                         │    • Client-Side Row Model (v32)             │
                         │    • Sorting, Quick-Filter, Status Badges    │
                         │    • Cumulative Savings KPI Metrics          │
                         └──────────────────────────────────────────────┘
```

---

## 🔌 Production REST API Endpoints

All endpoints are hosted and available via the backend HTTP server with full CORS support (`Access-Control-Allow-Origin: *`):

| Method | Endpoint                      | Description                                   | Request Payload                        | Response                                          |
| :----- | :---------------------------- | :-------------------------------------------- | :------------------------------------- | :------------------------------------------------ |
| `GET`  | `/api/health`                 | Service health telemetry & outlet stats       | None                                   | `{ status: "HEALTHY", outletsActive: 8, ... }`    |
| `GET`  | `/api/mall/directory`         | 8-Outlet Bel Air Mall spatial catalog         | None                                   | Array of `MallOutlet` objects with GPS & bearings |
| `POST` | `/api/agent/negotiate`        | A2A bilateral bargaining packet handler       | `A2AMessage` JSON                      | `A2AMessage` (Accept / Counter-Offer)             |
| `POST` | `/api/paypal/create-order`    | Create PayPal Sandbox order with ZAR->USD     | `{ storeId, negotiatedPriceZAR, ... }` | `{ orderId, convertedUSD, exchangeRate, ... }`    |
| `POST` | `/api/paypal/checkout-settle` | Zero-click vaulted M2M settlement             | `{ orderId, agentAuthorizationHash }`  | `{ transactionId, settledAmountUSD, success }`    |
| `GET`  | `/api/paypal/audit-ledger`    | Real-time in-memory audit ledger records      | None                                   | `{ count: number, orders: [] }`                   |
| `GET`  | `/api/openapi.json`           | Live OpenAPI 3.0.3 specification JSON         | None                                   | Full OpenAPI 3.0.3 Contract for APIMatic          |
| `GET`  | `/api/names/search`           | Real-time .agent handle search & pricing      | `?query=handle`                        | Search result with tier, status, price, auction   |
| `GET`  | `/api/names/directory`        | Full registry directory & auctions            | None                                   | `{ totalRegistered, auctions, secondary, ... }`   |
| `GET`  | `/api/names/x402-quote`       | HTTP 402 payment challenge quote              | `?name=handle`                         | Challenge schema, pay-to addresses & cost         |
| `POST` | `/api/names/claim`            | Claim handle (x402 / Base / Arc / SOL / Card) | Claim payload + x402 headers           | Claimed `AgentNameRecord` or HTTP 402 challenge   |
| `POST` | `/api/names/bid`              | Place auction bid for reserved handle         | `{ name, bidder, bidAmountUSD, ... }`  | Updated auction state & top bidder                |
| `POST` | `/api/names/buy-secondary`    | Instant P2P buyout from secondary market      | `{ listingId, buyer, paymentMethod }`  | Settled secondary trade & transferred ownership   |
| `GET`  | `/api/names/skill.json`       | Agent Skill Manifest for autonomous bots      | None                                   | OpenAPI agent skill specification for x402 bot    |

### Sample cURL Requests

#### 1. Retrieve 8-Outlet Mall Directory

```bash
curl -X GET "https://ais-dev-6b4xguodwkidctnuvi743m-39653065277.europe-west1.run.app/api/mall/directory"
```

#### 2. Dispatch A2A Negotiation Message

```bash
curl -X POST "https://ais-dev-6b4xguodwkidctnuvi743m-39653065277.europe-west1.run.app/api/agent/negotiate" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "msg_90a1b2c3",
    "timestamp": "2026-10-19T08:50:00Z",
    "sender": "consumer_agent",
    "type": "counter_offer",
    "price": 175.00,
    "currency": "ZAR",
    "originalPrice": 220.00,
    "storeId": "woolworths-food",
    "itemName": "Artisan Sourdough & Cheese Platter",
    "agentRationale": "Buyer agent proposes R175 based on midday clearance window."
  }'
```

#### 3. Create PayPal Sandbox Order (Automated Currency Normalization)

```bash
curl -X POST "https://ais-dev-6b4xguodwkidctnuvi743m-39653065277.europe-west1.run.app/api/paypal/create-order" \
  -H "Content-Type: application/json" \
  -d '{
    "storeId": "woolworths-food",
    "negotiatedPriceZAR": 175.00,
    "originalPriceZAR": 220.00,
    "sessionId": "sess_wool_demo_01",
    "sku": "WOOL-CHEESE-01",
    "vaultedAgentConsent": true
  }'
```

#### 4. Execute Vaulted Machine-to-Machine Settlement

```bash
curl -X POST "https://ais-dev-6b4xguodwkidctnuvi743m-39653065277.europe-west1.run.app/api/paypal/checkout-settle" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORD-SANDBOX-WOOL-7A9B1",
    "agentAuthorizationHash": "sha256:4b9f8a2c1e7d3f0a..."
  }'
```

---

## 🏬 Simulated Bel Air Retail Ecosystem (8 Outlets)

AutoCom models 8 real-world retail outlets physically located at **Bel Air Shopping Centre** (North Riding, Randburg, Johannesburg):

| Outlet Name           | Category              | Catalog Item                 | Sticker Price (ZAR) | Bearing | GPS Coordinates         | Bot Strategy                         |
| :-------------------- | :-------------------- | :--------------------------- | :------------------ | :------ | :---------------------- | :----------------------------------- |
| **Woolworths Food**   | Gourmet Groceries     | Artisan Sourdough & Cheese   | `R220`              | `215°`  | `-26.059418, 27.958272` | Volume discount margin (max 25%)     |
| **Zara Fashion**      | Apparel & Trends      | Oversized Wool Hoodie        | `R899`              | `45°`   | `-26.059380, 27.958210` | Midday flash clearance (max 30%)     |
| **Nike Performance**  | Athletics & Footwear  | Air Zoom Pegasus 40          | `R2,499`            | `310°`  | `-26.059490, 27.958180` | Performance runner loyalty (max 28%) |
| **iStore Apple**      | Electronics & Gadgets | MagSafe Leather Wallet       | `R1,199`            | `120°`  | `-26.059310, 27.958340` | Bundle margin preservation (max 18%) |
| **Exclusive Books**   | Literature & Coffee   | Bestseller Hardcover Fiction | `R345`              | `95°`   | `-26.059440, 27.958400` | Reader loyalty special (max 22%)     |
| **Mugg & Bean Kiosk** | Bakery & Coffee       | Bottomless Filter & Muffin   | `R98`               | `180°`  | `-26.059520, 27.958310` | Fast turnover special (max 25%)      |
| **H&M Boutique**      | Sustainable Style     | Tailored Linen Blazer        | `R650`              | `60°`   | `-26.059350, 27.958250` | Sustainable clearance (max 24%)      |
| **Clicks Pharmacy**   | Health & Wellness     | Bio-Oil & Vitamin C Serum    | `R189`              | `260°`  | `-26.059480, 27.958230` | Wellness essentials curve (max 25%)  |

---

## 🏆 Integration Deep-Dives

### 1. PayPal Sandbox & Braintree Vaulting

- **ZAR to USD Currency Normalization**: Domestic South African retail pricing is denominated in South African Rand (`ZAR`). The service translates ZAR to USD with a baseline multiplier of `0.054` (`1 USD ≈ 18.52 ZAR`) for seamless PayPal Sandbox order creation.
- **Autonomous Zero-Click Vault Settlement**: By pairing pre-authorized Braintree customer vault tokens (`VAULT_AUTONOMOUS_DELEGATE_*`) with bilateral price convergence, the consumer's agent captures payments autonomously without prompting for human approval clicks once budget constraints are met.
- **Audit Logging**: Maintains in-memory and REST-queryable transaction ledgers with full order and capture reference IDs.

### 2. AG Grid Enterprise-Grade Transaction Ledger

- **Module Architecture**: Employs `@ag-grid-community/react` and `@ag-grid-community/core` v32 with `ClientSideRowModelModule`.
- **Styling**: Tailored dark-mode glassmorphic design system using `ag-theme-quartz-dark`.
- **Columns**: Timestamp, Outlet Name, Category, Sticker (ZAR), Negotiated (ZAR), Total Savings (ZAR), Status (`BARGAINING`, `OFFER_ACCEPTED`, `PAYMENT_PENDING`, `SETTLED_VIA_PAYPAL`), and PayPal Sandbox Reference ID.
- **Real-Time KPIs**: Top summary metrics tracking Cumulative Agent Savings across all 8 outlets, Settled M2M Captures, and Average Discount Margins.

### 3. Channel3 Multi-Agent WebRTC Telemetry Canvas

- **Synchronized Telemetry Dashboard**: Renders real-time 2D spatial grid radar tracking buyer agent position (`x`, `y`), azimuth heading, movement speed (m/s), and signal strength (`-38 dBm` to `-45 dBm`).
- **Live Stream Metrics**: Streams live canvas room data (`1080p @ 60 FPS / 4,820 kbps`, `24ms` latency) to 14 retail managers from Woolworths, Zara, Nike, and iStore.
- **Live LLM Negotiation Chat Feed**: Interactive terminal showing streaming tokens of agent-to-merchant counter-offers with manual prompt injection capabilities.

### 4. APIMatic OpenAPI 3.0 Contract Generation

- **Contract Schema**: Validated OpenAPI 3.0.3 specification defined in `src/types/a2aProtocol.ts` and exposed live at `GET /api/openapi.json`.
- **SDK Compilation**: Fully compatible with APIMatic's API Transformer to generate production-ready client SDKs in TypeScript, Python, C#, PHP, Java, and Go.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/) + [TypeScript 5.8](https://www.typescriptlang.org/)
- **Build System**: [Vite 8](https://vitejs.dev/) + `@vitejs/plugin-react`
- **Routing & SSR**: [TanStack Start](https://tanstack.com/start) + [TanStack Router](https://tanstack.com/router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Custom Aurora Glassmorphism
- **Grid Engine**: [AG Grid Community v32](https://www.ag-grid.com/) (`@ag-grid-community/react`)
- **Payments**: PayPal Orders API v2 Sandbox + Braintree Vault M2M Tokenization
- **Streaming**: Channel3 WebRTC Multi-Agent Telemetry Pipeline
- **API Standards**: OpenAPI 3.0.3 + APIMatic SDK Schema
- **Mesh Communication**: BitChat BLE Mesh Protocol + Nostr A2A Relays
- **Authentication**: WebAuthn Biometric Passkeys (`@simplewebauthn/browser`)
- **Agent Payments**: x402 Protocol (HTTP 402 Payment Required for autonomous bots)
- **Multi-Chain Crypto**: Base, Arc, and Solana settlement rails + Card tokenization
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🏷️ Agent Name Sales & Registry (.agent handles)

AutoCom features a decentralized, multi-tiered identity registry for personal autonomous agents and merchant bots:

### 1. Sliding Scale Character Pricing & Anti-Spam Architecture

- **1 Character** (e.g. `a.agent`, `7.agent`, `q.agent`): `$1,000` / `1,000 USDC` (Batch up to 20)
- **2 Characters** (e.g. `ai.agent`, `za.agent`, `42.agent`): `$600` / `600 USDC` (Batch up to 20)
- **3 Characters** (e.g. `bot.agent`, `pay.agent`, `gpt.agent`): `$300` / `300 USDC` (Batch up to 20)
- **4 Characters** (e.g. `shop.agent`, `mesh.agent`): `$20` / `20 USDC` (Max 1 per registration)
- **5 Characters** (e.g. `alpha.agent`, `trend.agent`): `$2` / `2 USDC` (Max 1 per registration)
- **6 Characters** (e.g. `istore.agent`, `coffee.agent`): `$1` / `1 USDC` (Max 1 per registration)
- **7+ Characters (Standard)**: **FREE ($0.00)** for Humans / **$0.20 USDC** for AI Agents (Anti-Spam protocol fee, Max 1 per registration)
- **Mainstream Brand Verification Tier**: `$1,000` / `1,000 USDC` baseline or Special Auction

### 2. Registration Limits & Batch Purchasing Rules

- **Anti-Spam Single Registration Limit**: Strictly maximum **1 name per registration** for standard handles (4, 5, 6, and 7+ characters) to prevent bulk squatting attacks.
- **Premium Tier Batch Exception**: Users and AI agents securing **1, 2, or 3-character handles** and those buying winning **auction items** can batch buy **up to 20 names in a single transaction** via `POST /api/names/batch-claim`.

### 3. Directory of Owners & Top Sales Leaderboard

- **Directory of Owners (`/names` -> Directory tab & `GET /api/names/owners`)**: Public verifiable ownership registry with live search, verification badges for merchant anchors, wallet addresses, agent IDs, and claimed timestamps.
- **Top Sales Leaderboard (`/names` -> Leaderboard tab & `GET /api/names/leaderboard`)**: Real-time sales ranking across Primary, Secondary, and Auction markets (with record sales like `$95,000` for `apple.agent` and `$72,000` for `nike.agent`).

### 4. Iconic & Mainstream Brand Auctions

Pre-reserved high-demand handles (`0`, `007`, `1`, `god`, `vip`, `x`, `boss`, `alpha`, `777`) and mainstream trademarks (`nike`, `coke`, `apple`, `zara`, `starbucks`, `tesla`, `gucci`, `amazon`) are protected from squatting and allocated via programmatic English auctions with countdown timers and minimum bid increments.

### 5. Payment Rails & Autonomous x402 Protocol

- **Autonomous AI Agents**: Can discover, quote, and settle handles using the **x402 Protocol** (`HTTP 402 Payment Required` standard with `X-402-Payment-Token` headers and zero-click settlement).
- **Humans**: Choice of multi-chain crypto on **Base**, **Arc**, or **Solana** (USDC/SOL/ETH), or standard Credit/Debit card checkout with simulated cardholder tokenization.
- **Secondary Marketplace**: Built-in peer-to-peer marketplace for secondary handle trading with floor pricing, transfer-of-ownership logs, and instant buy capability.
- **Agent Skill Manifest**: Documented in `skills/agent_name_service/SKILL.md` and live at `/api/names/skill.json` for plug-and-play LLM tool calls.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v20 or higher recommended)
- **npm** (v10 or higher)

### Setup & Run

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/your-username/livespecial.git
   cd livespecial
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Start the Development Server**:

   ```bash
   npm run dev
   ```

   Navigate to `http://localhost:3000`.

4. **Verify TypeScript & Compile**:

   ```bash
   npm run build
   ```

5. **Linting & Code Formatting**:
   ```bash
   npm run lint
   npm run format
   ```

---

## 📮 Postman Collection

A complete, ready-to-import Postman Collection v2.1 file is included in [`POSTMAN_COLLECTION_GUIDE.md`](./POSTMAN_COLLECTION_GUIDE.md). It features pre-configured requests, environment variables, mock payloads, and test validation scripts.

---

## 📄 License

Distributed under the Apache 2.0 License. See `LICENSE` for details.

_Crafted for Next-Gen Autonomous Spatial Commerce · AutoCom · Ribbon Protocol Inc._
