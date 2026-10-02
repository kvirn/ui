import type { CheckResult } from '../mask-types.ts'
import { passesLuhn, removeWhitespace, weightedSum } from './check-support.ts'

export type OrganisationNumberCountry = 'SE' | 'FI' | 'NO'
export type OrganisationNumberFailure = 'format' | 'checkDigit'
export type OrganisationNumberCheck = CheckResult<OrganisationNumberFailure>

export interface OrganisationNumberCheckOptions {
  readonly country: OrganisationNumberCountry
}

const valid: OrganisationNumberCheck = { isValid: true, reason: undefined }
const failure = (reason: OrganisationNumberFailure): OrganisationNumberCheck => ({
  isValid: false,
  reason,
})

/**
 * Sweden: `NNNNNN-NNNN`, ten digits with a Luhn check digit. A sole trader's organisation number
 * is the personal identity number, so the third digit isn't tested.
 */
function checkSwedish(value: string): OrganisationNumberCheck {
  const digits = removeWhitespace(value)
  const match = /^(\d{6})-?(\d{4})$/.exec(digits)
  if (match === null) return failure('format')
  return passesLuhn(`${match[1]}${match[2]}`) ? valid : failure('checkDigit')
}

const finnishWeights = [7, 9, 10, 5, 8, 4, 2]

/**
 * Finland, the Y-tunnus: `NNNNNNN-C`, seven digits and a check digit from modulus 11. A number
 * with six digits, from before the seven-digit form, is padded with a zero.
 */
function checkFinnish(value: string): OrganisationNumberCheck {
  const match = /^(\d{6,7})-?(\d)$/.exec(removeWhitespace(value))
  if (match === null) return failure('format')
  const digits = (match[1] ?? '').padStart(7, '0')
  const remainder = weightedSum(digits, finnishWeights) % 11
  if (remainder === 1) return failure('checkDigit')
  const expected = remainder === 0 ? 0 : 11 - remainder
  return expected === Number(match[2]) ? valid : failure('checkDigit')
}

const norwegianWeights = [3, 2, 7, 6, 5, 4, 3, 2]

/** Norway: nine digits, the last a modulus 11 check digit. Often written `NNN NNN NNN`. */
function checkNorwegian(value: string): OrganisationNumberCheck {
  const digits = removeWhitespace(value)
  if (!/^\d{9}$/.test(digits)) return failure('format')
  const remainder = weightedSum(digits, norwegianWeights) % 11
  const expected = remainder === 0 ? 0 : 11 - remainder
  return expected === Number(digits.charAt(8)) ? valid : failure('checkDigit')
}

/**
 * Checks an organisation number, in its formatted or its plain form. It reports why a number
 * fails (`format` or `checkDigit`). It never says that the organisation exists.
 */
export function checkOrganisationNumber(
  value: string,
  options: OrganisationNumberCheckOptions,
): OrganisationNumberCheck {
  switch (options.country) {
    case 'SE':
      return checkSwedish(value)
    case 'FI':
      return checkFinnish(value)
    case 'NO':
      return checkNorwegian(value)
  }
}
