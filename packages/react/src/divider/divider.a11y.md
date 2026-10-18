# Accessibility contract: Divider

- **APG pattern:** none. Divider is static content, not a widget.
- **Deviations:** none
- **Native elements used:** `<hr>`. No `as`: the element is the semantics.
- **Status:** alpha candidate. Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `divider.test.tsx` next to this file. `divider.stories.tsx` in `apps/storybook/src/components/divider/`.

Divider is the native `<hr>` element with a class, so the theme can draw and space it. It adds no ARIA, text or behaviour. `<hr>` has the implicit `separator` role: a thematic break that some screen readers announce.

## Roles, states, properties

| Part    | Element / role                | ARIA                           | Notes                                                                                  |
| ------- | ----------------------------- | ------------------------------ | -------------------------------------------------------------------------------------- |
| Divider | `<hr>` → implicit `separator` | none                           | `class="kv-divider"`. Attributes and the ref reach the element unchanged               |
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

## Consumer responsibilities

- **Pick the role on purpose.** Keep the default `separator` when the blocks on each side are different topics. Pass `role="presentation"` when the line is only decoration (1.3.1).
- **Don't carry meaning in the line alone.** What the line separates must also be clear from headings or text (1.4.1, 1.3.1).
- **Keep your own colour visible.** If you change `--kv-divider-color`, keep it visible against the background when the line matters to understanding (1.4.11).

## Visual / modes

Headless: Divider ships no CSS. With `@kvirn-ui/theme/theme.css`, `kv-divider` draws a hairline in the subtle border colour with a block margin; margin, width, style and colour are CSS variables. The line is a border, not a background, so it stays visible in forced colours. Sizes are in tokens (rem). Target size and focus indicator: not applicable. Motion: none.

## WCAG SCs covered

- 1.3.1 Info and Relationships: a thematic break is the native `<hr>` (`divider.test.tsx › renders an hr element`); a decorative one can be `role="presentation"` (`divider.test.tsx › passes role="presentation" through`).
- 1.4.11 Non-text Contrast: the line is decoration between blocks, not required to understand the content.

## AT test record

| AT + browser + OS                                                          | Agent check | Human check | Result  | Notes                                                                                                                                  |
| -------------------------------------------------------------------------- | ----------- | ----------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Automated (re-runnable tests)**                                          |             |             |         |                                                                                                                                        |
| axe, WCAG 2.2 A and AA, every story, 4 themes                              | pass        | n/a         | pass    | divider.stories.tsx, every story, 4 themes                                                                                             |
| Markup and ARIA (roles, names, ids, states)                                | pass        | n/a         | pass    | `divider.test.tsx` (axe and role, name and state): `renders an hr element`                                                             |
| Keyboard contract rows (Vitest browser)                                    | pass        | n/a         | pass    | 2 rows, each names a test in `divider.test.tsx`                                                                                        |
| Focus order and management                                                 | n/a         | n/a         | n/a     | an hr is not focusable                                                                                                                 |
| Display modes (forced colours, 320px reflow, text spacing, reduced motion) | pending     | n/a         | pending | not swept: the sweeps cover Button and SkipPanel                                                                                       |
| **Core (required for beta)**                                               |             |             |         |                                                                                                                                        |
| NVDA + Chrome + Windows                                                    | n/a         | n/a         | n/a     | native `<hr>` with its own separator role (or `role="presentation"` set by the consumer), no state or key handling; nothing to operate |
| VoiceOver + Safari + iOS                                                   | n/a         | n/a         | n/a     | native `<hr>` with its own separator role (or `role="presentation"` set by the consumer), no state or key handling; nothing to operate |
| **Release (before 1.0 and each minor)**                                    |             |             |         |                                                                                                                                        |
| JAWS + Chrome + Windows                                                    | n/a         | n/a         | n/a     | native `<hr>` with its own separator role (or `role="presentation"` set by the consumer), no state or key handling; nothing to operate |
| TalkBack + Chrome + Android                                                | n/a         | n/a         | n/a     | native `<hr>` with its own separator role (or `role="presentation"` set by the consumer), no state or key handling; nothing to operate |
| VoiceOver + Safari + macOS                                                 | n/a         | n/a         | n/a     | native `<hr>` with its own separator role (or `role="presentation"` set by the consumer), no state or key handling; nothing to operate |

## Known issues

None.
