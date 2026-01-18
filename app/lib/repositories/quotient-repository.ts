/**
 * Quotient Repository - Data Access Layer
 *
 * Fetches raw Quotient eligibility data. NO business logic.
 * Score evaluation happens in the business logic layer.
 */

const QUOTIENT_API_BASE = "https://api.quotient.co/v1";

function getQuotientApiKey(): string {
  const apiKey = process.env.QUOTIENT_API_KEY;
  if (!apiKey) {
    throw new Error("QUOTIENT_API_KEY environment variable is not set");
  }
  return apiKey;
}

/** Quotient condition result from API */
interface QuotientCondition {
  type: string;
  target_name: string;
  meets_condition: boolean;
}

/** Quotient API response structure */
interface QuotientApiResponse {
  fid: number;
  username: string | null;
  eligible: boolean;
  quotient_score: number;
  meets_reputation_threshold: boolean;
  conditions: QuotientCondition[];
  primary_eth_address: string | null;
}

/** Repository return type for condition */
export interface QuotientConditionResult {
  type: string;
  targetName: string;
  meetsCondition: boolean;
}

/** Repository return type */
export interface QuotientEligibilityResult {
  fid: number;
  username: string | null;
  score: number;
  meetsReputationThreshold: boolean;
  conditions: QuotientConditionResult[];
  primaryEthAddress: string | null;
}

/**
 * Fetches Quotient eligibility data for a Farcaster user.
 *
 * Note: Quotient API requires FID (Farcaster ID), not wallet address.
 * Use Neynar to get FID from wallet address first.
 *
 * @param fid - Farcaster ID
 * @param queryId - Quotient allowlist query ID
 * @returns Quotient data or null if not found/error
 */
export async function fetchQuotientEligibility(
  fid: number,
  queryId: string
): Promise<QuotientEligibilityResult | null> {
  try {
    const response = await fetch(
      `${QUOTIENT_API_BASE}/allowlist/${queryId}/users/${fid}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getQuotientApiKey()}`,
          "Content-Type": "application/json",
        },
        // Cache for 5 minutes
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      // User not found or API error
      if (response.status === 404 || response.status === 422) {
        return null;
      }
      console.error(
        `[QuotientRepository] API error: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data: QuotientApiResponse = await response.json();

    return {
      fid: data.fid,
      username: data.username,
      score: data.quotient_score,
      meetsReputationThreshold: data.meets_reputation_threshold,
      conditions: data.conditions.map((c) => ({
        type: c.type,
        targetName: c.target_name,
        meetsCondition: c.meets_condition,
      })),
      primaryEthAddress: data.primary_eth_address,
    };
  } catch (error) {
    console.error(
      "[QuotientRepository] Failed to fetch Quotient eligibility:",
      error
    );
    return null;
  }
}
