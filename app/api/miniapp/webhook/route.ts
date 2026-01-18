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

    console.log(`[Webhook] Received event: ${data.event} for FID: ${data.fid}`);

    // Handle different event types per Farcaster spec
    // data is a discriminated union based on event type
    if (data.event === "miniapp_added") {
      // User added the miniapp
      // notificationDetails may be included if client equates adding to enabling notifications
      if (data.notificationDetails) {
        await saveNotificationToken(
          data.fid,
          data.notificationDetails.token,
          data.notificationDetails.url
        );
        console.log(`[Webhook] FID ${data.fid} added miniapp with notifications enabled`);
      } else {
        console.log(`[Webhook] FID ${data.fid} added the miniapp`);
      }
    } else if (data.event === "miniapp_removed") {
      // User removed the miniapp - clean up notification token
      await deleteNotificationToken(data.fid);
      console.log(`[Webhook] FID ${data.fid} removed the miniapp, token deleted`);
    } else if (data.event === "notifications_enabled") {
      // User enabled notifications - store the token
      await saveNotificationToken(
        data.fid,
        data.notificationDetails.token,
        data.notificationDetails.url
      );
      console.log(`[Webhook] FID ${data.fid} enabled notifications, token saved`);
    } else if (data.event === "notifications_disabled") {
      // User disabled notifications - remove the token
      await deleteNotificationToken(data.fid);
      console.log(`[Webhook] FID ${data.fid} disabled notifications, token deleted`);
    } else {
      console.log(`[Webhook] Unknown event type`);
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
