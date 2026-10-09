import type {
  CalendarGridProps,
  CalendarHeadingProps,
  UseCalendarBaseOptions,
  UseCalendarOptions,
  UseCalendarRangeOptions,
  UseCalendarResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

/** The props Calendar.Root documents: every option of the hook. The rest are the props of a `<div>`. */
export type CalendarRootDocumentedProps = UseCalendarBaseOptions &
  Pick<
    UseCalendarRangeOptions,
    | 'mode'
    | 'value'
    | 'defaultValue'
    | 'onValueChange'
    | 'selects'
    | 'minimumDays'
    | 'maximumDays'
    | 'allowUnavailableInRange'
  >

const baseOptionRows = {
  defaultFocusedDate: {
    type: 'IsoDate',
    default: 'Today',
    description:
      'The day the grid opens on when none is chosen, such as a date the user typed. Read once, when the Calendar mounts.',
  },
  minimum: {
    type: 'IsoDate',
    default: '–',
    description:
      'The first day that can be chosen, as YYYY-MM-DD. The keys and the month buttons stop here.',
  },
  maximum: {
    type: 'IsoDate',
    default: '–',
    description: 'The last day that can be chosen, as YYYY-MM-DD.',
  },
  isDateUnavailable: {
    type: '(date: IsoDate) => boolean',
    default: '–',
    description:
      'A day inside the range that can’t be chosen. It stays focusable, drawn struck through, with aria-disabled. Say why in getDateDescription.',
  },
  getDateDescription: {
    type: '(date: IsoDate) => string | undefined',
    default: '–',
    description:
      'Extra words for a day’s name, such as why it is unavailable: "Recycling centre closed".',
  },
  weekStart: {
    type: 'WeekStart',
    default: 'The provider’s',
    description:
      'The first day of the week, 1 (Monday) to 7 (Sunday). Else the provider’s, else the locale’s when it names a region, else Monday.',
  },
  weekNumbers: {
    type: 'boolean',
    default: 'false',
    description:
      'Shows the ISO 8601 week number before each week. Only with a Monday start: another start hides them and warns in development.',
  },
  today: {
    type: 'IsoDate',
    default: 'The clock',
    description:
      'Today as YYYY-MM-DD. Else read from the clock in the provider’s time zone, once, on mount.',
  },
  announce: {
    type: 'boolean',
    default: 'true',
    description:
      'Announces the new month after a month or year button, and what a press did after a day is chosen, through the Announcer. Set false when your own markup says it.',
  },
  visibleMonths: {
    type: '1 | 2',
    default: '1',
    description:
      'The most months side by side. Two show only from 64rem wide, one below it and on the server.',
  },
  messages: {
    type: "Partial<KvirnMessages['calendar']>",
    default: '–',
    description: 'Replaces the Calendar’s strings for this instance.',
  },
} as const

export const calendarRootRows = propRows<CalendarRootDocumentedProps>({
  ...baseOptionRows,
  mode: {
    type: "'single' | 'range'",
    default: "'single'",
    description:
      'Single chooses one day. Range chooses a start and an end with two ordinary presses and adds no key. It decides the shape of value, defaultValue and onValueChange.',
  },
  value: {
    type: 'IsoDate | DateRange',
    default: '–',
    description:
      'Controlled. Single: the chosen day as YYYY-MM-DD, or "" for none. Range: { start, end }, "" for a day not chosen. Pair it with onValueChange.',
  },
  defaultValue: {
    type: 'IsoDate | DateRange',
    default: '–',
    description: 'Uncontrolled: the day or range chosen at first.',
  },
  onValueChange: {
    type: '(date: IsoDate) => void | (range: DateRange, change: CalendarRangeChange) => void',
    default: '–',
    description:
      'Single: called with the day when an available day is chosen. Range: called after every press that changed the range, so a start alone is reported at once; change.step is "complete" when the range is finished.',
  },
  selects: {
    type: "'both' | 'start' | 'end'",
    default: "'both'",
    description:
      'Range only. Which end a press sets: both (start, then end), or one end of a from/to pair of Calendars that share one range.',
  },
  minimumDays: {
    type: 'number',
    default: '–',
    description: 'Range only. The fewest days, counting both ends (a one-day range is 1).',
  },
  maximumDays: {
    type: 'number',
    default: '–',
    description: 'Range only. The most days, counting both ends. A booking of 14 nights is 15.',
  },
  allowUnavailableInRange: {
    type: 'boolean',
    default: 'false',
    description:
      'Range only. Lets a range pass over an unavailable day, such as a leave across a holiday. By default it blocks.',
  },
})

export const calendarRootAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-calendar',
    values: 'always',
    meaning: 'The part class. The default theme styles it.',
  },
]

export const calendarHeadingRows = propRows<Pick<CalendarHeadingProps, 'offset'>>({
  offset: {
    type: '0 | 1',
    default: '0',
    description:
      '1 for the second month when visibleMonths is 2. Renders nothing while one month shows.',
  },
})

export const calendarHeadingAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-calendar-heading',
    values: 'always',
    meaning: 'The part class. The id is what names the grid.',
  },
  {
    name: 'lang',
    values: 'a language code or absent',
    meaning: 'Set when the browser had to write the month name in another language (3.1.2).',
  },
]

export const calendarStepAttributes = (name: string): readonly AttributeRow[] => [
  { name, values: 'always', meaning: 'The part class. The default theme styles it.' },
  {
    name: 'aria-disabled',
    values: '"true" or absent',
    meaning:
      'At the edge of the range. Not native disabled, because that would drop focus to the body.',
  },
  {
    name: 'data-disabled',
    values: 'present or absent',
    meaning: 'At the edge of the range, for styling.',
  },
]

export const calendarRangeHintAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-calendar-range',
    values: 'always',
    meaning: 'The part class. Its id is the grid’s aria-describedby.',
  },
  {
    name: 'kv-calendar-range-line',
    values: 'on each line',
    meaning:
      'One span for each line: the dates that can be chosen, the span limits and the next step.',
  },
]

export const calendarGridRows = propRows<Pick<CalendarGridProps, 'offset' | 'children'>>({
  offset: {
    type: '0 | 1',
    default: '0',
    description:
      '1 for the second month when visibleMonths is 2. Renders nothing while one month shows.',
  },
  children: {
    type: 'ReactNode',
    default: '–',
    description:
      'Your own rows. Without it the grid renders the weekday headers and the weeks. For your own rows use weeks and getDayProps from useCalendar.',
  },
})

export const calendarGridAttributes: readonly AttributeRow[] = [
  { name: 'kv-calendar-grid', values: 'always', meaning: 'The part class.' },
  { name: 'role', values: '"grid"', meaning: 'On the table.' },
  {
    name: 'aria-multiselectable',
    values: '"true" or absent',
    meaning: 'In range mode, when more than one day is selected.',
  },
  {
    name: 'data-offset',
    values: '0 or 1',
    meaning: '1 on the second month’s grid.',
  },
  {
    name: 'kv-calendar-day',
    values: 'on each day’s cell',
    meaning:
      'A td with role="gridcell". Its name is the whole date, whether it is today, its place in a range and your description.',
  },
  {
    name: 'data-today',
    values: 'present or absent',
    meaning: 'On today’s cell. aria-current="date" is on it too.',
  },
  {
    name: 'data-selected',
    values: 'present or absent',
    meaning: 'On the chosen day, with aria-selected="true".',
  },
  {
    name: 'data-unavailable',
    values: 'present or absent',
    meaning: 'On a day the user can’t choose. It keeps focus, with aria-disabled="true".',
  },
  {
    name: 'data-outside-range',
    values: 'present or absent',
    meaning: 'On a day before the minimum or after the maximum.',
  },
  {
    name: 'data-range-start, data-range-end, data-in-range',
    values: 'present or absent',
    meaning: 'Range mode: the start, the end (both on a one-day range) and the days between.',
  },
  {
    name: 'data-preview, data-preview-end',
    values: 'present or absent',
    meaning:
      'Range mode, drawn only: the days up to the day the pointer or focus is on while the end is pending.',
  },
]

export const useCalendarHook: ApiHook = {
  name: 'useCalendar',
  intro: 'Takes the same options as Calendar.Root. Spread getDayProps(date) on each day’s <td>.',
  options: propRows<UseCalendarOptions & Partial<UseCalendarRangeOptions>>({
    ...baseOptionRows,
    mode: calendarRootRows.mode,
    value: calendarRootRows.value,
    defaultValue: calendarRootRows.defaultValue,
    onValueChange: calendarRootRows.onValueChange,
    selects: calendarRootRows.selects,
    minimumDays: calendarRootRows.minimumDays,
    maximumDays: calendarRootRows.maximumDays,
    allowUnavailableInRange: calendarRootRows.allowUnavailableInRange,
  }),
  result: propRows<UseCalendarResult>({
    rootProps: {
      type: 'CalendarRootPartProps',
      default: '–',
      description: 'Spread on the Root’s element: the class kv-calendar.',
    },
    headingProps: {
      type: 'CalendarHeadingPartProps',
      default: '–',
      description: 'The first month’s heading, as months[0]. Its id names the grid.',
    },
    headingText: {
      type: 'string',
      default: '–',
      description: 'The month and year, "October 2026".',
    },
    previousMonthProps: {
      type: 'CalendarStepPartProps',
      default: '–',
      description:
        'Spread on the button for the month before. It stays focusable at the edge of the range.',
    },
    nextMonthProps: {
      type: 'CalendarStepPartProps',
      default: '–',
      description: 'Spread on the button for the month after.',
    },
    previousYearProps: {
      type: 'CalendarStepPartProps',
      default: '–',
      description: 'For the optional button that shows the same month a year before.',
    },
    nextYearProps: {
      type: 'CalendarStepPartProps',
      default: '–',
      description: 'For the optional button that shows the same month a year after.',
    },
    rangeHintProps: {
      type: 'CalendarRangeHintPartProps',
      default: '–',
      description: 'Spread on the paragraph above the grid. Its id is the grid’s description.',
    },
    rangeHint: {
      type: 'string | undefined',
      default: '–',
      description: 'The lines in one text. undefined when there is none.',
    },
    rangeHintLines: {
      type: 'string[]',
      default: '–',
      description:
        'The lines to show: the minimum and maximum, then in range mode the span limits and the next step.',
    },
    gridProps: {
      type: 'CalendarGridPartProps',
      default: '–',
      description: 'The first month’s grid, as months[0]. Spread on the <table>.',
    },
    weekdays: {
      type: 'CalendarWeekday[]',
      default: '–',
      description:
        'The column headers in the order of the week start, each with a short and a long name.',
    },
    hasWeekNumbers: {
      type: 'boolean',
      default: '–',
      description: 'Whether a week-number column is shown.',
    },
    weekHeader: {
      type: '{ short: string; long: string }',
      default: '–',
      description: 'The header over the week numbers: "Wk" is visible, "Week" is read.',
    },
    weeks: {
      type: 'CalendarWeek[]',
      default: '–',
      description: 'The weeks of the first visible month, for your own markup.',
    },
    months: {
      type: 'CalendarMonth[]',
      default: '–',
      description:
        'The months in view: one, or two side by side. Each has its heading, grid and weeks.',
    },
    getDayProps: {
      type: '(date: IsoDate) => CalendarDayPartProps',
      default: '–',
      description: 'The props for the <td> of one day.',
    },
    visibleMonth: { type: 'YearMonth', default: '–', description: 'The first month in view.' },
    visibleMonths: { type: '1 | 2', default: '–', description: 'How many months are in view now.' },
    focusedDate: { type: 'IsoDate', default: '–', description: 'The day with the Tab stop.' },
    selectedDate: {
      type: 'IsoDate | undefined',
      default: '–',
      description: 'The chosen day.',
    },
    range: {
      type: 'DateRange | undefined',
      default: '–',
      description:
        'Range mode: the range as shown (an end before the start is dropped). undefined in single mode.',
    },
    rangeStep: {
      type: 'RangeStep | undefined',
      default: '–',
      description: 'Range mode: what the next press does.',
    },
    dateLanguage: {
      type: 'string | undefined',
      default: '–',
      description:
        'The language of the written months and weekdays when it isn’t the provider’s (3.1.2).',
    },
  }),
}
