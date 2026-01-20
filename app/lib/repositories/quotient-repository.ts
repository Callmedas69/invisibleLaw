/**
 * Quotient Repository - Data Access Layer
 *
 * Fetches Quotient reputation scores from API. NO business logic.
 * Score evaluation happens in the business logic layer.
 */

const QUOTIENT_API_BASE = "https://api.quotient.social";

function getQuotientApiKey(): string {
  const apiKey = process.env.QUOTIENT_API_KEY;
  if (!apiKey) {
    throw new Error("QUOTIENT_API_KEY environment variable is not set");
  }
  return apiKey;
}

/** Quotient API response types */
interface QuotientApiResponse {
  data: QuotientApiData[];
  count: number;
}

interface QuotientApiData {
  fid: number;
  username: string;
  quotientScore: number | null;
  quotientRank: number | null;
  contextLabels: string[] | null;
}

/** Repository return type - domain model */
export interface QuotientScoreResult {
  fid: number;
  username: string;
  score: number | null;
  rank: number | null;
  contextLabels: string[];
}

/** Mutual connection from Quotient API */
export interface QuotientMutual {
  fid: number;
  username: string;
  combinedScore: number;
  rank: number | null;
}

/** Quotient connections API response types */
interface QuotientConnectionsApiResponse {
  data: QuotientConnectionApiData[];
  count: number;
}

interface QuotientConnectionApiData {
  fid: number;
  username: string;
  combinedScore: number;
  rank: number | null;
}

/**
 * Fetches Quotient reputation score by FID.
 *
 * Data fetching ONLY - no business logic.
 *
 * @param fid - Farcaster user ID
 * @returns Score data or null if not found/error
 */
export async function fetchQuotientScore(
  fid: number
): Promise<QuotientScoreResult | null> {
  try {
    const response = await fetch(`${QUOTIENT_API_BASE}/v1/user-reputation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fids: [fid],
        api_key: getQuotientApiKey(),
      }),
      // Cache for 5 minutes
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      // 404 = user not found, not an error
      if (response.status === 404) {
        return null;
      }
      console.error(
        `[QuotientRepository] API error: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data: QuotientApiResponse = await response.json();

    if (!data.data || data.data.length === 0) {
      return null;
    }

    const user = data.data[0];

    return {
      fid: user.fid,
      username: user.username,
      score: user.quotientScore,
      rank: user.quotientRank,
      contextLabels: user.contextLabels ?? [],
    };
  } catch (error) {
    console.error("[QuotientRepository] Failed to fetch score:", error);
    return null;
  }
}

/**
 * Fetches mutual connections from Quotient API.
 *
 * Data fetching ONLY - no sorting or limiting (that's business logic).
 *
 * @param fid - Farcaster user ID
 * @returns Array of mutuals or null on error
 */
export async function fetchQuotientMutuals(
  fid: number
): Promise<QuotientMutual[] | null> {
  try {
    const response = await fetch(
      `${QUOTIENT_API_BASE}/v1/farcaster-connections`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fid,
          api_key: getQuotientApiKey(),
          categories: "mutuals",
        }),
        // Cache for 5 minutes
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      console.error(
        `[QuotientRepository] Connections API error: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data: QuotientConnectionsApiResponse = await response.json();

    if (!data.data || data.data.length === 0) {
      return [];
    }

    // Map to domain model (no sorting - that's business logic)
    return data.data.map((item) => ({
      fid: item.fid,
      username: item.username,
      combinedScore: item.combinedScore,
      rank: item.rank,
    }));
  } catch (error) {
    console.error("[QuotientRepository] Failed to fetch mutuals:", error);
    return null;
  }
}
