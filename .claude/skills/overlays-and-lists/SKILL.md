---
name: overlays-and-lists
description: How KvirnUI builds floating popups and long lists - the native `popover` top layer, `computePlacement`, the dismissable layer stack, Popover, the shared Listbox / Combobox / Autocomplete core, list virtualization and the Table (TanStack Table and Virtual wrapped in core), plus scroll containers and the announcements these components make. Use when you add or change any popup, select, combobox, autocomplete, virtualized list or data table, or review one.
when_to_use: popover, popup, dropdown, menu, tooltip, select, Listbox, Combobox, Autocomplete, typeahead, filter, aria-activedescendant, top layer, popover attribute, placement, flip, Escape closes one layer, outside press, light dismiss, virtualize, long list, Table, sortable table, row selection, expandable row, scroll region, aria-rowcount, TanStack Table, TanStack Virtual, live announcement for results
---

# Overlays and lists

The code lives in three places:

- `packages/core/src/overlay/` (`computePlacement`, `createDismissableLayerStack`), `listbox/`, `combobox/`, `filter/`, `virtual/`, `table/`, `announcer/`. Pure. No React, no DOM at import time.
- `packages/react/src/popup/` (`usePopup`, `useDismissableLayer`), `popover/`, `listbox/`, `combobox/`, `autocomplete/`, `table/`.
- Contracts: each component's `<name>.a11y.md` is the per-key and per-state truth. This skill is the shared design behind them.

Load `keyboard` and `accessibility` with this skill. Keys for these patterns are in `keyboard/references/key-tables.md`. Class names are in [references/class-names.md](references/class-names.md). Theme rules for popups and tables are in the `theme-css` skill.

## Floating popups

### Native top layer

- A popup is an element with the native `popover` attribute: `auto` for Popover and Menu, `manual` for Listbox, Combobox, Autocomplete and Tooltip (their focus stays on the trigger or input, so platform light dismiss must not take part, and a tooltip never closes an open Popover).
- There is no `Portal` for popups (it stays planned, but no popup needs it), no `z-index`, and no clipping by an ancestor's `overflow`. CSS anchor positioning is not used. No positioning dependency (no Floating UI).
- `usePopup({ open, anchorRef, popupRef, placement, offset, padding, matchAnchorWidth, popover, onNativeDismiss })` is the shared mechanic. The popup element must stay rendered so it can be shown and hidden. Without the Popover API it falls back to `hidden`.
- It moves no focus and handles no dismissal. Pair it with `useDismissableLayer`.
- When the platform hides the popup on its own (light dismiss, another auto popup opening), `onNativeDismiss` fires. Set `open` to `false` there.

### Placement

- `computePlacement(anchorRect, popupRect, viewport, options)` in core is pure. Default `bottom-start`. Options: `placement`, `direction`, `offset`, `padding`, `matchAnchorWidth`, `minWidth`. It returns `{ x, y, placement, maxHeight, width }`.
- It flips to the other side when the popup does not fit, shifts to stay inside the viewport, limits `maxHeight` to the room left, and never covers the anchor (2.4.11). `start` and `end` follow the reading direction and flip in right-to-left.
- `usePopup` measures at natural size and applies inline `position: fixed` with `left` and `top`. It never animates position. It places again on scroll (any scroller), resize, size changes of the anchor or popup, and when the anchor moves (checked once per frame while open). Nothing reads `window` while rendering.
- Exposed to the theme: `data-open`, `data-placement`, `data-detached` (the anchor is scrolled out of view; the popup is `visibility: hidden`), and the custom properties `--kv-popup-width`, `--kv-popup-max-height`, `--kv-anchor-width`. A consumer may set `--kv-popup-height-limit` and `--kv-popup-width-limit` (lengths) to cap the height and the width. The theme sets 20rem width on the tooltip.
- Animation is opacity only, and none under reduced motion. At 320px the popup is at least the anchor's width and never wider than the viewport.
- Popover and Listbox default to `offset` 4 and `padding` 8.

### The dismissable layer stack

- `createDismissableLayerStack()` (core) holds the ordered layers. Only the **top** layer reacts to Escape and outside presses, so one Escape closes one layer (outside presses skip a layer with `passOutsidePressThrough`, a tooltip). The registry in React is created lazily at first use, so importing reads no `window`.
- `useDismissableLayer({ open, onDismiss, ref, ignore, dismissOnEscape, dismissOnOutsidePress, passOutsidePressThrough })` reports `'escape'` or `'outside-press'`. The owner closes the layer and returns focus.
  - Escape is read on the document after page handlers. It is ignored if a handler called `preventDefault()` on it or during IME composition. When it handles Escape it calls `preventDefault()` itself, so the browser's own close request does not close a second layer.
  - An outside press is read on `pointerdown`. A touch press is reported when the finger lifts, and not at all if the gesture becomes a scroll.
  - A press inside `ref` or on an `ignore` target (the anchor: a Popover trigger, a Combobox input and button) never dismisses.
- A press in a layer further down the stack is still outside the top layer and dismisses it.
- **`dismissOnOutsidePress: false` alone still shields** the layers below: an outside press reaches no layer (a modal Dialog). **`passOutsidePressThrough: true`** is for a non-modal layer with nothing to press, a tooltip: outside presses skip it and go to the next layer, so one press closes a Popover underneath even while a tooltip is open. Escape is not passed through: the top layer, the tooltip, takes it.

### Popover

- Parts `Popover.Root`, `.Trigger`, `.Popup`, `.Close`. Hook `usePopover` (contract: `popover.a11y.md`).
- Trigger: `<button>` with `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`. Popup: `popover="auto"`, non-modal `role="dialog"` that the consumer names (a dev warning fires without a name). Render the popup right after the trigger so Tab goes into it.
- Opening never moves focus. Focus returns to the trigger on Escape, Close, outside press and light dismiss, only if focus was inside the popup, on `body` or on the trigger.
- A mouse or touch click on the trigger toggles from the state its press found (the platform may close the popup between press and click). Enter and Space toggle from the current state.
- `onOpenChange(open, { reason, event })`, reasons `trigger-press | close-press | escape | outside-press | light-dismiss`.
- A popover never makes the page `inert`. That is a Dialog's job.

### Tooltip

- Parts `Tooltip.Root`, `.Trigger`, `.Popup`, `.Name`, `.Shortcut`. Hook `useTooltip` (contract: `tooltip.a11y.md`, Plan 0037). The timing is a pure machine in core (`createTooltipMachine`: hover delay 500 ms, keyboard focus at once, 100 ms grace, no timeout), tested with fake time.
- Popup: `popover="manual"`, `role="tooltip"`, always rendered and hidden while closed, so the trigger's `aria-describedby` resolves. It joins the layer stack with `dismissOnOutsidePress: false` and `passOutsidePressThrough: true`, so Escape closes the tooltip first and leaves a Popover underneath open, and an outside press goes through to that Popover in the same press. A focused open Listbox or Combobox handles Escape in its own key handler first, so the tooltip needs a second Escape (Known issues in the contract).
- Name versus description: `Tooltip.Name` (repeats the trigger's name) is `aria-hidden`, `Tooltip.Shortcut` is the trigger's `aria-describedby`. A tooltip with only a Name adds nothing for AT, so the whole popup is `aria-hidden` (role kept; an open `role="tooltip"` with only hidden content fails axe `aria-tooltip-name`). The Root works the description out from the parts that register themselves.
- One delay for the page: `getTooltipGroup()` (core) remembers the open tooltip and when one last closed, so the next opens at once within 300 ms. `createTooltipGroup()` makes a separate one (`group` option, and every component test).
- Keyboard focus opens it (`isKeyboardFocus`, so a click doesn't), touch opens nothing, and the trigger's `aria-expanded="true"` (it opened its own popup) closes it and keeps it closed.

### Dialog and AlertDialog

- Parts `Dialog.Root`, `.Trigger`, `.Popup`, `.Title`, `.Description`, `.Body`, `.Actions`, `.Close`; `AlertDialog` has the same parts and the role `alertdialog` (Plan 0067, contract: `dialog.a11y.md`).
- Popup: native `<dialog>` opened with `showModal()`. The top layer replaces a Portal, so there is none, and no `z-index`. The page behind is `inert` natively.
- Children render only while open. The popup joins the layer stack: Escape and the `backdrop` press go through `useDismissableLayer` (`backdrop` option), so one Escape closes the innermost layer and a Popover or Combobox inside closes first. A native `cancel` is prevented so state and element never desync. AlertDialog ignores the backdrop press; Dialog closes on it only with `dismissOnOutsidePress`.
- Scroll lock is `data-kv-scroll-locked` on `<html>` (core `scroll-lock`, counted for nested dialogs). `theme.css` applies it (`overflow: hidden`), so headless code sets no style.
- It hosts its own `AnnouncerContext` and Announcer inside the Popup, because the inert page silences the provider's regions.
- Return focus, in order: `finalFocusRef`, the trigger, the previously focused element if still connected. Never `body`. Implemented in `packages/react/src/dialog/focus-return.ts`.
- Initial focus: `initialFocusRef`, else the first tabbable that is not Close, else the Title. AlertDialog warns without `initialFocusRef` (least destructive action).

### FocusScope (planned)

- Not built. Purpose: return focus to the action that triggered a modal when it closes, also when the trigger is gone, and scope focus for non-native surfaces.
- The first implementation is internal, in `packages/react/src/dialog/focus-return.ts`. Extract it to a public FocusScope when a second user (Menu, DatePicker) arrives.

## Listbox, Combobox and Autocomplete

One core, three behaviours. `createListbox` holds options, active and selected keys, groups and typeahead. `createCombobox` wraps it with modes `listbox`, `combobox` and `autocomplete`.

| Component    | Mode        | Text field       | Value                              |
| ------------ | ----------- | ---------------- | ---------------------------------- |
| Listbox      | select-only | none (a trigger) | one key or an array, from the list |
| Combobox     | editable    | `<input>`        | one key or an array, from the list |
| Autocomplete | free text   | `<input>`        | the text itself (suggestions only) |

- React: `useListbox`; `useCombobox` maps the value to a key or array and the text to `inputValue`; `useAutocomplete` maps the text to `value`. The last two share the internal `useComboboxMachine` and both return `UseComboboxResult`.
- The popup parts (`Popup`, `List`, `Option`, `Group`, `GroupLabel`, `Empty`) are the Listbox's, reused by `Combobox.*` and `Autocomplete.*`. Classes stay `kv-listbox-*`, and dev warnings say "Listbox". Autocomplete is single-value: it has no `ValueList` or `Value`.
- The value is a key (`string | null`, or `string[]` for `multiple`). Items carry labels (`itemToString`) and keys (`itemToKey`).
- Options render only while the popup is open. A disabled option stays reachable by arrow keys and cannot be selected.

### Listbox

- Two renderings. `native="auto"` (default) renders a native `<select>` for single choice on a coarse primary pointer, read once right after mount (the first render is the popup, and it never swaps later). `"always"` and `"never"` force it. `multiple`, and any non-touch device, use the popup. `<select multiple>` is never used; `native="always"` with `multiple` renders the popup and warns. The native mode shows plain text only. The value is kept when the rendering changes.
- Custom trigger: `<div role="combobox" tabindex="0">` with `aria-expanded`, `aria-controls`, `aria-haspopup="listbox"`, `aria-activedescendant`, and `aria-labelledby` = Field label plus the value. Clicking the Field's label focuses the trigger. Selection does not follow focus. Focus never leaves the trigger.
- `Popup` is a role-less `popover="manual"` shell. `List` is `role="listbox"`: the scroller, the `aria-controls` target, named by the Field label, `aria-multiselectable` when `multiple`. `Empty` is plain text beside the List, never an option. While the popup is open with no option, the List is `hidden` with `data-empty`.
- A mouse press inside the popup never takes focus from the trigger.

### Combobox and Autocomplete

- `Combobox.Input` is a native `<input role="combobox" aria-autocomplete="list">`, named by `<label for>`. Its default `autoComplete` is `off` (a consumer value replaces it).
- `Combobox.Control` is an optional role-less `<div>` that anchors the popup (the popup is as wide as it) around the input, Toggle and Clear. A press on any of them is not "outside".
- Typing, ArrowDown, ArrowUp, Alt+ArrowDown and the Toggle open the popup. A click on the input does not. In Autocomplete typing opens it only when there is text.
- `aria-expanded` on the input is false while the popup has no option and nothing is loading.
- **Typed text is never cleared or replaced** except by choosing an option or the Clear button. Unmatched text stays and `value` is `null`. In single Combobox, editing away from the chosen label makes the value `null`.
- No option is active until an arrow key (or typeahead). Enter with none active selects nothing and keeps its native meaning (a form may submit). Caret keys (Home, End, ArrowLeft, ArrowRight, without Alt) clear the active option and are never cancelled. No inline completion.
- Toggle and Clear are `tabindex="-1"` (every action has a key; they stay in the accessibility tree), and pressing them keeps focus in the input. Clear renders only with text or a value.
- `multiple` (Combobox only): the popup stays open after a choice, and chosen values are a `<ul role="list">` (the role is deliberately redundant, Safari drops list semantics) named by the Field label, before the input. Remove buttons are normal Tab stops named `combobox.removeValue`. Backspace in an empty input removes nothing. After a removal, focus goes to the next remove button, else the previous, else the input.
- Key events during IME composition (`isComposing`) are left to the IME.
- Controlled `value`, `inputValue` and `open` pull back a change the owner refuses.
- Reasons. `onValueChange`: `option-press | key | input | remove | clear`. `onInputValueChange`: `input | selection | clear`. `onOpenChange` for Combobox and Autocomplete: `input | key | escape | toggle-press | option-press | outside-press | blur | light-dismiss | clear`. For Listbox: `trigger-press | option-press | key | escape | outside-press | blur | light-dismiss`.

### Keys (all three)

Arrows do not wrap. PageUp and PageDown move ten options and stop at the ends. Home and End go to the first and last option in Listbox, and move the caret in Combobox and Autocomplete. Listbox typeahead matches the start of the label (locale-aware, buffer resets after 500 ms). Escape closes and keeps the value and the text; a second Escape clears nothing. Tab selects the active option and moves on in a single Listbox, and closes without selecting in Combobox, Autocomplete and `multiple`. Alt+ArrowDown opens without moving the active option. Alt+ArrowUp selects the active option and closes (in `multiple` it adds, never toggles a chosen value off). Control and Meta combinations are never taken.

### Filtering

- The default filter matches the query anywhere in the label with `Intl.Collator` (provider locale, `sensitivity: 'base'`), so å, ä and ö stay distinct from a and o in `sv`, `fi`, `nb`, `nn` and `se`. A blank query matches everything.
- A consumer can pass `filter` (a function), or `filter={false}` and `isLoading` for server-side results.

### Forms

- `value` / `defaultValue` / `onValueChange`, `inputValue` / `onInputValueChange`. No form state of its own.
- With `name`: a Listbox and a Combobox render one hidden `<input>` per value (a single empty value sends `''`); the text is never sent. An Autocomplete puts `name` on the input.
- A native Listbox `<select>` carries `name` itself.

### Announcements

- Combobox and Autocomplete announce through the Announcer, debounced 500 ms and restarted on each text change: `combobox.resultCount`, `combobox.noResults`, `combobox.loading`. Nothing is announced while typing, on opening via a key or the Toggle, or for the active option (the screen reader reads that through `aria-activedescendant`).
- `isLoading` shows `combobox.loading` in `Empty` and sets `data-loading` on the popup.
- Without a `KvirnProvider` nothing is announced and one dev warning fires.

## Virtualization

Opt-in and off by default. Docs recommend pagination or filtering first, because unrendered rows cannot be found with find in page, printed or reached in browse mode.

- `@tanstack/virtual-core` is a runtime dependency of `@kvirn-ui/core` and `@tanstack/table-core` likewise, both pinned exactly in the catalog, upgraded deliberately. They are imported only in `core/src/virtual/` and `core/src/table/` (lint, subpaths included). Everything else uses core's wrappers and re-exports. `@kvirn-ui/react` adds no dependency.
- `createListVirtualizer` wraps the library and owns the accessibility rules:
  - `getRequiredIndexes()` (the active, selected and focused rows) are always rendered. The core replaces the range extractor when that set changes.
  - A keyboard move calls `scrollToIndex(index, { align: 'auto' })`, and the target element exists in the same commit. Navigate the data, not the DOM.
  - Full size is exposed: `aria-setsize` and `aria-posinset` on options, `aria-rowcount` and `aria-rowindex` on tables.
  - It returns the rendered items and the gaps between them (`getSegments()`).
- `virtualize` is `boolean | { estimateSize?, overscan? }` on Listbox, Combobox, Autocomplete and Table. Flat lists only. With groups, a dev warning fires and the list renders in full.
- The one exception to "zero CSS": a virtualized part sets layout-critical inline geometry (list total height, option position, spacer-row height), never colour, spacing or type. A headless adopter gives `Listbox.List` a height limit and `overflow-y: auto`.
- Listbox family: the internal `useListVirtualization` (called by `useListbox` and `useComboboxMachine` after `usePopup`) returns `undefined` unless `virtualize` is on, the popup is open and the list is flat.
  - A new virtualizer is created each time the popup opens and unmounted on close, so every opening starts at the top or at the chosen option and re-measures.
  - Options default to an estimate of 44px and an overscan of 5. A scroll element measuring 0 is ignored, and `initialSize` (ten options) is used until it is measured.
  - Geometry: one sizer (`position: relative`, total block size, no role or ARIA) and each option `position: absolute; inset-inline: 0; inset-block-start: 0; transform: translateY(start)` with `data-index`. A hand-rendered option next to a virtualized list renders as-is with one warning.
  - `scrollToIndex` runs when a key changes the active index (not a pointer), and once on opening for the chosen option.
- Table: see below.

## Table

Native `<table>` with TanStack Table behind `createTable` and the `useTable` hook (contract: `table.a11y.md`).

### Parts and names

`Table.Root`, `.ScrollRegion`, `.Caption`, `.Head`, `.Body`, `.Foot`, `.Row`, `.ColumnHeader` (`th scope="col"`), `.RowHeader` (`th scope="row"`), `.Cell`, `.SortButton`, `.SelectCheckbox`, `.SelectAllCheckbox`, `.ExpandButton`, `.DetailRow`, `.Empty`.

- Never set `display` on table elements, so no explicit table roles are needed.
- A name is required: `Caption`, or `aria-labelledby` on the Root (dev warning otherwise). Each row should have a `RowHeader`.
- Out of scope: column resizing, reordering, editable cells, `role="grid"`, multi-sort. Column visibility is the consumer's.

### Behaviour

- **Sorting** follows the APG sortable table: header text inside a `<button>`, a decorative sort icon, `data-sort`, `aria-sort` on the sorted column only. A change is announced ("Sorted by Name, ascending"). One column at a time: `enableMultiSort` is always off, and Shift+click is a plain click. The next direction is read before the toggle.
- **Selection** uses native checkboxes in the first cell. A row checkbox is named by `aria-label` "Select" plus `aria-labelledby` pointing at its own id and the row header's id ("Select row 3" without a row header). The header checkbox selects all (every row of the table; indeterminate when some are selected). `data-selected` on the row, never `aria-selected`. The selected count is announced. Only `row.toggleSelected` is used, never range selection.
- **Expanding** uses a disclosure button (text "Details" plus a chevron, `aria-expanded`, `aria-controls` once expanded). The detail is the next `<tr>`, spanning all columns. No `aria-level`. The expand column's header holds the same text, visually hidden.
- **Loading** sets `aria-busy` and `data-busy` and announces. **Empty** renders `Table.Empty`, a `<tbody>` with one row and one cell (a `<tr>` beside `Table.Body` is invalid). It says "Loading rows." while loading with no rows. **Filtering** announces the row count, debounced 500 ms.
- **Pagination** is the recommended default for long data: each page is its own table, with a status such as "Rows 21-40 of 312".
- **Virtualization** (opt-in, rows only): `aria-hidden` spacer rows, `aria-rowcount` (header rows included) with `aria-rowindex` (a header row's index comes from `Table.Row headerGroup`), a sticky head with `scroll-padding-block-start`, `table-layout: fixed`, the focused row stays rendered, no column virtualization. Spacer, detail and empty rows span the columns read from the header row's `colSpan` after render.
- Sort and locale: `createLocaleSortFn(locale)` sorts with `Intl.Collator` (numeric on), so å, ä and ö sort correctly.
- `createTable` returns `{ table, store, updateOptions }`. `store` is `table.store` as a structural `ReadableStore`, so `@tanstack/store` stays in `core/src/store/`. `useTable` calls `updateOptions` on every render before reading rows, with notifications suppressed (no "update while rendering" warning).
- Feature-gated TanStack APIs are reached with type guards (`hasColumnSorting`, `hasRowSelection`, `hasRowExpanding`, `hasTableRowSelection`), not casts. Parts get types through an untyped context plus `useTableContext<TFeatures, TData>()`.
- `@kvirn-ui/core` and `@kvirn-ui/react` re-export the tested TanStack features (sorting, selection, expansion, pagination, filtering, global filtering, column visibility, row models, `createColumnHelper`, `tableFeatures`, types). What is not re-exported is not supported. A TanStack Table major release forces a KvirnUI major release, and consumers cannot pass their own instance.
- The sort icon is drawn by the Table (`svg.kv-table-sort-icon`, three shapes) until a built-in `sort` icon exists. Numeric columns are consumer classes (`kv-table-*--numeric`). Row checkboxes are 24px with no extended hit area.

### Narrow screens and scroll containers

- A scroll container is focusable and a named `region` **only while it overflows**, and native scrollbars are never hidden (`scrollbar-width: none` or `thin` is not used). A keyboard user can scroll it (2.1.1), and there is no empty Tab stop or empty landmark when it does not overflow: it is then a plain `<div>`. An explicit option may make it a named region always, but it is a Tab stop only while it overflows.
- `Table.ScrollRegion` is that container: `role="region"` named by the caption (through `table`) or by `aria-label` / `aria-labelledby` (dev warning without a name once it is a region), and `tabIndex=0` and `data-overflowing`, only while it overflows (a `ResizeObserver` via `Env`). Its `region` prop (also a `useTable` option; `'overflow'` by default, `'always'`) makes it a named region whether it overflows or not; the server render and the first client render are the same markup (a plain `<div>` by default, a named region with `'always'`) (decided 2026-10-04, Plan 0026). The prop is a named enum, not a boolean, so a later mode needs no new prop. It is also the virtualizer's scroll element and sets `--kv-table-head-block-size` inline for the theme's `scroll-padding-block-start`.
- Outside Table, wrap a wide table in `kv-scroll-region` with `aria-labelledby` and `tabindex="0"`.
- Sticky heads and pinned columns keep a visible border in forced colours. Focus rings are never clipped.
- A general `ScrollArea` (native scrolling, `viewportRef`, edge cues, APG Feed for infinite loading) is planned in the roadmap and not built.

## Procedure: adding or changing a popup or list

1. Read the closest contract (`popover`, `listbox`, `combobox`, `autocomplete`, `table`) and its tests.
2. Write the contract rows and the failing tests first (keys, focus return, announcements, virtualization, 320px reflow, forced colours, right to left).
3. Use `usePopup` and `useDismissableLayer`. Do not add a second Escape or outside-press listener.
4. Keep core free of React and DOM at import. Import TanStack only through core's wrappers.
5. Announce through the Announcer with i18n text, never raw strings. Every new string needs all six locales.
6. Styles: add the part class to `theme.css` (see `theme-css`). A popup keeps a border so it survives forced colours.

## Maintainer preferences

- The select is `Listbox`, not `NativeSelect`. Combobox, select and autocomplete come with virtualization.
- A Table works with TanStack Table and virtualization, bundled in core rather than brought by the consumer.

## Pending

- Rich options are built (Plan 0030): `Listbox.OptionIcon`, `OptionText`, `OptionDescription` and `OptionIndicator`, shared by `Combobox` and `Autocomplete`. An option's name is its `OptionText` alone, and its description is `aria-describedby`. The native `<select>` stays text-only.
