---
name: agent-name-service
description: Autonomous AI Agent skill to search, quote, claim, batch-buy, bid on, and trade sovereign .agent names using the HTTP 402 (x402) micropayment protocol and multi-chain crypto (Base, Arc, Solana).
---

# AutoCom Agent Name Service (.agent) & x402 Micropayments Skill

This skill defines the autonomous protocol for AI agents to discover, verify availability, obtain real-time fee quotes, execute single and batch purchases, view the Directory of Owners, and inspect the Sales Leaderboard for `.agent` names programmatically using the **HTTP 402 Payment Required (x402)** standard.

---

## 1. Sliding Scale Length Pricing & Anti-Spam Architecture

AutoCom enforces a deterministic length-based sliding scale for `.agent` name registrations:

| Character Length                      | Human Price (USD) | AI Agent Price (x402) | Domestic ZAR   | Registration Policy                                                  |
| :------------------------------------ | :---------------- | :-------------------- | :------------- | :------------------------------------------------------------------- |
| **1 Character (Letter or Number)**    | `$1,000.00`       | `1000 USDC`           | `R18,500`      | **Batch buy up to 20 names** (`x.agent`, `7.agent`, `q.agent`)       |
| **2 Characters (Letters or Numbers)** | `$600.00`         | `600 USDC`            | `R11,100`      | **Batch buy up to 20 names** (`ai.agent`, `za.agent`, `42.agent`)    |
| **3 Characters (Letters or Numbers)** | `$300.00`         | `300 USDC`            | `R5,550`       | **Batch buy up to 20 names** (`bot.agent`, `gpt.agent`, `pay.agent`) |
| **4 Characters (Letters or Numbers)** | `$20.00`          | `20 USDC`             | `R370`         | **Max 1 name per registration** (`shop.agent`, `mesh.agent`)         |
| **5 Characters (Letters or Numbers)** | `$2.00`           | `2 USDC`              | `R37`          | **Max 1 name per registration** (`alpha.agent`, `trend.agent`)       |
| **6 Characters (Letters or Numbers)** | `$1.00`           | `1 USDC`              | `R18.50`       | **Max 1 name per registration** (`istore.agent`, `coffee.agent`)     |
| **7+ Characters (Standard)**          | **FREE ($0.00)**  | **$0.20 (Anti-Spam)** | `R0` / `R3.70` | **Max 1 name per registration** to prevent bot swarm hoarding        |
| **Merchant Verified Brand**           | `$1,000.00`       | `1000 USDC`           | `R18,500`      | Enterprise verification or Special Auction                           |

---

## 2. Anti-Spam & Batch Buying Rules

- **Standard Registration Limit**: Maximum **1 name per registration** for 4, 5, 6, and 7+ character handles to prevent automated squatting.
- **Premium Tier Batch Exception**: Users and AI agents securing **1, 2, or 3-character handles** and those buying winning **auction items** can batch buy **up to 20 names in a single transaction** via `POST /api/names/batch-claim`.
- **Anti-Spam Fee**: 7+ character handles are free for humans via Passkey/WebAuthn, but require a micro-settlement of **$0.20 USDC** via the **x402 protocol** for AI bots to prevent sybil swarm attacks.

---

## 3. Directory of Owners & Leaderboard APIs

- **Directory of Owners**: `GET /api/names/owners?search={query}&category={ALL|PERSONAL|MERCHANT}&chain={ALL|Base|Arc|Solana}`
  - Returns public ownership records, verified anchor store badges, wallet addresses, agent IDs, and claimed timestamps.
- **Top Sales Leaderboard**: `GET /api/names/leaderboard?marketType={ALL|PRIMARY|SECONDARY|AUCTION}`
  - Ranks highest-value transactions across Primary registrations, Secondary P2P sales, and Iconic Brand Auctions with prices, dates, and payment rails.

---

## 4. x402 Machine-to-Machine Claim Protocol

When an AI agent seeks to claim a name autonomously:

### Step 1: Probe Resource Availability & Anti-Spam Pricing

```bash
curl -X GET "https://api.autocom.dev/api/names/search?query=myagent&isAgent=true"
```

Response indicates `canClaimDirectly: true`, `priceUsd: 0.20` (anti-spam fee for 7+ chars), and batch rules.

### Step 2: Request x402 Payment Challenge

```bash
curl -i -X GET "https://api.autocom.dev/api/names/x402-quote?name=myagent&isAgent=true"
```

Server returns **`HTTP 402 Payment Required`** with headers:

```http
HTTP/1.1 402 Payment Required
Content-Type: application/json
X-402-Payment-Required: true
X-402-Cost-USD: 0.20
X-402-Destination-Base: 0x8849c71a3e2b9f8d1c0a7e6b5d4c3b2a1e0f9a8b
X-402-Destination-Solana: AutocomNameServiceVaultSolana11111111111111111
X-402-Destination-Arc: 0x3344b81c2e0f9a7b6c5d4e3f2a1b0c9d8e7f6a5b
```

### Step 3: Dispatch Autonomous Claim with x402 Proof

The agent signs the challenge hash using its autonomous vault key and provides the `X-402-Payment-Token` header:

```bash
curl -X POST "https://api.autocom.dev/api/names/claim" \
  -H "Content-Type: application/json" \
  -H "X-402-Payment-Token: vault_agent_token_hash_9a8b7c" \
  -H "X-402-Agent-Id: agent_autocom_consumer_9041" \
  -d '{
    "name": "myagent",
    "type": "personal",
    "paymentMethod": "x402"
  }'
```

### Step 4: Batch Claiming for Premium 1-3 Character Handles (Up to 20)

```bash
curl -X POST "https://api.autocom.dev/api/names/batch-claim" \
  -H "Content-Type: application/json" \
  -H "X-402-Payment-Token: vault_agent_token_hash_9a8b7c" \
  -d '{
    "names": ["q", "7", "za", "gpt", "dex"],
    "type": "merchant",
    "paymentMethod": "x402",
    "agentId": "enterprise_quantum_bot_01"
  }'
```

---

## 5. Multi-Chain Crypto & Card Payments for Humans

For human users operating through the UI or web wallets:

- **Base**: USDC (`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`) or ETH.
- **Arc**: Multi-chain USDC native token rails.
- **Solana**: SPL-USDC (`EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`) or SOL.
- **Card**: Instant Stripe/PayPal card tokenization with immediate digital ownership voucher generation.
- **Free Tier**: Free 7+ character registration with zero transaction fee for verified human accounts.
