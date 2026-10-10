# Columns

> **Draft** (Plan 0056). The accessibility contract is [columns.a11y.md](columns.a11y.md).

A grid of link cards or teasers: as many columns as fit, none narrower than `18rem`, and one column at 320px. One `<div class="kv-columns">`. It is not called Grid, which reads as the ARIA `grid` role.

- Width and gap are classes you add: `kv-columns--min-sm` (`14rem`) or `kv-columns--min-lg` (`24rem`), and `kv-columns--gap-4` or `-8`. The defaults are `18rem` and the `space-6` step.
- Headless: no CSS. Each renders a stable class, your `className` joins it, and `@kvirn-ui/theme/theme.css` styles it. No state, so no `data-*`, no client code (usable in a server component) and no ARIA or `tabindex`. `as` picks the element (a `ul` or `ol` gets `role="list"`, because WebKit drops the list role without markers), and a landmark is always your choice and must be named.
- The columns fill in DOM order. There is no `order`, `reverse` or dense packing (1.3.2, 2.4.3).

```tsx
import { Card, Columns } from '@kvirn-ui/react'

// A list of links: the count is announced.

;<Columns as="ul">
  <li>
    <Card.Root>…</Card.Root>
  </li>
  <li>
    <Card.Root>…</Card.Root>
  </li>
</Columns>
```

## Hook

`useColumns()` returns `columnsProps`, a frozen object with only the `className`.
