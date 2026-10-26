import { createContext } from 'react'
import type { UseReadAloudResult } from './use-read-aloud.ts'

/**
 * Internal. The root's `useReadAloud` result for its parts, plus `registerBar`: called by
 * `ReadAloud.Bar` while it is mounted, so Root's own (and only) `role="group"` takes
 * `readAloud.barLabel` instead of `readAloud.label` (Plan 0154, superseding the nested-group
 * draft) — one group, named for whichever composition it actually is. `null` outside a root.
 */
export interface ReadAloudContextValue extends UseReadAloudResult {
  registerBar: () => () => void
}

export const ReadAloudContext = createContext<ReadAloudContextValue | null>(null)
