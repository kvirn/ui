import type { IsoWeekday } from './calendar-date.ts'

export type WeekStart = IsoWeekday

export function isWeekStart(value: unknown): value is WeekStart {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 7
}

interface WeekInfoLocale extends Intl.Locale {
  getWeekInfo?: () => { firstDay: number }
  weekInfo?: { firstDay: number }
}

/**
 * The first day of the week `Intl` knows for a locale that names a region (`en-US` is 7, `sv-SE`
 * is 1). A bare language (`en`) or a runtime without week data gives `undefined`: `Intl` would
 * answer Sunday for `en`, which EU English readers don't use.
 */
export function getLocaleWeekStart(locale: string): WeekStart | undefined {
  try {
    const parsed: WeekInfoLocale = new Intl.Locale(locale)
    if (parsed.region === undefined) return undefined
    const firstDay = (parsed.getWeekInfo?.() ?? parsed.weekInfo)?.firstDay
    return isWeekStart(firstDay) ? firstDay : undefined
  } catch {
    return undefined
  }
}

export interface ResolveWeekStartOptions {
  /** `weekStart` passed to the one Calendar. */
  instance?: unknown
  /** `weekStart` of the nearest `KvirnProvider` that set one. */
  provider?: unknown
  locale: string
}

/** Instance, then provider, then the locale when it names a region, then Monday. Invalid values are skipped. */
export function resolveWeekStart({
  instance,
  provider,
  locale,
}: ResolveWeekStartOptions): WeekStart {
  if (isWeekStart(instance)) return instance
  if (isWeekStart(provider)) return provider
  return getLocaleWeekStart(locale) ?? 1
}
