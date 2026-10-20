import { defineConfig } from 'vite-plus'
import { packPreset } from '../../tooling/vite-preset/pack.ts'

const banner = { js: "'use client'" }

export default defineConfig({
  pack: [
    {
      ...packPreset,
      entry: ['src/index.ts'],
      deps: { neverBundle: ['react', 'react-dom', /^@kvirn-ui\//] },
      banner,
      inputOptions: {
        onLog(level, log, handler) {
          if (log.code !== 'MODULE_LEVEL_DIRECTIVE') handler(level, log)
        },
      },
    },
  ],
})
