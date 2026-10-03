/**
 * Plain, wrapping code: no 2D scrolling and no highlighting (docs-site.md §6). The article's
 * prose styles it.
 */
export function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="docs-code">
      <code>{code}</code>
    </pre>
  )
}
