import { defineExampleTexts } from '../../components/local-example-texts.ts'

// Kvirnby is a made-up municipality. The postal codes are format examples only: no official
// series of fictional postal codes was found.
export const useAddressInputTexts = defineExampleTexts({
  en: {
    legend: 'Your address',
    street: 'Street address',
    line2: 'Address line 2',
    line2Help: 'For example c/o and a name',
    postalCode: 'Postal code',
    postalCodeHelp: 'For example 123 45',
    city: 'Town or city',
    errorStreet: 'Enter your street address',
    errorPostalCode: 'Enter a postal code with 5 digits, like 123 45',
    errorCity: 'Enter your town or city',
    errorNotFound: 'We couldn’t find this address. Check the street address and postal code.',
    send: 'Send',
    check: 'Check the address',
    sent: 'Sent.',
    country: 'Country',
    addressTerm: 'Address',
    addressValue: 'Storgatan 12, 123 45 Kvirnby',
    streetValue: 'Storgatan 12',
    postalCodeValue: '123 45',
    cityValue: 'Kvirnby',
    incompletePostalCode: '123 4',
  },
})

/**
 * The countries of the choice, as module constants because a Listbox compares items by identity.
 * Proper nouns and format examples, so the same on every page.
 */
export interface AddressCountry {
  code: string
  name: string
  postalCodeHelp: string
}

export const addressCountries: readonly AddressCountry[] = [
  { code: 'SE', name: 'Sweden', postalCodeHelp: 'For example 123 45' },
  { code: 'FI', name: 'Finland', postalCodeHelp: 'For example 00100' },
  { code: 'NO', name: 'Norway', postalCodeHelp: 'For example 1234' },
  { code: 'DE', name: 'Germany', postalCodeHelp: 'For example 12345' },
]
