# Accessibility contract: Notice

- **APG pattern:** none: native elements, composed from shipped parts.
- **Deviations:** none
- **Native elements used:** `<div>` (`Alert`), `<p>` or a heading for the title, `<a href>`.
- **Status:** in progress (plan 0095 T5). A recipe: the story is the code, there is no package code. Reviewer and manual AT are `pending`.
- **Tests:** a recipe adds no behaviour of its own, so the Keyboard rows name no test of their own: each part's keys are proved by its component's tests. Axe runs on every story in `notice.stories.tsx` (`apps/storybook/src/patterns/news-events-and-notices/`).

## Roles, states, properties

| Part                           | Element / role       | ARIA / state                     | Notes                                         |
| ------------------------------ | -------------------- | -------------------------------- | --------------------------------------------- |
| `Alert.Info` / `Alert.Warning` | `<div>`              | no `role`, not announced on load | Not dismissible in content                    |
| `Alert.Title as="p"`           | `<p>` (or a heading) | none                             | A heading only when it belongs in the outline |
| `Alert.Body`                   | `<div>`              | none                             | A short body                                  |
| `Link`                         | `<a href>`           | none                             | At most one                                   |

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key       | Context     | Action                                  | Test           |
| --------- | ----------- | --------------------------------------- | -------------- |
| Tab       | on the page | Moves to the link, if there is one      | Keyboard story |
| Shift+Tab | on the page | Moves to the previous focusable element | Keyboard story |

The notice itself is not a stop.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not needed.
- Never obscured by: nothing (nothing is sticky).

## Announcements

None. No `announce`, no role and no focus: the notice is read in place.

## Consumer responsibilities

- Say status in words and an icon, never by colour alone.
- For a quiet aside that is not a status, use an Inset.
- Choose a heading for the title only when it belongs in the page's outline.

## Visual / modes

- Focus indicator: the token ring on every link, button and control.
- Target size: at least 24px (2.5.8).
- forced-colors behaviour: borders and the status words stay; links are `LinkText`.
- reduced-motion behaviour: nothing animates.
- RTL: logical properties; the layout follows the writing direction.
- 320px / 400% zoom: one column, everything wraps, nothing scrolls sideways.

## WCAG SCs covered

1.3.1, 1.4.1, 1.4.10, 2.4.4.

- 1.3.1 Info and Relationships (A)
- 1.4.1 Use of Color (A)
- 1.4.10 Reflow (AA)
- 2.4.4 Link Purpose (In Context) (A)

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
