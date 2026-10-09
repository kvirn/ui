'use client'
import { Calendar } from '@kvirn-ui/react'

export function YearButtons() {
  return (
    <Calendar.Root defaultFocusedDate="1990-06-15">
      <Calendar.PreviousYear />
      <Calendar.PreviousMonth />
      <Calendar.Heading />
      <Calendar.NextMonth />
      <Calendar.NextYear />
      <Calendar.Grid />
    </Calendar.Root>
  )
}
