'use client'
import {
  DatePicker,
  Field,
  TextInput,
  isoDateToMaskedDate,
  masks,
  maskedDateToIsoDate,
  useLocale,
} from '@kvirn-ui/react'
import { useState } from 'react'
import { useDatePickerTexts } from './texts.ts'

const closedDays = new Set(['2026-10-16', '2026-10-17', '2026-10-24'])

export function ClosedVisitDays() {
  const { texts, textLang } = useDatePickerTexts()
  const { locale } = useLocale()
  const [fieldText, setFieldText] = useState('')
  return (
    <div lang={textLang}>
      <DatePicker.Root
        today="2026-10-14"
        isDateUnavailable={(date) => closedDays.has(date)}
        getDateDescription={(date) => (closedDays.has(date) ? texts.closed : undefined)}
        value={maskedDateToIsoDate(fieldText, locale)}
        onValueChange={(isoDate) => setFieldText(isoDateToMaskedDate(isoDate, locale))}
      >
        <div className="kv-date-picker-row">
          <Field.Root>
            <Field.Label>{texts.fieldLabel}</Field.Label>
            <TextInput
              name="visit"
              mask={masks.date()}
              value={fieldText}
              onValueChange={setFieldText}
            />
          </Field.Root>
          <DatePicker.Trigger />
        </div>
        <DatePicker.Popup />
      </DatePicker.Root>
    </div>
  )
}
