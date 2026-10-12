# Accessibility contract: Page header

- **APG pattern:** none: native elements, composed from shipped parts ([Heading](../../../../react/src/heading/heading.a11y.md), [DefinitionList](../../../../react/src/definition-list/definition-list.a11y.md) and the [Breadcrumb](../../../../react/src/breadcrumb/breadcrumb.a11y.md) you pass as a child).
- **Deviations:** none
- **Native elements used:** `<div>` band, `<h1>`, `<p>`, `<dl>`, `<dt>`, `<dd>`, `<nav>` and `<a href>` (the Breadcrumb).
- **Status:** alpha candidate (plan 0103). Manual AT is `pending`.
- **Tests:** a pattern adds no behaviour of its own, so each Keyboard row names the shipped component's test. Axe runs on every story in `page-header.stories.tsx` (`apps/storybook/src/patterns/site-chrome/`).

## Roles, states, properties

| Part               | Element / role                                    | ARIA / state                                                 | Notes                                                                                                      |
| ------------------ | ------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `PageHeader.Root`  | `<div class="kv-page-header">` with a `Container` | none                                                         | A band, not a landmark. First child of `main`. Children are laid out in DOM order                          |
| Breadcrumb         | `<nav>`                                           | named "You are here"; `aria-current="page"` on the last item | The shipped `Breadcrumb`, passed as a child. Omitted when it would be one item. See `breadcrumb.a11y.md`   |
| `PageHeader.Title` | `<h1>`                                            | none                                                         | The page's only `h1`, at the `display` size. The route focus target (`tabindex="-1"` from `useRouteFocus`) |
| `PageHeader.Lead`  | `<p class="kv-lead">`                             | none                                                         | At most 60 characters wide                                                                                 |
| `PageHeader.Facts` | `<dl class="kv-page-header-facts">`               | none                                                         | `DefinitionList.Row`s of a `Term` and a `Description`. A term has a description: no empty value            |

Text is children; the pattern has no strings of its own and no presentation props.

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key       | Context     | Action                             | Test                                                 |
| --------- | ----------- | ---------------------------------- | ---------------------------------------------------- |
| Tab       | on the page | Moves through the breadcrumb links | `link.test.tsx › Tab moves focus to the link`        |
| Shift+Tab | on the page | The reverse order                  | `link.test.tsx › Shift+Tab moves focus off the link` |

The links handle no other key. The title, lead and facts are not focusable.

## Focus management

- Initial focus: not moved. After a route change the app moves focus to the `h1` (`useRouteFocus`).
- Trap: no.
- Restore to: not needed.
- Never obscured by: nothing (nothing is sticky).

## Announcements

None.

## Consumer responsibilities

- Exactly one `h1` per page, which is `PageHeader.Title`. Do not add another heading in the band.
- A fact is a real pair: the term names it and the description gives it. Do not write "Passed" for a result that has not been recorded.
- A title or fact in another language than the page goes in a nested `KvirnProvider` with `useLocale().localeProps` on your own element (3.1.2).

## Visual / modes

- Focus indicator: the token ring on every link.
- Target size: breadcrumb links at least 24px (2.5.8).
- Contrast: `text-muted` terms, `text` descriptions and the `heading` title on `surface` are the measured floors (`theme:check`).
- forced-colors behaviour: the band keeps a `CanvasText` edge below; links are `LinkText`.
- reduced-motion behaviour: nothing animates.
- RTL: logical properties; the breadcrumb separator mirrors.
- 320px / 400% zoom: the title steps down and hyphenates, the facts stack one per line, nothing has a fixed height.

## WCAG SCs covered

1.3.1, 1.3.2, 1.4.3, 1.4.10, 1.4.12, 2.4.6, 2.4.8, 3.1.2.

## AT test record

| AT + browser + OS                        | Date    | Tester | Result | Notes |
| ---------------------------------------- | ------- | ------ | ------ | ----- |
| **Core (required for beta)**             |         |        |        |       |
| NVDA + Firefox + Windows                 | pending |        |        |       |
| VoiceOver + Safari + macOS               | pending |        |        |       |
| VoiceOver + Safari + iOS                 | pending |        |        |       |
| TalkBack + Chrome + Android              | pending |        |        |       |
| Windows Contrast Themes + Edge           | pending |        |        |       |
| Keyboard only / 400% zoom / 320px reflow | pending |        |        |       |

## Known issues

- none
