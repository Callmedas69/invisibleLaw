"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import gsap from "gsap";
import { CustomConnectButton } from "@/app/components/ui/CustomConnectButton";

interface NavItemProps {
  href: string;
  label: string;
  onClick: () => void;
}

/**
 * NavItem
 *
 * Large menu item with arrow button on the right.
 */
function NavItem({ href, label, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      data-nav-item
      className="group flex items-center justify-between py-6 sm:py-8 border-t border-foreground/20 opacity-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
    >
      <span className="font-serif text-2xl sm:text-6xl md:text-7xl lg:text-8xl font-bold uppercase tracking-tight text-foreground transition-colors group-hover:text-foreground/70">
        {label}
      </span>
      <span className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-foreground/30 flex items-center justify-center transition-colors group-hover:bg-foreground group-hover:text-background">
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14 5l7 7m0 0l-7 7m7-7H3"
          />
        </svg>
      </span>
    </Link>
  );
}

/**
 * DrawerNav
 *
 * Full-screen menu overlay with large typography and arrow navigation.
 */
export function DrawerNav() {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [logoFailed, setLogoFailed] = useState(false);

  const open = useCallback(() => {
    setIsVisible(true);

    // Wait for DOM to update
    requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;

      document.body.style.overflow = "hidden";

      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      // Set initial state for nav items
      const items = panel.querySelectorAll("[data-nav-item]");
      const header = panel.querySelector("[data-header]");
      const tagline = panel.querySelector("[data-tagline]");

      if (prefersReducedMotion) {
        // Instant show without animations
        gsap.set(panel, { opacity: 1, scale: 1 });
        gsap.set(items, { opacity: 1, y: 0 });
        gsap.set([header, tagline], { opacity: 1 });
      } else {
        // Animate in
        gsap.fromTo(
          panel,
          { opacity: 0, scale: 0.98 },
          { opacity: 1, scale: 1, duration: 0.4, ease: "power3.out" }
        );

        gsap.fromTo(
          [header, tagline],
          { opacity: 0 },
          { opacity: 1, duration: 0.4, delay: 0.1, ease: "power2.out" }
        );

        // Animate nav items from bottom up
        gsap.fromTo(
          items,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.08,
            delay: 0.2,
            ease: "power3.out",
          }
        );
      }
    });
  }, []);

  const close = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const cleanup = () => {
      setIsVisible(false);
      document.body.style.overflow = "";
      triggerRef.current?.focus();
    };

    if (prefersReducedMotion) {
      // Instant hide without animations
      cleanup();
    } else {
      // Animate out
      gsap.to(panel, {
        opacity: 0,
        scale: 0.98,
        duration: 0.3,
        ease: "power2.in",
        onComplete: cleanup,
      });
    }
  }, []);

  // Handle escape key and focus trap
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }

      // Focus trap for Tab key
      if (e.key === "Tab" && panelRef.current) {
        const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Shift+Tab: if on first element, wrap to last
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: if on last element, wrap to first
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    },
    [close]
  );

  return (
    <>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={open}
        className="fixed top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))] sm:top-6 sm:right-6 md:top-8 md:right-8 z-50 flex items-center justify-center w-12 h-12 hover:scale-105 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 drop-shadow-lg"
        aria-label="Open menu"
      >
        {!logoFailed ? (
          <img
            src="/logo_invisible_law.svg"
            alt=""
            className="w-10 h-10"
            aria-hidden="true"
            onError={() => setLogoFailed(true)}
          />
        ) : (
          <svg
            className="w-6 h-6 text-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>

      {/* Full-screen Menu */}
      {isVisible && (
        <div
          ref={containerRef}
          className="fixed inset-0 z-[60]"
          onKeyDown={handleKeyDown}
        >
          {/* Panel */}
          <nav
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Main navigation"
            className="absolute inset-4 sm:inset-6 md:inset-8 bg-background border border-foreground/10 rounded-lg shadow-2xl flex flex-col opacity-0 pb-[max(1rem,env(safe-area-inset-bottom))]"
          >
            {/* Close Button - Top Right */}
            <div
              data-header
              className="flex justify-end p-6 sm:p-8 md:p-10 opacity-0"
            >
              <button
                type="button"
                onClick={close}
                className="flex items-center gap-2 px-4 py-2 min-h-[44px] border border-foreground/20 rounded-full hover:bg-foreground hover:text-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
                autoFocus
              >
                <span className="text-sm font-medium tracking-wide">CLOSE</span>
                <span className="text-lg">×</span>
              </button>
            </div>

            {/* Tagline - Centered Vertically */}
            <div className="flex-1 min-h-0 flex items-center px-6 sm:px-8 md:px-10 overflow-hidden">
              <p
                data-tagline
                className="max-w-[320px] sm:max-w-lg md:max-w-2xl lg:max-w-4xl text-xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground/80 leading-snug opacity-0 italic"
              >
                Invisible laws shape our digital world.
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>
                Each piece reveals what lies beneath.
              </p>
            </div>

            {/* Navigation Links */}
            <div className="px-6 sm:px-8 md:px-10 pb-6 sm:pb-8 md:pb-10 overflow-y-auto flex-shrink-0">
              <NavItem href="/" label="Home" onClick={close} />
              <NavItem href="/mint" label="Mint" onClick={close} />
              <NavItem href="/eligibility" label="Eligibility" onClick={close} />
              <NavItem href="/gallery" label="Gallery" onClick={close} />

              {/* Wallet - bottom border */}
              <div
                data-nav-item
                className="flex items-center justify-between py-6 sm:py-8 border-t border-b border-foreground/20 opacity-0"
              >
                <CustomConnectButton />
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
