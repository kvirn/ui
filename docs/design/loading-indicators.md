# Design spec: Loading indicators (spinner, animated gradient bar)

- **Status:** In review (maintainer decisions of 2026-10-06 applied) · **Designer:** ux-designer agent · **Date:** 2026-10-06
- **Plan:** [0080](../plans/0080-loading-indicators.md). Amends [status-patterns.md](status-patterns.md) D2 ("no spinner and no indeterminate bar"), which the maintainer rejected.
- **Prototype:** [prototypes/loading-indicators.html](prototypes/loading-indicators.html): no script, links `packages/theme/theme.css`. It has theme, reduced-motion and "Stop animations" switches, LTR and RTL side by side, and a simulated forced-colours mode. The "Stop animations" switch stands in for the **app's own control** (see "Consumer duty for 2.2.2"); the library has none. The variants that won't ship are marked "Not shipping".
- **Type:** component default styling + approved tokens. No new public part.
- **Maintainer decisions:**
  - Text first. Ship the Crawl arc spinner and the B1 sweep bar only.
  - **Loops are endless**, under `prefers-reduced-motion: no-preference` only. No MotionToggle, no `data-kv-motion`, no library stop control: WCAG 2.2.2 is the **consuming app's duty**, and the docs say so (§7.2).
  - `--kv-color-accent` and `--kv-duration-loop` are approved, and the sheen is at most 20 %.
  - FileUpload's indeterminate hatch moves to the new bar in the same plan.
  - "The spinner we had in toasts" is the toast timer ring's construction. The repo has no other spinner.

## 1. Brief

- **Users:** both. **Hardest case:** a resident with a vestibular disorder who hasn't set `prefers-reduced-motion`, on a slow phone, waiting 40 s for a decision page. Then a staff user with ten busy indicators on one dashboard, and an NVDA user who must hear the state once and never a tick.
- **Job:** _When I'm waiting, I want to see that the service is alive._
- **Success:**
  - Participants say "it's working" sooner than with text alone.
  - A participant who is bothered by motion has set `prefers-reduced-motion` (they see none) or uses the app's own control.
  - No double submissions.
  - Screen-reader output is unchanged from Plan 0074.
- **Evidence:** none of our own. Assumptions:
  - A moving glyph makes a wait feel shorter (status-patterns.md research question 1, still open).
  - A moving glyph makes a wait feel shorter (status-patterns.md research question 1, still open). → Research question: do participants find the app's own "reduce motion" control while a spinner runs?

## 2. Prior art

| Source                                                                                                | Reuse                                                                                        | Change, and why                                                                         |
| ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| KvirnUI toast timer ring ([toast-timer-ring.md](toast-timer-ring.md))                                 | Border ring, conic mask, `@property` angle, status colour, no RTL mirroring, never announced | It turns (`rotate`, composited) and breathes, instead of draining                       |
| KvirnUI FileUpload and Table hatch                                                                    | The static hatch                                                                             | It becomes the **stopped shape** of every bar                                           |
| [Designsystemet Spinner](https://designsystemet.no/no/components/docs/spinner/overview), Aksel Loader | Shown only after a delay, always with text                                                   | Decorative (`aria-hidden`): Progress already names the wait                             |
| [Understanding 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide)                    | Motion over 5 s needs a mechanism to pause or stop it. A stop may return to a still state    | The mechanism is the app's; the library supplies the rest shape and the CSS to reach it |

## 3. Decisions

| #   | Question              | Choice                                                                                                                                                     | Why                                                                                                         |
| --- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| L1  | Spinner               | **Crawl arc ring** only                                                                                                                                    | One shape at every size. The ring the maintainer liked. A border survives forced colours                    |
| L2  | Bar                   | **B1 sweep** only: indeterminate, and as the determinate sheen                                                                                             | Reads as "moving forward". Transform only. Stops on the existing hatch                                      |
| L3  | Duration              | **Endless** while the wait lasts, only under `no-preference`. Reduced motion = no `@property` run = the **rest shape** (¾ arc, hatch, plain gradient fill) | Maintainer decision. One still look for reduce and for an app's own stop                                    |
| L4  | 2.2.2 mechanism       | **None in the library.** The app offers a "reduce motion" control and uses the CSS in §7.2. Only `prefers-reduced-motion` is read, in CSS                  | A control, its state and its place are product choices. No provider prop, hook or `data-*` motion attribute |
| L5  | Indeterminate element | A decorative `<span aria-hidden>`, never a `<progress>` without a value                                                                                    | D2's real objection, AT hearing "progress bar" with no value, stays solved                                  |
| L6  | Colour                | Arc: `primary`. In a button: `currentColor`. In an alert or toast: `--kv-alert-accent`. Bar: `primary` → `accent`, in oklab                                | Role-named and rebrandable. `currentColor` inherits the label's measured contrast                           |

## 4. Content

No new string. The indicators are `aria-hidden` and have no name; `progress.loading`, `progress.slow` (still added at 10 s), `progress.valueText` and `table.loading` are unchanged.

## 5. Pick per use

| Use                         | Indicator                                                                                                                                       | Lockup (text first)                                                   |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Progress, unknown wait      | `kv-spinner` (1.25em) at the inline start of `kv-progress-label`, centred on its first line                                                     | Spinner · label; the slow sentence is added at 10 s                   |
| Progress, known value       | `kv-progress-bar` (native, 8px): `primary` → `accent` fill with the sheen                                                                       | Label · percent above the bar. No spinner                             |
| Compact known value         | `kv-spinner` + the percent in text (a table cell, a toast)                                                                                      | Spinner · label · percent                                             |
| Button busy                 | `kv-spinner` at the button's inline start, `currentColor`, shown after 1000 ms (a CSS visibility step; the spinner then loops); label unchanged | The Progress beside it carries the words, **without** its own spinner |
| Table busy                  | A thin 4px sweep along the head's lower edge                                                                                                    | Unchanged: "Loading rows."                                            |
| Toast, job in progress      | `kv-spinner` in the icon slot (`kv-alert-icon kv-spinner`), `--kv-alert-accent`; no auto-dismiss timer                                          | Title + body; replaced by the result toast                            |
| FileUpload, unknown size    | **`kv-progress-track`** in place of the indeterminate `<progress>` hatch (same plan)                                                            | Unchanged status text ("Laddar upp")                                  |
| Page loading (client route) | Progress with a spinner, in place of the content, start-aligned under the `h1`                                                                  | As unknown wait; route focus reads the `h1`                           |
| Fixed media area            | `kv-spinner--lg` centred, label below. The only centred use                                                                                     | –                                                                     |

Never: an indicator alone, two moving indicators for one wait, a skeleton over the user's own answers. Dual-arc, dots, stripes, glow and skeletons don't ship.

## 6. Visual specification

### 6.1 Parts

| Class                      | Element                                                      | Tokens / style                                                                                                                                                                                                                                  |
| -------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kv-spinner`               | `<span aria-hidden>`                                         | Box `--kv-spinner-size` (1.25em, icon step 5). `::before` ring: a 2px `--kv-spinner-stroke` border in `--kv-spinner-color` (default `primary`), `--kv-radius-full`, mask: the Crawl arc (§6.2)                                                  |
| `kv-spinner--sm` / `--lg`  | modifier                                                     | sm: 1em. lg: `--kv-space-12` with a `--kv-indicator-width` stroke                                                                                                                                                                               |
| `kv-progress-track`        | `<span aria-hidden>`                                         | As `kv-progress-bar`: 8px `--kv-space-2`, a `border-control` edge, a `surface` track, `radius-sm`, with the hatch as background. `::before` band: 40 %, `linear-gradient(to right in oklab, transparent, primary 25%, accent 75%, transparent)` |
| `kv-progress-track--thin`  | modifier                                                     | 4px `--kv-indicator-width`, no edge. Indeterminate only                                                                                                                                                                                         |
| `kv-progress-bar` (exists) | `<progress>`                                                 | Value `linear-gradient(<dir> in oklab, primary, accent)` under a sheen of `color-mix(in srgb, on-primary 20%, transparent)` at `--kv-progress-sheen` ±12 %. `<dir>` = `to right`, or `to left` under `:dir(rtl)`                                |
| Table head line            | `.kv-table[data-busy] .kv-table-head > tr:last-child::after` | 4px, its gradient stops moved by `@property --kv-progress-sweep`. The `<tr>` is `position: relative`                                                                                                                                            |

### 6.2 Motion (all endless, `fill-mode: none`, only under `prefers-reduced-motion: no-preference`)

| Part                        | Keyframes                                                                                                                                                                                             | Duration                                                           | Easing                                                                                  |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Spinner box                 | `rotate: 0 → 1turn`                                                                                                                                                                                   | 2400 ms (`loop × 1.5`)                                             | `linear`                                                                                |
| Spinner arc (Crawl, chosen) | Two `@property` angles: head `--kv-spinner-head` 0.1 → 1.1 turn, tail `--kv-spinner-tail` 0 → 1 turn. The arc is `conic-gradient(from tail, ink 0 (head − tail), transparent 0)`. Prototype variant B | `loop`                                                             | head `--kv-easing-standard`; tail `cubic-bezier(0.6, 0, 0.4, 1)` (rule-local, no token) |
| Track band                  | `translate: -100% → 250%`; the hatch is `none` while it runs                                                                                                                                          | `loop`                                                             | `--kv-easing-standard`                                                                  |
| Determinate sheen           | `--kv-progress-sheen` -30 % → 130 %                                                                                                                                                                   | `loop`; the fill eases on a value change over `--kv-duration-fast` | `--kv-easing-standard`                                                                  |
| Table head line             | `--kv-progress-sweep` -30 % → 130 %; the header hatch is hidden                                                                                                                                       | `loop`                                                             | `--kv-easing-standard`                                                                  |

**The gate in theme.css** is one media query: every loop sits inside `@media (prefers-reduced-motion: no-preference)`. Under `reduce` the rest shape shows. A busy Button's spinner is hidden for its first 1000 ms by a visibility step (not motion, so it holds in every preference). `loop` is `--kv-duration-loop` (1600 ms). Nothing here stops a loop: that is the app's duty (§7.2).

### 6.3 States

| Part    | no-preference        | reduce, or an app's stop (§7.2)                                    | slow (10 s)                                  | forced colours                                                                                                |
| ------- | -------------------- | ------------------------------------------------------------------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Spinner | turns, crawls        | still ¾ arc (never a full circle: that's the success icon's shape) | the text adds the sentence; motion unchanged | `CanvasText`; `ButtonText` in a button                                                                        |
| Track   | the band sweeps      | static hatch                                                       | unchanged                                    | `CanvasText` edge on `Canvas`; a solid `Highlight` band (`forced-color-adjust: none`); at rest the edge alone |
| Bar     | gradient fill, sheen | gradient fill                                                      | –                                            | `Highlight` value, with `background-image: none` set explicitly                                               |
| Table   | the head line sweeps | the hatch on each header                                           | –                                            | a dashed `Highlight` header edge; the sweep is not drawn                                                      |

### 6.4 Modes

- **Themes:** all four via tokens.
- **RTL:** the track mirrors (`:dir(rtl) { scale: -1 1 }`) and the bar's gradient flips. The spinner doesn't mirror: it's a clock.
- **Reduced motion:** the rest shape from the first paint. Static, not stepped: a spinner carries no value, so stepping it would only make the motion jerkier.
- **320px / 400 % / 1.4.12:** em-sized next to text, the label wraps, bars are full width.

### 6.5 Tokens (approved 2026-10-06; to be implemented in theme.css with `theme:check`)

| Token                | light        | dark         | light-contrast | dark-contrast |
| -------------------- | ------------ | ------------ | -------------- | ------------- |
| `--kv-color-accent`  | `accent-600` | `accent-400` | `accent-800`   | `accent-200`  |
| `--kv-duration-loop` | 1600ms       | =            | =              | =             |

Ratios (WCAG formula, 2026-10-06 palette; light / dark / light-contrast / dark-contrast):

| Pair                                                   | Ratios                                                              |
| ------------------------------------------------------ | ------------------------------------------------------------------- |
| `accent` on canvas, surface, surface-raised (worst)    | 5.48 / 5.86 / 9.81 / 11.87                                          |
| `accent` on `primary-subtle`                           | 5.15 / 5.19 / 9.21 / 10.51                                          |
| `primary` → `accent` oklab midpoints, worst background | 4.36 / 3.74 / 7.37 / 8.85                                           |
| Sheen peak (fill + 20 % `on-primary`) on `surface`     | primary 3.07 / 5.83 / 5.44 / 6.58; accent 3.68 / 7.97 / 5.61 / 8.17 |

**Pairs to add in `packages/theme/src/contrast-requirements.ts`:**

1. Add `'accent'` to `colorTokenNames`.
2. Add `'accent'` to the `nonTextPairs` list at line 103, next to `'primary'`. That makes 4 pairs at 3:1: `accent` on `canvas`, `surface`, `surface-raised` and `primary-subtle`.

`theme:check` doesn't measure the gradient midpoints or the sheen composite, because they aren't token pairs. A theme test for them is proposed (Q6).

## 7. Accessibility annotations

### 7.1 Indicators: unchanged roles and announcements

- Spinner, track and head line: `aria-hidden="true"`, no role, no name, not focusable, no pointer events.
- Progress.Label and the native `<progress>` carry the meaning. Button keeps `aria-disabled`, `data-busy` and its name (2.5.3). Table keeps `aria-busy`.
- Announced once when shown and once when slow, politely. Nothing per tick or value, and nothing when the motion rests.

### 7.2 2.2.2 is the app's duty

- **Why it applies:** the indicators move for more than 5 s and start on their own, so WCAG 2.2.2 (Pause, Stop, Hide) asks for a mechanism **on the page**. `prefers-reduced-motion` is honoured by the library, but it is a system setting, not a mechanism on the page. So an app that ships these indicators needs its own "reduce motion" control.
- **Decision:** the library ships no control, no state, no `data-kv-motion` and no provider prop (the earlier MotionToggle options A and B are removed). Where the control sits, what it is called, and whether it is saved are product choices. The docs say this plainly.
- **Stopped look:** the rest shape, the same as reduced motion: a ¾ arc, the hatch, a plain gradient fill. Words are unchanged, so nothing is lost.
- **Safety net:** none in the library. The theme only ships the CSS below.

## Consumer duty for 2.2.2

Set an attribute of your own choosing on `<html>` from your control (here `data-reduce-motion`) and add this once, **after** `theme.css`. It stops every indicator that loops. The busy Button keeps its 1000 ms reveal, which isn't motion.

```css
:root[data-reduce-motion='true'] .kv-spinner,
:root[data-reduce-motion='true'] .kv-spinner::before,
:root[data-reduce-motion='true'] .kv-progress-track,
:root[data-reduce-motion='true'] .kv-progress-track::before,
:root[data-reduce-motion='true'] .kv-progress-bar,
:root[data-reduce-motion='true'] .kv-table[data-busy] .kv-table-column-header,
:root[data-reduce-motion='true'] .kv-table[data-busy] .kv-table-head > tr:last-child::after {
  animation: none;
}

:root[data-reduce-motion='true'] .kv-button[data-busy] > .kv-spinner {
  animation: kv-spinner-reveal 1ms steps(1, end) 1000ms both;
}
```

With no animation, the animated values return to their rest values: the arc is three quarters, the band is not drawn, the sheen sits off the fill, and the hatch returns. Selectors come from the loops in `theme.css`; the toast timer ring, fades and transitions are timers or under 5 s.

### 7.3 Other SCs

- **1.4.11:** the arc and the band core are at least 3:1 (§6.5).
- **1.4.1:** words carry every state.
- **2.3.1:** nothing flashes.
- **2.3.3 (AAA, not claimed):** reduced motion reaches the rest shape.
- **2.4.3:** the library adds no focus stop.
- **CPU and battery:** `rotate` and `translate` run on the compositor. The arc, sheen and head line use `@property`, which repaints a box at most 48px or 8px high. The browser throttles hidden tabs. No script runs per frame, and the consumer's stop (§7.2) ends all cost.

## 8. What this reverses (for the plan's Record step)

| File:line (2026-10-06)                                                                  | Change                                                                                                                                 |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `DESIGN.md:340`, `:589`                                                                 | "Never a spinner", "nothing moves on its own", "busy = cursor only", "no new token" → this spec                                        |
| `DESIGN.md` Motion (§281)                                                               | Add `--kv-duration-loop` and the rule that 2.2.2 is the app's duty for the loops                                                       |
| `DESIGN.md` Colors (semantic tokens table)                                              | Add the `accent` row                                                                                                                   |
| `docs/design/status-patterns.md:20, 26, 30, 39 (D2), 112, 184, 207`                     | Superseded for D2 and §6.4 Motion                                                                                                      |
| `progress.md:5`, `progress.a11y.md:4, 80`, `progress.tsx:54`, `progress.stories.tsx:64` | A decorative indicator; 2.2.2 is the app's duty                                                                                        |
| `theme.css:8899–8901, 9248–9260, 9318–9319, 9359–9379, 9388–9391, 9442–9446, 9825–9840` | Endless animations under `no-preference`; the hatch becomes the rest shape; FileUpload's indeterminate bar becomes `kv-progress-track` |
| `file-upload.md:406, 563, 633`; `file-upload.a11y.md:29, 115, 128`                      | The indeterminate bar is a decorative track; 2.2.2 is the app's duty                                                                   |
| `contrast-requirements.ts:19–44, 103`                                                   | Add `accent` (§6.5)                                                                                                                    |
| `docs/roadmap.md:64, 149`; `docs/design/README.md:49`                                   | Update the wording                                                                                                                     |

## 9. Validation

- [x] Self-review against the checklist: no open blockers. No new focus stop or string. Forced colours, RTL and reduced motion are specified.
- [x] Contrast computed (§6.5). `vp run theme:check` after `theme.css` changes: `pending` (orchestrator).
- [x] Prototype screenshots at 1280px: running, at rest, and still running after 7 s. Real forced colours and 320px: `pending`.
- **Usability test plan: `pending`.**
  - Participants: 8 residents (2 with vestibular or migraine sensitivity, 2 with low digital confidence, 2 second-language, 1 NVDA, 1 magnifier at 400 %) and 4 staff.
  - Tasks: submit with a 15 s delay; wait 40 s for a page; "the moving thing bothers you: make it stop" (the app's own control); refresh a case table.
  - Measure: whether participants find the app's control and how long it takes, double submissions, "is it working?" at 3, 8 and 12 s, and discomfort.

## 10. Decisions taken (formerly open)

1. No library stop control: 2.2.2 is the consuming app's duty (§7.2). MotionToggle options A and B are removed.
2. Reduced motion shows the rest shape; nothing else is read by the library.
3. Scope of an app's stop: the indicators in §7.2's snippet. The toast timer ring, fades and transitions are timers or under 5 s.
4. Persistence: the app's own, if any.
5. `Progress.Indicator` part: a plan decision (0080), not a visual one.
6. The gradient and sheen contrast test (≥ 3:1): done, `packages/theme/src/loading-indicators.test.ts`.
7. `<tr>` check: `position: relative` on the last head row; fallback is the hatch moved by `background-position`. Browser check in review.
