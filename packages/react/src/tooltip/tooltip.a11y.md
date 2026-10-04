# Accessibility contract: Tooltip (Root, Trigger, Popup, Name, Shortcut)

- **APG pattern:** [Tooltip](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/) (still marked work in progress by APG, and AT support for `role="tooltip"` varies, so the trigger is complete without it), and WCAG 1.4.13 Content on Hover or Focus.
- **Deviations:** none from the APG keyboard practice. Two decisions, recorded in [Plan 0037](../../../../docs/plans/0037-tooltip.md) and the [design spec](../../../../docs/design/tooltip.md) §7: the part of the tooltip that repeats the trigger's name is `aria-hidden` and only the shortcut is the description (so a screen reader hears the name once and learns the shortcut), and `popover="manual"` rather than `popover="hint"`, so a tooltip never light-dismisses an open Popover.
- **Native elements used:** `<div popover="manual" role="tooltip">` (Popup), `<span>` (Name, Shortcut). The Trigger is the consumer's own control: a `<button>` by default, or any focusable control through `render` (`Toolbar.Toggle`, `Button`, `Toolbar.Item`). Nothing for Root: it renders no element.
- **Status:** alpha candidate (Plan 0037). Manual AT is `pending`.
- **Tests:** `tooltip.test.tsx` and `../../../core/src/tooltip/tooltip-machine.test.ts` (the timing), next to this file and in core. `tooltip.stories.tsx` and `tooltip.e2e.ts` in `apps/storybook/src/components/tooltip/`.

A Tooltip tells a sighted user what an icon-only control does, and its shortcut ("Fetstil Ctrl+B"), without pressing it. It shows when the pointer rests on the control and at once when the control has keyboard focus. A magnifier user can move the pointer onto it, anyone can hide it with Escape, and a screen reader user hears the control's name once. **A tooltip is never the only name, and never holds anything the user must read or do**: it names a control and adds a shortcut. Anything more is visible text or a Popover.

## Roles, states, properties

| Part             | Element / role                                           | ARIA / state                                                                                                                                           | Notes                                                                                                                                                                                                                                                                                                                       |
| ---------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tooltip.Root     | none: it renders no element                              | none                                                                                                                                                   | Owns the open state: `open` / `defaultOpen` / `onOpenChange(open, { reason })`, `placement` (`top`), `offset` (4), `padding` (8), `delay` (500), `closeDelay` (100) and `group`. Reasons: `hover`, `focus`, `escape`, `pointer-leave`, `blur`, `trigger-press`. Works out the trigger's description from the parts it holds |
| Tooltip.Trigger  | `<button type="button">`, or the control `render` gives  | `aria-describedby` (the popup, or its shortcut part, joined with the consumer's own). Its own name, role and states are untouched                      | Never gets a class or a state of its own: **its look never depends on its tooltip.** The anchor the popup is placed against. A dev warning when it has no accessible name of its own (4.1.2, 2.5.3)                                                                                                                         |
| Tooltip.Popup    | `<div popover="manual" role="tooltip">`, always rendered | `id`. No name, never focusable. `aria-hidden="true"` when it has a Name and no Shortcut. `data-open` while open, `data-placement` (`top`, `bottom`, …) | Class `kv-tooltip`. Hidden by the browser while closed (display none), so `aria-describedby` resolves before it opens. Inline `position: fixed`, `left`, `top` and the CSS variables of `usePopup`. Right after the trigger in the DOM. A dev warning when it holds interactive content                                     |
| Tooltip.Name     | `<span>`                                                 | `aria-hidden="true"`                                                                                                                                   | Class `kv-tooltip-name`. The part that repeats the trigger's name, hidden so the name is heard once and not read again in browse mode while the tooltip is open. A popup with a Name and no Shortcut adds no description to the trigger, and is itself `aria-hidden`                                                        |
| Tooltip.Shortcut | `<span>`                                                 | `id`: the trigger's `aria-describedby`                                                                                                                 | Class `kv-tooltip-shortcut`. Adds information, such as the shortcut (`Kbd` for keys). Read after the name: "Fetstil, växlingsknapp, inte nedtryckt, Ctrl+B". Left to right, because key names are Latin script                                                                                                              |
| `useTooltip`     | the same attributes, for your own elements               | `triggerProps`, `popupProps`, `nameProps`, `shortcutProps`, `isOpen`, `placement`                                                                      | Options as the Root, and `description: 'popup' \| 'shortcut' \| 'none'` (what the trigger's `aria-describedby` points at). The trigger's ref is a callback ref: `mergeProps` merges yours. Join your own `aria-describedby` with the hook's, don't replace it                                                               |

Rules, tested in `tooltip.test.tsx` and `tooltip-machine.test.ts`:

- **Name versus description** (design spec §7). Plain text in the Popup is the trigger's description as a whole (APG). A `Tooltip.Name` is hidden from assistive technology, a `Tooltip.Shortcut` is the description. With both, a screen reader hears the name once. With a Name alone the tooltip adds nothing for assistive technology: the trigger has no description, and **the whole popup is `aria-hidden="true"`** (its `role="tooltip"` stays), because an open `role="tooltip"` whose only content is hidden has no accessible text (axe `aria-tooltip-name`). With a Shortcut or plain text the popup is not `aria-hidden` and only the Name line is. The popup is in the DOM while closed in every case. The trigger keeps its own `aria-keyshortcuts` as well (the consumer sets it): a screen reader that announces both may read the shortcut twice, which the AT matrix checks.
- **Always in the DOM.** The Popup is rendered while closed and hidden by the browser (`popover` closed is `display: none`), so the reference always resolves.
- **Top layer.** `popover="manual"`: it never closes an open Popover by light dismiss, and the platform closes nothing. `showPopover()` and `hidePopover()` are called when it opens and closes.
- **Placement.** `usePopup` and `computePlacement`: above the trigger (`top`), centred, a 4px gap, flipping below when there is no room, shifted along the inline axis to stay 8px inside the viewport. Wide and tall enough, it never covers its trigger (2.4.11); in a viewport shorter than the tooltip needs it can, and Escape hides it. While the trigger is scrolled out of view the popup is hidden (`data-detached`, `visibility: hidden`) and returns with it.
- **Opening.** Hover: the pointer rests on the trigger for `delay` (500 ms). Keyboard focus: at once, when the focus shows a focus ring (`:focus-visible`), so a click does not open it. The next tooltip opens at once when one is open or closed less than 300 ms ago (a `group` shared by the page, or by the `group` you give), and a group shows one tooltip at a time. A touch pointer opens nothing: nothing needed is only in a tooltip.
- **Staying (1.4.13 persistent).** It stays while the pointer is on the trigger or the tooltip, or the trigger has keyboard focus. It has no timeout. Enter and Space on the trigger don't close it: focus is still there and the text is still true.
- **Hoverable (1.4.13).** After the pointer leaves, it waits `closeDelay` (100 ms) before closing, which covers the gap; the pointer reaching the tooltip cancels it, and the tooltip stays while the pointer is on it. The tooltip is never `pointer-events: none`.
- **Closing.** Escape; the pointer leaving the trigger and the tooltip; blur; a pointer press on the trigger; and while the trigger's own popup is open (`aria-expanded="true"` on it: a Popover, a Listbox), when it closes and stays closed.
- **Dismissable (1.4.13).** Escape hides it without moving the pointer or focus, through the dismissable layer stack: the tooltip is the innermost layer, so an open Popover underneath stays open (an open Listbox or Combobox with focus handles Escape in its own key handler first: see Known issues), and the next Escape closes that. After Escape it stays hidden until the pointer leaves and comes back, or focus leaves and comes back (each source separately). Escape with no tooltip open is not handled and not prevented.
- **Controlled.** `open` with `onOpenChange`: the tooltip shows the `open` it is given, and reports every request. A request the owner refuses leaves it as it was.
- **Server rendering.** Nothing reads `window` while rendering: the server writes `popover`, `role`, `id`, `data-placement` and no inline position. Everything else happens in effects.
- **`render` on every part,** with class and handlers merged and refs merged, and the consumer's own `aria-describedby` joined with the tooltip's.
- **Dev warnings:** a Trigger with no accessible name of its own, a Popup with interactive content, and a part outside a Root.

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

The tooltip is never focused and never in the Tab order: the trigger owns the focus and its own keys. The tooltip adds no key of its own except Escape, and it takes none from the trigger.

| Key                    | Context                                            | Action                                                                                                                                                                                                     | Test                                                                                                                                             |
| ---------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tab                    | before the trigger                                 | Moves focus to the trigger. Its tooltip opens at once                                                                                                                                                      | `tooltip.e2e.ts › Tab focuses the trigger and its tooltip opens at once`                                                                         |
| Shift+Tab              | on the trigger                                     | Moves focus to the previous focusable element. The tooltip closes                                                                                                                                          | `tooltip.e2e.ts › Shift+Tab leaves the trigger and its tooltip closes`                                                                           |
| ArrowRight / ArrowLeft | on a toolbar control with a tooltip                | The toolbar's own keys move focus to the next and previous control. Each control's tooltip opens at once and replaces the last, without waiting for the hover delay                                        | `tooltip.e2e.ts › arrowing along a toolbar shows each tooltip at once`                                                                           |
| ArrowLeft / ArrowRight | on a toolbar control with a tooltip, right to left | The toolbar's arrows flip, and each tooltip still opens at once                                                                                                                                            | `tooltip.e2e.ts › right to left: arrowing along a toolbar shows each tooltip at once`                                                            |
| Enter / Space          | on the trigger                                     | The trigger's own: activates it. The tooltip stays open, and focus stays                                                                                                                                   | `tooltip.e2e.ts › Enter and Space activate the trigger and the tooltip stays`                                                                    |
| Enter / Space          | on a trigger that opens a popup                    | Opens its popup (a Popover, a Listbox). The tooltip closes, and stays closed while the popup is open                                                                                                       | `tooltip.e2e.ts › a trigger that opens a popup closes its tooltip while the popup is open`                                                       |
| Escape                 | the tooltip is open                                | Hides it. Focus stays on the trigger, and an open Popover underneath stays open (1.4.13 dismissable). A focused open Listbox or Combobox closes first and the tooltip needs a second Escape (Known issues) | `tooltip.e2e.ts › Escape hides the tooltip and focus stays`, `tooltip.e2e.ts › Escape closes only the tooltip when a popover is open underneath` |
| Escape                 | the tooltip was hidden with Escape, focus stays    | It stays hidden until focus leaves the trigger and comes back                                                                                                                                              | `tooltip.e2e.ts › after Escape the tooltip stays hidden until focus leaves and comes back`                                                       |
| Escape                 | no tooltip is open                                 | Not handled and not prevented: it passes on to whatever owns it (a Popover, the editor)                                                                                                                    | `tooltip.e2e.ts › Escape does nothing when no tooltip is open`                                                                                   |
| Pointer hover          | on the trigger                                     | Opens the tooltip after the delay (500 ms by default). A pointer that passes over opens nothing                                                                                                            | `tooltip.e2e.ts › hover opens the tooltip after the delay`                                                                                       |
| Pointer hover          | on the tooltip                                     | The pointer can move from the trigger onto the tooltip, and the tooltip stays while it is there. Leaving both closes it after 100 ms (1.4.13 hoverable and persistent)                                     | `tooltip.e2e.ts › the pointer can move onto the tooltip and it stays (hoverable)`                                                                |
| Pointer hover          | after Escape, the pointer still on the trigger     | The tooltip stays hidden until the pointer leaves and comes back                                                                                                                                           | `tooltip.e2e.ts › after Escape the tooltip stays hidden until the pointer leaves and comes back`                                                 |
| Pointer press          | on the trigger                                     | Hides the tooltip until the pointer leaves and comes back. A click doesn't open it from focus                                                                                                              | `tooltip.e2e.ts › a press on the trigger hides the tooltip`, `tooltip.test.tsx › a click does not open the tooltip from focus`                   |
| Touch                  | on the trigger                                     | Nothing: there is no tooltip on a touch screen, and no long press. The trigger's own name carries it                                                                                                       | `tooltip.test.tsx › a touch pointer opens no tooltip`                                                                                            |

Tab never stops on the tooltip, and the arrow keys never land on it, also inside a Toolbar: it isn't focusable and has no role that a composite treats as an item.

## Focus management

- Initial focus: not moved, ever. The tooltip is never focused.
- Trap: no. Tab and Shift+Tab pass the trigger as for any control.
- Restore to: not applicable. Focus never leaves the trigger because of the tooltip: Escape hides the tooltip and focus stays.
- Never obscured by: at 320px wide and 640 high, and in the stories, the tooltip never covers its trigger (2.4.11, `tooltip.e2e.ts › the tooltip never covers its trigger`), so the trigger's focus ring stays visible (2.4.7). In a viewport shorter than a long tooltip needs (320 by 256) it can overlap the trigger: that is transient, and Escape hides it and the pointer can leave. It is placed inside the viewport with 8px of padding, and sits in the top layer, so no sticky header covers it.

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | none       |

Tooltip has no strings of its own and announces nothing: the description is read with the trigger (`aria-describedby`), so no live region is needed. The name, the shortcut and the key labels are the consumer's, from their translations. The editor's tooltips use its own message keys and a platform shortcut formatter (`Ctrl+B`, or `⌘B` on macOS).

## Consumer responsibilities

- **Give the trigger a name of its own,** with `aria-label` from your translations for an icon-only control, or visible text. A tooltip is never the only name: it isn't shown on touch, and its text is not the control's name. A dev warning fires without one (4.1.2, 2.5.3).
- **Start the tooltip with the trigger's name,** from the same translation, so a voice-control user can say what they see (2.5.3). Wrap it in `Tooltip.Name`, so a screen reader doesn't read it twice.
- **Put the shortcut in `Tooltip.Shortcut`** (with `Kbd` for keys) and set the trigger's `aria-keyshortcuts`. Key names aren't translated.
- **Text and keys only.** Never a link, a button, a field or a heading: a tooltip disappears with the pointer and the focus, and can't be reached with Tab. A dev warning fires. Use a Popover for anything the user can act on.
- **Never put essential information in a tooltip.** Anything a user needs to finish a task is visible text. The editor's `labels="icon-and-text"` shows names as text.
- **Render the Popup right after the Trigger,** in the same parent.
- **No `title` attribute** on the trigger next to a tooltip: it isn't shown on keyboard focus or touch, can't be hovered or dismissed (1.4.13), and next to `aria-label` it is announced twice.
- **No tooltip on a natively `disabled` button:** it gets no pointer events and no focus. Use `aria-disabled` (toolbar items always do) if the name must stay discoverable.
- Everything in the trigger's own contract (`button.a11y.md`, `toggle.a11y.md`) applies to the trigger.

## Visual / modes

- Focus indicator: the trigger's own. The tooltip is never focusable and has no ring.
- Target size: not applicable: the tooltip isn't a control. It is hoverable, which needs no target size.
- Colour: the name is `text` on `surface-raised`, 4.5:1 or more in every theme. These pairs are in `theme:check`. The tooltip's edge is a decorative hairline: 1.4.11 doesn't apply to the box, and its content is text.
- forced-colors behaviour: `Canvas` fill, `CanvasText` text, a 1px `CanvasText` edge, no shadow. The keys keep Kbd's edge. No `forced-color-adjust: none` (`tooltip.e2e.ts › forced colours: the tooltip keeps a visible edge`).
- reduced-motion behaviour: an opacity fade in over `--kv-duration-fast` only under `prefers-reduced-motion: no-preference`. No movement, no scale. Closing is instant in every setting.
- Reflow, text spacing: the tooltip is never wider than the viewport minus 8px each side, wraps, and has no fixed height (1.4.10, 1.4.12). The text is never clipped (`overflow: visible`). In a viewport too short for a long tooltip (320 by 256) it may overlap its trigger (2.4.11): the overlap is transient, and the tooltip is dismissable with Escape and hoverable (1.4.13), so nothing is lost. The accessibility trade-off was decided by the orchestrator, 2026-10-04. At 400% zoom it may cover content near the trigger: that is why it is hoverable and dismissable (`tooltip.e2e.ts › at 320px the tooltip stays inside the viewport`).
- RTL: placement and padding use logical properties and the tooltip is centred, so nothing flips.

## WCAG SCs covered

- 1.4.13 Content on Hover or Focus: dismissable (Escape), hoverable (the grace period and the pointer on the tooltip), persistent (no timeout, until hover or focus ends).
- 1.3.1 Info and Relationships, 4.1.2 Name, Role, Value: `role="tooltip"`, `aria-describedby`, and the trigger's own name.
- 2.5.3 Label in Name: the tooltip starts with the trigger's name.
- 1.4.3 Contrast, 1.4.11 Non-text Contrast, 1.4.1 Use of Color: the text, and no meaning in colour.
- 2.1.1 Keyboard, 2.1.2 No Keyboard Trap, 2.4.7 Focus Visible, 2.4.11 Focus Not Obscured: keyboard focus opens it, Escape hides it, and it covers its trigger only in a viewport too short for a long tooltip, where Escape hides it.
- 1.4.4 Resize Text, 1.4.10 Reflow, 1.4.12 Text Spacing: limited to the viewport, wraps, no fixed height.
- 3.2.1 On Focus: opening a tooltip is not a change of context, and focus never moves.

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

Also pending, by hand: whether NVDA, JAWS and VoiceOver read an icon-only button's name once and its shortcut once (the trigger has `aria-keyshortcuts` and the description), whether a screen reader reads the hidden-from-AT name again in browse mode while the tooltip is open, and whether a magnifier user at 400% can reach the tooltip by moving the pointer onto it.

## Known issues

- **Escape with a focused open Listbox or Combobox closes the listbox first.** Those components handle Escape in their own key handler and call `preventDefault()`, before the tooltip's document listener, which then ignores the key. One Escape closes the listbox and the tooltip stays; the next Escape hides it. The tested case is a Popover underneath. A Dialog is not covered: none exists yet.
- **A pointer on another trigger closes this trigger's keyboard-focused tooltip, and it comes back when that tooltip closes while focus is still here.** One tooltip of a group is open at a time. When the other tooltip closes (the pointer leaves it), the focused trigger's tooltip opens again (reason `focus`), so a keyboard user's tooltip is never lost to a stray pointer. It also comes back when Escape hides the other tooltip, so with the pointer on another trigger it takes two Escapes to hide both.
- **A tooltip never takes an outside press.** Its layer passes presses through (`passOutsidePressThrough`), so a press elsewhere while a keyboard-focused tooltip is open reaches the Popover underneath in the same press (`dismissable-layer-stack.test.ts`). Escape is exact: one key closes the tooltip and the next closes the Popover.
- **A trigger that scrolls out of view hides the tooltip rather than closing it.** `usePopup` sets `visibility: hidden` and `data-detached` while the trigger is outside the viewport, and the tooltip returns with it. The tooltip's own state stays open.
- **The shared delay is page-wide.** One group for the page, not one per provider. Give a `group` (`createTooltipGroup()`) to scope it.
- **`role="tooltip"` support varies between screen readers,** which is why the trigger is complete without it and the shortcut is also in `aria-keyshortcuts`.
