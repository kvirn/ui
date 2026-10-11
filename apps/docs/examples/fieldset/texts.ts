import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useFieldsetTexts = defineExampleTexts({
  en: {
    address: 'Postal address',
    street: 'Street address',
    postalCode: 'Postal code',
    city: 'City',
    addressHelpText: 'We send letters about your case to this address.',
    contactPerson: 'Name of your contact person',
    firstName: 'First name',
    lastName: 'Last name',
    nameQuestion: 'What is your name?',
    nameDescription: 'Write it as it is in your passport.',
    nameHelpText: 'Both names are needed to find your case.',
    nameError: 'Enter both your first and your last name.',
    send: 'Send application',
    lockedLegend: 'Applicant',
    lockedHelpText: 'The applicant can’t be changed after the application is sent.',
    applicant: 'Name of the applicant',
  },
})
