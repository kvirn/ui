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

export function LimitedVisitDate() {
  const { texts, textLang } = useDatePickerTexts()
  const { locale } = useLocale()
  const [fieldText, setFieldText] = useState('')
  return (
    <div lang={textLang}>
      <DatePicker.Root
        today="2026-10-14"
        minimum="2026-10-14"
        maximum="2026-12-31"
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
            <Field.HelpText>{texts.window}</Field.HelpText>
          </Field.Root>
          <DatePicker.Trigger />
        </div>
        <DatePicker.Popup />
      </DatePicker.Root>
    </div>
  )
}
