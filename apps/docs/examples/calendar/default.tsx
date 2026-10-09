'use client'
import { Calendar } from '@kvirn-ui/react'

export function MonthCalendar() {
  return (
    <Calendar.Root>
      <Calendar.PreviousMonth />
      <Calendar.Heading />
      <Calendar.NextMonth />
      <Calendar.Grid />
    </Calendar.Root>
  )
}
