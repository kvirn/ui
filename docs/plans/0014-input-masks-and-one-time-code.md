# Plan 0014: Input masks and OneTimeCode

- **Status:** Draft
- **Owner:** Maintainer / component-engineer
- **Created:** 2026-10-02 · **Target:** M1
- **Related:** ADR-0032, ADR-0033 (Proposed), ADR-0029, ADR-0030, ADR-0007, Plan 0013. Design spec: `docs/design/one-time-code.md` (to be written by ux-designer)

## Goal

Adopters can shape what users type, such as a personal identity number, a postcode or an amount, with a preset or their own mask, without breaking paste, autofill, dictation or screen readers. They can also ask for a one-time code in a row of boxes that is one native field underneath.

## Non-goals

- A validation engine. `min` and `max` are reported, not enforced, and the `checks.*` functions are helpers the consumer calls (ADR-0032, item 4).
- A date mask: dates are DateInput (ADR-0030).
- Phone number formats per country.
- Resend links, countdowns and timeouts for codes: those are the M4 login and verification blocks.
- Form state of any kind (ADR-0029, item 0).

## Background

- No APG pattern for either. Both stay a native `<input>`.
- WCAG: 1.3.1, 1.3.5, 1.4.10, 1.4.12, 2.5.3, 2.5.8, 3.2.2, 3.3.1, 3.3.2, 3.3.4, 3.3.8, 4.1.2, 4.1.3.
- Prior art: iMask, Alpine Mask, GOV.UK (lenient text input, "Confirm a phone number"), `input-otp`.
- The problems we design out are listed in ADR-0032 (context) and ADR-0033 (context).

## Design

### API sketch

```tsx
import { Field, Input, OneTimeCode, masks } from '@kvirn-ui/react'

// A preset on Input
<Field.Root invalid={errors.personalIdentityNumber !== undefined} required>
  <Field.Label>Personnummer</Field.Label>
  <Field.Description>12 siffror, till exempel 19900101-1234.</Field.Description>
  <Field.ErrorMessage>{errors.personalIdentityNumber}</Field.ErrorMessage>
  <Input
    name="personalIdentityNumber"
    mask={masks.personalIdentityNumber({ country: 'SE' })}
    onValueChange={(value, details) => form.setValue('personalIdentityNumber', details.unmaskedValue)}
  />
</Field.Root>

// A number with a range that is reported, never clamped
<Input
  mask={masks.number({ decimals: 2, min: 0, max: 100000 })}
  onValueChange={(value, details) => setRentInRange(details.isWithinRange)}
/>

// Your own pattern, or the hook on your own <input>
const caseNumberMask = useMask({ mask: masks.pattern('aa-9999') })
<input {...mergeProps(ownProps, caseNumberMask.inputProps)} />

// One-time code
<Field.Root invalid={codeError !== undefined}>
  <Field.Label>Kod från sms:et</Field.Label>
  <Field.Description>Koden har 6 siffror.</Field.Description>
  <Field.ErrorMessage>{codeError}</Field.ErrorMessage>
  <OneTimeCode.Root length={6} onComplete={verifyCode}>
    <OneTimeCode.Input name="code" />
    {/* or map useOneTimeCode().slots */}
    {Array.from({ length: 6 }, (_, index) => <OneTimeCode.Slot key={index} index={index} />)}
  </OneTimeCode.Root>
</Field.Root>
```

`core` exports `createMask`, `masks`, `checks`, and the types `CheckResult`, `Mask`, `MaskDefinition`, `MaskResult`, `MaskRejection`. `react` re-exports `masks` and `checks`, and adds `useMask`, `UseMaskOptions`, `UseMaskResult`, `MaskInputPartProps`, `OneTimeCode` (`Root`, `Input`, `Slot`), `OneTimeCodeRoot`, `OneTimeCodeInput`, `OneTimeCodeSlot`, `useOneTimeCode`, `UseOneTimeCodeOptions`, `UseOneTimeCodeResult`, and the `OneTimeCode*PartProps` types. `InputChangeDetails` gains `unmaskedValue`, `isComplete`, `isWithinRange` and `rejected`, all optional and only set with a mask.

### Accessibility contract (draft)

**Masked Input** (added to `input.a11y.md`):

| Key or action              | Result                                                                                          |
| -------------------------- | ----------------------------------------------------------------------------------------------- |
| Type an allowed character  | Inserted at the caret. A literal is inserted after it only when the next character is typed.    |
| Type a literal at its spot | Accepted once, not doubled                                                                      |
| Type a refused character   | Not inserted. The Announcer says why, at most once every few seconds                            |
| Paste, drop or autofill    | Separators and refused characters stripped, the rest fills the mask. Nothing is truncated early |
| Backspace / Delete         | Always removes a character, also when it's next to a literal                                    |
| IME or dead key            | Left alone until `compositionend`                                                               |
| Undo                       | Native. Lost only for a step where the mask inserted a literal                                  |

- Roles / ARIA: a native `<input>`, no added role. Field wiring as ADR-0029.
- Announcements: the shared Announcer, `mask.characterNotAllowed` and `mask.maximumLength`, polite and throttled. `announceRejections={false}` opts out.
- Dev warnings: a mask without a Field.Description (3.3.2), and a non-email mask on `type="email"`.

**OneTimeCode** (`one-time-code.a11y.md`):

| Part  | Element               | ARIA / attributes                                                                                         |
| ----- | --------------------- | --------------------------------------------------------------------------------------------------------- |
| Root  | `<div>`               | none, `data-complete`, `data-invalid`, `data-disabled`                                                    |
| Input | `<input type="text">` | Field wiring, `autocomplete="one-time-code"`, `inputmode="numeric"`, `spellcheck="false"`, no `maxlength` |
| Slot  | `<span>`              | `aria-hidden="true"`, `data-filled`, `data-active`, `data-invalid`                                        |

| Key                         | Action                                        |
| --------------------------- | --------------------------------------------- |
| Tab                         | One stop: the input                           |
| Characters, paste, autofill | As a masked Input                             |
| Arrow keys, Home, End       | Native caret movement, shown by `data-active` |
| Enter                       | Native implicit submit of the form, if any    |

- Focus: never moved by the component. A pointer press on a slot focuses the input.
- No auto-submit. `onComplete` is a callback only.
- Forced colours: the theme shows the plain input and hides the slots.

### i18n strings

| Key                        | en                                                                                                                                | sv                                                      |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `mask.characterNotAllowed` | Only digits can be entered here. (per `allowed`: digits, letters, letters and digits, or "That character can't be entered here.") | Här kan du bara skriva siffror. (and the same variants) |
| `mask.maximumLength`       | You've entered all {length} characters.                                                                                           | Du har skrivit alla {length} tecken.                    |

All six locales. fi, nn and se need translator review.

### Theming surface

- Input: unchanged (`kv-input`). Masked inputs get no extra class.
- OneTimeCode: `kv-one-time-code`, `kv-one-time-code-input`, `kv-one-time-code-slot`, with `data-filled`, `data-active`, `data-complete`, `data-invalid` and `data-disabled`. The slot size, gap, caret and fallback come from the design spec, using existing tokens where possible (a new token needs an ADR and `theme:check`).

## Tasks

Phase 1: the engine (`core`, no React)

- [ ] `packages/core/src/mask/`: `createMask`, pattern, regexp, function and number definitions, with unit tests for every ADR-0032 item 5 rule
- [ ] Presets: digits, letters, lettersAndDigits, number, personalIdentityNumber (SE, FI, NO), postalCode, organisationNumber, iban, email, telephone, pattern, regexp, oneTimeCode, with test tables of real and edge-case values
- [ ] `packages/core/src/mask/checks/`: `checks.personalIdentityNumber` (SE, FI, NO), `checks.organisationNumber` (SE, FI, NO) and `checks.iban`, with `{ isValid, reason }`, tested with the authorities' published test numbers only (no real personal data in the repo)

Phase 2: masked Input

- [ ] Announcer available (roadmap M1). See open question 1
- [ ] `useMask` and Input's `mask` prop, with the caret, composition and write-back rules
- [ ] i18n strings in all six locales, `i18n:check`
- [ ] Component tests and axe. Stories: `Components/Form/Input` mask examples and a `Components/Form/Mask` page (every preset, RTL, forced colours)
- [ ] e2e: typing, paste styles, Backspace across literals, undo, composition (Chromium, Firefox, WebKit)
- [ ] `input.a11y.md` and `input.md` updated

Phase 3: OneTimeCode

- [ ] ux-designer: `docs/design/one-time-code.md` (slots, caret, states, fallback, 320px and zoom)
- [ ] `useOneTimeCode`, `OneTimeCode.Root`, `.Input`, `.Slot`, with tests first
- [ ] Theme styles and the forced-colors fallback, `theme:check`
- [ ] Stories (empty, partly filled, complete, invalid, disabled, letters and digits, RTL, forced colours) and e2e
- [ ] `one-time-code.a11y.md` and `one-time-code.md`

Wrap-up

- [ ] accessibility-reviewer APPROVE for each phase's diff
- [ ] Docs pages, changeset, roadmap status

## Risks & open questions

1. **Announcer first.** Rejection announcements need the shared Announcer, which is planned but not built. Build a minimal Announcer before Phase 2, or ship Phase 2 with `onValueChange` details only and turn the announcement on later?
2. **Throttle.** "One message per field every few seconds" needs a number. Proposal: 3 seconds, tested with NVDA and VoiceOver.
3. **Grouping in number masks.** Off by default. Screen readers read a space-grouped number in sv and fi inconsistently, so we need AT results before turning it on.
4. **Preset formats.** The FI century signs and the SE 10/12-digit forms need a check against the official sources during Phase 1.
5. **Slot alignment** under 1.4.12 text spacing is the biggest Phase 3 risk. The fallback must trigger reliably, not only in forced colours.
6. **Undo** after an inserted literal can't be kept without `execCommand`, which is deprecated. Accepted trade-off (ADR-0032).

## Testing strategy

Most of the logic is pure, so Phase 1 is table-driven unit tests in `core` (value, caret before, input, value and caret after). Browser differences in caret, composition and autofill are covered in e2e across all three engines. SMS autofill can only be checked by hand on iOS and Android, and goes in the manual matrix.

## Rollout

Additive: new exports and an optional `mask` prop. A minor changeset per phase while 0.x.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT may be `pending`)
- [ ] Plan tasks ticked, `docs/roadmap.md` status updated
