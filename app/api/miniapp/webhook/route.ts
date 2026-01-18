import { NextRequest, NextResponse } from "next/server";
import {
  parseWebhookEvent,
  verifyAppKeyWithNeynar,
  ParseWebhookEvent,
} from "@farcaster/miniapp-node";

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
