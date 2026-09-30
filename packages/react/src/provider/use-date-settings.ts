import { useContext, useMemo } from 'react'
import { KvirnConfigContext } from './provider-context.ts'
import type { WeekStart } from './provider-context.ts'

export interface UseDateSettingsResult {
  /** IANA time zone. `undefined` means the runtime's zone; set it explicitly for SSR. */
  timeZone: string | undefined
  /** ISO weekday the week starts on: 1 is Monday (the default), 7 is Sunday. */
  weekStart: WeekStart
}

export function useDateSettings(): UseDateSettingsResult {
  const { timeZone, weekStart } = useContext(KvirnConfigContext)
  return useMemo(() => ({ timeZone, weekStart }), [timeZone, weekStart])
}
