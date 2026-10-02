# ADR-0032: Our own input mask engine in core, lenient by default, with presets

- **Status:** Proposed
- **Date:** 2026-10-02
- **Deciders:** Maintainer asked for input masks built in-house with zero dependencies, with presets (digits, letters, personal identity numbers, email, regexp, min and max), modelled on iMask and Alpine's Mask plugin. The rules below were proposed with Plan 0014 and are open to change.
- **Tags:** architecture, api, a11y, i18n

## Context

Public-sector forms ask for values with a known shape: personal identity numbers (`YYYYMMDD-NNNN` in SE, `DDMMYYCNNNX` in FI, 11 digits in NO), postcodes, organisation numbers, IBANs, amounts and one-time codes (ADR-0033). Today an Input takes any text, and the form validates after submit (ADR-0029, ADR-0030).

A mask shapes the value while the user types: it drops characters that can't be valid, inserts separators and limits the length. [iMask](https://imask.js.org/guide.html) and [Alpine Mask](https://alpinejs.dev/plugins/mask) are the reference points. We won't depend on either: AGENTS.md hard rule 6 allows no runtime dependencies other than React and `@tanstack/store`, and iMask's DOM-bound design doesn't fit a pure `core` (hard rule 3).

Masks have a poor accessibility record, and this is why GOV.UK ships none and asks services to accept input leniently:

- **Silent rejection.** A dropped keystroke gives a screen reader user the echo of a character that never arrived, and then nothing.
- **Caret jumps.** Rewriting the value moves the caret, which breaks typing, voice dictation (Dragon, Voice Control) and screen reader editing.
- **Composition.** Dead keys and IMEs (Sámi and Nordic layouts use dead keys for á, č, đ, ŋ, š, ŧ, ž) fire input events mid-composition. A mask that rewrites then corrupts the character.
- **Paste and autofill.** Native `maxlength` truncates a pasted `1990-01-01-1234` before any script sees it. A strict mask rejects a pasted value with other separators (`19900101 1234`). Blocking paste or autofill fails 3.3.8.
- **Placeholder characters** (`____-__`) in the value are read aloud as "underscore", make an empty field non-empty, and break `:placeholder-shown`.
- **Auto-fixing.** Clamping a number to `min` as you type turns "1" into "10" when you meant "15". Changing what the user entered without telling them fails the purpose of 3.3.1 and 3.3.4.
- **Undo.** Writing `input.value` from script clears the browser's undo history before that step in Chrome and Firefox.

## Decision drivers

- Zero runtime dependencies, and a `core` with no DOM (hard rules 3 and 6).
- Never lose or silently change what the user entered: paste, autofill, dictation and IME input always work.
- Works with every form library: the mask holds no form state (ADR-0029, item 0).
- The format is always explained in text, not only enforced.
- Presets for the Nordic formats our users actually type, in every locale (ADR-0007).

## Options considered

### Option A: our own pure engine in `core`, lenient and live (chosen)

- ✅ No dependency. Pure functions, unit-tested without a DOM, reusable by other adapters.
- ✅ The rules below fix the accessibility problems that are known from iMask and Alpine.
- ❌ We own the edge cases: caret maths, composition, undo, and the presets' formats.

### Option B: depend on iMask (or `react-imask`)

- ✅ Mature, many mask types.
- ❌ A runtime dependency (hard rule 6). It's DOM-bound, so it can't live in `core`. Placeholder characters and autofix are opt-out, not opt-in. Rejected.

### Option C: no masks, only lenient validation after submit (GOV.UK)

- ✅ The safest for assistive technology. Nothing to build.
- ❌ The maintainer wants masks. Users get no help with the shape while they type. Kept as the default: an Input without `mask` behaves exactly as today.

### Option D: format on blur only

- ✅ No caret or composition problems during typing.
- ❌ Doesn't keep letters out of a digits-only field, and the value changes when focus leaves, which is easy to miss. Rejected as the default. Presets can still format the tail on blur (see rule 6).

## Decision

We will use Option A.

1. **Engine in `core`.** `packages/core/src/mask/` exports `createMask(definition)`, which returns a `Mask` of pure functions. No DOM, no `window`, no state:
   - `mask.apply({ value, selectionStart, selectionEnd, previousValue })` returns `{ value, selectionStart, selectionEnd, unmaskedValue, isComplete, rejected }`. `rejected` is the characters it dropped and why (`'digits' | 'letters' | 'lettersAndDigits' | 'other' | 'length'`).
   - `mask.format(unmaskedValue)` formats a stored value, for example a controlled initial value.
   - `mask.unmask(value)` strips the literals.
2. **Definitions.** Four kinds, all typed unions, so there's no ambiguous string syntax:
   - **Pattern.** `9` is a digit, `a` is a letter (`\p{L}` and `\p{M}`, so å, ø, đ and ŋ count), `*` is a letter or a digit, `\` escapes, and anything else is a literal. These match Alpine. An optional `transform` per token, for example to upper case.
   - **Regexp.** A change is accepted only when the whole new value matches, so the expression must accept partial values (`/^\d{0,4}$/`). This matches iMask.
   - **Function.** `(value) => definition`, for formats that depend on the value (a 10- or 12-digit Swedish number).
   - **Number.** Locale-aware: the decimal separator comes from the provider's locale (a comma in sv, fi, nb, nn and se), and both `,` and `.` are accepted as typed and shown as the locale's separator. Options: `decimals`, `allowNegative`, `grouping` (off by default), `min` and `max`.
3. **Presets.** Exported as `masks.*` from `@kvirn-ui/core` and re-exported by `@kvirn-ui/react`. Names are written out (no `ssn`, no `otp`):
   - `masks.digits({ length? })`: 0–9 only, leading zeros kept.
   - `masks.letters()`, `masks.lettersAndDigits()`. The docs say not to use `letters` for names: real names have spaces, hyphens and apostrophes.
   - `masks.number({ decimals?, allowNegative?, grouping?, min?, max? })`.
   - `masks.personalIdentityNumber({ country: 'SE' | 'FI' | 'NO' })`: SE accepts 10 or 12 digits with `-` or `+` before the last four (including samordningsnummer). FI is `DDMMYY`, a century sign (`+`, `-`, `A`–`F`, `U`–`Y`, as since 2023) and `NNN` and a check character, upper-cased. NO is 11 digits, including D-numbers.
   - `masks.postalCode({ country })`, `masks.organisationNumber({ country })`, `masks.iban()`.
   - `masks.email()`: a filter that only drops whitespace. It isn't a format: email addresses have no fixed shape.
   - `masks.telephone()`: a filter for digits, `+`, space, `-`, `(` and `)`. There's no national format, because people type numbers from other countries.
   - `masks.pattern(string)` and `masks.regexp(expression)` for anything else.
   - `masks.oneTimeCode({ length, characters })` for ADR-0033.

   A preset also suggests the input's `inputMode`, `autoCapitalize`, `spellCheck={false}` and, for identifiers, `dir="ltr"`. The consumer's own props win. There's no date preset: dates are DateInput (ADR-0030).

4. **Checksums and ranges are reported, never enforced.** `min` and `max` set `details.isWithinRange`, and nothing is clamped or auto-fixed. A preset's `isComplete` means the shape is complete, not that the number exists. Checks are separate pure functions that the consumer calls when it validates (ADR-0029), so the mask never blocks a value the user is still typing:
   - `checks.personalIdentityNumber(value, { country })`: the date (including SE samordningsnummer, NO D- and H-numbers and the FI century sign) and the check digit (Luhn for SE, modulus 11 for NO, modulus 31 for FI).
   - `checks.organisationNumber(value, { country })`: Luhn for SE, modulus 11 for FI (Y-tunnus) and NO.
   - `checks.iban(value)`: the country length and modulus 97.

   Each returns `{ isValid, reason }`, where `reason` is `'format' | 'date' | 'checkDigit'` (and `'country'` for IBAN), so the form can write a specific error message ("The last digit doesn't match. Check the number."). They accept the formatted or the plain value. They're exported from `@kvirn-ui/core` and re-exported by `@kvirn-ui/react`.

5. **Lenient input.** These rules are the reason for the ADR, and the tests cover each:
   1. **No placeholder characters** in the value. Literals appear only once the user types past them (iMask's `lazy`).
   2. **A typed literal is accepted** and not doubled: typing `-` where the mask has `-` just moves on.
   3. **Paste, drop, autofill and dictation are normalised:** the engine strips characters that don't fit, then fills the mask, so `19900101 1234`, `199001011234` and `19900101-1234` all end as `19900101-1234`.
   4. **No native `maxlength` or `pattern`.** The mask limits the length after normalising, and `pattern` would bring the browser's own messages in the browser's language (ADR-0029, item 5).
   5. **Composition is never rewritten.** The mask waits for `compositionend`.
   6. **The caret stays with the character the user typed**, also across inserted literals. Backspace and Delete always make progress: when a deletion only removes a literal that the mask would put back, it deletes the neighbouring character as well.
   7. **The value is only written back when the mask changed it.** Plain typing that fits keeps the browser's undo history.
6. **Rejected input is never silent.** When the mask drops characters, `onValueChange` reports them in `details.rejected`, and by default a polite message goes to the shared Announcer: "Only digits can be entered here" (`mask.characterNotAllowed`) or "You've entered all 12 characters" (`mask.maximumLength`), from i18n in all six locales. It's throttled to one message per field every few seconds, so holding a key doesn't flood the screen reader. `announceRejections={false}` turns it off, for example when the consumer shows its own message.
7. **React.** `useMask({ mask, onValueChange })` returns `inputProps` (`onChange`, `onCompositionStart`, `onCompositionEnd`, a ref for the caret, and the preset's suggested attributes) for `mergeProps` on your own `<input>`. `Input` takes a `mask` prop that does the same. `onValueChange(value, details)` keeps `reason: 'input'` and adds `unmaskedValue`, `isComplete`, `isWithinRange` (number masks) and `rejected`.
8. **No form state** (ADR-0029, item 0). The mask derives everything from the native value on each input event. A controlled `value` is rendered as given, never rewritten: use `mask.format()` for a stored value. A native form submit sends the formatted value, and `mask.unmask()` gives the plain one.
9. **Types.** A mask works on `type` `text`, `tel`, `search`, `url` and `password`. On `type="email"` the browser has no selection API, so `masks.email()` filters without restoring the caret, and any other mask warns in development.
10. **The format is explained in text.** A masked Input inside a Field without a `Field.Description` warns in development (3.3.2). The hint shows an example ("For example 19900101-1234"), and the hint, not the mask, is how users learn the format.

### Implementation notes (Plan 0014, Phase 2: `useMask` and Input's `mask`)

Decisions made while implementing, for review with this ADR. None contradicts the rules above.

- **Reporting during composition.** `onChange` while composing (`compositionstart` to `compositionend`, or `isComposing`) calls `onValueChange(rawValue, { reason, event })` with no mask details and rewrites nothing. A controlled field has to follow the raw value, or React would put the old value back and break the composition. At `compositionend` the mask applies once to the whole composed text (compared with the value before the composition) and reports again, with the `CompositionEvent` as `details.event`. So `InputChangeDetails['event']` is now `ChangeEvent | CompositionEvent` (a type widening, for masks only).
- **What the user inserted.** `useMask` keeps the value from before each edit: set on focus, on `compositionstart`, and from a native `beforeinput` listener (React's `onBeforeInput` is the legacy `textInput` event and doesn't fire for deletions). An `input` event without an `inputType`, or with `insertReplacementText`, is autofill: the engine gets no `previousValue`, so the whole value counts as inserted (item 5.3). The `inputType` is read from the change event's native event (`deleteContentForward` makes Delete skip a literal).
- **Write-back and caret.** The mask writes `element.value` and calls `setSelectionRange` inside the change handler, only when `isChanged`, and not on an element whose `selectionStart` is `null` (`type="email"`). There is no layout-effect restore: React doesn't touch the selection when the controlled value equals the DOM value.
- **`useMask` also returns `format` and `unmask`,** bound to the provider's locale, so a stored number is shown the way the field shows it (item 8). `mask.withLocale(locale)` is applied with the nearest provider's locale (`en` without a provider).
- **Attribute precedence.** The preset's suggested attributes come first in `Input`'s `mergeProps`, so your own props win. For `useMask` on your own `<input>`, the documented order is `mergeProps(mask.inputProps, ownProps)`: `mergeProps` lets the later object win, so the sketch in Plan 0014 (`mergeProps(ownProps, mask.inputProps)`) would let the preset override your props. Handlers chain either way.
- **`Input` takes `messages`** (`Partial<KvirnMessages['mask']>`) next to `mask` and `announceRejections`, for the per-instance override item 6 asks for. `useMask` takes the same options.
- **Which message.** One announcement per change: the first refused reason that isn't `length` ("Only digits can be entered here."), else `mask.maximumLength`, with `length` the number of characters in `unmaskedValue` (12 for a Swedish personal identity number, without the hyphen). `characterNotAllowed` is one parameterised key with `allowed` (`digits`, `letters`, `lettersAndDigits`, `other`), because the catalog depth is fixed at `namespace.key` (ADR-0007). The throttle key is the Field's control id, or a generated id outside a Field. For a number mask a `length` rejection can mean too many decimals, and "all N characters" is then inexact: acceptable for now, noted for the AT run.
- **No provider.** Masks work without a `KvirnProvider`. Nothing is announced, and the one ADR-0040 development warning fires on the first refused character (not at render, so an unmasked Input, a mask with no rejections and `announceRejections={false}` stay quiet). The provider is required for announcements and documented as such in `input.md` and `input.a11y.md`. This answers the ADR-0040 follow-up for masks.
- **Dev warnings.** A masked Input in a Field is checked after mount for an element whose id starts with the control's id plus `-description`, or an `aria-describedby` of its own (it is a false positive if a Description mounts later). A mask is "the email mask" when its suggested `inputMode` is `email`.
- **Test limits.** Composition in e2e: a real CDP IME session in Chromium (`Input.imeSetComposition`), dispatched composition events in Firefox and WebKit. Paste: the clipboard and Control or Command with V where the page may write the clipboard (Chromium), `insertText` otherwise. Real IMEs, dead keys, dictation and SMS autofill stay in the manual AT matrix (pending).

## Accessibility impact

- 3.3.2: the format is in a visible hint, not only in the mask. The dev warning enforces it.
- 3.3.1 and 3.3.4: the value is never auto-fixed or clamped, and dropped input is reported. Errors still come from the form, after submit (ADR-0029, item 6).
- 3.3.8: paste, autofill and password managers always work, and pasted separators are normalised, not refused.
- 4.1.3: rejections are announced politely through the shared Announcer, throttled, with strings from i18n.
- 2.5.3 and 1.3.5: no change to labels or `autocomplete`. Presets never set `autocomplete`, because the right token depends on the question.
- Voice control and IMEs: composition is left alone, and the caret follows the typed character.
- Not an APG pattern: the control stays a native `<input>`, with no extra role.

## Consequences

- Positive: shaped input with no dependency, in pure functions that every adapter can reuse, with the known mask failures designed out.
- Negative / trade-offs:
  - We own caret, composition and undo edge cases across browsers. Undo can't go back past the last step the mask rewrote: writing the value clears the browser's history before it (measured in Chromium).
  - Announcing rejections needs the Announcer (roadmap M1, planned), so it must ship first.
  - The presets' formats need upkeep when the rules change (the FI century signs changed in 2023).
  - The rejection strings need translator review in fi, nn and se.
- Follow-ups:
  - Plan 0014 builds the engine, the presets, `useMask`, Input's `mask` prop and OneTimeCode.
  - The M3 Combobox and M4 DatePicker's typed input may reuse the engine.

## Validation

- Unit tests in `core` for every preset and every rule in item 5: typing, typed literals, paste in each separator style, deleting across literals, the caret position, `min` and `max` reported without clamping, and composition. Every `checks.*` function against valid, invalid-date and wrong-check-digit numbers, using the authorities' published test numbers, never real people's.
- Component tests for `useMask` and `Input mask`: the reported details, the dev warnings, and the Announcer message and its throttle in sv and en.
- e2e: typing, paste, Backspace across a literal and undo in Chromium, Firefox and WebKit, plus the RTL and 320px projects.
- Manual AT run with NVDA, JAWS, VoiceOver (macOS and iOS), TalkBack and Dragon (pending).

## References

- iMask: <https://imask.js.org/guide.html> (`lazy`, `autofix`, pattern and regexp masks)
- Alpine.js Mask plugin: <https://alpinejs.dev/plugins/mask> (`9`, `a` and `*` tokens, dynamic masks)
- GOV.UK Design System: Text input, and the guidance on accepting input leniently
- WHATWG HTML: `inputmode`, `maxlength`, the selection API and the input types it applies to
- UI Events: `compositionstart` and `compositionend`. Input Events Level 2: `inputType`
- Skatteverket: personnummer and samordningsnummer. DVV: henkilötunnus century signs (2023). Skatteetaten: fødselsnummer and D-nummer
- ADR-0003, ADR-0007, ADR-0029, ADR-0030, ADR-0033
