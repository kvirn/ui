import type { KvirnMessages } from '../types.ts'

// Northern Sámi. Every string here is English until a native speaker provides it
// (Plan 0002, listed under Known issues in kvirn-provider.a11y.md).
export const se = {
  // TODO(native-review): Northern Sámi translation of "(opens in a new tab)".
  link: { newTabNotice: '(opens in a new tab)' },
  // TODO(native-review): Northern Sámi translation of "(optional)" and "Error:".
  field: { optional: '(optional)', errorPrefix: 'Error:' },
  // TODO(native-review): Northern Sámi translation of the two mask messages (Plan 0014).
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
