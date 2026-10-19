# Accessibility contract: Badge

- **APG pattern:** none. Badge is inline text, not a widget.
- **Deviations:** none
- **Native elements used:** `<span>`. The consumer can pick `<strong>` or `<em>` with `as` (allowed elements below), and its own semantics apply.
- **Status:** alpha candidate. Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `badge.test.tsx` next to this file. `badge.stories.tsx` in `apps/storybook/src/components/badge/`.

Badge is a `<span>` with a class, so the theme can draw a short status or category as a pill. It adds no role, ARIA, text or behaviour, so what a user perceives is the text inside it, in the flow of the page. The text is the status: the colour only adds to it.

## Roles, states, properties

| Part  | Element / role     | ARIA                     | Notes                                                                                                                                                                        |
| ----- | ------------------ | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Badge | `<span>` → no role | none                     | `class="kv-badge"`, plus `kv-badge--<variant>` for `primary`, `info`, `success`, `warning` and `danger`. Attributes (`id`, `aria-*`) and the ref reach the element unchanged |
| Badge | `as`               | the chosen element's own | One element, chosen with a string. A value outside the list is a type error. `className` joins, the ref gets the element                                                     |
| Badge | never              | no `role`, `tabindex`    | No `role="status"`, no live region, no click handler, no icon and no generated text: the words are the consumer's children, so nothing is skipped or read twice              |

## Allowed elements

A tag outside the list changes the page's outline or semantics (1.3.1 Info and Relationships, A; 4.1.2 Name, Role, Value, A). `as` is a string, so it works from a Server Component.

| Part  | `as`                             | Why                                                                                                               |
| ----- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Badge | `span` (default), `strong`, `em` | Inline phrasing text, with or without emphasis. No block or interactive element: a Badge is a word, not a control |

## Keyboard

This component has no focusable parts and handles no keys.

| Key | Context | Action                                     | Test                                 |
| --- | ------- | ------------------------------------------ | ------------------------------------ |
| –   | Badge   | Not a Tab stop: no `tabindex`, no handlers | `badge.test.tsx › is not a Tab stop` |

## Focus management

- Initial focus: not moved. Badge never moves focus.
- Trap: no.
- Restore to: not applicable.
- A badge is not a control. Don't make it look pressable: if it must act, use a Button or a Toggle.

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | –          |

Badge renders no text of its own, so it has no message keys. A badge that changes after load is announced, if at all, by a live region of the consumer's.

## Consumer responsibilities

- **Words, always.** The text says the status ("Granted", "Waiting for more information"): the colour is only a second cue (1.4.1 Use of Color, A). Never an empty badge, a dot or an icon alone.
- **Give it context.** A badge next to a title reads as part of it. Where "Granted" alone is unclear, label what it is for in the surrounding text (a "Status" term in a definition list).
- **Keep it short.** A badge is one word or a few; it does not wrap. Long text belongs in a paragraph.
- **Language.** Text in another language goes in a nested `KvirnProvider`, with `useLocale().localeProps` on your own element (3.1.2 Language of Parts, AA).
- **Changing status.** Announce a change in your own live region if the user needs to hear it (4.1.3 Status Messages, AA).

## Visual / modes

Headless: Badge ships no CSS. With the theme stylesheet (`@kvirn-ui/theme`), a badge is a pill: small text, fully rounded corners, a little padding and a thin edge. Neutral is the text colour on the surface colour with a control edge; the primary variant is the link colour on a tinted primary background; the info variant is the text colour on that tinted background; success, warning and danger are the text colour on their own tinted backgrounds. Every pair is measured by the theme's contrast check at 4.5:1 or more (1.4.3 Contrast (Minimum), AA). The edge is not required by 1.4.11 Non-text Contrast (AA), since the words carry the meaning. The size follows the browser's text size (1.4.4 Resize Text, AA). In forced colours the edge uses the system's text colour. Target size, focus indicator and motion: not applicable, because Badge is not a control.

## WCAG SCs covered

- 1.3.1 Info and Relationships (A): a status is text in an element, not an image or a background.
- 1.4.1 Use of Color (A): the consumer's words are the status, and axe finds no violation in any theme.
- 1.4.3 Contrast (Minimum) (AA): the text on its background, measured by the theme's contrast check.
- 1.4.4 Resize Text (AA): the size is in rem.
- 1.4.10 Reflow (AA): a row of short badges wraps between badges at 320 CSS pixels (the reflow sweep runs the badge stories at 320 CSS pixels and checks for sideways scrolling). A single badge never wraps, so one whose text is wider than the viewport would scroll sideways: keep the text short. The sweeps do not use a badge with long text, so check a long badge by eye. The text-spacing sweep checks that no badge clips its text.

## AT test record

| AT + browser + OS                                                          | Agent check | Human check | Result | Notes                                                                                                                                          |
| -------------------------------------------------------------------------- | ----------- | ----------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Automated (re-runnable tests)**                                          |             |             |        |                                                                                                                                                |
| axe, WCAG 2.2 A and AA, every story, 4 themes                              | pass        | n/a         | pass   | badge.stories.tsx, every story, 4 themes                                                                                                       |
| Markup and ARIA (roles, names, ids, states)                                | pass        | n/a         | pass   | `badge.test.tsx` (axe and role, name and state): `renders a span, no role or ARIA, and passes attributes and the ref through`                  |
| Keyboard contract rows (Vitest browser)                                    | pass        | n/a         | pass   | 1 rows, each names a test in `badge.test.tsx`                                                                                                  |
| Focus order and management                                                 | n/a         | n/a         | n/a    | a badge is not a control: nothing in it is focusable                                                                                           |
| Display modes (forced colours, 320px reflow, text spacing, reduced motion) | pass        | n/a         | pass   | the four sweep projects (`storybook-forced-colors`, `-reduced-motion`, `-reflow`, `-text-spacing`), run in CI                                  |
| **Core (required for beta)**                                               |             |             |        |                                                                                                                                                |
| NVDA + Chrome + Windows                                                    | n/a         | n/a         | n/a    | native `<span>`, `<strong>` or `<em>` with no role, read as text in the page; no live region, state, focus or key handling; nothing to operate |
| VoiceOver + Safari + iOS                                                   | n/a         | n/a         | n/a    | native `<span>`, `<strong>` or `<em>` with no role, read as text in the page; no live region, state, focus or key handling; nothing to operate |
| **Release (before 1.0 and each minor)**                                    |             |             |        |                                                                                                                                                |
| JAWS + Chrome + Windows                                                    | n/a         | n/a         | n/a    | native `<span>`, `<strong>` or `<em>` with no role, read as text in the page; no live region, state, focus or key handling; nothing to operate |
| TalkBack + Chrome + Android                                                | n/a         | n/a         | n/a    | native `<span>`, `<strong>` or `<em>` with no role, read as text in the page; no live region, state, focus or key handling; nothing to operate |
| VoiceOver + Safari + macOS                                                 | n/a         | n/a         | n/a    | native `<span>`, `<strong>` or `<em>` with no role, read as text in the page; no live region, state, focus or key handling; nothing to operate |

## Known issues

None.
