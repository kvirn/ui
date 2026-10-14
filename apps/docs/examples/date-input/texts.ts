import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useDateInputTexts = defineExampleTexts({
  en: {
    legend: 'Date of birth',
    visitLegend: 'Date of your visit',
    hintDayFirst: 'For example 27 3 2007',
    hintYearFirst: 'For example 2007 3 27',
    oneFieldLabel: 'Start date',
    oneFieldHint: (example: string) => `For example ${example}`,
    birthYear: 'Year of birth',
    digitsOnly: 'Only digits can be typed here. The separators between them are added for you.',
    readOnlyReason: 'You can’t change this date here. It comes from the application.',
    errorYear: 'The year must have four digits',
    send: 'Send',
    sent: 'Sent:',
    youEntered: 'The form state holds:',
  },
})
