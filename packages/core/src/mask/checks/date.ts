import type { CheckResult } from '../mask-types.ts'
import { isCalendarDate } from './check-support.ts'

export type DateCheckFailure = 'format' | 'date' | 'range'
export type DateCheck = CheckResult<DateCheckFailure>

export interface DateCheckOptions {
  /** The earliest date, ISO `YYYY-MM-DD`, inclusive. */
  readonly min?: string | undefined
  /** The latest date, ISO `YYYY-MM-DD`, inclusive. */
  readonly max?: string | undefined
}

/**
 * Checks an ISO date, as `masks.date()` gives it in `unmaskedValue`. It reports why it fails:
 * `format` (not a complete `YYYY-MM-DD`), `date` (no such day, such as 2026-02-31) or `range`
 * (before `min` or after `max`). ISO dates sort as text, so the range needs no parsing.
 */
export function checkDate(isoValue: string, options: DateCheckOptions = {}): DateCheck {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoValue)
  if (match === null) return { isValid: false, reason: 'format' }
  if (!isCalendarDate(Number(match[1]), Number(match[2]), Number(match[3]))) {
    return { isValid: false, reason: 'date' }
  }
  const { min, max } = options
  if ((min !== undefined && isoValue < min) || (max !== undefined && isoValue > max)) {
    return { isValid: false, reason: 'range' }
  }
  return { isValid: true, reason: undefined }
}
