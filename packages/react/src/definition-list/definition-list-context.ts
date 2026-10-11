import { createContext } from 'react'

/**
 * Internal. The row's Term id for its Change link and Term, and how a Term that brings its own `id`
 * reports it. `null` outside a Row.
 */
export const DefinitionListRowContext = createContext<{
  termId: string
  registerTermId: (id: string | undefined) => void
} | null>(null)
