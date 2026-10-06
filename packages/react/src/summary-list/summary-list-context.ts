import { createContext } from 'react'

/** Internal. The row's Key id for its Change link and Key. `null` outside a Row. */
export const SummaryListRowContext = createContext<{ keyId: string } | null>(null)
