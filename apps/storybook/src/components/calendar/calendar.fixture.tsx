import {
  Calendar,
  Field,
  Fieldset,
  KvirnProvider,
  TextInput,
  isoDateToMaskedDate,
  masks,
  maskedDateToIsoDate,
  useLocale,
} from '@kvirn-ui/react'
import type { CalendarRootProps, DateRange } from '@kvirn-ui/react'
import type { Decorator } from '@storybook/react-vite'
import { useId, useState } from 'react'
import { dateTextsFor } from '../date-input/date-input.fixture.tsx'
import { localeOf, messagesFor, providerLocaleOf } from '../form/form.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'

// Fixtures for Components/Calendar. The Calendar holds no date of its own beyond the visible month
// and the focused day: `value` and `onValueChange` are yours. Every story fixes `today` so the
// grid and the plays are the same on any day.

/** The days the recycling centre is closed in October 2026. */
export const closedDays = new Set(['2026-10-16', '2026-10-17', '2026-10-24'])

const closedTexts: Record<FormLocale, string> = {
  sv: 'Stängt',
  fi: 'Suljettu',
  nb: 'Stengt',
  nn: 'Stengt',
  en: 'Closed',
}

export const describeClosedDay = (locale: FormLocale) => (date: string) =>
  closedDays.has(date) ? closedTexts[locale] : undefined

/** Library strings follow the locale toolbar and the direction toolbar, like an app's provider. */
export const withCalendarProvider: Decorator = (Story, { globals }) => {
  const locale = localeOf(globals)
  const dir = globals['dir'] === 'rtl' ? 'rtl' : 'ltr'
  return (
    <KvirnProvider locale={providerLocaleOf(locale)} dir={dir} messages={messagesFor(locale)}>
      <Story />
    </KvirnProvider>
  )
}

export function MonthCalendar(props: Partial<CalendarRootProps>) {
  return (
    <Calendar.Root today="2026-10-14" {...props}>
      <Calendar.PreviousMonth />
      <Calendar.Heading />
      <Calendar.NextMonth />
      <Calendar.RangeHint />
      <Calendar.Grid />
    </Calendar.Root>
  )
}

export function YearButtonsCalendar(props: Partial<CalendarRootProps>) {
  return (
    <Calendar.Root today="2026-10-14" {...props}>
      <Calendar.PreviousYear />
      <Calendar.PreviousMonth />
      <Calendar.Heading />
      <Calendar.NextMonth />
      <Calendar.NextYear />
      <Calendar.Grid />
    </Calendar.Root>
  )
}

/** Every locale the library ships, each in its own provider: month and weekday names from `Intl`. */
export function LocaleCalendars() {
  const locales: { locale: string; messages: FormLocale }[] = [
    { locale: 'sv', messages: 'sv' },
    { locale: 'sv-FI', messages: 'sv' },
    { locale: 'fi', messages: 'fi' },
    { locale: 'nb', messages: 'nb' },
    { locale: 'nn', messages: 'nn' },
    { locale: 'en-GB', messages: 'en' },
  ]
  return (
    <div className="kv-story-form">
      {locales.map(({ locale, messages }) => (
        <KvirnProvider key={locale} locale={locale} messages={messagesFor(messages)}>
          <MonthCalendar />
        </KvirnProvider>
      ))}
    </div>
  )
}

const fromToTexts: Record<FormLocale, { from: string; to: string }> = {
  sv: { from: 'Från och med', to: 'Till och med' },
  fi: { from: 'Alkaen', to: 'Päättyen' },
  nb: { from: 'Fra og med', to: 'Til og med' },
  nn: { from: 'Frå og med', to: 'Til og med' },
  en: { from: 'From', to: 'To' },
}

/** No dialog: the Calendar is a page section, kept in step with a `masks.date()` field beside it. */
export function InlineCalendarWithField({ locale }: { locale: FormLocale }) {
  const { text, lang } = dateTextsFor(locale)
  const { locale: providerLocale } = useLocale()
  const [fieldText, setFieldText] = useState('')
  const example = masks.date().withLocale(providerLocale).format('2026-10-27')
  return (
    <div className="kv-story-form" lang={lang}>
      <Field.Root>
        <Field.Label>{text.oneFieldLabel}</Field.Label>
        <TextInput
          name="start"
          mask={masks.date()}
          className="kv-input--width-10"
          value={fieldText}
          onValueChange={setFieldText}
        />
        <Field.HelpText>{text.oneFieldHint(example)}</Field.HelpText>
      </Field.Root>
      <Calendar.Root
        today="2026-10-14"
        value={maskedDateToIsoDate(fieldText, providerLocale)}
        onValueChange={(isoDate) => setFieldText(isoDateToMaskedDate(isoDate, providerLocale))}
      >
        <Calendar.PreviousMonth />
        <Calendar.Heading />
        <Calendar.NextMonth />
        <Calendar.Grid />
      </Calendar.Root>
      <p className="kv-story-form-output" data-testid="stored">
        {text.stored}: {maskedDateToIsoDate(fieldText, providerLocale)}
      </p>
    </div>
  )
}

/** Two single-date Calendars, one per group: the "to" Calendar starts at the "from" day. */
export function FromToCalendars({ locale }: { locale: FormLocale }) {
  const { text, lang } = dateTextsFor(locale)
  const labels = fromToTexts[locale]
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  return (
    <div className="kv-story-form" lang={lang}>
      <div className="kv-story-calendars">
        <Fieldset.Root group>
          <Fieldset.Legend>{labels.from}</Fieldset.Legend>
          <Calendar.Root
            today="2026-10-14"
            value={from}
            onValueChange={(isoDate) => {
              setFrom(isoDate)
              if (to !== '' && to < isoDate) {
                setTo('')
              }
            }}
          >
            <Calendar.PreviousMonth />
            <Calendar.Heading />
            <Calendar.NextMonth />
            <Calendar.Grid />
          </Calendar.Root>
        </Fieldset.Root>
        <Fieldset.Root group>
          <Fieldset.Legend>{labels.to}</Fieldset.Legend>
          <Calendar.Root
            today="2026-10-14"
            value={to}
            minimum={from === '' ? undefined : from}
            onValueChange={setTo}
          >
            <Calendar.PreviousMonth />
            <Calendar.Heading />
            <Calendar.NextMonth />
            <Calendar.RangeHint />
            <Calendar.Grid />
          </Calendar.Root>
        </Fieldset.Root>
      </div>
      <p className="kv-story-form-output" data-testid="stored">
        {text.stored}: {from === '' ? '' : from} – {to}
      </p>
    </div>
  )
}

type RangeCalendarProps = Partial<Extract<CalendarRootProps, { mode: 'range' }>> & {
  /** The range chosen at first. */
  initial?: DateRange | undefined
}

/** A range Calendar that keeps its own value, with the two-month parts (they render nothing below 64rem). */
export function RangeCalendar({ initial = { start: '', end: '' }, ...props }: RangeCalendarProps) {
  const [range, setRange] = useState(initial)
  return (
    <div className="kv-story-form">
      <Calendar.Root
        today="2026-10-14"
        {...props}
        mode="range"
        value={range}
        onValueChange={setRange}
      >
        <Calendar.PreviousMonth />
        <Calendar.Heading />
        <Calendar.Heading offset={1} />
        <Calendar.NextMonth />
        <Calendar.RangeHint />
        <Calendar.Grid />
        <Calendar.Grid offset={1} />
      </Calendar.Root>
      <p className="kv-story-form-output" data-testid="stored">
        {range.start} – {range.end}
      </p>
    </div>
  )
}

/** Two Calendars on one range: the first chooses the start, the second the end, each under its own heading. */
export function RangeFromToPair({ locale }: { locale: FormLocale }) {
  const labels = fromToTexts[locale]
  const startHeadingId = useId()
  const endHeadingId = useId()
  const [range, setRange] = useState<DateRange>({ start: '', end: '' })
  return (
    <div className="kv-story-form">
      <div className="kv-story-calendars">
        {(['start', 'end'] as const).map((end) => (
          <div key={end}>
            <h3 id={end === 'start' ? startHeadingId : endHeadingId}>
              {end === 'start' ? labels.from : labels.to}
            </h3>
            <Calendar.Root
              today="2026-10-14"
              mode="range"
              selects={end}
              value={range}
              onValueChange={setRange}
              maximumDays={15}
            >
              <Calendar.PreviousMonth />
              <Calendar.Heading />
              <Calendar.NextMonth />
              <Calendar.RangeHint />
              <Calendar.Grid aria-labelledby={end === 'start' ? startHeadingId : endHeadingId} />
            </Calendar.Root>
          </div>
        ))}
      </div>
      <p className="kv-story-form-output" data-testid="stored">
        {range.start} – {range.end}
      </p>
    </div>
  )
}
