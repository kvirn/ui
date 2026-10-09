import { createMessageFormat } from '@kvirn-ui/core'
import type { MessageFormatter } from '@kvirn-ui/core'
import { warnOnce } from '../dev/dev-warning.ts'

/**
 * The provider's formatter. Without a `timeZone` instants are shown in UTC, never the runtime's
 * zone, so the server and the browser agree; formatting one then warns once in development, and
 * a time is written with its zone name. A date-only instant has no label, so it can show the
 * neighbouring day: a calendar date belongs in the `YYYY-MM-DD` string form.
 */
export function createProviderFormat(
  locale: string,
  timeZone: string | undefined,
): MessageFormatter {
  const format = createMessageFormat({ locale, timeZone: timeZone ?? 'UTC' })
  if (timeZone !== undefined) {
    return format
  }
  return {
    ...format,
    date: (value, options) => {
      if (typeof value !== 'string' && options?.timeZone === undefined) {
        warnDateWithoutTimeZone('An instant was formatted')
      }
      if (typeof value === 'string' || options?.timeZone !== undefined) {
        return format.date(value, options)
      }
      return withUtcZoneName(format, locale, value, options)
    },
  }
}

/** Also fired by the Calendar family when "today" falls back to the UTC date. */
export function warnDateWithoutTimeZone(what: string, outcome = 'it is shown in UTC'): void {
  warnOnce(
    'date-without-time-zone',
    `${what} and no \`timeZone\` is set, so ${outcome}. Pass \`timeZone\` on <KvirnProvider>, the same value on the server and in the browser, such as <KvirnProvider timeZone="Europe/Stockholm">.`,
  )
}

const timeFields = ['hour', 'minute', 'second', 'dayPeriod', 'fractionalSecondDigits'] as const

// `timeStyle` cannot be combined with `timeZoneName`, and only its `full` and `long` show a zone.
function withUtcZoneName(
  format: MessageFormatter,
  locale: string,
  value: Date | number,
  options: Intl.DateTimeFormatOptions | undefined,
): string {
  if (options?.timeStyle === 'short' || options?.timeStyle === 'medium') {
    const zoneName = new Intl.DateTimeFormat(locale, {
      timeZone: 'UTC',
      timeZoneName: 'short',
      hour: 'numeric',
    })
      .formatToParts(value)
      .find((part) => part.type === 'timeZoneName')?.value
    return zoneName === undefined
      ? format.date(value, options)
      : `${format.date(value, options)} ${zoneName}`
  }
  const showsTime = timeFields.some((field) => options?.[field] !== undefined)
  if (showsTime && options?.timeZoneName === undefined && options?.timeStyle === undefined) {
    return format.date(value, { ...options, timeZoneName: 'short' })
  }
  return format.date(value, options)
}
