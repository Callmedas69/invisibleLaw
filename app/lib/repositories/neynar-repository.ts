/**
 * Neynar Repository - Data Access Layer
 *
 * Fetches raw Farcaster user data from Neynar API. NO business logic.
 * Score evaluation and eligibility checks happen in the business logic layer.
 */

const NEYNAR_API_BASE = "https://api.neynar.com/v2/farcaster";

function getNeynarApiKey(): string {
  const apiKey = process.env.NEYNAR_API_KEY;
  if (!apiKey) {
    throw new Error("NEYNAR_API_KEY environment variable is not set");
  }
  return apiKey;
}

/** Neynar user viewer context */
interface ViewerContext {
  following: boolean;
  followed_by: boolean;
  blocking: boolean;
  blocked_by: boolean;
}

/** Neynar user from API response */
interface NeynarApiUser {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  custody_address: string;
  score?: number;
  experimental?: {
    neynar_user_score?: number;
  };
  viewer_context?: ViewerContext;
  verified_addresses?: {
    eth_addresses: string[];
    sol_addresses: string[];
  };
}

/** Repository return type for user data */
export interface NeynarUserResult {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  score: number | null;
  verifiedAddresses: string[];
}

/** Repository return type for follow check */
export interface NeynarFollowResult {
  isFollowing: boolean;
}

/** Repository return type for cast lookup */
export interface NeynarCastResult {
  hash: string;
  authorFid: number;
  text: string;
  exists: boolean;
}

/**
 * Fetches Farcaster user data by wallet address.
 *
 * @param address - Ethereum wallet address
 * @returns User data or null if no Farcaster account found
 */
export async function fetchNeynarUserByAddress(
  address: string
): Promise<NeynarUserResult | null> {
  try {
    const response = await fetch(
      `${NEYNAR_API_BASE}/user/bulk-by-address?addresses=${address.toLowerCase()}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          api_key: getNeynarApiKey(),
        },
        // Cache for 5 minutes
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      console.error(
        `[NeynarRepository] API error: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data = await response.json();

    // Response format: { "0x...": [user1, user2, ...] }
    const normalizedAddress = address.toLowerCase();
    const users: NeynarApiUser[] = data[normalizedAddress];

    if (!users || users.length === 0) {
      return null;
    }

    // Take the first user (primary account for this address)
    const user = users[0];

    // Get score from either location (prefer score over experimental)
    const score = user.score ?? user.experimental?.neynar_user_score ?? null;

    return {
      fid: user.fid,
      username: user.username,
      displayName: user.display_name,
      pfpUrl: user.pfp_url,
      score,
      verifiedAddresses: user.verified_addresses?.eth_addresses ?? [],
    };
  } catch (error) {
    console.error("[NeynarRepository] Failed to fetch user by address:", error);
    return null;
  }
}

/**
 * Checks if a user (viewerFid) follows a target user (targetFid).
 *
 * Uses the bulk user endpoint with viewer_fid to get viewer_context.
 *
 * @param viewerFid - FID of the user to check (the potential follower)
 * @param targetFid - FID of the target user (the one being followed)
 * @returns Follow status or null on error
 */
/**
 * Fetches Farcaster user data by FID.
 *
 * Used when we already have the FID (e.g., from miniapp context)
 * to skip the address lookup.
 *
 * @param fid - Farcaster user ID
 * @returns User data or null if not found
 */
export async function fetchNeynarUserByFid(
  fid: number
): Promise<NeynarUserResult | null> {
  try {
    const response = await fetch(
      `${NEYNAR_API_BASE}/user/bulk?fids=${fid}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          api_key: getNeynarApiKey(),
        },
        // Cache for 5 minutes
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      console.error(
        `[NeynarRepository] API error: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data = await response.json();

    // Response format: { users: [user1, ...] }
    const users: NeynarApiUser[] = data.users;

    if (!users || users.length === 0) {
      return null;
    }

    const user = users[0];

    // Get score from either location (prefer score over experimental)
    const score = user.score ?? user.experimental?.neynar_user_score ?? null;

    return {
      fid: user.fid,
      username: user.username,
      displayName: user.display_name,
      pfpUrl: user.pfp_url,
      score,
      verifiedAddresses: user.verified_addresses?.eth_addresses ?? [],
    };
  } catch (error) {
    console.error("[NeynarRepository] Failed to fetch user by FID:", error);
    return null;
  }
}

/**
 * Checks if a user (viewerFid) follows a target user (targetFid).
 *
 * Uses the bulk user endpoint with viewer_fid to get viewer_context.
 *
 * @param viewerFid - FID of the user to check (the potential follower)
 * @param targetFid - FID of the target user (the one being followed)
 * @returns Follow status or null on error
 */
export async function checkNeynarFollowStatus(
  viewerFid: number,
  targetFid: number
): Promise<NeynarFollowResult | null> {
  try {
    // Fetch target user with viewer context
    const response = await fetch(
      `${NEYNAR_API_BASE}/user/bulk?fids=${targetFid}&viewer_fid=${viewerFid}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          api_key: getNeynarApiKey(),
        },
        // Cache for 1 minute (follow status can change)
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      console.error(
        `[NeynarRepository] API error: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data = await response.json();

    // Response format: { users: [user1, ...] }
    const users: NeynarApiUser[] = data.users;

    if (!users || users.length === 0) {
      return null;
    }

    const user = users[0];

    // viewer_context.following = true means viewer follows this user
    const isFollowing = user.viewer_context?.following ?? false;

    return {
      isFollowing,
    };
  } catch (error) {
    console.error("[NeynarRepository] Failed to check follow status:", error);
    return null;
  }
}

/**
 * Fetches Farcaster usernames for multiple FIDs in bulk.
 *
 * Used to verify usernames before building share text with mentions.
 * Neynar is the authoritative source for Farcaster usernames.
 *
 * @param fids - Array of Farcaster user IDs
 * @returns Map of FID to username, or null on error
 */
export async function fetchNeynarUsersByFids(
  fids: number[]
): Promise<Map<number, string> | null> {
  if (fids.length === 0) {
    return new Map();
  }

  try {
    // Neynar bulk endpoint accepts comma-separated FIDs
    const fidsParam = fids.join(",");
    const response = await fetch(
      `${NEYNAR_API_BASE}/user/bulk?fids=${fidsParam}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          api_key: getNeynarApiKey(),
        },
        // Cache for 5 minutes
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      console.error(
        `[NeynarRepository] API error: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data = await response.json();

    // Response format: { users: [user1, user2, ...] }
    const users: NeynarApiUser[] = data.users;

    if (!users) {
      return new Map();
    }

    // Map FID to username
    const fidToUsername = new Map<number, string>();
    for (const user of users) {
      fidToUsername.set(user.fid, user.username);
    }

    return fidToUsername;
  } catch (error) {
    console.error("[NeynarRepository] Failed to fetch users by FIDs:", error);
    return null;
  }
}

/**
 * Fetches a cast by its hash.
 *
 * Data fetching ONLY - no business logic.
 *
 * @param hash - The cast hash to look up
 * @returns Cast data or null if not found
 */
export async function fetchCastByHash(
  hash: string
): Promise<NeynarCastResult | null> {
  try {
    const response = await fetch(
      `${NEYNAR_API_BASE}/cast?identifier=${hash}&type=hash`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          api_key: getNeynarApiKey(),
        },
        // No caching for cast lookups - prevents cached 404 responses
        // when a cast is just created but not yet indexed by Neynar
        next: { revalidate: 0 },
      }
    );

    if (!response.ok) {
      // 404 means cast not found - not an error, just doesn't exist
      if (response.status === 404) {
        return null;
      }
      console.error(
        `[NeynarRepository] API error: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data = await response.json();

    // Response format: { cast: { hash, author: { fid }, text, ... } }
    const cast = data.cast;

    if (!cast) {
      return null;
    }

    return {
      hash: cast.hash,
      authorFid: cast.author?.fid ?? 0,
      text: cast.text ?? "",
      exists: true,
    };
  } catch (error) {
    console.error("[NeynarRepository] Failed to fetch cast by hash:", error);
    return null;
  }
}
