import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import {
  saveNotificationToken,
  deleteNotificationToken,
} from "@/app/lib/repositories/notification-repository";

/**
 * Webhook event types from Farcaster
 */
type WebhookEventType =
  | "frame_added"
  | "frame_removed"
  | "notifications_enabled"
  | "notifications_disabled";

/**
 * Webhook payload structure
 */
interface WebhookPayload {
  event: WebhookEventType;
  notificationDetails?: {
    token: string;
    url: string;
  };
  fid: number;
}

/**
 * Verify the webhook signature from Farcaster.
 *
 * @param signature - The signature from the X-Farcaster-Signature header
 * @param body - The raw request body
 * @returns True if signature is valid
 */
function verifySignature(signature: string, body: string): boolean {
  const secret = process.env.MINIAPP_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[Webhook] MINIAPP_WEBHOOK_SECRET not configured");
    return false;
  }

  const expectedSignature = createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return signature === expectedSignature;
}

/**
 * POST /api/miniapp/webhook
 *
 * Receives webhook events from Farcaster for miniapp events.
 * Handles notification token storage/deletion.
 */
export async function POST(request: NextRequest) {
  // Get raw body for signature verification
  const body = await request.text();

  // Verify signature (optional - skip in development)
  const signature = request.headers.get("X-Farcaster-Signature");
  if (process.env.NODE_ENV === "production" && signature) {
    if (!verifySignature(signature, body)) {
      console.error("[Webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  // Parse payload
  let payload: WebhookPayload;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  const { event, fid, notificationDetails } = payload;

  console.log(`[Webhook] Received event: ${event} for FID: ${fid}`);

  // Handle different event types
  switch (event) {
    case "frame_added":
      // User added the miniapp - no action needed
      console.log(`[Webhook] FID ${fid} added the miniapp`);
      break;

    case "frame_removed":
      // User removed the miniapp - clean up notification token
      await deleteNotificationToken(fid);
      console.log(`[Webhook] FID ${fid} removed the miniapp, token deleted`);
      break;

    case "notifications_enabled":
      // User enabled notifications - store the token
      if (notificationDetails) {
        await saveNotificationToken(
          fid,
          notificationDetails.token,
          notificationDetails.url
        );
        console.log(`[Webhook] FID ${fid} enabled notifications, token saved`);
      }
      break;

    case "notifications_disabled":
      // User disabled notifications - remove the token
      await deleteNotificationToken(fid);
      console.log(
        `[Webhook] FID ${fid} disabled notifications, token deleted`
      );
      break;

    default:
      console.log(`[Webhook] Unknown event type: ${event}`);
  }

  return NextResponse.json({ success: true });
}
