# Accessibility contract: Contents

- **Scope:** Jump links to the sections of a long page. A recipe: the shipped TableOfContents with the page's own headings.
- **APG pattern:** none: [TableOfContents](../../../../react/src/table-of-contents/table-of-contents.a11y.md) composed with the page's `h2` headings.
- **Deviations:** none
- **Native elements used:** `<nav>`, `<ol>` or `<ul>`, `<li>`, `<a href="#id">`, `<h2 id>`.
- **Status:** in progress (plan 0095 T5). Reviewer and manual AT are `pending`.
- **Tests:** a recipe has no package code and adds no behaviour of its own, so its Keyboard rows name no test. Axe runs on every story in `contents.stories.tsx` (`apps/storybook/src/patterns/content-and-media/`).

## Roles, states, properties

| Part                   | Element / role               | ARIA / state                                        | Notes                                                                                           |
| ---------------------- | ---------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `TableOfContents.Root` | `<nav>` named "On this page" | none                                                | One per page; not rendered with fewer than three sections (`TwoSections`), so no empty landmark |
| Entry                  | `<a href="#id">`             | `aria-current="location"` on the heading being read | `id` matches the `h2` on the page                                                               |

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key       | Context         | Action                                          | Test                                 |
| --------- | --------------- | ----------------------------------------------- | ------------------------------------ |
| Tab       | in the contents | Every entry in DOM order, then on into the page | Native; the shipped part's own tests |
| Shift+Tab | in the contents | The reverse order                               | Native; the shipped part's own tests |
| Enter     | entry           | Follows the link to the section                 | Native; the shipped part's own tests |

The `Keyboard` story shows the keys. The links handle no other key.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not needed.
- Never obscured by: nothing (nothing is sticky).

## Announcements

None.

## Consumer responsibilities

- Every entry's `id` matches an `h2` on the page.
- Render it only from three sections up.
- Place it right after the `h1` and the preamble; do not make it sticky.

## Visual / modes

- Focus indicator: the token ring on every focusable part.
- forced-colors behaviour: the `ForcedColors` story; nothing depends on colour alone.
- reduced-motion behaviour: nothing in the recipe animates.
- RTL: the `RTL` story; logical properties.
- 320px / 400% zoom: the `Narrow` story asserts no sideways scroll.

## WCAG SCs covered

- 1.3.1 Info and Relationships (A)
- 1.4.10 Reflow (AA)
- 2.4.1 Bypass Blocks (A)
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
