import type { CheckResult } from '../mask-types.ts'
import { isCalendarDate, passesLuhn, removeWhitespace, weightedSum } from './check-support.ts'

export type PersonalIdentityNumberCountry = 'SE' | 'FI' | 'NO'
export type PersonalIdentityNumberFailure = 'format' | 'date' | 'checkDigit'
export type PersonalIdentityNumberCheck = CheckResult<PersonalIdentityNumberFailure>

export interface PersonalIdentityNumberCheckOptions {
  readonly country: PersonalIdentityNumberCountry
  /**
   * Norway only: also accept the synthetic numbers in Skatteetaten's test registry, where 80 is
   * added to the month. Off by default, so a production form refuses them.
   */
  readonly allowSyntheticNumbers?: boolean
}

const valid: PersonalIdentityNumberCheck = { isValid: true, reason: undefined }
const failure = (reason: PersonalIdentityNumberFailure): PersonalIdentityNumberCheck => ({
  isValid: false,
  reason,
})

/**
 * Sweden (Skatteverket): `YYMMDD-NNNN` or `YYYYMMDD-NNNN`, with `+` instead of `-` from the year
 * the person turns 100. Samordningsnummer add 60 to the day. The last digit is a Luhn check over
 * the ten digits without the century.
 */
function checkSwedish(value: string): PersonalIdentityNumberCheck {
  const match = /^(\d{6}|\d{8})([-+]?)(\d{4})$/.exec(removeWhitespace(value))
  if (match === null) return failure('format')
  const [, datePart = '', separator = '', serial = ''] = match
  const hasCentury = datePart.length === 8
  const century = hasCentury ? Number(datePart.slice(0, 2)) : undefined
  const yy = Number(datePart.slice(-6, -4))
  const month = Number(datePart.slice(-4, -2))
  const rawDay = Number(datePart.slice(-2))

  // Without a century, only a leap day needs one: `+` means born in the 1900s, otherwise the
  // person is under 100, so a year ending in 00 is 2000, which is a leap year, and not 1900.
  const year =
    century === undefined ? (separator === '+' || yy !== 0 ? 1900 + yy : 2000) : century * 100 + yy
  if (century !== undefined && (century < 18 || century > 20)) return failure('date')
  const day = rawDay > 60 ? rawDay - 60 : rawDay
  if (!isCalendarDate(year, month, day)) return failure('date')

  return passesLuhn(`${datePart.slice(-6)}${serial}`) ? valid : failure('checkDigit')
}

const finnishCheckCharacters = '0123456789ABCDEFHJKLMNPRSTUVWXY'
/** `+` is the 1800s, `-` and `U` to `Y` the 1900s, `A` to `F` the 2000s (DVV, since 2023). */
const finnishCenturies: Readonly<Record<string, number>> = {
  '+': 1800,
  '-': 1900,
  U: 1900,
  V: 1900,
  W: 1900,
  X: 1900,
  Y: 1900,
  A: 2000,
  B: 2000,
  C: 2000,
  D: 2000,
  E: 2000,
  F: 2000,
}

/**
 * Finland (DVV): `DDMMYYCNNNX`. `C` is the century sign, `NNN` the individual number (002 to 899
 * for people, 900 to 999 for temporary and test numbers) and `X` is the remainder of the nine
 * digits divided by 31, looked up in `0123456789ABCDEFHJKLMNPRSTUVWXY`.
 */
function checkFinnish(value: string): PersonalIdentityNumberCheck {
  const match = /^(\d{6})([-+A-FU-Y])(\d{3})([0-9A-FHJ-NPR-Y])$/i.exec(removeWhitespace(value))
  if (match === null) return failure('format')
  const [, datePart = '', sign = '', individual = '', checkCharacter = ''] = match
  if (Number(individual) < 2) return failure('format')

  const century = finnishCenturies[sign.toUpperCase()] ?? 0
  const day = Number(datePart.slice(0, 2))
  const month = Number(datePart.slice(2, 4))
  const year = century + Number(datePart.slice(4, 6))
  if (!isCalendarDate(year, month, day)) return failure('date')

  const expected = finnishCheckCharacters.charAt(Number(`${datePart}${individual}`) % 31)
  return expected === checkCharacter.toUpperCase() ? valid : failure('checkDigit')
}

const norwegianFirstWeights = [3, 7, 6, 1, 8, 9, 4, 5, 2]
const norwegianSecondWeights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]

function norwegianCheckDigit(digits: string, weights: readonly number[]): number | undefined {
  const remainder = weightedSum(digits, weights) % 11
  const digit = remainder === 0 ? 0 : 11 - remainder
  // 10 can't be written as one digit: such a number is never issued.
  return digit === 10 ? undefined : digit
}

/** The century of a Norwegian number comes from the individual number and the year (Skatteetaten). */
function norwegianYear(yy: number, individual: number): number {
  if (individual < 500) return 1900 + yy
  if (individual < 750 && yy >= 54) return 1800 + yy
  if (yy < 40) return 2000 + yy
  if (individual >= 900) return 1900 + yy
  // 750 to 899 is for special cases and has no fixed century: use the 1900s.
  return 1900 + yy
}

/**
 * Norway (Skatteetaten): `DDMMYYNNNKK`, 11 digits. D-numbers add 40 to the day, H-numbers add 40
 * to the month, and the synthetic test numbers add 80 to the month. KK are two modulus 11 check
 * digits. The new numbering from 2032 changes the first check digit and is not covered yet.
 */
function checkNorwegian(
  value: string,
  allowSyntheticNumbers: boolean,
): PersonalIdentityNumberCheck {
  const digits = removeWhitespace(value)
  if (!/^\d{11}$/.test(digits)) return failure('format')

  const rawDay = Number(digits.slice(0, 2))
  const rawMonth = Number(digits.slice(2, 4))
  const yy = Number(digits.slice(4, 6))
  const individual = Number(digits.slice(6, 9))

  let month = rawMonth
  if (allowSyntheticNumbers && month > 80) month -= 80
  else if (month > 40) month -= 40 // H-number
  const day = rawDay > 40 ? rawDay - 40 : rawDay // D-number
  if (!isCalendarDate(norwegianYear(yy, individual), month, day)) return failure('date')

  const first = norwegianCheckDigit(digits, norwegianFirstWeights)
  if (first === undefined || first !== Number(digits.charAt(9))) return failure('checkDigit')
  const second = norwegianCheckDigit(digits.slice(0, 10), norwegianSecondWeights)
  return second !== undefined && second === Number(digits.charAt(10))
    ? valid
    : failure('checkDigit')
}

/**
 * Checks a personal identity number, in its formatted or its plain form. It reports why a number
 * fails (`format`, `date` or `checkDigit`), so the form can write a specific message. It never
 * says that the person exists.
 */
export function checkPersonalIdentityNumber(
  value: string,
  options: PersonalIdentityNumberCheckOptions,
): PersonalIdentityNumberCheck {
  switch (options.country) {
    case 'SE':
      return checkSwedish(value)
    case 'FI':
      return checkFinnish(value)
    case 'NO':
      return checkNorwegian(value, options.allowSyntheticNumbers ?? false)
  }
}
