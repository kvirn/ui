import { countDays, isValidIsoDate } from '@kvirn-ui/core'
import type { DateRange, IsoDate, WeekStart } from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { RefCallback } from 'react'
import { useQuietAnnouncer, warnAnnouncerMissing } from '../announcer/use-announcer.ts'
import { createCalendarFormatters, resolveIntlLocale } from '../calendar/calendar-intl.ts'
import type { CalendarRangeChange } from '../calendar/use-calendar.ts'
import { warnOnce } from '../dev/dev-warning.ts'
import { isFocusTarget } from '../focus/focus-return.ts'
import { useModalDialog } from '../dialog/use-dialog.ts'
import type {
  DialogChangeDetails,
  DialogChangeReason,
  DialogClosePartProps,
  DialogPopupPartProps,
  DialogTitlePartProps,
  DialogTriggerPartProps,
  UseDialogResult,
} from '../dialog/use-dialog.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { useLocale } from '../provider/use-locale.ts'
import { useMessages } from '../provider/use-messages.ts'

/** Why the picker opened or closed: the Dialog's reasons, and `'select'` when the end was chosen. */
export type DateRangePickerChangeReason = DialogChangeReason | 'select'

export interface DateRangePickerChangeDetails {
  reason: DateRangePickerChangeReason
  /** The native event behind the change. `undefined` for `'select'`. */
  event: Event | undefined
}

export interface UseDateRangePickerOptions {
  /**
   * The range the two fields hold, `{ start, end }` as `YYYY-MM-DD`, `''` for a date that is
   * empty or partial, from your form state: build each end with `dateInputValueToIsoDate` or
   * `maskedDateToIsoDate`. The picker opens on it. DateRangePicker is controlled only: it never
   * writes the fields itself.
   */
  value?: DateRange | undefined
  /**
   * Called once, with the finished range, when the end is chosen. Write both ends into your
   * fields, then. Escape and Close never call it.
   */
  onValueChange?: ((range: DateRange) => void) | undefined
  /** Controlled: whether the dialog is open. Pair it with `onOpenChange`. Uncontrolled, it is mounted closed. */
  open?: boolean | undefined
  /** Called when the dialog opens or closes. A controlled owner changes `open` itself. */
  onOpenChange?: ((open: boolean, details: DateRangePickerChangeDetails) => void) | undefined
  /** The first day that can be chosen, `YYYY-MM-DD`. */
  minimum?: IsoDate | undefined
  /** The last day that can be chosen, `YYYY-MM-DD`. */
  maximum?: IsoDate | undefined
  /** The fewest days, counting both ends (a one-day range is 1). */
  minimumDays?: number | undefined
  /** The most days, counting both ends. A booking of 14 nights is `15`. */
  maximumDays?: number | undefined
  /** A range may pass over an unavailable day. Default `false`: it blocks. */
  allowUnavailableInRange?: boolean | undefined
  /** A day inside the range that can't be chosen. It stays focusable, struck through. */
  isDateUnavailable?: ((date: IsoDate) => boolean) | undefined
  /** Words added to a day's name, such as why it is unavailable. */
  getDateDescription?: ((date: IsoDate) => string | undefined) | undefined
  /** The first day of the week, `1` (Monday) to `7` (Sunday). Else the provider's, the locale's, Monday. */
  weekStart?: WeekStart | undefined
  /** ISO week numbers, with a Monday start only. */
  weekNumbers?: boolean | undefined
  /** Today, `YYYY-MM-DD`, for tests and stories. Else the clock, read each time the dialog opens. */
  today?: IsoDate | undefined
  /** Per-instance overrides for the trigger's text and the dialog's title. */
  messages?: Partial<KvirnMessages['dateRangePicker']> | undefined
  /** Per-instance overrides for the Calendar's strings, and for "{start} to {end} selected" after the dialog closes. */
  calendarMessages?: Partial<KvirnMessages['calendar']> | undefined
}

/** Spread on the button that opens the picker. */
export interface DateRangePickerTriggerPartProps extends Omit<
  DialogTriggerPartProps,
  'className' | 'ref'
> {
  className: 'kv-dialog-trigger kv-button kv-date-range-picker-trigger'
  'aria-expanded': boolean
  ref: RefCallback<HTMLButtonElement>
}

/** Spread on the `<dialog>`. Name it with a title, as for a Dialog. */
export interface DateRangePickerPopupPartProps extends Omit<
  DialogPopupPartProps,
  'className' | 'ref'
> {
  className: 'kv-dialog kv-date-range-picker-popup'
  ref: RefCallback<HTMLDialogElement>
}

/** The Calendar's options, from the picker: spread them on `Calendar.Root` while the dialog is open. */
export interface DateRangePickerCalendarOptions {
  mode: 'range'
  /** The draft: what the fields held when the dialog opened, then the days pressed so far. */
  value: DateRange
  onValueChange: (range: DateRange, change: CalendarRangeChange) => void
  minimum: IsoDate | undefined
  maximum: IsoDate | undefined
  minimumDays: number | undefined
  maximumDays: number | undefined
  allowUnavailableInRange: boolean | undefined
  isDateUnavailable: ((date: IsoDate) => boolean) | undefined
  getDateDescription: ((date: IsoDate) => string | undefined) | undefined
  weekStart: WeekStart | undefined
  weekNumbers: boolean | undefined
  today: IsoDate | undefined
  /** Two months side by side from 64rem; the Calendar picks one below it. */
  visibleMonths: 2
  /** The Calendar says nothing when the end is chosen: the page says it once the dialog has closed. */
  messages: Partial<KvirnMessages['calendar']>
}

export interface UseDateRangePickerResult {
  isOpen: boolean
  triggerProps: DateRangePickerTriggerPartProps
  popupProps: DateRangePickerPopupPartProps
  titleProps: DialogTitlePartProps
  closeProps: DialogClosePartProps
  /** Call it from an effect in your title element, as for a Dialog. */
  registerTitle: () => () => void
  calendarProps: DateRangePickerCalendarOptions
  /** `Choose dates`: the trigger's visible text. */
  triggerText: string
  /** `Choose the dates`: the default title. */
  titleText: string
  /** The Dialog behind the picker, for `DateRangePicker.Root`. */
  dialog: UseDialogResult & { isShown: boolean }
}

/** Where focus goes inside the open dialog: the day with the Tab stop, not the first month button. */
const focusedDaySelector = '[role="gridcell"][tabindex="0"]'

/** The fields around the trigger, for focus to land in when the trigger is gone: the first one, From. */
function findFieldFocusTarget(trigger: HTMLElement | null): HTMLElement | null {
  return (
    trigger
      ?.closest('fieldset, [role="group"], .kv-field')
      ?.querySelector<HTMLElement>('input:not([type="hidden"]), select, textarea') ?? null
  )
}

const emptyRange: DateRange = Object.freeze({ start: '', end: '' })

/**
 * A date range picker's behaviour for your own markup (contract: date-range-picker.a11y.md): one
 * button after the From and To fields that opens a modal Dialog holding a range Calendar. It is
 * an add-on to two typed fields and controlled only: you pass the fields' range as `value` and
 * write the chosen range back in `onValueChange`.
 *
 * - **Opens** on the typed start, else the typed end, else today. The first press sets the start,
 *   the second the end.
 * - **Choosing the end** closes the dialog at once, returns focus to the trigger (else the From
 *   field) and announces "{start} to {end} selected" on the page, after the dialog has closed.
 * - **Escape and Close** drop the half-chosen range: both fields stay as they were.
 * - Render the Calendar only while `isOpen`: it reads the range when it mounts.
 *
 * @example
 * const picker = useDateRangePicker({ value: range, onValueChange: setRange })
 * <button {...picker.triggerProps}>{picker.triggerText}</button>
 */
export function useDateRangePicker({
  value = emptyRange,
  onValueChange,
  open: openProp,
  onOpenChange,
  minimum,
  maximum,
  minimumDays,
  maximumDays,
  allowUnavailableInRange,
  isDateUnavailable,
  getDateDescription,
  weekStart,
  weekNumbers,
  today,
  messages,
  calendarMessages: calendarMessageOverrides,
}: UseDateRangePickerOptions = {}): UseDateRangePickerResult {
  const pickerMessages = useMessages('dateRangePicker', messages)
  const calendarMessages = useMessages('calendar', calendarMessageOverrides)
  const { locale } = useLocale()
  const { announce: say, isAvailable } = useQuietAnnouncer()
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const [draft, setDraft] = useState<DateRange | undefined>(undefined)
  const isControlled = openProp !== undefined
  const isOpen = isControlled ? openProp : uncontrolledOpen
  const chosenRangeRef = useRef<DateRange | undefined>(undefined)
  const triggerElementRef = useRef<HTMLButtonElement | null>(null)
  const popupElementRef = useRef<HTMLDialogElement | null>(null)
  const fieldFocusTargetRef = useRef<HTMLElement | null>(null)

  const isStartValid = value.start === '' || isValidIsoDate(value.start)
  const isEndValid = value.end === '' || isValidIsoDate(value.end)
  useEffect(() => {
    if (!isStartValid || !isEndValid) {
      warnOnce(
        'date-range-picker-invalid-value',
        'A DateRangePicker got a start or an end that is not an ISO date (YYYY-MM-DD), so that end counts as empty. Build each end from its field with dateInputValueToIsoDate or maskedDateToIsoDate, and pass "" while a field is partial.',
      )
    }
  }, [isStartValid, isEndValid])
  const typedRange: DateRange = {
    start: isStartValid ? value.start : '',
    end: isEndValid ? value.end : '',
  }

  const setOpen = (next: boolean, details: DateRangePickerChangeDetails) => {
    if (!next) {
      setDraft(undefined)
      if (details.reason !== 'select') {
        chosenRangeRef.current = undefined
      }
    }
    if (next === isOpen) {
      return
    }
    if (!isControlled) {
      setUncontrolledOpen(next)
    }
    onOpenChange?.(next, details)
  }

  // Read when the dialog is shown and closed, so a getter keeps them live without a render.
  const initialFocusRef = useMemo(
    () => ({
      get current(): HTMLElement | null {
        return popupElementRef.current?.querySelector<HTMLElement>(focusedDaySelector) ?? null
      },
    }),
    [],
  )
  const finalFocusRef = useMemo(
    () => ({
      get current(): HTMLElement | null {
        const trigger = triggerElementRef.current
        return isFocusTarget(trigger) ? trigger : fieldFocusTargetRef.current
      },
    }),
    [],
  )

  const dialog = useModalDialog(
    {
      open: isOpen,
      onOpenChange: (next: boolean, details: DialogChangeDetails) =>
        setOpen(next, { reason: details.reason, event: details.event }),
      initialFocusRef,
      finalFocusRef,
    },
    'dialog',
  )

  useLayoutEffect(() => {
    if (isOpen) {
      fieldFocusTargetRef.current = findFieldFocusTarget(triggerElementRef.current)
    }
  }, [isOpen])

  const formatters = useMemo(() => createCalendarFormatters(resolveIntlLocale(locale)), [locale])
  // An inert page drops an announcement, so it waits for the dialog to be closed.
  useEffect(() => {
    if (isOpen) {
      chosenRangeRef.current = undefined
      return
    }
    const range = chosenRangeRef.current
    if (range === undefined) {
      return
    }
    chosenRangeRef.current = undefined
    if (isAvailable) {
      const days = countDays(range.start, range.end)
      say(
        calendarMessages.rangeSelected({
          start: formatters.fullDate(range.start),
          end: formatters.fullDate(range.end),
          length: calendarMessages.rangeLength({ days, nights: days - 1 }),
        }),
        { throttleMilliseconds: 0 },
      )
    } else {
      warnAnnouncerMissing()
    }
  }, [isOpen, isAvailable, say, calendarMessages, formatters])

  const setTriggerElement = useMergedRef(triggerElementRef, dialog.triggerProps.ref)
  const setPopupElement = useMergedRef(popupElementRef, dialog.popupProps.ref)

  const press = (range: DateRange, change: CalendarRangeChange) => {
    if (change.step !== 'complete') {
      setDraft(range)
      return
    }
    chosenRangeRef.current = range
    onValueChange?.(range)
    setOpen(false, { reason: 'select', event: undefined })
  }

  return {
    isOpen: dialog.isOpen,
    triggerProps: {
      ...dialog.triggerProps,
      className: 'kv-dialog-trigger kv-button kv-date-range-picker-trigger',
      'aria-expanded': dialog.isOpen,
      ref: setTriggerElement,
    },
    popupProps: {
      ...dialog.popupProps,
      className: 'kv-dialog kv-date-range-picker-popup',
      ref: setPopupElement,
    },
    titleProps: dialog.titleProps,
    closeProps: dialog.closeProps,
    registerTitle: dialog.registerTitle,
    calendarProps: {
      mode: 'range',
      value: draft ?? typedRange,
      onValueChange: press,
      minimum,
      maximum,
      minimumDays,
      maximumDays,
      allowUnavailableInRange,
      isDateUnavailable,
      getDateDescription,
      weekStart,
      weekNumbers,
      today,
      visibleMonths: 2,
      messages: { ...calendarMessageOverrides, rangeSelected: () => '' },
    },
    triggerText: pickerMessages.trigger,
    titleText: pickerMessages.title,
    dialog,
  }
}
