// Side-effect CSS imports (the fonts and the story canvas), bundled by Vite.
declare module '*.css' {}

// theme.css as text: the preview adds and removes it for the Theme toolbar.
declare module '*.css?raw' {
  const css: string
  export default css
}

// A component's accessibility contract as text: the Docs page renders its Keyboard section
//.
declare module '*.md?raw' {
  const markdown: string
  export default markdown
}

// A fixture's source as text: "Show code" shows the code that renders a story (docs-source.ts).
declare module '*.tsx?raw' {
  const source: string
  export default source
}

// Vite's `import.meta.glob`, the one form docs-source.ts uses (eager, a named query, a default export).
interface ImportMeta {
  glob(
    patterns: string | string[],
    options: { query: string; import: string; eager: true },
  ): Record<string, unknown>
}
