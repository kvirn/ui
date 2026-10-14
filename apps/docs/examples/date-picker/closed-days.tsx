'use client'
import {
  DatePicker,
  Field,
  TextInput,
  isoDateToMaskedDate,
  masks,
  maskedDateToIsoDate,
  useFormat,
  useLocale,
} from '@kvirn-ui/react'
import { useState } from 'react'
import { useDatePickerTexts } from './texts.ts'

const closedDays = ['2026-10-16', '2026-10-17', '2026-10-24']

export function ClosedVisitDays() {
  const { texts } = useDatePickerTexts()
  const { locale } = useLocale()
  const format = useFormat()
  const [fieldText, setFieldText] = useState('')
  const typedDate = maskedDateToIsoDate(fieldText, locale)
  const isClosed = closedDays.includes(typedDate)
  const shortDate = (date: string) => format.date(date, { day: 'numeric', month: 'long' })
  const closedError = isClosed ? texts.closedError(shortDate(typedDate)) : ''
  return (
    <div>
      <DatePicker.Root
        today="2026-10-14"
        isDateUnavailable={(date) => closedDays.includes(date)}
        getDateDescription={(date) => (closedDays.includes(date) ? texts.closed : undefined)}
        value={typedDate}
        onValueChange={(isoDate) => setFieldText(isoDateToMaskedDate(isoDate, locale))}
      >
        <div className="kv-date-picker-row">
          <Field.Root invalid={isClosed}>
            <Field.Label>{texts.fieldLabel}</Field.Label>
            <TextInput
              name="visit"
              mask={masks.date()}
              value={fieldText}
              onValueChange={setFieldText}
            />
            <Field.HelpText>
              {texts.closedHint(format.list(closedDays.map(shortDate)))}
            </Field.HelpText>
            <Field.ErrorMessage>{closedError}</Field.ErrorMessage>
          </Field.Root>
          <DatePicker.Trigger />
        </div>
        <DatePicker.Popup />
      </DatePicker.Root>
    </div>
  )
}
