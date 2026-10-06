import { createContext } from 'react'

/**
 * Internal. The row's Key id for its Change link and Key, and how a Key that brings its own `id`
 * reports it. `null` outside a Row.
 */
export const SummaryListRowContext = createContext<{
  keyId: string
  registerKeyId: (id: string | undefined) => void
} | null>(null)
