# Accessibility contract: VisuallyHidden

- **APG pattern:** none. WCAG technique C7 (hide text visually and keep it for assistive technology).
- **Deviations:** none
- **Native elements used:** `<span>`. The consumer can pick another element with `render`, and its own semantics apply.
- **Status:** alpha candidate (Plan 0054). Gates pending. Manual AT is `pending`.
- **Tests:** `visually-hidden.test.tsx` next to this file. `visually-hidden.stories.tsx` in `apps/storybook/src/components/visually-hidden/`.

VisuallyHidden is a span with a class, so the theme can clip it. It adds no role, ARIA, text or behaviour: its content stays in the accessibility tree and is read in the flow of the sentence.

## Roles, states, properties

| Part           | Element / role               | ARIA                       | Notes                                                                                                                        |
| -------------- | ---------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| VisuallyHidden | `<span>` → no role           | none                       | `class="kv-visually-hidden"`. Attributes (`id`, `lang`, `aria-*`) and the ref reach the element unchanged. The text is yours |
| VisuallyHidden | `render` (element, function) | the rendered element's own | One element. `render={<h2 />}` gives a heading nobody sees. The function form gets the props to spread                       |

## Keyboard

This component has no focusable parts and handles no keys.

| Key | Context        | Action                                     | Test                                                                                    |
| --- | -------------- | ------------------------------------------ | --------------------------------------------------------------------------------------- |
| –   | VisuallyHidden | Not a Tab stop: no `tabindex`, no handlers | `visually-hidden.test.tsx › VisuallyHidden › is not a Tab stop and adds only its class` |

## Focus management

- Initial focus: not moved. Trap: no. Restore to: not applicable.
- **Never put a focusable element inside it:** a control that takes focus and can't be seen fails 2.4.7. The bypass link is its own part, SkipLink.

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | –          |

VisuallyHidden has no strings: its text is the consumer's. It is read as part of the page, not announced.

## Consumer responsibilities

- **Write the text in the page's language,** or set `lang` on the element (3.1.2).
- **Don't hide what everyone needs.** Text that only a screen reader gets is for context (a count, a status word, a name), not for instructions sighted users also need (1.3.3).
- **Keep it out of a focusable element's name only when the name is complete** without it (2.5.3 Label in Name: the visible label must be in the name).

## Visual / modes

Headless: no CSS. With `@kvirn-ui/theme/theme.css`, `kv-visually-hidden` is the standard clip rule: absolutely positioned, a 1px box, `clip-path: inset(50%)`, `overflow: hidden`, `white-space: nowrap`. Never `display: none` or `visibility: hidden`, which would remove it from the accessibility tree. Zero specificity. Forced colours, contrast, target size and motion: not applicable.

## WCAG SCs covered

- 1.3.1 Info and Relationships: context for assistive technology that sighted users get visually (`its text stays in the accessibility tree`).
- 4.1.2 Name, Role, Value: text reaches a control's name through its content.

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
