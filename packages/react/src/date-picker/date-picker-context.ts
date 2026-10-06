import { createContext } from 'react'
import type { UseDatePickerResult } from './use-date-picker.ts'

/** Set by DatePicker.Root for its parts. */
export const DatePickerContext = createContext<UseDatePickerResult | null>(null)
