import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useFieldTexts = defineExampleTexts({
  en: {
    fullName: 'Full name',
    email: 'Email address',
    phone: 'Phone number',
    search: 'Search the register',
    send: 'Send application',
    emailDescription: 'We send the decision to this address, so check it before you send.',
    emailHelpText: 'For example name@example.com',
    emailError: 'Enter your email address, for example name@example.com.',
    lockedName: 'Name on the application',
    lockedHelpText: 'You can’t change this here. Contact your case worker to correct it.',
    contactMethod: 'How should we contact you?',
    contactByEmail: 'By email',
    contactByPhone: 'By phone',
    contactHelpText: 'We only use it to tell you about your case.',
  },
  sv: {
    fullName: 'Fullständigt namn',
    email: 'E-postadress',
    phone: 'Telefonnummer',
    search: 'Sök i registret',
    send: 'Skicka ansökan',
    emailDescription:
      'Vi skickar beslutet till den här adressen, så kontrollera den innan du skickar.',
    emailHelpText: 'Till exempel namn@exempel.se',
    emailError: 'Ange din e-postadress, till exempel namn@exempel.se.',
    lockedName: 'Namn på ansökan',
    lockedHelpText: 'Du kan inte ändra det här. Kontakta din handläggare för att rätta det.',
    contactMethod: 'Hur vill du bli kontaktad?',
    contactByEmail: 'Med e-post',
    contactByPhone: 'Per telefon',
    contactHelpText: 'Vi använder det bara för att berätta om ditt ärende.',
  },
})
