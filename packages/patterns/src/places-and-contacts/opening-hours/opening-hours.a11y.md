# Accessibility contract: Opening hours

- **APG pattern:** none: native elements, composed from shipped parts.
- **Deviations:** none
- **Native elements used:** `<h2>`/`<h3>`, `<dl>`, `<div>` rows, `<dt>`, `<dd>`, a `kv-inset` `<div>`, `Alert.Warning`.
- **Tests:** a recipe adds no behaviour of its own, so the Keyboard rows name no test of their own: each part's keys are proved by its component's tests. Axe runs on every story in `opening-hours.stories.tsx` (`apps/storybook/src/patterns/places-and-contacts/`).

## Roles, states, properties

| Part                                   | Element / role                            | ARIA / state            | Notes                                                                       |
| -------------------------------------- | ----------------------------------------- | ----------------------- | --------------------------------------------------------------------------- |
| `Heading`                              | `<h2>`/`<h3>`                             | none                    | Visiting hours and phone hours are separate `h3` blocks                     |
| `DefinitionList.Root`                  | `<dl>`                                    | none                    | One row for each run of days, written in full ("Monday to Thursday")        |
| `DefinitionList.Term` / `.Description` | `<dt>` / `<dd>`                           | none                    | Day or days, then the times. Today has "(today)" after the day, as text     |
| Exception                              | `<div class="kv-inset">` with a `Heading` | none                    | Its own heading                                                             |
| `Alert.Warning`                        | `<div>`                                   | none, not a live region | Only when the place is closed today; before the list, not announced on load |

## Keyboard

This component has no focusable parts and handles no keys.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not needed.
- Never obscured by: nothing (nothing is sticky).

## Announcements

None. Nothing is announced on load, and nothing changes after it.

## Consumer responsibilities

- Write the days in full and the times as text; never mark today or a closure by colour alone.
- Leave out an exception that no longer applies; the pattern does not read the date.
- Choose the heading levels for the page's outline.

## Visual / modes

- Focus indicator: the token ring on every link, button and control.
- Target size: at least 24px (2.5.8).
- forced-colors behaviour: borders and the status words stay; links are `LinkText`.
- reduced-motion behaviour: nothing animates.
- RTL: logical properties; the layout follows the writing direction.
- 320px / 400% zoom: one column, everything wraps, nothing scrolls sideways.

## WCAG SCs covered

1.3.1, 1.4.1, 1.4.10, 2.4.6.

- 1.3.1 Info and Relationships (A)
- 1.4.1 Use of Color (A)
- 1.4.10 Reflow (AA)
- 2.4.6 Headings and Labels (AA)

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
