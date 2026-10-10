import { en } from '@kvirn-ui/i18n/en'
import { nb } from '@kvirn-ui/i18n/nb'
import { nn } from '@kvirn-ui/i18n/nn'
import { sv } from '@kvirn-ui/i18n/sv'
import {
  Button,
  checks,
  Field,
  KvirnProvider,
  masks,
  mergeProps,
  TextInput,
  useMask,
} from '@kvirn-ui/react'
import type { TextInputChangeDetails } from '@kvirn-ui/react'
import type { FormLocale } from '../form/form.fixture.tsx'
import type { Decorator } from '@storybook/react-vite'
import { useState } from 'react'
import { codeTextsFor } from '../one-time-code/one-time-code.fixture.tsx'

// Story fixture for Components/Form/Mask (Plan 0014). sv, nb, nn and en
// are written here. fi and The numbers are the published test numbers from packages/core/src/mask/checks
// tests (Skatteverket, DVV, Skatteetaten, the SWIFT registry), never real people's.
//
// KvirnUI holds no form state. The mask shapes what is typed, and the form
// below it validates, here with the `checks.*` helpers on submit.

export type MaskLocale = 'sv' | 'nb' | 'nn' | 'en'

export interface MaskTexts {
  personalIdentityNumber: string
  personalIdentityNumberHint: string
  personalIdentityNumberFi: string
  personalIdentityNumberFiHint: string
  personalIdentityNumberNo: string
  personalIdentityNumberNoHint: string
  organisationNumber: string
  organisationNumberHint: string
  postalCode: string
  postalCodeHint: string
  iban: string
  ibanHint: string
  digits: string
  digitsHint: string
  letters: string
  lettersHint: string
  lettersAndDigits: string
  lettersAndDigitsHint: string
  email: string
  emailHint: string
  telephone: string
  telephoneHint: string
  caseNumber: string
  caseNumberHint: string
  registration: string
  registrationHint: string
  amount: string
  amountHint: string
  amountOutOfRange: string
  amountInRange: string
  temperature: string
  temperatureHint: string
  send: string
  sent: string
  checkFormat: string
  checkDate: string
  checkDigit: string
  checkAdvice: string
  unmasked: string
  complete: string
  yes: string
  no: string
  stored: string
  storedHint: string
  ownInput: string
  ownInputHint: string
  quiet: string
  quietHint: string
  organisationNumberFi: string
  organisationNumberFiHint: string
  organisationNumberNo: string
  organisationNumberNoHint: string
  postalCodeFi: string
  postalCodeFiHint: string
  postalCodeNo: string
  postalCodeNoHint: string
  /** The error for a check that fails with `format`, whichever number it checks. */
  checkFormatGeneric: string
  /** The error for a check digit or check character that doesn't match. */
  checkControl: string
  /** The error for an IBAN whose country code is not in the registry. */
  checkCountry: string
  /** The sentence that says a form also takes the test registry's numbers. */
  syntheticNote: string
  customerNumber: string
  customerNumberHint: string
  accountNumber: string
  accountNumberHint: string
  bookingCode: string
  bookingCodeHint: string
  groupedAmount: string
  groupedAmountHint: (example: string) => string
  finnishAmount: string
  finnishAmountHint: (example: string) => string
  storedAmount: string
  /** The message a field shows and announces instead of the library's own (`messages` override). */
  ownRejection: string
  rejected: string
  /** A note outside the Field, linked to the input with the input's own `aria-describedby`. */
  describedByNote: string
}

const textsSv: MaskTexts = {
  personalIdentityNumber: 'Personnummer',
  personalIdentityNumberHint:
    'Tio eller tolv siffror, till exempel 19900101-2385. Du kan skriva med eller utan bindestreck.',
  personalIdentityNumberFi: 'Henkilötunnus',
  personalIdentityNumberFiHint: 'Till exempel 131052-308T. Bokstäverna blir stora automatiskt.',
  personalIdentityNumberNo: 'Fødselsnummer',
  personalIdentityNumberNoHint: 'Elva siffror, till exempel 01019049961.',
  organisationNumber: 'Organisationsnummer',
  organisationNumberHint: 'Tio siffror, till exempel 556000-0001.',
  postalCode: 'Postnummer',
  postalCodeHint: 'Fem siffror, till exempel 123 45.',
  iban: 'IBAN',
  ibanHint: 'Till exempel SE45 5000 0000 0583 9825 7466. Mellanrummen sätts ut åt dig.',
  digits: 'Kod med sex siffror',
  digitsHint: 'Bara siffror. Till exempel 004512.',
  letters: 'Bokstäver',
  lettersHint: 'Bara bokstäver, till exempel Åsa. Använd inte för namn: namn kan ha mellanslag.',
  lettersAndDigits: 'Bokstäver och siffror',
  lettersAndDigitsHint: 'Bara bokstäver och siffror, till exempel A1B2C3.',
  email: 'E-postadress',
  emailHint: 'Mellanrum tas bort. Formatet kontrolleras av formuläret, inte av masken.',
  telephone: 'Telefonnummer',
  telephoneHint:
    'Siffror, plus, mellanrum, bindestreck och parentes. Till exempel +46 70 123 45 67.',
  caseNumber: 'Ärendenummer',
  caseNumberHint: 'Två bokstäver och fyra siffror, till exempel AB-1234.',
  registration: 'Registreringsnummer',
  registrationHint: 'Tre bokstäver och tre siffror, till exempel ABC123.',
  amount: 'Hur mycket hyra betalar du per månad?',
  amountHint: 'Skriv beloppet i kronor, till exempel 1250,50. Det ska vara mellan 0 och 100 000.',
  amountOutOfRange: 'Beloppet är utanför 0 till 100 000. Vi ändrar det inte åt dig.',
  amountInRange: 'Beloppet är inom intervallet.',
  temperature: 'Temperatur i grader',
  temperatureHint: 'Du kan skriva minus, till exempel -4,5.',
  send: 'Skicka',
  sent: 'Skickat',
  checkFormat: 'Ange tolv siffror, till exempel 19900101-2385',
  checkDate: 'Datumet i personnumret finns inte. Kontrollera årtal, månad och dag.',
  checkDigit: 'Sista siffran stämmer inte. Kontrollera numret.',
  checkAdvice:
    'Masken formar bara det du skriver. Siffrorna kontrolleras när du skickar, med checks.personalIdentityNumber.',
  unmasked: 'Utan bindestreck',
  complete: 'Komplett',
  yes: 'ja',
  no: 'nej',
  stored: 'Sparat personnummer',
  storedHint: 'Det sparade värdet är 199001012385. Fältet visar det formaterat.',
  ownInput: 'Eget fält med useMask',
  ownInputHint:
    'Ett eget <input> med masken useMask. Två bokstäver och fyra siffror, till exempel AB-1234.',
  quiet: 'Tyst fält',
  quietHint:
    'Bara siffror. Det här fältet säger inget högt när ett tecken nekas (announceRejections av).',
  organisationNumberFi: 'Organisationsnummer (Finland)',
  organisationNumberFiHint:
    'Sju siffror, bindestreck och en kontrollsiffra, till exempel 0112038-9.',
  organisationNumberNo: 'Organisasjonsnummer (Norge)',
  organisationNumberNoHint: 'Nio siffror, till exempel 974 760 673.',
  postalCodeFi: 'Postnummer (Finland)',
  postalCodeFiHint: 'Fem siffror, till exempel 00100.',
  postalCodeNo: 'Postnummer (Norge)',
  postalCodeNoHint: 'Fyra siffror, till exempel 0150.',
  checkFormatGeneric: 'Numret har fel antal siffror eller tecken. Kontrollera numret.',
  checkControl: 'Kontrollsiffran stämmer inte. Kontrollera numret.',
  checkCountry: 'Landskoden i IBAN-numret finns inte. Kontrollera de två första bokstäverna.',
  syntheticNote: 'Formuläret godtar också testnummer från Skatteetatens testregister.',
  customerNumber: 'Kundnummer',
  customerNumberHint: 'Åtta eller tio siffror. Under fältet står om numret är komplett.',
  accountNumber: 'Kontonummer',
  accountNumberHint:
    'Minst åtta siffror. Du får skriva mellanrum och bindestreck, men de sparas inte.',
  bookingCode: 'Bokningskod',
  bookingCodeHint:
    'Börjar alltid med 9, sedan två bokstäver eller siffror, ett bindestreck och tre siffror, till exempel 9K2-407. Bokstäverna blir stora automatiskt.',
  groupedAmount: 'Belopp, skrivet på sidans språk',
  groupedAmountHint: (example) =>
    `Skriv beloppet i kronor, till exempel ${example}. Tusentalen och decimaltecknet följer sidans språk.`,
  finnishAmount: 'Belopp, alltid skrivet på finska',
  finnishAmountHint: (example) =>
    `Skriv beloppet i euro, till exempel ${example}. Fältet har alltid finskt decimaltecken, också när sidan är på ett annat språk.`,
  storedAmount: 'Sparat belopp 1250000.5 visat på sidans språk',
  ownRejection: 'Skriv bara siffror, utan bokstäver eller mellanrum.',
  rejected: 'Utelämnade tecken',
  describedByNote: 'Du hittar numret överst i brevet från oss, bredvid datumet.',
}

const textsNb: MaskTexts = {
  personalIdentityNumber: 'Personnummer',
  personalIdentityNumberHint:
    'Ti eller tolv siffer, for eksempel 19900101-2385. Du kan skrive med eller uten bindestrek.',
  personalIdentityNumberFi: 'Henkilötunnus',
  personalIdentityNumberFiHint: 'For eksempel 131052-308T. Bokstavene blir store automatisk.',
  personalIdentityNumberNo: 'Fødselsnummer',
  personalIdentityNumberNoHint: 'Elleve siffer, for eksempel 01019049961.',
  organisationNumber: 'Organisasjonsnummer',
  organisationNumberHint: 'Ti siffer, for eksempel 556000-0001.',
  postalCode: 'Postnummer',
  postalCodeHint: 'Fem siffer, for eksempel 123 45.',
  iban: 'IBAN',
  ibanHint: 'For eksempel SE45 5000 0000 0583 9825 7466. Mellomrommene settes inn for deg.',
  digits: 'Kode med seks siffer',
  digitsHint: 'Bare siffer. For eksempel 004512.',
  letters: 'Bokstaver',
  lettersHint: 'Bare bokstaver, for eksempel Åse. Ikke bruk det til navn: navn kan ha mellomrom.',
  lettersAndDigits: 'Bokstaver og siffer',
  lettersAndDigitsHint: 'Bare bokstaver og siffer, for eksempel A1B2C3.',
  email: 'E-postadresse',
  emailHint: 'Mellomrom fjernes. Skjemaet kontrollerer formatet, ikke masken.',
  telephone: 'Telefonnummer',
  telephoneHint: 'Siffer, pluss, mellomrom, bindestrek og parentes. For eksempel +47 912 34 567.',
  caseNumber: 'Saksnummer',
  caseNumberHint: 'To bokstaver og fire siffer, for eksempel AB-1234.',
  registration: 'Registreringsnummer',
  registrationHint: 'Tre bokstaver og tre siffer, for eksempel ABC123.',
  amount: 'Hvor mye betaler du i husleie hver måned?',
  amountHint: 'Skriv beløpet i kroner, for eksempel 1250,50. Det skal være mellom 0 og 100 000.',
  amountOutOfRange: 'Beløpet er utenfor 0 til 100 000. Vi endrer det ikke for deg.',
  amountInRange: 'Beløpet er innenfor intervallet.',
  temperature: 'Temperatur i grader',
  temperatureHint: 'Du kan skrive minus, for eksempel -4,5.',
  send: 'Send',
  sent: 'Sendt',
  checkFormat: 'Skriv tolv siffer, for eksempel 19900101-2385',
  checkDate: 'Datoen i personnummeret finnes ikke. Kontroller år, måned og dag.',
  checkDigit: 'Det siste sifferet stemmer ikke. Kontroller nummeret.',
  checkAdvice:
    'Masken former bare det du skriver. Sifrene kontrolleres når du sender, med checks.personalIdentityNumber.',
  unmasked: 'Uten bindestrek',
  complete: 'Fullstendig',
  yes: 'ja',
  no: 'nei',
  stored: 'Lagret personnummer',
  storedHint: 'Den lagrede verdien er 199001012385. Feltet viser nummeret formatert.',
  ownInput: 'Eget felt med useMask',
  ownInputHint:
    'Et eget <input> med masken useMask. To bokstaver og fire siffer, for eksempel AB-1234.',
  quiet: 'Stille felt',
  quietHint:
    'Bare siffer. Dette feltet sier ingenting høyt når et tegn nektes (announceRejections av).',
  organisationNumberFi: 'Organisasjonsnummer (Finland)',
  organisationNumberFiHint: 'Sju siffer, bindestrek og et kontrollsiffer, for eksempel 0112038-9.',
  organisationNumberNo: 'Organisasjonsnummer (Norge)',
  organisationNumberNoHint: 'Ni siffer, for eksempel 974 760 673.',
  postalCodeFi: 'Postnummer (Finland)',
  postalCodeFiHint: 'Fem siffer, for eksempel 00100.',
  postalCodeNo: 'Postnummer (Norge)',
  postalCodeNoHint: 'Fire siffer, for eksempel 0150.',
  checkFormatGeneric: 'Nummeret har feil antall siffer eller tegn. Kontroller nummeret.',
  checkControl: 'Kontrollsifferet stemmer ikke. Kontroller nummeret.',
  checkCountry: 'Landskoden i IBAN-nummeret finnes ikke. Kontroller de to første bokstavene.',
  syntheticNote: 'Skjemaet godtar også testnumre fra Skatteetatens testregister.',
  customerNumber: 'Kundenummer',
  customerNumberHint: 'Åtte eller ti siffer. Under feltet står det om nummeret er komplett.',
  accountNumber: 'Kontonummer',
  accountNumberHint:
    'Minst åtte siffer. Du kan skrive mellomrom og bindestrek, men de lagres ikke.',
  bookingCode: 'Bestillingskode',
  bookingCodeHint:
    'Starter alltid med 9, så to bokstaver eller siffer, en bindestrek og tre siffer, for eksempel 9K2-407. Bokstavene blir store automatisk.',
  groupedAmount: 'Beløp, skrevet på sidens språk',
  groupedAmountHint: (example) =>
    `Skriv beløpet i kroner, for eksempel ${example}. Tusenskilletegn og desimaltegn følger sidens språk.`,
  finnishAmount: 'Beløp, alltid skrevet på finsk',
  finnishAmountHint: (example) =>
    `Skriv beløpet i euro, for eksempel ${example}. Feltet har alltid finsk desimaltegn, også når siden er på et annet språk.`,
  storedAmount: 'Lagret beløp 1250000.5 vist på sidens språk',
  ownRejection: 'Skriv bare siffer, uten bokstaver eller mellomrom.',
  rejected: 'Utelatte tegn',
  describedByNote: 'Du finner nummeret øverst i brevet fra oss, ved siden av datoen.',
}

const textsNn: MaskTexts = {
  personalIdentityNumber: 'Personnummer',
  personalIdentityNumberHint:
    'Ti eller tolv siffer, til dømes 19900101-2385. Du kan skrive med eller utan bindestrek.',
  personalIdentityNumberFi: 'Henkilötunnus',
  personalIdentityNumberFiHint: 'Til dømes 131052-308T. Bokstavane blir store automatisk.',
  personalIdentityNumberNo: 'Fødselsnummer',
  personalIdentityNumberNoHint: 'Elleve siffer, til dømes 01019049961.',
  organisationNumber: 'Organisasjonsnummer',
  organisationNumberHint: 'Ti siffer, til dømes 556000-0001.',
  postalCode: 'Postnummer',
  postalCodeHint: 'Fem siffer, til dømes 123 45.',
  iban: 'IBAN',
  ibanHint: 'Til dømes SE45 5000 0000 0583 9825 7466. Mellomromma blir sette inn for deg.',
  digits: 'Kode med seks siffer',
  digitsHint: 'Berre siffer. Til dømes 004512.',
  letters: 'Bokstavar',
  lettersHint: 'Berre bokstavar, til dømes Åse. Ikkje bruk det til namn: namn kan ha mellomrom.',
  lettersAndDigits: 'Bokstavar og siffer',
  lettersAndDigitsHint: 'Berre bokstavar og siffer, til dømes A1B2C3.',
  email: 'E-postadresse',
  emailHint: 'Mellomrom blir fjerna. Skjemaet kontrollerer formatet, ikkje masken.',
  telephone: 'Telefonnummer',
  telephoneHint: 'Siffer, pluss, mellomrom, bindestrek og parentes. Til dømes +47 912 34 567.',
  caseNumber: 'Saksnummer',
  caseNumberHint: 'To bokstavar og fire siffer, til dømes AB-1234.',
  registration: 'Registreringsnummer',
  registrationHint: 'Tre bokstavar og tre siffer, til dømes ABC123.',
  amount: 'Kor mykje betaler du i husleige kvar månad?',
  amountHint: 'Skriv beløpet i kroner, til dømes 1250,50. Det skal vere mellom 0 og 100 000.',
  amountOutOfRange: 'Beløpet er utanfor 0 til 100 000. Vi endrar det ikkje for deg.',
  amountInRange: 'Beløpet er innanfor intervallet.',
  temperature: 'Temperatur i grader',
  temperatureHint: 'Du kan skrive minus, til dømes -4,5.',
  send: 'Send',
  sent: 'Sendt',
  checkFormat: 'Skriv tolv siffer, til dømes 19900101-2385',
  checkDate: 'Datoen i personnummeret finst ikkje. Kontroller år, månad og dag.',
  checkDigit: 'Det siste sifferet stemmer ikkje. Kontroller nummeret.',
  checkAdvice:
    'Masken formar berre det du skriv. Sifra blir kontrollerte når du sender, med checks.personalIdentityNumber.',
  unmasked: 'Utan bindestrek',
  complete: 'Fullstendig',
  yes: 'ja',
  no: 'nei',
  stored: 'Lagra personnummer',
  storedHint: 'Den lagra verdien er 199001012385. Feltet viser nummeret formatert.',
  ownInput: 'Eige felt med useMask',
  ownInputHint:
    'Eit eige <input> med masken useMask. To bokstavar og fire siffer, til dømes AB-1234.',
  quiet: 'Stille felt',
  quietHint:
    'Berre siffer. Dette feltet seier ingenting høgt når eit teikn blir nekta (announceRejections av).',
  organisationNumberFi: 'Organisasjonsnummer (Finland)',
  organisationNumberFiHint: 'Sju siffer, bindestrek og eit kontrollsiffer, til dømes 0112038-9.',
  organisationNumberNo: 'Organisasjonsnummer (Noreg)',
  organisationNumberNoHint: 'Ni siffer, til dømes 974 760 673.',
  postalCodeFi: 'Postnummer (Finland)',
  postalCodeFiHint: 'Fem siffer, til dømes 00100.',
  postalCodeNo: 'Postnummer (Noreg)',
  postalCodeNoHint: 'Fire siffer, til dømes 0150.',
  checkFormatGeneric: 'Nummeret har feil tal på siffer eller teikn. Kontroller nummeret.',
  checkControl: 'Kontrollsifferet stemmer ikkje. Kontroller nummeret.',
  checkCountry: 'Landskoden i IBAN-nummeret finst ikkje. Kontroller dei to første bokstavane.',
  syntheticNote: 'Skjemaet godtek også testnummer frå testregisteret til Skatteetaten.',
  customerNumber: 'Kundenummer',
  customerNumberHint: 'Åtte eller ti siffer. Under feltet står det om nummeret er komplett.',
  accountNumber: 'Kontonummer',
  accountNumberHint:
    'Minst åtte siffer. Du kan skrive mellomrom og bindestrek, men dei blir ikkje lagra.',
  bookingCode: 'Bestillingskode',
  bookingCodeHint:
    'Startar alltid med 9, så to bokstavar eller siffer, ein bindestrek og tre siffer, til dømes 9K2-407. Bokstavane blir store automatisk.',
  groupedAmount: 'Beløp, skrive på språket til sida',
  groupedAmountHint: (example) =>
    `Skriv beløpet i kroner, til dømes ${example}. Tusenskiljeteikn og desimalteikn følgjer språket til sida.`,
  finnishAmount: 'Beløp, alltid skrive på finsk',
  finnishAmountHint: (example) =>
    `Skriv beløpet i euro, til dømes ${example}. Feltet har alltid finsk desimalteikn, også når sida er på eit anna språk.`,
  storedAmount: 'Lagra beløp 1250000.5 vist på språket til sida',
  ownRejection: 'Skriv berre siffer, utan bokstavar eller mellomrom.',
  rejected: 'Utelatne teikn',
  describedByNote: 'Du finn nummeret øvst i brevet frå oss, ved sida av datoen.',
}

const textsEn: MaskTexts = {
  personalIdentityNumber: 'Personal identity number',
  personalIdentityNumberHint:
    'Ten or twelve digits, for example 19900101-2385. You can type it with or without a hyphen.',
  personalIdentityNumberFi: 'Personal identity code (Finland)',
  personalIdentityNumberFiHint: 'For example 131052-308T. The letters become capitals as you type.',
  personalIdentityNumberNo: 'Personal identity number (Norway)',
  personalIdentityNumberNoHint: 'Eleven digits, for example 01019049961.',
  organisationNumber: 'Organisation number',
  organisationNumberHint: 'Ten digits, for example 556000-0001.',
  postalCode: 'Postcode',
  postalCodeHint: 'Five digits, for example 123 45.',
  iban: 'IBAN',
  ibanHint: 'For example SE45 5000 0000 0583 9825 7466. The spaces are added for you.',
  digits: 'Six-digit code',
  digitsHint: 'Digits only. For example 004512.',
  letters: 'Letters',
  lettersHint: 'Letters only, for example Åsa. Don’t use it for names: names can have spaces.',
  lettersAndDigits: 'Letters and digits',
  lettersAndDigitsHint: 'Letters and digits only, for example A1B2C3.',
  email: 'Email address',
  emailHint: 'Spaces are removed. Your form checks the format, not the mask.',
  telephone: 'Phone number',
  telephoneHint: 'Digits, plus, spaces, hyphens and brackets. For example +46 70 123 45 67.',
  caseNumber: 'Case number',
  caseNumberHint: 'Two letters and four digits, for example AB-1234.',
  registration: 'Registration number',
  registrationHint: 'Three letters and three digits, for example ABC123.',
  amount: 'How much rent do you pay each month?',
  amountHint: 'Enter the amount in kronor, for example 1250.50. It must be between 0 and 100,000.',
  amountOutOfRange: 'The amount is outside 0 to 100,000. We don’t change it for you.',
  amountInRange: 'The amount is within the range.',
  temperature: 'Temperature in degrees',
  temperatureHint: 'You can type a minus sign, for example -4.5.',
  send: 'Send',
  sent: 'Sent',
  checkFormat: 'Enter twelve digits, for example 19900101-2385',
  checkDate: 'The date in the number doesn’t exist. Check the year, month and day.',
  checkDigit: 'The last digit doesn’t match. Check the number.',
  checkAdvice:
    'The mask only shapes what you type. The number is checked when you send, with checks.personalIdentityNumber.',
  unmasked: 'Without hyphen',
  complete: 'Complete',
  yes: 'yes',
  no: 'no',
  stored: 'Saved personal identity number',
  storedHint: 'The stored value is 199001012385. The field shows it formatted.',
  ownInput: 'Your own field with useMask',
  ownInputHint:
    'Your own <input> with the useMask hook. Two letters and four digits, for example AB-1234.',
  quiet: 'Quiet field',
  quietHint:
    'Digits only. This field says nothing aloud when a character is refused (announceRejections off).',
  organisationNumberFi: 'Organisation number (Finland)',
  organisationNumberFiHint: 'Seven digits, a hyphen and a check digit, for example 0112038-9.',
  organisationNumberNo: 'Organisation number (Norway)',
  organisationNumberNoHint: 'Nine digits, for example 974 760 673.',
  postalCodeFi: 'Postcode (Finland)',
  postalCodeFiHint: 'Five digits, for example 00100.',
  postalCodeNo: 'Postcode (Norway)',
  postalCodeNoHint: 'Four digits, for example 0150.',
  checkFormatGeneric: 'The number has the wrong number of digits or characters. Check the number.',
  checkControl: 'The check digit doesn’t match. Check the number.',
  checkCountry: 'The country code of the IBAN doesn’t exist. Check the first two letters.',
  syntheticNote:
    'The form also accepts test numbers from the Norwegian Tax Administration’s test registry.',
  customerNumber: 'Customer number',
  customerNumberHint:
    'Eight or ten digits. Below the field it says whether the number is complete.',
  accountNumber: 'Account number',
  accountNumberHint:
    'At least eight digits. You can type spaces and hyphens, but they aren’t saved.',
  bookingCode: 'Booking code',
  bookingCodeHint:
    'Always starts with 9, then two letters or digits, a hyphen and three digits, for example 9K2-407. The letters become capitals automatically.',
  groupedAmount: 'Amount, written in the page’s language',
  groupedAmountHint: (example) =>
    `Enter the amount in kronor, for example ${example}. The thousands separator and the decimal mark follow the page’s language.`,
  finnishAmount: 'Amount, always written in Finnish',
  finnishAmountHint: (example) =>
    `Enter the amount in euros, for example ${example}. The field always uses the Finnish decimal mark, also when the page is in another language.`,
  storedAmount: 'Saved amount 1250000.5 shown in the page’s language',
  ownRejection: 'Enter digits only, with no letters or spaces.',
  rejected: 'Characters left out',
  describedByNote: 'You’ll find the number at the top of our letter, next to the date.',
}

const maskTexts: Record<MaskLocale, MaskTexts> = {
  sv: textsSv,
  nb: textsNb,
  nn: textsNn,
  en: textsEn,
}

/** The library catalogs behind the mask's announcements. */
const maskMessages = { sv, nb, nn, en }

const isMaskLocale = (value: unknown): value is MaskLocale =>
  value === 'sv' || value === 'nb' || value === 'nn' || value === 'en'

/** The toolbar's locale, or `en` for fi, which show English here. */
export const maskLocaleOf = (globals: Record<string, unknown>): MaskLocale => {
  const locale = globals['locale']
  return isMaskLocale(locale) ? locale : 'en'
}

/** The fixture text, and `lang="en"` when the toolbar's locale has no texts here (fi; 3.1.2). */
export function maskTextsFor(globals: Record<string, unknown>): {
  text: MaskTexts
  lang: 'en' | undefined
  locale: MaskLocale
} {
  const locale = maskLocaleOf(globals)
  return {
    text: maskTexts[locale],
    lang: isMaskLocale(globals['locale']) ? undefined : 'en',
    locale,
  }
}

/** The mask's announcement for a refused character, in the page's language, for the plays. */
export const characterNotAllowedMessage = (
  locale: MaskLocale,
  allowed: 'digits' | 'letters' | 'lettersAndDigits' | 'other',
): string => maskMessages[locale].mask.characterNotAllowed({ allowed })

/** The mask's announcement for a field that is full, in the page's language, for the plays. */
export const maximumLengthMessage = (locale: MaskLocale, length: number): string =>
  maskMessages[locale].mask.maximumLength({ length })

/**
 * The provider, with the library strings in the page's language: the mask's announcements come
 * from its catalog. fi show English. `country="SE"` because every example here is
 * Swedish whatever the language: the country masks would otherwise follow the toolbar's locale
 * (nb is Norway, and English has no country).
 */
export const withMaskLocale: Decorator = (Story, { globals }) => {
  const locale = maskLocaleOf(globals)
  return (
    <KvirnProvider locale={locale} country="SE" messages={maskMessages[locale]}>
      <Story />
    </KvirnProvider>
  )
}

/** The identifier presets, each with its own example (the published test numbers). */
export function IdentifierFields({ locale }: { locale: FormLocale }) {
  const { text, lang } = maskTextsFor({ locale })
  return (
    <>
      <Field.Root required lang={lang}>
        <Field.Label>{text.personalIdentityNumber}</Field.Label>
        <Field.Prose>
          <p>{text.personalIdentityNumberHint}</p>
        </Field.Prose>
        <TextInput
          name="personalIdentityNumber"
          mask="personal-identity-number"
          autoComplete="off"
          className="kv-input--width-20"
        />
      </Field.Root>
      <Field.Root required lang={lang}>
        <Field.Label>{text.personalIdentityNumberFi}</Field.Label>
        <Field.Prose>
          <p>{text.personalIdentityNumberFiHint}</p>
        </Field.Prose>
        <TextInput
          name="personalIdentityNumberFi"
          mask={{ preset: 'personal-identity-number', country: 'FI' }}
          autoComplete="off"
          className="kv-input--width-20"
        />
      </Field.Root>
      <Field.Root required lang={lang}>
        <Field.Label>{text.personalIdentityNumberNo}</Field.Label>
        <Field.Prose>
          <p>{text.personalIdentityNumberNoHint}</p>
        </Field.Prose>
        <TextInput
          name="personalIdentityNumberNo"
          mask={{ preset: 'personal-identity-number', country: 'NO' }}
          autoComplete="off"
          className="kv-input--width-20"
        />
      </Field.Root>
      <Field.Root required lang={lang}>
        <Field.Label>{text.organisationNumber}</Field.Label>
        <Field.Prose>
          <p>{text.organisationNumberHint}</p>
        </Field.Prose>
        <TextInput
          name="organisationNumber"
          mask="organisation-number"
          autoComplete="off"
          className="kv-input--width-20"
        />
      </Field.Root>
      <Field.Root required lang={lang}>
        <Field.Label>{text.postalCode}</Field.Label>
        <Field.Prose>
          <p>{text.postalCodeHint}</p>
        </Field.Prose>
        <TextInput
          name="postalCode"
          mask="postal-code"
          autoComplete="postal-code"
          className="kv-input--width-6"
        />
      </Field.Root>
      <Field.Root required lang={lang}>
        <Field.Label>{text.iban}</Field.Label>
        <Field.Prose>
          <p>{text.ibanHint}</p>
        </Field.Prose>
        <TextInput name="iban" mask="iban" autoComplete="off" />
      </Field.Root>
    </>
  )
}

/** The filter presets: they drop what can't be valid and don't give the value a shape. */
export function FilterFields({ locale }: { locale: FormLocale }) {
  const { text, lang } = maskTextsFor({ locale })
  return (
    <>
      <Field.Root required lang={lang}>
        <Field.Label>{text.digits}</Field.Label>
        <Field.Prose>
          <p>{text.digitsHint}</p>
        </Field.Prose>
        <TextInput
          name="digits"
          mask={masks.digits({ length: 6 })}
          autoComplete="off"
          className="kv-input--width-10"
        />
      </Field.Root>
      <Field.Root required lang={lang}>
        <Field.Label>{text.letters}</Field.Label>
        <Field.Prose>
          <p>{text.lettersHint}</p>
        </Field.Prose>
        <TextInput
          name="letters"
          mask="letters"
          autoComplete="off"
          className="kv-input--width-10"
        />
      </Field.Root>
      <Field.Root required lang={lang}>
        <Field.Label>{text.lettersAndDigits}</Field.Label>
        <Field.Prose>
          <p>{text.lettersAndDigitsHint}</p>
        </Field.Prose>
        <TextInput
          name="lettersAndDigits"
          mask="letters-and-digits"
          autoComplete="off"
          className="kv-input--width-10"
        />
      </Field.Root>
      <Field.Root required lang={lang}>
        <Field.Label>{text.email}</Field.Label>
        <Field.Prose>
          <p>{text.emailHint}</p>
        </Field.Prose>
        <TextInput name="email" type="email" mask="email" autoComplete="email" />
      </Field.Root>
      <Field.Root required lang={lang}>
        <Field.Label>{text.telephone}</Field.Label>
        <Field.Prose>
          <p>{text.telephoneHint}</p>
        </Field.Prose>
        <TextInput
          name="telephone"
          type="tel"
          mask="telephone"
          autoComplete="tel"
          className="kv-input--width-20"
        />
      </Field.Root>
    </>
  )
}

/** Your own pattern, and your own regular expression. */
export function CustomMaskFields({ locale }: { locale: FormLocale }) {
  const { text, lang } = maskTextsFor({ locale })
  return (
    <>
      <Field.Root required lang={lang}>
        <Field.Label>{text.caseNumber}</Field.Label>
        <Field.Prose>
          <p>{text.caseNumberHint}</p>
        </Field.Prose>
        <TextInput
          name="caseNumber"
          // `a` is a letter, `9` a digit, anything else a literal. The transform capitalises.
          mask={{
            pattern: 'aa-9999',
            transform: { a: (character) => character.toUpperCase() },
            attributes: { autoCapitalize: 'characters', spellCheck: false, dir: 'ltr' },
          }}
          autoComplete="off"
          className="kv-input--width-6"
        />
      </Field.Root>
      <Field.Root required lang={lang}>
        <Field.Label>{text.registration}</Field.Label>
        <Field.Prose>
          <p>{text.registrationHint}</p>
        </Field.Prose>
        <TextInput
          name="registration"
          // The expression must accept partial values: the whole new value has to match.
          mask={masks.regexp(/^[A-Z]{0,3}[0-9]{0,3}$/, {
            allowed: 'other',
            transform: (character) => character.toUpperCase(),
            complete: /^[A-Z]{3}[0-9]{3}$/,
            attributes: { autoCapitalize: 'characters', spellCheck: false, dir: 'ltr' },
          })}
          autoComplete="off"
          className="kv-input--width-6"
        />
      </Field.Root>
    </>
  )
}

/** A number with a range: `isWithinRange` is reported, and the value is never clamped. */
export function NumberFields({ locale }: { locale: FormLocale }) {
  const { text, lang } = maskTextsFor({ locale })
  const [isWithinRange, setIsWithinRange] = useState<boolean | undefined>(undefined)
  const [unmasked, setUnmasked] = useState('')
  return (
    <>
      <Field.Root required lang={lang}>
        <Field.Label>{text.amount}</Field.Label>
        <Field.Prose>
          <p>{text.amountHint}</p>
        </Field.Prose>
        <TextInput
          name="rent"
          mask={masks.number({ decimals: 2, min: 0, max: 100_000 })}
          autoComplete="off"
          className="kv-input--width-10 kv-input--numeric"
          onValueChange={(_value, details) => {
            setIsWithinRange(details.isWithinRange)
            setUnmasked(details.unmaskedValue ?? '')
          }}
        />
        {/* The consumer's own message, shown as a help text: nothing is clamped or corrected. */}
        <p className="kv-story-form-output" data-testid="range">
          {isWithinRange === undefined
            ? ''
            : isWithinRange
              ? text.amountInRange
              : text.amountOutOfRange}
        </p>
        <p className="kv-story-form-output" data-testid="unmasked">
          {text.unmasked}: {unmasked}
        </p>
      </Field.Root>
      <Field.Root required lang={lang}>
        <Field.Label>{text.temperature}</Field.Label>
        <Field.Prose>
          <p>{text.temperatureHint}</p>
        </Field.Prose>
        <TextInput
          name="temperature"
          mask={masks.number({ decimals: 1, allowNegative: true })}
          autoComplete="off"
          className="kv-input--width-6 kv-input--numeric"
        />
      </Field.Root>
    </>
  )
}

/**
 * A personal identity number with a check on submit. The mask never blocks a number the user is
 * still typing: the form calls `checks.personalIdentityNumber` and says what is wrong.
 */
export function PersonalIdentityNumberForm({ locale }: { locale: FormLocale }) {
  const { text, lang } = maskTextsFor({ locale })
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | undefined>(undefined)
  const [sent, setSent] = useState(false)
  return (
    <form
      className="kv-story-form"
      lang={lang}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const result = checks.personalIdentityNumber(value, { country: 'SE' })
        setSent(result.isValid)
        setError(
          result.isValid
            ? undefined
            : { format: text.checkFormat, date: text.checkDate, checkDigit: text.checkDigit }[
                result.reason
              ],
        )
      }}
    >
      <Field.Root required invalid={error !== undefined}>
        <Field.Label>{text.personalIdentityNumber}</Field.Label>
        <Field.Prose>
          <p>{text.personalIdentityNumberHint}</p>
        </Field.Prose>
        <TextInput
          name="personalIdentityNumber"
          mask="personal-identity-number"
          autoComplete="off"
          className="kv-input--width-20"
          value={value}
          onValueChange={setValue}
        />
        <Field.ErrorMessage>{error}</Field.ErrorMessage>
      </Field.Root>
      <p className="kv-story-form-output">{text.checkAdvice}</p>
      <div className="kv-button-group">
        <Button type="submit" className="kv-button--primary">
          {text.send}
        </Button>
      </div>
      {sent ? (
        <p className="kv-story-form-output" data-testid="sent">
          {text.sent}: {value}
        </p>
      ) : null}
    </form>
  )
}

/** A stored value is unmasked: the form shows it with `mask.format`, never rewritten by TextInput. */
export function StoredValueField({ locale }: { locale: FormLocale }) {
  const { text, lang } = maskTextsFor({ locale })
  const mask = masks.personalIdentityNumber({ country: 'SE' })
  const [value, setValue] = useState(mask.format('199001012385'))
  const [details, setDetails] = useState<TextInputChangeDetails | undefined>(undefined)
  return (
    <>
      <Field.Root required lang={lang}>
        <Field.Label>{text.stored}</Field.Label>
        <Field.Prose>
          <p>{text.storedHint}</p>
        </Field.Prose>
        <TextInput
          name="stored"
          mask={mask}
          autoComplete="off"
          className="kv-input--width-20"
          value={value}
          onValueChange={(next, nextDetails) => {
            setValue(next)
            setDetails(nextDetails)
          }}
        />
      </Field.Root>
      <p className="kv-story-form-output" data-testid="stored-details">
        {text.unmasked}: {mask.unmask(value)} · {text.complete}:{' '}
        {details?.isComplete === false ? text.no : text.yes}
      </p>
    </>
  )
}

/** The hook on your own `<input>`, next to your own props: yours win. */
export function OwnInputField({ locale }: { locale: FormLocale }) {
  const { text, lang } = maskTextsFor({ locale })
  const caseNumber = useMask({
    mask: {
      pattern: 'aa-9999',
      transform: { a: (character) => character.toUpperCase() },
      attributes: { autoCapitalize: 'characters', spellCheck: false, dir: 'ltr' },
    },
  })
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.ownInput}</Field.Label>
      <Field.Prose>
        <p>{text.ownInputHint}</p>
      </Field.Prose>
      <TextInput
        name="ownInput"
        autoComplete="off"
        className="kv-input--width-6"
        // `mergeProps(mask.inputProps, ownProps)`: your own props come last and win.
        {...mergeProps(caseNumber.inputProps, { 'data-own': '' })}
      />
    </Field.Root>
  )
}

/** Finland's and Norway's postcodes and organisation numbers, each by `{ preset, country }`. */
export function NordicCountryFields({ locale }: { locale: FormLocale }) {
  const { text, lang } = maskTextsFor({ locale })
  return (
    <>
      <Field.Root required lang={lang}>
        <Field.Label>{text.postalCodeFi}</Field.Label>
        <Field.Prose>
          <p>{text.postalCodeFiHint}</p>
        </Field.Prose>
        <TextInput
          name="postalCodeFi"
          mask={{ preset: 'postal-code', country: 'FI' }}
          autoComplete="postal-code"
          className="kv-input--width-6"
        />
      </Field.Root>
      <Field.Root required lang={lang}>
        <Field.Label>{text.postalCodeNo}</Field.Label>
        <Field.Prose>
          <p>{text.postalCodeNoHint}</p>
        </Field.Prose>
        <TextInput
          name="postalCodeNo"
          mask={{ preset: 'postal-code', country: 'NO' }}
          autoComplete="postal-code"
          className="kv-input--width-6"
        />
      </Field.Root>
      <Field.Root required lang={lang}>
        <Field.Label>{text.organisationNumberFi}</Field.Label>
        <Field.Prose>
          <p>{text.organisationNumberFiHint}</p>
        </Field.Prose>
        <TextInput
          name="organisationNumberFi"
          mask={{ preset: 'organisation-number', country: 'FI' }}
          autoComplete="off"
          className="kv-input--width-10"
        />
      </Field.Root>
      <Field.Root required lang={lang}>
        <Field.Label>{text.organisationNumberNo}</Field.Label>
        <Field.Prose>
          <p>{text.organisationNumberNoHint}</p>
        </Field.Prose>
        <TextInput
          name="organisationNumberNo"
          mask={{ preset: 'organisation-number', country: 'NO' }}
          autoComplete="off"
          className="kv-input--width-10"
        />
      </Field.Root>
    </>
  )
}

/**
 * The checks your form calls on submit, one per number: Finnish personal identity number,
 * Norwegian personal identity number (with the test registry's numbers allowed), Norwegian
 * organisation number and IBAN. Each failure has a reason, so the error says what is wrong.
 */
export function IdentifierChecksForm({ locale }: { locale: FormLocale }) {
  const { text, lang } = maskTextsFor({ locale })
  const [errors, setErrors] = useState<
    Record<'finnish' | 'norwegian' | 'organisation' | 'iban', string | undefined>
  >({ finnish: undefined, norwegian: undefined, organisation: undefined, iban: undefined })
  const reasons = {
    format: text.checkFormatGeneric,
    date: text.checkDate,
    checkDigit: text.checkControl,
    country: text.checkCountry,
  }
  return (
    <form
      className="kv-story-form"
      lang={lang}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        const read = (name: string) => {
          const value = data.get(name)
          return typeof value === 'string' ? value : ''
        }
        const finnish = checks.personalIdentityNumber(read('finnish'), { country: 'FI' })
        // Only for test data: the test registry's numbers add 80 to the month. Off by default.
        const norwegian = checks.personalIdentityNumber(read('norwegian'), {
          country: 'NO',
          allowSyntheticNumbers: true,
        })
        const organisation = checks.organisationNumber(read('organisation'), { country: 'NO' })
        const iban = checks.iban(read('iban'))
        setErrors({
          finnish: finnish.isValid ? undefined : reasons[finnish.reason],
          norwegian: norwegian.isValid ? undefined : reasons[norwegian.reason],
          organisation: organisation.isValid ? undefined : reasons[organisation.reason],
          iban: iban.isValid ? undefined : reasons[iban.reason],
        })
      }}
    >
      <Field.Root required invalid={errors.finnish !== undefined}>
        <Field.Label>{text.personalIdentityNumberFi}</Field.Label>
        <Field.Prose>
          <p>{text.personalIdentityNumberFiHint}</p>
        </Field.Prose>
        <TextInput
          name="finnish"
          mask={{ preset: 'personal-identity-number', country: 'FI' }}
          autoComplete="off"
          className="kv-input--width-20"
        />
        <Field.ErrorMessage>{errors.finnish}</Field.ErrorMessage>
      </Field.Root>
      <Field.Root required invalid={errors.norwegian !== undefined}>
        <Field.Label>{text.personalIdentityNumberNo}</Field.Label>
        <Field.Prose>
          <p>
            {text.personalIdentityNumberNoHint} {text.syntheticNote}
          </p>
        </Field.Prose>
        <TextInput
          name="norwegian"
          mask={{ preset: 'personal-identity-number', country: 'NO' }}
          autoComplete="off"
          className="kv-input--width-20"
        />
        <Field.ErrorMessage>{errors.norwegian}</Field.ErrorMessage>
      </Field.Root>
      <Field.Root required invalid={errors.organisation !== undefined}>
        <Field.Label>{text.organisationNumberNo}</Field.Label>
        <Field.Prose>
          <p>{text.organisationNumberNoHint}</p>
        </Field.Prose>
        <TextInput
          name="organisation"
          mask={{ preset: 'organisation-number', country: 'NO' }}
          autoComplete="off"
          className="kv-input--width-10"
        />
        <Field.ErrorMessage>{errors.organisation}</Field.ErrorMessage>
      </Field.Root>
      <Field.Root required invalid={errors.iban !== undefined}>
        <Field.Label>{text.iban}</Field.Label>
        <Field.Prose>
          <p>{text.ibanHint}</p>
        </Field.Prose>
        <TextInput name="iban" mask="iban" autoComplete="off" />
        <Field.ErrorMessage>{errors.iban}</Field.ErrorMessage>
      </Field.Root>
      <div className="kv-button-group">
        <Button type="submit" className="kv-button--primary">
          {text.send}
        </Button>
      </div>
    </form>
  )
}

/**
 * A number with grouping: one follows the page's language (`mask.withLocale` is what the
 * provider does for you), the other pins its own `locale`. The hint's example is written from the
 * field's own mask, so the hint and the field never disagree.
 */
export function GroupedNumberFields({ locale }: { locale: FormLocale }) {
  const { text, lang, locale: maskLocale } = maskTextsFor({ locale })
  const pageMask = masks.number({ decimals: 2, grouping: true })
  const finnishMask = masks.number({ decimals: 2, grouping: true, locale: 'fi' })
  const pageExample = pageMask.withLocale(maskLocale).format('1250000.5')
  const finnishExample = finnishMask.format('1250000.5')
  return (
    <>
      <Field.Root required lang={lang}>
        <Field.Label>{text.groupedAmount}</Field.Label>
        <Field.Prose>
          <p>{text.groupedAmountHint(pageExample)}</p>
        </Field.Prose>
        <TextInput
          name="amount"
          mask={pageMask}
          autoComplete="off"
          className="kv-input--width-10 kv-input--numeric"
        />
      </Field.Root>
      <Field.Root required lang={lang}>
        <Field.Label>{text.finnishAmount}</Field.Label>
        <Field.Prose>
          <p>{text.finnishAmountHint(finnishExample)}</p>
        </Field.Prose>
        <TextInput
          name="amountFi"
          mask={finnishMask}
          autoComplete="off"
          className="kv-input--width-10 kv-input--numeric"
        />
      </Field.Root>
      <p className="kv-story-form-output" data-testid="stored">
        {text.storedAmount}: {pageExample}
      </p>
    </>
  )
}

/** A one-time code on a plain TextInput: `masks.oneTimeCode` with the code's pattern. */
export function PlainCodeField({ locale }: { locale: FormLocale }) {
  const { label, hint, lang } = codeTextsFor(locale, 'email', '&&&&-&&&&')
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{label}</Field.Label>
      <Field.Prose>
        <p>{hint}</p>
      </Field.Prose>
      <TextInput
        name="code"
        mask={masks.oneTimeCode({ pattern: '&&&&-&&&&' })}
        autoComplete="one-time-code"
        className="kv-input--width-10"
      />
    </Field.Root>
  )
}

/**
 * The options of a custom mask. A pattern with a literal `9` (`\9`) and a `*` that is made a
 * capital; a pattern that is complete at two lengths; and a regular expression that strips
 * the spaces and hyphens for the value you store.
 */
export function PatternOptionFields({ locale }: { locale: FormLocale }) {
  const { text, lang } = maskTextsFor({ locale })
  const [isCustomerNumberComplete, setIsCustomerNumberComplete] = useState(false)
  const [account, setAccount] = useState({ unmaskedValue: '', isComplete: false })
  return (
    <>
      <Field.Root required lang={lang}>
        <Field.Label>{text.bookingCode}</Field.Label>
        <Field.Prose>
          <p>{text.bookingCodeHint}</p>
        </Field.Prose>
        <TextInput
          name="bookingCode"
          // `\9` is a literal 9, not a digit. `*` takes a letter or a digit, here in capitals.
          mask={{
            pattern: String.raw`\9**-999`,
            transform: { '*': (character) => character.toUpperCase() },
            attributes: { autoCapitalize: 'characters', spellCheck: false, dir: 'ltr' },
          }}
          autoComplete="off"
          className="kv-input--width-6"
        />
      </Field.Root>
      <Field.Root required lang={lang}>
        <Field.Label>{text.customerNumber}</Field.Label>
        <Field.Prose>
          <p>{text.customerNumberHint}</p>
        </Field.Prose>
        <TextInput
          name="customerNumber"
          // Complete at eight digits and at ten, but not at nine.
          mask={{ pattern: '9999999999', completeLengths: [8, 10] }}
          autoComplete="off"
          className="kv-input--width-10"
          onValueChange={(_value, details) =>
            setIsCustomerNumberComplete(details.isComplete === true)
          }
        />
        <p className="kv-story-form-output" data-testid="customer-complete">
          {text.complete}: {isCustomerNumberComplete ? text.yes : text.no}
        </p>
      </Field.Root>
      <Field.Root required lang={lang}>
        <Field.Label>{text.accountNumber}</Field.Label>
        <Field.Prose>
          <p>{text.accountNumberHint}</p>
        </Field.Prose>
        <TextInput
          name="accountNumber"
          // The expression accepts partial values. `unmask` is what you store; `complete` says when
          // there are enough digits.
          mask={masks.regexp(/^[\d -]*$/, {
            unmask: (value) => value.replaceAll(/\D/g, ''),
            complete: /^(?:[ -]*\d){8}[\d -]*$/,
            attributes: { inputMode: 'numeric', spellCheck: false },
          })}
          autoComplete="off"
          className="kv-input--width-20"
          onValueChange={(_value, details) =>
            setAccount({
              unmaskedValue: details.unmaskedValue ?? '',
              isComplete: details.isComplete === true,
            })
          }
        />
        <p className="kv-story-form-output" data-testid="account-details">
          {text.unmasked}: {account.unmaskedValue} · {text.complete}:{' '}
          {account.isComplete ? text.yes : text.no}
        </p>
      </Field.Root>
    </>
  )
}

/**
 * Every reason a character is refused, each in its own field (the announcement is throttled per
 * field): digits only, the field is full, letters only, letters and digits only, and "other" for
 * a filter with a custom set of characters.
 */
export function RefusalFields({ locale }: { locale: FormLocale }) {
  const { text, lang } = maskTextsFor({ locale })
  return (
    <>
      <Field.Root required lang={lang}>
        <Field.Label>{text.digits}</Field.Label>
        <Field.Prose>
          <p>{text.digitsHint}</p>
        </Field.Prose>
        <TextInput
          name="digits"
          mask={masks.digits({ length: 6 })}
          autoComplete="off"
          className="kv-input--width-10"
        />
      </Field.Root>
      <Field.Root required lang={lang}>
        <Field.Label>{text.postalCode}</Field.Label>
        <Field.Prose>
          <p>{text.postalCodeHint}</p>
        </Field.Prose>
        <TextInput
          name="postalCode"
          mask="postal-code"
          autoComplete="postal-code"
          className="kv-input--width-6"
        />
      </Field.Root>
      <Field.Root required lang={lang}>
        <Field.Label>{text.letters}</Field.Label>
        <Field.Prose>
          <p>{text.lettersHint}</p>
        </Field.Prose>
        <TextInput
          name="letters"
          mask="letters"
          autoComplete="off"
          className="kv-input--width-10"
        />
      </Field.Root>
      <Field.Root required lang={lang}>
        <Field.Label>{text.lettersAndDigits}</Field.Label>
        <Field.Prose>
          <p>{text.lettersAndDigitsHint}</p>
        </Field.Prose>
        <TextInput
          name="lettersAndDigits"
          mask="letters-and-digits"
          autoComplete="off"
          className="kv-input--width-10"
        />
      </Field.Root>
      <Field.Root required lang={lang}>
        <Field.Label>{text.telephone}</Field.Label>
        <Field.Prose>
          <p>{text.telephoneHint}</p>
        </Field.Prose>
        <TextInput
          name="telephone"
          type="tel"
          mask="telephone"
          autoComplete="tel"
          className="kv-input--width-20"
        />
      </Field.Root>
    </>
  )
}

/** The fixture the keyboard tests drive: masked fields and a button in a plain form. */
export function KeyboardForm({ locale }: { locale: FormLocale }) {
  const { text, lang } = maskTextsFor({ locale })
  const [sent, setSent] = useState<string | undefined>(undefined)
  return (
    <form
      className="kv-story-form"
      lang={lang}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        setSent(
          ['personalIdentityNumber', 'postalCode', 'digits', 'amount']
            .map((name) => {
              const value = data.get(name)
              return typeof value === 'string' ? value : ''
            })
            .join(' | '),
        )
      }}
    >
      <Field.Root required lang={lang}>
        <Field.Label>{text.personalIdentityNumber}</Field.Label>
        <Field.Prose>
          <p>{text.personalIdentityNumberHint}</p>
        </Field.Prose>
        <TextInput
          name="personalIdentityNumber"
          mask="personal-identity-number"
          autoComplete="off"
          className="kv-input--width-20"
        />
      </Field.Root>
      <Field.Root required lang={lang}>
        <Field.Label>{text.postalCode}</Field.Label>
        <Field.Prose>
          <p>{text.postalCodeHint}</p>
        </Field.Prose>
        <TextInput
          name="postalCode"
          mask="postal-code"
          autoComplete="postal-code"
          className="kv-input--width-6"
        />
      </Field.Root>
      <Field.Root required lang={lang}>
        <Field.Label>{text.digits}</Field.Label>
        <Field.Prose>
          <p>{text.digitsHint}</p>
        </Field.Prose>
        <TextInput
          name="digits"
          mask={masks.digits({ length: 6 })}
          autoComplete="off"
          className="kv-input--width-10"
        />
      </Field.Root>
      <Field.Root required lang={lang}>
        <Field.Label>{text.amount}</Field.Label>
        <Field.Prose>
          <p>{text.amountHint}</p>
        </Field.Prose>
        <TextInput
          name="amount"
          mask={masks.number({ decimals: 2, min: 0, max: 100_000 })}
          autoComplete="off"
          className="kv-input--width-10 kv-input--numeric"
        />
      </Field.Root>
      <Field.Root required lang={lang}>
        <Field.Label>{text.quiet}</Field.Label>
        <Field.Prose>
          <p>{text.quietHint}</p>
        </Field.Prose>
        <TextInput
          name="quiet"
          mask="digits"
          announceRejections={false}
          autoComplete="off"
          className="kv-input--width-10"
        />
      </Field.Root>
      <Field.Root required lang={lang}>
        <Field.Label>{text.letters}</Field.Label>
        <Field.Prose>
          <p>{text.lettersHint}</p>
        </Field.Prose>
        <TextInput
          name="letters"
          mask="letters"
          autoComplete="off"
          className="kv-input--width-10"
        />
      </Field.Root>
      <div className="kv-button-group">
        <Button type="submit" className="kv-button--primary">
          {text.send}
        </Button>
      </div>
      {sent === undefined ? null : (
        <p className="kv-story-form-output" data-testid="sent">
          {text.sent}: {sent}
        </p>
      )}
    </form>
  )
}
