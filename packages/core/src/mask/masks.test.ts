import { describe, expect, it } from 'vite-plus/test'
import { masks } from './masks.ts'
import { insert, remove, showCaret } from './mask-test-support.ts'

describe('masks.digits', () => {
  it('accepts 0-9 only and keeps leading zeros', () => {
    const mask = masks.digits()
    expect(mask.apply({ value: '00123', previousValue: '' }).value).toBe('00123')
    expect(insert(mask, '12|', 'a').rejected).toEqual([{ reason: 'digits', characters: 'a' }])
    expect(insert(mask, '12|', '٣').rejected).toEqual([{ reason: 'digits', characters: '٣' }])
  })

  it('limits the length after normalising a paste', () => {
    const mask = masks.digits({ length: 6 })
    const result = mask.apply({ value: '123 456', previousValue: '' })
    expect(result.value).toBe('123456')
    expect(result.rejected).toEqual([])
    expect(result.isComplete).toBe(true)
    expect(insert(mask, '123456|', '7').rejected).toEqual([{ reason: 'length', characters: '7' }])
  })

  it('is complete at its length only', () => {
    const mask = masks.digits({ length: 4 })
    expect(mask.apply({ value: '123', previousValue: '' }).isComplete).toBe(false)
    expect(mask.apply({ value: '1234', previousValue: '' }).isComplete).toBe(true)
    expect(masks.digits().apply({ value: '' }).isComplete).toBe(false)
  })
})

describe('masks.letters and masks.lettersAndDigits', () => {
  it('accepts letters of any script, with their marks', () => {
    const mask = masks.letters()
    expect(mask.apply({ value: 'Åsa Ørn', previousValue: '' }).value).toBe('ÅsaØrn')
    expect(mask.apply({ value: 'đŋš', previousValue: '' }).rejected).toEqual([])
    expect(insert(mask, 'a|', '1').rejected).toEqual([{ reason: 'letters', characters: '1' }])
  })

  it('accepts letters and digits', () => {
    const mask = masks.lettersAndDigits()
    expect(mask.apply({ value: 'ab12ÅÄÖ', previousValue: '' }).value).toBe('ab12ÅÄÖ')
    expect(insert(mask, 'a|', '-').rejected).toEqual([
      { reason: 'lettersAndDigits', characters: '-' },
    ])
  })
})

describe('masks.personalIdentityNumber SE', () => {
  const mask = masks.personalIdentityNumber({ country: 'SE' })

  it.each([
    // the plain form of YYMMDD-NNNN needs no separator, so none is inserted for ten digits
    { before: '900101238|', input: '5', after: '9001012385|' },
    // the eleventh digit shows that it is the twelve-digit form
    {
      before: '9001012385|',
      input: '1',
      after: '90010123-851|',
    },
  ])('$before + $input → $after', ({ before, input, after }) => {
    expect(showCaret(insert(mask, before, input))).toBe(after)
  })

  it('takes the ten-digit form with a typed -', () => {
    expect(showCaret(insert(mask, '900101|', '-'))).toBe('900101-|')
    expect(showCaret(insert(mask, '900101-|', '2'))).toBe('900101-2|')
    const full = mask.apply({ value: '900101-2385', previousValue: '' })
    expect(full).toMatchObject({
      value: '900101-2385',
      unmaskedValue: '9001012385',
      isComplete: true,
    })
    expect(insert(mask, '900101-2385|', '1').rejected).toEqual([
      { reason: 'length', characters: '1' },
    ])
  })

  it('takes the twelve-digit form with a typed -', () => {
    expect(showCaret(insert(mask, '19900101|', '-'))).toBe('19900101-|')
    const full = mask.apply({ value: '19900101-2385', previousValue: '' })
    expect(full).toMatchObject({ unmaskedValue: '199001012385', isComplete: true })
  })

  it('keeps + for a person who is 100 or older', () => {
    expect(mask.apply({ value: '000101+9801', previousValue: '' }).value).toBe('000101+9801')
    expect(mask.apply({ value: '19000101+9801', previousValue: '' }).value).toBe('19000101+9801')
    expect(showCaret(insert(mask, '000101|', '+'))).toBe('000101+|')
  })

  it('is complete at ten or twelve digits, and not in between', () => {
    expect(mask.apply({ value: '9001012385', previousValue: '' }).isComplete).toBe(true)
    expect(mask.apply({ value: '199001012385', previousValue: '' }).isComplete).toBe(true)
    expect(mask.apply({ value: '19900101238', previousValue: '' }).isComplete).toBe(false)
    expect(mask.apply({ value: '99001012', previousValue: '' }).isComplete).toBe(false)
  })

  it('accepts a samordningsnummer, which has the same shape', () => {
    expect(mask.apply({ value: '202601612381', previousValue: '' }).value).toBe('20260161-2381')
  })

  it('refuses letters, and a separator that the user types in the wrong place', () => {
    expect(insert(mask, '9001|', 'x').rejected).toEqual([{ reason: 'digits', characters: 'x' }])
    expect(insert(mask, '9001|', '-').rejected).toEqual([{ reason: 'digits', characters: '-' }])
  })

  it('formats and unmasks a stored value', () => {
    expect(mask.format('199001012385')).toBe('19900101-2385')
    expect(mask.format('9001012385')).toBe('9001012385')
    expect(mask.unmask('19900101-2385')).toBe('199001012385')
  })

  it('suggests a numeric keypad, no spell check and left to right', () => {
    expect(mask.attributes).toEqual({ inputMode: 'numeric', spellCheck: false, dir: 'ltr' })
  })
})

describe('masks.personalIdentityNumber FI', () => {
  const mask = masks.personalIdentityNumber({ country: 'FI' })

  it.each([
    { pasted: '131052-308T', after: '131052-308T' },
    { pasted: '131052-308t', after: '131052-308T' }, // upper-cased
    { pasted: '131052a308t', after: '131052A308T' },
    { pasted: '131052- 308T', after: '131052-308T' }, // pasted separators are normalised
  ])('$pasted ends as $after', ({ pasted, after }) => {
    expect(mask.apply({ value: pasted, previousValue: '' }).value).toBe(after)
  })

  it.each(['+', '-', 'U', 'V', 'W', 'X', 'Y', 'A', 'B', 'C', 'D', 'E', 'F', 'u', 'a'])(
    'accepts %s as the century sign',
    (sign) => {
      const result = insert(mask, '131052|', sign)
      expect(result.rejected).toEqual([])
      expect(result.value).toBe(`131052${sign.toUpperCase()}`)
    },
  )

  it.each(['G', 'H', 'Z', '1', 'ä', ' '])('refuses %s as the century sign', (sign) => {
    expect(insert(mask, '131052|', sign).rejected.length).toBeGreaterThan(0)
  })

  it('accepts the check characters and not G, I, O, Q and Z', () => {
    for (const character of '0123456789ABCDEFHJKLMNPRSTUVWXY') {
      expect(insert(mask, '131052-308|', character).rejected).toEqual([])
    }
    for (const character of 'GIOQZ') {
      expect(insert(mask, '131052-308|', character).rejected).toEqual([
        { reason: 'other', characters: character },
      ])
    }
  })

  it('does not guess a century sign that is missing', () => {
    const result = mask.apply({ value: '131052 308T', previousValue: '' })
    expect(result.value).toBe('131052')
    expect(result.rejected.length).toBeGreaterThan(0)
  })

  it('refuses a letter where the date or the individual number is, as digits', () => {
    expect(insert(mask, '1310|', 'a').rejected).toEqual([{ reason: 'digits', characters: 'a' }])
    expect(insert(mask, '131052-3|', 'A').rejected).toEqual([{ reason: 'digits', characters: 'A' }])
  })

  it('is complete at eleven characters', () => {
    expect(mask.apply({ value: '131052-308', previousValue: '' }).isComplete).toBe(false)
    expect(mask.apply({ value: '131052-308T', previousValue: '' })).toMatchObject({
      isComplete: true,
      unmaskedValue: '131052-308T',
    })
  })

  it('asks for upper case and keeps spell check off', () => {
    expect(mask.attributes).toMatchObject({ autoCapitalize: 'characters', spellCheck: false })
  })
})

describe('masks.personalIdentityNumber NO', () => {
  const mask = masks.personalIdentityNumber({ country: 'NO' })

  it('takes eleven digits, with or without the spaces people paste', () => {
    expect(mask.apply({ value: '02013299997', previousValue: '' }).value).toBe('02013299997')
    expect(mask.apply({ value: '020132 99997', previousValue: '' }).value).toBe('02013299997')
    expect(mask.apply({ value: '020132 99997', previousValue: '' }).rejected).toEqual([])
    expect(mask.apply({ value: '02013299997', previousValue: '' }).isComplete).toBe(true)
    expect(mask.apply({ value: '0201329999', previousValue: '' }).isComplete).toBe(false)
  })

  it('refuses a twelfth digit, and letters', () => {
    expect(insert(mask, '02013299997|', '1').rejected).toEqual([
      { reason: 'length', characters: '1' },
    ])
    expect(insert(mask, '0201|', 'a').rejected).toEqual([{ reason: 'digits', characters: 'a' }])
  })
})

describe('masks.postalCode', () => {
  it.each([
    { country: 'SE' as const, pasted: '12345', after: '123 45' },
    { country: 'SE' as const, pasted: 'SE-123 45', after: '123 45' },
    { country: 'FI' as const, pasted: '00100', after: '00100' },
    { country: 'FI' as const, pasted: '001 00', after: '00100' },
    { country: 'NO' as const, pasted: '0150', after: '0150' },
  ])('$country: $pasted ends as $after', ({ country, pasted, after }) => {
    const result = masks.postalCode({ country }).apply({ value: pasted, previousValue: '' })
    expect(result.value).toBe(after)
    expect(result.rejected.filter((rejection) => rejection.reason !== 'digits')).toEqual([])
  })

  it('knows when it is complete', () => {
    expect(masks.postalCode({ country: 'SE' }).apply({ value: '123 45' }).isComplete).toBe(true)
    expect(masks.postalCode({ country: 'SE' }).apply({ value: '123 4' }).isComplete).toBe(false)
    expect(masks.postalCode({ country: 'NO' }).apply({ value: '0150' }).isComplete).toBe(true)
  })
})

describe('masks.organisationNumber', () => {
  it.each([
    { country: 'SE' as const, pasted: '5560000001', after: '556000-0001' },
    { country: 'SE' as const, pasted: '556000-0001', after: '556000-0001' },
    { country: 'FI' as const, pasted: '01120389', after: '0112038-9' },
    { country: 'FI' as const, pasted: '0112038-9', after: '0112038-9' },
    { country: 'NO' as const, pasted: '974760673', after: '974 760 673' },
    { country: 'NO' as const, pasted: '974 760 673', after: '974 760 673' },
  ])('$country: $pasted ends as $after', ({ country, pasted, after }) => {
    const result = masks.organisationNumber({ country }).apply({ value: pasted, previousValue: '' })
    expect(result.value).toBe(after)
    expect(result.isComplete).toBe(true)
    expect(result.rejected).toEqual([])
  })
})

describe('masks.iban', () => {
  const mask = masks.iban()

  it('upper-cases and groups in fours, however it was written', () => {
    for (const pasted of [
      'SE4550000000058398257466',
      'se45 5000 0000 0583 9825 7466',
      'SE45-5000-0000-0583-9825-7466',
    ]) {
      const result = mask.apply({ value: pasted, previousValue: '' })
      expect(result.value).toBe('SE45 5000 0000 0583 9825 7466')
      expect(result.rejected).toEqual([])
      expect(result.unmaskedValue).toBe('SE4550000000058398257466')
    }
  })

  it('is complete at the length of the country', () => {
    expect(mask.apply({ value: 'SE45 5000 0000 0583 9825 7466' }).isComplete).toBe(true)
    expect(mask.apply({ value: 'SE45 5000 0000 0583 9825 746' }).isComplete).toBe(false)
    expect(mask.apply({ value: 'NO93 8601 1117 947' }).isComplete).toBe(true)
    expect(mask.apply({ value: 'FI21 1234 5600 0007 85' }).isComplete).toBe(true)
    expect(mask.apply({ value: 'XX00 1234' }).isComplete).toBe(false)
  })

  it('refuses characters outside A-Z and 0-9', () => {
    expect(insert(mask, 'SE45|', 'å').rejected).toEqual([
      { reason: 'lettersAndDigits', characters: 'å' },
    ])
  })

  it('keeps the caret with the typed character across the spaces', () => {
    expect(showCaret(insert(mask, 'SE45 500|', '0'))).toBe('SE45 5000|')
    expect(showCaret(insert(mask, 'SE45 5000|', '0'))).toBe('SE45 5000 0|')
    expect(showCaret(remove(mask, 'SE45 5000 |0'))).toBe('SE45 500|0')
  })

  it('limits the length at 34 characters', () => {
    const result = mask.apply({ value: 'A'.repeat(40), previousValue: '' })
    expect(result.unmaskedValue).toHaveLength(34)
    expect(result.rejected).toEqual([{ reason: 'length', characters: 'A'.repeat(6) }])
  })
})

describe('masks.email and masks.telephone', () => {
  it('email only drops whitespace', () => {
    const mask = masks.email()
    expect(mask.apply({ value: 'Åsa.Öberg@example.se', previousValue: '' }).value).toBe(
      'Åsa.Öberg@example.se',
    )
    expect(mask.apply({ value: ' a@b.se ', previousValue: '' })).toMatchObject({
      value: 'a@b.se',
      rejected: [],
    })
    expect(insert(mask, 'a|', ' ').rejected).toEqual([{ reason: 'other', characters: ' ' }])
    expect(mask.attributes).toMatchObject({ inputMode: 'email', autoCapitalize: 'off' })
  })

  it('telephone accepts digits, +, space, -, ( and ) and drops the rest', () => {
    const mask = masks.telephone()
    expect(mask.apply({ value: '+46 (0)70-123 45 67', previousValue: '' }).value).toBe(
      '+46 (0)70-123 45 67',
    )
    expect(insert(mask, '+46|', 'x').rejected).toEqual([{ reason: 'other', characters: 'x' }])
    expect(mask.attributes).toMatchObject({ inputMode: 'tel', dir: 'ltr' })
  })
})

describe('masks.pattern and masks.regexp', () => {
  it('build masks from your own pattern or expression', () => {
    expect(masks.pattern('aa-9999').apply({ value: 'ab1234', previousValue: '' }).value).toBe(
      'ab-1234',
    )
    expect(masks.regexp(/^[A-C]*$/).apply({ value: 'ABCD' }).value).toBe('ABC')
  })
})

describe('masks.oneTimeCode', () => {
  it.each([
    { pattern: '999999', pasted: '123456', after: '123456' },
    { pattern: '999999', pasted: '123 456', after: '123456' },
    { pattern: '999999', pasted: '123-456', after: '123456' },
    { pattern: '999999', pasted: ' 123456\n', after: '123456' },
    { pattern: 'aaaaaa', pasted: 'ABC DEF', after: 'ABCDEF' },
    { pattern: '******', pasted: 'a1b 2c3', after: 'a1b2c3' },
    // the dash goes where the pattern says, whether the paste has it or not
    { pattern: '****-****', pasted: 'abcd1234', after: 'abcd-1234' },
    { pattern: '****-****', pasted: 'abcd-1234', after: 'abcd-1234' },
    { pattern: '****-****', pasted: 'abcd 1234', after: 'abcd-1234' },
    { pattern: '***-***-***', pasted: 'abc123xyz', after: 'abc-123-xyz' },
    { pattern: '***-***-***', pasted: 'abc-123-xyz', after: 'abc-123-xyz' },
    { pattern: '***-***-***', pasted: ' abc 123 xyz ', after: 'abc-123-xyz' },
    { pattern: 'AA-9999', pasted: 'ab1234', after: 'AB-1234' },
    { pattern: 'AA-9999', pasted: 'AB-1234', after: 'AB-1234' },
    { pattern: '&&&&', pasted: 'a1b2', after: 'A1B2' },
    { pattern: '&&&&', pasted: 'a1-b2', after: 'A1B2' },
    { pattern: '999-999', pasted: '123-456', after: '123-456' },
  ])('$pattern: $pasted ends as $after', ({ pattern, pasted, after }) => {
    const mask = masks.oneTimeCode({ pattern })
    const result = mask.apply({ value: pasted, previousValue: '' })
    expect(result.value).toBe(after)
    expect(result.isComplete).toBe(true)
    expect(result.rejected).toEqual([])
  })

  it('inserts the separator as the next character is placed, and refuses what does not fit', () => {
    const mask = masks.oneTimeCode({ pattern: '****-****' })
    expect(showCaret(insert(mask, 'abc|', 'd'))).toBe('abcd|')
    expect(showCaret(insert(mask, 'abcd|', '1'))).toBe('abcd-1|')
    expect(showCaret(insert(mask, 'abcd-1|', '2'))).toBe('abcd-12|')
    expect(insert(mask, 'abcd-1234|', '5').rejected).toEqual([
      { reason: 'length', characters: '5' },
    ])
  })

  it('accepts a typed separator once, in its place', () => {
    const mask = masks.oneTimeCode({ pattern: '****-****' })
    expect(showCaret(insert(mask, 'abcd|', '-'))).toBe('abcd-|')
    const typedTwice = insert(mask, 'abcd-|', '-')
    expect(typedTwice.value).toBe('abcd-')
    expect(showCaret(insert(mask, 'abcd-|', '1'))).toBe('abcd-1|')
    // A dash inside a group isn't the separator: it is refused and named.
    expect(insert(mask, 'ab|', '-').rejected).toEqual([
      { reason: 'lettersAndDigits', characters: '-' },
    ])
  })

  it('does not insert a separator for a pattern without one', () => {
    const mask = masks.oneTimeCode({ pattern: '999999' })
    expect(showCaret(insert(mask, '123|', '4'))).toBe('1234|')
    expect(insert(mask, '123456|', '7').rejected).toEqual([{ reason: 'length', characters: '7' }])
    expect(insert(mask, '123|', 'a').rejected).toEqual([{ reason: 'digits', characters: 'a' }])
    expect(insert(mask, '123|', '-').rejected).toEqual([{ reason: 'digits', characters: '-' }])
  })

  it('upper-cases typed letters for A and &, and leaves a and * as typed', () => {
    const upper = masks.oneTimeCode({ pattern: 'AA-9999' })
    expect(showCaret(insert(upper, '|', 'a'))).toBe('A|')
    expect(showCaret(insert(upper, 'A|', 'b'))).toBe('AB|')
    expect(showCaret(insert(upper, 'AB|', '1'))).toBe('AB-1|')
    const alphanumeric = masks.oneTimeCode({ pattern: '&&&&' })
    expect(showCaret(insert(alphanumeric, 'A1|', 'b'))).toBe('A1B|')
    expect(masks.oneTimeCode({ pattern: 'aa' }).apply({ value: 'ab' }).value).toBe('ab')
    expect(masks.oneTimeCode({ pattern: '**' }).apply({ value: 'a1' }).value).toBe('a1')
  })

  it('names the class that refused a character', () => {
    expect(insert(masks.oneTimeCode({ pattern: '9999' }), '|', 'a').rejected).toEqual([
      { reason: 'digits', characters: 'a' },
    ])
    expect(insert(masks.oneTimeCode({ pattern: 'aaaa' }), '|', '1').rejected).toEqual([
      { reason: 'letters', characters: '1' },
    ])
    expect(insert(masks.oneTimeCode({ pattern: 'AAAA' }), '|', '1').rejected).toEqual([
      { reason: 'letters', characters: '1' },
    ])
    expect(insert(masks.oneTimeCode({ pattern: '****' }), '|', '!').rejected).toEqual([
      { reason: 'lettersAndDigits', characters: '!' },
    ])
    expect(insert(masks.oneTimeCode({ pattern: '&&&&' }), '|', '?').rejected).toEqual([
      { reason: 'lettersAndDigits', characters: '?' },
    ])
    // a position in AA-9999 takes its own class: a digit in the letters, a letter in the digits
    const mixed = masks.oneTimeCode({ pattern: 'AA-9999' })
    expect(insert(mixed, '|', '1').rejected).toEqual([{ reason: 'letters', characters: '1' }])
    expect(insert(mixed, 'AB-|', 'x').rejected).toEqual([{ reason: 'digits', characters: 'x' }])
  })

  it('is ASCII only: å, ø, ß and the dotless ı are not letters in a code', () => {
    for (const symbol of ['a', 'A', '*', '&']) {
      const mask = masks.oneTimeCode({ pattern: symbol.repeat(4) })
      for (const character of ['å', 'ø', 'ß', 'ı', 'đ']) {
        expect(insert(mask, '|', character).rejected).toHaveLength(1)
      }
    }
    expect(insert(masks.oneTimeCode({ pattern: '9999' }), '|', '٣').rejected).toHaveLength(1)
  })

  it('is complete when every character position is filled, and unmasks without the separators', () => {
    const mask = masks.oneTimeCode({ pattern: '****-****' })
    expect(mask.apply({ value: 'abcd-123' }).isComplete).toBe(false)
    const complete = mask.apply({ value: 'abcd1234' })
    expect(complete.isComplete).toBe(true)
    expect(complete.unmaskedValue).toBe('abcd1234')
    expect(mask.unmask('abcd-1234')).toBe('abcd1234')
    expect(mask.format('abcd1234')).toBe('abcd-1234')
    expect(masks.oneTimeCode({ pattern: '9999' }).apply({ value: '123' }).isComplete).toBe(false)
    expect(masks.oneTimeCode({ pattern: '9999' }).apply({ value: '1234' }).isComplete).toBe(true)
  })

  it('Backspace and Delete cross the separator like any character', () => {
    const mask = masks.oneTimeCode({ pattern: '****-****' })
    expect(showCaret(remove(mask, 'abcd-1|'))).toBe('abcd-|')
    expect(showCaret(remove(mask, 'abcd-|'))).toBe('abcd|')
    // Backspace right after the dash deletes the character before it, and the rest reflows
    expect(showCaret(remove(mask, 'abcd-|12'))).toBe('abc|1-2')
  })

  it.each([
    { pattern: '999999', inputMode: 'numeric', autoCapitalize: 'characters' },
    { pattern: '999-999', inputMode: 'numeric', autoCapitalize: 'characters' },
    { pattern: '****-****', inputMode: 'text', autoCapitalize: undefined },
    { pattern: 'aaaa', inputMode: 'text', autoCapitalize: undefined },
    { pattern: 'AA-9999', inputMode: 'text', autoCapitalize: 'characters' },
    { pattern: '&&&&', inputMode: 'text', autoCapitalize: 'characters' },
  ])(
    '$pattern suggests inputMode $inputMode and autoCapitalize $autoCapitalize',
    ({ pattern, inputMode, autoCapitalize }) => {
      const { attributes } = masks.oneTimeCode({ pattern })
      expect(attributes.inputMode).toBe(inputMode)
      expect(attributes.autoCapitalize).toBe(autoCapitalize)
      expect(attributes.spellCheck).toBe(false)
      expect(attributes.dir).toBe('ltr')
    },
  )

  it.each([
    { pattern: '99x9', character: 'x', position: 2 },
    { pattern: '9 9', character: ' ', position: 1 },
    { pattern: '99_99', character: '_', position: 2 },
    { pattern: '9999.9', character: '.', position: 4 },
    { pattern: '\\9', character: '\\', position: 0 },
    // `?` and other Alpine-style symbols are not part of the code pattern
    { pattern: '999?', character: '?', position: 3 },
    { pattern: '-999', character: '-', position: 0 },
    { pattern: '999-', character: '-', position: 3 },
    { pattern: '99--99', character: '-', position: 3 },
  ])(
    'throws a RangeError that names $character at position $position in "$pattern"',
    ({ pattern, character, position }) => {
      expect(() => masks.oneTimeCode({ pattern })).toThrow(RangeError)
      expect(() => masks.oneTimeCode({ pattern })).toThrow(
        new RegExp(`"${character.replace(/[\\.?]/g, '\\$&')}" at position ${position}`),
      )
    },
  )

  it('throws for a pattern with no character symbol', () => {
    expect(() => masks.oneTimeCode({ pattern: '' })).toThrow(RangeError)
    expect(() => masks.oneTimeCode({ pattern: '' })).toThrow(/no character symbol/)
  })
})
