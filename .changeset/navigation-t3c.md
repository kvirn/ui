---
'@kvirn-ui/theme': minor
'@kvirn-ui/react': patch
---

The navigation look changes, and a navigation can be a horizontal bar (Plan 0047).

- `@kvirn-ui/theme`: in a `Navigation`, the current page is now a solid `primary` fill with an `on-primary` label at weight 600 (it was a tint with a bar). Every ancestor of the current page is a quiet trail: the `primary-subtle` fill at weight 600, found with CSS `:has()`, so there is no prop to set. The other items are weight 400 (they were 500), and hover is the link underline instead of a fill. In forced colours the fills drop, the current item keeps a straight `LinkText` bar and the trail keeps its weight. `className="kv-navigation--horizontal"` on `Navigation.Root` lays the top level out as a row that wraps (one level: a nested list stays a column). A `Navigation.List` with `hidden` now stays collapsed without `reset.css`. No new colour and no new contrast pair.
- `@kvirn-ui/react`: `Navigation.Root` warns once per name in development when more than one link in it has `aria-current` (`navigation-multiple-current:<name>`, WCAG 1.3.1, 4.1.2). The rule: exactly one current link per navigation, `current="page"` when the page is listed, otherwise `current` on the deepest item shown, and never on an ancestor of a listed page or on a link inside a `hidden` group. There is no API change, and no `orientation` prop: orientation is the class `kv-navigation--horizontal`.
