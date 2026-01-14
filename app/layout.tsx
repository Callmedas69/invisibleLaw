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

export const metadata: Metadata = {
  title: "Invisible Law",
  description: "On-chain generative NFT collection based on the golden ratio",
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
