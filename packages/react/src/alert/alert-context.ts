import { createContext } from 'react'
import type { UseAlertResult } from './use-alert.ts'

/**
 * Internal. The root's `useAlert` result for its Title, Body and Actions: their classes
 * and refs, and the status word the Title starts with. `null` outside a root.
 */
export const AlertContext = createContext<UseAlertResult | null>(null)
