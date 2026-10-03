import { describe, expect, it } from 'vite-plus/test'
import { createMask } from './create-mask.ts'
import { masks } from './masks.ts'
import { insert, remove, showCaret } from './mask-test-support.ts'

const postalCode = masks.pattern('999 99')
const caseNumber = masks.pattern('aa-9999')
const personalIdentityNumber = masks.personalIdentityNumber({ country: 'SE' })

describe('rule 1: no placeholder characters, literals appear when the user types past them', () => {
  it.each([
    { before: '|', input: '1', after: '1|' },
    { before: '1|', input: '2', after: '12|' },
    { before: '12|', input: '3', after: '123|' }, // no trailing literal yet
    { before: '123|', input: '4', after: '123 4|' }, // the literal arrives with the next digit
    { before: '123 4|', input: '5', after: '123 45|' },
  ])('$before + $input → $after', ({ before, input, after }) => {
    expect(showCaret(insert(postalCode, before, input))).toBe(after)
  })

  it('never puts a placeholder in the value, and an empty field is empty', () => {
    expect(postalCode.apply({ value: '', previousValue: '' }).value).toBe('')
    expect(caseNumber.apply({ value: 'ab', selectionStart: 2, previousValue: 'a' }).value).toBe(
      'ab',
    )
  })
})

describe('rule 2: a typed literal is accepted and not doubled', () => {
  it.each([
    { before: '123|', input: ' ', after: '123 |' },
    { before: '123 |', input: ' ', after: '123 |' }, // the second space is refused, not doubled
    { before: 'ab|', input: '-', after: 'ab-|' },
    { before: 'ab-|', input: '-', after: 'ab-|' },
    { before: '19900101|', input: '-', after: '19900101-|' },
  ])('$before + $input → $after', ({ before, input, after }) => {
    const mask = before.startsWith('ab')
      ? caseNumber
      : before.startsWith('1990')
        ? personalIdentityNumber
        : postalCode
    expect(showCaret(insert(mask, before, input))).toBe(after)
  })

  it('goes on typing after an accepted literal without a second one', () => {
    expect(showCaret(insert(postalCode, '123 |', '4'))).toBe('123 4|')
  })
})

describe('rule 3: paste, drop, autofill and dictation are normalised', () => {
  it.each([
    '19900101-1234',
    '199001011234',
    '19900101 1234',
    '1990-01-01-1234',
    '1990 0101 1234',
    '19900101/1234',
  ])('%s ends as 19900101-1234', (pasted) => {
    const result = personalIdentityNumber.apply({ value: pasted, previousValue: '' })
    expect(result.value).toBe('19900101-1234')
    expect(result.unmaskedValue).toBe('199001011234')
    expect(result.isComplete).toBe(true)
    expect(result.rejected).toEqual([])
  })

  it.each([
    { pasted: '12345', after: '123 45' },
    { pasted: '123 45', after: '123 45' },
    { pasted: '123-45', after: '123 45' },
    { pasted: ' 123  45 ', after: '123 45' },
  ])('postal code $pasted ends as $after', ({ pasted, after }) => {
    expect(postalCode.apply({ value: pasted, previousValue: '' }).value).toBe(after)
  })

  it('works on a stored value without a previous value (autofill)', () => {
    expect(postalCode.apply({ value: '12345' }).value).toBe('123 45')
    expect(postalCode.format('12345')).toBe('123 45')
    expect(postalCode.unmask('123 45')).toBe('12345')
  })

  it('puts the caret after the pasted text', () => {
    expect(showCaret(insert(postalCode, '|', '12345'))).toBe('123 45|')
    expect(showCaret(insert(postalCode, '12|', '345'))).toBe('123 45|')
  })

  it('drops letters in a pasted number and says so, but drops the separators silently', () => {
    const result = insert(postalCode, '|', '12a-345')
    expect(result.value).toBe('123 45')
    expect(result.rejected).toEqual([{ reason: 'digits', characters: 'a' }])
  })
})

describe('rule 4: nothing is cut before the value is normalised', () => {
  it('accepts a pasted value that is longer than the formatted mask', () => {
    // 15 characters, longer than the 13 of 19900101-1234: a native maxlength would cut it.
    const result = personalIdentityNumber.apply({ value: '1990-01-01-1234', previousValue: '' })
    expect(result.value).toBe('19900101-1234')
    expect(result.rejected).toEqual([])
  })

  it('reports what does not fit after normalising, as length', () => {
    const result = insert(postalCode, '|', '1234567')
    expect(result.value).toBe('123 45')
    expect(result.rejected).toEqual([{ reason: 'length', characters: '67' }])
  })

  it('refuses a typed character when the mask is full, and keeps the value', () => {
    const result = insert(postalCode, '123 45|', '6')
    expect(showCaret(result)).toBe('123 45|')
    expect(result.rejected).toEqual([{ reason: 'length', characters: '6' }])
  })

  it('refuses a character typed in the middle of a full value instead of cutting the end', () => {
    const result = insert(postalCode, '12|3 45', '9')
    expect(showCaret(result)).toBe('12|3 45')
    expect(result.rejected).toEqual([{ reason: 'length', characters: '9' }])
  })
})

describe('rule 6: the caret stays with the character the user typed', () => {
  it.each([
    { before: '123|', input: '4', after: '123 4|' }, // a literal is inserted before the typed one
    { before: '1|23 4', input: '9', after: '19|2 34' }, // the literal moves, the caret follows
    { before: '|123 4', input: '9', after: '9|12 34' },
    { before: '123 |4', input: '9', after: '123 9|4' },
  ])('$before + $input → $after', ({ before, input, after }) => {
    expect(showCaret(insert(postalCode, before, input))).toBe(after)
  })

  it('keeps the caret where the browser had it when nothing changed', () => {
    const result = insert(postalCode, '12|', '3')
    expect(result.isChanged).toBe(false)
    expect(result.selectionStart).toBe(3)
  })

  it('maps a selection replaced by a paste', () => {
    // 123 45 with "23 4" selected, replaced by "99"
    const result = postalCode.apply({
      value: '1995',
      selectionStart: 3,
      selectionEnd: 3,
      previousValue: '123 45',
    })
    // the caret follows the typed character, and the literal comes after it
    expect(showCaret(result)).toBe('199| 5')
  })
})

describe('rule 6: Backspace and Delete always make progress', () => {
  it.each([
    // Backspace right after a literal the mask would put back also removes the digit before it
    { before: '123 |4', after: '12|4' },
    { before: '123 4|', after: '123 |' }, // the typed literal stays until the next Backspace
    { before: '123 45|', after: '123 4|' },
    { before: '12|3 45', after: '1|34 5' }, // the digits after the caret move up
    { before: '123 |', after: '123|' },
  ])('Backspace in $before → $after', ({ before, after }) => {
    const result = remove(postalCode, before)
    expect(result.value).not.toBe(before.replace('|', ''))
    expect(showCaret(result)).toBe(after)
  })

  it('Delete before a literal removes the digit after it', () => {
    // 123| 45: Delete would remove the space and the mask would put it back
    const result = remove(postalCode, '123| 45', 'forward')
    expect(showCaret(result)).toBe('123| 5')
  })

  it('Backspace over a literal in a personal identity number', () => {
    // the mask would put the - back, so the 1 before it goes instead
    expect(showCaret(remove(personalIdentityNumber, '19900101-|1234'))).toBe('1990010|1-234')
  })

  it('does nothing more at the start of the value', () => {
    const result = remove(postalCode, '|123 4', 'backward')
    expect(result.value).toBe('123 4')
  })

  it('keeps the rest of the value when a selection is deleted', () => {
    // "23 " selected in 123 45
    expect(showCaret(remove(postalCode, '1|23 45', 'backward', 3))).toBe('1|45')
  })
})

describe('rule 7: the value is only written back when the mask changed it', () => {
  it.each([
    { before: '|', input: '1', changed: false },
    { before: '1|', input: '2', changed: false },
    { before: '12|', input: '3', changed: false },
    { before: '123|', input: '4', changed: true }, // a literal was inserted
    { before: '|', input: '1 2', changed: true }, // a space was dropped
    { before: '|', input: 'a', changed: true }, // a letter was dropped
  ])('$before + $input changed: $changed', ({ before, input, changed }) => {
    expect(insert(postalCode, before, input).isChanged).toBe(changed)
  })

  it('returns the caret the browser reported when it is unchanged', () => {
    const result = postalCode.apply({
      value: '12',
      selectionStart: 1,
      selectionEnd: 1,
      previousValue: '1',
    })
    expect(result).toMatchObject({ isChanged: false, selectionStart: 1, selectionEnd: 1 })
  })
})

describe('rejected reasons', () => {
  it('says digits for a letter in a digit position', () => {
    expect(insert(postalCode, '12|', 'x').rejected).toEqual([{ reason: 'digits', characters: 'x' }])
  })

  it('says letters for a digit in a letter position', () => {
    expect(insert(caseNumber, '|', '5').rejected).toEqual([{ reason: 'letters', characters: '5' }])
  })

  it('says lettersAndDigits for a symbol where either is allowed', () => {
    const mask = masks.pattern('***')
    expect(insert(mask, 'a|', '#').rejected).toEqual([
      { reason: 'lettersAndDigits', characters: '#' },
    ])
  })

  it('says other for a regular expression', () => {
    const mask = masks.regexp(/^[A-C]*$/)
    expect(insert(mask, 'A|', 'x').rejected).toEqual([{ reason: 'other', characters: 'x' }])
  })

  it('says length when the mask is full', () => {
    expect(insert(postalCode, '123 45|', '6').rejected).toEqual([
      { reason: 'length', characters: '6' },
    ])
  })

  it('groups the characters of one reason, and keeps separate reasons apart', () => {
    const result = insert(postalCode, '|', 'a1b2c3d4e5f6')
    expect(result.rejected).toEqual([
      { reason: 'digits', characters: 'abcde' },
      { reason: 'length', characters: 'f6' }, // nothing fits after the fifth digit, whatever it is
    ])
  })

  it('reports a separator that the user types alone, because the keystroke would be silent', () => {
    expect(insert(postalCode, '12|', '-').rejected).toEqual([{ reason: 'digits', characters: '-' }])
  })

  it('does not report separators in pasted text', () => {
    expect(insert(postalCode, '|', '123-45').rejected).toEqual([])
  })

  it('does not report characters that were already in the value', () => {
    const result = postalCode.apply({ value: 'x1', previousValue: 'x', selectionStart: 2 })
    expect(result.rejected).toEqual([])
  })
})

describe('pattern syntax', () => {
  it('treats \\ as an escape for 9, a and *', () => {
    const mask = masks.pattern('\\9-99')
    expect(mask.apply({ value: '9-12', previousValue: '' }).value).toBe('9-12')
    expect(showCaret(insert(mask, '|', '1'))).toBe('9-1|')
  })

  it('accepts å, ø, đ and ŋ as letters, with combining marks', () => {
    const mask = masks.pattern('aaaa')
    expect(mask.apply({ value: 'åøđŋ', previousValue: '' }).value).toBe('åøđŋ')
    // "a" and U+0308 arrive as two characters: the mark stays with the letter
    expect(mask.apply({ value: 'äb', previousValue: '' }).value).toBe('äb')
    expect(mask.apply({ value: 'äbcd', previousValue: '' }).rejected).toEqual([])
  })

  it('runs a transform on accepted characters', () => {
    const mask = masks.pattern('aa-9999', {
      transform: { a: (character) => character.toUpperCase() },
    })
    expect(mask.apply({ value: 'ab1234', previousValue: '' }).value).toBe('AB-1234')
  })

  it('reports isComplete when every token is filled, not before', () => {
    expect(caseNumber.apply({ value: 'AB-123', previousValue: '' }).isComplete).toBe(false)
    expect(caseNumber.apply({ value: 'AB-1234', previousValue: '' }).isComplete).toBe(true)
  })

  it('uses completeLengths for formats with more than one length', () => {
    const mask = masks.pattern('9999999999', { completeLengths: [8, 10] })
    expect(mask.apply({ value: '12345678', previousValue: '' }).isComplete).toBe(true)
    expect(mask.apply({ value: '123456789', previousValue: '' }).isComplete).toBe(false)
  })

  it('keeps leading zeros', () => {
    expect(postalCode.apply({ value: '00123', previousValue: '' }).value).toBe('001 23')
  })

  it('is unchanged by a mask without tokens', () => {
    expect(createMask({ type: 'pattern', pattern: '' }).apply({ value: 'x' }).value).toBe('')
  })
})

describe('regexp definitions', () => {
  const fourDigits = masks.regexp(/^\d{0,4}$/, { allowed: 'digits' })

  it('accepts a change only while the whole value matches', () => {
    expect(showCaret(insert(fourDigits, '12|', '3'))).toBe('123|')
    expect(insert(fourDigits, '12|', 'x').rejected).toEqual([{ reason: 'digits', characters: 'x' }])
  })

  it('says length for a character that would fit if the value were not full', () => {
    expect(insert(fourDigits, '1234|', '5').rejected).toEqual([
      { reason: 'length', characters: '5' },
    ])
  })

  it('refuses a character typed in the middle of a full value, and keeps the end', () => {
    expect(showCaret(insert(fourDigits, '12|34', '9'))).toBe('12|34')
  })

  it('accepts a pasted value that matches as a whole, even if the way there is not valid', () => {
    const dated = masks.regexp(/^\d{4}-\d{2}$/)
    expect(dated.apply({ value: '2024-05', previousValue: '' }).value).toBe('2024-05')
    expect(dated.apply({ value: '2024-05', previousValue: '' }).isComplete).toBe(true)
  })

  it('runs transform before the test, and unmask on the value', () => {
    const mask = masks.regexp(/^[A-Z]*$/, {
      transform: (character) => character.toUpperCase(),
      unmask: (value) => value.toLowerCase(),
    })
    const result = mask.apply({ value: 'abc', previousValue: '' })
    expect(result.value).toBe('ABC')
    expect(result.unmaskedValue).toBe('abc')
  })

  it('ignores g and y flags, which would make the test depend on the last call', () => {
    const mask = masks.regexp(/^\d*$/g)
    expect(mask.apply({ value: '12', previousValue: '' }).value).toBe('12')
    expect(mask.apply({ value: '34', previousValue: '' }).value).toBe('34')
  })
})

describe('function definitions', () => {
  it('resolves the definition from the value as typed', () => {
    const mask = createMask({
      type: 'function',
      resolve: (value) =>
        value.startsWith('+')
          ? { type: 'pattern', pattern: '+99 999' }
          : { type: 'pattern', pattern: '999 999' },
    })
    expect(mask.apply({ value: '123456', previousValue: '' }).value).toBe('123 456')
    expect(mask.apply({ value: '+12345', previousValue: '' }).value).toBe('+12 345')
  })
})

describe('mask.withLocale', () => {
  it('returns the same mask when the locale does not matter', () => {
    expect(postalCode.withLocale('sv')).toBe(postalCode)
  })
})
