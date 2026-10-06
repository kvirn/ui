# SidebarLayout

> **Draft** (Plan 0056). The accessibility contract is [sidebar-layout.a11y.md](sidebar-layout.a11y.md).

A side column and a content column: stacked below `64rem`, side by side from it. Three parts, each one `<div>`: `SidebarLayout.Root`, `SidebarLayout.Sidebar` and `SidebarLayout.Content` (also exported as `SidebarLayoutRoot`, `SidebarLayoutSidebar` and `SidebarLayoutContent`).

- `sidebarWidth` on the Root: `'sm'` (`16rem`) or `'md'` (default, `20rem`).
- Whichever part comes first in the DOM is at inline start (the right in RTL), and is read and focused first.
- Content is not `<main>` by default: a page has one `main`. Collapsing a long sidebar is a Disclosure's job.
- Headless: no CSS. Each renders a stable class, your `className` joins it, and `@kvirn-ui/theme/theme.css` styles it. No state, so no `data-*`, no client code (usable in a server component) and no role, ARIA or `tabindex`: `render` picks the element, and a landmark is always your choice and must be named.
- A Sidebar or Content outside a Root warns once (`sidebar-layout-<part>-outside-root`).

```tsx
import { SidebarLayout } from '@kvirn-ui/react'

;<SidebarLayout.Root sidebarWidth="sm">
  <SidebarLayout.Sidebar render={<nav aria-label="I det här avsnittet" />}>…</SidebarLayout.Sidebar>
  <SidebarLayout.Content render={<main id="main" />}>…</SidebarLayout.Content>
</SidebarLayout.Root>
```

## Hook

`useSidebarLayout({ sidebarWidth })` returns `rootProps`, `sidebarProps` and `contentProps`, frozen objects with only the `className`.
