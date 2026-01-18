"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import sdk, { type Context } from "@farcaster/miniapp-sdk";

/**
 * MiniApp Context
 *
 * Provides Farcaster miniapp state and actions to all components.
 * Handles detection of miniapp environment and SDK initialization.
 */

interface MiniAppContextValue {
  /** Whether the app is running inside Farcaster (Warpcast) */
  isMiniApp: boolean;
  /** Whether the SDK has been initialized and ready() called */
  isReady: boolean;
  /** Farcaster frame context (FID, username, etc.) */
  context: Context.FrameContext | null;
  /** Open a URL using Farcaster's external browser */
  openUrl: (url: string) => void;
  /** Close the miniapp */
  close: () => void;
  /** Prompt user to add this miniapp to their home screen */
  addMiniApp: () => void;
  /** Request notification permissions */
  requestNotifications: () => Promise<boolean>;
}

const MiniAppContext = createContext<MiniAppContextValue>({
  isMiniApp: false,
  isReady: false,
  context: null,
  openUrl: () => {},
  close: () => {},
  addMiniApp: () => {},
  requestNotifications: async () => false,
});

export function MiniAppProvider({ children }: { children: ReactNode }) {
  const [isMiniApp, setIsMiniApp] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [context, setContext] = useState<Context.FrameContext | null>(null);

  // Initialize SDK and detect miniapp environment
  useEffect(() => {
    const init = async () => {
      try {
        // Check if we're inside a Farcaster miniapp
        const inMiniApp = sdk.isInMiniApp();
        setIsMiniApp(inMiniApp);

        if (inMiniApp) {
          // Get the frame context (FID, username, etc.)
          const frameContext = await sdk.context;
          setContext(frameContext);

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

  // Request notification permissions
  const requestNotifications = useCallback(async (): Promise<boolean> => {
    if (!isMiniApp) return false;

    try {
      const result = await sdk.actions.requestNotificationPermission();
      return result.state === "granted";
    } catch (error) {
      console.error("[MiniAppContext] Failed to request notifications:", error);
      return false;
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
        requestNotifications,
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
