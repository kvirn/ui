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
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function TitledVisitDate() {
  const { texts, isFallback } = useDatePickerTexts()
  const { locale } = useLocale()
  const [fieldText, setFieldText] = useState('')
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <div>
        <DatePicker.Root
          messages={{ title: texts.title }}
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
    </InEnglishWhenFallback>
  )
}
