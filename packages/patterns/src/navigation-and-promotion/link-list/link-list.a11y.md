# Accessibility contract: Link list

- **Scope:** A few links under a heading, for "Other ways to contact us" or "Related pages". A recipe: a heading and a List.
- **APG pattern:** none: native elements: [List](../../../../react/src/list/list.a11y.md) and [Link](../../../../react/src/link/link.a11y.md).
- **Deviations:** none
- **Native elements used:** `<h2>`, `<ul>`, `<li>`, `<a href>`.
- **Status:** in progress (plan 0095 T5). Reviewer and manual AT are `pending`.
- **Tests:** a recipe has no package code and adds no behaviour of its own, so its Keyboard rows name no test. Axe runs on every story in `link-list.stories.tsx` (`apps/storybook/src/patterns/navigation-and-promotion/`).

## Roles, states, properties

| Part                      | Element / role  | ARIA / state  | Notes                                                                    |
| ------------------------- | --------------- | ------------- | ------------------------------------------------------------------------ |
| `Heading`                 | `<h1>`–`<h6>`   | none          | Level chosen for the page outline; no skipped level                      |
| `List.Root` / `List.Item` | `<ul>` / `<li>` | none          | The count is announced; not a `nav` landmark                             |
| `Link`                    | `<a href>`      | none          | Makes sense alone                                                        |
| `Icon`                    | `<svg>`         | `aria-hidden` | Decorative; a link to another site says so in text (`LinkToAnotherSite`) |

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key       | Context     | Action                  | Test                                 |
| --------- | ----------- | ----------------------- | ------------------------------------ |
| Tab       | in the list | Every link in DOM order | Native; the shipped part's own tests |
| Shift+Tab | in the list | The reverse order       | Native; the shipped part's own tests |

The `Keyboard` story shows the keys. The links handle no other key.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not needed.
- Never obscured by: nothing (nothing is sticky).

## Announcements

None.

## Consumer responsibilities

- Each link text makes sense alone.
- Say in text that a link goes to another site; never by the icon alone.
- Pick the heading level for the outline.

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
