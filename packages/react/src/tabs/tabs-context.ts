import { createContext } from 'react'
import type { UseTabsResult } from './use-tabs.ts'

/** Internal. The nearest `Tabs.Root`'s hook result, or `null` outside one. */
export const TabsContext = createContext<UseTabsResult | null>(null)
