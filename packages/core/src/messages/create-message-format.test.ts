import { describe, expect, it, vi } from 'vite-plus/test'
import { createMessageFormat } from './create-message-format.ts'

describe('createMessageFormat', () => {
  const swedishFormat = createMessageFormat({ locale: 'sv-SE', timeZone: 'Europe/Stockholm' })
  const englishFormat = createMessageFormat({ locale: 'en', timeZone: 'UTC' })

  describe('plural', () => {
    const forms = { one: 'en träff', other: 'flera träffar' }

    it('picks the Intl.PluralRules category for the locale', () => {
      expect(swedishFormat.plural(1, forms)).toBe('en träff')
      expect(swedishFormat.plural(2, forms)).toBe('flera träffar')
    })

    it('uses `zero` for exactly 0 when given, otherwise the plural category', () => {
      expect(swedishFormat.plural(0, { ...forms, zero: 'inga träffar' })).toBe('inga träffar')
      expect(swedishFormat.plural(0, forms)).toBe('flera träffar')
    })

    it('falls back to `other` when the category has no form', () => {
      expect(englishFormat.plural(1, { other: 'results' })).toBe('results')
    })
  })

  it('formats numbers for the locale', () => {
    expect(swedishFormat.number(1234.5)).toBe(new Intl.NumberFormat('sv-SE').format(1234.5))
    expect(englishFormat.number(0.25, { style: 'percent' })).toBe('25%')
  })

  it('formats dates in the configured time zone', () => {
    const midnightUtc = Date.UTC(2026, 8, 30, 23, 30)
    expect(englishFormat.date(midnightUtc, { day: 'numeric' })).toBe('30')
    expect(swedishFormat.date(midnightUtc, { day: 'numeric' })).toBe('1')
  })

  it('lets date options override the time zone', () => {
    const midnightUtc = Date.UTC(2026, 8, 30, 23, 30)
    expect(swedishFormat.date(midnightUtc, { day: 'numeric', timeZone: 'UTC' })).toBe('30')
  })

  it('uses the runtime time zone when none is configured', () => {
    const runtimeFormat = createMessageFormat({ locale: 'en', timeZone: undefined })
    const date = new Date(Date.UTC(2026, 8, 30, 12))
    expect(runtimeFormat.date(date, { hour: 'numeric' })).toBe(
      new Intl.DateTimeFormat('en', { hour: 'numeric' }).format(date),
    )
  })

  it('formats lists for the locale', () => {
    expect(swedishFormat.list(['sv', 'fi', 'en'])).toBe('sv, fi och en')
    expect(englishFormat.list(['sv', 'fi'], { type: 'disjunction' })).toBe('sv or fi')
  })

  describe('calendar dates (Plan 0046)', () => {
    it('shows a YYYY-MM-DD string as that day, in any time zone', () => {
      const zones = [
        'Pacific/Honolulu',
        'America/New_York',
        'Europe/Stockholm',
        'Pacific/Auckland',
        undefined,
      ]
      for (const timeZone of zones) {
        const format = createMessageFormat({ locale: 'en-GB', timeZone })
        expect(format.date('2026-01-23', { dateStyle: 'long' })).toBe('23 January 2026')
      }
    })

    it('keeps an instant in the time zone while a calendar date stays on its day', () => {
      const lateEveningUtc = Date.UTC(2026, 8, 30, 23, 30)
      const stockholm = { locale: 'en', timeZone: 'Europe/Stockholm' }
      const instantFirst = createMessageFormat(stockholm)
      expect(instantFirst.date(lateEveningUtc, { day: 'numeric' })).toBe('1')
      expect(instantFirst.date('2026-09-30', { day: 'numeric' })).toBe('30')
      const calendarDateFirst = createMessageFormat(stockholm)
      expect(calendarDateFirst.date('2026-09-30', { day: 'numeric' })).toBe('30')
      expect(calendarDateFirst.date(lateEveningUtc, { day: 'numeric' })).toBe('1')
    })

    it('treats an options.timeZone of undefined as not given, for a calendar date and an instant', () => {
      const honolulu = createMessageFormat({ locale: 'en-GB', timeZone: 'Pacific/Honolulu' })
      expect(honolulu.date('2026-01-23', { dateStyle: 'long', timeZone: undefined })).toBe(
        '23 January 2026',
      )
      // 05:00 UTC on the 24th is the evening of the 23rd in Honolulu.
      expect(honolulu.date(Date.UTC(2026, 0, 24, 5), { day: 'numeric', timeZone: undefined })).toBe(
        '23',
      )
    })

    it('accepts a day that exists, a leap day included', () => {
      expect(englishFormat.date('2028-02-29', { dateStyle: 'short' })).toBe(
        new Intl.DateTimeFormat('en', { dateStyle: 'short', timeZone: 'UTC' }).format(
          Date.UTC(2028, 1, 29),
        ),
      )
    })

    it.each(['', '2026-1-5', '2026-02-29', '2026-13-01', '23.01.2026', '2026-01-23T10:00:00Z'])(
      'throws a RangeError for %j, which is not a calendar date',
      (text) => {
        expect(() => englishFormat.date(text)).toThrow(RangeError)
      },
    )
  })

  describe('reusing Intl objects (Plan 0046)', () => {
    it('builds one Intl object for equal options, however often it formats', () => {
      const formatters = [
        vi.spyOn(Intl, 'NumberFormat'),
        vi.spyOn(Intl, 'DateTimeFormat'),
        vi.spyOn(Intl, 'ListFormat'),
      ]
      try {
        const format = createMessageFormat({ locale: 'sv-SE', timeZone: 'Europe/Stockholm' })
        for (let count = 0; count < 25; count += 1) {
          format.number(count, { minimumFractionDigits: 2 })
          format.date(Date.UTC(2026, 0, count + 1), { dateStyle: 'short' })
          format.date(`2026-01-${String(count + 1).padStart(2, '0')}`, { dateStyle: 'short' })
          format.list(['sv', 'fi'], { type: 'disjunction' })
        }
        const [numberFormat, dateTimeFormat, listFormat] = formatters
        expect(numberFormat).toHaveBeenCalledTimes(1)
        // One for the instants, in the provider's zone, and one for the calendar dates, in UTC.
        expect(dateTimeFormat).toHaveBeenCalledTimes(2)
        expect(listFormat).toHaveBeenCalledTimes(1)
      } finally {
        for (const formatter of formatters) formatter.mockRestore()
      }
    })

    it('keeps different options apart', () => {
      const instant = Date.UTC(2026, 0, 23, 12)
      const zone = { timeZone: 'Europe/Stockholm' }
      const expected = {
        percent: new Intl.NumberFormat('sv-SE', { style: 'percent' }).format(0.25),
        plain: new Intl.NumberFormat('sv-SE').format(0.25),
        longMonth: new Intl.DateTimeFormat('sv-SE', { month: 'long', ...zone }).format(instant),
        shortMonth: new Intl.DateTimeFormat('sv-SE', { month: 'short', ...zone }).format(instant),
      }
      expect(new Set(Object.values(expected)).size).toBe(4)
      // Twice, so the second round is answered from the reused objects.
      for (let round = 0; round < 2; round += 1) {
        expect(swedishFormat.number(0.25, { style: 'percent' })).toBe(expected.percent)
        expect(swedishFormat.number(0.25)).toBe(expected.plain)
        expect(swedishFormat.date(instant, { month: 'long' })).toBe(expected.longMonth)
        expect(swedishFormat.date(instant, { month: 'short' })).toBe(expected.shortMonth)
      }
    })
  })
})
