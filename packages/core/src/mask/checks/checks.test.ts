import { describe, expect, it } from 'vite-plus/test'
import { checks } from './checks.ts'

// Test numbers only, never real people's. Where a number is derived, the comment says how.
//
// - SE: the personnummer and samordningsnummer are in Skatteverket's published test data
//   (skatteverket.entryscape.net, "Testpersonnummer" and "Testsamordningsnummer").
// - FI: 131052-308T is DVV's own example of the format (dvv.fi/en/personal-identity-code).
//   The variants change only the century sign, which doesn't change the check character.
// - NO: 02013299997, 30108299920 and 30108299939 are Skatteetaten's documented examples
//   (skatteetaten.github.io/folkeregisteret-api-dokumentasjon, "Nytt fødselsnummer fra 2032").
//   The D-, H-, 1800s, 2000s and synthetic numbers are derived by the documented rules.
// - Organisation numbers aren't personal data. SE and FI are built with the documented check
//   digit rules, NO is Brønnøysundregistrene's and Skatteetaten's own number.
// - IBAN: the example IBANs of the SWIFT IBAN registry.

const valid = { isValid: true, reason: undefined }
const invalid = (reason: string) => ({ isValid: false, reason })

describe('checks.personalIdentityNumber SE', () => {
  const check = (value: string) => checks.personalIdentityNumber(value, { country: 'SE' })

  it.each([
    '199001012385', // 12 digits, as published
    '19900101-2385',
    '19900101 2385',
    '9001012385', // ten digits, no separator
    '900101-2385',
    '200002292399', // 29 February 2000, a leap year
    '000229-2399', // ... in its ten-digit form: 00 with - is 2000
    '202402292383', // 29 February 2024
    '190001019801',
    '000101+9801', // + means 100 years or more: 1900
    '189001019802',
    '196408233234',
    '202601612381', // samordningsnummer: day 61 is the 1st
    '202201612393',
  ])('%s is valid', (value) => {
    expect(check(value)).toEqual(valid)
  })

  it.each([
    { value: '19900101238', reason: 'format' },
    { value: '1990010123855', reason: 'format' },
    { value: '19900101-238a', reason: 'format' },
    { value: '', reason: 'format' },
    { value: '19900101*2385', reason: 'format' },
    { value: '199013012385', reason: 'date' }, // month 13
    { value: '199002302385', reason: 'date' }, // 30 February
    { value: '199001322385', reason: 'date' }, // day 32
    { value: '190002292385', reason: 'date' }, // 1900 had no 29 February
    { value: '000229+2399', reason: 'date' }, // + makes 00 the year 1900
    { value: '210001012385', reason: 'date' }, // not a century a personnummer has
    { value: '202201922380', reason: 'date' }, // samordningsnummer day 32
    { value: '199001012386', reason: 'checkDigit' },
    { value: '9001012386', reason: 'checkDigit' },
    { value: '202601612382', reason: 'checkDigit' },
  ])('$value fails with $reason', ({ value, reason }) => {
    expect(check(value)).toEqual(invalid(reason))
  })
})

describe('checks.personalIdentityNumber FI', () => {
  const check = (value: string) => checks.personalIdentityNumber(value, { country: 'FI' })

  it.each([
    '131052-308T', // DVV's example
    '131052-308t',
    '131052+308T', // the 1800s
    '131052Y308T', // the 1900s, with one of the signs added in 2023
    '131052U308T',
    '131052A308T', // the 2000s
    '131052F308T',
    '131052 -308T',
    '010170-900J', // 900 to 999 are temporary and test numbers
    '290200A002C', // 29 February 2000
    '311299Y999E',
  ])('%s is valid', (value) => {
    expect(check(value)).toEqual(valid)
  })

  it.each([
    { value: '131052308T', reason: 'format' }, // no century sign
    { value: '131052G308T', reason: 'format' }, // G isn't a century sign
    { value: '131052Z308T', reason: 'format' },
    { value: '131052-30T', reason: 'format' },
    { value: '131052-001T', reason: 'format' }, // individual numbers start at 002
    { value: '131052-308G', reason: 'format' }, // G, I, O, Q and Z are never check characters
    { value: '131352-308T', reason: 'date' },
    { value: '300252-308T', reason: 'date' },
    { value: '290200-002X', reason: 'date' }, // 1900 had no 29 February
    { value: '131052-308U', reason: 'checkDigit' },
    { value: '131052-309T', reason: 'checkDigit' },
    { value: '131053-308T', reason: 'checkDigit' },
  ])('$value fails with $reason', ({ value, reason }) => {
    expect(check(value)).toEqual(invalid(reason))
  })
})

describe('checks.personalIdentityNumber NO', () => {
  const check = (value: string, allowSyntheticNumbers?: boolean) =>
    checks.personalIdentityNumber(
      value,
      allowSyntheticNumbers === undefined
        ? { country: 'NO' }
        : { country: 'NO', allowSyntheticNumbers },
    )

  it.each([
    '02013299997', // 2 January 2032, Skatteetaten's example: individual 999 and year 32 is 2032
    '30108299920', // 30 October 1982, individual 999 is the 1900s
    '020132 99997',
    '01019049961', // 1 January 1990
    '15088050026', // 15 August 1880: 500 to 749 with year 54 or later is the 1800s
    '15080550186', // 2005: 500 or more with a year under 40 is the 2000s
    '29020050088', // 29 February 2000, a leap year
    '42013299980', // a D-number: the day plus 40
    '01419040017', // an H-number: the month plus 40
  ])('%s is valid', (value) => {
    expect(check(value)).toEqual(valid)
  })

  it.each([
    { value: '0201329999', reason: 'format' },
    { value: '020132999977', reason: 'format' },
    { value: '0201329999a', reason: 'format' },
    { value: '02133299997', reason: 'date' }, // month 13
    { value: '32013299997', reason: 'date' }, // day 32
    { value: '29020049942', reason: 'date' }, // 29 February 1900 (individual 499 is the 1900s)
    { value: '02013299996', reason: 'checkDigit' },
    { value: '02013299987', reason: 'checkDigit' },
    // Skatteetaten's example for the numbering from 2032, which accepts another first check
    // digit. Today's rule gives 2, so it fails until we support the new rule.
    { value: '30108299939', reason: 'checkDigit' },
  ])('$value fails with $reason', ({ value, reason }) => {
    expect(check(value)).toEqual(invalid(reason))
  })

  it('accepts the synthetic numbers of the test registry (80 added to the month) only on request', () => {
    expect(check('01912450097')).toEqual(invalid('date'))
    expect(check('01912450097', false)).toEqual(invalid('date'))
    expect(check('01912450097', true)).toEqual(valid)
    expect(check('42912450281', true)).toEqual(valid) // a synthetic D-number
    expect(check('01912450098', true)).toEqual(invalid('checkDigit'))
    expect(check('02013299997', true)).toEqual(valid)
  })
})

describe('checks.organisationNumber', () => {
  const check = (value: string, country: 'SE' | 'FI' | 'NO') =>
    checks.organisationNumber(value, { country })

  it.each([
    { country: 'SE' as const, value: '5560000001' },
    { country: 'SE' as const, value: '556000-0001' },
    { country: 'SE' as const, value: '556000 0001' },
    { country: 'SE' as const, value: '5599999991' },
    { country: 'FI' as const, value: '0112038-9' },
    { country: 'FI' as const, value: '01120389' },
    { country: 'FI' as const, value: '112038-9' }, // six digits, from before the seven-digit form
    { country: 'FI' as const, value: '1234567-1' },
    { country: 'FI' as const, value: '1234562-0' }, // remainder 0 gives check digit 0
    { country: 'NO' as const, value: '974760673' }, // Brønnøysundregistrene
    { country: 'NO' as const, value: '974 760 673' },
    { country: 'NO' as const, value: '974761076' }, // Skatteetaten
    { country: 'NO' as const, value: '900000006' },
  ])('$country $value is valid', ({ country, value }) => {
    expect(check(value, country)).toEqual(valid)
  })

  it.each([
    { country: 'SE' as const, value: '55600000', reason: 'format' },
    { country: 'SE' as const, value: '556000-000a', reason: 'format' },
    { country: 'SE' as const, value: '556000-0002', reason: 'checkDigit' },
    { country: 'FI' as const, value: '12345', reason: 'format' },
    // YTJ's own illustration of the format, which has no valid check digit
    { country: 'FI' as const, value: '1234567-8', reason: 'checkDigit' },
    { country: 'FI' as const, value: '1234568-0', reason: 'checkDigit' }, // remainder 1: none fits
    { country: 'NO' as const, value: '97476067', reason: 'format' },
    { country: 'NO' as const, value: '974760674', reason: 'checkDigit' },
  ])('$country $value fails with $reason', ({ country, value, reason }) => {
    expect(check(value, country)).toEqual(invalid(reason))
  })
})

describe('checks.iban', () => {
  it.each([
    'SE45 5000 0000 0583 9825 7466',
    'SE4550000000058398257466',
    'se45 5000 0000 0583 9825 7466',
    'FI21 1234 5600 0007 85',
    'NO93 8601 1117 947',
    'GB82 WEST 1234 5698 7654 32',
    'DE89 3704 0044 0532 0130 00',
  ])('%s is valid', (value) => {
    expect(checks.iban(value)).toEqual(valid)
  })

  it.each([
    { value: '', reason: 'format' },
    { value: 'SE45', reason: 'format' },
    { value: 'SE45 5000 0000 0583 9825 746', reason: 'format' }, // a digit short
    { value: 'SE45 5000 0000 0583 9825 7466 1', reason: 'format' },
    { value: '4550 5000 0000 0583 9825 7466', reason: 'format' },
    { value: 'SE45-5000-0000-0583-9825-7466', reason: 'format' },
    { value: 'ZZ89 3704 0044 0532 0130 00', reason: 'country' },
    { value: 'SE46 5000 0000 0583 9825 7466', reason: 'checkDigit' },
    { value: 'NO93 8601 1117 948', reason: 'checkDigit' },
    { value: 'DE00 3704 0044 0532 0130 00', reason: 'checkDigit' },
  ])('$value fails with $reason', ({ value, reason }) => {
    expect(checks.iban(value)).toEqual(invalid(reason))
  })
})

describe('checks.date', () => {
  it.each(['2026-10-04', '2024-02-29', '2000-02-29', '2026-12-31', '2026-01-01'])(
    '%s is valid',
    (value) => {
      expect(checks.date(value)).toEqual(valid)
    },
  )

  it.each(['', '2026-10', '2026-1-4', '04.10.2026', '20261004', '2026-10-04 ', 'abcd-ef-gh'])(
    '%j is not a complete ISO date',
    (value) => {
      expect(checks.date(value)).toEqual(invalid('format'))
    },
  )

  it.each([
    '2026-02-31',
    '2026-02-29',
    '1900-02-29',
    '2026-13-01',
    '2026-00-10',
    '2026-04-31',
    '2026-10-00',
  ])('%s is no such day', (value) => {
    expect(checks.date(value)).toEqual(invalid('date'))
  })

  it('compares to min and max, both inclusive', () => {
    const options = { min: '2026-01-01', max: '2026-12-31' }
    expect(checks.date('2026-01-01', options)).toEqual(valid)
    expect(checks.date('2026-12-31', options)).toEqual(valid)
    expect(checks.date('2025-12-31', options)).toEqual(invalid('range'))
    expect(checks.date('2027-01-01', options)).toEqual(invalid('range'))
  })

  it('takes min or max alone', () => {
    expect(checks.date('2020-05-05', { min: '2026-01-01' })).toEqual(invalid('range'))
    expect(checks.date('2030-05-05', { min: '2026-01-01' })).toEqual(valid)
    expect(checks.date('2030-05-05', { max: '2026-01-01' })).toEqual(invalid('range'))
    expect(checks.date('2020-05-05', { max: '2026-01-01' })).toEqual(valid)
  })

  it('reports the format before the date, and the date before the range', () => {
    const options = { min: '2026-01-01' }
    expect(checks.date('2020-2-31', options)).toEqual(invalid('format'))
    expect(checks.date('2020-02-31', options)).toEqual(invalid('date'))
  })
})
