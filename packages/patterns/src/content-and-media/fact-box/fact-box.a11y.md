# Accessibility contract: Fact box

- **Scope:** Key facts set apart from the text. A recipe: `kv-inset` with a heading and a list.
- **APG pattern:** none: native elements: [List](../../../../react/src/list/list.a11y.md) or [DefinitionList](../../../../react/src/definition-list/definition-list.a11y.md).
- **Deviations:** none
- **Native elements used:** `<div class="kv-inset">`, `<h2>`–`<h6>`, `<ul>`, `<li>`, `<dl>`, `<dt>`, `<dd>`, `<a href>`.
- **Status:** in progress (plan 0095 T5). Reviewer and manual AT are `pending`.
- **Tests:** a recipe has no package code and adds no behaviour of its own, so its Keyboard rows name no test. Axe runs on every story in `fact-box.stories.tsx` (`apps/storybook/src/patterns/content-and-media/`).

## Roles, states, properties

| Part                                 | Element / role   | ARIA / state | Notes                                                        |
| ------------------------------------ | ---------------- | ------------ | ------------------------------------------------------------ |
| `div.kv-inset`                       | `<div>`          | none         | Not an `aside`: no landmark, so it is found in reading order |
| `Heading`                            | `<h1>`–`<h6>`    | none         | Level chosen for the page outline; no skipped level          |
| `List.Root` or `DefinitionList.Root` | `<ul>` or `<dl>` | none         | Short parallel facts, or a name and a value each             |
| `Link.Root`                          | `<a href>`       | none         | Optional (`WithLink`)                                        |

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key       | Context    | Action                      | Test                                 |
| --------- | ---------- | --------------------------- | ------------------------------------ |
| Tab       | in the box | The link, when there is one | Native; the shipped part's own tests |
| Shift+Tab | in the box | The reverse order           | Native; the shipped part's own tests |

The `Keyboard` story shows the keys. The box handles no other key.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not needed.
- Never obscured by: nothing (nothing is sticky).

## Announcements

None.

## Consumer responsibilities

- The heading says what the facts are about; pick its level for the outline.
- Anything with legal or money consequences is an `Alert.Warning`, not a fact box.

## Visual / modes

- Focus indicator: the token ring on every focusable part.
- forced-colors behaviour: the `ForcedColors` story; nothing depends on colour alone.
- reduced-motion behaviour: nothing in the recipe animates.
- RTL: the `RTL` story; logical properties.
- 320px / 400% zoom: the `Narrow` story asserts no sideways scroll.

## WCAG SCs covered

- 1.3.1 Info and Relationships (A)
- 1.3.2 Meaningful Sequence (A)
- 2.4.4 Link Purpose (In Context) (A)
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
