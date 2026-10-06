---
'@kvirn-ui/react': minor
'@kvirn-ui/i18n': minor
'@kvirn-ui/theme': minor
---

`Breadcrumb` and `Pagination` (Plan 0062), for the municipality reference site. Both are a named `<nav>` around a list of real links, and their link parts are thin wrappers over `Link.Root`, so a registered router link (Next.js, TanStack Router) is used.

- React: `Breadcrumb` (`Root`, `List`, `Item`, `Link`, `Current`) and `Pagination` (`Root`, `List`, `Item`, `Link`, `Previous`, `Next`, `Ellipsis`, `Status`), their flat part exports (`BreadcrumbRoot`, `PaginationLink`, …), the hooks `useBreadcrumb` and `usePagination` and their types. The current breadcrumb is a `<span aria-current="page">`, and the current page of a pagination stays a link with `aria-current="page"`. The render-state type is `PaginationPartState`.
- i18n: the new keys `breadcrumb.label` and `pagination.label`, `previous`, `next`, `status`, `page` and `currentPage` in `KvirnMessages` and all six catalogs. A custom catalog must add them. `fi`, `nb` and `nn` are drafts for native review, and `se` is an English placeholder.
- Theme: `kv-breadcrumb` (a wrapping row with a chevron separator that is never read and mirrors in RTL) and `kv-pagination` (44px targets, the current page a filled shape, and below `40rem` only Previous, the status text and Next). No new tokens. Forced colours are handled.
