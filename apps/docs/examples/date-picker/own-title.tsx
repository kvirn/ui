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

export function TitledVisitDate() {
  const { texts } = useDatePickerTexts()
  const { locale } = useLocale()
  const example = masks.date().withLocale(locale).format('2026-10-27')
  const [fieldText, setFieldText] = useState('')
  return (
    <div>
      <DatePicker.Root
        messages={{ title: texts.title }}
        value={maskedDateToIsoDate(fieldText, locale)}
        onValueChange={(isoDate) => setFieldText(isoDateToMaskedDate(isoDate, locale))}
      >
        <Field.Root>
          <Field.Label>{texts.fieldLabel}</Field.Label>
          <div className="kv-date-picker-row">
            <TextInput
              name="visit"
              mask={masks.date()}
              value={fieldText}
              onValueChange={setFieldText}
            />
            <DatePicker.Trigger />
          </div>
          <Field.HelpText>{texts.fieldHint(example)}</Field.HelpText>
        </Field.Root>
        <DatePicker.Popup />
      </DatePicker.Root>
    </div>
  )
}
