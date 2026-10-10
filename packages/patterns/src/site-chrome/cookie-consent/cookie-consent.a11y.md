# Accessibility contract: Cookie consent

- **APG pattern:** none: native buttons in a named region, in the flow. Not the [Dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): nothing is modal and nothing is trapped.
- **Deviations:** none
- **Native elements used:** `<section>` (region), `<h2>`, `<button type="button">`, `<a href>`, `<p tabindex="-1">` for the result.
- **Status:** alpha candidate, story only (plan 0095). Manual AT is `pending`. Kvirnby sets no cookies; `TODO(legal-verify)`: the ePrivacy wording of a real site.
- **Tests:** `cookie-consent.test.tsx` next to this file proves the choice and the focus move; the buttons are proved in `button.test.tsx`. `cookie-consent.stories.tsx` in `apps/storybook/src/patterns/site-chrome/`.

## Roles, states, properties

| Part                     | Element / role        | ARIA / state                        | Notes                                                                                     |
| ------------------------ | --------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------- |
| `CookieConsent.Root`     | `<section>` (region)  | `aria-labelledby` the `h2`          | In the flow, first after the skip link. No `aria-modal`, no `inert` anywhere              |
| (state)                  | `data-decision`       | `undecided`, `accepted`, `rejected` | Owned by the root. `defaultDecision` starts answered; `onDecision` reports it             |
| `CookieConsent.Heading`  | `<h2>`                | `id`, referenced by the root        | The region's name                                                                         |
| `CookieConsent.Text`     | `<div>` (Prose)       | none                                | Gone after a choice                                                                       |
| `CookieConsent.Actions`  | `<div>` button group  | none                                | Gone after a choice                                                                       |
| `CookieConsent.Accept`   | `<button>`            | none                                | Its text is its children. Same class and weight as Reject: no primary                     |
| `CookieConsent.Reject`   | `<button>`            | none                                | Its text is its children                                                                  |
| `CookieConsent.Accepted` | `<p tabindex="-1">`   | none, not a live region             | Shown after Accept: what was chosen and where to change it, as children. Focus moves here |
| `CookieConsent.Rejected` | `<p tabindex="-1">`   | none, not a live region             | As Accepted, after Reject                                                                 |
| `CookieConsent.Link`     | `<p>` with `<a href>` | none                                | The cookies page, where the choice can be changed. Always shown                           |

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key          | Context   | Action                                              | Test                                                                |
| ------------ | --------- | --------------------------------------------------- | ------------------------------------------------------------------- |
| Tab          | in region | Moves Accept, Reject, then the link                 | `button.test.tsx › Tab moves focus to the button`                   |
| Shift+Tab    | in region | Moves back                                          | `button.test.tsx › Shift+Tab moves focus off the button`            |
| Enter, Space | a button  | Makes the choice and moves focus to the result text | `cookie-consent.test.tsx › a choice moves focus to the result text` |

The region handles no other key. Escape does nothing: it is not a dialog.

## Focus management

- Initial focus: not moved. The region never takes focus on load.
- Trap: no.
- Restore to: after a choice, focus moves to the result text (`tabindex="-1"`), never `body`. With no `Accepted` or `Rejected` written, the heading (`tabindex="-1"`).
- Never obscured by: nothing is sticky or fixed.

## Announcements

None: after a choice, focus on the result text makes the screen reader read it.

## Consumer responsibilities

- Place it first after the skip link, as a child of `PageFrame.Root` before the header, so it is reached early without a trap. Storing the choice and setting cookies are yours (`onDecision`).
- Write both `CookieConsent.Accepted` and `CookieConsent.Rejected`: after a choice the buttons and the text are gone, and the result is the only thing focus can go to.
- Both choices stay equally easy to reach and equal in look (no dark pattern). The text says what the cookies are for in plain words.

## Visual / modes

- Focus indicator: the token ring.
- Target size: buttons are 44px (2.5.8).
- forced-colors behaviour: the region keeps its border.
- reduced-motion behaviour: nothing animates.
- RTL: logical properties.

## WCAG SCs covered

1.3.1, 1.4.10, 2.1.1, 2.1.2, 2.4.3, 2.4.11, 2.5.8, 3.2.2, 3.3.2.

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

## Known issues

- none
