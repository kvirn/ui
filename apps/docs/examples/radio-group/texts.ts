import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useRadioGroupTexts = defineExampleTexts({
  en: {
    legend: 'How long do you need the permit?',
    allRequired: 'Every question must be answered unless it says (optional).',
    hint: 'Choose the period that matches your project.',
    oneMonth: '1 month',
    sixMonths: '6 months',
    twelveMonths: '12 months',
    sixMonthsHelp: 'The most common choice for a building project.',
    unavailable: '24 months',
    unavailableHelp: 'Not available for this kind of permit.',
    groupHelp: 'You can apply for an extension later.',
    youChose: 'You chose',
    nothing: 'nothing yet',
    send: 'Send',
    sent: 'Sent',
    errorMissing: 'Choose how long you need the permit.',
    sourceLegend: 'How did you hear about the service?',
    sourceLetter: 'A letter from the municipality',
    sourceColleague: 'A colleague',
    sourceOther: 'Other',
    sourceSpecify: 'Please specify',
    revealShown: 'A box for your own words has opened below.',
  },
})
