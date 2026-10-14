export interface KvirnbyPersonalDataPurpose {
  purpose: string
  legalBasis: string
  keptFor: string
}

/** The rows of the Privacy page's table: what Kvirnby municipality collects, on what basis and for how long. */
export const kvirnbyPersonalDataPurposes: readonly KvirnbyPersonalDataPurpose[] = [
  {
    purpose: 'Handle your application for a preschool place',
    legalBasis: 'Public task',
    keptFor: 'Until the place ends, then 2 years',
  },
  {
    purpose: 'Answer your message to the contact centre',
    legalBasis: 'Public task',
    keptFor: '12 months after the case is closed',
  },
  {
    purpose: 'Send the newsletter you signed up for',
    legalBasis: 'Consent',
    keptFor: 'Until you unsubscribe',
  },
  {
    purpose: 'Keep an account on My pages',
    legalBasis: 'Public task',
    keptFor: 'Until you close the account',
  },
]
