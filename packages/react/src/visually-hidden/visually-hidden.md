# VisuallyHidden

> **Draft** (Plan 0054). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [visually-hidden.a11y.md](visually-hidden.a11y.md).

Text for screen readers that is not drawn, such as `, 3 resultat` after a visible `Sökträffar`.

- One part: `VisuallyHidden`, also `useVisuallyHidden()`. It renders `<span class="kv-visually-hidden">`, and no role, ARIA, text or strings.
- The text stays in the accessibility tree: it is read and found. It is clipped, never `display: none`.
- Never put a focusable element inside it. For a bypass link, use [SkipLink](../skip-link/skip-link.md).
- Attributes and the `ref` reach the element. A `className` joins `kv-visually-hidden`. `render` changes the element: `render={<h2 />}`.
- Headless: no CSS. With `@kvirn-ui/theme/theme.css` imported, `kv-visually-hidden` is the standard clip rule.

## Component

```tsx
import { VisuallyHidden } from '@kvirn-ui/react'

;<p>
  Sökträffar<VisuallyHidden>, 3 resultat</VisuallyHidden>
</p>

// A heading nobody sees
<VisuallyHidden render={<h2 />}>Meny</VisuallyHidden>
```

## Hook

```tsx
import { useVisuallyHidden } from '@kvirn-ui/react'

const { visuallyHiddenProps } = useVisuallyHidden()
<span {...visuallyHiddenProps}>, 3 resultat</span>
```

## Accessibility

See the contract: [visually-hidden.a11y.md](visually-hidden.a11y.md).
