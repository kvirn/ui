// Gregorian date math on ISO `YYYY-MM-DD` strings, years 1 to 9999. Pure integer arithmetic: no
// `Date`, so no time zone or DST can move a day. Functions take valid dates (`parseIsoDate`
// checks); a result past the range is clamped to `minimumIsoDate` or `maximumIsoDate`.

import { daysInMonth, isCalendarDate, isLeapYear } from '../mask/checks/check-support.ts'

export { daysInMonth, isLeapYear }

/** `YYYY-MM-DD`, four-digit year, so ISO strings sort like the dates they name. */
export type IsoDate = string

/** ISO weekday: 1 is Monday, 7 is Sunday. */
export type IsoWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7

export interface DateParts {
  year: number
  month: number
  day: number
}

export interface YearMonth {
  year: number
  month: number
}

export interface IsoWeek {
  /** The year the week belongs to: 1 Jan can be in week 52 or 53 of the year before. */
  weekYear: number
  /** 1 to 53. */
  week: number
}

export const minimumIsoDate: IsoDate = '0001-01-01'
export const maximumIsoDate: IsoDate = '9999-12-31'

const minimumYear = 1
const maximumYear = 9999
const isoPattern = /^(\d{4})-(\d{2})-(\d{2})$/

function pad(value: number, length: number): string {
  return String(value).padStart(length, '0')
}

export function isValidDateParts({ year, month, day }: DateParts): boolean {
  return (
    Number.isInteger(year) &&
    Number.isInteger(month) &&
    Number.isInteger(day) &&
    year >= minimumYear &&
    year <= maximumYear &&
    isCalendarDate(year, month, day)
  )
}

export function toIsoDate({ year, month, day }: DateParts): IsoDate {
  return `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`
}

/** The parts of a valid ISO date, or `undefined` for anything else (`2026-02-30`, `2026-2-3`, `''`). */
export function parseIsoDate(value: string): DateParts | undefined {
  const match = isoPattern.exec(value)
  if (match === null) return undefined
  const parts = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) }
  return isValidDateParts(parts) ? parts : undefined
}

export function isValidIsoDate(value: string): boolean {
  return parseIsoDate(value) !== undefined
}

function parseValid(date: IsoDate): DateParts {
  const parts = parseIsoDate(date)
  if (parts === undefined) throw new RangeError(`Not a valid ISO date: "${date}"`)
  return parts
}

/** -1, 0 or 1. Valid ISO strings sort, so this is a plain string comparison. */
export function compareIsoDates(first: IsoDate, second: IsoDate): -1 | 0 | 1 {
  if (first === second) return 0
  return first < second ? -1 : 1
}

// Days from 1970-01-01 (Howard Hinnant's days-from-civil).
function toDayNumber({ year, month, day }: DateParts): number {
  const shiftedYear = month <= 2 ? year - 1 : year
  const era = Math.floor(shiftedYear / 400)
  const yearOfEra = shiftedYear - era * 400
  const dayOfYear = Math.floor((153 * (month + (month > 2 ? -3 : 9)) + 2) / 5) + day - 1
  const dayOfEra =
    yearOfEra * 365 + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100) + dayOfYear
  return era * 146097 + dayOfEra - 719468
}

function fromDayNumber(dayNumber: number): DateParts {
  const shifted = dayNumber + 719468
  const era = Math.floor(shifted / 146097)
  const dayOfEra = shifted - era * 146097
  const yearOfEra = Math.floor(
    (dayOfEra -
      Math.floor(dayOfEra / 1460) +
      Math.floor(dayOfEra / 36524) -
      Math.floor(dayOfEra / 146096)) /
      365,
  )
  const dayOfYear =
    dayOfEra - (365 * yearOfEra + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100))
  const monthIndex = Math.floor((5 * dayOfYear + 2) / 153)
  const month = monthIndex < 10 ? monthIndex + 3 : monthIndex - 9
  const year = yearOfEra + era * 400 + (month <= 2 ? 1 : 0)
  return { year, month, day: dayOfYear - Math.floor((153 * monthIndex + 2) / 5) + 1 }
}

const minimumDayNumber = toDayNumber({ year: minimumYear, month: 1, day: 1 })
const maximumDayNumber = toDayNumber({ year: maximumYear, month: 12, day: 31 })

function fromClampedDayNumber(dayNumber: number): IsoDate {
  return toIsoDate(fromDayNumber(Math.min(maximumDayNumber, Math.max(minimumDayNumber, dayNumber))))
}

function weekdayOfDayNumber(dayNumber: number): IsoWeekday {
  // 1970-01-01 was a Thursday (4).
  return (((((dayNumber + 3) % 7) + 7) % 7) + 1) as IsoWeekday
}

export function getIsoWeekday(date: IsoDate): IsoWeekday {
  return weekdayOfDayNumber(toDayNumber(parseValid(date)))
}

function assertWholeNumber(amount: number): void {
  if (!Number.isInteger(amount)) throw new RangeError(`Not a whole number: ${amount}`)
}

export function addDays(date: IsoDate, days: number): IsoDate {
  assertWholeNumber(days)
  return fromClampedDayNumber(toDayNumber(parseValid(date)) + days)
}

/** Months later (or earlier, when negative). The day is kept, or cut to the month's length (31 Jan + 1 is 28 Feb). */
export function addMonths(date: IsoDate, months: number): IsoDate {
  assertWholeNumber(months)
  const { year, month, day } = parseValid(date)
  const monthIndex = year * 12 + (month - 1) + months
  const targetYear = Math.floor(monthIndex / 12)
  if (targetYear < minimumYear) return minimumIsoDate
  if (targetYear > maximumYear) return maximumIsoDate
  const targetMonth = (monthIndex % 12) + 1
  return toIsoDate({
    year: targetYear,
    month: targetMonth,
    day: Math.min(day, daysInMonth(targetYear, targetMonth)),
  })
}

/** Years later or earlier. 29 Feb becomes 28 Feb in a common year. */
export function addYears(date: IsoDate, years: number): IsoDate {
  assertWholeNumber(years)
  return addMonths(date, years * 12)
}

/** `date` kept inside `minimum` and `maximum`, either of which may be left out. */
export function clampIsoDate(date: IsoDate, minimum?: IsoDate, maximum?: IsoDate): IsoDate {
  if (minimum !== undefined && date < minimum) return minimum
  if (maximum !== undefined && date > maximum) return maximum
  return date
}

/** Week 1 holds the first Thursday of the year (ISO 8601). */
export function getIsoWeek(date: IsoDate): IsoWeek {
  const dayNumber = toDayNumber(parseValid(date))
  const thursday = dayNumber - (weekdayOfDayNumber(dayNumber) - 1) + 3
  const weekYear = fromDayNumber(thursday).year
  const firstOfYear = toDayNumber({ year: weekYear, month: 1, day: 1 })
  return { weekYear, week: Math.floor((thursday - firstOfYear) / 7) + 1 }
}

/** The first day of the week that holds `date`, for a week that starts on `weekStart`. */
export function startOfWeek(date: IsoDate, weekStart: IsoWeekday): IsoDate {
  return addDays(date, -((getIsoWeekday(date) - weekStart + 7) % 7))
}

export function endOfWeek(date: IsoDate, weekStart: IsoWeekday): IsoDate {
  return addDays(date, (weekStart + 6 - getIsoWeekday(date)) % 7)
}

/** The ISO weekdays in column order for a week that starts on `weekStart`: `[7, 1, 2, …]` for Sunday. */
export function getWeekdayOrder(weekStart: IsoWeekday): IsoWeekday[] {
  return Array.from({ length: 7 }, (_, index) => (((weekStart - 1 + index) % 7) + 1) as IsoWeekday)
}

/**
 * The rows of a month, each seven cells from `weekStart`. A day of another month is `undefined`
 * (an empty cell), so the arrows can cross into it but the grid never shows two "1"s.
 */
export function getMonthWeeks(
  { year, month }: YearMonth,
  weekStart: IsoWeekday,
): (IsoDate | undefined)[][] {
  if (!isValidDateParts({ year, month, day: 1 })) {
    throw new RangeError(`Not a valid month: ${year}-${month}`)
  }
  const length = daysInMonth(year, month)
  const leading = (getIsoWeekday(toIsoDate({ year, month, day: 1 })) - weekStart + 7) % 7
  const rowCount = Math.ceil((leading + length) / 7)
  return Array.from({ length: rowCount }, (_, row) =>
    Array.from({ length: 7 }, (_, column) => {
      const day = row * 7 + column - leading + 1
      return day >= 1 && day <= length ? toIsoDate({ year, month, day }) : undefined
    }),
  )
}

/** The month a date is in. */
export function getYearMonth(date: IsoDate): YearMonth {
  const { year, month } = parseValid(date)
  return { year, month }
}
