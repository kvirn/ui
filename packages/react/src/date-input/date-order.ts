// Internal. The order a region writes a date in, for DateInput's default.

/** One box of a DateInput. */
export type DateInputPart = 'day' | 'month' | 'year'

const dayFirst: readonly DateInputPart[] = Object.freeze(['day', 'month', 'year'])

function isDatePart(type: string): type is DateInputPart {
  return type === 'day' || type === 'month' || type === 'year'
}

/**
 * The order of the day, month and year boxes for a BCP 47 locale, from
 * `Intl.DateTimeFormat(locale).formatToParts` (no data of our own). `sv-SE` is year, month,
 * day; `sv-FI`, `fi`, `nb` and `en-GB` are day, month, year. A result that starts with the
 * month (`en`, `en-US`) becomes day, month, year: month first reads as day first for the EU
 * readers this library serves, and gives wrong dates (3 7 2007). A locale `Intl` doesn't know
 * gives day, month, year.
 */
export function dateInputOrder(locale: string): readonly DateInputPart[] {
  let parts: Intl.DateTimeFormatPart[]
  try {
    parts = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      timeZone: 'UTC',
    }).formatToParts(new Date(Date.UTC(2007, 2, 27, 12)))
  } catch {
    return dayFirst
  }
  const order = parts.map((part) => part.type).filter(isDatePart)
  if (order.length !== 3 || new Set(order).size !== 3) {
    return dayFirst
  }
  return order[0] === 'month' ? dayFirst : Object.freeze(order)
}
