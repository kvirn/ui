# Grid

> **Draft** (Plan 0108). The accessibility contract is [grid.a11y.md](grid.a11y.md).

Explicit, consistent column tracks with the range of Tailwind's grid utilities: columns, spans, start and end lines, rows, gaps, flow and alignment, each responsive. Two parts: `Grid.Root` and `Grid.Item` (also exported as `GridRoot` and `GridItem`). Grid replaces Columns.

- Everything is a class you add, never a prop. Root: `kv-grid--cols-1` … `-12`, `kv-grid--fit-sm|md|lg`, `kv-grid--rows-n`, `kv-grid--gap-n`, `flow-*`, `justify-*`, `items-*`, `content-*`, `place-*`. Item: `kv-grid-item--span-n`, `start-n`, `end-n`, `row-span-n`, `row-start-n`, `self-*`. The full tables are in the [theme](../../../theme/grid.css) and on the Docs page.
- Responsive forms add a breakpoint, mobile first, from the grid's own width (a container query, so a grid in a sidebar or card reflows to its own width): `kv-grid--md-cols-2`, `kv-grid-item--lg-span-8`. Breakpoints `sm` 40rem, `md` 48rem, `lg` 64rem, `xl` 80rem, `2xl` 96rem.
- The base is one track with the `space-6` gap. A bare `cols-n` (n > 1), `flow-col` without `rows-n`, or `auto-cols-min|max` keeps its tracks at 320px, so cells squeeze and content overflows or overlaps (1.4.10). Start at one track (`cols-1` or `fit-*`) and add columns with a breakpoint form.
- `Grid.Root` renders an internal `<div class="kv-grid-container">` around the grid element. Every prop, the ref and `className` go to the grid element. Put a Grid in a block-level parent: a shrink-to-fit parent (inline-flex, float) collapses it.
- `as` picks the element: Root `div`, `ul` or `ol` (a list gets `role="list"`), Item `div`, `li`, `article`, `section`, `nav`, `aside` or `main` (a `nav`, `aside` or `section` needs a name; a page has one `main`, never the default). An Item is optional: any direct child is a cell. An Item outside a Root warns once.
- Headless: no CSS, no state, no `data-*`, no ARIA or `tabindex`, usable in a server component (import the flat `GridRoot` and `GridItem`).
- Reading order. There is no `order-*` or dense packing. `start-*`, `end-*` and `row-start-*` place an item on a line: putting a later item before an earlier one makes the visual order differ from the DOM, reading and focus order (1.3.2, 2.4.3). Keep line placement in DOM order.

```tsx
import { Grid } from '@kvirn-ui/react'

;<Grid.Root className="kv-grid--cols-1 kv-grid--lg-cols-12">
  <Grid.Item className="kv-grid-item--lg-span-8">…</Grid.Item>
  <Grid.Item className="kv-grid-item--lg-span-4">…</Grid.Item>
</Grid.Root>
```

Sidebar and content (replaces SidebarLayout). Write the part that comes first at inline start first: DOM order is the visual, reading and focus order.

```tsx
;<Grid.Root className="kv-grid--lg-cols-12 kv-grid--lg-gap-10">
  <Grid.Item as="nav" aria-label="In this section" className="kv-grid-item--lg-span-3">
    …
  </Grid.Item>
  <Grid.Item as="main" id="main" className="kv-grid-item--lg-span-9">
    …
  </Grid.Item>
</Grid.Root>
```

## API

Add the classes to `Grid.Root` or `Grid.Item`. Breakpoint prefixes `sm` 40rem, `md` 48rem, `lg` 64rem, `xl` 80rem and `2xl` 96rem answer the grid's own inline size, mobile first. Every class except the base has a `--<breakpoint>-` form: `kv-grid--lg-cols-3`, `kv-grid-item--md-span-full`.

| Root `kv-grid--…`                             | Effect                                                      |
| --------------------------------------------- | ----------------------------------------------------------- |
| (none)                                        | one track, gap `space-6`                                    |
| `cols-1` … `cols-12`                          | that many equal columns                                     |
| `fit-sm`, `fit-md`, `fit-lg`                  | as many columns as fit, each at least 14, 18 or 24rem       |
| `rows-1` … `rows-12`                          | that many equal rows                                        |
| `flow-row`, `flow-col`                        | `grid-auto-flow` (no `dense`)                               |
| `auto-cols-*`, `auto-rows-*`                  | `grid-auto-columns` and `-rows`: `auto`, `min`, `max`, `fr` |
| `gap-n`, `gap-x-n`, `gap-y-n`                 | the space steps `0` to `16`                                 |
| `items-*`, `justify-items-*`, `place-items-*` | alignment of the cells                                      |
| `justify-*`, `content-*`, `place-content-*`   | distribution of the tracks                                  |

| Item `kv-grid-item--…`                     | Effect                                                   |
| ------------------------------------------ | -------------------------------------------------------- |
| `span-1` … `span-12`, `span-full`          | columns spanned                                          |
| `start-n`, `end-n`                         | column lines, logical so RTL mirrors with no extra class |
| `row-span-n`, `row-start-n`, `row-end-n`   | rows spanned and row lines                               |
| `subgrid`, `rows-subgrid`                  | the Item is a grid on the parent's column or row tracks  |
| `self-*`, `justify-self-*`, `place-self-*` | alignment of one cell                                    |

Nest a Grid inside a `Grid.Item`, not straight in another Grid: each Root wraps itself in a container, so a Root placed in a track would miss the span classes. The Item takes them, and the inner Grid reflows to the Item's width.

## Hook

`useGrid()` returns `containerProps`, `rootProps` and `itemProps`, frozen objects with only the `className`. Put `containerProps` on an element that wraps only the grid element.

## Migrating from Columns

| Columns                                     | Grid                                                                                         |
| ------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `<Columns>`                                 | `<Grid.Root className="kv-grid--fit-md">`                                                    |
| `<Columns as="ul">` with `<li>` children    | `<Grid.Root as="ul" className="kv-grid--fit-md">`                                            |
| `kv-columns--min-sm` / `kv-columns--min-lg` | `kv-grid--fit-sm` / `kv-grid--fit-lg`                                                        |
| `kv-columns--gap-N`                         | `kv-grid--gap-N`                                                                             |
| `<SidebarLayout.Root>`                      | `<Grid.Root className="kv-grid--lg-cols-12 kv-grid--lg-gap-10">`                             |
| `<SidebarLayout.Sidebar as="nav">`          | `<Grid.Item as="nav" className="kv-grid-item--lg-span-3">`                                   |
| `<SidebarLayout.Content as="main">`         | `<Grid.Item as="main" className="kv-grid-item--lg-span-9">`                                  |
| `kv-sidebar-layout--sidebar-sm` or `-md`    | nothing: the sidebar is `lg-span-3` for both, about 14rem at a 64rem grid and 18rem at 80rem |
