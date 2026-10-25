import type { ReadAloudEngine } from '@kvirn-ui/core'
import { useContext } from 'react'
import { KvirnConfigContext } from './provider-context.ts'

/**
 * Internal. The nearest provider's `readAloud` engine, or `undefined` outside any provider or
 * without one configured. `useReadAloud` falls back to this only when it has neither its own
 * `engine` nor its own `url`.
 */
export function useReadAloudEngine(): ReadAloudEngine | undefined {
  return useContext(KvirnConfigContext).readAloudEngine
}
