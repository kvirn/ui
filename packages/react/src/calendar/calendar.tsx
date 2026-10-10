'use client'
import { Fragment, useContext, useEffect } from 'react'
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { Icon } from '../icon/icon.tsx'
import { mergeProps } from '../merge-props/merge-props.ts'
import { Tooltip } from '../tooltip/tooltip.tsx'
import { CalendarContext } from './calendar-context.ts'
import { useCalendar } from './use-calendar.ts'
import type {
  UseCalendarOptions,
  UseCalendarRangeOptions,
  UseCalendarResult,
  UseCalendarSingleOptions,
} from './use-calendar.ts'

export type { CalendarDay, CalendarMonth, CalendarWeek, CalendarWeekday } from './use-calendar.ts'

type CalendarRootElementProps = Omit<ComponentPropsWithRef<'div'>, 'defaultValue'>

/** One day: `value`, `defaultValue` and `onValueChange` are a date. With `mode="range"` they are a `{ start, end }`. */
export type CalendarRootProps =
  | (CalendarRootElementProps & UseCalendarSingleOptions)
  | (CalendarRootElementProps & UseCalendarRangeOptions)

export interface CalendarHeadingProps extends ComponentPropsWithRef<'h3'> {
  /** `1` for the second month when `visibleMonths` is 2. Renders nothing while one month shows. */
  offset?: 0 | 1 | undefined
}

export type CalendarStepButtonProps = ComponentPropsWithRef<'button'>

export type CalendarRangeHintProps = ComponentPropsWithRef<'p'>

export interface CalendarGridProps extends ComponentPropsWithRef<'table'> {
  /** `1` for the second month when `visibleMonths` is 2. Renders nothing while one month shows. */
  offset?: 0 | 1 | undefined
  /** Your own rows. Without it the grid renders the weekday headers and the weeks. */
  children?: ReactNode
}

function useCalendarContext(partName: string): UseCalendarResult | null {
  const calendar = useContext(CalendarContext)
  useEffect(() => {
    if (calendar === null) {
      warnOnce(
        `calendar-${partName.toLowerCase()}-outside-root`,
        `Calendar.${partName} was rendered outside Calendar.Root, so it renders nothing.`,
      )
    }
  }, [calendar, partName])
  return calendar
}

/**
 * A month as a grid of days, one Tab stop, with the date keys (contract: calendar.a11y.md). Choose
 * a day with a click, Enter or Space. Compose it from its parts; nothing is rendered for you.
 * Needs a `KvirnProvider` to announce a new month and a chosen day.
 *
 * @example
 * <Calendar.Root value={date} onValueChange={setDate} minimum="2026-10-01" maximum="2026-12-31">
 *   <Calendar.PreviousMonth />
 *   <Calendar.Heading />
 *   <Calendar.NextMonth />
 *   <Calendar.RangeHint />
 *   <Calendar.Grid />
 * </Calendar.Root>
 */
export function CalendarRoot({ children, ref, ...otherProps }: CalendarRootProps): ReactElement {
  const {
    mode,
    value,
    defaultValue,
    defaultFocusedDate,
    onValueChange,
    minimum,
    maximum,
    isDateUnavailable,
    getDateDescription,
    weekStart,
    weekNumbers,
    today,
    announce,
    visibleMonths,
    messages,
    selects,
    minimumDays,
    maximumDays,
    allowUnavailableInRange,
    ...elementProps
  } = otherProps as typeof otherProps & Partial<UseCalendarRangeOptions>
  // `mode` picks which of the two value shapes `value`, `defaultValue` and `onValueChange` have.
  const calendar = useCalendar({
    mode,
    value,
    defaultValue,
    defaultFocusedDate,
    onValueChange,
    minimum,
    maximum,
    isDateUnavailable,
    getDateDescription,
    weekStart,
    weekNumbers,
    today,
    announce,
    visibleMonths,
    messages,
    selects,
    minimumDays,
    maximumDays,
    allowUnavailableInRange,
  } as UseCalendarOptions)
  return (
    <CalendarContext.Provider value={calendar}>
      <div {...mergeProps(elementProps, calendar.rootProps)} ref={ref}>
        {children}
      </div>
    </CalendarContext.Provider>
  )
}
CalendarRoot.displayName = 'Calendar.Root'

/** The month and year, `oktober 2026`. It names the grid. An `<h3>`. */
export function CalendarHeading({
  offset = 0,
  children,
  ref,
  ...otherProps
}: CalendarHeadingProps): ReactElement | null {
  const calendar = useCalendarContext('Heading')
  const month = calendar?.months[offset]
  if (calendar === null || month === undefined) {
    return null
  }
  return (
    <h3 {...mergeProps(otherProps, month.headingProps)} ref={ref}>
      {children ?? month.headingText}
    </h3>
  )
}
CalendarHeading.displayName = 'Calendar.Heading'

type StepKey = 'previousMonthProps' | 'nextMonthProps' | 'previousYearProps' | 'nextYearProps'

function useStepButton(
  partName: string,
  propsKey: StepKey,
  { children, ref, ...otherProps }: CalendarStepButtonProps,
  defaultChildren: ReactNode,
): ReactElement | null {
  const calendar = useCalendarContext(partName)
  if (calendar === null) {
    return null
  }
  const stepProps = calendar[propsKey]
  return (
    <Tooltip.Root>
      <Tooltip.Trigger {...mergeProps(otherProps, stepProps)} ref={ref}>
        {children ?? defaultChildren}
      </Tooltip.Trigger>
      <Tooltip.Popup>
        <Tooltip.Name>{stepProps['aria-label']}</Tooltip.Name>
      </Tooltip.Popup>
    </Tooltip.Root>
  )
}

/** Shows the month before. `aria-disabled` at the start of the range, and still focusable. */
export function CalendarPreviousMonth(props: CalendarStepButtonProps): ReactElement | null {
  return useStepButton('PreviousMonth', 'previousMonthProps', props, <Icon name="chevron-back" />)
}
CalendarPreviousMonth.displayName = 'Calendar.PreviousMonth'

/** Shows the month after. `aria-disabled` at the end of the range, and still focusable. */
export function CalendarNextMonth(props: CalendarStepButtonProps): ReactElement | null {
  return useStepButton('NextMonth', 'nextMonthProps', props, <Icon name="chevron-forward" />)
}
CalendarNextMonth.displayName = 'Calendar.NextMonth'

/** Optional. Shows the same month a year before. */
export function CalendarPreviousYear(props: CalendarStepButtonProps): ReactElement | null {
  return useStepButton(
    'PreviousYear',
    'previousYearProps',
    props,
    <>
      <Icon name="chevron-back" />
      <Icon name="chevron-back" />
    </>,
  )
}
CalendarPreviousYear.displayName = 'Calendar.PreviousYear'

/** Optional. Shows the same month a year after. */
export function CalendarNextYear(props: CalendarStepButtonProps): ReactElement | null {
  return useStepButton(
    'NextYear',
    'nextYearProps',
    props,
    <>
      <Icon name="chevron-forward" />
      <Icon name="chevron-forward" />
    </>,
  )
}
CalendarNextYear.displayName = 'Calendar.NextYear'

/**
 * The range in words above the grid, and the grid's description (3.3.2): the minimum and maximum,
 * and in range mode the span limits and the next step, a line each. Renders nothing without a line.
 */
export function CalendarRangeHint({
  children,
  ref,
  ...otherProps
}: CalendarRangeHintProps): ReactElement | null {
  const calendar = useCalendarContext('RangeHint')
  if (calendar === null || calendar.rangeHint === undefined) {
    return null
  }
  return (
    <p {...mergeProps(otherProps, calendar.rangeHintProps)} ref={ref}>
      {children ??
        calendar.rangeHintLines.map((line, index) => (
          <Fragment key={line}>
            {index === 0 ? null : ' '}
            <span className="kv-calendar-range-line">{line}</span>
          </Fragment>
        ))}
    </p>
  )
}
CalendarRangeHint.displayName = 'Calendar.RangeHint'

/**
 * The `<table role="grid">`: weekday headers, an optional week-number column and the weeks, with
 * the focused day as the one Tab stop. For your own rows, give it `children` and use `weeks` and
 * `getDayProps` from `useCalendar`.
 */
export function CalendarGrid({
  offset = 0,
  children,
  ref,
  ...otherProps
}: CalendarGridProps): ReactElement | null {
  const calendar = useCalendarContext('Grid')
  const month = calendar?.months[offset]
  const headingId = month?.headingProps.id
  const describedBy = month?.gridProps['aria-describedby']
  useEffect(() => {
    if (headingId !== undefined && document.getElementById(headingId) === null) {
      warnOnce(
        'calendar-heading-missing',
        'A Calendar.Grid has no Calendar.Heading, so the grid has no accessible name. Render <Calendar.Heading /> in the Calendar.Root (WCAG 4.1.2).',
      )
    }
    if (describedBy !== undefined && document.getElementById(describedBy) === null) {
      warnOnce(
        'calendar-range-hint-missing',
        'A Calendar has a minimum or maximum, or chooses a range, but has no Calendar.RangeHint, so nobody is told which dates can be chosen or what to do next. Render <Calendar.RangeHint /> in the Calendar.Root (WCAG 3.3.2).',
      )
    }
  }, [headingId, describedBy])
  if (calendar === null || month === undefined) {
    return null
  }
  const { 'aria-labelledby': extraLabelledBy, ...gridElementProps } = otherProps
  const labelledBy = [extraLabelledBy, month.gridProps['aria-labelledby']]
    .filter((labelId) => labelId !== undefined && labelId !== '')
    .join(' ')
  return (
    <table
      {...mergeProps(gridElementProps, month.gridProps)}
      aria-labelledby={labelledBy}
      ref={ref}
    >
      {children ?? (
        <>
          <thead>
            <tr>
              {calendar.hasWeekNumbers ? (
                <th scope="col" className="kv-calendar-week-header">
                  <span aria-hidden="true">{calendar.weekHeader.short}</span>
                  <span className="kv-visually-hidden">{calendar.weekHeader.long}</span>
                </th>
              ) : null}
              {calendar.weekdays.map((weekday) => (
                <th key={weekday.weekday} scope="col" className="kv-calendar-weekday">
                  <span aria-hidden="true">{weekday.short}</span>
                  <span className="kv-visually-hidden">{weekday.long}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {month.weeks.map((week) => (
              <tr key={week.key}>
                {week.weekNumber === undefined ? null : (
                  <th scope="row" className="kv-calendar-week-number" aria-label={week.weekName}>
                    {week.weekNumber}
                  </th>
                )}
                {week.days.map((day, index) =>
                  day === undefined ? (
                    <td key={`empty-${index}`} className="kv-calendar-empty" aria-hidden="true" />
                  ) : (
                    <td key={day.date} {...calendar.getDayProps(day.date)}>
                      {day.dayOfMonth}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </>
      )}
    </table>
  )
}
CalendarGrid.displayName = 'Calendar.Grid'

export const Calendar = {
  Root: CalendarRoot,
  Heading: CalendarHeading,
  PreviousMonth: CalendarPreviousMonth,
  NextMonth: CalendarNextMonth,
  PreviousYear: CalendarPreviousYear,
  NextYear: CalendarNextYear,
  RangeHint: CalendarRangeHint,
  Grid: CalendarGrid,
} as const
