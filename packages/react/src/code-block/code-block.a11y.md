# Accessibility contract: CodeBlock

- **APG pattern:** none. A code block is static text, so there is no APG pattern. Its one control is a CopyButton (see the CopyButton page).
- **Deviations:** none
- **Native elements used:** `<pre>` for the code, `<p>` for the label, `<button>` for Copy.
- **Status:** alpha candidate. Accessibility-reviewer pending. Manual AT is `pending`.
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

The Code is text and not a Tab stop. The Copy button is a native `<button>`. The CopyButton page describes Enter, Space and what happens when copying fails.

| Key       | Context   | Action                                                             | Test                                                                                     |
| --------- | --------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Tab       | CodeBlock | Moves focus to the Copy button. The Code and the Label are skipped | `code-block.test.tsx › keyboard › Tab moves focus to the Copy button and skips the code` |
| Shift+Tab | CodeBlock | Moves focus back off the Copy button                               | `code-block.test.tsx › keyboard › Shift+Tab moves focus off the Copy button`             |
| Enter     | Copy      | Copies the code, announces the result, focus stays on the button   | `code-block.test.tsx › copy › Enter on Copy writes the code and keeps focus`             |

Space, Escape, arrow keys and Home / End are not handled by the CodeBlock. The Copy button handles Space natively.

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

CodeBlock has no strings of its own: the Label is your text. The keys belong to CopyButton and are overridden with `messages` on `CodeBlock.Copy`. The visible status shows the same words. `copied` clears after 5 s or on the next press; `failed` stays until the next press (as for CopyButton).

## Consumer responsibilities

- Give the block a Label that says what it is ("Install", "Example request") so the group has a name (1.3.1 Info and Relationships, 2.4.6 Headings and Labels). A block without one is a plain `div`.
- Code or a label that is not in the page's language goes in a nested `KvirnProvider` with `useLocale().localeProps` on your own element (3.1.2 Language of Parts). Code is mostly language-neutral, but a comment or a message in it is not.
- A long line wraps at any character, so say the exact text in prose when a break would mislead (a path, a hyphenated token).
- No syntax highlighting: don't convey meaning by colour in the code (1.4.1 Use of Color).

## Visual / modes

Headless: CodeBlock ships no CSS. With `@kvirn-ui/theme/theme.css`:

- Focus indicator: Copy's, because it is a Button. The Code is never focused.
- Target size: Copy is a Button (2.5.8 Target Size (Minimum), AA).
- Contrast: the code is text on the page surface, and the default theme checks that pair for the minimum contrast (1.4.3 Contrast (Minimum), AA).
- Forced colours: the code keeps a visible edge in the system's text colour. The status words and icon use the system's text colour too.
- Reduced motion: nothing moves.
- Layout: a wrapping row. The Label and the Code take a full row each. Copy and its status share the last row, and the failure text wraps below Copy on a narrow screen. The icons don't flip in right-to-left languages.
- Reflow and text spacing: the code wraps and never scrolls, so there is no sideways scrolling at 320 CSS pixels and nothing is clipped at 400% zoom or with wider text spacing (1.4.10 Reflow, 1.4.12 Text Spacing). This is reviewed in the stories, not by an automated check.

## WCAG SCs covered

- 1.3.1 Info and Relationships (A): the group is named by the Label (`code-block.test.tsx › group`).
- 1.4.10 Reflow (AA) and 1.4.12 Text Spacing (AA): the code wraps and there is no scroll region.
- 2.1.1 Keyboard (A) and 2.4.3 Focus Order (A): the one Tab stop is Copy, after the Code in the page's order.
- 1.4.3 Contrast (Minimum) (AA): the code is text on the page surface, a pair the theme's contrast check measures.
- 2.5.3 Label in Name (A): Copy is a CopyButton, so its name is its visible text and the result never replaces it (`copy-button.test.tsx › the name stays Copy in every state`, `› children replace the label and become the name`). A label of your own should keep its visible words in the name.
- 1.4.1 Use of Color (A), 3.3.1 Error Identification (A) and 4.1.3 Status Messages (AA): through CopyButton, which writes the result as words after the button (`code-block.test.tsx › copy › Copy shows the visible status after the button, and status={false} removes it`) and announces it.

## AT test record

| AT + browser + OS                                                          | Agent check | Human check | Result  | Notes                                                                                                                  |
| -------------------------------------------------------------------------- | ----------- | ----------- | ------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Automated (re-runnable tests)**                                          |             |             |         |                                                                                                                        |
| axe, WCAG 2.2 A and AA, every story, 4 themes                              | pass        | n/a         | pass    | code-block.stories.tsx, every story, 4 themes                                                                          |
| Markup and ARIA (roles, names, ids, states)                                | pass        | n/a         | pass    | `code-block.test.tsx` (axe and role, name and state): `Root is a div, Label a p and Code a pre, with the part classes` |
| Keyboard contract rows (Vitest browser)                                    | pass        | n/a         | pass    | 3 rows, each names a test in `code-block.test.tsx`                                                                     |
| Focus order and management                                                 | pass        | n/a         | pass    | `code-block.test.tsx`: `Enter on Copy writes the code and keeps focus`                                                 |
| Display modes (forced colours, 320px reflow, text spacing, reduced motion) | pass        | n/a         | pass    | the four sweep projects (`storybook-forced-colors`, `-reduced-motion`, `-reflow`, `-text-spacing`), run in CI          |
| **Core (required for beta)**                                               |             |             |         |                                                                                                                        |
| NVDA + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                                        |
| VoiceOver + Safari + iOS                                                   | pending     | pending     | pending |                                                                                                                        |
| **Release (before 1.0 and each minor)**                                    |             |             |         |                                                                                                                        |
| JAWS + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                                        |
| TalkBack + Chrome + Android                                                | pending     | pending     | pending |                                                                                                                        |
| VoiceOver + Safari + macOS                                                 | pending     | pending     | pending |                                                                                                                        |

## Known issues

- **WebKit is not automated.** Keyboard rows run in Vitest browser mode on Chromium. WebKit is not covered by the automated tests, so check Safari with your own users and assistive technology.
- **No syntax highlighting** (it would be a dependency, and colour must not carry meaning).
- **The group gets its name after scripts run.** The Label names the group once the page's scripts run, not in the HTML the server sends. Before that the block is a plain `div`, with the label text just before the code in reading order. This is not an accessibility failure. It matters to your accessibility statement only if your site promises to work without JavaScript.
