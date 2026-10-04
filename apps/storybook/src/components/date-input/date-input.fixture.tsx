import { sv } from '@kvirn-ui/i18n/sv'
import { Button, DateInput, Fieldset, KvirnProvider, useDateInput } from '@kvirn-ui/react'
import type { DateInputRootProps, DateInputValue } from '@kvirn-ui/react'
import type { Decorator } from '@storybook/react-vite'
import { useState } from 'react'
import type { FormLocale } from '../form/form.fixture.tsx'

// Story and e2e fixture for Components/Form/DateInput (docs/design/form-fields.md §4.3, §6.6).
// sv, en and fi are written. The fi strings are the designer's drafts, for length checks only.
// nb, nn and se come from a translator, not an agent: until then those locales show the English
// text, marked lang="en" (3.1.2). The library's own strings ("Dag", "Månad", "År", "(valfritt)",
// "Fel:") follow the locale through the provider decorator in form.fixture.tsx.
//
// KvirnUI holds no form state and never validates the date. Nothing here does: an "invalid"
// story sets `invalid` itself and writes the message, as an implementor's form logic would. The
// hint is the consumer's: it gives an example in the order the boxes are in, which the fixture
// reads from `useDateInput().order`, so the hint and the boxes never disagree.

export interface DateTexts {
  /** The legend of a date of birth. */
  legend: string
  /** The hint when the boxes are year, month, day. */
  hintYearFirst: string
  /** The hint when the boxes are day, month, year. */
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
}

/** Designer drafts (docs/design/form-fields.md §4.3), for length checks. Not reviewed. */
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
}

/** nb, nn and se: `undefined` until a translator delivers them. */
const dateTexts: Record<FormLocale, DateTexts | undefined> = {
  sv: textsSv,
  fi: textsFi,
  nb: undefined,
  nn: undefined,
  se: undefined,
  en: textsEn,
}

/** The fixture text in a locale, or the English text with `lang="en"` until it's translated. */
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
 * order, a hint under them with an example in that order, and one message for the whole date. Only
 * the wrong boxes are marked invalid.
 */
export function BirthDate({ locale, error, ...dateProps }: BirthDateProps) {
  const { text, lang } = dateTextsFor(locale)
  // The example is written in the order the boxes are in.
  const { order } = useDateInput({ order: dateProps.order })
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
      <Fieldset.Hint>{order[0] === 'year' ? text.hintYearFirst : text.hintDayFirst}</Fieldset.Hint>
      <Fieldset.ErrorMessage>
        {error === 'year' ? text.errorYear : text.errorDate}
      </Fieldset.ErrorMessage>
    </Fieldset.Root>
  )
}

/**
 * Your own order: a service that must match a paper form writes the parts itself, and the hint
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
      <Fieldset.Hint>{text.hintDayFirst}</Fieldset.Hint>
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
      <Fieldset.Hint>{order[0] === 'year' ? text.hintYearFirst : text.hintDayFirst}</Fieldset.Hint>
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
  return (
    <div className="kv-story-form" lang={lang}>
      <BirthDate locale={locale} value={value} onValueChange={setValue} />
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
      <BirthDate locale={locale} />
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
      <BirthDate locale={locale} />
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
