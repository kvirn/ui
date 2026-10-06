import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useDateInputTexts = defineExampleTexts({
  en: {
    legend: 'Date of birth',
    visitLegend: 'Date of your visit',
    hintDayFirst: 'For example 27 3 2007',
    hintYearFirst: 'For example 2007 3 27',
    errorYear: 'The year must have four digits',
    send: 'Send',
    sent: 'Sent:',
    youEntered: 'The form state holds:',
  },
  sv: {
    legend: 'Födelsedatum',
    visitLegend: 'Datum för ditt besök',
    hintDayFirst: 'Till exempel 27 3 2007',
    hintYearFirst: 'Till exempel 2007 3 27',
    errorYear: 'Året måste ha fyra siffror',
    send: 'Skicka',
    sent: 'Skickat:',
    youEntered: 'Formulärets state har:',
  },
})
