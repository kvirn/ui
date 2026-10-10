import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { StringsBlock } from './strings-block.tsx'
import { UseCase } from './use-case.tsx'
import {
  calendarGridAttributes,
  calendarGridRows,
  calendarHeadingAttributes,
  calendarHeadingRows,
  calendarRangeHintAttributes,
  calendarRootAttributes,
  calendarRootRows,
  calendarStepAttributes,
  useCalendarHook,
} from '../content/calendar.api.ts'
import { CalendarBesideField } from '../examples/calendar/beside-a-field.tsx'
import { BookableWindow } from '../examples/calendar/bookable-window.tsx'
import { ClosedDays } from '../examples/calendar/closed-days.tsx'
import { MonthCalendar } from '../examples/calendar/default.tsx'
import { StayRange } from '../examples/calendar/range.tsx'
import { WeekNumbers } from '../examples/calendar/week-numbers.tsx'
import { YearButtons } from '../examples/calendar/year-buttons.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type CalendarExampleSources = Record<
  | 'default'
  | 'beside-a-field'
  | 'bookable-window'
  | 'closed-days'
  | 'week-numbers'
  | 'year-buttons'
  | 'range',
  string
>

const stepPart = (name: string, className: string, renders: string): ApiPart => ({
  name: `Calendar.${name}`,
  renders: (
    <>
      A <code>&lt;button type=&quot;button&quot;&gt;</code> with an icon and the name{' '}
      <code>{renders}</code>, shown as a tooltip too. It takes every attribute of a{' '}
      <code>&lt;button&gt;</code> and passes <code>ref</code> to it. At the edge of the range it
      stays focusable and sets <code>aria-disabled</code>.
    </>
  ),
  attributes: calendarStepAttributes(className),
})

const parts: ApiPart[] = [
  {
    name: 'Calendar.Root',
    renders: (
      <>
        <code>&lt;div&gt;</code> with no role. It takes every attribute of a{' '}
        <code>&lt;div&gt;</code> and passes <code>ref</code> to it. It renders nothing for you:
        write the parts you need inside it. The default theme is described on{' '}
        <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: calendarRootRows,
    attributes: calendarRootAttributes,
  },
  {
    name: 'Calendar.Heading',
    renders: (
      <>
        An <code>&lt;h3&gt;</code> with the month and year. It names the grid. It takes every
        attribute of an <code>&lt;h3&gt;</code> and passes <code>ref</code> to it.
      </>
    ),
    props: calendarHeadingRows,
    attributes: calendarHeadingAttributes,
  },
  stepPart('PreviousMonth', 'kv-calendar-previous-month', 'calendar.previousMonth'),
  stepPart('NextMonth', 'kv-calendar-next-month', 'calendar.nextMonth'),
  stepPart('PreviousYear', 'kv-calendar-previous-year', 'calendar.previousYear'),
  stepPart('NextYear', 'kv-calendar-next-year', 'calendar.nextYear'),
  {
    name: 'Calendar.RangeHint',
    renders: (
      <>
        A <code>&lt;p&gt;</code> that says which dates can be chosen and, in range mode, the span
        limits and the next step. It is also the grid’s description. It renders nothing when there
        is no line to say. It takes every attribute of a <code>&lt;p&gt;</code> and passes{' '}
        <code>ref</code> to it.
      </>
    ),
    attributes: calendarRangeHintAttributes,
  },
  {
    name: 'Calendar.Grid',
    renders: (
      <>
        A <code>&lt;table role=&quot;grid&quot;&gt;</code> with the weekday headers and the weeks.
        The focused day is the one Tab stop. It takes every attribute of a{' '}
        <code>&lt;table&gt;</code> and passes <code>ref</code> to it.
      </>
    ),
    props: calendarGridRows,
    attributes: calendarGridAttributes,
  },
]

export function CalendarPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: CalendarExampleSources
}) {
  return (
    <ComponentPage
      title="Calendar"
      lead="It has one Tab stop, the date keys and names for every day, and it never replaces typing the date."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use it to choose a date near today, such as a booking or a start date, next to a field
            where the same date can be typed. Typing must always work: the calendar is the slower
            way for keyboard and screen reader users.
          </li>
          <li>
            Use it in forms for residents and for staff, and as a section of a page. To open it from
            a button, use <Link href="/components/date-picker">DatePicker</Link>, or{' '}
            <Link href="/components/date-range-picker">DateRangePicker</Link> for a start and an
            end.
          </li>
          <li>
            Not for a date the user knows by heart, such as a date of birth: use{' '}
            <Link href="/components/date-input">DateInput</Link>.
          </li>
          <li>
            Not for a time or a whole month: use a{' '}
            <Link href="/components/text-input">TextInput</Link> with a mask.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <MonthCalendar />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="beside-a-field"
            title="Beside a typed field"
            why={
              <>
                Hold the date in your form state as the text of the field, and give the Calendar the
                ISO date. Choosing a day writes it into the field, and typing a real date selects it
                in the Calendar. Calendar is a companion to typing, never the only way.
              </>
            }
            code={sources['beside-a-field']}
            propsUsed={[
              { part: 'Calendar.Root', prop: 'value' },
              { part: 'Calendar.Root', prop: 'onValueChange' },
            ]}
          >
            <CalendarBesideField />
          </UseCase>
          <UseCase
            id="bookable-window"
            title="Only some dates can be chosen"
            why={
              <>
                Set <code>minimum</code> and <code>maximum</code>: the keys and the month buttons
                stop there, and days outside are struck through. <code>today</code> is fixed in this
                example so the dates are the same on any day.
              </>
            }
            code={sources['bookable-window']}
            propsUsed={[
              { part: 'Calendar.Root', prop: 'minimum' },
              { part: 'Calendar.Root', prop: 'maximum' },
              { part: 'Calendar.Root', prop: 'today' },
            ]}
            note={
              <Note kind="reminder">
                Render <code>Calendar.RangeHint</code> whenever there is a limit, so the dates that
                can be chosen are written in words. See{' '}
                <Link href="#what-you-need-to-do">What you need to do</Link>.
              </Note>
            }
          >
            <BookableWindow />
          </UseCase>
          <UseCase
            id="closed-days"
            title="Days that are closed, with the reason"
            why="A day that can't be chosen stays focusable, drawn struck through, so a keyboard user can find it and read why. The reason is part of the day's name."
            code={sources['closed-days']}
            propsUsed={[
              { part: 'Calendar.Root', prop: 'isDateUnavailable' },
              { part: 'Calendar.Root', prop: 'getDateDescription' },
            ]}
          >
            <ClosedDays />
          </UseCase>
          <UseCase
            id="week-numbers"
            title="Week numbers"
            why="Planners often name a week by its number. The ISO number only fits a week that starts on Monday, so the Calendar hides the column and warns in development with any other start."
            code={sources['week-numbers']}
            propsUsed={[
              { part: 'Calendar.Root', prop: 'weekNumbers' },
              { part: 'Calendar.Root', prop: 'weekStart' },
            ]}
          >
            <WeekNumbers />
          </UseCase>
          <UseCase
            id="year-buttons"
            title="Far from today"
            why={
              <>
                Add <code>Calendar.PreviousYear</code> and <code>Calendar.NextYear</code> when the
                date can be years away, and open on a day near it with{' '}
                <code>defaultFocusedDate</code>. For a date of birth, typing in{' '}
                <Link href="/components/date-input">DateInput</Link> is faster than any calendar.
              </>
            }
            code={sources['year-buttons']}
            propsUsed={[{ part: 'Calendar.Root', prop: 'defaultFocusedDate' }]}
          >
            <YearButtons />
          </UseCase>
          <UseCase
            id="range"
            title="A start and an end"
            why={
              <>
                With <code>mode=&quot;range&quot;</code> the value is{' '}
                <code>{'{ start, end }'}</code> and the user presses the start, then the end: no
                extra key. A start alone is reported at once. Two months show side by side from
                64rem wide, one below it.
              </>
            }
            code={sources['range']}
            propsUsed={[
              { part: 'Calendar.Root', prop: 'mode' },
              { part: 'Calendar.Root', prop: 'minimumDays' },
              { part: 'Calendar.Root', prop: 'maximumDays' },
              { part: 'Calendar.Root', prop: 'visibleMonths' },
            ]}
            note={
              <Note kind="tip">
                Count the days with both ends: a booking of 14 nights is <code>maximumDays</code>{' '}
                15. To reach a range with a pair of fields, see{' '}
                <Link href="/components/date-range-picker">DateRangePicker</Link>.
              </Note>
            }
          >
            <StayRange />
          </UseCase>
          <Note kind="reminder">
            Without a <code>timeZone</code> on <code>KvirnProvider</code>, hydration renders the UTC
            date and the grid then switches to the browser&apos;s date; a Calendar mounted later
            starts on it. Pass <code>timeZone</code> for the same day on the server and in the
            browser.
          </Note>
        </>
      }
      contract={<ContractSectionsView contract={contract} linkToStrings />}
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Calendar, useCalendar } from '@kvirn-ui/react'"
          parts={parts}
          hook={useCalendarHook}
          strings={
            <StringsBlock
              namespace="calendar"
              component="Calendar"
              layout="table"
              keys={[
                { key: 'previousMonth', meaning: 'The name of the previous-month button.' },
                { key: 'nextMonth', meaning: 'The name of the next-month button.' },
                { key: 'previousYear', meaning: 'The name of the previous-year button.' },
                { key: 'nextYear', meaning: 'The name of the next-year button.' },
                {
                  key: 'dayName',
                  meaning:
                    'A day’s name: the date, then today, its place in a range and your description.',
                  values: {
                    date: 'Wednesday 14 October 2026',
                    isToday: true,
                    rangePosition: 'start date',
                    description: 'Closed',
                  },
                },
                { key: 'weekHeader', meaning: 'The visible header over the week numbers.' },
                {
                  key: 'weekHeaderLong',
                  meaning: 'The same header, read by assistive technology.',
                },
                {
                  key: 'weekName',
                  meaning: 'The name of a week-number cell.',
                  values: { week: 42 },
                },
                {
                  key: 'rangeHint',
                  meaning:
                    'The line above the grid with the first and last day that can be chosen.',
                  values: { min: '1 October 2026', max: '31 December 2026' },
                },
                {
                  key: 'selected',
                  meaning: 'Announced after a day is chosen.',
                  values: { date: '14 October 2026' },
                },
                {
                  key: 'visibleMonths',
                  meaning: 'Announced after a month button with two months in view.',
                  values: { first: 'November 2026', last: 'December 2026' },
                },
                { key: 'rangeStart', meaning: 'Range: part of the name of the start day.' },
                { key: 'rangeEnd', meaning: 'Range: part of the name of the end day.' },
                {
                  key: 'rangeStartAndEnd',
                  meaning: 'Range: part of the name of a one-day range.',
                },
                {
                  key: 'rangeLength',
                  meaning: 'Range: the length in days, in a day’s name.',
                  values: { days: 7 },
                },
                {
                  key: 'rangeTooShort',
                  meaning: 'Range: why a day can’t be the end, in its name.',
                  values: { minimum: 2 },
                },
                {
                  key: 'rangeTooLong',
                  meaning: 'Range: why a day can’t be the end, in its name.',
                  values: { maximum: 15 },
                },
                {
                  key: 'rangeBlocked',
                  meaning: 'Range: an unavailable day is between the start and this day.',
                },
                { key: 'rangeBeforeStart', meaning: 'Range: this day is before the start.' },
                {
                  key: 'rangeSpanHint',
                  meaning: 'Range: the span limits, a line in the hint.',
                  values: { minimum: 2, maximum: 15 },
                },
                { key: 'rangeChooseStart', meaning: 'Range: the next step is the start.' },
                {
                  key: 'rangeChooseEnd',
                  meaning: 'Range: announced and written after the start is pressed.',
                  values: { start: '14 October 2026' },
                },
                {
                  key: 'rangeSelected',
                  meaning: 'Range: announced after the end is pressed.',
                  values: { start: '14 October 2026', end: '20 October 2026', length: '7 days' },
                },
                {
                  key: 'rangeEndSelected',
                  meaning: 'Range with selects="end": announced after the end is set.',
                  values: { date: '20 October 2026' },
                },
                {
                  key: 'rangeEndCleared',
                  meaning: 'Range with selects="start": the end was dropped.',
                },
              ]}
            />
          }
        />
      }
    />
  )
}
