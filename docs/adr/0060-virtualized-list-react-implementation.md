# ADR-0060: Virtualized Listbox, Combobox and Autocomplete share one hook, and a virtualizer lives only while the popup is open

- **Status:** Proposed
- **Date:** 2026-10-04
- **Deciders:** Plan 0026 (the React binding of ADR-0059 item 3 and ADR-0037 item 11). The details below are proposed and open to change in review.
- **Tags:** architecture, api, a11y

## Context

ADR-0059 decides that KvirnUI owns the virtualizer and that `virtualize` is an option, and the plan lists the behaviour. Building it needed a few decisions that those leave open: where the virtualizer's lifetime starts and ends, how the options that an adopter renders find their place, what happens when the scroll element can't be measured yet, and how the library's memoization meets "the active option is always rendered".

## Decision

1. **One internal hook, `useListVirtualization`**, called by `useListbox` and by `useComboboxMachine` after `usePopup`. It returns `undefined` unless `virtualize` is on, the popup is open and the list is flat, and otherwise the rendered items, the sizer's props, each option's extra props and the `ref` that measures an option. `Listbox.List` and `Listbox.Option` read it from `ListboxListContext`, so Listbox, Combobox and Autocomplete share every part and every test.
2. **A virtualizer lives only while the popup is open.** A new one is created each time the popup opens and unmounted when it closes, so every opening starts at the top, or at the chosen option, whatever the browser did to the scroll position of the hidden list. Measured heights are not kept between openings: they are measured again in the first frames. The cost is small, and it removes a class of stale-offset bugs.
3. **Calls to the core happen in the order the accessibility rules need.** `setOptions` is called on every render, as TanStack's own adapters do, so the active index and the count are current when `getVirtualItems()` is read. `mount()` runs in a layout effect after `usePopup`'s, so the popup is shown and placed when the scroll element is measured. `scrollToIndex` runs in a layout effect when the active index changes by a key (not by the pointer), and once on opening for the chosen option. The active option is rendered in the same commit that sets `aria-activedescendant`, because it is a required index, so scrolling and pointing never race.
4. **A required index that changes doesn't move the window, so the core hands the library a new `rangeExtractor`.** TanStack memoizes the rendered indexes on the extractor, the overscan, the count and the visible range, and never asks the extractor again when only the active index changed. `createListVirtualizer` reads `getRequiredIndexes()` on every `getVirtualItems()` and replaces the extractor when the set changed, which is the only way to keep the contract "required indexes are always rendered" without forking the library.
5. **A scroll element that measures 0 is ignored.** The popup's list is `display: none` until the popup is shown, and a combobox popup with no rendered option draws nothing (`:not(:has([role='option']))`), so a virtualizer that believed a 0 height would render no option and never open. The core ignores a rect with no height and uses `initialSize` (ten items of `estimateSize(0)` by default) until the real size arrives. `initialSize` is the one option added to the plan's `ListVirtualizerOptions`, and it makes the core testable without a DOM.
6. **The options are placed with inline geometry only**, inside one sizer element: the sizer has `position: relative` and the total block size, and each option `position: absolute`, `inset-inline: 0`, `inset-block-start: 0` and `transform: translateY(start)`, with `data-index` for measuring. The sizer has no role and no ARIA attribute, so axe and assistive technology treat it as transparent (`aria-required-children`). The default theme needs no new rule, because the popup's flex column already clamps the list to the room that is left. A headless adopter gives `Listbox.List` a height limit and `overflow-y: auto` themselves, and the docs say so.
7. **`Listbox.Option` gets its place through a context that says it is inside the sizer** (`ListboxVirtualContext`), so an option that an adopter renders by hand next to a virtualized list (a non-function child, which can't be virtualized) is rendered as it is, with one development warning, instead of half positioned.
8. **Combobox and Autocomplete have no End row.** The plan's draft lists "ArrowDown, End" for the Combobox, but Home and End move the caret in a text field (ADR-0037, item 4). The Combobox and Autocomplete contracts have rows for ArrowUp on the closed input (the last option), the arrows, Page Up and Page Down, and for filtering, which reach the same unrendered options. Only the Listbox, whose trigger isn't a text field, has Home and End rows.

## Consequences

- Positive: one hook and one set of component and e2e tests for three components, the rules from ADR-0059 enforced in the core, and no change to what a non-virtualized list renders.
- Negative / trade-offs:
  - Measured heights are lost when the popup closes.
  - An extra context (`ListboxVirtualContext`) and extra props on every option of a virtualized list.
  - `initialSize` is an addition to the plan's `ListVirtualizerOptions`.
  - The scroll element needs a height limit from the theme or the adopter, or the whole list is rendered (the list is as tall as the sizer).
- Follow-ups: the manual AT run on `aria-activedescendant`, `aria-setsize` and `aria-posinset` into a virtualized list (NVDA, JAWS, VoiceOver, TalkBack), and a bundle check that `virtual-core` is not in a bundle that imports only `Button`.

## Validation

- Core tests: required indexes far outside the window are rendered, segments add up to the total size, `setOptions` with a changed count, and a required index that changes without a `setOptions`.
- Component tests (`listbox-virtual.test.tsx`, `combobox-virtual.test.tsx`, `autocomplete-virtual.test.tsx`): only a window of 10 000 items is mounted, End mounts the last option with `aria-posinset="10000"`, `aria-activedescendant` always resolves to an element, typeahead and Page Down reach unrendered options, `groups` warn and render in full.
- e2e: the rows added to the three contracts.
