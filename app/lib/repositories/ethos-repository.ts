/**
 * Ethos Repository - Data Access Layer
 *
 * Fetches raw Ethos score data. NO business logic.
 * Score evaluation happens in the business logic layer.
 */

const ETHOS_API_BASE = "https://api.ethos.network/api/v1";

/** Raw Ethos API response structure */
export interface EthosScoreResponse {
  data: {
    score: number;
  };
}

/** Repository return type */
export interface EthosScoreResult {
  score: number;
}

/**
 * Fetches the raw Ethos score for an address.
 *
 * @param address - Ethereum address to check
 * @returns Raw score data or null if not found/error
 */
export async function fetchEthosScore(
  address: string
): Promise<EthosScoreResult | null> {
  try {
    const response = await fetch(
      `${ETHOS_API_BASE}/score/address:${address}`,
      {
        method: "GET",
        headers: {
          "X-Ethos-Client": "invisiblelaw",
          "Content-Type": "application/json",
        },
        // Cache for 5 minutes
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      // User not found or API error - return null, not an error
      if (response.status === 404) {
        return null;
      }
      console.error(
        `[EthosRepository] API error: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data: EthosScoreResponse = await response.json();

    return {
      score: data.data.score,
    };
  } catch (error) {
    console.error("[EthosRepository] Failed to fetch Ethos score:", error);
    return null;
  }
}
