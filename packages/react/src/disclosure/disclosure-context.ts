import { createContext } from 'react'
import type { UseDisclosureResult } from './use-disclosure.ts'

/** Internal. The nearest `Disclosure.Root`'s hook result, or `null` outside one. */
export const DisclosureContext = createContext<UseDisclosureResult | null>(null)
