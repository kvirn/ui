# Accessibility contract: Tabs

- **APG pattern:** [Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/), with the keyboard practice for a composite widget (one Tab stop, a roving `tabindex`).
- **Deviations:** two, both approved by the maintainer with Plan 0048, and recorded in `keyboard/references/key-tables.md` and `accessibility/references/apg-patterns.md`. (1) **A panel has `tabindex="0"` by default.** APG sets it only when the panel has no focusable content, and a headless panel cannot know its first content without scanning the DOM. One redundant Tab stop is the lesser evil: no default would strand keyboard users on a panel of scrolling text (2.1.1). A panel that starts with a focusable element passes `tabIndex={-1}`. (2) **A disabled tab stays focusable** (`aria-disabled="true"`, as the `keyboard` skill says for items of a composite), and automatic activation never selects it, so focus and selection can differ. APG is silent on both.
- **Native elements used:** `<button type="button">` for a tab, `<div>` for the root, the list and a panel. The roles are explicit: `tablist`, `tab` and `tabpanel`.
- **Status:** implemented (Plan 0048). Gates green 2026-10-06, accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `tabs.test.tsx` and `tabs-ids.test.ts` next to this file. `tabs.stories.tsx` in `apps/storybook/src/components/tabs/`.

Tabs show one panel of content at a time, with a list of tabs to switch between them: a keyboard user passes the tab list with one Tab press, moves between the tabs with the arrow keys and reaches the selected panel with the next Tab, and a screen reader user hears "tab, 2 of 3, selected". Tabs change content on the same page. For links to other pages, use [Navigation](../navigation/navigation.a11y.md) (`kv-navigation--horizontal`): a tab never navigates.

## Roles, states, properties

| Part       | Element / role                   | ARIA                                                                                                                    | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ---------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tabs.Root  | `<div>`                          | none. `data-orientation`                                                                                                | Owns the selected value. No role: it is a plain container for the list and the panels                                                                                                                                                                                                                                                                                                                                                                                  |
| Tabs.List  | `<div>` → `tablist`              | `aria-label` or `aria-labelledby` (yours). `aria-orientation="vertical"` only when vertical                             | **Name it when a page has more than one.** Horizontal is the default of the role, so `aria-orientation` is only set when vertical. Owns the arrow keys, Home and End                                                                                                                                                                                                                                                                                                   |
| Tabs.Tab   | `<button type="button">` → `tab` | `aria-selected` (`true` or `false`, always set), `aria-controls` (its panel's id), `aria-disabled="true"` when disabled | Never a native `disabled`: a disabled tab stays focusable. Its name is its text. `data-selected` and `data-disabled` for the theme. A dev warning when `render` doesn't give a `<button>` (`tabs-tab-not-a-button:<element>`, 4.1.2)                                                                                                                                                                                                                                   |
| Tabs.Panel | `<div>` → `tabpanel`             | `aria-labelledby` (its tab's id), `hidden` while it isn't selected, `tabindex="0"`                                      | Named by its tab. **Always rendered**, with `hidden` while it isn't selected, so every `aria-controls` and `aria-labelledby` resolves. Not `inert`, not unmounted. A `tabIndex` you pass wins: `-1` for a panel that starts with a focusable element. `data-selected` for the theme                                                                                                                                                                                    |
| every tab  | –                                | `tabindex="0"` on one, `-1` on the others                                                                               | Roving tabindex. DOM focus is on the tab, never `aria-activedescendant`. The one tab with `0` is the focused tab while focus is in the list, and the selected tab otherwise. Test: `tabs.test.tsx › roving tabindex`                                                                                                                                                                                                                                                   |
| the ids    | –                                | `id` on every tab and panel                                                                                             | From the root's `useId()` and the tab's value, each character outside `[A-Za-z0-9-]` escaped as `_<hex code point>_`, so ids are unique and an IDREF has no space. Not an index: a panel needs its tab's id on the first server render, before anything registers, and an index breaks when the tabs reorder. Test: `tabs-ids.test.ts`, `tabs.test.tsx › every tab controls its panel and every panel is named by its tab, for values with spaces and punctuation too` |

Tabs have no strings of their own: every name is the consumer's, from their translations. They announce nothing: selection is in `aria-selected`, and a screen reader says "tab, 2 of 3, selected" from the roles.

**One of `value` and `defaultValue` is required** (by the types). There is no "first tab" fallback, because the tabs register after the server render, and the server markup must already say which tab is selected and which is the Tab stop. A value that no tab has leaves no Tab stop and shows no panel, so a dev warning fires (`tabs-value-without-tab:<value>`, 2.1.1, 4.1.2). So does a tab with no panel, or a panel with no tab (`tabs-unpaired:<value>`, 4.1.2).

## Keyboard

- **Focus strategy:** roving tabindex. The one Tab stop is the selected tab, or the tab that has focus while focus is in the list
- **Selection follows focus:** yes, with `activationMode="automatic"` (the default), except onto a disabled tab. No with `activationMode="manual"`: Enter or Space selects
- **Arrows wrap:** yes
- **Shortcuts:** none

The tab list is one Tab stop. The selected tab has `tabindex="0"` and the others `-1`. While focus is in the list, the tab that has focus is the stop instead (the selected one when focus and selection agree), so Tab from a tab that is not selected leaves the list for the panel and does not move on to the selected tab. When focus leaves the list the selected tab is the stop again. The server render is already right: the selected tab `0`, the others `-1`. Arrow keys flip in right-to-left text, read from the list's computed `direction`, so a `dir` on a container works without a provider. Tabs are ordered by their place in the page.

| Key                     | Context                             | Action                                                                                                                                                                                                             | Test                                                                           |
| ----------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Tab                     | before the list                     | Moves focus to the selected tab, the one Tab stop of the list                                                                                                                                                      | `tabs.test.tsx › Tab enters at the selected tab`                               |
| Tab                     | on a tab                            | Leaves the list for the selected panel, also from a tab that is not selected. A panel has `tabindex="0"`. A panel that starts with a focusable element sets `tabIndex={-1}`, and Tab goes straight to that element | `tabs.test.tsx › Tab leaves the tab list for the panel`                        |
| Shift+Tab               | in the panel                        | Back to the selected tab, and the next Shift+Tab leaves the list                                                                                                                                                   | `tabs.test.tsx › Shift+Tab returns to the selected tab and leaves the list`    |
| ArrowRight / ArrowLeft  | tab list, horizontal                | Next and previous tab, wrapping from the last to the first and back. Automatic activation selects the tab it moves to                                                                                              | `tabs.test.tsx › ArrowRight and ArrowLeft move, wrap and select`               |
| ArrowLeft / ArrowRight  | tab list, horizontal, right to left | The arrows flip: ArrowLeft is the next tab and ArrowRight the previous                                                                                                                                             | `tabs.test.tsx › right to left: the arrows flip`                               |
| ArrowDown / ArrowUp     | tab list, vertical                  | Next and previous tab, wrapping. They don't flip in right-to-left text. ArrowLeft and ArrowRight are not taken in a vertical list, and ArrowDown and ArrowUp are not taken in a horizontal one                     | `tabs.test.tsx › vertical: ArrowDown and ArrowUp move`                         |
| Home / End              | tab list                            | First and last tab. Automatic activation selects it                                                                                                                                                                | `tabs.test.tsx › Home and End go to the ends`                                  |
| Arrows, Enter, Space    | manual activation                   | The arrows, Home and End move focus only: the selection stays where it was. Enter or Space on the focused tab selects it, through the native click                                                                 | `tabs.test.tsx › manual activation: arrows move focus, Enter and Space select` |
| Arrows, Enter, Space    | disabled tab                        | A disabled tab is reachable with the arrows and read as unavailable (`aria-disabled`). Automatic activation never selects it, so focus can be on a tab that is not selected. Enter, Space and a click do nothing   | `tabs.test.tsx › a disabled tab is reachable and never selected`               |
| (with a modifier key)   | tab list                            | Not taken: Control+ArrowRight, Alt+ArrowRight, Shift+End and the like stay the browser's and the page's                                                                                                            | `tabs.test.tsx › keys with Control, Alt, Meta or Shift are left alone`         |
| (a key already handled) | tab                                 | A key that a tab or your own handler already handled (`defaultPrevented`) is not taken again                                                                                                                       | `tabs.test.tsx › a key that was already handled is not taken again`            |

Escape and the typed characters are not handled, and there is no typeahead (APG Tabs has none). A key from an element that isn't a tab is never the list's: a nested set of tabs in a panel keeps its own arrows (`tabs.test.tsx › a nested Tabs keeps its own arrows`).

**Why these choices.** Arrows wrap because APG's example does, and Home and End are implemented because they cost nothing. Automatic activation is the default, as APG advises when the panels show at once. Use `activationMode="manual"` when showing a panel is slow (it loads data, or is large): then arrowing through the tabs doesn't trigger it for each tab. Focus and selection can differ on a disabled tab in automatic mode, and in manual mode always: the contract says so, and the tab with focus is always the Tab stop while focus is in the list.

## Focus management

- Initial focus: not moved. Tab enters at the selected tab.
- Trap: no. Tab and Shift+Tab always leave the list (2.1.2).
- Restore to: not applicable. Selecting a tab never moves focus: it stays on the tab, and the panel is the next Tab stop.
- Never obscured by: the tab list is not sticky by default. A sticky header above the tabs is the page's to allow for with `scroll-padding` (2.4.11).

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | –          |

## Consumer responsibilities

- **Name the list** with `aria-label` from your translations, or `aria-labelledby`, when a page has more than one set of tabs, so a screen reader user can tell them apart.
- **Keep the labels short**, and in the same register ("Uppgifter", "Historik"). A long label wraps inside its tab and never scrolls the list sideways (1.4.10).
- **Give every tab a panel and every panel a tab,** with the same `value`, and give `value` or `defaultValue` the value of a tab. Render every `Tabs.Panel`: do not unmount the ones that aren't selected, because the tab's `aria-controls` would point at nothing. For lazy content, use `isSelected` from the panel's `render` state and render the children when it is true.
- **Use `activationMode="manual"` only for slow panels.** Otherwise keep the default.
- **Pass `tabIndex={-1}` to a panel that starts with a focusable element** (a link, a button or a field), so Tab goes straight to it and the panel is not a redundant stop. A panel with only text keeps its `tabindex="0"`.
- **Use a tab only for content on the same page.** For links to other pages, or a trail through a service, use `Navigation` (`kv-navigation--horizontal`) or a stepper. A tab never changes the URL.
- **Disable a tab sparingly,** and say why where users can read it: a disabled tab is dimmed and read as unavailable, and it stays focusable so it can be found.
- **The panel is not a landmark and has no heading of its own.** The page's heading outline continues inside it: don't skip levels.
- **Don't put interactive content in a tab.** A close button or a menu inside a tab is not supported, and the tab's click would also fire for it.

## Visual / modes

- Focus indicator: a tab and a panel each show the ring of a link, 2px with a 2px offset (2.4.7, 2.4.13).
- Target size: a tab is at least 24 × 24 CSS px, 44px high by default and 32px inside `kv-compact` from 64rem (2.5.8, design spec docs/design/tabs.md). Test: `tabs.stories.tsx › Default` and `CompactDensity`.
- State without colour: the selected tab is weight 600 and a straight 4px bar at its edge, not colour alone (1.4.1, 1.4.11). A disabled tab is dimmed text and `aria-disabled`. Test: `tabs.stories.tsx › DisabledTab`.
- forced-colors behaviour: the bar is `CanvasText` (it opts out of the forced background), the hairline `CanvasText`, text `ButtonText`, a disabled tab `GrayText` and the ring `Highlight`. Test: `tabs.stories.tsx › ForcedColors`.
- reduced-motion behaviour: nothing animates.
- Reflow: the list wraps, row by row, and never scrolls sideways. A long label wraps inside its tab. A vertical set stacks below 40rem (1.4.10). Test: `tabs.stories.tsx › LongFinnishText`.
- Right to left: logical properties only, and the arrows flip (above). The bar of a vertical tab is at the inline end.

## WCAG SCs covered

- 1.3.1 Info and Relationships: `tablist`, `tab` and `tabpanel`, a tab and its panel tied by `aria-controls` and `aria-labelledby`.
- 1.4.1 Use of Color, 1.4.11 Non-text Contrast: the selected tab is a bar and a weight, and its `primary` bar and the focus ring are held to 3:1 by `theme:check`.
- 1.4.10 Reflow: the list wraps and never scrolls.
- 2.1.1 Keyboard, 2.1.2 No Keyboard Trap: every tab and panel reachable, Tab always leaves.
- 2.4.3 Focus Order, 2.4.7 Focus Visible: one Tab stop, DOM order, the panel next.
- 2.5.8 Target Size (Minimum).
- 4.1.2 Name, Role, Value: roles, names, `aria-selected`, `aria-disabled`.

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

- **Focus and selection can differ.** A disabled tab takes focus and is not selected in automatic mode, and in manual mode focus moves without selecting. The tab with focus is the Tab stop while focus is in the list, so Tab always leaves the list for the panel.
- **One redundant Tab stop** on a panel whose first content is focusable, unless the consumer passes `tabIndex={-1}`.
- **Hidden panels still mount.** Every panel is rendered with `hidden`: a heavy panel should render its children only while `isSelected`.
- **A tab that unmounts while it has focus** leaves no Tab stop in the list until focus moves. Closable tabs are not supported.
- **Before hydration** the tabs are already right (the selected tab `0`, the others `-1`, every panel rendered), but the arrow keys need JavaScript.
