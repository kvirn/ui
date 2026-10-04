# Accessibility contract: Kbd

- **APG pattern:** none. Kbd is inline text, not a widget.
- **Deviations:** none
- **Native elements used:** `<kbd>`. The consumer can pick another element with `render`, and its own semantics apply.
- **Status:** alpha candidate (Plan 0024). Gates pending. Manual AT is `pending`.
- **Tests:** `kbd.test.tsx` next to this file. `kbd.stories.tsx` in `apps/storybook/src/components/kbd/`.

Kbd is the native `<kbd>` element with a class, so the theme can draw it as a key. It adds no role, ARIA, text or behaviour, so what a user perceives is the text inside it, in the flow of the sentence.

## Roles, states, properties

| Part | Element / role               | ARIA                       | Notes                                                                                                                                                                                                     |
| ---- | ---------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kbd  | `<kbd>` → no role            | none                       | `class="kv-kbd"`. One key per Kbd. Attributes (`id`, `lang`, `aria-*`) and the ref reach the element unchanged. The key name is the content: `Tab`, `Esc`, `Ctrl`                                         |
| Kbd  | nested `<kbd>`               | none                       | A combination is an outer Kbd around one Kbd per key, with the separator as text: `<Kbd><Kbd>Ctrl</Kbd>+<Kbd>C</Kbd></Kbd>`. The theme draws the innermost keys and leaves the outer one plain            |
| Kbd  | `render` (element, function) | the rendered element's own | One element. The function form gets the props to spread and an empty state                                                                                                                                |
| Kbd  | never                        | no `role`, `tabindex`      | No click handler, no live region. A key name is text, so screen readers read it as part of the sentence, and the theme draws no content (no generated text, no icons) that would be skipped or read twice |

## Keyboard

This component has no focusable parts and handles no keys.

| Key | Context | Action                                     | Test                               |
| --- | ------- | ------------------------------------------ | ---------------------------------- |
| –   | Kbd     | Not a Tab stop: no `tabindex`, no handlers | `kbd.test.tsx › is not a Tab stop` |

## Focus management

- Initial focus: not moved. Kbd never moves focus.
- Trap: no.
- Restore to: not applicable.
- A key drawn in text is not a control. Don't make it look pressable: if it must act, use a Button.

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | –          |

Kbd renders no text, so it has no message keys.

## Consumer responsibilities

- **Name the key as printed on the keyboard, and say what it does in words.** `Tab` is the same in every locale, so it is not translated. The sentence around it says what the key is for, and the key is never the only instruction (1.3.3 Sensory Characteristics: "press the key in the box" is not enough).
- **Language.** `lang="en"` on a key name inside a text in another language, so a screen reader doesn't read `Tab` with the page's accent (3.1.2).
- **Offer a way to remember a shortcut that doesn't need a keyboard layout.** A key name differs between keyboards: `Ctrl` is `Cmd` on macOS, and `Enter` is `Retur` on a Swedish Mac. Name what your users have.
- **A character shortcut needs a way to turn it off or remap it** (2.1.4). Kbd only documents a shortcut: it doesn't make one.

## Visual / modes

Headless: Kbd ships no CSS. With `@kvirn-ui/theme/theme.css`, `kv-kbd` (and a bare `kbd` in prose, which gets the same rule) draws a flat key in the inline-code family: the body font at the prose code size, a `surface` background, a 1px `border-control` edge on all four sides, the `sm` radius and `white-space: nowrap`. There is no depth, because depth means "press me" and is for buttons only. A grouping `kbd` is plain, inherits the font, stays on one line and spaces its keys by `space-1`. Text on `surface` is measured at 4.5:1 or more by `theme:check` (1.4.3). The edge is not required by 1.4.11, since the key name is text, but it stays at `border-control` so a low-vision user at 200% sees a key and not a word. The size is in rem-relative `em`, so it follows the browser's text size (1.4.4). The shape and edge are not colour cues, and in forced colours the edge is `CanvasText`. Target size, focus indicator and motion: not applicable, because Kbd is not a control.

## WCAG SCs covered

- 1.3.1 Info and Relationships: keyboard input is marked up as `<kbd>` and not as styled text (`kbd.test.tsx › renders a kbd, no role…`).
- 1.4.3 Contrast: the key's text on its background, measured by `theme:check`.
- 1.4.4 Resize Text: the size is in rem.
- 3.1.2 Language of Parts: the consumer's `lang` reaches the element (`kbd.test.tsx › renders a kbd, no role…`).

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
