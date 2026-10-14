import { createContext } from 'react'
import type { UseMapResult } from './use-map.ts'

/** Set by Map.Root for its parts. */
export const MapContext = createContext<UseMapResult | null>(null)
