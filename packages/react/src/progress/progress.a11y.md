# Accessibility contract: Progress

- **APG pattern:** none. A progress bar is not a widget and has no keys. The native form, `<progress>` (implicit `progressbar` role), is used only when the value is known.
- **Deviations:** none. Decisions (Plan 0074, design spec `docs/design/status-patterns.md`): no spinner and no indeterminate bar; the text carries an unknown wait; announced once when shown and once when slow, never per percent.
- **Native elements used:** `<div>`, `<p>` and `<span>` for the text, `<progress>` for a known value.
- **Status:** alpha candidate (Plan 0074). Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `progress.test.tsx` next to this file, and `packages/core/src/progress/progress-timer.test.ts` for the timing. `progress.stories.tsx` in `apps/storybook/src/components/progress/`.

Progress says that something is working and, when known, how far along. It is for a wait the user started (a send, a filter, a route), placed where the result will appear or beside the busy button. It renders nothing for the first second, so a quick wait never flashes. Table, Combobox and FileUpload keep their own loading text.

## Roles, states, properties

| Part           | Element / role                | ARIA / state                                                                                                                      | Notes                                                                                                                                                                               |
| -------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Progress.Root  | `<div>`, no role              | `data-state="busy"` or `"slow"`, `data-determinate` with a value. Never `aria-live`, never `aria-busy`                            | Class `kv-progress`. Not rendered before `delayMilliseconds` (1000). Props: `label`, `value`, `max`, `delayMilliseconds`, `slowAfterMilliseconds`, `announce`, `messages`, `render` |
| Progress.Label | `<p>` holding `<span id>`     | none. Never a live region                                                                                                         | Class `kv-progress-label`. The `<span id>` is the label text only; the percent (`kv-progress-percent`) and the slow sentence (`kv-progress-slow`) are separate spans after it       |
| Progress.Bar   | `<progress>` → `progressbar`  | `value`, `max` (100), `aria-labelledby` the label span, `aria-valuetext` (`progress.valueText`: `Exporting cases, 45%`)           | Class `kv-progress-bar`. Renders only with a numeric `value`: an unknown wait has no bar and no `progressbar` role                                                                  |
| `useProgress`  | the same, for your own markup | `isShown`, `isSlow`, `labelId`, `label`, `slowText`, `percent`, `rootProps`, `labelProps`, `barProps` (`undefined` without value) | Render nothing while `isShown` is `false`                                                                                                                                           |

Rules, tested in `progress.test.tsx`:

- **Show delay.** Nothing is rendered or said inside `delayMilliseconds`. A wait that ends inside it is never shown or announced.
- **Name.** The bar is named by the label text only (`aria-labelledby` the span). The slow sentence and the percent are not in the name. Without a `label` the message `progress.loading` is used and a development warning asks for a specific one.
- **No state of its own for the page.** No `aria-busy` from Progress: `aria-busy` belongs on the element whose content is replaced, while it is replaced (Table does this).
- **The percent is text.** The visible percent follows the label, and the bar's value says it. It is never announced.
- **Dev warnings (once):** `progress-without-label`; a Label or Bar outside a Root; no `KvirnProvider` while announcing.

## Keyboard

This component has no focusable parts and handles no keys.

Progress has no focusable part and intercepts no key. It is never a Tab stop.

| Key       | Context                 | Action                                            | Test                                                                                                |
| --------- | ----------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Tab       | before a shown Progress | Passes over it to the next focusable element      | `progress.test.tsx › keyboard › Tab passes over it: it has no focusable part`                       |
| Shift+Tab | after a shown Progress  | Passes over it to the previous focusable element  | `progress.test.tsx › keyboard › Shift+Tab passes over it too`                                       |
| –         | show, slow, unmount     | Focus is never moved: it stays on the busy button | `progress.test.tsx › keyboard › focus stays on the button when the wait shows, turns slow and ends` |

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not applicable. Progress never moves focus, on show, slow or unmount.
- Never obscured by: Progress is in the flow, never an overlay.

## Announcements

| Event                                             | Message                            | Politeness | Test                                                                        |
| ------------------------------------------------- | ---------------------------------- | ---------- | --------------------------------------------------------------------------- |
| Shown after the delay (unless `announce={false}`) | the `label`, or `progress.loading` | polite     | `announcements › announces the label once, politely, after the delay`       |
| Becomes slow (10 s)                               | `progress.slow`                    | polite     | `slow › adds the slow sentence after ten seconds and announces it once`     |
| Value changes, re-render, unmount                 | nothing                            | –          | `announcements › says nothing more when it re-renders or its value changes` |

Both go through the shared Announcer with the Progress id as the throttle `key`. `announce={false}` opts out (when focus already reads the state, or another part announces it, as a Table with `isLoading`). A Progress inside a Dialog uses the Dialog's own Announcer. Without a `KvirnProvider` nothing is announced and a development warning says why.

## Consumer responsibilities

- Name the thing and the action, and end with a full stop: "Sending your application.", never "Loading…" or "Please wait". No ellipsis, no tech words.
- Place it where the result will appear, or directly after the busy Button in the same row. Never a Toast or a modal for a wait.
- Pair a busy action with `<Button busy>` so a second press is blocked and focus stays.
- On failure, remove the Progress and show an `Alert.Danger` near the button with `announce="polite"`, and turn `busy` off. Success speaks through the result's own announcement or a focus move.
- Offer Cancel as a separate button, never inside Progress.
- Never put a Progress inside an alert's `-subtle` fill, or on a page-wide overlay that hides the user's answers.

## Visual / modes

- Focus indicator: none (nothing is focusable).
- Colour: text in `text`, never `text-muted`. The bar's edge is `border-control` (3:1) and its value `primary`; the percent is text too (1.4.1).
- forced-colors behaviour: `CanvasText` text and edge, `Canvas` track, `Highlight` value.
- reduced-motion behaviour: nothing moves on its own. The determinate fill eases only under `no-preference`.
- RTL: the native bar fills from the inline start of the page direction; the label wraps, logical properties throughout.

## WCAG SCs covered

- 1.3.1 Info and Relationships, 4.1.2 Name, Role, Value: native `<progress>` named by the label.
- 4.1.3 Status Messages: announced through the Announcer once when shown and once when slow.
- 1.4.1 Use of Color, 1.4.11 Non-text Contrast: the label and the percent carry the state; the bar's edge meets 3:1.
- 1.4.10 Reflow, 1.4.12 Text Spacing: the label wraps, nothing has a fixed height.
- 2.2.2 Pause, Stop, Hide: nothing moves on its own.
- 2.4.3 Focus Order: focus is never moved.

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

Research questions for the AT run: is the label announced once after a second, with no repeat? Does a screen reader read both the bar's name and `aria-valuetext` redundantly ("Exporting cases, progress bar, Exporting cases, 45%")? Does a busy button read as unavailable and keep its place?

## Known issues

- **`aria-valuetext` repeats the label.** The message `progress.valueText` is `{label}, {percent}`, so a screen reader may read the label twice. Manual AT decides whether the bar should drop it and let the native percent speak.
- **`aria-valuetext` is built from the Root's `label`,** not from `Progress.Label` children. Keep the same words in both, or the bar's name and its value text differ.
- **A `label` that changes while waiting is not announced again.** Remount the Root with a `key` when the wait is a new one.
- **Unmounting within 100 ms after the Announcer was given a message may still speak it:** the Announcer fills its region 100 ms after the call.
- **A slow limit less than 100 ms after the label** replaces the label before it is spoken; the slow sentence is still announced.
- **No read-aloud table.** `readAloud` exists in `@kvirn-ui/testing`, but the contract template doesn't require a transcript for a component with no focusable part; add one if the reviewer asks.
