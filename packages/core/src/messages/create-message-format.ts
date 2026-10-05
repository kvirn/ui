/** Plural forms keyed by `Intl.PluralRules` category. `other` is always required. */
export interface PluralForms {
  zero?: string
  one?: string
  two?: string
  few?: string
  many?: string
  other: string
}

/**
 * The locale-aware helper passed to parameterised messages, and returned by `useFormat()` in
 * `@kvirn-ui/react`. Built on `Intl` only, with no ICU runtime. `@kvirn-ui/i18n`'s `MessageFormat`
 * type describes the same shape; a type test in `@kvirn-ui/react` keeps the two in step.
 */
export interface MessageFormatter {
  /**
   * Picks a form by the locale's plural rules. `zero` is used for exactly 0 when given,
   * because most locales have no `zero` category.
   */
  plural: (count: number, forms: PluralForms) => string
  number: (value: number, options?: Intl.NumberFormatOptions) => string
  /**
   * A `Date` or a number of milliseconds is an instant: it is shown in the configured time zone
   * unless `options.timeZone` says otherwise (`undefined` says nothing). A string is a calendar date written `YYYY-MM-DD`,
   * a day with no time of day and no time zone: it is shown in UTC, so it never moves to the day
   * before or after. Any other string throws a `RangeError`, like an invalid `Date` does.
   */
  date: (value: Date | number | string, options?: Intl.DateTimeFormatOptions) => string
  list: (items: readonly string[], options?: Intl.ListFormatOptions) => string
}

export interface CreateMessageFormatOptions {
  /** BCP 47 locale. */
  locale: string
  /** IANA time zone. `undefined` uses the runtime's zone. */
  timeZone: string | undefined
}

/** More option sets than this per kind are unusual. The oldest is dropped first. */
const maximumReusedFormatters = 50

/**
 * Builds an `Intl` formatter once per set of options, because building one costs far more than
 * using it: a table formats every cell. The key is the options themselves, so callers pass the
 * effective ones (including the time zone).
 */
function reuseFormatters<Options extends object, Formatter>(
  create: (options: Options | undefined) => Formatter,
): (options: Options | undefined) => Formatter {
  const formatters = new Map<string, Formatter>()
  return (options) => {
    const key = options === undefined ? '' : JSON.stringify(options)
    const known = formatters.get(key)
    if (known !== undefined) return known
    const formatter = create(options)
    if (formatters.size >= maximumReusedFormatters) {
      const oldest = formatters.keys().next().value
      if (oldest !== undefined) formatters.delete(oldest)
    }
    formatters.set(key, formatter)
    return formatter
  }
}

const calendarDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/

/** A calendar date as midnight UTC on that day. Throws for any other text and for a day that doesn't exist. */
function parseCalendarDate(text: string): Date {
  const match = calendarDatePattern.exec(text)
  if (match !== null) {
    const year = Number(match[1])
    const monthIndex = Number(match[2]) - 1
    const day = Number(match[3])
    // `setUTCFullYear`, not `Date.UTC`, which reads the years 0 to 99 as 1900 to 1999.
    const date = new Date(0)
    date.setUTCFullYear(year, monthIndex, day)
    if (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === monthIndex &&
      date.getUTCDate() === day
    ) {
      return date
    }
  }
  throw new RangeError(
    `"${text}" is not a calendar date. Write it as YYYY-MM-DD, or pass a Date for an instant.`,
  )
}

export function createMessageFormat({
  locale,
  timeZone,
}: CreateMessageFormatOptions): MessageFormatter {
  let pluralRules: Intl.PluralRules | undefined
  const numberFormatter = reuseFormatters<Intl.NumberFormatOptions, Intl.NumberFormat>(
    (options) => new Intl.NumberFormat(locale, options),
  )
  const dateFormatter = reuseFormatters<Intl.DateTimeFormatOptions, Intl.DateTimeFormat>(
    (options) => new Intl.DateTimeFormat(locale, options),
  )
  const listFormatter = reuseFormatters<Intl.ListFormatOptions, Intl.ListFormat>(
    (options) => new Intl.ListFormat(locale, options),
  )

  return {
    plural: (count, forms) => {
      if (count === 0 && forms.zero !== undefined) {
        return forms.zero
      }
      pluralRules ??= new Intl.PluralRules(locale)
      return forms[pluralRules.select(count)] ?? forms.other
    },
    number: (value, options) => numberFormatter(options).format(value),
    date: (value, options) => {
      const isCalendarDate = typeof value === 'string'
      // A `timeZone` of `undefined` in the options is "not given": an optional prop passed on must
      // not move a calendar date, or drop the provider's zone.
      const effectiveTimeZone = options?.timeZone ?? (isCalendarDate ? 'UTC' : timeZone)
      return dateFormatter({
        ...options,
        ...(effectiveTimeZone === undefined ? {} : { timeZone: effectiveTimeZone }),
      }).format(isCalendarDate ? parseCalendarDate(value) : value)
    },
    list: (items, options) => listFormatter(options).format(items),
  }
}
