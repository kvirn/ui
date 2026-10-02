import type { KvirnMessages } from '../types.ts'

export const nn = {
  link: { newTabNotice: '(blir opna i ei ny fane)' },
  // Draft from the design spec (docs/design/form-fields.md §4.1), for a translator to confirm.
  field: { optional: '(valfritt)', errorPrefix: 'Feil:' },
  // Draft from the design spec (docs/design/notification.md §4.1), for a translator to confirm.
  notification: {
    infoPrefix: 'Informasjon:',
    successPrefix: 'Fullført:',
    warningPrefix: 'Åtvaring:',
    dangerPrefix: 'Feil:',
  },
  // Draft for a translator to confirm.
  mask: {
    characterNotAllowed: ({ allowed }) =>
      ({
        digits: 'Her kan du berre skrive siffer.',
        letters: 'Her kan du berre skrive bokstavar.',
        lettersAndDigits: 'Her kan du berre skrive bokstavar og siffer.',
        other: 'Du kan ikkje skrive det teiknet her.',
      })[allowed],
    maximumLength: ({ length }) => `Du har skrive alle ${length} teikna.`,
  },
} satisfies KvirnMessages
