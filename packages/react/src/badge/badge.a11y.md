# Accessibility contract: Badge

- **APG pattern:** none. Badge is inline text, not a widget.
- **Deviations:** none
- **Native elements used:** `<span>`. The consumer can pick another element with `render`, and its own semantics apply.
- **Status:** alpha candidate (Plan 0059). Gates pending. Manual AT is `pending`.
- **Tests:** `badge.test.tsx` next to this file. `badge.stories.tsx` in `apps/storybook/src/components/badge/`.

Badge is a `<span>` with a class, so the theme can draw a short status or category as a pill. It adds no role, ARIA, text or behaviour, so what a user perceives is the text inside it, in the flow of the page. The text is the status: the colour only adds to it.

## Roles, states, properties

| Part  | Element / role               | ARIA                       | Notes                                                                                                                                                                                |
| ----- | ---------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Badge | `<span>` → no role           | none                       | `class="kv-badge"`, plus `kv-badge--<variant>` for `primary`, `info`, `success`, `warning` and `danger`. Attributes (`id`, `lang`, `aria-*`) and the ref reach the element unchanged |
| Badge | `render` (element, function) | the rendered element's own | One element. The function form gets the props to spread and `{ variant }` as its state                                                                                               |
| Badge | never                        | no `role`, `tabindex`      | No `role="status"`, no live region, no click handler, no icon and no generated text: the words are the consumer's children, so nothing is skipped or read twice                      |

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

- **Words, always.** The text says the status (`Beviljad`, `Väntar på komplettering`): the colour is only a second cue (1.4.1). Never an empty badge, a dot or an icon alone.
- **Give it context.** A badge next to a title reads as part of it. Where "Beviljad" alone is unclear, label what it is for in the surrounding text (a "Status" term in a summary list).
- **Keep it short.** A badge is one word or a few; it does not wrap (`white-space: nowrap`). Long text belongs in a paragraph.
- **Language.** `lang` on a badge in a text of another language (3.1.2).
- **Changing status.** Announce a change in your own live region if the user needs to hear it (4.1.3).

## Visual / modes

Headless: Badge ships no CSS. With `@kvirn-ui/theme/theme.css`, `kv-badge` draws a pill: `body-small` text, the `full` radius, `space-1` by `space-2` padding and a 1px edge. Neutral is `text` on `surface` with a `border-control` edge; `primary` is `link` on `primary-subtle`; `info` is `text` on `primary-subtle`; `success`, `warning` and `danger` are `text` on their `-subtle` background. Every pair is measured by `theme:check` at 4.5:1 or more (1.4.3). The edge is not required by 1.4.11, since the words carry the meaning. The size follows the browser's text size (1.4.4). In forced colours the edge is `CanvasText`. Target size, focus indicator and motion: not applicable, because Badge is not a control.

## WCAG SCs covered

- 1.3.1 Info and Relationships: a status is text in an element, not an image or a background (`badge.test.tsx › renders a span, no role or ARIA…`).
- 1.4.1 Use of Color: the consumer's words are the status (story `Variants`, axe in every theme).
- 1.4.3 Contrast: the text on its background, measured by `theme:check`.
- 1.4.4 Resize Text: the size is in rem.
- 3.1.2 Language of Parts: the consumer's `lang` reaches the element.

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
| **Release (before 1.0 and each minor)**  |         |        |        |       |
| JAWS + Chrome + Windows                  | pending |        |        |       |
| NVDA + Chrome + Windows                  | pending |        |        |       |
| Narrator + Edge + Windows                | pending |        |        |       |
| Dragon / Voice Control                   | pending |        |        |       |

## Known issues

None.
