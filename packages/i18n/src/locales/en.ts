import type { KvirnMessages } from '../types.ts'

export const en = {
  link: { newTabNotice: '(opens in a new tab)' },
  field: { optional: '(optional)', errorPrefix: 'Error:' },
  notification: {
    infoPrefix: 'Information:',
    successPrefix: 'Success:',
    warningPrefix: 'Warning:',
    dangerPrefix: 'Error:',
  },
  mask: {
    characterNotAllowed: ({ allowed }) =>
      ({
        digits: 'Only digits can be entered here.',
        letters: 'Only letters can be entered here.',
        lettersAndDigits: 'Only letters and digits can be entered here.',
        other: 'That character can’t be entered here.',
      })[allowed],
    maximumLength: ({ length }) => `You’ve entered all ${length} characters.`,
  },
} satisfies KvirnMessages
