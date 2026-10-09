# CodeBlock

> **Draft** (Plan 0060). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [code-block.a11y.md](code-block.a11y.md).

A code sample with a label and a [CopyButton](../copy-button/copy-button.md). No syntax highlighting.

- Parts: `CodeBlock.Root` (`<div>`, a `group` named by the Label while one is mounted), `CodeBlock.Label` (`<p>`), `CodeBlock.Code` (`<pre>`) and `CodeBlock.Copy` (a CopyButton). Also `CodeBlockRoot`, `CodeBlockLabel`, `CodeBlockCode` and `CodeBlockCopy`, and `useCodeBlock()`.
- The code wraps and never scrolls: no scroller to reach, no 2D scrolling at 320 CSS px.
- `CodeBlock.Copy` copies the Code's text and selects it when copying fails. `text` overrides what is copied (for a `$ ` prompt you don't want in the clipboard).
- The Label is your text, so it has no message key. The copy messages are `copyButton.*`: override them with `messages` on `CodeBlock.Copy`.
- Wrap the app in `KvirnProvider`: the result is announced through it.
- Every part takes `ref` and a `className` that joins the part's class. No part takes `as`: the Root is a named group, the Label a `<p>` and the Code a `<pre>`.
- Headless: no CSS. With `@kvirn-ui/theme/theme.css` the Code is `text` on `surface`, in the mono family. It sits outside prose styling, so it looks the same in an article.

## Component

```tsx
import { CodeBlock } from '@kvirn-ui/react'

;<CodeBlock.Root>
  <CodeBlock.Label>Installera</CodeBlock.Label>
  <CodeBlock.Code>pnpm add @kvirn-ui/react</CodeBlock.Code>
  <CodeBlock.Copy />
</CodeBlock.Root>
```

## Accessibility

See the contract: [code-block.a11y.md](code-block.a11y.md).
