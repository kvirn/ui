# Pagination

> **Draft** (Plan 0062). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [pagination.a11y.md](pagination.a11y.md).

Links to the pages of a long list: Previous, page numbers with gaps, Next. Each page is a URL, so Back, bookmarks and "open in new tab" work. It is links and never buttons.

## API

- `Pagination.Root` is a `<nav>` named by the message `pagination.label` (`Sidor`), or by `label`. `Pagination.List` is a `<ul>` and `Pagination.Item` an `<li>` around each of the parts below.
- `Pagination.Link` is a page: `page` is its number (shown formatted by the locale) and its name is `Sida 2`; with your own `children` there is no `aria-label` and the visible text is the name (2.5.3), so your `children` must contain it: an icon-only or `aria-hidden`-only child leaves the link unnamed. `current` sets `aria-current="page"`, which a screen reader announces itself, so the name does not repeat it. The current page stays a link.
- `Pagination.Previous` and `Pagination.Next` are links with words (`pagination.previous`, `pagination.next`), `rel="prev"` and `rel="next"`, and arrows drawn by the theme. Leave them out on the first and last page.
- `Pagination.Ellipsis` is the text `…` for a gap, and is not focusable. `Pagination.Status` is the text `Sida 2 av 9`.
- All the link parts are thin wrappers over `Link.Root`: a native `<a href>` rendered by your registered router link, with the same props, `ref` and `as`. `children` replaces the words or the number, and `messages` overrides the strings for one instance.
- You decide which numbers and gaps to show. Keep the first and last page and the pages next to the current one.
- Also `usePagination({ label, messages })`, which returns the part props, `getPageLabel` and `getStatus` for your own elements.
- Headless: no CSS. With `@kvirn-ui/theme/theme.css` the targets are 44px and the current page is a filled shape. Below `40rem` it shows Previous, the current page, `Pagination.Status` and Next only, so render the status too (a dev warning `pagination-status-missing` reminds you).

## Component

```tsx
import { Pagination } from '@kvirn-ui/react'

;<Pagination.Root>
  <Pagination.List>
    <Pagination.Item>
      <Pagination.Previous href="?sida=1" />
    </Pagination.Item>
    <Pagination.Item>
      <Pagination.Link page={1} href="?sida=1" />
    </Pagination.Item>
    <Pagination.Item>
      <Pagination.Link page={2} href="?sida=2" current />
    </Pagination.Item>
    <Pagination.Item>
      <Pagination.Ellipsis />
    </Pagination.Item>
    <Pagination.Item>
      <Pagination.Link page={9} href="?sida=9" />
    </Pagination.Item>
    <Pagination.Item>
      <Pagination.Status page={2} total={9} />
    </Pagination.Item>
    <Pagination.Item>
      <Pagination.Next href="?sida=3" />
    </Pagination.Item>
  </Pagination.List>
</Pagination.Root>
```

## Hook

```tsx
import { usePagination } from '@kvirn-ui/react'

const pagination = usePagination()
<nav {...pagination.rootProps}>
  <ul {...pagination.listProps}>
    <li {...pagination.itemProps}>
      <a href="?sida=3" aria-label={pagination.getPageLabel(3)}>3</a>
    </li>
  </ul>
</nav>
```

## Accessibility

See the contract: [pagination.a11y.md](pagination.a11y.md).
