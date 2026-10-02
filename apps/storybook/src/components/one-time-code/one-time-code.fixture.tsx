import { Button, Field, OneTimeCode } from '@kvirn-ui/react'
import type { OneTimeCodeRootProps } from '@kvirn-ui/react'
import { textsFor } from '../form/form.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'

// Story and e2e fixture for Components/Form/OneTimeCode (Plan 0014, docs/design/one-time-code.md
// §4). The component adds no strings of its own: the label and the hint belong to the consumer,
// because they name the channel and the length. The strings below are fixture text, with keys
// local to this file. sv, en and fi are written (the fi strings are the designer's drafts, for
// length checks). nb, nn and se come from a translator, not an agent: until then those locales
// show the English text, marked lang="en" (3.1.2). The library's own strings (the mask's
// rejection messages, "Error:") follow the locale through the shared provider decorator.
//
// KvirnUI holds no form state (ADR-0029, item 0). Nothing here validates or checks the code: an
// invalid story sets `invalid` and writes the message itself, as an implementor's form logic
// would.

export interface OneTimeCodeTexts {
  smsLabel: string
  smsHint: (length: number) => string
  emailLabel: string
  emailHint: (length: number) => string
  appLabel: string
  appHint: (length: number) => string
  signInLabel: string
  submit: string
  errorWrong: string
}

const textsEn: OneTimeCodeTexts = {
  smsLabel: 'Code from the text message',
  smsHint: (length) =>
    `The code has ${length} digits. You’ll find it in the text message we just sent you.`,
  emailLabel: 'Code from the email',
  emailHint: (length) =>
    `The code has ${length} letters and digits. You’ll find it in the email we just sent you.`,
  appLabel: 'Code from your authenticator app',
  appHint: (length) => `Open the app and enter the code it shows. The code has ${length} digits.`,
  signInLabel: 'Code to sign in',
  submit: 'Continue',
  errorWrong:
    'The code doesn’t match the one we sent. Check the text message and enter the code again.',
}

const textsSv: OneTimeCodeTexts = {
  smsLabel: 'Kod från sms:et',
  smsHint: (length) =>
    `Koden har ${length} siffror. Du hittar den i sms:et som vi just skickade till dig.`,
  emailLabel: 'Kod från e-postmeddelandet',
  emailHint: (length) =>
    `Koden har ${length} bokstäver och siffror. Du hittar den i e-postmeddelandet som vi just skickade till dig.`,
  appLabel: 'Kod från din autentiseringsapp',
  appHint: (length) => `Öppna appen och skriv koden som visas. Koden har ${length} siffror.`,
  signInLabel: 'Kod för inloggning',
  submit: 'Fortsätt',
  errorWrong: 'Koden stämmer inte med den vi skickade. Kontrollera sms:et och skriv koden igen.',
}

const textsFi: OneTimeCodeTexts = {
  smsLabel: 'Tekstiviestissä saamasi koodi',
  smsHint: (length) =>
    `Koodissa on ${length} numeroa. Löydät sen tekstiviestistä, jonka lähetimme sinulle juuri.`,
  emailLabel: 'Sähköpostissa saamasi koodi',
  emailHint: (length) =>
    `Koodissa on ${length} merkkiä, sekä kirjaimia että numeroita. Löydät sen sähköpostista, jonka lähetimme sinulle juuri.`,
  appLabel: 'Todennussovelluksesi koodi',
  appHint: (length) =>
    `Avaa sovellus ja kirjoita siinä näkyvä koodi. Koodissa on ${length} numeroa.`,
  signInLabel: 'Kirjautumiskoodi',
  submit: 'Jatka',
  errorWrong:
    'Koodi ei vastaa lähettämäämme koodia. Tarkista tekstiviesti ja kirjoita koodi uudelleen.',
}

const oneTimeCodeTexts: Record<FormLocale, OneTimeCodeTexts | undefined> = {
  sv: textsSv,
  fi: textsFi,
  nb: undefined,
  nn: undefined,
  se: undefined,
  en: textsEn,
}

/** The fixture text in a locale, or the English text until it's translated. */
export function oneTimeCodeTextsFor(locale: FormLocale): OneTimeCodeTexts {
  return oneTimeCodeTexts[locale] ?? textsEn
}

/** Where the code comes from: it decides the label and the hint. */
export type CodeKind = 'sms' | 'email' | 'app' | 'signIn'

export interface OneTimeCodeFieldProps extends Pick<
  OneTimeCodeRootProps,
  | 'length'
  | 'characters'
  | 'defaultValue'
  | 'disabled'
  | 'announceRejections'
  | 'onComplete'
  | 'onValueChange'
> {
  locale: FormLocale
  kind?: CodeKind
  invalid?: boolean | undefined
  /** `kv-one-time-code--grouped`: two halves, the way the message groups the code. */
  grouped?: boolean
  readOnly?: boolean
  /** A Continue button after the field, in a form that does nothing on submit. */
  withSubmit?: boolean
  name?: string
}

const labelsFor = (texts: OneTimeCodeTexts, kind: CodeKind, length: number) => {
  switch (kind) {
    case 'email':
      return { label: texts.emailLabel, hint: texts.emailHint(length) }
    case 'app':
      return { label: texts.appLabel, hint: texts.appHint(length) }
    case 'signIn':
      return { label: texts.signInLabel, hint: texts.appHint(length) }
    default:
      return { label: texts.smsLabel, hint: texts.smsHint(length) }
  }
}

/**
 * Every story is a full Field: the label, the hint above the boxes (the length must be read
 * before typing), the row, and the error under it when invalid. The slots are one per character.
 */
export function OneTimeCodeField({
  locale,
  kind = 'sms',
  length = 6,
  characters = 'digits',
  invalid,
  grouped = false,
  readOnly,
  withSubmit = false,
  name = 'code',
  ...rootProps
}: OneTimeCodeFieldProps) {
  const texts = oneTimeCodeTextsFor(locale)
  const { lang } = textsFor(locale)
  const { label, hint } = labelsFor(texts, kind, length)
  const field = (
    <Field.Root invalid={invalid} lang={lang}>
      <Field.Label marker="none">{label}</Field.Label>
      <Field.Description>{hint}</Field.Description>
      <OneTimeCode.Root
        length={length}
        characters={characters}
        className={grouped ? 'kv-one-time-code--grouped' : undefined}
        {...rootProps}
      >
        <OneTimeCode.Input name={name} readOnly={readOnly} />
        {Array.from({ length }, (_, index) => (
          <OneTimeCode.Slot key={index} index={index} />
        ))}
      </OneTimeCode.Root>
      {invalid ? <Field.ErrorMessage>{texts.errorWrong}</Field.ErrorMessage> : null}
    </Field.Root>
  )
  if (!withSubmit) {
    return field
  }
  return (
    <form noValidate onSubmit={(event) => event.preventDefault()}>
      <div className="kv-story-form">
        {field}
        <div className="kv-button-group">
          <Button type="submit" className="kv-button--primary">
            {texts.submit}
          </Button>
        </div>
      </div>
    </form>
  )
}
