import {
  addDays,
  addMonths,
  addYears,
  clampIsoDate,
  endOfWeek,
  startOfWeek,
} from '../calendar-date/calendar-date.ts'
import type { IsoDate, IsoWeekday } from '../calendar-date/calendar-date.ts'
import type { Direction } from '../locale/resolve-direction.ts'

export interface CalendarKeyTargetInput {
  /** `KeyboardEvent.key`. Pass it only when no Ctrl, Alt or Meta is held. */
  key: string
  shiftKey: boolean
  /** The day that has focus. */
  date: IsoDate
  weekStart: IsoWeekday
  /** Left and Right flip in `rtl`; Up and Down never do. */
  direction: Direction
  minimum?: IsoDate | undefined
  maximum?: IsoDate | undefined
}

/**
 * The day a key moves focus to, clamped to `minimum` and `maximum` (at an edge it is `date`
 * itself), or `undefined` when the key is not a calendar move, so the caller leaves it alone.
 * Arrows never wrap: they cross into the next or previous month.
 */
export function getCalendarKeyTarget({
  key,
  shiftKey,
  date,
  weekStart,
  direction,
  minimum,
  maximum,
}: CalendarKeyTargetInput): IsoDate | undefined {
  const forward = direction === 'rtl' ? -1 : 1
  const target = shiftKey
    ? getShiftTarget(key, date)
    : getPlainTarget(key, date, weekStart, forward)
  return target === undefined ? undefined : clampIsoDate(target, minimum, maximum)
}

function getPlainTarget(
  key: string,
  date: IsoDate,
  weekStart: IsoWeekday,
  forward: 1 | -1,
): IsoDate | undefined {
  switch (key) {
    case 'ArrowRight':
      return addDays(date, forward)
    case 'ArrowLeft':
      return addDays(date, -forward)
    case 'ArrowDown':
      return addDays(date, 7)
    case 'ArrowUp':
      return addDays(date, -7)
    case 'Home':
      return startOfWeek(date, weekStart)
    case 'End':
      return endOfWeek(date, weekStart)
    case 'PageDown':
      return addMonths(date, 1)
    case 'PageUp':
      return addMonths(date, -1)
    default:
      return undefined
  }
}

function getShiftTarget(key: string, date: IsoDate): IsoDate | undefined {
  if (key === 'PageDown') return addYears(date, 1)
  if (key === 'PageUp') return addYears(date, -1)
  return undefined
}
