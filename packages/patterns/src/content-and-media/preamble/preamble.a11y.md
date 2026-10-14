# Accessibility contract: Preamble

- **Scope:** The introductory paragraph straight after the page `h1`. A recipe: no package code.
- **APG pattern:** none: native elements.
- **Deviations:** none
- **Native elements used:** `<div class="kv-prose">`, `<h1>`, `<p class="kv-lead">`.
- **Status:** in progress (plan 0095 T5). Reviewer and manual AT are `pending`.
- **Tests:** a recipe has no package code and adds no behaviour of its own, so its Keyboard rows name no test. Axe runs on every story in `preamble.stories.tsx` (`apps/storybook/src/patterns/content-and-media/`).

## Roles, states, properties

| Part        | Element / role | ARIA / state | Notes                                  |
| ----------- | -------------- | ------------ | -------------------------------------- |
| `Heading`   | `<h1>`–`<h6>`  | none         | The page title, the only `h1`          |
| `p.kv-lead` | `<p>`          | none         | One to three sentences; not a landmark |

## Keyboard

This component has no focusable parts and handles no keys.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not needed.
- Never obscured by: nothing (nothing is sticky).

## Announcements

None.

## Consumer responsibilities

- Keep it to one to three sentences, straight after the `h1`.
- Mark text in another language with `lang` on the wrapper (the `LongFinnishCompound` story sets `lang="fi"`).

## Visual / modes

- Focus indicator: the token ring (nothing here takes focus).
- forced-colors behaviour: the `ForcedColors` story; nothing depends on colour alone.
- reduced-motion behaviour: nothing in the recipe animates.
- RTL: the `RTL` story; logical properties.
- 320px / 400% zoom: the `Narrow` story asserts no sideways scroll.

## WCAG SCs covered

- 1.3.1 Info and Relationships (A)
- 1.4.4 Resize Text (AA)
- 1.4.10 Reflow (AA)
- 3.1.2 Language of Parts (AA)

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
