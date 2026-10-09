# TableOfContents

> **Draft** (Plan 0049). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [table-of-contents.a11y.md](table-of-contents.a11y.md), and the design spec is [docs/design/table-of-contents.md](../../../../docs/design/table-of-contents.md).

The headings of a long page as a named `<nav>` of plain `#id` links, with the heading the reader is in marked as the current location. Use it on a long guide, manual or article with three or more sections, where a reader wants to jump to a section and see where they are. For a site's menu or a section's sub-pages, use [Navigation](../navigation/navigation.md). For a single link, use [Link](../link/link.md).

- Four parts: `TableOfContents.Root` (`<nav>`), `TableOfContents.List` (`<ul>`), `TableOfContents.Item` (`<li>`) and `TableOfContents.Link` (`<a>`), also exported as `TableOfContentsRoot`, `TableOfContentsList`, `TableOfContentsItem` and `TableOfContentsLink`. Give the Root the page's headings as `items`, in document order, and it draws the whole nested list. A function child draws your own.
- It never finds the headings itself: you pass them, so the list is part of the server-rendered page and works before any script has run. The current heading is a progressive enhancement, found in the browser.
- Every link is a plain `<a href="#id">`: the browser scrolls, below a sticky header by the page's `scroll-padding-top`, and the next Tab continues after the heading. It never uses your router's link.
- The heading being read has `aria-current="location"`, and no other link has it. Before any heading has reached the top, the first one on screen is current.
- It is never sticky, never scrolls by itself, never moves focus and announces nothing. Where it sits, and whether it sticks, is the page's layout.
- Headless: no CSS. Each part renders its stable class, and your `className` joins it. With `@kvirn-ui/theme/theme.css` imported, the links become navigation items: the heading being read is a solid fill, and the headings above it are the quiet trail.

## API

| Part                   | Renders                                  | Props                                                                                                                                                                                  |
| ---------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TableOfContents.Root` | `<nav class="kv-table-of-contents">`     | `items`, `offset`, `messages`, `aria-labelledby`, any `<nav>` attribute, `children` (a function to draw your own list), `ref`. Always a `<nav>`. Renders nothing when `items` is empty |
| `TableOfContents.List` | `<ul class="kv-table-of-contents-list">` | `as` (`ul` or `ol`), any `<ul>` attribute, `ref`. Inside an item, it is the next level                                                                                                 |
| `TableOfContents.Item` | `<li class="kv-table-of-contents-item">` | any `<li>` attribute, `ref`                                                                                                                                                            |
| `TableOfContents.Link` | `<a class="kv-link" href="#id">`         | `item` (an entry of `items`, required), `children` (replace the label), any `<a>` attribute except `href` and `aria-current`, `ref`                                                    |

An entry of `items` is `{ id, label, level }`: the heading's own `id`, its text, and its level (`2` for an `<h2>`). Only the order of the levels matters: a deeper level nests under the entry above it, a skipped level nests one step, and an entry shallower than every open one is a root. The function child gets `{ tree, activeId }`: the entries as nodes (`{ item, children }`) and the id of the current heading.

| State attribute           | When                                                   |
| ------------------------- | ------------------------------------------------------ |
| `aria-current="location"` | on the link of the heading being read, and on no other |
| `data-current`            | on the same link, for your own styles                  |
| `data-focus-visible`      | on a link while it has keyboard focus                  |

The parent headings of the current one get no attribute: the trail is a visual rule in the theme, found with `:has()`.

| Message key             | Says by default | In `sv`          |
| ----------------------- | --------------- | ---------------- |
| `tableOfContents.label` | On this page    | På den här sidan |

It names the landmark when you give no `aria-labelledby`. Override it per provider, or per instance with `messages={{ label: 'Innehåll' }}`. An `aria-label` of your own wins over it. `se` is an English placeholder until a native review.

Dev warnings (English, development only, never shown to users):

| Key                                      | Fires when                                                                        |
| ---------------------------------------- | --------------------------------------------------------------------------------- |
| `table-of-contents-missing-heading:<id>` | an entry's id is on no element of the page, so its link goes nowhere. Once per id |
| `table-of-contents-<part>-outside-root`  | a `List`, `Item` or `Link` is outside a `TableOfContents.Root`. Once per part     |

## Component

```tsx
import { Heading, TableOfContents } from '@kvirn-ui/react'

const items = [
  { id: 'avgift', label: 'Avgift', level: 2 },
  { id: 'avgift-bostad', label: 'Bostäder', level: 3 },
  { id: 'ansok', label: 'Så ansöker du', level: 2 },
]

;<>
  <Heading as="h2" size="heading-4" id="contents-title">
    På den här sidan
  </Heading>
  <TableOfContents.Root aria-labelledby="contents-title" offset={64} items={items} />
</>
```

```css
/* The page's own part: a sticky header of 64px must not cover a heading a link scrolls to, or a focused element. */
html {
  scroll-padding-top: 64px;
}
```

Your part:

- **The name.** A visible title is preferred: a real heading you render, with the same words as the label, never muted, and `aria-labelledby` pointing at its id. Without one, the message names the landmark. Never both: `aria-labelledby` replaces the message.
- **The ids.** Each entry's `id` is the heading's own, unique on the page. A missing one warns in development, and the link goes nowhere. Write the link text as the heading's text, and headings that say what the section is about.
- **`offset` and `scroll-padding-top`.** `offset` is the top of the area a heading is read in, in px from the top of the viewport. It must equal `scroll-padding-top` on `html`, which is the height of any sticky header (technique C43, and WCAG 2.4.11: it also keeps a focused link out from under the header), plus any `scroll-margin-top` you also give the headings. Otherwise a heading you jump to lands below the line and the one above it stays current.
- **The array.** Keep `items` in one place (a constant, or `useMemo`), in document order. The observer is keyed by the ids and `offset`, so a new array of the same ids changes nothing.
- **A page with a `<base href>`** resolves every `#id` link against the base and leaves the page. Don't use it.
- **Where it goes.** First in the DOM, right after the page's `h1` and lead, so keyboard and screen reader users meet it before the article. In a side column from 64rem it sits at the inline start. Below 64rem it stays above the article and isn't sticky. A sticky list taller than the viewport scrolls on its own, or isn't sticky.
- **How many.** Two levels on resident pages (`h2` and `h3`), `h4` at most as a third. Fewer than three sections need no list. One contents list per page.
- **Smooth scrolling** is the page's choice, and only under `prefers-reduced-motion: no-preference`. The component never sets `scroll-behavior`.

### The current heading

It is the last heading, in document order, above the line: `offset` px plus 20% of the viewport height below it, with 1px for sub-pixel layout. Before any heading is that high it is the first heading that is visible, and nothing is current only while none is. At the end of a page that scrolls it is the last heading, because a last section shorter than the viewport can never scroll its heading up to the line, unless a heading sits exactly on the line: the browser put it there for a jump (a link in the list, or the page's `#hash`), so that one is current. Give `offset` the same value as the headings' `scroll-margin-top` (or `html`'s `scroll-padding-top`) for this to hold. A heading that is `display: none` is skipped, because it has no place on the page.

It is worked out in the browser, after mount, from an `IntersectionObserver` and passive `scroll` and `resize` listeners, at most once per animation frame. On the server, during hydration and where there is no `IntersectionObserver`, the list renders and nothing is current.

### The function child

```tsx
<TableOfContents.Root aria-labelledby="contents-title" items={items}>
  {({ tree }) => (
    <TableOfContents.List>
      {tree.map((node) => (
        <TableOfContents.Item key={node.item.id}>
          <TableOfContents.Link item={node.item} />
        </TableOfContents.Item>
      ))}
    </TableOfContents.List>
  )}
</TableOfContents.Root>
```

The function replaces the list: draw a list of nodes with an item and a link for each, and a nested list from `node.children`. It isn't called when `items` is empty, because the Root then renders nothing, so a title you draw in it goes with the list and no empty landmark is left.

### `as`

```tsx
<TableOfContents.List as="ol">…</TableOfContents.List>
<TableOfContents.Root items={items} id="innehall" />
```

Only the List takes `as` (`ul` or `ol`, a string, so it works from a Server Component): a tag outside the list is a type error and, from JS, warns once in development and renders a `<ul>`. Root is always the `<nav>` landmark, Item an `<li>` and Link an `<a>` with its `href`. In a React Server Component, use the named exports `TableOfContentsRoot`, `TableOfContentsList`, `TableOfContentsItem` and `TableOfContentsLink` instead of `TableOfContents.Root` and so on, because a server component can't dot into a client module.

### Classes for the default theme

| Class                       | On   | Sets                                                                                                                                 |
| --------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `kv-table-of-contents`      | Root | a prose boundary: prose never styles inside it                                                                                       |
| `kv-table-of-contents-list` | List | a column with a small gap, no markers. A nested list is indented                                                                     |
| `kv-table-of-contents-item` | Item | its `kv-link` becomes a navigation item: a 44px row (32px in compact density), a solid fill and weight when current, the trail above |

In compact density (`kv-compact`) the rows are 32px, never below 24px (2.5.8).

## Hook

```tsx
import { useTableOfContents } from '@kvirn-ui/react'

function Innehall() {
  const contents = useTableOfContents({ items, offset: 64, labelledBy: 'contents-title' })
  return (
    <nav {...contents.rootProps}>
      <ul {...contents.listProps}>
        {contents.tree.map((node) => (
          <li key={node.item.id} {...contents.itemProps}>
            <a {...contents.getLinkProps(node.item)}>{node.item.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
```

| Option       | Type                                        |
| ------------ | ------------------------------------------- |
| `items`      | `readonly TableOfContentsEntry[]`           |
| `offset`     | `number \| undefined` (default `0`)         |
| `labelledBy` | `string \| undefined`                       |
| `messages`   | `Partial<KvirnMessages['tableOfContents']>` |

| Result         | Type                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------- |
| `rootProps`    | `TableOfContentsRootPartProps` (`className`, and `aria-label` or `aria-labelledby`)           |
| `listProps`    | `TableOfContentsListPartProps` (`className`)                                                  |
| `itemProps`    | `TableOfContentsItemPartProps` (`className`)                                                  |
| `tree`         | `TableOfContentsNode[]`                                                                       |
| `activeId`     | `string \| undefined`                                                                         |
| `getLinkProps` | `(item) => TableOfContentsLinkPartProps` (`className`, `href`, and `aria-current` if current) |

The hook gives the same observer as the Root, and the missing-heading warning. It gives no `data-focus-visible`: the theme also matches `:focus-visible`. The outside-root warnings come from the parts.
