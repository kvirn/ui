# Plan 0080: Loading indicators (spinner, animated gradient bar)

- **Status:** Implemented; reviewer round 2 not completed at commit time, manual AT pending. Final direction 2026-10-06: endless loops, no library stop control; the consumer owns the 2.2.2 mechanism and the docs say how (see Decisions).
- **Owner:** lead → ux-designer (done) → component-engineer → accessibility-reviewer
- **Created:** 2026-10-06 · **Target:** alpha
- **Related:** supersedes Plan 0074 D2 ("no spinner, no indeterminate bar"); spec `docs/design/loading-indicators.md` (visual spec, tokens, parts, motion); prototype `docs/design/prototypes/loading-indicators.html`; `docs/design/toast-timer-ring.md`; `docs/design/status-patterns.md`

## Goal

A wait looks alive: a spinner (the arc ring the toast timer ring is built from, with the Crawl motion) and an animated primary-to-accent gradient bar, with the words still first. They loop for as long as the wait lasts and honour `prefers-reduced-motion`. WCAG 2.2.2 is the app's duty (a way to stop moving content), and the docs say exactly what to do.

## Non-goals

- Dual-arc, dots, stripes, glow and skeleton variants (the prototype marks them "not shipping").
- A Stop control, a `motion` provider prop, or any motion state in React (tried and removed, see Decisions).
- Changing Progress announcements, `progress.*` and `table.loading` strings, the 1000 ms show delay and the 10 s slow sentence.
- Touching the toast timer ring.

## Background

Plan 0074 shipped Progress text first and a static hatch for unknown values. The maintainer rejected "no spinner and no indeterminate bar" and wants the toast ring look reused and a gradient bar like the animated table state. The indicators loop endlessly, so WCAG 2.2.2 (Pause, Stop, Hide) applies: moving content that starts automatically and lasts more than 5 s needs a mechanism on the page to pause, stop or hide it. The library honours `prefers-reduced-motion: reduce` (rest shape at once) but ships no stop control: that is out of scope, and the app must offer its own "reduce motion" control. The docs state this and give a copy-paste stop snippet. Note for review: the OS setting alone is not a page mechanism, so the library never claims 2.2.2 on its own. A 4.8 s cap and a MotionToggle were built and removed on the way.

## Design

The spec is `docs/design/loading-indicators.md`: §3 decisions, §5 pick per use, §6 parts, motion and tokens, §7 accessibility annotations, §8 lines this reverses. Read those for any visual value.

### API sketch

```tsx
<Progress.Root>                 {/* unknown wait: spinner + label (+ slow sentence at 10 s) */}
  <Progress.Indicator />        {/* decorative aria-hidden span: the spinner */}
  <Progress.Label>Loading cases</Progress.Label>
</Progress.Root>
<Progress.Root value={40} />    {/* known value: native <progress>, gradient fill with sheen */}
<Button busy>Save</Button>      {/* spinner after 1000 ms, no new prop */}
toast.show({ busy: true, ... }) {/* spinner in the icon slot of a job toast */}
```

New public API: `Progress.Indicator` (+ `ProgressIndicatorProps`), `ToastShowOptions.busy`, Alert roots `icon?: ReactNode`; theme classes `kv-spinner(--sm/--lg)`, `kv-progress-track(--thin)`. Button, Table and FileUpload get no props. No provider, hook or i18n change.

### Accessibility contract (draft)

No new interactive part, so no new keyboard row: Tab order and keys are unchanged for Button, Toast and FileUpload.

- Roles / ARIA: spinner, track, head line and sheen are `aria-hidden`, no role, not focusable. Meaning stays with `Progress.Label` and the native `<progress>` (only with a value); Button keeps `aria-disabled`, `data-busy` and its name (2.5.3); Table keeps `aria-busy`.
- Focus management: unchanged; an indicator mounting or unmounting never moves focus.
- Announcements: once when shown, once when slow, politely (unchanged). Nothing per tick or value.
- Motion: loops are endless inside `prefers-reduced-motion: no-preference`; under `reduce` the rest shape (¾ arc, hatch, plain gradient fill) from the start. Nothing flashes.
- WCAG SCs: 2.2.2 (consumer duty: the app offers a way to stop the indicators; documented), 1.4.11 (arc and band core ≥ 3:1), 1.4.1, 2.3.1, 2.5.3; 2.3.3 not claimed.

### i18n strings

None added.

### Theming surface

- Tokens (approved): `--kv-color-accent` (four themes), `--kv-duration-loop` 1600ms, sheen ≤ 20 % `on-primary`. Spinner and bar custom properties as in spec §6.1 and §6.5.
- Animations run only inside `@media (prefers-reduced-motion: no-preference)` and loop (`infinite`). No `data-*` motion attribute; an app stops them with its own CSS (documented snippet).

## Tasks

- [x] **T1 (theme)** built accent token ×4 themes, `--kv-duration-loop`, spinner, tracks, gradient bar, table head sweep, FileUpload track, contrast pairs, a ≥ 3:1 theme test.
- [x] **T3 (consumers)** built `Progress.Indicator`, busy Button spinner, Toast `busy` (Alert `icon`), FileUpload track, stories and docs.
- [x] (T4, docs site) pages.
- [x] **T5 (theme, rework 2):** endless loops again (prototype variant B for the spinner), only under `no-preference`; DESIGN.md, status-patterns.md and the spec rewritten with the consumer 2.2.2 duty and a verified stop snippet.
- [x] **T6 (consumers, rework 2):** remove the 5 s timing helper and its calls; contracts, docs and changeset say loops are endless and name the consumer 2.2.2 duty; a docs-site section "Moving indicators and WCAG 2.2.2" with the snippet.
- [x] **T7 (removal):** delete provider motion files, `motion` prop, `packages/react/src/motion-toggle/`, `motion.stopAnimations` in 6 locales, its story, docs pages, nav entry and the docs header toggle.
- [x] **T8 (timing test):** built, then removed: the 5 s threshold is no longer a requirement.
- [ ] Engineering check (Q7): `position: relative` on a `<tr>` under a sticky head, in Chromium, Firefox and WebKit, with and without a height-limited `Table.ScrollRegion`. Fallback: the hatch moved by `background-position`. Maintainer visual check pending.
- [x] Gates (lead): check (only stale built-type errors in apps/docs), tests 712 + 468, i18n, theme green: `vp check`, `vp test run`, `vp run i18n:check`, `vp run theme:check`, scoped, then `vp fmt`.
- [ ] Review: round 1 done (CHANGES REQUIRED, all findings fixed or moot); round 2 started and left open by the maintainer at commit. `accessibility-reviewer` on the rework diff (round 1 findings that still apply: Read aloud is moot with no toggle; the sheen contract and the changeset are in T6).
- [ ] Docs: `docs/design/README.md` row (spec status) and `docs/plans/README.md` row.
- [ ] Manual AT matrix: `pending` (never claimed), including real forced colours and 320px and the usability test plan (spec §9).

## Decisions

Maintainer:

- **Token change approved:** `--kv-color-accent` (4 themes) and `--kv-duration-loop`; the gradient runs primary → accent.
- **Spinner motion: Crawl** (prototype variant B: head and tail on two `@property` angles, box turn 2400 ms, tail on a rule-local `cubic-bezier(0.6, 0, 0.4, 1)`, no new token). **Bar: B1 sweep.** FileUpload moves to the new bar. Arc ring + sweep only ship.
- **2.2.2 (final, 2026-10-06, supersedes both the endless + MotionToggle and the 4.8 s cap):** animations stay endless; no MotionToggle, `motion` prop or hooks in the library; only `prefers-reduced-motion` is honoured. The mechanism WCAG 2.2.2 asks for is the app's own control, out of scope here; the docs state what to do and give the stop snippet. Lead's note, recorded for the maintainer: the OS setting by itself is not a mechanism on the page, so docs say "to meet 2.2.2 the app must offer…" and the library claims nothing (hard rule 8). A first-class CSS hook (an attribute the theme honours) would make the app's part one line; not added, ask if wanted.

Lead (taken here, open to veto):

- **`Progress.Indicator` part** rather than classes only, so the one-indicator-per-wait and show-delay rules are tested once. Needs the changeset.
- **Spinner inside the busy button**, `currentColor`, with the words in the Progress beside it (no second indicator for one wait).
- **Toast timer ring unchanged.** It is a timer, not a loading indicator.
- **Toast job:** `ToastShowOptions.busy` swaps the status icon for `<span class="kv-alert-icon kv-spinner" aria-hidden="true">`; status word and variant stay. To do it without hacking Alert's children the ready-made Alert roots got `icon?: ReactNode`. A job toast should be shown without an auto-dismiss timer. The result replaces it by showing the same `id`.
- **Progress.Indicator** renders only without a `value` (known value: native `<progress>`, no spinner: one indicator per wait). A Progress beside a busy Button carries no Indicator.
- **FileUpload:** `FileUpload.Progress` renders `<span class="kv-progress-track" aria-hidden="true">` when the progress is unknown and ignores `render` and other props then; `getProgressProps` unchanged.
- **Q7 (T1):** `position: relative` on the last head `<tr>` with an absolute `::after` (the table is `border-collapse: separate`). Not verified in a browser.
- **Follow-up, not now:** the review also suggested a description for why a control is disabled; moot without the toggle.

## Risks & open questions

- `@property`-animated arc, sheen and head line repaint a small box every frame for as long as the wait lasts; hidden-tab throttling helps. An app that does not offer a stop control ships a 2.2.2 failure: the docs and every `.a11y.md` say so first.
- Gradient midpoints and the sheen composite are not seen by `theme:check`; the theme test covers them at ≥ 3:1 (sheen above 20 % fails).

## Testing strategy

Each contract row once, in the cheapest layer (`testing` skill). No test reads CSS text. Behaviour: `aria-hidden`, no `<progress>` without a value, one indicator per wait, the busy Button name and `aria-disabled` unchanged, spinner present or absent per state. Contrast thresholds in the theme test. Axe 0 violations in every story state. No timing test (no limit to assert).

## Rollout

Pre-1.0, minor changesets for `@kvirn-ui/react` and `@kvirn-ui/theme`. No migration.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT may be `pending`)
- [ ] Plan tasks ticked, `docs/roadmap.md` status updated
- [ ] Every line in spec §8 reversed, so no doc says "no spinner"; the consumer 2.2.2 duty is in the docs
