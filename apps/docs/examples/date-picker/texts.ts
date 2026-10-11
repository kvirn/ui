import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useDatePickerTexts = defineExampleTexts({
  en: {
    legend: 'Date of your visit',
    hintDayFirst: 'For example 27 3 2026',
    hintYearFirst: 'For example 2026 3 27',
    fieldLabel: 'Date of your visit',
    fieldHint: (example: string) => `For example ${example}`,
    window: 'You can choose a date from 14 October to 31 December 2026.',
    closed: 'Closed',
    title: 'Choose the date of your visit',
  },
})
