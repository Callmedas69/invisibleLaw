"use client";

import { Header } from "@/app/components/layout/Header";
import { Footer } from "@/app/components/layout/Footer";
import { MintSection } from "@/app/components/mint/MintSection";

export default function MintPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <section className="py-12 sm:py-24 px-8 sm:px-8 lg:px-12 text-center">
          <div className="max-w-2xl mx-auto space-y-6 mb-12">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight">
              Mint
            </h1>
            <p className="text-lg sm:text-xl text-foreground/70 leading-relaxed">
              618 fully on-chain generative artworks where Phi governs every
              decision.
            </p>
          </div>
          <MintSection />
        </section>
      </main>
      <Footer />
    </div>
  );
}
