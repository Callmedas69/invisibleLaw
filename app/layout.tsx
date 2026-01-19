import type { Metadata } from "next";
import { Benne } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { PhiGridBackground } from "./components/ui/PhiGridBackground";
import { FARCASTER_CONFIG } from "./config/farcaster";

const benne = Benne({
  variable: "--font-benne",
  subsets: ["latin"],
  weight: "400",
});

// Farcaster miniapp embed metadata
const fcMiniappFrame = {
  version: "1",
  imageUrl: FARCASTER_CONFIG.urls.ogImageUrl,
  button: {
    title: "Join Allowlist",
    action: {
      type: "launch_frame",
      name: FARCASTER_CONFIG.metadata.name,
      url: FARCASTER_CONFIG.urls.homeUrl,
      splashImageUrl: FARCASTER_CONFIG.urls.splashImageUrl,
      splashBackgroundColor: FARCASTER_CONFIG.splash.backgroundColor,
    },
  },
};

export const metadata: Metadata = {
  title: "Invisible Law",
  description: "On-chain generative NFT collection based on the golden ratio",
  openGraph: {
    title: "Invisible Law",
    description: FARCASTER_CONFIG.metadata.description,
    images: [FARCASTER_CONFIG.urls.ogImageUrl],
  },
  other: {
    "fc:miniapp": JSON.stringify(fcMiniappFrame),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${benne.variable} antialiased`}>
        <PhiGridBackground />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
