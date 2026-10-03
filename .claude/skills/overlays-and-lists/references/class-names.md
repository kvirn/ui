# Class names and state attributes

The parts render these classes. The theme selects on them, and they are public API. State is `data-*`, set by the component.

## Popover

- Classes: `kv-popover-trigger`, `kv-popover-popup`, `kv-popover-close`.
- State: `data-open` (trigger and popup), `data-placement`, `data-detached` (popup).

## Listbox

- Classes: `kv-listbox-trigger`, `kv-listbox-value`, `kv-listbox-popup`, `kv-listbox-list`, `kv-listbox-option`, `kv-listbox-group`, `kv-listbox-group-label`, `kv-listbox-empty`, `kv-listbox-native` (the native `<select>`), `kv-listbox-virtual-sizer`.
- State on the trigger: `data-open`, `data-focus-visible`, `data-placeholder`, `data-invalid`, `data-required`, `data-disabled`.
- State on the popup: `data-open`, `data-placement`, `data-detached`. On the list: `data-empty`, `data-virtualized`.
- State on an option: `data-active`, `data-selected`, `data-disabled`. A virtualized option also has `data-index`.
- The active option has an indicator that is not colour alone and works in forced colours: a 4px bar plus a tint (`Highlight` in forced colours). A chosen option has a tick.

## Combobox and Autocomplete

- The popup parts keep the `kv-listbox-*` classes above.
- Combobox: `kv-combobox-control`, `kv-combobox-input`, `kv-combobox-toggle`, `kv-combobox-clear`, `kv-combobox-value-list`, `kv-combobox-value`, `kv-combobox-value-remove`.
- Autocomplete: `kv-autocomplete-control`, `kv-autocomplete-input`, `kv-autocomplete-toggle`, `kv-autocomplete-clear`.
- State: `data-open` and `data-focus-visible` on the control and the input. `data-loading` on the popup while loading.
- Look: the input looks like `kv-input`. Toggle and Clear fill the Control's height. Remove buttons are 44px square. The chevron and crosses are drawn with borders. No new tokens.

## Table

- Classes: `kv-table`, `kv-table-caption`, `kv-table-head`, `kv-table-body`, `kv-table-foot`, `kv-table-row`, `kv-table-column-header`, `kv-table-row-header`, `kv-table-cell`, `kv-table-sort-button`, `kv-table-sort-icon`, `kv-table-select-checkbox` (with `kv-checkbox`), `kv-table-expand-button`, `kv-table-expand-icon`, `kv-table-detail-row`, `kv-table-empty`, `kv-table-spacer`, `kv-table-scroll-region` (with `kv-scroll-region`), `kv-table-visually-hidden`.
- State: `data-sort` (header, sort button), `data-selected` and `data-expanded` (row), `data-busy`, `data-virtualized` (table), `data-overflowing` (scroll region), `data-index` (virtualized row).
- Theme tokens an adopter sets: `--kv-table-scroll-region-max-block-size` (limits the height so the head sticks). The Table sets `--kv-table-head-block-size` inline.
- The look: no shadow, no zebra stripes, no frame, no row hover. It never changes the `display` of a table element. Sticky head and pinned columns keep a visible border in forced colours.

## Announcer facts these components rely on

- `useAnnouncer().announce(message, { politeness, key, throttleMilliseconds })` returns `true` when accepted and `false` when dropped (blank, throttled by `key`, or no provider). Default throttle 3000 ms per `key`, leading edge.
- Clear-then-set: the region is emptied, the message set 100 ms later, and removed after 5 s. The latest message wins; there is no queue.
- The outermost `KvirnProvider` renders two hidden live regions: `<output aria-live="polite" aria-atomic="true">` and `<div role="alert" aria-live="assertive" aria-atomic="true">`. Nested providers reuse them.
- A modal that makes the page `inert` silences the regions, so a Dialog hosts its own. Mount the provider outside a `<form>`.
- The Announcer has no strings of its own. Callers pass i18n text.
