# Key tables

Source: the APG patterns (https://www.w3.org/WAI/ARIA/apg/patterns/) and the keyboard practice (https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/), checked 2026-10-02. Re-check the live pattern before implementing, because APG gets updated.

These are starting points for a contract's Keyboard table. Every component also has Tab and Shift+Tab rows. "Native" means the browser does it: document it, test it, and never re-implement or block it.

## Form inputs

### Text input (Input, numbers as text, InputGroup)

| Key                                | Action                                                                 |
| ---------------------------------- | ---------------------------------------------------------------------- |
| Tab / Shift+Tab                    | Moves focus into and out of the input. Addons are never Tab stops      |
| Characters                         | Type. Native                                                           |
| ArrowLeft / ArrowRight, Home / End | Move the caret. Native, never intercepted                              |
| ArrowUp / ArrowDown                | Native caret movement only. Never change a number value                |
| Control/Command+A, C, V, X, Z      | Select, copy, paste, cut, undo. Native. Paste is never blocked (3.3.8) |
| Enter                              | Submits the form (implicit submission). Native, never prevented        |
| Escape                             | Nothing, unless a pattern adds it (a combobox closes its popup)        |

### Checkbox (native `<input type="checkbox">`)

| Key             | Action                                                     |
| --------------- | ---------------------------------------------------------- |
| Tab / Shift+Tab | Each checkbox is its own Tab stop, also in a CheckboxGroup |
| Space           | Toggles. Native. A mixed checkbox becomes checked          |

### Radio group (native `<input type="radio">` with a shared `name`)

| Key                    | Action                                                                       |
| ---------------------- | ---------------------------------------------------------------------------- |
| Tab                    | Into the group: the checked radio, or the first if none is checked           |
| Shift+Tab              | Into the group from after: the checked radio, or the last if none is checked |
| ArrowDown / ArrowRight | Next radio, checks it, wraps. Native. Test the direction in RTL              |
| ArrowUp / ArrowLeft    | Previous radio, checks it, wraps. Native. Test the direction in RTL          |
| Space                  | Checks the focused radio if it isn't checked                                 |

One Tab stop for the group. Focus strategy: native.

### DateInput (three fields; planned, see the roadmap)

| Key                 | Action                                                            |
| ------------------- | ----------------------------------------------------------------- |
| Tab / Shift+Tab     | Day, month and year are separate Tab stops, in the locale's order |
| Characters          | Type. Focus never auto-advances when a field is full (3.2.2)      |
| ArrowUp / ArrowDown | Native caret movement only. Never step the value                  |

### One-time code

Prefer one input with `autocomplete="one-time-code"`. If there are several boxes, the same rules as DateInput apply: no auto-advance, and paste of the whole code fills them all.

### Switch

| Key             | Action                                            |
| --------------- | ------------------------------------------------- |
| Tab / Shift+Tab | One Tab stop                                      |
| Space           | Toggles. Enter toggles too when it's a `<button>` |

### Select-only combobox and Listbox

| Key                       | Action                                                                  |
| ------------------------- | ----------------------------------------------------------------------- |
| Enter / Space / ArrowDown | On the closed combobox: opens, focuses the selected option or the first |
| ArrowDown / ArrowUp       | Next and previous option. No wrap by default (state it)                 |
| Home / End                | First and last option                                                   |
| Characters                | Typeahead to the next option starting with the typed text               |
| Enter                     | Selects the active option and closes                                    |
| Escape                    | Closes without changing the value, focus stays on the combobox          |
| Tab                       | Selects the active option, closes and moves on (select-only combobox)   |

Listbox: one Tab stop. Multi-select adds Space to toggle and Shift+Arrow to extend.

### Editable combobox (ARIA 1.2)

| Key                 | Action                                                                  |
| ------------------- | ----------------------------------------------------------------------- |
| Characters          | Type and filter. DOM focus stays on the input (`aria-activedescendant`) |
| ArrowDown / ArrowUp | Opens the popup if closed, moves the active option                      |
| Enter               | Accepts the active option and closes                                    |
| Escape              | Closes the popup. A second Escape may clear the input (state it)        |
| Alt+ArrowDown       | Opens without moving the active option                                  |
| Alt+ArrowUp         | Accepts and closes                                                      |

## Actions and links

| Component | Key           | Action                                                                |
| --------- | ------------- | --------------------------------------------------------------------- |
| Button    | Enter / Space | Activates. Native. Space activates on key up                          |
| Toggle    | Enter / Space | Toggles `aria-pressed`                                                |
| Link      | Enter         | Follows the link. Native. Space scrolls the page and doesn't activate |

## Disclosure and overlays

| Pattern      | Key             | Action                                                                                    |
| ------------ | --------------- | ----------------------------------------------------------------------------------------- |
| Disclosure   | Enter / Space   | Toggles the panel. The panel content follows in the Tab order                             |
| Accordion    | Enter / Space   | Toggles the section. Optional: ArrowDown / ArrowUp between headers, Home / End (state it) |
| Dialog       | Tab / Shift+Tab | Cycles inside the dialog, background `inert`                                              |
| Dialog       | Escape          | Closes, focus returns to the trigger                                                      |
| Alert dialog | (as Dialog)     | Initial focus on the least destructive action                                             |
| Popover      | Escape          | Closes, focus returns to the trigger. Tab may leave it (non-modal)                        |
| Tooltip      | Escape          | Hides the tooltip without moving focus (1.4.13)                                           |

## Composite widgets (one Tab stop, roving tabindex unless stated)

| Pattern     | Key                           | Action                                                                                    |
| ----------- | ----------------------------- | ----------------------------------------------------------------------------------------- |
| Tabs        | ArrowLeft / ArrowRight        | Previous and next tab, wraps, flips in RTL. Automatic or manual activation (state it)     |
| Tabs        | Home / End                    | First and last tab                                                                        |
| Tabs        | Enter / Space                 | Activates the focused tab (manual activation)                                             |
| Tabs        | Tab                           | From the tab list into the panel                                                          |
| Menu button | Enter / Space / ArrowDown     | Opens the menu, focuses the first item. ArrowUp opens on the last item                    |
| Menu        | ArrowDown / ArrowUp           | Next and previous item, wraps                                                             |
| Menu        | Home / End, characters        | First and last item, typeahead                                                            |
| Menu        | Enter / Space                 | Activates the item and closes                                                             |
| Menu        | Escape                        | Closes, focus returns to the menu button                                                  |
| Menu        | Tab                           | Closes the menu and moves on                                                              |
| Toolbar     | ArrowLeft / ArrowRight        | Previous and next control, flips in RTL. Home / End to the ends                           |
| Slider      | Arrow keys                    | One step. Right and Up increase, flips in RTL for the horizontal axis                     |
| Slider      | PageUp / PageDown, Home / End | A larger step, the minimum and the maximum                                                |
| Date grid   | Arrow keys                    | Day by day and week by week, flips in RTL                                                 |
| Date grid   | PageUp / PageDown             | Previous and next month. Shift+PageUp / Shift+PageDown: previous and next year            |
| Date grid   | Home / End                    | First and last day of the week (Monday start)                                             |
| Date grid   | Enter / Space, Escape         | Selects the date and closes. Escape closes without selecting, focus returns to the button |

## Navigation (not composite)

| Pattern                | Key           | Action                                                                                            |
| ---------------------- | ------------- | ------------------------------------------------------------------------------------------------- |
| Disclosure navigation  | Tab           | Every link and toggle button is a Tab stop. Never `role="menu"`                                   |
| Disclosure navigation  | Enter / Space | Opens and closes a section. Escape closes it and returns focus to its button (optional, state it) |
| Breadcrumb, Pagination | Tab, Enter    | Plain links                                                                                       |

## Non-focusable components

Card, Icon, Label, Description, ErrorMessage, layout parts: the section starts with `This component has no focusable parts and handles no keys.` Keep Tab rows that prove Tab passes over it, if any.
