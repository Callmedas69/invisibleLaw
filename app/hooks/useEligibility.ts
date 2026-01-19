"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { useMiniApp } from "@/app/hooks/useMiniApp";
import type {
  EligibilityResult,
  ScoreCheckResult,
  SocialCheckResult,
  ShareCheckResult,
  FarcasterUser,
} from "@/app/lib/eligibility/eligibility-service";
import { ELIGIBILITY_CONFIG } from "@/app/config/eligibility";

export interface UseEligibilityData {
  /** Complete eligibility result */
  eligibility: EligibilityResult | null;
  /** Individual score results */
  scores: ScoreCheckResult[];
  /** Social follow results */
  social: SocialCheckResult[];
  /** Share check result */
  share: ShareCheckResult | null;
  /** Farcaster user info */
  farcasterUser: FarcasterUser | null;
  /** Whether user passes score requirement */
  passesScoreRequirement: boolean;
  /** Whether user passes social requirement */
  passesSocialRequirement: boolean;
  /** Whether user passes share requirement */
  passesShareRequirement: boolean;
  /** Overall eligibility */
  isEligible: boolean;
  /** Already on allowlist */
  isAlreadyAllowlisted: boolean;
  /** Whether X follow is confirmed by user */
  xFollowConfirmed: boolean;
  /** Whether user has clicked X follow link */
  hasClickedXFollow: boolean;
  /** Current share hash (from localStorage) */
  shareHash: string | null;
  /** Loading state */
  isLoading: boolean;
  /** Adding to allowlist in progress */
  isAdding: boolean;
  /** Error state */
  error: Error | null;
  /** Confirm X follow (self-declaration) */
  confirmXFollow: () => void;
  /** Mark X follow link as clicked */
  markXFollowClicked: () => void;
  /** Share miniapp on Farcaster */
  shareCast: () => Promise<void>;
  /** Add to allowlist */
  addToAllowlist: () => Promise<boolean>;
  /** Re-check eligibility */
  refetch: () => void;
}

// localStorage key for share hash (UI state persistence)
const getShareStorageKey = (addr: string) =>
  `invisiblelaw_share_${addr.toLowerCase()}`;

export function useEligibility(): UseEligibilityData {
  const { address, isConnected } = useAccount();
  const { fid, composeCast } = useMiniApp();

  const [eligibility, setEligibility] = useState<EligibilityResult | null>(
    null
  );
  const [xFollowConfirmed, setXFollowConfirmed] = useState(false);
  const [hasClickedXFollow, setHasClickedXFollow] = useState(false);
  const [shareHash, setShareHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load shareHash from localStorage on mount
  useEffect(() => {
    if (address) {
      const saved = localStorage.getItem(getShareStorageKey(address));
      if (saved) {
        setShareHash(saved);
      }
    }
  }, [address]);

  // Fetch eligibility data from API
  const fetchEligibility = useCallback(async () => {
    if (!address || !isConnected) {
      setEligibility(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Build query params
      const params = new URLSearchParams({
        address,
        xFollowConfirmed: String(xFollowConfirmed),
      });

      // Include FID if available from miniapp context
      if (fid) {
        params.append("fid", String(fid));
      }

      // Include shareHash if available
      if (shareHash) {
        params.append("shareHash", shareHash);
      }

      const response = await fetch(`/api/eligibility/check?${params}`);

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
  }, [address, isConnected, xFollowConfirmed, fid, shareHash]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchEligibility();
  }, [fetchEligibility]);

  // Confirm X follow (self-declaration)
  const confirmXFollow = useCallback(() => {
    setXFollowConfirmed(true);
  }, []);

  // Mark X follow link as clicked
  const markXFollowClicked = useCallback(() => {
    setHasClickedXFollow(true);
  }, []);

  // Share miniapp on Farcaster
  const shareCast = useCallback(async () => {
    const hash = await composeCast({
      text: ELIGIBILITY_CONFIG.share.text,
      embeds: [...ELIGIBILITY_CONFIG.share.embeds],
    });
    if (hash && address) {
      localStorage.setItem(getShareStorageKey(address), hash);
      setShareHash(hash);
      // Refetch will happen automatically via useEffect dependency on shareHash
    }
  }, [composeCast, address]);

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
          fid, // Include FID if available from miniapp context
          shareHash, // Include shareHash for verification
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
  }, [address, isConnected, eligibility?.isEligible, xFollowConfirmed, fid, shareHash, fetchEligibility]);

  // Derived values from eligibility result
  const scores = eligibility?.scores ?? [];
  const social = eligibility?.social ?? [];
  const share = eligibility?.share ?? null;
  const farcasterUser = eligibility?.farcasterUser ?? null;
  const passesScoreRequirement = eligibility?.passesScoreRequirement ?? false;
  const passesSocialRequirement = eligibility?.passesSocialRequirement ?? false;
  const passesShareRequirement = eligibility?.passesShareRequirement ?? false;
  const isEligible = eligibility?.isEligible ?? false;
  const isAlreadyAllowlisted = eligibility?.isAlreadyAllowlisted ?? false;

  return {
    eligibility,
    scores,
    social,
    share,
    farcasterUser,
    passesScoreRequirement,
    passesSocialRequirement,
    passesShareRequirement,
    isEligible,
    isAlreadyAllowlisted,
    xFollowConfirmed,
    hasClickedXFollow,
    shareHash,
    isLoading,
    isAdding,
    error,
    confirmXFollow,
    markXFollowClicked,
    shareCast,
    addToAllowlist,
    refetch: fetchEligibility,
  };
}
