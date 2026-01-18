import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { getProofForAddress } from "@/app/lib/allowlist-service";

interface ProofResponse {
  proof: `0x${string}`[];
  isValid: boolean;
}

interface ErrorResponse {
  error: string;
}

/**
 * GET /api/allowlist/proof?address=0x...
 *
 * Gets the Merkle proof for an address.
 * Transport layer only - validates input and calls business logic.
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ProofResponse | ErrorResponse>> {
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
    const proof = await getProofForAddress(address);
    return NextResponse.json({
      proof: proof ?? [],
      isValid: proof !== null,
    });
  } catch (error) {
    console.error("Allowlist proof error:", error);
    return NextResponse.json(
      { error: "Failed to get allowlist proof" },
      { status: 500 }
    );
  }
}
