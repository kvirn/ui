import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useAutocompleteTexts = defineExampleTexts({
  en: {
    street: 'Street',
    hint: 'Start typing. You can also write a street that is not in the list.',
    address: 'Address',
    send: 'Send',
    sent: 'Sent',
    entered: 'You entered',
  },
  sv: {
    street: 'Gatuadress',
    hint: 'Börja skriva. Du kan också skriva en gata som inte finns i listan.',
    address: 'Adress',
    send: 'Skicka',
    sent: 'Skickat',
    entered: 'Du har skrivit',
  },
})
