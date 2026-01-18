# Vercel Storage overview

Vercel offers a suite of managed, serverless storage products that integrate with your frontend framework.

*   [Vercel Blob](/docs/storage/vercel-blob): Large file storage
*   [Vercel Edge Config](/docs/edge-config): Global, low-latency data store

You can also find storage solutions in the [Vercel Marketplace](https://vercel.com/marketplace/category/storage).

*   Explore [Marketplace Redis (KV) integrations](https://vercel.com/marketplace?category=storage&search=redis)
*   Explore [Marketplace Postgres integrations](https://vercel.com/marketplace?category=storage&search=postgres)

## [Choosing a storage product](#choosing-a-storage-product)

The right storage solution depends on your needs for latency, durability, and consistency. This table summarizes the key differences:

| Product | Reads | Writes | Use Case | Limits | Plans |
| --- | --- | --- | --- | --- | --- |
| [Blob](/docs/storage/vercel-blob) | Fast | Milliseconds | Large, content-addressable files ("blobs") | [Learn more](/docs/storage/vercel-blob/usage-and-pricing) | Hobby, Pro |
| [Edge Config](/docs/edge-config) | Ultra-fast | Seconds | Runtime configuration (e.g., feature flags) | [Learn more](/docs/edge-config/edge-config-limits) | Hobby, Pro, Enterprise |

See [best practices](#best-practices) for optimizing your storage usage.

## [Vercel Blob](#vercel-blob)

Vercel Blob is available on [all plans](/docs/plans)

Those with the [owner, member, developer](/docs/rbac/access-roles#owner, member, developer-role) role can access this feature

Vercel Blob offers optimized storage for images, videos, and other files.

You should use Vercel Blob if you need to:

*   Store images: For example, storing user avatars or product images
*   Store videos: For example, storing user-generated video content

### [Explore Vercel Blob](#explore-vercel-blob)

*   [Overview](/docs/storage/vercel-blob)
*   [Quickstart](/docs/storage/vercel-blob/server-upload)

## [Edge Config](#edge-config)

Edge Config is available on [all plans](/docs/plans)

An Edge Config is a global data store that enables you to read data in the region closest to the user without querying an external database or hitting upstream servers. Most lookups return in less than 1ms, and 99% of reads will return under 10ms.

You should use Edge Config if you need to:

*   Fetch data at ultra-low latency: For example, you should store feature flags in an Edge Config store.
*   Store data that is read often but changes rarely: For example, you should store critical redirect URLs in an Edge Config store.
*   Read data in every region: Edge Config data is actively replicated to all regions in the Vercel CDN.

### [Explore Edge Config](#explore-edge-config)

*   [Overview](/docs/edge-config)
*   [Quickstart](/docs/edge-config/get-started)
*   [Limits & Pricing](/docs/edge-config/edge-config-limits)

## [Best practices](#best-practices)

Follow these best practices to get the most from your storage:

### [Locate your data close to your functions](#locate-your-data-close-to-your-functions)

Deploy your databases in [regions](/docs/regions) closest to your Functions. This minimizes network roundtrips and keeps response times low.

### [Optimize for high cache hit rates](#optimize-for-high-cache-hit-rates)

Vercel's CDN caches content in every region globally. Cache data fetched from your data store on the CDN using [cache headers](/docs/cdn-cache) to get the fastest response times.

[Incremental Static Regeneration](/docs/concepts/incremental-static-regeneration/overview) sets up caching headers automatically and stores generated assets globally. This gives you high availability and prevents cache-control misconfiguration.

You can also configure cache-control headers manually with [Vercel Functions](/docs/cdn-cache#using-vercel-functions) to cache responses in every CDN region. Note that Middleware runs before the CDN cache layer and cannot use cache-control headers.

## [Transferring your store](#transferring-your-store)

You can bring your Blob or Edge Config stores along with your account as you upgrade from Hobby to Pro, or downgrade from Pro to Hobby. To do so:

1.  Navigate to the [dashboard](/dashboard) and select the Storage tab
2.  Select the store that you would like to transfer
3.  Select Settings, then select Transfer Store
4.  Select a destination account or team. If you're upgrading to Pro, select your new Pro team. If downgrading, select your Hobby team

When successful, you'll be taken to the Storage tab of the account or team you transferred the store to.