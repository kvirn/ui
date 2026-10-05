import { createContext } from 'react'
import type { UseTableOfContentsResult } from './use-table-of-contents.ts'

/** Internal. The nearest `TableOfContents.Root`'s hook result, or `null` outside one. */
export const TableOfContentsContext = createContext<UseTableOfContentsResult | null>(null)
