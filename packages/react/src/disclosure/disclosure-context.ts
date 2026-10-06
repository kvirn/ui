import { createContext } from 'react'
import type { UseDisclosureResult } from './use-disclosure.ts'

/** Internal. The nearest `Disclosure.Root`'s hook result, or `null` outside one. */
export const DisclosureContext = createContext<UseDisclosureResult | null>(null)

/** Internal. Names the part in the outside-a-root warning: Accordion wraps Disclosure parts. */
export const DisclosureOwnerContext = createContext<'Disclosure' | 'Accordion'>('Disclosure')
