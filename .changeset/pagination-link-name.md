---
'@kvirn-ui/react': patch
---

`Pagination.Link` with your own `children` no longer sets the default `aria-label` (the visible text is the name, WCAG 2.5.3). `Pagination.List` and `Breadcrumb.List` now carry `role="list"`, `SummaryList.Key` keeps a consumer `id` and the `SummaryList.Change` link's name follows it, and `ErrorSummary` links fall back to the browser's jump when the control can't take focus.
