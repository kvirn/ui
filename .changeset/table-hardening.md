---
'@kvirn-ui/react': minor
'@kvirn-ui/core': minor
'@kvirn-ui/i18n': minor
---

Table hardening (Plan 0026 follow-ups). Additive.

- React: an expand button with no `rowHeader` is named "Details row 3" (it starts with the visible text), your own children or `aria-label` replace it. A virtualized table's `aria-rowcount` counts the rows of `Table.Foot`, and a header row without a `headerGroup` and a footer row get their `aria-rowindex` from their place. New on `useTable`: `footProps` (spread on `<tfoot>`) and `footRowOffset`, and the type `TableFootPartProps`. The scroll region keeps its role and Tab stop while it has focus, even if the table stops overflowing, and a caption in a shadow root names the region. A region without `table` measures a head that is added later.
- Core: `createListVirtualizer` takes `scrollMargin`, how far the first item is from the start of the scroll element. The window is right when content scrolls above the list, as a table's caption and head do. Item offsets stay relative to the list.
- i18n: the new key `table.rowDetailsNumber` in `KvirnMessages` and all six catalogs (`se` is an English placeholder). A custom catalog must add it.
