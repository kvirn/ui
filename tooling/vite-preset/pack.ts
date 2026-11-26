import type { UserConfig } from 'vite-plus'

/** Shared `vp pack` settings for every published package: ESM only, types for it, tree-shakable. */
export const packPreset = {
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: { generator: 'tsgo' },
  sourcemap: true,
  exports: false,
} satisfies UserConfig['pack']
