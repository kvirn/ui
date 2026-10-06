---
'@kvirn-ui/react': patch
'@kvirn-ui/i18n': patch
'@kvirn-ui/theme': patch
---

Pagination: a page link's name is `Sida 2` with or without `current`, because `aria-current="page"` is announced already; `getPageLabel` takes only the page and the message `pagination.currentPage` is removed. Below 40rem the theme keeps the current page link next to Previous, the status and Next, and `Pagination.Root` warns (`pagination-status-missing`) when it has no `Pagination.Status`. `Navigation.Label` keeps a consumer's own `id` and the nested list is named by it. A controlled `Disclosure` with `hiddenUntilFound` restores `hidden="until-found"` when the consumer ignores a find-in-page match.
