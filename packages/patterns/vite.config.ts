import { defineConfig } from 'vite-plus'
import { packPreset } from '../../tooling/vite-preset/pack.ts'

export default defineConfig({
  pack: {
    ...packPreset,
    // `fixtures` is its own entry so an adopter's bundle takes the sample content only when it imports it.
    entry: ['src/index.ts', 'src/fixtures/index.ts'],
    deps: { neverBundle: ['react', /^@kvirn-ui\//] },
  },
})
