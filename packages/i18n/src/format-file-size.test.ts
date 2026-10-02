import { describe, expect, it } from 'vite-plus/test'
import { formatFileSize } from './format-file-size.ts'
import type { MessageFormat } from './types.ts'

/** The same Intl-only helper the React provider builds, without the plural and date parts. */
function createFormat(locale: string): MessageFormat {
  return {
    plural: (_count, forms) => forms.other,
    number: (value, options) => new Intl.NumberFormat(locale, options).format(value),
    date: (value, options) => new Intl.DateTimeFormat(locale, options).format(value),
    list: (items, options) => new Intl.ListFormat(locale, options).format(items),
  }
}

/** Intl puts a no-break space between the number and the unit. Compare with a plain space. */
function plain(text: string): string {
  return text.replace(/\s/g, ' ')
}

describe('formatFileSize', () => {
  const en = createFormat('en')
  const sv = createFormat('sv')

  it('uses decimal units, so 1 kB is 1000 bytes', () => {
    expect(plain(formatFileSize(en, 1000))).toBe('1 kB')
    expect(plain(formatFileSize(en, 1_000_000))).toBe('1 MB')
    expect(plain(formatFileSize(en, 1_000_000_000))).toBe('1 GB')
  })

  it('shows one decimal for MB and GB, and for kB under 10', () => {
    expect(plain(formatFileSize(en, 2_400_000))).toBe('2.4 MB')
    expect(plain(formatFileSize(en, 9_940_000))).toBe('9.9 MB')
    expect(plain(formatFileSize(en, 14_200_000))).toBe('14.2 MB')
    expect(plain(formatFileSize(en, 350_000))).toBe('350 kB')
    expect(plain(formatFileSize(en, 1500))).toBe('1.5 kB')
  })

  it('drops a trailing zero decimal', () => {
    expect(plain(formatFileSize(en, 2_000_000))).toBe('2 MB')
  })

  it('uses the locale’s decimal separator', () => {
    expect(plain(formatFileSize(sv, 2_400_000))).toBe('2,4 MB')
    expect(plain(formatFileSize(sv, 350_000))).toBe('350 kB')
  })

  it('never shows bytes above 1 kB and never shows more than three digits', () => {
    expect(plain(formatFileSize(en, 999_999))).toBe('1 MB')
    expect(plain(formatFileSize(en, 999_940))).toBe('1 MB')
    expect(plain(formatFileSize(en, 999_400))).toBe('999 kB')
  })

  it('shows small sizes in bytes', () => {
    expect(plain(formatFileSize(en, 512))).toMatch(/^512 (B|byte)$/)
    expect(plain(formatFileSize(en, 0))).toMatch(/^0 (B|byte)$/)
  })

  it('treats a negative or non-finite size as 0', () => {
    expect(plain(formatFileSize(en, -5))).toMatch(/^0 (B|byte)$/)
    expect(plain(formatFileSize(en, Number.NaN))).toMatch(/^0 (B|byte)$/)
  })
})
