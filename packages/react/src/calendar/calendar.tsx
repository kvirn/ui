'use client'
import { useContext, useEffect } from 'react'
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { Icon } from '../icon/icon.tsx'
import { mergeProps } from '../merge-props/merge-props.ts'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { Tooltip } from '../tooltip/tooltip.tsx'
import { CalendarContext } from './calendar-context.ts'
import { useCalendar } from './use-calendar.ts'
import type { UseCalendarOptions, UseCalendarResult } from './use-calendar.ts'

export type { CalendarDay, CalendarWeek, CalendarWeekday } from './use-calendar.ts'

/** What `render` receives as its second argument, for every part. */
export interface CalendarState {
  /** The month the grid shows, `{ year, month }` with the month from 1. */
  visibleMonth: UseCalendarResult['visibleMonth']
}

export interface CalendarRootProps
  extends Omit<ComponentPropsWithRef<'div'>, 'defaultValue'>, Omit<UseCalendarOptions, 'messages'> {
  /** Per-instance message overrides: `{ previousMonth: 'Förra månaden' }`. */
  messages?: UseCalendarOptions['messages']
  render?: RenderProp<ComponentPropsWithRef<'div'>, CalendarState> | undefined
}

export interface CalendarHeadingProps extends ComponentPropsWithRef<'h3'> {
  render?: RenderProp<ComponentPropsWithRef<'h3'>, CalendarState> | undefined
}

export interface CalendarStepButtonProps extends ComponentPropsWithRef<'button'> {
  render?: RenderProp<ComponentPropsWithRef<'button'>, CalendarState> | undefined
}

export interface CalendarRangeHintProps extends ComponentPropsWithRef<'p'> {
  render?: RenderProp<ComponentPropsWithRef<'p'>, CalendarState> | undefined
}

export interface CalendarGridProps extends ComponentPropsWithRef<'table'> {
  /** Your own rows. Without it the grid renders the weekday headers and the weeks. */
  children?: ReactNode
  render?: RenderProp<ComponentPropsWithRef<'table'>, CalendarState> | undefined
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

const stateOf = (calendar: UseCalendarResult): CalendarState => ({
  visibleMonth: calendar.visibleMonth,
})

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
export function CalendarRoot({
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
  messages,
  render,
  children,
  ref,
  ...otherProps
}: CalendarRootProps): ReactElement {
  const calendar = useCalendar({
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
    messages,
  })
  return (
    <CalendarContext.Provider value={calendar}>
      {renderPart({
        render,
        defaultElement: 'div',
        partProps: { ...mergeProps(otherProps, calendar.rootProps), ref, children },
        state: stateOf(calendar),
      })}
    </CalendarContext.Provider>
  )
}
CalendarRoot.displayName = 'Calendar.Root'

/** The month and year, `oktober 2026`. It names the grid. An `<h3>`: change the level with `render`. */
export function CalendarHeading({
  render,
  children,
  ref,
  ...otherProps
}: CalendarHeadingProps): ReactElement | null {
  const calendar = useCalendarContext('Heading')
  if (calendar === null) {
    return null
  }
  return renderPart({
    render,
    defaultElement: 'h3',
    partProps: {
      ...mergeProps(otherProps, calendar.headingProps),
      ref,
      children: children ?? calendar.headingText,
    },
    state: stateOf(calendar),
  })
}
CalendarHeading.displayName = 'Calendar.Heading'

type StepKey = 'previousMonthProps' | 'nextMonthProps' | 'previousYearProps' | 'nextYearProps'

function useStepButton(
  partName: string,
  propsKey: StepKey,
  { render, children, ref, ...otherProps }: CalendarStepButtonProps,
  defaultChildren: ReactNode,
): ReactElement | null {
  const calendar = useCalendarContext(partName)
  if (calendar === null) {
    return null
  }
  const stepProps = calendar[propsKey]
  const control = renderPart({
    render,
    defaultElement: 'button',
    partProps: {
      ...mergeProps(otherProps, stepProps),
      ref,
      children: children ?? defaultChildren,
    },
    state: stateOf(calendar),
  })
  return (
    <Tooltip.Root>
      <Tooltip.Trigger render={control} />
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

/** The range in words above the grid, and the grid's description (3.3.2). Renders nothing without a minimum or maximum. */
export function CalendarRangeHint({
  render,
  children,
  ref,
  ...otherProps
}: CalendarRangeHintProps): ReactElement | null {
  const calendar = useCalendarContext('RangeHint')
  if (calendar === null || calendar.rangeHint === undefined) {
    return null
  }
  return renderPart({
    render,
    defaultElement: 'p',
    partProps: {
      ...mergeProps(otherProps, calendar.rangeHintProps),
      ref,
      children: children ?? calendar.rangeHint,
    },
    state: stateOf(calendar),
  })
}
CalendarRangeHint.displayName = 'Calendar.RangeHint'

/**
 * The `<table role="grid">`: weekday headers, an optional week-number column and the weeks, with
 * the focused day as the one Tab stop. For your own rows, give it `children` and use `weeks` and
 * `getDayProps` from `useCalendar`.
 */
export function CalendarGrid({
  render,
  children,
  ref,
  ...otherProps
}: CalendarGridProps): ReactElement | null {
  const calendar = useCalendarContext('Grid')
  const headingId = calendar?.headingProps.id
  const describedBy = calendar?.gridProps['aria-describedby']
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
        'A Calendar has a minimum or maximum but no Calendar.RangeHint, so nobody is told which dates can be chosen. Render <Calendar.RangeHint /> in the Calendar.Root (WCAG 3.3.2).',
      )
    }
  }, [headingId, describedBy])
  if (calendar === null) {
    return null
  }
  return renderPart({
    render,
    defaultElement: 'table',
    partProps: {
      ...mergeProps(otherProps, calendar.gridProps),
      ref,
      children: children ?? (
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
                <th
                  key={weekday.weekday}
                  scope="col"
                  className="kv-calendar-weekday"
                  lang={calendar.dateLanguage}
                >
                  <span aria-hidden="true">{weekday.short}</span>
                  <span className="kv-visually-hidden">{weekday.long}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {calendar.weeks.map((week) => (
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
      ),
    },
    state: stateOf(calendar),
  })
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
