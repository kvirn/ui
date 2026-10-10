# Link

> **Draft** (Plan 0003). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [link.a11y.md](link.a11y.md).

A native `<a href>` for navigation, rendered by your router's link component when you register one. For actions, use [Button](../button/button.md).

- `current` sets `aria-current`, for example `current="page"` in navigation. The other values are `step` (a step in a process), `location`, `date` and `time`; `true` gives `aria-current="true"`, and `false` or no value gives none. Link doesn't detect the current page itself.
- `target="_blank"` adds `rel="noopener noreferrer"` to your own `rel`: `rel="author"` becomes `author noopener noreferrer`, and a token you already wrote is not repeated.
- `Link.NewTabNotice` renders the translated new-tab notice, `(öppnas i en ny flik)`, as part of the link's name (WCAG 3.2.5, Level AAA; technique G201). A link that opens a new window or tab must say so, so put it in every `target="_blank"` link. Nothing checks that you did: there is no type error and no dev warning.
- No `disabled` prop: a disabled link isn't a thing. Remove the link or render text.
- `Link.Icon` is a decorative slot for an icon, first in the link: `<span class="kv-link-icon" aria-hidden="true">`. The link's name stays its text.
- Headless: no CSS. It renders `class="kv-link"` (and `class="kv-link-new-tab-notice"` on the notice and `class="kv-link-icon"` on the icon), the part's stable class, and your `className` joins it. Style `.kv-link` and the state attributes `[data-current]` and `[data-focus-visible]` (or `:focus-visible`). With `@kvirn-ui/theme/theme.css` imported, it is styled: links in a list of [Navigation](../navigation/navigation.md) become navigation items, and `className="kv-link--service"` makes the one link that starts an e-service (below).
- A list of page links with a current page is [Navigation](../navigation/navigation.md), not a class on a list.

## Component

```tsx
import { Link } from '@kvirn-ui/react'

<Link.Root href="/ansok" current="page">Ansök</Link.Root>

<Link.Root href="https://www.digg.se/" target="_blank">
  Digg <Link.NewTabNotice />
</Link.Root>

<Link.Root href="/fi" hrefLang="fi" lang="fi">Suomeksi</Link.Root>
```

In a React Server Component, use the named exports `LinkRoot` and `LinkNewTabNotice` instead of `Link.Root` and `Link.NewTabNotice`, because a server component can't dot into a client module. The callable `Link` still works, but docs write `Link.Root`.

### The service link

`className="kv-link--service"` is the look of the one link that starts an e-service (the "Länk till e-tjänst" of a webmanual): an outlined label, and with a `Link.Icon` first, a filled block with the icon. It is still a `<a href>` that navigates, with the router, `current` and the new-tab notice. It is a class and not a prop, as a Button's `kv-button--primary` is: the headless Link ships no CSS.

```tsx
import { Icon, Link } from '@kvirn-ui/react'

;<Link.Root href="https://eservice.example/bygglov" className="kv-link--service">
  <Link.Icon>
    <Icon name="arrow-forward" size="24" />
  </Link.Icon>
  Ansök om bygglov
</Link.Root>
```

Your part:

- **One per view,** for starting an e-service. It is flat, with no button depth: DESIGN.md reserves depth for buttons. An action that submits or changes something is a [Button](../button/button.md).
- **Label** starts with a verb and names the service ("Ansök om bygglov"). Don't write "länk" in it: the role says it.
- **Put the icon first,** and keep it decorative: `Link.Icon` is `aria-hidden`. The built-in `arrow-forward` at `size="24"` mirrors in right-to-left text.
- **No disabled service link.** Link has no `disabled`. When the e-service is closed, render a sentence and, when it reopens, a date, for example in an [Alert](../alert/alert.md).
- **A new tab** needs `<Link.NewTabNotice />` inside the label, as for any link: telling users before it opens is a WCAG requirement (3.2.5, Level AAA; technique G201), and Link does not check it for you. It wraps with the label.

### The new-tab notice text

First match wins:

```tsx
<Link.NewTabNotice>(extern länk)</Link.NewTabNotice>          // 1. children
<Link.Root target="_blank" messages={{ newTabNotice: '(nytt fönster)' }}>  // 2. instance
<KvirnProvider messages={{ link: { newTabNotice: '…' } }}>   // 3. provider, then its ancestors
                                                            // 4. built-in en
```

Keep the notice in the name. If you hide it visually, use a visually-hidden technique, not `display: none` or `aria-hidden`. `Link.NewTabNotice` takes `as` (`span`, `em` or `small`) and `Link.Icon` takes `as` (`span` or `i`): they keep their class and their text.

### Router links and `as`

Register your router's link once, on the provider (see [KvirnProvider](../provider/kvirn-provider.md)). Every Link then renders it. To bypass the router for one link, for example a download, use `as="a"`:

```tsx
<Link.Root href="/blankett.pdf" download as="a">
  Blankett (PDF)
</Link.Root>
```

`as` also takes a component, such as your design system's link: it gets the other props as plain props, a `ref` and the part's class, and must render an `<a href>`. `target`, `rel` and `current` stay Link's own: `target="_blank"` still adds `rel="noopener noreferrer"`.

## Your own look

The underline of a link is three properties, set once on `:root` or on a container: `--kv-link-underline-thickness` (at rest, `1px`), `--kv-link-underline-thickness-hover` (`2px`) and `--kv-link-underline-offset` (`0.15em`). Links are underlined on hover only, because their colour is 3:1 against the text around them (1.4.1). Keep that contrast if you change the colour; the contrast themes keep the underline at rest.

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
