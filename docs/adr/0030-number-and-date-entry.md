# ADR-0030: Numbers as text with `inputmode`, and dates as three fields

- **Status:** Proposed
- **Date:** 2026-10-02
- **Deciders:** Maintainer asked for date and number inputs in M1. The approach below was proposed with Plan 0013 and is open to change.
- **Tags:** api, a11y, i18n

## Context

Public-sector forms ask for numbers (amounts, personal identity numbers, postcodes, counts) and for dates (date of birth, the date something happened). The browser offers `type="number"` and `type="date"`, and both have known problems. The calendar DatePicker (APG Date Picker Dialog) is planned for M4.

- `type="number"`:
  - The mouse wheel and arrow keys change the value by accident.
  - Values are rounded silently.
  - Leading zeros are dropped, so it can't take postcodes or identity numbers.
  - Letters are accepted in some browsers and reported as an empty value.
  - Some screen readers announce spinner buttons that aren't operable.
- `type="date"`:
  - The format and the picker differ by browser and by OS locale, not by page `lang`.
  - Some browsers' segments are hard to use with a screen reader and voice control.
  - It's slow for a known date like a date of birth.

## Decision drivers

- Works the same in every browser and locale, including sv (`2026-12-31`) and fi (`31.12.2026`).
- Robust with screen readers, voice control and zoom.
- Native semantics, without browser quirks that we can't style or translate.

## Options considered

### Numbers

- **Option A: `type="text"` with `inputMode="numeric"` or `"decimal"`.** Chosen. Gives a numeric keyboard on phones. Leading zeros are kept, and nothing changes on scroll. Validation is the form's own, in its own words. This is the GOV.UK pattern.
- **Option B: `type="number"`.** Has the problems listed above.

### Dates

- **Option A: three text fields (day, month, year) in a fieldset.** Chosen for known dates. Each field has a visible label, `inputMode="numeric"` and `autocomplete` (`bday-day`, `bday-month`, `bday-year`) when it's a date of birth. This is the GOV.UK and Designsystemet "memorable date" pattern.
- **Option B: native `type="date"`.** Least code, but has the problems listed above.
- **Option C: a calendar DatePicker.** It's for choosing a date near today (a booking), not a known date. It's planned for M4.

## Decision

We will use Option A for both:

1. **Input** accepts `type` values `text`, `email`, `tel`, `url`, `password` and `search`. Its type doesn't allow `number` or `date`. For numbers the docs and the `Components/Form/Number` story use `inputMode="numeric"` (or `"decimal"`), `autoComplete` where it applies, and `spellCheck={false}`. A dev warning explains why when `type="number"` or `type="date"` is passed anyway.
2. **DateInput** is a compound component inside a Fieldset: `DateInput.Root` holds the value, and `DateInput.Day`, `DateInput.Month` and `DateInput.Year` are the three fields, each a Field with a visible label from i18n (`dateInput.day`, `dateInput.month`, `dateInput.year`). The value is `{ year, month, day }` as strings, exactly as typed. It's never parsed into a `Date` silently. The design spec sets the field order per locale and the hint example. The default order follows the locale, and the consumer owns the order, because they own the markup.
3. The consumer validates, because only the service knows the rules (a date in the past, an age limit). The docs show how, including the error message texts.

## Accessibility impact

- 1.3.5: `autocomplete` tokens for the date of birth and for numeric personal data.
- 3.3.2: every date field has a visible label, and the Fieldset legend asks the question.
- 2.5.3 and voice control: visible labels match the accessible names ("Day", "Month", "Year").
- 3.3.8: paste and autofill work, and there are no spinners or segmented widgets to operate.
- No APG deviation: these are native text inputs. The APG Date Picker pattern applies to the M4 DatePicker.

## Consequences

- Positive: the same behaviour everywhere, styled and translated by the library.
- Negative / trade-offs:
  - No calendar until M4.
  - `min`, `max` and `step` aren't available for numbers, so the form validates ranges itself.
- Follow-ups: the M4 DatePicker accepts typed input as well (apg-patterns.md), and can reuse DateInput's fields.

## Validation

- Component tests for the value, the labels and `inputMode` in sv and en.
- e2e for Tab order through day, month and year in LTR and RTL.
- Manual AT run (pending).

## References

- GOV.UK Design System: Date input, and "Why the GOV.UK Design System team changed the input type for numbers" (2020)
- Designsystemet (NO): date of birth pattern
- WHATWG HTML: `inputmode`, `autocomplete` tokens
