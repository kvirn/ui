# Breadcrumb

> **Draft** (Plan 0062). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [breadcrumb.a11y.md](breadcrumb.a11y.md).

A trail from the home page down to the page you are on: where you are, and the way up (2.4.8). Use it on every page below the start page, before `<main>`.

## API

- `Breadcrumb.Root` is a `<nav>` named by the message `breadcrumb.label` (`Du är här`), or by `label`. `Breadcrumb.List` is an `<ol>`, `Breadcrumb.Item` an `<li>`.
- `Breadcrumb.Link` is a link to a level above, a thin wrapper over `Link.Root`: a native `<a href>` rendered by your registered router link (Next.js, TanStack Router), with the same props and `ref`.
- `Breadcrumb.Current` is the last item: the page you are on as text, `aria-current="page"`, never a link to itself.
- The separators are drawn by the theme and never read by a screen reader. The trail wraps at a narrow width and never collapses into "…": a hidden level is a hidden way out.
- Also `useBreadcrumb({ label, messages })`, which returns `rootProps`, `listProps`, `itemProps`, `currentProps` and the resolved `label` for your own elements.
- Attributes and the `ref` reach each element. A `className` joins the part's class. `render` changes the element, and `Root` must stay a `<nav>`.
- Headless: no CSS. With `@kvirn-ui/theme/theme.css` it is a wrapping row with chevron separators (mirrored in RTL).

## Component

```tsx
import { Breadcrumb } from '@kvirn-ui/react'

;<Breadcrumb.Root>
  <Breadcrumb.List>
    <Breadcrumb.Item>
      <Breadcrumb.Link href="/">Start</Breadcrumb.Link>
    </Breadcrumb.Item>
    <Breadcrumb.Item>
      <Breadcrumb.Link href="/barn">Barn och utbildning</Breadcrumb.Link>
    </Breadcrumb.Item>
    <Breadcrumb.Item>
      <Breadcrumb.Current>Förskola</Breadcrumb.Current>
    </Breadcrumb.Item>
  </Breadcrumb.List>
</Breadcrumb.Root>
```

## Hook

```tsx
import { useBreadcrumb } from '@kvirn-ui/react'

const breadcrumb = useBreadcrumb()
<nav {...breadcrumb.rootProps}>
  <ol {...breadcrumb.listProps}>
    <li {...breadcrumb.itemProps}><a href="/">Start</a></li>
    <li {...breadcrumb.itemProps}><span {...breadcrumb.currentProps}>Förskola</span></li>
  </ol>
</nav>
```

## Accessibility

See the contract: [breadcrumb.a11y.md](breadcrumb.a11y.md).
