import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { isAllowlisted } from "@/app/lib/allowlist-service";

interface StatusResponse {
  isAllowlisted: boolean;
}

interface ErrorResponse {
  error: string;
}

/**
 * GET /api/allowlist/status?address=0x...
 *
 * Checks if an address is on the allowlist.
 * Transport layer only - validates input and calls business logic.
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<StatusResponse | ErrorResponse>> {
  const address = request.nextUrl.searchParams.get("address");

  // Input validation
  if (!address) {
    return NextResponse.json(
      { error: "Address is required" },
      { status: 400 }
    );
  }

  if (!isAddress(address)) {
    return NextResponse.json(
      { error: "Invalid Ethereum address" },
      { status: 400 }
    );
  }

  try {
    const result = await isAllowlisted(address);
    return NextResponse.json({ isAllowlisted: result });
  } catch (error) {
    console.error("Allowlist status error:", error);
    return NextResponse.json(
      { error: "Failed to check allowlist status" },
      { status: 500 }
    );
  }
}
