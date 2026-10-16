import { defineConfig } from 'vite-plus'
import { packPreset } from '../../tooling/vite-preset/pack.ts'

export default defineConfig({
  pack: {
    ...packPreset,
    // `all` is its own entry so an app that names its icons never pulls the whole set.
    entry: ['src/index.ts', 'src/all.ts'],
    deps: { neverBundle: ['react', '@kvirn-ui/react'] },
  },
})
