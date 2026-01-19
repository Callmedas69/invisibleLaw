"use client";

interface ShareCardProps {
  /** Whether the user has shared */
  hasShared: boolean;
  /** Whether the share was verified via API */
  verified: boolean;
  /** Error message if share verification failed */
  error: string | null;
  /** Loading state */
  isLoading?: boolean;
  /** Callback when user clicks share button */
  onShare: () => void;
}

export function ShareCard({
  hasShared,
  verified,
  error,
  isLoading = false,
  onShare,
}: ShareCardProps) {
  return (
    <div className="border border-foreground/20 p-3 sm:p-4 space-y-2 sm:space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-foreground/70">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </span>
          <div>
            <h3 className="font-medium">Share Miniapp</h3>
            <p className="text-xs text-foreground/50">
              Share on Farcaster to complete eligibility
            </p>
          </div>
        </div>

        {/* Status indicator */}
        {isLoading ? (
          <span className="text-sm text-foreground/50">Checking...</span>
        ) : hasShared ? (
          <span className="text-sm text-green-600 font-medium">
            {verified ? "Verified" : "Shared"}
          </span>
        ) : (
          <span className="text-sm text-foreground/40">Pending</span>
        )}
      </div>

      {/* Error message */}
      {error && !isLoading && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Share button */}
      {!hasShared && !isLoading && (
        <button
          onClick={onShare}
          className="w-full px-3 py-2 text-sm text-center min-h-[40px] flex items-center justify-center border border-foreground/20 hover:bg-foreground/5 transition-colors"
        >
          Share on Farcaster
        </button>
      )}

      {/* Verification note */}
      {hasShared && verified && (
        <p className="text-xs text-foreground/40">
          Cast verified via Neynar API
        </p>
      )}
    </div>
  );
}
