import { textsFor } from '../form/form.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'

// Fixture text for Components/Form/OneTimeCode (Plan 0014 and Plan 0019,
// docs/design/one-time-code.md §4). The help text is built from the pattern: it says the length and the
// groups, because the boxes are hidden from screen readers and disappear in the fallback.
// The length is the characters, never the dashes. The numbers are small
// integers, so they read the same in every locale (no number words). The component adds no strings of its own: the label and the help text belong to the consumer,
// because they name the channel and the length. The strings below are fixture text, with keys
// local to this file. sv, en, fi, nb and nn are written (the fi strings are the designer's drafts, for
// length checks). se: English, marked lang="en" (3.1.2). The library's own strings (the mask's
// rejection messages, "Error:") follow the locale through the shared provider decorator.
//
// KvirnUI holds no form state. Nothing here validates or checks the code: an
// invalid story sets `invalid` and writes the message itself, as an implementor's form logic
// would.

export interface OneTimeCodeTexts {
  smsLabel: string
  /** An ungrouped digits code. `length` is the number of digits. */
  smsHint: (length: number) => string
  /** A code of some letters, a dash and then digits (`AA-9999`). */
  smsPrefixHint: (letters: number, digits: number) => string
  emailLabel: string
  /** A code of letters and digits in equal groups (`&&&&-&&&&`). `length` counts characters only. */
  emailGroupsHint: (length: number, groupCount: number, groupLength: number) => string
  appLabel: string
  appHint: (length: number) => string
  signInLabel: string
  /** A code of capital letters only (`PatternLimits`): the label names the count, so it is unique. */
  lettersLabel: (length: number) => string
  /** `groupCount` is 1 for an ungrouped code, and then the groups are not mentioned. */
  lettersHint: (length: number, groupCount: number, groupLength: number) => string
  submit: string
  errorWrong: string
}

const textsEn: OneTimeCodeTexts = {
  smsLabel: 'Code from the text message',
  smsHint: (length) =>
    `The code has ${length} digits. You’ll find it in the text message we just sent you.`,
  emailLabel: 'Code from the email',
  smsPrefixHint: (letters, digits) =>
    `The code has ${letters} letters and then ${digits} digits. You’ll find it in the text message we just sent you.`,
  emailGroupsHint: (length, groupCount, groupLength) =>
    `The code has ${length} letters and digits, in ${groupCount} groups of ${groupLength}. You’ll find it in the email we just sent you.`,
  appLabel: 'Code from your authenticator app',
  appHint: (length) => `Open the app and enter the code it shows. The code has ${length} digits.`,
  signInLabel: 'Code to sign in',
  lettersLabel: (length) => `Code with ${length} capital letters`,
  lettersHint: (length, groupCount, groupLength) =>
    `The code has ${length} capital letters${groupCount > 1 ? `, in ${groupCount} groups of ${groupLength}` : ''}.`,
  submit: 'Continue',
  errorWrong:
    'The code doesn’t match the one we sent. Check the text message and enter the code again.',
}

const textsSv: OneTimeCodeTexts = {
  smsLabel: 'Kod från sms:et',
  smsHint: (length) =>
    `Koden har ${length} siffror. Du hittar den i sms:et som vi just skickade till dig.`,
  emailLabel: 'Kod från e-postmeddelandet',
  smsPrefixHint: (letters, digits) =>
    `Koden har ${letters} bokstäver och sedan ${digits} siffror. Du hittar den i sms:et som vi just skickade till dig.`,
  emailGroupsHint: (length, groupCount, groupLength) =>
    `Koden har ${length} bokstäver och siffror, i ${groupCount} grupper om ${groupLength}. Du hittar den i e-postmeddelandet som vi just skickade till dig.`,
  appLabel: 'Kod från din autentiseringsapp',
  appHint: (length) => `Öppna appen och skriv koden som visas. Koden har ${length} siffror.`,
  signInLabel: 'Kod för inloggning',
  lettersLabel: (length) => `Kod med ${length} versaler`,
  lettersHint: (length, groupCount, groupLength) =>
    `Koden har ${length} versaler${groupCount > 1 ? `, i ${groupCount} grupper om ${groupLength}` : ''}.`,
  submit: 'Fortsätt',
  errorWrong: 'Koden stämmer inte med den vi skickade. Kontrollera sms:et och skriv koden igen.',
}

const textsFi: OneTimeCodeTexts = {
  smsLabel: 'Tekstiviestissä saamasi koodi',
  smsHint: (length) =>
    `Koodissa on ${length} numeroa. Löydät sen tekstiviestistä, jonka lähetimme sinulle juuri.`,
  emailLabel: 'Sähköpostissa saamasi koodi',
  smsPrefixHint: (letters, digits) =>
    `Koodissa on ensin ${letters} kirjainta ja sitten ${digits} numeroa. Löydät sen tekstiviestistä, jonka lähetimme sinulle juuri.`,
  emailGroupsHint: (length, groupCount, groupLength) =>
    `Koodissa on ${length} merkkiä, sekä kirjaimia että numeroita, ${groupCount} ryhmässä, joissa kussakin on ${groupLength} merkkiä. Löydät sen sähköpostista, jonka lähetimme sinulle juuri.`,
  appLabel: 'Todennussovelluksesi koodi',
  appHint: (length) =>
    `Avaa sovellus ja kirjoita siinä näkyvä koodi. Koodissa on ${length} numeroa.`,
  signInLabel: 'Kirjautumiskoodi',
  lettersLabel: (length) => `Koodi, jossa on ${length} isoa kirjainta`,
  lettersHint: (length, groupCount, groupLength) =>
    `Koodissa on ${length} isoa kirjainta${groupCount > 1 ? `, ${groupCount} ryhmässä, joissa kussakin on ${groupLength} merkkiä` : ''}.`,
  submit: 'Jatka',
  errorWrong:
    'Koodi ei vastaa lähettämäämme koodia. Tarkista tekstiviesti ja kirjoita koodi uudelleen.',
}

const textsNb: OneTimeCodeTexts = {
  smsLabel: 'Kode fra SMS-en',
  smsHint: (length) => `Koden har ${length} siffer. Du finner den i SMS-en vi nettopp sendte deg.`,
  emailLabel: 'Kode fra e-posten',
  smsPrefixHint: (letters, digits) =>
    `Koden har ${letters} bokstaver og deretter ${digits} siffer. Du finner den i SMS-en vi nettopp sendte deg.`,
  emailGroupsHint: (length, groupCount, groupLength) =>
    `Koden har ${length} bokstaver og siffer, i ${groupCount} grupper på ${groupLength}. Du finner den i e-posten vi nettopp sendte deg.`,
  appLabel: 'Kode fra autentiseringsappen din',
  appHint: (length) => `Åpne appen og skriv inn koden som vises. Koden har ${length} siffer.`,
  signInLabel: 'Kode for innlogging',
  lettersLabel: (length) => `Kode med ${length} store bokstaver`,
  lettersHint: (length, groupCount, groupLength) =>
    `Koden har ${length} store bokstaver${groupCount > 1 ? `, i ${groupCount} grupper på ${groupLength}` : ''}.`,
  submit: 'Gå videre',
  errorWrong: 'Koden stemmer ikke med den vi sendte. Sjekk SMS-en og skriv inn koden på nytt.',
}

const textsNn: OneTimeCodeTexts = {
  smsLabel: 'Kode frå SMS-en',
  smsHint: (length) => `Koden har ${length} siffer. Du finn koden i SMS-en vi nett sende deg.`,
  emailLabel: 'Kode frå e-posten',
  smsPrefixHint: (letters, digits) =>
    `Koden har ${letters} bokstavar og deretter ${digits} siffer. Du finn koden i SMS-en vi nett sende deg.`,
  emailGroupsHint: (length, groupCount, groupLength) =>
    `Koden har ${length} bokstavar og siffer, i ${groupCount} grupper på ${groupLength}. Du finn koden i e-posten vi nett sende deg.`,
  appLabel: 'Kode frå autentiseringsappen din',
  appHint: (length) => `Opne appen og skriv inn koden som blir vist. Koden har ${length} siffer.`,
  signInLabel: 'Kode for innlogging',
  lettersLabel: (length) => `Kode med ${length} store bokstavar`,
  lettersHint: (length, groupCount, groupLength) =>
    `Koden har ${length} store bokstavar${groupCount > 1 ? `, i ${groupCount} grupper på ${groupLength}` : ''}.`,
  submit: 'Gå vidare',
  errorWrong: 'Koden stemmer ikkje med den vi sende. Sjekk SMS-en og skriv inn koden på nytt.',
}

/** se has no texts: it shows the English ones, marked lang="en". */
const oneTimeCodeTexts: Record<FormLocale, OneTimeCodeTexts | undefined> = {
  sv: textsSv,
  fi: textsFi,
  nb: textsNb,
  nn: textsNn,
  se: undefined,
  en: textsEn,
}

/** The fixture text in a locale, or the English text for se. */
export function oneTimeCodeTextsFor(locale: FormLocale): OneTimeCodeTexts {
  return oneTimeCodeTexts[locale] ?? textsEn
}

/** Where the code comes from: it decides the label and the help text. */
export type CodeKind = 'sms' | 'email' | 'app' | 'signIn' | 'letters'

/** The shape of a pattern: its groups (split at the dashes) and its characters, dashes not counted. */
function shapeOf(pattern: string) {
  const groups = pattern.split('-')
  return { groups, characterCount: groups.join('').length }
}

const labelsFor = (texts: OneTimeCodeTexts, kind: CodeKind, pattern: string) => {
  const { groups, characterCount } = shapeOf(pattern)
  switch (kind) {
    case 'email':
      return {
        label: texts.emailLabel,
        hint: texts.emailGroupsHint(characterCount, groups.length, groups[0]?.length ?? 0),
      }
    case 'app':
      return { label: texts.appLabel, hint: texts.appHint(characterCount) }
    case 'signIn':
      return { label: texts.signInLabel, hint: texts.appHint(characterCount) }
    case 'letters':
      return {
        label: texts.lettersLabel(characterCount),
        hint: texts.lettersHint(characterCount, groups.length, groups[0]?.length ?? 0),
      }
    default:
      // Some letters and then some digits (`AA-9999`) is said as such. Any other code is "N digits".
      return {
        label: texts.smsLabel,
        hint:
          groups.length === 2
            ? texts.smsPrefixHint(groups[0]?.length ?? 0, groups[1]?.length ?? 0)
            : texts.smsHint(characterCount),
      }
  }
}

/**
 * What a story's Field says, in a locale: the label, the description above the boxes (the length
 * and the groups must be read before typing), the error for a wrong code, and the Continue button.
 * `lang` is `'en'` where the fixture shows English (se): put it on the Field (3.1.2).
 */
export function codeTextsFor(locale: FormLocale, kind: CodeKind, pattern: string) {
  const texts = oneTimeCodeTextsFor(locale)
  const { lang } = textsFor(locale)
  const { label, hint } = labelsFor(texts, kind, pattern)
  return { label, hint, lang, errorWrong: texts.errorWrong, submit: texts.submit }
}
