import { describe, expect, test } from 'vite-plus/test'
import { getLocaleWeekStart, isWeekStart, resolveWeekStart } from './week-start.ts'

describe('weekStart', () => {
  test.each([1, 2, 7])('%i is a week start', (value) => {
    expect(isWeekStart(value)).toBe(true)
  })

  test.each([0, 8, 1.5, '1', undefined, null, Number.NaN])('%s is not', (value) => {
    expect(isWeekStart(value)).toBe(false)
  })

  test('a locale that names a region gives that region its first day', () => {
    expect(getLocaleWeekStart('en-US')).toBe(7)
    expect(getLocaleWeekStart('en-GB')).toBe(1)
    expect(getLocaleWeekStart('sv-SE')).toBe(1)
    expect(getLocaleWeekStart('fi-FI')).toBe(1)
  })

  test('a bare language has no answer, so bare en stays Monday', () => {
    expect(getLocaleWeekStart('en')).toBeUndefined()
    expect(getLocaleWeekStart('sv')).toBeUndefined()
    expect(resolveWeekStart({ locale: 'en' })).toBe(1)
  })

  test('an unknown or malformed locale gives Monday', () => {
    expect(resolveWeekStart({ locale: 'not a locale' })).toBe(1)
  })

  test('instance wins over provider, provider over the locale', () => {
    expect(resolveWeekStart({ instance: 3, provider: 6, locale: 'en-US' })).toBe(3)
    expect(resolveWeekStart({ provider: 6, locale: 'en-US' })).toBe(6)
    expect(resolveWeekStart({ locale: 'en-US' })).toBe(7)
  })

  test('an invalid instance or provider value is skipped', () => {
    expect(resolveWeekStart({ instance: 0, provider: 9, locale: 'en-US' })).toBe(7)
    expect(resolveWeekStart({ instance: 'x', locale: 'sv' })).toBe(1)
  })
})
