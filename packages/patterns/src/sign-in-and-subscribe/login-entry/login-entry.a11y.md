# Accessibility contract: Login entry

- **Scope:** The page where a resident chooses an e-identification. A recipe: a list of cards with one link each; the link target is the app's.
- **APG pattern:** none: native elements: [Card](../../../../react/src/card/card.a11y.md) and [Grid](../../../../react/src/grid/grid.a11y.md) as a list.
- **Deviations:** none
- **Native elements used:** `<h1>`, `<ul>`, `<li>`, `<a href>`, `<div>` for alerts.
- **Status:** in progress (plan 0095 T5). Reviewer and manual AT are `pending`.
- **Tests:** a recipe has no package code and adds no behaviour of its own, so its Keyboard rows name no test. Axe runs on every story in `login-entry.stories.tsx` (`apps/storybook/src/patterns/sign-in-and-subscribe/`).

## Roles, states, properties

| Part                           | Element / role                       | ARIA / state | Notes                                                                                            |
| ------------------------------ | ------------------------------------ | ------------ | ------------------------------------------------------------------------------------------------ |
| `Heading`                      | `<h1>` "Sign in"                     | none         | The only `h1`                                                                                    |
| `Grid.Root as="ul"`            | `<ul>`                               | none         | The count is announced                                                                           |
| `Card.Root as="li"`            | `<li>`                               | none         | One per method; all alike, none primary                                                          |
| `Heading` with `Link`          | `<h2>`–`<h6>` holding one `<a href>` | none         | One link per card; the card is not clickable                                                     |
| `Alert.Warning` / `Alert.Info` | `<div>`                              | none         | An unavailable method (`MethodUnavailable`) or a cancelled sign-in (`Cancelled`), above the list |

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key       | Context     | Action                         | Test                                 |
| --------- | ----------- | ------------------------------ | ------------------------------------ |
| Tab       | in the list | Every method link in DOM order | Native; the shipped part's own tests |
| Shift+Tab | in the list | The reverse order              | Native; the shipped part's own tests |

The `Keyboard` story shows the keys. The links handle no other key.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not needed.
- Never obscured by: nothing (nothing is sticky).

## Announcements

None.

## Consumer responsibilities

- Name your own methods and set the link targets.
- An unavailable method has no card: say which and when it is back, in words.
- No CAPTCHA and no puzzle.

## Visual / modes

- Focus indicator: the token ring on every focusable part.
- forced-colors behaviour: the `ForcedColors` story; nothing depends on colour alone.
- reduced-motion behaviour: nothing in the recipe animates.
- RTL: the `RTL` story; logical properties.
- 320px / 400% zoom: the `Narrow` story asserts no sideways scroll.

## WCAG SCs covered

- 1.3.1 Info and Relationships (A)
- 2.4.4 Link Purpose (In Context) (A)
- 2.4.6 Headings and Labels (AA)
- 3.3.8 Accessible Authentication (Minimum) (AA)

## AT test record

| AT + browser + OS                        | Agent check | Human check | Result  | Notes |
| ---------------------------------------- | ----------- | ----------- | ------- | ----- |
| **Core (required for beta)**             |             |             |         |       |
| Windows Contrast Themes + Edge           | pending     | pending     | pending |       |
| Keyboard only / 400% zoom / 320px reflow | pending     | pending     | pending |       |
| VoiceOver + Safari + macOS               | pending     | pending     | pending |       |
| VoiceOver + Safari + iOS                 | pending     | pending     | pending |       |
| TalkBack + Chrome + Android              | pending     | pending     | pending |       |
| NVDA + Chrome + Windows                  | pending     | pending     | pending |       |
| NVDA + Firefox + Windows                 | pending     | pending     | pending |       |
| Narrator + Edge + Windows                | pending     | pending     | pending |       |
| **Release (before 1.0 and each minor)**  |             |             |         |       |
| JAWS + Chrome + Windows                  | pending     | pending     | pending |       |
| Dragon / Voice Control                   | pending     | pending     | pending |       |

## Known issues

- none
