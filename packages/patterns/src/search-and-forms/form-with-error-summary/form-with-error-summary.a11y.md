# Accessibility contract: Form with error summary

- **APG pattern:** none: native elements, composed from shipped parts.
- **Deviations:** none
- **Native elements used:** `<a href>` back link, `<h1>`, `<form noValidate>`, `<input>`, `<textarea>`, `<fieldset>` / `<legend>` with radios, `<button>`, `ErrorSummary`, `Alert`.
- **Status:** in progress (plan 0095 T5). A recipe: the story is the code, there is no package code. Reviewer and manual AT are `pending`.
- **Tests:** a recipe adds no behaviour of its own, so the Keyboard rows name no test of their own: each part's keys are proved by its component's tests. Axe runs on every story in `form-with-error-summary.stories.tsx` (`apps/storybook/src/patterns/search-and-forms/`).

## Roles, states, properties

| Part                                | Element / role                           | ARIA / state                                          | Notes                                                                                                             |
| ----------------------------------- | ---------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Back link                           | `<a href>` with a decorative `Icon`      | none                                                  | First in the DOM                                                                                                  |
| `ErrorSummary.Root`                 | `<div>` with a title and a list of links | `tabindex="-1"`, not a live region                    | Mounts after a failed send, above the `h1`; found as a `group` named by its title; `focusKey` is the submit count |
| `ErrorSummary.Link`                 | `<a href>`                               | none                                                  | The field's own error text; goes to its control, or a group's first option                                        |
| `Field`                             | `<label>` and control                    | `aria-invalid`, `aria-describedby` the error and hint | The message stays under the control (3.3.1)                                                                       |
| `RadioGroup`                        | `<fieldset>` / `<legend>`                | group error via `aria-describedby`                    | Native radios                                                                                                     |
| `Alert.Danger`                      | `<div>`                                  | title `tabindex="-1"`, not a live region              | A failed send, above the `h1`, not a field error; its title takes focus once                                      |
| `Alert.Success` / confirmation `h1` | `<h1>`                                   | none                                                  | A sent form moves focus to the confirmation's `h1`                                                                |

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key        | Context           | Action                                                         | Test           |
| ---------- | ----------------- | -------------------------------------------------------------- | -------------- |
| Tab        | on the page       | Moves in DOM order: back link, summary links, the fields, Send | Keyboard story |
| Shift+Tab  | on the page       | Moves to the previous focusable element                        | Keyboard story |
| Enter      | on a summary link | Moves focus to the field, or the group's first option          | Keyboard story |
| Enter      | in a text input   | Submits the form (native)                                      | Keyboard story |
| Arrow keys | in a radio group  | Move and select within the group (native)                      | Keyboard story |

Nothing is intercepted: native keys only.

## Focus management

- Initial focus: not moved on load.
- On a failed send: moves to the summary once, on every failed send (`focusKey`).
- On a failed send to the server: moves to the `Alert.Danger` title once (`tabindex="-1"`); the answers stay and the summary is not shown.
- On a sent form: moves to the confirmation's `h1`.
- Trap: no.
- Restore to: not needed.
- Never obscured by: nothing (nothing is sticky, so 2.4.11 holds).

## Announcements

Nothing is announced on load. The summary is not a live region: it takes focus, so its title and links are read. The page title takes the `errorSummary.titlePrefix` word after a failed send. A failed send to the server is announced the same way: the alert's title takes focus, so it is read; the alert is not a live region and has no `announce`. A required question carries no marker, so the form says "All questions are required" before the first one (3.3.2).

## Consumer responsibilities

- Hold the answers and errors, validate on submit and not while typing, and keep the answers after an error (3.3.7).
- Write each error as what is wrong and how to fix it (3.3.3).
- Ask nothing that needs remembering or transcribing, and no CAPTCHA (3.3.8).
- Set the page title on a failed send, and choose the heading levels for the outline.

## Visual / modes

- Focus indicator: the token ring on every link, button and control.
- Target size: at least 24px (2.5.8).
- forced-colors behaviour: borders and the status words stay; links are `LinkText`.
- reduced-motion behaviour: nothing animates.
- RTL: logical properties; the layout follows the writing direction.
- 320px / 400% zoom: one column, everything wraps, nothing scrolls sideways.

## WCAG SCs covered

1.3.1, 2.4.2, 2.4.3, 2.4.11, 3.3.1, 3.3.2, 3.3.3, 3.3.7, 3.3.8, 4.1.2.

- 1.3.1 Info and Relationships (A)
- 2.4.2 Page Titled (A)
- 2.4.3 Focus Order (A)
- 2.4.11 Focus Not Obscured (Minimum) (AA)
- 3.3.1 Error Identification (A)
- 3.3.2 Labels or Instructions (A)
- 3.3.3 Error Suggestion (AA)
- 3.3.7 Redundant Entry (A)
- 3.3.8 Accessible Authentication (Minimum) (AA)
- 4.1.2 Name, Role, Value (A)

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

- The back link is a `Link` with an `Icon` until the library's back link ships.
