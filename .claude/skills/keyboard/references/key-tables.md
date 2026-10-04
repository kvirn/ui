# Key tables

Source: the APG patterns (https://www.w3.org/WAI/ARIA/apg/patterns/) and the keyboard practice (https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/), checked 2026-10-02. Re-check the live pattern before implementing, because APG gets updated.

These are starting points for a contract's Keyboard table. Every component also has Tab and Shift+Tab rows. "Native" means the browser does it: document it, test it, and never re-implement or block it.

## Form inputs

### Text input (TextInput, NumberInput, InputGroup)

NumberInput is a text box too: its ArrowUp and ArrowDown move the caret and never step the value (`number-input.a11y.md`).

| Key                                | Action                                                                 |
| ---------------------------------- | ---------------------------------------------------------------------- |
| Tab / Shift+Tab                    | Moves focus into and out of the input. Addons are never Tab stops      |
| Characters                         | Type. Native                                                           |
| ArrowLeft / ArrowRight, Home / End | Move the caret. Native, never intercepted                              |
| ArrowUp / ArrowDown                | Native caret movement only. Never change a number value                |
| Control/Command+A, C, V, X, Z      | Select, copy, paste, cut, undo. Native. Paste is never blocked (3.3.8) |
| Enter                              | Submits the form (implicit submission). Native, never prevented        |
| Escape                             | Nothing, unless a pattern adds it (a combobox closes its popup)        |

### Textarea (native `<textarea>`)

Native like a text input, with two differences: Enter is a line break, and ArrowUp, ArrowDown, PageUp and PageDown move the caret between lines (`textarea.a11y.md`).

| Key                                                                        | Action                                                                                     |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Tab / Shift+Tab                                                            | Moves focus in and out. Tab never inserts a tab character (never trap Tab for indentation) |
| Characters                                                                 | Type. Native. Nothing is cut at a character limit (a count is not a `maxlength`)           |
| Enter                                                                      | Inserts a line break. Never submits the form. Native, never prevented                      |
| ArrowLeft / ArrowRight, ArrowUp / ArrowDown, Home / End, PageUp / PageDown | Move the caret. Native, never intercepted                                                  |
| Control/Command+A, C, V, X, Z                                              | Select, copy, paste, cut, undo. Native. Paste is never blocked or cut (3.3.8)              |
| Escape                                                                     | Nothing                                                                                    |

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
| Tooltip      | Tab             | Keyboard focus on the trigger opens it at once. Focus never moves into it                 |

## Composite widgets (one Tab stop, roving tabindex unless stated)

| Pattern     | Key                           | Action                                                                                                                                                                                                                                                                            |
| ----------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tabs        | ArrowLeft / ArrowRight        | Previous and next tab, wraps, flips in RTL. Automatic or manual activation (state it)                                                                                                                                                                                             |
| Tabs        | Home / End                    | First and last tab                                                                                                                                                                                                                                                                |
| Tabs        | Enter / Space                 | Activates the focused tab (manual activation)                                                                                                                                                                                                                                     |
| Tabs        | Tab                           | From the tab list into the panel                                                                                                                                                                                                                                                  |
| Menu button | Enter / Space / ArrowDown     | Opens the menu, focuses the first item. ArrowUp opens on the last item                                                                                                                                                                                                            |
| Menu        | ArrowDown / ArrowUp           | Next and previous item, wraps                                                                                                                                                                                                                                                     |
| Menu        | Home / End, characters        | First and last item, typeahead                                                                                                                                                                                                                                                    |
| Menu        | Enter / Space                 | Activates the item and closes                                                                                                                                                                                                                                                     |
| Menu        | Escape                        | Closes, focus returns to the menu button                                                                                                                                                                                                                                          |
| Menu        | Tab                           | Closes the menu and moves on                                                                                                                                                                                                                                                      |
| Toolbar     | ArrowLeft / ArrowRight        | Previous and next control, wraps (`loop`), flips in RTL. Up and Down when vertical                                                                                                                                                                                                |
| Toolbar     | Home / End                    | First and last control                                                                                                                                                                                                                                                            |
| Toolbar     | Tab                           | One Tab stop: enters at the control that last had focus, and leaves with the next Tab                                                                                                                                                                                             |
| Toolbar     | (disabled control)            | Stays focusable with `aria-disabled`, so the arrows reach it. Activating it does nothing. A natively disabled one is skipped by the arrows and is never the Tab stop: that is the last focused control if it is enabled, else the next enabled one, else the previous enabled one |
| Toolbar     | (an item's own keys)          | A key the item handled wins (a Listbox trigger's ArrowDown, Home and End). Text fields keep the arrows                                                                                                                                                                            |
| Slider      | Arrow keys                    | One step. Right and Up increase, flips in RTL for the horizontal axis                                                                                                                                                                                                             |
| Slider      | PageUp / PageDown, Home / End | A larger step, the minimum and the maximum                                                                                                                                                                                                                                        |
| Date grid   | Arrow keys                    | Day by day and week by week, flips in RTL                                                                                                                                                                                                                                         |
| Date grid   | PageUp / PageDown             | Previous and next month. Shift+PageUp / Shift+PageDown: previous and next year                                                                                                                                                                                                    |
| Date grid   | Home / End                    | First and last day of the week (Monday start)                                                                                                                                                                                                                                     |
| Date grid   | Enter / Space, Escape         | Selects the date and closes. Escape closes without selecting, focus returns to the button                                                                                                                                                                                         |

## Rich text editor (a toolbar plus a multi-line text; Plan 0036)

The one place shortcuts are on by default and Tab can act: the keyboard skill's rule 7 exception for text editors. The toolbar is the Toolbar row above. The text is native, with these on top (design spec `docs/design/rich-text-editor.md` §6.6.6 and §7.4).

| Context                                | Key                                            | Action                                                                                                                           |
| -------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Text, outside lists and tables         | Tab / Shift+Tab                                | Leaves: the next focusable element, or back to the toolbar                                                                        |
| Text, in a list item                   | Tab                                            | Nests the item under the one above, only when that is possible. Otherwise leaves. The new level is announced                      |
| Text, in a nested list item            | Shift+Tab                                      | Outdents one level. In a top-level item it leaves, and never lifts the item out of its list                                       |
| Text, in a table cell                  | Tab / Shift+Tab                                | Next and previous cell, selecting its text. In the last cell Tab leaves and never adds a row, and in the first Shift+Tab leaves   |
| Text, anywhere                         | Escape, then Tab or Shift+Tab                  | Leaves forwards or backwards. Any key other than a modifier cancels it. Escape is not passed on the first time (a Dialog stays)   |
| Text                                   | Alt+F10 (Option+F10 on macOS)                  | Moves focus to the toolbar's remembered control. Escape in the toolbar goes back, after a tooltip or popup has taken its Escape |
| Text                                   | Control/Command+B, I, U                        | Bold, italic, underline on or off, announced ("Fetstil på")                                                                      |
| Text                                   | Control/Command+K                              | Opens the link form                                                                                                              |
| Text                                   | Control/Command+Z; +Shift+Z, Control+Y         | Undo; redo                                                                                                                       |
| Text                                   | Control+Alt + a key (AltGr)                    | Types the character. Never a shortcut                                                                                             |
| Link or image form                     | Enter / Escape                                 | Submits; closes without changes, and focus goes back to the text at the selection                                                 |
| Native                                 | Arrows, Home, End, Shift+arrows, Enter, Shift+Enter | The caret, selection, a new paragraph, a line break. Never bound                                                              |

Alternatives for every shortcut are toolbar buttons. The instruction that tells users how to leave is visible text, in the text's `aria-describedby`.

## Navigation (not composite)

| Pattern                | Key           | Action                                                                                            |
| ---------------------- | ------------- | ------------------------------------------------------------------------------------------------- |
| Disclosure navigation  | Tab           | Every link and toggle button is a Tab stop. Never `role="menu"`                                   |
| Disclosure navigation  | Enter / Space | Opens and closes a section. Escape closes it and returns focus to its button (optional, state it) |
| Breadcrumb, Pagination | Tab, Enter    | Plain links                                                                                       |

## Non-focusable components

Card, Icon, Label, Description, ErrorMessage, layout parts: the section starts with `This component has no focusable parts and handles no keys.` Keep Tab rows that prove Tab passes over it, if any.
