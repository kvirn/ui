'use client'
import { Calendar } from '@kvirn-ui/react'

export function WeekNumbers() {
  return (
    <Calendar.Root today="2026-10-14" weekStart={1} weekNumbers>
      <Calendar.PreviousMonth />
      <Calendar.Heading />
      <Calendar.NextMonth />
      <Calendar.Grid />
    </Calendar.Root>
  )
}
