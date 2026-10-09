import type {
  DateRangePickerTitleProps,
  UseDateRangePickerOptions,
  UseDateRangePickerResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

export const dateRangePickerRootRows = propRows<UseDateRangePickerOptions>({
  value: {
    type: 'DateRange',
    default: '{ start: "", end: "" }',
    description:
      'The range the two fields hold, { start, end } as YYYY-MM-DD, "" for a date that is empty or partial. Build each end with dateInputValueToIsoDate or maskedDateToIsoDate. DateRangePicker is controlled only: it never writes the fields itself.',
  },
  onValueChange: {
    type: '(range: DateRange) => void',
    default: '–',
    description:
      'Called once, with the finished range, when the end is chosen. Write both ends into your fields, then. Escape and Close never call it.',
  },
  open: {
    type: 'boolean',
    default: '–',
    description:
      'Controlled: whether the dialog is open. Pair it with onOpenChange. Without it the picker is uncontrolled and starts closed.',
  },
  onOpenChange: {
    type: '(open: boolean, details: DateRangePickerChangeDetails) => void',
    default: '–',
    description:
      'Called when the dialog opens or closes. details.reason is the Dialog’s reason, or "select" when the end was chosen.',
  },
  minimum: {
    type: 'IsoDate',
    default: '–',
    description: 'The first day that can be chosen, as YYYY-MM-DD.',
  },
  maximum: {
    type: 'IsoDate',
    default: '–',
    description: 'The last day that can be chosen, as YYYY-MM-DD.',
  },
  minimumDays: {
    type: 'number',
    default: '–',
    description: 'The fewest days, counting both ends (a one-day range is 1).',
  },
  maximumDays: {
    type: 'number',
    default: '–',
    description: 'The most days, counting both ends. A booking of 14 nights is 15.',
  },
  allowUnavailableInRange: {
    type: 'boolean',
    default: 'false',
    description: 'Lets a range pass over an unavailable day. By default it blocks.',
  },
  isDateUnavailable: {
    type: '(date: IsoDate) => boolean',
    default: '–',
    description: 'A day inside the range that can’t be chosen. It stays focusable, struck through.',
  },
  getDateDescription: {
    type: '(date: IsoDate) => string | undefined',
    default: '–',
    description: 'Words added to a day’s name, such as why it is unavailable.',
  },
  weekStart: {
    type: 'WeekStart',
    default: 'The provider’s',
    description:
      'The first day of the week, 1 (Monday) to 7 (Sunday). Else the provider’s, the locale’s, Monday.',
  },
  weekNumbers: {
    type: 'boolean',
    default: 'false',
    description: 'ISO week numbers, with a Monday start only.',
  },
  today: {
    type: 'IsoDate',
    default: 'The clock',
    description:
      'Today as YYYY-MM-DD, for tests and examples. Else the clock, read each time the dialog opens.',
  },
  messages: {
    type: "Partial<KvirnMessages['dateRangePicker']>",
    default: '–',
    description: 'Replaces the trigger’s text and the dialog’s title for this picker.',
  },
  calendarMessages: {
    type: "Partial<KvirnMessages['calendar']>",
    default: '–',
    description:
      'Replaces the Calendar’s strings for this picker, and "{start} to {end} selected", said on the page after the dialog has closed.',
  },
})

export const dateRangePickerTriggerAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-dialog-trigger kv-button kv-date-range-picker-trigger',
    values: 'always',
    meaning: 'The part classes. It looks like a Button.',
  },
  { name: 'aria-haspopup', values: '"dialog"', meaning: 'The button opens a dialog.' },
  {
    name: 'aria-expanded',
    values: '"true" or "false"',
    meaning: 'Whether the dialog is open.',
  },
]

export const dateRangePickerPopupAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-dialog kv-date-range-picker-popup',
    values: 'always',
    meaning: 'The part classes. The default theme styles them.',
  },
]

export const dateRangePickerTitleRows = propRows<Pick<DateRangePickerTitleProps, 'as'>>({
  as: {
    type: "'h2' | 'h3' | 'h4' | 'h5' | 'h6'",
    default: "'h2'",
    description: 'The element, so the title has the level it needs in the page’s outline.',
  },
})

export const dateRangePickerTitleAttributes: readonly AttributeRow[] = [
  { name: 'kv-dialog-title', values: 'always', meaning: 'The part class.' },
]

export const useDateRangePickerHook: ApiHook = {
  name: 'useDateRangePicker',
  intro:
    'Takes the same options as DateRangePicker.Root. Render the Calendar only while isOpen: it reads the range when it mounts.',
  options: dateRangePickerRootRows,
  result: propRows<UseDateRangePickerResult>({
    isOpen: { type: 'boolean', default: '–', description: 'Whether the dialog is open.' },
    triggerProps: {
      type: 'DateRangePickerTriggerPartProps',
      default: '–',
      description: 'Spread on the <button> that opens the picker.',
    },
    popupProps: {
      type: 'DateRangePickerPopupPartProps',
      default: '–',
      description: 'Spread on the <dialog>. Name it with a title.',
    },
    titleProps: {
      type: 'DialogTitlePartProps',
      default: '–',
      description: 'Spread on the title element. Call registerTitle from an effect in it.',
    },
    closeProps: {
      type: 'DialogClosePartProps',
      default: '–',
      description: 'Spread on the button inside the popup that closes it.',
    },
    registerTitle: {
      type: '() => () => void',
      default: '–',
      description: 'Call it from an effect in your title element, as for a Dialog.',
    },
    calendarProps: {
      type: 'DateRangePickerCalendarOptions',
      default: '–',
      description:
        'The Calendar’s options (mode "range", the draft value, the limits, two visible months): spread them on Calendar.Root while the dialog is open. Its own "selected" messages are off, because the page says the range after the dialog has closed.',
    },
    triggerText: {
      type: 'string',
      default: '–',
      description: '"Choose dates": the trigger’s visible text.',
    },
    titleText: {
      type: 'string',
      default: '–',
      description: '"Choose the dates": the default title.',
    },
    dialog: {
      type: 'UseDialogResult & { isShown: boolean }',
      default: '–',
      description: 'The Dialog behind the picker, for DateRangePicker.Root.',
    },
  }),
}
