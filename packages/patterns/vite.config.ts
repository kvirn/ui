import { defineConfig } from 'vite-plus'
import { packPreset } from '../../tooling/vite-preset/pack.ts'

export default defineConfig({
  pack: {
    ...packPreset,
    // `fixtures` is its own entry so an adopter's bundle takes the sample content only when it imports it.
    entry: ['src/index.ts', 'src/fixtures/index.ts'],
    deps: { neverBundle: ['react', /^@kvirn-ui\//] },
    // Bundling drops module-level directives, so the whole entry is marked for React Server
    // Components, as @kvirn-ui/react does: a pattern composes client components and hooks.
    // The banner restores the directive on every output file, so rolldown's per-source-file warning is noise.
    banner: { js: "'use client'" },
    inputOptions: {
      onLog(level, log, handler) {
        if (log.code !== 'MODULE_LEVEL_DIRECTIVE') handler(level, log)
      },
    },
  },
})
