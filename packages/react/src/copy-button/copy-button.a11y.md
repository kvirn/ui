# Accessibility contract: CopyButton

- **APG pattern:** [Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/)
- **Deviations:** none
- **Native elements used:** `<button type="button">`. Activation and the Tab stop are the browser's own. The result is announced through the shared live region of `KvirnProvider` (the Announcer) and drawn in a plain `<span>` after the button.
- **Status:** alpha candidate (Plan 0060). Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `copy-button.test.tsx` next to this file. `copy-button.stories.tsx` in `apps/storybook/src/components/copy-button/`.

A CopyButton is a [Button](../button/button.a11y.md) that writes a text to the clipboard. Its accessible name is its label, "Copy", and it never changes to "Copied": the result is a status message (4.1.3), not a new name. When the browser refuses (no permission, an insecure context, no Clipboard API), the button announces the failure and selects the text where it is shown, so the user can copy it by hand.

## Roles, states, properties

| Part       | Element / role         | ARIA                                                       | Notes                                                                                                                                                                                                                                                                                                                                |
| ---------- | ---------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CopyButton | `<button>` → `button`  | none by default                                            | `type="button"`, `class="kv-button"`. Name from its content: `copyButton.label` ("Copy"), or your `children`. Never changed by the result                                                                                                                                                                                            |
|            | disabled               | native `disabled`                                          | As Button: not focusable, copies nothing. `data-disabled`                                                                                                                                                                                                                                                                            |
|            | disabled and focusable | `aria-disabled="true"`                                     | As Button (`focusableWhenDisabled`): stays in the Tab order and copies nothing                                                                                                                                                                                                                                                       |
|            | result                 | none                                                       | `data-status` is `idle`, `copied` or `failed`. `copied` returns to `idle` after 5 s, or at once when the next press starts. `failed` stays until the next press starts and never times out. It carries no name or description. The user hears the result through the announcement                                                    |
| status     | `<span>` → `generic`   | none: not a live region, no `role`, not `aria-describedby` | `class="kv-copy-status"`, a sibling after the button, never inside it (it would join the name). Decorative `check` / `warning` Icon (`aria-hidden`) plus the words `copyButton.copied` or `copyButton.failed`, so what is seen is what is heard. Not rendered while `idle` or disabled. `status={false}` renders none. Not focusable |
| text       | `textRef` element      | none                                                       | On failure its contents are selected (`Selection.selectAllChildren`). The selection is not focus: focus stays on the button                                                                                                                                                                                                          |

`useCopyButton` gives the same `buttonProps`, a `label` and a `status` for your own `<button>` and your own status text.

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

A native `<button>`: one Tab stop, in DOM order, with no `tabindex`. Enter and Space are native.

| Key       | Context                         | Action                                                                                 | Test                                                                                                      |
| --------- | ------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Tab       | CopyButton                      | Moves focus to the button                                                              | `copy-button.test.tsx › keyboard › Tab moves focus to the copy button`                                    |
| Shift+Tab | CopyButton                      | Moves focus to the previous focusable element, and off the button                      | `copy-button.test.tsx › keyboard › Shift+Tab moves focus off the copy button`                             |
| Tab       | Disabled CopyButton             | Skips the button                                                                       | `copy-button.test.tsx › keyboard › a disabled copy button is skipped by Tab`                              |
| Tab       | Focusable disabled CopyButton   | Moves focus to the button, which copies nothing                                        | `copy-button.test.tsx › keyboard › a focusable disabled copy button is reached by Tab and copies nothing` |
| Enter     | CopyButton                      | Copies the text and announces the result. Focus stays on the button                    | `copy-button.test.tsx › keyboard › Enter copies the text and keeps focus on the button`                   |
| Space     | CopyButton                      | Copies on key up, not on key down, and announces the result. Focus stays on the button | `copy-button.test.tsx › keyboard › Space copies on key up and keeps focus on the button`                  |
| Enter     | CopyButton, the browser refuses | Announces the failure and selects the text. Focus stays on the button                  | `copy-button.test.tsx › failure › Enter on a refused copy selects the text and keeps focus on the button` |

Escape, arrow keys and Home / End are not handled.

## Focus management

- Initial focus: not moved. CopyButton never moves focus.
- Trap: no.
- Restore to: not applicable. After a copy, a failure or a selection, focus stays on the button.
- Never obscured by: CopyButton renders no overlay.

## Announcements

| Event                                 | Message key (i18n)  | Politeness |
| ------------------------------------- | ------------------- | ---------- |
| The text was written to the clipboard | `copyButton.copied` | polite     |
| The browser refused to write it       | `copyButton.failed` | assertive  |

The label key is `copyButton.label`. Nothing is announced on render. Pressing the button again says it again. Without a `KvirnProvider`, the announcement is dropped and a development warning says why. The three message keys can be overridden per instance with `messages`.

## Consumer responsibilities

- Put the text on the page where the user can see it, and pass its element as `textRef`, so a failed copy can select it. Without a `textRef`, the failure is announced and nothing is selected.
- When a page has more than one CopyButton, give each a name that says what it copies (`children`: "Copy reference number", or `aria-label` from your translations), and keep the visible words in the name (2.5.3).
- Wrap the app in `KvirnProvider`: the result is announced through it.
- Don't copy a secret to the clipboard.
- Copy needs a secure context (HTTPS or localhost) and a user activation. Elsewhere it fails, and the text is selected instead.
- The theme-less result cue is yours: with `status={false}` or `useCopyButton`, draw words (not colour alone) from `data-status` after the button. Never put it in the name.
- `lang` on a text in another language (3.1.2).

## Visual / modes

Headless: CopyButton ships no CSS. With `@kvirn-ui/theme/theme.css` it is a Button (`kv-button`): see [button.a11y.md](../button/button.a11y.md). The status (`kv-copy-status`) is 16px `text` with a `text` icon, so no colour carries it (1.4.1) and no new pair is needed.

- Focus indicator, target size, contrast, forced colours: the Button's.
- reduced-motion behaviour: no motion.
- Forced colours: the status words and icon are `CanvasText`. RTL: the status sits at the inline end, and the icons don't mirror.
- Reflow: no horizontal scrolling at 320 CSS px (1.4.10). The failure text wraps below the button.

## WCAG SCs covered

- 4.1.3 Status Messages: `copyButton.copied` and `copyButton.failed` through the live region (`copy-button.test.tsx › announcements`).
- 1.4.1 Use of Color, 1.3.1 Info and Relationships: the visible status is words plus a decorative icon (`copy-button.test.tsx › visible status`).
- 3.3.1 Error Identification: the failure text stays until the next press, so a slow reader or a magnifier user still has the instruction (`copy-button.test.tsx › visible status › failed stays past five seconds and is replaced by the next press`).
- 4.1.2 Name, Role, Value: role `button`, a stable name, `disabled` / `aria-disabled` exposed (`copy-button.test.tsx › name`).
- 2.1.1 Keyboard, 2.4.3 Focus Order: native button; focus never moves (the Keyboard rows).
- 2.5.3 Label in Name: the visible text is the name, and the status never replaces it.
- 3.3.1 Error Identification: a failure says what happened and what to do.

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

- **WebKit is not automated.** Keyboard rows run in Vitest browser mode on Chromium. A WebKit run is not automated, and the manual AT matrix is `pending`.
- **The status is not a live region on purpose:** the Announcer already speaks it, and a second region would say it twice. Browse mode reads the same words.
- **Selection is not read in browse mode** by every screen reader: the failure message tells the user to copy the text themselves.
- **fi, nb, nn and se strings** are drafts or placeholders for native review.
