import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useErrorSummaryTexts = defineExampleTexts({
  en: {
    email: 'Email address',
    phone: 'Phone number',
    emailError: 'Enter your email address, for example name@example.com.',
    phoneError: 'Enter your phone number, for example 070 123 45 67.',
    send: 'Send application',
    showSummary: 'Show the error summary',
    hideSummary: 'Hide the error summary',
    sent: 'Your application is sent.',
    nameQuestion: 'What is your name?',
    firstName: 'First name',
    lastName: 'Last name',
    nameError: 'Enter your first and last name.',
    tabTitle: 'Tab title now:',
  },
  sv: {
    email: 'E-postadress',
    phone: 'Telefonnummer',
    emailError: 'Ange din e-postadress, till exempel namn@exempel.se.',
    phoneError: 'Ange ditt telefonnummer, till exempel 070-123 45 67.',
    send: 'Skicka ansökan',
    showSummary: 'Visa felsammanfattningen',
    hideSummary: 'Dölj felsammanfattningen',
    sent: 'Din ansökan är skickad.',
    nameQuestion: 'Vad heter du?',
    firstName: 'Förnamn',
    lastName: 'Efternamn',
    nameError: 'Ange både förnamn och efternamn.',
    tabTitle: 'Flikens titel nu:',
  },
})
