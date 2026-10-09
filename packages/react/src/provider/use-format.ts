import type { MessageFormatter } from '@kvirn-ui/core'
import { useContext } from 'react'
import { KvirnConfigContext } from './provider-context.ts'

/** The same formatter that message functions receive as `format` (Plan 0046). */
export type UseFormatResult = MessageFormatter

/**
 * Formats numbers, dates, lists and plurals the way the nearest provider's `locale` writes them,
 * and instants in its `timeZone`. A `YYYY-MM-DD` string is a calendar date: it is shown on its
 * own day, in any zone. `en` and UTC without a provider, and a development warning the first time an instant is formatted without a `timeZone`. The object stays the same
 * until the locale or the zone changes, so it is safe in a dependency list.
 *
 * @example
 * const format = useFormat()
 * format.number(1250.5, { minimumFractionDigits: 2 }) // "1 250,50" in sv
 * format.date('2026-01-23', { dateStyle: 'long' }) // "23 januari 2026" in sv
 */
export function useFormat(): UseFormatResult {
  return useContext(KvirnConfigContext).format
}
