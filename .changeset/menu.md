---
'@kvirn-ui/core': minor
'@kvirn-ui/react': minor
'@kvirn-ui/theme': minor
---

`Menu`: a button that opens a short list of actions (Plan 0070, the APG Menu Button). Parts `Menu.Root`, `Trigger`, `Popup`, `Item`, `CheckboxItem`, `RadioGroup`, `RadioItem`, `Group`, `GroupLabel` and `Separator`, the hook `useMenu`, and flat exports such as `MenuItem`. Items are focusable buttons with real focus, disabled items stay reachable, and typeahead is locale-aware. Focus returns to the button after an item, Escape or an outside press. There are no submenus, and a menu is for actions, never navigation. `onOpenChange(open, { reason, event })` says why it changed.

- Core: `createTypeahead` and `getTypeaheadMatch`, the pure typeahead used by the menu.
- Theme: `kv-menu-trigger`, `kv-menu-popup`, `kv-menu-item`, `kv-menu-checkbox-item`, `kv-menu-radio-item`, `kv-menu-radio-group`, `kv-menu-group`, `kv-menu-group-label` and `kv-menu-separator`.
