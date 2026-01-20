import { NextRequest, NextResponse } from "next/server";
import {
  buildShareTextWithMutuals,
  ShareTextResult,
} from "@/app/lib/eligibility/eligibility-service";

interface ErrorResponse {
  error: string;
}

/**
 * GET /api/share/text?fid=12345
 *
 * Builds share text with top 5 mutual mentions.
 * Transport layer only - validates input and calls business logic.
 *
 * Query parameters:
 * - fid: Farcaster user ID (required)
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ShareTextResult | ErrorResponse>> {
  const searchParams = request.nextUrl.searchParams;
  const fidParam = searchParams.get("fid");

  // Input validation
  if (!fidParam) {
    return NextResponse.json(
      { error: "Missing fid parameter" },
      { status: 400 }
    );
  }

  const fid = parseInt(fidParam, 10);
  if (isNaN(fid) || fid <= 0) {
    return NextResponse.json(
      { error: "Invalid fid parameter" },
      { status: 400 }
    );
  }

  // Call business logic
  const result = await buildShareTextWithMutuals(fid);

  return NextResponse.json(result);
}
