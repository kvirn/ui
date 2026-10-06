---
'@kvirn-ui/react': minor
---

New `ScrollArea` and `useScrollArea`: a `<div>` with the browser's own scrollbars that is a named `region` and a Tab stop only while its content overflows (`region="always"` names it either way), so a keyboard user can scroll it (WCAG 1.4.10, 2.1.1). Name it with `aria-label` or `aria-labelledby`: a region with no name logs a development warning. `Table.ScrollRegion` uses the same logic and is unchanged.
