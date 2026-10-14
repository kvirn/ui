import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useNumberInputTexts = defineExampleTexts({
  en: {
    children: 'Number of children under 18',
    people: 'Number of people in your booking',
    peopleHint: 'Enter a whole number from 1 to 8.',
    hours: 'Working hours per week',
    hoursHint: (example: string) => `Enter the hours as a number, for example ${example}.`,
    valueToSend: 'The value your form sends',
    rentInCrowns: 'Monthly rent in kronor',
    unit: 'kr',
    result: 'Business profit or loss last year',
    resultHint: 'Write a loss with a minus sign, for example -8450.',
    pasted: 'Total project costs from your budget',
    pastedHint: 'Paste or type the amount as it is. We read it when you send the form.',
    errorRange: 'Enter a whole number from 1 to 8',
    send: 'Send',
  },
})

/** A number written the way the page's language writes it, for a help text's example. */
export const exampleHours = (locale: string) =>
  new Intl.NumberFormat(locale, { minimumFractionDigits: 1 }).format(37.5)
