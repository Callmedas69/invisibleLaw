import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import {
  addToAllowlistIfEligible,
  AddToAllowlistResult,
} from "@/app/lib/eligibility/eligibility-service";

interface ErrorResponse {
  error: string;
}

interface AddRequest {
  address: string;
  xFollowConfirmed: boolean;
  fid?: number;
}

/**
 * POST /api/eligibility/add
 *
 * Adds an eligible address to the allowlist.
 * Transport layer only - validates input and calls business logic.
 *
 * Request body:
 * {
 *   "address": "0x...",
 *   "xFollowConfirmed": true,
 *   "fid": 12345 // optional, from miniapp context
 * }
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<AddToAllowlistResult | ErrorResponse>> {
  // Parse request body
  let body: AddRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { address, xFollowConfirmed, fid } = body;

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

  if (typeof xFollowConfirmed !== "boolean") {
    return NextResponse.json(
      { error: "xFollowConfirmed must be a boolean" },
      { status: 400 }
    );
  }

  // Call business logic with optional fid
  const result = await addToAllowlistIfEligible(address, {
    xFollowConfirmed,
    fid,
  });

  // Return appropriate status code based on result
  if (!result.success && !result.alreadyAllowlisted) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}
