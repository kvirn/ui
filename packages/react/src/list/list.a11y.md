# Accessibility contract: List

- **APG pattern:** none. List is static content, not a widget.
- **Deviations:** none
- **Native elements used:** `<ul>` (default) or `<ol>` with `as="ol"`, and `<li>`. `as` is `'ul' | 'ol'` only.
- **Status:** alpha candidate (Plan 0095). Gates pending. Manual AT is `pending`.
- **Tests:** `list.test.tsx` next to this file. `list.stories.tsx` in `apps/storybook/src/components/list/`.

List is the native list with a class and a few typed choices, so link lists, related links and footer link groups are one component instead of a `<ul role="list">` repeated per pattern. It adds no text, no behaviour and no `tabindex`. A list of links is a list, not a navigation: the consumer wraps it in a named `nav` when it is one.

## Roles, states, properties

| Part      | Element / role                        | ARIA                               | Notes                                                                                                                                                                                                                                                                                         |
| --------- | ------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| List.Root | `<ul>` or `<ol>` → `list`             | `role="list"` with no marker       | `class="kv-list"`, plus `kv-list--bullet` or `-decimal` for `marker`, and `kv-list--gap-2`, `-6` or `-8` for `gap` (the default `4` adds none). WebKit and VoiceOver drop the list role under `list-style: none`, so a list without a marker carries `role="list"`. A `role` of your own wins |
| List.Root | `marker="bullet"`, `marker="decimal"` | none                               | The list keeps its markers, so the native role is intact and no role is added                                                                                                                                                                                                                 |
| List.Item | `<li>` → `listitem`                   | none                               | No class, no role. Attributes and the ref reach the element. A link item is `<List.Item><Link.Root href>…</Link.Root></List.Item>`                                                                                                                                                            |
| List.Root | never                                 | no name, `tabindex`, `aria-hidden` | No `aria-label` by default. No heading, handler or live region                                                                                                                                                                                                                                |

`marker="decimal"` is for `as="ol"`: on a `ul` the numbers say nothing about order to assistive technology, so a `ul` with it warns once in development (`list-decimal-on-ul`). `marker="bullet"` on an `ol` is allowed: the order is still announced.

## Keyboard

This component has no focusable parts and handles no keys.

| Key       | Context | Action                                                                            | Test                                                                                                   |
| --------- | ------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Tab       | List    | Not a Tab stop: no `tabindex`, no handlers. Links inside follow the Link contract | `list.test.tsx › renders a ul or an ol with li items and keeps its class next to a consumer className` |
| Shift+Tab | List    | Not a Tab stop. The links inside keep the DOM order                               | `list.test.tsx › renders a ul or an ol with li items and keeps its class next to a consumer className` |

## Focus management

- Initial focus: not moved. List never moves focus.
- Trap: no.
- Restore to: not applicable.

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | –          |

List renders no text, so it has no message keys.

## Consumer responsibilities

- **A list of links is a list, not a navigation.** When it is navigation, wrap it in a `<nav>` with an accessible name (`aria-label` or `aria-labelledby`), and don't repeat the name inside it (1.3.1, 2.4.1).
- **Link text makes sense alone.** Each link names its target without the text around it (2.4.4).
- **Use `as="ol"` when order matters,** and `marker="decimal"` only then (1.3.1).
- **Items are `List.Item`.** Put nothing but `List.Item` directly in `List.Root`; a nested list goes inside an item.
- **Language.** `lang` on an item in another language than the page (3.1.2).

## Visual / modes

Headless: List ships no CSS. With `@kvirn-ui/theme/theme.css`, `kv-list` is a grid with a `space` gap, no marker and no indent. `bullet` and `decimal` draw outside markers in the text colour, indented in rem (1.4.4). Target size and the focus indicator belong to the links inside. forced-colors: markers use the text colour, which the system maps. Motion: none.

## WCAG SCs covered

- 1.3.1 Info and Relationships, 4.1.2 Name, Role, Value: a list is a list with a count, with or without markers (`list.test.tsx › adds role="list" without a marker only, and a consumer role wins`).
- 1.4.4 Resize Text: sizes are in rem.

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
