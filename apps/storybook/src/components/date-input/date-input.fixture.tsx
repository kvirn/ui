import { sv } from '@kvirn-ui/i18n/sv'
import {
  Button,
  DateInput,
  Field,
  Fieldset,
  KvirnProvider,
  masks,
  TextInput,
  useDateInput,
} from '@kvirn-ui/react'
import type { DateInputRootProps, DateInputValue } from '@kvirn-ui/react'
import type { Decorator } from '@storybook/react-vite'
import { useId, useState } from 'react'
import type { FormLocale } from '../form/form.fixture.tsx'

// Story fixture for Components/Form/DateInput (docs/design/form-fields.md §4.3, §6.6).
// sv, en, fi, nb and nn are written. The fi strings are the designer's drafts, for length checks
// only. The library's own strings ("Dag", "Månad", "År",
// "(valfritt)", "Fel:") follow the locale through the provider decorator in form.fixture.tsx.
//
// KvirnUI holds no form state and never validates the date. Nothing here does: an "invalid"
// story sets `invalid` itself and writes the message, as an implementor's form logic would. The
// help text is the consumer's: it gives an example in the order the boxes are in, which the fixture
// reads from `useDateInput().order`, so the help text and the boxes never disagree.

export interface DateTexts {
  /** The legend of a date of birth. */
  legend: string
  /** The help text when the boxes are year, month, day. */
  hintYearFirst: string
  /** The help text when the boxes are day, month, year. */
  hintDayFirst: string
  /** The legend of a date that isn't a birthday (no `autoComplete`). */
  visitLegend: string
  /** "Date of birth must include a year". Marks the Year box only. */
  errorYear: string
  /** "Date of birth must be a real date". Marks all three boxes. */
  errorDate: string
  back: string
  send: string
  sent: string
  youTyped: string
  /** The label of the one-field date. */
  oneFieldLabel: string
  /** "For example, 2026-10-27": the example is written in the mask's form, so the two agree. */
  oneFieldHint: (example: string) => string
  /** "Stored as": the ISO date the form keeps. */
  stored: string
}

const textsEn: DateTexts = {
  legend: 'Date of birth',
  hintYearFirst: 'For example, 1990 3 27',
  hintDayFirst: 'For example, 27 3 1990',
  visitLegend: 'Date of the visit',
  errorYear: 'Date of birth must include a year',
  errorDate: 'Date of birth must be a real date',
  back: 'Back',
  send: 'Send',
  sent: 'Sent',
  youTyped: 'You typed',
  oneFieldLabel: 'Start date',
  oneFieldHint: (example) => `For example, ${example}`,
  stored: 'Stored as',
}

const textsSv: DateTexts = {
  legend: 'Födelsedatum',
  hintYearFirst: 'Till exempel 1990 3 27',
  hintDayFirst: 'Till exempel 27 3 1990',
  visitLegend: 'Datum för besöket',
  errorYear: 'Födelsedatumet måste innehålla ett år',
  errorDate: 'Födelsedatumet måste vara ett riktigt datum',
  back: 'Tillbaka',
  send: 'Skicka',
  sent: 'Skickat',
  youTyped: 'Du skrev',
  oneFieldLabel: 'Startdatum',
  oneFieldHint: (example) => `Till exempel ${example}`,
  stored: 'Sparas som',
}

/** Designer drafts (docs/design/form-fields.md §4.3), for length checks. */
const textsFi: DateTexts = {
  legend: 'Syntymäaika',
  hintYearFirst: 'Esimerkiksi 1990 3 27',
  hintDayFirst: 'Esimerkiksi 27 3 1990',
  visitLegend: 'Käynnin päivämäärä',
  errorYear: 'Syntymäajassa on oltava myös vuosi',
  errorDate: 'Syntymäajan on oltava oikea päivämäärä',
  back: 'Takaisin',
  send: 'Lähetä',
  sent: 'Lähetetty',
  youTyped: 'Kirjoitit',
  oneFieldLabel: 'Alkamispäivä',
  oneFieldHint: (example) => `Esimerkiksi ${example}`,
  stored: 'Tallennetaan muodossa',
}

const textsNb: DateTexts = {
  legend: 'Fødselsdato',
  hintYearFirst: 'For eksempel 1990 3 27',
  hintDayFirst: 'For eksempel 27 3 1990',
  visitLegend: 'Dato for besøket',
  errorYear: 'Fødselsdatoen må ha med år',
  errorDate: 'Fødselsdatoen må være en gyldig dato',
  back: 'Tilbake',
  send: 'Send',
  sent: 'Sendt',
  youTyped: 'Du skrev',
  oneFieldLabel: 'Startdato',
  oneFieldHint: (example) => `For eksempel ${example}`,
  stored: 'Lagres som',
}

const textsNn: DateTexts = {
  legend: 'Fødselsdato',
  hintYearFirst: 'Til dømes 1990 3 27',
  hintDayFirst: 'Til dømes 27 3 1990',
  visitLegend: 'Dato for besøket',
  errorYear: 'Fødselsdatoen må ha med år',
  errorDate: 'Fødselsdatoen må vere ein gyldig dato',
  back: 'Tilbake',
  send: 'Send',
  sent: 'Sendt',
  youTyped: 'Du skreiv',
  oneFieldLabel: 'Startdato',
  oneFieldHint: (example) => `Til dømes ${example}`,
  stored: 'Vert lagra som',
}

const dateTexts: Record<FormLocale, DateTexts | undefined> = {
  sv: textsSv,
  fi: textsFi,
  nb: textsNb,
  nn: textsNn,
  en: textsEn,
}

/** The fixture text in a locale. */
export function dateTextsFor(locale: FormLocale): { text: DateTexts; lang: 'en' | undefined } {
  const text = dateTexts[locale]
  return { text: text ?? textsEn, lang: text === undefined ? 'en' : undefined }
}

/**
 * A story decorator that puts the page in a region: `sv-SE` writes dates year first, `sv-FI`
 * day first, though both are Swedish. In your app this is the `locale` of your `KvirnProvider`.
 */
export const withRegion =
  (region: 'sv-SE' | 'sv-FI'): Decorator =>
  (Story) => (
    <KvirnProvider locale={region} messages={sv}>
      <Story />
    </KvirnProvider>
  )

export interface BirthDateProps extends Omit<DateInputRootProps, 'children'> {
  locale: FormLocale
  /** `'year'` marks only the Year box, `'date'` all three. Both show their message. */
  error?: 'year' | 'date' | undefined
}

/**
 * A date of birth: a group with the question as its legend, the three boxes in the region's
 * order, a help text under them with an example in that order, and one message for the whole date. Only
 * the wrong boxes are marked invalid.
 */
export function BirthDate({ locale, error, ...dateProps }: BirthDateProps) {
  const { text, lang } = dateTextsFor(locale)
  // The example is written in the order the boxes are in.
  const { order } = useDateInput()
  return (
    <Fieldset.Root group required invalid={error !== undefined} lang={lang}>
      <Fieldset.Legend>{text.legend}</Fieldset.Legend>
      <DateInput.Root
        name="birth"
        autoComplete="bday"
        invalidParts={
          error === 'year' ? ['year'] : error === 'date' ? ['day', 'month', 'year'] : undefined
        }
        {...dateProps}
      />
      <Fieldset.HelpText>
        {order[0] === 'year' ? text.hintYearFirst : text.hintDayFirst}
      </Fieldset.HelpText>
      <Fieldset.ErrorMessage>
        {error === 'year' ? text.errorYear : text.errorDate}
      </Fieldset.ErrorMessage>
    </Fieldset.Root>
  )
}

/**
 * Your own order: a service that must match a paper form writes the parts itself, and the help text
 * follows the order it chose. Here, day, month, year in Sweden.
 */
export function PaperFormDate({ locale }: { locale: FormLocale }) {
  const { text, lang } = dateTextsFor(locale)
  return (
    <Fieldset.Root group required lang={lang}>
      <Fieldset.Legend>{text.legend}</Fieldset.Legend>
      <DateInput.Root name="birth" autoComplete="bday">
        <DateInput.Day />
        <DateInput.Month />
        <DateInput.Year />
      </DateInput.Root>
      <Fieldset.HelpText>{text.hintDayFirst}</Fieldset.HelpText>
    </Fieldset.Root>
  )
}

/**
 * A date that is not a birthday has no `autoComplete`: the token would offer the user's own
 * birthday (1.3.5). Optional, so the legend ends with "(valfritt)".
 */
export function VisitDate({ locale }: { locale: FormLocale }) {
  const { text, lang } = dateTextsFor(locale)
  const { order } = useDateInput()
  return (
    <Fieldset.Root group lang={lang}>
      <Fieldset.Legend>{text.visitLegend}</Fieldset.Legend>
      <DateInput.Root name="visit" />
      <Fieldset.HelpText>
        {order[0] === 'year' ? text.hintYearFirst : text.hintDayFirst}
      </Fieldset.HelpText>
    </Fieldset.Root>
  )
}

/**
 * The value lives in your own state (here `useState`, where TanStack Form or React Hook Form
 * would sit). The Root reports the whole date as the boxes show it: three strings, never parsed.
 */
export function ControlledDate({ locale }: { locale: FormLocale }) {
  const { text, lang } = dateTextsFor(locale)
  const [value, setValue] = useState<DateInputValue>({ year: '1990', month: '3', day: '' })
  // The example is written in the order the boxes are in.
  const { order } = useDateInput()
  return (
    <div className="kv-story-form" lang={lang}>
      <Fieldset.Root group required>
        <Fieldset.Legend>{text.legend}</Fieldset.Legend>
        <DateInput.Root name="birth" autoComplete="bday" value={value} onValueChange={setValue} />
        <Fieldset.HelpText>
          {order[0] === 'year' ? text.hintYearFirst : text.hintDayFirst}
        </Fieldset.HelpText>
      </Fieldset.Root>
      <p className="kv-story-form-output" data-testid="mirror">
        {text.youTyped}: {value.year}-{value.month}-{value.day}
      </p>
    </div>
  )
}

/**
 * A plain `<form>`: no `value` and no handlers, only `name`. The boxes are uncontrolled, and the
 * submit reads `birth-day`, `birth-month` and `birth-year` from `FormData`.
 */
export function PlainFormDate({ locale }: { locale: FormLocale }) {
  const { text, lang } = dateTextsFor(locale)
  const { order } = useDateInput()
  const [sent, setSent] = useState<string | undefined>()
  return (
    <form
      className="kv-story-form"
      lang={lang}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        setSent(
          ['birth-year', 'birth-month', 'birth-day']
            .map((key) => {
              const value = data.get(key)
              return typeof value === 'string' ? value : ''
            })
            .join('-'),
        )
      }}
    >
      <Fieldset.Root group required>
        <Fieldset.Legend>{text.legend}</Fieldset.Legend>
        <DateInput.Root name="birth" autoComplete="bday" />
        <Fieldset.HelpText>
          {order[0] === 'year' ? text.hintYearFirst : text.hintDayFirst}
        </Fieldset.HelpText>
      </Fieldset.Root>
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

/**
 * The fixture the keyboard tests drive: a button, the date, then a submit button, in a form. Enter in a
 * box submits it, and the output shows that it did.
 */
export function KeyboardDate({ locale }: { locale: FormLocale }) {
  const { text, lang } = dateTextsFor(locale)
  const { order } = useDateInput()
  const [submits, setSubmits] = useState(0)
  return (
    <form
      className="kv-story-form"
      lang={lang}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        setSubmits((count) => count + 1)
      }}
    >
      <div className="kv-button-group">
        <Button type="button">{text.back}</Button>
      </div>
      <Fieldset.Root group required>
        <Fieldset.Legend>{text.legend}</Fieldset.Legend>
        <DateInput.Root name="birth" autoComplete="bday" />
        <Fieldset.HelpText>
          {order[0] === 'year' ? text.hintYearFirst : text.hintDayFirst}
        </Fieldset.HelpText>
      </Fieldset.Root>
      <div className="kv-button-group">
        <Button type="submit" className="kv-button--primary">
          {text.send}
        </Button>
      </div>
      <p className="kv-story-form-output" data-testid="submits">
        {text.sent}: {submits}
      </p>
    </form>
  )
}

/**
 * Every state of the date in one column: filled, the Year box wrong, the whole date wrong,
 * disabled and read only. `invalidParts` marks only the wrong boxes, and the message is under
 * them, once.
 */
export function DateStates({ locale }: { locale: FormLocale }) {
  const { text, lang } = dateTextsFor(locale)
  const id = useId()
  const { order } = useDateInput()
  const hint = order[0] === 'year' ? text.hintYearFirst : text.hintDayFirst
  return (
    <div className="kv-story-form" lang={lang}>
      <Fieldset.Root group required>
        <Fieldset.Legend>{text.legend}</Fieldset.Legend>
        <DateInput.Root
          name={`filled-${id}`}
          autoComplete="bday"
          defaultValue={{ year: '1990', month: '3', day: '27' }}
        />
        <Fieldset.HelpText>{hint}</Fieldset.HelpText>
      </Fieldset.Root>
      <Fieldset.Root group required invalid>
        <Fieldset.Legend>{text.legend}</Fieldset.Legend>
        <DateInput.Root
          name={`year-${id}`}
          autoComplete="bday"
          invalidParts={['year']}
          defaultValue={{ month: '3', day: '27' }}
        />
        <Fieldset.HelpText>{hint}</Fieldset.HelpText>
        <Fieldset.ErrorMessage>{text.errorYear}</Fieldset.ErrorMessage>
      </Fieldset.Root>
      <Fieldset.Root group required invalid>
        <Fieldset.Legend>{text.legend}</Fieldset.Legend>
        <DateInput.Root
          name={`date-${id}`}
          autoComplete="bday"
          invalidParts={['day', 'month', 'year']}
          defaultValue={{ year: '1990', month: '13', day: '27' }}
        />
        <Fieldset.HelpText>{hint}</Fieldset.HelpText>
        <Fieldset.ErrorMessage>{text.errorDate}</Fieldset.ErrorMessage>
      </Fieldset.Root>
      <Fieldset.Root group required>
        <Fieldset.Legend>{text.legend}</Fieldset.Legend>
        <DateInput.Root
          name={`disabled-${id}`}
          autoComplete="bday"
          disabled
          defaultValue={{ year: '1990', month: '3', day: '27' }}
        />
        <Fieldset.HelpText>{hint}</Fieldset.HelpText>
      </Fieldset.Root>
      <Fieldset.Root group required>
        <Fieldset.Legend>{text.legend}</Fieldset.Legend>
        <DateInput.Root
          name={`readonly-${id}`}
          autoComplete="bday"
          readOnly
          defaultValue={{ year: '1990', month: '3', day: '27' }}
        />
        <Fieldset.HelpText>{hint}</Fieldset.HelpText>
      </Fieldset.Root>
    </div>
  )
}

/**
 * A date in one field: `masks.date()` follows the page's locale for the order and the separator
 * (`2026-10-27` in sv, `27.10.2026` in fi, `27/10/2026` in en), and the help text gives an example in
 * that form. The form keeps the ISO date, which `onValueChange` reports once the date is complete.
 */
export function OneFieldDate({ locale }: { locale: FormLocale }) {
  const { text, lang } = dateTextsFor(locale)
  const [stored, setStored] = useState('')
  // The example comes from the mask itself, so the help text and the field never disagree.
  const example = masks.date().withLocale(locale).format('2026-10-27')
  return (
    <div className="kv-story-form" lang={lang}>
      <Field.Root required>
        <Field.Label>{text.oneFieldLabel}</Field.Label>
        <TextInput
          name="start"
          mask={masks.date()}
          className="kv-input--width-10"
          onValueChange={(_value, details) => setStored(details.unmaskedValue ?? '')}
        />
        <Field.HelpText>{text.oneFieldHint(example)}</Field.HelpText>
      </Field.Root>
      <p className="kv-story-form-output" data-testid="stored">
        {text.stored}: {stored}
      </p>
    </div>
  )
}
