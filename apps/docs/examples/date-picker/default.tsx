'use client'
import {
  DateInput,
  DatePicker,
  Fieldset,
  dateInputValueToIsoDate,
  isoDateToDateInputValue,
  useDateInput,
} from '@kvirn-ui/react'
import type { DateInputValue } from '@kvirn-ui/react'
import { useState } from 'react'
import { useDatePickerTexts } from './texts.ts'

const boxes = { day: DateInput.Day, month: DateInput.Month, year: DateInput.Year }

export function VisitDate() {
  const { texts, textLang } = useDatePickerTexts()
  const { order } = useDateInput()
  const [date, setDate] = useState<DateInputValue>({ year: '', month: '', day: '' })
  return (
    <div lang={textLang}>
      <DatePicker.Root
        value={dateInputValueToIsoDate(date)}
        onValueChange={(isoDate) => setDate(isoDateToDateInputValue(isoDate))}
      >
        <Fieldset.Root group>
          <Fieldset.Legend>{texts.legend}</Fieldset.Legend>
          <DateInput.Root name="visit" value={date} onValueChange={setDate}>
            {order.map((part) => {
              const Box = boxes[part]
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
    </div>
  )
}
