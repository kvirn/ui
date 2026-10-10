# Accessibility contract: Site alert

- **APG pattern:** none: an [Alert](../../../../react/src/alert/alert.a11y.md) (content, not a live region) as a named region.
- **Deviations:** none
- **Native elements used:** `<section>` (region), `<p>` for the title, `<a href>`, `<button type="button">` for the optional close.
- **Status:** alpha candidate (plan 0095). Manual AT is `pending`.
- **Tests:** `site-alert.test.tsx` next to this file. `site-alert.stories.tsx` in `apps/storybook/src/patterns/site-chrome/`.

## Roles, states, properties

| Part              | Element / role           | ARIA / state                           | Notes                                                                            |
| ----------------- | ------------------------ | -------------------------------------- | -------------------------------------------------------------------------------- |
| `SiteAlert.Root`  | `<section>` (region)     | `aria-labelledby` the title's id       | Named, so landmark navigation finds it. No `role`, no `aria-live`. One at most   |
| (state)           | `data-tone`              | `warning` or `info`                    | The tone prop. The status word and shape carry it, never colour alone            |
| `SiteAlert.Title` | `<p>`                    | `id`, referenced by the root           | Not a heading: the page has none before its `h1`. Starts with the status word    |
| `SiteAlert.Body`  | `<div>`                  | none                                   | A sentence or two. Optional                                                      |
| `SiteAlert.Link`  | `<a href>`               | none                                   | One link, in `Alert.Actions`                                                     |
| `SiteAlert.Close` | `<button type="button">` | name `alert.close`, from `Alert.Close` | Only when written. Removes the alert and moves focus to `main`. Never on a timer |

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key          | Context  | Action                                              | Test                                                                     |
| ------------ | -------- | --------------------------------------------------- | ------------------------------------------------------------------------ |
| Tab          | in alert | Moves from the link to Close, then on into the page | `alert.test.tsx › Tab reaches the close button after the actions`        |
| Shift+Tab    | in alert | Moves back from Close to the link                   | `alert.test.tsx › Shift+Tab from the close button goes back to the link` |
| Enter, Space | Close    | Dismisses the alert and moves focus to `main`       | `site-alert.test.tsx › Close moves focus to main, not body`              |

The alert handles no other key.

## Focus management

- Initial focus: not moved. The alert never takes focus on load.
- Trap: no.
- Restore to: `main` (the skip target, or the id in `mainId`; `tabindex="-1"` until it loses focus), never `body`. With no element of that id, the first heading after the alert.
- Never obscured by: nothing is sticky.

## Announcements

None. It is content in reading order, found as a region. Dismissing announces nothing: focus moves to `main`.

## Consumer responsibilities

- Place it after the banner and before the breadcrumb and `main`, as a child of `PageFrame.Root` in that order. One at most.
- Remember a dismissal for the session (`onDismiss`) and keep the title one line of plain words.
- The skip link jumps over the alert: it is found by landmark navigation (spec question 2).

## Visual / modes

- Focus indicator: the token ring on the link and Close.
- Target size: Close and the link are at least 24px (2.5.8).
- forced-colors behaviour: the alert keeps its border; the status shape and word carry the status.
- reduced-motion behaviour: nothing animates.
- RTL: logical properties.

## WCAG SCs covered

1.3.1, 1.4.1, 1.4.10, 2.4.1, 2.4.4, 2.5.8, 3.2.2, 4.1.3 (nothing announced on purpose).

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

## Known issues

- none
