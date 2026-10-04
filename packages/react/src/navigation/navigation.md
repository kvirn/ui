# Navigation

> **Draft** (Plan 0043). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [navigation.a11y.md](navigation.a11y.md), and the design spec is [docs/design/navigation.md](../../../../docs/design/navigation.md).

A labelled `<nav>` landmark around a list of page links, with the current page marked and an optional second level. Use it for a site's main menu, a section's sub-pages or a footer's links. For a single link, use [Link](../link/link.md). A menu that opens and closes (disclosure navigation) is NavigationMenu, a separate component.

- Three parts: `Navigation.Root` (`<nav>`), `Navigation.List` (`<ul>`) and `Navigation.Item` (`<li>`), also exported as `NavigationRoot`, `NavigationList` and `NavigationItem`. A sub-navigation is another `Navigation.List` inside a `Navigation.Item`.
- Every navigation needs a name, and two navigations on a page need two different names, because a screen reader user picks a landmark by it (WCAG 2.4.1, 2.4.6). Set `label`, or `aria-labelledby` pointing at a visible heading.
- The current page is `current="page"` on its [Link](../link/link.md), which sets `aria-current="page"`. Navigation doesn't detect it.
- Every link is a Tab stop, and there are no arrow keys: it is a list of links, not a menu.
- Headless: no CSS. Each part renders its stable class: `kv-navigation`, `kv-navigation-list` and `kv-navigation-item`, and your `className` joins it. With `@kvirn-ui/theme/theme.css` imported, the links become navigation items: a vertical list at every width, with a bar and weight on the current page.

## API

| Part              | Renders                           | Props                                                                                            |
| ----------------- | --------------------------------- | ------------------------------------------------------------------------------------------------ |
| `Navigation.Root` | `<nav class="kv-navigation">`     | `label` (becomes `aria-label`), any `<nav>` attribute such as `aria-labelledby`, `ref`, `render` |
| `Navigation.List` | `<ul class="kv-navigation-list">` | any `<ul>` attribute, `ref`, `render`. Inside a `Navigation.Item`, it is the next level          |
| `Navigation.Item` | `<li class="kv-navigation-item">` | any `<li>` attribute, `ref`, `render`                                                            |

Navigation has no state, so it sets no `data-*` attribute, and it has no message keys. The state of a link (`aria-current`, `data-current`, `data-focus-visible`) is [Link](../link/link.md)'s.

Dev warnings (English, development only, never shown to users):

| Key                                | Fires when                                                                          |
| ---------------------------------- | ----------------------------------------------------------------------------------- |
| `navigation-without-name`          | the `<nav>` has no `aria-label` and no `aria-labelledby` text, or `label` is empty  |
| `navigation-duplicate-name:<name>` | another `<nav>` or `role="navigation"` on the page has the same name. Once per name |

## Component

```tsx
import { Link, Navigation } from '@kvirn-ui/react'

;<Navigation.Root label="Huvudmeny">
  <Navigation.List>
    <Navigation.Item>
      <Link.Root href="/start">Start</Link.Root>
    </Navigation.Item>
    <Navigation.Item>
      <Link.Root href="/bygga-och-bo">Bygga och bo</Link.Root>
      <Navigation.List>
        <Navigation.Item>
          <Link.Root href="/bygga-och-bo/bygglov" current="page">
            Bygglov
          </Link.Root>
        </Navigation.Item>
      </Navigation.List>
    </Navigation.Item>
    <Navigation.Item>
      <Link.Root href="/om-oss">Om oss</Link.Root>
    </Navigation.Item>
  </Navigation.List>
</Navigation.Root>
```

Your part:

- **The name.** `label` is a string from your own translations: Navigation has no message keys. Where a visible heading names the navigation, use `aria-labelledby` and leave `label` out: a visible name and an accessible name that match are better for everyone (2.5.3).
- **The current page.** `current="page"` on exactly one link, from your router's pathname. Navigation doesn't read the router.
- **Two levels at most** on resident pages. Indentation shows the level without colour. A third level, or a menu that collapses, is NavigationMenu.
- **A heading above a nested list** (a group label that isn't a link) is your own element for now: there is no `Navigation.Group`.
- **The element.** `render` changes a part's element, but Root must stay a `<nav>` (or have `role="navigation"`), otherwise the landmark is gone.
- **Router links.** Links inside are [Link](../link/link.md), so the registered router link renders them, and the new-tab notice and `current` work as everywhere.

### `render`

```tsx
<Navigation.Item render={<li className="meny-post" />}>…</Navigation.Item>
<Navigation.Root label="Huvudmeny" render={(rootProps) => <nav {...rootProps} id="huvudmeny" />}>…</Navigation.Root>
```

In a React Server Component, use the named exports `NavigationRoot`, `NavigationList` and `NavigationItem` instead of `Navigation.Root` and so on, because a server component can't dot into a client module.

### Classes for the default theme

| Class                | On   | Sets                                                                                                              |
| -------------------- | ---- | ----------------------------------------------------------------------------------------------------------------- |
| `kv-navigation`      | Root | a prose boundary: prose never styles inside it                                                                    |
| `kv-navigation-list` | List | a column with a small gap, no markers. A nested list is indented                                                  |
| `kv-navigation-item` | Item | its `kv-link` becomes a navigation item: a 44px row (32px in compact density), with a bar and weight when current |

A `kv-link--service` link inside an item keeps its own look. In compact density (`kv-compact`) the rows are 32px, never below 24px (2.5.8).

## Hook

```tsx
import { useNavigation } from '@kvirn-ui/react'

function Meny() {
  const navigation = useNavigation({ label: 'Huvudmeny' })
  return (
    <nav {...navigation.rootProps}>
      <ul {...navigation.listProps}>
        <li {...navigation.itemProps}>
          <a href="/start">Start</a>
        </li>
      </ul>
    </nav>
  )
}
```

| Option  | Type                  |
| ------- | --------------------- |
| `label` | `string \| undefined` |

| Result      | Type                                                                   |
| ----------- | ---------------------------------------------------------------------- |
| `rootProps` | `NavigationRootPartProps` (`className`, and `aria-label` from `label`) |
| `listProps` | `NavigationListPartProps` (`className`)                                |
| `itemProps` | `NavigationItemPartProps` (`className`)                                |

The hook gives no dev warnings: they come from `Navigation.Root`, which reads the rendered element.
