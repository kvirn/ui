---
'@kvirn-ui/react': minor
'@kvirn-ui/i18n': minor
---

Add `useRouteFocus` (Plan 0055): after a client-side navigation it moves focus to the new page's title (2.4.3). Pass the router's location as `key` (pathname plus search, never the hash) and a `containerRef`. It does nothing on the first load, on a hash-only change, on Back or Forward while `history.scrollRestoration` is `'auto'`, while the user types in a field, or when no target exists (development warning `route-focus-target-missing`). `announce` (off by default) also says the title in the shared live region.

- `@kvirn-ui/react`: `useRouteFocus` and `UseRouteFocusOptions`.
- `@kvirn-ui/i18n`: a new `routeFocus` namespace (`navigated`, with `{title}`) in `KvirnMessages` and all six catalogs. This is a type-level addition: a hand-written `KvirnMessages` catalog must add `routeFocus` to keep compiling. `se` is an English placeholder; native review is pending.
