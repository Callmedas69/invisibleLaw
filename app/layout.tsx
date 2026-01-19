import type { Metadata } from "next";
import { Benne } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { PhiGridBackground } from "./components/ui/PhiGridBackground";

const benne = Benne({
  variable: "--font-benne",
  subsets: ["latin"],
  weight: "400",
});

const APP_URL = "https://invisiblelaw.geoart.studio";

// Farcaster miniapp embed metadata
const fcMiniappFrame = {
  version: "1",
  imageUrl: `${APP_URL}/og.png`,
  button: {
    title: "Join Allowlist",
    action: {
      type: "launch_frame",
      name: "Invisible Law",
      url: `${APP_URL}/eligibility`,
      splashImageUrl: `${APP_URL}/splash-200x200.png`,
      splashBackgroundColor: "#ffffff",
    },
  },
};

export const metadata: Metadata = {
  title: "Invisible Law",
  description: "On-chain generative NFT collection based on the golden ratio",
  openGraph: {
    title: "Invisible Law",
    description:
      "Verify and join the allowlist for Invisible Law - 1,272 on-chain generative artworks governed by Phi.",
    images: [`${APP_URL}/og.png`],
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
