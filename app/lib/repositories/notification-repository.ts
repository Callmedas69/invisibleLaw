/**
 * Notification Repository
 *
 * Handles storage and retrieval of Farcaster notification tokens.
 * Uses Upstash Redis for persistence.
 *
 * MUST NOT:
 * - Contain business logic
 * - Make authorization decisions
 */

import { Redis } from "@upstash/redis";

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_KV_REST_API_URL!,
  token: process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN!,
});

/** Redis key prefix for notification tokens */
const NOTIFICATION_TOKEN_PREFIX = "notification:token:";

/** Notification token data structure */
export interface NotificationToken {
  /** Farcaster ID */
  fid: number;
  /** Notification token from Farcaster */
  token: string;
  /** URL for sending notifications */
  url: string;
  /** Timestamp when token was saved */
  savedAt: number;
}

/**
 * Save a notification token for a Farcaster user.
 *
 * @param fid - Farcaster user ID
 * @param token - Notification token
 * @param url - URL for sending notifications
 */
export async function saveNotificationToken(
  fid: number,
  token: string,
  url: string
): Promise<void> {
  const key = `${NOTIFICATION_TOKEN_PREFIX}${fid}`;
  const data: NotificationToken = {
    fid,
    token,
    url,
    savedAt: Date.now(),
  };

  // Store with no expiry - tokens are managed by Farcaster
  await redis.set(key, JSON.stringify(data));
}

/**
 * Retrieve a notification token for a Farcaster user.
 *
 * @param fid - Farcaster user ID
 * @returns Notification token data or null if not found
 */
export async function getNotificationToken(
  fid: number
): Promise<NotificationToken | null> {
  const key = `${NOTIFICATION_TOKEN_PREFIX}${fid}`;
  const data = await redis.get<string>(key);

  if (!data) {
    return null;
  }

  try {
    return JSON.parse(data) as NotificationToken;
  } catch {
    // Invalid data format
    return null;
  }
}

/**
 * Delete a notification token for a Farcaster user.
 *
 * @param fid - Farcaster user ID
 */
export async function deleteNotificationToken(fid: number): Promise<void> {
  const key = `${NOTIFICATION_TOKEN_PREFIX}${fid}`;
  await redis.del(key);
}

/**
 * Check if a user has a notification token.
 *
 * @param fid - Farcaster user ID
 * @returns True if token exists
 */
export async function hasNotificationToken(fid: number): Promise<boolean> {
  const key = `${NOTIFICATION_TOKEN_PREFIX}${fid}`;
  return (await redis.exists(key)) === 1;
}
