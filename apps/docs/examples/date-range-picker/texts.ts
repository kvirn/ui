import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useDateRangePickerTexts = defineExampleTexts({
  en: {
    legend: 'Dates of your stay',
    from: 'Arrival',
    to: 'Departure',
    hint: (example: string) => `For example ${example}`,
    limit: 'Up to 14 nights.',
    closed: 'Fully booked',
    title: 'Choose the dates of your stay',
  },
})
