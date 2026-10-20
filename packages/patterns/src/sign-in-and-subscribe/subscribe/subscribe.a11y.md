# Accessibility contract: Subscribe

- **Scope:** An e-mail subscription form with its error and sent states. A recipe: every part is shipped; sending the address is the app's.
- **APG pattern:** none: [Field](../../../../react/src/field/field.a11y.md), [ErrorSummary](../../../../react/src/error-summary/error-summary.a11y.md) and [Alert](../../../../react/src/alert/alert.a11y.md) composed.
- **Deviations:** none
- **Native elements used:** `<h2>`, `<p>`, `<form novalidate>`, `<label>`, `<input type="email" autocomplete="email">`, `<button type="submit">`, `<a href>`.
- **Tests:** a recipe has no package code and adds no behaviour of its own, so its Keyboard rows name no test. Axe runs on every story in `subscribe.stories.tsx` (`apps/storybook/src/patterns/sign-in-and-subscribe/`).

## Roles, states, properties

| Part                        | Element / role                     | ARIA / state                                                | Notes                                                   |
| --------------------------- | ---------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------- |
| `Heading`                   | `<h1>`–`<h6>`                      | none                                                        | Level chosen for the page outline; no skipped level     |
| `form`                      | `<form noValidate>`                | none                                                        | Not a landmark                                          |
| `Field.Label` / `TextInput` | `<label>` / `<input type="email">` | `aria-invalid`, `aria-describedby` when invalid; `required` | `autocomplete="email"`; the label is visible            |
| `Field.ErrorMessage`        | `<p>`                              | none                                                        | The same words as the summary item (3.3.1)              |
| `ErrorSummary.Root`         | `<div>` with a title and a list    | takes focus once                                            | Above the heading; its link moves focus to the field    |
| `Alert.Success`             | `<div>`                            | `tabindex="-1"`                                             | Replaces the form when the address is sent; takes focus |

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key       | Context                 | Action                                                                                 | Test                                 |
| --------- | ----------------------- | -------------------------------------------------------------------------------------- | ------------------------------------ |
| Tab       | in the form             | The privacy link, the field, then the button; the summary links first when it is shown | Native; the shipped part's own tests |
| Shift+Tab | in the form             | The reverse order                                                                      | Native; the shipped part's own tests |
| Enter     | button, or in the field | Submits the form (native)                                                              | Native; the shipped part's own tests |
| Enter     | summary link            | Moves focus to the field                                                               | Native; the shipped part's own tests |

The `Keyboard` story starts on the invalid state. The form handles no other key.

## Focus management

- Initial focus: not moved.
- On an invalid submit: the `ErrorSummary` takes focus once; the story disables this auto focus inside the Docs frame.
- On a sent address: focus moves to the `Alert.Success`, which replaces the form.
- Trap: no.
- Never obscured by: nothing (nothing is sticky).

## Announcements

The focused `ErrorSummary` is the announcement for an invalid address; the focused success alert is the announcement for a sent one. Nothing is announced on load.

## Consumer responsibilities

- Validate in your own code (the form is `noValidate`) and write the message.
- Say how often and how to stop, and never claim a subscription is active before the confirmation.
- No CAPTCHA and no third-party form.

## Visual / modes

- Focus indicator: the token ring on every focusable part.
- forced-colors behaviour: the `ForcedColors` story; nothing depends on colour alone.
- reduced-motion behaviour: nothing in the recipe animates.
- RTL: the `RTL` story; logical properties.
- 320px / 400% zoom: the `Narrow` story asserts no sideways scroll.

## WCAG SCs covered

- 1.3.1 Info and Relationships (A)
- 1.3.5 Identify Input Purpose (AA)
- 2.4.3 Focus Order (A)
- 2.5.3 Label in Name (A)
- 3.3.1 Error Identification (A)
- 3.3.2 Labels or Instructions (A)
- 3.3.3 Error Suggestion (AA)
- 3.3.8 Accessible Authentication (Minimum) (AA)
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
