'use client';

import { useState, useEffect } from 'react';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { webConfig, miniappConfig } from './config/wagmi';
import { MiniAppProvider } from './context/MiniAppContext';
import { sdk } from '@farcaster/miniapp-sdk';
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const [isMiniApp, setIsMiniApp] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Detect miniapp mode on mount
  useEffect(() => {
    const inMiniApp = sdk.isInMiniApp();
    setIsMiniApp(inMiniApp);
    setIsHydrated(true);
  }, []);

  // Wait for hydration to prevent mismatch
  if (!isHydrated) {
    return null;
  }

  // Miniapp mode: Use Farcaster connector, no RainbowKit
  if (isMiniApp) {
    return (
      <WagmiProvider config={miniappConfig}>
        <QueryClientProvider client={queryClient}>
          <MiniAppProvider>
            {children}
          </MiniAppProvider>
        </QueryClientProvider>
      </WagmiProvider>
    );
  }

  // Web mode: Standard RainbowKit setup
  return (
    <WagmiProvider config={webConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <MiniAppProvider>
            {children}
          </MiniAppProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
