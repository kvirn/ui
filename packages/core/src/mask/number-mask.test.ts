import { describe, expect, it } from 'vite-plus/test'
import { masks } from './masks.ts'
import { insert, remove, showCaret } from './mask-test-support.ts'

const nbsp = ' '

describe('number masks: locale separators', () => {
  it.each(['sv', 'fi', 'nb', 'nn', 'se'])('%s shows a comma', (locale) => {
    const mask = masks.number({ decimals: 2, locale })
    expect(mask.apply({ value: '12.5', previousValue: '' }).value).toBe('12,5')
    expect(mask.apply({ value: '12,5', previousValue: '' }).value).toBe('12,5')
  })

  it('en shows a point, and accepts a comma as typed', () => {
    const mask = masks.number({ decimals: 2, locale: 'en' })
    expect(mask.apply({ value: '12,5', previousValue: '' }).value).toBe('12.5')
    expect(mask.apply({ value: '12.5', previousValue: '' }).value).toBe('12.5')
  })

  it('falls back to en for a locale the runtime does not know, not to the machine locale', () => {
    const mask = masks.number({ decimals: 1, locale: 'xx-not-a-locale' })
    expect(mask.apply({ value: '1,5', previousValue: '' }).value).toBe('1.5')
  })

  it('takes the locale from withLocale, unless the definition has its own', () => {
    const number = masks.number({ decimals: 1 })
    expect(number.apply({ value: '1.5' }).value).toBe('1.5')
    expect(number.withLocale('sv').apply({ value: '1.5' }).value).toBe('1,5')
    const pinned = masks.number({ decimals: 1, locale: 'en' })
    expect(pinned.withLocale('sv')).toBe(pinned)
  })

  it.each([
    { locale: 'sv', group: nbsp },
    { locale: 'fi', group: nbsp },
    { locale: 'nb', group: nbsp },
    { locale: 'en', group: ',' },
  ])('groups with the separator of $locale only when asked to', ({ locale, group }) => {
    const grouped = masks.number({ locale, grouping: true })
    expect(grouped.apply({ value: '1234567', previousValue: '' }).value).toBe(
      `1${group}234${group}567`,
    )
    const plain = masks.number({ locale })
    expect(plain.apply({ value: '1234567', previousValue: '' }).value).toBe('1234567')
  })

  it('unmasks to the plain machine form, whatever the locale', () => {
    const mask = masks.number({ decimals: 2, locale: 'sv', grouping: true, allowNegative: true })
    expect(mask.unmask(`-1${nbsp}234,5`)).toBe('-1234.5')
    expect(mask.format('-1234.5')).toBe(`-1${nbsp}234,5`)
  })
})

describe('number masks: typing', () => {
  const rent = masks.number({ decimals: 2, locale: 'sv' })

  it.each([
    { before: '|', input: '1', after: '1|' },
    { before: '12|', input: ',', after: '12,|' },
    { before: '12|', input: '.', after: '12,|' }, // a point is shown as the locale's comma
    { before: '12,|', input: '5', after: '12,5|' },
    { before: '12,5|', input: '0', after: '12,50|' },
    { before: '1|2,50', input: '3', after: '13|2,50' },
  ])('$before + $input → $after', ({ before, input, after }) => {
    expect(showCaret(insert(rent, before, input))).toBe(after)
  })

  it('keeps leading zeros and a leading separator, and does not rewrite what the user typed', () => {
    expect(rent.apply({ value: '007', previousValue: '' }).value).toBe('007')
    expect(rent.apply({ value: ',5', previousValue: '' }).value).toBe(',5')
    expect(rent.apply({ value: ',5', previousValue: '' }).unmaskedValue).toBe('.5')
  })

  it('refuses a second separator, too many decimals and letters, and says why', () => {
    expect(insert(rent, '12,5|', ',').rejected).toEqual([{ reason: 'other', characters: ',' }])
    expect(insert(rent, '12,50|', '1').rejected).toEqual([{ reason: 'length', characters: '1' }])
    expect(insert(rent, '12|', 'k').rejected).toEqual([{ reason: 'digits', characters: 'k' }])
  })

  it('accepts no separator when there are no decimals', () => {
    const whole = masks.number()
    expect(insert(whole, '12|', ',').rejected).toEqual([{ reason: 'digits', characters: ',' }])
    expect(whole.apply({ value: '1,000', previousValue: '' }).value).toBe('1000')
  })

  it('accepts a minus only first, and only when negative numbers are allowed', () => {
    const signed = masks.number({ allowNegative: true, locale: 'sv' })
    expect(showCaret(insert(signed, '|', '-'))).toBe('-|')
    expect(signed.apply({ value: '−12', previousValue: '' }).value).toBe('-12')
    expect(insert(signed, '1|', '-').rejected).toEqual([{ reason: 'other', characters: '-' }])
    expect(insert(masks.number(), '|', '-').rejected).toEqual([
      { reason: 'digits', characters: '-' },
    ])
  })

  it('refuses a space that the user types alone, and says so', () => {
    expect(insert(rent, '1|', ' ').rejected).toEqual([{ reason: 'other', characters: ' ' }])
  })
})

describe('number masks: paste', () => {
  const amount = masks.number({ decimals: 2, locale: 'sv', allowNegative: true })

  it.each([
    { pasted: '1234,56', after: '1234,56' },
    { pasted: '1234.56', after: '1234,56' },
    { pasted: `1${nbsp}234,56`, after: '1234,56' },
    { pasted: '1 234,56', after: '1234,56' },
    { pasted: '1,234.56', after: '1234,56' },
    { pasted: '1.234,56', after: '1234,56' },
    { pasted: '1 234 567', after: '1234567' },
    { pasted: '1.234.567', after: '1234567' },
    { pasted: '1,5', after: '1,5' },
    { pasted: '−5', after: '-5' },
  ])('$pasted ends as $after, without a message', ({ pasted, after }) => {
    const result = amount.apply({ value: pasted, previousValue: '' })
    expect(result.value).toBe(after)
    expect(result.rejected).toEqual([])
  })
})

describe('number masks: grouping and the caret', () => {
  const grouped = masks.number({ locale: 'sv', grouping: true })

  it('puts the caret after the digit that was typed, across the separator', () => {
    expect(showCaret(insert(grouped, `123|`, '4'))).toBe(`1${nbsp}234|`)
    expect(showCaret(insert(grouped, `1${nbsp}234|`, '5'))).toBe(`12${nbsp}345|`)
    expect(showCaret(insert(grouped, `1${nbsp}2|34`, '9'))).toBe(`12${nbsp}9|34`)
  })

  it('makes progress when Backspace removes a grouping separator', () => {
    const result = remove(grouped, `1${nbsp}|234`)
    expect(showCaret(result)).toBe(`|234`)
  })
})

describe('number masks: min and max are reported, never clamped', () => {
  const percent = masks.number({ decimals: 1, locale: 'sv', min: 0, max: 100, allowNegative: true })

  it.each([
    { value: '50', isWithinRange: true },
    { value: '0', isWithinRange: true },
    { value: '100', isWithinRange: true },
    { value: '100,1', isWithinRange: false },
    { value: '1500', isWithinRange: false },
    { value: '-1', isWithinRange: false },
    { value: '', isWithinRange: true }, // nothing entered is not out of range
    { value: '-', isWithinRange: true },
  ])('$value → isWithinRange $isWithinRange', ({ value, isWithinRange }) => {
    expect(percent.apply({ value, previousValue: '' }).isWithinRange).toBe(isWithinRange)
  })

  it('leaves the value as typed, so "1" stays "1" on the way to "15"', () => {
    const atLeastTen = masks.number({ min: 10, max: 99 })
    const first = atLeastTen.apply({ value: '1', selectionStart: 1, previousValue: '' })
    expect(first.value).toBe('1')
    expect(first.isWithinRange).toBe(false)
    const second = insert(atLeastTen, '1|', '5')
    expect(second.value).toBe('15')
    expect(second.isWithinRange).toBe(true)
  })

  it('reports isWithinRange true for a number mask without limits, and not at all for others', () => {
    expect(masks.number().apply({ value: '5' }).isWithinRange).toBe(true)
    expect(masks.digits().apply({ value: '5' }).isWithinRange).toBeUndefined()
  })
})

describe('number masks: isComplete', () => {
  const mask = masks.number({ decimals: 2, allowNegative: true })

  it.each([
    { value: '12', isComplete: true },
    { value: '12.5', isComplete: true },
    { value: '12.', isComplete: false },
    { value: '-', isComplete: false },
    { value: '.5', isComplete: true },
    { value: '', isComplete: false },
  ])('$value → $isComplete', ({ value, isComplete }) => {
    expect(mask.apply({ value, previousValue: '' }).isComplete).toBe(isComplete)
  })
})
