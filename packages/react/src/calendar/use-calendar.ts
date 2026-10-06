import {
  chooseRangeDate,
  countDays,
  createCalendar,
  isWeekStart,
  getDayAvailability,
  getIsoWeek,
  getMonthWeeks,
  getRangeEndAvailability,
  getRangePosition,
  getRangeStep,
  getTodayIsoDate,
  getVisibleRange,
  getWeekdayOrder,
  isValidIsoDate,
  parseIsoDate,
} from '@kvirn-ui/core'
import type {
  CalendarRangeChange,
  CalendarStore,
  DateRange,
  DateRangeRules,
  IsoDate,
  IsoWeekday,
  RangeSelects,
  RangeStep,
  WeekStart,
  YearMonth,
} from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { FocusEvent, KeyboardEvent, RefCallback } from 'react'
import { useQuietAnnouncer, warnAnnouncerMissing } from '../announcer/use-announcer.ts'
import { warnOnce } from '../dev/dev-warning.ts'
import { useDateSettings } from '../provider/use-date-settings.ts'
import { useLocale } from '../provider/use-locale.ts'
import { useMessages } from '../provider/use-messages.ts'
import { useStoreSelector } from '../store/use-store-selector.ts'
import { createCalendarFormatters, resolveIntlLocale } from './calendar-intl.ts'
import { useWideViewport } from './use-wide-viewport.ts'

export type {
  CalendarRangeChange,
  DateRange,
  IsoDate,
  RangeSelects,
  WeekStart,
} from '@kvirn-ui/core'

export interface UseCalendarBaseOptions {
  /**
   * The day the grid opens on when none is chosen, such as a date the user typed. Else today.
   * Read once, when the Calendar mounts.
   */
  defaultFocusedDate?: IsoDate | undefined
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
   * Announces the new month after a month or year button, and what a press did after a day is
   * chosen ("{date} selected"; in a range, the start and the finished range), through the shared
   * Announcer (4.1.3). Set `false` when your own markup says it. Default `true`.
   */
  announce?: boolean | undefined
  /**
   * The most months shown side by side, `1` or `2`. Two months show only from 64rem wide (the
   * Calendar reads the viewport), one below it and on the server, so it never breaks a 320px
   * screen or 400% zoom. Default `1`.
   */
  visibleMonths?: 1 | 2 | undefined
  /** Per-instance message overrides: `{ previousMonth: 'Förra månaden' }`. */
  messages?: Partial<KvirnMessages['calendar']> | undefined
}

export interface UseCalendarSingleOptions extends UseCalendarBaseOptions {
  mode?: 'single' | undefined
  /** Controlled: the chosen day, `YYYY-MM-DD`, or `''` for none. Pair it with `onValueChange`. */
  value?: IsoDate | undefined
  /** Uncontrolled: the day chosen at first, `YYYY-MM-DD`. */
  defaultValue?: IsoDate | undefined
  /** Called with the day when an available day is chosen (click, Enter or Space). */
  onValueChange?: ((date: IsoDate) => void) | undefined
}

export interface UseCalendarRangeOptions extends UseCalendarBaseOptions {
  /** Choose a start and an end: two ordinary presses, no extra keys. */
  mode: 'range'
  /**
   * Controlled: `{ start, end }`, `''` for a day not chosen. A start only and an end only are
   * valid; an end before the start shows as the start alone. Pair it with `onValueChange`.
   */
  value?: DateRange | undefined
  /** Uncontrolled: the range chosen at first. */
  defaultValue?: DateRange | undefined
  /**
   * Called after every press that changed the range, so a start alone is reported at once. The
   * second argument says what the press did: `step` is `complete` when the range is finished.
   */
  onValueChange?: ((range: DateRange, change: CalendarRangeChange) => void) | undefined
  /**
   * Which end a press sets. `both` (default): the start, then the end. `start` or `end`: one end
   * of a from/to pair of Calendars sharing one range.
   */
  selects?: RangeSelects | undefined
  /** The fewest days, counting both ends (a one-day range is 1). Else no minimum. */
  minimumDays?: number | undefined
  /** The most days, counting both ends. A booking of 14 nights is `15`. Else no maximum. */
  maximumDays?: number | undefined
  /** A range may pass over an unavailable day (leave across a holiday). Default `false`: it blocks. */
  allowUnavailableInRange?: boolean | undefined
}

export type UseCalendarOptions = UseCalendarSingleOptions | UseCalendarRangeOptions

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

/**
 * Spread on the lines above the grid: the range in words, and in range mode the span limits and
 * the next step. Present only when there is a line to say.
 */
export interface CalendarRangeHintPartProps {
  className: 'kv-calendar-range'
  /** The grid's description. */
  id: string
}

/** Spread on the `<table>`. */
export interface CalendarGridPartProps {
  className: 'kv-calendar-grid'
  role: 'grid'
  /** The month's Heading. A grid in a from/to pair gets your own heading's id in front of it. */
  'aria-labelledby': string
  'aria-describedby'?: string
  /** Range mode: more than one day is selected. */
  'aria-multiselectable'?: 'true'
  /** `1` on the second month's grid. */
  'data-offset': 0 | 1
}

/** Spread on a `<td>`: one day. `children` is the day number. */
export interface CalendarDayPartProps {
  className: 'kv-calendar-day'
  role: 'gridcell'
  /** `0` on the focused day, `-1` on the others: the grid is one Tab stop. */
  tabIndex: 0 | -1
  /** `Wednesday 14 October 2026, today, start date, 7 days, <description>`. */
  'aria-label': string
  /** The chosen day, or in range mode every day from the start to the end. */
  'aria-selected'?: 'true'
  'aria-current'?: 'date'
  /** An unavailable day, or one outside the range. */
  'aria-disabled'?: 'true'
  'data-today'?: ''
  'data-selected'?: ''
  'data-unavailable'?: ''
  'data-outside-range'?: ''
  /** Range mode: the start, the end (both on a one-day range), a day between, a previewed day. */
  'data-range-start'?: ''
  'data-range-end'?: ''
  'data-in-range'?: ''
  /** Drawn only: the days up to the day the pointer or focus is on while the end is pending. */
  'data-preview'?: ''
  'data-preview-end'?: ''
  ref: RefCallback<HTMLTableCellElement>
  onClick: () => void
  onFocus: () => void
  onKeyDown: (event: KeyboardEvent<HTMLTableCellElement>) => void
  /** Range mode: the preview follows the pointer and the focus. */
  onPointerEnter?: () => void
  onPointerLeave?: () => void
  onBlur?: (event: FocusEvent<HTMLTableCellElement>) => void
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

/** One month of the view: with two months visible, the second has `offset` 1. */
export interface CalendarMonth {
  visibleMonth: YearMonth
  headingProps: CalendarHeadingPartProps
  /** `October 2026`. */
  headingText: string
  gridProps: CalendarGridPartProps
  weeks: CalendarWeek[]
}

export interface UseCalendarResult {
  rootProps: CalendarRootPartProps
  /** The first month's heading, as `months[0]`. */
  headingProps: CalendarHeadingPartProps
  /** `October 2026`. */
  headingText: string
  previousMonthProps: CalendarStepPartProps
  nextMonthProps: CalendarStepPartProps
  /** For the optional year buttons. */
  previousYearProps: CalendarStepPartProps
  nextYearProps: CalendarStepPartProps
  rangeHintProps: CalendarRangeHintPartProps
  /** The lines in one text: `Dates from 1 October 2026 to 31 December 2026`. `undefined` when there is none. */
  rangeHint: string | undefined
  /**
   * The lines to show: the minimum and maximum, then in range mode the span limits and the next
   * step ("Start date …. Choose the end date.").
   */
  rangeHintLines: string[]
  /** The first month's grid, as `months[0]`. */
  gridProps: CalendarGridPartProps
  /** Column headers, in the order of the week start. */
  weekdays: CalendarWeekday[]
  /** Whether a week-number column is shown. */
  hasWeekNumbers: boolean
  /** The column header over the week numbers: `Wk` (visible) and `Week` (read). */
  weekHeader: { short: string; long: string }
  /** The weeks of the first visible month, for your own markup. */
  weeks: CalendarWeek[]
  /** The months in view: one, or two side by side (`visibleMonths` 2 from 64rem). */
  months: CalendarMonth[]
  /** The props for the `<td>` of a day in `weeks`. */
  getDayProps: (date: IsoDate) => CalendarDayPartProps
  /** The first month in view. */
  visibleMonth: YearMonth
  /** How many months are in view now. */
  visibleMonths: 1 | 2
  /** The day with the Tab stop. */
  focusedDate: IsoDate
  selectedDate: IsoDate | undefined
  /** Range mode: the range as shown (an end before the start is dropped). `undefined` in single mode. */
  range: DateRange | undefined
  /** Range mode: what the next press does. */
  rangeStep: RangeStep | undefined
  /** The language of the written months and weekdays when it isn't the provider's (3.1.2). */
  dateLanguage: string | undefined
}

/**
 * A calendar's behaviour for your own markup (contract: calendar.a11y.md): the visible month, one
 * Tab stop on a roving day, the date keys, and the names of days, weeks and buttons from the
 * locale. A month is `weeks`; spread `getDayProps(date)` on each day's `<td>`. With `mode: 'range'`
 * it chooses a start and an end, with two months side by side from 64rem (`months`).
 *
 * @example
 * const calendar = useCalendar({ value, onValueChange: setValue })
 * <table {...calendar.gridProps}>…{calendar.weeks.map((week) => …)}</table>
 */
export function useCalendar(options: UseCalendarOptions = {}): UseCalendarResult {
  const {
    defaultFocusedDate,
    minimum,
    maximum,
    isDateUnavailable,
    getDateDescription,
    weekStart: weekStartOption,
    weekNumbers = false,
    today: todayOption,
    announce = true,
    visibleMonths: visibleMonthsOption = 1,
    messages,
  } = options
  const rangeOptions = options.mode === 'range' ? options : undefined
  const singleOptions = options.mode === 'range' ? undefined : options
  const isRange = rangeOptions !== undefined
  const value = singleOptions?.value
  const defaultValue = singleOptions?.defaultValue
  const onValueChange = singleOptions?.onValueChange
  const rangeValue = rangeOptions?.value
  const selects = rangeOptions?.selects ?? 'both'
  const requestedMinimumDays = rangeOptions?.minimumDays
  const requestedMaximumDays = rangeOptions?.maximumDays
  // The core throws on a limit below 1 or a minimum above the maximum: drop it and warn instead.
  const areDaysValid =
    (requestedMinimumDays === undefined || requestedMinimumDays >= 1) &&
    (requestedMaximumDays === undefined || requestedMaximumDays >= 1) &&
    (requestedMinimumDays === undefined ||
      requestedMaximumDays === undefined ||
      requestedMinimumDays <= requestedMaximumDays)
  const minimumDays = areDaysValid ? requestedMinimumDays : undefined
  const maximumDays = areDaysValid ? requestedMaximumDays : undefined
  const allowUnavailableInRange = rangeOptions?.allowUnavailableInRange ?? false

  const calendarMessages = useMessages('calendar', messages)
  const { locale, dir } = useLocale()
  const { timeZone, weekStart: settingsWeekStart } = useDateSettings()
  const weekStart = isWeekStart(weekStartOption) ? weekStartOption : settingsWeekStart
  const { announce: say, isAvailable } = useQuietAnnouncer()
  const id = useId()
  const rangeHintId = `${id}-range`
  const isWide = useWideViewport(visibleMonthsOption === 2)
  const visibleMonths = visibleMonthsOption === 2 && isWide ? 2 : 1

  const isControlled = isRange ? rangeValue !== undefined : value !== undefined
  const [today] = useState(() => todayOption ?? getTodayIsoDate(timeZone, new Date()))

  const reportedRangeRef = useRef<DateRange | undefined>(undefined)

  const [store] = useState<CalendarStore>(() =>
    createCalendar({
      today,
      selected: value ?? defaultValue,
      focused: defaultFocusedDate,
      minimum,
      maximum,
      weekStart,
      direction: dir,
      mode: isRange ? 'range' : 'single',
      range: rangeValue ?? rangeOptions?.defaultValue,
      visibleMonths,
      selects,
      minimumDays,
      maximumDays,
      allowUnavailableInRange,
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
      current.direction !== dir ||
      current.mode !== (isRange ? 'range' : 'single') ||
      current.visibleMonths !== visibleMonths ||
      current.selects !== selects ||
      current.minimumDays !== minimumDays ||
      current.maximumDays !== maximumDays ||
      current.allowUnavailableInRange !== allowUnavailableInRange
    ) {
      const hadFocus = cellElements.current.get(current.focusedDate) === document.activeElement
      store.actions.configure({
        minimum,
        maximum,
        weekStart,
        direction: dir,
        mode: isRange ? 'range' : 'single',
        visibleMonths,
        selects,
        minimumDays,
        maximumDays,
        allowUnavailableInRange,
      })
      // A new range or view can move the focused day to another month or grid, and its old cell unmounts.
      shouldFocusCell.current = hadFocus
    }
  }, [
    store,
    minimum,
    maximum,
    weekStart,
    dir,
    isRange,
    visibleMonths,
    selects,
    minimumDays,
    maximumDays,
    allowUnavailableInRange,
  ])

  // The old cell unmounts when the month changes, so focus that was in the grid follows the day.
  const moveTabStop = (date: IsoDate) => {
    const hadFocus =
      cellElements.current.get(store.getState().focusedDate) === document.activeElement
    store.actions.focusDate(date)
    shouldFocusCell.current = hadFocus
  }

  // A controlled value that changes while mounted moves the Tab stop and the month to it.
  useEffect(() => {
    if (value !== undefined && isValidIsoDate(value) && value !== store.getState().focusedDate) {
      moveTabStop(value)
    }
  }, [store, value])

  const rangeValueStart = rangeValue?.start
  const rangeValueEnd = rangeValue?.end

  // A range that changed from outside (a typed field, the other Calendar of a pair) moves the
  // Tab stop and the month to the end this Calendar chooses. A press's own result does not.
  useEffect(() => {
    if (rangeValueStart === undefined || rangeValueEnd === undefined) {
      return
    }
    const reported = reportedRangeRef.current
    reportedRangeRef.current = undefined
    if (reported?.start === rangeValueStart && reported.end === rangeValueEnd) {
      return
    }
    const target =
      selects === 'end' ? rangeValueEnd || rangeValueStart : rangeValueStart || rangeValueEnd
    if (isValidIsoDate(target) && target !== store.getState().focusedDate) {
      moveTabStop(target)
    }
  }, [store, selects, rangeValueStart, rangeValueEnd])

  const intlLocale = useMemo(() => resolveIntlLocale(locale), [locale])
  const formatters = useMemo(() => createCalendarFormatters(intlLocale), [intlLocale])
  const dateLanguage = intlLocale === locale ? undefined : intlLocale

  const selectedDate = isControlled
    ? value !== undefined && isValidIsoDate(value)
      ? value
      : undefined
    : state.selectedDate
  const hasWeekNumbers = weekNumbers && weekStart === 1

  const range = isRange
    ? getVisibleRange(
        isControlled && rangeValue !== undefined
          ? rangeValue
          : { start: state.rangeStart, end: state.rangeEnd },
      )
    : undefined
  const rangeStep = range === undefined ? undefined : getRangeStep(range)
  // Each cell scans from the start to its own day, so the predicate is asked once per day per render.
  const unavailableAnswers = new Map<IsoDate, boolean>()
  const isUnavailableOnce =
    isDateUnavailable === undefined
      ? undefined
      : (date: IsoDate) => {
          let answer = unavailableAnswers.get(date)
          if (answer === undefined) {
            answer = isDateUnavailable(date)
            unavailableAnswers.set(date, answer)
          }
          return answer
        }
  const rangeRules: DateRangeRules = {
    minimumDays,
    maximumDays,
    allowUnavailableInRange,
    minimum: state.minimum,
    maximum: state.maximum,
    isDateUnavailable: isUnavailableOnce,
  }

  useEffect(() => {
    if (!areDaysValid) {
      warnOnce(
        'calendar-range-days-invalid',
        'A Calendar has a minimumDays or maximumDays below 1, or a minimumDays above the maximumDays, so both limits are ignored. A one-day range is 1 day; a booking of 14 nights is maximumDays={15}.',
      )
    }
  }, [areDaysValid])

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

  const getLength = (start: IsoDate, end: IsoDate) => {
    const days = countDays(start, end)
    return calendarMessages.rangeLength({ days, nights: days - 1 })
  }

  const sayRangeChange = (next: DateRange, change: CalendarRangeChange) => {
    switch (change.reason) {
      case 'started':
      case 'restarted-before-start':
      case 'restarted-too-short':
      case 'restarted-too-long':
      case 'restarted-blocked':
        sayText(calendarMessages.rangeChooseEnd({ start: formatters.fullDate(next.start) }))
        return
      case 'completed':
        sayText(
          calendarMessages.rangeSelected({
            start: formatters.fullDate(next.start),
            end: formatters.fullDate(next.end),
            length: getLength(next.start, next.end),
          }),
        )
        return
      case 'end-set':
        sayText(calendarMessages.rangeEndSelected({ date: formatters.fullDate(next.end) }))
        return
      case 'start-set':
        sayText(
          [
            calendarMessages.selected({ date: formatters.fullDate(next.start) }),
            change.endCleared ? calendarMessages.rangeEndCleared : undefined,
          ]
            .filter((part) => part !== undefined)
            .join(' '),
        )
        return
      case 'ignored':
        return
    }
  }

  const select = (date: IsoDate) => {
    if (range !== undefined) {
      const choice = chooseRangeDate(range, date, selects, rangeRules)
      if (choice.reason === 'ignored') {
        return
      }
      const change = { reason: choice.reason, step: choice.step, endCleared: choice.endCleared }
      if (!isControlled) {
        store.actions.setRange(choice.range)
      }
      reportedRangeRef.current = choice.range
      rangeOptions?.onValueChange?.(choice.range, change)
      sayRangeChange(choice.range, change)
      return
    }
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
        const [first, last] = store.getShownMonths()
        sayText(
          first !== undefined && last !== undefined && store.getState().visibleMonths === 2
            ? calendarMessages.visibleMonths({
                first: formatters.month(first),
                last: formatters.month(last),
              })
            : formatters.month(store.getState().visibleMonth),
        )
      },
    }
  }

  const rangeLine =
    state.minimum === undefined && state.maximum === undefined
      ? undefined
      : calendarMessages.rangeHint({
          min: state.minimum === undefined ? undefined : formatters.longDate(state.minimum),
          max: state.maximum === undefined ? undefined : formatters.longDate(state.maximum),
        })
  const spanLine =
    isRange && (minimumDays !== undefined || maximumDays !== undefined)
      ? calendarMessages.rangeSpanHint({ minimum: minimumDays, maximum: maximumDays })
      : undefined
  // A from/to pair has no step line: each Calendar's own heading says which end it chooses.
  const stepLine =
    range === undefined || selects !== 'both'
      ? undefined
      : rangeStep === 'start'
        ? calendarMessages.rangeChooseStart
        : rangeStep === 'end'
          ? calendarMessages.rangeChooseEnd({ start: formatters.fullDate(range.start) })
          : calendarMessages.rangeSelected({
              start: formatters.fullDate(range.start),
              end: formatters.fullDate(range.end),
              length: getLength(range.start, range.end),
            })
  const rangeHintLines = [rangeLine, spanLine, stepLine].filter((line) => line !== undefined)
  const rangeHint = rangeHintLines.length === 0 ? undefined : rangeHintLines.join(' ')

  const weekdays = getWeekdayOrder(weekStart).map((weekday) => ({
    weekday,
    short: formatters.weekday(weekday, 'short'),
    long: formatters.weekday(weekday, 'long'),
  }))

  const getWeeks = (month: YearMonth) =>
    getMonthWeeks(month, weekStart).map((row): CalendarWeek => {
      const firstDate = row.find((date) => date !== undefined)
      const weekNumber =
        hasWeekNumbers && firstDate !== undefined ? getIsoWeek(firstDate).week : undefined
      return {
        key: firstDate ?? `${month.year}-${month.month}`,
        weekNumber,
        weekName:
          weekNumber === undefined ? undefined : calendarMessages.weekName({ week: weekNumber }),
        days: row.map((date) =>
          date === undefined ? undefined : { date, dayOfMonth: parseIsoDate(date)?.day ?? 0 },
        ),
      }
    })

  const months = store.getShownMonths().map((month, index): CalendarMonth => {
    const offset = index === 1 ? 1 : 0
    const headingId = offset === 0 ? `${id}-heading` : `${id}-heading-${offset}`
    return {
      visibleMonth: month,
      headingProps: {
        className: 'kv-calendar-heading',
        id: headingId,
        ...(dateLanguage === undefined ? {} : { lang: dateLanguage }),
      },
      headingText: formatters.month(month),
      gridProps: {
        className: 'kv-calendar-grid',
        role: 'grid',
        'aria-labelledby': headingId,
        ...(rangeHint === undefined ? {} : { 'aria-describedby': rangeHintId }),
        ...(isRange ? { 'aria-multiselectable': 'true' as const } : {}),
        'data-offset': offset,
      },
      weeks: getWeeks(month),
    }
  })
  const firstMonth = months[0] as CalendarMonth

  const getRangeNames = (date: IsoDate) => {
    if (range === undefined) {
      return {
        position: undefined,
        rangePosition: undefined,
        rangeNote: undefined,
        isImpossibleEnd: false,
      }
    }
    const canPreview =
      state.previewDate !== undefined &&
      selects !== 'start' &&
      rangeStep === 'end' &&
      getRangeEndAvailability(state.previewDate, range.start, rangeRules) === 'available'
    const position = getRangePosition(date, range, canPreview ? state.previewDate : undefined)
    const rangePosition =
      position === 'start'
        ? calendarMessages.rangeStart
        : position === 'end'
          ? calendarMessages.rangeEnd
          : position === 'start-end'
            ? calendarMessages.rangeStartAndEnd
            : undefined
    // Only a day that could end the range gets the length, or the reason it can't.
    const isEndCandidate =
      range.start !== '' && (selects === 'end' || (selects === 'both' && rangeStep === 'end'))
    const isChosen =
      position === 'start' ||
      position === 'end' ||
      position === 'start-end' ||
      position === 'in-range'
    const endAvailability =
      isEndCandidate && !isChosen
        ? getRangeEndAvailability(date, range.start, rangeRules)
        : undefined
    const days = endAvailability === 'available' ? countDays(range.start, date) : 0
    const rangeNote =
      endAvailability === 'available'
        ? calendarMessages.rangeLength({ days, nights: days - 1 })
        : endAvailability === 'too-short'
          ? calendarMessages.rangeTooShort({ minimum: minimumDays ?? 0 })
          : endAvailability === 'too-long'
            ? calendarMessages.rangeTooLong({ maximum: maximumDays ?? 0 })
            : endAvailability === 'blocked'
              ? calendarMessages.rangeBlocked
              : endAvailability === 'before-start' && selects === 'end'
                ? calendarMessages.rangeBeforeStart
                : undefined
    const isImpossibleEnd =
      selects === 'end' &&
      (endAvailability === 'before-start' ||
        endAvailability === 'too-short' ||
        endAvailability === 'too-long' ||
        endAvailability === 'blocked')
    return { position, rangePosition, rangeNote, isImpossibleEnd }
  }

  const getDayProps = (date: IsoDate): CalendarDayPartProps => {
    const availability = getAvailability(date)
    const isToday = date === today
    const { position, rangePosition, rangeNote, isImpossibleEnd } = getRangeNames(date)
    const isInRange =
      position === 'start' ||
      position === 'end' ||
      position === 'start-end' ||
      position === 'in-range'
    const isSelected = isRange ? isInRange : date === selectedDate
    const setPreviewDate = (previewDate: IsoDate | undefined) => {
      if (store.getState().previewDate !== previewDate) {
        store.actions.setPreviewDate(previewDate)
      }
    }
    return {
      className: 'kv-calendar-day',
      role: 'gridcell',
      tabIndex: date === state.focusedDate ? 0 : -1,
      'aria-label': calendarMessages.dayName({
        date: formatters.fullDate(date),
        isToday,
        rangePosition,
        rangeNote,
        description: getDateDescription?.(date),
      }),
      ...(isSelected ? { 'aria-selected': 'true' as const } : {}),
      ...(isSelected && (!isRange || position !== 'in-range')
        ? { 'data-selected': '' as const }
        : {}),
      ...(position === 'start' || position === 'start-end'
        ? { 'data-range-start': '' as const }
        : {}),
      ...(position === 'end' || position === 'start-end' ? { 'data-range-end': '' as const } : {}),
      ...(position === 'in-range' ? { 'data-in-range': '' as const } : {}),
      ...(position === 'preview' ? { 'data-preview': '' as const } : {}),
      ...(position === 'preview-end' ? { 'data-preview-end': '' as const } : {}),
      ...(isToday ? { 'aria-current': 'date' as const, 'data-today': '' as const } : {}),
      ...(availability === 'available' && !isImpossibleEnd
        ? {}
        : { 'aria-disabled': 'true' as const }),
      ...(availability === 'unavailable' || isImpossibleEnd
        ? { 'data-unavailable': '' as const }
        : {}),
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
        if (isRange) {
          setPreviewDate(date)
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
      ...(isRange
        ? {
            onPointerEnter: () => setPreviewDate(date),
            onPointerLeave: () => {
              const focused = store.getState().focusedDate
              setPreviewDate(
                cellElements.current.get(focused) === document.activeElement ? focused : undefined,
              )
            },
            onBlur: (event: FocusEvent<HTMLTableCellElement>) => {
              const next = event.relatedTarget
              const staysInGrid = [...cellElements.current.values()].some(
                (element) => element === next,
              )
              if (!staysInGrid) {
                setPreviewDate(undefined)
              }
            },
          }
        : {}),
    }
  }

  return {
    rootProps: { className: 'kv-calendar' },
    headingProps: firstMonth.headingProps,
    headingText: firstMonth.headingText,
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
    rangeHintLines,
    gridProps: firstMonth.gridProps,
    weekdays,
    hasWeekNumbers,
    weekHeader: {
      short: calendarMessages.weekHeader,
      long: calendarMessages.weekHeaderLong,
    },
    weeks: firstMonth.weeks,
    months,
    getDayProps,
    visibleMonth: state.visibleMonth,
    visibleMonths: state.visibleMonths,
    focusedDate: state.focusedDate,
    selectedDate,
    range,
    rangeStep,
    dateLanguage,
  }
}
