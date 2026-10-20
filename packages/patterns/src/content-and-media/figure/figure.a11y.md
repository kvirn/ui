# Accessibility contract: Figure

- **Scope:** A picture that adds information, with a caption. A recipe: no package code.
- **APG pattern:** none: native elements.
- **Deviations:** none
- **Native elements used:** `<figure>`, `<img alt>`, `<figcaption>`, `<div class="kv-prose">`, `<p>`.
- **Tests:** a recipe has no package code and adds no behaviour of its own, so its Keyboard rows name no test. Axe runs on every story in `figure.stories.tsx` (`apps/storybook/src/patterns/content-and-media/`).

## Roles, states, properties

| Part         | Element / role | ARIA / state                                        | Notes                                                              |
| ------------ | -------------- | --------------------------------------------------- | ------------------------------------------------------------------ |
| `figure`     | `<figure>`     | none                                                | Only for an informative picture                                    |
| `img`        | `<img>`        | `alt` says what the picture shows that matters here | Decorative: `alt=""`, no `figure`, no caption (`Decorative` story) |
| `figcaption` | `<figcaption>` | none                                                | Credit and source; never repeats the `alt`                         |

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

- Write an `alt` that says what matters here and a caption that holds the credit; they never repeat each other.
- A map, plan or chart gets a short `alt` and its facts in the text next to it, never only in `title`.
- A decorative picture has `alt=""`.

## Visual / modes

- Focus indicator: the token ring (nothing here takes focus).
- forced-colors behaviour: the `ForcedColors` story; nothing depends on colour alone.
- reduced-motion behaviour: nothing in the recipe animates.
- RTL: the `RTL` story; logical properties.
- 320px / 400% zoom: the `Narrow` story asserts no sideways scroll.

## WCAG SCs covered

- 1.1.1 Non-text Content (A)
- 1.3.1 Info and Relationships (A)
- 1.4.5 Images of Text (AA)
- 1.4.10 Reflow (AA)

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
