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
  const [isDetected, setIsDetected] = useState(false);

  // Detect miniapp mode on mount
  useEffect(() => {
    const detectMiniApp = async () => {
      const inMiniApp = await sdk.isInMiniApp();
      setIsMiniApp(inMiniApp);
      setIsDetected(true);
    };
    detectMiniApp();
  }, []);

  // Use webConfig as default, switch to miniappConfig once detected as miniapp
  const config = isDetected && isMiniApp ? miniappConfig : webConfig;

  // Always include RainbowKitProvider to ensure hooks work during static generation.
  // CustomConnectButton handles mode switching internally (miniapp vs web).
  return (
    <WagmiProvider config={config}>
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
