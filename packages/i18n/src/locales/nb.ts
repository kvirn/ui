import type { KvirnMessages } from '../types.ts'

export const nb = {
  link: { newTabNotice: '(åpnes i en ny fane)' },
  // Draft from the design spec (docs/design/form-fields.md §4.1), for a translator to confirm.
  field: { optional: '(valgfritt)', errorPrefix: 'Feil:' },
} satisfies KvirnMessages
