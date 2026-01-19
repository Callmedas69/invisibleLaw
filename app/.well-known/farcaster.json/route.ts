import { NextResponse } from "next/server";
import { FARCASTER_CONFIG } from "@/app/config/farcaster";

/**
 * GET /.well-known/farcaster.json
 *
 * Returns the Farcaster miniapp manifest.
 * This file is required for Farcaster to recognize this app as a miniapp.
 *
 * The manifest must include:
 * - accountAssociation: Signed proof of domain ownership
 * - miniapp: App metadata for display in Warpcast
 */
export async function GET() {
  const { metadata, urls, splash } = FARCASTER_CONFIG;

  // Build the manifest per Farcaster spec
  const manifest = {
    accountAssociation: {
      "header": "eyJmaWQiOjIyNDIwLCJ0eXBlIjoiYXV0aCIsImtleSI6IjB4ZGM0MWQ2REE2QmIyRDAyYjE5MzE2QjJiZkZGMENCYjQyNjA2NDg0ZCJ9",
      "payload": "eyJkb21haW4iOiJpbnZpc2libGVsYXcuZ2VvYXJ0LnN0dWRpbyJ9",
      "signature": "1KEA9q7OK5+u/fryJbHJCr3D//VbdBEtCAyJJ9JQeUZ4tem3AbHwDM35q3QLiN74TPVfxg/3sV8zwJkJ9VutNhs="
    },
    miniapp: {
      version: "1", // Required field per Farcaster spec
      name: metadata.name,
      subtitle: metadata.subtitle,
      description: metadata.description,
      homeUrl: urls.homeUrl,
      iconUrl: urls.iconUrl,
      splashImageUrl: urls.splashImageUrl,
      splashBackgroundColor: splash.backgroundColor,
      heroImageUrl: urls.heroImageUrl,
      ogImageUrl: urls.ogImageUrl,
      primaryCategory: metadata.primaryCategory,
      tags: metadata.tags,
    },
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
