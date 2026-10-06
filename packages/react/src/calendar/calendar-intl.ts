import { parseIsoDate } from '@kvirn-ui/core'
import type { IsoDate, YearMonth } from '@kvirn-ui/core'

/**
 * Internal. The locale `Intl` writes month and weekday names in. A browser that ships no data for
 * `se` writes the date in the language most readers of the region know: `se-FI` in Finnish,
 * `se-SE` in Swedish, any other `se` in Norwegian Bokmål (design spec §5). Anything else is kept.
 */
export function resolveIntlLocale(
  locale: string,
  isSupported: (locale: string) => boolean = (candidate) =>
    Intl.DateTimeFormat.supportedLocalesOf(candidate).length > 0,
): string {
  let region: string | undefined
  try {
    const parsed = new Intl.Locale(locale)
    if (parsed.language !== 'se' || isSupported(locale)) {
      return locale
    }
    region = parsed.region
  } catch {
    return locale
  }
  return region === 'FI' ? 'fi' : region === 'SE' ? 'sv' : 'nb'
}

/** A calendar date as midnight UTC on that day, for `Intl`. `setUTCFullYear`: `Date.UTC` reads years 0 to 99 as 19xx. */
function toUtcDate({ year, month, day }: { year: number; month: number; day: number }): Date {
  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)
  return date
}

export interface CalendarFormatters {
  /** `October 2026`. */
  month: (month: YearMonth) => string
  /** `Wednesday 14 October 2026`: a day's name. */
  fullDate: (date: IsoDate) => string
  /** `14 October 2026`: the range hint. */
  longDate: (date: IsoDate) => string
  /** The weekday of an ISO weekday number, 1 = Monday. */
  weekday: (weekday: number, style: 'short' | 'long') => string
}

/** Internal. Gregorian, Latin digits, on the day itself in any zone (design spec §5). */
export function createCalendarFormatters(locale: string): CalendarFormatters {
  const options = { calendar: 'gregory', numberingSystem: 'latn', timeZone: 'UTC' } as const
  const month = new Intl.DateTimeFormat(locale, { ...options, month: 'long', year: 'numeric' })
  const fullDate = new Intl.DateTimeFormat(locale, { ...options, dateStyle: 'full' })
  const longDate = new Intl.DateTimeFormat(locale, { ...options, dateStyle: 'long' })
  const weekdayShort = new Intl.DateTimeFormat(locale, { ...options, weekday: 'short' })
  const weekdayLong = new Intl.DateTimeFormat(locale, { ...options, weekday: 'long' })
  const parse = (date: IsoDate) => {
    const parts = parseIsoDate(date)
    if (parts === undefined) {
      throw new RangeError(`"${date}" is not a calendar date.`)
    }
    return toUtcDate(parts)
  }
  return {
    month: (value) => month.format(toUtcDate({ ...value, day: 1 })),
    fullDate: (date) => fullDate.format(parse(date)),
    longDate: (date) => longDate.format(parse(date)),
    // 2024-01-01 is a Monday.
    weekday: (weekday, style) =>
      (style === 'short' ? weekdayShort : weekdayLong).format(
        toUtcDate({ year: 2024, month: 1, day: weekday }),
      ),
  }
}
