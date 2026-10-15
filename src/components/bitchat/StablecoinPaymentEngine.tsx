import React, { useState } from "react";
import { createWalletClient, custom, parseUnits } from "viem";
import { base } from "viem/chains";

const ERC20_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

const USDC_BASE_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bda02913";

interface StablecoinPaymentProps {
  merchantAddress?: string;
  amountUSDC?: string;
  onPaymentSubmitted: (txHash: string) => void;
}

export function StablecoinPaymentEngine({
  merchantAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  amountUSDC = "15.50",
  onPaymentSubmitted,
}: StablecoinPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const executeStablecoinTransfer = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const win =
        typeof window !== "undefined" ? (window as Window & { ethereum?: unknown }) : null;
      if (!win?.ethereum) {
        throw new Error(
          "No Web3 wallet discovered. Please install MetaMask, Coinbase Wallet, or Rabby.",
        );
      }

      const walletClient = createWalletClient({
        chain: base,
        transport: custom(win.ethereum as Parameters<typeof custom>[0]),
      });

      const [userAddress] = await walletClient.requestAddresses();
      const parsedAmountUnits = parseUnits(amountUSDC, 6);

      console.log(`📡 Dispatching transaction request from ${userAddress} on Base L2...`);

      const txHash = await walletClient.writeContract({
        address: USDC_BASE_ADDRESS,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [merchantAddress as `0x${string}`, parsedAmountUnits],
        account: userAddress,
      });

      console.log(`✅ Tx Broadcasted successfully! Hash reference: ${txHash}`);
      onPaymentSubmitted(txHash);
    } catch (error: unknown) {
      console.error("Layer-2 contract execution failed:", error);
      const err = error as { message?: string };
      setErrorMessage(err.message || "Blockchain transaction signature rejected.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 mt-3 text-white">
      <div className="flex justify-between items-center mb-3">
        <div>
          <span className="block text-xs text-gray-400 font-semibold uppercase">
            Stablecoin Settlement
          </span>
          <span className="text-lg font-bold font-mono text-cyan-400">${amountUSDC} USDC</span>
          <span className="block text-[10px] text-gray-400">Network: Base Layer-2 (ERC-20)</span>
        </div>
      </div>

      <button
        onClick={executeStablecoinTransfer}
        disabled={loading}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 font-bold p-3 rounded-xl transition hover:opacity-90 active:scale-95 text-sm disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Signing Contract Hook..." : "Approve & Pay via Stablecoin (Base)"}
      </button>

      {errorMessage && (
        <p className="mt-2 text-xs text-red-400 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
