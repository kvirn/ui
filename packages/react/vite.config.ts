import { defineConfig } from 'vite-plus'
import { packPreset } from '../../tooling/vite-preset/pack.ts'

export default defineConfig({
  pack: {
    ...packPreset,
    // `internal` is for Kvirn packages only (Plan 0036): unstable, and not the public API.
    entry: ['src/index.ts', 'src/internal.ts'],
    deps: { neverBundle: ['react', 'react-dom', '@kvirn-ui/core', /^@kvirn-ui\/i18n(\/|$)/] },
    // Bundling drops module-level directives. Every export is client code (hooks, context),
    // so the whole entry is marked for React Server Components.
    banner: { js: "'use client'" },
  },
})
