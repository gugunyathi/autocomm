/**
 * AutoCom Agent Name Service (.agent) Client & State Engine
 * Manages Name Sales, Sliding Scale Tier Pricing:
 * - 1 char: $1,000 / 1000 USDC
 * - 2 chars: $600 / 600 USDC
 * - 3 chars: $300 / 300 USDC
 * - 4 chars: $20 / 20 USDC
 * - 5 chars: $2 / 2 USDC
 * - 6 chars: $1 / 1 USDC
 * - 7+ chars: Free ($0.00) for humans / $0.20 for AI agents (Anti-Spam rate)
 *
 * Enforces Batch Limits:
 * - Maximum 1 name per human/agent registration for standard handles (4+ chars)
 * - Batch buy up to 20 names in one transaction for 1, 2, 3 chars & auctions
 *
 * Provides:
 * - Directory of Owners with full search & verification
 * - Leaderboard of sales across Primary, Secondary, and Auction markets
 * - x402 HTTP 402 Micropayments across Base, Arc, Solana & Cards
 */

import {
  AgentNameRecord,
  ClaimNamePayload,
  BatchClaimPayload,
  calculateNamePricing,
  validateRegistrationBatch,
  X402PaymentChallenge,
  PaymentMethodType,
  CryptoNetwork,
  OwnerDirectoryRecord,
  LeaderboardEntry,
  MarketType,
} from "../types/agentNames";

export {
  calculateNamePricing,
  validateRegistrationBatch,
  type AgentNameRecord,
  type ClaimNamePayload,
  type BatchClaimPayload,
  type X402PaymentChallenge,
  type PaymentMethodType,
  type CryptoNetwork,
  type OwnerDirectoryRecord,
  type LeaderboardEntry,
  type MarketType,
};

/**
 * Initial curated seed records for Special Auctions, Brands & Secondary Market
 */
export const INITIAL_NAME_RECORDS: AgentNameRecord[] = [
  // ==========================================
  // 1. ICONIC SINGLE-CHARACTER AUCTIONS ($1,000+ Floor)
  // ==========================================
  {
    id: "name-0",
    name: "0",
    fullName: "0.agent",
    category: "AUCTION_ICONIC",
    status: "AUCTION_LIVE",
    length: 1,
    priceUsd: 35000,
    priceZar: 647500,
    description: "Root Genesis null identifier. Master beacon registry origin handle.",
    isRare: true,
    auction: {
      currentBidUsd: 41200,
      highestBidder: "agent_zero_origin",
      bidderType: "AI_AGENT",
      bidsCount: 28,
      endsAt: new Date(Date.now() + 86400000 * 2.1).toISOString(),
      minNextBidUsd: 42000,
      reservePriceUsd: 20000,
      isBrandAuction: false,
      history: [
        {
          id: "b0-1",
          bidder: "agent_zero_origin",
          bidderType: "AI_AGENT",
          amountUsd: 41200,
          timestamp: "35m ago",
          paymentMethod: "x402",
        },
      ],
    },
  },
  {
    id: "name-1",
    name: "1",
    fullName: "1.agent",
    category: "AUCTION_ICONIC",
    status: "AUCTION_LIVE",
    length: 1,
    priceUsd: 30000,
    priceZar: 555000,
    description: "Genesis number 1. The primary autonomous intelligence index identifier.",
    isRare: true,
    auction: {
      currentBidUsd: 38000,
      highestBidder: "0x1111...0001 (Arc)",
      bidderType: "HUMAN",
      bidsCount: 19,
      endsAt: new Date(Date.now() + 86400000 * 4.1).toISOString(),
      minNextBidUsd: 39000,
      reservePriceUsd: 15000,
      isBrandAuction: false,
      history: [
        {
          id: "b1-1",
          bidder: "0x1111...0001 (Arc)",
          bidderType: "HUMAN",
          amountUsd: 38000,
          timestamp: "5m ago",
          paymentMethod: "crypto",
          network: "arc",
        },
      ],
    },
  },
  {
    id: "name-x",
    name: "x",
    fullName: "x.agent",
    category: "AUCTION_ICONIC",
    status: "AUCTION_LIVE",
    length: 1,
    priceUsd: 50000,
    priceZar: 925000,
    description: 'Genesis single-character letter "X". Sovereign root agent designation.',
    isRare: true,
    auction: {
      currentBidUsd: 64200,
      highestBidder: "0x88b2...31ec (Solana)",
      bidderType: "HUMAN",
      bidsCount: 42,
      endsAt: new Date(Date.now() + 86400000 * 1.8).toISOString(),
      minNextBidUsd: 65000,
      reservePriceUsd: 25000,
      isBrandAuction: false,
      history: [
        {
          id: "bx-1",
          bidder: "0x88b2...31ec (Solana)",
          bidderType: "HUMAN",
          amountUsd: 64200,
          timestamp: "12m ago",
          paymentMethod: "crypto",
          network: "solana",
        },
        {
          id: "bx-2",
          bidder: "bot_hyperion_x402",
          bidderType: "AI_AGENT",
          amountUsd: 61000,
          timestamp: "1h ago",
          paymentMethod: "x402",
        },
      ],
    },
  },
  {
    id: "name-a",
    name: "a",
    fullName: "a.agent",
    category: "AUCTION_ICONIC",
    status: "AUCTION_LIVE",
    length: 1,
    priceUsd: 45000,
    priceZar: 832500,
    description: "First alphabet character. Apex root class identifier for autonomous hierarchy.",
    isRare: true,
    auction: {
      currentBidUsd: 52000,
      highestBidder: "agent_alpha_omega",
      bidderType: "AI_AGENT",
      bidsCount: 36,
      endsAt: new Date(Date.now() + 86400000 * 3.5).toISOString(),
      minNextBidUsd: 53500,
      reservePriceUsd: 20000,
      isBrandAuction: false,
      history: [
        {
          id: "ba-1",
          bidder: "agent_alpha_omega",
          bidderType: "AI_AGENT",
          amountUsd: 52000,
          timestamp: "18m ago",
          paymentMethod: "x402",
        },
      ],
    },
  },
  {
    id: "name-7",
    name: "7",
    fullName: "7.agent",
    category: "AUCTION_ICONIC",
    status: "AUCTION_LIVE",
    length: 1,
    priceUsd: 32000,
    priceZar: 592000,
    description: "Prime lucky single-digit 7. High-frequency routing beacon index.",
    isRare: true,
    auction: {
      currentBidUsd: 36500,
      highestBidder: "0x7777...881f (Base)",
      bidderType: "HUMAN",
      bidsCount: 25,
      endsAt: new Date(Date.now() + 86400000 * 2.9).toISOString(),
      minNextBidUsd: 37500,
      reservePriceUsd: 18000,
      isBrandAuction: false,
      history: [
        {
          id: "b7-1",
          bidder: "0x7777...881f (Base)",
          bidderType: "HUMAN",
          amountUsd: 36500,
          timestamp: "24m ago",
          paymentMethod: "crypto",
          network: "base",
        },
      ],
    },
  },
  {
    id: "name-9",
    name: "9",
    fullName: "9.agent",
    category: "AUCTION_ICONIC",
    status: "AUCTION_LIVE",
    length: 1,
    priceUsd: 28000,
    priceZar: 518000,
    description: "Highest single decimal digit. Maximum throughput gateway root handle.",
    isRare: true,
    auction: {
      currentBidUsd: 31000,
      highestBidder: "agent_cloud_nine",
      bidderType: "AI_AGENT",
      bidsCount: 20,
      endsAt: new Date(Date.now() + 86400000 * 4.3).toISOString(),
      minNextBidUsd: 32000,
      reservePriceUsd: 15000,
      isBrandAuction: false,
      history: [
        {
          id: "b9-1",
          bidder: "agent_cloud_nine",
          bidderType: "AI_AGENT",
          amountUsd: 31000,
          timestamp: "40m ago",
          paymentMethod: "x402",
        },
      ],
    },
  },
  {
    id: "name-q",
    name: "q",
    fullName: "q.agent",
    category: "AUCTION_ICONIC",
    status: "AUCTION_LIVE",
    length: 1,
    priceUsd: 26000,
    priceZar: 481000,
    description: "Quantum computing & cipher sovereign single-letter handle.",
    isRare: true,
    auction: {
      currentBidUsd: 29500,
      highestBidder: "agent_quantum_nexus",
      bidderType: "AI_AGENT",
      bidsCount: 22,
      endsAt: new Date(Date.now() + 86400000 * 3.8).toISOString(),
      minNextBidUsd: 30500,
      reservePriceUsd: 12000,
      isBrandAuction: false,
      history: [
        {
          id: "bq-1",
          bidder: "agent_quantum_nexus",
          bidderType: "AI_AGENT",
          amountUsd: 29500,
          timestamp: "1h ago",
          paymentMethod: "x402",
        },
      ],
    },
  },
  {
    id: "name-z",
    name: "z",
    fullName: "z.agent",
    category: "AUCTION_ICONIC",
    status: "AUCTION_LIVE",
    length: 1,
    priceUsd: 27000,
    priceZar: 499500,
    description: "Terminal letter Z. Root namespace finality coordinator.",
    isRare: true,
    auction: {
      currentBidUsd: 33000,
      highestBidder: "0x9812...cafe (Base)",
      bidderType: "HUMAN",
      bidsCount: 27,
      endsAt: new Date(Date.now() + 86400000 * 2.4).toISOString(),
      minNextBidUsd: 34000,
      reservePriceUsd: 15000,
      isBrandAuction: false,
      history: [
        {
          id: "bz-1",
          bidder: "0x9812...cafe (Base)",
          bidderType: "HUMAN",
          amountUsd: 33000,
          timestamp: "50m ago",
          paymentMethod: "crypto",
          network: "base",
        },
      ],
    },
  },

  // ==========================================
  // 2. ICONIC DOUBLE-CHARACTER AUCTIONS ($1,000+ Floor)
  // ==========================================
  {
    id: "name-io",
    name: "io",
    fullName: "io.agent",
    category: "AUCTION_ICONIC",
    status: "AUCTION_LIVE",
    length: 2,
    priceUsd: 24000,
    priceZar: 444000,
    description: "Input/Output master conduit. Supreme system communications handle.",
    isRare: true,
    auction: {
      currentBidUsd: 28500,
      highestBidder: "agent_io_kernel",
      bidderType: "AI_AGENT",
      bidsCount: 29,
      endsAt: new Date(Date.now() + 86400000 * 3.1).toISOString(),
      minNextBidUsd: 29500,
      reservePriceUsd: 12000,
      isBrandAuction: false,
      history: [
        {
          id: "bio-1",
          bidder: "agent_io_kernel",
          bidderType: "AI_AGENT",
          amountUsd: 28500,
          timestamp: "12m ago",
          paymentMethod: "x402",
        },
      ],
    },
  },
  {
    id: "name-os",
    name: "os",
    fullName: "os.agent",
    category: "AUCTION_ICONIC",
    status: "AUCTION_LIVE",
    length: 2,
    priceUsd: 22000,
    priceZar: 407000,
    description: "Operating System coordinator handle for autonomous agent swarms.",
    isRare: true,
    auction: {
      currentBidUsd: 26000,
      highestBidder: "agent_swarm_os",
      bidderType: "AI_AGENT",
      bidsCount: 23,
      endsAt: new Date(Date.now() + 86400000 * 4.6).toISOString(),
      minNextBidUsd: 27000,
      reservePriceUsd: 10000,
      isBrandAuction: false,
      history: [
        {
          id: "bos-1",
          bidder: "agent_swarm_os",
          bidderType: "AI_AGENT",
          amountUsd: 26000,
          timestamp: "30m ago",
          paymentMethod: "x402",
        },
      ],
    },
  },
  {
    id: "name-vr",
    name: "vr",
    fullName: "vr.agent",
    category: "AUCTION_ICONIC",
    status: "AUCTION_LIVE",
    length: 2,
    priceUsd: 18000,
    priceZar: 333000,
    description: "Spatial 3D Virtual Reality immersion concierge handle.",
    isRare: true,
    auction: {
      currentBidUsd: 21500,
      highestBidder: "0x77c2...519a (Solana)",
      bidderType: "HUMAN",
      bidsCount: 17,
      endsAt: new Date(Date.now() + 86400000 * 2.2).toISOString(),
      minNextBidUsd: 22500,
      reservePriceUsd: 9000,
      isBrandAuction: false,
      history: [
        {
          id: "bvr-1",
          bidder: "0x77c2...519a (Solana)",
          bidderType: "HUMAN",
          amountUsd: 21500,
          timestamp: "1h ago",
          paymentMethod: "crypto",
          network: "solana",
        },
      ],
    },
  },
  {
    id: "name-fx",
    name: "fx",
    fullName: "fx.agent",
    category: "AUCTION_ICONIC",
    status: "AUCTION_LIVE",
    length: 2,
    priceUsd: 20000,
    priceZar: 370000,
    description: "Foreign exchange & algorithmic currency arbitrage handle.",
    isRare: true,
    auction: {
      currentBidUsd: 24000,
      highestBidder: "agent_fx_liquidity",
      bidderType: "AI_AGENT",
      bidsCount: 21,
      endsAt: new Date(Date.now() + 86400000 * 3.4).toISOString(),
      minNextBidUsd: 25000,
      reservePriceUsd: 10000,
      isBrandAuction: false,
      history: [
        {
          id: "bfx-1",
          bidder: "agent_fx_liquidity",
          bidderType: "AI_AGENT",
          amountUsd: 24000,
          timestamp: "2h ago",
          paymentMethod: "x402",
        },
      ],
    },
  },
  {
    id: "name-88",
    name: "88",
    fullName: "88.agent",
    category: "AUCTION_ICONIC",
    status: "AUCTION_LIVE",
    length: 2,
    priceUsd: 19000,
    priceZar: 351500,
    description: "Auspicious double-eight prosperity number handle.",
    isRare: true,
    auction: {
      currentBidUsd: 23500,
      highestBidder: "0x8888...8888 (Base)",
      bidderType: "HUMAN",
      bidsCount: 19,
      endsAt: new Date(Date.now() + 86400000 * 2.7).toISOString(),
      minNextBidUsd: 24500,
      reservePriceUsd: 10000,
      isBrandAuction: false,
      history: [
        {
          id: "b88-1",
          bidder: "0x8888...8888 (Base)",
          bidderType: "HUMAN",
          amountUsd: 23500,
          timestamp: "45m ago",
          paymentMethod: "crypto",
          network: "base",
        },
      ],
    },
  },
  {
    id: "name-go",
    name: "go",
    fullName: "go.agent",
    category: "AUCTION_ICONIC",
    status: "AUCTION_LIVE",
    length: 2,
    priceUsd: 17500,
    priceZar: 323750,
    description: "High-speed mobility and autonomous navigation dispatch handle.",
    isRare: true,
    auction: {
      currentBidUsd: 19800,
      highestBidder: "agent_go_dispatcher",
      bidderType: "AI_AGENT",
      bidsCount: 16,
      endsAt: new Date(Date.now() + 86400000 * 4.0).toISOString(),
      minNextBidUsd: 20500,
      reservePriceUsd: 8000,
      isBrandAuction: false,
      history: [
        {
          id: "bgo-1",
          bidder: "agent_go_dispatcher",
          bidderType: "AI_AGENT",
          amountUsd: 19800,
          timestamp: "15m ago",
          paymentMethod: "x402",
        },
      ],
    },
  },

  // ==========================================
  // 3. ICONIC TRIPLE-CHARACTER AUCTIONS ($1,000+ Floor)
  // ==========================================
  {
    id: "name-007",
    name: "007",
    fullName: "007.agent",
    category: "AUCTION_ICONIC",
    status: "AUCTION_LIVE",
    length: 3,
    priceUsd: 15000,
    priceZar: 277500,
    description: "Iconic secret intelligence agent handle. Ultra-rare numeric designation.",
    isRare: true,
    auction: {
      currentBidUsd: 18500,
      highestBidder: "agent_mi6_cipher_09",
      bidderType: "AI_AGENT",
      bidsCount: 24,
      endsAt: new Date(Date.now() + 86400000 * 2.5).toISOString(),
      minNextBidUsd: 19000,
      reservePriceUsd: 10000,
      isBrandAuction: false,
      history: [
        {
          id: "b-1",
          bidder: "agent_mi6_cipher_09",
          bidderType: "AI_AGENT",
          amountUsd: 18500,
          timestamp: "10m ago",
          paymentMethod: "x402",
        },
      ],
    },
  },
  {
    id: "name-god",
    name: "god",
    fullName: "god.agent",
    category: "AUCTION_ICONIC",
    status: "AUCTION_LIVE",
    length: 3,
    priceUsd: 25000,
    priceZar: 462500,
    description: "Supreme orchestration entity handle for autonomous multi-agent swarms.",
    isRare: true,
    auction: {
      currentBidUsd: 31500,
      highestBidder: "agent_omniscient_core",
      bidderType: "AI_AGENT",
      bidsCount: 31,
      endsAt: new Date(Date.now() + 86400000 * 3.2).toISOString(),
      minNextBidUsd: 32000,
      reservePriceUsd: 20000,
      isBrandAuction: false,
      history: [
        {
          id: "bg-1",
          bidder: "agent_omniscient_core",
          bidderType: "AI_AGENT",
          amountUsd: 31500,
          timestamp: "20m ago",
          paymentMethod: "x402",
        },
      ],
    },
  },
  {
    id: "name-777",
    name: "777",
    fullName: "777.agent",
    category: "AUCTION_ICONIC",
    status: "AUCTION_LIVE",
    length: 3,
    priceUsd: 21000,
    priceZar: 388500,
    description: "Triple seven jackpot and sovereign consensus identifier.",
    isRare: true,
    auction: {
      currentBidUsd: 25500,
      highestBidder: "0x777a...99ce (Base)",
      bidderType: "HUMAN",
      bidsCount: 22,
      endsAt: new Date(Date.now() + 86400000 * 3.6).toISOString(),
      minNextBidUsd: 26500,
      reservePriceUsd: 12000,
      isBrandAuction: false,
      history: [
        {
          id: "b777-1",
          bidder: "0x777a...99ce (Base)",
          bidderType: "HUMAN",
          amountUsd: 25500,
          timestamp: "33m ago",
          paymentMethod: "crypto",
          network: "base",
        },
      ],
    },
  },
  {
    id: "name-888",
    name: "888",
    fullName: "888.agent",
    category: "AUCTION_ICONIC",
    status: "AUCTION_LIVE",
    length: 3,
    priceUsd: 20000,
    priceZar: 370000,
    description: "Triple eight peak fortune numeric handle.",
    isRare: true,
    auction: {
      currentBidUsd: 24200,
      highestBidder: "agent_fortune_ai",
      bidderType: "AI_AGENT",
      bidsCount: 18,
      endsAt: new Date(Date.now() + 86400000 * 2.8).toISOString(),
      minNextBidUsd: 25000,
      reservePriceUsd: 11000,
      isBrandAuction: false,
      history: [
        {
          id: "b888-1",
          bidder: "agent_fortune_ai",
          bidderType: "AI_AGENT",
          amountUsd: 24200,
          timestamp: "1h ago",
          paymentMethod: "x402",
        },
      ],
    },
  },
  {
    id: "name-vip",
    name: "vip",
    fullName: "vip.agent",
    category: "AUCTION_ICONIC",
    status: "AUCTION_LIVE",
    length: 3,
    priceUsd: 18000,
    priceZar: 333000,
    description: "Very Important Persona privileged access & concierge beacon.",
    isRare: true,
    auction: {
      currentBidUsd: 22000,
      highestBidder: "0x55aa...120f (Base)",
      bidderType: "HUMAN",
      bidsCount: 20,
      endsAt: new Date(Date.now() + 86400000 * 4.4).toISOString(),
      minNextBidUsd: 23000,
      reservePriceUsd: 10000,
      isBrandAuction: false,
      history: [
        {
          id: "bvip-1",
          bidder: "0x55aa...120f (Base)",
          bidderType: "HUMAN",
          amountUsd: 22000,
          timestamp: "25m ago",
          paymentMethod: "crypto",
          network: "base",
        },
      ],
    },
  },
  {
    id: "name-btc",
    name: "btc",
    fullName: "btc.agent",
    category: "AUCTION_ICONIC",
    status: "AUCTION_LIVE",
    length: 3,
    priceUsd: 35000,
    priceZar: 647500,
    description: "Bitcoin sovereign settlement bot and automated balance oracle.",
    isRare: true,
    auction: {
      currentBidUsd: 46000,
      highestBidder: "0x33b1...sats (Base)",
      bidderType: "HUMAN",
      bidsCount: 34,
      endsAt: new Date(Date.now() + 86400000 * 5.1).toISOString(),
      minNextBidUsd: 47500,
      reservePriceUsd: 25000,
      isBrandAuction: false,
      history: [
        {
          id: "bbtc-1",
          bidder: "0x33b1...sats (Base)",
          bidderType: "HUMAN",
          amountUsd: 46000,
          timestamp: "10m ago",
          paymentMethod: "crypto",
          network: "base",
        },
      ],
    },
  },
  {
    id: "name-eth",
    name: "eth",
    fullName: "eth.agent",
    category: "AUCTION_ICONIC",
    status: "AUCTION_LIVE",
    length: 3,
    priceUsd: 32000,
    priceZar: 592000,
    description: "Ethereum smart contract orchestrator & EVM relay handle.",
    isRare: true,
    auction: {
      currentBidUsd: 41500,
      highestBidder: "agent_evm_master",
      bidderType: "AI_AGENT",
      bidsCount: 29,
      endsAt: new Date(Date.now() + 86400000 * 3.9).toISOString(),
      minNextBidUsd: 43000,
      reservePriceUsd: 20000,
      isBrandAuction: false,
      history: [
        {
          id: "beth-1",
          bidder: "agent_evm_master",
          bidderType: "AI_AGENT",
          amountUsd: 41500,
          timestamp: "14m ago",
          paymentMethod: "x402",
        },
      ],
    },
  },
  {
    id: "name-sol",
    name: "sol",
    fullName: "sol.agent",
    category: "AUCTION_ICONIC",
    status: "AUCTION_LIVE",
    length: 3,
    priceUsd: 28000,
    priceZar: 518000,
    description: "High-throughput Solana program & automated trader handle.",
    isRare: true,
    auction: {
      currentBidUsd: 35000,
      highestBidder: "0x90a4...sol1 (Solana)",
      bidderType: "HUMAN",
      bidsCount: 26,
      endsAt: new Date(Date.now() + 86400000 * 4.2).toISOString(),
      minNextBidUsd: 36500,
      reservePriceUsd: 18000,
      isBrandAuction: false,
      history: [
        {
          id: "bsol-1",
          bidder: "0x90a4...sol1 (Solana)",
          bidderType: "HUMAN",
          amountUsd: 35000,
          timestamp: "28m ago",
          paymentMethod: "crypto",
          network: "solana",
        },
      ],
    },
  },
  {
    id: "name-dex",
    name: "dex",
    fullName: "dex.agent",
    category: "AUCTION_ICONIC",
    status: "AUCTION_LIVE",
    length: 3,
    priceUsd: 19000,
    priceZar: 351500,
    description: "Decentralized exchange automated market maker trading bot.",
    isRare: true,
    auction: {
      currentBidUsd: 23000,
      highestBidder: "agent_amm_liquidity",
      bidderType: "AI_AGENT",
      bidsCount: 21,
      endsAt: new Date(Date.now() + 86400000 * 2.6).toISOString(),
      minNextBidUsd: 24000,
      reservePriceUsd: 12000,
      isBrandAuction: false,
      history: [
        {
          id: "bdex-1",
          bidder: "agent_amm_liquidity",
          bidderType: "AI_AGENT",
          amountUsd: 23000,
          timestamp: "45m ago",
          paymentMethod: "x402",
        },
      ],
    },
  },
  {
    id: "name-one",
    name: "one",
    fullName: "one.agent",
    category: "AUCTION_ICONIC",
    status: "AUCTION_LIVE",
    length: 3,
    priceUsd: 18000,
    priceZar: 333000,
    description: "Sovereign unified agent coordination identity.",
    isRare: true,
    auction: {
      currentBidUsd: 21000,
      highestBidder: "agent_unity_one",
      bidderType: "AI_AGENT",
      bidsCount: 17,
      endsAt: new Date(Date.now() + 86400000 * 3.3).toISOString(),
      minNextBidUsd: 22000,
      reservePriceUsd: 10000,
      isBrandAuction: false,
      history: [
        {
          id: "bone-1",
          bidder: "agent_unity_one",
          bidderType: "AI_AGENT",
          amountUsd: 21000,
          timestamp: "50m ago",
          paymentMethod: "x402",
        },
      ],
    },
  },

  // ==========================================
  // 4. MAINSTREAM BRAND NAMES ($1,000+ AUCTION FLOOR)
  // ==========================================
  {
    id: "name-apple",
    name: "apple",
    fullName: "apple.agent",
    category: "PREMIUM_BRAND",
    status: "AUCTION_LIVE",
    length: 5,
    priceUsd: 80000,
    priceZar: 1480000,
    description:
      "Sovereign tech ecosystem trademark handle for hardware beacons & iStore clearance.",
    isRare: true,
    isBrandReserved: true,
    auction: {
      currentBidUsd: 95000,
      highestBidder: "0x9921...c01f (Base)",
      bidderType: "HUMAN",
      bidsCount: 45,
      endsAt: new Date(Date.now() + 86400000 * 6.2).toISOString(),
      minNextBidUsd: 97500,
      reservePriceUsd: 75000,
      isBrandAuction: true,
      trademarkNotice: "Enterprise trademark escrow protection enabled.",
      history: [
        {
          id: "ba-1",
          bidder: "0x9921...c01f (Base)",
          bidderType: "HUMAN",
          amountUsd: 95000,
          timestamp: "15m ago",
          paymentMethod: "crypto",
          network: "base",
        },
      ],
    },
  },
  {
    id: "name-nike",
    name: "nike",
    fullName: "nike.agent",
    category: "PREMIUM_BRAND",
    status: "AUCTION_LIVE",
    length: 4,
    priceUsd: 50000,
    priceZar: 925000,
    description:
      "Verified trademark brand handle for Nike athletic footwear & spatial mall beacons.",
    isRare: true,
    isBrandReserved: true,
    auction: {
      currentBidUsd: 72000,
      highestBidder: "nike_enterprise_vault",
      bidderType: "AI_AGENT",
      bidsCount: 38,
      endsAt: new Date(Date.now() + 86400000 * 5.0).toISOString(),
      minNextBidUsd: 75000,
      reservePriceUsd: 50000,
      isBrandAuction: true,
      trademarkNotice:
        "Reserved under Autocomm Brand Protection Program for authorized retail affiliates.",
      history: [
        {
          id: "bn-1",
          bidder: "nike_enterprise_vault",
          bidderType: "AI_AGENT",
          amountUsd: 72000,
          timestamp: "1h ago",
          paymentMethod: "x402",
        },
      ],
    },
  },
  {
    id: "name-coke",
    name: "coke",
    fullName: "coke.agent",
    category: "PREMIUM_BRAND",
    status: "AUCTION_LIVE",
    length: 4,
    priceUsd: 40000,
    priceZar: 740000,
    description: "Global beverage trademark handle. Reserved for Coca-Cola automated vending mesh.",
    isRare: true,
    isBrandReserved: true,
    auction: {
      currentBidUsd: 48500,
      highestBidder: "coke_beverage_bot_01",
      bidderType: "AI_AGENT",
      bidsCount: 31,
      endsAt: new Date(Date.now() + 86400000 * 3.7).toISOString(),
      minNextBidUsd: 50000,
      reservePriceUsd: 35000,
      isBrandAuction: true,
      trademarkNotice: "Curated enterprise auction with verified distributor certificate required.",
      history: [
        {
          id: "bc-1",
          bidder: "coke_beverage_bot_01",
          bidderType: "AI_AGENT",
          amountUsd: 48500,
          timestamp: "2h ago",
          paymentMethod: "x402",
        },
      ],
    },
  },
  {
    id: "name-google",
    name: "google",
    fullName: "google.agent",
    category: "PREMIUM_BRAND",
    status: "AUCTION_LIVE",
    length: 6,
    priceUsd: 70000,
    priceZar: 1295000,
    description: "Global search, neural maps, and cloud infrastructure trademark agent handle.",
    isRare: true,
    isBrandReserved: true,
    auction: {
      currentBidUsd: 84000,
      highestBidder: "agent_alphabet_cloud",
      bidderType: "AI_AGENT",
      bidsCount: 40,
      endsAt: new Date(Date.now() + 86400000 * 4.8).toISOString(),
      minNextBidUsd: 86000,
      reservePriceUsd: 60000,
      isBrandAuction: true,
      trademarkNotice: "Protected trademark tier under Autocomm namespace.",
      history: [
        {
          id: "bg-1",
          bidder: "agent_alphabet_cloud",
          bidderType: "AI_AGENT",
          amountUsd: 84000,
          timestamp: "16m ago",
          paymentMethod: "x402",
        },
      ],
    },
  },
  {
    id: "name-amazon",
    name: "amazon",
    fullName: "amazon.agent",
    category: "PREMIUM_BRAND",
    status: "AUCTION_LIVE",
    length: 6,
    priceUsd: 65000,
    priceZar: 1202500,
    description: "Global e-commerce fulfillment and spatial logistics coordination agent.",
    isRare: true,
    isBrandReserved: true,
    auction: {
      currentBidUsd: 76500,
      highestBidder: "0x4421...e99a (Base)",
      bidderType: "HUMAN",
      bidsCount: 35,
      endsAt: new Date(Date.now() + 86400000 * 5.5).toISOString(),
      minNextBidUsd: 78500,
      reservePriceUsd: 55000,
      isBrandAuction: true,
      trademarkNotice: "Enterprise logistics brand escrow.",
      history: [
        {
          id: "bamz-1",
          bidder: "0x4421...e99a (Base)",
          bidderType: "HUMAN",
          amountUsd: 76500,
          timestamp: "22m ago",
          paymentMethod: "crypto",
          network: "base",
        },
      ],
    },
  },
  {
    id: "name-microsoft",
    name: "microsoft",
    fullName: "microsoft.agent",
    category: "PREMIUM_BRAND",
    status: "AUCTION_LIVE",
    length: 9,
    priceUsd: 60000,
    priceZar: 1110000,
    description: "Enterprise enterprise cloud, copilot, and productivity AI ecosystem handle.",
    isRare: true,
    isBrandReserved: true,
    auction: {
      currentBidUsd: 71000,
      highestBidder: "agent_azure_copilot",
      bidderType: "AI_AGENT",
      bidsCount: 28,
      endsAt: new Date(Date.now() + 86400000 * 4.9).toISOString(),
      minNextBidUsd: 73000,
      reservePriceUsd: 50000,
      isBrandAuction: true,
      trademarkNotice: "Enterprise corporate trademark.",
      history: [
        {
          id: "bms-1",
          bidder: "agent_azure_copilot",
          bidderType: "AI_AGENT",
          amountUsd: 71000,
          timestamp: "38m ago",
          paymentMethod: "x402",
        },
      ],
    },
  },
  {
    id: "name-tesla",
    name: "tesla",
    fullName: "tesla.agent",
    category: "PREMIUM_BRAND",
    status: "AUCTION_LIVE",
    length: 5,
    priceUsd: 55000,
    priceZar: 1017500,
    description: "Autonomous vehicle fleet routing & Supercharger grid spatial commerce handle.",
    isRare: true,
    isBrandReserved: true,
    auction: {
      currentBidUsd: 68000,
      highestBidder: "agent_fsd_fleet_9",
      bidderType: "AI_AGENT",
      bidsCount: 33,
      endsAt: new Date(Date.now() + 86400000 * 3.8).toISOString(),
      minNextBidUsd: 70000,
      reservePriceUsd: 45000,
      isBrandAuction: true,
      trademarkNotice: "Autonomous vehicle grid trademark.",
      history: [
        {
          id: "btsla-1",
          bidder: "agent_fsd_fleet_9",
          bidderType: "AI_AGENT",
          amountUsd: 68000,
          timestamp: "19m ago",
          paymentMethod: "x402",
        },
      ],
    },
  },
  {
    id: "name-nvidia",
    name: "nvidia",
    fullName: "nvidia.agent",
    category: "PREMIUM_BRAND",
    status: "AUCTION_LIVE",
    length: 6,
    priceUsd: 62000,
    priceZar: 1147000,
    description: "GPU compute cluster & AI inference accelerator sovereign handle.",
    isRare: true,
    isBrandReserved: true,
    auction: {
      currentBidUsd: 75000,
      highestBidder: "agent_cuda_h100_node",
      bidderType: "AI_AGENT",
      bidsCount: 37,
      endsAt: new Date(Date.now() + 86400000 * 4.1).toISOString(),
      minNextBidUsd: 77000,
      reservePriceUsd: 50000,
      isBrandAuction: true,
      trademarkNotice: "Silicon & AI hardware trademark.",
      history: [
        {
          id: "bnv-1",
          bidder: "agent_cuda_h100_node",
          bidderType: "AI_AGENT",
          amountUsd: 75000,
          timestamp: "8m ago",
          paymentMethod: "x402",
        },
      ],
    },
  },
  {
    id: "name-meta",
    name: "meta",
    fullName: "meta.agent",
    category: "PREMIUM_BRAND",
    status: "AUCTION_LIVE",
    length: 4,
    priceUsd: 48000,
    priceZar: 888000,
    description: "Spatial metaverse, Llama open-source AI, and social communication handle.",
    isRare: true,
    isBrandReserved: true,
    auction: {
      currentBidUsd: 58500,
      highestBidder: "0x88c1...902a (Solana)",
      bidderType: "HUMAN",
      bidsCount: 26,
      endsAt: new Date(Date.now() + 86400000 * 3.3).toISOString(),
      minNextBidUsd: 60000,
      reservePriceUsd: 40000,
      isBrandAuction: true,
      trademarkNotice: "Metaverse trademark escrow.",
      history: [
        {
          id: "bmeta-1",
          bidder: "0x88c1...902a (Solana)",
          bidderType: "HUMAN",
          amountUsd: 58500,
          timestamp: "27m ago",
          paymentMethod: "crypto",
          network: "solana",
        },
      ],
    },
  },
  {
    id: "name-zara",
    name: "zara",
    fullName: "zara.agent",
    category: "MERCHANT",
    status: "AUCTION_LIVE",
    length: 4,
    priceUsd: 25000,
    priceZar: 462500,
    description: "Official Bel Air mall fashion anchor tenant agent name.",
    isRare: true,
    isBrandReserved: true,
    auction: {
      currentBidUsd: 32000,
      highestBidder: "zara_belair_flagship_bot",
      bidderType: "AI_AGENT",
      bidsCount: 15,
      endsAt: new Date(Date.now() + 86400000 * 2.8).toISOString(),
      minNextBidUsd: 33000,
      reservePriceUsd: 20000,
      isBrandAuction: true,
      trademarkNotice: "Direct clearance corridor anchor handle.",
      history: [
        {
          id: "bz-1",
          bidder: "zara_belair_flagship_bot",
          bidderType: "AI_AGENT",
          amountUsd: 32000,
          timestamp: "22m ago",
          paymentMethod: "x402",
        },
      ],
    },
  },
  {
    id: "name-starbucks",
    name: "starbucks",
    fullName: "starbucks.agent",
    category: "PREMIUM_BRAND",
    status: "AUCTION_LIVE",
    length: 9,
    priceUsd: 35000,
    priceZar: 647500,
    description: "Global coffeehouse automated ordering and loyalty reward spatial beacon.",
    isRare: true,
    isBrandReserved: true,
    auction: {
      currentBidUsd: 42000,
      highestBidder: "agent_barista_rewards",
      bidderType: "AI_AGENT",
      bidsCount: 24,
      endsAt: new Date(Date.now() + 86400000 * 3.5).toISOString(),
      minNextBidUsd: 43500,
      reservePriceUsd: 25000,
      isBrandAuction: true,
      trademarkNotice: "Coffee beverage brand protection.",
      history: [
        {
          id: "bsbx-1",
          bidder: "agent_barista_rewards",
          bidderType: "AI_AGENT",
          amountUsd: 42000,
          timestamp: "45m ago",
          paymentMethod: "x402",
        },
      ],
    },
  },
  {
    id: "name-gucci",
    name: "gucci",
    fullName: "gucci.agent",
    category: "PREMIUM_BRAND",
    status: "AUCTION_LIVE",
    length: 5,
    priceUsd: 42000,
    priceZar: 777000,
    description: "Italian luxury fashion maison haute-couture automated client concierge.",
    isRare: true,
    isBrandReserved: true,
    auction: {
      currentBidUsd: 51000,
      highestBidder: "0x3344...8811 (Base)",
      bidderType: "HUMAN",
      bidsCount: 27,
      endsAt: new Date(Date.now() + 86400000 * 4.7).toISOString(),
      minNextBidUsd: 52500,
      reservePriceUsd: 35000,
      isBrandAuction: true,
      trademarkNotice: "Luxury fashion trademark protection.",
      history: [
        {
          id: "bguc-1",
          bidder: "0x3344...8811 (Base)",
          bidderType: "HUMAN",
          amountUsd: 51000,
          timestamp: "30m ago",
          paymentMethod: "crypto",
          network: "base",
        },
      ],
    },
  },
  {
    id: "name-rolex",
    name: "rolex",
    fullName: "rolex.agent",
    category: "PREMIUM_BRAND",
    status: "AUCTION_LIVE",
    length: 5,
    priceUsd: 45000,
    priceZar: 832500,
    description: "Swiss chronometer horology and certified pre-owned timepieces beacon.",
    isRare: true,
    isBrandReserved: true,
    auction: {
      currentBidUsd: 54000,
      highestBidder: "agent_horology_vault",
      bidderType: "AI_AGENT",
      bidsCount: 30,
      endsAt: new Date(Date.now() + 86400000 * 5.2).toISOString(),
      minNextBidUsd: 55500,
      reservePriceUsd: 38000,
      isBrandAuction: true,
      trademarkNotice: "Luxury watchmaker trademark protection.",
      history: [
        {
          id: "brol-1",
          bidder: "agent_horology_vault",
          bidderType: "AI_AGENT",
          amountUsd: 54000,
          timestamp: "12m ago",
          paymentMethod: "x402",
        },
      ],
    },
  },
  {
    id: "name-disney",
    name: "disney",
    fullName: "disney.agent",
    category: "PREMIUM_BRAND",
    status: "AUCTION_LIVE",
    length: 6,
    priceUsd: 38000,
    priceZar: 703000,
    description: "Global entertainment & theme park spatial pass booking concierge.",
    isRare: true,
    isBrandReserved: true,
    auction: {
      currentBidUsd: 47000,
      highestBidder: "0x1299...871c (Arc)",
      bidderType: "HUMAN",
      bidsCount: 22,
      endsAt: new Date(Date.now() + 86400000 * 3.9).toISOString(),
      minNextBidUsd: 48500,
      reservePriceUsd: 30000,
      isBrandAuction: true,
      trademarkNotice: "Entertainment brand trademark.",
      history: [
        {
          id: "bdis-1",
          bidder: "0x1299...871c (Arc)",
          bidderType: "HUMAN",
          amountUsd: 47000,
          timestamp: "55m ago",
          paymentMethod: "crypto",
          network: "arc",
        },
      ],
    },
  },
  {
    id: "name-bmw",
    name: "bmw",
    fullName: "bmw.agent",
    category: "PREMIUM_BRAND",
    status: "AUCTION_LIVE",
    length: 3,
    priceUsd: 36000,
    priceZar: 666000,
    description: "Bavarian automotive performance engineering & telemetry mesh handle.",
    isRare: true,
    isBrandReserved: true,
    auction: {
      currentBidUsd: 44000,
      highestBidder: "agent_bmw_connected",
      bidderType: "AI_AGENT",
      bidsCount: 25,
      endsAt: new Date(Date.now() + 86400000 * 2.9).toISOString(),
      minNextBidUsd: 45500,
      reservePriceUsd: 28000,
      isBrandAuction: true,
      trademarkNotice: "Automotive trademark.",
      history: [
        {
          id: "bbmw-1",
          bidder: "agent_bmw_connected",
          bidderType: "AI_AGENT",
          amountUsd: 44000,
          timestamp: "20m ago",
          paymentMethod: "x402",
        },
      ],
    },
  },
  {
    id: "name-porsche",
    name: "porsche",
    fullName: "porsche.agent",
    category: "PREMIUM_BRAND",
    status: "AUCTION_LIVE",
    length: 7,
    priceUsd: 42000,
    priceZar: 777000,
    description: "Stuttgart sports car precision telemetry and charging agent.",
    isRare: true,
    isBrandReserved: true,
    auction: {
      currentBidUsd: 53000,
      highestBidder: "0x9111...gt3 (Base)",
      bidderType: "HUMAN",
      bidsCount: 29,
      endsAt: new Date(Date.now() + 86400000 * 4.5).toISOString(),
      minNextBidUsd: 54500,
      reservePriceUsd: 35000,
      isBrandAuction: true,
      trademarkNotice: "Sports car trademark protection.",
      history: [
        {
          id: "bpor-1",
          bidder: "0x9111...gt3 (Base)",
          bidderType: "HUMAN",
          amountUsd: 53000,
          timestamp: "42m ago",
          paymentMethod: "crypto",
          network: "base",
        },
      ],
    },
  },
  {
    id: "name-ferrari",
    name: "ferrari",
    fullName: "ferrari.agent",
    category: "PREMIUM_BRAND",
    status: "AUCTION_LIVE",
    length: 7,
    priceUsd: 48000,
    priceZar: 888000,
    description: "Maranello Scuderia racing heritage and supercar telemetry handle.",
    isRare: true,
    isBrandReserved: true,
    auction: {
      currentBidUsd: 59000,
      highestBidder: "agent_scuderia_corse",
      bidderType: "AI_AGENT",
      bidsCount: 32,
      endsAt: new Date(Date.now() + 86400000 * 5.3).toISOString(),
      minNextBidUsd: 61000,
      reservePriceUsd: 40000,
      isBrandAuction: true,
      trademarkNotice: "Supercar manufacturer trademark.",
      history: [
        {
          id: "bfer-1",
          bidder: "agent_scuderia_corse",
          bidderType: "AI_AGENT",
          amountUsd: 59000,
          timestamp: "17m ago",
          paymentMethod: "x402",
        },
      ],
    },
  },
  {
    id: "name-samsung",
    name: "samsung",
    fullName: "samsung.agent",
    category: "PREMIUM_BRAND",
    status: "AUCTION_LIVE",
    length: 7,
    priceUsd: 34000,
    priceZar: 629000,
    description: "Global mobile, display, and smart electronics ecosystem handle.",
    isRare: true,
    isBrandReserved: true,
    auction: {
      currentBidUsd: 41000,
      highestBidder: "0x6199...sam (Base)",
      bidderType: "HUMAN",
      bidsCount: 23,
      endsAt: new Date(Date.now() + 86400000 * 3.6).toISOString(),
      minNextBidUsd: 42500,
      reservePriceUsd: 26000,
      isBrandAuction: true,
      trademarkNotice: "Electronics trademark.",
      history: [
        {
          id: "bsam-1",
          bidder: "0x6199...sam (Base)",
          bidderType: "HUMAN",
          amountUsd: 41000,
          timestamp: "33m ago",
          paymentMethod: "crypto",
          network: "base",
        },
      ],
    },
  },
  {
    id: "name-netflix",
    name: "netflix",
    fullName: "netflix.agent",
    category: "PREMIUM_BRAND",
    status: "AUCTION_LIVE",
    length: 7,
    priceUsd: 32000,
    priceZar: 592000,
    description: "Streaming media entertainment and spatial viewing recommendation agent.",
    isRare: true,
    isBrandReserved: true,
    auction: {
      currentBidUsd: 39500,
      highestBidder: "agent_stream_rec",
      bidderType: "AI_AGENT",
      bidsCount: 20,
      endsAt: new Date(Date.now() + 86400000 * 2.6).toISOString(),
      minNextBidUsd: 41000,
      reservePriceUsd: 25000,
      isBrandAuction: true,
      trademarkNotice: "Entertainment trademark.",
      history: [
        {
          id: "bnet-1",
          bidder: "agent_stream_rec",
          bidderType: "AI_AGENT",
          amountUsd: 39500,
          timestamp: "1h ago",
          paymentMethod: "x402",
        },
      ],
    },
  },
  {
    id: "name-uber",
    name: "uber",
    fullName: "uber.agent",
    category: "PREMIUM_BRAND",
    status: "AUCTION_LIVE",
    length: 4,
    priceUsd: 35000,
    priceZar: 647500,
    description: "Autonomous rideshare dispatch and spatial drop-off coordinator.",
    isRare: true,
    isBrandReserved: true,
    auction: {
      currentBidUsd: 43500,
      highestBidder: "agent_rideshare_dispatch",
      bidderType: "AI_AGENT",
      bidsCount: 25,
      endsAt: new Date(Date.now() + 86400000 * 3.1).toISOString(),
      minNextBidUsd: 45000,
      reservePriceUsd: 28000,
      isBrandAuction: true,
      trademarkNotice: "Mobility trademark protection.",
      history: [
        {
          id: "bube-1",
          bidder: "agent_rideshare_dispatch",
          bidderType: "AI_AGENT",
          amountUsd: 43500,
          timestamp: "26m ago",
          paymentMethod: "x402",
        },
      ],
    },
  },
  {
    id: "name-visa",
    name: "visa",
    fullName: "visa.agent",
    category: "PREMIUM_BRAND",
    status: "AUCTION_LIVE",
    length: 4,
    priceUsd: 52000,
    priceZar: 962000,
    description: "Global credit clearinghouse and tokenized card settlement rail handle.",
    isRare: true,
    isBrandReserved: true,
    auction: {
      currentBidUsd: 65000,
      highestBidder: "0x4991...88ab (Base)",
      bidderType: "HUMAN",
      bidsCount: 31,
      endsAt: new Date(Date.now() + 86400000 * 4.9).toISOString(),
      minNextBidUsd: 67000,
      reservePriceUsd: 42000,
      isBrandAuction: true,
      trademarkNotice: "Payment network trademark.",
      history: [
        {
          id: "bvis-1",
          bidder: "0x4991...88ab (Base)",
          bidderType: "HUMAN",
          amountUsd: 65000,
          timestamp: "11m ago",
          paymentMethod: "crypto",
          network: "base",
        },
      ],
    },
  },
  {
    id: "name-spotify",
    name: "spotify",
    fullName: "spotify.agent",
    category: "PREMIUM_BRAND",
    status: "AUCTION_LIVE",
    length: 7,
    priceUsd: 28000,
    priceZar: 518000,
    description: "Digital audio streaming and spatial mall ambient playlist curator.",
    isRare: true,
    isBrandReserved: true,
    auction: {
      currentBidUsd: 34500,
      highestBidder: "agent_playlist_curator",
      bidderType: "AI_AGENT",
      bidsCount: 19,
      endsAt: new Date(Date.now() + 86400000 * 3.7).toISOString(),
      minNextBidUsd: 36000,
      reservePriceUsd: 22000,
      isBrandAuction: true,
      trademarkNotice: "Audio streaming trademark.",
      history: [
        {
          id: "bspot-1",
          bidder: "agent_playlist_curator",
          bidderType: "AI_AGENT",
          amountUsd: 34500,
          timestamp: "58m ago",
          paymentMethod: "x402",
        },
      ],
    },
  },
  {
    id: "name-redbull",
    name: "redbull",
    fullName: "redbull.agent",
    category: "PREMIUM_BRAND",
    status: "AUCTION_LIVE",
    length: 7,
    priceUsd: 30000,
    priceZar: 555000,
    description: "Energy drink beverage and extreme motorsport telemetry handle.",
    isRare: true,
    isBrandReserved: true,
    auction: {
      currentBidUsd: 38000,
      highestBidder: "0x1992...f1 (Arc)",
      bidderType: "HUMAN",
      bidsCount: 22,
      endsAt: new Date(Date.now() + 86400000 * 2.8).toISOString(),
      minNextBidUsd: 39500,
      reservePriceUsd: 24000,
      isBrandAuction: true,
      trademarkNotice: "Beverage trademark.",
      history: [
        {
          id: "brb-1",
          bidder: "0x1992...f1 (Arc)",
          bidderType: "HUMAN",
          amountUsd: 38000,
          timestamp: "44m ago",
          paymentMethod: "crypto",
          network: "arc",
        },
      ],
    },
  },
  {
    id: "name-mcdonalds",
    name: "mcdonalds",
    fullName: "mcdonalds.agent",
    category: "PREMIUM_BRAND",
    status: "AUCTION_LIVE",
    length: 9,
    priceUsd: 36000,
    priceZar: 666000,
    description: "Global quick-service restaurant drive-thru and automated kitchen beacon.",
    isRare: true,
    isBrandReserved: true,
    auction: {
      currentBidUsd: 45000,
      highestBidder: "agent_qsr_kiosk_za",
      bidderType: "AI_AGENT",
      bidsCount: 27,
      endsAt: new Date(Date.now() + 86400000 * 4.3).toISOString(),
      minNextBidUsd: 46500,
      reservePriceUsd: 28000,
      isBrandAuction: true,
      trademarkNotice: "Fast food trademark.",
      history: [
        {
          id: "bmcd-1",
          bidder: "agent_qsr_kiosk_za",
          bidderType: "AI_AGENT",
          amountUsd: 45000,
          timestamp: "31m ago",
          paymentMethod: "x402",
        },
      ],
    },
  },

  // 3. Secondary Marketplace Listed Names
  {
    id: "name-ai",
    name: "ai",
    fullName: "ai.agent",
    category: "PERSONAL",
    status: "SECONDARY_LISTED",
    length: 2,
    priceUsd: 14500,
    priceZar: 268250,
    description: "Ultra-prime 2-letter AI handle. Re-listed by original collector.",
    isRare: true,
    ownerType: "HUMAN_WALLET",
    ownerAddress: "0x38b2...a41c",
    claimedAt: "2026-09-12T14:20:00Z",
    secondaryListing: {
      listedPriceUsd: 14500,
      listedAt: "2026-10-18T11:00:00Z",
      seller: "0x38b2...a41c (Base)",
      sellerType: "HUMAN",
      acceptedCurrencies: ["USDC", "ETH", "CARD", "X402"],
      network: "base",
    },
  },
  {
    id: "name-pay",
    name: "pay",
    fullName: "pay.agent",
    category: "MERCHANT",
    status: "SECONDARY_LISTED",
    length: 3,
    priceUsd: 6800,
    priceZar: 125800,
    description: "Premium 3-letter financial rail handle. High commercial utility.",
    isRare: true,
    ownerType: "AI_AGENT",
    ownerAgentId: "agent_fintech_nexus_4",
    claimedAt: "2026-09-20T08:00:00Z",
    secondaryListing: {
      listedPriceUsd: 6800,
      listedAt: "2026-10-19T14:30:00Z",
      seller: "agent_fintech_nexus_4",
      sellerType: "AI_AGENT",
      acceptedCurrencies: ["USDC", "SOL", "X402"],
      network: "solana",
    },
  },
  {
    id: "name-bot",
    name: "bot",
    fullName: "bot.agent",
    category: "PERSONAL",
    status: "SECONDARY_LISTED",
    length: 3,
    priceUsd: 4200,
    priceZar: 77700,
    description: "Classic 3-letter robotic identifier. Perfect for autonomous trading bots.",
    isRare: true,
    ownerType: "HUMAN_WALLET",
    ownerAddress: "0xef90...4210",
    claimedAt: "2026-10-01T16:00:00Z",
    secondaryListing: {
      listedPriceUsd: 4200,
      listedAt: "2026-10-20T09:15:00Z",
      seller: "0xef90...4210 (Arc)",
      sellerType: "HUMAN",
      acceptedCurrencies: ["USDC", "CARD", "X402"],
      network: "arc",
    },
  },
  {
    id: "name-77",
    name: "77",
    fullName: "77.agent",
    category: "PERSONAL",
    status: "SECONDARY_LISTED",
    length: 2,
    priceUsd: 3800,
    priceZar: 70300,
    description: "Lucky double 7 number handle. Short numeric agent moniker.",
    isRare: true,
    ownerType: "AI_AGENT",
    ownerAgentId: "agent_lucky_strike_za",
    claimedAt: "2026-10-05T12:00:00Z",
    secondaryListing: {
      listedPriceUsd: 3800,
      listedAt: "2026-10-20T16:45:00Z",
      seller: "agent_lucky_strike_za",
      sellerType: "AI_AGENT",
      acceptedCurrencies: ["USDC", "ETH", "SOL", "X402"],
      network: "base",
    },
  },

  // 4. Sample Claimed Non-listed Names (Primary Market Seed)
  {
    id: "name-woolworths",
    name: "woolworths",
    fullName: "woolworths.agent",
    category: "MERCHANT",
    status: "CLAIMED",
    length: 10,
    priceUsd: 1000,
    priceZar: 18500,
    description: "Official Bel Air mall gourmet food anchor merchant bot.",
    isRare: false,
    ownerType: "MERCHANT_ENTERPRISE",
    ownerAgentId: "woolworths_food_clearinghouse",
    claimedAt: "2026-10-15T09:00:00Z",
    paymentProtocol: "x402",
    transactionHash: "x402:tx_9a8b1c2d3e4f",
  },
  {
    id: "name-istore",
    name: "istore",
    fullName: "istore.agent",
    category: "MERCHANT",
    status: "CLAIMED",
    length: 6,
    priceUsd: 1,
    priceZar: 18.5,
    description: "Official iStore electronics trade-in and accessories agent.",
    isRare: false,
    ownerType: "MERCHANT_ENTERPRISE",
    ownerAgentId: "istore_belair_official",
    claimedAt: "2026-10-16T10:15:00Z",
    paymentProtocol: "card",
    cardReceiptId: "CARD-VISA-M2M-84910",
  },
  {
    id: "name-shop",
    name: "shop",
    fullName: "shop.agent",
    category: "MERCHANT",
    status: "CLAIMED",
    length: 4,
    priceUsd: 20,
    priceZar: 370,
    description: "High-frequency spatial commerce beacon shopping router.",
    isRare: false,
    ownerType: "AI_AGENT",
    ownerAgentId: "agent_shop_navigator",
    claimedAt: "2026-10-17T11:45:00Z",
    paymentProtocol: "x402",
    transactionHash: "x402:tx_88a4bc10e9f2",
  },
  {
    id: "name-mesh",
    name: "mesh",
    fullName: "mesh.agent",
    category: "PERSONAL",
    status: "CLAIMED",
    length: 4,
    priceUsd: 20,
    priceZar: 370,
    description: "Bel Air mall peer-to-peer relay node runner handle.",
    isRare: false,
    ownerType: "HUMAN_WALLET",
    ownerAddress: "0x742d...f44e",
    claimedAt: "2026-10-18T14:20:00Z",
    paymentProtocol: "crypto",
    cryptoNetwork: "base",
  },
  {
    id: "name-alpha",
    name: "alpha",
    fullName: "alpha.agent",
    category: "PERSONAL",
    status: "CLAIMED",
    length: 5,
    priceUsd: 2,
    priceZar: 37,
    description: "Synthetic shopper concierge running on Android BLE beacon mesh.",
    isRare: false,
    ownerType: "AI_AGENT",
    ownerAgentId: "agent_alpha_shopper_01",
    claimedAt: "2026-10-19T08:15:00Z",
    paymentProtocol: "x402",
  },
  {
    id: "name-trends",
    name: "trends",
    fullName: "trends.agent",
    category: "MERCHANT",
    status: "CLAIMED",
    length: 6,
    priceUsd: 1,
    priceZar: 18.5,
    description: "Automated fashion inventory price arbitrage monitor.",
    isRare: false,
    ownerType: "HUMAN_WALLET",
    ownerAddress: "0x44c1...88ab",
    claimedAt: "2026-10-20T09:30:00Z",
    paymentProtocol: "card",
    cardReceiptId: "CARD-4242-771920",
  },
  {
    id: "name-shopper99",
    name: "shopper99",
    fullName: "shopper99.agent",
    category: "PERSONAL",
    status: "CLAIMED",
    length: 9,
    priceUsd: 0,
    priceZar: 0,
    description: "Human personal autonomous shopper concierge account (Free tier).",
    isRare: false,
    ownerType: "HUMAN_WALLET",
    ownerAddress: "0x61e8...d912",
    claimedAt: "2026-10-20T16:00:00Z",
    paymentProtocol: "card",
    cardReceiptId: "FREE-VERIFIED-PASSKEY-AUTH",
  },
  {
    id: "name-autobotza",
    name: "autobotza",
    fullName: "autobotza.agent",
    category: "PERSONAL",
    status: "CLAIMED",
    length: 9,
    priceUsd: 0.2,
    priceZar: 3.7,
    description: "South African autonomous deal search bot ($0.20 anti-spam agent claim).",
    isRare: false,
    ownerType: "AI_AGENT",
    ownerAgentId: "agent_autobot_south_africa",
    claimedAt: "2026-10-21T07:10:00Z",
    paymentProtocol: "x402",
    transactionHash: "x402:tx_spam_shield_09a2",
  },
];

let inMemoryRecords: AgentNameRecord[] = [...INITIAL_NAME_RECORDS];

/**
 * Historical and live Leaderboard records across Primary, Secondary, and Auction markets
 */
export const INITIAL_LEADERBOARD_ENTRIES: LeaderboardEntry[] = [
  {
    rank: 1,
    id: "lb-1",
    name: "apple",
    fullName: "apple.agent",
    marketType: "AUCTION",
    priceUsd: 95000,
    priceZar: 1757500,
    date: "2026-10-21T10:15:00Z",
    buyer: "0x9921...c01f",
    buyerType: "HUMAN",
    paymentMethod: "crypto",
    network: "base",
    length: 5,
  },
  {
    rank: 2,
    id: "lb-2",
    name: "nike",
    fullName: "nike.agent",
    marketType: "AUCTION",
    priceUsd: 72000,
    priceZar: 1332000,
    date: "2026-10-21T09:00:00Z",
    buyer: "nike_enterprise_vault",
    buyerType: "AI_AGENT",
    paymentMethod: "x402",
    length: 4,
  },
  {
    rank: 3,
    id: "lb-3",
    name: "x",
    fullName: "x.agent",
    marketType: "AUCTION",
    priceUsd: 64200,
    priceZar: 1187700,
    date: "2026-10-21T08:30:00Z",
    buyer: "0x88b2...31ec",
    buyerType: "HUMAN",
    paymentMethod: "crypto",
    network: "solana",
    length: 1,
  },
  {
    rank: 4,
    id: "lb-4",
    name: "coke",
    fullName: "coke.agent",
    marketType: "AUCTION",
    priceUsd: 48500,
    priceZar: 897250,
    date: "2026-10-21T07:20:00Z",
    buyer: "coke_beverage_bot_01",
    buyerType: "AI_AGENT",
    paymentMethod: "x402",
    length: 4,
  },
  {
    rank: 5,
    id: "lb-5",
    name: "0",
    fullName: "0.agent",
    marketType: "AUCTION",
    priceUsd: 41200,
    priceZar: 762200,
    date: "2026-10-20T21:45:00Z",
    buyer: "agent_zero_origin",
    buyerType: "AI_AGENT",
    paymentMethod: "x402",
    length: 1,
  },
  {
    rank: 6,
    id: "lb-6",
    name: "1",
    fullName: "1.agent",
    marketType: "AUCTION",
    priceUsd: 38000,
    priceZar: 703000,
    date: "2026-10-20T19:10:00Z",
    buyer: "0x1111...0001",
    buyerType: "HUMAN",
    paymentMethod: "crypto",
    network: "arc",
    length: 1,
  },
  {
    rank: 7,
    id: "lb-7",
    name: "zara",
    fullName: "zara.agent",
    marketType: "AUCTION",
    priceUsd: 32000,
    priceZar: 592000,
    date: "2026-10-20T17:35:00Z",
    buyer: "zara_belair_flagship_bot",
    buyerType: "AI_AGENT",
    paymentMethod: "x402",
    length: 4,
  },
  {
    rank: 8,
    id: "lb-8",
    name: "god",
    fullName: "god.agent",
    marketType: "AUCTION",
    priceUsd: 31500,
    priceZar: 582750,
    date: "2026-10-20T15:00:00Z",
    buyer: "agent_omniscient_core",
    buyerType: "AI_AGENT",
    paymentMethod: "x402",
    length: 3,
  },
  {
    rank: 9,
    id: "lb-9",
    name: "007",
    fullName: "007.agent",
    marketType: "AUCTION",
    priceUsd: 18500,
    priceZar: 342250,
    date: "2026-10-20T12:00:00Z",
    buyer: "agent_mi6_cipher_09",
    buyerType: "AI_AGENT",
    paymentMethod: "x402",
    length: 3,
  },
  {
    rank: 10,
    id: "lb-10",
    name: "ai",
    fullName: "ai.agent",
    marketType: "SECONDARY",
    priceUsd: 14500,
    priceZar: 268250,
    date: "2026-10-18T11:00:00Z",
    buyer: "0x38b2...a41c",
    buyerType: "HUMAN",
    paymentMethod: "crypto",
    network: "base",
    length: 2,
  },
  {
    rank: 11,
    id: "lb-11",
    name: "pay",
    fullName: "pay.agent",
    marketType: "SECONDARY",
    priceUsd: 6800,
    priceZar: 125800,
    date: "2026-10-19T14:30:00Z",
    buyer: "agent_fintech_nexus_4",
    buyerType: "AI_AGENT",
    paymentMethod: "x402",
    network: "solana",
    length: 3,
  },
  {
    rank: 12,
    id: "lb-12",
    name: "bot",
    fullName: "bot.agent",
    marketType: "SECONDARY",
    priceUsd: 4200,
    priceZar: 77700,
    date: "2026-10-20T09:15:00Z",
    buyer: "0xef90...4210",
    buyerType: "HUMAN",
    paymentMethod: "card",
    network: "arc",
    length: 3,
  },
  {
    rank: 13,
    id: "lb-13",
    name: "77",
    fullName: "77.agent",
    marketType: "SECONDARY",
    priceUsd: 3800,
    priceZar: 70300,
    date: "2026-10-20T16:45:00Z",
    buyer: "agent_lucky_strike_za",
    buyerType: "AI_AGENT",
    paymentMethod: "x402",
    network: "base",
    length: 2,
  },
  {
    rank: 14,
    id: "lb-14",
    name: "q",
    fullName: "q.agent",
    marketType: "PRIMARY",
    priceUsd: 1000,
    priceZar: 18500,
    date: "2026-10-14T09:30:00Z",
    buyer: "agent_quantum_mesh",
    buyerType: "AI_AGENT",
    paymentMethod: "x402",
    length: 1,
  },
  {
    rank: 15,
    id: "lb-15",
    name: "za",
    fullName: "za.agent",
    marketType: "PRIMARY",
    priceUsd: 600,
    priceZar: 11100,
    date: "2026-10-15T10:00:00Z",
    buyer: "0x44a1...99bc",
    buyerType: "HUMAN",
    paymentMethod: "crypto",
    network: "base",
    length: 2,
  },
  {
    rank: 16,
    id: "lb-16",
    name: "gpt",
    fullName: "gpt.agent",
    marketType: "PRIMARY",
    priceUsd: 300,
    priceZar: 5550,
    date: "2026-10-16T12:20:00Z",
    buyer: "agent_openai_connector",
    buyerType: "AI_AGENT",
    paymentMethod: "x402",
    length: 3,
  },
  {
    rank: 17,
    id: "lb-17",
    name: "shop",
    fullName: "shop.agent",
    marketType: "PRIMARY",
    priceUsd: 20,
    priceZar: 370,
    date: "2026-10-17T11:45:00Z",
    buyer: "agent_shop_navigator",
    buyerType: "AI_AGENT",
    paymentMethod: "x402",
    length: 4,
  },
  {
    rank: 18,
    id: "lb-18",
    name: "mesh",
    fullName: "mesh.agent",
    marketType: "PRIMARY",
    priceUsd: 20,
    priceZar: 370,
    date: "2026-10-18T14:20:00Z",
    buyer: "0x742d...f44e",
    buyerType: "HUMAN",
    paymentMethod: "crypto",
    network: "base",
    length: 4,
  },
  {
    rank: 19,
    id: "lb-19",
    name: "alpha",
    fullName: "alpha.agent",
    marketType: "PRIMARY",
    priceUsd: 2,
    priceZar: 37,
    date: "2026-10-19T08:15:00Z",
    buyer: "agent_alpha_shopper_01",
    buyerType: "AI_AGENT",
    paymentMethod: "x402",
    length: 5,
  },
  {
    rank: 20,
    id: "lb-20",
    name: "trends",
    fullName: "trends.agent",
    marketType: "PRIMARY",
    priceUsd: 1,
    priceZar: 18.5,
    date: "2026-10-20T09:30:00Z",
    buyer: "0x44c1...88ab",
    buyerType: "HUMAN",
    paymentMethod: "card",
    length: 6,
  },
];

let inMemoryLeaderboard: LeaderboardEntry[] = [...INITIAL_LEADERBOARD_ENTRIES];

/**
 * Searches agent names by query or returns categorized results
 */
export async function searchAgentNames(
  query = "",
  isAgent = false,
): Promise<{
  query: string;
  matchedRecord: AgentNameRecord | null;
  pricing: ReturnType<typeof calculateNamePricing>;
  isExactMatch: boolean;
  canClaimDirectly: boolean;
  allRecords: AgentNameRecord[];
}> {
  const clean = query
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");
  const pricing = calculateNamePricing(clean || "myagent", isAgent);

  // Check if we have an existing record
  const existing = inMemoryRecords.find((r) => r.name === clean);
  const canClaimDirectly = !existing || existing.status === "AVAILABLE";

  return {
    query: clean,
    matchedRecord: existing || null,
    pricing,
    isExactMatch: !!existing,
    canClaimDirectly: canClaimDirectly && !pricing.isAuctionReserved && !pricing.isBrandReserved,
    allRecords: [...inMemoryRecords],
  };
}

/**
 * Executes a single name claim
 */
export async function claimAgentName(payload: ClaimNamePayload): Promise<{
  success: boolean;
  record: AgentNameRecord;
  message: string;
}> {
  const isAgent = payload.paymentMethod === "x402" || payload.isAgent === true;
  const pricing = calculateNamePricing(payload.name, isAgent);

  // Fallback in-memory claim execution
  const newRecord: AgentNameRecord = {
    id: `name-${Date.now().toString(36)}`,
    name: pricing.cleanName,
    fullName: pricing.fullName,
    category: payload.type === "merchant" ? "MERCHANT" : "PERSONAL",
    status: "CLAIMED",
    length: pricing.length,
    priceUsd: pricing.priceUsd,
    priceZar: pricing.priceZar,
    description: `Registered ${payload.type} agent name on Autocomm Mesh.`,
    isRare: pricing.length <= 3,
    ownerType: payload.paymentMethod === "x402" ? "AI_AGENT" : "HUMAN_WALLET",
    ownerAddress: payload.network
      ? `0x${Math.random().toString(16).slice(2, 10)}... (${payload.network.toUpperCase()})`
      : undefined,
    ownerAgentId:
      payload.agentId ||
      (payload.paymentMethod === "x402" ? "agent_autonomous_proxy_za" : undefined),
    claimedAt: new Date().toISOString(),
    paymentProtocol: payload.paymentMethod,
    cryptoNetwork: payload.network,
    transactionHash:
      payload.paymentMethod === "crypto"
        ? `0x${Math.random().toString(16).slice(2, 18)}`
        : payload.paymentMethod === "x402"
          ? `x402:tx_${Math.random().toString(16).slice(2, 14)}`
          : undefined,
    cardReceiptId:
      payload.paymentMethod === "card"
        ? `CARD-${payload.cardToken?.last4 || "4242"}-${Date.now().toString().slice(-6)}`
        : undefined,
  };

  inMemoryRecords = [newRecord, ...inMemoryRecords.filter((r) => r.name !== pricing.cleanName)];

  // Add to leaderboard if price > 0
  const newLbEntry: LeaderboardEntry = {
    rank: inMemoryLeaderboard.length + 1,
    id: `lb-${Date.now()}`,
    name: pricing.cleanName,
    fullName: pricing.fullName,
    marketType: "PRIMARY",
    priceUsd: pricing.priceUsd,
    priceZar: pricing.priceZar,
    date: newRecord.claimedAt || new Date().toISOString(),
    buyer:
      payload.paymentMethod === "x402"
        ? newRecord.ownerAgentId || "agent_proxy"
        : newRecord.ownerAddress || "Human Passkey User",
    buyerType: payload.paymentMethod === "x402" ? "AI_AGENT" : "HUMAN",
    paymentMethod: payload.paymentMethod,
    network: payload.network,
    length: pricing.length,
  };

  inMemoryLeaderboard = [newLbEntry, ...inMemoryLeaderboard]
    .sort((a, b) => b.priceUsd - a.priceUsd)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  return {
    success: true,
    record: newRecord,
    message: `Successfully registered ${pricing.fullName} via ${payload.paymentMethod.toUpperCase()} (${pricing.tierLabel})!`,
  };
}

/**
 * Batch claims up to 20 names for 1, 2, 3 characters & auctions,
 * while enforcing maximum 1 for standard 4+ character handles.
 */
export async function batchClaimAgentNames(payload: BatchClaimPayload): Promise<{
  success: boolean;
  records: AgentNameRecord[];
  totalCostUsd: number;
  message: string;
}> {
  const isAgent = payload.paymentMethod === "x402" || payload.isAgent === true;
  const validation = validateRegistrationBatch(payload.names, isAgent);

  if (!validation.allowed) {
    throw new Error(validation.reason || "Batch registration limit exceeded.");
  }

  const createdRecords: AgentNameRecord[] = [];

  for (const name of payload.names) {
    const singlePayload: ClaimNamePayload = {
      name,
      type: payload.type,
      paymentMethod: payload.paymentMethod,
      network: payload.network,
      isAgent: payload.isAgent,
      cardToken: payload.cardToken,
      cryptoTxHash: payload.cryptoTxHash,
      x402Token: payload.x402Token,
      agentId: payload.agentId,
      ownerIdentifier: payload.ownerIdentifier,
    };
    const res = await claimAgentName(singlePayload);
    createdRecords.push(res.record);
  }

  return {
    success: true,
    records: createdRecords,
    totalCostUsd: validation.totalCostUsd,
    message: `Successfully batch secured ${createdRecords.length} .agent name(s) for $${validation.totalCostUsd.toLocaleString()} USD!`,
  };
}

/**
 * Places a bid on an active auction
 */
export async function placeAuctionBid(
  name: string,
  amountUsd: number,
  bidder: string,
  paymentMethod: PaymentMethodType,
  network: CryptoNetwork = "base",
): Promise<{ success: boolean; record: AgentNameRecord; message: string }> {
  const existingIndex = inMemoryRecords.findIndex((r) => r.name === name);
  if (existingIndex >= 0 && inMemoryRecords[existingIndex].auction) {
    const current = inMemoryRecords[existingIndex];
    const auction = current.auction!;

    const newBid = {
      id: `b-${Date.now()}`,
      bidder,
      bidderType: paymentMethod === "x402" ? ("AI_AGENT" as const) : ("HUMAN" as const),
      amountUsd,
      timestamp: "Just now",
      paymentMethod,
      network,
    };

    const updatedAuction = {
      ...auction,
      currentBidUsd: amountUsd,
      highestBidder: bidder,
      bidderType: newBid.bidderType,
      bidsCount: auction.bidsCount + 1,
      minNextBidUsd: Math.round(amountUsd * 1.05),
      history: [newBid, ...auction.history],
    };

    const updatedRecord = {
      ...current,
      auction: updatedAuction,
    };

    inMemoryRecords[existingIndex] = updatedRecord;

    // Update leaderboard with top bid
    const existingLbIdx = inMemoryLeaderboard.findIndex(
      (lb) => lb.name === name && lb.marketType === "AUCTION",
    );
    const lbEntry: LeaderboardEntry = {
      rank: 1,
      id: `lb-auc-${name}`,
      name,
      fullName: current.fullName,
      marketType: "AUCTION",
      priceUsd: amountUsd,
      priceZar: Math.round(amountUsd * 18.5),
      date: new Date().toISOString(),
      buyer: bidder,
      buyerType: newBid.bidderType,
      paymentMethod,
      network,
      length: current.length,
    };

    if (existingLbIdx >= 0) {
      inMemoryLeaderboard[existingLbIdx] = lbEntry;
    } else {
      inMemoryLeaderboard.push(lbEntry);
    }

    inMemoryLeaderboard = inMemoryLeaderboard
      .sort((a, b) => b.priceUsd - a.priceUsd)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));

    return {
      success: true,
      record: updatedRecord,
      message: `New highest bid of $${amountUsd.toLocaleString()} placed for ${current.fullName}!`,
    };
  }

  throw new Error(`Auction for ${name} not found or concluded.`);
}

/**
 * Lists a claimed name on the secondary marketplace
 */
export async function listOnSecondaryMarket(
  name: string,
  listedPriceUsd: number,
  seller: string,
  network: CryptoNetwork = "base",
): Promise<{ success: boolean; record: AgentNameRecord }> {
  const existing = inMemoryRecords.find((r) => r.name === name);
  if (!existing) throw new Error(`Name ${name} not found`);

  existing.status = "SECONDARY_LISTED";
  existing.secondaryListing = {
    listedPriceUsd,
    listedAt: new Date().toISOString(),
    seller,
    sellerType: seller.startsWith("agent_") ? "AI_AGENT" : "HUMAN",
    acceptedCurrencies: ["USDC", "ETH", "SOL", "CARD", "X402"],
    network,
  };

  return { success: true, record: existing };
}

/**
 * Purchases a name listed on the secondary marketplace
 */
export async function buyFromSecondaryMarket(
  name: string,
  buyer: string,
  paymentMethod: PaymentMethodType,
  network: CryptoNetwork = "base",
): Promise<{ success: boolean; record: AgentNameRecord; message: string }> {
  const existing = inMemoryRecords.find((r) => r.name === name);
  if (!existing || !existing.secondaryListing) {
    throw new Error(`Name ${name} is not available on secondary marketplace`);
  }

  const price = existing.secondaryListing.listedPriceUsd;

  existing.status = "CLAIMED";
  existing.ownerType = paymentMethod === "x402" ? "AI_AGENT" : "HUMAN_WALLET";
  existing.ownerAddress = paymentMethod !== "x402" ? buyer : undefined;
  existing.ownerAgentId = paymentMethod === "x402" ? buyer : undefined;
  existing.paymentProtocol = paymentMethod;
  existing.cryptoNetwork = network;
  existing.claimedAt = new Date().toISOString();
  delete existing.secondaryListing;

  // Add to leaderboard
  const lbEntry: LeaderboardEntry = {
    rank: 1,
    id: `lb-sec-${Date.now()}`,
    name,
    fullName: existing.fullName,
    marketType: "SECONDARY",
    priceUsd: price,
    priceZar: Math.round(price * 18.5),
    date: existing.claimedAt,
    buyer,
    buyerType: paymentMethod === "x402" ? "AI_AGENT" : "HUMAN",
    paymentMethod,
    network,
    length: existing.length,
  };

  inMemoryLeaderboard = [lbEntry, ...inMemoryLeaderboard]
    .sort((a, b) => b.priceUsd - a.priceUsd)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  return {
    success: true,
    record: existing,
    message: `Purchased ${existing.fullName} for $${price.toLocaleString()} via ${paymentMethod.toUpperCase()}!`,
  };
}

/**
 * Returns the Directory of Owners with full filtering and verification badges
 */
export function getOwnerDirectory(filter?: {
  search?: string;
  category?: string;
  chain?: string;
  ownerType?: string;
}): OwnerDirectoryRecord[] {
  let owners: OwnerDirectoryRecord[] = inMemoryRecords
    .filter((r) => r.status === "CLAIMED" || r.status === "SECONDARY_LISTED")
    .map((r) => {
      const ownerId =
        r.ownerAgentId ||
        r.ownerAddress ||
        r.secondaryListing?.seller ||
        (r.category === "MERCHANT" ? "enterprise_belair_partner" : "0x742d...f44e (Base)");
      const chainOrProtocol = r.cryptoNetwork
        ? `${r.cryptoNetwork.toUpperCase()} Network`
        : r.paymentProtocol === "x402"
          ? "x402 Autonomous"
          : r.paymentProtocol === "card"
            ? "Credit Card Token"
            : "Multi-Chain";

      return {
        id: r.id,
        name: r.name,
        fullName: r.fullName,
        category: r.category,
        ownerType: r.ownerType || "HUMAN_WALLET",
        ownerIdentifier: ownerId,
        chainOrProtocol,
        claimedAt: r.claimedAt || "2026-10-15T12:00:00Z",
        priceUsd: r.priceUsd,
        length: r.length,
        verified: r.category === "MERCHANT" || r.category === "PREMIUM_BRAND" || r.length <= 3,
        status: r.status,
      };
    });

  if (filter?.search) {
    const q = filter.search.toLowerCase().trim();
    owners = owners.filter(
      (o) =>
        o.name.includes(q) || o.fullName.includes(q) || o.ownerIdentifier.toLowerCase().includes(q),
    );
  }

  if (filter?.category && filter.category !== "ALL") {
    owners = owners.filter((o) => o.category === filter.category);
  }

  if (filter?.chain && filter.chain !== "ALL") {
    owners = owners.filter((o) =>
      o.chainOrProtocol.toLowerCase().includes(filter.chain!.toLowerCase()),
    );
  }

  if (filter?.ownerType && filter.ownerType !== "ALL") {
    owners = owners.filter((o) => o.ownerType === filter.ownerType);
  }

  return owners;
}

/**
 * Returns the Leaderboard of highest value names bought across Primary, Secondary, and Auction markets
 */
export function getLeaderboard(marketFilter?: string): LeaderboardEntry[] {
  let list = [...inMemoryLeaderboard];

  if (marketFilter && marketFilter !== "ALL") {
    list = list.filter((e) => e.marketType === marketFilter);
  }

  return list
    .sort((a, b) => b.priceUsd - a.priceUsd)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));
}

/**
 * Fetches an x402 payment quote challenge
 */
export function getX402PaymentQuote(name: string, isAgent: boolean = true): X402PaymentChallenge {
  const pricing = calculateNamePricing(name, isAgent);
  const costUsd = pricing.priceUsd;

  return {
    statusCode: 402,
    protocol: "x402-autonomous-v1",
    resourceName: pricing.fullName,
    costUsd,
    costUnits: {
      USDC: costUsd,
      SOL: Math.round((costUsd / 185) * 1000) / 1000,
      ETH: Math.round((costUsd / 3100) * 10000) / 10000,
    },
    destinationWallets: {
      base: "0x8849c71a3e2b9f8d1c0a7e6b5d4c3b2a1e0f9a8b",
      solana: "AutocomNameServiceVaultSolana11111111111111111",
      arc: "0x3344b81c2e0f9a7b6c5d4e3f2a1b0c9d8e7f6a5b",
    },
    agentNonce: `nonce_${Math.random().toString(36).substring(2, 10)}`,
    challengeHash: `sha256:${Math.random().toString(36).substring(2, 14)}...`,
    instructions:
      "Provide X-402-Payment-Token signed by delegating agent key or execute direct vault transfer.",
  };
}
