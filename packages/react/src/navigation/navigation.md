# Navigation

> **Draft** (Plans 0043 and 0047). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [navigation.a11y.md](navigation.a11y.md), and the design specs are [docs/design/navigation.md](../../../../docs/design/navigation.md) and [docs/design/navigation-link-options.md](../../../../docs/design/navigation-link-options.md).

A labelled `<nav>` landmark around a list of page links, with the current page marked and an optional second level. Use it for a site's main menu, a section's sub-pages, a footer's links or a staff sidebar, as a vertical list or as a horizontal bar. For a single link, use [Link](../link/link.md). A menu that opens and closes (disclosure navigation, flyouts) is NavigationMenu, a separate component.

- Four parts: `Navigation.Root` (`<nav>`), `Navigation.List` (`<ul>`), `Navigation.Item` (`<li>`) and `Navigation.Label` (`<span>`), also exported as `NavigationRoot`, `NavigationList`, `NavigationItem` and `NavigationLabel`. A sub-navigation is another `Navigation.List` inside a `Navigation.Item`, and a `Navigation.Label` in the same item names it.
- Every navigation needs a name, and two navigations on a page need two different names, because a screen reader user picks a landmark by it (WCAG 2.4.1, 2.4.6). Set `label`, or `aria-labelledby` pointing at a visible heading.
- The current page is `current="page"` on its [Link](../link/link.md), which sets `aria-current="page"`. Exactly one link per navigation has `aria-current`: when the page isn't listed, `current` on the deepest item shown gives `aria-current="true"`. Never on an ancestor of a listed page, and never on a link inside a `hidden` group. Navigation doesn't detect the page, and it warns in development when two links have it.
- Every link is a Tab stop, and there are no arrow keys: it is a list of links, not a menu. A horizontal bar has the same keys.
- Headless: no CSS. Each part renders its stable class: `kv-navigation`, `kv-navigation-list` and `kv-navigation-item`, and your `className` joins it. With `@kvirn-ui/theme/theme.css` imported, the links become navigation items: the current page is a solid fill, every ancestor of it is a quiet bold trail, and the rest are plain with an underline on hover. It is a vertical list by default, and `className="kv-navigation--horizontal"` on the root makes the top level a row that wraps. There is no `orientation` prop: the links are plain Tab stops, so the layout changes no keys, and a look is a class.

## API

| Part               | Renders                              | Props                                                                                                                                      |
| ------------------ | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `Navigation.Root`  | `<nav class="kv-navigation">`        | `label` (becomes `aria-label`), any `<nav>` attribute such as `aria-labelledby`, `ref`                                                     |
| `Navigation.List`  | `<ul class="kv-navigation-list">`    | any `<ul>` attribute, such as `hidden` for a collapsed group, `ref`, `as` (`ul` or `ol`). Inside a `Navigation.Item`, it is the next level |
| `Navigation.Item`  | `<li class="kv-navigation-item">`    | any `<li>` attribute, `ref`                                                                                                                |
| `Navigation.Label` | `<span class="kv-navigation-label">` | any `<span>` attribute, `ref`, `as` (`span` or `p`). Names the `Navigation.List` in the same item (`aria-labelledby`)                      |

Navigation has no state, so it sets no `data-*` attribute, and it has no message keys. The state of a link (`aria-current`, `data-current`, `data-focus-visible`) is [Link](../link/link.md)'s.

Dev warnings (English, development only, never shown to users):

| Key                                  | Fires when                                                                                                                                          |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `navigation-without-name`            | the `<nav>` has no `aria-label` and no `aria-labelledby` text, or `label` is empty                                                                  |
| `navigation-duplicate-name:<name>`   | another `<nav>` or `role="navigation"` on the page has the same name. Once per name                                                                 |
| `navigation-multiple-current:<name>` | more than one link in the `<nav>` has `aria-current` other than `"false"`, a nested link and a link inside a `hidden` group included. Once per name |

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
- **The current page.** `current="page"` on exactly one link, from your router's pathname. Navigation doesn't read the router. When the page isn't in the navigation, such as a case page or a menu that stops above it, put `current` on the deepest item shown (GOV.UK's "active" item): it gives `aria-current="true"`, and the navigation still has one current link. Never mark an ancestor of a listed page, because assistive technology would announce "current" more than once. A link inside a `hidden` group never has it, because a hidden link isn't exposed: the deepest item shown takes it.
- **The trail.** Every ancestor of the current page is drawn as a quiet bold trail, so a user in a long menu sees which branch they are in. The theme finds it with CSS `:has()`, so there is nothing to mark. It is visual only: it is not announced, and the nesting of the lists carries the hierarchy for assistive technology. For an announced path on a deep page, add a Breadcrumb.
- **Collapsing a group.** Render a group you collapse with `hidden`, and never unmount it: its links stay in the DOM but leave the Tab sequence and the accessibility tree, and the default theme keeps it collapsed. The toggle that opens it is yours: a `Button` with `aria-expanded` and `aria-controls`. A disclosure that Navigation manages is NavigationMenu.
- **A horizontal bar.** `className="kv-navigation--horizontal"` on `Navigation.Root` lays the top level out as a row that wraps, with each item as wide as its label. It is one level: a nested list stays a column under its item. For the pages of a section, use a second `Navigation` with its own name ("I det här avsnittet"). Flyouts and collapsing are NavigationMenu.
- **Two levels at most** on resident pages. Indentation shows the level without colour. A staff or CMS sidebar may go deeper, with the trail showing the way. A menu that collapses and opens is NavigationMenu.
- **A group label.** `Navigation.Label` in a `Navigation.Item`, next to its nested `Navigation.List`, names that list: a screen reader announces "Komponenter, list, 3 items". It is plain text, not a heading and not a link, so it is no Tab stop and never looks like one (quiet `text-muted`, compact type). A list's own `aria-label` or `aria-labelledby` wins. The name is set when the page hydrates, not in server HTML. There is no `Navigation.Group`: the label is only the name. A label with no nested list names nothing and warns in development.

  ```tsx
  <Navigation.Item>
    <Navigation.Label>Komponenter</Navigation.Label>
    <Navigation.List>…</Navigation.List>
  </Navigation.Item>
  ```

- **The element.** `Navigation.List` takes `as="ol"` and `Navigation.Label` takes `as="p"`; Root and Item have no `as`, because the landmark and the list item are fixed.
- **Router links.** Links inside are [Link](../link/link.md), so the registered router link renders them, and the new-tab notice and `current` work as everywhere.

### `as`

```tsx
<Navigation.List as="ol">…</Navigation.List>
<Navigation.Label as="p">Komponenter</Navigation.Label>
```

In a React Server Component, use the named exports `NavigationRoot`, `NavigationList` and `NavigationItem` instead of `Navigation.Root` and so on, because a server component can't dot into a client module.

### Classes for the default theme

| Class                       | On   | Sets                                                                                                                                                                                              |
| --------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kv-navigation`             | Root | a prose boundary: prose never styles inside it                                                                                                                                                    |
| `kv-navigation--horizontal` | Root | the top level as a row that wraps, with 8px gaps and items as wide as their labels. One level: a nested list stays a column                                                                       |
| `kv-navigation-list`        | List | a column with a small gap, no markers. A nested list is indented. With `hidden` it is collapsed                                                                                                   |
| `kv-navigation-item`        | Item | its `kv-link` becomes a navigation item: a 44px row (32px in compact density), weight 400 with an underline on hover. The current page is a solid fill at weight 600, and its ancestors the trail |

A `kv-link--service` link inside an item keeps its own look. In compact density (`kv-compact`, on the root or any container) the rows are 32px, never below 24px (2.5.8). In forced colours the fills drop: the current item keeps a straight `LinkText` bar and the trail keeps its weight.

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
