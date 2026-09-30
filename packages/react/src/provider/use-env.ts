import { getDefaultEnv } from '@kvirn-ui/core'
import type { Env } from '@kvirn-ui/core'
import { useContext, useSyncExternalStore } from 'react'
import { KvirnConfigContext } from './provider-context.ts'

const subscribeToNothing = () => () => {}
let pageEnv: Env | undefined
const getPageEnv = () => (pageEnv ??= getDefaultEnv())
const getServerEnv = () => undefined

/**
 * Internal. The provider's `env`, or the page's own window and document. It is `undefined`
 * during server rendering and during hydration, so the first client render matches the
 * server, then resolves right after (Plan 0002).
 */
export function useEnv(): Env | undefined {
  const config = useContext(KvirnConfigContext)
  const defaultEnv = useSyncExternalStore(subscribeToNothing, getPageEnv, getServerEnv)
  return config.env ?? defaultEnv
}
