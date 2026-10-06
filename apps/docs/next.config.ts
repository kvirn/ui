import type { NextConfig } from 'next'

// No third-party requests from the docs site (AGENTS.md, hard rule 7): no remote fonts, images or analytics.
const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: { unoptimized: true },
  // Without it `next dev` writes AGENTS.md and CLAUDE.md into the app.
  agentRules: false,
}

export default nextConfig
