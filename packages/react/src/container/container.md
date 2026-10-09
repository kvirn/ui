# Container

> **Draft** (Plan 0056). The accessibility contract is [container.a11y.md](container.a11y.md).

A block that centres and limits the width of the page's content. One `<div class="kv-container">`.

- `size`: `'page'` (default, centred, at most `80rem`, inline padding of 16px, 24px from `40rem` and 40px from `64rem`), `'reading'` (`45rem`, for prose) or `'form'` (`40rem`). The two measures are start-aligned and add no padding.
- Headless: no CSS. Each renders a stable class, your `className` joins it, and `@kvirn-ui/theme/theme.css` styles it. No state, so no `data-*`, no client code (usable in a server component) and no role, ARIA or `tabindex`: `as` picks the element, and a landmark is always your choice and must be named.
- DOM order is the visual order. There is no way to reorder.

```tsx
import { Container } from '@kvirn-ui/react'

;<Container as="main" id="main">
  <Container size="reading" className="kv-prose">
    <h1>Sophämtning</h1>
  </Container>
</Container>
```

## Hook

`useContainer({ size })` returns `containerProps`, a frozen object with only the `className`: `<main {...useContainer({ size: 'reading' }).containerProps}>`. Add a class with `mergeProps`.
