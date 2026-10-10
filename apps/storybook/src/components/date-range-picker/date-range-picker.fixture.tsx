import {
  DateInput,
  DateRangePicker,
  Field,
  Fieldset,
  KvirnProvider,
  TextInput,
  dateInputValueToIsoDate,
  isoDateToDateInputValue,
  isoDateToMaskedDate,
  masks,
  maskedDateToIsoDate,
  useDateInput,
  useLocale,
} from '@kvirn-ui/react'
import type {
  DateInputPart,
  DateInputValue,
  DateRange,
  DateRangePickerRootProps,
} from '@kvirn-ui/react'
import { useState } from 'react'
import { dateTextsFor } from '../date-input/date-input.fixture.tsx'
import { messagesFor } from '../form/form.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'

// Fixtures for Components/DateRangePicker. KvirnUI holds no form state: the two fields' values live
// here in `useState`, where TanStack Form or React Hook Form would sit, and the bridge functions
// turn each end into the ISO date the picker takes and back. Every story fixes `today` to 14
// October 2026. The masked field per end leads; the three boxes per end are the alternative.
//

export {
  closedDays,
  describeClosedDay,
  withCalendarProvider,
} from '../calendar/calendar.fixture.tsx'

interface RangeTexts {
  legend: string
  from: string
  to: string
  /** The limit in the user's unit: a booking counts nights. */
  limit: string
  /** The end is before the start: the form's message, not the picker's. */
  error: string
  stored: string
}

const textsEn: RangeTexts = {
  legend: 'Dates of your stay',
  from: 'Arrival',
  to: 'Departure',
  limit: 'Up to 14 nights.',
  error: 'The end date must be on or after the start date',
  stored: 'Stored as',
}

const rangeTexts: Record<FormLocale, RangeTexts | undefined> = {
  sv: {
    legend: 'Datum för din vistelse',
    from: 'Ankomst',
    to: 'Avresa',
    limit: 'Högst 14 nätter.',
    error: 'Slutdatumet måste vara samma dag som startdatumet eller senare',
    stored: 'Sparas som',
  },
  fi: {
    legend: 'Oleskelusi päivämäärät',
    from: 'Saapuminen',
    to: 'Lähtö',
    limit: 'Enintään 14 yötä.',
    error: 'Loppupäivän täytyy olla alkupäivä tai sen jälkeen',
    stored: 'Tallennetaan muodossa',
  },
  nb: {
    legend: 'Datoer for oppholdet',
    from: 'Ankomst',
    to: 'Avreise',
    limit: 'Maks 14 netter.',
    error: 'Sluttdatoen må være samme dag som startdatoen eller senere',
    stored: 'Lagres som',
  },
  nn: {
    legend: 'Datoar for opphaldet',
    from: 'Ankomst',
    to: 'Avreise',
    limit: 'Maks 14 netter.',
    error: 'Sluttdatoen må vere same dag som startdatoen eller seinare',
    stored: 'Lagrast som',
  },
  en: textsEn,
}

function rangeTextsFor(locale: FormLocale): { text: RangeTexts; lang: 'en' | undefined } {
  const text = rangeTexts[locale]
  return { text: text ?? textsEn, lang: text === undefined ? 'en' : undefined }
}

const boxes = {
  day: DateInput.Day,
  month: DateInput.Month,
  year: DateInput.Year,
} satisfies Record<DateInputPart, unknown>

type PickerProps = Partial<Omit<DateRangePickerRootProps, 'children' | 'value'>>

export interface RangePickerProps extends PickerProps {
  locale: FormLocale
  /** The range the fields hold at first, ISO dates. */
  initial?: DateRange
  /** The To field's error: the field is marked and the message is under it. */
  isInvalid?: boolean
  /** Writes the limit ("Up to 14 nights.") in the group's help text. */
  hasLimit?: boolean
}

const emptyRange: DateRange = { start: '', end: '' }

function Output({ range, label }: { range: DateRange; label: string }) {
  return (
    <p className="kv-story-form-output" data-testid="stored">
      {label}: {range.start} – {range.end}
    </p>
  )
}

/** Two `masks.date()` fields and one trigger after both, in a row that wraps: the standard composition. */
export function MaskedRangePicker({
  locale,
  initial = emptyRange,
  isInvalid = false,
  hasLimit = false,
  ...pickerProps
}: RangePickerProps) {
  const { text, lang } = rangeTextsFor(locale)
  const { text: dateText } = dateTextsFor(locale)
  const { locale: providerLocale } = useLocale()
  const [texts, setTexts] = useState({
    start: isoDateToMaskedDate(initial.start, providerLocale),
    end: isoDateToMaskedDate(initial.end, providerLocale),
  })
  const example = dateText.oneFieldHint(
    masks.date().withLocale(providerLocale).format('2026-10-27'),
  )
  const range = {
    start: maskedDateToIsoDate(texts.start, providerLocale),
    end: maskedDateToIsoDate(texts.end, providerLocale),
  }
  return (
    <div className="kv-story-form" lang={lang}>
      <DateRangePicker.Root
        today="2026-10-14"
        {...pickerProps}
        value={range}
        onValueChange={(next) => {
          setTexts({
            start: isoDateToMaskedDate(next.start, providerLocale),
            end: isoDateToMaskedDate(next.end, providerLocale),
          })
          pickerProps.onValueChange?.(next)
        }}
      >
        <Fieldset.Root group>
          <Fieldset.Legend>{text.legend}</Fieldset.Legend>
          <div className="kv-date-range-row">
            <Field.Root>
              <Field.Label>{text.from}</Field.Label>
              <TextInput
                name="start"
                mask={masks.date()}
                className="kv-input--width-10"
                value={texts.start}
                onValueChange={(start) => setTexts((current) => ({ ...current, start }))}
              />
              <Field.HelpText>{example}</Field.HelpText>
            </Field.Root>
            <Field.Root invalid={isInvalid}>
              <Field.Label>{text.to}</Field.Label>
              <TextInput
                name="end"
                mask={masks.date()}
                className="kv-input--width-10"
                value={texts.end}
                onValueChange={(end) => setTexts((current) => ({ ...current, end }))}
              />
              <Field.HelpText>{example}</Field.HelpText>
              {isInvalid ? <Field.ErrorMessage>{text.error}</Field.ErrorMessage> : null}
            </Field.Root>
            <DateRangePicker.Trigger />
          </div>
          {hasLimit ? <Fieldset.HelpText>{text.limit}</Fieldset.HelpText> : null}
        </Fieldset.Root>
        <DateRangePicker.Popup />
      </DateRangePicker.Root>
      <Output range={range} label={text.stored} />
    </div>
  )
}

/** The alternative: a group of three boxes per end, each its own Fieldset, the trigger after the end's boxes. */
export function DateInputRangePicker({
  locale,
  initial = emptyRange,
  isInvalid = false,
  hasLimit = false,
  ...pickerProps
}: RangePickerProps) {
  const { text, lang } = rangeTextsFor(locale)
  const { text: dateText } = dateTextsFor(locale)
  const { order } = useDateInput()
  const [start, setStart] = useState<DateInputValue>(isoDateToDateInputValue(initial.start))
  const [end, setEnd] = useState<DateInputValue>(isoDateToDateInputValue(initial.end))
  const example = order[0] === 'year' ? dateText.hintYearFirst : dateText.hintDayFirst
  const range = { start: dateInputValueToIsoDate(start), end: dateInputValueToIsoDate(end) }
  return (
    <div className="kv-story-form" lang={lang}>
      <DateRangePicker.Root
        today="2026-10-14"
        {...pickerProps}
        value={range}
        onValueChange={(next) => {
          setStart(isoDateToDateInputValue(next.start))
          setEnd(isoDateToDateInputValue(next.end))
          pickerProps.onValueChange?.(next)
        }}
      >
        <Fieldset.Root group>
          <Fieldset.Legend>{text.legend}</Fieldset.Legend>
          <div className="kv-date-range-row">
            <Fieldset.Root group>
              <Fieldset.Legend>{text.from}</Fieldset.Legend>
              <DateInput.Root name="start" value={start} onValueChange={setStart}>
                {order.map((part) => {
                  const Box = boxes[part]
                  return <Box key={part} />
                })}
              </DateInput.Root>
              <Fieldset.HelpText>{example}</Fieldset.HelpText>
            </Fieldset.Root>
            <Fieldset.Root group invalid={isInvalid}>
              <Fieldset.Legend>{text.to}</Fieldset.Legend>
              <DateInput.Root
                name="end"
                value={end}
                onValueChange={setEnd}
                invalidParts={isInvalid ? ['day', 'month', 'year'] : undefined}
              >
                {order.map((part) => {
                  const Box = boxes[part]
                  return <Box key={part} />
                })}
                <DateRangePicker.Trigger />
              </DateInput.Root>
              <Fieldset.HelpText>{example}</Fieldset.HelpText>
              {isInvalid ? <Fieldset.ErrorMessage>{text.error}</Fieldset.ErrorMessage> : null}
            </Fieldset.Root>
          </div>
          {hasLimit ? <Fieldset.HelpText>{text.limit}</Fieldset.HelpText> : null}
        </Fieldset.Root>
        <DateRangePicker.Popup />
      </DateRangePicker.Root>
      <Output range={range} label={text.stored} />
    </div>
  )
}

/** Every locale the library ships, each in its own provider, closed: the trigger's text and the row. */
export function LocaleRangePickers() {
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
          <MaskedRangePicker locale={messages} />
        </KvirnProvider>
      ))}
    </div>
  )
}
