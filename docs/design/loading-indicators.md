# Design spec: Loading indicators (spinner icon, animated gradient bar)

- **Status:** In review (maintainer decisions of 2026-10-06 applied; amended 2026-10-17 by Plan 0126: a still library icon `spinner`, crawled by the consumer class `kv-animate-spinner`) · **Designer:** ux-designer agent · **Date:** 2026-10-06, amended 2026-10-17
- **Plans:** [0080](plans/README.md) (in git history) and [0126](plans/0126-spinner-icon.md). Amends [status-patterns.md](status-patterns.md) D2 ("no spinner and no indeterminate bar"), which the maintainer rejected.
- **Prototype:** removed in the prototype cleanup (git history). It showed the 0080 CSS ring; the icon spinner (§6.2) is reviewed from the `Icons/Library` → `LoadingSpinner` story (`icons-library--loading-spinner`).
- **Type:** component default styling + one library icon + approved tokens. No new token, no new Icon prop.
- **Maintainer decisions:**
  - Text first. Ship the Crawl arc spinner and the B1 sweep bar only.
  - **Loops are endless**, under `prefers-reduced-motion: no-preference` only. No MotionToggle, no library stop control: WCAG 2.2.2 is the **consuming app's duty**, and the docs say so (§7.2).
  - `--kv-color-accent` and `--kv-duration-loop` are approved, and the sheen is at most 20 %.
  - FileUpload's indeterminate hatch moves to the new bar in the same plan.
  - (2026-10-17, Plan 0126) `spinner` is a still icon in `@kvirn-ui/icons`, not built in (built-ins stay 25). A consumer class, `kv-animate-spinner`, makes it crawl with SVG stroke-dash. Button busy, Progress, the toast and the Map status keep the CSS `kv-spinner` for now (§8.3).

## 1. Brief

- **Users:** both. **Hardest case:** a resident with a vestibular disorder who hasn't set `prefers-reduced-motion`, on a slow phone, waiting 40 s for a decision page. Then a staff user with ten busy indicators on one dashboard, and an NVDA user who must hear the state once and never a tick.
- **Job:** _When I'm waiting, I want to see that the service is alive._
- **Success:** participants say "it's working" sooner than with text alone; a participant bothered by motion has set `prefers-reduced-motion` (they see none) or uses the app's own control; no double submissions; screen-reader output is unchanged from Plan 0074.
- **Evidence:** none of our own. Assumption: a moving glyph makes a wait feel shorter (status-patterns.md research question 1, still open). → Research question: do participants find the app's own "reduce motion" control while a spinner runs?

## 2. Prior art

| Source                                                                                                         | Reuse                                                                                                        | Change, and why                                                                         |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| KvirnUI toast timer ring ([toast-timer-ring.md](toast-timer-ring.md)) and the 0080 `kv-spinner`                | Two `@property` values (head, tail) with their own easings, a 1.5-loop turn, status colour, no RTL mirroring | Drawn as an SVG dash on one path instead of a masked border, so it is an icon           |
| [Material 3 circular progress](https://m3.material.io/components/progress-indicators/overview) (indeterminate) | A circle path whose `stroke-dasharray`/`-dashoffset` grow and shrink while the svg rotates                   | Our timings and easings; still ¾ arc at rest; decorative, never `progressbar`           |
| [WebKit r254657](https://trac.webkit.org/r254657) (`pathLength`, Safari 14+)                                   | `pathLength="100"` normalises the dash, so the keyframes are in percent of a turn at every size and stroke   | Inside the browser range (Safari 17+, `docs/architecture.md`)                           |
| [Designsystemet Spinner](https://designsystemet.no/no/components/docs/spinner/overview), Aksel Loader          | Shown only after a delay, always with text                                                                   | Decorative (`aria-hidden`): Progress already names the wait                             |
| [Understanding 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide)                             | Motion over 5 s needs a mechanism to pause or stop it. A stop may return to a still state                    | The mechanism is the app's; the library supplies the rest shape and the CSS to reach it |

## 3. Decisions

| #   | Question              | Choice                                                                                                                                                                                                                  | Why                                                                                                                                                                                                                                        |
| --- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| L1  | Spinner               | **Components: the CSS `kv-spinner` ring** (Plan 0080). **Consumers: the library icon `spinner`** with `kv-animate-spinner` (§6.2, Plan 0126)                                                                            | The components must work with no icon set registered. The icon shares the `size` scale and is a still arc without a theme                                                                                                                  |
| L2  | Bar                   | **B1 sweep** only: indeterminate, and as the determinate sheen                                                                                                                                                          | Reads as "moving forward". Transform only. Stops on the existing hatch                                                                                                                                                                     |
| L3  | Duration              | **Endless** while the wait lasts, only under `no-preference`. Reduced motion = no animation = the **rest shape** (¾ arc from the SVG attributes, hatch, plain gradient fill)                                            | Maintainer decision. One still look for reduce, for an app's own stop and for a page without `theme.css`                                                                                                                                   |
| L4  | 2.2.2 mechanism       | **None in the library.** The app offers a "reduce motion" control and uses the CSS in §7.2. Only `prefers-reduced-motion` is read, in CSS                                                                               | A control, its state and its place are product choices. No provider prop, hook or `data-*` motion attribute                                                                                                                                |
| L5  | Indeterminate element | A decorative `aria-hidden` `<svg>` (spinner) or `<span>` (track), never a `<progress>` without a value                                                                                                                  | D2's real objection, AT hearing "progress bar" with no value, stays solved                                                                                                                                                                 |
| L6  | Colour                | The icon is `currentColor` unless `variant` picks a colour, like every icon. Its context colours it otherwise: `primary` in Progress and the Map status, the label's colour in a Button, `--kv-alert-accent` in a toast | A component colours its own part, as `kv-alert-icon` already does. The consumer's `variant` (`kv-icon--<variant>`) and, on the CSS ring, `kv-spinner--<variant>` pick one of the eight theme colours; forced colours drop them (Plan 0127) |
| L7  | Hook                  | The consumer class `kv-animate-spinner` on the Icon (Plan 0126 D3). Never `data-icon`: a choice is a class, `data-*` is state                                                                                           | The keyframes fit the library drawing only (`pathLength`, rest dash). The consumer adds the class to the icon they mean                                                                                                                    |

## 4. Content

No new visible string. The indicators are `aria-hidden`; `progress.loading`, `progress.slow` (still added at 10 s), `progress.valueText` and `table.loading` are unchanged. Plan 0126 adds `icons.spinner` ("Loading") only for a consumer who labels a standalone spinner.

## 5. Pick per use

A `kv-spinner--<variant>` on a filled Button or an Alert overrides their `currentColor` or accent colour and is not contrast-measured: the variant tokens are measured on canvas, surface and surface-raised only. The spinner is decorative beside words, so this is guidance, not a failure.

Rows marked `kv-spinner` use the CSS ring until a later plan migrates them (§8.3); `--sm`/`--lg` map to icon sizes `16`/`48` then.

| Use                         | Indicator                                                                                         | Lockup (text first)                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Progress, unknown wait      | `Progress.Indicator`, `kv-spinner` ring, inline start                                             | Spinner · label; the slow sentence is added at 10 s                   |
| Progress, known value       | `kv-progress-bar` (native, 8px): `primary` → `accent` fill with the sheen                         | Label · percent above the bar. No spinner                             |
| Compact known value         | `kv-spinner--sm` + the percent in text (a table cell, a toast)                                    | Spinner · label · percent                                             |
| Button busy                 | `kv-spinner` as the first child, before the label, `currentColor`, shown at once; label unchanged | The Progress beside it carries the words, **without** its own spinner |
| Table busy                  | A thin 4px sweep along the head's lower edge                                                      | Unchanged: "Loading rows."                                            |
| Toast, job in progress      | `kv-spinner` in the Alert `icon` slot; no auto-dismiss timer                                      | Title + body; replaced by the result toast                            |
| Map status (loading)        | `kv-spinner` first in `<p class="kv-map-status">`, before `map.loading`                           | Spinner · "Loading map"                                               |
| FileUpload, unknown size    | **`kv-progress-track`** in place of the indeterminate `<progress>` hatch                          | Unchanged status text ("Uploading")                                   |
| Page loading (client route) | Progress with a spinner, in place of the content, start-aligned under the `h1`                    | As unknown wait; route focus reads the `h1`                           |
| Fixed media area            | `kv-spinner--lg` centred, label below. The only centred use                                       | –                                                                     |

Never: an indicator alone, two moving indicators for one wait, a skeleton over the user's own answers. Dual-arc, dots, stripes, glow and skeletons don't ship.

## 6. Visual specification

### 6.1 Parts

| Part                           | Element                                                                        | Tokens / style                                                                                                                                                                                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spinner icon (library)         | `<svg class="kv-icon kv-icon--size-<px>">`, plus `kv-animate-spinner` to crawl | The drawing in §6.2. Size from the Icon's `size` (§6.4). Colour `currentColor`; the context, or the consumer's `variant`, sets it                                                                                                               |
| `kv-spinner` (components)      | `<span class="kv-spinner" aria-hidden>`                                        | The 0080 ring in Progress, Button busy, toast and Map status: unchanged until the migration (§8.3)                                                                                                                                              |
| Map status spinner (`map.css`) | `.kv-map-status > .kv-spinner`                                                 | Unchanged                                                                                                                                                                                                                                       |
| Button, toast                  | `.kv-button > .kv-spinner`, `.kv-alert-icon`                                   | Unchanged                                                                                                                                                                                                                                       |
| `kv-progress-track`            | `<span aria-hidden>`                                                           | As `kv-progress-bar`: 8px `--kv-space-2`, a `border-control` edge, a `surface` track, `radius-sm`, with the hatch as background. `::before` band: 40 %, `linear-gradient(to right in oklab, transparent, primary 25%, accent 75%, transparent)` |
| `kv-progress-track--thin`      | modifier                                                                       | 4px `--kv-indicator-width`, no edge. Indeterminate only                                                                                                                                                                                         |
| `kv-progress-bar` (exists)     | `<progress>`                                                                   | Value `linear-gradient(<dir> in oklab, primary, accent)` under a sheen of `color-mix(in srgb, on-primary 20%, transparent)` at `--kv-progress-sheen` ±12 %. `<dir>` = `to right`, or `to left` under `:dir(rtl)`                                |
| Table head line                | `.kv-table[data-busy] .kv-table-head > tr:last-child::after`                   | 4px, its gradient stops moved by `@property --kv-progress-sweep`. The `<tr>` is `position: relative`                                                                                                                                            |

### 6.2 The spinner icon and its motion

**Drawing** (icon.md §6.1 rules, circle keyline), a library icon (`packages/icons/svg/spinner.svg`), not built in:

- Root as every icon: `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="1.5"`, round caps and joins. The `strokeWidth` prop reaches it.
- One path, the circle keyline (centre 12,12, r 9), from 12 o'clock, clockwise, open: `M12 3a9 9 0 1 1 0 18a9 9 0 1 1 0-18`.
- On that path only: `pathLength="100"` and `stroke-dasharray="75 25"`: the **rest shape**, a ¾ arc from 12 to 9 o'clock, the same as `in-progress`. Clear gap 12.6 units, so it never reads as the full circle of `success`. Without `theme.css`, under `reduce` and after an app's stop, this shows.
- These two attributes are the stated exception to "shapes set none of these" (icon.md §6.1); no prop overrides them.

**Motion**: opt-in. The consumer adds `kv-animate-spinner` to the Icon (L7); without it the icon is still. Endless, only under `prefers-reduced-motion: no-preference`. The selectors target the library drawing (`pathLength`), so a replacement icon registered as `spinner` gets no dash unless it keeps them. Units are percent of a turn via `pathLength`:

| Target                                                       | Animated                                                                                                 | Duration               | Easing                                                |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------- |
| `.kv-icon.kv-animate-spinner` (svg)                          | `rotate: 0 → 1turn`. The outer svg is a CSS box, so the origin is its centre                             | `loop × 1.5` (2400 ms) | `linear`                                              |
| `.kv-icon.kv-animate-spinner > path[pathLength='100']`, head | `@property --kv-icon-spinner-head` (`<number>`, `inherits: false`, initial `75`): 10 → 110               | `loop`                 | `--kv-easing-standard`                                |
| the same path, tail                                          | `@property --kv-icon-spinner-tail` (`<number>`, `inherits: false`, initial `0`): 0 → 100                 | `loop`                 | `cubic-bezier(0.6, 0, 0.4, 1)` (rule-local, no token) |
| the same path, dash                                          | `stroke-dasharray: L calc(100 - L)` with `L = max(0, head − tail)`; `stroke-dashoffset: calc(-1 * tail)` | follows head and tail  | –                                                     |

- The period is 100, so the arc wraps through 12 o'clock with no cut. Head and tail are the 0080 ring's angles × 100, so the arc grows and shrinks the same. They are animation state, not theming surface.
- **What the theme sets:** `animation`, `rotate`, `stroke-dasharray`, `stroke-dashoffset`, all inside the gate, direct child `path`, no `<g>`. Never `stroke`, `stroke-width`, `fill` or `color`. This is the one stated exception to icon.md §6.2 and theme.css §10; its comment says so.

**Other loops:**

| Part              | Keyframes                                                       | Duration                                                           | Easing                 |
| ----------------- | --------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------- |
| Track band        | `translate: -100% → 250%`; the hatch is `none` while it runs    | `loop`                                                             | `--kv-easing-standard` |
| Determinate sheen | `--kv-progress-sheen` -30 % → 130 %                             | `loop`; the fill eases on a value change over `--kv-duration-fast` | `--kv-easing-standard` |
| Table head line   | `--kv-progress-sweep` -30 % → 130 %; the header hatch is hidden | `loop`                                                             | `--kv-easing-standard` |

**The gate in theme.css** is one media query: every loop, `kv-animate-spinner` included, sits inside `@media (prefers-reduced-motion: no-preference)`. Under `reduce` the rest shape shows. A busy Button's `kv-spinner` shows at once in every preference. `loop` is `--kv-duration-loop` (1600 ms). Nothing here stops a loop: that is the app's duty (§7.2).

### 6.3 States

| Part    | no-preference                             | reduce, or an app's stop (§7.2)                                    | slow (10 s)                                  | forced colours                                                                                                |
| ------- | ----------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Spinner | turns, crawls (with `kv-animate-spinner`) | still ¾ arc (never a full circle: that's the success icon's shape) | the text adds the sentence; motion unchanged | `CanvasText` (Progress, Map status, toast: each part rule sets it); `ButtonText` in a button (inherited)      |
| Track   | the band sweeps                           | static hatch                                                       | unchanged                                    | `CanvasText` edge on `Canvas`; a solid `Highlight` band (`forced-color-adjust: none`); at rest the edge alone |
| Bar     | gradient fill, sheen                      | gradient fill                                                      | –                                            | `Highlight` value, with `background-image: none` set explicitly                                               |
| Table   | the head line sweeps                      | the hatch on each header                                           | –                                            | a dashed `Highlight` header edge; the sweep is not drawn                                                      |

Forced colours: `primary` maps to `Highlight`, which would read as "selected", so the Progress and Map status rules set `CanvasText` explicitly (today's look).

### 6.4 Sizes and modes

| `size` | Stroke at 1.5 | Use                                                                                                   |
| ------ | ------------- | ----------------------------------------------------------------------------------------------------- |
| 12, 14 | 0.75, 0.875px | Allowed by the type; not for use (sub-pixel stroke, the arc greys out). Shown in the Sizes story only |
| 16     | 1px           | Guidance for the later migration of `kv-spinner--sm`: compact value lockups, small text               |
| **20** | 1.25px        | **Default**; the later migration of the 1.25em ring: Progress, Button, toast, Map status              |
| 24–40  | 1.5–2.5px     | Larger text or a heading-sized lockup                                                                 |
| 48     | 3px           | Guidance for the later migration of `kv-spinner--lg` (48px, 4px stroke): fixed media area             |
| 56–96  | 3.5–6px       | Large media areas only                                                                                |

- **Stroke trade-off:** at 20px the stroke is 1.25px, so the icon matches the icons beside it. Decorative: the words carry the state. A heavier look is the class `kv-icon--stroke-2`. The CSS ring follows the same grid: `--kv-spinner-stroke` is `max(1px, size × units / 24)` with 1.5 units by default (`kv-spinner--stroke-1` and `--stroke-2` set 1 and 2), so the 1.25em ring goes from 2px to 1.25px, `--sm` to 1px and `--lg` to 3px, and `--lg` no longer overrides it. Today's exact 2px is `--kv-spinner-stroke: 2px`.
- **rem, not em:** the icon follows the root font size (1.4.4 holds); at body size 20px equals the 1.25em ring.
- **Themes:** all four via tokens. **RTL:** neither spinner mirrors (a clock); the track mirrors and the bar's gradient flips.
- **Reduced motion:** the rest shape from the first paint. Static, not stepped: a spinner carries no value.
- **320px / 400 % / 1.4.12:** rem-sized next to text, the label wraps, bars are full width.

### 6.5 Tokens (approved 2026-10-06; implemented)

| Token                | light        | dark         | light-contrast | dark-contrast |
| -------------------- | ------------ | ------------ | -------------- | ------------- |
| `--kv-color-accent`  | `accent-600` | `accent-400` | `accent-800`   | `accent-200`  |
| `--kv-duration-loop` | 1600ms       | =            | =              | =             |

| Pair (2026-10-06 palette; light / dark / light-contrast / dark-contrast) | Ratios                                                              |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `accent` on canvas, surface, surface-raised (worst)                      | 5.48 / 5.86 / 9.81 / 11.87                                          |
| `accent` on `primary-subtle`                                             | 5.15 / 5.19 / 9.21 / 10.51                                          |
| `primary` → `accent` oklab midpoints, worst background                   | 4.36 / 3.74 / 7.37 / 8.85                                           |
| Sheen peak (fill + 20 % `on-primary`) on `surface`                       | primary 3.07 / 5.83 / 5.44 / 6.58; accent 3.68 / 7.97 / 5.61 / 8.17 |

**Spinner colour pairs (1.4.11, 3:1), Plan 0126: no new pair.** `primary` on canvas/surface/surface-raised/`primary-subtle` is an existing non-text pair (lowest 3.75:1, dark; icon.md §6.3). The consumer colours the icon; `kv-spinner` in a Button, toast and Map status is unchanged. `theme:check`: `pending` (orchestrator).

## 7. Accessibility annotations

### 7.1 Indicators: unchanged roles and announcements

- Spinner icon: as every Icon, `aria-hidden="true"` with no `label`; never `role="progressbar"`, not focusable, no pointer events. Track and head line: `aria-hidden`, no role, no name.
- Progress.Label and the native `<progress>` carry the meaning. Button keeps `aria-disabled`, `data-busy` and its name (2.5.3). Table keeps `aria-busy`.
- Announced once when shown and once when slow, politely. Nothing per tick or value, and nothing when the motion rests.

### 7.2 2.2.2 is the app's duty

- **Why it applies:** the indicators move for more than 5 s and start on their own, so WCAG 2.2.2 asks for a mechanism **on the page**. `prefers-reduced-motion` is a system setting, not a mechanism on the page, so an app that ships these indicators needs its own "reduce motion" control.
- **Decision:** the library ships no control, no state and no provider prop. Where the control sits, what it is called, and whether it is saved are product choices. The docs say this plainly.
- **Stopped look:** the rest shape, the same as reduced motion. Words are unchanged, so nothing is lost.

## Consumer duty for 2.2.2

Set an attribute of your own choosing on `<html>` from your control (here `data-reduce-motion`) and add this once, **after** `theme.css`. It stops every indicator that loops.

```css
:root[data-reduce-motion='true'] .kv-spinner,
:root[data-reduce-motion='true'] .kv-spinner::before,
:root[data-reduce-motion='true'] .kv-icon.kv-animate-spinner,
:root[data-reduce-motion='true'] .kv-icon.kv-animate-spinner > path,
:root[data-reduce-motion='true'] .kv-progress-track,
:root[data-reduce-motion='true'] .kv-progress-track::before,
:root[data-reduce-motion='true'] .kv-progress-bar,
:root[data-reduce-motion='true'] .kv-table[data-busy] .kv-table-column-header,
:root[data-reduce-motion='true'] .kv-table[data-busy] .kv-table-head > tr:last-child::after {
  animation: none;
}
```

With no animation, the spinner's head and tail return to 75 and 0, so the dash is the attribute's ¾ arc again; the band is not drawn, the sheen sits off the fill, and the hatch returns. The toast timer ring, fades and transitions are timers or under 5 s.

### 7.3 Other SCs

- **1.4.11:** the arc and the band core are at least 3:1 (§6.5). **1.4.1:** words carry every state. **2.3.1:** nothing flashes.
- **2.3.3 (AAA, not claimed):** reduced motion reaches the rest shape. **2.4.3:** the library adds no focus stop.
- **CPU and battery:** `rotate` runs on the compositor; the dash repaints one path in a box of at most 96px. The browser throttles hidden tabs, no script runs per frame, and the consumer's stop ends all cost.

## 8. What changes

### 8.1 Plan 0080 (done)

`DESIGN.md` Motion and Colors (`--kv-duration-loop`, `accent`), `status-patterns.md` D2, Progress and FileUpload docs, `contrast-requirements.ts` (`accent`), the roadmap. Details in git history.

### 8.2 Plan 0126

`spinner` is a library icon (`icon-library.md`, `icon-catalog.md`), crawled by `kv-animate-spinner` in `theme.css` §10. `icon.md` §6.5 records the motion exception; the built-ins stay 25. Docs: `status-patterns.md:87` (unchanged, still `kv-spinner`), the README row, the Icon docs page note.

### 8.3 Later: migrate the components

Button busy, Progress, the toast job icon and the Map status keep `kv-spinner` because they must work with no icon set registered. Moving them to `<Icon name="spinner">` needs a **built-in 26th icon**, which needs the maintainer's approval (icon.md open question 4). Then `--sm`/`--lg` map to sizes `16`/`48` (§6.4) and `kv-spinner` goes.

## 9. Validation

- [x] Self-review against the checklist: no open blockers. No new focus stop, visible string, token or colour pair. Forced colours, RTL and reduced motion are specified.
- [ ] Design review of the icon spinner from the `Icons/Library` → `LoadingSpinner` story at 12, 16, 20, 24 and 48px, light and dark, running and at rest, and in forced colours (the opt-in project): `pending` (after task 6).
- [ ] `vp run theme:check` after task 4: `pending` (orchestrator).
- **Usability test plan: `pending`.**
  - Participants: 8 residents (2 with vestibular or migraine sensitivity, 2 with low digital confidence, 2 second-language, 1 NVDA, 1 magnifier at 400 %) and 4 staff.
  - Tasks: submit with a 15 s delay; wait 40 s for a page; "the moving thing bothers you: make it stop" (the app's own control); refresh a case table.
  - Measure: whether participants find the app's control and how long it takes, double submissions, "is it working?" at 3, 8 and 12 s, whether the 1.25px arc is noticed at 20px, and discomfort.

## 10. Decisions taken (formerly open)

1. No library stop control: 2.2.2 is the consuming app's duty (§7.2).
2. Reduced motion shows the rest shape; nothing else is read by the library.
3. Scope of an app's stop: the indicators in §7.2's snippet.
4. Persistence: the app's own, if any.
5. `Progress.Indicator` part: a plan decision (0080), not a visual one.
6. The gradient and sheen contrast test (≥ 3:1): done, `packages/theme/src/loading-indicators.test.ts`.
7. `<tr>` check: `position: relative` on the last head row; fallback is the hatch moved by `background-position`.

## 11. Open questions

1. theme.css wraps the loops in `:where(:root:not([data-kv-motion='reduce']))`, but L4 says the library reads no `data-*` motion attribute. Remove it, or record it as a supported hook? (Found while reading, outside Plan 0126; `kv-animate-spinner` sits in the same wrapper.)
2. Migrating the components to the icon needs a built-in 26th icon (§8.3): maintainer approval.
