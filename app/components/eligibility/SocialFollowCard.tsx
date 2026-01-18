"use client";

interface SocialFollowCardProps {
  platform: "x" | "farcaster";
  username: string;
  profileUrl: string;
  isFollowing: boolean;
  verified: boolean;
  error: string | null;
  isLoading?: boolean;
  /** For X platform - callback when user confirms follow */
  onConfirmFollow?: () => void;
}

const PLATFORM_INFO = {
  x: {
    name: "X (Twitter)",
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  farcaster: {
    name: "Farcaster",
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M2.667 4h18.666v16H2.667V4zm2.666 2.667v10.666h13.334V6.667H5.333zm2.667 2.666h8v1.334h-8V9.333zm0 2.667h8v1.333h-8V12z" />
      </svg>
    ),
  },
};

export function SocialFollowCard({
  platform,
  username,
  profileUrl,
  isFollowing,
  verified,
  error,
  isLoading = false,
  onConfirmFollow,
}: SocialFollowCardProps) {
  const info = PLATFORM_INFO[platform];
  const isX = platform === "x";

  return (
    <div className="border border-foreground/20 p-3 sm:p-4 space-y-2 sm:space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-foreground/70">{info.icon}</span>
          <div>
            <h3 className="font-medium">{info.name}</h3>
            <p className="text-xs text-foreground/50">@{username}</p>
          </div>
        </div>

        {/* Status indicator */}
        {isLoading ? (
          <span className="text-sm text-foreground/50">Checking...</span>
        ) : isFollowing ? (
          <span className="text-sm text-green-600 font-medium">
            {verified ? "Following" : "Confirmed"}
          </span>
        ) : (
          <span className="text-sm text-foreground/40">Not following</span>
        )}
      </div>

      {/* Error message */}
      {error && !isLoading && (
        <p className="text-sm text-foreground/50">{error}</p>
      )}

      {/* Action buttons */}
      {!isFollowing && !isLoading && !error && (
        <div className="grid grid-cols-2 gap-2">
          {/* Follow link */}
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 text-sm text-center min-h-[40px] flex items-center justify-center border border-foreground/20 hover:bg-foreground/5 transition-colors"
          >
            Follow
          </a>

          {/* Self-declaration button for X */}
          {isX && onConfirmFollow && (
            <button
              onClick={onConfirmFollow}
              className="px-3 py-2 text-sm text-center min-h-[40px] flex items-center justify-center border border-foreground/20 hover:bg-foreground/5 transition-colors"
            >
              I Followed
            </button>
          )}
        </div>
      )}

      {/* Verification note */}
      {isFollowing && !verified && (
        <p className="text-xs text-foreground/40">
          Self-declared (not verified)
        </p>
      )}
    </div>
  );
}
