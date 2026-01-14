"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { contractAddress, contractABI } from "@/app/config/contract";
import { useContractReads } from "./useContractReads";

export interface MintState {
  mint: (quantity: number, value: bigint) => void;
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  error: Error | null;
  txHash: `0x${string}` | undefined;
  reset: () => void;
}

export function useMint(): MintState {
  const { refetch } = useContractReads();

  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
    reset,
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
  if (isSuccess) {
    refetch();
  }

  const mint = (quantity: number, value: bigint) => {
    writeContract({
      address: contractAddress,
      abi: contractABI,
      functionName: "mint",
      args: [BigInt(quantity)],
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
