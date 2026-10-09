# Accessibility contract: Menu (Root, Trigger, Popup, Item, CheckboxItem, RadioGroup, RadioItem, Separator, Group, GroupLabel)

- **APG pattern:** [Menu Button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/) (the [Actions Menu Button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/examples/menu-button-actions/) example) and the menu roles of [Menubar](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/) (`menuitemcheckbox`, `menuitemradio`, groups, separators).
- **Deviations:** none from the APG keyboard practice. Decisions, defaults pending the maintainer (`docs/design/menu.md`; `docs/roadmap.md` "Open maintainer decisions"): no submenus and no `menubar` in v1, so ArrowLeft and ArrowRight are not handled; a disabled item stays focusable with `aria-disabled` (the APG's own rule for composites); items are `<button>`s; pointer movement over an item focuses it (one highlight).
- **Native elements used:** `<button>` (Trigger and every item), `<div popover="auto" role="menu">` (Popup), `<div role="group">` (Group, RadioGroup), `<div role="separator">`. Nothing for Root: it renders no element.
- **Status:** alpha candidate (see `docs/design/menu.md`). Manual AT is `pending`.
- **Tests:** `menu.test.tsx` next to this file, `../popup/use-popup.test.tsx` and `../popup/use-dismissable-layer.test.tsx`, and `typeahead/*.test.ts` in `@kvirn-ui/core`. `menu.stories.tsx` in `apps/storybook/src/components/menu/`.

A Menu is a short list of **actions** that a button opens: print, share, delete. It is not navigation: links to pages belong in a `Navigation` or a `Disclosure`, never in `role="menu"`, because a screen reader then switches to a mode that does not read links as links. The browser puts the menu in the top layer, KvirnUI places it next to the button, and focus moves onto its items as the user arrows through them. Enter or Space runs an item, closes the menu and returns focus to the button. Escape and a press outside close it.

## Roles, states, properties

| Part              | Element / role                                                                             | ARIA / state                                                                                                                                        | Notes                                                                                                                                                                                                                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Menu.Root         | none: it renders no element                                                                | none                                                                                                                                                | Owns the open state: `open` / `defaultOpen` / `onOpenChange(open, { reason, event })`, and `placement`, `offset` (4), `padding` (8). Reasons: `trigger-press`, `key`, `item-press`, `escape`, `outside-press`, `light-dismiss`, `tab`, `focus-out` (focus went to an element outside the menu, not by Tab) |
| Menu.Trigger      | `<button type="button">`                                                                   | `aria-haspopup="menu"`, `aria-expanded="true" \| "false"`, `aria-controls` (the popup's id). `data-open` while open                                 | Class `kv-menu-trigger`. The anchor the popup is placed against. Its name is the consumer's content. Compose with `as={Button}`                                                                                                                                                                            |
| Menu.Popup        | `<div popover="auto" role="menu">`, always rendered                                        | named by the trigger (`aria-labelledby`) unless the consumer sets `aria-label` or `aria-labelledby`. `data-open`, `data-placement`, `data-detached` | Class `kv-menu-popup`. Its items stay mounted while it is closed, so an uncontrolled checkbox or radio item keeps its state. Hidden by the browser while closed (out of the accessibility tree). Inline placement as Popover's. Scrolls inside when too tall (`--kv-popup-max-height`)                     |
| Menu.Item         | `<button type="button" role="menuitem">`, `tabindex` 0 on the focused item, -1 on the rest | `aria-disabled="true"` while disabled. `data-disabled`, `data-highlighted` while it has focus                                                       | Class `kv-menu-item`. `onSelect(event)`, `closeOnSelect` (default `true`), `disabled`, `textValue` (the typeahead label, default the trimmed text). Rendered as a link it warns: actions only                                                                                                              |
| Menu.CheckboxItem | `<button type="button" role="menuitemcheckbox">`                                           | `aria-checked="true" \| "false"`, as Item. `data-checked`                                                                                           | Class `kv-menu-checkbox-item`. `checked` / `defaultChecked` / `onCheckedChange(checked)`. Closes the menu by default                                                                                                                                                                                       |
| Menu.RadioGroup   | `<div role="group">`                                                                       | named by `aria-label` or `aria-labelledby` (**the consumer's**)                                                                                     | Class `kv-menu-radio-group`. `value` / `defaultValue` / `onValueChange(value)`. A dev warning fires without a name                                                                                                                                                                                         |
| Menu.RadioItem    | `<button type="button" role="menuitemradio">`                                              | `aria-checked`, as Item. `data-checked`                                                                                                             | Class `kv-menu-radio-item`. `value` is required. Selecting it sets the group's value                                                                                                                                                                                                                       |
| Menu.Group        | `<div role="group">`                                                                       | `aria-labelledby` the `GroupLabel` inside it, unless the consumer names it                                                                          | Class `kv-menu-group`. A dev warning fires with neither a `GroupLabel` nor a name                                                                                                                                                                                                                          |
| Menu.GroupLabel   | `<div>` (not focusable, not an item)                                                       | its `id` is the group's `aria-labelledby`                                                                                                           | Class `kv-menu-group-label`                                                                                                                                                                                                                                                                                |
| Menu.Separator    | `<div role="separator">`                                                                   | none                                                                                                                                                | Class `kv-menu-separator`. Not an item: arrows and typeahead skip it                                                                                                                                                                                                                                       |
| `useMenu`         | the same attributes, for your own elements                                                 | `triggerProps`, `popupProps`, `getItemProps(kind, options)`, `isOpen`, `placement`                                                                  | Options as the Root. The refs are in the props: `mergeProps` merges yours                                                                                                                                                                                                                                  |

Rules, tested in `menu.test.tsx`:

- **Wiring.** `aria-controls` is the popup's id on every render, `aria-expanded` follows the state, `aria-haspopup="menu"` says what opens. The trigger is a real `<button type="button">`. The popup is named by the trigger unless the consumer names it.
- **Items.** Roving tabindex: the focused item has `tabindex="0"`, every other item `-1`, and focus moves onto items with `.focus()`. While no item has focus nothing in the menu is tabbable, so the menu is never a Tab stop of its own. Items are found in the DOM at key time (`[role^="menuitem"]`), so a conditional item, a fragment or a custom wrapper just works. A separator and a group label are not items.
- **Disabled items** are focusable, reachable by arrows and typeahead, and say `aria-disabled="true"`. Activation is blocked and the menu stays open. A screen reader reads them as "dimmed" or "unavailable".
- **Checkbox and radio items** toggle or select on activation, are controlled or uncontrolled, and close the menu by default (`closeOnSelect={false}` keeps it open). A radio item in a group with `value` is checked when its `value` equals the group's.
- **Dismissal.** Escape closes the innermost layer only. A press outside closes it (the trigger is not outside: its press toggles). Focus moving to an element outside the menu another way (a screen reader command, a script) closes it too (`focus-out`). The platform hiding the popup (another auto popover opening) closes it in the state too (`light-dismiss`).
- **Composition.** Inside a vertical `Toolbar`, ArrowDown on the trigger opens the menu and the toolbar does not also move focus. Under `Tooltip.Trigger`, the tooltip closes while the menu is open. Inside a `Dialog`, the menu stacks above it and Escape closes the menu only. The popup leaves the toolbar's context.
- **Server rendering.** The server writes the trigger and the closed popup with its items (`popover`, `role="menu"`, `data-placement`), and no inline position.
- **`as`.** `Menu.Trigger` takes a component (`as={Button}`, or `Toolbar.Item as={Menu.Trigger}` the other way round) that must render a button and spread its props on a DOM node; its props are plain props, merged with the part's (handlers chain, `className` joins, refs merge). A trigger that is not a `<button>` warns (`menu-trigger-not-a-button`). **Allowed elements:** Popup, Group and RadioGroup `div` (default) or `section`; GroupLabel `div` (default), `span` or `p`; another tag warns once (`as-not-allowed`) and falls back. The items (`Item`, `CheckboxItem`, `RadioItem`) and `Separator` have no `as`: an action is a `<button>` with a menu role, and a link in a menu would be announced as a menu item (the `menu-item-navigation` warning went with the only way to get one).
- **Dev warnings:** a part outside a Root; a Trigger that is not a `<button>`; a `Menu.Item` rendered as `<a href>` (navigation); a `RadioGroup` or `Group` with no name.

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** roving tabindex
- **Selection follows focus:** n/a
- **Arrows wrap:** yes
- **Shortcuts:** none

| Key                    | Context                                 | Action                                                                                                                                                                                             | Test                                                                                                              |
| ---------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Tab                    | before the trigger                      | Moves focus to the trigger. The trigger is one stop and the closed menu has none                                                                                                                   | `menu.test.tsx › Tab focuses the trigger, and is one stop`                                                        |
| Shift+Tab              | on the trigger                          | Moves focus to the previous focusable element                                                                                                                                                      | `menu.test.tsx › Shift+Tab leaves the trigger backwards`                                                          |
| Enter / Space          | on the trigger                          | Opens the menu and moves focus to the first item                                                                                                                                                   | `menu.test.tsx › Enter and Space on the trigger open the menu with focus on the first item`                       |
| ArrowDown / ArrowUp    | on the trigger                          | Opens the menu and moves focus to the first / last item                                                                                                                                            | `menu.test.tsx › ArrowDown and ArrowUp on the trigger open the menu on the first and last item`                   |
| Pointer press          | on the trigger                          | Opens the menu, or closes it when it is open. Opening focuses the first item. A closing press does not reopen it                                                                                   | `menu.test.tsx › a pointer press on the trigger toggles the menu, and a closing press does not reopen it`         |
| ArrowDown / ArrowUp    | in the menu                             | Moves focus to the next / previous item, wrapping from the last to the first and back. Disabled items are included. Up and Down never flip in right-to-left text                                   | `menu.test.tsx › ArrowDown and ArrowUp move between items, wrap and include disabled items`                       |
| Home / End             | in the menu                             | Moves focus to the first / last item                                                                                                                                                               | `menu.test.tsx › Home and End move to the first and last item`                                                    |
| Printable character    | in the menu                             | Moves focus to the next item whose text starts with the characters typed, by the page's locale. The word ends after 500 ms. A repeated character cycles. Ctrl, Alt, Meta and IME input are ignored | `menu.test.tsx › a character moves focus by typeahead, a word narrows it and a pause resets it`                   |
| Space                  | in the menu, typeahead word in progress | Adds a space to the word and does not activate the item                                                                                                                                            | `menu.test.tsx › Space during a typeahead word adds a space and does not activate`                                |
| Enter / Space          | on an item                              | Runs the item, toggles a checkbox item or selects a radio item, closes the menu and returns focus to the trigger. With `closeOnSelect={false}` the menu stays open                                 | `menu.test.tsx › Enter and Space on an item run it, close the menu and return focus to the trigger`               |
| Enter / Space          | on a disabled item                      | Does nothing. The menu stays open                                                                                                                                                                  | `menu.test.tsx › Enter and Space on a disabled item do nothing and keep the menu open`                            |
| Escape                 | in the menu                             | Closes the innermost layer only and returns focus to the trigger                                                                                                                                   | `menu.test.tsx › Escape closes the menu and returns focus to the trigger, and only the menu`                      |
| Tab                    | in the menu                             | Moves focus on to the next focusable element after the trigger and closes the menu. Tab is never prevented: the menu is no trap                                                                    | `menu.test.tsx › Tab in the menu closes it and moves focus to the next focusable after the trigger`               |
| Shift+Tab              | in the menu                             | Moves focus to the previous focusable element, which is the trigger, and closes the menu                                                                                                           | `menu.test.tsx › Shift+Tab in the menu closes it and moves focus to the trigger`                                  |
| ArrowLeft / ArrowRight | in the menu                             | Not handled and not prevented: there are no submenus                                                                                                                                               | `menu.test.tsx › ArrowLeft and ArrowRight are not handled or prevented`                                           |
| Pointer move / press   | on an item                              | Moving over an item focuses it. Pressing runs it. A press outside the menu closes it                                                                                                               | `menu.test.tsx › moving the pointer over an item focuses it, a press runs it and a press outside closes the menu` |

The menu has no shortcuts and handles no other key: Page Up and Page Down are the browser's own, and Escape is read on the document, after the page's handlers (a handler that calls `preventDefault()` on it keeps the menu open). A Space after a typeahead word has been pause-ended for more than 500 ms activates the item: type, then pause, then Space.

## Focus management

- Initial focus: **moves onto an item** when the menu is opened after mount, in an effect after the popup is shown: the first item for Enter, Space, a press and ArrowDown, the last for ArrowUp. A menu with no items keeps focus on the trigger. **A menu that starts open** (`defaultOpen`, or `open` true on the first render) is open but moves no focus on load (3.2.1): focus stays where it was, and Escape and the arrows work once focus is in it. Only a later opening (a press, a key, `open` going from false to true) takes focus.
- Trap: no. Nothing is `inert` and Tab leaves the menu, closing it. Page content behind the menu stays reachable once it is closed.
- Restore to: the trigger, then the element that had focus before the menu opened, after an item runs, Escape and an outside press that lost focus to `body` once focus had been in the menu (or the menu had an opener). A `defaultOpen` menu the platform closes before anyone interacted leaves focus alone. Never `body`. After an outside press the return does not scroll the page (`preventScroll`); after Escape or an item it does, so the trigger comes into view (2.4.11). Tab, Shift+Tab and a `focus-out` close leave focus where it went. Focus the user moved to another control is never taken.
- Never obscured by: the popup never covers its anchor (2.4.11), it sits in the top layer and the highlighted item is scrolled into view by focusing it. A consumer with a sticky header keeps `scroll-padding`.

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | none       |

Menu has no strings of its own and announces nothing: `aria-expanded` tells a screen reader user the menu opened, and the focus move reads the first item with its role and position. The item labels are the consumer's, in the page's language.

## Consumer responsibilities

- **Render `Menu.Popup` right after `Menu.Trigger`,** in the same parent. Tab and Shift+Tab leave the menu as documented only if the popup follows the trigger in the DOM (2.4.3).
- **Use it for actions,** not navigation. Links to pages are a `Navigation` or a `Disclosure`. A `Menu.Item` has no `as`, so it can't be made a link.
- **Name the trigger** with visible text, or `aria-label` for an icon-only button (4.1.2, 2.5.3). The popup is named by it unless you pass `aria-label`.
- **Name a `RadioGroup` and a `Group`:** a `GroupLabel` or `aria-label` (1.3.1).
- **Give an item with non-text content a `textValue`** so typeahead has a label.
- **A single action is a button,** not a menu with one item.
- **Don't hide the only way to do something** in a menu without a visible hint that it exists: the trigger names it ("Åtgärder").
- **Move focus yourself when an item opens a Dialog,** or let the Dialog do it: the dialog returns focus to its own trigger, which is the item's menu trigger once the menu has closed.
- Everything in `button.a11y.md` applies to the trigger.

## Visual / modes

- Focus indicator: the focused item is the highlight (a solid primary fill in the default theme, `Highlight` in forced colours), never colour alone for a checked state: a tick and a dot are drawn from borders. The trigger is a Button: the 2px ring with a 2px offset.
- Target size: items are at least the control height (44px comfortable, 32px compact) (2.5.8).
- Colour: highlighted, disabled and checked items keep 4.5:1 for text and 3:1 for the popup's edge (1.4.11).
- forced-colors behaviour: the popup keeps a visible `CanvasText` edge, the highlighted item uses `Highlight` and `HighlightText`, and checked state is drawn from borders.
- reduced-motion behaviour: no positional animation, ever.
- Reflow: at 320px the popup is never wider than the viewport minus the padding and scrolls inside when too tall (1.4.10).
- RTL: `bottom-start` lines the popup's right edge with the trigger's. ArrowUp and ArrowDown never flip.

## WCAG SCs covered

- 1.3.1 Info and Relationships, 4.1.2 Name, Role, Value: the menu roles, `aria-checked`, groups, separators, the trigger's `aria-haspopup`, `aria-expanded` and `aria-controls`.
- 2.1.1 Keyboard, 2.1.2 No Keyboard Trap: every item reachable by keys, Tab leaves.
- 2.4.3 Focus Order: focus enters the menu on open and returns to the trigger.
- 2.4.7 Focus Visible, 2.4.11 Focus Not Obscured: the highlight, and the popup never covers its anchor.
- 2.5.8 Target Size (Minimum): items at control height.
- 3.2.1 On Focus: opening needs a press or a key, and nothing moves focus on its own.

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

Also pending, by hand: Tab out of the menu on Safari and Firefox (the focus start point after the popup closes), and how screen readers read disabled items.

## Known issues

- **A menu that starts open does not take focus,** so a keyboard user has to Tab to the trigger and press ArrowDown (no item is tabbable until one has focus). Start a menu open only for demonstrations and tests.
- **A Tab pressed during IME composition** is ignored by the menu, so a Tab that then leaves the page for browser chrome (focus to nowhere) does not close it.
- **The focused item has `tabindex="0"`, the others `-1`** (roving tabindex). A scrolling region needs a tabbable element for axe (`scrollable-region-focusable`), and items at -1 do not count. Tab and Shift+Tab still leave the menu from the item, because no other element in the popup is tabbable; the popup itself is not focusable.
- **A checkbox or radio change is not announced after the menu closes.** Focus returns to the trigger, which does not carry the new state. Show the state in the trigger's text where it matters.
- **Disabled items stay reachable,** so a screen reader user hears "dimmed". That is deliberate (discoverability), and a reason to explain why an action is unavailable elsewhere on the page.
- **Hover moves focus** (one highlight, as native menus do). A magnifier user may find the focus moving under the pointer surprising.
- **No submenus** in this version, and no context menu or menubar.
- **Tab is never intercepted.** The browser moves focus from the item and the menu closes on that focus move (deferred one task, reason `tab`), with no focus return. Chromium does as documented; Safari and Firefox are `pending`.
