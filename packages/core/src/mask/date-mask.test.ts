import { describe, expect, it } from 'vite-plus/test'
import { masks } from './masks.ts'
import { insert, remove, showCaret } from './mask-test-support.ts'
import type { Mask } from './mask-types.ts'

// One key at a time, with the caret at the end, as a person types.
function type(mask: Mask, text: string): string {
  let value = ''
  for (const character of text) value = insert(mask, `${value}|`, character).value
  return value
}

const pasted = (mask: Mask, value: string) => mask.apply({ value, previousValue: '' })

describe('masks.date: order and separator follow the locale', () => {
  it.each([
    { locale: 'fi', typed: '04102026', shown: '04.10.2026' },
    { locale: 'nb', typed: '04102026', shown: '04.10.2026' },
    { locale: 'nn', typed: '04102026', shown: '04.10.2026' },
    { locale: 'en-GB', typed: '04102026', shown: '04/10/2026' },
    { locale: 'en', typed: '04102026', shown: '04/10/2026' },
    { locale: 'sv', typed: '20261004', shown: '2026-10-04' },
    { locale: 'sv-SE', typed: '20261004', shown: '2026-10-04' },
  ])('$locale shows $shown', ({ locale, typed, shown }) => {
    const mask = masks.date({ locale })
    expect(type(mask, typed)).toBe(shown)
    expect(pasted(mask, typed).value).toBe(shown)
  })

  it('falls back to en for a locale the runtime does not know, not to the machine locale', () => {
    expect(type(masks.date({ locale: 'xx-not-a-locale' }), '04102026')).toBe('04/10/2026')
  })

  it('suggests a numeric keypad and no spell checking', () => {
    expect(masks.date().attributes).toEqual({ inputMode: 'numeric', spellCheck: false })
  })
})

describe('masks.date: the separator is written when the next part starts', () => {
  const mask = masks.date({ locale: 'fi' })

  it.each([
    { typed: '0', shown: '0' },
    { typed: '04', shown: '04' },
    { typed: '041', shown: '04.1' },
    { typed: '0410', shown: '04.10' },
    { typed: '04102', shown: '04.10.2' },
    { typed: '04102026', shown: '04.10.2026' },
  ])('$typed shows $shown', ({ typed, shown }) => {
    expect(type(mask, typed)).toBe(shown)
  })

  it('puts the caret after the digit that was typed', () => {
    expect(showCaret(insert(mask, '04|', '1'))).toBe('04.1|')
  })

  it('keeps the existing date when a digit is typed into a full field, and says it is full', () => {
    const result = insert(mask, '|04.10.2026', '5')
    expect(result.value).toBe('04.10.2026')
    expect(result.rejected).toEqual([{ reason: 'length', characters: '5' }])
    const atEnd = insert(mask, '04.10.2026|', '5')
    expect(atEnd.value).toBe('04.10.2026')
    expect(atEnd.rejected).toEqual([{ reason: 'length', characters: '5' }])
  })

  it('rejects a letter as not a digit', () => {
    const result = insert(mask, '04|', 'a')
    expect(result.value).toBe('04')
    expect(result.rejected).toEqual([{ reason: 'digits', characters: 'a' }])
  })
})

describe('masks.date: a separator closes a short day or month', () => {
  const mask = masks.date({ locale: 'fi' })

  it('keeps a day and a month as typed, and pads them only in the unmasked value', () => {
    expect(type(mask, '4.10.2026')).toBe('4.10.2026')
    expect(type(mask, '4.1.2026')).toBe('4.1.2026')
    const result = pasted(mask, '4.1.2026')
    expect(result.unmaskedValue).toBe('2026-01-04')
    expect(result.isComplete).toBe(true)
  })

  it.each(['.', '-', '/', ' '])('"%s" is written as the locale’s separator', (character) => {
    expect(insert(mask, '4|', character).value).toBe('4.')
    expect(showCaret(insert(mask, '4|', character))).toBe('4.|')
    expect(insert(mask, '4.1|', character).value).toBe('4.1.')
    expect(insert(mask, '4.1|', character).rejected).toEqual([])
  })

  it('accepts the separator after a full part once, as the pattern engine does', () => {
    expect(insert(mask, '04|', '.').value).toBe('04.')
    expect(insert(mask, '04|', '.').rejected).toEqual([])
    expect(insert(mask, '04.10|', '/').value).toBe('04.10.')
  })

  it('writes sv’s separator for a point, and the digits after a short month', () => {
    const sv = masks.date({ locale: 'sv' })
    expect(insert(sv, '2026|', '.').value).toBe('2026-')
    expect(type(sv, '2026-1-4')).toBe('2026-1-4')
    expect(pasted(sv, '2026-1-4').unmaskedValue).toBe('2026-01-04')
  })

  it('writes en-GB’s separator for a point', () => {
    expect(insert(masks.date({ locale: 'en-GB' }), '4|', '.').value).toBe('4/')
  })

  it.each([
    { before: '|', input: '.', what: 'an empty part' },
    { before: '|', input: ' ', what: 'an empty part' },
    { before: '4.|', input: '.', what: 'a second separator in a row' },
    { before: '04.|', input: '-', what: 'a second separator in a row' },
    { before: '04.10.|', input: '.', what: 'an empty year' },
    { before: '04.10.20|', input: '.', what: 'a year with fewer than four digits' },
    { before: '04.10.2026|', input: '.', what: 'after the last part' },
    { before: '04.10.2026|', input: ' ', what: 'after the last part' },
  ])('rejects a separator in $what (reason other)', ({ before, input }) => {
    const result = insert(mask, before, input)
    expect(result.rejected).toEqual([{ reason: 'other', characters: input }])
    expect(result.value).toBe(before.replace('|', ''))
  })

  it('rejects a separator after a year that is not four digits in sv, and after the day', () => {
    const sv = masks.date({ locale: 'sv' })
    expect(insert(sv, '20|', '-').rejected).toEqual([{ reason: 'other', characters: '-' }])
    expect(insert(sv, '2026-10-0|', '-').rejected).toEqual([{ reason: 'other', characters: '-' }])
  })

  it.each([',', '_', '('])('rejects "%s" as another separator (reason other)', (character) => {
    const result = insert(mask, '04|', character)
    expect(result.value).toBe('04')
    expect(result.rejected).toEqual([{ reason: 'other', characters: character }])
  })
})

describe('masks.date: paste, drop and autofill', () => {
  it.each([
    { locale: 'fi', shown: '04.10.2026' },
    { locale: 'sv', shown: '2026-10-04' },
    { locale: 'en-GB', shown: '04/10/2026' },
  ])('reformats an ISO date for $locale as $shown', ({ locale, shown }) => {
    const mask = masks.date({ locale })
    const result = pasted(mask, '2026-10-04')
    expect(result.value).toBe(shown)
    expect(result.unmaskedValue).toBe('2026-10-04')
    expect(result.isComplete).toBe(true)
    expect(result.rejected).toEqual([])
    // Autofill has no previous value: the whole value counts as inserted.
    expect(mask.apply({ value: '2026-10-04' }).value).toBe(shown)
  })

  it('reformats an ISO date with one-digit parts, padded in the unmasked value only', () => {
    const result = pasted(masks.date({ locale: 'fi' }), '2026-1-4')
    expect(result.value).toBe('4.1.2026')
    expect(result.unmaskedValue).toBe('2026-01-04')
    expect(result.rejected).toEqual([])
  })

  it('reformats an ISO date with spaces around it, and puts the caret after it', () => {
    const result = pasted(masks.date({ locale: 'fi' }), ' 2026-10-04 ')
    expect(result.value).toBe('04.10.2026')
    expect(showCaret(result)).toBe('04.10.2026|')
    expect(result.rejected).toEqual([])
  })

  it('reformats an ISO date pasted over a date that is already there', () => {
    const mask = masks.date({ locale: 'fi' })
    const result = mask.apply({
      value: '2026-12-24',
      previousValue: '04.10.2026',
      selectionStart: 10,
      selectionEnd: 10,
    })
    expect(result.value).toBe('24.12.2026')
  })

  it('reads eight digits in the locale’s order', () => {
    expect(pasted(masks.date({ locale: 'fi' }), '04102026').value).toBe('04.10.2026')
    expect(pasted(masks.date({ locale: 'sv' }), '20261004').value).toBe('2026-10-04')
    expect(pasted(masks.date({ locale: 'en-GB' }), '04102026').unmaskedValue).toBe('2026-10-04')
  })

  it('takes a pasted date with another separator, short parts included', () => {
    const mask = masks.date({ locale: 'fi' })
    expect(pasted(mask, '04/10/2026').value).toBe('04.10.2026')
    expect(pasted(mask, '4-10-2026').value).toBe('4.10.2026')
    expect(pasted(mask, '4-10-2026').unmaskedValue).toBe('2026-10-04')
  })

  it('drops pasted whitespace around a date without saying anything', () => {
    const result = pasted(masks.date({ locale: 'fi' }), ' 04.10.2026 ')
    expect(result.value).toBe('04.10.2026')
    expect(result.rejected).toEqual([])
  })

  it('says what a pasted letter was', () => {
    const result = pasted(masks.date({ locale: 'fi' }), '04.10.20x6')
    expect(result.rejected).toEqual([{ reason: 'digits', characters: 'x' }])
  })
})

describe('masks.date: values', () => {
  const mask = masks.date({ locale: 'fi' })

  it('is complete once all three parts have digits and the year has four', () => {
    expect(pasted(mask, '4.10.2026').isComplete).toBe(true)
    expect(pasted(mask, '04.10.202').isComplete).toBe(false)
    expect(pasted(mask, '04.10').isComplete).toBe(false)
    expect(pasted(mask, '04.10.').isComplete).toBe(false)
    expect(pasted(mask, '').isComplete).toBe(false)
  })

  it('has the padded ISO date as the unmasked value once complete, else an empty string', () => {
    expect(pasted(mask, '04.10.2026').unmaskedValue).toBe('2026-10-04')
    expect(pasted(mask, '4.1.2026').unmaskedValue).toBe('2026-01-04')
    expect(pasted(mask, '04.10.202').unmaskedValue).toBe('')
    expect(mask.unmask('04.10.2026')).toBe('2026-10-04')
    expect(mask.unmask('4.1.2026')).toBe('2026-01-04')
    expect(mask.unmask('04.10')).toBe('')
    expect(masks.date({ locale: 'sv' }).unmask('2026-10-04')).toBe('2026-10-04')
  })

  it('checks the shape only: 31.02.2026 is complete', () => {
    const result = pasted(mask, '31.02.2026')
    expect(result.isComplete).toBe(true)
    expect(result.unmaskedValue).toBe('2026-02-31')
    expect(result.isWithinRange).toBeUndefined()
  })

  it('formats an ISO date in the locale’s form, padded', () => {
    expect(mask.format('2026-10-04')).toBe('04.10.2026')
    expect(masks.date({ locale: 'sv' }).format('2026-10-04')).toBe('2026-10-04')
    expect(masks.date({ locale: 'en-GB' }).format('2026-01-04')).toBe('04/01/2026')
    expect(mask.format('')).toBe('')
  })
})

describe('masks.date: deleting', () => {
  const mask = masks.date({ locale: 'fi' })

  it('removes the separator the mask wrote, then the digit before it', () => {
    expect(remove(mask, '04.1|').value).toBe('04.')
    expect(remove(mask, '04.|').value).toBe('04')
    expect(remove(mask, '04|').value).toBe('0')
  })

  it('makes progress when only a separator was deleted', () => {
    expect(remove(mask, '04.|10.2026').value).toBe('0.10.2026')
  })
})

describe('masks.date: withLocale', () => {
  it('follows the provider’s locale when the mask has none of its own', () => {
    const mask = masks.date()
    expect(type(mask, '04102026')).toBe('04/10/2026')
    expect(type(mask.withLocale('fi'), '04102026')).toBe('04.10.2026')
    expect(type(mask.withLocale('sv'), '20261004')).toBe('2026-10-04')
    expect(mask.withLocale('fi').unmask('04.10.2026')).toBe('2026-10-04')
    expect(mask.withLocale('sv').attributes).toEqual({ inputMode: 'numeric', spellCheck: false })
  })

  it('keeps its own locale', () => {
    const pinned = masks.date({ locale: 'fi' })
    expect(pinned.withLocale('sv')).toBe(pinned)
  })
})
