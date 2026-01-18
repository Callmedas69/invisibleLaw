/**
 * Notification Service - Business Logic Layer
 *
 * Handles sending Farcaster miniapp notifications.
 * Uses the notification tokens stored in the repository.
 *
 * MUST NOT:
 * - Know about HTTP, NextRequest, NextResponse
 * - Import from "next/server"
 */

import {
  getNotificationToken,
  deleteNotificationToken,
} from "@/app/lib/repositories/notification-repository";
import { FARCASTER_CONFIG } from "@/app/config/farcaster";

/** Notification request payload per Farcaster spec */
interface SendNotificationRequest {
  notificationId: string;
  title: string;
  body: string;
  targetUrl: string;
  tokens: string[];
}

/** Notification response per Farcaster spec */
interface SendNotificationResponse {
  result: {
    successfulTokens: string[];
    invalidTokens: string[];
    rateLimitedTokens: string[];
  };
}

/** Result of sending a notification */
export interface SendNotificationResult {
  success: boolean;
  invalidToken: boolean;
  rateLimited: boolean;
}

/**
 * Send a notification to a Farcaster user.
 *
 * Uses stable notificationId for idempotency - allows safe retries within 24 hours.
 * Handles response to detect and clean up invalid tokens.
 *
 * @param fid - Farcaster user ID
 * @param notificationId - Stable ID for deduplication (e.g., "allowlist-added-123")
 * @param title - Notification title
 * @param body - Notification body
 * @param targetUrl - URL to open when notification is tapped
 * @returns Result with success status and token validity info
 */
export async function sendNotification(
  fid: number,
  notificationId: string,
  title: string,
  body: string,
  targetUrl: string
): Promise<SendNotificationResult> {
  // Get the user's notification token
  const tokenData = await getNotificationToken(fid);
  if (!tokenData) {
    console.log(`[NotificationService] No notification token for FID ${fid}`);
    return { success: false, invalidToken: false, rateLimited: false };
  }

  try {
    const request: SendNotificationRequest = {
      notificationId,
      title,
      body,
      targetUrl,
      tokens: [tokenData.token],
    };

    // Send notification via the token URL
    const response = await fetch(tokenData.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      console.error(
        `[NotificationService] Failed to send notification: ${response.status}`
      );
      return { success: false, invalidToken: false, rateLimited: false };
    }

    // Parse response to check token status
    const data: SendNotificationResponse = await response.json();
    const { successfulTokens, invalidTokens, rateLimitedTokens } = data.result;

    // Check if our token was successful
    const wasSuccessful = successfulTokens.includes(tokenData.token);
    const wasInvalid = invalidTokens.includes(tokenData.token);
    const wasRateLimited = rateLimitedTokens.includes(tokenData.token);

    // Clean up invalid token from storage
    if (wasInvalid) {
      console.log(
        `[NotificationService] Token for FID ${fid} is invalid, removing from storage`
      );
      await deleteNotificationToken(fid);
    }

    if (wasRateLimited) {
      console.warn(
        `[NotificationService] Rate limited for FID ${fid}, try again later`
      );
    }

    if (wasSuccessful) {
      console.log(`[NotificationService] Notification sent to FID ${fid}`);
    }

    return {
      success: wasSuccessful,
      invalidToken: wasInvalid,
      rateLimited: wasRateLimited,
    };
  } catch (error) {
    console.error("[NotificationService] Error sending notification:", error);
    return { success: false, invalidToken: false, rateLimited: false };
  }
}

/**
 * Send an eligibility status notification.
 *
 * Uses stable notificationId based on eligibility status for idempotency.
 *
 * @param fid - Farcaster user ID
 * @param isEligible - Whether the user is eligible
 */
export async function sendEligibilityNotification(
  fid: number,
  isEligible: boolean
): Promise<SendNotificationResult> {
  const title = isEligible ? "You're Eligible!" : "Eligibility Check Complete";
  const body = isEligible
    ? "You meet the requirements for Invisible Law. Join the allowlist now!"
    : "Check your scores to see what's needed to become eligible.";
  const targetUrl = FARCASTER_CONFIG.urls.homeUrl;

  // Stable notificationId - same notification won't be sent twice in 24h
  const notificationId = `eligibility-${isEligible ? "pass" : "fail"}-${fid}`;

  return sendNotification(fid, notificationId, title, body, targetUrl);
}

/**
 * Send an allowlist confirmation notification.
 *
 * Uses stable notificationId - user won't get duplicate "added" notifications.
 *
 * @param fid - Farcaster user ID
 */
export async function sendAllowlistNotification(
  fid: number
): Promise<SendNotificationResult> {
  const title = "Welcome to the Allowlist!";
  const body =
    "You've been added to the Invisible Law allowlist. Stay tuned for mint announcements.";
  const targetUrl = FARCASTER_CONFIG.urls.homeUrl;

  // Stable notificationId - user only gets this once
  const notificationId = `allowlist-added-${fid}`;

  return sendNotification(fid, notificationId, title, body, targetUrl);
}
