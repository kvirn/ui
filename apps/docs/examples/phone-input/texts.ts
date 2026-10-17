import { defineExampleTexts } from '../../components/local-example-texts.ts'

// 070-174 06 05 is in the series 070-174 06 05 to 99 that PTS reserved for fiction in 2020
// (reported by SVT and Telekomnyheterna; the PTS page itself was not reachable). Finland and
// Norway have no such series that could be found, so no Finnish or Norwegian number is used.
export const usePhoneInputTexts = defineExampleTexts({
  en: {
    label: 'Phone number',
    help: 'If your number isn’t Swedish, start with the country code, for example +358.',
    errorEmpty: 'Enter your phone number',
    errorFormat: 'Enter a phone number using digits, like 070-174 06 05 or +46 70 174 06 05',
    send: 'Send',
    sent: 'Sent.',
    legend: 'Phone number',
    countryLabel: 'Country',
    numberLabel: 'Number',
    nationalHelp: 'The number without the country code, for example 070-174 06 05.',
    formHolds: 'The form holds',
    yourLabel: 'Your phone number',
    otherLabel: 'Phone number of the other guardian',
    otherHelp: 'We use it only to reach them about this application.',
    maskHelp: 'Use digits, spaces, dashes, brackets and a plus sign, for example 070-174 06 05.',
  },
})
