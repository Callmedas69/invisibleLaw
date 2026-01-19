"use client";

import Link from "next/link";
import { Footer } from "@/app/components/layout/Footer";
import { DrawerNav } from "@/app/components/layout/DrawerNav";
import { StorySection } from "@/app/components/home/StorySection";
import { ScrollSnapController } from "@/app/components/home/ScrollSnapController";
import { ScrollProvider } from "@/app/context/ScrollContext";
import { GeometricArrows } from "@/app/components/ui/GeometricArrows";
import { PHI_POSITIONS, BAUHAUS_COLORS } from "@/app/config/theme";

export default function Home() {
  return (
    <>
      <DrawerNav />
      <ScrollProvider>
        <ScrollSnapController />

        <main id="main-content">
          {/* Section 1: Hero */}
          <StorySection id="hero" className="bg-background relative overflow-hidden">
            {/* Geometric decoration */}
            <GeometricArrows id="hero" />

            <div className="relative z-10 text-center space-y-8">
              <p className="text-sm uppercase tracking-[0.3em] text-foreground/60">
                Invisible Law
              </p>
              <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl tracking-tight leading-none">
                The Golden Ratio
                <br />
                <span className="text-foreground/70">Made Visible</span>
              </h1>
              <div className="flex justify-center gap-4 pt-8">
                {BAUHAUS_COLORS.slice(0, 5).map((color, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 sm:w-4 sm:h-4"
                    style={{ backgroundColor: color }}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
              <svg
                className="w-6 h-6 text-foreground/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
              <span className="sr-only">Scroll down</span>
            </div>
          </StorySection>

          {/* Section 2: The Question */}
          <StorySection id="question" className="bg-background">
            <div className="text-center space-y-8 max-w-3xl mx-auto">
              <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl leading-tight">
                Why do some compositions feel{" "}
                <span className="italic">harmonious</span>
                <br />
                while others feel <span className="italic">chaotic</span>?
              </h2>
              <p className="text-lg sm:text-xl text-foreground/70">
                Why does the Parthenon please the eye?
                <br />
                Why do sunflowers spiral in that particular way?
              </p>
            </div>
          </StorySection>

          {/* Section 3: The Answer - Phi */}
          <StorySection id="phi" className="bg-background">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <p className="text-sm uppercase tracking-[0.2em] text-foreground/60">
                  The Answer
                </p>
                <h2 className="font-serif text-7xl sm:text-9xl lg:text-10xl">
                  <span style={{ color: BAUHAUS_COLORS[0] }}>P</span>
                  <span style={{ color: BAUHAUS_COLORS[1] }}>h</span>
                  <span style={{ color: BAUHAUS_COLORS[3] }}>i</span>
                </h2>
                <p className="font-mono text-xl sm:text-2xl text-foreground/80">
                  1.618033988749...
                </p>
                <p className="text-base sm:text-lg text-foreground/70 leading-relaxed">
                  A ratio discovered by mathematicians but obeyed by nature long
                  before humans existed.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-foreground/70">
                <div className="border border-foreground/10 p-6 space-y-2">
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: BAUHAUS_COLORS[3] }}
                    aria-hidden="true"
                  />
                  <p>Nautilus shells</p>
                </div>
                <div className="border border-foreground/10 p-6 space-y-2">
                  <div
                    className="w-8 h-8"
                    style={{ backgroundColor: BAUHAUS_COLORS[4] }}
                    aria-hidden="true"
                  />
                  <p>Branching of trees</p>
                </div>
                <div className="border border-foreground/10 p-6 space-y-2">
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: BAUHAUS_COLORS[5] }}
                    aria-hidden="true"
                  />
                  <p>Human proportions</p>
                </div>
                <div className="border border-foreground/10 p-6 space-y-2">
                  <div
                    className="w-8 h-8"
                    style={{ backgroundColor: BAUHAUS_COLORS[6] }}
                    aria-hidden="true"
                  />
                  <p>Structure of galaxies</p>
                </div>
              </div>
            </div>
          </StorySection>

          {/* Section 4: The Phi Grid */}
          <StorySection id="grid" className="bg-background">
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">
              {/* Title - Above grid on mobile, right side on desktop */}
              <div className="order-1 lg:order-2 space-y-2 text-center lg:text-left lg:row-span-1">
                <p className="text-sm uppercase tracking-[0.2em] text-foreground/60">
                  The Foundation
                </p>
                <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl">
                  9 &times; 9 Phi Grid
                </h2>
              </div>

              {/* Visual Grid - Left side on desktop */}
              <div
                className="order-2 lg:order-1 lg:row-span-3 relative aspect-square w-full max-w-md mx-auto lg:mx-0 border border-foreground/20"
                aria-hidden="true"
              >
                {PHI_POSITIONS.map((pos, i) => (
                  <div key={`v-${i}`}>
                    <div
                      className="absolute top-0 bottom-0 w-px bg-foreground/20"
                      style={{ left: `${pos}%` }}
                    />
                    <div
                      className="absolute left-0 right-0 h-px bg-foreground/20"
                      style={{ top: `${pos}%` }}
                    />
                  </div>
                ))}
                {/* Highlight intersections */}
                {[38.2, 50, 61.8].map((x, xi) =>
                  [38.2, 50, 61.8].map((y, yi) => (
                    <div
                      key={`dot-${xi}-${yi}`}
                      className="absolute w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        backgroundColor: BAUHAUS_COLORS[(xi + yi) % 7],
                      }}
                    />
                  ))
                )}
              </div>

              {/* Grid Positions - Below grid on mobile */}
              <div className="order-3 lg:order-2 font-mono text-xs text-foreground/60 text-center lg:text-left">
                <div className="flex justify-center lg:justify-start gap-1 flex-wrap">
                  {PHI_POSITIONS.map((pos, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 bg-foreground/5"
                      style={{
                        borderBottom: `2px solid ${BAUHAUS_COLORS[i % 7]}`,
                      }}
                    >
                      {pos}%
                    </span>
                  ))}
                </div>
              </div>

              {/* Description - Below badges on mobile */}
              <div className="order-4 lg:order-2 text-center lg:text-left">
                <p className="text-sm sm:text-base text-foreground/70">
                  Phi and its powers&mdash;proportions used by Renaissance
                  masters and modern architects alike.
                </p>
              </div>
            </div>
          </StorySection>

          {/* Section 5: Visual Language */}
          <StorySection id="visual" className="bg-background">
            <div className="text-center space-y-6 sm:space-y-8">
              <div className="space-y-2 sm:space-y-4">
                <p className="text-sm uppercase tracking-[0.2em] text-foreground/60">
                  Visual Language
                </p>
                <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl">
                  Bauhaus Mosaic
                </h2>
                <p className="text-sm sm:text-lg text-foreground/70">
                  Geometric abstraction in the tradition of Kandinsky and
                  Mondrian
                </p>
              </div>

              {/* Layers */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-left">
                {[
                  { name: "Phi Grid", desc: "9×9 structural lines", color: 0 },
                  {
                    name: "Boundary Circle",
                    desc: "Central focus at radius 360",
                    color: 3,
                  },
                  {
                    name: "Mosaic Rectangles",
                    desc: "Colored tiles that breathe",
                    color: 1,
                  },
                  {
                    name: "Intersection Dots",
                    desc: "Fibonacci-sized markers",
                    color: 5,
                  },
                  {
                    name: "Concentric Rings",
                    desc: "Secondary focal points",
                    color: 4,
                  },
                  {
                    name: "Extended Lines",
                    desc: "Connections to edges",
                    color: 6,
                  },
                ].map((layer, i) => (
                  <div
                    key={i}
                    className="border border-foreground/10 p-2 sm:p-4 space-y-1"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div
                        className="w-3 h-3"
                        style={{ backgroundColor: BAUHAUS_COLORS[layer.color] }}
                        aria-hidden="true"
                      />
                      <span className="font-medium text-sm sm:text-base">{layer.name}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/60">{layer.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </StorySection>

          {/* Section 6: Rarity */}
          <StorySection id="rarity" className="bg-background">
            <div className="text-center space-y-6 sm:space-y-8">
              <div className="space-y-2 sm:space-y-4">
                <p className="text-sm uppercase tracking-[0.2em] text-foreground/60">
                  Rarity Tiers
                </p>
                <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl">
                  Not Random. Intentional.
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto text-left">
                <div className="border-l-4 border-foreground/80 pl-4 sm:pl-6 py-2 sm:py-4 space-y-1 sm:space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="font-serif text-xl">Chaos</span>
                    <span className="font-mono text-sm text-foreground/60">
                      2%
                    </span>
                  </div>
                  <p className="text-sm text-foreground/70">
                    Highest density, maximum elements &mdash; transcendent
                  </p>
                </div>

                <div
                  className="border-l-4 pl-4 sm:pl-6 py-2 sm:py-4 space-y-1 sm:space-y-2"
                  style={{ borderColor: BAUHAUS_COLORS[0] }}
                >
                  <div className="flex items-baseline justify-between">
                    <span className="font-serif text-xl">Turbulence</span>
                    <span className="font-mono text-sm text-foreground/60">
                      8%
                    </span>
                  </div>
                  <p className="text-sm text-foreground/70">
                    High density, dynamic generation
                  </p>
                </div>

                <div
                  className="border-l-4 pl-4 sm:pl-6 py-2 sm:py-4 space-y-1 sm:space-y-2"
                  style={{ borderColor: BAUHAUS_COLORS[1] }}
                >
                  <div className="flex items-baseline justify-between">
                    <span className="font-serif text-xl">Emergence</span>
                    <span className="font-mono text-sm text-foreground/60">
                      15%
                    </span>
                  </div>
                  <p className="text-sm text-foreground/70">
                    Enhanced density, elements emerging
                  </p>
                </div>

                <div
                  className="border-l-4 pl-4 sm:pl-6 py-2 sm:py-4 space-y-1 sm:space-y-2"
                  style={{ borderColor: BAUHAUS_COLORS[3] }}
                >
                  <div className="flex items-baseline justify-between">
                    <span className="font-serif text-xl">Clarity</span>
                    <span className="font-mono text-sm text-foreground/60">
                      25%
                    </span>
                  </div>
                  <p className="text-sm text-foreground/70">
                    Clear structured generation
                  </p>
                </div>

                <div
                  className="border-l-4 pl-4 sm:pl-6 py-2 sm:py-4 space-y-1 sm:space-y-2 sm:col-span-2 lg:col-span-1"
                  style={{ borderColor: BAUHAUS_COLORS[4] }}
                >
                  <div className="flex items-baseline justify-between">
                    <span className="font-serif text-xl">Harmony</span>
                    <span className="font-mono text-sm text-foreground/60">
                      50%
                    </span>
                  </div>
                  <p className="text-sm text-foreground/70">
                    Balanced generation &mdash; natural equilibrium
                  </p>
                </div>
              </div>
            </div>
          </StorySection>

          {/* Section 7: On-Chain Forever */}
          <StorySection id="onchain" className="bg-background">
            <div className="text-center space-y-4 sm:space-y-6 max-w-2xl mx-auto">
              <p className="text-sm uppercase tracking-[0.2em] text-foreground/60">
                On-Chain Forever
              </p>
              <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl leading-tight">
                No IPFS. No servers.
                <br />
                No dependencies.
              </h2>
              <p className="text-base sm:text-lg text-foreground/70 leading-relaxed">
                Each artwork exists entirely onchain. As long as the blockchain
                exists, your art exists&mdash;governed by the same invisible law
                that shapes the universe.
              </p>
              <p className="font-serif text-xl sm:text-2xl text-foreground/80 pt-2">
                Your seed. Your art. Forever.
              </p>
            </div>
          </StorySection>

          {/* Section 8: CTA */}
          <StorySection id="mint" className="bg-background relative overflow-hidden">
            {/* Geometric decoration - flipped */}
            <GeometricArrows id="cta" flipVertical />

            <div className="relative z-10 text-center space-y-6 sm:space-y-12">
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <img
                  src="/sqrt-pi.png"
                  alt="√π"
                  className="h-20 sm:h-16 md:h-24 lg:h-32 w-auto"
                />
                <h2 className="font-serif text-5xl sm:text-5xl md:text-6xl lg:text-7xl">= 1,272</h2>
              </div>
              <Link
                href="/mint"
                className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-foreground text-background font-serif text-sm sm:text-base hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground"
              >
                Mint Now
              </Link>

              <div
                className="flex justify-center gap-3 pt-8"
                aria-hidden="true"
              >
                {BAUHAUS_COLORS.map((color, i) => (
                  <div
                    key={i}
                    className="w-4 h-4"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </StorySection>
        </main>

        {/* Footer as final scroll-snap section */}
        <section className="story-section min-h-screen flex items-center justify-center">
          <Footer />
        </section>
      </ScrollProvider>
    </>
  );
}
