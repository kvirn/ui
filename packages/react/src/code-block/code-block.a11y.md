# Accessibility contract: CodeBlock

- **APG pattern:** none. A code block is static text, so there is no APG pattern. Its one control is a [CopyButton](../copy-button/copy-button.a11y.md).
- **Deviations:** none
- **Native elements used:** `<pre>` for the code, `<p>` for the label, `<button>` for Copy.
- **Status:** alpha candidate (Plan 0060). Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `code-block.test.tsx` next to this file. `code-block.stories.tsx` in `apps/storybook/src/components/code-block/`.

A CodeBlock shows a code sample or a reference with a copy button. The code wraps, so there is no scroller to reach and no 2D scrolling (1.4.10). There is no syntax highlighting, so no colour carries meaning (1.4.1).

## Roles, states, properties

| Part            | Element / role                  | ARIA                                                          | Notes                                                                                                                                                                                                                                                                 |
| --------------- | ------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CodeBlock.Root  | `<div>` → `generic`, or `group` | `role="group"` and `aria-labelledby` while a Label is mounted | `class="kv-code-block"`. Without a Label it is a plain `<div>`. Also exported as `CodeBlockRoot`                                                                                                                                                                      |
| CodeBlock.Label | `<p>` → `paragraph`             | `id`, set by the Root                                         | `class="kv-code-block-label"`. It names the group. Also exported as `CodeBlockLabel`                                                                                                                                                                                  |
| CodeBlock.Code  | `<pre>` → `generic`             | none                                                          | `class="kv-code-block-code"`. Never a Tab stop, no `tabindex`, no `overflow`. Put `<code>` inside it if you want. Also exported as `CodeBlockCode`                                                                                                                    |
| CodeBlock.Copy  | `<button>` → `button`           | as CopyButton                                                 | `class="kv-button kv-code-block-copy"`. Copies the Code's text. On failure it selects the Code. Also exported as `CodeBlockCopy`. It inherits the CopyButton's `span.kv-copy-status` after the button (`status={false}` removes it); there is no separate Status part |
| every part      | attributes                      | passed through                                                | One element per part, always the same: no `as`. `className` joins the part's class, the ref gets the element                                                                                                                                                          |

`useCodeBlock()` gives `rootProps`, `labelProps`, `codeProps` and the values the parts share.

## Allowed elements

No part takes `as`.

| Part       | `as` | Why                                                                                                                                     |
| ---------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| every part | none | Root is a `group` named by the Label (an element would not change that), Label a `<p>` (never a heading), Code a `<pre>` (1.3.1, 4.1.2) |

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

The Code is text and not a Tab stop. The Copy button is a native `<button>`: see [copy-button.a11y.md](../copy-button/copy-button.a11y.md) for Enter, Space and the failure rows.

| Key       | Context   | Action                                                             | Test                                                                                     |
| --------- | --------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Tab       | CodeBlock | Moves focus to the Copy button. The Code and the Label are skipped | `code-block.test.tsx › keyboard › Tab moves focus to the Copy button and skips the code` |
| Shift+Tab | CodeBlock | Moves focus back off the Copy button                               | `code-block.test.tsx › keyboard › Shift+Tab moves focus off the Copy button`             |
| Enter     | Copy      | Copies the code, announces the result, focus stays on the button   | `code-block.test.tsx › copy › Enter on Copy writes the code and keeps focus`             |

Space, Escape, arrow keys and Home / End are not handled by the CodeBlock. The Copy button handles Space natively (CopyButton contract).

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not applicable. After a copy or a failure, focus stays on Copy.
- Never obscured by: CodeBlock renders no overlay.

## Announcements

| Event            | Message key (i18n)  | Politeness |
| ---------------- | ------------------- | ---------- |
| Copy succeeded   | `copyButton.copied` | polite     |
| Copy was refused | `copyButton.failed` | assertive  |

CodeBlock has no strings of its own: the Label is your text. The keys belong to CopyButton and are overridden with `messages` on `CodeBlock.Copy`. The visible status shows the same words. `copied` clears after 5 s or on the next press; `failed` stays until the next press (CopyButton contract).

## Consumer responsibilities

- Give the block a Label that says what it is ("Install", "Example request") so the group has a name (1.3.1, 2.4.6). A block without one is a plain `div`.
- `lang` on the code or the label if it isn't in the page's language (3.1.2). Code is mostly language-neutral, but a comment or a message in it is not.
- A long line wraps at any character, so say the exact text in prose when a break would mislead (a path, a hyphenated token).
- No syntax highlighting: don't convey meaning by colour in the code (1.4.1).

## Visual / modes

Headless: CodeBlock ships no CSS. With `@kvirn-ui/theme/theme.css`:

- Focus indicator: Copy's (a Button). The Code is never focused.
- Target size: Copy is a Button (2.5.8).
- Contrast: `text` on `surface` (the prose `pre` pair, in `theme:check`), 1.4.3.
- forced-colors behaviour: the code keeps a `CanvasText` edge.
- reduced-motion behaviour: no motion.
- Layout: a wrapping row. The Label and the Code take a full row each; Copy and its status share the last row, and the failure text wraps below Copy at 320px. Status words and icon are `CanvasText` in forced colours; the icons don't mirror in RTL.
- Reflow and text spacing: `white-space: pre-wrap` and `overflow-wrap: anywhere`, no `overflow`: no horizontal scroll at 320 CSS px and nothing clipped at 400% zoom or the 1.4.12 spacing (1.4.10, 1.4.12; reviewed in the stories).

## WCAG SCs covered

- 1.3.1 Info and Relationships: the group is named by the Label (`code-block.test.tsx › group`).
- 1.4.10 Reflow, 1.4.12 Text Spacing: the code wraps, no scroll region.
- 2.1.1 Keyboard, 2.4.3 Focus Order: the one Tab stop is Copy, after the Code in DOM order.
- 4.1.3 Status Messages, 1.4.1, 3.3.1: through CopyButton, which draws the result as words after the button (`code-block.test.tsx › copy › Copy shows the visible status after the button, and status={false} removes it`).

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
- **No syntax highlighting** (it would be a dependency, and colour must not carry meaning).
- **The name is set after hydration.** The CodeBlock Label names the group after hydration, not in the server HTML. Without JavaScript the code block has no name, though the label text still comes before it in reading order.
