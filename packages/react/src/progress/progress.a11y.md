# Accessibility contract: Progress

- **APG pattern:** none. A progress bar is not a widget and has no keys. The native form, `<progress>` (implicit `progressbar` role), is used only when the value is known.
- **Deviations:** none. The text carries the wait, and a decorative spinner (`Progress.Indicator`) may sit beside it. A known value uses the native `<progress>` and no spinner. The wait is announced once when shown and once when slow, never per percent or per tick.
- **Native elements used:** `<div>`, `<p>` and `<span>` for the text, `<progress>` for a known value.
- **Status:** alpha candidate. Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `progress.test.tsx` next to this file, and `packages/core/src/progress/progress-timer.test.ts` for the timing. `progress.stories.tsx` in `apps/storybook/src/components/progress/`.

Progress says that something is working and, when known, how far along. It is for a wait the user started (a send, a filter, a route), placed where the result will appear or beside the busy button. It renders at once; `delayMilliseconds` holds it back for a wait that is often quick. Table, Combobox and FileUpload keep their own loading text.

## Roles, states, properties

| Part               | Element / role                | ARIA / state                                                                                                                      | Notes                                                                                                                                                                                                                                                         |
| ------------------ | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Progress.Root      | `<div>`, no role              | `data-state="busy"` or `"slow"`, `data-determinate` with a value. Never `aria-live`, never `aria-busy`                            | Class `kv-progress`. Not rendered before `delayMilliseconds` (default 0). Props: `label`, `value`, `max`, `delayMilliseconds`, `slowAfterMilliseconds`, `announce`, `messages`                                                                                |
| Progress.Label     | `<p>` holding `<span id>`     | none. Never a live region                                                                                                         | Class `kv-progress-label`. The `<span id>` is the label text only; the percent (`kv-progress-percent`) and the slow sentence (`kv-progress-slow`) are separate spans after it                                                                                 |
| Progress.Indicator | `<span>`, no role             | `aria-hidden="true"`, not focusable                                                                                               | Class `kv-spinner` (`kv-spinner--sm`, `--lg`), a direct child of the Root before the label. Renders only without a `value`: one indicator per wait. Loops while the wait lasts and shows its still rest shape under reduced motion; the text carries the wait |
| Progress.Bar       | `<progress>` → `progressbar`  | `value`, `max` (100), `aria-labelledby` the label span, `aria-valuetext` (`progress.valueText`: `Exporting cases, 45%`)           | Class `kv-progress-bar`. Renders only with a numeric `value`: an unknown wait has no bar and no `progressbar` role                                                                                                                                            |
| `useProgress`      | the same, for your own markup | `isShown`, `isSlow`, `labelId`, `label`, `slowText`, `percent`, `rootProps`, `labelProps`, `barProps` (`undefined` without value) | Render nothing while `isShown` is `false`                                                                                                                                                                                                                     |

Rules the tests prove:

- **Show delay.** Nothing is rendered or said inside `delayMilliseconds`. A wait that ends inside it is never shown or announced.
- **Name.** The bar is named by the label text only (`aria-labelledby` the span). The slow sentence and the percent are not in the name. Without a `label` the message `progress.loading` is used and a development warning asks for a specific one.
- **No state of its own for the page.** No `aria-busy` from Progress: `aria-busy` belongs on the element whose content is replaced, while it is replaced (Table does this).
- **The percent is text.** The visible percent follows the label, and the bar's value says it. It is never announced.
- **One indicator per wait.** `Progress.Indicator` renders only for an unknown value; a known value has the `<progress>` and no spinner. A `<progress>` is never rendered without a value.
- **Development warnings (once each):** a Progress with no `label`, a Label, Bar or Indicator outside a Root, and no `KvirnProvider` while announcing.

## Allowed elements

A tag outside the list changes the page's outline or semantics (1.3.1 Info and Relationships (A), 4.1.2 Name, Role, Value (A)). `as` is a string, so it works from a Server Component.

| Part                 | `as`                         | Why                                                                                                                                                                                                                                                           |
| -------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Label                | `p` (default), `div`, `span` | Plain text with the label span inside. `span` fits beside a busy button. No heading: it names the bar, it is not part of the outline. A value outside the list is a type error and, in JavaScript, warns once in development and renders the default element. |
| Root, Indicator, Bar | none                         | A `<div>`, a decorative `<span>` and a native `<progress>` (4.1.2 Name, Role, Value (A))                                                                                                                                                                      |

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

| Event                                             | Message key (i18n)                 | Politeness | Test                                                                        |
| ------------------------------------------------- | ---------------------------------- | ---------- | --------------------------------------------------------------------------- |
| Shown after the delay (unless `announce={false}`) | the `label`, or `progress.loading` | polite     | `announcements › announces the label once, politely, after the delay`       |
| Becomes slow (10 s)                               | `progress.slow`                    | polite     | `slow › adds the slow sentence after ten seconds and announces it once`     |
| Value changes, re-render, unmount                 | nothing                            | –          | `announcements › says nothing more when it re-renders or its value changes` |

Both go through the shared Announcer. `announce={false}` opts out (when focus already reads the state, or another part announces it, as a Table with `isLoading`). A Progress inside a Dialog uses the Dialog's own Announcer. Without a `KvirnProvider` nothing is announced and a development warning says why.

## Consumer responsibilities

- Name the thing and the action, and end with a full stop: "Sending your application.", never "Loading…" or "Please wait". No ellipsis, no tech words.
- Place it where the result will appear, or directly after the busy Button in the same row. Never a Toast or a modal for a wait.
- Pair a busy action with `<Button busy>` so a second press is blocked and focus stays.
- On failure, remove the Progress and show an `Alert.Danger` near the button with `announce="polite"`, and turn `busy` off. Success speaks through the result's own announcement or a focus move.
- Offer Cancel as a separate button, never inside Progress.
- Wrap the app in `KvirnProvider`: the wait is announced through it. Without one nothing is announced and a development warning says why. Pass `announce={false}` only when focus already reads the state or another part announces it (a Table with `isLoading`).
- Never put a Progress inside an Alert's tinted background, or on a page-wide overlay that hides the user's answers.
- **2.2.2 Pause, Stop, Hide (A).** The indicators (spinner, bar sheen, busy Button, job Toast, FileUpload track, Table busy sweep) move for as long as the wait lasts, which can be more than 5 s. The theme honours `prefers-reduced-motion: reduce` and shows a still shape, but that setting alone is not a control on the page. An indicator that can keep moving for more than 5 seconds alongside other content needs a visible control on the page that stops or hides it. An indicator that is the only content during a wait where nothing else can be done is exempt. The library ships no such control, so the app offers its own and applies the CSS that stops the indicators. [Moving indicators and WCAG 2.2.2](/foundation/theming#moving-indicators). The text, the percent and the 10 s slow sentence carry the wait.

## Visual / modes

- Focus indicator: none (nothing is focusable).
- Colour: the label and the percent use the full-strength text colour, never the muted one. The percent is text too, so the state never depends on colour (1.4.1 Use of Color, A). The bar's edge has at least 3:1 contrast against its background (1.4.11 Non-text Contrast, AA).
- Forced colours: the text and the bar's edge use the system's text colour, the track uses the system's background, and the value uses the system's highlight colour.
- Reduced motion: the spinner shows its still rest shape. The known-value bar shows a plain gradient fill with no moving sheen, and its fill changes smoothly only when motion is allowed.
- Right-to-left: the native bar fills from the inline start of the page direction, and the label wraps. Spacing uses logical properties throughout.

## WCAG SCs covered

- 1.3.1 Info and Relationships (A) and 4.1.2 Name, Role, Value (A): a known value is a native `<progress>`, named by the label.
- 4.1.3 Status Messages (AA): the wait is announced through the Announcer once when shown and once when slow.
- 1.4.1 Use of Color (A) and 1.4.11 Non-text Contrast (AA): the label and the percent carry the state, and the bar's edge has at least 3:1 contrast.
- 1.4.10 Reflow (AA) and 1.4.12 Text Spacing (AA): the label wraps and has no fixed height.
- 2.2.2 Pause, Stop, Hide (A): every indicator animation (the spinner, the known-value bar's sheen, the busy Button and Toast spinners, the FileUpload track, the Table busy sweep) loops while the wait lasts and shows the still rest shape under `prefers-reduced-motion: reduce`. The library has no stop control. Where an indicator can keep moving for more than 5 seconds alongside other content, the app offers one (see What you need to do).
- 2.4.3 Focus Order (A): focus is never moved.

## AT test record

| AT + browser + OS                                                          | Agent check | Human check | Result  | Notes                                                                                                         |
| -------------------------------------------------------------------------- | ----------- | ----------- | ------- | ------------------------------------------------------------------------------------------------------------- |
| **Automated (re-runnable tests)**                                          |             |             |         |                                                                                                               |
| axe, WCAG 2.2 A and AA, every story, 4 themes                              | pass        | n/a         | pass    | progress.stories.tsx, every story, 4 themes                                                                   |
| Markup and ARIA (roles, names, ids, states)                                | pass        | n/a         | pass    | progress.test.tsx › shows the label as plain text with no role; expectNoA11yViolations                        |
| Keyboard contract rows (Vitest browser)                                    | pass        | n/a         | pass    | progress.test.tsx › keyboard › Tab passes over it: it has no focusable part                                   |
| Focus order and management                                                 | n/a         | n/a         | n/a     | nothing focusable: the component never takes or moves focus                                                   |
| Display modes (forced colours, 320px reflow, text spacing, reduced motion) | pass        | n/a         | pass    | the four sweep projects (`storybook-forced-colors`, `-reduced-motion`, `-reflow`, `-text-spacing`), run in CI |
| **Core (required for beta)**                                               |             |             |         |                                                                                                               |
| NVDA + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                               |
| VoiceOver + Safari + iOS                                                   | pending     | pending     | pending |                                                                                                               |
| **Release (before 1.0 and each minor)**                                    |             |             |         |                                                                                                               |
| JAWS + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                               |
| TalkBack + Chrome + Android                                                | pending     | pending     | pending |                                                                                                               |
| VoiceOver + Safari + macOS                                                 | pending     | pending     | pending |                                                                                                               |

Questions for the screen reader tests: is the label announced once, at once, with no repeat? Does a screen reader read both the bar's name and `aria-valuetext` redundantly ("Exporting cases, progress bar, Exporting cases, 45%")? Does a busy button read as unavailable and keep its place?

## Known issues

- **`aria-valuetext` repeats the label.** The message `progress.valueText` is `{label}, {percent}`, so a screen reader may read the label twice. If it reads badly with your screen reader, drop the label from the value text and let the native percent speak.
- **`aria-valuetext` is built from the Root's `label`,** not from `Progress.Label` children. Keep the same words in both, or the bar's name and its value text differ.
- **A `label` that changes while waiting is not announced again.** Remount the Root with a `key` when the wait is a new one.
- **Unmounting within 100 ms after the Announcer was given a message may still speak it:** the Announcer fills its region 100 ms after the call. With the default delay of 0 this is every wait shorter than about 100 ms: the label is spoken after the Progress has gone. Set `delayMilliseconds` for a wait that is usually quick.
- **A slow limit less than 100 ms after the label** replaces the label before it is spoken; the slow sentence is still announced.
