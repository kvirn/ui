import { describe, expect, it } from 'vite-plus/test'
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
})
