---
'@kvirn-ui/react': patch
'@kvirn-ui/theme': patch
---

Listbox, Combobox and Autocomplete popups look like a native select's, and a popup that flips above its anchor stays attached to it.

- `@kvirn-ui/theme`: the popup has no inner padding, and options are flat full-width rows. The active option is a solid primary fill. `--kv-listbox-option-hint` is the colour for a hint inside an option: muted, and the row's own colour on the active fill.
- `@kvirn-ui/react`: `usePopup` measures the popup with `--kv-popup-height-limit` applied, so a popup limited in height no longer leaves a gap when it is placed above the anchor.
