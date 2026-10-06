# Accessibility contract: Toolbar

- **APG pattern:** [Toolbar](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/), with toggle buttons ([Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/), `aria-pressed`)
- **Deviations:** none. APG makes wrapping, and Home and End, optional: the choices are stated below. A control that owns keys keeps them (a Listbox trigger's Home and End), which APG allows.
- **Native elements used:** `<div role="toolbar">`, and `<button>` for Toolbar.Button and Toolbar.Toggle. The roving `tabindex` is the toolbar's.
- **Status:** alpha candidate (Plan 0035). Gates pass, accessibility-reviewer APPROVE (2026-10-04). Manual AT is `pending`.
- **Tests:** `toolbar.test.tsx` next to this file. `toolbar.stories.tsx` in `apps/storybook/src/components/toolbar/`.

A Toolbar is one Tab stop for a row of related controls, with the arrow keys between them, so a keyboard user passes a long row of formatting buttons with one Tab. Use it for three or more controls (APG). With fewer, separate buttons or a [ButtonGroup](../button-group/button-group.a11y.md) are easier to find. The same arrow keys, in the same order, whatever the width: a toolbar that doesn't fit wraps, and the arrows follow the DOM across rows.

## Roles, states, properties

| Part           | Element / role                          | ARIA                                                    | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| -------------- | --------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Toolbar.Root   | `<div>` → `toolbar`                     | `aria-label` or `aria-labelledby`                       | **A name is required** (a dev warning without one, 4.1.2). `aria-orientation="vertical"` only when vertical: horizontal is the role's default. `aria-controls` (yours) points at the element it acts on, when there is one                                                                                                                                                                                                                                                                                                     |
| Toolbar.Group  | `<div>` → `group` (it is `ButtonGroup`) | `aria-label` or `aria-labelledby`                       | A name is required in a toolbar (a dev warning, 1.3.1). A group is attached by default (`layout="attached"`, look only). The hairline between groups is drawn by the theme: there is no `role="separator"` to announce                                                                                                                                                                                                                                                                                                         |
| Toolbar.Button | `<button>` → `button`                   | none, `aria-disabled="true"` when disabled              | A Button, and an item. `focusableWhenDisabled` defaults to `true` here, so a disabled button stays reachable and is read as unavailable. Its contract is [Button](../button/button.a11y.md)'s                                                                                                                                                                                                                                                                                                                                  |
| Toolbar.Toggle | `<button>` → `button`                   | `aria-pressed`, `aria-disabled="true"` when disabled    | A [Toggle](../toggle/toggle.a11y.md), and an item. The name never changes with the state                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Toolbar.Item   | any focusable element                   | the element's own, `aria-disabled="true"` when disabled | Makes a control an item through `render`: a Listbox trigger, a Popover trigger, a Link, an `<input>`. Without `render` it is a `<button type="button">`. A dev warning when the element isn't focusable by itself (2.1.1). `disabled` works as on Toolbar.Button: `aria-disabled="true"` and `data-disabled`, the item stays focusable, and a click, Enter or Space does nothing (`focusableWhenDisabled={false}` makes it native instead). A dev warning when the rendered element is natively disabled anyway (2.1.1, 2.4.3) |
| every item     | –                                       | `tabindex="0"` on one, `-1` on the others               | Roving tabindex. DOM focus is on the control, never `aria-activedescendant`, because a Listbox trigger and a Popover trigger in the toolbar need real focus. The toolbar's `tabindex` wins over an element's own: Listbox.Trigger honours a `tabIndex` it is given. Never a natively disabled control, and none when every control is natively disabled. Test: `toolbar.test.tsx › roving tabindex`                                                                                                                            |

A Toolbar has no strings of its own: every name is the consumer's, from their translations. It announces nothing: state is in `aria-pressed` and `aria-disabled`.

**What is an item.** Only `Toolbar.Button`, `Toolbar.Toggle` and `Toolbar.Item` are items. The toolbar doesn't query the focusable descendants, so a Popover's form, which sits in the toolbar's DOM right after its trigger, never becomes an item, and its keys are never the toolbar's (`toolbar.test.tsx › keys the item owns`).

## Keyboard

- **Focus strategy:** roving tabindex
- **Selection follows focus:** n/a
- **Arrows wrap:** yes (`loop={false}` stops at the ends)
- **Shortcuts:** none

The toolbar is one Tab stop. Exactly one item has `tabindex="0"`: the one that last had focus, or the first before any has. The Tab stop is never a natively disabled control: it is the last focused one if that is still enabled, else the next enabled one in DOM order (else the nearest one before it). If that item unmounts, or becomes natively disabled, the next enabled one takes over, and focus moves to it from a control that was disabled while focused, so it is never lost to the page. When every control is natively disabled there is no Tab stop, and the toolbar leaves the Tab order (a disabled editor). Arrow keys flip in right-to-left text, read from the toolbar's computed `direction`, so a `dir` on a container works without a provider. Items are ordered by their place in the page, across groups and rows.

| Key                    | Context                                          | Action                                                                                                                                                                                                                                       | Test                                                                                                                                                                                                               |
| ---------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tab / Shift+Tab        | Toolbar                                          | Enters at the control that last had focus (the first, the first time), and leaves the toolbar: the next Tab moves on, and Shift+Tab goes back to the previous focusable element                                                              | `toolbar.test.tsx › roving tabindex › Tab enters at the control that last had focus, from before and from after`                                                                                                   |
| Tab / Shift+Tab        | Toolbar whose first control is natively disabled | Enters at the first control that can take focus, and leaves the toolbar. A control that becomes disabled while it has focus hands focus to the new Tab stop                                                                                  | `toolbar.test.tsx › the Tab stop skips a natively disabled first control`, `toolbar.test.tsx › focus moves to the new Tab stop when the focused control becomes disabled`                                          |
| ArrowRight / ArrowLeft | Toolbar, horizontal                              | Next and previous control, across groups and rows. From the last control to the first, and back                                                                                                                                              | `toolbar.test.tsx › arrow keys › ArrowRight and ArrowLeft move across groups, and wrap by default`                                                                                                                 |
| ArrowLeft / ArrowRight | Toolbar, horizontal, right to left               | The arrows flip: ArrowLeft is the next control and ArrowRight the previous                                                                                                                                                                   | `toolbar.test.tsx › arrow keys › right to left: the arrows flip, read from the toolbar’s direction`                                                                                                                |
| ArrowDown / ArrowUp    | Toolbar, vertical                                | Next and previous control, wraps. They don't flip in right-to-left text                                                                                                                                                                      | `toolbar.test.tsx › arrow keys › vertical: ArrowDown and ArrowUp move and wrap, and ArrowRight does nothing`                                                                                                       |
| ArrowDown / ArrowUp    | Toolbar, horizontal                              | Not taken: they stay the page's and the item's own                                                                                                                                                                                           | `toolbar.test.tsx › horizontal: ArrowDown and ArrowUp do nothing`                                                                                                                                                  |
| Home / End             | Toolbar                                          | First and last control                                                                                                                                                                                                                       | `toolbar.test.tsx › arrow keys › Home and End go to the first and the last control`                                                                                                                                |
| Enter / Space          | Toolbar.Button, Toolbar.Toggle                   | Activates it (a Toggle switches `aria-pressed`). Focus stays on it                                                                                                                                                                           | `toolbar.test.tsx › arrow keys › Enter and Space activate a button and a toggle, and focus stays`                                                                                                                  |
| (any)                  | Disabled control                                 | It is focusable with the arrows and read as unavailable (`aria-disabled`), also a `Toolbar.Item`. Enter, Space and a click do nothing. A natively disabled control (`focusableWhenDisabled={false}`) can't take focus, so the arrows skip it | `toolbar.test.tsx › disabled controls › a disabled button and toggle are focusable with aria-disabled, reachable by the arrows, and inert`, `toolbar.test.tsx › a disabled Toolbar.Item stays reachable and inert` |
| (keys the item owns)   | Toolbar.Item, such as a Listbox trigger          | The item's own keys win: ArrowDown opens a Listbox, and Home and End on a closed Listbox open it, as its contract says, instead of going to the toolbar's ends. Left and Right still move to the next and previous control                   | `toolbar.test.tsx › keys the item owns › a Listbox.Trigger keeps its own keys, and Left and Right still move on`                                                                                                   |
| (text editing keys)    | Toolbar.Item that is a text field                | A text `<input>`, a `<textarea>` or a `contenteditable` keeps the arrows, Home and End for its caret. The toolbar takes none of them there                                                                                                   | `toolbar.test.tsx › events from a text field in the toolbar are left alone`                                                                                                                                        |
| (inside a popup)       | A popup next to an item                          | A key from an element that isn't an item (a Popover's form, its Close button) is never the toolbar's. Tab moves from the trigger into the popup, as the popup's contract says                                                                | `toolbar.test.tsx › a Popover.Trigger as an item works, and keys inside its popup never move the toolbar`                                                                                                          |
| (with a modifier key)  | Toolbar                                          | Not taken: Control+End, Alt+ArrowRight and the like stay the browser's and the page's                                                                                                                                                        | `toolbar.test.tsx › keys with Control, Alt, Meta or Shift are left alone`                                                                                                                                          |

Escape and the typed characters are not handled. A key an item handled already (`defaultPrevented`) is not taken again.

**Why these choices.** Arrows wrap because APG's own example does. Home and End are implemented, because they cost nothing and a long toolbar is slow without them. A Listbox trigger keeps its own Home and End (the maintainer, 2026-10-04): the user who opens a Listbox expects it to open, and Left and Right are enough to leave it.

## Focus management

- Initial focus: not moved. Tab enters at the control that last had focus.
- Trap: no. Tab and Shift+Tab always leave the toolbar.
- Restore to: not applicable. A command keeps focus on its button. (A component built on the toolbar, such as an editor, decides where focus goes after a command and documents it.)
- Never obscured by: the toolbar is not sticky by default, and nothing in it overlays the focused control. A popup next to a trigger is placed so it doesn't cover its trigger (2.4.11).

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | –          |

## Consumer responsibilities

- **Name the toolbar** with `aria-label` from your translations, or `aria-labelledby`. When two toolbars are on a page, their names differ.
- **Name every group**, and every icon-only control (`aria-label`, 4.1.2, 2.5.3). Show a tooltip for icon-only controls where the toolbar is for people who might not know the icons.
- Use a toolbar for three or more controls. A toolbar with only text buttons for navigation is a nav, not a toolbar.
- Put controls in with `Toolbar.Button`, `Toolbar.Toggle` and `Toolbar.Item`. A plain `<Button>` inside is an ordinary Tab stop, not an item.
- A control that renders a popup (Popover, Listbox) goes in with `Toolbar.Item` and `render`, and renders its popup right after it. **A Listbox in a toolbar sets `native="never"`:** with `native="auto"` (the default) a touch device renders a native `<select>` that replaces the Listbox's children, so the `Toolbar.Item` and the trigger's `aria-label` never render, and the select has no name and is not a toolbar item (4.1.2). A dev warning fires when a Listbox renders natively inside a toolbar (`toolbar.test.tsx › a Listbox that renders natively inside a Toolbar warns that its item is gone`). Don't put a text field in a toolbar unless it is the point: it keeps the arrow keys.
- Keep the default for a disabled control (`aria-disabled`, still focusable), so people can find it and read that it is unavailable. Use `focusableWhenDisabled={false}` only when the whole toolbar is disabled: then no control can be the Tab stop, and the toolbar leaves the Tab order. A natively disabled control is never the Tab stop (the toolbar picks the first one that can take focus), so mixing is safe, but those controls are skipped by the arrows.
- Disable a Listbox on its own Root (it stays reachable by the arrows and doesn't open: `toolbar.test.tsx › a Listbox disabled on its Root stays reachable by the arrows, is aria-disabled, and does not open`), and a Popover trigger with `disabled` on the `Toolbar.Item`.
- **A text field as an item is made read-only with `readOnly`, not `disabled`.** A disabled `Toolbar.Item` stops Enter and Space and clicks, but a text `<input>` is still editable by typing, so use `readOnly` (and say why) for a field the user may not change.
- **A vertical toolbar and a Listbox:** in a vertical toolbar a Listbox item owns ArrowUp and ArrowDown (they open and move in it), so use Tab or a horizontal toolbar for it. The default theme only ships horizontal toolbars.
- Set `aria-controls` to the element the toolbar acts on, when there is one, as in APG's example.

## Visual / modes

- Focus indicator: each control's own ring (2.4.7, 2.4.13). A Toolbar.Toggle is a Toggle: `data-focus-visible` is tested in `toggle.test.tsx › focus visible › sets data-focus-visible on keyboard focus only`.
- Target size: each control is at least 24 × 24 CSS px, 44px by default and 32px only inside `kv-compact` from 64rem (2.5.8, design spec §6.5.3). Test: `toolbar.stories.tsx › Default`.
- forced-colors behaviour: the buttons keep a visible edge, a pressed toggle is a `Highlight` fill with `HighlightText`, and the hairline between groups is `GrayText`. Test: `toolbar.stories.tsx › ForcedColors`.
- reduced-motion behaviour: no motion.
- Reflow: the toolbar wraps group by group, and an attached group (the default) never wraps, so when one group alone is wider than the row its buttons wrap their own labels. Icon-only buttons keep their minimum size, and nothing scrolls sideways or truncates (1.4.10, 2.5.8). Test: `toolbar.stories.tsx › Wrapping`.
- Right to left: logical properties only, and the arrows flip (above).

## WCAG SCs covered

- 1.3.1 Info and Relationships: `role="toolbar"` and `role="group"` with names.
- 1.4.1 Use of Color, 1.4.11 Non-text Contrast: a pressed toggle is a filled tile, not colour alone (the Toggle contract).
- 1.4.10 Reflow: wrapping.
- 2.1.1 Keyboard, 2.1.2 No Keyboard Trap: every item reachable, Tab always leaves.
- 2.4.3 Focus Order, 2.4.7 Focus Visible: one Tab stop, DOM order, the item that last had focus.
- 2.5.3 Label in Name, 2.5.8 Target Size (Minimum).
- 4.1.2 Name, Role, Value: the toolbar's, groups' and controls' names, roles and states.

## AT test record

| AT + browser + OS                        | Date    | Tester | Result | Notes |
| ---------------------------------------- | ------- | ------ | ------ | ----- |
| **Core (required for beta)**             |         |        |        |       |
| NVDA + Firefox + Windows                 | pending |        |        |       |
| VoiceOver + Safari + macOS               | pending |        |        |       |
| VoiceOver + Safari + iOS                 | pending |        |        |       |
| TalkBack + Chrome + Android              | pending |        |        |       |
| Windows Contrast Themes + Edge           | pending |        |        |       |
| Keyboard only / 400% zoom / 320px reflow | pending |        |        |       |
| **Release (before 1.0 and each minor)**  |         |        |        |       |
| JAWS + Chrome + Windows                  | pending |        |        |       |
| NVDA + Chrome + Windows                  | pending |        |        |       |
| Narrator + Edge + Windows                | pending |        |        |       |
| Dragon / Voice Control                   | pending |        |        |       |

## Known issues

- **Before hydration every item is a Tab stop.** Items register after the first render, so until then every item has `tabindex="0"` and a server-rendered toolbar works as a row of ordinary buttons (no arrow keys yet). After registration one item keeps `0` and the others get `-1`. Test: `toolbar.test.tsx › before the items register, every item is an ordinary Tab stop`.
- **Items are registered, not queried.** An element that is a control but not an item (a plain `<Button>` placed in the toolbar) is a Tab stop of its own and is skipped by the arrows.
- **WebKit is not automated.** Keyboard rows run in Vitest browser mode on Chromium. A WebKit run is not automated, and the manual AT matrix is `pending`.
