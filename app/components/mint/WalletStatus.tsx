"use client";

import { useAccount } from "wagmi";
import { useContractReads } from "@/app/hooks/useContractReads";

export function WalletStatus() {
  const { isConnected } = useAccount();
  const { userMinted, maxPerWallet, isLoading } = useContractReads();

  if (!isConnected) {
    return (
      <p className="text-sm text-foreground/50">
        Connect wallet to mint
      </p>
    );
  }

  if (isLoading) {
    return (
      <p className="text-sm text-foreground/50">
        Loading...
      </p>
    );
  }

  const remaining = maxPerWallet - userMinted;
  const isMaxed = remaining <= 0;

  return (
    <p className={`text-sm ${isMaxed ? "text-amber-600" : "text-foreground/50"}`}>
      You&apos;ve minted: {userMinted} / {maxPerWallet}
      {isMaxed && " (max reached)"}
    </p>
  );
}
