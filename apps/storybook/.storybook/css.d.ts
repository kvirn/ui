// Side-effect CSS imports (the fonts and the story canvas), bundled by Vite.
declare module '*.css' {}

// theme.css as text: the preview adds and removes it for the Theme toolbar.
declare module '*.css?raw' {
  const css: string
  export default css
}
