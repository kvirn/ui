import { defineConfig } from 'vite-plus'
import { packPreset } from '../../tooling/vite-preset/pack.ts'

export default defineConfig({
  pack: {
    ...packPreset,
    // `read-aloud` is its own entry so the optional peer stays out of the main one.
    entry: ['src/index.ts', 'src/read-aloud.ts'],
    deps: { neverBundle: ['axe-core', '@guidepup/virtual-screen-reader'] },
  },
})
