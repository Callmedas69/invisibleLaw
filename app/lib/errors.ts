/**
 * Map contract error names to user-friendly messages
 */
const CONTRACT_ERROR_MESSAGES: Record<string, string> = {
  // Mint errors
  MintNotActive: "Minting is not currently active.",
  ExceedsSupply: "Not enough tokens remaining.",
  ExceedsMaxPerTx: "Maximum 5 tokens per transaction.",
  ExceedsMaxPerWallet: "You have reached your wallet limit of 5.",
  InsufficientPayment: "Insufficient ETH sent.",
  InvalidQuantity: "Invalid mint quantity.",

  // Contract state errors
  EnforcedPause: "Contract is currently paused.",

  // Wallet/transaction errors
  UserRejectedRequestError: "Transaction was cancelled.",
  InsufficientFundsError: "Insufficient ETH balance.",

  // Generic
  ContractFunctionExecutionError: "Transaction failed. Please try again.",
};

/**
 * Extract error name from various error formats
 */
function extractErrorName(error: unknown): string | null {
  if (!error) return null;

  // Handle viem/wagmi errors
  if (typeof error === "object" && error !== null) {
    const err = error as Record<string, unknown>;

    // Check for error name directly
    if (typeof err.name === "string") {
      return err.name;
    }

    // Check for cause chain (viem pattern)
    if (err.cause && typeof err.cause === "object") {
      const cause = err.cause as Record<string, unknown>;
      if (typeof cause.name === "string") {
        return cause.name;
      }
      // Recursive check for nested cause
      if (cause.cause) {
        return extractErrorName(cause.cause);
      }
    }

    // Check for shortMessage containing error name
    if (typeof err.shortMessage === "string") {
      const match = err.shortMessage.match(/reverted with.*?(\w+)\(/);
      if (match) return match[1];
    }

    // Check message for contract error patterns
    if (typeof err.message === "string") {
      for (const errorName of Object.keys(CONTRACT_ERROR_MESSAGES)) {
        if (err.message.includes(errorName)) {
          return errorName;
        }
      }
    }
  }

  return null;
}

/**
 * Get user-friendly error message from any error type
 */
export function getErrorMessage(error: unknown): string {
  // Handle null/undefined
  if (!error) return "An unknown error occurred.";

  // Try to extract known error name
  const errorName = extractErrorName(error);
  if (errorName && CONTRACT_ERROR_MESSAGES[errorName]) {
    return CONTRACT_ERROR_MESSAGES[errorName];
  }

  // User rejected - don't show as error
  if (typeof error === "object" && error !== null) {
    const err = error as Record<string, unknown>;
    const message = String(err.message || err.shortMessage || "");

    if (
      message.includes("User rejected") ||
      message.includes("user rejected") ||
      message.includes("User denied")
    ) {
      return "Transaction was cancelled.";
    }

    if (message.includes("insufficient funds")) {
      return "Insufficient ETH balance.";
    }
  }

  // Fallback to generic message
  return "Transaction failed. Please try again.";
}

/**
 * Check if error is a user rejection (should not be displayed prominently)
 */
export function isUserRejection(error: unknown): boolean {
  if (!error) return false;

  if (typeof error === "object" && error !== null) {
    const err = error as Record<string, unknown>;
    const message = String(err.message || err.shortMessage || "");

    return (
      message.includes("User rejected") ||
      message.includes("user rejected") ||
      message.includes("User denied")
    );
  }

  return false;
}
