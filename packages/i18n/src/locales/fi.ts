import type { KvirnMessages } from '../types.ts'

export const fi = {
  link: { newTabNotice: '(avautuu uuteen välilehteen)' },
  // Draft from the design spec (docs/design/form-fields.md §4.1), for a translator to confirm.
  field: { optional: '(vapaaehtoinen)', errorPrefix: 'Virhe:' },
} satisfies KvirnMessages
