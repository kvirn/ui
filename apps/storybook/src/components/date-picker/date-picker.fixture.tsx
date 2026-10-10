import { createMessageFormat } from '@kvirn-ui/core'
import {
  DateInput,
  DatePicker,
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
import type { DateInputPart, DateInputValue, DatePickerRootProps } from '@kvirn-ui/react'
import { useState } from 'react'
import { dateTextsFor } from '../date-input/date-input.fixture.tsx'
import { messagesFor, providerLocaleOf } from '../form/form.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'

// Fixtures for Components/DatePicker. KvirnUI holds no form state: the field's value lives here in
// `useState`, where TanStack Form or React Hook Form would sit, and the bridge functions turn it
// into the ISO date the picker takes and back. Every story fixes `today` to 14 October 2026.
//

export {
  closedDays,
  describeClosedDay,
  withCalendarProvider,
} from '../calendar/calendar.fixture.tsx'

const emptyDate: DateInputValue = { year: '', month: '', day: '' }

const errorTexts: Record<FormLocale, string> = {
  sv: 'Datumet måste vara ett riktigt datum',
  fi: 'Päivämäärän täytyy olla oikea päivämäärä',
  nb: 'Datoen må være en gyldig dato',
  nn: 'Datoen må vere ein gyldig dato',
  en: 'The date must be a real date',
}

const boxes = {
  day: DateInput.Day,
  month: DateInput.Month,
  year: DateInput.Year,
} satisfies Record<DateInputPart, unknown>

type PickerProps = Partial<Omit<DatePickerRootProps, 'children' | 'value'>>

/** The range in words, from the library's own catalog, so the help text and the dialog agree (3.3.2). */
function useRangeText(
  locale: FormLocale,
  minimum: string | undefined,
  maximum: string | undefined,
) {
  if (minimum === undefined && maximum === undefined) {
    return undefined
  }
  const format = createMessageFormat({ locale: providerLocaleOf(locale), timeZone: undefined })
  const long = (date: string | undefined) =>
    date === undefined ? undefined : format.date(date, { dateStyle: 'long' })
  return messagesFor(locale).calendar.rangeHint({ min: long(minimum), max: long(maximum) }, format)
}

export interface VisitDatePickerProps extends PickerProps {
  locale: FormLocale
  /** What the boxes hold at first. */
  initial?: DateInputValue
  /** The field's error: the boxes are marked and the message is under them. */
  isInvalid?: boolean
}

/** A DateInput with the picker's trigger last in its row: the standard composition. */
export function VisitDatePicker({
  locale,
  initial = emptyDate,
  isInvalid = false,
  ...pickerProps
}: VisitDatePickerProps) {
  const { text, lang } = dateTextsFor(locale)
  const [date, setDate] = useState(initial)
  const { order } = useDateInput()
  const rangeText = useRangeText(locale, pickerProps.minimum, pickerProps.maximum)
  const example = order[0] === 'year' ? text.hintYearFirst : text.hintDayFirst
  return (
    <div className="kv-story-form" lang={lang}>
      <DatePicker.Root
        today="2026-10-14"
        {...pickerProps}
        value={dateInputValueToIsoDate(date)}
        onValueChange={(isoDate) => {
          setDate(isoDateToDateInputValue(isoDate))
          pickerProps.onValueChange?.(isoDate)
        }}
      >
        <Fieldset.Root group invalid={isInvalid}>
          <Fieldset.Legend>{text.visitLegend}</Fieldset.Legend>
          <DateInput.Root
            name="visit"
            value={date}
            onValueChange={setDate}
            invalidParts={isInvalid ? ['day', 'month', 'year'] : undefined}
          >
            {order.map((part) => {
              const Box = boxes[part]
              return <Box key={part} />
            })}
            <DatePicker.Trigger />
          </DateInput.Root>
          <Fieldset.HelpText>
            {rangeText === undefined ? example : `${example}. ${rangeText}.`}
          </Fieldset.HelpText>
          {isInvalid ? <Fieldset.ErrorMessage>{errorTexts[locale]}</Fieldset.ErrorMessage> : null}
        </Fieldset.Root>
        <DatePicker.Popup />
      </DatePicker.Root>
      <p className="kv-story-form-output" data-testid="stored">
        {text.stored}: {dateInputValueToIsoDate(date)}
      </p>
    </div>
  )
}

export interface MaskedDatePickerProps extends PickerProps {
  locale: FormLocale
  initial?: string
}

/** One `masks.date()` field and the trigger beside it, in a row that wraps. */
export function MaskedDatePicker({ locale, initial = '', ...pickerProps }: MaskedDatePickerProps) {
  const { text, lang } = dateTextsFor(locale)
  const { locale: providerLocale } = useLocale()
  const [fieldText, setFieldText] = useState(initial)
  const example = masks.date().withLocale(providerLocale).format('2026-10-27')
  return (
    <div className="kv-story-form" lang={lang}>
      <DatePicker.Root
        today="2026-10-14"
        {...pickerProps}
        value={maskedDateToIsoDate(fieldText, providerLocale)}
        onValueChange={(isoDate) => {
          setFieldText(isoDateToMaskedDate(isoDate, providerLocale))
          pickerProps.onValueChange?.(isoDate)
        }}
      >
        <div className="kv-date-picker-row">
          <Field.Root>
            <Field.Label>{text.oneFieldLabel}</Field.Label>
            <TextInput
              name="start"
              mask={masks.date()}
              value={fieldText}
              onValueChange={setFieldText}
            />
            <Field.HelpText>{text.oneFieldHint(example)}</Field.HelpText>
          </Field.Root>
          <DatePicker.Trigger />
        </div>
        <DatePicker.Popup />
      </DatePicker.Root>
      <p className="kv-story-form-output" data-testid="stored">
        {text.stored}: {maskedDateToIsoDate(fieldText, providerLocale)}
      </p>
    </div>
  )
}

/** Every locale the library ships, each in its own provider, closed: the trigger's text and the row. */
export function LocalePickers() {
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
          <VisitDatePicker locale={messages} />
        </KvirnProvider>
      ))}
    </div>
  )
}
