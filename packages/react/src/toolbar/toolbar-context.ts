import { createContext } from 'react'
import type { UseToolbarResult } from './use-toolbar.ts'

/** Internal. The nearest `Toolbar.Root`'s hook result, or `null` outside one. */
export const ToolbarContext = createContext<UseToolbarResult | null>(null)
