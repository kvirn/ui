import { describe, expect, test } from 'vite-plus/test'
import {
  addDays,
  addMonths,
  addYears,
  clampIsoDate,
  compareIsoDates,
  daysInMonth,
  endOfWeek,
  getIsoWeek,
  getIsoWeekday,
  getMonthWeeks,
  getWeekdayOrder,
  getYearMonth,
  isLeapYear,
  isValidIsoDate,
  maximumIsoDate,
  minimumIsoDate,
  parseIsoDate,
  startOfWeek,
  toIsoDate,
} from './calendar-date.ts'

describe('parsing and formatting', () => {
  test.each(['2026-10-06', '0001-01-01', '9999-12-31', '2024-02-29'])('accepts %s', (value) => {
    expect(isValidIsoDate(value)).toBe(true)
  })

  test.each([
    '2026-02-30',
    '2023-02-29',
    '2026-13-01',
    '2026-00-10',
    '2026-2-3',
    '',
    '0000-01-01',
    '26-01-01',
  ])('rejects "%s"', (value) => {
    expect(isValidIsoDate(value)).toBe(false)
  })

  test('parts and ISO string round-trip, with padding', () => {
    expect(parseIsoDate('0042-03-09')).toEqual({ year: 42, month: 3, day: 9 })
    expect(toIsoDate({ year: 42, month: 3, day: 9 })).toBe('0042-03-09')
  })

  test('ISO strings compare like dates', () => {
    expect(compareIsoDates('2026-01-31', '2026-02-01')).toBe(-1)
    expect(compareIsoDates('2026-02-01', '2026-02-01')).toBe(0)
    expect(compareIsoDates('2027-01-01', '2026-12-31')).toBe(1)
  })
})

describe('leap years and month lengths', () => {
  test.each([
    [1900, false],
    [2000, true],
    [2023, false],
    [2024, true],
    [2100, false],
  ])('isLeapYear(%i) is %s', (year, expected) => {
    expect(isLeapYear(year)).toBe(expected)
  })

  test.each([
    [2024, 2, 29],
    [2023, 2, 28],
    [2026, 4, 30],
    [2026, 12, 31],
  ])('daysInMonth(%i, %i) is %i', (year, month, expected) => {
    expect(daysInMonth(year, month)).toBe(expected)
  })
})

describe('day of the week', () => {
  test.each([
    ['1970-01-01', 4],
    ['2000-01-01', 6],
    ['2024-02-29', 4],
    ['2026-10-06', 2],
    ['2026-11-01', 7],
    ['1900-01-01', 1],
    ['0001-01-01', 1],
    ['9999-12-31', 5],
  ])('%s is ISO weekday %i', (date, expected) => {
    expect(getIsoWeekday(date)).toBe(expected)
  })
})

describe('adding days', () => {
  test.each([
    ['2026-01-31', 1, '2026-02-01'],
    ['2026-03-01', -1, '2026-02-28'],
    ['2024-03-01', -1, '2024-02-29'],
    ['2026-12-31', 1, '2027-01-01'],
    ['2026-01-01', -1, '2025-12-31'],
    ['2026-10-06', 7, '2026-10-13'],
    ['2026-10-06', 0, '2026-10-06'],
    ['2000-02-28', 366, '2001-02-28'],
    ['1970-01-01', -719162, '0001-01-01'],
  ])('%s + %i days is %s', (date, days, expected) => {
    expect(addDays(date, days)).toBe(expected)
  })

  test('stops at year 1 and year 9999', () => {
    expect(addDays(minimumIsoDate, -1)).toBe(minimumIsoDate)
    expect(addDays(maximumIsoDate, 1)).toBe(maximumIsoDate)
  })
})

describe('adding months and years', () => {
  test.each([
    ['2026-01-31', 1, '2026-02-28'],
    ['2024-01-31', 1, '2024-02-29'],
    ['2026-03-31', -1, '2026-02-28'],
    ['2026-12-15', 1, '2027-01-15'],
    ['2026-01-15', -1, '2025-12-15'],
    ['2026-10-31', 4, '2027-02-28'],
    ['2026-10-06', -22, '2024-12-06'],
  ])('%s + %i months is %s', (date, months, expected) => {
    expect(addMonths(date, months)).toBe(expected)
  })

  test('29 Feb plus a year is 28 Feb, and four years is 29 Feb', () => {
    expect(addYears('2024-02-29', 1)).toBe('2025-02-28')
    expect(addYears('2024-02-29', -1)).toBe('2023-02-28')
    expect(addYears('2024-02-29', 4)).toBe('2028-02-29')
  })

  test('stops at year 1 and year 9999', () => {
    expect(addYears('0001-06-15', -1)).toBe(minimumIsoDate)
    expect(addMonths('9999-12-31', 1)).toBe(maximumIsoDate)
  })
})

describe('ISO weeks', () => {
  test.each([
    ['2026-01-01', 2026, 1],
    ['2026-12-31', 2026, 53],
    ['2027-01-01', 2026, 53],
    ['2027-01-03', 2026, 53],
    ['2027-01-04', 2027, 1],
    ['2020-12-31', 2020, 53],
    ['2021-01-01', 2020, 53],
    ['2024-12-30', 2025, 1],
    ['2025-12-29', 2026, 1],
    ['2026-10-06', 2026, 41],
    ['2024-02-29', 2024, 9],
    ['2015-12-31', 2015, 53],
    ['2016-01-03', 2015, 53],
  ])('%s is in week %i/%i of its ISO year', (date, weekYear, week) => {
    expect(getIsoWeek(date)).toEqual({ weekYear, week })
  })
})

describe('weeks by week start', () => {
  test('start and end of the week for Monday, Sunday and Saturday', () => {
    expect(startOfWeek('2026-10-07', 1)).toBe('2026-10-05')
    expect(endOfWeek('2026-10-07', 1)).toBe('2026-10-11')
    expect(startOfWeek('2026-10-07', 7)).toBe('2026-10-04')
    expect(endOfWeek('2026-10-07', 7)).toBe('2026-10-10')
    expect(startOfWeek('2026-10-10', 6)).toBe('2026-10-10')
    expect(endOfWeek('2026-10-10', 6)).toBe('2026-10-16')
  })

  test('a date on the start day is its own start', () => {
    expect(startOfWeek('2026-10-05', 1)).toBe('2026-10-05')
    expect(endOfWeek('2026-10-11', 1)).toBe('2026-10-11')
  })

  test('column order starts at the week start', () => {
    expect(getWeekdayOrder(1)).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect(getWeekdayOrder(7)).toEqual([7, 1, 2, 3, 4, 5, 6])
    expect(getWeekdayOrder(6)).toEqual([6, 7, 1, 2, 3, 4, 5])
  })
})

describe('month grid', () => {
  test('October 2026 from Monday: empty cells before the 1st and after the 31st', () => {
    const weeks = getMonthWeeks({ year: 2026, month: 10 }, 1)
    expect(weeks).toHaveLength(5)
    expect(weeks.every((week) => week.length === 7)).toBe(true)
    expect(weeks[0]).toEqual([
      undefined,
      undefined,
      undefined,
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
      '2026-10-04',
    ])
    expect(weeks[4]).toEqual([
      '2026-10-26',
      '2026-10-27',
      '2026-10-28',
      '2026-10-29',
      '2026-10-30',
      '2026-10-31',
      undefined,
    ])
  })

  test('the same month from Sunday has a different first row', () => {
    const weeks = getMonthWeeks({ year: 2026, month: 10 }, 7)
    expect(weeks[0]?.[4]).toBe('2026-10-01')
    expect(weeks[0]?.slice(0, 4)).toEqual([undefined, undefined, undefined, undefined])
  })

  test('a month that starts on the week start has no empty leading cell', () => {
    const weeks = getMonthWeeks({ year: 2026, month: 6 }, 1)
    expect(weeks[0]?.[0]).toBe('2026-06-01')
  })

  test('February 2027 from Monday is exactly four rows', () => {
    expect(getMonthWeeks({ year: 2027, month: 2 }, 1)).toHaveLength(4)
  })

  test('a month can need six rows', () => {
    expect(getMonthWeeks({ year: 2026, month: 8 }, 7)).toHaveLength(6)
  })

  test('every day of the month appears once, in order', () => {
    const days = getMonthWeeks({ year: 2024, month: 2 }, 1)
      .flat()
      .filter((day) => day !== undefined)
    expect(days).toHaveLength(29)
    expect(days[28]).toBe('2024-02-29')
  })

  test('a Monday row has one ISO week', () => {
    for (const week of getMonthWeeks({ year: 2026, month: 12 }, 1)) {
      const weeks = new Set(
        week.filter((day) => day !== undefined).map((day) => getIsoWeek(day).week),
      )
      expect(weeks.size).toBe(1)
    }
  })
})

describe('clamping', () => {
  test('inside, below, above and unbounded', () => {
    expect(clampIsoDate('2026-10-06', '2026-10-01', '2026-10-31')).toBe('2026-10-06')
    expect(clampIsoDate('2026-09-30', '2026-10-01', '2026-10-31')).toBe('2026-10-01')
    expect(clampIsoDate('2026-11-01', '2026-10-01', '2026-10-31')).toBe('2026-10-31')
    expect(clampIsoDate('2026-11-01')).toBe('2026-11-01')
    expect(clampIsoDate('2026-11-01', undefined, '2026-10-31')).toBe('2026-10-31')
  })
})

describe('invalid input', () => {
  test.each([
    ['addDays', () => addDays('2026-02-30', 1)],
    ['addMonths', () => addMonths('nope', 1)],
    ['getIsoWeekday', () => getIsoWeekday('2026-13-01')],
    ['getIsoWeek', () => getIsoWeek('')],
    ['startOfWeek', () => startOfWeek('2026-2-3', 1)],
    ['getYearMonth', () => getYearMonth('0000-01-01')],
    ['getMonthWeeks', () => getMonthWeeks({ year: 2026, month: 13 }, 1)],
  ])('%s throws a RangeError', (_name, call) => {
    expect(call).toThrow(RangeError)
  })

  test.each([Number.NaN, 1.5, Number.POSITIVE_INFINITY])(
    'an amount of %s throws a RangeError',
    (amount) => {
      expect(() => addDays('2026-10-06', amount)).toThrow(RangeError)
      expect(() => addMonths('2026-10-06', amount)).toThrow(RangeError)
      expect(() => addYears('2026-10-06', amount)).toThrow(RangeError)
    },
  )
})

describe('the ends of the supported years', () => {
  test('End in the first week of year 1 is the day itself or after, never before', () => {
    expect(endOfWeek('0001-01-01', 7)).toBe('0001-01-06')
    expect(endOfWeek('0001-01-01', 6)).toBe('0001-01-05')
    expect(endOfWeek('0001-01-01', 1)).toBe('0001-01-07')
  })

  test('Home in the last week of year 9999 and End at 9999-12-31', () => {
    expect(startOfWeek('9999-12-31', 7)).toBe('9999-12-26')
    expect(startOfWeek('9999-12-31', 1)).toBe('9999-12-27')
    expect(endOfWeek('9999-12-31', 1)).toBe(maximumIsoDate)
    expect(endOfWeek('9999-12-31', 7)).toBe(maximumIsoDate)
  })
})
