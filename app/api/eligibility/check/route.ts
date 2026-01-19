import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import {
  checkEligibility,
  EligibilityResult,
} from "@/app/lib/eligibility/eligibility-service";

interface ErrorResponse {
  error: string;
}

/**
 * GET /api/eligibility/check?address=0x...&xFollowConfirmed=true&fid=12345&shareHash=0x...
 *
 * Checks eligibility for a wallet address.
 * Transport layer only - validates input and calls business logic.
 *
 * Query parameters:
 * - address: Ethereum wallet address (required)
 * - xFollowConfirmed: User's self-declaration of X follow (optional, default false)
 * - fid: Farcaster user ID from miniapp context (optional, speeds up lookup)
 * - shareHash: Cast hash to verify share requirement (optional)
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<EligibilityResult | ErrorResponse>> {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get("address");
  const xFollowConfirmed = searchParams.get("xFollowConfirmed") === "true";
  const fidParam = searchParams.get("fid");
  const fid = fidParam ? parseInt(fidParam, 10) : undefined;
  const shareHash = searchParams.get("shareHash") || undefined;

  // Input validation
  if (!address) {
    return NextResponse.json(
      { error: "Missing address parameter" },
      { status: 400 }
    );
  }

  if (!isAddress(address)) {
    return NextResponse.json(
      { error: "Invalid Ethereum address" },
      { status: 400 }
    );
  }

  // Validate fid if provided
  if (fidParam && (isNaN(fid!) || fid! <= 0)) {
    return NextResponse.json(
      { error: "Invalid fid parameter" },
      { status: 400 }
    );
  }

  // Call business logic with options
  const result = await checkEligibility(address, {
    xFollowConfirmed,
    fid,
    shareHash,
  });

  return NextResponse.json(result);
}
