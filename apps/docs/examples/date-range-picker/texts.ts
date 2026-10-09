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
  sv: {
    legend: 'Datum för din vistelse',
    from: 'Ankomst',
    to: 'Avresa',
    hint: (example: string) => `Till exempel ${example}`,
    limit: 'Högst 14 nätter.',
    closed: 'Fullbokat',
    title: 'Välj datum för din vistelse',
  },
})
