---
'@kvirn-ui/react': minor
---

Table: `Table.ScrollRegion` has a new `region` prop, and `useTable` a matching `region` option (`'overflow' | 'always'`, default `'overflow'`). By default the scroll region is now a named `role="region"` only while the table overflows, as it is a Tab stop only while it overflows. A table that fits is a plain `<div>` with no role, no name and no `tabindex`, so a page of short tables doesn't list an empty landmark for each. `region="always"` keeps the previous behaviour: a named region whether it overflows or not (still a Tab stop only while it overflows). `useTable` also returns `getScrollRegionProps(region)`, and `scrollRegionProps.role` is now optional. The "no name" development warning applies only once the scroll region is a region.
