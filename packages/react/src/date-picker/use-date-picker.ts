import { isValidIsoDate } from '@kvirn-ui/core'
import type { IsoDate, WeekStart } from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { RefCallback } from 'react'
import { useQuietAnnouncer, warnAnnouncerMissing } from '../announcer/use-announcer.ts'
import { createCalendarFormatters, resolveIntlLocale } from '../calendar/calendar-intl.ts'
import { warnOnce } from '../dev/dev-warning.ts'
import { isFocusTarget } from '../dialog/focus-return.ts'
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

/** Why the picker opened or closed: the Dialog's reasons, and `'select'` when a day was chosen. */
export type DatePickerChangeReason = DialogChangeReason | 'select'

export interface DatePickerChangeDetails {
  reason: DatePickerChangeReason
  /** The native event behind the change. `undefined` for `'select'`. */
  event: Event | undefined
}

export interface UseDatePickerOptions {
  /**
   * The date the field holds, `YYYY-MM-DD`, or `''` for none, from your form state: build it with
   * `dateInputValueToIsoDate` or `maskedDateToIsoDate`. The picker opens on it when it is a real
   * date, else on today. DatePicker is controlled only: it never writes the field itself.
   */
  value?: IsoDate | undefined
  /** Called with the day when an available day is chosen. Write it into your field, then. */
  onValueChange?: ((date: IsoDate) => void) | undefined
  /** Controlled: whether the dialog is open. Pair it with `onOpenChange`. Uncontrolled, it is mounted closed. */
  open?: boolean | undefined
  /** Called when the dialog opens or closes. A controlled owner changes `open` itself. */
  onOpenChange?: ((open: boolean, details: DatePickerChangeDetails) => void) | undefined
  /** The first day that can be chosen, `YYYY-MM-DD`. */
  minimum?: IsoDate | undefined
  /** The last day that can be chosen, `YYYY-MM-DD`. */
  maximum?: IsoDate | undefined
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
  messages?: Partial<KvirnMessages['datePicker']> | undefined
  /** Per-instance overrides for the Calendar's strings, and for "{date} selected" after the dialog closes. */
  calendarMessages?: Partial<KvirnMessages['calendar']> | undefined
}

/** Spread on the button that opens the picker. */
export interface DatePickerTriggerPartProps extends Omit<
  DialogTriggerPartProps,
  'className' | 'ref'
> {
  className: 'kv-dialog-trigger kv-button kv-date-picker-trigger'
  'aria-expanded': boolean
  ref: RefCallback<HTMLButtonElement>
}

/** Spread on the `<dialog>`. Name it with a title, as for a Dialog. */
export interface DatePickerPopupPartProps extends Omit<DialogPopupPartProps, 'className' | 'ref'> {
  className: 'kv-dialog kv-date-picker-popup'
  ref: RefCallback<HTMLDialogElement>
}

/** The Calendar's options, from the picker: spread them on `Calendar.Root` while the dialog is open. */
export interface DatePickerCalendarOptions {
  /** The typed date when it is real, else `''`. */
  value: IsoDate
  onValueChange: (date: IsoDate) => void
  minimum: IsoDate | undefined
  maximum: IsoDate | undefined
  isDateUnavailable: ((date: IsoDate) => boolean) | undefined
  getDateDescription: ((date: IsoDate) => string | undefined) | undefined
  weekStart: WeekStart | undefined
  weekNumbers: boolean | undefined
  today: IsoDate | undefined
  /** The Calendar says nothing when a day is chosen: the page says it once the dialog has closed. */
  messages: Partial<KvirnMessages['calendar']>
}

export interface UseDatePickerResult {
  isOpen: boolean
  triggerProps: DatePickerTriggerPartProps
  popupProps: DatePickerPopupPartProps
  titleProps: DialogTitlePartProps
  closeProps: DialogClosePartProps
  /** Call it from an effect in your title element, as for a Dialog. */
  registerTitle: () => () => void
  calendarProps: DatePickerCalendarOptions
  /** `Choose date`: the trigger's visible text. */
  triggerText: string
  /** `Choose a date`: the default title. */
  titleText: string
  /** The Dialog behind the picker, for `DatePicker.Root`. */
  dialog: UseDialogResult & { isShown: boolean }
}

/** Where focus goes inside the open dialog: the day with the Tab stop, not the first month button. */
const focusedDaySelector = '[role="gridcell"][tabindex="0"]'

/** The field around the trigger, for focus to land in when the trigger is gone. */
function findFieldFocusTarget(trigger: HTMLElement | null): HTMLElement | null {
  return (
    trigger
      ?.closest('fieldset, [role="group"], .kv-field')
      ?.querySelector<HTMLElement>('input:not([type="hidden"]), select, textarea') ?? null
  )
}

/**
 * A date picker's behaviour for your own markup (contract: date-picker.a11y.md): a button that
 * opens a modal Dialog holding a Calendar, so a date can be typed or chosen. It is an add-on to a
 * typed field (DateInput or a `masks.date()` TextInput) and controlled only: you pass the field's
 * date as `value` and write the chosen day back in `onValueChange`.
 *
 * - **Opens** on the typed date when it is real, else on today, kept inside the range.
 * - **Choosing a day** closes the dialog at once, returns focus to the trigger (else the first box
 *   of the field) and announces "{date} selected" on the page, after the dialog has closed.
 * - Render the Calendar only while `isOpen`: it reads the date when it mounts.
 *
 * @example
 * const datePicker = useDatePicker({ value, onValueChange: setValue })
 * <button {...datePicker.triggerProps}>{datePicker.triggerText}</button>
 */
export function useDatePicker({
  value = '',
  onValueChange,
  open: openProp,
  onOpenChange,
  minimum,
  maximum,
  isDateUnavailable,
  getDateDescription,
  weekStart,
  weekNumbers,
  today,
  messages,
  calendarMessages: calendarMessageOverrides,
}: UseDatePickerOptions = {}): UseDatePickerResult {
  const pickerMessages = useMessages('datePicker', messages)
  const calendarMessages = useMessages('calendar', calendarMessageOverrides)
  const { locale } = useLocale()
  const { announce: say, isAvailable } = useQuietAnnouncer()
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const isControlled = openProp !== undefined
  const isOpen = isControlled ? openProp : uncontrolledOpen
  const chosenDateRef = useRef<IsoDate | undefined>(undefined)
  const triggerElementRef = useRef<HTMLButtonElement | null>(null)
  const popupElementRef = useRef<HTMLDialogElement | null>(null)
  const fieldFocusTargetRef = useRef<HTMLElement | null>(null)

  const isValueValid = value === '' || isValidIsoDate(value)
  useEffect(() => {
    if (!isValueValid) {
      warnOnce(
        'date-picker-invalid-value',
        'A DatePicker got a value that is not an ISO date (YYYY-MM-DD), so it opens on today. Build it from the field with dateInputValueToIsoDate or maskedDateToIsoDate, and pass "" while the field is partial.',
      )
    }
  }, [isValueValid])

  const setOpen = (next: boolean, details: DatePickerChangeDetails) => {
    if (!next && details.reason !== 'select') {
      chosenDateRef.current = undefined
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
      chosenDateRef.current = undefined
      return
    }
    const date = chosenDateRef.current
    if (date === undefined) {
      return
    }
    chosenDateRef.current = undefined
    if (isAvailable) {
      say(calendarMessages.selected({ date: formatters.fullDate(date) }), {
        throttleMilliseconds: 0,
      })
    } else {
      warnAnnouncerMissing()
    }
  }, [isOpen, isAvailable, say, calendarMessages, formatters])

  const setTriggerElement = useMergedRef(triggerElementRef, dialog.triggerProps.ref)
  const setPopupElement = useMergedRef(popupElementRef, dialog.popupProps.ref)

  const select = (date: IsoDate) => {
    chosenDateRef.current = date
    onValueChange?.(date)
    setOpen(false, { reason: 'select', event: undefined })
  }

  return {
    isOpen: dialog.isOpen,
    triggerProps: {
      ...dialog.triggerProps,
      className: 'kv-dialog-trigger kv-button kv-date-picker-trigger',
      'aria-expanded': dialog.isOpen,
      ref: setTriggerElement,
    },
    popupProps: {
      ...dialog.popupProps,
      className: 'kv-dialog kv-date-picker-popup',
      ref: setPopupElement,
    },
    titleProps: dialog.titleProps,
    closeProps: dialog.closeProps,
    registerTitle: dialog.registerTitle,
    calendarProps: {
      value: isValueValid ? value : '',
      onValueChange: select,
      minimum,
      maximum,
      isDateUnavailable,
      getDateDescription,
      weekStart,
      weekNumbers,
      today,
      messages: { ...calendarMessageOverrides, selected: () => '' },
    },
    triggerText: pickerMessages.trigger,
    titleText: pickerMessages.title,
    dialog,
  }
}
