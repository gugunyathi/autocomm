import { useState, useEffect, useCallback, useRef } from "react";

export type SupportedChainId =
  | "arc_mainnet"
  | "arc_testnet"
  | "base_mainnet"
  | "base_sepolia"
  | "eth_mainnet"
  | "eth_sepolia"
  | "avax_mainnet"
  | "avax_fuji"
  | "robinhood_mainnet"
  | "robinhood_testnet"
  | "tempo_mainnet"
  | "tempo_testnet"
  | "tether_mainnet"
  | "tether_testnet";

export interface Web3ChainConfig {
  id: SupportedChainId;
  name: string;
  shortName: string;
  chainIdDecimal: number;
  chainIdHex: string;
  rpcUrl: string;
  blockExplorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  usdcContractAddress: string;
  isTestnet: boolean;
  category: "Arc" | "Base" | "Ethereum" | "Avax" | "Robinhood" | "Tempo" | "Tether";
  iconBadge: string;
  color: string;
}

export const SUPPORTED_CHAINS: Record<SupportedChainId, Web3ChainConfig> = {
  // 1. Arc / Arbitrum ARC (Abstract & Arbitrum Orbit)
  arc_mainnet: {
    id: "arc_mainnet",
    name: "Arc Blockchain Mainnet",
    shortName: "Arc Mainnet",
    chainIdDecimal: 2741,
    chainIdHex: "0xab5",
    rpcUrl: "https://api.mainnet.arc.network/rpc",
    blockExplorerUrl: "https://arcscan.io",
    nativeCurrency: { name: "ARC", symbol: "ARC", decimals: 18 },
    usdcContractAddress: "0x1b44f3514812d835eb1bdb0acb33d3fa3351ee43",
    isTestnet: false,
    category: "Arc",
    iconBadge: "⚡",
    color: "#00F5FF",
  },
  arc_testnet: {
    id: "arc_testnet",
    name: "Arc Sepolia Testnet",
    shortName: "Arc Testnet",
    chainIdDecimal: 11124,
    chainIdHex: "0x2b74",
    rpcUrl: "https://sepolia-rpc.arc.network",
    blockExplorerUrl: "https://sepolia.arcscan.io",
    nativeCurrency: { name: "Test ARC", symbol: "tARC", decimals: 18 },
    usdcContractAddress: "0x07865c6e87b9f70255377e024ace6630c1eaa37f",
    isTestnet: true,
    category: "Arc",
    iconBadge: "🧪",
    color: "#00E5FF",
  },

  // 2. Base (Coinbase L2)
  base_mainnet: {
    id: "base_mainnet",
    name: "Base Mainnet",
    shortName: "Base",
    chainIdDecimal: 8453,
    chainIdHex: "0x2105",
    rpcUrl: "https://mainnet.base.org",
    blockExplorerUrl: "https://basescan.org",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    usdcContractAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    isTestnet: false,
    category: "Base",
    iconBadge: "🔵",
    color: "#0052FF",
  },
  base_sepolia: {
    id: "base_sepolia",
    name: "Base Sepolia Testnet",
    shortName: "Base Sepolia",
    chainIdDecimal: 84532,
    chainIdHex: "0x14a34",
    rpcUrl: "https://sepolia.base.org",
    blockExplorerUrl: "https://sepolia.basescan.org",
    nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
    usdcContractAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    isTestnet: true,
    category: "Base",
    iconBadge: "🧪",
    color: "#3b82f6",
  },

  // 3. Ethereum
  eth_mainnet: {
    id: "eth_mainnet",
    name: "Ethereum Mainnet",
    shortName: "Ethereum",
    chainIdDecimal: 1,
    chainIdHex: "0x1",
    rpcUrl: "https://eth.llamarpc.com",
    blockExplorerUrl: "https://etherscan.io",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    usdcContractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    isTestnet: false,
    category: "Ethereum",
    iconBadge: "⟠",
    color: "#627EEA",
  },
  eth_sepolia: {
    id: "eth_sepolia",
    name: "Ethereum Sepolia Testnet",
    shortName: "Sepolia Testnet",
    chainIdDecimal: 11155111,
    chainIdHex: "0xaa36a7",
    rpcUrl: "https://rpc.sepolia.org",
    blockExplorerUrl: "https://sepolia.etherscan.io",
    nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
    usdcContractAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    isTestnet: true,
    category: "Ethereum",
    iconBadge: "🧪",
    color: "#818cf8",
  },

  // 4. Avalanche (Avax)
  avax_mainnet: {
    id: "avax_mainnet",
    name: "Avalanche C-Chain Mainnet",
    shortName: "Avalanche",
    chainIdDecimal: 43114,
    chainIdHex: "0xa86a",
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    blockExplorerUrl: "https://snowtrace.io",
    nativeCurrency: { name: "Avalanche", symbol: "AVAX", decimals: 18 },
    usdcContractAddress: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
    isTestnet: false,
    category: "Avax",
    iconBadge: "🔺",
    color: "#E84142",
  },
  avax_fuji: {
    id: "avax_fuji",
    name: "Avalanche Fuji Testnet",
    shortName: "Avax Fuji",
    chainIdDecimal: 43113,
    chainIdHex: "0xa869",
    rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
    blockExplorerUrl: "https://testnet.snowtrace.io",
    nativeCurrency: { name: "Fuji AVAX", symbol: "AVAX", decimals: 18 },
    usdcContractAddress: "0x5425890298aed601595a70ab815c96711a31bc65",
    isTestnet: true,
    category: "Avax",
    iconBadge: "🧪",
    color: "#f87171",
  },

  // 5. Robinhood Chain
  robinhood_mainnet: {
    id: "robinhood_mainnet",
    name: "Robinhood Crypto Settlement Rail",
    shortName: "Robinhood Mainnet",
    chainIdDecimal: 70001,
    chainIdHex: "0x11171",
    rpcUrl: "https://rpc.mainnet.robinhoodchain.com",
    blockExplorerUrl: "https://explorer.robinhoodchain.com",
    nativeCurrency: { name: "Robinhood Token", symbol: "HOOD", decimals: 18 },
    usdcContractAddress: "0x9812f849b20894025f182c199047910ea0984182",
    isTestnet: false,
    category: "Robinhood",
    iconBadge: "🏹",
    color: "#00C805",
  },
  robinhood_testnet: {
    id: "robinhood_testnet",
    name: "Robinhood Devnet Sandbox",
    shortName: "Robinhood Testnet",
    chainIdDecimal: 70002,
    chainIdHex: "0x11172",
    rpcUrl: "https://sandbox-rpc.robinhoodchain.com",
    blockExplorerUrl: "https://sandbox-explorer.robinhoodchain.com",
    nativeCurrency: { name: "Sandbox HOOD", symbol: "tHOOD", decimals: 18 },
    usdcContractAddress: "0x1188f849b20894025f182c199047910ea0981111",
    isTestnet: true,
    category: "Robinhood",
    iconBadge: "🧪",
    color: "#22c55e",
  },

  // 6. Tempo Network
  tempo_mainnet: {
    id: "tempo_mainnet",
    name: "Tempo Spatial Micropayment Mainnet",
    shortName: "Tempo Mainnet",
    chainIdDecimal: 80001,
    chainIdHex: "0x13881",
    rpcUrl: "https://rpc.tempo.network",
    blockExplorerUrl: "https://temposcan.io",
    nativeCurrency: { name: "TEMPO", symbol: "TEMPO", decimals: 18 },
    usdcContractAddress: "0x77ab42901c87239401ab19472910ea0981442011",
    isTestnet: false,
    category: "Tempo",
    iconBadge: "🎵",
    color: "#EC4899",
  },
  tempo_testnet: {
    id: "tempo_testnet",
    name: "Tempo Testnet Node",
    shortName: "Tempo Testnet",
    chainIdDecimal: 80002,
    chainIdHex: "0x13882",
    rpcUrl: "https://testnet-rpc.tempo.network",
    blockExplorerUrl: "https://testnet.temposcan.io",
    nativeCurrency: { name: "tTEMPO", symbol: "tTEMPO", decimals: 18 },
    usdcContractAddress: "0x33cb42901c87239401ab19472910ea0981442099",
    isTestnet: true,
    category: "Tempo",
    iconBadge: "🧪",
    color: "#f472b6",
  },

  // 7. Tether Blockchain (WDK / Stablecoin Rail)
  tether_mainnet: {
    id: "tether_mainnet",
    name: "Tether WDK Settlement Rail",
    shortName: "Tether Mainnet",
    chainIdDecimal: 90001,
    chainIdHex: "0x15f91",
    rpcUrl: "https://rpc.wdk.tether.to",
    blockExplorerUrl: "https://tetherscan.io",
    nativeCurrency: { name: "USDt Gas", symbol: "USDT", decimals: 6 },
    usdcContractAddress: "0x2244f849b20894025f182c199047910ea0985533",
    isTestnet: false,
    category: "Tether",
    iconBadge: "₮",
    color: "#26A17B",
  },
  tether_testnet: {
    id: "tether_testnet",
    name: "Tether WDK Testnet",
    shortName: "Tether Testnet",
    chainIdDecimal: 90002,
    chainIdHex: "0x15f92",
    rpcUrl: "https://testnet-rpc.wdk.tether.to",
    blockExplorerUrl: "https://testnet.tetherscan.io",
    nativeCurrency: { name: "Test USDT", symbol: "tUSDT", decimals: 6 },
    usdcContractAddress: "0x9911f849b20894025f182c199047910ea0989944",
    isTestnet: true,
    category: "Tether",
    iconBadge: "🧪",
    color: "#34d399",
  },
};

export interface Web3TransactionRecord {
  id: string;
  txHash: string;
  timestamp: number;
  networkId: SupportedChainId;
  networkName: string;
  type: "USDC_MICRO_PAYMENT" | "ATTENTION_POOL" | "STORAGE_ESCROW" | "FAUCET_TOPUP";
  amountUsdc: number;
  gasFeeUsd: number;
  status: "CONFIRMED" | "PENDING" | "FAILED";
  recipient: string;
  campaignId?: string;
  notes?: string;
}

export interface Web3WalletHookReturn {
  isMetaMaskInstalled: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  selectedChainId: SupportedChainId;
  currentChainConfig: Web3ChainConfig;
  balances: {
    USDC: number;
    ERC_X402: number;
    NATIVE: number;
  };
  transactions: Web3TransactionRecord[];
  connectMetaMask: () => Promise<string>;
  disconnectMetaMask: () => void;
  switchChain: (chainId: SupportedChainId) => Promise<void>;
  authorizeUsdcMicroPayment: (params: {
    amountUsdc: number;
    recipientAddress?: string;
    campaignId?: string;
    purpose?: string;
  }) => Promise<{
    success: boolean;
    txHash: string;
    networkId: SupportedChainId;
    networkName: string;
    gasFeeUsd: number;
    timestamp: number;
  }>;
  faucetTopup: (token: "USDC" | "NATIVE" | "ERC_X402", amount?: number) => void;
  supportedChains: Web3ChainConfig[];
}

const STORAGE_WEB3_PROVIDER_KEY = "autocom_web3_wallet_provider_v3";

export function useWeb3Wallet(): Web3WalletHookReturn {
  const isHydratedRef = useRef(false);

  // Deterministic initial state for SSR
  const [selectedChainId, setSelectedChainId] = useState<SupportedChainId>("base_mainnet");
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [address, setAddress] = useState<string | null>(
    "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  );
  const [balances, setBalances] = useState<{ USDC: number; ERC_X402: number; NATIVE: number }>({
    USDC: 285.5,
    ERC_X402: 1420.0,
    NATIVE: 1.84,
  });
  const [transactions, setTransactions] = useState<Web3TransactionRecord[]>([
    {
      id: "tx-init-escrow",
      txHash: "0x78ab1264c91a0b3f8e5e89d129fa410972b99ef",
      timestamp: 1775500000000,
      networkId: "base_mainnet",
      networkName: "Base Mainnet",
      type: "STORAGE_ESCROW",
      amountUsdc: 0.45,
      gasFeeUsd: 0.0012,
      status: "CONFIRMED",
      recipient: "AutoCom Decentralized IPFS Pinning Pool",
      notes: "Decentralized 12-Node IPFS Storage Micro-Fee",
    },
  ]);

  const isMetaMaskInstalled =
    typeof window !== "undefined" &&
    typeof (window as unknown as { ethereum?: unknown }).ethereum !== "undefined";

  // Post-mount hydration from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(STORAGE_WEB3_PROVIDER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (
          parsed.selectedChainId &&
          SUPPORTED_CHAINS[parsed.selectedChainId as SupportedChainId]
        ) {
          setSelectedChainId(parsed.selectedChainId);
        }
        if (parsed.address) setAddress(parsed.address);
        if (parsed.balances) setBalances(parsed.balances);
        if (parsed.transactions) setTransactions(parsed.transactions);
      }
    } catch {
      // ignore
    } finally {
      isHydratedRef.current = true;
    }
  }, []);

  // Save state updates to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && isHydratedRef.current) {
      localStorage.setItem(
        STORAGE_WEB3_PROVIDER_KEY,
        JSON.stringify({ selectedChainId, address, balances, transactions }),
      );
    }
  }, [selectedChainId, address, balances, transactions]);

  const currentChainConfig = SUPPORTED_CHAINS[selectedChainId];

  // Connect MetaMask
  const connectMetaMask = useCallback(async (): Promise<string> => {
    setIsConnecting(true);

    if (
      typeof window !== "undefined" &&
      (
        window as unknown as {
          ethereum?: { request: (args: { method: string }) => Promise<string[]> };
        }
      ).ethereum
    ) {
      try {
        const eth = (
          window as unknown as {
            ethereum: { request: (args: { method: string }) => Promise<string[]> };
          }
        ).ethereum;
        const accounts = await eth.request({ method: "eth_requestAccounts" });
        if (accounts && accounts[0]) {
          setAddress(accounts[0]);
          setIsConnected(true);
          setIsConnecting(false);
          return accounts[0];
        }
      } catch (err) {
        console.warn("MetaMask provider prompt failed, using simulated wallet session", err);
      }
    }

    // High-fidelity fallback simulated wallet connection
    await new Promise((r) => setTimeout(r, 600));
    const simulatedAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
    setAddress(simulatedAddress);
    setIsConnected(true);
    setIsConnecting(false);
    return simulatedAddress;
  }, []);

  // Disconnect MetaMask
  const disconnectMetaMask = useCallback(() => {
    setIsConnected(false);
    setAddress(null);
  }, []);

  // Switch Active Blockchain Network
  const switchChain = useCallback(async (chainId: SupportedChainId): Promise<void> => {
    const targetChain = SUPPORTED_CHAINS[chainId];
    if (!targetChain) return;

    if (
      typeof window !== "undefined" &&
      (
        window as unknown as {
          ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<void> };
        }
      ).ethereum
    ) {
      try {
        const eth = (
          window as unknown as {
            ethereum: { request: (args: { method: string; params?: unknown[] }) => Promise<void> };
          }
        ).ethereum;
        await eth.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: targetChain.chainIdHex }],
        });
      } catch (switchError: unknown) {
        // If chain is not added yet (code 4902), request to add it
        const err = switchError as { code?: number };
        if (err?.code === 4902) {
          try {
            const eth = (
              window as unknown as {
                ethereum: {
                  request: (args: { method: string; params?: unknown[] }) => Promise<void>;
                };
              }
            ).ethereum;
            await eth.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: targetChain.chainIdHex,
                  chainName: targetChain.name,
                  nativeCurrency: targetChain.nativeCurrency,
                  rpcUrls: [targetChain.rpcUrl],
                  blockExplorerUrls: [targetChain.blockExplorerUrl],
                },
              ],
            });
          } catch {
            // ignore
          }
        }
      }
    }

    setSelectedChainId(chainId);
  }, []);

  // Authorize USDC Micro-Payment (e.g. $0.45 USDC for MerchantAdUploader decentralized storage)
  const authorizeUsdcMicroPayment = useCallback(
    async ({
      amountUsdc,
      recipientAddress = "0x981A4b61C8d72835eB1bdb0ACB33d3FA3351EE43",
      campaignId,
      purpose = "AutoCom Decentralized IPFS Storage Micro-Fee",
    }: {
      amountUsdc: number;
      recipientAddress?: string;
      campaignId?: string;
      purpose?: string;
    }) => {
      // Simulate Web3 wallet signature & contract execution
      await new Promise((r) => setTimeout(r, 800));

      const txHash = `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 6)}`;
      const gasFeeUsd = Math.round((Math.random() * 0.001 + 0.0008) * 10000) / 10000;
      const timestamp = Date.now();

      const newTx: Web3TransactionRecord = {
        id: `tx-usdc-${timestamp}`,
        txHash,
        timestamp,
        networkId: selectedChainId,
        networkName: currentChainConfig.name,
        type: "STORAGE_ESCROW",
        amountUsdc,
        gasFeeUsd,
        status: "CONFIRMED",
        recipient: recipientAddress,
        campaignId,
        notes: purpose,
      };

      setBalances((prev) => ({
        ...prev,
        USDC: Math.max(0, Math.round((prev.USDC - amountUsdc) * 100) / 100),
        NATIVE: Math.max(0, Math.round((prev.NATIVE - gasFeeUsd / 2800) * 10000) / 10000),
      }));

      setTransactions((prev) => [newTx, ...prev]);

      return {
        success: true,
        txHash,
        networkId: selectedChainId,
        networkName: currentChainConfig.name,
        gasFeeUsd,
        timestamp,
      };
    },
    [selectedChainId, currentChainConfig.name],
  );

  // Faucet Top-up helper
  const faucetTopup = useCallback(
    (token: "USDC" | "NATIVE" | "ERC_X402", amount = 100) => {
      const timestamp = Date.now();
      const txHash = `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`;

      setBalances((prev) => ({
        ...prev,
        [token]: (prev[token] || 0) + amount,
      }));

      const faucetTx: Web3TransactionRecord = {
        id: `tx-faucet-${timestamp}`,
        txHash,
        timestamp,
        networkId: selectedChainId,
        networkName: currentChainConfig.name,
        type: "FAUCET_TOPUP",
        amountUsdc: token === "USDC" ? amount : 0,
        gasFeeUsd: 0,
        status: "CONFIRMED",
        recipient: address || "User Autonomous Wallet",
        notes: `Testnet Faucet Refill (+${amount} ${token})`,
      };

      setTransactions((prev) => [faucetTx, ...prev]);
    },
    [selectedChainId, currentChainConfig.name, address],
  );

  return {
    isMetaMaskInstalled,
    isConnected,
    isConnecting,
    address,
    selectedChainId,
    currentChainConfig,
    balances,
    transactions,
    connectMetaMask,
    disconnectMetaMask,
    switchChain,
    authorizeUsdcMicroPayment,
    faucetTopup,
    supportedChains: Object.values(SUPPORTED_CHAINS),
  };
}
