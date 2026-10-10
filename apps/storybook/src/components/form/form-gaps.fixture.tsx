import type { FormLocale } from './form.fixture.tsx'

// Story texts for the Field and Fieldset examples that show an option the main examples don't:
// `messages`, `controlId`, several descriptions, a group, a required group and an optional section.
// What the consumer writes (the labels, the descriptions, the errors, the words that replace the
// library's own) belongs to the form, not to the library, so it lives here and not in a catalog.
// sv, fi, nb, nn and en are written.

export interface FormGapTexts {
  /** Replaces the library's "(valfritt)" in one Field or Fieldset: the `messages` example. */
  ownOptional: string
  /** Replaces the library's "Fel:" before an error: the `messages` example. */
  ownErrorPrefix: string
  /** The heading of the error summary that links to a Field by its `controlId`. */
  summaryHeading: string
  /** The phone number's error, in the summary and under the Field. */
  phoneError: string
  /** A second description above the control: why we ask. */
  registrationWhy: string
  /** The group's question: a Fieldset with `group`. */
  groupLegend: string
  /** The group's description. */
  groupHint: string
  /** A paragraph elsewhere on the page that also describes the group (`aria-describedby`). */
  groupNote: string
  /** An optional section of the form: a plain Fieldset with `marker="optional"` on its legend. */
  sectionLegend: string
  sectionHint: string
}

const textsEn: FormGapTexts = {
  ownOptional: '(you can skip it)',
  ownErrorPrefix: 'Problem:',
  summaryHeading: 'There is a problem',
  phoneError: 'Enter a phone number with digits only, like 07012345678',
  registrationWhy: 'We use it to check that you are entitled to the permit.',
  groupLegend: 'How can we reach you?',
  groupHint: 'You can write one or both.',
  groupNote: 'We keep your contact details for one year at most.',
  sectionLegend: 'Contact person',
  sectionHint: 'Fill in if someone else can answer for you.',
}

const textsSv: FormGapTexts = {
  ownOptional: '(kan hoppas över)',
  ownErrorPrefix: 'Problem:',
  summaryHeading: 'Det finns ett problem',
  phoneError: 'Ange ett telefonnummer med bara siffror, till exempel 0701234567',
  registrationWhy: 'Vi använder det för att kontrollera att du har rätt till tillståndet.',
  groupLegend: 'Hur kan vi nå dig?',
  groupHint: 'Du kan skriva ett eller båda.',
  groupNote: 'Vi sparar dina kontaktuppgifter i högst ett år.',
  sectionLegend: 'Kontaktperson',
  sectionHint: 'Fyll i om någon annan ska kunna svara åt dig.',
}

/** Designer drafts, for length checks. */
const textsFi: FormGapTexts = {
  ownOptional: '(voi jättää väliin)',
  ownErrorPrefix: 'Ongelma:',
  summaryHeading: 'Yksi asia pitää korjata',
  phoneError: 'Anna puhelinnumero pelkillä numeroilla, esimerkiksi 0401234567',
  registrationWhy: 'Käytämme sitä tarkistaaksemme, että sinulla on oikeus lupaan.',
  groupLegend: 'Miten voimme tavoittaa sinut?',
  groupHint: 'Voit kirjoittaa toisen tai molemmat.',
  groupNote: 'Säilytämme yhteystietosi enintään vuoden.',
  sectionLegend: 'Yhteyshenkilö',
  sectionHint: 'Täytä, jos joku muu saa vastata puolestasi.',
}

const textsNb: FormGapTexts = {
  ownOptional: '(kan hoppes over)',
  ownErrorPrefix: 'Problem:',
  summaryHeading: 'Det er et problem',
  phoneError: 'Skriv telefonnummeret med bare siffer, for eksempel 91234567',
  registrationWhy: 'Vi bruker det til å kontrollere at du har rett til tillatelsen.',
  groupLegend: 'Hvordan kan vi nå deg?',
  groupHint: 'Du kan skrive ett eller begge.',
  groupNote: 'Vi lagrer kontaktopplysningene dine i høyst ett år.',
  sectionLegend: 'Kontaktperson',
  sectionHint: 'Fyll ut hvis noen andre kan svare for deg.',
}

const textsNn: FormGapTexts = {
  ownOptional: '(kan hoppast over)',
  ownErrorPrefix: 'Problem:',
  summaryHeading: 'Det er eit problem',
  phoneError: 'Skriv telefonnummeret med berre siffer, til dømes 91234567',
  registrationWhy: 'Vi brukar det til å kontrollere at du har rett til løyvet.',
  groupLegend: 'Korleis kan vi nå deg?',
  groupHint: 'Du kan skrive eitt eller begge.',
  groupNote: 'Vi lagrar kontaktopplysingane dine i høgst eitt år.',
  sectionLegend: 'Kontaktperson',
  sectionHint: 'Fyll ut viss nokon andre kan svare for deg.',
}

const gapTexts: Record<FormLocale, FormGapTexts | undefined> = {
  sv: textsSv,
  fi: textsFi,
  nb: textsNb,
  nn: textsNn,
  en: textsEn,
}

/** The fixture text in a locale. */
export function gapTextsFor(locale: FormLocale): { text: FormGapTexts; lang: 'en' | undefined } {
  const text = gapTexts[locale]
  return { text: text ?? textsEn, lang: text === undefined ? 'en' : undefined }
}
