# Plan 0073: Toast `autoDismiss` in milliseconds, and a timer ring

- **Status:** Done (AT matrix and visual check in Storybook `pending`)
- **Owner:** lead → component-engineer
- **Created:** 2026-10-06 · **Target:** Toast alpha
- **Related:** Plan 0071 (Toast, no file on disk), `packages/react/src/toast/toast.a11y.md`, `docs/design/toast-timer-ring.md` (in progress)

## Goal

An app sets how long a toast stays with one plain value: `autoDismiss: false` (the default, nothing times out) or a number of milliseconds. A toast that will time out shows how much time is left, so nobody is surprised when it goes away.

## Non-goals

- A per-toast duration (`toast.show({ duration })`). Not asked for.
- Toasts with an action ever timing out. They never do.
- Warnings and errors in a toast. Still `Alert`.

## Design

### API

```tsx
<KvirnProvider toast={{ limit: 5, autoDismiss: 6000 }}>   // ms; false = persistent (default)
```

`autoDismiss?: false | number`. `true` and the 1–10 multiplier are removed. The reading-time formula `max(10 s, 100 ms × characters)` is removed with them: the number is the time.

A number that is not finite or is `<= 0` behaves as `false` and warns once in development (`api-conventions`, dev warnings). Pause rules stay: hover, focus, hidden tab, blurred window. Escape still closes a toast.

### Accessibility contract (changes only)

- **No floor.** A timed toast can go below 10 s. See Decisions: this is a maintainer-approved trade-off against WCAG 2.2.1 (Timing Adjustable). `toast.a11y.md` states it, with the mitigations: persistent by default, an app switch tied to a user setting, no timer on a toast with an action, pause on hover and focus, Escape, and the visible ring.
- **Ring:** decorative, `aria-hidden`, nothing announced. Shape, states, reduced motion and forced colours: `docs/design/toast-timer-ring.md`.
- WCAG SCs: 2.2.1 (trade-off above), 1.4.11 (ring 3:1), 2.3.3-style motion care (reduced motion), 2.5.8 (close button unchanged at ≥ 24×24).

## Tasks

- [x] 1. Core: `autoDismiss: false | number` in `toast-queue.ts` (remove scale, `toastMinimumDuration`, its export in `core/src/index.ts`); invalid number handling; update `toast-queue.test.ts`. **owner: component-engineer**
- [x] 2. React: `toast-controller.ts`, `use-toast.ts` doc comment, `kvirn-provider.tsx` type and doc; dev warning for an invalid number; update `toast.test.tsx`, the toast fixture and stories, `kvirn-provider.stories.tsx`. **owner: component-engineer**
- [x] 3. Docs: `toast.md`, `toast.a11y.md`, `kvirn-provider.md`, `apps/docs/content/toast.api.ts`, `toast-page.tsx`, `kvirn-provider-page.tsx`, `dev-warnings.mdx`, `.claude/skills/overlays-and-lists/SKILL.md`, `docs/design/toast.md`; `.changeset/toast.md` (public API; Toast is unreleased, so edit the existing changeset). **owner: component-engineer**
- [x] 4. Ring: expose duration and paused state (`data-*` or a CSS variable) from the React part; `theme.css` styles it; story states (running, paused, no timer, action); reduced-motion and forced-colors; test the data exposure, not the CSS. **After the UX spec; owner: component-engineer**
- [x] 5. Gates, `accessibility-reviewer` once, roadmap line.

## Decisions

- **2026-10-06, maintainer: `autoDismiss` is `false | ms`.** Why: a multiplier of a formula is hard to reason about; an app knows the time it wants. Rejected: keeping `true` as "default time" (a second way to say a number).
- **2026-10-06, maintainer: no minimum floor.** An accessibility trade-off against WCAG 2.2.1, approved by the maintainer. The docs say the app is responsible for tying the value to a user setting and for never timing out content the user must act on. The `accessibility-reviewer` is told this is approved and must not re-raise it as blocking; it may still note it.
- **2026-10-06, maintainer: ring variant A** (status-colour ring, the toast's own accent token, no new token). Rejected: B (track 1.02–1.13:1, fails 3:1), C (steps of 2.5 s only; kept as the reduced-motion alternative).
- Toasts with an action never time out (unchanged). Reason: the user may still be reaching for the action.
- Implementation (engineer): dev warning `toast-auto-dismiss-invalid` is raised once in the controller, so `core` stays console-free; the queue treats 0, negative, NaN and Infinity as `false`. `toastMinimum*` exports removed (unused).
- Open for Task 4: `resume` still restarts a timer with at least `toastResumeMinimumMilliseconds` (5 s) left, so a toast with a duration under 5 s gets 5 s after a pause. Kept: a user who just left hover or focus needs time to read. The ring must drain over the _remaining_ time after a resume, not the configured duration. `docs/design/toast.md` still says "No visible countdown": update in Task 4.

- Task 4 (engineer): `ToastEntry.timer?: { duration, remaining, run }` and `ToastQueueState.paused` in core (`run` from a queue-wide counter, so a same-id update restarts the ring). Ring is a `<span>` rendered through `Alert.Close`'s `render` (children would drop the icon and the name). `--kv-toast-timer-from` is `min(1, remaining / duration)`; after a resume under the 5 s floor the ring drains over the 5 s with from = 1 at most. The existing `AutoDismiss` story already covers running/paused/action; a `TimerRing` story asserts it. Reduced motion uses `round()` on the angle (Chrome 125+, Safari 18.4+, Firefox 118+).

## Risks & open questions

- Screen reader browse mode triggers neither hover nor focus, so a short timer can remove a toast unheard. Mitigation is the default (persistent) and the docs. `toast.a11y.md` already has this risk entry; reword it for the missing floor.
- Plan 0071's file is not on disk; its decisions live in `toast.a11y.md`. Not recreated here.
- The ring's variant is chosen by the maintainer from the prototype.

## Testing strategy

Core: a number is the exact timer length; `false` sets none; `0`, negative and `NaN` act as `false`; `setAutoDismiss` switches both ways. React: the dev warning for an invalid number; the duration and paused state are exposed on the toast. No CSS assertions.

## Rollout

Toast is unreleased (alpha candidate), so the API change edits the existing changeset and is not a breaking change on npm.

## Done when

- [x] Gates pass: `vp check`, `vp test run` on the toast files, `i18n:check`, `theme:check`
- [x] `accessibility-reviewer`: CHANGES REQUIRED, fixed (docs and duplicate tests); no re-review, no code finding
- [x] `docs/roadmap.md` Toast row current; this plan ticked
