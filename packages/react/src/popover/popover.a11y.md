# Accessibility contract: Popover (Root, Trigger, Popup, Close)

- **APG pattern:** [Dialog (Non-Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) for the popup, opened by a [Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)-style button (`aria-expanded`, `aria-controls`). The popup is non-modal: the page behind it stays reachable and is never `inert`.
- **Deviations:** none from the APG keyboard practice. Decisions (overlays-and-lists skill): the native `popover` attribute, the pure placement function and the dismissable-layer stack, with its implementation notes for Popover. Opening does not move focus, which is the disclosure pattern's rule, not the modal dialog's (see Focus management).
- **Native elements used:** `<button>` (Trigger, Close), `<div popover="auto" role="dialog">` (Popup). Nothing for Root: it renders no element.
- **Status:** alpha candidate (Plan 0022, Phase 2). Manual AT is `pending`.
- **Tests:** `popover.test.tsx`, `../popup/use-popup.test.tsx` and `../popup/use-dismissable-layer.test.tsx` next to this file. `popover.stories.tsx` in `apps/storybook/src/components/popover/`.

A Popover is a small floating panel that a button opens: a hint, a short form, a few controls. The browser puts it in the top layer, so no ancestor's `overflow` clips it and no `z-index` is needed. KvirnUI places it next to the button, flips it when there is no room and keeps it inside the viewport. Escape and a press outside close it, and focus goes back to the button. Opening never moves focus: the panel follows the button in the Tab order.

## Roles, states, properties

| Part                  | Element / role                                                           | ARIA / state                                                                                                                                                        | Notes                                                                                                                                                                                                                                                                                                     |
| --------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Popover.Root          | none: it renders no element                                              | none                                                                                                                                                                | Owns the open state: `open` / `defaultOpen` / `onOpenChange(open, { reason, event })`, and `placement`, `offset` (4), `padding` (8), `matchAnchorWidth`. Reasons: `trigger-press`, `close-press`, `escape`, `outside-press`, `light-dismiss`                                                              |
| Popover.Trigger       | `<button type="button">`                                                 | `aria-expanded="true" \| "false"`, `aria-controls` (the popup's id), `aria-haspopup="dialog"`. `data-open` while open                                               | Class `kv-popover-trigger`. The anchor the popup is placed against. Its name is the consumer's content. Enter and Space are the button's own                                                                                                                                                              |
| Popover.Popup         | `<div popover="auto" role="dialog">`, always rendered                    | name from `aria-label` or `aria-labelledby` (**the consumer's**). No `aria-modal`. `data-open` while open, `data-placement` (`bottom-start`, `top`, `end-start`, …) | Class `kv-popover-popup`. Hidden by the browser while closed (display none, out of the tree). Inline `position: fixed`, `left`, `top`, `box-sizing`, `max-width` and `max-height`, and the CSS variables `--kv-popup-width`, `--kv-popup-max-height` and `--kv-anchor-width`. Never animates its position |
| Popover.Close         | `<button type="button">`                                                 | none of its own. The name is the consumer's content or `aria-label`                                                                                                 | Class `kv-popover-close`. Closes the popup and returns focus to the trigger                                                                                                                                                                                                                               |
| `usePopover`          | the same attributes, for your own elements                               | `triggerProps`, `popupProps`, `closeProps`, `isOpen`, `placement`                                                                                                   | Options as the Root. The refs are in the props: `mergeProps` merges yours                                                                                                                                                                                                                                 |
| `usePopup`            | a shared hook for any floating element (Select, Combobox, Menu)          | `popupProps` (`popover`, `data-open`, `data-placement`), `placement`, `reposition()`                                                                                | Options: `open`, `anchorRef`, `popupRef`, `placement`, `offset`, `padding`, `matchAnchorWidth`, `popover: 'auto' \| 'manual'`, `onNativeDismiss`. Shows and hides the popup, measures, calls `computePlacement` and applies the result. Where the Popover API is missing it toggles `hidden`              |
| `useDismissableLayer` | a shared hook for any layer that dismisses on Escape and outside presses | none                                                                                                                                                                | `{ open, onDismiss(reason, event), ref, ignore, dismissOnEscape, dismissOnOutsidePress }`. One page-wide stack: only the top layer reacts. `ignore` predicates make targets outside the layer (the anchor, a Combobox's input and button) count as inside                                                 |

Rules, tested in `popover.test.tsx`, `use-popup.test.tsx` and `use-dismissable-layer.test.tsx`:

- **Wiring.** `aria-controls` is the popup's id on every render (the popup is always in the DOM), `aria-expanded` follows the state, `aria-haspopup="dialog"` says what opens. The trigger is a real `<button type="button">`.
- **Top layer.** The popup has the `popover` attribute: `auto` for Popover (the platform also closes it on Escape and a press outside), `manual` where the owner closes it (a Combobox keeps focus in its input). `showPopover()` and `hidePopover()` are called when `open` changes, and never throw: a missing API toggles `hidden`.
- **Placement.** `computePlacement` (`@kvirn-ui/core`) gets the measured anchor, the popup at its natural size and the viewport. The popup flips to the other side when it doesn't fit, shifts to stay inside the viewport (keeping `padding`), is never taller than the room that is left (`--kv-popup-max-height`, and it scrolls inside) and never covers the anchor (2.4.11). `start` and `end` follow the anchor's reading direction. It is placed again on scroll (any scroller except the popup itself), on resize, and when the anchor or the popup changes size. While the anchor is entirely outside the viewport (scrolled away) the popup is `visibility: hidden` and has `data-detached`, so it never floats over unrelated content, and it returns with the anchor. `maxHeight` is never more than the viewport minus `padding`.
- **Dismissal.** Escape closes the innermost open layer only. A press outside the top layer closes it, a press on the trigger or inside the popup does not (the trigger's press is a toggle). A touch press counts when the finger lifts, and not at all when the gesture becomes a scroll. A key whose handler called `preventDefault()` and a key during IME composition don't dismiss. When it closes a layer, the hook calls `preventDefault()` on that Escape, so the browser's own close request doesn't also close the next layer down: one Escape closes one layer.
- **Same state as the page.** When the platform hides an open popup (a light dismiss, or another auto popover opening), `onOpenChange(false, { reason: 'light-dismiss' })` runs, so the state matches. A click on the trigger never opens a popup the platform just closed.
- **Focus.** See Focus management.
- **Server rendering.** Nothing reads `window` while rendering: the server writes `popover`, `data-placement`, `aria-*` and no inline position. Everything else happens in effects.
- **`render` on every part,** with class and handlers merged and refs merged.
- **Dev warnings:** a Popup with no accessible name, and a Trigger, Popup or Close outside a Root.

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key           | Context                                     | Action                                                                                                                                          | Test                                                                                                |
| ------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Tab           | before the trigger                          | Moves focus to the trigger. The trigger is one stop                                                                                             | `popover.test.tsx › Tab focuses the trigger, and is one stop`                                       |
| Shift+Tab     | on the trigger                              | Moves focus to the previous focusable element                                                                                                   | `popover.test.tsx › Shift+Tab leaves the trigger backwards`                                         |
| Enter / Space | on the trigger                              | Opens the popup, or closes it when it is open. Focus stays on the trigger                                                                       | `popover.test.tsx › Enter and Space on the trigger toggle the popup`                                |
| Tab           | on the trigger, popup open                  | Moves focus into the popup, to its first focusable element: the popup follows the trigger in the Tab order                                      | `popover.test.tsx › Tab goes from the trigger into the popup, and Shift+Tab goes back`              |
| Tab           | on the last focusable element in the popup  | Moves focus to the next focusable element after the popup. The popup stays open: it is not modal, and Tab never traps or dismisses (2.1.2)      | `popover.test.tsx › Tab goes from the trigger into the popup, and Shift+Tab goes back`              |
| Shift+Tab     | on the first focusable element in the popup | Moves focus back to the trigger. The popup stays open                                                                                           | `popover.test.tsx › Tab goes from the trigger into the popup, and Shift+Tab goes back`              |
| Enter / Space | on a Close button in the popup              | Closes the popup and returns focus to the trigger                                                                                               | `popover.test.tsx › Enter and Space on Close close the popup and return focus to the trigger`       |
| Escape        | in the popup                                | Closes the popup and returns focus to the trigger                                                                                               | `popover.test.tsx › Escape closes the popup and returns focus to the trigger from inside the popup` |
| Escape        | on the trigger, popup open                  | Closes the popup. Focus stays on the trigger                                                                                                    | `popover.test.tsx › Escape closes the popup with focus on the trigger, which keeps focus`           |
| Escape        | a popover open inside another popover       | Closes the innermost popup only. A second Escape closes the next                                                                                | `popover.test.tsx › Escape closes the innermost popup only, then the next`                          |
| Escape        | popup closed                                | Nothing: the key is the page's own                                                                                                              | `popover.test.tsx › Escape does nothing while the popup is closed`                                  |
| Pointer press | on the trigger                              | Opens the popup, or closes it when it is open. A press on the trigger is never an outside press: a closing click doesn't reopen the popup       | `popover.test.tsx › a second press on the trigger closes it, and does not open it again`            |
| Pointer press | outside the popup and the trigger           | Closes the popup. A touch press counts when the finger lifts, so scrolling the page doesn't close it. A control that is pressed keeps the focus | `popover.test.tsx › a press outside closes the popup`                                               |

The popover handles no other key. Arrow keys, Home, End, Page Up and Page Down are the content's own (a list, a form, native scrolling), and the component prevents none of them. Escape is read on the document, after the page's handlers: a handler that calls `preventDefault()` on it keeps the popup open.

## Focus management

- Initial focus: **not moved.** Opening a popover never moves focus, so a keyboard user who opened it with Enter stays on the trigger, and Tab goes into the popup, which is next in the DOM (render `Popover.Popup` right after `Popover.Trigger`). A popover whose first thing is a form can move focus itself, in an effect that runs after `open` has become `true` (the popup is hidden until then, so an earlier `focus()` does nothing). That is the consumer's choice, and it is the one case where the pattern asks for a move.
- Trap: no. The popup is non-modal: the page stays reachable, nothing is `inert`, Tab leaves the popup and leaves it open. A modal needs a Dialog.
- Restore to: the trigger, when the popup closes by Escape, `Popover.Close`, an outside press or a light dismiss **and** focus was inside the popup, on `body` (lost) or on the trigger. Focus is never taken from another control the user moved to, so pressing another button closes the popup and leaves that button focused. A press on the trigger leaves focus on the trigger.
- Never obscured by: the popup never covers its anchor (2.4.11), and it is placed inside the viewport with `padding`. It is in the top layer, so no sticky header covers it. A consumer with a sticky header keeps `scroll-padding` for the trigger.

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | none       |

Popover has no strings of its own and announces nothing: `aria-expanded` changes on the trigger tell a screen reader user what happened, and the focus move into the popup, which the user makes with Tab, reads the popup's name. The Close button's label is the consumer's, in the page's language.

## Consumer responsibilities

- **Name the popup.** Its role is `dialog`: give it `aria-label`, or `aria-labelledby` pointing at a heading inside it (4.1.2). A dev warning fires without one. Use the trigger's wording ("Om tjänsten") or a heading, never "popup".
- **Name the trigger** with visible text, or `aria-label` from your translations for an icon-only button (4.1.2, 2.5.3: the label in the name).
- **Render the Popup right after the Trigger,** in the same parent, so Tab goes from the trigger into the popup and back (2.4.3). The popup's place in the DOM is its place in the Tab order, wherever it is drawn.
- **Don't hide essential information in a popover that only opens on hover or focus.** This one opens on press. A hover or focus card is a Tooltip, with its own contract (1.4.13).
- **Provide a visible Close button** in a popup with a form or several controls. Escape and an outside press cover the rest, but touch and voice users need a target (2.5.1).
- **Keep the content light.** The popup is always rendered and the browser hides it while closed, so its content is in the DOM, with its ids, from the first render.
- **Controlled mode:** when `open` is yours, `onOpenChange(false)` is a request. If you keep it open, focus has still been returned to the trigger.
- Everything in `button.a11y.md` applies to the trigger and the Close button.

## Visual / modes

- Focus indicator: the trigger and the Close button are Buttons: the 2px ring with a 2px offset. The default theme draws the popup with a level 3 elevation, the `xl` radius and 8px padding (`DESIGN.md`).
- Target size: the trigger and Close are at least 44px high in comfortable density, 32px compact (2.5.8). Nothing in the popup is smaller.
- Colour: the popup's edge keeps 3:1 against the page (1.4.11) and its text 4.5:1 on its surface. In the default theme these pairs are in `theme:check` once the theme styles are added.
- forced-colors behaviour: the popup keeps a visible 1px `CanvasText` edge. Open state is shown by `aria-expanded`, never by colour alone.
- reduced-motion behaviour: no positional animation, ever. A fade is opacity only and is off under `prefers-reduced-motion`.
- Reflow: at 320px the popup is never wider than the viewport minus the padding, scrolls inside when it is too tall, and the page has no horizontal scroll (1.4.10).
- RTL: `start` and `end` placements follow the anchor's direction: `bottom-start` lines the popup's right edge with the trigger's in right-to-left text.

## WCAG SCs covered

- 1.3.1 Info and Relationships, 4.1.2 Name, Role, Value: the trigger's `aria-expanded`, `aria-controls` and `aria-haspopup`, and the popup's role and name.
- 1.3.2 Meaningful Sequence, 2.4.3 Focus Order: the popup follows the trigger in the DOM and the Tab order.
- 1.4.10 Reflow, 1.4.4 Resize Text: the popup is limited to the viewport and scrolls inside.
- 1.4.11 Non-text Contrast, 1.4.1 Use of Color: the edge, and state in `aria-expanded`.
- 2.1.1 Keyboard, 2.1.2 No Keyboard Trap, 2.1.4 Character Key Shortcuts: native button keys and Escape. Tab leaves. No shortcuts.
- 2.4.7 Focus Visible, 2.4.11 Focus Not Obscured: never covers the anchor, and sits in the top layer.
- 2.5.8 Target Size (Minimum): the 44px and 32px buttons.
- 3.2.1 On Focus, 3.2.2 On Input: opening needs a press, and nothing moves focus on its own.

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

Also pending, by hand: whether screen readers announce the popup's name when focus first enters it with Tab, and whether `popover="auto"` light dismiss and our own Escape and outside-press handling agree on Safari 17 and iOS.

## Known issues

- **Opening does not move focus,** so a screen reader user hears only "expanded" on the trigger and has to move on with Tab (or a virtual cursor key) to reach the popup. This is the disclosure pattern and is deliberate. A Dialog is the pattern for content that must take focus.
- **A closed popup's content is in the DOM,** hidden by the browser. A popup with a heavy subtree, or with ids that must be unique, is the consumer's to render conditionally.
- **No Safari 17 or iOS run yet.** `popover` light dismiss and the toggle event differ a little between browsers (Consequences). The Chromium baseline is green; the Safari rows wait for CI and the AT matrix.
- **The default theme does not style Popover yet.** The parts carry classes and `data-*` only (`kv-popover-trigger`, `kv-popover-popup`, `kv-popover-close`), plus the inline placement. A themed look follows with the design review of Plan 0022.
