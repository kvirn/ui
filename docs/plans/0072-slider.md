# Plan 0072: Slider

- **Status:** Implemented, reviewed; manual AT matrix `pending` (spec `docs/design/slider.md`; maintainer decisions recorded below)
- **Owner:** lead → ux-designer → component-engineer → accessibility-reviewer
- **Created:** 2026-10-06 · **Target:** M3
- **Related:** `docs/roadmap.md` (Slider, planned), Switch (`packages/react/src/switch`, the pattern to copy), `forms` and `keyboard` skills, [APG Slider](https://www.w3.org/WAI/ARIA/apg/patterns/slider/)

## Goal

A form control for picking one number in a range by dragging or with the keyboard, wired to `Field` like every other control, that works with a pointer, keyboard, touch and a screen reader, and is not the only way to enter the value.

## Non-goals

- A two-thumb range slider. APG's multi-thumb pattern needs two `role=slider` elements and a rule for crossing thumbs. A later plan, if asked.
- A vertical slider, tick marks with labels, a tooltip on the thumb. Add when a consumer needs one.
- Replacing `NumberInput`. A slider is for approximate values (volume, a distance filter). Exact values (an amount, an age) stay in `NumberInput`, which is the better input for WCAG 2.5.7 and precision.

## Background

No overlap in the repo: nothing uses `type="range"` or `role="slider"` (scout, 2026-10-06). `NumberInput` owns text entry and stepping with its own mask. A native `<input type="range">` already gives the APG keys (arrows, Home, End, PageUp, PageDown), pointer and touch dragging, `aria-valuenow` and form submit, and it passes 2.5.7 (dragging has a single-pointer alternative: the keys, and a pairing with a number input where the value matters). Native semantics first (hard rule 2), so there is no custom thumb and no pointer-capture code.

## Design

### API sketch

Same shape as `useSwitch` / `Switch`: a hook returning `inputProps` wired to the nearest `Field`, and a compound component.

```tsx
const control = useSlider({ value, onValueChange: setValue, min: 0, max: 100, step: 5, formatValue: (v) => `${v} km` })
<input {...control.inputProps} name="distance" />

<Field.Root>
  <Field.Label>Distance</Field.Label>
  <Slider.Root name="distance" min={0} max={100} step={5} defaultValue={20} valueText={(v) => `${v} km`} />
  <Field.HelpText>Search within this distance.</Field.HelpText>
</Field.Root>
```

- Options: `value`, `defaultValue`, `min` (0), `max` (100), `step` (1), `name`, `disabled`, `onValueChange(value: number, details)`, `valueText?: (value: number) => string` for `aria-valuetext`. Without it, the default is the number formatted with `useFormat()` (locale aware).
- Result: `inputProps`, `isInvalid`, `isDisabled`, `isFocusVisible`, `value`, `valueText`.
- Part props: `className: 'kv-slider'`, `type: 'range'`, `data-invalid`, `data-disabled`, `data-focus-visible`. No inline style: there is no track fill.
- No `core` module: there is no state to machine. `core` stays untouched.
- Controlled value is a `number`; the native input holds a string, so `onValueChange` gets `Number(event.currentTarget.value)`.

### Accessibility contract (draft)

Keyboard is native; every key goes in `slider.a11y.md`, the Docs Keyboard section and a named test (the browser sends real key events).

| Key               | Action                                             |
| ----------------- | -------------------------------------------------- |
| Tab / Shift+Tab   | Moves focus to / from the slider (one tab stop)    |
| ArrowRight / Up   | Increase by `step`                                 |
| ArrowLeft / Down  | Decrease by `step`                                 |
| Home / End        | Set `min` / `max`                                  |
| PageUp / PageDown | Increase / decrease by a larger step (native, 10%) |

- Roles / ARIA: native `input[type=range]` (implicit `slider`, `aria-valuemin/max/now` are native). `aria-valuetext` from `valueText`. `aria-describedby` and `aria-invalid` from Field, label from `Field.Label`. RTL: the browser flips left and right.
- Focus management: none beyond the native focus ring (`data-focus-visible`, 2.4.7, 2.4.11, 2.4.13 as the Switch does).
- Announcements: the AT announces the value on change natively. No live region.
- WCAG SCs: 1.3.1, 1.4.11 (track, thumb and focus indicator 3:1), 2.1.1, 2.4.7, 2.5.7 (dragging alternative: keys), 2.5.8 (thumb target at least 24px), 3.3.2, 4.1.2.
- Dev warnings: no accessible name (Field or `aria-label`); `min >= max`; `defaultValue` or `value` outside the range.

### i18n strings

None expected: the value text is the formatted number, and the label comes from the consumer. Confirm with the engineer; if a string appears it exists in all 6 locales and can be overridden.

### Theming surface

`kv-slider` class on the input, `data-invalid`, `data-disabled`, `data-focus-visible`. Visual spec, tokens, forced-colours and contrast pairs come from `ux-designer` (`docs/design/slider.md`). A token change needs the maintainer.

## Tasks

- [x] `ux-designer`: `docs/design/slider.md` (track, thumb, fill, states, forced colours, RTL, the value display)
- [x] Hook `use-slider.ts` + `slider.tsx` + `slider.md` + `slider.a11y.md` in `packages/react/src/slider`; export from the package index and the naming test
- [x] i18n (only if a string appears), dev warnings in `tooling/dev-warnings`
- [x] Browser tests `slider.test.tsx`: every key row, ARIA state, Field wiring, controlled and uncontrolled, RTL, axe
- [x] `theme.css` classes from the spec + `theme:check`
- [x] Stories in `apps/storybook/src/components/slider/` (every state, RTL, forced colours, `Keyboard`, `a11yContract`)
- [x] Changeset, docs page (`apps/docs`: slider-page, slider.api.ts, three examples, nav entry)
- [ ] Orchestrator: roadmap row to `alpha candidate`, delete this plan when `Done`

## Decisions

- Native `<input type="range">`, not a `role="slider"` `div` (native semantics first, no pointer code to maintain). Chosen; the alternative is only needed for multi-thumb.
- Single thumb only in v1. Multi-thumb is a later plan.
- Maintainer, 2026-10-06: **no track fill** (thumb and plain track), and the thumb is **enlarged under `(pointer: coarse)`** to the 44px comfortable target instead of accepting 24px on iOS. Spec: `docs/design/slider.md`.
- No `core` state: the hook adds only Field wiring, number conversion and `aria-valuetext`.
- `Slider` is not a `NumberInput` variant: different semantics, a different keyboard model and a different use.
- Engineer, 2026-10-06: `aria-labelledby` is an option of `useSlider` and a prop of `Slider`. When set, the hook takes nothing from the Field except `disabled`: no id, `aria-describedby`, `aria-invalid` or `data-*` state. The "no name" dev warning already accepts `aria-labelledby` and `aria-label`.
- Engineer: `Field.Label` and `Field.HelpText` take no `id` and the Field's label id isn't public, so Pattern A points `aria-labelledby` and `aria-describedby` at a `<span id>` inside the label and the help text. Open for the maintainer: a public way to get the label id would be cleaner.
- Engineer: `aria-valuetext` needs the current number, so an uncontrolled `useSlider` keeps a mirror in `useState` (seeded from `defaultValue` or the browser's halfway start, synced from the element on mount). It never drives the input. A `form.reset()` is read back from a `reset` listener on the form (in a timeout, since the reset runs after the event). The result also returns `value` and `valueText`, and `SliderState` has `value`.
- Engineer: no `warnOnce` for a required Field (a range has no required state, so the Field's `aria-required` and `data-required` are dropped silently). Dev warnings added: `slider-min-max`, `slider-value-out-of-range`.
- Engineer: story `play` functions drive the range with `fireEvent.change`, because Storybook's `userEvent` sends synthetic keys that don't step a native range. The real keys are tested in `slider.test.tsx`.
- No string appeared, so no i18n change. Dev warnings sit in the component tests, as Switch's do, not in `tooling/dev-warnings`.

- Engineer, 2026-10-06 (test fixes): the `id` warning ignored `aria-labelledby`: `Slider` now passes `isInField` to `useControlWarnings` only when it claims the Field (no `aria-labelledby`), matching the hook, so the test was right and the code wrong. The form-reset test was right too: `aria-valuetext` stayed at the old number because reset fires no change event, so the hook reads the value back from a `reset` listener on the form.

## Risks & open questions

- Cross-browser styling of the native track and thumb needs both `::-webkit-slider-*` and `::-moz-range-*` rules; keep them in one place in `theme.css`.
- Pattern A (slider plus NumberInput sharing one label) needs `Field` wiring where the label points at the number box: the engineer confirms `useSlider` can take `aria-labelledby` and the "no name" dev warning accepts it (spec §9.2).

## Testing strategy

Standard pyramid (`testing` skill). Each key row is a named test in `slider.test.tsx`; ARIA state, Field wiring and axe in the same file. No CSS assertions.

## Rollout

Minor changeset for `@kvirn-ui/react` and `@kvirn-ui/theme`. Manual AT matrix `pending`.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT may be `pending`)
- [ ] Plan tasks ticked, `docs/roadmap.md` status updated, plan deleted in the closing change

## Resume notes (2026-10-06, editor restart)

- Review 1: CHANGES REQUIRED, fixes briefed (form-reset `aria-valuetext`, `isInField` warning, fixture decimal comma, three stories, a11y.md line). Left: engineer's scoped tests, one re-review, the story projects, roadmap row to ticked state, delete this plan when Done.
- Not yet run for the review-fix batch (Menu, Pagination, TOC, Navigation, Slider, ErrorSummary, SummaryList): the four `storybook*` projects, sequentially (`vp test run --project <name> <story folders>`), then one `accessibility-reviewer` on the fixed diffs. Components, tooling, i18n and theme gates were green.
- The Toast files carry parallel edits from another session (Plan 0073): keep them out of this commit.

## Follow-ups (reviewer, deferred)

- Extra stories for `min`/`max`, hover and a coarse pointer; the `kv-slider` class line in DESIGN.md.
