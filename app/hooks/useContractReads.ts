"use client";

import { useReadContracts, useAccount, useReadContract } from "wagmi";
import { contractAddress, contractABI } from "@/app/config/contract";

export interface ContractData {
  // Mint state
  mintPrice: bigint;
  mintActive: boolean;
  paused: boolean;

  // Supply
  totalMinted: number;
  maxSupply: number;
  maxPerWallet: number;

  // Allowlist
  allowlistFreeMint: number;

  // User-specific (only when connected)
  userMinted: number;

  // Derived
  remaining: number;
  isSoldOut: boolean;
  canMint: boolean;

  // Loading/error states
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useContractReads(): ContractData {
  const { address, isConnected } = useAccount();

  // Static contract reads (always fetched)
  const { data: staticData, isLoading: staticLoading, isError: staticError, error: staticErr, refetch: refetchStatic } = useReadContracts({
    contracts: [
      {
        address: contractAddress,
        abi: contractABI,
        functionName: "mintPrice",
      },
      {
        address: contractAddress,
        abi: contractABI,
        functionName: "mintActive",
      },
      {
        address: contractAddress,
        abi: contractABI,
        functionName: "paused",
      },
      {
        address: contractAddress,
        abi: contractABI,
        functionName: "totalMinted",
      },
      {
        address: contractAddress,
        abi: contractABI,
        functionName: "MAX_SUPPLY",
      },
      {
        address: contractAddress,
        abi: contractABI,
        functionName: "MAX_PER_WALLET",
      },
      {
        address: contractAddress,
        abi: contractABI,
        functionName: "allowlistFreeMint",
      },
    ],
    query: {
      refetchInterval: 10000,
    },
  });

  // User-specific read (only when connected)
  const { data: userMintedData, refetch: refetchUser } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
      refetchInterval: 10000,
    },
  });

  // Parse static results with defaults
  const mintPrice = (staticData?.[0]?.result as bigint | undefined) ?? BigInt(0);
  const mintActive = (staticData?.[1]?.result as boolean | undefined) ?? false;
  const paused = (staticData?.[2]?.result as boolean | undefined) ?? false;
  const totalMinted = Number((staticData?.[3]?.result as bigint | undefined) ?? BigInt(0));
  const maxSupply = Number((staticData?.[4]?.result as bigint | undefined) ?? BigInt(1272));
  const maxPerWallet = Number((staticData?.[5]?.result as bigint | undefined) ?? BigInt(5));
  const allowlistFreeMint = Number((staticData?.[6]?.result as bigint | undefined) ?? BigInt(1));

  // Parse user data
  const userMinted = isConnected
    ? Number((userMintedData as bigint | undefined) ?? BigInt(0))
    : 0;

  // Derived values
  const remaining = maxSupply - totalMinted;
  const isSoldOut = remaining <= 0;
  const canMint = mintActive && !paused && !isSoldOut;

  // Combined refetch
  const refetch = () => {
    refetchStatic();
    if (isConnected) {
      refetchUser();
    }
  };

  return {
    mintPrice,
    mintActive,
    paused,
    totalMinted,
    maxSupply,
    maxPerWallet,
    allowlistFreeMint,
    userMinted,
    remaining,
    isSoldOut,
    canMint,
    isLoading: staticLoading,
    isError: staticError,
    error: staticErr ?? null,
    refetch,
  };
}
