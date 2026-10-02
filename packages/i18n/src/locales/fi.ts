import type { KvirnMessages } from '../types.ts'

export const fi = {
  link: { newTabNotice: '(avautuu uuteen välilehteen)' },
  // Draft from the design spec (docs/design/form-fields.md §4.1), for a translator to confirm.
  field: { optional: '(vapaaehtoinen)', errorPrefix: 'Virhe:' },
  // Draft from the design spec (docs/design/notification.md §4.1), for a translator to confirm.
  notification: {
    infoPrefix: 'Tiedoksi:',
    successPrefix: 'Valmis:',
    warningPrefix: 'Varoitus:',
    dangerPrefix: 'Virhe:',
  },
  // Draft for a translator to confirm.
  mask: {
    characterNotAllowed: ({ allowed }) =>
      ({
        digits: 'Tähän voi kirjoittaa vain numeroita.',
        letters: 'Tähän voi kirjoittaa vain kirjaimia.',
        lettersAndDigits: 'Tähän voi kirjoittaa vain kirjaimia ja numeroita.',
        other: 'Tätä merkkiä ei voi kirjoittaa tähän.',
      })[allowed],
    maximumLength: ({ length }) => `Olet kirjoittanut kaikki ${length} merkkiä.`,
  },
} satisfies KvirnMessages
