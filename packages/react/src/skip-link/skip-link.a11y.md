# Accessibility contract: SkipLink

- **APG pattern:** none. WCAG technique G1 (a link at the top to skip to the main content) with C7 (hide it until it has focus).
- **Deviations:** none. Activating the link moves focus, which is the documented exception to "no focus moves": it is the purpose of the control.
- **Native elements used:** `<a href="#id">`, never `Link.Root`: a hash on the same page is not a route.
- **Status:** alpha candidate (Plan 0054). Gates pending. Manual AT is `pending`.
- **Tests:** `skip-link.test.tsx` next to this file. `skip-link.stories.tsx` in `apps/storybook/src/components/skip-link/`, where `theme.css` is loaded and the visible state is proved.

SkipLink is a native link with a class. It is the first Tab stop in the body, hidden until it has focus, and it moves focus to the main content.

## Roles, states, properties

| Part     | Element / role         | ARIA                | Notes                                                                                                                                                                                                       |
| -------- | ---------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SkipLink | `<a href>` → `link`    | none                | `class="kv-skip-link"`. The name is the rendered text, the message `skipLink.label` or your children: text and not `aria-label`, so it is translated and found. `href` is required and is a same-page `#id` |
| Target   | the consumer's element | none                | Not focusable by itself: the link adds `tabindex="-1"` on activation and removes it on blur. A target that is already focusable (`tabindex` 0 or -1, a control) is left alone                               |
| SkipLink | `as`                   | the component's own | A component that renders an `<a href>` and forwards its ref. It gets the other props, the ref and the part's class (`className` joins, handlers chain, refs merge)                                          |

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

Native tab order. No key is intercepted.

| Key       | Context            | Action                                                                                           | Test                                                                                                           |
| --------- | ------------------ | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Tab       | page load or start | Focuses the skip link (it shows in flow: the `Default` story)                                    | `skip-link.test.tsx › SkipLink keyboard › the first Tab stop is the skip link`                                 |
| Tab       | on the skip link   | Moves to the next stop (the wordmark), the link hides again                                      | `skip-link.test.tsx › SkipLink keyboard › Tab leaves the skip link for the next stop`                          |
| Shift+Tab | on the skip link   | Leaves the page content backwards (browser UI)                                                   | `skip-link.test.tsx › SkipLink keyboard › Shift+Tab from the skip link leaves the document`                    |
| Enter     | on the skip link   | Focuses the target (`tabindex="-1"` added if it was not focusable); the next Tab continues in it | `skip-link.test.tsx › SkipLink keyboard › Enter moves focus to the target and the next Tab continues after it` |
| Space     | on the skip link   | Not handled (a link; the page scrolls natively)                                                  | `skip-link.test.tsx › SkipLink keyboard › Space is not handled`                                                |

The visible state is proved in the `Default` story, where the theme is loaded: hidden before Tab, shown in flow while focused, hidden after Tab.

## Focus management

- Initial focus: not moved. The link is a Tab stop and nothing else.
- On activation: `getElementById(target).focus()`. The click handler does not call `preventDefault`, so the native hash scroll, `scroll-padding-top` and, without JavaScript, the jump and the sequential focus starting point still work.
- A target made focusable has `tabindex="-1"` until it loses focus (`SkipLink target › a target without tabindex gets tabindex -1 until it loses focus, then it is removed`). A target already focusable is left alone (`a target that is already focusable is left alone`, `a target with its own tabindex -1 keeps it after blur`).
- Trap: no. Restore to: not applicable.

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | –          |

Moving focus to the target reads its name or content. The only string is the link's label, `skipLink.label`.

## Consumer responsibilities

- **Put it first in the body,** before the header and any other link, and give the main content the id (`<main id="main">`).
- **A missing target warns** in development: `skip-link-target-missing:<id>`.
- **Language.** A custom label is your own string: set `lang` if it differs from the page (3.1.2).
- **Do not hide the target's focus ring.** The target shows the token ring under `:focus-visible` only (the theme's `:where([tabindex='-1']:focus-visible)` rule): no `outline: none` on `[tabindex="-1"]`.
- **Do not put it in a sticky layer that covers other content** (2.4.11): it stays in the flow.

## Visual / modes

Headless: no CSS. With `@kvirn-ui/theme/theme.css`, the link is clipped to a 1px box until it has `:focus`, then in flow (`position: static`) with the `link` colour on `canvas` (measured by `theme:check`, 1.4.3), an underline (1.4.1), the token focus ring under `:focus-visible` (2.4.7), space margins and a target of at least 24px (2.5.8). Nothing is hidden with `display: none`. It reflows with the page (1.4.10). Forced colours: `LinkText` on `Canvas` and a `Highlight` ring, with no background reliance.

## WCAG SCs covered

- 2.4.1 Bypass Blocks: the link jumps to the main content (`Enter moves focus to the target…`).
- 2.4.3 Focus Order: first stop; the next Tab continues in the target.
- 2.4.7 Focus Visible, 2.4.11 Focus Not Obscured: visible and in flow while focused (`Default` story).
- 2.5.8 Target Size, 1.4.10 Reflow, 1.4.3 and 1.4.11 Contrast: the theme, by `theme:check`.
- 3.1.2 Language of Parts: the consumer's `lang` on a custom label.
- 4.1.2 Name, Role, Value: `link` named by its text (`the name is the default label…`, axe tests).

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

- The `fi`, `nb` and `nn` drafts need a native review.
- Whether `:focus-visible` matches on the programmatic focus after a keyboard activation in WebKit: not automated, `pending`.
