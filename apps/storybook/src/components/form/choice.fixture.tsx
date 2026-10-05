import { action } from 'storybook/actions'
import type { FormLocale } from './form.fixture.tsx'

// Story fixture for Components/Form/Checkbox, CheckboxGroup, RadioGroup and Listbox
// (native rendering) (docs/design/form-fields.md §4.2, §4.3, §7.1). sv, en, fi, nb and nn are
// written. The fi strings are designer drafts, for length checks only. se: English, marked
// lang="en" (3.1.2). The library's own strings ("(optional)", "Error:") follow the locale
// through `withFormLocale`.
//
// KvirnUI holds no form state. Nothing here validates: an "invalid" story
// sets `invalid` and writes the message itself, as an implementor's form logic would.

export interface ChoiceTexts {
  declaration: string
  declarationHint: string
  declarationError: string
  newsletter: string
  newsletterHint: string
  selectAll: string
  rowOne: string
  rowTwo: string
  longLabel: string
  contactLegend: string
  contactHint: string
  contactEmail: string
  contactEmailHint: string
  contactText: string
  contactLetter: string
  contactLetterHint: string
  contactError: string
  durationLegend: string
  durationHint: string
  duration1: string
  duration6: string
  duration12: string
  duration12Hint: string
  durationError: string
  municipality: string
  municipalityHint: string
  municipalityPlaceholder: string
  municipalityError: string
  municipalityGothenburg: string
  municipalityStockholm: string
  municipalityMalmo: string
  municipalityUppsala: string
  regionWest: string
  regionEast: string
  regionSouth: string
  longSelectLabel: string
  youChose: string
  send: string
  sent: string
  surface: string
}

const textsEn: ChoiceTexts = {
  declaration: 'I confirm that the information I have given is correct',
  declarationHint: 'You can’t send the application without confirming.',
  declarationError: 'Confirm that the information you have given is correct',
  newsletter: 'Send me the newsletter',
  newsletterHint: 'Four times a year.',
  selectAll: 'Select all rows',
  rowOne: 'Case 2026-0412',
  rowTwo: 'Case 2026-0413',
  longLabel:
    'I agree that the municipality may use my details for the housing adaptation grant application',
  contactLegend: 'How should we contact you about your permit?',
  contactHint: 'Select all that apply.',
  contactEmail: 'Email',
  contactEmailHint: 'We’ll send the decision as a message.',
  contactText: 'Text message',
  contactLetter: 'Letter',
  contactLetterHint: 'A letter takes a few days longer.',
  contactError: 'Select how we should contact you',
  durationLegend: 'How long do you need the permit?',
  durationHint: 'Choose one.',
  duration1: '1 month',
  duration6: '6 months',
  duration12: '12 months',
  duration12Hint: 'The lowest price per month.',
  durationError: 'Select how long you need the permit',
  municipality: 'Municipality',
  municipalityHint: 'The municipality where you are registered.',
  municipalityPlaceholder: 'Choose a municipality',
  municipalityError: 'Choose a municipality',
  municipalityGothenburg: 'Gothenburg',
  municipalityStockholm: 'Stockholm',
  municipalityMalmo: 'Malmö',
  municipalityUppsala: 'Uppsala',
  regionWest: 'Western Sweden',
  regionEast: 'Eastern Sweden',
  regionSouth: 'Southern Sweden',
  longSelectLabel: 'Municipality where the housing adaptation grant will be paid out',
  youChose: 'You chose',
  send: 'Send',
  sent: 'Sent',
  surface: 'In a card',
}

const textsSv: ChoiceTexts = {
  declaration: 'Jag intygar att uppgifterna jag har lämnat är korrekta',
  declarationHint: 'Du kan inte skicka ansökan utan att intyga.',
  declarationError: 'Intyga att uppgifterna du har lämnat är korrekta',
  newsletter: 'Skicka nyhetsbrevet till mig',
  newsletterHint: 'Fyra gånger om året.',
  selectAll: 'Markera alla rader',
  rowOne: 'Ärende 2026-0412',
  rowTwo: 'Ärende 2026-0413',
  longLabel:
    'Jag samtycker till att kommunen använder mina uppgifter för ansökan om bostadsanpassningsbidrag',
  contactLegend: 'Hur ska vi kontakta dig om tillståndet?',
  contactHint: 'Välj alla som passar.',
  contactEmail: 'E-post',
  contactEmailHint: 'Vi skickar beslutet som ett meddelande.',
  contactText: 'Sms',
  contactLetter: 'Brev',
  contactLetterHint: 'Ett brev tar några dagar längre.',
  contactError: 'Välj hur vi ska kontakta dig',
  durationLegend: 'Hur länge behöver du tillståndet?',
  durationHint: 'Välj ett alternativ.',
  duration1: '1 månad',
  duration6: '6 månader',
  duration12: '12 månader',
  duration12Hint: 'Lägst pris per månad.',
  durationError: 'Välj hur länge du behöver tillståndet',
  municipality: 'Kommun',
  municipalityHint: 'Kommunen där du är folkbokförd.',
  municipalityPlaceholder: 'Välj kommun',
  municipalityError: 'Välj en kommun',
  municipalityGothenburg: 'Göteborg',
  municipalityStockholm: 'Stockholm',
  municipalityMalmo: 'Malmö',
  municipalityUppsala: 'Uppsala',
  regionWest: 'Västsverige',
  regionEast: 'Östra Sverige',
  regionSouth: 'Södra Sverige',
  longSelectLabel: 'Kommun där bostadsanpassningsbidraget ska betalas ut',
  youChose: 'Du valde',
  send: 'Skicka',
  sent: 'Skickat',
  surface: 'I ett kort',
}

/** Designer drafts (docs/design/form-fields.md §4), for length checks. */
const textsFi: ChoiceTexts = {
  declaration: 'Vahvistan, että antamani tiedot ovat oikein',
  declarationHint: 'Hakemusta ei voi lähettää ilman vahvistusta.',
  declarationError: 'Vahvista, että antamasi tiedot ovat oikein',
  newsletter: 'Lähetä minulle uutiskirje',
  newsletterHint: 'Neljä kertaa vuodessa.',
  selectAll: 'Valitse kaikki rivit',
  rowOne: 'Asia 2026-0412',
  rowTwo: 'Asia 2026-0413',
  longLabel: 'Suostun siihen, että kunta käyttää tietojani asunnonmuutostyöavustuksen hakemuksessa',
  contactLegend: 'Miten otamme sinuun yhteyttä tunnukseen liittyvissä asioissa?',
  contactHint: 'Valitse kaikki sopivat vaihtoehdot.',
  contactEmail: 'Sähköposti',
  contactEmailHint: 'Lähetämme päätöksen viestinä.',
  contactText: 'Tekstiviesti',
  contactLetter: 'Kirje',
  contactLetterHint: 'Kirje kestää muutaman päivän pidempään.',
  contactError: 'Valitse, miten otamme sinuun yhteyttä',
  durationLegend: 'Kuinka pitkäksi aikaa tarvitset tunnuksen?',
  durationHint: 'Valitse yksi vaihtoehto.',
  duration1: '1 kuukausi',
  duration6: '6 kuukautta',
  duration12: '12 kuukautta',
  duration12Hint: 'Edullisin kuukausihinta.',
  durationError: 'Valitse, kuinka pitkäksi aikaa tarvitset tunnuksen',
  municipality: 'Kunta',
  municipalityHint: 'Kunta, jossa olet kirjoilla.',
  municipalityPlaceholder: 'Valitse kunta',
  municipalityError: 'Valitse kunta',
  municipalityGothenburg: 'Göteborg',
  municipalityStockholm: 'Tukholma',
  municipalityMalmo: 'Malmö',
  municipalityUppsala: 'Uppsala',
  regionWest: 'Länsi-Ruotsi',
  regionEast: 'Itä-Ruotsi',
  regionSouth: 'Etelä-Ruotsi',
  longSelectLabel: 'Kunta, jossa asunnonmuutostyöavustus maksetaan',
  youChose: 'Valitsit',
  send: 'Lähetä',
  sent: 'Lähetetty',
  surface: 'Kortissa',
}

const textsNb: ChoiceTexts = {
  declaration: 'Jeg bekrefter at opplysningene jeg har gitt, er riktige',
  declarationHint: 'Du kan ikke sende søknaden uten å bekrefte.',
  declarationError: 'Bekreft at opplysningene du har gitt, er riktige',
  newsletter: 'Send meg nyhetsbrevet',
  newsletterHint: 'Fire ganger i året.',
  selectAll: 'Velg alle rader',
  rowOne: 'Sak 2026-0412',
  rowTwo: 'Sak 2026-0413',
  longLabel:
    'Jeg samtykker til at kommunen bruker opplysningene mine i søknaden om tilskudd til tilpasning av bolig',
  contactLegend: 'Hvordan skal vi kontakte deg om tillatelsen?',
  contactHint: 'Velg alle som passer.',
  contactEmail: 'E-post',
  contactEmailHint: 'Vi sender vedtaket som en melding.',
  contactText: 'SMS',
  contactLetter: 'Brev',
  contactLetterHint: 'Et brev tar noen dager lenger.',
  contactError: 'Velg hvordan vi skal kontakte deg',
  durationLegend: 'Hvor lenge trenger du tillatelsen?',
  durationHint: 'Velg ett alternativ.',
  duration1: '1 måned',
  duration6: '6 måneder',
  duration12: '12 måneder',
  duration12Hint: 'Laveste pris per måned.',
  durationError: 'Velg hvor lenge du trenger tillatelsen',
  municipality: 'Kommune',
  municipalityHint: 'Kommunen der du er folkeregistrert.',
  municipalityPlaceholder: 'Velg kommune',
  municipalityError: 'Velg en kommune',
  municipalityGothenburg: 'Bergen',
  municipalityStockholm: 'Oslo',
  municipalityMalmo: 'Kristiansand',
  municipalityUppsala: 'Drammen',
  regionWest: 'Vestlandet',
  regionEast: 'Østlandet',
  regionSouth: 'Sørlandet',
  longSelectLabel: 'Kommunen der tilskuddet til tilpasning av bolig skal utbetales',
  youChose: 'Du valgte',
  send: 'Send',
  sent: 'Sendt',
  surface: 'I et kort',
}

const textsNn: ChoiceTexts = {
  declaration: 'Eg stadfestar at opplysningane eg har gitt, er riktige',
  declarationHint: 'Du kan ikkje sende søknaden utan å stadfeste.',
  declarationError: 'Stadfest at opplysningane du har gitt, er riktige',
  newsletter: 'Send meg nyheitsbrevet',
  newsletterHint: 'Fire gonger i året.',
  selectAll: 'Vel alle rader',
  rowOne: 'Sak 2026-0412',
  rowTwo: 'Sak 2026-0413',
  longLabel:
    'Eg samtykkjer til at kommunen brukar opplysningane mine i søknaden om tilskot til tilpassing av bustad',
  contactLegend: 'Korleis skal vi kontakte deg om løyvet?',
  contactHint: 'Vel alle som passar.',
  contactEmail: 'E-post',
  contactEmailHint: 'Vi sender vedtaket som ei melding.',
  contactText: 'SMS',
  contactLetter: 'Brev',
  contactLetterHint: 'Eit brev tek nokre dagar lenger.',
  contactError: 'Vel korleis vi skal kontakte deg',
  durationLegend: 'Kor lenge treng du løyvet?',
  durationHint: 'Vel eitt alternativ.',
  duration1: '1 månad',
  duration6: '6 månader',
  duration12: '12 månader',
  duration12Hint: 'Lågaste pris per månad.',
  durationError: 'Vel kor lenge du treng løyvet',
  municipality: 'Kommune',
  municipalityHint: 'Kommunen der du er folkeregistrert.',
  municipalityPlaceholder: 'Vel kommune',
  municipalityError: 'Vel ei kommune',
  municipalityGothenburg: 'Bergen',
  municipalityStockholm: 'Oslo',
  municipalityMalmo: 'Kristiansand',
  municipalityUppsala: 'Drammen',
  regionWest: 'Vestlandet',
  regionEast: 'Austlandet',
  regionSouth: 'Sørlandet',
  longSelectLabel: 'Kommunen der tilskotet til tilpassing av bustad skal utbetalast',
  youChose: 'Du valde',
  send: 'Send',
  sent: 'Sendt',
  surface: 'I eit kort',
}

/** se has no texts: it shows the English ones, marked lang="en". */
const choiceTexts: Record<FormLocale, ChoiceTexts | undefined> = {
  sv: textsSv,
  fi: textsFi,
  nb: textsNb,
  nn: textsNn,
  se: undefined,
  en: textsEn,
}

/** The fixture text in a locale, or the English text with `lang="en"` for se. */
export function choiceTextsFor(locale: FormLocale): { text: ChoiceTexts; lang: 'en' | undefined } {
  const text = choiceTexts[locale]
  return { text: text ?? textsEn, lang: text === undefined ? 'en' : undefined }
}

/**
 * A story's `onValueChange` / `onCheckedChange` logger for the Actions panel. Storybook's own
 * `action` arg serializes every argument on each change, and the second one holds the React
 * event with its DOM nodes and fibers: about 40 ms on a native select, which feels laggy. This
 * logs the value and the reason only.
 */
export function logChange(name: string): (value: unknown, details?: { reason?: string }) => void {
  const log = action(name)
  return (value, details) => {
    log(value, details?.reason)
  }
}
