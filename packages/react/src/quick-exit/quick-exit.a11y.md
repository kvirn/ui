# Accessibility contract: QuickExit

- **APG pattern:** none. QuickExit is a native link that navigates.
- **Deviations:** a document-level Shift ×3 shortcut, on by default (maintainer decision). `shortcut={false}` removes it. It also works in text fields: a Shift counts only when pressed alone.
- **Native elements used:** `<div>` (Root), `<a href>` (Link).
- **Status:** alpha candidate. Accessibility-reviewer APPROVE. Manual AT is `pending`.
- **Tests:** `quick-exit.test.tsx` next to this file, and `packages/core/src/quick-exit/shift-sequence.test.ts`.

## Roles, states, properties

| Part | Element / role | ARIA                   | Notes                                                                                                                                                                                                                                                  |
| ---- | -------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Root | `<div>`        | none                   | `class="kv-quick-exit"`, `data-state="idle"`, `"armed"` after one or two Shifts, `"leaving"` once the page is hidden                                                                                                                                   |
| Hint | `<p>`          | none                   | `class="kv-quick-exit-hint"`, the sentence `quickExit.hint` ("Or press Shift 3 times."), or your `children`. The link's `aria-describedby` points at it, only while a Hint is mounted. Renders nothing when `shortcut={false}`. No `aria-keyshortcuts` |
| Link | `<a href>`     | none, no role override | `class="kv-quick-exit-link"`, name `quickExit.label`, `rel="noreferrer"` and `referrerpolicy="no-referrer"`, which apply only when the browser follows the link itself. No `href` unless it is an `http(s)` URL, absolute or relative                  |

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** Shift ×3, on by default, `shortcut={false}`

The link is one Tab stop and no focus is moved: the page is replaced. A Shift counts when it is released, and only if no other key or pointer button was pressed while it was down. Escape and arrow keys are not handled.

| Key                                | Context              | Action                                                                                                         | Test                                                                                                                                                                          |
| ---------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tab                                | Before the link      | Moves focus to the link                                                                                        | `quick-exit.test.tsx › keyboard › Tab moves focus to the link and Shift+Tab leaves it`                                                                                        |
| Shift+Tab                          | On the link          | Moves focus to the previous stop. Announces nothing and is not counted                                         | `quick-exit.test.tsx › read aloud › Shift+Tab is silent and is not counted`                                                                                                   |
| Enter                              | Link                 | Hides the page, empties the title, replaces it with `href`                                                     | `quick-exit.test.tsx › keyboard › Enter on the link hides the page, empties the title and navigates`                                                                          |
| Space                              | Link                 | No effect: it is a link                                                                                        | `quick-exit.test.tsx › keyboard › Space does nothing`                                                                                                                         |
| Shift ×3                           | Anywhere on the page | Same as Enter, when `shortcut` is on. Each Shift counts on key up, within `windowMs` of the last (default 5 s) | `quick-exit.test.tsx › keyboard › Shift three times leaves from anywhere on the page`                                                                                         |
| Shift ×1                           | Anywhere on the page | Announces "Press Shift 2 more times…" (polite) and arms                                                        | `quick-exit.test.tsx › read aloud › Shift once says two more presses`                                                                                                         |
| Shift ×2                           | Anywhere on the page | Announces "Press Shift 1 more time…" (polite)                                                                  | `quick-exit.test.tsx › read aloud › Shift twice says one more press`                                                                                                          |
| Any other key                      | Armed                | Resets the count, silently                                                                                     | `quick-exit.test.tsx › keyboard › another key between the Shifts resets the count`                                                                                            |
| Any pause over `windowMs`          | Armed                | Resets the count, silently                                                                                     | `quick-exit.test.tsx › keyboard › presses further apart than the window do not add up`                                                                                        |
| Shift held (repeat)                | Anywhere on the page | Not counted                                                                                                    | `quick-exit.test.tsx › keyboard › a held Shift (repeat) is not counted`                                                                                                       |
| Shift + a letter, or Shift + click | Anywhere on the page | Not counted: only a Shift pressed alone counts.                                                                | `quick-exit.test.tsx › keyboard › Shift three times works in a text field, and typing capitals does not count`, `quick-exit.test.tsx › keyboard › Shift+click is not counted` |
| Alt / Control / Meta + Shift       | Anywhere on the page | Not counted, and resets the count                                                                              | `quick-exit.test.tsx › keyboard › Alt, Control or Meta with Shift is not counted`                                                                                             |
| Shift ×3                           | A text field         | Leaves, like anywhere else                                                                                     | `quick-exit.test.tsx › keyboard › Shift three times works in a text field, and typing capitals does not count`                                                                |
| Shift ×3                           | `shortcut={false}`   | No listener: nothing is counted or announced                                                                   | `quick-exit.test.tsx › keyboard › shortcut={false} ignores Shift three times and announces nothing`                                                                           |

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not applicable. The page is replaced.
- Never obscured by: the theme sticks the row only at viewport height 30rem and up and sets `scroll-padding` for it (2.4.11).

## Announcements

| Event               | Message key (i18n)            | Politeness |
| ------------------- | ----------------------------- | ---------- |
| Shift press 1 and 2 | `quickExit.shortcutRemaining` | polite     |

Nothing is announced on a reset, a timeout or the exit: the page is gone. Without a `KvirnProvider` the announcement is dropped and a development warning says why. The label key is `quickExit.label`.

### Read aloud

Approximated by `@kvirn-ui/testing`'s `readAloud`, with the English (`en`) texts; not NVDA or JAWS output. AT `pending`. The hint is also read as its own paragraph after the link phrase.

| State or action          | Expected phrase(s) as read aloud                 | Live region politeness | Test                                                                                     |
| ------------------------ | ------------------------------------------------ | ---------------------- | ---------------------------------------------------------------------------------------- |
| Idle                     | `link, Leave this page, Or press Shift 3 times.` | none                   | `quick-exit.test.tsx › read aloud › idle reads the link by its name and the hint`        |
| Shift ×1                 | `Press Shift 2 more times to leave this page`    | polite                 | `quick-exit.test.tsx › read aloud › Shift once says two more presses`                    |
| Shift ×2                 | `Press Shift 1 more time to leave this page`     | polite                 | `quick-exit.test.tsx › read aloud › Shift twice says one more press`                     |
| Idle, `shortcut={false}` | `link, Leave this page`, no description          | none                   | `quick-exit.test.tsx › hint › there is no hint and no description when shortcut={false}` |
| Shift+Tab                | nothing                                          | none                   | `quick-exit.test.tsx › read aloud › Shift+Tab is silent and is not counted`              |

## Consumer responsibilities

- Place `QuickExit.Hint` inside Root after the Link while the shortcut is on: without it a development warning says sighted keyboard users are not told about the shortcut.
- Put Root as a direct child of `<body>`, early in the focus order (after the skip link), and pass a neutral `href`.
- Wrap the app in `KvirnProvider`: the Shift count is announced through it.
- NVDA uses Shift to pause speech, so the shortcut can fire by accident. Accepted: it is on by default, `shortcut={false}` opts out.
- `navigate` must replace the history entry with a full navigation (the default `location.replace` does). A router push keeps the entry and leaves a blank page.
- While a modal dialog is open the page is inert, so the link cannot be reached: only the shortcut works.
- A web page cannot clear history, cache or other tabs: say that in your own copy. Earlier history entries remain.
- The anchor's `rel` and `referrerpolicy` apply when the browser follows the link itself. A click and Shift ×3 go through `location.replace`, which uses the page's own policy: set a `Referrer-Policy: no-referrer` header if the destination must not learn where the visitor came from.

## Visual / modes

- A hint you override with a longer sentence (more than 3 lines below 40rem, or 2 lines at 40rem and wider) makes the row taller than the scroll padding the theme sets for the sticky row, so a focused element can end up under it (2.4.11).

Headless: no CSS. With `@kvirn-ui/theme/theme.css` the row is `kv-quick-exit` and the link `kv-quick-exit-link`.

## WCAG SCs covered

- 2.1.1 Keyboard (A): the link and the shortcut work from the keyboard.
- 2.1.4 Character Key Shortcuts (A): not applicable. Shift is a modifier, not a character key; `shortcut={false}` is offered anyway.
- 2.4.7 Focus Visible (AA)
- 2.4.11 Focus Not Obscured (Minimum) (AA)
- 2.5.8 Target Size (Minimum) (AA)
- 3.2.5 Change on Request (AAA): navigation only on activation. Met, though AAA is not the target.
- 4.1.3 Status Messages (AA): the Shift count is announced politely.

## AT test record

| AT + browser + OS                                                          | Agent check | Human check | Result  | Notes                                                                                                                       |
| -------------------------------------------------------------------------- | ----------- | ----------- | ------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Automated (re-runnable tests)**                                          |             |             |         |                                                                                                                             |
| axe, WCAG 2.2 A and AA, every story, 4 themes                              | pass        | n/a         | pass    | quick-exit.stories.tsx, every story, 4 themes                                                                               |
| Markup and ARIA (roles, names, ids, states)                                | pass        | n/a         | pass    | quick-exit.test.tsx › idle reads the link by its name and the hint; expectNoA11yViolations                                  |
| Keyboard contract rows (Vitest browser)                                    | pass        | n/a         | pass    | 14 rows, each names a test (quick-exit.test.tsx › keyboard › Tab moves focus to the link and Shift+Tab leaves it)           |
| Focus order and management                                                 | pass        | n/a         | pass    | quick-exit.test.tsx asserts focus (toHaveFocus); first rule: keyboard › Tab moves focus to the link and Shift+Tab leaves it |
| Display modes (forced colours, 320px reflow, text spacing, reduced motion) | pending     | n/a         | pending | not swept: the sweeps cover Button and SkipPanel                                                                            |
| **Core (required for beta)**                                               |             |             |         |                                                                                                                             |
| NVDA + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                                             |
| VoiceOver + Safari + iOS                                                   | pending     | pending     | pending |                                                                                                                             |
| NVDA / JAWS browse mode, Shift+H ×3                                        | pending     | pending     | pending | Does a backwards quick navigation count as Shift?                                                                           |
| **Release (before 1.0 and each minor)**                                    |             |             |         |                                                                                                                             |
| JAWS + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                                             |
| TalkBack + Chrome + Android                                                | pending     | pending     | pending |                                                                                                                             |
| VoiceOver + Safari + macOS                                                 | pending     | pending     | pending |                                                                                                                             |

## Known issues

- **Keyboard tests run in Chromium only.** The keyboard rows run in Vitest browser mode on Chromium, not in WebKit. Test in Safari with your own assistive technology.
- **NVDA pauses speech with Shift,** so the shortcut can fire by accident. `shortcut={false}` opts out.
- **Browse-mode quick navigation:** in NVDA and JAWS, backwards quick navigation (Shift+H, Shift+K, Shift+1 to 6) may reach the page as a lone Shift and count, so three backwards heading jumps could leave the page. Check it with NVDA and JAWS in your service.
- **fi, nb and nn strings:** have a native speaker review them before you launch.
