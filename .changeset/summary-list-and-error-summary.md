---
'@kvirn-ui/react': minor
'@kvirn-ui/i18n': minor
'@kvirn-ui/theme': minor
---

`SummaryList` and `ErrorSummary` (Plan 0063).

- React: `SummaryList` (`Root` `<dl>`, `Row`, `Key` `<dt>`, `Value` `<dd>`, `Actions` `<dd>`, `Change` `<a>`, all also named exports) and `useSummaryList`. The Change link's name is "Change" plus the row's key, wired by the Row (`aria-labelledby`), so the visible text starts the name. `ErrorSummary` (`Root`, `Title`, `List`, `Item`, `Link`, all also named exports) and `useErrorSummary`: an `Alert.Danger` that is a named `group` with `tabindex="-1"`, focused when it appears and when `focusKey` changes, never a live region (focus is the announcement). `ErrorSummary.Link controlId` sets `href="#id"` and, on a plain click, moves focus to the control and scrolls its label or legend into view. `prefixDocumentTitle` puts the new `errorSummary.titlePrefix` before the page title while shown (off by default). Development warnings `error-summary-control-missing:<id>`, `error-summary-<part>-outside-root` and `summary-list-change-outside-row`.
- i18n: the new namespaces `errorSummary` (`title`, `titlePrefix`) and `summaryList` (`change`) in `KvirnMessages` and all six catalogs. A custom catalog must add them. fi, nb and nn are drafts that need native review, and se is an English placeholder.
- Theme: `kv-summary-list` and its parts (rows stack below `40rem`), `kv-error-summary`, `-list`, `-item` and `-link`. Existing tokens only. Prose leaves a summary list alone.
