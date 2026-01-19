"use client";

import { DrawerNav } from "@/app/components/layout/DrawerNav";
import { MintSection } from "@/app/components/mint/MintSection";
import { MintBackground } from "@/app/components/mint/MintBackground";

export default function MintPage() {
  return (
    <>
      <DrawerNav />
      <MintBackground />
      <section className="story-section relative z-10 flex flex-col items-center justify-center px-4 sm:px-8 text-center">
        <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6 mb-6 sm:mb-12">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight">
            Mint
          </h1>
          <p className="text-lg sm:text-xl text-foreground/70 leading-relaxed">
            1272 fully on-chain generative artworks where Phi governs every
            decision.
          </p>
        </div>
        <MintSection />
      </section>
    </>
  );
}
