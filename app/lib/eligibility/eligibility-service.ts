/**
 * Eligibility Service - Business Logic Layer
 *
 * Contains ALL business rules for eligibility determination.
 * Orchestrates repository calls and evaluates thresholds.
 *
 * MUST NOT:
 * - Know about HTTP, NextRequest, NextResponse
 * - Call external APIs directly
 * - Import from "next/server"
 */

import { ELIGIBILITY_CONFIG } from "@/app/config/eligibility";
import { fetchEthosScore } from "@/app/lib/repositories/ethos-repository";
import {
  fetchNeynarUserByAddress,
  checkNeynarFollowStatus,
} from "@/app/lib/repositories/neynar-repository";
import { fetchQuotientEligibility } from "@/app/lib/repositories/quotient-repository";
import {
  isAllowlisted,
  addAddressToAllowlist,
} from "@/app/lib/allowlist-service";

// ============================================================================
// Types
// ============================================================================

/** Individual score check result */
export interface ScoreCheckResult {
  provider: "ethos" | "neynar" | "quotient";
  score: number | null;
  threshold: number;
  passes: boolean;
  error: string | null;
}

/** Social follow check result */
export interface SocialCheckResult {
  platform: "x" | "farcaster";
  username: string;
  profileUrl: string;
  isFollowing: boolean;
  /** For X, this is self-declared. For Farcaster, it's verified via API */
  verified: boolean;
  error: string | null;
}

/** Farcaster user info (if found) */
export interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
}

/** Complete eligibility check result */
export interface EligibilityResult {
  /** Wallet address that was checked */
  address: string;
  /** Whether the address is already on the allowlist */
  isAlreadyAllowlisted: boolean;
  /** Farcaster user info (null if no Farcaster account) */
  farcasterUser: FarcasterUser | null;
  /** Individual score results */
  scores: ScoreCheckResult[];
  /** Whether at least one score passes (business rule: need ANY one) */
  passesScoreRequirement: boolean;
  /** Social follow results */
  social: SocialCheckResult[];
  /** Whether all social requirements pass (business rule: need BOTH) */
  passesSocialRequirement: boolean;
  /** Overall eligibility (scores AND social) */
  isEligible: boolean;
}

/** Result of adding to allowlist */
export interface AddToAllowlistResult {
  success: boolean;
  error: string | null;
  /** Whether the address was already on the allowlist */
  alreadyAllowlisted: boolean;
}

// ============================================================================
// Business Rules (Threshold Evaluation)
// ============================================================================

/**
 * Evaluates if an Ethos score passes the threshold.
 * Business rule: score >= 1300
 */
function evaluateEthosScore(score: number | null): boolean {
  if (score === null) return false;
  return score >= ELIGIBILITY_CONFIG.thresholds.ethos;
}

/**
 * Evaluates if a Neynar score passes the threshold.
 * Business rule: score >= 0.7
 */
function evaluateNeynarScore(score: number | null): boolean {
  if (score === null) return false;
  return score >= ELIGIBILITY_CONFIG.thresholds.neynar;
}

/**
 * Evaluates if a Quotient score passes the threshold.
 * Business rule: score >= 0.6
 */
function evaluateQuotientScore(score: number | null): boolean {
  if (score === null) return false;
  return score >= ELIGIBILITY_CONFIG.thresholds.quotient;
}

// ============================================================================
// Main Service Functions
// ============================================================================

/**
 * Checks eligibility for a wallet address.
 *
 * Business rules:
 * 1. Score requirement: Pass AT LEAST ONE of (Ethos >= 1300, Neynar >= 0.7, Quotient >= 0.6)
 * 2. Social requirement: Follow BOTH X account AND Farcaster account
 * 3. Overall eligibility: Score requirement AND Social requirement must both pass
 *
 * @param address - Ethereum wallet address
 * @param xFollowConfirmed - User's self-declaration of X follow (no API verification)
 * @returns Complete eligibility result
 */
export async function checkEligibility(
  address: string,
  xFollowConfirmed: boolean = false
): Promise<EligibilityResult> {
  const normalizedAddress = address.toLowerCase();

  // Check if already allowlisted
  const isAlreadyAllowlisted = await isAllowlisted(normalizedAddress);

  // Initialize results
  const scores: ScoreCheckResult[] = [];
  const social: SocialCheckResult[] = [];
  let farcasterUser: FarcasterUser | null = null;

  // -------------------------------------------------------------------------
  // Step 1: Fetch Ethos score (only needs address)
  // -------------------------------------------------------------------------
  const ethosResult = await fetchEthosScore(normalizedAddress);
  const ethosScore = ethosResult?.score ?? null;
  scores.push({
    provider: "ethos",
    score: ethosScore,
    threshold: ELIGIBILITY_CONFIG.thresholds.ethos,
    passes: evaluateEthosScore(ethosScore),
    error: ethosResult === null ? "Could not fetch Ethos score" : null,
  });

  // -------------------------------------------------------------------------
  // Step 2: Fetch Neynar user by address (to get FID for other checks)
  // -------------------------------------------------------------------------
  const neynarUser = await fetchNeynarUserByAddress(normalizedAddress);

  if (neynarUser) {
    farcasterUser = {
      fid: neynarUser.fid,
      username: neynarUser.username,
      displayName: neynarUser.displayName,
      pfpUrl: neynarUser.pfpUrl,
    };

    // Add Neynar score
    const neynarScore = neynarUser.score;
    scores.push({
      provider: "neynar",
      score: neynarScore,
      threshold: ELIGIBILITY_CONFIG.thresholds.neynar,
      passes: evaluateNeynarScore(neynarScore),
      error: null,
    });

    // -------------------------------------------------------------------------
    // Step 3: Fetch Quotient eligibility (requires FID)
    // -------------------------------------------------------------------------
    const quotientResult = await fetchQuotientEligibility(
      neynarUser.fid,
      ELIGIBILITY_CONFIG.quotient.queryId
    );
    const quotientScore = quotientResult?.score ?? null;
    scores.push({
      provider: "quotient",
      score: quotientScore,
      threshold: ELIGIBILITY_CONFIG.thresholds.quotient,
      passes: evaluateQuotientScore(quotientScore),
      error: quotientResult === null ? "Could not fetch Quotient score" : null,
    });

    // -------------------------------------------------------------------------
    // Step 4: Check Farcaster follow status (requires FID)
    // -------------------------------------------------------------------------
    const targetFid = ELIGIBILITY_CONFIG.social.farcaster.fid;
    let fcFollowing = false;
    let fcError: string | null = null;

    if (targetFid > 0) {
      const followResult = await checkNeynarFollowStatus(
        neynarUser.fid,
        targetFid
      );
      if (followResult) {
        fcFollowing = followResult.isFollowing;
      } else {
        fcError = "Could not verify Farcaster follow status";
      }
    } else {
      fcError = "Farcaster target FID not configured";
    }

    social.push({
      platform: "farcaster",
      username: ELIGIBILITY_CONFIG.social.farcaster.username,
      profileUrl: `https://warpcast.com/${ELIGIBILITY_CONFIG.social.farcaster.username}`,
      isFollowing: fcFollowing,
      verified: true, // Farcaster follow is API-verified
      error: fcError,
    });
  } else {
    // No Farcaster account - add placeholder scores
    scores.push({
      provider: "neynar",
      score: null,
      threshold: ELIGIBILITY_CONFIG.thresholds.neynar,
      passes: false,
      error: "No Farcaster account linked to this wallet",
    });

    scores.push({
      provider: "quotient",
      score: null,
      threshold: ELIGIBILITY_CONFIG.thresholds.quotient,
      passes: false,
      error: "No Farcaster account linked to this wallet",
    });

    social.push({
      platform: "farcaster",
      username: ELIGIBILITY_CONFIG.social.farcaster.username,
      profileUrl: `https://warpcast.com/${ELIGIBILITY_CONFIG.social.farcaster.username}`,
      isFollowing: false,
      verified: false,
      error: "No Farcaster account linked to this wallet",
    });
  }

  // -------------------------------------------------------------------------
  // Step 5: X follow (self-declared, no API verification)
  // -------------------------------------------------------------------------
  social.push({
    platform: "x",
    username: ELIGIBILITY_CONFIG.social.x.username,
    profileUrl: ELIGIBILITY_CONFIG.social.x.profileUrl,
    isFollowing: xFollowConfirmed,
    verified: false, // X follow is self-declared, not API-verified
    error: null,
  });

  // -------------------------------------------------------------------------
  // Business Rule Evaluation
  // -------------------------------------------------------------------------

  // Score requirement: At least ONE score must pass
  const passesScoreRequirement = scores.some((s) => s.passes);

  // Social requirement: ALL social checks must pass
  const passesSocialRequirement = social.every((s) => s.isFollowing);

  // Overall eligibility
  const isEligible = passesScoreRequirement && passesSocialRequirement;

  return {
    address: normalizedAddress,
    isAlreadyAllowlisted,
    farcasterUser,
    scores,
    passesScoreRequirement,
    social,
    passesSocialRequirement,
    isEligible,
  };
}

/**
 * Adds an address to the allowlist if eligible.
 *
 * Server-side re-validation is performed before adding.
 *
 * @param address - Ethereum wallet address
 * @param xFollowConfirmed - User's self-declaration of X follow
 * @returns Result of the add operation
 */
export async function addToAllowlistIfEligible(
  address: string,
  xFollowConfirmed: boolean
): Promise<AddToAllowlistResult> {
  const normalizedAddress = address.toLowerCase();

  // Check if already allowlisted
  if (await isAllowlisted(normalizedAddress)) {
    return {
      success: true,
      error: null,
      alreadyAllowlisted: true,
    };
  }

  // Re-validate eligibility server-side
  const eligibility = await checkEligibility(normalizedAddress, xFollowConfirmed);

  if (!eligibility.isEligible) {
    return {
      success: false,
      error: "Address does not meet eligibility requirements",
      alreadyAllowlisted: false,
    };
  }

  // Add to allowlist
  try {
    await addAddressToAllowlist(normalizedAddress);
    return {
      success: true,
      error: null,
      alreadyAllowlisted: false,
    };
  } catch (error) {
    console.error("[EligibilityService] Failed to add to allowlist:", error);
    return {
      success: false,
      error: "Failed to add address to allowlist",
      alreadyAllowlisted: false,
    };
  }
}
