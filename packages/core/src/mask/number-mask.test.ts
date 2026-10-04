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
    expect(insert(rent, '12,50|', '1').rejected).toEqual([{ reason: 'decimals', characters: '1' }])
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

describe('number masks: a pasted separator is read as grouping only when it looks like grouping', () => {
  const nbsp = '\u00a0'
  const swedish = masks.number({ decimals: 2, locale: 'sv' })
  const english = masks.number({ decimals: 2, locale: 'en' })

  it.each([
    { mask: swedish, pasted: '12.50', after: '12,50' },
    { mask: swedish, pasted: '12,50', after: '12,50' },
    { mask: swedish, pasted: '1 250,00', after: '1250,00' },
    { mask: swedish, pasted: `1${nbsp}250,00`, after: '1250,00' },
    { mask: swedish, pasted: '1.000,50', after: '1000,50' },
    { mask: swedish, pasted: '1,250.75', after: '1250,75' },
    { mask: swedish, pasted: '1.000', after: '1000' }, // not sv's decimal mark, three digits: grouping
    { mask: english, pasted: '12.50', after: '12.50' },
    { mask: english, pasted: '1,000', after: '1000' }, // not en's decimal mark, three digits: grouping
    { mask: english, pasted: '1,250.75', after: '1250.75' },
    { mask: english, pasted: '1.000,50', after: '1000.50' },
    { mask: english, pasted: '1,234,567', after: '1234567' },
    { mask: english, pasted: '1 234 567.5', after: '1234567.5' },
    { mask: english, pasted: ' 12 ', after: '12' }, // whitespace around the number is not grouping
  ])('$pasted ends as $after without a message', ({ mask, pasted, after }) => {
    const result = mask.apply({ value: pasted, previousValue: '' })
    expect(result.value).toBe(after)
    expect(result.rejected).toEqual([])
  })

  it.each([
    // The mark is the decimal separator, so there are too many decimals: reported, never merged.
    {
      mask: english,
      pasted: '1.000',
      after: '1.00',
      rejected: [{ reason: 'decimals', characters: '0' }],
    },
    {
      mask: swedish,
      pasted: '1,000',
      after: '1,00',
      rejected: [{ reason: 'decimals', characters: '0' }],
    },
    // Not grouping, because three digits don't follow: refused, and said so.
    {
      mask: english,
      pasted: '1,25.75',
      after: '125.75',
      rejected: [{ reason: 'other', characters: ',' }],
    },
    {
      mask: english,
      pasted: '1.2.3',
      after: '12.3',
      rejected: [{ reason: 'other', characters: '.' }],
    },
    {
      mask: english,
      pasted: '12 50',
      after: '1250',
      rejected: [{ reason: 'other', characters: ' ' }],
    },
  ])('$pasted ends as $after and says what it did', ({ mask, pasted, after, rejected }) => {
    const result = mask.apply({ value: pasted, previousValue: '' })
    expect(result.value).toBe(after)
    expect(result.rejected).toEqual(rejected)
  })

  it('refuses a fraction when there are no decimals, and reports it instead of merging it', () => {
    const whole = masks.number()
    const result = whole.apply({ value: '12.50', previousValue: '' })
    expect(result.value).toBe('12')
    expect(result.rejected).toEqual([
      { reason: 'digits', characters: '.' },
      { reason: 'other', characters: '50' },
    ])
    const bankStatement = whole.withLocale('sv').apply({ value: '1 250,00', previousValue: '' })
    expect(bankStatement.value).toBe('1250')
    expect(bankStatement.rejected).toEqual([
      { reason: 'digits', characters: ',' },
      { reason: 'other', characters: '00' },
    ])
  })

  it('does not read the locale decimal mark as grouping when there are no decimals', () => {
    // "1,000" in Swedish is one, not a thousand: refuse the fraction instead of guessing.
    const result = masks.number({ locale: 'sv' }).apply({ value: '1,000', previousValue: '' })
    expect(result.value).toBe('1')
    expect(result.rejected.length).toBeGreaterThan(0)
  })

  it('reports a stray minus in pasted text, which would otherwise change the value', () => {
    expect(masks.number().apply({ value: '12-5', previousValue: '' })).toMatchObject({
      value: '125',
      rejected: [{ reason: 'digits', characters: '-' }],
    })
  })

  it('never changes the digits silently: every dropped digit or sign is reported', () => {
    const masksUnderTest = [
      masks.number(),
      masks.number({ locale: 'sv' }),
      masks.number({ decimals: 2, locale: 'sv', allowNegative: true }),
      masks.number({ decimals: 2, locale: 'en', allowNegative: true, grouping: true }),
    ]
    const pastes = [
      '12.50',
      '1 250,00',
      '1,000',
      '1.000',
      '1.000,50',
      '1,250.75',
      '12 50',
      '1,25.75',
      '1.2.3',
      '12-5',
      '--5',
      '1 234 567',
      '1,234,567.89',
      '0,5',
      '-1.5',
      '1e3',
      '12 kr',
      '1 000,5 0',
    ]
    for (const mask of masksUnderTest) {
      for (const pasted of pastes) {
        const result = mask.apply({ value: pasted, previousValue: '' })
        const pastedDigits = pasted.replace(/\D/g, '')
        const keptDigits = result.unmaskedValue.replace(/\D/g, '')
        const reported = result.rejected.map((rejection) => rejection.characters).join('')
        // Every digit of the paste is in the value or in `rejected`.
        const sortDigits = (digits: string): string => digits.split('').sort().join('')
        const accountedFor = sortDigits(keptDigits + reported.replace(/\D/g, ''))
        expect(accountedFor).toBe(sortDigits(pastedDigits))
      }
    }
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

describe('number masks: a stored value is canonical, never run through the paste heuristic', () => {
  const group = ' '

  it.each(['sv', 'fi'])('%s with three decimals formats and unmasks the stored value', (locale) => {
    const mask = masks.number({ decimals: 3, locale })
    expect(mask.format('1.500')).toBe('1,500')
    expect(mask.format('0.125')).toBe('0,125')
    expect(mask.format('1234.5')).toBe('1234,5')
    expect(mask.unmask('1,500')).toBe('1.500')
    expect(mask.unmask('0,125')).toBe('0.125')
  })

  it.each(['sv', 'fi'])('%s round-trips every stored value', (locale) => {
    const mask = masks.number({ decimals: 3, locale, allowNegative: true, grouping: true })
    for (const stored of [
      '0',
      '0.5',
      '0.125',
      '1.500',
      '12.500',
      '1234.567',
      '-1234567.5',
      '-0.001',
    ]) {
      expect(mask.unmask(mask.format(stored))).toBe(stored)
    }
    expect(mask.format('1234567.125')).toBe(`1${group}234${group}567,125`)
  })

  it('en with grouping round-trips although its group mark is also a decimal mark', () => {
    const mask = masks.number({ decimals: 2, locale: 'en', grouping: true, allowNegative: true })
    expect(mask.format('1234.5')).toBe('1,234.5')
    expect(mask.unmask('1,234.5')).toBe('1234.5')
    for (const stored of ['1', '1234', '1234567.25', '-1234.5', '0.5']) {
      expect(mask.unmask(mask.format(stored))).toBe(stored)
    }
  })
})

describe('number masks: a mark is grouping only after one to three digits that are not a lone zero', () => {
  it.each([
    {
      locale: 'sv',
      decimals: 2,
      pasted: '.500',
      after: ',50',
      rejected: [{ reason: 'decimals', characters: '0' }],
    },
    {
      locale: 'en',
      decimals: 2,
      pasted: ',500',
      after: '.50',
      rejected: [{ reason: 'decimals', characters: '0' }],
    },
    { locale: 'sv', decimals: 3, pasted: '0.500', after: '0,500', rejected: [] },
    { locale: 'en', decimals: 3, pasted: '0,500', after: '0.500', rejected: [] },
    {
      locale: 'sv',
      decimals: 3,
      pasted: '0 500',
      after: '0500',
      rejected: [{ reason: 'other', characters: ' ' }],
    },
  ])('$locale $pasted ends as $after', ({ locale, decimals, pasted, after, rejected }) => {
    const result = masks.number({ decimals, locale }).apply({ value: pasted, previousValue: '' })
    expect(result.value).toBe(after)
    expect(result.rejected).toEqual(rejected)
  })

  it('reads a mark after four digits as the decimal mark, and reports the digit that does not fit', () => {
    const result = masks
      .number({ decimals: 2, locale: 'en' })
      .apply({ value: '1234,567', previousValue: '' })
    expect(result.value).toBe('1234.56')
    expect(result.rejected).toEqual([{ reason: 'decimals', characters: '7' }])
  })
})

describe('number masks: a grouping mark the mask wrote is not read as the decimal mark', () => {
  const amount = masks.number({ decimals: 2, locale: 'en', grouping: true })

  it.each([
    { before: '1,234|', input: '4', after: '12,344|' },
    { before: '1,234|', input: '.', after: '1,234.|' },
    { before: '1,23|4', input: '5', after: '12,35|4' },
    { before: '|1,234', input: '9', after: '9|1,234' },
    { before: '1,234.5|', input: '6', after: '1,234.56|' },
  ])('typing $input into $before gives $after', ({ before, input, after }) => {
    const result = insert(amount, before, input)
    expect(showCaret(result)).toBe(after)
    expect(result.rejected).toEqual([])
  })

  it.each([
    { before: '1,234|', pasted: '56' },
    { before: '1,234|', pasted: '5.5' },
    { before: '|1,234', pasted: '56' },
    { before: '1,2|34', pasted: '56' },
  ])('pasting $pasted into $before keeps every digit', ({ before, pasted }) => {
    const result = insert(amount, before, pasted)
    expect(result.rejected).toEqual([])
    expect(result.unmaskedValue.replace(/\D/g, '')).toHaveLength(
      before.replace(/\D/g, '').length + pasted.replace(/\D/g, '').length,
    )
  })

  it('keeps the existing digits, with the decimal mark where it was', () => {
    expect(insert(amount, '1,234|', '56').value).toBe('123,456')
    expect(insert(amount, '1,234|', '5.5').value).toBe('12,345.5')
    expect(insert(amount, '1,234.5|', '6').value).toBe('1,234.56')
  })
})

describe('number masks: the same mark twice is refused, and a lone ambiguous mark is reported', () => {
  it.each([
    { locale: 'en', pasted: '1.234.5', after: '1234.5' },
    { locale: 'sv', pasted: '1,234,5', after: '1234,5' },
  ])('$locale $pasted refuses the first mark', ({ locale, pasted, after }) => {
    const result = masks.number({ decimals: 2, locale }).apply({ value: pasted, previousValue: '' })
    expect(result.value).toBe(after)
    expect(result.rejected).toEqual([{ reason: 'other', characters: pasted.charAt(1) }])
  })

  it('reads the locales own mark as the decimal mark, also with three decimals', () => {
    const swedish = masks
      .number({ decimals: 3, locale: 'sv' })
      .apply({ value: '1,500', previousValue: '' })
    expect(swedish).toMatchObject({ value: '1,500', rejected: [] })
    const english = masks
      .number({ decimals: 3, locale: 'en' })
      .apply({ value: '1.500', previousValue: '' })
    expect(english).toMatchObject({ value: '1.500', rejected: [] })
  })

  it('reports a lone foreign mark with three digits after it when three decimals could be meant', () => {
    // en "1,500" with three decimals is a thousand and a half or one and a half: ask, don't guess.
    const english = masks
      .number({ decimals: 3, locale: 'en' })
      .apply({ value: '1,500', previousValue: '' })
    expect(english.value).toBe('1500')
    expect(english.rejected).toEqual([{ reason: 'other', characters: ',' }])
    const swedish = masks
      .number({ decimals: 3, locale: 'sv' })
      .apply({ value: '1.500', previousValue: '' })
    expect(swedish.value).toBe('1500')
    expect(swedish.rejected).toEqual([{ reason: 'other', characters: '.' }])
  })

  it('still reads a lone foreign mark with three digits as grouping when there is no room for three decimals', () => {
    expect(masks.number({ decimals: 2, locale: 'en' }).apply({ value: '1,500' })).toMatchObject({
      value: '1500',
      rejected: [],
    })
  })
})

describe('number masks: no digit is dropped or scaled without being reported', () => {
  const digitsOf = (text: string): string => text.replace(/\D/g, '')
  const sorted = (text: string): string => text.split('').sort().join('')

  const numberMasks = [
    masks.number(),
    masks.number({ locale: 'sv', grouping: true }),
    masks.number({ decimals: 2, locale: 'sv' }),
    masks.number({ decimals: 2, locale: 'en' }),
    masks.number({ decimals: 2, locale: 'en', grouping: true, allowNegative: true }),
    masks.number({ decimals: 3, locale: 'sv', grouping: true }),
    masks.number({ decimals: 3, locale: 'en', grouping: true }),
  ]
  const storedValues = ['', '5', '1234', '1234567', '1234.5', '0.5', '12.5', '0.125', '1.5']
  const typed = ['4', '0', ',', '.', ' ', '-']
  const pasted = [
    '56',
    '5.5',
    '5,5',
    '1,500',
    '1.500',
    '.500',
    ',500',
    '0.500',
    '1 250,00',
    '12.50',
    '1.000,50',
    '1,250.75',
    '12 50',
    '1,25.75',
    '1.2.3',
    '1.234.5',
    '12-5',
    '1e3',
  ]

  it('keeps or reports every digit, at every caret, typed and pasted, from empty and grouped values', () => {
    const problems: string[] = []
    for (const mask of numberMasks) {
      for (const stored of storedValues) {
        const start = mask.format(stored)
        for (let caret = 0; caret <= start.length; caret += 1) {
          for (const input of [...typed, ...pasted]) {
            const before = `${start.slice(0, caret)}|${start.slice(caret)}`
            const result = insert(mask, before, input)
            const reportedDigits = digitsOf(
              result.rejected.map((rejection) => rejection.characters).join(''),
            )
            // every digit that went in is in the value or in `rejected`
            const accountedFor = sorted(digitsOf(result.unmaskedValue) + reportedDigits)
            if (accountedFor !== sorted(digitsOf(start) + digitsOf(input))) {
              problems.push(`${before} + ${input} -> ${result.value}`)
            }
          }
        }
      }
    }
    expect(problems).toEqual([])
  })

  it('never moves the decimal mark of the existing value by typing or pasting digits only', () => {
    const problems: string[] = []
    for (const mask of numberMasks) {
      for (const stored of storedValues) {
        const start = mask.format(stored)
        const unmasked = mask.unmask(start)
        const fractionLength = unmasked.includes('.')
          ? (unmasked.split('.')[1]?.length ?? 0)
          : undefined
        const decimalAt = start.indexOf(mask.format('0.5').charAt(1))
        for (let caret = 0; caret <= start.length; caret += 1) {
          for (const input of ['4', '56']) {
            const result = insert(mask, `${start.slice(0, caret)}|${start.slice(caret)}`, input)
            if (result.rejected.length > 0) continue
            const fraction = result.unmaskedValue.split('.')[1]
            // Typed into the fraction it grows. Typed into the integer part it keeps its length.
            const expected =
              fractionLength === undefined
                ? undefined
                : fractionLength + (caret > decimalAt ? input.length : 0)
            if (fraction?.length !== expected) {
              problems.push(`${mask.format(stored)} caret ${caret} + ${input} -> ${result.value}`)
            }
          }
        }
      }
    }
    expect(problems).toEqual([])
  })

  const readings = (text: string): string[] => {
    // Every way to read the text: one mark (or none) is the decimal mark, the others must be
    // grouping, which means one to three digits before and exactly three after.
    const marks = [...text.matchAll(/[.,]/g)].map((match) => match.index)
    const candidates: (number | undefined)[] = [undefined, ...marks]
    const result: string[] = []
    for (const decimalAt of candidates) {
      let valid = true
      let out = ''
      for (let index = 0; index < text.length; index += 1) {
        const character = text.charAt(index)
        if (/[.,]/.test(character)) {
          if (index === decimalAt) {
            out += '.'
          } else {
            const digitsAfter = /^\d*/.exec(text.slice(index + 1))?.[0].length ?? 0
            const digitsBefore = /\d*$/.exec(text.slice(0, index))?.[0].length ?? 0
            if (digitsAfter !== 3 || digitsBefore < 1 || digitsBefore > 3) valid = false
          }
        } else if (/\d/.test(character)) {
          out += character
        }
      }
      if (valid) result.push(out)
    }
    return result
  }

  it('reads a paste into an empty field one way that a person would, or reports it', () => {
    const problems: string[] = []
    for (const mask of numberMasks) {
      for (const input of pasted) {
        const result = insert(mask, '|', input)
        const plain = input.replace(/\s/g, '')
        if (result.rejected.length > 0 || !/^[\d.,]+$/.test(plain)) continue
        if (!readings(plain).includes(result.unmaskedValue)) {
          problems.push(`${input} -> ${result.unmaskedValue}`)
        }
      }
    }
    expect(problems).toEqual([])
  })
})

describe('number masks: round numbers and the displayed value can be pasted back', () => {
  const thinSpace = ' '
  const group = ' '

  const roundNumbers = [
    '1,000,000',
    '1.000.000',
    '1 000 000',
    `1${group}000${group}000`,
    `1${thinSpace}000${thinSpace}000`,
    '1,000,000.00',
    '1.000.000,00',
    `1${group}000${group}000,00`,
    '1,000,000,000',
    '2,000,000',
  ]

  const configurations = ['en', 'sv', 'fi', 'nb'].flatMap((locale) =>
    [0, 2, 3, 4].map((decimals) => ({ locale, decimals })),
  )

  it('reads every group of exactly three digits as grouping, also 000', () => {
    const problems: string[] = []
    for (const { locale, decimals } of configurations) {
      const mask = masks.number({ locale, decimals })
      for (const pasted of roundNumbers) {
        const result = mask.apply({ value: pasted, previousValue: '' })
        const integer = pasted.replace(/[^\d,.]/g, '').split(/[.,](?=\d{2}$)/u)[0] ?? ''
        const expectedInteger = integer.replace(/\D/g, '')
        const hasFraction =
          /[.,]\d{2}$/.test(pasted.replace(/\s/g, '')) && /[.,]00$/.test(pasted.replace(/\s/g, ''))
        const [whole = '', fraction] = result.unmaskedValue.split('.')
        const fractionIsRefused = hasFraction && decimals === 0
        if (whole !== expectedInteger)
          problems.push(`${locale} d${decimals} ${pasted} -> ${result.unmaskedValue}`)
        if (!fractionIsRefused && result.rejected.length > 0) {
          problems.push(
            `${locale} d${decimals} ${pasted} reports ${JSON.stringify(result.rejected)}`,
          )
        }
        if (hasFraction && decimals > 0 && fraction !== '00') {
          problems.push(
            `${locale} d${decimals} ${pasted} lost the fraction: ${result.unmaskedValue}`,
          )
        }
        if (fractionIsRefused && result.rejected.length === 0) {
          problems.push(`${locale} d${decimals} ${pasted} dropped the fraction silently`)
        }
      }
    }
    expect(problems).toEqual([])
  })

  it('does not count whitespace before the number as grouping', () => {
    const mask = masks.number({ locale: 'en' })
    expect(mask.apply({ value: ' 1 000 ', previousValue: '' })).toMatchObject({
      unmaskedValue: '1000',
      rejected: [],
    })
    expect(mask.apply({ value: '  1,000,000  ', previousValue: '' })).toMatchObject({
      unmaskedValue: '1000000',
      rejected: [],
    })
  })

  it('still reads a lead group of zeros as a fraction', () => {
    const result = masks
      .number({ decimals: 3, locale: 'en' })
      .apply({ value: '0,000', previousValue: '' })
    expect(result.unmaskedValue).toBe('0.000')
    expect(result.rejected).toEqual([])
    expect(
      masks.number({ decimals: 3, locale: 'en' }).apply({ value: '000.500', previousValue: '' })
        .unmaskedValue,
    ).toBe('000.500')
  })

  it('gives the same value back when the mask’s own output is pasted into an empty field', () => {
    const stored = [
      '0',
      '5',
      '1000',
      '1234.5',
      '1000000',
      '2000000',
      '1500',
      '12500',
      '0.125',
      '1000000.5',
      '12.500',
      '1000.000',
      '100000000',
    ]
    const problems: string[] = []
    for (const { locale, decimals } of configurations) {
      for (const grouping of [false, true]) {
        for (const allowNegative of [false, true]) {
          const mask = masks.number({ locale, decimals, grouping, allowNegative })
          for (const value of [
            ...stored,
            ...(allowNegative ? stored.map((item) => `-${item}`) : []),
          ]) {
            const fractionLength = value.split('.')[1]?.length ?? 0
            if (fractionLength > decimals) continue
            const displayed = mask.format(value)
            const result = mask.apply({ value: displayed, previousValue: '' })
            const label = `${locale} d${decimals} grouping:${grouping} ${value} shown as ${displayed}`
            if (result.unmaskedValue !== value) problems.push(`${label} -> ${result.unmaskedValue}`)
            if (result.rejected.length > 0)
              problems.push(`${label} reports ${JSON.stringify(result.rejected)}`)
          }
        }
      }
    }
    expect(problems).toEqual([])
  })

  it('pastes a displayed grouped value over existing text in the same way', () => {
    const mask = masks.number({ locale: 'en', grouping: true })
    expect(insert(mask, '|', '2,000,000')).toMatchObject({ value: '2,000,000', rejected: [] })
  })
})

describe('number masks: the digits before a pasted mark count, also those already in the field', () => {
  const amount = masks.number({ decimals: 2, locale: 'en', grouping: true })

  it('reads ,000 pasted after 1,234 as another group', () => {
    const result = insert(amount, '1,234|', ',000')
    expect(result.value).toBe('1,234,000')
    expect(result.rejected).toEqual([])
  })

  it('reads ,000 pasted after 1234 as a fraction, and reports the digit that does not fit', () => {
    const result = insert(masks.number({ decimals: 2, locale: 'en' }), '1234|', ',000')
    expect(result.value).toBe('1234.00')
    expect(result.rejected).toEqual([{ reason: 'decimals', characters: '0' }])
  })
})

describe('number masks: a refusal that is not about length is not reported as length', () => {
  const amount = masks.number({ decimals: 2, locale: 'en', grouping: true, allowNegative: true })

  it.each([
    { before: '1,|100', input: '.' },
    { before: '|-11,000', input: '-' },
    { before: '|500', input: '1,' },
  ])('$input into $before is other', ({ before, input }) => {
    const result = insert(amount, before, input)
    expect(result.rejected.length).toBeGreaterThan(0)
    expect(result.rejected.every((rejection) => rejection.reason !== 'decimals')).toBe(true)
  })

  it('says decimals for a digit that does not fit', () => {
    expect(insert(amount, '12.5|0', '1').rejected).toEqual([
      { reason: 'decimals', characters: '1' },
    ])
  })
})

describe('number masks: format stops at the first character that is not canonical', () => {
  it('does not merge digits across a mark that is not the stored decimal mark', () => {
    expect(masks.number({ decimals: 2, locale: 'sv' }).format('1,5')).toBe('1')
    expect(masks.number({ decimals: 3, locale: 'en' }).format('1,500')).toBe('1')
    expect(masks.number({ decimals: 2, locale: 'sv' }).format('1.5')).toBe('1,5')
  })
})
