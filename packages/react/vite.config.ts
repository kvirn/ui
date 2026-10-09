import { defineConfig } from 'vite-plus'
import type { UserConfig } from 'vite-plus'
import { packPreset } from '../../tooling/vite-preset/pack.ts'

type PackConfig = Extract<NonNullable<UserConfig['pack']>, { entry?: unknown }>

const shared = {
  ...packPreset,
  deps: { neverBundle: ['react', 'react-dom', '@kvirn-ui/core', /^@kvirn-ui\/i18n(\/|$)/] },
  // A banner restores the directive on every output file, so rolldown's per-source-file warning is noise.
  inputOptions: {
    onLog(level, log, handler) {
      if (log.code !== 'MODULE_LEVEL_DIRECTIVE') handler(level, log)
    },
  },
} satisfies Partial<PackConfig>

export default defineConfig({
  pack: [
    {
      ...shared,
      // `internal` is for Kvirn packages only (Plan 0036): unstable, and not the public API.
      entry: ['src/index.ts', 'src/internal.ts'],
      // Bundling drops module-level directives. Every export of these entries is client code
      // (hooks, context), so the whole entry is marked for React Server Components.
      banner: { js: "'use client'" },
    },
    {
      ...shared,
      // `server` (Plan 0094) is imported by Server Components, so it is its own build with no
      // banner: it shares no chunk with the client entries, and `clean: false` keeps their output.
      entry: ['src/server.ts'],
      clean: false,
    },
  ],
})
