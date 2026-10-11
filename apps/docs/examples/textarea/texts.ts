import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useTextareaTexts = defineExampleTexts({
  en: {
    label: 'Describe your situation',
    description: 'Tell us what has happened and what you need help with.',
    errorEmpty: 'Describe your situation',
    errorTooLong: (limit: number) =>
      `The description can be at most ${limit} characters. Remove some text.`,
    send: 'Send',
    restoreDraft: 'Restore saved draft',
    draft: 'I received a letter about my housing allowance and I do not understand what to do.',
    lineBreakHint: 'Our case system counts a line break as two characters, and so does the count.',
    summaryLabel: 'Short summary',
    summaryHint: 'One sentence, for the case list.',
  },
})
