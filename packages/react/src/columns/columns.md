# Columns

> **Draft** (Plan 0056). The accessibility contract is [columns.a11y.md](columns.a11y.md).

A grid of link cards or teasers: as many columns as fit, none narrower than `minColumnWidth`, and one column at 320px. One `<div class="kv-columns">`. It is not called Grid, which reads as the ARIA `grid` role.

- `minColumnWidth`: `'sm'` (`14rem`), `'md'` (default, `18rem`) or `'lg'` (`24rem`).
- `gap`: `'4'`, `'6'` (default) or `'8'`.
- Headless: no CSS. Each renders a stable class, your `className` joins it, and `@kvirn-ui/theme/theme.css` styles it. No state, so no `data-*`, no client code (usable in a server component) and no role, ARIA or `tabindex`: `render` picks the element, and a landmark is always your choice and must be named.
- The columns fill in DOM order. There is no `order`, `reverse` or dense packing (1.3.2, 2.4.3).

```tsx
import { Card, Columns } from '@kvirn-ui/react'

// A list of links: the count is announced.
// role="list": without markers WebKit drops the list role.
;<Columns render={<ul role="list" />} minColumnWidth="md" gap="6">
  <li>
    <Card.Root>…</Card.Root>
  </li>
  <li>
    <Card.Root>…</Card.Root>
  </li>
</Columns>
```

## Hook

`useColumns({ minColumnWidth, gap })` returns `columnsProps`, a frozen object with only the `className`.
