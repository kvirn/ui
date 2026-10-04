---
'@kvirn-ui/core': minor
'@kvirn-ui/react': minor
---

Add `masks.date({ locale? })` and `checks.date(isoValue, { min?, max? })`: a date in one text field (Plan 0032). Alpha.

- `@kvirn-ui/core`: `masks.date()` follows the locale through `Intl` for the order and the separator (`2026-10-04` in `sv-SE`, `04.10.2026` in `fi`, `nb` and `nn`, `04/10/2026` in `en-GB`), and, without its own `locale`, the provider's locale through `withLocale`, like a number mask. The separator is written when the next part starts. A `.`, `-`, `/` or space typed after at least one digit of a day or month closes it and is written as the locale's separator, so `4.10.2026` stays as typed. Any other separator, or one in the wrong place, is refused with reason `other`. A pasted, dropped or autofilled ISO date (one-digit day and month allowed), or eight digits in the locale's order, is reformatted. `unmaskedValue` and `unmask(value)` give the padded ISO date once complete, else an empty string, and `format(iso)` gives the padded locale form. The mask checks the shape only. `checks.date` returns `{ isValid, reason }` with `format`, `date` (no such day) or `range` (before `min` or after `max`, inclusive). `dateInputOrder` and `dateSeparator` are now exported from core (`dateInputOrder` moved from `@kvirn-ui/react`, where it was internal), and the `DateMaskOptions`, `DateCheck`, `DateCheckFailure` and `DateCheckOptions` types.
- `@kvirn-ui/core`, every mask: Backspace or Delete next to a separator the mask puts back now deletes only the neighbouring character and keeps the separator, so a date's separator still decides how the digits are read (`04.|10.2026` gives `0.10.2026`).
- `@kvirn-ui/react`: `masks` and `checks` re-export the new `date` entries, so `<Input mask={masks.date()} />` works with `Field.Hint` and `onValueChange(value, { unmaskedValue })`. `DateInputPart` is unchanged.
