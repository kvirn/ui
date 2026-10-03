# ADR-0034: TanStack Table and TanStack Virtual are brought by the consumer, not bundled

- **Status:** Superseded by ADR-0059
- **Date:** 2026-10-02
- **Deciders:** Maintainer asked for a Table "used with TanStack Table" and virtualization "with TanStack Virtual" for large data in Table, ScrollArea, Select, Combobox and Autocomplete. The approach below is proposed and open to change.
- **Tags:** architecture, api, a11y

## Context

Four planned components need to handle large data sets (ADR-0035 to ADR-0037). Two TanStack libraries already solve the data side:

- **TanStack Table** (`@tanstack/table-core` 9.2.4, MIT): a headless table model for sorting, filtering, grouping, pagination, row selection, expansion, column visibility, pinning and sizing. It renders nothing. Its only dependency is `@tanstack/store` ^0.11, which we already use (ADR-0003).
- **TanStack Virtual** (`@tanstack/virtual-core` 3.17.11, MIT, no dependencies): a headless virtualizer that works out which items of a long list are in view, measures them and scrolls to an index.

Neither makes network calls, sets cookies or collects telemetry. Both are framework-agnostic, with thin React adapters (`@tanstack/react-table`, `@tanstack/react-virtual`).

The repo's rules pull in two directions:

- Hard rule 6 and ADR-0003: `@tanstack/store` is the only runtime dependency, and `react` depends only on React, `core` and `i18n`. Vision principle 8: zero cost you didn't ask for.
- The maintainer wants first-class TanStack support, and vision principle 1 is the TanStack approach: the consumer owns the markup and, by extension, the data model.

What KvirnUI adds is the accessibility layer the TanStack libraries leave out: native table semantics, sort buttons and `aria-sort`, selection checkboxes with names, `aria-rowcount` and `aria-setsize` for content that isn't rendered, keeping the focused item mounted, announcements, and i18n strings. That layer doesn't need TanStack code at runtime. It needs to read a table instance or drive a virtualizer.

## Decision drivers

- No new runtime dependency unless it pays for itself (hard rule 6).
- Consumers who already use TanStack Table or Virtual keep their own instance, version and configuration.
- Consumers who don't need large data pay nothing, not even an install.
- The accessibility layer is ours and is tested; the data layer is TanStack's.
- `core` stays pure (hard rule 3).

## Options considered

### Option A: runtime dependencies of `core`, wrapped like the store

- ✅ One install, and we control the version.
- ❌ Two more runtime dependencies for every adopter, including those without a table or a long list.
- ❌ Consumers who already use TanStack Table get a second copy, or a version conflict with the one we pin.
- ❌ We'd have to re-expose TanStack's large option surface, or hide it and fall behind.

### Option B: bring your own instance (chosen)

The consumer creates the instance with `@tanstack/react-table` or `@tanstack/react-virtual` and passes it to our hooks and parts. We read it and call its methods, but never import TanStack code at runtime.

- ✅ No runtime dependency, and no duplicate copies.
- ✅ The full TanStack API stays available, documented by TanStack.
- ✅ Matches "the consumer owns the markup": the consumer also owns the model.
- ❌ Two lines more setup for the consumer, and our types have to track TanStack's public API.

### Option C: our own table model and virtualizer

- ❌ Large, already solved, and against the TanStack premise. Rejected.

## Decision

We will use Option B:

1. **Virtualization uses a structural interface, with no TanStack import.** `core` defines a minimal `Virtualizer`-shaped interface (in `core/src/virtual/`): `getVirtualItems()` (each item has `index`, `key`, `start`, `size`), `getTotalSize()`, `scrollToIndex(index, options)` and `measureElement(element)`. A TanStack Virtual instance satisfies it as is. Listbox, Select, Combobox, Autocomplete, Table and ScrollArea accept it as an optional `virtualizer` prop. Without it they render every item.
2. **Table bindings live in a separate entry point, `@kvirn-ui/react/tanstack-table`.** It uses `import type` only from `@tanstack/table-core`, so it adds no runtime code. The main `@kvirn-ui/react` entry never references TanStack types, so consumers who don't use TanStack Table never need its types.
3. **Package metadata.** `@kvirn-ui/react` lists `@tanstack/table-core` as an optional peer dependency (`^9`, with `peerDependenciesMeta.optional`). TanStack Virtual needs no peer entry, because only the structural interface is used. Both are pinned exactly as devDependencies in the pnpm catalog, for tests and stories.
4. **Lint enforces the boundary.** Only type imports from `@tanstack/table-core` are allowed, and only in the `tanstack-table` entry. No `@tanstack/*-virtual` import is allowed outside tests and stories. This extends ADR-0002's import boundaries.
5. **The rules every virtualized component must follow** (the accessibility layer):
   - **Keep what matters mounted.** The focused item, the highlighted option (`aria-activedescendant`) and the selected option are always rendered, even when they're out of view. The binding adds their indexes through the virtualizer's range, so focus never falls to `body` when an item scrolls out.
   - **Expose the full size.** Rendered items say where they are in the whole set: `aria-setsize` and `aria-posinset` on options and list items, `aria-rowcount` and `aria-rowindex` on tables.
   - **Scroll before you point.** When keyboard navigation moves to an item that isn't rendered, the binding scrolls to it first, and only sets focus or `aria-activedescendant` once the element exists.
   - **Navigate the data, not the DOM.** Home, End, Page Up, Page Down and typeahead work on the item model, so they reach items that aren't rendered.
   - **Virtualization is opt-in.** Docs recommend pagination or filtering first. Virtualized content can't be found with the browser's find-in-page, isn't printed, and screen-reader browse mode only reaches what is rendered.
6. **`AGENTS.md`, `docs/architecture.md` and `docs/vision.md`** are updated when this ADR is accepted: TanStack Table is an optional, type-only peer, and the runtime dependency rule is unchanged.

## Accessibility impact

- Virtualization affects 1.3.1, 2.1.1, 2.4.3, 2.4.7 and 4.1.2: content that isn't in the DOM doesn't exist for assistive technology. Item 5 keeps the size and position information, keeps focus and the active descendant mounted, and keeps every item reachable by keyboard.
- Find-in-page and print don't reach unrendered content. This isn't a WCAG failure, but it hurts users who rely on find (cognitive disabilities, magnifier users). Virtualization is therefore opt-in and documented as a last resort after pagination and filtering.
- No APG deviation. APG doesn't cover virtualization, but its patterns for listbox, combobox and table hold with `aria-setsize`, `aria-posinset`, `aria-rowcount` and `aria-rowindex`, which ARIA 1.2 defines for this case.

## Consequences

- Positive:
  - The runtime dependency rule stays as it is.
  - Consumers keep full TanStack features and upgrade TanStack on their own schedule (within `^9` for Table).
  - Every virtualized component shares one set of rules and one set of tests.
- Negative / trade-offs:
  - A TanStack Table major version needs a new `tanstack-table` major of ours, or a second entry point.
  - Consumers wire two libraries. Docs give a copy-paste recipe for each component.
  - A second entry point in `@kvirn-ui/react` adds build and `exports` configuration.
- Follow-ups:
  - Plans for Table (ADR-0035), ScrollArea (ADR-0036) and Select, Combobox and Autocomplete (ADR-0037).
  - A shared virtualization test helper in `@kvirn-ui/testing`: focus survives scrolling, set size and position are correct, and keys reach unrendered items.

## Validation

- Type tests: a `@tanstack/react-virtual` instance is assignable to the `core` interface, and the `tanstack-table` bindings accept a `@tanstack/react-table` instance with inferred row types.
- A bundle check: the published `@kvirn-ui/react` contains no `@tanstack/table-core` or `@tanstack/virtual-core` code.
- The shared virtualization tests pass for every component that accepts `virtualizer`.
- Manual AT (pending): NVDA, JAWS, VoiceOver and TalkBack report the full set size and position in a virtualized listbox and table.

## References

- TanStack Table v9 and TanStack Virtual v3 documentation
- WAI-ARIA 1.2: `aria-setsize`, `aria-posinset`, `aria-rowcount`, `aria-rowindex`
- ADR-0002, ADR-0003; AGENTS.md hard rules 3 and 6; docs/vision.md principles 1 and 8
- Dependency check (2026-10-02, `pnpm view`): `@tanstack/table-core` 9.2.4, MIT, depends on `@tanstack/store`; `@tanstack/virtual-core` 3.17.11, MIT, no dependencies. Neither makes network calls.
