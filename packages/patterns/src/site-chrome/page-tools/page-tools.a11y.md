# Accessibility contract: Page tools

- **APG pattern:** none: native buttons and a `<time>`. [CopyButton](../../../../react/src/copy-button/copy-button.a11y.md) have their own contracts.
- **Deviations:** none
- **Native elements used:** `<button type="button">`. The last-updated line is your own `<p>` with a `<time datetime>`.
- **Tests:** the pattern adds no behaviour of its own: the copy and its status are proved in `copy-button.test.tsx`, the buttons in `button.test.tsx`. `page-tools.stories.tsx` in `apps/storybook/src/patterns/site-chrome/`.

## Roles, states, properties

| Part                 | Element / role      | ARIA / state                                          | Notes                                                                                       |
| -------------------- | ------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `PageTools.Root`     | `<div>`             | none                                                  | The row at the end of `main`                                                                |
| `PageTools.CopyLink` | `<button>` + status | name from its children or CopyButton's, never changes | The result is `copyButton.copied` or `.failed`, announced by CopyButton                     |
| `PageTools.Print`    | `<button>`          | none                                                  | Its text is its children. Calls `window.print()`, or `onPrint`. Print styles are a 1.0 item |

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key          | Context    | Action                        | Test                                                                         |
| ------------ | ---------- | ----------------------------- | ---------------------------------------------------------------------------- |
| Tab          | in the row | Moves from Copy link to Print | `button.test.tsx › Tab moves focus to the button`                            |
| Shift+Tab    | in the row | Moves back                    | `button.test.tsx › Shift+Tab moves focus off the button`                     |
| Enter, Space | a button   | Copies the link, or prints    | `copy-button.test.tsx › Enter copies the text and keeps focus on the button` |

The row's own keys are the browser's.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not needed. Focus stays on the pressed button.
- Never obscured by: nothing is sticky.

## Announcements

| State or action | Phrase              | Politeness | Test                                                                                        |
| --------------- | ------------------- | ---------- | ------------------------------------------------------------------------------------------- |
| Link copied     | `copyButton.copied` | polite     | `copy-button.test.tsx › announces copyButton.copied politely after a copy`                  |
| Copy failed     | `copyButton.failed` | assertive  | `copy-button.test.tsx › announces copyButton.failed assertively when the write is rejected` |

## Consumer responsibilities

- Put the row at the end of `main`. No third-party share links.
- `PageTools.CopyLink` copies the page's own address unless you pass `text`.
- Write the last-updated line as your own `<p className="kv-page-tools-updated">` with a `<time datetime>`: the pattern holds no text.

## Visual / modes

- Focus indicator: the token ring.
- Target size: buttons are 44px (2.5.8). Each tool is its own line at 320px.
- forced-colors behaviour: buttons keep their border.
- reduced-motion behaviour: nothing animates.
- RTL: logical properties.

## WCAG SCs covered

1.3.1, 1.4.10, 2.5.3, 2.5.8, 3.1.1, 4.1.3.

## AT test record

| AT + browser + OS                       | Agent check | Human check | Result  | Notes |
| --------------------------------------- | ----------- | ----------- | ------- | ----- |
| **Core (required for beta)**            |             |             |         |       |
| NVDA + Chrome + Windows                 | pending     | pending     | pending |       |
| VoiceOver + Safari + iOS                | pending     | pending     | pending |       |
| **Release (before 1.0 and each minor)** |             |             |         |       |
| JAWS + Chrome + Windows                 | pending     | pending     | pending |       |
| TalkBack + Chrome + Android             | pending     | pending     | pending |       |
| VoiceOver + Safari + macOS              | pending     | pending     | pending |       |

## Known issues

- none
