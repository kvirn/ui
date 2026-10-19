'use client'
import {
  DatePicker,
  Field,
  TextInput,
  checks,
  isoDateToMaskedDate,
  masks,
  maskedDateToIsoDate,
  useLocale,
} from '@kvirn-ui/react'
import { useState } from 'react'
import { useDatePickerTexts } from './texts.ts'

const earliest = '2026-10-14'
const latest = '2026-12-31'

export function LimitedVisitDate() {
  const { texts } = useDatePickerTexts()
  const { locale } = useLocale()
  const [fieldText, setFieldText] = useState('')
  const typedDate = maskedDateToIsoDate(fieldText, locale)
  const isOutside =
    typedDate !== '' && checks.date(typedDate, { min: earliest, max: latest }).reason === 'range'
  return (
    <div>
      <DatePicker.Root
        today={earliest}
        minimum={earliest}
        maximum={latest}
        value={typedDate}
        onValueChange={(isoDate) => setFieldText(isoDateToMaskedDate(isoDate, locale))}
      >
        <Field.Root invalid={isOutside}>
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
          <Field.HelpText>{texts.window}</Field.HelpText>
          <Field.ErrorMessage>{isOutside ? texts.outsideError : ''}</Field.ErrorMessage>
        </Field.Root>
        <DatePicker.Popup />
      </DatePicker.Root>
    </div>
  )
}
