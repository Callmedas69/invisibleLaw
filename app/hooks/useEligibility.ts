"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import type {
  EligibilityResult,
  ScoreCheckResult,
  SocialCheckResult,
  FarcasterUser,
} from "@/app/lib/eligibility/eligibility-service";

export interface UseEligibilityData {
  /** Complete eligibility result */
  eligibility: EligibilityResult | null;
  /** Individual score results */
  scores: ScoreCheckResult[];
  /** Social follow results */
  social: SocialCheckResult[];
  /** Farcaster user info */
  farcasterUser: FarcasterUser | null;
  /** Whether user passes score requirement */
  passesScoreRequirement: boolean;
  /** Whether user passes social requirement */
  passesSocialRequirement: boolean;
  /** Overall eligibility */
  isEligible: boolean;
  /** Already on allowlist */
  isAlreadyAllowlisted: boolean;
  /** Whether X follow is confirmed by user */
  xFollowConfirmed: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Adding to allowlist in progress */
  isAdding: boolean;
  /** Error state */
  error: Error | null;
  /** Confirm X follow (self-declaration) */
  confirmXFollow: () => void;
  /** Add to allowlist */
  addToAllowlist: () => Promise<boolean>;
  /** Re-check eligibility */
  refetch: () => void;
}

export function useEligibility(): UseEligibilityData {
  const { address, isConnected } = useAccount();

  const [eligibility, setEligibility] = useState<EligibilityResult | null>(
    null
  );
  const [xFollowConfirmed, setXFollowConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch eligibility data from API
  const fetchEligibility = useCallback(async () => {
    if (!address || !isConnected) {
      setEligibility(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/eligibility/check?address=${address}&xFollowConfirmed=${xFollowConfirmed}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to check eligibility");
      }

      const data: EligibilityResult = await response.json();
      setEligibility(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setEligibility(null);
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected, xFollowConfirmed]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchEligibility();
  }, [fetchEligibility]);

  // Confirm X follow (self-declaration)
  const confirmXFollow = useCallback(() => {
    setXFollowConfirmed(true);
  }, []);

  // Add to allowlist
  const addToAllowlist = useCallback(async (): Promise<boolean> => {
    if (!address || !isConnected || !eligibility?.isEligible) {
      return false;
    }

    setIsAdding(true);
    setError(null);

    try {
      const response = await fetch("/api/eligibility/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          xFollowConfirmed,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add to allowlist");
      }

      if (data.success) {
        // Refresh eligibility to update isAlreadyAllowlisted
        await fetchEligibility();
        return true;
      }

      return false;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      return false;
    } finally {
      setIsAdding(false);
    }
  }, [address, isConnected, eligibility?.isEligible, xFollowConfirmed, fetchEligibility]);

  // Derived values from eligibility result
  const scores = eligibility?.scores ?? [];
  const social = eligibility?.social ?? [];
  const farcasterUser = eligibility?.farcasterUser ?? null;
  const passesScoreRequirement = eligibility?.passesScoreRequirement ?? false;
  const passesSocialRequirement = eligibility?.passesSocialRequirement ?? false;
  const isEligible = eligibility?.isEligible ?? false;
  const isAlreadyAllowlisted = eligibility?.isAlreadyAllowlisted ?? false;

  return {
    eligibility,
    scores,
    social,
    farcasterUser,
    passesScoreRequirement,
    passesSocialRequirement,
    isEligible,
    isAlreadyAllowlisted,
    xFollowConfirmed,
    isLoading,
    isAdding,
    error,
    confirmXFollow,
    addToAllowlist,
    refetch: fetchEligibility,
  };
}
