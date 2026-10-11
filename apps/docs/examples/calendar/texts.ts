import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useCalendarTexts = defineExampleTexts({
  en: {
    chosen: 'Chosen:',
    none: 'no day yet',
    fieldLabel: 'Date of your visit',
    fieldHint: (example: string) => `For example ${example}`,
    closed: 'Closed',
    chosenRange: 'Chosen stay:',
  },
})
