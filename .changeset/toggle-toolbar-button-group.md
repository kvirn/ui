---
'@kvirn-ui/core': minor
'@kvirn-ui/react': minor
'@kvirn-ui/theme': minor
---

Add `Toggle`, `Toolbar` and `ButtonGroup` (Plan 0035).

- `Toggle` and `useToggle`: a `<button type="button" aria-pressed>` that is on or off, controlled with `pressed` and `onPressedChange` or uncontrolled with `defaultPressed`. It builds on `Button`, so `disabled` and `focusableWhenDisabled` work the same, and the name never changes with the state.
- `Toolbar` and `useToolbar` (APG Toolbar): one Tab stop with a roving `tabindex`, Left and Right (Down and Up when vertical, flipped in right-to-left text), Home and End, wrapping unless `loop={false}`. `Toolbar.Root`, `Toolbar.Button`, `Toolbar.Toggle`, `Toolbar.Item` (any focusable control, with `render`: a Listbox trigger, a Popover trigger, a Link) and `Toolbar.Group`. A control's own keys win, a text field keeps the arrows, and a disabled control (`Toolbar.Item` too) stays focusable with `aria-disabled`. A natively disabled control is never the Tab stop: Tab reaches the first control that can take focus, focus moves on when the focused control becomes disabled, and a toolbar whose controls are all natively disabled leaves the Tab order. Before hydration every item is an ordinary Tab stop. Development warnings for a toolbar with no name or fewer than three controls, a group with no name, an item that isn't focusable and an item that is natively disabled anyway.
- `Listbox.Trigger` honours a `tabIndex` it is given, so a `Toolbar.Item` can set the roving one. A Listbox in a toolbar needs `native="never"` (a native `<select>` replaces its children), and a development warning fires when it renders natively inside a toolbar.
- `ButtonGroup` and `useButtonGroup`: the existing `kv-button-group` row as a component. `role="group"` when it has a name, and a plain `<div>` without one.
- `@kvirn-ui/core`: `getRovingTarget`, the pure index maths of a roving tabindex, for Toolbar first and Tabs and Menu later.
- `@kvirn-ui/theme`: `kv-toggle` (a pressed toggle is a solid `primary` fill with `on-primary`, a `Highlight` fill in forced colours), `kv-toolbar`, and groups in a toolbar that never stack, with a hairline between them from 40rem. `kv-button-group` is unchanged outside a toolbar. `DESIGN.md` describes the pressed toggle and the toolbar density.
