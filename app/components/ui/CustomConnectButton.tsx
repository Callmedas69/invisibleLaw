"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useConnect, useChainId } from "wagmi";
import { base } from "wagmi/chains";
import { useMiniApp } from "@/app/hooks/useMiniApp";
import { useEffect } from "react";

/**
 * Custom Connect Button
 *
 * Renders differently based on context:
 * - Web mode: Full RainbowKit connect button with modals
 * - Miniapp mode: Simplified status display (wallet managed by Farcaster)
 */
export function CustomConnectButton() {
  const { isMiniApp, displayName, pfpUrl } = useMiniApp();

  // Miniapp mode: Show simplified wallet status
  if (isMiniApp) {
    return <MiniAppConnectButton />;
  }

  // Web mode: Full RainbowKit button
  return <WebConnectButton />;
}

/**
 * Miniapp Connect Button
 *
 * Auto-connects using Farcaster connector and shows simplified status.
 */
function MiniAppConnectButton() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const chainId = useChainId();
  const { displayName, pfpUrl } = useMiniApp();

  // Auto-connect on mount using the Farcaster connector
  useEffect(() => {
    if (!isConnected && !isConnecting && connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  }, [isConnected, isConnecting, connect, connectors]);

  // Connecting state
  if (isConnecting || !isConnected) {
    return (
      <div className="px-4 py-2 min-h-[44px] text-sm text-muted-foreground animate-pulse">
        Connecting...
      </div>
    );
  }

  // Wrong chain
  const isWrongChain = chainId !== base.id;
  if (isWrongChain) {
    return (
      <div className="px-4 py-2 min-h-[44px] text-sm font-medium bg-red-600 text-white">
        Wrong Network
      </div>
    );
  }

  // Truncate address
  const truncatedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  // Connected state
  return (
    <div className="flex items-center gap-2">
      {/* Chain indicator */}
      <div
        className="flex items-center justify-center w-11 h-11 bg-foreground/5"
        aria-label="Connected to Base"
      >
        <div
          className="flex items-center justify-center w-5 h-5 rounded-full"
          style={{ backgroundColor: "#0052FF" }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="10" fill="white" />
          </svg>
        </div>
      </div>

      {/* Account display */}
      <div className="flex items-center gap-2 px-3 py-2 min-h-[44px] text-sm bg-foreground/5">
        {pfpUrl ? (
          <img
            src={pfpUrl}
            alt="Profile"
            className="w-5 h-5 rounded-full"
          />
        ) : (
          <span className="w-5 h-5 rounded-full bg-foreground/20" />
        )}
        <span className="hidden sm:inline">
          {displayName || truncatedAddress}
        </span>
      </div>
    </div>
  );
}

/**
 * Web Connect Button
 *
 * Full RainbowKit connect button for standalone web usage.
 */
function WebConnectButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              // Not connected
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="px-4 py-2 min-h-[44px] text-sm font-medium bg-foreground text-background
                      hover:bg-foreground/90 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 transition-all"
                  >
                    Connect
                  </button>
                );
              }

              // Wrong chain
              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="px-4 py-2 min-h-[44px] text-sm font-medium bg-red-600 text-white
                      hover:bg-red-700 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-red-600 transition-all"
                  >
                    Wrong Network
                  </button>
                );
              }

              // Connected
              return (
                <div className="flex items-center gap-2">
                  {/* Chain button - icon only */}
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="flex items-center justify-center w-11 h-11
                      bg-foreground/5 hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 transition-colors"
                    aria-label={`Connected to ${chain.name}`}
                  >
                    {chain.hasIcon && chain.iconUrl ? (
                      <img
                        alt={chain.name ?? "Chain icon"}
                        src={chain.iconUrl}
                        className="w-5 h-5"
                      />
                    ) : (
                      <span className="w-5 h-5 bg-foreground/20 rounded-full" />
                    )}
                  </button>

                  {/* Account button */}
                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="flex items-center gap-2 px-3 py-2 min-h-[44px] text-sm
                      bg-foreground/5 hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 transition-colors"
                  >
                    {/* Avatar - always visible */}
                    {account.ensAvatar ? (
                      <img
                        alt="ENS Avatar"
                        src={account.ensAvatar}
                        className="w-5 h-5 rounded-full"
                      />
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-foreground/20" />
                    )}

                    {/* Address - hidden on small screens */}
                    <span className="hidden sm:inline">
                      {account.ensName || account.displayName}
                    </span>
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
