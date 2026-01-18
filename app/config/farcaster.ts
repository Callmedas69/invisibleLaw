/**
 * Farcaster Miniapp Configuration
 *
 * Centralized configuration for the Farcaster miniapp.
 * All metadata and URLs are defined here for consistency.
 */

const APP_URL = process.env.NEXT_PUBLIC_DOMAIN_URL || "https://invisiblelaw.geoart.studio";

export const FARCASTER_CONFIG = {
  /** Whether miniapp mode is enabled */
  enabled: process.env.NEXT_PUBLIC_FARCASTER_MINIAPP_ENABLED === "true",

  /** App metadata for manifest */
  metadata: {
    name: "Invisible Law",
    subtitle: "Check your eligibility",
    description:
      "Verify and join the allowlist for Invisible Law - 1,272 on-chain generative artworks governed by Phi.",
    primaryCategory: "social" as const,
    tags: ["nft", "eligibility", "reputation", "allowlist"],
  },

  /** URLs */
  urls: {
    appUrl: APP_URL,
    homeUrl: `${APP_URL}/eligibility`,
    iconUrl: `${APP_URL}/iconUrl-200x200.png`,
    splashImageUrl: `${APP_URL}/splash-200x200.png`,
    heroImageUrl: `${APP_URL}/hero.png`,
    ogImageUrl: `${APP_URL}/og.png`,
    webhookUrl: `${APP_URL}/api/miniapp/webhook`,
  },

  /** Splash screen configuration */
  splash: {
    backgroundColor: "#ffffff",
  },

  /** Account association (from env vars - signed via Warpcast) */
  accountAssociation: {
    header: process.env.FARCASTER_ACCOUNT_ASSOCIATION_HEADER || "",
    payload: process.env.FARCASTER_ACCOUNT_ASSOCIATION_PAYLOAD || "",
    signature: process.env.FARCASTER_ACCOUNT_ASSOCIATION_SIGNATURE || "",
  },

  /** Check if account association is configured */
  isAccountAssociationConfigured(): boolean {
    return Boolean(
      this.accountAssociation.header &&
      this.accountAssociation.payload &&
      this.accountAssociation.signature
    );
  },
} as const;

/** Farcaster primary categories for miniapps */
export type FarcasterCategory =
  | "social"
  | "games"
  | "entertainment"
  | "utility"
  | "productivity"
  | "finance"
  | "shopping"
  | "education"
  | "health"
  | "lifestyle"
  | "news"
  | "sports"
  | "other";
