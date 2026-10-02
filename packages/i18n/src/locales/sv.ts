import type { KvirnMessages } from '../types.ts'

export const sv = {
  link: { newTabNotice: '(öppnas i en ny flik)' },
  field: { optional: '(valfritt)', errorPrefix: 'Fel:' },
  mask: {
    characterNotAllowed: ({ allowed }) =>
      ({
        digits: 'Här kan du bara skriva siffror.',
        letters: 'Här kan du bara skriva bokstäver.',
        lettersAndDigits: 'Här kan du bara skriva bokstäver och siffror.',
        other: 'Det tecknet kan inte skrivas här.',
      })[allowed],
    maximumLength: ({ length }) => `Du har skrivit alla ${length} tecken.`,
  },
} satisfies KvirnMessages
