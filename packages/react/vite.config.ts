import { defineConfig } from 'vite-plus'
import { packPreset } from '../../tooling/vite-preset/pack.ts'

export default defineConfig({
  pack: {
    ...packPreset,
    deps: { neverBundle: ['react', 'react-dom', '@kvirn-ui/core', /^@kvirn-ui\/i18n(\/|$)/] },
    // Bundling drops module-level directives. Every export is client code (hooks, context),
    // so the whole entry is marked for React Server Components.
    banner: { js: "'use client'" },
  },
})
