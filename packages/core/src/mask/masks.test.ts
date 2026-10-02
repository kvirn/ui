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
    { characters: undefined, pasted: '123456', after: '123456' },
    { characters: undefined, pasted: '123 456', after: '123456' },
    { characters: undefined, pasted: '123-456', after: '123456' },
    { characters: 'digits' as const, pasted: ' 123456\n', after: '123456' },
    { characters: 'letters' as const, pasted: 'ABC DEF', after: 'ABCDEF' },
    { characters: 'lettersAndDigits' as const, pasted: 'a1b 2c3', after: 'a1b2c3' },
  ])('$characters: $pasted ends as $after', ({ characters, pasted, after }) => {
    const mask = masks.oneTimeCode({ length: 6, ...(characters ? { characters } : {}) })
    const result = mask.apply({ value: pasted, previousValue: '' })
    expect(result.value).toBe(after)
    expect(result.isComplete).toBe(true)
    expect(result.rejected).toEqual([])
  })

  it('does not insert separators, and refuses what does not fit', () => {
    const mask = masks.oneTimeCode({ length: 6 })
    expect(showCaret(insert(mask, '123|', '4'))).toBe('1234|')
    expect(insert(mask, '123456|', '7').rejected).toEqual([{ reason: 'length', characters: '7' }])
    expect(insert(mask, '123|', 'a').rejected).toEqual([{ reason: 'digits', characters: 'a' }])
  })

  it('is complete at its length only', () => {
    const mask = masks.oneTimeCode({ length: 4 })
    expect(mask.apply({ value: '123' }).isComplete).toBe(false)
    expect(mask.apply({ value: '1234' }).isComplete).toBe(true)
  })

  it('suggests a numeric keypad for digits and a text keypad for letters', () => {
    expect(masks.oneTimeCode({ length: 6 }).attributes).toMatchObject({
      inputMode: 'numeric',
      dir: 'ltr',
    })
    expect(
      masks.oneTimeCode({ length: 6, characters: 'lettersAndDigits' }).attributes,
    ).toMatchObject({ inputMode: 'text' })
  })
})
