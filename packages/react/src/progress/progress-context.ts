import { createContext } from 'react'
import type { UseProgressResult } from './use-progress.ts'

/** Set by Progress.Root for its Label and Bar. */
export const ProgressContext = createContext<UseProgressResult | null>(null)
