import { describe, expect, it } from 'vite-plus/test'
import { maskCountryFromLocale } from './mask-country.ts'

describe('maskCountryFromLocale', () => {
  it.each([
    ['sv-SE', 'SE'],
    ['fi-FI', 'FI'],
    ['nb-NO', 'NO'],
    ['nn-NO', 'NO'],
  ])('the region of %s gives %s', (locale, country) => {
    expect(maskCountryFromLocale(locale)).toBe(country)
  })

  it.each([
    ['sv', 'SE'],
    ['fi', 'FI'],
    ['nb', 'NO'],
    ['nn', 'NO'],
    ['no', 'NO'],
    ['se', 'NO'],
  ])('a bare %s tag falls back to the language: %s', (locale, country) => {
    expect(maskCountryFromLocale(locale)).toBe(country)
  })

  it('the region wins over the language: sv-FI is Finland, se-FI too, and fi-SE is Sweden', () => {
    expect(maskCountryFromLocale('sv-FI')).toBe('FI')
    expect(maskCountryFromLocale('se-FI')).toBe('FI')
    expect(maskCountryFromLocale('fi-SE')).toBe('SE')
  })

  it('reads the region after a script subtag, in any case', () => {
    expect(maskCountryFromLocale('sv-Latn-FI')).toBe('FI')
    expect(maskCountryFromLocale('sv-fi')).toBe('FI')
    expect(maskCountryFromLocale('SV_SE')).toBe('SE')
  })

  it('stops at a singleton subtag: an extension or private use is not a region', () => {
    expect(maskCountryFromLocale('sv-x-fi')).toBe('SE')
    expect(maskCountryFromLocale('sv-u-fi')).toBe('SE')
    expect(maskCountryFromLocale('en-x-se')).toBeUndefined()
    expect(maskCountryFromLocale('en-u-ca-gregory-no')).toBeUndefined()
    expect(maskCountryFromLocale('sv-FI-x-se')).toBe('FI')
  })

  it('a region that is not supported falls back to the language', () => {
    expect(maskCountryFromLocale('sv-GB')).toBe('SE')
  })

  it.each(['en', 'en-GB', 'da-DK', 'de', 'ar-EG', '', 'not a locale!'])(
    '%j has no country',
    (locale) => {
      expect(maskCountryFromLocale(locale)).toBeUndefined()
    },
  )
})
