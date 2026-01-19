"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import gsap from "gsap";
import { contractAddress } from "@/app/config/contract";

interface MintSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  txHash: `0x${string}` | undefined;
  quantity: number;
}

const BASESCAN_TX_URL = "https://basescan.org/tx";
const OPENSEA_COLLECTION_URL = `https://opensea.io/assets/base/${contractAddress}`;

/**
 * MintSuccessModal
 *
 * Displays after a successful mint with transaction details and navigation links.
 */
export function MintSuccessModal({
  isOpen,
  onClose,
  txHash,
  quantity,
}: MintSuccessModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState(false);

  // Truncate transaction hash for display
  const truncatedHash = txHash
    ? `${txHash.slice(0, 6)}...${txHash.slice(-4)}`
    : "";

  // Copy hash to clipboard
  const copyHash = useCallback(async () => {
    if (!txHash) return;
    try {
      await navigator.clipboard.writeText(txHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may fail in some contexts
    }
  }, [txHash]);

  // Open animation
  useEffect(() => {
    if (!isOpen) return;

    const backdrop = backdropRef.current;
    const panel = panelRef.current;
    if (!backdrop || !panel) return;

    // Lock body scroll
    document.body.style.overflow = "hidden";

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      gsap.set(backdrop, { opacity: 1 });
      gsap.set(panel, { opacity: 1, scale: 1 });
    } else {
      gsap.fromTo(
        backdrop,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: "power2.out" }
      );
      gsap.fromTo(
        panel,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.3, ease: "power3.out" }
      );
    }

    // Focus the close button
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle close with animation
  const handleClose = useCallback(() => {
    const backdrop = backdropRef.current;
    const panel = panelRef.current;
    if (!backdrop || !panel) {
      onClose();
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      onClose();
    } else {
      gsap.to(backdrop, { opacity: 0, duration: 0.2, ease: "power2.in" });
      gsap.to(panel, {
        opacity: 0,
        scale: 0.95,
        duration: 0.2,
        ease: "power2.in",
        onComplete: onClose,
      });
    }
  }, [onClose]);

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    },
    [handleClose]
  );

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, a[href], [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm opacity-0"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mint-success-title"
        className="relative w-full max-w-sm bg-background border border-foreground/10 shadow-2xl opacity-0 scale-95"
      >
        {/* Close Button */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={handleClose}
          className="absolute top-3 right-3 p-2 hover:bg-foreground/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
          aria-label="Close"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Content */}
        <div className="p-4 sm:p-6 pt-10 sm:pt-12 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="w-12 h-12 rounded-full bg-green-600/10 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h2
            id="mint-success-title"
            className="font-serif text-2xl font-bold mb-2"
          >
            Success!
          </h2>

          {/* Quantity */}
          <p className="text-foreground/70 mb-4 sm:mb-6">
            You minted {quantity} NFT{quantity > 1 ? "s" : ""}
          </p>

          {/* Transaction Hash */}
          {txHash && (
            <div className="mb-4 sm:mb-6">
              <p className="text-xs text-foreground/50 uppercase tracking-wide mb-2">
                Transaction
              </p>
              <div className="flex items-center justify-center gap-2">
                <code className="font-mono text-sm text-foreground/80">
                  {truncatedHash}
                </code>
                <button
                  type="button"
                  onClick={copyHash}
                  className="p-1.5 hover:bg-foreground/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
                  aria-label={copied ? "Copied" : "Copy transaction hash"}
                >
                  {copied ? (
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Action Links */}
          <div className="flex flex-col gap-3 mb-4 sm:mb-6">
            {txHash && (
              <a
                href={`${BASESCAN_TX_URL}/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-4 border border-foreground/20 hover:bg-foreground/5 transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
              >
                View on BaseScan
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}
            <a
              href={OPENSEA_COLLECTION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-4 border border-foreground/20 hover:bg-foreground/5 transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
            >
              View on OpenSea
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>

          {/* Done Button */}
          <button
            type="button"
            onClick={handleClose}
            className="w-full py-3 bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
