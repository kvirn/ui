import {
  createCalendar,
  isWeekStart,
  getDayAvailability,
  getIsoWeek,
  getMonthWeeks,
  getTodayIsoDate,
  getWeekdayOrder,
  isValidIsoDate,
  parseIsoDate,
} from '@kvirn-ui/core'
import type { CalendarStore, IsoDate, IsoWeekday, WeekStart, YearMonth } from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent, RefCallback } from 'react'
import { useQuietAnnouncer, warnAnnouncerMissing } from '../announcer/use-announcer.ts'
import { warnOnce } from '../dev/dev-warning.ts'
import { useDateSettings } from '../provider/use-date-settings.ts'
import { useLocale } from '../provider/use-locale.ts'
import { useMessages } from '../provider/use-messages.ts'
import { useStoreSelector } from '../store/use-store-selector.ts'
import { createCalendarFormatters, resolveIntlLocale } from './calendar-intl.ts'

export type { IsoDate, WeekStart } from '@kvirn-ui/core'

export interface UseCalendarOptions {
  /** Controlled: the chosen day, `YYYY-MM-DD`, or `''` for none. Pair it with `onValueChange`. */
  value?: IsoDate | undefined
  /** Uncontrolled: the day chosen at first, `YYYY-MM-DD`. */
  defaultValue?: IsoDate | undefined
  /**
   * The day the grid opens on when none is chosen, such as a date the user typed. Else today.
   * Read once, when the Calendar mounts.
   */
  defaultFocusedDate?: IsoDate | undefined
  /** Called with the day when an available day is chosen (click, Enter or Space). */
  onValueChange?: ((date: IsoDate) => void) | undefined
  /** The first day that can be chosen, `YYYY-MM-DD`. Keys and the month buttons stop here. */
  minimum?: IsoDate | undefined
  /** The last day that can be chosen, `YYYY-MM-DD`. */
  maximum?: IsoDate | undefined
  /**
   * A day inside the range that can't be chosen. It stays focusable, drawn struck through, with
   * `aria-disabled`. Say why in `getDateDescription`.
   */
  isDateUnavailable?: ((date: IsoDate) => boolean) | undefined
  /** Extra words for a day's name, such as why it is unavailable: `Recycling centre closed`. */
  getDateDescription?: ((date: IsoDate) => string | undefined) | undefined
  /**
   * The first day of the week, `1` (Monday) to `7` (Sunday). Else the provider's, else the
   * locale's when it names a region, else Monday.
   */
  weekStart?: WeekStart | undefined
  /**
   * Shows the ISO 8601 week number before each week. Only with a Monday start: another start
   * hides them and warns in development, because a Sunday row spans two ISO weeks.
   */
  weekNumbers?: boolean | undefined
  /** Today, `YYYY-MM-DD`. Else read from the clock in the provider's time zone, once, on mount. */
  today?: IsoDate | undefined
  /**
   * Announces the new month after a month or year button, and "{date} selected" after a day is
   * chosen, through the shared Announcer (4.1.3). Set `false` when your own markup says it.
   * Default `true`.
   */
  announce?: boolean | undefined
  /** Per-instance message overrides: `{ previousMonth: 'Förra månaden' }`. */
  messages?: Partial<KvirnMessages['calendar']> | undefined
}

/** Spread on the Root's element. */
export interface CalendarRootPartProps {
  /** The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-calendar`. */
  className: 'kv-calendar'
}

/** Spread on the Heading's element (an `<h3>` by default). */
export interface CalendarHeadingPartProps {
  className: 'kv-calendar-heading'
  /** Names the grid. */
  id: string
  /** The language of the month name when the browser had to write it in another (3.1.2). */
  lang?: string
}

/** Spread on a month or year button. It stays focusable at the edge of the range. */
export interface CalendarStepPartProps {
  className:
    | 'kv-calendar-previous-month'
    | 'kv-calendar-next-month'
    | 'kv-calendar-previous-year'
    | 'kv-calendar-next-year'
  type: 'button'
  'aria-label': string
  /** At the edge of the range. Not native `disabled`: that would drop focus to `body`. */
  'aria-disabled'?: 'true'
  'data-disabled'?: ''
  onClick: () => void
}

/** Spread on the line above the grid that says the range. Present only with a minimum or maximum. */
export interface CalendarRangeHintPartProps {
  className: 'kv-calendar-range'
  /** The grid's description. */
  id: string
}

/** Spread on the `<table>`. */
export interface CalendarGridPartProps {
  className: 'kv-calendar-grid'
  role: 'grid'
  'aria-labelledby': string
  'aria-describedby'?: string
}

/** Spread on a `<td>`: one day. `children` is the day number. */
export interface CalendarDayPartProps {
  className: 'kv-calendar-day'
  role: 'gridcell'
  /** `0` on the focused day, `-1` on the others: the grid is one Tab stop. */
  tabIndex: 0 | -1
  /** `Wednesday 14 October 2026, today, <description>`. */
  'aria-label': string
  'aria-selected'?: 'true'
  'aria-current'?: 'date'
  /** An unavailable day, or one outside the range. */
  'aria-disabled'?: 'true'
  'data-today'?: ''
  'data-selected'?: ''
  'data-unavailable'?: ''
  'data-outside-range'?: ''
  ref: RefCallback<HTMLTableCellElement>
  onClick: () => void
  onFocus: () => void
  onKeyDown: (event: KeyboardEvent<HTMLTableCellElement>) => void
}

export interface CalendarWeekday {
  weekday: IsoWeekday
  /** `mån`: visible, hidden from assistive technology. */
  short: string
  /** `måndag`: visually hidden, read by assistive technology. */
  long: string
}

export interface CalendarDay {
  date: IsoDate
  dayOfMonth: number
}

export interface CalendarWeek {
  /** The first day in the row: a stable React key. */
  key: IsoDate
  /** The ISO week. `undefined` unless `weekNumbers` is on and the week starts Monday. */
  weekNumber: number | undefined
  /** `Week 42`: the row header's accessible name. */
  weekName: string | undefined
  /** Seven cells: `undefined` before the 1st and after the last day of the month. */
  days: (CalendarDay | undefined)[]
}

export interface UseCalendarResult {
  rootProps: CalendarRootPartProps
  headingProps: CalendarHeadingPartProps
  /** `October 2026`. */
  headingText: string
  previousMonthProps: CalendarStepPartProps
  nextMonthProps: CalendarStepPartProps
  /** For the optional year buttons. */
  previousYearProps: CalendarStepPartProps
  nextYearProps: CalendarStepPartProps
  rangeHintProps: CalendarRangeHintPartProps
  /** `Dates from 1 October 2026 to 31 December 2026`. `undefined` without a minimum or maximum. */
  rangeHint: string | undefined
  gridProps: CalendarGridPartProps
  /** Column headers, in the order of the week start. */
  weekdays: CalendarWeekday[]
  /** Whether a week-number column is shown. */
  hasWeekNumbers: boolean
  /** The column header over the week numbers: `Wk` (visible) and `Week` (read). */
  weekHeader: { short: string; long: string }
  /** The weeks of the visible month, for your own markup. */
  weeks: CalendarWeek[]
  /** The props for the `<td>` of a day in `weeks`. */
  getDayProps: (date: IsoDate) => CalendarDayPartProps
  visibleMonth: YearMonth
  /** The day with the Tab stop. */
  focusedDate: IsoDate
  selectedDate: IsoDate | undefined
  /** The language of the written months and weekdays when it isn't the provider's (3.1.2). */
  dateLanguage: string | undefined
}

/**
 * A calendar's behaviour for your own markup (contract: calendar.a11y.md): the visible month, one
 * Tab stop on a roving day, the date keys, and the names of days, weeks and buttons from the
 * locale. A month is `weeks`; spread `getDayProps(date)` on each day's `<td>`.
 *
 * @example
 * const calendar = useCalendar({ value, onValueChange: setValue })
 * <table {...calendar.gridProps}>…{calendar.weeks.map((week) => …)}</table>
 */
export function useCalendar({
  value,
  defaultValue,
  defaultFocusedDate,
  onValueChange,
  minimum,
  maximum,
  isDateUnavailable,
  getDateDescription,
  weekStart: weekStartOption,
  weekNumbers = false,
  today: todayOption,
  announce = true,
  messages,
}: UseCalendarOptions = {}): UseCalendarResult {
  const calendarMessages = useMessages('calendar', messages)
  const { locale, dir } = useLocale()
  const { timeZone, weekStart: settingsWeekStart } = useDateSettings()
  const weekStart = isWeekStart(weekStartOption) ? weekStartOption : settingsWeekStart
  const { announce: say, isAvailable } = useQuietAnnouncer()
  const id = useId()
  const headingId = `${id}-heading`
  const rangeHintId = `${id}-range`

  const isControlled = value !== undefined
  const [today] = useState(() => todayOption ?? getTodayIsoDate(timeZone, new Date()))

  const [store] = useState<CalendarStore>(() =>
    createCalendar({
      today,
      selected: value ?? defaultValue,
      focused: defaultFocusedDate,
      minimum,
      maximum,
      weekStart,
      direction: dir,
    }),
  )
  const state = useStoreSelector(store, (current) => current)

  const cellElements = useRef(new Map<IsoDate, HTMLElement>())
  const shouldFocusCell = useRef(false)

  useEffect(() => {
    const current = store.getState()
    if (
      current.minimum !== minimum ||
      current.maximum !== maximum ||
      current.weekStart !== weekStart ||
      current.direction !== dir
    ) {
      const hadFocus = cellElements.current.get(current.focusedDate) === document.activeElement
      store.actions.configure({ minimum, maximum, weekStart, direction: dir })
      // A new range can move the focused day to another month, and its old cell unmounts.
      shouldFocusCell.current = hadFocus && store.getState().focusedDate !== current.focusedDate
    }
  }, [store, minimum, maximum, weekStart, dir])

  // A controlled value that changes while mounted moves the Tab stop and the month to it.
  useEffect(() => {
    if (value !== undefined && isValidIsoDate(value) && value !== store.getState().focusedDate) {
      store.actions.focusDate(value)
    }
  }, [store, value])

  const intlLocale = useMemo(() => resolveIntlLocale(locale), [locale])
  const formatters = useMemo(() => createCalendarFormatters(intlLocale), [intlLocale])
  const dateLanguage = intlLocale === locale ? undefined : intlLocale

  const selectedDate = isControlled
    ? isValidIsoDate(value)
      ? value
      : undefined
    : state.selectedDate
  const hasWeekNumbers = weekNumbers && weekStart === 1

  useEffect(() => {
    if (weekNumbers && weekStart !== 1) {
      warnOnce(
        'calendar-week-numbers-need-monday',
        'A Calendar has weekNumbers but the week starts on another day than Monday, so the week numbers are hidden: a row that starts on Sunday spans two ISO weeks. Use weekStart={1}, or leave weekNumbers off.',
      )
    }
  }, [weekNumbers, weekStart])

  // The announcement and the focus after a key both wait for the render that shows the new day.
  useLayoutEffect(() => {
    if (shouldFocusCell.current) {
      shouldFocusCell.current = false
      cellElements.current.get(state.focusedDate)?.focus()
    }
  })

  const sayText = (text: string) => {
    if (!announce) {
      return
    }
    if (isAvailable) {
      say(text, { throttleMilliseconds: 0 })
    } else {
      warnAnnouncerMissing()
    }
  }

  const getAvailability = (date: IsoDate) =>
    getDayAvailability(date, {
      minimum: state.minimum,
      maximum: state.maximum,
      isDateUnavailable,
    })

  const select = (date: IsoDate) => {
    if (getAvailability(date) !== 'available') {
      return
    }
    store.actions.select(date)
    onValueChange?.(date)
    sayText(calendarMessages.selected({ date: formatters.fullDate(date) }))
  }

  const getStepProps = (
    className: CalendarStepPartProps['className'],
    label: string,
    months: number,
  ): CalendarStepPartProps => {
    const isAtEdge = !store.canShowMonth(months)
    return {
      className,
      type: 'button',
      'aria-label': label,
      ...(isAtEdge ? { 'aria-disabled': 'true' as const, 'data-disabled': '' as const } : {}),
      onClick: () => {
        if (isAtEdge) {
          return
        }
        store.actions.showMonth(months)
        sayText(formatters.month(store.getState().visibleMonth))
      },
    }
  }

  const rangeHint =
    state.minimum === undefined && state.maximum === undefined
      ? undefined
      : calendarMessages.rangeHint({
          min: state.minimum === undefined ? undefined : formatters.longDate(state.minimum),
          max: state.maximum === undefined ? undefined : formatters.longDate(state.maximum),
        })

  const weekdays = getWeekdayOrder(weekStart).map((weekday) => ({
    weekday,
    short: formatters.weekday(weekday, 'short'),
    long: formatters.weekday(weekday, 'long'),
  }))

  const weeks = getMonthWeeks(state.visibleMonth, weekStart).map((row): CalendarWeek => {
    const firstDate = row.find((date) => date !== undefined)
    const weekNumber =
      hasWeekNumbers && firstDate !== undefined ? getIsoWeek(firstDate).week : undefined
    return {
      key: firstDate ?? `${state.visibleMonth.year}-${state.visibleMonth.month}`,
      weekNumber,
      weekName:
        weekNumber === undefined ? undefined : calendarMessages.weekName({ week: weekNumber }),
      days: row.map((date) =>
        date === undefined ? undefined : { date, dayOfMonth: parseIsoDate(date)?.day ?? 0 },
      ),
    }
  })

  const getDayProps = (date: IsoDate): CalendarDayPartProps => {
    const availability = getAvailability(date)
    const isToday = date === today
    const isSelected = date === selectedDate
    return {
      className: 'kv-calendar-day',
      role: 'gridcell',
      tabIndex: date === state.focusedDate ? 0 : -1,
      'aria-label': calendarMessages.dayName({
        date: formatters.fullDate(date),
        isToday,
        description: getDateDescription?.(date),
      }),
      ...(isSelected ? { 'aria-selected': 'true' as const, 'data-selected': '' as const } : {}),
      ...(isToday ? { 'aria-current': 'date' as const, 'data-today': '' as const } : {}),
      ...(availability === 'available' ? {} : { 'aria-disabled': 'true' as const }),
      ...(availability === 'unavailable' ? { 'data-unavailable': '' as const } : {}),
      ...(availability === 'outside-range' ? { 'data-outside-range': '' as const } : {}),
      ref: (element) => {
        if (element === null) {
          cellElements.current.delete(date)
        } else {
          cellElements.current.set(date, element)
        }
      },
      onClick: () => select(date),
      onFocus: () => {
        if (store.getState().focusedDate !== date) {
          store.actions.focusDate(date)
        }
      },
      onKeyDown: (event) => {
        if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
          return
        }
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          select(date)
          return
        }
        const before = store.getState().focusedDate
        if (store.actions.handleKey(event.key, event.shiftKey)) {
          event.preventDefault()
          shouldFocusCell.current = store.getState().focusedDate !== before
        }
      },
    }
  }

  return {
    rootProps: { className: 'kv-calendar' },
    headingProps: {
      className: 'kv-calendar-heading',
      id: headingId,
      ...(dateLanguage === undefined ? {} : { lang: dateLanguage }),
    },
    headingText: formatters.month(state.visibleMonth),
    previousMonthProps: getStepProps(
      'kv-calendar-previous-month',
      calendarMessages.previousMonth,
      -1,
    ),
    nextMonthProps: getStepProps('kv-calendar-next-month', calendarMessages.nextMonth, 1),
    previousYearProps: getStepProps(
      'kv-calendar-previous-year',
      calendarMessages.previousYear,
      -12,
    ),
    nextYearProps: getStepProps('kv-calendar-next-year', calendarMessages.nextYear, 12),
    rangeHintProps: { className: 'kv-calendar-range', id: rangeHintId },
    rangeHint,
    gridProps: {
      className: 'kv-calendar-grid',
      role: 'grid',
      'aria-labelledby': headingId,
      ...(rangeHint === undefined ? {} : { 'aria-describedby': rangeHintId }),
    },
    weekdays,
    hasWeekNumbers,
    weekHeader: {
      short: calendarMessages.weekHeader,
      long: calendarMessages.weekHeaderLong,
    },
    weeks,
    getDayProps,
    visibleMonth: state.visibleMonth,
    focusedDate: state.focusedDate,
    selectedDate,
    dateLanguage,
  }
}
