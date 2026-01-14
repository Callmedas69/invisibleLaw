"use client";

import { MintStatus } from "./MintStatus";
import { MintControls } from "./MintControls";
import { WalletStatus } from "./WalletStatus";

export function MintSection() {
  return (
    <section className="w-full max-w-md mx-auto">
      <div className="border border-foreground/10 bg-background p-6 sm:p-8 space-y-8">
        {/* Supply and status */}
        <MintStatus />

        {/* Divider */}
        <div className="h-px bg-foreground/10" />

        {/* Mint controls */}
        <MintControls />

        {/* Divider */}
        <div className="h-px bg-foreground/10" />

        {/* Wallet status */}
        <div className="text-center">
          <WalletStatus />
        </div>
      </div>
    </section>
  );
}
