/**
 * Eligibility configuration for allowlist access.
 *
 * Score requirements: User must pass AT LEAST ONE score threshold.
 * Social requirements: User must follow BOTH accounts.
 */

export const ELIGIBILITY_CONFIG = {
  /** Score thresholds - need at least ONE to pass */
  thresholds: {
    ethos: 1300,     // Ethos score range: 0-2800
    neynar: 0.7,     // Neynar score range: 0-1
    quotient: 0.6,   // Quotient score range: 0-1
  },

  /** Social follow requirements - need BOTH to pass */
  social: {
    x: {
      username: "invisiblelaw",
      profileUrl: "https://x.com/invisiblelaw",
    },
    farcaster: {
      username: "geoart",
      fid: 1419696, // Farcaster ID (number) - configure when known
    },
  },

  /** Quotient API configuration */
  quotient: {
    queryId: "PLACEHOLDER_QUERY_ID", // From Quotient dashboard
  },
} as const;

/** Type for eligibility thresholds */
export type EligibilityThresholds = typeof ELIGIBILITY_CONFIG.thresholds;

/** Type for social configuration */
export type SocialConfig = typeof ELIGIBILITY_CONFIG.social;
