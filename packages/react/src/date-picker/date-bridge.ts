import { isValidDateParts, masks, parseIsoDate, toIsoDate } from '@kvirn-ui/core'
import type { IsoDate } from '@kvirn-ui/core'
import type { DateInputValue } from '../date-input/use-date-input.ts'

const emptyDateInputValue: DateInputValue = Object.freeze({ year: '', month: '', day: '' })

/**
 * The three DateInput boxes as an ISO date for `DatePicker.Root`'s `value`: `''` while any box is
 * empty or the date does not exist (31 February), so the picker opens on today instead.
 * A day or month without its leading zero is fine; the year needs four digits.
 */
export function dateInputValueToIsoDate({ year, month, day }: DateInputValue): IsoDate {
  if (
    !/^\d{4}$/.test(year.trim()) ||
    !/^\d{1,2}$/.test(month.trim()) ||
    !/^\d{1,2}$/.test(day.trim())
  ) {
    return ''
  }
  const parts = { year: Number(year), month: Number(month), day: Number(day) }
  return isValidDateParts(parts) ? toIsoDate(parts) : ''
}

/** An ISO date written into the three boxes, with no leading zeros (`4`, not `04`). `''` gives empty boxes. */
export function isoDateToDateInputValue(date: string): DateInputValue {
  const parts = parseIsoDate(date)
  if (parts === undefined) {
    return emptyDateInputValue
  }
  return { year: String(parts.year), month: String(parts.month), day: String(parts.day) }
}

/**
 * The text of a `masks.date()` field as an ISO date, or `''` while it is partial or not a real
 * date. `locale` is the one the field's mask runs in: the provider's, from `useLocale()`.
 */
export function maskedDateToIsoDate(text: string, locale: string): IsoDate {
  const unmasked = masks.date({ locale }).unmask(text)
  return parseIsoDate(unmasked) === undefined ? '' : unmasked
}

/** An ISO date written the way a `masks.date()` field in `locale` shows it (`04.10.2026`). `''` gives `''`. */
export function isoDateToMaskedDate(date: string, locale: string): string {
  return parseIsoDate(date) === undefined ? '' : masks.date({ locale }).format(date)
}
