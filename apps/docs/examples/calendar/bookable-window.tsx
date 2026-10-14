'use client'
import { Calendar, useFormat } from '@kvirn-ui/react'
import { useState } from 'react'
import { useCalendarTexts } from './texts.ts'

export function BookableWindow() {
  const { texts } = useCalendarTexts()
  const format = useFormat()
  const [date, setDate] = useState('')
  return (
    <div>
      <Calendar.Root
        today="2026-10-14"
        minimum="2026-10-14"
        maximum="2026-12-31"
        value={date}
        onValueChange={setDate}
      >
        <Calendar.PreviousMonth />
        <Calendar.Heading />
        <Calendar.NextMonth />
        <Calendar.RangeHint />
        <Calendar.Grid />
      </Calendar.Root>
      <p>
        {texts.chosen} {date === '' ? texts.none : format.date(date, { dateStyle: 'long' })}
      </p>
    </div>
  )
}
