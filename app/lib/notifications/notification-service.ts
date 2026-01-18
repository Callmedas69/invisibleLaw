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
  NotificationToken,
} from "@/app/lib/repositories/notification-repository";
import { FARCASTER_CONFIG } from "@/app/config/farcaster";

/** Notification payload structure for Farcaster */
interface FarcasterNotification {
  notificationId: string;
  title: string;
  body: string;
  targetUrl: string;
  tokens: string[];
}

/**
 * Send a notification to a Farcaster user.
 *
 * @param fid - Farcaster user ID
 * @param title - Notification title
 * @param body - Notification body
 * @param targetUrl - URL to open when notification is tapped
 * @returns True if notification was sent successfully
 */
export async function sendNotification(
  fid: number,
  title: string,
  body: string,
  targetUrl: string
): Promise<boolean> {
  // Get the user's notification token
  const tokenData = await getNotificationToken(fid);
  if (!tokenData) {
    console.log(`[NotificationService] No notification token for FID ${fid}`);
    return false;
  }

  try {
    const notification: FarcasterNotification = {
      notificationId: `${Date.now()}-${fid}`,
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
      body: JSON.stringify(notification),
    });

    if (!response.ok) {
      console.error(
        `[NotificationService] Failed to send notification: ${response.status}`
      );
      return false;
    }

    console.log(`[NotificationService] Notification sent to FID ${fid}`);
    return true;
  } catch (error) {
    console.error("[NotificationService] Error sending notification:", error);
    return false;
  }
}

/**
 * Send an eligibility status notification.
 *
 * @param fid - Farcaster user ID
 * @param isEligible - Whether the user is eligible
 */
export async function sendEligibilityNotification(
  fid: number,
  isEligible: boolean
): Promise<boolean> {
  const title = isEligible ? "You're Eligible!" : "Eligibility Check Complete";
  const body = isEligible
    ? "You meet the requirements for Invisible Law. Join the allowlist now!"
    : "Check your scores to see what's needed to become eligible.";
  const targetUrl = FARCASTER_CONFIG.urls.homeUrl;

  return sendNotification(fid, title, body, targetUrl);
}

/**
 * Send an allowlist confirmation notification.
 *
 * @param fid - Farcaster user ID
 */
export async function sendAllowlistNotification(fid: number): Promise<boolean> {
  const title = "Welcome to the Allowlist!";
  const body =
    "You've been added to the Invisible Law allowlist. Stay tuned for mint announcements.";
  const targetUrl = FARCASTER_CONFIG.urls.homeUrl;

  return sendNotification(fid, title, body, targetUrl);
}
