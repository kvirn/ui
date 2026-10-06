---
'@kvirn-ui/react': minor
'@kvirn-ui/theme': minor
---

The chosen values of a multiple `Combobox` are Tag chips. `Combobox.Value` renders one `<button>` that holds the text and the cross, so pressing the text removes the value, and the accessible name stays "Remove Stockholm" (`combobox.removeValue`). The classes are now `kv-tag-group-list`, `kv-tag` and `kv-tag-remove`; `kv-combobox-value-list`, `kv-combobox-value`, `kv-combobox-value-label` and `kv-combobox-value-remove` stay on the same elements as aliases for one minor version, then go. The theme still uses the old classes for the gap, the disabled look and a custom icon: move your own CSS to the Tag classes. The text is no longer a sibling of the remove button, and the `className` types of `ComboboxValueListPartProps`, `ComboboxValuePartProps` and `ComboboxRemoveButtonPartProps` change to the combined strings.
