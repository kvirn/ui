import { resolveWeekStart } from '@kvirn-ui/core'
import type { WeekStart } from '@kvirn-ui/core'
import { useContext, useMemo } from 'react'
import { KvirnConfigContext } from './provider-context.ts'

export interface UseDateSettingsResult {
  /** IANA time zone. `undefined` means the runtime's zone; set it explicitly for SSR. */
  timeZone: string | undefined
  /**
   * The first day of the week, `1` (Monday) to `7` (Sunday): the provider's `weekStart`, else the
   * locale's when it names a region (`en-US` is `7`), else `1`. A Calendar's own `weekStart` wins.
   */
  weekStart: WeekStart
}

export function useDateSettings(): UseDateSettingsResult {
  const { timeZone, weekStart: providerWeekStart, locale } = useContext(KvirnConfigContext)
  return useMemo(
    () => ({ timeZone, weekStart: resolveWeekStart({ provider: providerWeekStart, locale }) }),
    [timeZone, providerWeekStart, locale],
  )
}
