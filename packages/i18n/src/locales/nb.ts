import type { KvirnMessages } from '../types.ts'

export const nb = {
  link: { newTabNotice: '(åpnes i en ny fane)' },
  // Draft from the design spec (docs/design/form-fields.md §4.1), for a translator to confirm.
  field: { optional: '(valgfritt)', errorPrefix: 'Feil:' },
  // Draft from the design spec (docs/design/notification.md §4.1), for a translator to confirm.
  notification: {
    infoPrefix: 'Informasjon:',
    successPrefix: 'Fullført:',
    warningPrefix: 'Advarsel:',
    dangerPrefix: 'Feil:',
  },
  // Draft for a translator to confirm.
  mask: {
    characterNotAllowed: ({ allowed }) =>
      ({
        digits: 'Her kan du bare skrive sifre.',
        letters: 'Her kan du bare skrive bokstaver.',
        lettersAndDigits: 'Her kan du bare skrive bokstaver og sifre.',
        other: 'Du kan ikke skrive det tegnet her.',
      })[allowed],
    maximumLength: ({ length }) => `Du har skrevet alle ${length} tegnene.`,
  },
} satisfies KvirnMessages
