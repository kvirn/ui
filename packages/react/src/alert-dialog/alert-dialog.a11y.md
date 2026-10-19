# Accessibility contract: AlertDialog (Root, Trigger, Popup, Title, Description, Body, Actions, Close)

- **APG pattern:** [Alert Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/), a [Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) for a message that needs an answer. It shares its hook, focus rules and layer behaviour with Dialog: see the [Dialog](/components/dialog) page for everything not listed here.
- **Deviations:** **Tab does not cycle inside the dialog**, as in Dialog: a native modal `<dialog>` lets Tab leave to browser UI before it wraps. Approved by the maintainer.
- **Native elements used:** `<dialog role="alertdialog">` (Popup), `<button>` (Trigger), `<h2>` (Title), `<p>` (Description), `<div>` (Body, Actions). Nothing for Root.
- **Status:** alpha candidate. Accessibility-reviewer APPROVE. Manual AT is `pending`.
- **Tests:** `alert-dialog.test.tsx` next to this file, and `../dialog/dialog.test.tsx` for the shared behaviour. `alert-dialog.stories.tsx` in `apps/storybook/src/components/alert-dialog/`.

An AlertDialog interrupts the user with a message that needs an answer: a confirm-before-delete, a session timeout warning. It starts on the safe or the primary action, it is read out together with its message, and **a press outside never dismisses it**. Escape runs the owner's cancel outcome, which must never be destructive. The dialog itself announces nothing: opening is read out because focus moves into it (the role, the name and the description). It hosts its own live regions for status inside it, because the page's are inert while it is open.

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
| `useAlertDialog`        | the same attributes, for your own elements     | as `useDialog`, with `role="alertdialog"` and no outside-press dismissal                                                               | `closeProps` is there for your own button and carries no `aria-label`: the button's text is its name. Options as the Root                                          |

Rules, tested in `alert-dialog.test.tsx` (the rest in `dialog.test.tsx`):

- **Role and description.** `role="alertdialog"`, with `aria-describedby` on the Description. An alert dialog without a Description warns in development: it is read out with its message.
- **Never dismissed by a press outside.** The layer still shields the layers below. A backdrop press and a touch lift do nothing, whatever the owner does.
- **Escape** is reported as `escape` to `onOpenChange`. The owner answers with the safe outcome, or keeps it open by not changing `open`.
- **Initial focus** is `initialFocusRef`: the least destructive action ("Keep draft"), or the primary one when nothing is destroyed ("Stay signed in"). **Without it focus starts on the Title, not the first control** (which may be the destructive one), and a development warning fires, because the first control would be chosen by chance.
- **Nesting.** An AlertDialog can open over a Dialog: Escape closes the AlertDialog first.
- **`as`.** `AlertDialog.Close` takes a component (`as={Button}`) that must render a button and spread its props on a DOM node; its props are plain props, merged with the part's. **Allowed elements:** Title, Description, Body and Actions take the same tags as the [Dialog](/components/dialog) parts (Title `h2` to `h6`, Description `p` or `div`, Body and Actions `div` or `section`); another tag warns once. `AlertDialog.Popup` (a native `<dialog>`) and `AlertDialog.Trigger` have no `as`.
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

- Initial focus: `initialFocusRef` (else the Title, never the first control), the least destructive action (a destructive confirm: "Keep draft") or the primary one ("Stay signed in" in a timeout warning). `AlertDialog.Close` is an ordinary action: it can be the initial focus.
- Trap: native, as Dialog. The page is `inert`, and Tab leaves to browser UI before it wraps (approved deviation).
- Restore to: `finalFocusRef`, the Trigger, the element focused before it opened, in that order, never `body`. See the Dialog page. A system-opened alert dialog (a timer) has no Trigger: pass `finalFocusRef`.
- Never obscured by: nothing is pinned, and long content scrolls inside the popup.

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | none       |

Opening is announced by the focus move: role "alertdialog", the name, and the description. The AlertDialog hosts its own live regions for in-dialog status (a timeout countdown once a minute, a failed action's error), because the provider's are inert while it is open.

## Consumer responsibilities

- **Title:** the question the buttons answer ("Do you want to delete the draft?"). Never "Are you sure?", "Warning" or "Confirm".
- **Description:** the consequence, and whether it can be undone, in one or two short sentences. Required.
- **Buttons:** verb and object ("Delete the draft", "Keep the draft"). The primary action first in the DOM. Never "OK", "Yes" or "No". Avoid "Cancel" when it could mean cancelling the whole application: say what is kept ("Keep the draft").
- **Set `initialFocusRef`** to the safe action when something is destroyed, or to the primary action when nothing is.
- **Escape must never destroy.** Answer `escape` with the cancel outcome.
- **Close it** with `AlertDialog.Close`, or from your own buttons by setting `open` to `false` (controlled). Move focus where the pattern says if the trigger is gone.
- **A timeout warning** gives the clock time and the minutes, says that answers are saved (2.2.1 Timing Adjustable, A), announces the countdown politely once a minute, and passes `finalFocusRef`.
- Everything on the [Button](/components/button) page applies to the buttons.

## Visual / modes

- Look: the same as the Dialog. On a narrow screen it is a sheet at the bottom, as wide as the screen. On a wider screen it is a centred box. The page behind is dimmed, and the backdrop only dims.
- Focus indicator: the trigger and the actions are Buttons, so they have the Button's focus ring (2.4.7 Focus Visible, AA). The Title shows the same ring after a keyboard open.
- Target size: the buttons are at least 24 × 24 CSS px, and taller in the default theme (2.5.8 Target Size (Minimum), AA).
- Colour: the dialog's text has at least 4.5:1 contrast on its surface (1.4.3 Contrast (Minimum), AA). A destructive confirm is a danger button with the words carrying the risk, never colour alone (1.4.1 Use of Color, A).
- forced-colors behaviour (Windows contrast themes): the dialog keeps a visible edge in the system text colour on all sides, so the open state is never shown by colour alone. The forced-colours sweep checks that every part keeps a visible boundary and shows a focus indicator when it has focus (1.4.11).
- reduced-motion behaviour: opening fades in only when the user allows motion. Closing is always instant, so focus returns at once.
- Reflow: no fixed width or height. At 320 CSS px and 400% zoom it needs no horizontal scrolling, and it scrolls inside when it is too tall (1.4.10 Reflow, AA). The reflow sweep runs every story at 320 CSS px and fails on horizontal overflow; 400% zoom is reviewed in the stories.
- Text spacing (1.4.12 Text Spacing, AA): the text-spacing sweep applies the spacing to every story and fails on a box that clips its content.
- RTL: logical properties only. The actions start at the inline start.

## WCAG SCs covered

- 1.3.1 Info and Relationships (A) and 4.1.2 Name, Role, Value (A): the role `alertdialog`, the name from the Title and the description (`alert-dialog.test.tsx › an open alert dialog is modal, has role alertdialog, a name, a description and no axe violations`).
- 1.4.10 Reflow (AA): the sheet and the scroll inside it (the reflow sweep runs every story at 320 CSS px and fails on horizontal overflow).
- 1.4.12 Text Spacing (AA): the text-spacing sweep applies the spacing to every story and fails on a box that clips its content.
- 2.1.1 Keyboard (A), 2.1.2 No Keyboard Trap (A) and 2.4.3 Focus Order (A): native keys and Escape, Tab can always leave to the browser, and focus goes in on open and back on close (`alert-dialog.test.tsx › Escape reports escape, closes the alert dialog and returns focus to the trigger`).
- 2.2.1 Timing Adjustable (A): for a timeout warning. This is the consumer's block, see Consumer responsibilities.
- 2.4.7 Focus Visible (AA) and 2.4.11 Focus Not Obscured (Minimum) (AA): the buttons' focus ring, and nothing is pinned, so nothing covers the focused control.
- 2.5.8 Target Size (Minimum) (AA): the buttons are at least 24 × 24 CSS px.
- 3.3.4 Error Prevention (Legal, Financial, Data) (AA): a confirm step before an irreversible action. It helps a page meet this criterion, and whether the page does depends on your flow.
- 4.1.3 Status Messages (AA): the dialog's own live regions (`alert-dialog.test.tsx › a component inside announces in the alert dialog’s own live region`).

## AT test record

| AT + browser + OS                                                          | Agent check | Human check | Result  | Notes                                                                                                                                                      |
| -------------------------------------------------------------------------- | ----------- | ----------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Automated (re-runnable tests)**                                          |             |             |         |                                                                                                                                                            |
| axe, WCAG 2.2 A and AA, every story, 4 themes                              | pass        | n/a         | pass    | alert-dialog.stories.tsx, every story, 4 themes                                                                                                            |
| Markup and ARIA (roles, names, ids, states)                                | pass        | n/a         | pass    | `alert-dialog.test.tsx` (axe and role, name and state): `an open alert dialog is modal, has role alertdialog, a name, a description and no axe violations` |
| Keyboard contract rows (Vitest browser)                                    | pass        | n/a         | pass    | 11 rows, each names a test in `alert-dialog.test.tsx`                                                                                                      |
| Focus order and management                                                 | pass        | n/a         | pass    | `alert-dialog.test.tsx`: `initial focus is initialFocusRef, the safe action, not the first control`                                                        |
| Display modes (forced colours, 320px reflow, text spacing, reduced motion) | pass        | n/a         | pass    | the four sweep projects (`storybook-forced-colors`, `-reduced-motion`, `-reflow`, `-text-spacing`), run in CI                                              |
| **Core (required for beta)**                                               |             |             |         |                                                                                                                                                            |
| NVDA + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                                                                            |
| VoiceOver + Safari + iOS                                                   | pending     | pending     | pending |                                                                                                                                                            |
| **Release (before 1.0 and each minor)**                                    |             |             |         |                                                                                                                                                            |
| JAWS + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                                                                            |
| TalkBack + Chrome + Android                                                | pending     | pending     | pending |                                                                                                                                                            |
| VoiceOver + Safari + macOS                                                 | pending     | pending     | pending |                                                                                                                                                            |

Also pending, by hand: whether `aria-haspopup="dialog"` on an alert dialog's trigger is the best token, and whether the description is read out with the name on every screen reader.

### What to check

With a screen reader and the keyboard, try:

- Open the alert dialog: focus is on the safe action, and the title and the description are read.
- Escape closes it with the safe outcome.
- A tap on the backdrop does nothing.
- Over a Dialog, Escape closes only the alert dialog.

## Known issues

- **A Close without text has no name.** `AlertDialog.Close` has no default name, because there is no X on an alert dialog. A screen reader user hears only "button" if you leave it empty. Always give it text that says what it does. A development warning fires without a name.
- **Tab can reach the browser's own controls.** Tab leaves the dialog to the browser (the address bar, for example) before it comes round to the first control again. This is an approved difference from the ARIA Authoring Practices pattern. The dialog's own live region exists only while it is open, as in the Dialog.
