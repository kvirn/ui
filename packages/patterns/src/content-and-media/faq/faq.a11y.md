# Accessibility contract: FAQ

- **Scope:** Questions a resident opens one by one: a heading and an Accordion. A recipe: no package code.
- **APG pattern:** none: [Accordion](../../../../react/src/accordion/accordion.a11y.md) composed under a `Heading`.
- **Deviations:** none
- **Native elements used:** `<h2>`, `<h3>`, `<button type="button">`, `<div class="kv-prose">`, `<p>`, `<ul>`, `<li>`, `<a href>`.
- **Tests:** a recipe has no package code and adds no behaviour of its own, so its Keyboard rows name no test. Axe runs on every story in `faq.stories.tsx` (`apps/storybook/src/patterns/content-and-media/`).

## Roles, states, properties

| Part                                | Element / role                          | ARIA / state                     | Notes                                                                                                  |
| ----------------------------------- | --------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `Heading`                           | `<h1>`–`<h6>`                           | none                             | Level chosen for the page outline; no skipped level                                                    |
| `Accordion.Root` / `Accordion.Item` | `<div>`                                 | none                             | One item per question                                                                                  |
| `Accordion.Heading`                 | `<h3>` (`level` chosen for the outline) | none                             | One level below the group heading                                                                      |
| `Accordion.Trigger`                 | `<button>`                              | `aria-expanded`, `aria-controls` | The question is the name                                                                               |
| `Accordion.Panel`                   | `<div>`                                 | none                             | The answer, `kv-prose`; hidden until opened (`PanelWithListAndLink` shows a `List` and a `Link` in it) |

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key           | Context    | Action                                                                   | Test                                 |
| ------------- | ---------- | ------------------------------------------------------------------------ | ------------------------------------ |
| Tab           | in the FAQ | Every question trigger in DOM order, then any link inside an open answer | Native; the shipped part's own tests |
| Shift+Tab     | in the FAQ | The reverse order                                                        | Native; the shipped part's own tests |
| Enter / Space | trigger    | Opens or closes the answer; focus stays on the trigger                   | Native; the shipped part's own tests |

The `Keyboard` story shows the keys. The triggers handle no other key.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not needed.
- Never obscured by: nothing (nothing is sticky).

## Announcements

`aria-expanded` carries the state; nothing is announced otherwise.

## Consumer responsibilities

- Pick `level` for the page outline: no skipped level, stop at `h3` on resident pages.
- Do not hide the only copy of something every resident must read.
- A long question wraps and is never truncated (`LongQuestion`).

## Visual / modes

- Focus indicator: the token ring on every focusable part.
- forced-colors behaviour: the `ForcedColors` story; nothing depends on colour alone.
- reduced-motion behaviour: nothing in the recipe animates.
- RTL: the `RTL` story; logical properties.
- 320px / 400% zoom: the `Narrow` story asserts no sideways scroll.

## WCAG SCs covered

- 1.3.1 Info and Relationships (A)
- 1.4.10 Reflow (AA)
- 2.1.1 Keyboard (A)
- 2.4.6 Headings and Labels (AA)
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

- none
