import type { NextConfig } from 'next'

// No third-party requests from the docs site (AGENTS.md, hard rule 7): no remote fonts, images or analytics. The one exception is the Map examples, which load the map from geo.kvirn.com, Kvirn's own map service.
const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: { unoptimized: true },
  // Without it `next dev` writes AGENTS.md and CLAUDE.md into the app.
  agentRules: false,
  // `/search` renders per request and reads the contracts with `node:fs` (lib/contract.ts), from
  // paths the tracer can't follow; without them the function can't find the repository root.
  outputFileTracingIncludes: {
    '/search': [
      '../../pnpm-workspace.yaml',
      '../../packages/react/src/**/*.a11y.md',
      '../../packages/rich-text/src/**/*.a11y.md',
      '../../packages/map/src/**/*.a11y.md',
      '../../packages/read-aloud/src/**/*.a11y.md',
    ],
  },
}

export default nextConfig
