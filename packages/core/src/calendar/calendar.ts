import { createComponentStore } from '../store/create-component-store.ts'
import type { ComponentStore } from '../store/create-component-store.ts'
import {
  addMonths,
  clampIsoDate,
  getYearMonth,
  isValidIsoDate,
  toIsoDate,
} from '../calendar-date/calendar-date.ts'
import type { IsoDate, IsoWeekday, YearMonth } from '../calendar-date/calendar-date.ts'
import type { Direction } from '../locale/resolve-direction.ts'
import { getCalendarKeyTarget } from './calendar-keys.ts'

export type CalendarMonthChangeReason = 'key' | 'button' | 'focus' | 'configure'

export interface CalendarMonthChange extends YearMonth {
  reason: CalendarMonthChangeReason
}

export type CalendarDayAvailability = 'available' | 'unavailable' | 'outside-range'

export interface CalendarState {
  /** The month the grid shows. */
  visibleMonth: YearMonth
  /** The day with the roving tabindex: always inside `minimum`–`maximum`, always in `visibleMonth`. */
  focusedDate: IsoDate
  selectedDate: IsoDate | undefined
  minimum: IsoDate | undefined
  maximum: IsoDate | undefined
  weekStart: IsoWeekday
  direction: Direction
}

export interface CalendarSettings {
  minimum?: IsoDate | undefined
  maximum?: IsoDate | undefined
  weekStart?: IsoWeekday | undefined
  direction?: Direction | undefined
  /** A day inside the range that can't be chosen. It stays focusable. */
  isDateUnavailable?: ((date: IsoDate) => boolean) | undefined
}

export interface CalendarOptions extends CalendarSettings {
  /** Today in the provider's time zone: the core never reads a clock. */
  today: IsoDate
  /** The selected day. Focus starts here, else on the focus request, else on today. */
  selected?: IsoDate | undefined
  /** The day to focus first, such as a typed date. Used when there is no `selected`. */
  focused?: IsoDate | undefined
  onVisibleMonthChange?: ((change: CalendarMonthChange) => void) | undefined
  /** An available day was chosen. */
  onSelect?: ((date: IsoDate) => void) | undefined
}

export interface CalendarActions {
  /**
   * A key pressed on a day. `true` when it is a calendar move (the caller calls `preventDefault`);
   * focus and the visible month follow the target day.
   */
  handleKey: (key: string, shiftKey: boolean) => boolean
  /** Focus a day, such as the one a pointer press landed on. It is clamped to the range. */
  focusDate: (date: IsoDate) => void
  /**
   * The month buttons: show the month `months` away (12 for a year), clamped to the months the
   * range allows. The focused day moves to the same day there, cut to the month's length.
   */
  showMonth: (months: number) => void
  /** Choose a day. Nothing happens for an unavailable day or one outside the range. */
  select: (date: IsoDate) => void
  setSelected: (date: IsoDate | undefined) => void
  /** New range, week start, direction or predicate. The focused day is kept inside the range. */
  configure: (settings: CalendarSettings) => void
}

export type CalendarStore = ComponentStore<CalendarState, CalendarActions> & {
  /** Whether `showMonth(months)` would change the month: the month buttons' `aria-disabled`. */
  canShowMonth: (months: number) => boolean
  getDayAvailability: (date: IsoDate) => CalendarDayAvailability
}

/** Today, or a day with the same `YYYY-MM-DD` in an IANA zone, without `Date` arithmetic on the result. */
export function getTodayIsoDate(timeZone: string | undefined, now: Date): IsoDate {
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    timeZone,
  }).formatToParts(now)
  const read = (type: string) => Number(parts.find((part) => part.type === type)?.value)
  return toIsoDate({ year: read('year'), month: read('month'), day: read('day') })
}

function monthKey({ year, month }: YearMonth): number {
  return year * 12 + month - 1
}

export function getDayAvailability(
  date: IsoDate,
  settings: Pick<CalendarSettings, 'minimum' | 'maximum' | 'isDateUnavailable'>,
): CalendarDayAvailability {
  if (clampIsoDate(date, settings.minimum, settings.maximum) !== date) return 'outside-range'
  return settings.isDateUnavailable?.(date) === true ? 'unavailable' : 'available'
}

function validOrUndefined(date: IsoDate | undefined): IsoDate | undefined {
  return date !== undefined && isValidIsoDate(date) ? date : undefined
}

function assertRange(minimum: IsoDate | undefined, maximum: IsoDate | undefined): void {
  if (minimum !== undefined && maximum !== undefined && minimum > maximum) {
    throw new RangeError(`The minimum ${minimum} is after the maximum ${maximum}`)
  }
}

/** The store trusts its caller: pass `weekStart` through `resolveWeekStart`, and a range whose minimum is not after its maximum (else it throws a RangeError). */
export function createCalendar(options: CalendarOptions): CalendarStore {
  let isDateUnavailable = options.isDateUnavailable
  const { onVisibleMonthChange, onSelect } = options
  const minimum = validOrUndefined(options.minimum)
  const maximum = validOrUndefined(options.maximum)
  assertRange(minimum, maximum)
  const selectedDate = validOrUndefined(options.selected)
  const startDate = selectedDate ?? validOrUndefined(options.focused) ?? options.today
  const focusedDate = clampIsoDate(startDate, minimum, maximum)

  const store = createComponentStore<CalendarState, CalendarActions>(
    {
      visibleMonth: getYearMonth(focusedDate),
      focusedDate,
      selectedDate,
      minimum,
      maximum,
      weekStart: options.weekStart ?? 1,
      direction: options.direction ?? 'ltr',
    },
    ({ getState, update }) => {
      const moveFocus = (date: IsoDate, reason: CalendarMonthChangeReason) => {
        const { minimum: lowest, maximum: highest, visibleMonth } = getState()
        const next = clampIsoDate(date, lowest, highest)
        const nextMonth = getYearMonth(next)
        update((state) => ({ ...state, focusedDate: next, visibleMonth: nextMonth }))
        if (monthKey(nextMonth) !== monthKey(visibleMonth)) {
          onVisibleMonthChange?.({ ...nextMonth, reason })
        }
      }

      return {
        handleKey: (key, shiftKey) => {
          const {
            focusedDate: current,
            weekStart,
            direction,
            minimum: lowest,
            maximum: highest,
          } = getState()
          const target = getCalendarKeyTarget({
            key,
            shiftKey,
            date: current,
            weekStart,
            direction,
            minimum: lowest,
            maximum: highest,
          })
          if (target === undefined) return false
          moveFocus(target, 'key')
          return true
        },
        focusDate: (date) => {
          if (isValidIsoDate(date)) moveFocus(date, 'focus')
        },
        showMonth: (months) => {
          const { focusedDate: current } = getState()
          moveFocus(addMonths(current, months), 'button')
        },
        select: (date) => {
          const { minimum: lowest, maximum: highest } = getState()
          if (!isValidIsoDate(date)) return
          if (
            getDayAvailability(date, { minimum: lowest, maximum: highest, isDateUnavailable }) !==
            'available'
          ) {
            return
          }
          update((state) => ({ ...state, selectedDate: date }))
          onSelect?.(date)
        },
        setSelected: (date) => {
          update((state) => ({ ...state, selectedDate: validOrUndefined(date) }))
        },
        configure: (settings) => {
          if ('isDateUnavailable' in settings) isDateUnavailable = settings.isDateUnavailable
          const before = getState()
          const lowest = 'minimum' in settings ? validOrUndefined(settings.minimum) : before.minimum
          const highest =
            'maximum' in settings ? validOrUndefined(settings.maximum) : before.maximum
          assertRange(lowest, highest)
          update((state) => ({
            ...state,
            minimum: lowest,
            maximum: highest,
            weekStart: settings.weekStart ?? state.weekStart,
            direction: settings.direction ?? state.direction,
          }))
          moveFocus(before.focusedDate, 'configure')
        },
      }
    },
  )

  return {
    ...store,
    canShowMonth: (months) => {
      const { focusedDate: current, visibleMonth } = store.getState()
      const target = clampIsoDate(
        addMonths(current, months),
        store.getState().minimum,
        store.getState().maximum,
      )
      return monthKey(getYearMonth(target)) !== monthKey(visibleMonth)
    },
    getDayAvailability: (date) => {
      const { minimum: lowest, maximum: highest } = store.getState()
      return getDayAvailability(date, { minimum: lowest, maximum: highest, isDateUnavailable })
    },
  }
}
