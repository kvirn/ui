# ADR-0059: TanStack Table and TanStack Virtual are bundled in `core`, and KvirnUI owns the instances

- **Status:** Proposed
- **Date:** 2026-10-03
- **Deciders:** Maintainer (chose to bundle both over ADR-0034's bring-your-own and a hybrid)
- **Tags:** architecture, api, a11y

Supersedes ADR-0034. Amends ADR-0035 (items 8, 9 and 11) and ADR-0037 (item 11).

## Context

ADR-0034 proposed that consumers create their own TanStack Table and TanStack Virtual instances and pass them in, so KvirnUI would add no runtime dependency. The maintainer has since asked for both libraries to be the base of Table and of virtualized Listbox, Combobox and Autocomplete results.

Working through the bring-your-own design showed where it leaves accessibility to the consumer:

- **Virtualization.** A virtualized listbox is only accessible if the active option (`aria-activedescendant`), the selected option and the focused item stay mounted, and if keyboard moves scroll before they point. With a consumer-built virtualizer, the consumer has to wire our listbox element as the scroll element and pass our range extractor. If they forget, `aria-activedescendant` points at nothing. We can document that, but we can't test it.
- **Table.** Sorting, selection and expansion need names, `aria-sort`, announcements and i18n. With a consumer-built instance we have to accept any configuration, including multi-sort on Shift+click (an undocumented key) and options we never tested.

Both libraries are framework-agnostic, MIT, side-effect-free and make no network calls:

- `@tanstack/table-core` 9.2.4. Its only dependency is `@tanstack/store` ^0.11.1, which our pinned 0.11.2 satisfies, so it adds no second copy of the store. v9 exposes table state as a `@tanstack/store` `ReadonlyStore` (`table.store`), which our `useStoreSelector` can read.
- `@tanstack/virtual-core` 3.17.11, no dependencies. It reads `window` once at module scope, behind a `typeof window` guard (to detect `scrollend`), which is SSR-safe.

## Decision drivers

- The accessibility rules for virtualized lists and tables are enforced by our code and our tests, not by consumer wiring.
- `core` stays pure and testable without a DOM (hard rule 3), and each library is confined to one directory, like the store (ADR-0003).
- Consumers who don't render a Table or turn on virtualization pay nothing in their bundle (vision principle 8).
- One version of each library, chosen and tested by us.

## Options considered

### Option A: bundle both in `core`, KvirnUI creates the instances (chosen)

- ✅ We own the range extractor, the scroll element and `scrollToIndex`, so the active, selected and focused items are always mounted. Tested once, for every component.
- ✅ We own the table options that affect accessibility (multi-sort off by default, our sort announcements), and the full TanStack feature model stays available.
- ✅ One install for consumers, and no version skew between our types and their instance.
- ❌ Two more runtime dependencies. Mitigated by tree-shaking: both are only reached from `useTable` and from the `virtualize` code path.
- ❌ Re-exported TanStack types become part of our public API, so a TanStack Table major is a KvirnUI major.

### Option B: bring your own instance (ADR-0034)

- ✅ No runtime dependency.
- ❌ The accessibility of a virtualized list depends on consumer wiring we can't test. Rejected.

### Option C: bundle Virtual only, Table brought by the consumer

- ✅ Fixes the virtualization problem, which is the most fragile one.
- ❌ Two models for one problem, and the Table still accepts untested configurations. Rejected.

## Decision

We will bundle both libraries in `@kvirn-ui/core`:

1. **Dependencies.** `@tanstack/table-core` and `@tanstack/virtual-core` are runtime dependencies of `@kvirn-ui/core`, pinned exactly in the pnpm catalog (`9.2.4`, `3.17.11`). Upgrades are deliberate and go through the full gates. `@kvirn-ui/react` gains no new dependency.
2. **Confinement.** Like the store (ADR-0003), each is imported in one directory only, and lint enforces it, subpaths included:
   - `@tanstack/virtual-core` only in `packages/core/src/virtual/`.
   - `@tanstack/table-core` only in `packages/core/src/table/`.
   - Everything else, `@kvirn-ui/react` included, imports our wrappers and re-exports from `@kvirn-ui/core`.
3. **Virtualization: `createListVirtualizer` in `core/src/virtual/`.** It wraps the TanStack `Virtualizer` and owns the accessibility rules from ADR-0034 item 5, which still apply:
   - **Keep what matters mounted.** It takes `getRequiredIndexes()` and adds those indexes to the rendered range (the active, selected and focused items), even when they're out of view.
   - **Scroll before you point.** Keyboard moves call `scrollToIndex(index, { align: 'auto' })`. Because required indexes are always rendered, the element exists in the same commit that sets `aria-activedescendant` or moves focus.
   - **Navigate the data, not the DOM.** Unchanged: the Listbox and Combobox cores already navigate by index.
   - **Expose the full size.** Rendered options get `aria-setsize` and `aria-posinset`, and table rows get `aria-rowindex` with `aria-rowcount` on the table.
   - It returns the rendered items and the gaps between them (`getSegments()`), so a table can draw spacer rows and a list can position its options.
4. **Virtualization is an option, not an instance.** Listbox, Combobox, Autocomplete and Table take `virtualize?: boolean | { estimateSize?: number; overscan?: number }`. Off by default. The docs recommend pagination or filtering first, because unrendered content can't be found with find-in-page, isn't printed, and is out of reach of screen-reader browse mode.
5. **Layout-critical inline styles.** A virtualized part sets the inline styles virtualization can't work without: the list's total height, each option's position, and a spacer row's height. This is the one exception to "headless packages ship zero CSS" (hard rule 5). It covers geometry only, never colour, spacing or type. Without a theme, a virtualized list still lays out correctly.
6. **Table: `createTable` in `core/src/table/`.** It wraps `constructTable` with the store reactivity bindings, adapts `table.store` to our `ReadableStore`, and sets accessible defaults the consumer can't silently lose: `enableMultiSort: false` (multi-sort needs Shift+click, a key the Table pattern doesn't define). It also exports `createLocaleSortFn(locale)`, an `Intl.Collator` sort, so å, ä and ö sort as they do in Swedish, Finnish and Norwegian.
7. **Curated re-exports.** `@kvirn-ui/core` and `@kvirn-ui/react` re-export the table features we test (sorting, selection, expansion, pagination, filtering and global filtering, column visibility), their row models, built-in sort and filter functions, `createColumnHelper`, `tableFeatures` and the public types. Consumers don't install `@tanstack/table-core` themselves. What we don't re-export, we don't support.
8. **The React Table binding is in the main entry.** `useTable(options)` creates the instance through `createTable` and returns it with KvirnUI's prop getters. `<Table.Root table={…}>` provides it to the parts. The separate `@kvirn-ui/react/tanstack-table` entry and the optional peer from ADR-0034 are dropped.

### Amendments to earlier ADRs

- **ADR-0034:** superseded. Its accessibility rules (item 5) carry over as item 3 above, and its structural `Virtualizer` interface is replaced by `createListVirtualizer`.
- **ADR-0035 item 8:** `useDataTable(table)` in a separate entry becomes `useTable(options)` in the main entry, as in item 8 above.
- **ADR-0035 item 9:** the `virtualizer` prop on `Table.Body` becomes the `virtualize` option of `useTable`. Spacer rows, `aria-rowcount`, `aria-rowindex`, the sticky header and the fixed layout are unchanged.
- **ADR-0035 item 11:** until ScrollArea (ADR-0036) exists, Table ships `Table.ScrollRegion`: a named, focusable scroll container with the `kv-scroll-region` behaviour. It is also the virtualizer's scroll element.
- **ADR-0037 item 11:** the `virtualizer` prop on `Listbox.Root` becomes the `virtualize` option on Listbox, Combobox and Autocomplete. Flat lists only, as before. With groups, a development warning is logged and the list renders in full.

## Accessibility impact

- Positive: the virtualization rules for 1.3.1, 2.1.1, 2.4.3, 2.4.7 and 4.1.2 are enforced in one place, and the shared tests cover every component that virtualizes.
- 2.1.4: multi-sort is off by default, so the Table handles no undocumented Shift+click combination.
- Sort order follows the user's locale (`Intl.Collator`), which matters for Nordic names.
- Unchanged from ADR-0034: virtualization is opt-in, find-in-page and print don't reach unrendered content, and screen-reader support for `aria-setsize` and `aria-rowcount` varies, so the manual AT run checks it before `beta` (pending).
- No APG deviation.

## Consequences

- Positive:
  - The accessibility of virtualized lists and of TanStack-driven tables no longer depends on consumer wiring.
  - Consumers get one install and no TanStack version to align.
  - `@tanstack/table-core` reuses our `@tanstack/store`, so the store is still one copy.
- Negative / trade-offs:
  - Two more runtime dependencies in `core`, and hard rule 6 names three sanctioned libraries instead of one.
  - A TanStack Table major forces a KvirnUI major, because its types are re-exported.
  - Consumers who already use TanStack Table can't pass their own instance. They move their feature configuration into `useTable`.
  - Virtualized parts carry inline geometry styles.
- Follow-ups:
  - Updated with this ADR: AGENTS.md hard rule 6, `docs/architecture.md` (dependencies), `docs/vision.md` principle 8, and the lint boundaries in `vite.config.ts`.
  - Plan 0026 builds the virtualizer, Listbox, Combobox and Autocomplete virtualization, and Table.
  - Add bundle budgets for `core` that include both libraries (the ADR-0003 follow-up).

## Validation

- Lint fails on an import of either library outside its directory.
- Core tests: required indexes are always in the rendered range, gaps add up to the total size, and `scrollToIndex` is called before the active index changes.
- Component and e2e tests: a 10 000-option list reaches the last option with End, Page Down and typeahead, `aria-activedescendant` always points at an element in the DOM, and options carry the right `aria-setsize` and `aria-posinset`. A virtualized table keeps the focused row mounted while it scrolls, and its rendered rows carry the right `aria-rowindex`.
- A tree-shaking check: a bundle that imports only `Button` contains no TanStack Table or Virtual code.
- Manual AT (pending): NVDA, JAWS, VoiceOver and TalkBack with virtualized Listbox, Combobox and Table.

## References

- ADR-0003, ADR-0034, ADR-0035, ADR-0036, ADR-0037; AGENTS.md hard rules 3, 5 and 6; `docs/vision.md` principle 8
- TanStack Table v9 (`constructTable`, `storeReactivityBindings`, `table.store`), TanStack Virtual v3 (`Virtualizer`, `rangeExtractor`, `scrollToIndex`)
- WAI-ARIA 1.2: `aria-setsize`, `aria-posinset`, `aria-rowcount`, `aria-rowindex`
- Dependency check (2026-10-03, `pnpm view` and `npm pack`): `@tanstack/table-core` 9.2.4, MIT, depends on `@tanstack/store` ^0.11.1; `@tanstack/virtual-core` 3.17.11, MIT, no dependencies. Neither makes network calls.
