import type { UserConfig } from 'vite-plus'

/** Shared `vp pack` settings for every published package: ESM and CJS, types for both, tree-shakable. */
export const packPreset = {
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: { generator: 'tsgo' },
  sourcemap: true,
  exports: false,
} satisfies UserConfig['pack']
