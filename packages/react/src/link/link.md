# Link

> **Draft** (Plan 0003). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [link.a11y.md](link.a11y.md).

A native `<a href>` for navigation, rendered by your router's link component when you register one (ADR-0005). For actions, use [Button](../button/button.md).

- `current` sets `aria-current`, for example `current="page"` in navigation. Link doesn't detect the current page itself.
- `target="_blank"` adds `rel="noopener noreferrer"` to your own `rel`.
- `Link.NewTabNotice` renders the translated new-tab notice, `(öppnas i en ny flik)`, as part of the link's name (WCAG 3.2.5, G201). A dev warning fires when a `target="_blank"` link has none.
- No `disabled` prop: a disabled link isn't a thing. Remove the link or render text.
- Headless: no CSS. It renders `data-kv="link"` (and `data-kv="link-new-tab-notice"` on the notice), a stable part name. Style `[data-kv='link']`, `[data-current]` and `[data-focus-visible]` (or `:focus-visible`). With `@kvirn-ui/theme/theme.css` imported, it is styled, and links inside a list with `data-kv-nav` become navigation items.

## Component

```tsx
import { Link } from '@kvirn-ui/react'

<Link href="/ansok" current="page">Ansök</Link>

<Link href="https://www.digg.se/" target="_blank">
  Digg <Link.NewTabNotice />
</Link>

<Link href="/fi" hrefLang="fi" lang="fi">Suomeksi</Link>
```

In a React Server Component, use the named export `LinkNewTabNotice` instead of `Link.NewTabNotice`.

### The new-tab notice text

First match wins (ADR-0007):

```tsx
<Link.NewTabNotice>(extern länk)</Link.NewTabNotice>          // 1. children
<Link target="_blank" messages={{ newTabNotice: '(nytt fönster)' }}>  // 2. instance
<KvirnProvider messages={{ link: { newTabNotice: '…' } }}>   // 3. provider, then its ancestors
                                                            // 4. built-in en
```

Keep the notice in the name. If you hide it visually, use a visually-hidden technique, not `display: none` or `aria-hidden`.

### Router links and `render`

Register your router's link once, on the provider (see [KvirnProvider](../provider/kvirn-provider.md)). Every Link then renders it. To bypass the router for one link, for example a download, render a plain `<a>`:

```tsx
<Link href="/blankett.pdf" download render={<a />}>
  Blankett (PDF)
</Link>
```

## Hook

```tsx
import { useLink } from '@kvirn-ui/react'

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  const link = useLink({ target: '_blank' })
  return (
    <a href={href} {...link.linkProps}>
      {children} <span>{link.newTabNotice}</span>
    </a>
  )
}
```

| Option     | Type                                                            |
| ---------- | --------------------------------------------------------------- |
| `current`  | `'page' \| 'step' \| 'location' \| 'date' \| 'time' \| boolean` |
| `target`   | `string`                                                        |
| `rel`      | `string`                                                        |
| `messages` | `Partial<KvirnMessages['link']>`                                |

| Result           | Type            |
| ---------------- | --------------- |
| `linkProps`      | `LinkPartProps` |
| `isCurrent`      | `boolean`       |
| `isFocusVisible` | `boolean`       |
| `opensInNewTab`  | `boolean`       |
| `newTabNotice`   | `string`        |
