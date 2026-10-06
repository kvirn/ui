import { createContext } from 'react'
import type { UseReadAloudResult } from './use-read-aloud.ts'

/** Internal. The root's `useReadAloud` result for its parts. `null` outside a root. */
export const ReadAloudContext = createContext<UseReadAloudResult | null>(null)
