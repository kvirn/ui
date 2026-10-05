import type { KvirnMessages, TextMessage } from '@kvirn-ui/i18n'
import { en } from '@kvirn-ui/i18n/en'
import { fi } from '@kvirn-ui/i18n/fi'
import { nb } from '@kvirn-ui/i18n/nb'
import { nn } from '@kvirn-ui/i18n/nn'
import { se } from '@kvirn-ui/i18n/se'
import { sv } from '@kvirn-ui/i18n/sv'
import { Field, KvirnProvider, TextInput } from '@kvirn-ui/react'
import type { Decorator } from '@storybook/react-vite'

// Story and e2e fixture for the Components/Form pages (docs/design/form-fields.md §4.2, §4.3).
// sv, en, fi, nb and nn are written. The fi strings are the designer's drafts, for length checks.
// se: English, marked lang="en" (3.1.2). The spec's option help text `durationHint` is
// `duration12Hint` in choice.fixture.tsx, which has the same text.
// The library's own strings ("(optional)", "Error:") follow the locale through the provider
// decorator below, like an app's provider would.
//
// KvirnUI holds no form state. Nothing here validates: an "invalid" story
// sets `invalid` and writes the message itself, as an implementor's form logic would.

export type FormLocale = 'sv' | 'fi' | 'nb' | 'nn' | 'se' | 'en'

export interface FormTexts {
  name: string
  nameQuestion: string
  nameHint: string
  nameError: string
  personalNumber: string
  /** The description above the control: why we ask. */
  personalNumberWhy: string
  /** The help text under the control: the format, in plain words first. */
  personalNumberFormat: string
  /** The ErrorMessage: repeats the format. */
  personalNumberError: string
  /** The help text under a read-only field: why the value can't change. */
  personalNumberHint: string
  registration: string
  /** The description above the control (a `Field.Prose`): where to find the answer. */
  registrationWhere: string
  /** The help text under the control: a format example. */
  registrationHint: string
  /** The ErrorMessage, under the help text under the control. */
  registrationError: string
  email: string
  emailHint: string
  emailError: string
  phone: string
  phoneHint: string
  website: string
  password: string
  search: string
  children: string
  childrenError: string
  /** The help text under the whole-number field: the range the form checks. */
  childrenHint: string
  /** The ErrorMessage for a number the mask lets through but the form rejects (out of range). */
  childrenRangeError: string
  rent: string
  rentHint: (example: string) => string
  rentError: (example: string) => string
  caseNumber: string
  caseNumberHint: string
  postcode: string
  postcodeHint: string
  longLabel: string
  /** The help text under the long-label field: a long compound for the length check. */
  grantReferenceHint: string
  /** The help text under a textarea. Static: a live count is a later component. */
  messageLimit: string
  // InputGroup (docs/design/form-fields.md §4.5). The label carries the unit, because an Addon
  // is aria-hidden.
  rentWithUnit: string
  rentUnit: string
  rentUnitExample: (example: string) => string
  /** The label of a number that can be below zero, and its help text with an example (a minus sign first). */
  balance: string
  balanceHint: (example: string) => string
  workTime: string
  workTimeUnit: string
  workTimeExample: string
  distance: string
  distanceHint: string
  distanceUnit: string
  searchServices: string
  searchClear: string
  searchClearName: string
  visitDate: string
  visitDateExample: string
  /** The date boxes' labels, for the Fieldset.HelpText example. */
  visitDay: string
  visitMonth: string
  visitYear: string
  amountEuro: string
  amountEuroUnit: string
  grantWithUnit: string
  addressLegend: string
  addressHint: string
  /** The group's help text under the address fields: what to leave out. */
  addressFormat: string
  addressError: string
  street: string
  town: string
  youTyped: string
  send: string
  filter: string
  sent: string
  surface: string
  inCard: string
  proseHeading: string
  proseText: string
}

const textsEn: FormTexts = {
  name: 'Full name',
  nameQuestion: 'What is your full name?',
  nameHint: 'As it appears on your passport.',
  nameError: 'Enter your full name',
  personalNumber: 'Personal identity number',
  personalNumberWhy: 'We use it to get your details from the Swedish Tax Agency.',
  personalNumberFormat: '12 digits, YYYYMMDD-NNNN',
  personalNumberError: 'Enter your personal identity number with 12 digits, YYYYMMDD-NNNN',
  personalNumberHint: 'You can’t change your personal identity number here.',
  registration: 'Vehicle registration number',
  registrationWhere: 'You can find it on the vehicle registration certificate.',
  registrationHint: 'For example, ABC 123',
  registrationError: 'Enter a registration number in the correct format, like ABC 123',
  email: 'Email address',
  emailHint: 'We’ll send the decision to this address.',
  emailError: 'Enter an email address in the correct format, like name@example.com',
  phone: 'Phone number',
  phoneHint: 'We’ll only call if there’s a problem.',
  website: 'Website',
  password: 'Password',
  search: 'Search the service',
  children: 'How many children live with you?',
  childrenError: 'Enter the number of children as a whole number, like 2',
  childrenHint: 'A whole number from 0 to 12, for example 2.',
  childrenRangeError: 'Enter the number of children as a number from 0 to 12, like 2',
  rent: 'How much rent do you pay each month?',
  rentHint: (example) => `Enter the amount without a currency sign, like ${example}.`,
  rentError: (example) => `Enter the rent as an amount, like ${example}`,
  caseNumber: 'Case number',
  caseNumberHint: 'It’s at the top of our letter, for example 004512.',
  postcode: 'Postcode',
  postcodeHint: 'For example, 123 45',
  longLabel: 'Reference number of your housing adaptation grant application',
  grantReferenceHint: 'It’s on the decision about your housing adaptation grant.',
  messageLimit: 'Up to 500 characters.',
  rentWithUnit: 'Monthly rent in kronor',
  rentUnit: 'kr',
  rentUnitExample: (example) => `For example, ${example}`,
  balance: 'Balance on your account in kronor',
  balanceHint: (example) =>
    `If the balance is below zero, start with a minus sign, like ${example}.`,
  workTime: 'Working hours as a percentage of full time',
  workTimeUnit: '%',
  workTimeExample: 'For example, 75 or 37.5',
  distance: 'Distance from home to school in kilometres',
  distanceHint: 'Measure the shortest walking route.',
  distanceUnit: 'km',
  searchServices: 'Search for a service',
  searchClear: 'Clear',
  searchClearName: 'Clear search',
  visitDate: 'Date of the visit',
  visitDateExample: 'For example, 27/3/2026',
  visitDay: 'Day',
  visitMonth: 'Month',
  visitYear: 'Year',
  amountEuro: 'Amount in euros',
  amountEuroUnit: '€',
  grantWithUnit: 'Amount of housing adaptation grant you are applying for, in kronor',
  addressLegend: 'Where do you live?',
  addressHint: 'The address where you are registered.',
  addressFormat: 'Enter the address without the country.',
  addressError: 'Enter your address',
  street: 'Street address',
  town: 'Town or city',
  youTyped: 'You typed',
  send: 'Send',
  filter: 'Filter',
  sent: 'Sent',
  surface: 'On a surface section',
  inCard: 'In a card',
  proseHeading: 'Your details',
  proseText: 'Fill in the details below. The fields belong to the form, not to the article.',
}

const textsSv: FormTexts = {
  name: 'Fullständigt namn',
  nameQuestion: 'Vad är ditt fullständiga namn?',
  nameHint: 'Som det står i ditt pass.',
  nameError: 'Ange ditt fullständiga namn',
  personalNumber: 'Personnummer',
  personalNumberWhy: 'Vi använder det för att hämta dina uppgifter från Skatteverket.',
  personalNumberFormat: '12 siffror, ÅÅÅÅMMDD-NNNN',
  personalNumberError: 'Skriv personnumret med 12 siffror, ÅÅÅÅMMDD-NNNN',
  personalNumberHint: 'Du kan inte ändra ditt personnummer här.',
  registration: 'Fordonets registreringsnummer',
  registrationWhere: 'Det står på registreringsbeviset.',
  registrationHint: 'Till exempel ABC 123',
  registrationError: 'Ange ett registreringsnummer i rätt format, till exempel ABC 123',
  email: 'E-postadress',
  emailHint: 'Vi skickar beslutet till den här adressen.',
  emailError: 'Ange en e-postadress i rätt format, till exempel namn@exempel.se',
  phone: 'Telefonnummer',
  phoneHint: 'Vi ringer bara om något är fel.',
  website: 'Webbplats',
  password: 'Lösenord',
  search: 'Sök i tjänsten',
  children: 'Hur många barn bor hos dig?',
  childrenError: 'Ange antalet barn som en siffra, till exempel 2',
  childrenHint: 'Ett heltal från 0 till 12, till exempel 2.',
  childrenRangeError: 'Ange antalet barn som ett tal från 0 till 12, till exempel 2',
  rent: 'Hur mycket hyra betalar du per månad?',
  rentHint: (example) => `Skriv beloppet utan valutatecken, till exempel ${example}.`,
  rentError: (example) => `Ange hyran som ett belopp, till exempel ${example}`,
  caseNumber: 'Ärendenummer',
  caseNumberHint: 'Det står överst i vårt brev, till exempel 004512.',
  postcode: 'Postnummer',
  postcodeHint: 'Till exempel 123 45',
  longLabel: 'Referensnummer för din ansökan om bostadsanpassningsbidrag',
  grantReferenceHint: 'Det står i beslutet om bostadsanpassningsbidrag.',
  messageLimit: 'Högst 500 tecken.',
  rentWithUnit: 'Månadshyra i kronor',
  rentUnit: 'kr',
  rentUnitExample: (example) => `Till exempel ${example}`,
  balance: 'Saldo på ditt konto i kronor',
  balanceHint: (example) =>
    `Om saldot är på minus skriver du ett minustecken först, till exempel ${example}.`,
  workTime: 'Arbetstid i procent av heltid',
  workTimeUnit: '%',
  workTimeExample: 'Till exempel 75 eller 37,5',
  distance: 'Avstånd mellan hemmet och skolan i kilometer',
  distanceHint: 'Mät den kortaste gångvägen.',
  distanceUnit: 'km',
  searchServices: 'Sök bland e-tjänster',
  searchClear: 'Rensa',
  searchClearName: 'Rensa sökningen',
  visitDate: 'Datum för besöket',
  visitDateExample: 'Till exempel 2026-03-27',
  visitDay: 'Dag',
  visitMonth: 'Månad',
  visitYear: 'År',
  amountEuro: 'Belopp i euro',
  amountEuroUnit: '€',
  grantWithUnit: 'Belopp som du söker i bostadsanpassningsbidrag, i kronor',
  addressLegend: 'Var bor du?',
  addressHint: 'Adressen där du är folkbokförd.',
  addressFormat: 'Ange adressen utan land.',
  addressError: 'Ange din adress',
  street: 'Gatuadress',
  town: 'Postort',
  youTyped: 'Du skrev',
  send: 'Skicka',
  filter: 'Filtrera',
  sent: 'Skickat',
  surface: 'På en yta',
  inCard: 'I ett kort',
  proseHeading: 'Dina uppgifter',
  proseText: 'Fyll i uppgifterna nedan. Fälten hör till formuläret, inte till artikeln.',
}

/** Designer drafts (docs/design/form-fields.md §4), for length checks. */
const textsFi: FormTexts = {
  name: 'Koko nimi',
  nameQuestion: 'Mikä on koko nimesi?',
  nameHint: 'Kuten se on passissasi.',
  nameError: 'Anna koko nimesi',
  personalNumber: 'Henkilötunnus',
  personalNumberWhy: 'Haemme sen avulla tietosi Ruotsin verovirastosta (Skatteverket).',
  personalNumberFormat: '12 numeroa, VVVVKKPP-NNNN',
  personalNumberError: 'Kirjoita henkilötunnus 12 numerolla, VVVVKKPP-NNNN',
  personalNumberHint: 'Henkilötunnusta ei voi muuttaa täällä.',
  registration: 'Ajoneuvon rekisteritunnus',
  registrationWhere: 'Löydät sen ajoneuvon rekisteröintitodistuksesta.',
  registrationHint: 'Esimerkiksi ABC-123',
  registrationError: 'Anna rekisteritunnus oikeassa muodossa, esimerkiksi ABC-123',
  email: 'Sähköpostiosoite',
  emailHint: 'Lähetämme päätöksen tähän osoitteeseen.',
  emailError: 'Anna sähköpostiosoite oikeassa muodossa, esimerkiksi nimi@esimerkki.fi',
  phone: 'Puhelinnumero',
  phoneHint: 'Soitamme vain, jos jokin on pielessä.',
  website: 'Verkkosivusto',
  password: 'Salasana',
  search: 'Hae palvelusta',
  children: 'Montako lasta asuu kanssasi?',
  childrenError: 'Anna lasten määrä kokonaislukuna, esimerkiksi 2',
  childrenHint: 'Kokonaisluku väliltä 0–12, esimerkiksi 2.',
  childrenRangeError: 'Anna lasten määrä lukuna väliltä 0–12, esimerkiksi 2',
  rent: 'Paljonko maksat vuokraa kuukaudessa?',
  rentHint: (example) => `Kirjoita summa ilman valuuttamerkkiä, esimerkiksi ${example}.`,
  rentError: (example) => `Anna vuokra summana, esimerkiksi ${example}`,
  caseNumber: 'Asianumero',
  caseNumberHint: 'Löydät sen kirjeemme yläreunasta, esimerkiksi 004512.',
  postcode: 'Postinumero',
  postcodeHint: 'Esimerkiksi 00100',
  longLabel: 'Asunnonmuutostyöavustushakemuksen viitenumero',
  // Soft hyphens (U+00AD) in the 34-letter compound: Chromium has no Finnish hyphenation
  // dictionary, so they break the word in every browser (docs/design/field-help-text.md §6).
  grantReferenceHint: 'Löydät sen asunnon\u00ADmuutostyö\u00ADavustus\u00ADpäätöksestä.',
  messageLimit: 'Enintään 500 merkkiä.',
  rentWithUnit: 'Kuukausivuokra kruunuina',
  rentUnit: 'kr',
  rentUnitExample: (example) => `Esimerkiksi ${example}`,
  balance: 'Tilisi saldo kruunuina',
  balanceHint: (example) =>
    `Jos saldo on miinuksella, kirjoita ensin miinusmerkki, esimerkiksi ${example}.`,
  workTime: 'Työaika prosentteina kokoaikatyöstä',
  workTimeUnit: '%',
  workTimeExample: 'Esimerkiksi 75 tai 37,5',
  distance: 'Kodin ja koulun välinen matka kilometreinä',
  distanceHint: 'Mittaa lyhin kävelyreitti.',
  distanceUnit: 'km',
  searchServices: 'Hae palveluista',
  searchClear: 'Tyhjennä',
  searchClearName: 'Tyhjennä haku',
  visitDate: 'Käynnin päivämäärä',
  visitDateExample: 'Esimerkiksi 27.3.2026',
  visitDay: 'Päivä',
  visitMonth: 'Kuukausi',
  visitYear: 'Vuosi',
  amountEuro: 'Summa euroina',
  amountEuroUnit: '€',
  grantWithUnit: 'Haettavan asunnonmuutostyöavustuksen määrä kruunuina',
  addressLegend: 'Missä asut?',
  addressHint: 'Osoite, jossa olet kirjoilla.',
  addressFormat: 'Anna osoite ilman maata.',
  addressError: 'Anna osoitteesi',
  street: 'Katuosoite',
  town: 'Postitoimipaikka',
  youTyped: 'Kirjoitit',
  send: 'Lähetä',
  filter: 'Suodata',
  sent: 'Lähetetty',
  surface: 'Pinnalla',
  inCard: 'Kortissa',
  proseHeading: 'Tietosi',
  proseText: 'Täytä tiedot alla. Kentät kuuluvat lomakkeeseen, eivät artikkeliin.',
}

const textsNb: FormTexts = {
  name: 'Fullt navn',
  nameQuestion: 'Hva er ditt fulle navn?',
  nameHint: 'Slik det står i passet ditt.',
  nameError: 'Skriv inn fullt navn',
  personalNumber: 'Fødselsnummer',
  personalNumberWhy: 'Vi bruker det til å hente opplysningene dine fra Skatteetaten.',
  personalNumberFormat: '11 siffer, DDMMÅÅNNNNN',
  personalNumberError: 'Skriv fødselsnummeret med 11 siffer, DDMMÅÅNNNNN',
  personalNumberHint: 'Du kan ikke endre fødselsnummeret ditt her.',
  registration: 'Kjøretøyets registreringsnummer',
  registrationWhere: 'Du finner det i vognkortet.',
  registrationHint: 'For eksempel AB 12345',
  registrationError: 'Skriv inn et registreringsnummer i riktig format, for eksempel AB 12345',
  email: 'E-postadresse',
  emailHint: 'Vi sender vedtaket til denne adressen.',
  emailError: 'Skriv inn en e-postadresse i riktig format, for eksempel navn@eksempel.no',
  phone: 'Telefonnummer',
  phoneHint: 'Vi ringer bare hvis noe er feil.',
  website: 'Nettsted',
  password: 'Passord',
  search: 'Søk i tjenesten',
  children: 'Hvor mange barn bor hos deg?',
  childrenError: 'Skriv antall barn som et heltall, for eksempel 2',
  childrenHint: 'Et helt tall fra 0 til 12, for eksempel 2.',
  childrenRangeError: 'Skriv antall barn som et tall fra 0 til 12, for eksempel 2',
  rent: 'Hvor mye betaler du i husleie hver måned?',
  rentHint: (example) => `Skriv beløpet uten valutategn, for eksempel ${example}.`,
  rentError: (example) => `Skriv husleien som et beløp, for eksempel ${example}`,
  caseNumber: 'Saksnummer',
  caseNumberHint: 'Det står øverst i brevet vårt, for eksempel 004512.',
  postcode: 'Postnummer',
  postcodeHint: 'For eksempel 0150',
  longLabel: 'Referansenummer for søknaden din om tilskudd til tilpasning av bolig',
  grantReferenceHint: 'Det står i vedtaket om tilskudd til tilpasning av bolig.',
  messageLimit: 'Maks 500 tegn.',
  rentWithUnit: 'Månedlig husleie i kroner',
  rentUnit: 'kr',
  rentUnitExample: (example) => `For eksempel ${example}`,
  balance: 'Saldo på kontoen din i kroner',
  balanceHint: (example) =>
    `Hvis saldoen er negativ, skriver du et minustegn først, for eksempel ${example}.`,
  workTime: 'Arbeidstid i prosent av full stilling',
  workTimeUnit: '%',
  workTimeExample: 'For eksempel 75 eller 37,5',
  distance: 'Avstand fra hjemmet til skolen i kilometer',
  distanceHint: 'Mål den korteste gangveien.',
  distanceUnit: 'km',
  searchServices: 'Søk etter tjenester',
  searchClear: 'Tøm',
  searchClearName: 'Tøm søket',
  visitDate: 'Dato for besøket',
  visitDateExample: 'For eksempel 27.03.2026',
  visitDay: 'Dag',
  visitMonth: 'Måned',
  visitYear: 'År',
  amountEuro: 'Beløp i euro',
  amountEuroUnit: '€',
  grantWithUnit: 'Beløpet du søker om i tilskudd til tilpasning av bolig, i kroner',
  addressLegend: 'Hvor bor du?',
  addressHint: 'Adressen der du er folkeregistrert.',
  addressFormat: 'Skriv adressen uten land.',
  addressError: 'Skriv inn adressen din',
  street: 'Gateadresse',
  town: 'Poststed',
  youTyped: 'Du skrev',
  send: 'Send',
  filter: 'Filtrer',
  sent: 'Sendt',
  surface: 'På en flate',
  inCard: 'I et kort',
  proseHeading: 'Opplysningene dine',
  proseText: 'Fyll ut opplysningene nedenfor. Feltene hører til skjemaet, ikke til artikkelen.',
}

const textsNn: FormTexts = {
  name: 'Fullt namn',
  nameQuestion: 'Kva er det fulle namnet ditt?',
  nameHint: 'Slik det står i passet ditt.',
  nameError: 'Skriv inn fullt namn',
  personalNumber: 'Fødselsnummer',
  personalNumberWhy: 'Vi brukar det til å hente opplysningane dine frå Skatteetaten.',
  personalNumberFormat: '11 siffer, DDMMÅÅNNNNN',
  personalNumberError: 'Skriv fødselsnummeret med 11 siffer, DDMMÅÅNNNNN',
  personalNumberHint: 'Du kan ikkje endre fødselsnummeret ditt her.',
  registration: 'Registreringsnummeret til kjøretøyet',
  registrationWhere: 'Du finn det i vognkortet.',
  registrationHint: 'Til dømes AB 12345',
  registrationError: 'Skriv inn eit registreringsnummer i riktig format, til dømes AB 12345',
  email: 'E-postadresse',
  emailHint: 'Vi sender vedtaket til denne adressa.',
  emailError: 'Skriv inn ei e-postadresse i riktig format, til dømes namn@eksempel.no',
  phone: 'Telefonnummer',
  phoneHint: 'Vi ringer berre viss noko er feil.',
  website: 'Nettstad',
  password: 'Passord',
  search: 'Søk i tenesta',
  children: 'Kor mange barn bur hos deg?',
  childrenError: 'Skriv talet på barn som eit heiltal, til dømes 2',
  childrenHint: 'Eit heiltal frå 0 til 12, til dømes 2.',
  childrenRangeError: 'Skriv talet på barn som eit tal frå 0 til 12, til dømes 2',
  rent: 'Kor mykje betaler du i husleige kvar månad?',
  rentHint: (example) => `Skriv beløpet utan valutateikn, til dømes ${example}.`,
  rentError: (example) => `Skriv husleiga som eit beløp, til dømes ${example}`,
  caseNumber: 'Saksnummer',
  caseNumberHint: 'Det står øvst i brevet vårt, til dømes 004512.',
  postcode: 'Postnummer',
  postcodeHint: 'Til dømes 0150',
  longLabel: 'Referansenummer for søknaden din om tilskot til tilpassing av bustad',
  grantReferenceHint: 'Det står i vedtaket om tilskot til tilpassing av bustad.',
  messageLimit: 'Maks 500 teikn.',
  rentWithUnit: 'Månadleg husleige i kroner',
  rentUnit: 'kr',
  rentUnitExample: (example) => `Til dømes ${example}`,
  balance: 'Saldo på kontoen din i kroner',
  balanceHint: (example) =>
    `Viss saldoen er negativ, skriv eit minusteikn først, til dømes ${example}.`,
  workTime: 'Arbeidstid i prosent av full stilling',
  workTimeUnit: '%',
  workTimeExample: 'Til dømes 75 eller 37,5',
  distance: 'Avstand frå heimen til skulen i kilometer',
  distanceHint: 'Mål den kortaste gangvegen.',
  distanceUnit: 'km',
  searchServices: 'Søk etter tenester',
  searchClear: 'Tøm',
  searchClearName: 'Tøm søket',
  visitDate: 'Dato for besøket',
  visitDateExample: 'Til dømes 27.03.2026',
  visitDay: 'Dag',
  visitMonth: 'Månad',
  visitYear: 'År',
  amountEuro: 'Beløp i euro',
  amountEuroUnit: '€',
  grantWithUnit: 'Beløpet du søkjer om i tilskot til tilpassing av bustad, i kroner',
  addressLegend: 'Kvar bur du?',
  addressHint: 'Adressa der du er folkeregistrert.',
  addressFormat: 'Skriv adressa utan land.',
  addressError: 'Skriv inn adressa di',
  street: 'Gateadresse',
  town: 'Poststad',
  youTyped: 'Du skreiv',
  send: 'Send',
  filter: 'Filtrer',
  sent: 'Sendt',
  surface: 'På ei flate',
  inCard: 'I eit kort',
  proseHeading: 'Opplysningane dine',
  proseText: 'Fyll ut opplysningane nedanfor. Felta høyrer til skjemaet, ikkje til artikkelen.',
}

/** se has no texts: it shows the English ones, marked lang="en". */
const formTexts: Record<FormLocale, FormTexts | undefined> = {
  sv: textsSv,
  fi: textsFi,
  nb: textsNb,
  nn: textsNn,
  se: undefined,
  en: textsEn,
}

const formatLocales: Record<'sv' | 'fi' | 'nb' | 'nn' | 'en', string> = {
  sv: 'sv-SE',
  fi: 'fi-FI',
  nb: 'nb-NO',
  nn: 'nn-NO',
  en: 'en-GB',
}

export const isFormLocale = (value: unknown): value is FormLocale =>
  typeof value === 'string' && value in formTexts

/** The Locale toolbar's value, `sv` when it's missing. */
export const localeOf = (globals: Record<string, unknown>): FormLocale => {
  const locale = globals['locale']
  return isFormLocale(locale) ? locale : 'sv'
}

interface ResolvedFormTexts {
  text: FormTexts
  /** `'en'` when the locale has no texts (se): put it on the element (3.1.2). */
  lang: 'en' | undefined
  /** `1250.5` written the way the locale writes an amount: en `1,250.50`, sv `1 250,50`. */
  rentExample: string
  /** `8450` written the way the locale writes a whole amount: en `8,450`, sv `8 450`. */
  amountExample: string
}

/** The fixture text in a locale, or the English text with `lang="en"` for se. */
export function textsFor(locale: FormLocale): ResolvedFormTexts {
  const text = formTexts[locale]
  const known = text !== undefined
  const formatLocale = formatLocales[locale === 'se' ? 'en' : locale]
  return {
    text: text ?? textsEn,
    lang: known ? undefined : 'en',
    rentExample: new Intl.NumberFormat(formatLocale, { minimumFractionDigits: 2 }).format(1250.5),
    amountExample: new Intl.NumberFormat(formatLocale).format(8450),
  }
}

const catalogs: Record<FormLocale, KvirnMessages> = { sv, fi, nb, nn, se, en }

/** The library strings a story shows in a locale: English where the fixture has no texts (se). */
export const messagesFor = (locale: FormLocale): KvirnMessages =>
  formTexts[locale] === undefined ? en : catalogs[locale]

const asText = (message: TextMessage): string =>
  typeof message === 'function' ? message() : message

/** The text `Label` and `ErrorMessage` add in a locale, for the plays' assertions. */
export function fieldMessagesFor(locale: FormLocale): { optional: string; errorPrefix: string } {
  const { optional, errorPrefix } = messagesFor(locale).field
  return { optional: asText(optional), errorPrefix: asText(errorPrefix) }
}

/**
 * Library strings ("(valfritt)", "Fel:") follow the locale toolbar, like an app's provider
 * would. The fixture text follows it through `textsFor`. Where the fixture shows English (se),
 * the library strings are English too, so a `lang="en"` element is all English.
 */
export const withFormLocale: Decorator = (Story, { globals }) => {
  const locale = localeOf(globals)
  return (
    <KvirnProvider locale={locale} messages={messagesFor(locale)}>
      <Story />
    </KvirnProvider>
  )
}

/**
 * Every state of a text field in one column, in the default order (forms skill: label,
 * description, control, help text, error): with a description above, invalid, optional, disabled and
 * read-only with its help text under the box. The RTL and ForcedColors stories of each page render it.
 */
export function FieldStates({ locale }: { locale: FormLocale }) {
  const { text, lang } = textsFor(locale)
  return (
    <div className="kv-story-form" lang={lang}>
      <Field.Root required>
        <Field.Label>{text.name}</Field.Label>
        <Field.Prose>
          <p>{text.nameHint}</p>
        </Field.Prose>
        <TextInput name="name" autoComplete="name" />
      </Field.Root>
      <Field.Root required invalid>
        <Field.Label>{text.email}</Field.Label>
        <Field.Prose>
          <p>{text.emailHint}</p>
        </Field.Prose>
        <TextInput name="email" type="email" autoComplete="email" defaultValue="anna@" />
        <Field.ErrorMessage>{text.emailError}</Field.ErrorMessage>
      </Field.Root>
      <Field.Root>
        <Field.Label>{text.phone}</Field.Label>
        <TextInput name="phone" type="tel" autoComplete="tel" className="kv-input--width-20" />
      </Field.Root>
      <Field.Root required disabled>
        <Field.Label>{text.registration}</Field.Label>
        <TextInput name="registration" defaultValue="ABC 123" className="kv-input--width-10" />
      </Field.Root>
      <Field.Root required>
        <Field.Label>{text.personalNumber}</Field.Label>
        <TextInput name="personal-number" readOnly defaultValue="19900101-1234" />
        <Field.HelpText>{text.personalNumberHint}</Field.HelpText>
      </Field.Root>
    </div>
  )
}
