"use client";

import { useEffect, useRef } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { contractAddress, contractABI } from "@/app/config/contract";
import { useContractReads } from "./useContractReads";

export interface MintState {
  mint: (quantity: number, value: bigint, proof?: `0x${string}`[]) => void;
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  error: Error | null;
  txHash: `0x${string}` | undefined;
  reset: () => void;
}

export function useMint(): MintState {
  const { refetch } = useContractReads();
  const hasRefetched = useRef(false);

  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
    },
  });

  // Refetch contract data after successful mint
  useEffect(() => {
    if (isSuccess && !hasRefetched.current) {
      hasRefetched.current = true;
      refetch();
    }
  }, [isSuccess, refetch]);

  // Reset refetch flag when transaction is reset
  const reset = () => {
    hasRefetched.current = false;
    resetWrite();
  };

  const mint = (quantity: number, value: bigint, proof: `0x${string}`[] = []) => {
    writeContract({
      address: contractAddress,
      abi: contractABI,
      functionName: "mint",
      args: [BigInt(quantity), proof],
      value,
    });
  };

  return {
    mint,
    isPending,
    isConfirming,
    isSuccess,
    error: writeError ?? confirmError ?? null,
    txHash: hash,
    reset,
  };
}
