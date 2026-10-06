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
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { DatePickerContext } from './date-picker-context.ts'
import { useDatePicker } from './use-date-picker.ts'
import type { UseDatePickerOptions, UseDatePickerResult } from './use-date-picker.ts'

export type { DatePickerChangeDetails, DatePickerChangeReason } from './use-date-picker.ts'

/** What `render` receives as its second argument, for the Trigger. */
export interface DatePickerState {
  isOpen: boolean
}

export interface DatePickerRootProps extends UseDatePickerOptions {
  children?: ReactNode
}

export interface DatePickerTriggerProps extends ComponentPropsWithRef<'button'> {
  render?: RenderProp<ComponentPropsWithRef<'button'>, DatePickerState> | undefined
}

export type DatePickerPopupProps = DialogPopupProps

export type DatePickerTitleProps = DialogTitleProps

export type DatePickerCalendarProps = Omit<CalendarRootProps, keyof UseCalendarOptions>

function useDatePickerContext(partName: string): UseDatePickerResult | null {
  const datePicker = useContext(DatePickerContext)
  useEffect(() => {
    if (datePicker === null) {
      warnOnce(
        `date-picker-${partName.toLowerCase()}-outside-root`,
        `DatePicker.${partName} was rendered outside DatePicker.Root, so it does nothing. Put it inside <DatePicker.Root>.`,
      )
    }
  }, [datePicker, partName])
  return datePicker
}

/**
 * Owns the open state of a date picker and the date's range (contract: date-picker.a11y.md). It
 * renders no element: put the typed field (a DateInput or a `masks.date()` TextInput), then
 * `DatePicker.Trigger` and `DatePicker.Popup` inside it, and the Root inside the field's Fieldset
 * so the trigger sits in the row of boxes. It is controlled only: `value` is the field's date as
 * `YYYY-MM-DD` (`dateInputValueToIsoDate`, `maskedDateToIsoDate`), and `onValueChange` is where
 * you write the chosen day back (`isoDateToDateInputValue`, `isoDateToMaskedDate`).
 *
 * @example
 * <DatePicker.Root value={isoDate} onValueChange={(date) => setDate(isoDateToDateInputValue(date))}>
 *   <DateInput.Root value={date} onValueChange={setDate}>
 *     <DateInput.Day /> <DateInput.Month /> <DateInput.Year />
 *     <DatePicker.Trigger />
 *   </DateInput.Root>
 *   <DatePicker.Popup />
 * </DatePicker.Root>
 */
export function DatePickerRoot({ children, ...options }: DatePickerRootProps): ReactElement {
  const datePicker = useDatePicker(options)
  const announcer = useDialogAnnouncer(datePicker.isOpen)
  return (
    <DatePickerContext.Provider value={datePicker}>
      <DialogContext.Provider
        value={{ dialog: datePicker.dialog, isShown: datePicker.dialog.isShown, announcer }}
      >
        {children}
      </DialogContext.Provider>
    </DatePickerContext.Provider>
  )
}
DatePickerRoot.displayName = 'DatePicker.Root'

/**
 * The `<button>` that opens the picker (nothing outside `DatePicker.Root`), named "Choose date" (`datePicker.trigger`) with a
 * decorative calendar icon, with `aria-haspopup="dialog"` and `aria-expanded`. It looks like a
 * `kv-button`. Pass `children` for your own content: the visible text must stay its name.
 */
export function DatePickerTrigger({
  render,
  children,
  ref,
  ...otherProps
}: DatePickerTriggerProps): ReactElement | null {
  const datePicker = useDatePickerContext('Trigger')
  const mergedRef = useMergedRef(ref, datePicker?.triggerProps.ref ?? null)
  if (datePicker === null) {
    return null
  }
  return renderPart({
    render,
    defaultElement: 'button',
    partProps: {
      ...mergeProps(otherProps, datePicker.triggerProps),
      ref: mergedRef,
      children: children ?? (
        <>
          <Icon name="calendar" />
          {datePicker.triggerText}
        </>
      ),
    },
    state: { isOpen: datePicker.isOpen },
  })
}
DatePickerTrigger.displayName = 'DatePicker.Trigger'

/** The dialog's title, "Choose a date" (`datePicker.title`): an `<h2>` that names the dialog. Replace it with the question, such as "Choose the date of your visit". */
export function DatePickerTitle({ children, ...otherProps }: DatePickerTitleProps): ReactElement {
  const datePicker = useDatePickerContext('Title')
  return <DialogTitle {...otherProps}>{children ?? datePicker?.titleText}</DialogTitle>
}
DatePickerTitle.displayName = 'DatePicker.Title'

/**
 * The month grid with the picker's range and value: a `Calendar.Root` with the month buttons, the
 * heading, the range hint and the grid inside it. Give it `children` to compose your own. It
 * says nothing when a day is chosen: the page does, after the dialog has closed.
 */
export function DatePickerCalendar({
  children,
  ...otherProps
}: DatePickerCalendarProps): ReactElement | null {
  const datePicker = useDatePickerContext('Calendar')
  if (datePicker === null) {
    return null
  }
  return (
    <CalendarRoot {...otherProps} {...datePicker.calendarProps}>
      {children ?? (
        <>
          <CalendarPreviousMonth />
          <CalendarHeading />
          <CalendarNextMonth />
          <CalendarRangeHint />
          <CalendarGrid />
        </>
      )}
    </CalendarRoot>
  )
}
DatePickerCalendar.displayName = 'DatePicker.Calendar'

/**
 * The modal `<dialog>` (a Dialog's popup, so the page behind is inert and Escape closes it). With
 * no children it holds the Title, the Close button and the Calendar, which is mounted only while
 * the dialog is open so it opens on the typed date, or today, every time. Focus starts on that day.
 */
export function DatePickerPopup({
  children,
  ref,
  ...otherProps
}: DatePickerPopupProps): ReactElement {
  const datePicker = useDatePickerContext('Popup')
  const mergedRef = useMergedRef(ref, datePicker?.popupProps.ref ?? null)
  return (
    <DialogPopup {...mergeProps(otherProps, { className: 'kv-date-picker-popup' })} ref={mergedRef}>
      {children ?? (
        <>
          <DatePickerTitle />
          <DialogClose />
          {datePicker?.isOpen === true ? <DatePickerCalendar /> : null}
        </>
      )}
    </DialogPopup>
  )
}
DatePickerPopup.displayName = 'DatePicker.Popup'

/** A button after a typed date that opens a modal dialog with a calendar. Typing always works. */
export const DatePicker = {
  Root: DatePickerRoot,
  Trigger: DatePickerTrigger,
  Popup: DatePickerPopup,
  Title: DatePickerTitle,
  Calendar: DatePickerCalendar,
} as const
