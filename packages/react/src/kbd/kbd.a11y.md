# Accessibility contract: Kbd

- **APG pattern:** none. Kbd is inline text, not a widget.
- **Deviations:** none
- **Native elements used:** `<kbd>`. `as` accepts only `kbd` (allowed elements below).
- **Status:** alpha candidate. Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `kbd.test.tsx` next to this file. `kbd.stories.tsx` in `apps/storybook/src/components/kbd/`.

Kbd is the native `<kbd>` element with a class, so the theme can draw it as a key. It adds no role, ARIA, text or behaviour, so what a user perceives is the text inside it, in the flow of the sentence.

## Roles, states, properties

| Part | Element / role    | ARIA                  | Notes                                                                                                                                                                                                     |
| ---- | ----------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kbd  | `<kbd>` → no role | none                  | `class="kv-kbd"`. One key per Kbd. Attributes (`id`, `aria-*`) and the ref reach the element unchanged. The key name is the content: `Tab`, `Esc`, `Ctrl`                                                 |
| Kbd  | nested `<kbd>`    | none                  | A combination is an outer Kbd around one Kbd per key, with the separator as text: `<Kbd><Kbd>Ctrl</Kbd>+<Kbd>C</Kbd></Kbd>`. The theme draws the innermost keys and leaves the outer one plain            |
| Kbd  | `as`              | none                  | `kbd` is the only value. Any other value, `samp` included, is a type error and, in JavaScript, warns once in development and renders the default element. `className` joins, the ref gets the element     |
| Kbd  | never             | no `role`, `tabindex` | No click handler, no live region. A key name is text, so screen readers read it as part of the sentence, and the theme draws no content (no generated text, no icons) that would be skipped or read twice |

## Allowed elements

A tag outside the list changes the page's outline or semantics (1.3.1 Info and Relationships (A), 4.1.2 Name, Role, Value (A)). `as` is a string, so it works from a Server Component.

| Part | `as`            | Why                                                                                                 |
| ---- | --------------- | --------------------------------------------------------------------------------------------------- |
| Kbd  | `kbd` (default) | `samp` is text a program prints, not a key, so it is not allowed. Nothing else names keyboard input |

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

- **Name the key as printed on the keyboard, and say what it does in words.** `Tab` is the same in every locale, so it is not translated. The sentence around it says what the key is for, and the key is never the only instruction (1.3.3 Sensory Characteristics (A): "press the key in the box" is not enough).
- **Language.** Key names that are the surrounding language's vernacular (Ctrl, Shift, Tab, Esc in Nordic text) need nothing. A key in another script (Arabic text, say) goes in your own `<span lang="en"><Kbd>Tab</Kbd></span>` (3.1.2 Language of Parts (AA)).
- **Offer a way to remember a shortcut that doesn't need a keyboard layout.** A key name differs between keyboards: `Ctrl` is `Cmd` on macOS, and `Enter` is `Retur` on a Swedish Mac. Name what your users have.
- **A character shortcut needs a way to turn it off or remap it** (2.1.4 Character Key Shortcuts (A)). Kbd only documents a shortcut: it doesn't make one.

## Visual / modes

Headless: Kbd ships no CSS. With the default theme, `kv-kbd` (and a bare `kbd` inside Prose, which gets the same rule) draws a flat key in the same family as inline code: the body font at the code size, a light background, a 1px edge on all four sides, a small corner radius, and no line break inside the key. There is no depth, because depth means "press me" and is for buttons only.

- **Grouping.** An outer `kbd` that holds other keys is plain: it inherits the font, stays on one line and puts a small space between its keys.
- **Contrast.** Text on the key's background is checked automatically at 4.5:1 or more (1.4.3 Contrast (Minimum), AA).
- **The edge** is not required by 1.4.11 Non-text Contrast (AA), since the key name is text. It keeps the contrast of a control's border, so a low-vision user at 200% sees a key and not a word.
- **Text size.** The size is relative to the surrounding text, so it follows the browser's text size (1.4.4 Resize Text, AA).
- **Forced colours.** The edge uses the system's text colour. The shape and edge are not colour cues.
- **Target size, focus indicator and motion:** not applicable, because Kbd is not a control.

## WCAG SCs covered

- 1.3.1 Info and Relationships (A): keyboard input is marked up as `<kbd>` and not as styled text (`kbd.test.tsx › renders a kbd, no role or ARIA, and passes attributes and the ref through`).
- 1.4.3 Contrast (Minimum) (AA): the key's text is dark enough on its background, checked automatically in the default theme.
- 1.4.4 Resize Text (AA): the size follows the browser's text size.

## AT test record

| AT + browser + OS                                                          | Agent check | Human check | Result  | Notes                                                                                                            |
| -------------------------------------------------------------------------- | ----------- | ----------- | ------- | ---------------------------------------------------------------------------------------------------------------- |
| **Automated (re-runnable tests)**                                          |             |             |         |                                                                                                                  |
| axe, WCAG 2.2 A and AA, every story, 4 themes                              | pass        | n/a         | pass    | kbd.stories.tsx, every story, 4 themes                                                                           |
| Markup and ARIA (roles, names, ids, states)                                | pass        | n/a         | pass    | kbd.test.tsx › renders a kbd, no role or ARIA, and passes attributes and the ref through; expectNoA11yViolations |
| Keyboard contract rows (Vitest browser)                                    | pass        | n/a         | pass    | kbd.test.tsx › is not a Tab stop                                                                                 |
| Focus order and management                                                 | n/a         | n/a         | n/a     | nothing focusable: the component never takes or moves focus                                                      |
| Display modes (forced colours, 320px reflow, text spacing, reduced motion) | pending     | n/a         | pending | not swept: the sweeps cover Button and SkipPanel                                                                 |
| **Core (required for beta)**                                               |             |             |         |                                                                                                                  |
| NVDA + Chrome + Windows                                                    | n/a         | n/a         | n/a     | native `<kbd>` with no role, read as text in the sentence; no state, focus or key handling; nothing to operate   |
| VoiceOver + Safari + iOS                                                   | n/a         | n/a         | n/a     | native `<kbd>` with no role, read as text in the sentence; no state, focus or key handling; nothing to operate   |
| **Release (before 1.0 and each minor)**                                    |             |             |         |                                                                                                                  |
| JAWS + Chrome + Windows                                                    | n/a         | n/a         | n/a     | native `<kbd>` with no role, read as text in the sentence; no state, focus or key handling; nothing to operate   |
| TalkBack + Chrome + Android                                                | n/a         | n/a         | n/a     | native `<kbd>` with no role, read as text in the sentence; no state, focus or key handling; nothing to operate   |
| VoiceOver + Safari + macOS                                                 | n/a         | n/a         | n/a     | native `<kbd>` with no role, read as text in the sentence; no state, focus or key handling; nothing to operate   |

## Known issues

None.
