'use client'
import { useContext, useEffect } from 'react'
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react'
import {
  CalendarGrid,
  CalendarHeading,
  CalendarNextMonth,
  CalendarPreviousMonth,
  CalendarRangeHint,
  CalendarRoot,
} from '../calendar/calendar.tsx'
import type { CalendarRootProps } from '../calendar/calendar.tsx'
import type { UseCalendarOptions } from '../calendar/use-calendar.ts'
import { warnOnce } from '../dev/dev-warning.ts'
import { DialogClose, DialogPopup, DialogTitle } from '../dialog/dialog.tsx'
import type { DialogPopupProps, DialogTitleProps } from '../dialog/dialog.tsx'
import { DialogContext, useDialogAnnouncer } from '../dialog/dialog-context.ts'
import { Icon } from '../icon/icon.tsx'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { DateRangePickerContext } from './date-range-picker-context.ts'
import { useDateRangePicker } from './use-date-range-picker.ts'
import type {
  UseDateRangePickerOptions,
  UseDateRangePickerResult,
} from './use-date-range-picker.ts'

export type {
  DateRangePickerChangeDetails,
  DateRangePickerChangeReason,
} from './use-date-range-picker.ts'

export interface DateRangePickerRootProps extends UseDateRangePickerOptions {
  children?: ReactNode
}

export type DateRangePickerTriggerProps = ComponentPropsWithRef<'button'>

export type DateRangePickerPopupProps = DialogPopupProps

export type DateRangePickerTitleProps = DialogTitleProps

export type DateRangePickerCalendarProps = Omit<CalendarRootProps, keyof UseCalendarOptions>

function useDateRangePickerContext(partName: string): UseDateRangePickerResult | null {
  const dateRangePicker = useContext(DateRangePickerContext)
  useEffect(() => {
    if (dateRangePicker === null) {
      warnOnce(
        `date-range-picker-${partName.toLowerCase()}-outside-root`,
        `DateRangePicker.${partName} was rendered outside DateRangePicker.Root, so it does nothing. Put it inside <DateRangePicker.Root>.`,
      )
    }
  }, [dateRangePicker, partName])
  return dateRangePicker
}

/**
 * Owns the open state of a date range picker and its draft range (contract:
 * date-range-picker.a11y.md). It renders no element: put the From and To fields (each a
 * `masks.date()` TextInput, or a DateInput), then one `DateRangePicker.Trigger` after both and a
 * `DateRangePicker.Popup`, inside it, and the Root inside the fields' group Fieldset. It is
 * controlled only: `value` is the range as `{ start, end }` in `YYYY-MM-DD` (`maskedDateToIsoDate`,
 * `dateInputValueToIsoDate`, one per field), and `onValueChange` is where you write the chosen range
 * back (`isoDateToMaskedDate`, `isoDateToDateInputValue`).
 *
 * @example
 * <DateRangePicker.Root value={range} onValueChange={(next) => setTexts(toTexts(next))}>
 *   <div className="kv-date-range-row">
 *     <Field.Root>…From…</Field.Root>
 *     <Field.Root>…To…</Field.Root>
 *     <DateRangePicker.Trigger />
 *   </div>
 *   <DateRangePicker.Popup />
 * </DateRangePicker.Root>
 */
export function DateRangePickerRoot({
  children,
  ...options
}: DateRangePickerRootProps): ReactElement {
  const dateRangePicker = useDateRangePicker(options)
  const announcer = useDialogAnnouncer(dateRangePicker.isOpen)
  return (
    <DateRangePickerContext.Provider value={dateRangePicker}>
      <DialogContext.Provider
        value={{
          dialog: dateRangePicker.dialog,
          isShown: dateRangePicker.dialog.isShown,
          announcer,
        }}
      >
        {children}
      </DialogContext.Provider>
    </DateRangePickerContext.Provider>
  )
}
DateRangePickerRoot.displayName = 'DateRangePicker.Root'

/**
 * The `<button>` that opens the picker (nothing outside `DateRangePicker.Root`), named "Choose
 * dates" (`dateRangePicker.trigger`) with a decorative calendar icon, with `aria-haspopup="dialog"`
 * and `aria-expanded`. It looks like a `kv-button` and goes after both fields. Pass `children` for
 * your own content: the visible text must stay its name.
 */
export function DateRangePickerTrigger({
  children,
  ref,
  ...otherProps
}: DateRangePickerTriggerProps): ReactElement | null {
  const dateRangePicker = useDateRangePickerContext('Trigger')
  const mergedRef = useMergedRef(ref, dateRangePicker?.triggerProps.ref ?? null)
  if (dateRangePicker === null) {
    return null
  }
  return (
    <button {...mergeProps(otherProps, dateRangePicker.triggerProps)} ref={mergedRef}>
      {children ?? (
        <>
          <Icon name="calendar" />
          {dateRangePicker.triggerText}
        </>
      )}
    </button>
  )
}
DateRangePickerTrigger.displayName = 'DateRangePicker.Trigger'

/** The dialog's title, "Choose the dates" (`dateRangePicker.title`): an `<h2>` that names the dialog. Replace it with the question, such as "Choose the dates of your stay". */
export function DateRangePickerTitle({
  children,
  ...otherProps
}: DateRangePickerTitleProps): ReactElement {
  const dateRangePicker = useDateRangePickerContext('Title')
  return <DialogTitle {...otherProps}>{children ?? dateRangePicker?.titleText}</DialogTitle>
}
DateRangePickerTitle.displayName = 'DateRangePicker.Title'

/**
 * The range Calendar with the picker's draft and limits: a `Calendar.Root` with the month
 * buttons, both headings, the range hint and both grids inside it (the second month shows from
 * 64rem). Give it `children` to compose your own. It says nothing when the end is chosen: the
 * page does, after the dialog has closed.
 */
export function DateRangePickerCalendar({
  children,
  ...otherProps
}: DateRangePickerCalendarProps): ReactElement | null {
  const dateRangePicker = useDateRangePickerContext('Calendar')
  if (dateRangePicker === null) {
    return null
  }
  return (
    <CalendarRoot {...otherProps} {...dateRangePicker.calendarProps}>
      {children ?? (
        <>
          <CalendarPreviousMonth />
          <CalendarHeading />
          <CalendarHeading offset={1} />
          <CalendarNextMonth />
          <CalendarRangeHint />
          <CalendarGrid />
          <CalendarGrid offset={1} />
        </>
      )}
    </CalendarRoot>
  )
}
DateRangePickerCalendar.displayName = 'DateRangePicker.Calendar'

/**
 * The modal `<dialog>` (a Dialog's popup, so the page behind is inert and Escape closes it). With
 * no children it holds the Title, the Close button and the Calendar, which is mounted only while
 * the dialog is open so it opens on the typed range, or today, every time. Focus starts on the
 * start, else the end, else today.
 */
export function DateRangePickerPopup({
  children,
  ref,
  ...otherProps
}: DateRangePickerPopupProps): ReactElement {
  const dateRangePicker = useDateRangePickerContext('Popup')
  const mergedRef = useMergedRef(ref, dateRangePicker?.popupProps.ref ?? null)
  return (
    <DialogPopup
      {...mergeProps(otherProps, { className: 'kv-date-range-picker-popup' })}
      ref={mergedRef}
    >
      {children ?? (
        <>
          <DateRangePickerTitle />
          <DialogClose />
          {dateRangePicker?.isOpen === true ? <DateRangePickerCalendar /> : null}
        </>
      )}
    </DialogPopup>
  )
}
DateRangePickerPopup.displayName = 'DateRangePicker.Popup'

/** One button after a From and a To date that opens a modal dialog with a range calendar. Typing always works. */
export const DateRangePicker = {
  Root: DateRangePickerRoot,
  Trigger: DateRangePickerTrigger,
  Popup: DateRangePickerPopup,
  Title: DateRangePickerTitle,
  Calendar: DateRangePickerCalendar,
} as const
