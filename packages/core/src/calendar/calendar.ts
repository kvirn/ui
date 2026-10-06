import { createComponentStore } from '../store/create-component-store.ts'
import type { ComponentStore } from '../store/create-component-store.ts'
import {
  addMonths,
  clampIsoDate,
  getYearMonth,
  isValidIsoDate,
  maximumIsoDate,
  minimumIsoDate,
  toIsoDate,
} from '../calendar-date/calendar-date.ts'
import type { IsoDate, IsoWeekday, YearMonth } from '../calendar-date/calendar-date.ts'
import type { Direction } from '../locale/resolve-direction.ts'
import { getCalendarKeyTarget } from './calendar-keys.ts'
import {
  chooseRangeDate,
  getDayAvailability,
  getRangeEndAvailability,
  getRangePosition,
  getRangeStep,
  getVisibleRange,
} from './calendar-range.ts'
import type {
  CalendarDayAvailability,
  DateRange,
  DateRangeRules,
  RangeChoiceReason,
  RangeEndAvailability,
  RangePosition,
  RangeSelects,
  RangeStep,
} from './calendar-range.ts'

export type CalendarMonthChangeReason = 'key' | 'button' | 'focus' | 'configure'

export interface CalendarMonthChange extends YearMonth {
  reason: CalendarMonthChangeReason
}

export type { CalendarDayAvailability }
export { getDayAvailability }

export type CalendarMode = 'single' | 'range'

export interface CalendarState {
  /** The first month shown; with `visibleMonths` 2 the second grid is the month after. */
  visibleMonth: YearMonth
  visibleMonths: 1 | 2
  mode: CalendarMode
  /** The day with the roving tabindex: always inside `minimum`–`maximum`, always in a shown month. */
  focusedDate: IsoDate
  selectedDate: IsoDate | undefined
  /** Range mode: the stored value, `''` for none. Read it through `getRange`, which hides an end before the start. */
  rangeStart: IsoDate
  rangeEnd: IsoDate
  selects: RangeSelects
  minimumDays: number | undefined
  maximumDays: number | undefined
  allowUnavailableInRange: boolean
  /** The day under the pointer or focus while the end is pending: drawn, never announced. */
  previewDate: IsoDate | undefined
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
  mode?: CalendarMode | undefined
  visibleMonths?: 1 | 2 | undefined
  selects?: RangeSelects | undefined
  minimumDays?: number | undefined
  maximumDays?: number | undefined
  allowUnavailableInRange?: boolean | undefined
}

export interface CalendarRangeChange {
  reason: RangeChoiceReason
  step: RangeStep
  endCleared: boolean
}

export interface CalendarOptions extends CalendarSettings {
  /** Today in the provider's time zone: the core never reads a clock. */
  today: IsoDate
  /** The selected day. Focus starts here, else on the focus request, else on today. */
  selected?: IsoDate | undefined
  /** Range mode: focus starts on the start, else the end, else the focus request, else today. */
  range?: DateRange | undefined
  /** The day to focus first, such as a typed date. Used when there is no `selected`. */
  focused?: IsoDate | undefined
  onVisibleMonthChange?: ((change: CalendarMonthChange) => void) | undefined
  /** An available day was chosen. */
  onSelect?: ((date: IsoDate) => void) | undefined
  /** Range mode: a press changed the range. Not called for a press that is ignored. */
  onRangeChange?: ((range: DateRange, change: CalendarRangeChange) => void) | undefined
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
  /**
   * Choose a day. Nothing happens for an unavailable day or one outside the range. In range mode
   * it is a press: it sets the start, the end or a new start (`chooseRangeDate`).
   */
  select: (date: IsoDate) => void
  setSelected: (date: IsoDate | undefined) => void
  /** Range mode: set the value without a callback, such as a typed one. Invalid dates become `''`. */
  setRange: (range: DateRange) => void
  setPreviewDate: (date: IsoDate | undefined) => void
  /** New range, week start, direction or predicate. The focused day is kept inside the range. */
  configure: (settings: CalendarSettings) => void
}

export type CalendarStore = ComponentStore<CalendarState, CalendarActions> & {
  /** Whether `showMonth(months)` would change the month: the month buttons' `aria-disabled`. */
  canShowMonth: (months: number) => boolean
  getDayAvailability: (date: IsoDate) => CalendarDayAvailability
  /** The months shown, the first one first. */
  getShownMonths: () => YearMonth[]
  /** The value as shown: an end before the start is dropped. */
  getRange: () => DateRange
  getRangeStep: () => RangeStep
  /** Whether `date` can be the end now: the reason it can't, for a day's name or `aria-disabled`. */
  getEndAvailability: (date: IsoDate) => RangeEndAvailability
  /** How a day is drawn, with the preview included when its day could be the end. */
  getDayRangePosition: (date: IsoDate) => RangePosition | undefined
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

function fromMonthKey(key: number): YearMonth {
  return { year: Math.floor(key / 12), month: (key % 12) + 1 }
}

function clampView(
  first: number,
  count: number,
  minimum: IsoDate | undefined,
  maximum: IsoDate | undefined,
): number {
  const last = monthKey(getYearMonth(maximum ?? maximumIsoDate)) - (count - 1)
  return Math.max(Math.min(first, last), monthKey(getYearMonth(minimum ?? minimumIsoDate)))
}

/** The first shown month once focus is in `focusKey`: the view moves by one month only when focus leaves it. */
function getViewStart(
  focusKey: number,
  visibleKey: number,
  count: number,
  minimum: IsoDate | undefined,
  maximum: IsoDate | undefined,
): number {
  let first = focusKey
  if (focusKey >= visibleKey && focusKey < visibleKey + count) first = visibleKey
  else if (focusKey === visibleKey + count) first = focusKey - (count - 1)
  return clampView(first, count, minimum, maximum)
}

function toRules(
  state: CalendarState,
  isDateUnavailable: ((date: IsoDate) => boolean) | undefined,
): DateRangeRules {
  return {
    minimumDays: state.minimumDays,
    maximumDays: state.maximumDays,
    allowUnavailableInRange: state.allowUnavailableInRange,
    minimum: state.minimum,
    maximum: state.maximum,
    isDateUnavailable,
  }
}

function validOrUndefined(date: IsoDate | undefined): IsoDate | undefined {
  return date !== undefined && isValidIsoDate(date) ? date : undefined
}

function validOrEmpty(date: IsoDate | undefined): IsoDate {
  return date !== undefined && isValidIsoDate(date) ? date : ''
}

function assertRange(minimum: IsoDate | undefined, maximum: IsoDate | undefined): void {
  if (minimum !== undefined && maximum !== undefined && minimum > maximum) {
    throw new RangeError(`The minimum ${minimum} is after the maximum ${maximum}`)
  }
}

function assertDays(minimumDays: number | undefined, maximumDays: number | undefined): void {
  if (
    (minimumDays !== undefined && !(minimumDays >= 1)) ||
    (maximumDays !== undefined && !(maximumDays >= 1)) ||
    (minimumDays !== undefined && maximumDays !== undefined && minimumDays > maximumDays)
  ) {
    throw new RangeError(
      `minimumDays ${minimumDays} and maximumDays ${maximumDays} are not 1 or more, in order`,
    )
  }
}

/** The store trusts its caller: pass `weekStart` through `resolveWeekStart`, and a range whose minimum is not after its maximum (else it throws a RangeError). */
export function createCalendar(options: CalendarOptions): CalendarStore {
  let isDateUnavailable = options.isDateUnavailable
  const { onVisibleMonthChange, onSelect, onRangeChange } = options
  const minimum = validOrUndefined(options.minimum)
  const maximum = validOrUndefined(options.maximum)
  assertRange(minimum, maximum)
  assertDays(options.minimumDays, options.maximumDays)
  const mode = options.mode ?? 'single'
  const initialRange = getVisibleRange({
    start: validOrEmpty(options.range?.start),
    end: validOrEmpty(options.range?.end),
  })
  const selectedDate = validOrUndefined(options.selected)
  const rangeFocus = initialRange.start || initialRange.end || undefined
  const startDate =
    (mode === 'range' ? rangeFocus : selectedDate) ??
    validOrUndefined(options.focused) ??
    options.today
  const focusedDate = clampIsoDate(startDate, minimum, maximum)
  const initialMonths = options.visibleMonths ?? 1

  const store = createComponentStore<CalendarState, CalendarActions>(
    {
      visibleMonth: fromMonthKey(
        clampView(monthKey(getYearMonth(focusedDate)), initialMonths, minimum, maximum),
      ),
      visibleMonths: initialMonths,
      mode,
      focusedDate,
      selectedDate,
      rangeStart: validOrEmpty(options.range?.start),
      rangeEnd: validOrEmpty(options.range?.end),
      selects: options.selects ?? 'both',
      minimumDays: options.minimumDays,
      maximumDays: options.maximumDays,
      allowUnavailableInRange: options.allowUnavailableInRange ?? false,
      previewDate: undefined,
      minimum,
      maximum,
      weekStart: options.weekStart ?? 1,
      direction: options.direction ?? 'ltr',
    },
    ({ getState, update }) => {
      const moveFocus = (date: IsoDate, reason: CalendarMonthChangeReason, firstMonth?: number) => {
        const { minimum: lowest, maximum: highest, visibleMonth, visibleMonths } = getState()
        const next = clampIsoDate(date, lowest, highest)
        const nextKey = monthKey(getYearMonth(next))
        const shownKey =
          firstMonth !== undefined && nextKey >= firstMonth && nextKey < firstMonth + visibleMonths
            ? firstMonth
            : getViewStart(nextKey, monthKey(visibleMonth), visibleMonths, lowest, highest)
        const nextMonth = fromMonthKey(shownKey)
        update((state) => ({ ...state, focusedDate: next, visibleMonth: nextMonth }))
        if (shownKey !== monthKey(visibleMonth)) {
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
          const {
            focusedDate: current,
            visibleMonth,
            visibleMonths,
            minimum: lowest,
            maximum: highest,
          } = getState()
          moveFocus(
            addMonths(current, months),
            'button',
            clampView(monthKey(visibleMonth) + months, visibleMonths, lowest, highest),
          )
        },
        select: (date) => {
          const { minimum: lowest, maximum: highest, mode: currentMode } = getState()
          if (!isValidIsoDate(date)) return
          if (currentMode === 'range') {
            const state = getState()
            const choice = chooseRangeDate(
              { start: state.rangeStart, end: state.rangeEnd },
              date,
              state.selects,
              toRules(state, isDateUnavailable),
            )
            if (choice.reason === 'ignored') return
            update((current) => ({
              ...current,
              rangeStart: choice.range.start,
              rangeEnd: choice.range.end,
            }))
            onRangeChange?.(choice.range, {
              reason: choice.reason,
              step: choice.step,
              endCleared: choice.endCleared,
            })
            return
          }
          if (
            getDayAvailability(date, { minimum: lowest, maximum: highest, isDateUnavailable }) !==
            'available'
          ) {
            return
          }
          update((state) => ({ ...state, selectedDate: date }))
          onSelect?.(date)
        },
        setRange: (range) => {
          update((state) => ({
            ...state,
            rangeStart: validOrEmpty(range.start),
            rangeEnd: validOrEmpty(range.end),
          }))
        },
        setPreviewDate: (date) => {
          update((state) => ({ ...state, previewDate: validOrUndefined(date) }))
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
          const lowestDays = 'minimumDays' in settings ? settings.minimumDays : before.minimumDays
          const highestDays = 'maximumDays' in settings ? settings.maximumDays : before.maximumDays
          assertDays(lowestDays, highestDays)
          update((state) => ({
            ...state,
            minimum: lowest,
            maximum: highest,
            weekStart: settings.weekStart ?? state.weekStart,
            direction: settings.direction ?? state.direction,
            mode: settings.mode ?? state.mode,
            visibleMonths: settings.visibleMonths ?? state.visibleMonths,
            selects: settings.selects ?? state.selects,
            minimumDays: lowestDays,
            maximumDays: highestDays,
            allowUnavailableInRange:
              settings.allowUnavailableInRange ?? state.allowUnavailableInRange,
          }))
          moveFocus(before.focusedDate, 'configure')
        },
      }
    },
  )

  const getRange = (): DateRange => {
    const { rangeStart, rangeEnd } = store.getState()
    return getVisibleRange({ start: rangeStart, end: rangeEnd })
  }
  const getRules = () => toRules(store.getState(), isDateUnavailable)
  const getEndAvailability = (date: IsoDate): RangeEndAvailability =>
    getRangeEndAvailability(date, getRange().start, getRules())

  return {
    ...store,
    canShowMonth: (months) => {
      const { visibleMonth, visibleMonths, minimum: lowest, maximum: highest } = store.getState()
      return (
        clampView(monthKey(visibleMonth) + months, visibleMonths, lowest, highest) !==
        monthKey(visibleMonth)
      )
    },
    getDayAvailability: (date) => {
      const { minimum: lowest, maximum: highest } = store.getState()
      return getDayAvailability(date, { minimum: lowest, maximum: highest, isDateUnavailable })
    },
    getShownMonths: () => {
      const { visibleMonth, visibleMonths } = store.getState()
      return Array.from({ length: visibleMonths }, (_, offset) =>
        fromMonthKey(monthKey(visibleMonth) + offset),
      )
    },
    getRange,
    getRangeStep: () => getRangeStep(getRange()),
    getEndAvailability,
    getDayRangePosition: (date) => {
      const { selects, previewDate } = store.getState()
      const canPreview =
        previewDate !== undefined &&
        selects !== 'start' &&
        getRangeStep(getRange()) === 'end' &&
        getEndAvailability(previewDate) === 'available'
      return getRangePosition(date, getRange(), canPreview ? previewDate : undefined)
    },
  }
}
