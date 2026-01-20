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
  fetchNeynarUserByFid,
  checkNeynarFollowStatus,
  fetchCastByHash,
} from "@/app/lib/repositories/neynar-repository";
import {
  fetchQuotientScore,
  fetchQuotientMutuals,
} from "@/app/lib/repositories/quotient-repository";
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

/** Share check result */
export interface ShareCheckResult {
  /** Business decision: did they share? */
  hasShared: boolean;
  /** The hash that was verified */
  castHash: string | null;
  /** Was the cast verified via API? */
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
  /** Share check result */
  share: ShareCheckResult;
  /** Whether share requirement passes */
  passesShareRequirement: boolean;
  /** Overall eligibility (scores AND social AND share) */
  isEligible: boolean;
}

/** Result of adding to allowlist */
export interface AddToAllowlistResult {
  success: boolean;
  error: string | null;
  /** Whether the address was already on the allowlist */
  alreadyAllowlisted: boolean;
}

/** Result of building share text with mutuals */
export interface ShareTextResult {
  /** Full share text including mentions */
  text: string;
  /** Array of mentioned usernames (without @) */
  mentions: string[];
  /** Whether mutuals were included */
  hasMutuals: boolean;
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
 * Business rule: score >= 0.7
 */
function evaluateQuotientScore(score: number | null): boolean {
  if (score === null) return false;
  return score >= ELIGIBILITY_CONFIG.thresholds.quotient;
}

// ============================================================================
// Main Service Functions
// ============================================================================

/** Options for eligibility check */
export interface CheckEligibilityOptions {
  /** User's self-declaration of X follow (no API verification) */
  xFollowConfirmed?: boolean;
  /** Optional FID from miniapp context (skips address lookup) */
  fid?: number;
  /** Cast hash to verify share requirement */
  shareHash?: string;
  /** Skip share requirement (for web context where share is not available) */
  skipShareRequirement?: boolean;
}

/**
 * Checks eligibility for a wallet address.
 *
 * Business rules:
 * 1. Score requirement: Pass AT LEAST ONE of (Ethos >= 1300, Neynar >= 0.7)
 * 2. Social requirement: Follow BOTH X account AND Farcaster account
 * 3. Share requirement: Must share the miniapp on Farcaster
 * 4. Overall eligibility: Score AND Social AND Share requirements must all pass
 *
 * @param address - Ethereum wallet address
 * @param options - Optional parameters including xFollowConfirmed, fid, and shareHash
 * @returns Complete eligibility result
 */
export async function checkEligibility(
  address: string,
  options: CheckEligibilityOptions | boolean = {}
): Promise<EligibilityResult> {
  // Support legacy boolean signature for backwards compatibility
  const opts: CheckEligibilityOptions =
    typeof options === "boolean" ? { xFollowConfirmed: options } : options;
  const { xFollowConfirmed = false, fid, shareHash, skipShareRequirement = false } = opts;

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
  // Step 2: Fetch Neynar user (by FID if provided, otherwise by address)
  // -------------------------------------------------------------------------
  const neynarUser = fid
    ? await fetchNeynarUserByFid(fid)
    : await fetchNeynarUserByAddress(normalizedAddress);

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
    // Step 2b: Fetch Quotient score (requires FID)
    // -------------------------------------------------------------------------
    const quotientResult = await fetchQuotientScore(neynarUser.fid);
    const quotientScore = quotientResult?.score ?? null;
    scores.push({
      provider: "quotient",
      score: quotientScore,
      threshold: ELIGIBILITY_CONFIG.thresholds.quotient,
      passes: evaluateQuotientScore(quotientScore),
      error: quotientResult === null ? "Could not fetch Quotient score" : null,
    });

    // -------------------------------------------------------------------------
    // Step 3: Check Farcaster follow status (requires FID)
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
  // Step 4: X follow (self-declared, no API verification)
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
  // Step 5: Verify share (if hash provided)
  // -------------------------------------------------------------------------
  let share: ShareCheckResult;
  if (shareHash) {
    const castData = await fetchCastByHash(shareHash);
    // Business rule: cast must exist and be from this user's FID
    const isValid =
      castData !== null && castData.authorFid === farcasterUser?.fid;
    share = {
      hasShared: isValid,
      castHash: shareHash,
      verified: isValid,
      error: castData === null ? "Cast not found or deleted" : null,
    };
  } else {
    share = {
      hasShared: false,
      castHash: null,
      verified: false,
      error: null,
    };
  }

  // -------------------------------------------------------------------------
  // Business Rule Evaluation
  // -------------------------------------------------------------------------

  // Score requirement: At least ONE score must pass
  const passesScoreRequirement = scores.some((s) => s.passes);

  // Social requirement: ALL social checks must pass
  const passesSocialRequirement = social.every((s) => s.isFollowing);

  // Share requirement: Must have shared (or skipped for web context)
  const passesShareRequirement = skipShareRequirement || share.hasShared;

  // Overall eligibility: all three requirements must pass
  const isEligible =
    passesScoreRequirement && passesSocialRequirement && passesShareRequirement;

  return {
    address: normalizedAddress,
    isAlreadyAllowlisted,
    farcasterUser,
    scores,
    passesScoreRequirement,
    social,
    passesSocialRequirement,
    share,
    passesShareRequirement,
    isEligible,
  };
}

/** Options for adding to allowlist */
export interface AddToAllowlistOptions {
  /** User's self-declaration of X follow */
  xFollowConfirmed: boolean;
  /** Optional FID from miniapp context */
  fid?: number;
  /** Cast hash to verify share requirement */
  shareHash?: string;
  /** Skip share requirement (for web context where share is not available) */
  skipShareRequirement?: boolean;
}

/**
 * Adds an address to the allowlist if eligible.
 *
 * Server-side re-validation is performed before adding.
 *
 * @param address - Ethereum wallet address
 * @param options - Options including xFollowConfirmed and optional fid
 * @returns Result of the add operation including fid if available
 */
export async function addToAllowlistIfEligible(
  address: string,
  options: AddToAllowlistOptions | boolean
): Promise<AddToAllowlistResult & { fid?: number }> {
  // Support legacy boolean signature for backwards compatibility
  const opts: AddToAllowlistOptions =
    typeof options === "boolean" ? { xFollowConfirmed: options } : options;
  const { xFollowConfirmed, fid, shareHash, skipShareRequirement } = opts;

  const normalizedAddress = address.toLowerCase();

  // Check if already allowlisted
  if (await isAllowlisted(normalizedAddress)) {
    return {
      success: true,
      error: null,
      alreadyAllowlisted: true,
      fid,
    };
  }

  // Re-validate eligibility server-side
  const eligibility = await checkEligibility(normalizedAddress, {
    xFollowConfirmed,
    fid,
    shareHash,
    skipShareRequirement,
  });

  // Get FID from eligibility result (more reliable than passed fid)
  const resolvedFid = eligibility.farcasterUser?.fid ?? fid;

  if (!eligibility.isEligible) {
    return {
      success: false,
      error: "Address does not meet eligibility requirements",
      alreadyAllowlisted: false,
      fid: resolvedFid,
    };
  }

  // Add to allowlist
  try {
    await addAddressToAllowlist(normalizedAddress);
    return {
      success: true,
      error: null,
      alreadyAllowlisted: false,
      fid: resolvedFid,
    };
  } catch (error) {
    console.error("[EligibilityService] Failed to add to allowlist:", error);
    return {
      success: false,
      error: "Failed to add address to allowlist",
      alreadyAllowlisted: false,
      fid: resolvedFid,
    };
  }
}

// ============================================================================
// Share Text Builder
// ============================================================================

/**
 * Builds share text with top 5 mutual mentions.
 *
 * Business rules:
 * 1. Sort mutuals by combinedScore descending
 * 2. Take top 5
 * 3. Format as @username mentions
 * 4. Append to base text from config
 * 5. Graceful fallback: returns base text if no mutuals
 *
 * @param fid - Farcaster user ID
 * @returns Share text result with mentions
 */
export async function buildShareTextWithMutuals(
  fid: number
): Promise<ShareTextResult> {
  const baseText = ELIGIBILITY_CONFIG.share.text;

  try {
    // Fetch mutuals from repository
    const mutuals = await fetchQuotientMutuals(fid);

    // Graceful fallback if no mutuals or error
    if (!mutuals || mutuals.length === 0) {
      return {
        text: baseText,
        mentions: [],
        hasMutuals: false,
      };
    }

    // Business rule: Sort by combinedScore descending, take top 5
    const topMutuals = [...mutuals]
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, 5);

    // Format mentions
    const mentions = topMutuals.map((m) => m.username);
    const mentionsText = mentions.map((u) => `@${u}`).join(" ");

    // Combine base text with mentions
    const text = `${baseText}\n\n${mentionsText}`;

    return {
      text,
      mentions,
      hasMutuals: true,
    };
  } catch (error) {
    console.error(
      "[EligibilityService] Failed to build share text with mutuals:",
      error
    );
    // Graceful fallback
    return {
      text: baseText,
      mentions: [],
      hasMutuals: false,
    };
  }
}
