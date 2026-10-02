# Prose

> **Draft** (Plan 0023). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [prose.a11y.md](prose.a11y.md).

Text set for reading: the `kv-prose` class as a component. It renders a `<div>`.

- One part: `Prose` (also `Prose.Root` and `ProseRoot`), one `<div class="kv-prose">`.
- No role, no ARIA, no text and no strings. The headings, paragraphs, lists, links and tables inside keep their own semantics.
- `render` changes the element: `<article>` or `<section aria-labelledby>`.
- Headless: no CSS. The part renders its stable class `kv-prose`, and your `className` joins it. With `@kvirn-ui/theme/theme.css` imported, the text is styled. Add `kv-prose--large` for the larger size.
- The rest of the type roles come with it: body (`kv-prose--large` for body-large), `p.kv-lead` for the lead paragraph, body-small for captions, and code, numeric and label styles for the elements that use them. A [Heading](../heading/heading.md) inside Prose keeps its own size.
- A Prose is not a container with a surface. For a region of the page, use [Section](../section/section.md), and put Prose inside it.

## Component

```tsx
import { Heading, Prose } from '@kvirn-ui/react'

;<Prose>
  <Heading level={2}>Kontakta oss</Heading>
  <p>Vi svarar vardagar 9–16.</p>
</Prose>
```

## Hook

```tsx
import { useProse } from '@kvirn-ui/react'

const prose = useProse()
<article {...prose.rootProps}>…</article>
```

## Accessibility

See the contract: [prose.a11y.md](prose.a11y.md).
