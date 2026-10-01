import type { NextConfig } from 'next'

// No third-party requests from the docs site (AGENTS.md, hard rule 7): no remote fonts, images or analytics.
const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: { unoptimized: true },
  // The workspace packages ship TypeScript source in development (package.json exports).
  transpilePackages: ['@kvirn-ui/core', '@kvirn-ui/i18n', '@kvirn-ui/react', '@kvirn-ui/theme'],
}

export default nextConfig
