import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';

/**
 * Web configuration - Standard RainbowKit setup
 * Used when running as a standalone web application
 */
export const webConfig = getDefaultConfig({
  appName: 'Invisible Law',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [base],
  ssr: true,
});

/**
 * Miniapp configuration - Farcaster connector
 * Used when running inside Warpcast as a miniapp
 */
export const miniappConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [farcasterMiniApp()],
  ssr: true,
});

// Default export for backwards compatibility
export const config = webConfig;
