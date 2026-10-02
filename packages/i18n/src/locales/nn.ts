import type { KvirnMessages } from '../types.ts'

export const nn = {
  link: { newTabNotice: '(blir opna i ei ny fane)' },
  // Draft from the design spec (docs/design/form-fields.md §4.1), for a translator to confirm.
  field: { optional: '(valfritt)', errorPrefix: 'Feil:' },
} satisfies KvirnMessages
