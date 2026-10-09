'use client'
import { Calendar } from '@kvirn-ui/react'
import { useState } from 'react'
import { useCalendarTexts } from './texts.ts'

export function BookableWindow() {
  const { texts, textLang } = useCalendarTexts()
  const [date, setDate] = useState('')
  return (
    <div lang={textLang}>
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
        {texts.chosen} {date === '' ? texts.none : date}
      </p>
    </div>
  )
}
