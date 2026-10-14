# 0115: RadioGroup.Reveal (a field that appears when an option is chosen)

Status: In progress

## Problem

"Other, please specify": a text field that exists only while one radio is chosen. Done naively it
pops up unannounced, may move focus (WCAG 3.2.2), sits far from its radio in the reading order
(1.3.2) or leaves a screen reader user unaware it is there (4.1.3).

## Options weighed

1. **Always visible, disabled until chosen.** Simple, but a greyed-out field is noise and a
   disabled control drops out of Tab and the reading order.
2. **Move focus into the field on choose.** Rejected: a change of context on input (3.2.2) and it
   breaks arrow-key movement through the radios.
3. **Reveal in place (chosen).** The content follows its radio in the DOM, focus stays on the
   radio, the radio points at it with `aria-controls`, and a polite announcement says a field
   appeared. This is the GOV.UK conditional-reveal pattern plus the announcement.

## Design

`RadioGroup.Reveal` (`value: string`, `as`?, native `<div>` props): the content that belongs to the
radio with that `value`. Put it right after that radio's `Field.Root`, inside `RadioGroup.Root`.

- Always rendered with a stable `id`; `hidden` unless its radio is checked. (`aria-controls` then
  never points at nothing.)
- The radio with the same `value` gets `aria-controls={revealId}` when a Reveal for it is mounted.
  No `aria-expanded`: it is not supported on `radio`.
- When the user checks the radio (not on first render, not on a controlled reset), announce through
  `useAnnouncer().announce` (polite): the message names that more input follows. New message
  `radioGroup.revealShown` in `packages/i18n` for sv fi nb nn en, overridable per provider and per
  instance (`messages` on `RadioGroup.Root` or Reveal, as the neighbours do).
- Checking a different radio hides it again. No announcement needed (it is removed, focus is on a
  radio); do not announce on hide.
- Selected value: controlled `value` when given; otherwise the group mirrors the checked value from
  its own `onChange` (initial `defaultValue`). This is UI state only, no form state.
- The typed text stays in the DOM while hidden and is submitted with a plain form: document that the
  consumer clears or ignores it (a `hidden` field is still successful). Do not unmount: it would
  lose what the user typed if they switch back.
- Hook: `useRadioGroup` returns `getRevealProps(value)` and `getRadioProps` adds `aria-controls`;
  `RadioGroupContext` carries them.
- Style in `theme.css`: `.kv-radio-group-reveal` (parts are `kv-<part-name>`, no BEM `__`):
  inline-start border and padding to tie it to its radio, no animation, uses existing tokens only.
  No new token.

## Contract rows (draft, goes in radio-group.a11y.md)

| Row                                             | Test                                           |
| ----------------------------------------------- | ---------------------------------------------- |
| Hidden until its radio is checked               | reveal hidden, then visible after choose       |
| Focus stays on the radio when it appears        | `document.activeElement` is the radio          |
| Content follows its radio in DOM order          | reveal is next sibling of the radio's field    |
| Radio has aria-controls = reveal id             | attribute check                                |
| Announced politely once when it appears         | announcer text; not on mount with defaultValue |
| Not announced when hidden or on initial checked | announcer empty                                |
| Arrow keys still move through the radios        | keyboard: ArrowDown skips the reveal's input   |
| Tab from the radio reaches the revealed field   | keyboard                                       |
| Labels in all 5 locales and overridable         | i18n:check, messages override                  |

## Tasks

- [x] Tests first in `radio-group.test.tsx`; then hook, context, part, export in `index.ts`
- [x] i18n message in 5 locales
- [x] `theme.css` class (+ forced-colors check that the border survives)
- [x] `radio-group.a11y.md`, `radio-group.md`, `radio-group.api.ts` on the docs site
- [x] Story `OtherOption` in `radio-group.stories.tsx` (+ fixture), every state, RTL
- [ ] Gates: `vp check`, `vp test run`, `i18n:check`, `theme:check`; accessibility-reviewer

## Decisions taken in implementation

- Uncontrolled selection: the group mirrors the radio the user chose in `useState` (initial
  `defaultValue`); on the `<form>` `reset` event (listened to by the Reveal via `closest('form')`)
  it goes back to `defaultValue ?? null`. Controlled: `value`.
- "User chose" = a ref set in the radio's `onChange`, consumed by the Reveal's effect when it opens
  and cleared after every commit, so a `value` set from outside or on mount never announces.
- `aria-controls` appears through `registerReveal` (effect), so a radio never points at nothing.
- Reveal `id` is `useId` + `-reveal-` + `encodeURIComponent(value)`; `data-state` open/closed.
- Announcement is throttled per value (`key`), and `messages` is on the Reveal only (Root's
  `messages` belong to Field/Fieldset).
- Hook result gains `getRevealProps`, `registerReveal`, `consumeUserChoice`, `resetSelection`.
- Reveal is `div` or `section` via `as`. Context type `RadioGroupRevealItemProps` (the part's props
  type is `RadioGroupRevealProps`).
- Story `OtherOption`, `OtherOptionControlled`, and an open reveal in the shared RTL/ForcedColors
  states column.
- Not done: accessibility-reviewer, AT matrix, whole-tree gates.

## Out of scope

CheckboxGroup, Select and Switch variants (the hook is shaped so CheckboxGroup can reuse it
later). A generic Disclosure-style "reveal on any state".
