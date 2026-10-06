import { createContext } from 'react'
import type { UseErrorSummaryResult } from './use-error-summary.ts'

/** Internal. The root's `useErrorSummary` result for its parts. `null` outside a root. */
export const ErrorSummaryContext = createContext<UseErrorSummaryResult | null>(null)
