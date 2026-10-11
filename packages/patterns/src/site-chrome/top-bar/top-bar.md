# Top bar

> **Draft** (Plan 0095). A pattern in the private `@kvirn-ui/patterns`. The accessibility contract is [top-bar.a11y.md](top-bar.a11y.md).

A slim bar with two sides: a line of text at the start and a navigation at the end, such as "A KvirnUI reference site. Latest: Pre-alpha" and the Documentation and GitHub links. Put it first in the Site header; on the primary Site header it is the darker top band.

- One part: `TopBar.Root`, a plain `<div>` with no role. Its children are laid out at the start and the end, in DOM order, and wrap at 320px. Write the text first and the navigation last.
- The children are yours: a `<p>` or any text, and a `Navigation` with its own `label`. The bar assumes nothing about their tags and has no strings of its own.
- `variant`: none (default) adds no class and no fill. `primary`, `secondary` or `accent` adds `kv-top-bar--<variant>`: a full-width fill with its on-colour text, underlined text links, focus ring and the current navigation item's bar.
- With `@kvirn-ui/theme/theme.css`, `kv-top-bar` sets the layout and no font or line-height, so it takes the page's text. The Navigation and the links keep their own look, apart from the on-colour on a fill.

```tsx
import { TopBar } from '@kvirn-ui/patterns'
import { Link, Navigation } from '@kvirn-ui/react'

;<TopBar.Root variant="accent">
  <p>
    A KvirnUI reference site. <Link.Root href="/releases">Latest: Pre-alpha</Link.Root>
  </p>
  <Navigation.Root label="Tools" className="kv-navigation--horizontal">
    <Navigation.List>
      <Navigation.Item>
        <Link.Root href="/" current>
          Documentation
        </Link.Root>
      </Navigation.Item>
      <Navigation.Item>
        <Link.Root href="https://github.com/kvirn/ui">GitHub</Link.Root>
      </Navigation.Item>
    </Navigation.List>
  </Navigation.Root>
</TopBar.Root>
```

## Accessibility

See the contract: [top-bar.a11y.md](top-bar.a11y.md).
