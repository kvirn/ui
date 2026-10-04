import { describe, expect, expectTypeOf, it } from 'vite-plus/test'
import { masks } from './masks.ts'
import type { MaskCountry } from './masks.ts'
import type { Mask } from './mask-types.ts'
import { maskNames, resolveMask, unknownMaskName } from './resolve-mask.ts'
import type { MaskInput, MaskName } from './resolve-mask.ts'

/** What two masks do with the same typed or pasted text. */
function behaves(mask: Mask, value: string) {
  const { value: shown, unmaskedValue, isComplete, rejected } = mask.apply({ value })
  return { shown, unmaskedValue, isComplete, rejected }
}

const swedish = { locale: 'sv' }

describe('resolveMask: names', () => {
  it.each([
    ['digits', masks.digits(), '00a12'],
    ['letters', masks.letters(), 'Åsa 1'],
    ['letters-and-digits', masks.lettersAndDigits(), 'ab 12-ÅÄÖ'],
    ['iban', masks.iban(), 'se45 5000 0000 0583 9825 7466'],
    ['email', masks.email(), 'maja @example.se'],
    ['telephone', masks.telephone(), '+46 (0)8-123 45 x'],
  ] as const)('%s is the preset of the same name, in any locale', (name, preset, sample) => {
    for (const locale of ['sv', 'en', 'da-DK']) {
      const { mask, missingCountryFor } = resolveMask(name, { locale })
      expect(behaves(mask, sample)).toEqual(behaves(preset, sample))
      expect(mask.attributes).toEqual(preset.attributes)
      expect(missingCountryFor).toBeUndefined()
    }
  })

  it('date follows the locale, as masks.date() does through withLocale', () => {
    const { mask } = resolveMask('date', swedish)
    expect(behaves(mask.withLocale('sv-SE'), '20261004')).toEqual(
      behaves(masks.date().withLocale('sv-SE'), '20261004'),
    )
    expect(behaves(mask.withLocale('fi'), '04102026')).toEqual(
      behaves(masks.date().withLocale('fi'), '04102026'),
    )
  })

  it.each([
    ['personal-identity-number', 'personalIdentityNumber', '19900101-1234'],
    ['postal-code', 'postalCode', '12345'],
    ['organisation-number', 'organisationNumber', '5560360793'],
  ] as const)('%s takes its country from the locale', (name, preset, sample) => {
    for (const [locale, country] of [
      ['sv', 'SE'],
      ['fi', 'FI'],
      ['nb', 'NO'],
      ['sv-FI', 'FI'],
    ] as const) {
      const { mask, missingCountryFor } = resolveMask(name, { locale })
      expect(behaves(mask, sample)).toEqual(behaves(masks[preset]({ country }), sample))
      expect(missingCountryFor).toBeUndefined()
    }
  })

  it('ssi is an alias of personal-identity-number', () => {
    for (const locale of ['sv', 'fi', 'nb']) {
      expect(behaves(resolveMask('ssi', { locale }).mask, '19900101-1234')).toEqual(
        behaves(resolveMask('personal-identity-number', { locale }).mask, '19900101-1234'),
      )
    }
  })

  it('an explicit country (the provider’s) wins over the locale', () => {
    const { mask } = resolveMask('postal-code', { locale: 'sv', country: 'FI' })
    expect(mask.apply({ value: '12345' }).value).toBe('12345')
    expect(mask.apply({ value: '12345' }).value).not.toBe('123 45')
  })

  it('without a country, a country mask falls back to digits and says which name needed one', () => {
    for (const name of [
      'personal-identity-number',
      'postal-code',
      'organisation-number',
    ] as const) {
      const { mask, missingCountryFor } = resolveMask(name, { locale: 'en' })
      expect(behaves(mask, '12 a-34')).toEqual(behaves(masks.digits(), '12 a-34'))
      expect(missingCountryFor).toBe(name)
    }
    expect(resolveMask('ssi', { locale: 'da-DK' }).missingCountryFor).toBe('ssi')
  })

  it('number is not a name: NumberInput owns it', () => {
    expect(maskNames).not.toContain('number')
    expect(maskNames).toEqual(
      expect.arrayContaining([
        'digits',
        'letters',
        'letters-and-digits',
        'personal-identity-number',
        'ssi',
        'organisation-number',
        'postal-code',
        'date',
        'iban',
        'email',
        'telephone',
      ]),
    )
  })
})

describe('resolveMask: objects', () => {
  it('{ preset, country } overrides the locale for that instance', () => {
    const { mask } = resolveMask({ preset: 'postal-code', country: 'FI' }, swedish)
    expect(behaves(mask, '12345')).toEqual(behaves(masks.postalCode({ country: 'FI' }), '12345'))
  })

  it('{ preset } alone takes the country from the locale, and the provider’s country over that', () => {
    expect(behaves(resolveMask({ preset: 'postal-code' }, swedish).mask, '12345')).toEqual(
      behaves(masks.postalCode({ country: 'SE' }), '12345'),
    )
    expect(
      behaves(
        resolveMask({ preset: 'postal-code' }, { locale: 'sv', country: 'NO' }).mask,
        '12345',
      ),
    ).toEqual(behaves(masks.postalCode({ country: 'NO' }), '12345'))
  })

  it('{ pattern } is masks.pattern, and takes the pattern options', () => {
    const { mask } = resolveMask(
      { pattern: 'aa-9999', transform: { a: (character) => character.toUpperCase() } },
      swedish,
    )
    expect(behaves(mask, 'ab1234')).toEqual({
      shown: 'AB-1234',
      unmaskedValue: 'AB1234',
      isComplete: true,
      rejected: [],
    })
    expect(behaves(resolveMask({ pattern: '999 99' }, swedish).mask, '12345').shown).toBe('123 45')
  })

  it('a RegExp is masks.regexp', () => {
    const { mask } = resolveMask(/^[A-Z]{0,2}\d{0,6}$/, swedish)
    expect(mask.apply({ value: 'AB123456' }).value).toBe('AB123456')
    expect(mask.apply({ value: 'abc' }).rejected).not.toEqual([])
  })

  it('a Mask is returned as it is', () => {
    const own = masks.postalCode({ country: 'SE' })
    const resolved = resolveMask(own, { locale: 'fi' })
    expect(resolved.mask).toBe(own)
    expect(resolved.missingCountryFor).toBeUndefined()
  })
})

describe('unknownMaskName', () => {
  it('names the string or preset that is not a MaskName, for the caller to warn about', () => {
    // A JavaScript user, a typo, or "number" (NumberInput owns it).
    expect(unknownMaskName('postcode')).toBe('postcode')
    expect(unknownMaskName('number')).toBe('number')
    expect(unknownMaskName({ preset: 'zip' })).toBe('zip')
  })

  it('is undefined for every known name, preset, pattern, RegExp and Mask', () => {
    for (const name of maskNames) {
      expect(unknownMaskName(name)).toBeUndefined()
      expect(unknownMaskName({ preset: name })).toBeUndefined()
    }
    expect(unknownMaskName({ pattern: '999' })).toBeUndefined()
    expect(unknownMaskName(/^\d*$/)).toBeUndefined()
    expect(unknownMaskName(masks.digits())).toBeUndefined()
  })
})

describe('types', () => {
  it('MaskInput takes names, objects, a RegExp and a Mask, and MaskName lists the names', () => {
    expectTypeOf<'postal-code'>().toExtend<MaskInput>()
    expectTypeOf<{ preset: 'postal-code'; country: MaskCountry }>().toExtend<MaskInput>()
    expectTypeOf<{ pattern: string }>().toExtend<MaskInput>()
    expectTypeOf<RegExp>().toExtend<MaskInput>()
    expectTypeOf<Mask>().toExtend<MaskInput>()
    expectTypeOf<'number'>().not.toExtend<MaskName>()
    expectTypeOf<'ssi'>().toExtend<MaskName>()
  })
})
