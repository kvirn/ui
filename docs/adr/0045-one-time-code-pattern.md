# ADR-0045: OneTimeCode takes a pattern, not a length

- **Status:** Proposed
- **Date:** 2026-10-02
- **Deciders:** Maintainer asked for a `pattern` in place of `length`, with the symbols `9`, `*`, `a`, `A`, `&` and `-` as the only separator.
- **Tags:** api, a11y
- **Amends:** ADR-0033 (items 1 to 3). Everything else in ADR-0033 stands: one native input, presentational slots, no auto-advance, no auto-submit.

## Context

ADR-0033 sized the code with `length` and `characters` (`digits` or `lettersAndDigits`). Real codes are shaped: `ABCD-1234`, `123-456-789`, an uppercase prefix and digits. A length can't say which positions take letters or where the groups break, and the theme's `--grouped` modifier only split an even length in two.

## Decision

1. **`pattern` replaces `length` and `characters`** on `OneTimeCode.Root`, `useOneTimeCode()` and `masks.oneTimeCode()`. Default `'999999'`. This is unreleased, so it is not a breaking change for adopters.
2. **Symbols.** Every character symbol is required and ASCII only:

   | Symbol | Accepts                                                         |
   | ------ | --------------------------------------------------------------- |
   | `9`    | Digit (0–9)                                                     |
   | `*`    | Alphanumeric (A–Z, a–z, 0–9)                                    |
   | `a`    | Alpha (A–Z, a–z)                                                |
   | `A`    | Uppercase alpha (A–Z)                                           |
   | `&`    | Uppercase alphanumeric (A–Z, 0–9)                               |
   | `-`    | A separator, drawn between boxes. Not part of the unmasked code |

   Any other character in the pattern throws a `RangeError` naming the character and the position, at render, in development and in production alike. A pattern is a literal in the consumer's code, so it fails the first time it runs. A pattern read from server configuration must be validated before it reaches the component. A `-` must sit between two character symbols: not first, not last, not doubled. A pattern needs at least one character symbol. No other separator, no space and no escape.

3. **Uppercase symbols upper-case what is typed** (`a` becomes `A`) instead of rejecting it, so a code typed in lower case still works. The boxes show exactly what the input holds. The rejection announcements reuse `mask.characterNotAllowed` (letters, or letters and digits): no new string.
4. **ASCII only.** The pattern engine's `a` and `*` accept any Unicode letter, which is right for names. A code is an identifier, so `masks.oneTimeCode()` builds its own tokens with ASCII tests on the shared token engine. `masks.pattern()` is unchanged.
5. **One native input stays** (ADR-0033). The separators are drawn, `aria-hidden` cells between the boxes. `****-****` draws 4 boxes, a dash and 4 boxes over one `<input>`. It is not nine inputs.
6. **The value includes the separator** (`ABCD-1234`), as the boxes and the message show it. The mask inserts the `-` as the next character is placed, accepts a typed `-` once, and drops separators and spaces from pasted text, so `ABCD1234`, `ABCD-1234` and `ABCD 1234` all end as `ABCD-1234`. Text around a code ("Your code is 481920") ends as the digits only for a digits pattern: with letters allowed the words are letters too, so the hint tells users to paste only the code. `onValueChange` details carry `unmaskedValue` (`ABCD1234`) and `onComplete(value, unmaskedValue)` gets both, for the service that wants the plain code.
7. **Slots are one cell per pattern position.** `slots` has `pattern.length` entries and `getSlotProps(index)`, `OneTimeCode.Slot index` and the value share one index: position _i_ of the pattern draws position _i_ of the value. A cell is `kind: 'character'` (as today) or `kind: 'separator'`. A separator cell is `aria-hidden`, has the class `kv-one-time-code-separator`, shows its `-` always (it is the pattern, not the value), and is never active or selected. The `kv-one-time-code--grouped` modifier is removed.
8. **Caret and active box at a separator.** The active box is the one where the next character goes: the first character cell at or after the caret. A caret that sits just before an existing `-` (the user arrowed back over it) is drawn `after` the character before it, so the two positions on either side of a separator don't look the same. At the end of a complete code the caret is `after` the last character, as today.
9. **Native attributes follow the pattern.** `inputMode="numeric"` when every character symbol is `9`. `autoCapitalize="characters"` when no symbol is `a` or `*`. `autoComplete="one-time-code"`, `spellCheck`, `autoCorrect` and `dir="ltr"` as today. Still no `maxlength` and no `pattern` attribute.
10. **The hint says the shape.** The consumer's `Field.Description` states the length and groups ("The code has 8 characters in two groups of 4"). The dev warning for a missing description stays.
11. **Size limits** are decided in the design spec update (the theme draws patterns up to a stated number of boxes and falls back to the plain field outside it).

## Accessibility impact

- 3.3.2 and 1.3.1: the hint, not the boxes, tells screen-reader users the format. Separators are `aria-hidden` and the input is never hidden.
- 3.3.8: paste and SMS autofill work with or without the separator, and the code stays visible.
- 3.3.1: a refused character is announced with the allowed class ("letters", "digits", "letters and digits").
- 1.4.1 and 1.4.11: the separator is a character, not colour alone, and the boxes keep their edges.
- Screen readers read the value with the dash ("A B C D dash 1 2 3 4" or "A B C D hyphen…"). This is accepted, and the hint explains the groups.
- 3.2.2, 2.2.2, 2.5.8: unchanged.

## Consequences

- Positive: any code shape, with letters, digits or both, in the boxes users see in the message.
- Negative / trade-offs: the theme can no longer read the length from the slot count alone (it counts boxes and separators), so its row width and fallback rules change. The submitted value contains the `-`, so a service that wants none strips it or uses `unmaskedValue`.
- Follow-ups: whether `OneTimeCode.Root` should render the cells itself from the pattern (open, `OneTimeCode.Slots`), and a `separator` other than `-`, only if a real service needs one.

## Validation

- Core tests: each symbol accepts and rejects what the table says, lower case becomes upper case for `A` and `&`, the separator is inserted, accepted once when typed and dropped from pasted text, invalid patterns throw, `isComplete` and `unmaskedValue`.
- Component tests: `****-****` and `***-***-***` draw the right cells, separators are `aria-hidden` and never active, caret rules at a separator, the input attributes per pattern, paste with and without the separator, axe in every story state.
- e2e: typing across the separator, Backspace over it, arrow keys across it, paste. The forced-colors, RTL and 320px projects.
- Manual: SMS autofill on iOS Safari and Android Chrome, a password manager, NVDA, JAWS, VoiceOver, TalkBack and Dragon (pending).

## References

- ADR-0032 (mask engine), ADR-0033 (OneTimeCode), ADR-0029, ADR-0007
- WCAG 2.2: 3.3.8 Accessible Authentication (Minimum), 3.3.2, 1.3.1
