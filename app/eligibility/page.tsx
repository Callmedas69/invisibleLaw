"use client";

import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { DrawerNav } from "@/app/components/layout/DrawerNav";
import { MintBackground } from "@/app/components/mint/MintBackground";
import { EligibilityChecker } from "@/app/components/eligibility/EligibilityChecker";

export default function EligibilityPage() {
  // Signal to Farcaster that the app is ready to display
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return (
    <>
      <DrawerNav />
      <MintBackground />
      <section className="min-h-dvh relative z-10 flex flex-col items-center justify-start py-12 sm:py-24 px-4 sm:px-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full">
          {/* Header */}
          <div className="text-center space-y-2 sm:space-y-4 mb-6 sm:mb-12">
            <h1 className="font-serif text-2xl sm:text-5xl lg:text-6xl tracking-tight">
              Check Your Eligibility
            </h1>
            <p className="text-sm sm:text-xl text-foreground/70 leading-relaxed">
              Meet the requirements to join the allowlist and get 1 FREE mint.
            </p>
          </div>

          {/* Eligibility Checker */}
          <EligibilityChecker />
        </div>
      </section>
    </>
  );
}
