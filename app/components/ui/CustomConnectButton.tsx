"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function CustomConnectButton() {
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
                    className="px-4 py-2 text-sm font-medium bg-foreground text-background
                      hover:bg-foreground/90 active:scale-[0.98] transition-all"
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
                    className="px-4 py-2 text-sm font-medium bg-red-600 text-white
                      hover:bg-red-700 active:scale-[0.98] transition-all"
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
                    className="flex items-center justify-center w-9 h-9
                      bg-foreground/5 hover:bg-foreground/10 transition-colors"
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
                    className="flex items-center gap-2 px-3 py-2 text-sm
                      bg-foreground/5 hover:bg-foreground/10 transition-colors"
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
