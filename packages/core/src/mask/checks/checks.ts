import { checkIban } from './iban.ts'
import { checkOrganisationNumber } from './organisation-number.ts'
import { checkPersonalIdentityNumber } from './personal-identity-number.ts'

/**
 * Checks for the consumer to call when it validates (ADR-0029, ADR-0032 item 4). A mask never
 * blocks a value on these, because the user may still be typing. Each returns
 * `{ isValid, reason }`, so the form can write a specific error message.
 */
export const checks = {
  personalIdentityNumber: checkPersonalIdentityNumber,
  organisationNumber: checkOrganisationNumber,
  iban: checkIban,
}
