# Design spec: Toast timer ring

- **Status:** Draft · **Designer:** ux-designer agent · **Date:** 2026-10-06
- **Plan:** 0071 (not found in `docs/plans/`; the plan's Design section links here once it exists). Amends [toast.md](toast.md) §6 "No visible countdown or progress bar"
- **Prototype:** [prototypes/toast-timer-ring.html](prototypes/toast-timer-ring.html) (variants A, B, C; theme, RTL, reduced motion and forced colours toggles)
- **Given (maintainer):** `autoDismiss: false` (default) or a number of ms. There is no minimum time (maintainer-approved 2.2.1 trade-off); paused on hover, focus, hidden tab and blurred window; resumes with ≥ 5 s; an action toast never times out; info and success only.

## 1. Brief

- **Users:** both; mostly staff who turned timed toasts on, many times a day. **Hardest case:** a low-vision staff user in `dark-contrast` at 200% zoom with a tremor, aiming for Close before the toast goes; then a reader with a cognitive disability who needs to know the message will leave by itself.
- **Job:** _When a message will close by itself, let me see that, and how soon, so I can read it or keep it without a surprise._
- **Success:** the user tells a timed toast from a persistent one and knows hover or focus keeps it (test pending, §8). Assumption, not research: a visible timer reduces "it vanished before I read it".

## 2. Prior art

| Source                                                                             | Took                                                   | Changed                                                        |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------- |
| react-toastify's progress bar (bottom edge, pauses on hover)                       | Drain shows time left; freeze on pause                 | A ring on Close, not a bar: ties "time" to "how to keep/close" |
| [Material circular progress](https://m2.material.io/go/design-progress-indicators) | Clockwise from 12 o'clock                              | Determinate only, no spinning                                  |
| `DESIGN.md` §Icons (Direction), §Motion; [alert.md](alert.md) bar colours          | Clocks don't mirror; motion only under `no-preference` | –                                                              |

## 3. Flow (states of the ring)

1. Timed toast shown → ring **full**, starts draining over the toast's duration.
2. Hover, focus inside, tab hidden, window blurred, modal open → ring **frozen** where it is (pause is page-wide: all rings freeze).
3. Resume → drains on. If < 5 s were left, the ring **jumps up** to 5 s worth (instant, honest).
4. Same `id` shown again → ring full again. `autoDismiss` switched off at runtime → ring removed; on → ring appears.
5. Time out → toast removed (existing behaviour, nothing announced). Close/Escape → removed.
6. **No timer** (`autoDismiss: false`) or **action toast** → no ring: Close looks as today. The ring's presence is the "closes by itself" cue.

## 4. Content

No new strings. The ring is decorative (`aria-hidden`), so nothing to translate. Rejected key: `toast.closesAutomatically` (§9 Q2).

## 5. Structure

Unchanged at 320px, 40rem and 64rem: the ring lives inside Close (top inline-end of the toast). Close stays 44 × 44 (32 × 32 compact), ≥ 24 × 24 (2.5.8). The ring takes no space and no pointer events.

## 6. Visual specification

| Property | Value (variant A, recommended)                                                                                                                 |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Shape    | A circle inset 2px inside Close: 40px (28px compact) diameter, round, `--kv-radius-full`. The 20px close icon sits centred inside              |
| Stroke   | 2px (rule-local `--kv-toast-timer-width`, like the toast's other rule-local sizes). 1px is too faint; 4px crowds the icon at 28px              |
| Colour   | `--kv-alert-accent`: `primary` on info, `success` on success, the toast's own bar colour. **No track**                                         |
| Drain    | The remaining arc ends at 12 o'clock; the emptied part grows **clockwise** from 12, like a clock hand. Linear, no easing                       |
| RTL      | **Not mirrored** (a clock, not a direction: DESIGN.md §Icons). Close moves to the left by logical properties as today                          |
| Last 3 s | **No change**: no colour shift (colour alone, 1.4.1), no pulse (attention-grabbing, flashing risk). "Last" is whatever the app's time makes it |
| Paused   | **Frozen**, no other cue. Dimming fails 3:1; a pause glyph looks like a button that does something                                             |

**Variants in the prototype:** **A** status-colour ring, smooth (recommended). **B** `text-muted` ring on a 1px `border-subtle` track: quieter, but the track is 1.02–1.13:1 in the standard themes (invisible) and the arc-to-track pair falls to 1.74–2.22:1 in the contrast themes. **C** four quarter segments that drop out one by one, always stepped: calmest, coarsest (a 10 s toast steps every 2.5 s).

### States

| Part | Running | Paused | Close hover                    | Close focus-visible                                                                  | No timer / action |
| ---- | ------- | ------ | ------------------------------ | ------------------------------------------------------------------------------------ | ----------------- |
| Ring | Drains  | Frozen | Unchanged, on `surface-raised` | Unchanged; the 2px `focus-ring` sits outside Close with its 2px offset, so ≥ 4px gap | Absent            |

### Modes

| Mode           | Rule                                                                                                                                                                                                |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reduced motion | Not static (a full ring that never moves misleads). **Stepped in quarters of the whole duration**: the arc changes instantly at 75 %, 50 %, 25 % left, then the toast goes. Full until 75 % is left |
| Forced colours | Ring in `ButtonText` (Close's colour); it is a border shape + mask, so it survives. No `forced-color-adjust: none`                                                                                  |
| Dark, contrast | Same token, remapped by the theme. Contrast below                                                                                                                                                   |
| Print          | Close is hidden already                                                                                                                                                                             |

**Contrast (1.4.11), arc against what touches it; light / dark / light-contrast / dark-contrast:**

| Pair                                        | Ratios                        | In `theme:check`                    |
| ------------------------------------------- | ----------------------------- | ----------------------------------- |
| `primary` on `primary-subtle` (info)        | 4.15 / **3.32** / 8.72 / 8.33 | yes (`primary` on `primary-subtle`) |
| `primary` on `surface-raised` (info, hover) | 4.70 / 3.75 / 9.89 / 9.40     | yes (plain backgrounds)             |
| `success` on `success-subtle`               | 5.46 / 8.62 / 8.42 / 10.66    | yes (as text, 4.5:1 / 7:1)          |
| `success` on `surface-raised` (hover)       | 6.06 / 9.53 / 9.36 / 11.80    | yes (as text)                       |

Measured with the WCAG formula (`contrast.ts`), palette of 2026-10-06. **No new token and no new pair.**

## 7. Accessibility annotations

- **Ring:** a `<span class="kv-toast-timer" aria-hidden="true">` inside Close. Close's name stays `alert.close`, its description the message. No `role="progressbar"` (a button's children are presentational, and a ticking value is noise).
- **Announced:** nothing. **Recommendation: don't expose the remaining time** to AT in any other way. Focus inside pauses the timer, so a keyboard or screen reader user who reaches the toast keeps it; browse mode can't, which is why the default is persistent and the app ties `autoDismiss` to a user setting (toast.a11y.md, Known issues).
- **Tab stops, keys, focus moves:** unchanged (toast.a11y.md). **2.2.2:** the drain is moving content > 5 s; pause = hover/focus, hide = Close/Escape.

## 8. Implementation sketch (for component-engineer)

**Chosen: a CSS animation driven by numbers from the queue,** not a per-frame variable (no rAF, no re-render per frame) and not CSS-only (CSS can't know the 5 s resume minimum, the hidden-tab pause or a same-`id` restart).

| Layer   | Exposes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `core`  | `ToastEntry.timer: { duration, remaining, run } \| undefined` (ms; `duration` = the time the toast was given; `remaining` at the start of this run; `run` increments on arm, resume and update) and `ToastQueueState.paused: boolean`, published on pause and resume. Pure numbers                                                                                                                                                                                                                                               |
| `react` | On the toast root: `data-timed` and `data-paused` (state). Inside Close, only when timed: the span above, `key={run}` (restarts the animation without remounting Close, so focus stays), with `--kv-toast-timer-from: remaining / duration` and `--kv-toast-timer-remaining: <remaining>ms` (precedent: `--kv-popup-width`, `--kv-table-head-block-size`). Zero CSS                                                                                                                                                              |
| `theme` | `@property --kv-toast-timer-angle` (`<angle>`); the span: absolute (Close gets `position: relative`), `inset: 2px`, a 2px border in `--kv-alert-accent`, `--kv-radius-full`, `pointer-events: none`, masked by `conic-gradient(transparent calc(1turn - angle), var(--kv-black) 0)` (only the mask's alpha counts); animation from `calc(from * 1turn)` to `0turn`, `linear forwards`; `[data-paused]` → `animation-play-state: paused`; reduced motion → mask angle `round(up, angle, 0.25turn)`; forced colours → `ButtonText` |

Without `theme.css` the span is empty and invisible. The prototype's CSS is a working draft of the theme rules.

**Tests (proposals, cheapest layer):** core: `run` increments on resume and update, `paused` publishes, `remaining ≥ 5000` after resume (exists). React: the span exists only when timed and is `aria-hidden`; `data-paused` follows hover and focus; Close keeps focus across a same-`id` update. No CSS assertions (rule 13).

## 9. Validation and open questions

- **Self-review:** checklist walked; no new tokens; contrast measured above. Visual check in Storybook (four themes, RTL, forced colours): `pending`.
- **Usability test plan — `pending`:** 6 staff (2 screen magnifier, 1 NVDA, 1 Windows Contrast Themes) and 4 residents with low digital confidence. Tasks: say which of two toasts closes by itself; keep a timed toast long enough to read it; close it. Measure: correct answers, unwanted disappearances, reported stress. Also check whether a 2px `primary` circle in Close reads as a focus indicator.

**Open questions for the maintainer**

1. Variant **A** (recommended), B or C?
2. Expose "closes automatically" to AT (a new `toast.closesAutomatically` key in Close's description)? Recommendation: no; revisit after the AT matrix.
3. Does a draining ring add time pressure for stressed users? If the test says yes, fall back to C (stepped) for everyone.
4. Stroke 2px as a rule-local size, or a shared token?
5. [toast.md](toast.md) §6 says "No visible countdown": done (Plan 0073).
