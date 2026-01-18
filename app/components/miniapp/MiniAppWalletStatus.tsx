"use client";

import { useAccount, useChainId } from "wagmi";
import { base } from "wagmi/chains";
import { useMiniApp } from "@/app/hooks/useMiniApp";

/**
 * MiniAppWalletStatus
 *
 * Simplified wallet display for Farcaster miniapp mode.
 * Shows connected address and chain status without connect/disconnect controls.
 * Wallet management is handled by Farcaster.
 */
export function MiniAppWalletStatus() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { displayName, pfpUrl } = useMiniApp();

  // Not connected
  if (!isConnected || !address) {
    return (
      <div className="px-3 py-2 text-sm text-muted-foreground">
        Connecting wallet...
      </div>
    );
  }

  // Wrong chain
  const isWrongChain = chainId !== base.id;
  if (isWrongChain) {
    return (
      <div className="px-4 py-2 text-sm bg-red-600 text-white">
        Wrong Network
      </div>
    );
  }

  // Truncate address for display
  const truncatedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-foreground/5">
      {/* Base chain icon */}
      <div
        className="flex items-center justify-center w-5 h-5 rounded-full"
        style={{ backgroundColor: base.iconBackground }}
      >
        {base.iconUrl && (
          <img
            src={typeof base.iconUrl === "string" ? base.iconUrl : undefined}
            alt="Base"
            className="w-3 h-3"
          />
        )}
      </div>

      {/* Profile image or placeholder */}
      {pfpUrl ? (
        <img
          src={pfpUrl}
          alt="Profile"
          className="w-5 h-5 rounded-full"
        />
      ) : (
        <span className="w-5 h-5 rounded-full bg-foreground/20" />
      )}

      {/* Display name or address */}
      <span className="text-sm">
        {displayName || truncatedAddress}
      </span>
    </div>
  );
}
