# Accessibility contract: AlertDialog (Root, Trigger, Popup, Title, Description, Body, Actions, Close)

- **APG pattern:** [Alert Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/), a [Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) for a message that needs an answer. It shares its hook, focus rules and layer behaviour with Dialog: read [dialog.a11y.md](../dialog/dialog.a11y.md) for everything not listed here.
- **Deviations:** **Tab does not cycle inside the dialog**, as in Dialog: a native modal `<dialog>` lets Tab leave to browser UI before it wraps. Approved by the maintainer on 2026-10-06 (keyboard skill).
- **Native elements used:** `<dialog role="alertdialog">` (Popup), `<button>` (Trigger), `<h2>` (Title), `<p>` (Description), `<div>` (Body, Actions). Nothing for Root.
- **Status:** alpha candidate (Plan 0067). Manual AT is `pending`.
- **Tests:** `alert-dialog.test.tsx` next to this file, and `../dialog/dialog.test.tsx` for the shared behaviour. `alert-dialog.stories.tsx` in `apps/storybook/src/components/alert-dialog/`.

An AlertDialog interrupts the user with a message that needs an answer: a confirm-before-delete, a session timeout warning. It starts on the safe or the primary action, it is read out together with its message, and **a press outside never dismisses it**. Escape runs the owner's cancel outcome, which must never be destructive.

## Roles, states, properties

| Part                    | Element / role                                 | ARIA / state                                                                                                                           | Notes                                                                                                                                                              |
| ----------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AlertDialog.Root        | none: it renders no element                    | none                                                                                                                                   | `open` / `defaultOpen` / `onOpenChange(open, { reason, event })`, `initialFocusRef`, `finalFocusRef`, `messages`. No `dismissOnOutsidePress`: it is always `false` |
| AlertDialog.Trigger     | `<button type="button">`, optional             | `aria-haspopup="dialog"`, `data-open` while open                                                                                       | Classes `kv-dialog-trigger` and `kv-alert-dialog-trigger`. `dialog` is the closest valid `aria-haspopup` token                                                     |
| AlertDialog.Popup       | `<dialog role="alertdialog">`, always rendered | `aria-modal="true"` while open, `aria-labelledby` the Title, `aria-describedby` the Description (**required**). `data-open` while open | Classes `kv-dialog` and `kv-alert-dialog`. Its children stay mounted while it is closed                                                                            |
| AlertDialog.Title       | `<h2 tabindex="-1">`                           | none. It is the popup's name                                                                                                           | Classes `kv-dialog-title` and `kv-alert-dialog-title`                                                                                                              |
| AlertDialog.Description | `<p>`                                          | none. It is the popup's description, read out with the title                                                                           | Classes `kv-dialog-description` and `kv-alert-dialog-description`. The consequence, and whether it can be undone                                                   |
| AlertDialog.Body        | `<div>`                                        | none                                                                                                                                   | Classes `kv-dialog-body` and `kv-alert-dialog-body`                                                                                                                |
| AlertDialog.Actions     | `<div>`                                        | none                                                                                                                                   | Classes `kv-dialog-actions` and `kv-alert-dialog-actions`. The consumer's buttons, or `AlertDialog.Close`                                                          |
| AlertDialog.Close       | `<button type="button">`                       | none of its own. **Children are its name**                                                                                             | Class `kv-alert-dialog-close`. A plain button: no icon, no default text. Closes with reason `close-press`. The consumer styles it                                  |
| `useAlertDialog`        | the same attributes, for your own elements     | as `useDialog`, with `role="alertdialog"` and no outside-press dismissal                                                               | `closeProps` is there for your own button. Options as the Root                                                                                                     |

Rules, tested in `alert-dialog.test.tsx` (the rest in `dialog.test.tsx`):

- **Role and description.** `role="alertdialog"`, with `aria-describedby` on the Description. An alert dialog without a Description warns (`alert-dialog-without-description`): it is read out with its message.
- **Never dismissed by a press outside.** The layer still shields the layers below. A backdrop press and a touch lift do nothing, whatever the owner does.
- **Escape** is reported as `escape` to `onOpenChange`. The owner answers with the safe outcome, or keeps it open by not changing `open`.
- **Initial focus** is `initialFocusRef`: the least destructive action ("Keep draft"), or the primary one when nothing is destroyed ("Stay signed in"). **Without it focus starts on the Title, not the first control** (which may be the destructive one), and a development warning fires (`alert-dialog-without-initial-focus`), because the first control would be chosen by chance.
- **Nesting.** An AlertDialog can open over a Dialog: Escape closes the AlertDialog first.
- **Dev warnings:** no Description, no `initialFocusRef`, no name, an `AlertDialog.Close` with no name, and the shared ones (a part outside a Root, no place for focus to return).

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key             | Context                       | Action                                                                                                                                           | Test                                                                                                                                                                                                                         |
| --------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tab             | before the trigger            | Moves focus to the trigger. The trigger is one stop                                                                                              | `alert-dialog.test.tsx › Tab focuses the trigger, and is one stop`                                                                                                                                                           |
| Shift+Tab       | on the trigger                | Moves focus to the previous focusable element                                                                                                    | `alert-dialog.test.tsx › Shift+Tab leaves the trigger backwards`                                                                                                                                                             |
| Enter / Space   | on the trigger                | Opens the alert dialog. Focus moves to `initialFocusRef`, the safe or primary action, else the Title                                             | `alert-dialog.test.tsx › Enter and Space on the trigger open it, and focus starts on initialFocusRef`, `alert-dialog.test.tsx › initial focus is initialFocusRef, the safe action, not the first control`                    |
| Tab / Shift+Tab | inside                        | Moves to the next or previous tabbable element inside, in DOM order. At either end focus leaves to browser UI and wraps (the approved deviation) | `alert-dialog.test.tsx › Tab and Shift+Tab move between the tabbable elements inside, in DOM order`                                                                                                                          |
| Tab / Shift+Tab | any                           | The page behind is never reached: it is `inert`                                                                                                  | `alert-dialog.test.tsx › Tab and Shift+Tab never reach the page behind the dialog`                                                                                                                                           |
| Escape          | inside, no other layer open   | Reports `escape`. The owner closes it with the safe outcome, and focus returns, or refuses and it stays open                                     | `alert-dialog.test.tsx › Escape reports escape, closes the alert dialog and returns focus to the trigger`, `alert-dialog.test.tsx › Escape that the owner refuses keeps the alert dialog open`                               |
| Escape          | an alert dialog over a dialog | Closes the alert dialog only. The next Escape closes the dialog                                                                                  | `alert-dialog.test.tsx › Escape closes an alert dialog over a dialog first, then the dialog`                                                                                                                                 |
| Enter / Space   | on Close                      | Closes with reason `close-press` and returns focus. A controlled owner can refuse                                                                | `alert-dialog.test.tsx › Enter and Space on Close close the alert dialog with reason close-press, and focus returns`, `alert-dialog.test.tsx › a controlled owner may refuse a Close press, and the alert dialog stays open` |
| Enter / Space   | on an action                  | The button's own: the owner closes the dialog from it                                                                                            | `alert-dialog.test.tsx › Enter and Space on an action are the button’s own, and the consumer closes it`                                                                                                                      |
| Pointer press   | on the backdrop               | Nothing, ever. A touch lift does nothing either                                                                                                  | `alert-dialog.test.tsx › a press on the backdrop never closes an alert dialog`                                                                                                                                               |
| Pointer press   | inside                        | Nothing                                                                                                                                          | `alert-dialog.test.tsx › a press inside the alert dialog does nothing`                                                                                                                                                       |

The alert dialog handles no other key. Escape is read on the document, after the page's handlers.

## Focus management

- Initial focus: `initialFocusRef` (else the Title, never the first control), the least destructive action (a destructive confirm: "Keep draft") or the primary one (B25: "Stay signed in"). `AlertDialog.Close` is an ordinary action: it can be the initial focus.
- Trap: native, as Dialog. The page is `inert`, and Tab leaves to browser UI before it wraps (approved deviation).
- Restore to: `finalFocusRef`, the Trigger, the element focused before it opened, in that order, never `body`. See dialog.a11y.md. A system-opened alert dialog (a timer) has no Trigger: pass `finalFocusRef`.
- Never obscured by: nothing is pinned, and long content scrolls inside the popup.

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | none       |

Opening is announced by the focus move: role "alertdialog", the name, and the description. The AlertDialog hosts its own live regions for in-dialog status (a B25 countdown once a minute, a failed action's error), because the provider's are inert while it is open.

## Consumer responsibilities

- **Title:** the question the buttons answer ("Vill du ta bort utkastet?"). Never "Are you sure?", "Warning" or "Confirm".
- **Description:** the consequence, and whether it can be undone, in one or two short sentences. Required.
- **Buttons:** verb and object ("Ta bort utkastet", "Behåll utkastet"). The primary action first in the DOM. Never "OK", "Ja" or "Nej".
- **Set `initialFocusRef`** to the safe action when something is destroyed, or to the primary action when nothing is.
- **Escape must never destroy.** Answer `escape` with the cancel outcome.
- **Close it** with `AlertDialog.Close`, or from your own buttons by setting `open` to `false` (controlled). Move focus where the pattern says if the trigger is gone.
- **A timeout warning (B25)** gives the clock time and the minutes, says that answers are saved (2.2.1), announces the countdown politely once a minute, and passes `finalFocusRef`.
- Everything in `button.a11y.md` applies to the buttons.

## Visual / modes

As Dialog: the shared `kv-dialog*` classes carry the look, and the `kv-alert-dialog*` classes are hooks only. A destructive confirm is a `kv-button--danger` with the words carrying the risk, never colour alone.

## WCAG SCs covered

- 1.3.1, 4.1.2: the role `alertdialog`, the name and the description.
- 2.1.1, 2.1.2, 2.4.3: native keys and Escape, no trap, focus in and back.
- 2.2.1 Timing Adjustable: for the timeout warning, the consumer's block.
- 3.3.4 Error Prevention: a confirm step before an irreversible action.
- 4.1.3: the dialog's own live regions.
- The rest as dialog.a11y.md.

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

Also pending, by hand: whether `aria-haspopup="dialog"` on an alert dialog's trigger is the best token, and whether the description is read out with the name on every screen reader.

## Known issues

- **`AlertDialog.Close` has no default name.** Its children are required: there is no X on an alert dialog.
- Tab leaves to browser UI before it wraps (approved deviation), and the own live region exists only while open, as Dialog.
