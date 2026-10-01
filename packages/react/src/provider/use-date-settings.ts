import { useContext, useMemo } from 'react'
import { KvirnConfigContext } from './provider-context.ts'

export interface UseDateSettingsResult {
  /** IANA time zone. `undefined` means the runtime's zone; set it explicitly for SSR. */
  timeZone: string | undefined
}

export function useDateSettings(): UseDateSettingsResult {
  const { timeZone } = useContext(KvirnConfigContext)
  return useMemo(() => ({ timeZone }), [timeZone])
}
