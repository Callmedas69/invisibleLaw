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
 * GET /api/eligibility/check?address=0x...&xFollowConfirmed=true
 *
 * Checks eligibility for a wallet address.
 * Transport layer only - validates input and calls business logic.
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<EligibilityResult | ErrorResponse>> {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get("address");
  const xFollowConfirmed = searchParams.get("xFollowConfirmed") === "true";

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

  // Call business logic
  const result = await checkEligibility(address, xFollowConfirmed);

  return NextResponse.json(result);
}
