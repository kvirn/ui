'use client'
import { Calendar } from '@kvirn-ui/react'
import type { DateRange } from '@kvirn-ui/react'
import { useState } from 'react'
import { useCalendarTexts } from './texts.ts'

export function StayRange() {
  const { texts, textLang } = useCalendarTexts()
  const [range, setRange] = useState<DateRange>({ start: '', end: '' })
  return (
    <div lang={textLang}>
      <Calendar.Root
        mode="range"
        today="2026-10-14"
        minimum="2026-10-14"
        minimumDays={2}
        maximumDays={15}
        visibleMonths={2}
        value={range}
        onValueChange={setRange}
      >
        <Calendar.PreviousMonth />
        <Calendar.Heading />
        <Calendar.Heading offset={1} />
        <Calendar.NextMonth />
        <Calendar.RangeHint />
        <Calendar.Grid />
        <Calendar.Grid offset={1} />
      </Calendar.Root>
      <p>
        {texts.chosenRange} {range.start === '' ? texts.none : `${range.start} – ${range.end}`}
      </p>
    </div>
  )
}
