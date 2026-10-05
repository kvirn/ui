# Mask

> **Draft** (Plans 0014, 0039 and 0040). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [text-input.a11y.md](../text-input/text-input.a11y.md), because a mask is a prop of [TextInput](../text-input/text-input.md), and the decisions are in the forms skill (masks).

**KvirnUI holds no form state; bring your own form logic.** A mask shapes what the user types into a text box: it drops characters that can't be valid, puts separators in as the user types past them, and limits the length. It reports what it did, and never blocks, clamps or corrects a value. Whether a number exists is your form's job (see Checks).

Use a mask for a **code**: a personal identity number, a postcode, an organisation number, an IBAN, a reference number, a date in one field, a one-time code. For a quantity or an amount, use [NumberInput](../number-input/number-input.md), which builds the number mask in. For a date of birth, use [DateInput](../date-input/date-input.md).

- **The control stays a native `<input>`:** paste, autofill, undo and dictation keep working. A mask is the `mask` prop of TextInput (and of NumberInput, which replaces its number mask with it), or the `useMask` hook on your own input.
- **A mask is a name in the common case:** `mask="postal-code"` needs no import and no country. Objects, a `RegExp` and the finished masks from `masks` are for the rest.
- **Lenient.** A pasted `19900101 2385`, `199001012385` or `19900101-2385` all end as `19900101-2385`. A typed literal is accepted once. There are no placeholder characters in the value, and no `maxlength` or `pattern` attribute.
- **Refused characters are announced** (4.1.3), politely, through the shared Announcer. The `KvirnProvider` is required for that.
- **The format is yours to explain.** A mask shapes the value but doesn't say what the format is, so every masked field has a help text with the format and an example (3.3.2). A masked TextInput in a Field without one warns in development.

## API

### What `mask` takes

`mask` is a union. Use the first form that fits.

| `mask`                                                                                 | Is                                                                                                                           |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| A name: `"digits"`, `"letters"`, `"letters-and-digits"`                                | The filters of the same name                                                                                                 |
| `"personal-identity-number"` (alias `"ssi"`), `"postal-code"`, `"organisation-number"` | The country mask for the country the provider implies (below)                                                                |
| `"date"`, `"iban"`, `"email"`, `"telephone"`                                           | The presets of the same name                                                                                                 |
| `{ preset, country? }`                                                                 | A named preset with the country set for this one input: `{ preset: 'postal-code', country: 'FI' }`                           |
| `{ pattern, ...options }`                                                              | A custom pattern with the pattern options (`transform`, `completeLengths`, `attributes`): `{ pattern: '999 99' }`            |
| A `RegExp`                                                                             | A custom filter that must accept partial values: `/^[A-Z]{0,2}\d{0,6}$/`                                                     |
| A `Mask` from `masks`                                                                  | The explicit, typed form: `masks.postalCode({ country: 'SE' })`. It stays supported and is what `@kvirn-ui/core` users build |

`number` is not a name: a quantity or an amount is a NumberInput, which owns the number mask. A number mask from `masks.number` still works on a TextInput, for a stored amount that your form formats.

**Where the country comes from.** The input's own `{ preset, country }`, else the provider's `country` prop, else the region of the provider's locale (`sv-FI` is Finland), else its language (`sv` is Sweden, `fi` is Finland, `nb`, `nn`, `no` and `se` are Norway). Nothing is guessed beyond that: with no country (`en`, `da-DK`) a country mask only takes digits, and a development warning says so once (`mask-country-unresolved:<name>:<locale>`). A name is resolved in the input, so one `mask="postal-code"` follows the locale of the provider it sits in.

### The presets

All from `masks`, re-exported by `@kvirn-ui/react`. Each preset has the kebab-case name above, such as `personalIdentityNumber` and `"personal-identity-number"`.

| Preset                                                                                                                                | Shapes                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `digits({ length? })`, `letters()`, `lettersAndDigits()`                                                                              | Filters. `letters()` isn't for names: names have spaces, hyphens and apostrophes                                                                                                                                                                                                                                           |
| `number({ decimals?, allowNegative?, grouping?, locale?, min?, max? })` (NumberInput builds it in)                                    | A number with the page's decimal separator, or the `locale` you pin. `min` and `max` are reported as `isWithinRange`, never clamped                                                                                                                                                                                        |
| `personalIdentityNumber({ country })`                                                                                                 | SE: 10 or 12 digits and `-` or `+`. FI: `DDMMYY`, the century sign and `NNNC`, in capitals. NO: 11 digits                                                                                                                                                                                                                  |
| `date({ locale? })`                                                                                                                   | A date in one field in the page's order and separator (`2026-10-04` in sv, `04.10.2026` in fi). A separator after a day or month closes it, a pasted ISO date is reformatted, and `unmaskedValue` is the ISO date once complete. The shape only: check it with `checks.date`. See [DateInput](../date-input/date-input.md) |
| `organisationNumber({ country })`, `postalCode({ country })`, `iban()`                                                                | SE `556000-0001`, FI `0112038-9`, NO `974 760 673`. SE `123 45`, FI `00100`, NO `0150`. `SE45 5000 0000 0583 9825 7466`                                                                                                                                                                                                    |
| `email()`, `telephone()`                                                                                                              | Filters: spaces out of an address, and digits, `+`, space, `-`, `(`, `)` for a number. No national format                                                                                                                                                                                                                  |
| `pattern('aa-9999', { transform?, completeLengths? })`, `regexp(/^[A-Z]{0,3}\d{0,3}$/, { allowed?, transform?, unmask?, complete? })` | Your own. In a pattern `9` is a digit, `a` a letter (å, ø, đ, ŋ count), `*` either, `\` makes the next character a literal, and the rest are literals. A regexp must accept partial values                                                                                                                                 |
| `oneTimeCode({ pattern })`                                                                                                            | For a one-time code: `9` digit, `*` letter or digit, `a` letter, `A` and `&` upper-case, `-` a separator. ASCII only. On a plain TextInput it is the GOV.UK "security code" pattern; [OneTimeCode](../one-time-code/one-time-code.md) draws it as boxes                                                                    |

A preset suggests `inputMode`, `autoCapitalize`, `spellCheck={false}` and, for identifiers, `dir="ltr"`. Your own props win. It never sets `autocomplete`: that depends on the question.

**Pattern options.** `transform` changes an accepted character before it is placed (`{ '*': (character) => character.toUpperCase() }`). `completeLengths` lists the unmasked lengths at which the value counts as complete, for a format with a short and a long form (`[8, 10]`). A `RegExp` mask's `unmask` strips the formatting for `unmaskedValue`, and `complete` says when the value is whole. The Swedish personal identity number is itself such a mask: ten or twelve digits are complete.

### What the mask reports

`onValueChange(value, details)` gets, besides `reason` and `event`:

| Detail          | Is                                                                                                                                                                                                                      |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `unmaskedValue` | The value without literals and separators (`199001012385`). For a number mask, the machine form (`-1234.5`)                                                                                                             |
| `isComplete`    | The shape is complete. Not that the number exists                                                                                                                                                                       |
| `isWithinRange` | Number masks only: the number is within `min` and `max`. Reported, never enforced                                                                                                                                       |
| `rejected`      | The characters the mask dropped from what the user entered, as `{ reason, characters }`, where `reason` is `digits`, `letters`, `lettersAndDigits`, `other` (what the field takes), `length` (it is full) or `decimals` |

### Checks

A mask never says a number is wrong: the user may still be typing. Your form calls a check when it validates. Each returns `{ isValid, reason }`, so you can write a specific error.

| Check                                                                       | Reasons                                                                                           |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `checks.personalIdentityNumber(value, { country, allowSyntheticNumbers? })` | `format`, `date`, `checkDigit`. SE, FI and NO. `allowSyntheticNumbers` is for Norway only (below) |
| `checks.organisationNumber(value, { country })`                             | `format`, `checkDigit`. SE, FI (Y-tunnus) and NO                                                  |
| `checks.iban(value)`                                                        | `format`, `country` (not in the SWIFT registry), `checkDigit`                                     |
| `checks.date(isoValue, { min?, max? })`                                     | `format`, `date`, `range`                                                                         |

A check never says the person or organisation exists. **`allowSyntheticNumbers`** also accepts the synthetic Norwegian numbers of Skatteetaten's test registry (80 is added to the month). It is off by default, so a production form refuses them. Turn it on only in a test environment or a staff tool for test data.

### Announcements

| Message key (`messages`)   | Says by default (en)                                                                          |
| -------------------------- | --------------------------------------------------------------------------------------------- |
| `mask.characterNotAllowed` | "Only digits can be entered here." (by `allowed`: digits, letters, letters and digits, other) |
| `mask.maximumLength`       | "You've entered all 12 characters."                                                           |
| `mask.maximumDecimals`     | "No more decimals can be entered here." (a number mask with all its decimals)                 |

Rejected characters are announced (4.1.3) with a polite message from the shared Announcer, at most once every three seconds per field. The strings are in all six locales, and you can override them per provider or per instance (`messages={{ characterNotAllowed: () => '…' }}`). `announceRejections={false}` turns it off, for example when you show your own message: put that message in a live region. **The `KvirnProvider` is required for announcements:** without one the mask still works, nothing is announced, and a development warning says so once.

## Behaviour

- **Backspace and Delete always remove a character**, also next to a separator. The caret stays after the character the user typed. A dead key or IME composition is left alone until it ends.
- **The value is written back only when the mask changed it**, so plain typing keeps the browser's undo history. When the mask inserts a separator, undo for that step is lost.
- **A controlled `value` is rendered as given and never rewritten.** For a stored, unmasked value use the mask's `format`: `value={mask.format(stored)}`. A form submit sends the formatted value, and `mask.unmask(value)` gives the plain one.
- **Numbers and dates** use the provider's locale for the separator (a comma in sv, fi, nb, nn and se) and for the order of a date, whichever separator is typed. `mask.withLocale(locale)` gives the same mask with that locale's separators, for showing a stored number the same way. A number mask with its own `locale` keeps it.
- **Types.** A mask works on `type` `text`, `tel`, `search`, `url` and `password`. On `type="email"` there is no caret control, so use only `masks.email()` there: another mask warns in development.
- **`createMask` is not part of the API.** Write a mask as a plain definition (`{ pattern, ...options }`, a `RegExp` or a preset) and pass it to the input, which resolves it.

## Your part

- **A help text with the format** for every masked input, with an example in the page's language.
- **A check on submit** with the `checks` above, and an error that says what is wrong and how to fix it. Keep the value as typed.
- **The `KvirnProvider` around the app**, so a refused character is announced.
- **`autoComplete`** where a token exists (`postal-code`, `tel`). Never block paste (3.3.8).

## Hook

```tsx
import { masks, mergeProps, useMask } from '@kvirn-ui/react'

const caseNumber = useMask({
  mask: masks.pattern('aa-9999', { transform: { a: (letter) => letter.toUpperCase() } }),
  onValueChange: (value, details) => setCaseNumber(details.unmaskedValue),
})
// Your own props last, so they win over the preset's suggestions. The handlers chain.
<input {...mergeProps(caseNumber.inputProps, { name: 'caseNumber', autoComplete: 'off' })} />
```

`useMask` takes the same `mask` values as TextInput. It returns `inputProps` (`onChange`, `onFocus`, `onCompositionStart`, `onCompositionEnd`, a `ref` that tracks the value before each edit, and the suggested attributes), plus `format` and `unmask` for the provider's locale. Inside a Field, spread `useTextInput`'s props too: they read the Field.
