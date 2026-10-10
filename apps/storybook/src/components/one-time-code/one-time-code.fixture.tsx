import { Button, Field, OneTimeCode, useAnnouncer } from '@kvirn-ui/react'
import { useState } from 'react'
import { textsFor } from '../form/form.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'

// Fixture text for Components/Form/OneTimeCode (Plan 0014 and Plan 0019,
// docs/design/one-time-code.md §4). The help text is built from the pattern: it says the length and the
// groups, because the boxes are hidden from screen readers and disappear in the fallback.
// The length is the characters, never the dashes. The numbers are small
// integers, so they read the same in every locale (no number words). The component adds no strings of its own: the label and the help text belong to the consumer,
// because they name the channel and the length. The strings below are fixture text, with keys
// local to this file. sv, en, fi, nb and nn are written (the fi strings are the designer's drafts, for
// length checks). The library's own strings (the mask's
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
  /** A code of some letters, a dash and then letters or digits in the case as typed (`aa-****`). */
  caseLabel: string
  caseHint: (letters: number, others: number) => string
  /** Said in the help text when the form checks the code on its own (3.2.2). */
  autoCheckHint: (length: number) => string
  /** Shown and announced while the code is being checked. */
  checking: string
  slotActive: string
  slotComplete: string
  slotSelected: string
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
  caseLabel: 'Booking code',
  caseHint: (letters, others) =>
    `The code has ${letters} letters and then ${others} letters or digits. Capitals and lower case are different, so type it as it appears in the confirmation.`,
  autoCheckHint: (length) => `We check the code as soon as you have entered all ${length} digits.`,
  checking: 'Checking the code',
  slotActive: 'The box that takes the next character, with its caret before it',
  slotComplete: 'A complete code: the caret is after the last character',
  slotSelected: 'A selection: the boxes it covers are marked',
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
  caseLabel: 'Bokningskod',
  caseHint: (letters, others) =>
    `Koden har ${letters} bokstäver och sedan ${others} bokstäver eller siffror. Stora och små bokstäver är olika, så skriv som det står i bekräftelsen.`,
  autoCheckHint: (length) => `Vi kontrollerar koden så fort du har skrivit alla ${length} siffror.`,
  checking: 'Vi kontrollerar koden',
  slotActive: 'Rutan som tar nästa tecken, med markören före',
  slotComplete: 'En komplett kod: markören står efter det sista tecknet',
  slotSelected: 'En markering: rutorna den täcker är markerade',
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
  caseLabel: 'Varauskoodi',
  caseHint: (letters, others) =>
    `Koodissa on ensin ${letters} kirjainta ja sitten ${others} kirjainta tai numeroa. Isot ja pienet kirjaimet ovat eri merkkejä, joten kirjoita koodi täsmälleen niin kuin se on vahvistuksessa.`,
  autoCheckHint: (length) =>
    `Tarkistamme koodin heti, kun olet kirjoittanut kaikki ${length} numeroa.`,
  checking: 'Tarkistamme koodia',
  slotActive: 'Ruutu, johon seuraava merkki tulee, ja kohdistin sen edessä',
  slotComplete: 'Valmis koodi: kohdistin on viimeisen merkin jälkeen',
  slotSelected: 'Valinta: sen kattamat ruudut on merkitty',
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
  caseLabel: 'Bestillingskode',
  caseHint: (letters, others) =>
    `Koden har ${letters} bokstaver og deretter ${others} bokstaver eller siffer. Store og små bokstaver er forskjellige, så skriv som det står i bekreftelsen.`,
  autoCheckHint: (length) => `Vi sjekker koden så snart du har skrevet alle ${length} sifrene.`,
  checking: 'Vi sjekker koden',
  slotActive: 'Ruten som tar neste tegn, med markøren foran',
  slotComplete: 'En fullstendig kode: markøren står etter det siste tegnet',
  slotSelected: 'Et utvalg: rutene det dekker er markert',
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
  caseLabel: 'Bestillingskode',
  caseHint: (letters, others) =>
    `Koden har ${letters} bokstavar og deretter ${others} bokstavar eller siffer. Store og små bokstavar er ulike, så skriv som det står i stadfestinga.`,
  autoCheckHint: (length) => `Vi sjekkar koden så snart du har skrive alle ${length} sifra.`,
  checking: 'Vi sjekkar koden',
  slotActive: 'Ruta som tek neste teikn, med markøren framfor',
  slotComplete: 'Ei fullstendig kode: markøren står etter det siste teiknet',
  slotSelected: 'Eit utval: rutene det dekkjer er markerte',
}

const oneTimeCodeTexts: Record<FormLocale, OneTimeCodeTexts | undefined> = {
  sv: textsSv,
  fi: textsFi,
  nb: textsNb,
  nn: textsNn,
  en: textsEn,
}

/** The fixture text in a locale. */
export function oneTimeCodeTextsFor(locale: FormLocale): OneTimeCodeTexts {
  return oneTimeCodeTexts[locale] ?? textsEn
}

/** Where the code comes from: it decides the label and the help text. */
export type CodeKind = 'sms' | 'email' | 'app' | 'signIn' | 'letters' | 'case'

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
    case 'case':
      return {
        label: texts.caseLabel,
        hint: texts.caseHint(groups[0]?.length ?? 0, groups[1]?.length ?? 0),
      }
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
 * `lang` is `'en'` where the fixture shows English: put it on the Field (3.1.2).
 */
export function codeTextsFor(locale: FormLocale, kind: CodeKind, pattern: string) {
  const texts = oneTimeCodeTextsFor(locale)
  const { lang } = textsFor(locale)
  const { label, hint } = labelsFor(texts, kind, pattern)
  return { label, hint, lang, errorWrong: texts.errorWrong, submit: texts.submit }
}

/**
 * A code you control, checked as soon as it is complete. `onComplete` starts the check, and the
 * Input is `readOnly` while it runs: a disabled input would lose focus to the body. The check is
 * announced through the Announcer and shown, the Continue button stays, and the wrong code stays
 * in the field with the error under it.
 */
export function CheckedCodeForm({ locale }: { locale: FormLocale }) {
  const { label, hint, lang, errorWrong, submit } = codeTextsFor(locale, 'sms', '999999')
  const texts = oneTimeCodeTextsFor(locale)
  const { announce } = useAnnouncer()
  const [value, setValue] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [isWrong, setIsWrong] = useState(false)
  return (
    <form className="kv-story-form" noValidate onSubmit={(event) => event.preventDefault()}>
      <Field.Root invalid={isWrong} lang={lang}>
        <Field.Label marker="none">{label}</Field.Label>
        <Field.Prose>
          <p>
            {hint} {texts.autoCheckHint(6)}
          </p>
        </Field.Prose>
        <OneTimeCode.Root
          pattern="999999"
          value={value}
          onValueChange={(next) => {
            setValue(next)
            setIsWrong(false)
          }}
          onComplete={() => {
            setIsChecking(true)
            announce(texts.checking)
            // Your own check goes here. This one always finds the code wrong.
            setTimeout(() => {
              setIsChecking(false)
              setIsWrong(true)
            }, 1000)
          }}
        >
          <OneTimeCode.Input name="code" readOnly={isChecking} />
          {Array.from('999999', (_, index) => (
            <OneTimeCode.Slot key={index} index={index} />
          ))}
        </OneTimeCode.Root>
        <Field.ErrorMessage>{errorWrong}</Field.ErrorMessage>
      </Field.Root>
      <p className="kv-story-form-output" data-testid="checking">
        {isChecking ? texts.checking : ''}
      </p>
      <div className="kv-button-group">
        <Button type="submit" className="kv-button--primary">
          {submit}
        </Button>
      </div>
    </form>
  )
}

/**
 * The states a box shows, drawn by hand with the attributes `OneTimeCode.Slot` sets, so they can
 * be seen side by side: the active box with its caret before the character, the last box of a
 * complete code with the caret after, and a selection. In a real field they come from focus and
 * the selection of the one input, and only one field has focus at a time.
 */
export function SlotStatesRows({ locale }: { locale: FormLocale }) {
  const texts = oneTimeCodeTextsFor(locale)
  const { lang } = textsFor(locale)
  const rows: {
    caption: string
    code: string
    states: Record<
      number,
      { 'data-active'?: ''; 'data-caret'?: 'before' | 'after'; 'data-selected'?: '' }
    >
  }[] = [
    {
      caption: texts.slotActive,
      code: '481',
      states: { 3: { 'data-active': '', 'data-caret': 'before' } },
    },
    {
      caption: texts.slotComplete,
      code: '481920',
      states: { 5: { 'data-active': '', 'data-caret': 'after' } },
    },
    {
      caption: texts.slotSelected,
      code: '481920',
      states: {
        1: { 'data-selected': '' },
        2: { 'data-selected': '' },
        3: { 'data-selected': '' },
      },
    },
  ]
  return (
    <div className="kv-story-form" lang={lang}>
      {rows.map(({ caption, code, states }) => (
        <div key={caption}>
          <p>{caption}</p>
          <div
            className="kv-one-time-code"
            data-ready=""
            data-character-count="6"
            data-separator-count="0"
          >
            {Array.from('999999', (_, index) => (
              <span
                key={index}
                className="kv-one-time-code-slot"
                aria-hidden="true"
                {...(code.charAt(index) === '' ? {} : { 'data-filled': '' })}
                {...states[index]}
              >
                {code.charAt(index)}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
