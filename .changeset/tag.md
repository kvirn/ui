---
'@kvirn-ui/react': minor
'@kvirn-ui/i18n': minor
'@kvirn-ui/theme': minor
---

`Tag`, `TagGroup` and `useTagGroup`: a short fact in words, static or removable (Plan 0075). A removable tag is one `<button>`, the whole chip, named `Remove {label}`. Enter and Space remove it; Delete and Backspace do nothing. `TagGroup` moves focus after a removal to the next remove button, else the previous, else its label (or `focusFallback`), never `body`, and announces `tag.removed` unless `announceRemoval={false}`. KvirnUI holds no tag state: remove the tag in `onRemove`.

- React: `Tag.Root`, `Tag.Label`, `Tag.Remove`, `TagGroup.Root`, `TagGroup.Label`, `TagGroup.List`, `TagGroup.Empty`, `TagGroup.ClearAll`, `useTagGroup` and their types.
- i18n: `tag.*` and `filters.*` (the "Filter a list" pattern: applied row, result counts and the combined removal and count announcements) in all six locales. The `se` strings are English placeholders until a native speaker writes them.
- Theme: `kv-tag`, `kv-tag-remove`, `kv-tag-group` and their parts, in already measured pairs. No new token.
- Docs: a "Filter a list" recipe and story. Combobox keeps its own chips for now.
