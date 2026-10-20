# Accessibility contract: Divider

- **APG pattern:** none. Divider is static content, not a widget.
- **Deviations:** none
- **Native elements used:** `<hr>`. No `as`: the element is the semantics.
- **Status:** alpha candidate. Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `divider.test.tsx` next to this file. `divider.stories.tsx` in `apps/storybook/src/components/divider/`.

Divider is the native `<hr>` element with a class, so the theme can draw and space it. It adds no ARIA attributes, no text and no behaviour. An `<hr>` has the built-in role `separator` (a break between two topics), and some screen readers announce it.

## Roles, states, properties

| Part    | Element / role                | ARIA                           | Notes                                                                                  |
| ------- | ----------------------------- | ------------------------------ | -------------------------------------------------------------------------------------- |
| Divider | `<hr>` → built-in `separator` | none                           | `class="kv-divider"`. Attributes and the ref reach the element unchanged               |
| Divider | `<hr role="presentation">`    | passed through by the consumer | A purely visual line: not announced. The consumer chooses; the component never adds it |
| Divider | never                         | no `tabindex`, name            | It needs no accessible name and is not interactive                                     |

## Keyboard

This component has no focusable parts and handles no keys.

| Key       | Context | Action                                     | Test                                   |
| --------- | ------- | ------------------------------------------ | -------------------------------------- |
| Tab       | Divider | Not a Tab stop: no `tabindex`, no handlers | `divider.test.tsx › is not a Tab stop` |
| Shift+Tab | Divider | Not a Tab stop                             | `divider.test.tsx › is not a Tab stop` |

## Focus management

- Initial focus: not moved. Divider never moves focus.
- Trap: no.
- Restore to: not applicable.

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | –          |

Divider renders no text, so it has no message keys.

### Read aloud

| State or action                                | Expected phrase(s) as read aloud                                                      | Live region politeness | Test                                                                               |
| ---------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------- |
| `<Divider />` between two paragraphs           | `Above`, `separator, …` (the virtual reader adds orientation and value text), `Below` | none                   | `divider.test.tsx › a default divider reads as a separator between the paragraphs` |
| `<Divider role="presentation" />` between them | `Above`, `Below` (no `separator` between the paragraphs)                              | none                   | `divider.test.tsx › a presentation divider reads nothing between the paragraphs`   |

## Consumer responsibilities

- **Pick the role on purpose.** Keep the default `separator` when the blocks on each side are different topics. Pass `role="presentation"` when the line is only decoration, so screen readers skip it (1.3.1 Info and Relationships, A).
- **Don't carry meaning in the line alone.** What the line separates must also be clear from headings or text (1.3.1 Info and Relationships, A; 1.4.1 Use of Color, A).
- **Keep your own colour visible.** If you change `--kv-divider-color`, keep the line clearly visible against the background when it matters to understanding (1.4.11 Non-text Contrast, AA).

## Visual / modes

Divider ships no CSS of its own. With the default theme it is a thin, faint line with space above and below. The space, width, style and colour are CSS variables you can change. The line is a border, not a background, so it stays visible in forced colours mode (the user's own system colours). Target size and focus indicator do not apply, because the line cannot be focused. There is no motion.

## WCAG SCs covered

- 1.3.1 Info and Relationships (A): a break between topics is the native `<hr>` and reads as a separator; a decorative one can be `role="presentation"` and reads nothing.
- 1.4.11 Non-text Contrast (AA): the default line is decoration between blocks, and the content can be understood without it. If you make the line carry meaning, keep your own colour visible.

## AT test record

| AT + browser + OS                                                          | Agent check | Human check | Result | Notes                                                                                                                                                                                                          |
| -------------------------------------------------------------------------- | ----------- | ----------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Automated (re-runnable tests)**                                          |             |             |        |                                                                                                                                                                                                                |
| axe, WCAG 2.2 A and AA, every story, 4 themes                              | pass        | n/a         | pass   | divider.stories.tsx, every story, 4 themes                                                                                                                                                                     |
| Markup and ARIA (roles, names, ids, states)                                | pass        | n/a         | pass   | `divider.test.tsx`: `a default divider reads as a separator between the paragraphs`, `a presentation divider reads nothing between the paragraphs`, `has no axe violations as a separator and as presentation` |
| Keyboard contract rows (Vitest browser)                                    | pass        | n/a         | pass   | 2 rows, each names a test in `divider.test.tsx`                                                                                                                                                                |
| Focus order and management                                                 | n/a         | n/a         | n/a    | an hr is not focusable                                                                                                                                                                                         |
| Display modes (forced colours, 320px reflow, text spacing, reduced motion) | pass        | n/a         | pass   | the four sweep projects (`storybook-forced-colors`, `-reduced-motion`, `-reflow`, `-text-spacing`), run in CI                                                                                                  |
| **Core (required for beta)**                                               |             |             |        |                                                                                                                                                                                                                |
| NVDA + Chrome + Windows                                                    | n/a         | n/a         | n/a    | native `<hr>` with its own separator role (or `role="presentation"` set by the consumer), no state or key handling; nothing to operate                                                                         |
| VoiceOver + Safari + iOS                                                   | n/a         | n/a         | n/a    | native `<hr>` with its own separator role (or `role="presentation"` set by the consumer), no state or key handling; nothing to operate                                                                         |
| **Release (before 1.0 and each minor)**                                    |             |             |        |                                                                                                                                                                                                                |
| JAWS + Chrome + Windows                                                    | n/a         | n/a         | n/a    | native `<hr>` with its own separator role (or `role="presentation"` set by the consumer), no state or key handling; nothing to operate                                                                         |
| TalkBack + Chrome + Android                                                | n/a         | n/a         | n/a    | native `<hr>` with its own separator role (or `role="presentation"` set by the consumer), no state or key handling; nothing to operate                                                                         |
| VoiceOver + Safari + macOS                                                 | n/a         | n/a         | n/a    | native `<hr>` with its own separator role (or `role="presentation"` set by the consumer), no state or key handling; nothing to operate                                                                         |

## Known issues

None.
