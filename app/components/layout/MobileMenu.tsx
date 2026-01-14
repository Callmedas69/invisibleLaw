"use client";

import { useState } from "react";
import Link from "next/link";
import { CustomConnectButton } from "@/app/components/ui/CustomConnectButton";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <div className="sm:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-foreground/70 hover:text-foreground transition-colors"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          {/* Animated hamburger lines */}
          <path
            className="transition-all duration-300 ease-out origin-center"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isOpen ? "M6 18L18 6" : "M4 6h16"}
            style={{
              transform: isOpen ? "translateY(0)" : "translateY(0)",
            }}
          />
          <path
            className="transition-all duration-300 ease-out"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 12h16"
            style={{
              opacity: isOpen ? 0 : 1,
              transform: isOpen ? "scaleX(0)" : "scaleX(1)",
            }}
          />
          <path
            className="transition-all duration-300 ease-out origin-center"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isOpen ? "M6 6l12 12" : "M4 18h16"}
          />
        </svg>
      </button>

      {/* Backdrop - always rendered for animation */}
      <div
        className={`fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Drawer panel - always rendered for animation */}
      <nav
        className={`fixed top-16 right-0 z-50 w-64 bg-background border-l border-foreground/10 shadow-lg h-[calc(100vh-4rem)] p-6 transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="navigation"
        aria-label="Mobile navigation"
        aria-hidden={!isOpen}
      >
        <div className="flex flex-col gap-4">
          <Link
            href="/mint"
            onClick={closeMenu}
            className="text-lg font-serif text-foreground/80 hover:text-foreground transition-colors py-2 border-b border-foreground/10"
            tabIndex={isOpen ? 0 : -1}
          >
            Mint
          </Link>
          <Link
            href="/gallery"
            onClick={closeMenu}
            className="text-lg font-serif text-foreground/80 hover:text-foreground transition-colors py-2 border-b border-foreground/10"
            tabIndex={isOpen ? 0 : -1}
          >
            Gallery
          </Link>

          {/* Wallet */}
          <div className="pt-4">
            <CustomConnectButton />
          </div>
        </div>
      </nav>
    </div>
  );
}
