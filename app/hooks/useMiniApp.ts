"use client";

import { useMiniAppContext } from "@/app/context/MiniAppContext";

/**
 * Hook for accessing miniapp functionality
 *
 * Provides a convenient way to access miniapp state and actions.
 * Safe to use in both miniapp and web contexts.
 */
export function useMiniApp() {
  const context = useMiniAppContext();

  return {
    /** Whether running inside Farcaster */
    isMiniApp: context.isMiniApp,

    /** Whether SDK is ready */
    isReady: context.isReady,

    /** User's Farcaster FID (null in web mode or if not available) */
    fid: context.context?.user?.fid ?? null,

    /** User's Farcaster username (null in web mode or if not available) */
    username: context.context?.user?.username ?? null,

    /** User's Farcaster display name (null in web mode or if not available) */
    displayName: context.context?.user?.displayName ?? null,

    /** User's Farcaster profile image (null in web mode or if not available) */
    pfpUrl: context.context?.user?.pfpUrl ?? null,

    /** Full context */
    miniAppContext: context.context,

    /** Open URL (uses Farcaster browser in miniapp, new tab in web) */
    openUrl: context.openUrl,

    /** Close the miniapp (no-op in web mode) */
    close: context.close,

    /** Prompt to add miniapp to home screen (no-op in web mode) */
    addMiniApp: context.addMiniApp,

    /** Open composer to create a cast, returns cast hash (null in web mode) */
    composeCast: context.composeCast,
  };
}
