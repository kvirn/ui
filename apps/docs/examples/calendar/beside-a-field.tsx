'use client'
import {
  Calendar,
  Field,
  TextInput,
  isoDateToMaskedDate,
  masks,
  maskedDateToIsoDate,
  useLocale,
} from '@kvirn-ui/react'
import { useState } from 'react'
import { useCalendarTexts } from './texts.ts'

export function CalendarBesideField() {
  const { texts, textLang } = useCalendarTexts()
  const { locale } = useLocale()
  const [fieldText, setFieldText] = useState('')
  const example = masks.date().withLocale(locale).format('2026-10-27')
  return (
    <div lang={textLang}>
      <Field.Root>
        <Field.Label>{texts.fieldLabel}</Field.Label>
        <TextInput mask={masks.date()} value={fieldText} onValueChange={setFieldText} />
        <Field.HelpText>{texts.fieldHint(example)}</Field.HelpText>
      </Field.Root>
      <Calendar.Root
        value={maskedDateToIsoDate(fieldText, locale)}
        onValueChange={(date) => setFieldText(isoDateToMaskedDate(date, locale))}
      >
        <Calendar.PreviousMonth />
        <Calendar.Heading />
        <Calendar.NextMonth />
        <Calendar.Grid />
      </Calendar.Root>
    </div>
  )
}
