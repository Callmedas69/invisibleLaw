"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useReadContract } from "wagmi";
import { contractAddress, contractABI } from "@/app/config/contract";

export interface AllowlistData {
  isAllowlisted: boolean;
  hasClaimed: boolean;
  proof: `0x${string}`[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

interface StatusResponse {
  isAllowlisted: boolean;
}

interface ProofResponse {
  proof: `0x${string}`[];
  isValid: boolean;
}

export function useAllowlist(): AllowlistData {
  const { address, isConnected } = useAccount();

  const [isAllowlisted, setIsAllowlisted] = useState(false);
  const [proof, setProof] = useState<`0x${string}`[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Read hasClaimed status from contract
  const { data: hasClaimedData, refetch: refetchClaimed } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "hasClaimedAllowlist",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
    },
  });

  const hasClaimed = (hasClaimedData as boolean | undefined) ?? false;

  // Fetch allowlist status and proof from API
  const fetchAllowlistData = useCallback(async () => {
    if (!address || !isConnected) {
      setIsAllowlisted(false);
      setProof([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch status and proof in parallel
      const [statusRes, proofRes] = await Promise.all([
        fetch(`/api/allowlist/status?address=${address}`),
        fetch(`/api/allowlist/proof?address=${address}`),
      ]);

      if (!statusRes.ok || !proofRes.ok) {
        throw new Error("Failed to fetch allowlist data");
      }

      const statusData: StatusResponse = await statusRes.json();
      const proofData: ProofResponse = await proofRes.json();

      setIsAllowlisted(statusData.isAllowlisted);
      setProof(proofData.proof);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setIsAllowlisted(false);
      setProof([]);
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected]);

  // Fetch on mount and when address changes
  useEffect(() => {
    fetchAllowlistData();
  }, [fetchAllowlistData]);

  // Combined refetch function
  const refetch = useCallback(() => {
    fetchAllowlistData();
    refetchClaimed();
  }, [fetchAllowlistData, refetchClaimed]);

  return {
    isAllowlisted,
    hasClaimed,
    proof,
    isLoading,
    error,
    refetch,
  };
}
