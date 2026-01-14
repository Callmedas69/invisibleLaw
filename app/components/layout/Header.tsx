"use client";

import Link from "next/link";
import { CustomConnectButton } from "@/app/components/ui/CustomConnectButton";
import { MobileMenu } from "@/app/components/layout/MobileMenu";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-foreground/10">
      <div className="max-w-5xl mx-auto px-8 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="inline-flex justify-center items-center gap-2">
            <img
              src="/logo_invisible_law.svg"
              alt="Invisible Law"
              className="w-8 h-8"
            />
            <span className="font-serif text-xl sm:text-2xl lg:text-4xl font-bold tracking-tight uppercase translate-y-[5px]">
              Invisible Law
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center gap-8">
            <Link
              href="/mint"
              className="text-sm text-foreground/70 hover:text-foreground transition-colors"
            >
              Mint
            </Link>
            <Link
              href="/gallery"
              className="text-sm text-foreground/70 hover:text-foreground transition-colors"
            >
              Gallery
            </Link>
          </nav>

          {/* Mobile Navigation */}
          <MobileMenu />

          {/* Connect Button - Desktop only */}
          <div className="hidden sm:block">
            <CustomConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}
