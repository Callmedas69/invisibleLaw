"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { sdk } from "@farcaster/miniapp-sdk";

/**
 * MiniApp Context
 *
 * Provides Farcaster miniapp state and actions to all components.
 * Handles detection of miniapp environment and SDK initialization.
 */

/** User context from Farcaster SDK */
interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

/** Miniapp context from SDK */
interface MiniAppContextData {
  user: FarcasterUser;
}

interface MiniAppContextValue {
  /** Whether the app is running inside Farcaster (Warpcast) */
  isMiniApp: boolean;
  /** Whether the SDK has been initialized and ready() called */
  isReady: boolean;
  /** Farcaster context (user info, etc.) */
  context: MiniAppContextData | null;
  /** Open a URL using Farcaster's external browser */
  openUrl: (url: string) => void;
  /** Close the miniapp */
  close: () => void;
  /** Prompt user to add this miniapp to their home screen */
  addMiniApp: () => void;
}

const MiniAppContext = createContext<MiniAppContextValue>({
  isMiniApp: false,
  isReady: false,
  context: null,
  openUrl: () => {},
  close: () => {},
  addMiniApp: () => {},
});

export function MiniAppProvider({ children }: { children: ReactNode }) {
  const [isMiniApp, setIsMiniApp] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [context, setContext] = useState<MiniAppContextData | null>(null);

  // Initialize SDK and detect miniapp environment
  useEffect(() => {
    const init = async () => {
      try {
        // Check if we're inside a Farcaster miniapp
        const inMiniApp = sdk.isInMiniApp();
        setIsMiniApp(inMiniApp);

        if (inMiniApp) {
          // Get the context (user info, etc.)
          const miniAppContext = await sdk.context;
          if (miniAppContext) {
            setContext(miniAppContext as MiniAppContextData);
          }

          // Signal to Farcaster that the app is ready
          sdk.actions.ready();
          setIsReady(true);
        }
      } catch (error) {
        console.error("[MiniAppContext] Failed to initialize SDK:", error);
        setIsMiniApp(false);
        setIsReady(false);
      }
    };

    init();
  }, []);

  // Open a URL using Farcaster's external browser
  const openUrl = useCallback(
    (url: string) => {
      if (isMiniApp) {
        sdk.actions.openUrl(url);
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    },
    [isMiniApp]
  );

  // Close the miniapp
  const close = useCallback(() => {
    if (isMiniApp) {
      sdk.actions.close();
    }
  }, [isMiniApp]);

  // Prompt user to add this miniapp
  const addMiniApp = useCallback(() => {
    if (isMiniApp) {
      sdk.actions.addMiniApp();
    }
  }, [isMiniApp]);

  return (
    <MiniAppContext.Provider
      value={{
        isMiniApp,
        isReady,
        context,
        openUrl,
        close,
        addMiniApp,
      }}
    >
      {children}
    </MiniAppContext.Provider>
  );
}

/**
 * Hook to access miniapp context
 */
export function useMiniAppContext() {
  return useContext(MiniAppContext);
}
