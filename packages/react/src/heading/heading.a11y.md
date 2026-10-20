# Accessibility contract: Heading

- **APG pattern:** none. A heading is not a widget.
- **Deviations:** none
- **Native elements used:** `<h1>` to `<h6>`.
- **Tests:** `heading.test.tsx` next to this file. `heading.stories.tsx` in `apps/storybook/src/components/heading/`.

Heading renders the native heading element named by a required `as`, and an optional `size` sets its look apart from the level. It adds only classes, no role, ARIA, text or behaviour, so what a user perceives is the native heading.

## Roles, states, properties

| Part    | Element / role                 | ARIA                        | Notes                                                                                                                                                                                                                                                                                                                                   |
| ------- | ------------------------------ | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Heading | `<h1>` to `<h6>` → `heading`   | none (`aria-level` implied) | `as` (`'h1'` to `'h6'`) is required and is the element and the level. `class="kv-heading kv-heading--<size>"`: `size` (`display`, `heading-1` to `heading-6`) is the look only, and defaults to the level's own: `h1` to `h6` look like `heading-1` to `heading-6`. Attributes (`id`, `aria-*`) and the ref reach the element unchanged |
| Heading | Allowed elements: `h1` to `h6` | none                        | A string, so it works from a Server Component. Anything else is a type error and, in JS, warns once in development and renders `<h2>`. For a `<legend>` or another element use `useHeading` with your own element and keep its semantics (give a non-heading `role="heading"` and `aria-level` yourself)                                |
| Heading | never                          | no `role`, `tabindex`       | No click handler, no live region. The size never changes the element or the level                                                                                                                                                                                                                                                       |

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

- **Choose the level for the outline, and the size for the look.** Use one `h1` per page and don't skip levels, so people who move through a page by heading can follow it (1.3.1 Info and Relationships, A; 2.4.6 Headings and Labels, AA). Heading can't know where it sits, so `as` is required. Never pick a level because of its size: set `size` instead.
- **Describe the topic or purpose.** Headings and labels are clear and differ from the ones next to them (2.4.6 Headings and Labels, AA).
- **Language.** Text in another language goes in a nested `KvirnProvider`, with `useLocale().localeProps` on your own element (3.1.2 Language of Parts, AA).

## Visual / modes

Heading ships no CSS of its own. With the default theme, `kv-heading` sets the heading colour and font family (the theme's contrast check covers it, 1.4.3 Contrast (Minimum), AA), and the size class sets the type role (`display`, `heading-1` to `heading-6`), in running text and outside it. The sizes fall in order from `display` to `heading-6`. Below 40rem `display`, `heading-1`, `heading-2` and `heading-3` step down; levels 4 to 6 don't. They are told apart by size first, then weight and letter spacing. `heading-6` is smaller than the body text, which WCAG allows: it sets no minimum font size. Sizes are in rem, so they follow the browser's text size (1.4.4 Resize Text, AA). Margins come from `kv-prose` or the consumer. Target size, focus indicator and motion: not applicable.

Right to left and forced colours: a heading sets no directional or background styles, so it starts at the start of the line and keeps the system's text colour (1.4.3 Contrast (Minimum), AA; 1.4.11 Non-text Contrast, AA). Stories in right-to-left text and in forced colours check this.

## WCAG SCs covered

- 1.3.1 Info and Relationships (A): a native heading with the consumer's level. One automated test per level, h1 to h6, and one for the server.
- 1.4.4 Resize Text (AA): the type roles are in rem.
- 2.4.6 Headings and Labels (AA): the text is the consumer's. `as` can't be forgotten.

## AT test record

| AT + browser + OS                                                          | Agent check | Human check | Result | Notes                                                                                                                                  |
| -------------------------------------------------------------------------- | ----------- | ----------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Automated (re-runnable tests)**                                          |             |             |        |                                                                                                                                        |
| axe, WCAG 2.2 A and AA, every story, 4 themes                              | pass        | n/a         | pass   | heading.stories.tsx, every story, 4 themes                                                                                             |
| Markup and ARIA (roles, names, ids, states)                                | pass        | n/a         | pass   | `heading.test.tsx` (axe and role, name and state): `adds only its classes, no role or ARIA, and passes attributes and the ref through` |
| Keyboard contract rows (Vitest browser)                                    | pass        | n/a         | pass   | 1 row, each names a test in `heading.test.tsx`                                                                                         |
| Focus order and management                                                 | n/a         | n/a         | n/a    | a heading is not focusable by itself                                                                                                   |
| Display modes (forced colours, 320px reflow, text spacing, reduced motion) | pass        | n/a         | pass   | the four sweep projects (`storybook-forced-colors`, `-reduced-motion`, `-reflow`, `-text-spacing`), run in CI                          |
| **Core (required for beta)**                                               |             |             |        |                                                                                                                                        |
| NVDA + Chrome + Windows                                                    | n/a         | n/a         | n/a    | native `<h1>` to `<h6>` with its own heading role; only classes added, no state, focus or key handling; nothing to operate             |
| VoiceOver + Safari + iOS                                                   | n/a         | n/a         | n/a    | native `<h1>` to `<h6>` with its own heading role; only classes added, no state, focus or key handling; nothing to operate             |
| **Release (before 1.0 and each minor)**                                    |             |             |        |                                                                                                                                        |
| JAWS + Chrome + Windows                                                    | n/a         | n/a         | n/a    | native `<h1>` to `<h6>` with its own heading role; only classes added, no state, focus or key handling; nothing to operate             |
| TalkBack + Chrome + Android                                                | n/a         | n/a         | n/a    | native `<h1>` to `<h6>` with its own heading role; only classes added, no state, focus or key handling; nothing to operate             |
| VoiceOver + Safari + macOS                                                 | n/a         | n/a         | n/a    | native `<h1>` to `<h6>` with its own heading role; only classes added, no state, focus or key handling; nothing to operate             |

### What to check

With a screen reader and the keyboard, try:

- The headings list shows the levels in order, and each name is clear.

## Known issues

None.
