# Plan 0040: DateInput moves to the next box when one is full

- **Status:** Draft (needs the maintainer's approval of the accessibility trade-off below)
- **Owner:** orchestrator → component-engineer → accessibility-reviewer
- **Created:** 2026-10-04 · **Target:** M2
- **Related:** [0013](0013-form-fields.md), `keyboard`, `forms`, `accessibility` skills, `date-input.a11y.md`

## Goal

Typing `1990` in the year box of a `ÅÅÅÅ-MM-DD` date moves the caret to the month box, and `12` moves it on to the day box. Tab and Shift+Tab work as before.

## Non-goals

- OneTimeCode, TextInput and every other control keep "typing never moves focus".
- No arrow-key stepping between boxes. No digit filtering on the boxes (that is a separate decision).

## Background

`keyboard/SKILL.md:35`, `forms/SKILL.md:67` and `date-input.a11y.md:4,54,97` say typing never moves focus, citing SC 3.2.2 (On Input). The e2e test at `date-input.e2e.ts:98-113` asserts it. This plan reverses that for DateInput only, on the maintainer's request. GOV.UK's date input also does not auto-advance, so the guards matter.

## Design

### API sketch

```tsx
<DateInput.Root>…</DateInput.Root>                 // advances by default
<DateInput.Root autoAdvance={false}>…</DateInput.Root>
```

`useDateInput({ autoAdvance })` defaults to `true`. The "next" box is `order[index + 1]` of the effective order (`order ?? dateInputOrder(locale)`). Full means the box holds its maximum length of digits (2, 2 and 4, `maximumLength` in `date-engine.ts`).

### Accessibility contract (draft)

Guards that make this a trade-off and not a free pass:

1. Advance only when the user's typing (`beforeinput` `insertText`) makes a box full, and never from the last box.
2. Never on paste, drop, deletion, autofill, a prefilled or controlled value change, or when the box was already full and the user edits it.
3. Forward only. Backspace in an empty box does not move back. Shift+Tab and Tab are native.
4. The user is advised beforehand (SC 3.2.2): the group's description includes a message ("Focus moves to the next box when one is full"), an i18n string, in all six locales, overridable via `messages`. It is part of the group's `aria-describedby` and visible (a hint), not hidden.
5. `autoAdvance={false}` is the opt-out, for teams that follow the stricter reading.
6. Moving focus selects the whole next box, so typing replaces a prefilled value.

| Key              | Action                                                            |
| ---------------- | ----------------------------------------------------------------- |
| Digit            | Types. Fills the box → focus moves to the next box (guard 1 to 3) |
| Tab / Shift+Tab  | Next / previous box, unchanged                                    |
| Backspace/Delete | Edits in the box, never moves focus                               |

- WCAG SCs: 3.2.2 (advised beforehand), 2.1.1, 3.3.2, 4.1.2.

### i18n strings

| Key                         | en                                              |
| --------------------------- | ----------------------------------------------- |
| `dateInput.autoAdvanceHint` | Focus moves to the next box when a box is full. |

(sv, fi, nb, nn, se to follow, with the existing language-review process.)

## Tasks

- [ ] Maintainer approves the trade-off (guards 1 to 6)
- [ ] Failing tests first: unit (advance on fill, not on paste/delete/controlled change, not from last box, order `ÅÅÅÅ-MM-DD`/`DD.MM.YYYY`/`MM/DD/YYYY`, RTL) and e2e (replace the "typing never moves focus" test)
- [ ] `use-date-input.ts` `autoAdvance` option, `DateInput.Root` prop, the hint message through `useMessages`
- [ ] i18n in six locales, `i18n:check`
- [ ] Update `date-input.a11y.md`, `date-input.md`, `forms/SKILL.md:67`, `keyboard/SKILL.md:35` (state the DateInput exception and why), the Keyboard story and Docs section
- [ ] accessibility-reviewer APPROVE. Manual AT (NVDA, VoiceOver, TalkBack): focus moves are announced as a new field: `pending`, never claimed by an agent
- [ ] Changeset (minor, behaviour change of a default: call it out)

## Decisions

- **On by default, opt-out,** as the maintainer asked. The default is the risky side: **needs the maintainer's approval and the skill updates in the same PR** (AGENTS.md "Decisions").
- Auto-advance lives in the hook, so a custom DateInput gets it too.

## Risks & open questions

- Screen-reader users who type fast may not notice the focus move. Guard 4 and the new focus announcement are the mitigation, and the AT matrix is the check.
- Switch and voice users: dictating "one nine nine zero" triggers the same advance. Acceptable, and the opt-out exists.
- An `ÅÅÅÅ` box that needs fewer than four digits (a year `0999`) always needs Tab. Documented.

## Testing strategy

Behaviour only: where focus is after each input event. No CSS tests.

## Rollout

Minor with a clear changeset note. No codemod.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT may be `pending`)
- [ ] Plan tasks ticked, `docs/roadmap.md` status updated
