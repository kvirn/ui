# ScrollArea

> The accessibility contract is [scroll-area.a11y.md](scroll-area.a11y.md).

A `<div>` that scrolls with the browser's own scrollbars, for content that may not fit: a wide table, a long code sample. While the content overflows, the area is a named `region` and a Tab stop, so a keyboard user can scroll it. When it fits it is a plain `<div>`.

- **Native scrolling only.** No custom scrollbars, and the theme never hides or thins them.
- **Name it.** `aria-labelledby` or `aria-label`: it applies once the area is a region. A development warning says so when a region has no name.
- **Both axes.** The area sets no size. Give it `max-block-size` in your own CSS to scroll down as well as sideways.
- `region="always"` makes it a named region whether it scrolls or not. It is a Tab stop only while it scrolls.
- [`Table.ScrollRegion`](../table/table.md) is the same behaviour for a table: it is named by the caption and also the virtualizer's scroll element.
- Headless: it renders `kv-scroll-region kv-scroll-area`, and your `className` joins them. With `@kvirn-ui/theme/theme.css` imported it scrolls sideways and draws the focus ring.

```tsx
<ScrollArea aria-label="Fees">
  <table>…</table>
</ScrollArea>

const { scrollAreaProps, isOverflowing, isRegion } = useScrollArea({ region: 'overflow' })
<div {...scrollAreaProps} aria-label={isRegion ? 'Fees' : undefined}>…</div>
```

The hook gives no development warning for a missing name: `ScrollArea` does. Put `aria-label` or `aria-labelledby` on the element only while `isRegion` (a name on a role-less `<div>` is not allowed).

## API

| Prop     | Type                       | Meaning                                                                  |
| -------- | -------------------------- | ------------------------------------------------------------------------ |
| `region` | `'overflow'` \| `'always'` | When it is a named region. `'overflow'` by default                       |
| `render` | `RenderProp`               | Another element or a function. It receives `{ isOverflowing, isRegion }` |

It takes every attribute of a `<div>`, and passes `ref` to it. Your own `tabIndex` wins.

`useScrollArea({ region })` returns `scrollAreaProps` (spread them on the element that scrolls), `isOverflowing`, `isRegion` and `element`.
