import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Farcaster manifest - allow cross-origin access
        source: "/.well-known/farcaster.json",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cache-Control", value: "public, max-age=3600" },
        ],
      },
      {
        // Allow Farcaster clients to embed the app in iframe
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://*.farcaster.xyz https://warpcast.com",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
