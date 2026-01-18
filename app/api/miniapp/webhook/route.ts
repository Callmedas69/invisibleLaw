import { NextRequest, NextResponse } from "next/server";
import {
  parseWebhookEvent,
  verifyAppKeyWithNeynar,
  ParseWebhookEvent,
} from "@farcaster/miniapp-node";
import {
  saveNotificationToken,
  deleteNotificationToken,
} from "@/app/lib/repositories/notification-repository";

/**
 * POST /api/miniapp/webhook
 *
 * Receives webhook events from Farcaster for miniapp events.
 * Uses JSON Farcaster Signature (JFS) verification via @farcaster/miniapp-node.
 *
 * Event types per Farcaster spec:
 * - miniapp_added: User added the miniapp
 * - miniapp_removed: User removed the miniapp
 * - notifications_enabled: User enabled notifications
 * - notifications_disabled: User disabled notifications
 */
export async function POST(request: NextRequest) {
  // Get raw body for JFS verification
  const body = await request.text();

  try {
    // Parse and verify the webhook event using Farcaster's JFS format
    // This validates the signature using Neynar to check app keys
    const data = await parseWebhookEvent(body, verifyAppKeyWithNeynar);

    const { event, fid } = data;

    console.log(`[Webhook] Received event: ${event} for FID: ${fid}`);

    // Handle different event types per Farcaster spec
    switch (event) {
      case "miniapp_added":
        // User added the miniapp
        // notificationDetails may be included if client equates adding to enabling notifications
        if (data.notificationDetails) {
          await saveNotificationToken(
            fid,
            data.notificationDetails.token,
            data.notificationDetails.url
          );
          console.log(`[Webhook] FID ${fid} added miniapp with notifications enabled`);
        } else {
          console.log(`[Webhook] FID ${fid} added the miniapp`);
        }
        break;

      case "miniapp_removed":
        // User removed the miniapp - clean up notification token
        await deleteNotificationToken(fid);
        console.log(`[Webhook] FID ${fid} removed the miniapp, token deleted`);
        break;

      case "notifications_enabled":
        // User enabled notifications - store the token
        if (data.notificationDetails) {
          await saveNotificationToken(
            fid,
            data.notificationDetails.token,
            data.notificationDetails.url
          );
          console.log(`[Webhook] FID ${fid} enabled notifications, token saved`);
        }
        break;

      case "notifications_disabled":
        // User disabled notifications - remove the token
        await deleteNotificationToken(fid);
        console.log(`[Webhook] FID ${fid} disabled notifications, token deleted`);
        break;

      default:
        console.log(`[Webhook] Unknown event type: ${event}`);
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const error = e as ParseWebhookEvent.ErrorType;

    console.error(`[Webhook] Error processing webhook: ${error.name}`, error);

    switch (error.name) {
      case "VerifyJsonFarcasterSignature.InvalidDataError":
      case "VerifyJsonFarcasterSignature.InvalidEventDataError":
        // The request data is invalid
        return NextResponse.json(
          { error: "Invalid webhook data" },
          { status: 400 }
        );

      case "VerifyJsonFarcasterSignature.InvalidAppKeyError":
        // The app key is invalid
        return NextResponse.json(
          { error: "Invalid app key" },
          { status: 401 }
        );

      case "VerifyJsonFarcasterSignature.VerifyAppKeyError":
        // Internal error verifying the app key - caller may retry
        return NextResponse.json(
          { error: "Verification error, please retry" },
          { status: 503 }
        );

      default:
        return NextResponse.json(
          { error: "Webhook processing failed" },
          { status: 500 }
        );
    }
  }
}
