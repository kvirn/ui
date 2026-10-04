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
import type { TextInputChangeDetails, TextInputProps } from '@kvirn-ui/react'
import type { Decorator } from '@storybook/react-vite'
import { useState } from 'react'

// Story and e2e fixture for Components/Form/Mask (Plan 0014). sv, nb, nn and en
// are written here. fi and se: English, marked lang="en" (3.1.2). The numbers are the published test numbers from packages/core/src/mask/checks
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
  telephoneHint:
    'Siffer, pluss, mellomrom, bindestrek og parentes. For eksempel +47 912 34 567.',
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
  telephoneHint:
    'Siffer, pluss, mellomrom, bindestrek og parentes. Til dømes +47 912 34 567.',
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

/** The toolbar's locale, or `en` for fi and se, which show English here. */
export const maskLocaleOf = (globals: Record<string, unknown>): MaskLocale => {
  const locale = globals['locale']
  return isMaskLocale(locale) ? locale : 'en'
}

/** The fixture text, and `lang="en"` when the toolbar's locale has no texts here (fi, se; 3.1.2). */
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

/**
 * The provider, with the library strings in the page's language: the mask's announcements come
 * from its catalog. fi and se show English.
 */
export const withMaskLocale: Decorator = (Story, { globals }) => {
  const locale = maskLocaleOf(globals)
  return (
    <KvirnProvider locale={locale} messages={maskMessages[locale]}>
      <Story />
    </KvirnProvider>
  )
}

interface MaskedFieldProps extends Pick<
  TextInputProps,
  'mask' | 'type' | 'autoComplete' | 'className' | 'defaultValue' | 'announceRejections'
> {
  label: string
  hint: string
  name: string
  value?: string | undefined
  onValueChange?: TextInputProps['onValueChange']
}

/** One masked question: a Field with a label, a hint that says the format, and the TextInput. */
export function MaskedField({ label, hint, name, ...inputProps }: MaskedFieldProps) {
  return (
    <Field.Root required>
      <Field.Label>{label}</Field.Label>
      <Field.Prose>
        <p>{hint}</p>
      </Field.Prose>
      <TextInput name={name} {...inputProps} />
    </Field.Root>
  )
}

/** The identifier presets, each with its own example (the published test numbers). */
export function IdentifierFields({ globals }: { globals: Record<string, unknown> }) {
  const { text, lang } = maskTextsFor(globals)
  return (
    <div className="kv-story-form" lang={lang}>
      <MaskedField
        label={text.personalIdentityNumber}
        hint={text.personalIdentityNumberHint}
        name="personalIdentityNumber"
        mask={masks.personalIdentityNumber({ country: 'SE' })}
        autoComplete="off"
        className="kv-input--width-20"
      />
      <MaskedField
        label={text.personalIdentityNumberFi}
        hint={text.personalIdentityNumberFiHint}
        name="personalIdentityNumberFi"
        mask={masks.personalIdentityNumber({ country: 'FI' })}
        autoComplete="off"
        className="kv-input--width-20"
      />
      <MaskedField
        label={text.personalIdentityNumberNo}
        hint={text.personalIdentityNumberNoHint}
        name="personalIdentityNumberNo"
        mask={masks.personalIdentityNumber({ country: 'NO' })}
        autoComplete="off"
        className="kv-input--width-20"
      />
      <MaskedField
        label={text.organisationNumber}
        hint={text.organisationNumberHint}
        name="organisationNumber"
        mask={masks.organisationNumber({ country: 'SE' })}
        autoComplete="off"
        className="kv-input--width-20"
      />
      <MaskedField
        label={text.postalCode}
        hint={text.postalCodeHint}
        name="postalCode"
        mask={masks.postalCode({ country: 'SE' })}
        autoComplete="postal-code"
        className="kv-input--width-6"
      />
      <MaskedField
        label={text.iban}
        hint={text.ibanHint}
        name="iban"
        mask={masks.iban()}
        autoComplete="off"
      />
    </div>
  )
}

/** The filter presets: they drop what can't be valid and don't give the value a shape. */
export function FilterFields({ globals }: { globals: Record<string, unknown> }) {
  const { text, lang } = maskTextsFor(globals)
  return (
    <div className="kv-story-form" lang={lang}>
      <MaskedField
        label={text.digits}
        hint={text.digitsHint}
        name="digits"
        mask={masks.digits({ length: 6 })}
        autoComplete="off"
        className="kv-input--width-10"
      />
      <MaskedField
        label={text.letters}
        hint={text.lettersHint}
        name="letters"
        mask={masks.letters()}
        autoComplete="off"
        className="kv-input--width-10"
      />
      <MaskedField
        label={text.lettersAndDigits}
        hint={text.lettersAndDigitsHint}
        name="lettersAndDigits"
        mask={masks.lettersAndDigits()}
        autoComplete="off"
        className="kv-input--width-10"
      />
      <MaskedField
        label={text.email}
        hint={text.emailHint}
        name="email"
        type="email"
        mask={masks.email()}
        autoComplete="email"
      />
      <MaskedField
        label={text.telephone}
        hint={text.telephoneHint}
        name="telephone"
        type="tel"
        mask={masks.telephone()}
        autoComplete="tel"
        className="kv-input--width-20"
      />
    </div>
  )
}

/** Your own pattern, and your own regular expression. */
export function CustomMaskFields({ globals }: { globals: Record<string, unknown> }) {
  const { text, lang } = maskTextsFor(globals)
  return (
    <div className="kv-story-form" lang={lang}>
      <MaskedField
        label={text.caseNumber}
        hint={text.caseNumberHint}
        name="caseNumber"
        // `a` is a letter, `9` a digit, anything else a literal. The transform capitalises.
        mask={masks.pattern('aa-9999', {
          transform: { a: (character) => character.toUpperCase() },
          attributes: { autoCapitalize: 'characters', spellCheck: false, dir: 'ltr' },
        })}
        autoComplete="off"
        className="kv-input--width-6"
      />
      <MaskedField
        label={text.registration}
        hint={text.registrationHint}
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
    </div>
  )
}

/** A number with a range: `isWithinRange` is reported, and the value is never clamped. */
export function NumberFields({ globals }: { globals: Record<string, unknown> }) {
  const { text, lang } = maskTextsFor(globals)
  const [isWithinRange, setIsWithinRange] = useState<boolean | undefined>(undefined)
  const [unmasked, setUnmasked] = useState('')
  return (
    <div className="kv-story-form" lang={lang}>
      <Field.Root required>
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
        {/* The consumer's own message, shown as a hint: nothing is clamped or corrected. */}
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
      <MaskedField
        label={text.temperature}
        hint={text.temperatureHint}
        name="temperature"
        mask={masks.number({ decimals: 1, allowNegative: true })}
        autoComplete="off"
        className="kv-input--width-6 kv-input--numeric"
      />
    </div>
  )
}

/**
 * A personal identity number with a check on submit. The mask never blocks a number the user is
 * still typing: the form calls `checks.personalIdentityNumber` and says what is wrong.
 */
export function PersonalIdentityNumberForm({ globals }: { globals: Record<string, unknown> }) {
  const { text, lang } = maskTextsFor(globals)
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
          mask={masks.personalIdentityNumber({ country: 'SE' })}
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
export function StoredValueField({ globals }: { globals: Record<string, unknown> }) {
  const { text, lang } = maskTextsFor(globals)
  const mask = masks.personalIdentityNumber({ country: 'SE' })
  const [value, setValue] = useState(mask.format('199001012385'))
  const [details, setDetails] = useState<TextInputChangeDetails | undefined>(undefined)
  return (
    <div className="kv-story-form" lang={lang}>
      <Field.Root required>
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
    </div>
  )
}

/** The hook on your own `<input>`, next to your own props: yours win. */
export function OwnInputField({ globals }: { globals: Record<string, unknown> }) {
  const { text, lang } = maskTextsFor(globals)
  const caseNumber = useMask({
    mask: masks.pattern('aa-9999', {
      transform: { a: (character) => character.toUpperCase() },
      attributes: { autoCapitalize: 'characters', spellCheck: false, dir: 'ltr' },
    }),
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

/** The fixture the keyboard tests drive: masked fields and a button in a plain form. */
export function KeyboardForm({ globals }: { globals: Record<string, unknown> }) {
  const { text, lang } = maskTextsFor(globals)
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
      <MaskedField
        label={text.personalIdentityNumber}
        hint={text.personalIdentityNumberHint}
        name="personalIdentityNumber"
        mask={masks.personalIdentityNumber({ country: 'SE' })}
        autoComplete="off"
        className="kv-input--width-20"
      />
      <MaskedField
        label={text.postalCode}
        hint={text.postalCodeHint}
        name="postalCode"
        mask={masks.postalCode({ country: 'SE' })}
        autoComplete="postal-code"
        className="kv-input--width-6"
      />
      <MaskedField
        label={text.digits}
        hint={text.digitsHint}
        name="digits"
        mask={masks.digits({ length: 6 })}
        autoComplete="off"
        className="kv-input--width-10"
      />
      <MaskedField
        label={text.amount}
        hint={text.amountHint}
        name="amount"
        mask={masks.number({ decimals: 2, min: 0, max: 100_000 })}
        autoComplete="off"
        className="kv-input--width-10 kv-input--numeric"
      />
      <MaskedField
        label={text.quiet}
        hint={text.quietHint}
        name="quiet"
        mask={masks.digits()}
        announceRejections={false}
        autoComplete="off"
        className="kv-input--width-10"
      />
      <MaskedField
        label={text.letters}
        hint={text.lettersHint}
        name="letters"
        mask={masks.letters()}
        autoComplete="off"
        className="kv-input--width-10"
      />
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
