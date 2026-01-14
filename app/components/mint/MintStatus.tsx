"use client";

import { useContractReads } from "@/app/hooks/useContractReads";
import { formatEthDisplay } from "@/app/lib/format";
import { ProgressBar } from "@/app/components/ui/ProgressBar";

export function MintStatus() {
  const {
    totalMinted,
    maxSupply,
    mintPrice,
    mintActive,
    paused,
    isSoldOut,
    isLoading,
  } = useContractReads();

  // Status badge
  const getStatus = () => {
    if (isLoading) return { text: "Loading...", color: "text-foreground/50" };
    if (isSoldOut) return { text: "Sold Out", color: "text-red-600" };
    if (paused) return { text: "Paused", color: "text-amber-600" };
    if (!mintActive) return { text: "Coming Soon", color: "text-foreground/50" };
    return { text: "Live", color: "text-green-600" };
  };

  const status = getStatus();

  return (
    <div className="space-y-4">
      {/* Supply count and status */}
      <div className="flex items-center justify-between">
        <div className="font-serif">
          <span className="text-2xl font-medium">{totalMinted}</span>
          <span className="text-foreground/50"> / {maxSupply}</span>
        </div>

        <span className={`text-sm font-medium ${status.color}`}>
          {status.text}
        </span>
      </div>

      {/* Progress bar */}
      <ProgressBar current={totalMinted} total={maxSupply} />

      {/* Price */}
      <p className="text-sm text-foreground/60">
        {formatEthDisplay(mintPrice)} each
      </p>
    </div>
  );
}
