import { NextResponse } from "next/server";

const APP_URL = "https://invisiblelaw.geoart.studio";

/**
 * GET /.well-known/farcaster.json
 *
 * Returns the Farcaster miniapp manifest.
 * This file is required for Farcaster to recognize this app as a miniapp.
 */
export async function GET() {
  const manifest = {
    accountAssociation: {
      header:
        "eyJmaWQiOjIyNDIwLCJ0eXBlIjoiYXV0aCIsImtleSI6IjB4ZGM0MWQ2REE2QmIyRDAyYjE5MzE2QjJiZkZGMENCYjQyNjA2NDg0ZCJ9",
      payload: "eyJkb21haW4iOiJpbnZpc2libGVsYXcuZ2VvYXJ0LnN0dWRpbyJ9",
      signature:
        "1KEA9q7OK5+u/fryJbHJCr3D//VbdBEtCAyJJ9JQeUZ4tem3AbHwDM35q3QLiN74TPVfxg/3sV8zwJkJ9VutNhs=",
    },
    miniapp: {
      version: "1",
      name: "Invisible Law",
      subtitle: "Check your eligibility",
      description:
        "Verify and join the allowlist for Invisible Law - 1,272 on-chain generative artworks governed by Phi.",
      homeUrl: `${APP_URL}/eligibility`,
      iconUrl: `${APP_URL}/iconUrl-200x200.png`,
      splashImageUrl: `${APP_URL}/splash-200x200.png`,
      splashBackgroundColor: "#ffffff",
      heroImageUrl: `${APP_URL}/hero.png`,
      ogImageUrl: `${APP_URL}/og.png`,
      primaryCategory: "social",
      tags: ["nft", "eligibility", "reputation", "allowlist"],
      noindex: true,
    },
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
