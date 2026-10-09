# Accessibility contract: Dialog (Root, Trigger, Popup, Title, Description, Body, Actions, Close)

- **APG pattern:** [Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/). The popup is a native `<dialog>` opened with `showModal()`: the browser puts it in the top layer and makes the page behind it `inert`.
- **Deviations:** **Tab does not cycle inside the dialog.** A native modal `<dialog>` lets Tab leave to the browser's own UI (the address bar) before it wraps, where the APG cycles inside. Approved by the maintainer on 2026-10-06 (keyboard skill). WCAG 2.1.2 holds: focus is never trapped, and the page behind is inert. Everything else follows the APG.
- **Native elements used:** `<dialog>` (Popup), `<button>` (Trigger, Close), `<h2>` (Title), `<p>` (Description), `<div>` (Body, Actions). Nothing for Root: it renders no element.
- **Status:** alpha candidate (Plan 0067). Manual AT is `pending`.
- **Tests:** `dialog.test.tsx` next to this file, `../popup/use-dismissable-layer.test.tsx` (the `backdrop` option) and `@kvirn-ui/core` `scroll-lock.test.ts`. `dialog.stories.tsx` in `apps/storybook/src/components/dialog/`.

A Dialog is a window on top of the page that asks for the user's attention: a form, a short read, a decision. The page behind it cannot be reached with the keyboard or a screen reader, Escape and a Close button close it, focus moves in when it opens and returns to where it was when it closes, and the page does not scroll behind it. The consumer owns the markup inside. For a message that needs an answer, use an AlertDialog.

## Roles, states, properties

| Part               | Element / role                             | ARIA / state                                                                                                                                                     | Notes                                                                                                                                                                                                                        |
| ------------------ | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dialog.Root        | none: it renders no element                | none                                                                                                                                                             | Owns the open state: `open` / `defaultOpen` / `onOpenChange(open, { reason, event })`, `initialFocusRef`, `finalFocusRef`, `dismissOnOutsidePress` (default `false`), `messages`. Provides the dialog's own announcer        |
| Dialog.Trigger     | `<button type="button">`, optional         | `aria-haspopup="dialog"`, `data-open` while open. No `aria-expanded` and no `aria-controls`: the trigger is inert while the dialog is open                       | Class `kv-dialog-trigger`. Where focus returns to                                                                                                                                                                            |
| Dialog.Popup       | `<dialog role="dialog">`, always rendered  | `aria-modal="true"` while open, `aria-labelledby` the Title and `aria-describedby` the Description, each **only while that part exists**. `data-open` while open | Class `kv-dialog`. Shown with `showModal()`. Its children stay mounted while it is closed: the browser hides and inerts them, and typed values are kept. Without a Title, give it `aria-label`. Closed, the browser hides it |
| Dialog.Title       | `<h2 tabindex="-1">` (`as` sets the level) | none. It is the popup's name                                                                                                                                     | Class `kv-dialog-title`. Takes focus on open when nothing in the dialog is a better start. Never a Tab stop                                                                                                                  |
| Dialog.Description | `<p>`                                      | none. It is the popup's description                                                                                                                              | Class `kv-dialog-description`. Optional for a Dialog, one or two short sentences                                                                                                                                             |
| Dialog.Body        | `<div>`                                    | none                                                                                                                                                             | Class `kv-dialog-body`. Fields, prose or an Alert. Never the description                                                                                                                                                     |
| Dialog.Actions     | `<div>`                                    | none                                                                                                                                                             | Class `kv-dialog-actions`. The consumer's buttons, the primary one first                                                                                                                                                     |
| Dialog.Close       | `<button type="button">`                   | `aria-label` from `dialog.close` when it has no visible text. Visible text names it otherwise                                                                    | Class `kv-dialog-close`. Place it after the Title in the DOM. Closes with reason `close-press`                                                                                                                               |
| `useDialog`        | the same attributes, for your own elements | `isOpen`, `triggerProps`, `popupProps`, `titleProps`, `descriptionProps`, `closeProps`, `registerTitle()`, `registerDescription()`                               | Options as the Root. The refs are in the props: `mergeProps` merges yours. A closed `<dialog>` hides its children, so they can stay mounted                                                                                  |

Rules, tested in `dialog.test.tsx`:

- **Native modal.** The popup is shown with `showModal()` when `open` becomes true and closed with `close()` when it becomes false, in a layout effect, so the first paint is right. `:modal` matches while open. The page behind is inert for focus, pointer and assistive technology. Nothing is portalled: the dialog is in the top layer wherever it is in the tree.
- **State and the browser.** `cancel` (a close request nobody handled) is prevented and reported as `escape`. `close` (the browser closed it, for example a `<form method="dialog">`) is reported as `native-close`. When a controlled owner keeps `open` true after either, the dialog is shown again. A `close` the hook caused itself is never reported.
- **Nested roots.** A Dialog or AlertDialog inside another's **Popup** is closed whenever its parent is (its uncontrolled state is reset, and its `close()` runs first), so closing the outer one from state also releases the inner one's scroll lock and leaves the page reachable. A controlled inner owner whose `open` stays true is shown again when the parent opens again, always after the parent (so it is the topmost modal, holds focus and closes first on Escape): set its `open` to `false` if it should not. A Root next to the Popup, inside the outer Root, is not nested. Only `Dialog.Popup` passes the parent on: **with `useDialog` alone there is no parent**, so a nested hook-only dialog stays modal when its parent closes from state: close it yourself, and do not open it in the same commit as its parent (passive effects run child-first, so the inner layer would join the stack before the outer: Escape would close the outer while the inner stays modal).
- **Reasons** in `onOpenChange(open, { reason, event })`: `trigger-press`, `close-press`, `escape`, `outside-press`, `native-close`.
- **Layers.** The popup is a layer in the page's dismissable stack. Escape closes the innermost layer only: a Popover, Listbox or Combobox inside closes first, and so does a nested dialog. A press on the backdrop (the dialog element itself, outside its box) counts as outside, and closes the dialog only with `dismissOnOutsidePress`. Either way the layers below do not react.
- **Scroll lock.** While open, `data-kv-scroll-locked` is on `<html>`, ref-counted across dialogs (nested dialogs lock once). The hook sets no inline style: `@kvirn-ui/theme` turns the attribute into `overflow: hidden`. Without the theme, add your own CSS.
- **Announcements.** The provider's live regions are inert while a modal is open. Root provides its own announcer and Popup renders its live regions last, while open, so a Combobox, Table or FileUpload inside still announces. The dialog announces nothing itself: opening is announced by the focus move.
- **Server rendering.** `defaultOpen` writes a closed `<dialog>` with its content, and an effect calls `showModal()`. Nothing reads `window` while rendering.
- **`as`.** `Dialog.Close` takes a component (`as={Button}`) that must render a button and spread its props on a DOM node; its props are plain props, merged with the part's (handlers chain, `className` joins, refs merge). **Allowed elements:** Title `h2` (default) to `h6`; Description `p` (default) or `div`; Body and Actions `div` (default) or `section`; another tag warns once (`as-not-allowed`) and falls back. `Dialog.Popup` is a native `<dialog>` and `Dialog.Trigger` a `<button>`: neither has `as`. Class, handlers and refs merge on every part.
- **Dev warnings:** no accessible name (`dialog-without-name`), a part outside a Root (`dialog-<part>-outside-root`), no element could take focus back (`dialog-return-focus-lost`).

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key             | Context                                               | Action                                                                                                                                                             | Test                                                                                                                                                                                                            |
| --------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tab             | before the trigger                                    | Moves focus to the trigger. The trigger is one stop                                                                                                                | `dialog.test.tsx › Tab focuses the trigger, and is one stop`                                                                                                                                                    |
| Shift+Tab       | on the trigger                                        | Moves focus to the previous focusable element                                                                                                                      | `dialog.test.tsx › Shift+Tab leaves the trigger backwards`                                                                                                                                                      |
| Enter / Space   | on the trigger                                        | Opens the dialog. Focus moves to `initialFocusRef`, else the first tabbable that is not Close, else the title                                                      | `dialog.test.tsx › Enter and Space on the trigger open the dialog`, `dialog.test.tsx › opening moves focus to initialFocusRef`, `dialog.test.tsx › opening moves focus to the first tabbable that is not Close` |
| Tab / Shift+Tab | inside the dialog                                     | Moves to the next or previous tabbable element inside, in DOM order. At either end focus leaves to the browser's own UI and wraps (native; the approved deviation) | `dialog.test.tsx › Tab and Shift+Tab move between the tabbable elements inside, in DOM order`                                                                                                                   |
| Tab / Shift+Tab | any                                                   | The page behind the dialog is never reached: it is `inert`                                                                                                         | `dialog.test.tsx › Tab and Shift+Tab never reach the page behind the dialog`                                                                                                                                    |
| Escape          | inside the dialog, no other layer open                | Closes the dialog with reason `escape` and returns focus. A controlled owner can refuse                                                                            | `dialog.test.tsx › Escape closes the dialog and returns focus to the trigger`, `dialog.test.tsx › a controlled owner that refuses keeps the dialog open after Escape`                                           |
| Escape          | a Popover, Listbox or Combobox open inside the dialog | Closes that layer only. The next Escape closes the dialog                                                                                                          | `dialog.test.tsx › Escape closes a Popover inside first, then the dialog`                                                                                                                                       |
| Escape          | nested dialogs                                        | Closes the innermost only. Focus returns to the trigger that opened it                                                                                             | `dialog.test.tsx › Escape closes the innermost of nested dialogs only`                                                                                                                                          |
| Enter / Space   | on Close                                              | Closes the dialog with reason `close-press` and returns focus                                                                                                      | `dialog.test.tsx › Enter and Space on Close close the dialog with reason close-press, and focus returns`                                                                                                        |
| Enter           | in a text field in a form                             | Native: submits the form. The dialog does not take the key                                                                                                         | `dialog.test.tsx › Enter in a text field submits the form and is not taken`                                                                                                                                     |
| Pointer press   | on the backdrop, with `dismissOnOutsidePress`         | Closes the dialog with reason `outside-press`. A touch press counts when the finger lifts                                                                          | `dialog.test.tsx › a press on the backdrop closes the dialog with dismissOnOutsidePress, and touch counts when the finger lifts`                                                                                |
| Pointer press   | on the backdrop, by default                           | Nothing: a stray tap or a tremor must not lose what someone typed                                                                                                  | `dialog.test.tsx › a press on the backdrop does nothing by default`                                                                                                                                             |
| Pointer press   | inside the dialog                                     | Nothing                                                                                                                                                            | `dialog.test.tsx › a press inside the dialog does nothing`                                                                                                                                                      |

The dialog handles no other key. Arrow keys, Home, End, Page Up and Page Down are the content's own (a field, a list, native scrolling of a long dialog), and the component prevents none of them. Escape is read on the document, after the page's handlers: a handler that calls `preventDefault()` on it keeps the dialog open.

## Focus management

- Initial focus: `initialFocusRef` if given, else the first tabbable element that is not a Close (any number of `Dialog.Close` parts are skipped), else the Title (`tabindex="-1"`), so a dialog that is mostly reading starts at its beginning and the arrow keys scroll it. Never a Close button and never the popup itself. The browser's own choice is replaced: engines differ.
- Trap: native. The page behind is `inert`, so Tab cannot reach it. Tab leaves to browser UI before wrapping (approved deviation above), so there is no keyboard trap (2.1.2).
- Restore to, in order: `finalFocusRef`, the Trigger if it is still in the document, the element that had focus before the dialog opened if it is still in the document, and last the invoker (`[aria-controls]`) of the popup that element was in (a Menu item that opened the dialog, once the menu has hidden). Each only if it takes focus. **Never `body`:** when none does, a development warning (`dialog-return-focus-lost`) names the problem, and the consumer passes `finalFocusRef` or renders a Trigger. Focus is returned only when it was inside the dialog, or lost to `body` after it had been inside (or the dialog had an opener): a dialog closed before focus ever entered it, with nothing focused when it opened, leaves focus alone. Focus the consumer moved elsewhere is kept.
- Never obscured by: nothing inside is sticky or pinned, and a long dialog scrolls inside the popup (2.4.11). A consumer with a sticky header on a page keeps `scroll-padding` for the trigger.

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | none       |

Opening is announced by the focus move: the screen reader reads the role and the name, and the description if there is one. The Dialog announces nothing itself. It hosts its own polite and assertive live regions for what is inside (a Combobox's result count, a failed action's error), because the provider's are inert while a modal is open. `dialog.close` is the only string: the name of an icon-only Close.

## Consumer responsibilities

- **Name the dialog:** a `Dialog.Title` (the question the buttons answer, or a verb phrase for a task: never "Are you sure?"), or `aria-label`. A development warning fires without one (4.1.2).
- **Say what each button does** with verb and object ("Spara numret"), never "OK" or "Ja". One primary action, first in the DOM.
- **Give a Trigger, or `finalFocusRef`.** A dialog opened by a timer, with focus on `body`, has nowhere to return to.
- **Keep what was typed.** The content stays mounted while the dialog is closed, so closing with Escape or Close does not clear uncontrolled fields (3.3.7); render the whole `Dialog.Root` conditionally to start fresh. A backdrop press does nothing by default, so no one loses input by accident.
- **Opening on page load is for system messages only** (a session timeout, B25). Use a page for a multi-step form or long reading.
- **Scroll lock needs CSS.** `@kvirn-ui/theme` styles `html[data-kv-scroll-locked]`. A headless user adds `overflow: hidden` for it.
- **Render the Dialog outside a page `<form>`.** The content stays mounted while closed, so a Popup inside a form keeps its fields in that form: a `required` or invalid field in the closed dialog silently blocks the page form's submit (3.3.1). Render the Dialog outside the form, or render its own `<form>` conditionally.
- **Don't move a popup out of the dialog's DOM.** A Popover or Dialog opened inside it must stay in its subtree, or it is inert.
- Everything in `button.a11y.md` applies to the trigger and the Close button.

## Visual / modes

- Focus indicator: the trigger, Close and the actions are Buttons: the 2px ring with a 2px offset. The Title shows the same ring after a keyboard open.
- Target size: Close and the actions are at least 44px in comfortable density, 32px compact, never under 24px (2.5.8).
- Colour: the dialog's text keeps 4.5:1 on its surface (in `theme:check`). The edge is decorative, not a control boundary, so 1.4.11 asks nothing of it (design spec Q3). The backdrop only dims.
- forced-colors behaviour: the dialog keeps a 1px `CanvasText` edge on all sides. Open state is never shown by colour alone.
- reduced-motion behaviour: opening fades in only without `prefers-reduced-motion: reduce`. Closing is always instant, so focus returns at once.
- Reflow: below 40rem the dialog is a sheet at the block end, full inline size, with no fixed width or height. At 320px and 400% zoom it needs no horizontal scroll and scrolls inside when it is too tall (1.4.10).
- RTL: logical properties only. Close sits at the inline end and the actions start at the inline start.

## WCAG SCs covered

- 1.3.1 Info and Relationships, 4.1.2 Name, Role, Value: the role, `aria-modal`, the name from the Title and the description.
- 1.3.2 Meaningful Sequence, 2.4.3 Focus Order: Close after the Title, the actions in DOM order, focus in on open and back on close.
- 1.4.10 Reflow, 1.4.4 Resize Text: the sheet and the inside scroll.
- 2.1.1 Keyboard, 2.1.2 No Keyboard Trap, 2.1.4 Character Key Shortcuts: native button keys and Escape. No shortcuts. Tab leaves to browser UI.
- 2.4.7 Focus Visible, 2.4.11 Focus Not Obscured: nothing pinned.
- 2.5.8 Target Size (Minimum): the 44px and 32px buttons.
- 3.2.1 On Focus, 3.2.2 On Input: opening needs a press, and typing never moves focus.
- 4.1.3 Status Messages: the dialog's own live regions.

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

Also pending, by hand: whether the dialog's own live region is announced when a message arrives in the first moments after opening (it exists only while open), whether the focus move reads the name and description on every screen reader, and a second Escape without a user gesture on Safari 17 and Chromium (the `close` handler and the re-show cover it).

## Known issues

- **Tab leaves to browser UI** before it wraps (approved deviation). A user who expects the APG cycle needs one more Tab.
- **The own live region exists only while open,** so a message in the first moments may be missed. The manual AT matrix tests it.
- **No Safari 17 or iOS run yet.** `showModal()` focus differs between engines, so an effect sets focus explicitly. The Chromium baseline is green.
- **A closed dialog's content is in the DOM** (hidden and inert, with its ids from the first render, which must be unique on the page). A dialog that unmounts while open does not return focus: the trigger usually goes with it.
- **`aria-labelledby` and `aria-describedby` appear after the first client render** because the parts register in effects. On the server, the markup has neither.
