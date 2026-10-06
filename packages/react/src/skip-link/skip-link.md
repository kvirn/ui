# SkipLink

> **Draft** (Plan 0054). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [skip-link.a11y.md](skip-link.a11y.md).

A bypass link: the first Tab stop on every page, hidden until it has focus, that jumps past the header to the main content (2.4.1).

- One part: `SkipLink`, also `useSkipLink({ href, messages })`. It renders `<a class="kv-skip-link" href>`: a plain native link, never a router link.
- `href` is required and is the same-page `#id` of the main content.
- The label is the message `skipLink.label` in the provider's locale. Children replace it, and a custom label is your own string: set `lang` on it if it differs from the page.
- Activation moves focus to the target and gives it `tabindex="-1"` until it loses focus when it isn't focusable, so the next Tab continues inside it. The native jump still happens. A target you made focusable is left alone.
- A missing target warns in development (`skip-link-target-missing:<id>`).
- Attributes and the `ref` reach the element. A `className` joins `kv-skip-link`. `render` changes the element.
- Headless: no CSS. With `@kvirn-ui/theme/theme.css` it is clipped until `:focus`, then in the flow of the page with the focus ring, and never overlaps the header.

## Component

```tsx
import { SkipLink } from '@kvirn-ui/react'

;<>
  <SkipLink href="#main" />
  <header>…</header>
  <main id="main">…</main>
</>
```

## Hook

```tsx
import { useSkipLink } from '@kvirn-ui/react'

const { skipLinkProps, label } = useSkipLink({ href: '#main' })
<a {...skipLinkProps}>{label}</a>
```

## Accessibility

See the contract: [skip-link.a11y.md](skip-link.a11y.md).
