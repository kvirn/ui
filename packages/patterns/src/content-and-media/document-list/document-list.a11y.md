# Accessibility contract: Document list

- **Scope:** Documents to download, one link each. A recipe: a heading, a List and Links.
- **APG pattern:** none: native elements: [List](../../../../react/src/list/list.a11y.md) and [Link](../../../../react/src/link/link.a11y.md).
- **Deviations:** none
- **Native elements used:** `<h2>`, `<h3>`, `<ul>`, `<li>`, `<a href>`, `<time datetime>`.
- **Tests:** a recipe has no package code and adds no behaviour of its own, so its Keyboard rows name no test. Axe runs on every story in `document-list.stories.tsx` (`apps/storybook/src/patterns/content-and-media/`).

## Roles, states, properties

| Part                      | Element / role    | ARIA / state                                                   | Notes                                                                        |
| ------------------------- | ----------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `Heading`                 | `<h1>`–`<h6>`     | none                                                           | Level chosen for the page outline; no skipped level                          |
| `List.Root` / `List.Item` | `<ul>` / `<li>`   | none                                                           | The count is announced; group many documents under headings (`TwelveByYear`) |
| `Link.Root`               | `<a href>`        | `hreflang` on a document in another language (`OtherLanguage`) | Text holds the file type and size, written with `formatFileSize`             |
| `time`                    | `<time datetime>` | none                                                           | The date, written with `useFormat`                                           |

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key       | Context     | Action                           | Test                                 |
| --------- | ----------- | -------------------------------- | ------------------------------------ |
| Tab       | in the list | Every document link in DOM order | Native; the shipped part's own tests |
| Shift+Tab | in the list | The reverse order                | Native; the shipped part's own tests |

The `Keyboard` story shows the keys. The links handle no other key.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not needed.
- Never obscured by: nothing (nothing is sticky).

## Announcements

None.

## Consumer responsibilities

- Put the type and size in the link text.
- Mark a document in another language with `hrefLang` on the link and `lang` on its text.
- A document that is not accessible is not linked: say so in text and offer a contact (`NotAccessible`).

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
- 3.1.2 Language of Parts (AA)
- 3.2.5 Change on Request (AAA)

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
