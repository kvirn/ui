'use client'
import {
  DateInput,
  DatePicker,
  Field,
  Fieldset,
  TextInput,
  dateInputValueToIsoDate,
  isoDateToDateInputValue,
  isoDateToMaskedDate,
  maskedDateToIsoDate,
  masks,
  useDateInput,
  useLocale,
} from '@kvirn-ui/react'
import type { DateInputValue } from '@kvirn-ui/react'
import { useState } from 'react'
import { useDateInputTexts } from './texts.ts'

const parts = { day: DateInput.Day, month: DateInput.Month, year: DateInput.Year }

export function DateWithPicker() {
  const { texts } = useDateInputTexts()
  const { order } = useDateInput()
  const { locale } = useLocale()
  const [boxes, setBoxes] = useState<DateInputValue>({ year: '', month: '', day: '' })
  const [fieldText, setFieldText] = useState('')
  const example = masks.date().withLocale(locale).format('2026-10-27')
  return (
    <>
      <DatePicker.Root
        value={dateInputValueToIsoDate(boxes)}
        onValueChange={(isoDate) => setBoxes(isoDateToDateInputValue(isoDate))}
      >
        <Fieldset.Root group required>
          <Fieldset.Legend>{texts.visitLegend}</Fieldset.Legend>
          <DateInput.Root name="visit" value={boxes} onValueChange={setBoxes}>
            {order.map((part) => {
              const Box = parts[part]
              return <Box key={part} />
            })}
            <DatePicker.Trigger />
          </DateInput.Root>
          <Fieldset.HelpText>
            {order[0] === 'year' ? texts.hintYearFirst : texts.hintDayFirst}
          </Fieldset.HelpText>
        </Fieldset.Root>
        <DatePicker.Popup />
      </DatePicker.Root>
      <DatePicker.Root
        value={maskedDateToIsoDate(fieldText, locale)}
        onValueChange={(isoDate) => setFieldText(isoDateToMaskedDate(isoDate, locale))}
      >
        <Field.Root required>
          <Field.Label>{texts.oneFieldLabel}</Field.Label>
          <div className="kv-date-picker-row">
            <TextInput
              name="start"
              mask={masks.date()}
              value={fieldText}
              onValueChange={setFieldText}
            />
            <DatePicker.Trigger />
          </div>
          <Field.HelpText>{texts.oneFieldHint(example)}</Field.HelpText>
        </Field.Root>
        <DatePicker.Popup />
      </DatePicker.Root>
    </>
  )
}
