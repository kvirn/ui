// The initial Mode and Contrast, set per storybook Vitest project in the root vite.config.ts
//. Vite replaces them at build time; unset in `storybook dev` and `storybook build`.
interface ImportMetaEnv {
  readonly VITE_STORYBOOK_MODE?: string
  readonly VITE_STORYBOOK_CONTRAST?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
