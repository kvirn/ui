import { defineConfig } from 'vite-plus'
import { packPreset } from '../../tooling/vite-preset/pack.ts'

export default defineConfig({
  pack: {
    ...packPreset,
    // Tiptap and ProseMirror are peers: the adopter owns one copy of each, so ProseMirror is never
    // duplicated (its `instanceof` checks and plugin keys break silently across two copies).
    deps: {
      neverBundle: ['react', 'react-dom', /^@tiptap\//, /^@kvirn-ui\//],
    },
    // Bundling drops module-level directives. Every export is client code (hooks, the editor),
    // so the whole entry is marked for React Server Components.
    banner: { js: "'use client'" },
    // The banner restores the directive on every output file, so rolldown's per-source-file warning is noise.
    inputOptions: {
      onLog(level, log, handler) {
        if (log.code !== 'MODULE_LEVEL_DIRECTIVE') handler(level, log)
      },
    },
  },
})
