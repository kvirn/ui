import { defineConfig } from 'vite-plus'
import { packPreset } from '../../tooling/vite-preset/pack.ts'

export default defineConfig({
  pack: {
    ...packPreset,
    entry: ['src/index.ts', 'src/maplibre.ts'],
    // The engine is a peer: the adopter owns the one copy and chooses whether to load it at all.
    deps: {
      neverBundle: ['react', 'react-dom', 'maplibre-gl', /^@kvirn-ui\//],
    },
    banner: { js: "'use client'" },
    inputOptions: {
      onLog(level, log, handler) {
        if (log.code !== 'MODULE_LEVEL_DIRECTIVE') handler(level, log)
      },
    },
  },
})
