"use client";

interface ScoreCardProps {
  provider: "ethos" | "neynar" | "quotient";
  score: number | null;
  threshold: number;
  passes: boolean;
  error: string | null;
  isLoading?: boolean;
}

const PROVIDER_INFO = {
  ethos: {
    name: "Ethos",
    description: "Credibility score",
    maxScore: 2800,
    format: (score: number) => score.toLocaleString(),
    formatThreshold: (threshold: number) => threshold.toLocaleString(),
  },
  neynar: {
    name: "Neynar",
    description: "Farcaster social score",
    maxScore: 1,
    format: (score: number) => score.toFixed(2),
    formatThreshold: (threshold: number) => threshold.toFixed(2),
  },
  quotient: {
    name: "Quotient",
    description: "Quality score",
    maxScore: 1,
    format: (score: number) => score.toFixed(2),
    formatThreshold: (threshold: number) => threshold.toFixed(2),
  },
};

export function ScoreCard({
  provider,
  score,
  threshold,
  passes,
  error,
  isLoading = false,
}: ScoreCardProps) {
  const info = PROVIDER_INFO[provider];

  // Calculate percentage for visual representation
  const percentage =
    score !== null ? Math.min((score / info.maxScore) * 100, 100) : 0;

  return (
    <div className="border border-foreground/20 p-3 sm:p-4">
      {/* Mobile: 3-column grid for consistent alignment across cards */}
      <div className="grid sm:hidden grid-cols-[1fr_auto_auto] items-center gap-2">
        {/* Column 1: Name + Description */}
        <span className="font-medium">
          {info.name}{" "}
          <span className="text-xs font-normal italic text-foreground/50">
            ({info.description})
          </span>
        </span>

        {/* Column 2: Score */}
        {isLoading ? (
          <span className="text-sm text-foreground/50 px-5">...</span>
        ) : error ? (
          <span className="text-sm text-foreground/50 px-5">-</span>
        ) : (
          <span className="text-foreground/50 text-sm px-5">
            {score !== null ? info.format(score) : ""} /{" "}
            {info.formatThreshold(threshold)}
          </span>
        )}

        {/* Column 3: Status */}
        {isLoading ? (
          <span className="text-sm text-foreground/50">...</span>
        ) : error ? (
          <span className="text-sm text-foreground/40">FAIL</span>
        ) : (
          <span
            className={
              passes
                ? "text-green-600 font-medium text-sm"
                : "text-foreground/40 text-sm"
            }
          >
            {passes ? "PASS" : "FAIL"}
          </span>
        )}
      </div>

      {/* Desktop: Original stacked layout with progress bar */}
      <div className="hidden sm:block space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">{info.name}</h3>
            <p className="text-xs text-foreground/50">{info.description}</p>
          </div>

          {/* Status indicator */}
          {isLoading ? (
            <span className="text-sm text-foreground/50">Loading...</span>
          ) : passes ? (
            <span className="text-sm text-green-600 font-medium">PASS</span>
          ) : (
            <span className="text-sm text-foreground/40">FAIL</span>
          )}
        </div>

        {/* Score display */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="h-8 bg-foreground/10 animate-pulse" />
          ) : error ? (
            <p className="text-sm text-foreground/50">{error}</p>
          ) : (
            <>
              {/* Score value */}
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-serif font-medium">
                  {score !== null ? info.format(score) : "—"}
                </span>
                <span className="text-foreground/50">
                  / {info.formatThreshold(threshold)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-foreground/10 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ease-out ${
                    passes ? "bg-green-600" : "bg-foreground/30"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
