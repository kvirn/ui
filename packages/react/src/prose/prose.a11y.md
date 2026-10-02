# Accessibility contract: Prose

- **APG pattern:** none. Prose is a styling container, not a widget (ADR-0052).
- **Deviations:** none
- **Native elements used:** `<div>` by default. The consumer picks `<article>` or `<section>` with `render`, and the element's own semantics apply.
- **Status:** alpha candidate (Plan 0023). Gates pending. Manual AT is `pending`.
- **Tests:** `prose.test.tsx` next to this file. `prose.stories.tsx` in `apps/storybook/src/components/prose/`.

Prose is the `kv-prose` class as a component: a container whose headings, paragraphs, lists, links and tables the theme sets for reading. It adds no role, ARIA, text, `tabindex` or behaviour. The stories on this component's Docs page show the typography on a full article.

## Roles, states, properties

| Part       | Element / role      | ARIA                                     | Notes                                                                                                                                                      |
| ---------- | ------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prose.Root | `<div>` → `generic` | none                                     | `class="kv-prose"`. `Prose`, `Prose.Root` and `ProseRoot` are the same component. `render={<article />}` or `<section aria-labelledby>` change the element |
| Prose.Root | attributes          | passed through                           | The class is its own: a `className` prop and a `render` element's own `className` join it, never replace it. Add `kv-prose--large` for the larger size     |
| Prose.Root | never               | no `role`, `aria-*`, `tabindex`, `inert` | No handler, no heading, no live region, no text                                                                                                            |

`useProse()` gives the same `rootProps` (only `className`) for your own element.

## Keyboard

This component has no focusable parts and handles no keys.

| Key | Context    | Action                                               | Test                                                                                   |
| --- | ---------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------- |
| –   | Prose.Root | No `tabindex` is rendered, so Prose never gets focus | `prose.test.tsx › renders one <div> with its class, no role or ARIA, and its children` |

## Focus management

- Initial focus: not moved. Prose never moves focus.
- Trap: no.
- Restore to: not applicable.
- Never obscured by: Prose renders no overlay and sets no `overflow`, so a link's focus ring inside it is never clipped (2.4.11).

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | –          |

Prose renders no text, so it has no message keys.

## Consumer responsibilities

- **The content's semantics.** Real headings in order, real lists, links that say where they go, tables with headers (1.3.1, 2.4.4). Prose styles what is there. It doesn't add structure.
- **Content from a CMS or Markdown** needs the same checks before it is rendered.
- **Language.** `lang` on prose in another language (3.1.2).

## Visual / modes

Headless: Prose ships no CSS. With `@kvirn-ui/theme/theme.css` the `kv-prose` rules apply (design spec `docs/design/foundations-and-prose.md`): a 70ch measure, the body and heading type roles, link underline and focus ring, and reflow without fixed sizes. Contrast of text, links and code on `canvas` and `surface` is measured by `theme:check` (1.4.3, 1.4.11). Forced colours, reduced motion, 320px reflow and text spacing are covered by the Prose stories (`Components/Prose`) (1.4.10, 1.4.12).

## WCAG SCs covered

- 1.3.1 Info and Relationships: no role of its own, so the consumer's content decides the semantics (`prose.test.tsx`).
- 1.4.3, 1.4.10, 1.4.12: the `kv-prose` theme rules, as tested in the Prose stories.

## AT test record

| AT + browser + OS                        | Date    | Tester | Result | Notes |
| ---------------------------------------- | ------- | ------ | ------ | ----- |
| **Core (required for beta, ADR-0004)**   |         |        |        |       |
| NVDA + Firefox + Windows                 | pending |        |        |       |
| VoiceOver + Safari + macOS               | pending |        |        |       |
| VoiceOver + Safari + iOS                 | pending |        |        |       |
| TalkBack + Chrome + Android              | pending |        |        |       |
| Windows Contrast Themes + Edge           | pending |        |        |       |
| Keyboard only / 400% zoom / 320px reflow | pending |        |        |       |
| **Release (before 1.0 and each minor)**  |         |        |        |       |
| JAWS + Chrome + Windows                  | pending |        |        |       |
| NVDA + Chrome + Windows                  | pending |        |        |       |
| Narrator + Edge + Windows                | pending |        |        |       |
| Dragon / Voice Control                   | pending |        |        |       |

## Known issues

None.
