# Accessibility contract: Heading

- **APG pattern:** none. A heading is not a widget (ADR-0052).
- **Deviations:** none
- **Native elements used:** `<h1>` to `<h6>`.
- **Status:** alpha candidate (Plan 0023). Gates pending. Manual AT is `pending`.
- **Tests:** `heading.test.tsx` next to this file. `heading.stories.tsx` in `apps/storybook/src/components/heading/`.

Heading renders the native heading element for a required `level`, and an optional `size` sets its look apart from the level. It adds only classes, no role, ARIA, text or behaviour, so what a user perceives is the native heading.

## Roles, states, properties

| Part    | Element / role               | ARIA                        | Notes                                                                                                                                                                                                                                                                                       |
| ------- | ---------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Heading | `<h1>` to `<h6>` → `heading` | none (`aria-level` implied) | `level` is required and is the element. `class="kv-heading kv-heading--<size>"`: `size` (`display`, `heading-1`, `heading-2`, `heading-3`) is the look only, and defaults to the level's own for levels 1 to 3. Attributes (`id`, `lang`, `aria-*`) and the ref reach the element unchanged |
| Heading | `render` (element, function) | the rendered element's own  | One element. The function form reads `state.level` and `state.size`. A `render` element that isn't a heading loses the heading role: give it `role="heading"` and `aria-level` yourself                                                                                                     |
| Heading | never                        | no `role`, `tabindex`       | No click handler, no live region. The size never changes the element or the level                                                                                                                                                                                                           |

## Keyboard

This component has no focusable parts and handles no keys.

| Key | Context | Action                                     | Test                                                                                                   |
| --- | ------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| –   | Heading | Not a Tab stop: no `tabindex`, no handlers | `heading.test.tsx › adds only its classes, no role or ARIA, and passes attributes and the ref through` |

## Focus management

- Initial focus: not moved. Heading never moves focus.
- Trap: no.
- Restore to: not applicable.
- A heading that a script focuses (a page title after navigation) needs `tabindex="-1"`, which the consumer adds.

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | –          |

Heading renders no text, so it has no message keys.

## Consumer responsibilities

- **Choose the level for the outline, and the size for the look.** One `h1` per page, then no skipped levels (1.3.1, 2.4.6). Heading can't know where it sits, so `level` is required. Never pick a level because of its size: set `size` instead.
- **Describe the topic or purpose.** Headings and labels are clear and unique among their siblings (2.4.6).
- **Language.** `lang` on a heading in another language (3.1.2).

## Visual / modes

Headless: Heading ships no CSS. With `@kvirn-ui/theme/theme.css`, `kv-heading` sets the `heading` colour and family (contrast measured by `theme:check`, 1.4.3), and the modifier sets the type role (`display`, `heading-1`, `heading-2`, `heading-3`), in prose and outside it. Levels 4 to 6 without a `size` are the body size in the heading-3 weight, like prose. Sizes are in rem, so they follow the browser's text size (1.4.4). Margins come from `kv-prose` or the consumer. Target size, focus indicator and motion: not applicable.

Right to left and forced colours are the `Right to left` and `Forced colors` stories (`Components/Heading`): a heading sets no directional or background styles, so they check that it starts at the inline start and keeps the system text colour (1.4.3, 1.4.11).

## WCAG SCs covered

- 1.3.1 Info and Relationships: a native heading with the consumer's level (`heading.test.tsx › level %i renders that element`).
- 1.4.4 Resize Text: the type roles are in rem.
- 2.4.6 Headings and Labels: the consumer's text. `level` can't be forgotten.

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
