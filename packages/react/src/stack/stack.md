# Stack

> **Draft** (Plan 0056). The accessibility contract is [stack.a11y.md](stack.a11y.md).

The vertical rhythm between blocks outside prose: its children one below the other with a `space` step between them. One `<div class="kv-stack">`. Prose has its own margins; use Stack for bands, form parts and lists.

- Gap is a class you add: `kv-stack--gap-2`, `-4` or `-8`. The default is the `space-6` step and adds none.
- Headless: no CSS. Each renders a stable class, your `className` joins it, and `@kvirn-ui/theme/theme.css` styles it. No state, so no `data-*`, no client code (usable in a server component) and no ARIA or `tabindex`. `as` picks the element (a `ul` or `ol` gets `role="list"`, because WebKit drops the list role without markers), and a landmark is always your choice and must be named.

```tsx
import { Heading, Stack } from '@kvirn-ui/react'

;<Stack className="kv-stack--gap-8">
  <Heading as="h2">Kontakta oss</Heading>
  <p>Vi svarar vardagar 9–16.</p>
</Stack>

// A list: Stack adds role="list", so WebKit keeps it a list without markers.
;<Stack as="ul">
  <li>Sophämtning</li>
  <li>Bygglov</li>
</Stack>
```

## Hook

`useStack()` returns `stackProps`, a frozen object with only the `className`.
