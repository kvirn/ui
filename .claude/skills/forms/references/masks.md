# Masks: engine, presets and checks

Source: `packages/core/src/mask/` (pure, no React, no DOM), re-exported from `@kvirn-ui/react` as `masks` and `checks`. React side: `packages/react/src/mask/use-mask.ts` and `Input`.

## The engine

`createMask(definition)` returns a `Mask`, a bundle of pure functions with no state:

- `apply({ value, selectionStart, selectionEnd, previousValue, inputType })` returns `{ value, selectionStart, selectionEnd, unmaskedValue, isComplete, isWithinRange?, isChanged, rejected }`.
  - `previousValue` is the value before the edit. Without it, the whole value counts as inserted (autofill).
  - `isChanged` is true when `value` differs from the input value. Write back to the `<input>` only then.
  - `isWithinRange` is set for number masks only.
  - `rejected` is `{ reason, characters }[]`. `reason` is `digits`, `letters`, `lettersAndDigits`, `other` or `length`. `length` means the mask is full.
- `format(unmaskedValue)` formats a stored value. `unmask(value)` strips literals.
- `withLocale(locale)` returns the same mask with that locale's number separators, or its date order and separator. It returns the mask itself unless it is a number mask or a date mask without its own `locale`.
- `attributes` are the suggested `inputMode`, `autoCapitalize`, `spellCheck` and `dir`.

### Definitions

| Type       | Meaning                                                                                                                                                                                                                                                                    |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pattern`  | `9` digit, `a` letter (`\p{L}` and `\p{M}`, so å, ø, đ and ŋ count), `*` letter or digit, `\` escapes, anything else is a literal. Options: `transform`, `completeLengths` (unmasked lengths that count as complete, for a short and a long form), `attributes`.           |
| `regexp`   | The whole new value must match, so the expression must accept partial values (`/^\d{0,4}$/`). A pasted value that matches as a whole is always accepted. Options: `allowed` (for the rejection message, default `other`), `transform`, `unmask`, `complete`, `attributes`. |
| `number`   | Locale decimal separator. `,` and `.` are both accepted as typed. The unmasked value is the machine form (`-1234.5`). Options: `locale` (default `en`), `decimals` (default 0, which accepts no separator), `allowNegative`, `grouping`, `min`, `max`.                     |
| `function` | `resolve(value)` returns the definition that applies to the value typed so far, for formats that depend on the value.                                                                                                                                                      |

### Behaviour

- A literal is inserted lazily. A typed literal is accepted once and not doubled.
- Backspace and Delete always make progress: a deletion that only removed a literal removes the character before it.
- The caret follows the typed character.
- `min` and `max` set `isWithinRange`. Nothing is clamped.
- Checksums are not part of masking. Use `checks`.

## Presets (`masks.*`)

| Preset                                | Shape                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `digits({ length? })`                 | Digits only. `inputMode="numeric"`.                                                                                                                                                                                                                                                                                                      |
| `letters()`                           | Letters and marks. `inputMode="text"`.                                                                                                                                                                                                                                                                                                   |
| `lettersAndDigits()`                  | Letters, marks and digits.                                                                                                                                                                                                                                                                                                               |
| `number(options)`                     | A number mask. `inputMode` is `text` when `allowNegative` (iOS numeric pads have no minus), else `decimal` with `decimals`, else `numeric`.                                                                                                                                                                                              |
| `personalIdentityNumber({ country })` | SE: 10 or 12 digits, `-` or `+` before the last four. A separator typed after 6 or 8 digits decides the form. Plain input stays 10 digits, and the 11th makes it the 12-digit form with `-`. FI: `DDMMYY`, a century sign (`+`, `-`, `U`-`Y`, `A`-`F`), three digits and a check character (no `G I O Q Z`), upper-cased. NO: 11 digits. |
| `postalCode({ country })`             | SE `999 99`, FI `99999`, NO `9999`.                                                                                                                                                                                                                                                                                                      |
| `organisationNumber({ country })`     | SE `999999-9999`, FI `9999999-9`, NO `999 999 999`.                                                                                                                                                                                                                                                                                      |
| `date({ locale? })`                   | A date in one field, in the locale's order and with its separator (`04.10.2026`, `2026-10-04`, `04/10/2026`), from `Intl` like DateInput (`sv-SE` is year, month, day, a locale that starts with the month becomes day first). Without its own `locale` it follows the provider's, else `en`. The separator is written when the next part starts. A `.`, `-`, `/` or space typed after at least one digit of a day or month closes it and is written as the locale's separator (`4.10.2026` stays as typed). Any other separator, or one in the wrong place, is refused with reason `other`. A pasted ISO date or eight digits in the locale's order is reformatted. `unmaskedValue` is the padded ISO date (`2026-10-04`) once complete, else an empty string, and `format(iso)` gives the padded locale form. The shape only: 31.02.2026 is complete (use `checks.date`). `inputMode="numeric"` and `spellCheck={false}`: iOS numeric pads have no `.` or `-`, so the short form needs a hardware keyboard, and two digits per part always work. |
| `iban()`                              | Up to 34 letters and digits in groups of four, upper case. Complete at the country's length.                                                                                                                                                                                                                                             |
| `email()`                             | Drops whitespace only. `inputMode="email"`, `autoCapitalize="off"`.                                                                                                                                                                                                                                                                      |
| `telephone()`                         | Digits, `+`, space, `-`, `(` and `)`. There is no national format. `inputMode="tel"`.                                                                                                                                                                                                                                                    |
| `pattern(source, options)`            | A pattern definition.                                                                                                                                                                                                                                                                                                                    |
| `regexp(expression, options)`         | A regexp definition.                                                                                                                                                                                                                                                                                                                     |
| `oneTimeCode({ pattern })`            | See OneTimeCode in SKILL.md.                                                                                                                                                                                                                                                                                                             |

The date mask takes no `dir`, because a date reads in the page's direction. Identifier presets suggest `inputMode`, `spellCheck={false}` and `dir="ltr"`. Presets never set `autocomplete`.

## Checks (`checks.*`)

For the consumer to call when it validates. A mask never blocks a value on them, because the user may still be typing. Each returns `{ isValid, reason }`.

| Check                                                                       | `reason` when invalid                                                                                                        |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `checks.personalIdentityNumber(value, { country, allowSyntheticNumbers? })` | `format`, `date`, `checkDigit`. Norwegian synthetic test numbers (month plus 80) are refused unless `allowSyntheticNumbers`. |
| `checks.organisationNumber(value, { country })`                             | `format`, `checkDigit`                                                                                                       |
| `checks.iban(value)`                                                        | `country` (unknown country), `format` (wrong length), `checkDigit`                                                           |
| `checks.date(isoValue, { min?, max? })`                                     | `format` (not a complete ISO `YYYY-MM-DD`), `date` (no such day, such as 2026-02-31), `range` (before `min` or after `max`, both ISO and inclusive). Give it `details.unmaskedValue`. |

## React binding

- `useMask({ mask, onValueChange, announceRejections, messages })` returns `inputProps`, `format` and `unmask`. The `inputProps` hold the preset's suggested attributes, the change, focus and composition handlers, and a ref that tracks the value before each edit.
- `Input` takes `mask`, `messages` and `announceRejections`. With a mask, `onValueChange(value, details)` is called once, with `reason: 'input'`, `event`, `unmaskedValue`, `isComplete`, `isWithinRange` (number masks) and `rejected`.
- During composition, `onChange` reports the raw value without `unmaskedValue`. The mask applies at `compositionend`, with the event as the `CompositionEvent`.
- Autofill is an `input` event without `inputType`, or with `insertReplacementText`. The whole value counts as inserted.
- The mask-aware attributes (`inputMode`, `autoCapitalize`, `spellCheck`, `dir`) come first in the merge, so the consumer's props win.
- `type="email"` with a mask other than `masks.email()` warns: the browser has no selection API for it, so the caret cannot be kept.
- Rejection messages: `mask.characterNotAllowed({ allowed })` and `mask.maximumLength({ length })`. A reason other than `length` is reported first. Announcements are polite and throttled per field (default 3000 ms).
