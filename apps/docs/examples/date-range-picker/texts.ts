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
    check: 'Check the dates',
    checked: 'The dates are within the limit.',
    errorMissing: (example: string) =>
      `Enter the arrival and departure dates, for example ${example}.`,
    errorOrder: 'The departure date must be on or after the arrival date.',
    errorTooLong: 'Choose a departure date up to 14 nights after the arrival date.',
  },
})
