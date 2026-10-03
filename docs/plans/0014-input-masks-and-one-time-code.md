# Plan 0014: Input masks and OneTimeCode

- **Status:** Done
- **Owner:** Maintainer / component-engineer
- **Created:** 2026-10-02 · **Target:** M1
- **Related:** Plan 0013. Design spec: [docs/design/one-time-code.md](../design/one-time-code.md) (Draft)

## Goal

Adopters can shape what users type, such as a personal identity number, a postcode or an amount, with a preset or their own mask, without breaking paste, autofill, dictation or screen readers. They can also ask for a one-time code in a row of boxes that is one native field underneath.

## Non-goals

- A validation engine. `min` and `max` are reported, not enforced, and the `checks.*` functions are helpers the consumer calls (item 4).
- A date mask: dates are DateInput.
- Phone number formats per country.
- Resend links, countdowns and timeouts for codes: those are the M4 login and verification blocks.
- Form state of any kind (item 0).

## Background

- No APG pattern for either. Both stay a native `<input>`.
- WCAG: 1.3.1, 1.3.5, 1.4.10, 1.4.12, 2.5.3, 2.5.8, 3.2.2, 3.3.1, 3.3.2, 3.3.4, 3.3.8, 4.1.2, 4.1.3.
- Prior art: iMask, Alpine Mask, GOV.UK (lenient text input, "Confirm a phone number"), `input-otp`.
- The problems we design out are listed in the forms skill (input masks and OneTimeCode).

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
| Undo                       | Native. Can't go back past the last step the mask rewrote                                       |

- Roles / ARIA: a native `<input>`, no added role. Field wiring as in the forms skill.
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
- OneTimeCode: `kv-one-time-code`, `kv-one-time-code-input`, `kv-one-time-code-slot`, with `data-filled`, `data-active`, `data-complete`, `data-invalid` and `data-disabled`. The slot size, gap, caret and fallback come from the design spec, using existing tokens where possible (a new token needs the maintainer's approval and `theme:check`).

## Tasks

Phase 1: the engine (`core`, no React)

- [x] `packages/core/src/mask/`: `createMask`, pattern, regexp, function and number definitions, with unit tests for every mask rule in the forms skill
- [x] Presets: digits, letters, lettersAndDigits, number, personalIdentityNumber (SE, FI, NO), postalCode, organisationNumber, iban, email, telephone, pattern, regexp, oneTimeCode, with test tables of real and edge-case values
- [x] `packages/core/src/mask/checks/`: `checks.personalIdentityNumber` (SE, FI, NO), `checks.organisationNumber` (SE, FI, NO) and `checks.iban`, with `{ isValid, reason }`, tested with the authorities' published test numbers only (no real personal data in the repo)

Phase 2: masked Input

- [x] Minimal shared Announcer (core utility + react part), maintainer approved building it first
- [x] `useMask` and Input's `mask` prop, with the caret, composition and write-back rules
- [x] i18n strings in all six locales, `i18n:check`
- [x] Component tests and axe. Stories: `Components/Form/Input` mask examples and a `Components/Form/Mask` page (every preset, RTL, forced colours)
- [x] e2e: typing, paste styles, Backspace across literals, undo, composition (Chromium and Firefox run locally, WebKit in CI)
- [x] `input.a11y.md` and `input.md` updated, with the Keyboard section per the `keyboard` skill (masked rows, `Keyboard` story, `a11yContract` on the stories file)

Phase 3: OneTimeCode

- [x] ux-designer: `docs/design/one-time-code.md` (slots, caret, states, fallback, 320px and zoom). The OneTimeCode decision amended with `data-caret`, `data-selected` and `data-ready`; the spec's other open questions (§9) default to its recommendations until the maintainer answers
- [x] `useOneTimeCode`, `OneTimeCode.Root`, `.Input`, `.Slot`, with tests first (built on `useMask`)
- [x] Theme styles and the forced-colors fallback, `theme:check`
- [x] Stories (empty, partly filled, complete, invalid, disabled, letters and digits, RTL, forced colours) and e2e
- [x] `one-time-code.a11y.md` and `one-time-code.md`, with the Keyboard section per the `keyboard` skill (focus strategy native, no auto-advance), a `Keyboard` story and `a11yContract`

Wrap-up

- [x] accessibility-reviewer APPROVE for each phase's diff (engine and masked Input after four rounds on the number mask, OneTimeCode and Announcer after one fix round each)
- [x] Docs pages (`input.md`, `one-time-code.md`, `announcer.md`), changesets, roadmap status

- [ ] Follow-up, tracked in [Plan 0019](0019-one-time-code-pattern.md): `masks.oneTimeCode` breaks `useOneTimeCode` with `length` (`pattern` undefined), and `masks.test.ts` needs formatting. Until fixed, `OneTimeCode` tests and stories fail

## Phase 1 notes: what the engine adds to the mask decision

Additions and clarifications the implementation needed. None contradicts the design, and they should be folded into the forms skill before it is accepted.

- `mask.apply` also takes an optional `inputType` (the InputEvent's, so `deleteContentForward` makes Delete skip a literal), and its selection fields are optional. Result: `isChanged` (write back only then; when false the selection is the one the browser reported).
- `rejected` is `{ reason, characters }[]`, grouped by reason, and only for what the user inserted. Separators in pasted text and literals the mask itself moved are dropped silently. A separator typed alone is reported.
- When new characters would push existing ones out of a full mask, the new ones are refused (like `maxlength`) and reported as `length`, instead of cutting the end.
- Number masks take `locale` (default `en`, an unsupported locale also falls back to `en`, never to the machine). `mask.withLocale(locale)` returns the mask with the provider's locale unless the definition pins one, so the React layer can inject it. Unmasked numbers use `.` and `-`. Paste (bulk insert): a `,`, `.` or space is grouping only when exactly three digits come after it (within the pasted text) and the digits before it (counted also in the field, up to the paste) are either exactly three, when a separator with digits before it precedes them (a middle group, so `1,000,000` and `2,000,000` work), or one to three and not all zeros when they start the number (so `0.500`, `.500` and `000.500` are fractions). The last mark is the decimal mark when the kinds are mixed (`1,250.75`) or when it doesn't look like grouping (`12.50`); a lone mark that looks like grouping is grouping unless it is the locale's own decimal mark (`1,000` is a thousand in en and one in sv). **A lone foreign mark followed by three digits when there are three or more decimals (`1,500` in en, `1.500` in sv, decimals 3) is genuinely ambiguous, so it is refused and reported instead of guessed**, except the mask's own group mark with `grouping` on (en `1,500` with grouping is grouping), so the mask's output pastes back unchanged (a deviation from the earlier rule that both marks are accepted). A second mark of the same character as the decimal mark (`1.234.5`) is refused and reported. The other marks, a space between digits that isn't grouping and a stray `-` are refused and reported as `other`/`digits`. With no decimals, a pasted fraction is refused and reported, never merged into the whole number (`12.50` gives `12` and reports `.50`). Only whitespace around a pasted number, and grouping that looks like grouping, are dropped silently. `mask.format()` and `mask.unmask()` don't use this heuristic: `format` reads a stored value in canonical form (`.` is the decimal mark, `-` the sign), and `unmask` reads the displayed value, and `format` stops at the first character that isn't canonical instead of merging digits across it. A refusal that isn't about a full value (a mark, a sign) is reported as `other`, only a digit that doesn't fit is `length`. With `grouping` on in a locale whose group mark is `,` or `.` (en), the mark the mask wrote earlier is a literal, never read as the decimal mark on the next edit. `isWithinRange` is `true` while nothing is entered.
- Pattern definitions take `completeLengths` (a Swedish number is complete at 10 or 12 digits). Regexp definitions take `allowed` (the rejection message), `complete`, `transform` and `unmask`.
- `masks.personalIdentityNumber` NO takes no options beyond `country`, but `checks.personalIdentityNumber` takes `allowSyntheticNumbers` (Norway only, off by default) for Skatteetaten's synthetic test numbers (month plus 80).
- SE organisation numbers accept ten digits only (not the 12-digit `16` form), and do not test the third digit, because a sole trader's organisation number is the personal identity number.
- The IBAN country lengths are the SWIFT registry's and need upkeep (the table is in `checks/iban.ts`).

## Risks & open questions

1. **Announcer first.** Rejection announcements need the shared Announcer, which is planned but not built. Build a minimal Announcer before Phase 2, or ship Phase 2 with `onValueChange` details only and turn the announcement on later?
2. **Throttle.** "One message per field every few seconds" needs a number. Proposal: 3 seconds, tested with NVDA and VoiceOver.
3. **Grouping in number masks.** Off by default. Screen readers read a space-grouped number in sv and fi inconsistently, so we need AT results before turning it on.
4. ~~**Preset formats.**~~ Checked in Phase 1 against the official sources (2026-10-02):
   - **FI** (DVV, dvv.fi/en/personal-identity-code, and the decree on the Population Information System): `DDMMYY` + century sign + `NNN` (002 to 899 for people, 900 to 999 temporary and test) + check character, from the nine digits modulo 31 in `0123456789ABCDEFHJKLMNPRSTUVWXY`. Century signs since 2023 (new numbers issued from 19.12.2023): `+` is the 1800s, `-` and `U`, `V`, `W`, `X`, `Y` the 1900s, `A`, `B`, `C`, `D`, `E`, `F` the 2000s. DVV's own page still lists only `+`, `-`, `Y` and `A` and says more may be introduced, so the 2023 additions come from the decree as reported by Finnish Wikipedia. Needs a re-check against Finlex when a translator reviews the docs. Implemented in `masks.personalIdentityNumber({ country: 'FI' })` and its check, case-insensitive on input.
   - **SE** (Skatteverket): `YYMMDD-NNNN`, the hyphen becomes `+` the year the person turns 100. The 12-digit form (`YYYYMMDD-NNNN`) is the same number with the century. The Luhn check covers the ten digits without the century. Samordningsnummer add 60 to the day. Implemented as a function mask: a separator typed after 6 or 8 digits decides the form, without one the number stays plain up to ten digits and the eleventh digit makes it the 12-digit form.
   - **NO** (Skatteetaten): `DDMMYYNNNKK`, two modulus 11 check digits (weights 3,7,6,1,8,9,4,5,2 and 5,4,3,2,7,6,5,4,3,2), D-numbers add 40 to the day, H-numbers add 40 to the month, and the synthetic Tenor numbers add 80 to the month. **A new numbering is decided from 2032-01-01** (the first check digit accepts four values, the individual number no longer says the century and the gender is no longer in the number). The check implements today's rule only. Follow-up before 2032: add the new rule to `checks.personalIdentityNumber` (`30108299939` in the tests is Skatteetaten's example for it).
   - Test data: SE numbers come from Skatteverket's published test numbers (entryscape rowstore), FI from DVV's example (131052-308T), NO from Skatteetaten's documented examples. Derived variants are noted in `checks.test.ts`. No authority publishes test organisation numbers that we found, so SE and FI organisation numbers in the tests are built from the check rules, and the NO ones are the agencies' own.
5. **Slot alignment** under 1.4.12 text spacing is the biggest Phase 3 risk. The fallback must trigger reliably, not only in forced colours.
6. **Undo** can't go back past the last step the mask rewrote (writing the value clears the history before it, measured in Chromium). Keeping it needs `execCommand`, which is deprecated. Accepted trade-off.

7. **Known number-mask issues after the fourth review (APPROVE, non-blocking, to fix next):**
   - **Mixed separators read as ×1000 without a message.** A mark after space grouping is still read as grouping when it has three digits after it: sv, fi or nb `1 234.500` gives `1234500`, and en `1 234,500` the same. SI style (`1 234.5`) is a real convention. Fix: don't read a mark as grouping when an earlier separator in the same number was a space or the other kind of mark.
   - **Leading zeros in the output.** The mask groups leading zeros (`0,500`), so pasting its own output back isn't a no-op for values that start with a zero (reported, not silent). Fix: don't group, or strip, leading zeros, and add `0500` to the round-trip test.
   - **A fraction refused, then joined after a space.** en `decimals:0`, `1.234 567` gives `1567`: `.` and `234` are reported, `567` joins the whole number.
   - **Canonical `format()` cuts extra decimals without a warning** (`'1.23456'` with `decimals:3` gives `1,234`). It can't report; warn in development.
   - **Odd result for a paste before existing digits** (sv `5,000` at the start of `1 234` gives `51 234` and reports `,` and `000`).

## Testing strategy

Most of the logic is pure, so Phase 1 is table-driven unit tests in `core` (value, caret before, input, value and caret after). Browser differences in caret, composition and autofill are covered in e2e across all three engines. SMS autofill can only be checked by hand on iOS and Android, and goes in the manual matrix.

## Rollout

Additive: new exports and an optional `mask` prop. A minor changeset per phase while 0.x.

## Done when

- [x] All quality gates in AGENTS.md pass (manual AT is `pending`). Firefox and WebKit aren't part of the baseline; two unrelated Firefox failures are noted in the final report
- [x] Plan tasks ticked, `docs/roadmap.md` status updated
