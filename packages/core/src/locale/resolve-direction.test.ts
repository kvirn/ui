import { describe, expect, it } from 'vite-plus/test'
import {
  getLanguage,
  resolveDirection,
  resolveDirectionFromLanguage,
  rightToLeftLanguages,
} from './resolve-direction.ts'

describe('resolveDirection', () => {
  it.each(['sv-SE', 'fi-FI', 'nb-NO', 'nn-NO', 'se-NO', 'en', 'en-GB'])('%s is ltr', (locale) => {
    expect(resolveDirection(locale)).toBe('ltr')
  })

  it.each(['ar', 'ar-EG', 'he-IL', 'fa-IR', 'ur-PK'])('%s is rtl', (locale) => {
    expect(resolveDirection(locale)).toBe('rtl')
  })

  it('treats an invalid tag as ltr instead of throwing', () => {
    expect(resolveDirection('not a locale')).toBe('ltr')
  })
})

describe('resolveDirectionFromLanguage (fallback without Intl text info)', () => {
  it.each(rightToLeftLanguages)('%s is rtl', (language) => {
    expect(resolveDirectionFromLanguage(language)).toBe('rtl')
  })

  it('matches on the language subtag, whatever the region or case', () => {
    expect(resolveDirectionFromLanguage('AR-eg')).toBe('rtl')
    expect(resolveDirectionFromLanguage('ckb-IQ')).toBe('rtl')
    expect(resolveDirectionFromLanguage('sv-SE')).toBe('ltr')
    expect(resolveDirectionFromLanguage('nn')).toBe('ltr')
  })

  it('agrees with Intl text info for every listed language', () => {
    for (const language of rightToLeftLanguages) {
      expect(resolveDirection(language)).toBe(resolveDirectionFromLanguage(language))
    }
  })
})

describe('getLanguage', () => {
  it('returns the lower-cased language subtag', () => {
    expect(getLanguage('sv-SE')).toBe('sv')
    expect(getLanguage('EN')).toBe('en')
    expect(getLanguage('nn_NO')).toBe('nn')
  })
})
