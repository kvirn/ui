# VisuallyHidden

Text for screen readers that is not drawn, such as `, 3 results` after a visible `Search results`.

- One part: `VisuallyHidden`, also `useVisuallyHidden()`. It renders `<span class="kv-visually-hidden">`, and no role, ARIA, text or strings.
- The text stays in the accessibility tree: it is read and found. It is clipped, never `display: none`.
- Never put a focusable element inside it. For a bypass link, use [SkipLink](../skip-link/skip-link.md).
- Attributes and the `ref` reach the element. A `className` joins `kv-visually-hidden`. `as` changes the element: `as="h2"`.
- Headless: no CSS. With `@kvirn-ui/theme/theme.css` imported, `kv-visually-hidden` is the standard clip rule.

## Component

```tsx
import { VisuallyHidden } from '@kvirn-ui/react'

;<p>
  Search results<VisuallyHidden>, 3 results</VisuallyHidden>
</p>

// A heading nobody sees
<VisuallyHidden as="h2">Menu</VisuallyHidden>
```

## Hook

```tsx
import { useVisuallyHidden } from '@kvirn-ui/react'

const { visuallyHiddenProps } = useVisuallyHidden()
<span {...visuallyHiddenProps}>, 3 results</span>
```

## Accessibility

See the contract: [visually-hidden.a11y.md](visually-hidden.a11y.md).
