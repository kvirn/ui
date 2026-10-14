/** The dates on the example accessibility statement: ISO, so the page formats them for the locale. */
export const kvirnbyStatementDates = { published: '2026-09-01', reviewed: '2026-10-01' } as const

/** The page the feedback form is opened from, prefilled in "Which page" and editable. */
export const kvirnbyReferringAddress = 'https://www.kvirnby.example/preschool'

/** The reference number the example confirmation shows. No message was sent. */
export const kvirnbyFeedbackReference = 'KV-2026-004217'

/** What the example statement lists as not accessible: the problem, why, and when it is fixed. */
export const kvirnbyKnownProblems = [
  {
    problem: 'Some PDF documents on the council pages have no heading structure.',
    reason: 'They were published before the requirements applied.',
    fixed: 'We ask for an accessible version on request and replace the PDFs by 31 March 2027.',
  },
  {
    problem: 'The recorded council meetings have no captions.',
    reason: 'The captioning service is not yet in place.',
    fixed: 'Captions are added from 1 January 2027.',
  },
] as const
