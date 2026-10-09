'use client'
import { Calendar } from '@kvirn-ui/react'
import { useCalendarTexts } from './texts.ts'

const closedDays = new Set(['2026-10-16', '2026-10-17', '2026-10-24'])

export function ClosedDays() {
  const { texts, textLang } = useCalendarTexts()
  return (
    <div lang={textLang}>
      <Calendar.Root
        today="2026-10-14"
        isDateUnavailable={(date) => closedDays.has(date)}
        getDateDescription={(date) => (closedDays.has(date) ? texts.closed : undefined)}
      >
        <Calendar.PreviousMonth />
        <Calendar.Heading />
        <Calendar.NextMonth />
        <Calendar.Grid />
      </Calendar.Root>
    </div>
  )
}
