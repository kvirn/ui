import { createContext } from 'react'
import type { UseCalendarResult } from './use-calendar.ts'

/** Set by Calendar.Root for its parts. */
export const CalendarContext = createContext<UseCalendarResult | null>(null)
