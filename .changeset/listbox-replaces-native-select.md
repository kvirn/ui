---
'@kvirn-ui/react': minor
'@kvirn-ui/theme': minor
'@kvirn-ui/i18n': minor
'@kvirn-ui/core': minor
---

`NativeSelect` becomes `Listbox` (Plan 0022, ADR-0037 item 2): one component with a stylable popup, and the browser's `<select>` as its native rendering. The `combobox` i18n namespace is added.

**Breaking** (accepted before 1.0, ADR-0037):

- `@kvirn-ui/react`: `NativeSelect`, `useNativeSelect` and their types (`NativeSelectProps`, `NativeSelectState`, `NativeSelectChangeDetails`, `NativeSelectPartProps`, `UseNativeSelectOptions`, `UseNativeSelectResult`) are removed. Use `<Listbox.Root native="always" items={…}>`: it renders the same native `<select>`, wired to its Field, from `items` or `groups`. The value is the chosen item's key (`itemToKey`), or `null`, and `onValueChange(value, { reason: 'native' })` reports it. There is no separate native part and no native hook.
- `@kvirn-ui/theme`: the class `kv-native-select` is now `kv-listbox-native`, and the custom properties `--kv-native-select-chevron` and `--kv-native-select-stroke` are now `--kv-listbox-native-chevron` and `--kv-listbox-native-stroke`. Rename them in your own CSS.

Added:

- `@kvirn-ui/react`: the stylable Listbox, the APG select-only combobox. `Listbox.Root` (`items` or `groups`, `itemToString`, `itemToKey`, `isItemDisabled`, `value` / `defaultValue` / `onValueChange` with a key, `null` or, with `multiple`, an array of keys, `native`, `name`, `placeholder`, `autoComplete`, `open` / `defaultOpen` / `onOpenChange`, `messages`), `Listbox.Trigger`, `Listbox.Value`, `Listbox.Popup`, `Listbox.List`, `Listbox.Option`, `Listbox.Group`, `Listbox.GroupLabel` and `Listbox.Empty`, and the `useListbox` hook. DOM focus stays on the trigger (`aria-activedescendant`), and the keys are the APG's: arrows (no wrap), Home, End, Page Up, Page Down, Enter, Space, Escape, Tab, Alt+ArrowDown, Alt+ArrowUp and locale-aware typeahead. With `native="auto"` (the default) a single choice renders the native `<select>` on touch devices.
- `@kvirn-ui/react`: `usePopup` sets `data-detached` and `visibility: hidden` on a popup whose anchor is scrolled entirely out of view, so it doesn't float over other content.
- `@kvirn-ui/core`: `computePlacement` never returns a `maxHeight` above the viewport minus `padding`, even when the anchor is scrolled out of view.
- `@kvirn-ui/theme`: the default styles for the listbox popup: `kv-listbox-trigger`, `kv-listbox-value`, `kv-listbox-popup`, `kv-listbox-list`, `kv-listbox-option` (with `data-active`, `data-selected`, `data-disabled`), `kv-listbox-group`, `kv-listbox-group-label` and `kv-listbox-empty`. They use existing tokens, and keep their state visible in forced colours.
- `@kvirn-ui/i18n`: the `combobox` namespace in all six locales: `resultCount` (plural), `noResults`, `loading`, `removeValue`, `clear` and `showOptions`. The `se` strings are machine-drafted and marked for a native speaker.
