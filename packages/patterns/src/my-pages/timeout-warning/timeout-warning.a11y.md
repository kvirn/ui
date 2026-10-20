# Accessibility contract: Timeout warning

- **APG pattern:** none: composes AlertDialog ([APG Alert and Message Dialogs](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/)).
- **Deviations:** none
- **Native elements used:** `<dialog>` (`AlertDialog`), `<button>`.
- **Tests:** a recipe adds no behaviour of its own, so the Keyboard rows name no test of their own: each part's keys are proved by its component's tests. Axe runs on every story in `timeout-warning.stories.tsx` (`apps/storybook/src/patterns/my-pages/`).

## Roles, states, properties

| Part                      | Element / role             | ARIA / state                                            | Notes                                                              |
| ------------------------- | -------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------ |
| `AlertDialog.Popup`       | `<dialog>` / `alertdialog` | modal; named by the title, described by the description | No trigger; `finalFocusRef` returns focus to where the user was    |
| `AlertDialog.Title`       | heading                    | names the dialog                                        | "You will be signed out soon"                                      |
| `AlertDialog.Description` | text                       | describes the dialog                                    | The time left in words, rewritten once a minute; not a live region |
| "Stay signed in"          | `<button>`                 | none                                                    | Primary, initial focus; Enter extends the session                  |
| "Sign out"                | `<button>`                 | none                                                    | Leaves safely                                                      |

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key           | Context       | Action                                                  | Test           |
| ------------- | ------------- | ------------------------------------------------------- | -------------- |
| Tab           | in the dialog | Moves to the next tabbable element inside, in DOM order | Keyboard story |
| Shift+Tab     | in the dialog | Moves to the previous one                               | Keyboard story |
| Enter / Space | on a button   | Stays signed in, or signs out (native)                  | Keyboard story |
| Escape        | in the dialog | Closes it and stays signed in. Never signs the user out | Keyboard story |

Keys are those of AlertDialog; a press outside never signs the user out.

## Focus management

- Initial focus: "Stay signed in".
- Trap: native modal `<dialog>`, as AlertDialog; the page behind is `inert`.
- Restore to: where the user was, through `finalFocusRef`.
- Never obscured by: nothing (nothing is sticky).

## Announcements

The dialog is read when it opens, with the time left in the description. The description is rewritten once a minute and never counts seconds. With one minute left the page announces once, politely, through the dialog's own announcer (the provider's is inert while the modal is open): "One minute left until you are signed out".

## Consumer responsibilities

- Open it two minutes before the session ends, and own the interval and the sign-out.
- Extend the session with one action: "Stay signed in".
- On expiry, close the dialog and land on the Session ended page, which says whether the answers were saved.

## Visual / modes

- Focus indicator: the token ring on every link, button and control.
- Target size: at least 24px (2.5.8).
- forced-colors behaviour: borders and the status words stay; links are `LinkText`.
- reduced-motion behaviour: nothing animates.
- RTL: logical properties; the layout follows the writing direction.
- 320px / 400% zoom: one column, everything wraps, nothing scrolls sideways.

## WCAG SCs covered

2.1.1, 2.2.1, 2.4.3, 3.2.2, 4.1.2, 4.1.3.

- 2.1.1 Keyboard (A)
- 2.2.1 Timing Adjustable (A)
- 2.4.3 Focus Order (A)
- 3.2.2 On Input (A)
- 4.1.2 Name, Role, Value (A)
- 4.1.3 Status Messages (AA)

## AT test record

| AT + browser + OS                       | Agent check | Human check | Result  | Notes |
| --------------------------------------- | ----------- | ----------- | ------- | ----- |
| **Core (required for beta)**            |             |             |         |       |
| NVDA + Chrome + Windows                 | pending     | pending     | pending |       |
| VoiceOver + Safari + iOS                | pending     | pending     | pending |       |
| **Release (before 1.0 and each minor)** |             |             |         |       |
| JAWS + Chrome + Windows                 | pending     | pending     | pending |       |
| TalkBack + Chrome + Android             | pending     | pending     | pending |       |
| VoiceOver + Safari + macOS              | pending     | pending     | pending |       |

## Known issues

- none
