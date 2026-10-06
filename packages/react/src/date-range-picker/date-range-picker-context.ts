import { createContext } from 'react'
import type { UseDateRangePickerResult } from './use-date-range-picker.ts'

/** Set by DateRangePicker.Root for its parts. */
export const DateRangePickerContext = createContext<UseDateRangePickerResult | null>(null)
