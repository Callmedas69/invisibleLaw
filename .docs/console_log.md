## Error Type
Build Error

## Error Message
Module not found: Can't resolve '@farcaster/miniapp-wagmi-connector'

## Build Output
./app/config/wagmi.ts:4:1
Module not found: Can't resolve '@farcaster/miniapp-wagmi-connector'
  2 | import { createConfig, http } from 'wagmi';
  3 | import { base } from 'wagmi/chains';
> 4 | import { farcasterFrame } from '@farcaster/miniapp-wagmi-connector';
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  5 |
  6 | /**
  7 |  * Web configuration - Standard RainbowKit setup

Import traces:
  Client Component Browser:
    ./app/config/wagmi.ts [Client Component Browser]
    ./app/providers.tsx [Client Component Browser]
    ./app/providers.tsx [Server Component]
    ./app/layout.tsx [Server Component]

  Client Component SSR:
    ./app/config/wagmi.ts [Client Component SSR]
    ./app/providers.tsx [Client Component SSR]
    ./app/providers.tsx [Server Component]
    ./app/layout.tsx [Server Component]

https://nextjs.org/docs/messages/module-not-found

Next.js version: 16.1.1 (Turbopack)
