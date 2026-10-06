import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useTextInputTexts = defineExampleTexts({
  en: {
    fullName: 'Full name',
    email: 'Email address',
    phone: 'Phone number',
    website: 'Website',
    postalCode: 'Postal code',
    postalCodeHelpText: 'Five digits, for example 123 45',
    houseNumber: 'House number',
    street: 'Street address',
    youTyped: 'You typed',
    unmasked: 'Without the space',
    send: 'Send application',
    sent: 'Sent',
  },
  sv: {
    fullName: 'Fullständigt namn',
    email: 'E-postadress',
    phone: 'Telefonnummer',
    website: 'Webbplats',
    postalCode: 'Postnummer',
    postalCodeHelpText: 'Fem siffror, till exempel 123 45',
    houseNumber: 'Gatunummer',
    street: 'Gatuadress',
    youTyped: 'Du skrev',
    unmasked: 'Utan mellanslag',
    send: 'Skicka ansökan',
    sent: 'Skickat',
  },
})
