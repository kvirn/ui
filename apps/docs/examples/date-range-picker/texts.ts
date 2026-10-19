import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useDateRangePickerTexts = defineExampleTexts({
  en: {
    legend: 'Dates of your stay',
    from: 'Arrival',
    to: 'Departure',
    hint: (example: string) => `For example ${example}`,
    limit: 'Stays are up to 14 nights, from 14 October 2026.',
    absenceLegend: 'Dates you were away from home',
    firstDay: 'First day away',
    lastDay: 'Last day away',
    hintDayFirst: 'For example 27 10 2026',
    hintYearFirst: 'For example 2026 10 27',
    hallLegend: 'Dates you want to hire the hall',
    hallFrom: 'First day',
    hallTo: 'Last day',
    hallLimit: 'Hire it for at least 2 days, between 14 October and 31 December 2026.',
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
