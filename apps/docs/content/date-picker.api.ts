import type {
  DatePickerTitleProps,
  UseDatePickerOptions,
  UseDatePickerResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

const pickerOptionRows = propRows<UseDatePickerOptions>({
  value: {
    type: 'IsoDate',
    default: '"" (none)',
    description:
      'The date the field holds, as YYYY-MM-DD, or "" for none. Build it with dateInputValueToIsoDate or maskedDateToIsoDate. The picker opens on it when it is a real date, else on today. DatePicker is controlled only: it never writes the field itself.',
  },
  onValueChange: {
    type: '(date: IsoDate) => void',
    default: '–',
    description:
      'Called with the day when an available day is chosen. Write it into your field with isoDateToDateInputValue or isoDateToMaskedDate.',
  },
  open: {
    type: 'boolean',
    default: '–',
    description:
      'Controlled: whether the dialog is open. Pair it with onOpenChange. Without it the picker is uncontrolled and starts closed.',
  },
  onOpenChange: {
    type: '(open: boolean, details: DatePickerChangeDetails) => void',
    default: '–',
    description:
      'Called when the dialog opens or closes. details.reason is the Dialog’s reason, or "select" when a day was chosen.',
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
    type: "Partial<KvirnMessages['datePicker']>",
    default: '–',
    description: 'Replaces the trigger’s text and the dialog’s title for this picker.',
  },
  calendarMessages: {
    type: "Partial<KvirnMessages['calendar']>",
    default: '–',
    description:
      'Replaces the Calendar’s strings for this picker, and "{date} selected", said on the page after the dialog has closed.',
  },
})

export const datePickerRootRows = pickerOptionRows

export const datePickerTriggerAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-dialog-trigger kv-button kv-date-picker-trigger',
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

export const datePickerPopupAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-dialog kv-date-picker-popup',
    values: 'always',
    meaning: 'The part classes. The default theme styles them.',
  },
]

export const datePickerTitleRows = propRows<Pick<DatePickerTitleProps, 'as'>>({
  as: {
    type: "'h2' | 'h3' | 'h4' | 'h5' | 'h6'",
    default: "'h2'",
    description: 'The element, so the title has the level it needs in the page’s outline.',
  },
})

export const datePickerTitleAttributes: readonly AttributeRow[] = [
  { name: 'kv-dialog-title', values: 'always', meaning: 'The part class.' },
]

export const useDatePickerHook: ApiHook = {
  name: 'useDatePicker',
  intro:
    'Takes the same options as DatePicker.Root. Render the Calendar only while isOpen: it reads the date when it mounts.',
  options: pickerOptionRows,
  result: propRows<UseDatePickerResult>({
    isOpen: { type: 'boolean', default: '–', description: 'Whether the dialog is open.' },
    triggerProps: {
      type: 'DatePickerTriggerPartProps',
      default: '–',
      description: 'Spread on the <button> that opens the picker.',
    },
    popupProps: {
      type: 'DatePickerPopupPartProps',
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
      type: 'DatePickerCalendarOptions',
      default: '–',
      description:
        'The Calendar’s options: spread them on Calendar.Root while the dialog is open. Its own "selected" message is off, because the page says it after the dialog has closed.',
    },
    triggerText: {
      type: 'string',
      default: '–',
      description: '"Choose date": the trigger’s visible text.',
    },
    titleText: {
      type: 'string',
      default: '–',
      description: '"Choose a date": the default title.',
    },
    dialog: {
      type: 'UseDialogResult & { isShown: boolean }',
      default: '–',
      description: 'The Dialog behind the picker, for DatePicker.Root.',
    },
  }),
}
