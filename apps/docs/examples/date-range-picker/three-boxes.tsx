'use client'
import {
  DateInput,
  DateRangePicker,
  Fieldset,
  dateInputValueToIsoDate,
  isoDateToDateInputValue,
  useDateInput,
} from '@kvirn-ui/react'
import type { DateInputValue } from '@kvirn-ui/react'
import { useState } from 'react'
import { useDateRangePickerTexts } from './texts.ts'

const boxes = { day: DateInput.Day, month: DateInput.Month, year: DateInput.Year }
const emptyDate: DateInputValue = { year: '', month: '', day: '' }

export function AbsenceDates() {
  const { texts } = useDateRangePickerTexts()
  const { order } = useDateInput()
  const [start, setStart] = useState<DateInputValue>(emptyDate)
  const [end, setEnd] = useState<DateInputValue>(emptyDate)
  const hint = order[0] === 'year' ? texts.hintYearFirst : texts.hintDayFirst
  return (
    <div>
      <DateRangePicker.Root
        value={{ start: dateInputValueToIsoDate(start), end: dateInputValueToIsoDate(end) }}
        onValueChange={(range) => {
          setStart(isoDateToDateInputValue(range.start))
          setEnd(isoDateToDateInputValue(range.end))
        }}
      >
        <Fieldset.Root group>
          <Fieldset.Legend>{texts.absenceLegend}</Fieldset.Legend>
          <div className="kv-date-range-row">
            <Fieldset.Root group>
              <Fieldset.Legend>{texts.firstDay}</Fieldset.Legend>
              <DateInput.Root name="start" value={start} onValueChange={setStart}>
                {order.map((part) => {
                  const Box = boxes[part]
                  return <Box key={part} />
                })}
              </DateInput.Root>
              <Fieldset.HelpText>{hint}</Fieldset.HelpText>
            </Fieldset.Root>
            <Fieldset.Root group>
              <Fieldset.Legend>{texts.lastDay}</Fieldset.Legend>
              <DateInput.Root name="end" value={end} onValueChange={setEnd}>
                {order.map((part) => {
                  const Box = boxes[part]
                  return <Box key={part} />
                })}
                <DateRangePicker.Trigger />
              </DateInput.Root>
              <Fieldset.HelpText>{hint}</Fieldset.HelpText>
            </Fieldset.Root>
          </div>
        </Fieldset.Root>
        <DateRangePicker.Popup />
      </DateRangePicker.Root>
    </div>
  )
}
