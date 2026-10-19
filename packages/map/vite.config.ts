import { defineConfig } from 'vite-plus'
import type { UserConfig } from 'vite-plus'
import { packPreset } from '../../tooling/vite-preset/pack.ts'

const banner = { js: "'use client'" }
// A module worker is ESM only, and it is loaded by URL, so the browser has nothing to resolve
// bare imports with: the worker bundles core in, and `worker.mjs` points at the built file.
const workerPack = {
  ...packPreset,
  entry: ['src/worker.ts', 'src/cluster-worker.ts'],
  format: ['esm'],
  clean: false,
  deps: { alwaysBundle: [/^@kvirn-ui\/core/], neverBundle: ['react', 'react-dom'] },
  plugins: [
    {
      name: 'kvirn-worker-url',
      renderChunk(code: string) {
        return { code: code.replace('./cluster-worker.ts', './cluster-worker.mjs'), map: null }
      },
    },
  ],
} satisfies UserConfig['pack']

export default defineConfig({
  pack: [
    {
      ...packPreset,
      entry: [
        'src/index.ts',
        'src/maplibre.ts',
        'src/leaflet.ts',
        'src/google.ts',
        'src/nominatim.ts',
      ],
      // The engine is a peer: the adopter owns the one copy and chooses whether to load it at all.
      deps: {
        neverBundle: ['react', 'react-dom', 'maplibre-gl', 'leaflet', /^@kvirn-ui\//],
      },
      banner,
      inputOptions: {
        onLog(level, log, handler) {
          if (log.code !== 'MODULE_LEVEL_DIRECTIVE') handler(level, log)
        },
      },
    },
    workerPack,
  ],
})
