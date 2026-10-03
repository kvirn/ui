import { useContext, useMemo } from 'react'
import type { ChangeEvent, ChangeEventHandler, FocusEventHandler } from 'react'
import { FieldContext } from '../field/field-context.ts'
import type { FieldStateAttributes } from '../field/field-state.ts'
import { useFocusVisible } from '../focus-visible/use-focus-visible.ts'

/** The second argument of `onValueChange` on `Listbox.Native`. */
export interface ListboxNativeChangeDetails {
  reason: 'input'
  event: ChangeEvent<HTMLSelectElement>
}

export interface UseListboxNativeOptions {
  /** Native `disabled`. A disabled Field disables the select too. */
  disabled?: boolean | undefined
  /**
   * Called with the chosen option's value on every change. It only reports: the value lives in
   * your form state, or in the native select when you don't pass `value`.
   */
  onValueChange?: ((value: string, details: ListboxNativeChangeDetails) => void) | undefined
}

/** Spread on the native `<select>` (`Listbox.Native`). */
export interface ListboxNativePartProps extends FieldStateAttributes {
  /**
   * The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-listbox-native`. Add a width
   * class or your own next to it with `mergeProps`: class names join.
   */
  className: 'kv-listbox-native'
  /** From the Field: the control's id. */
  id?: string
  'aria-describedby'?: string
  'aria-invalid'?: 'true'
  'aria-required'?: 'true'
  disabled?: true
  'data-focus-visible'?: ''
  onChange: ChangeEventHandler<HTMLSelectElement>
  onFocus: FocusEventHandler<HTMLElement>
  onBlur: FocusEventHandler<HTMLElement>
}

export interface UseListboxNativeResult {
  /** Props for the native `<select>`: the Field's wiring, the part class and the change report. */
  nativeProps: ListboxNativePartProps
  isInvalid: boolean
  isRequired: boolean
  isDisabled: boolean
  isFocusVisible: boolean
}

/**
 * The native rendering's props for your own `<select>`, wired to the nearest Field (contract: listbox.a11y.md). It holds no value: spread your form library's props next
 * to it. The custom popup rendering is `useListbox`.
 *
 * @example
 * const listbox = useListboxNative({ onValueChange: (value) => form.setValue('municipality', value) })
 * <select {...listbox.nativeProps} name="municipality">…</select>
 */
export function useListboxNative({
  disabled = false,
  onValueChange,
}: UseListboxNativeOptions = {}): UseListboxNativeResult {
  const field = useContext(FieldContext)
  const { isFocusVisible, focusVisibleProps } = useFocusVisible()
  const isInvalid = field?.state.isInvalid ?? false
  const isRequired = field?.state.isRequired ?? false
  const isDisabled = (field?.state.isDisabled ?? false) || disabled
  const controlProps = field?.controlProps

  const nativeProps = useMemo<ListboxNativePartProps>(
    () => ({
      ...controlProps,
      className: 'kv-listbox-native',
      ...(isDisabled ? { disabled: true, 'data-disabled': '' } : {}),
      ...(isFocusVisible ? { 'data-focus-visible': '' } : {}),
      onChange: (event: ChangeEvent<HTMLSelectElement>) => {
        onValueChange?.(event.currentTarget.value, { reason: 'input', event })
      },
      ...focusVisibleProps,
    }),
    [controlProps, isDisabled, isFocusVisible, onValueChange, focusVisibleProps],
  )

  return { nativeProps, isInvalid, isRequired, isDisabled, isFocusVisible }
}
