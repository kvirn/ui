import { useContext, useMemo } from 'react'
import type { ChangeEvent, ChangeEventHandler, FocusEventHandler } from 'react'
import { FieldContext } from '../field/field-context.ts'
import type { FieldStateAttributes } from '../field/field-state.ts'
import { useFocusVisible } from '../focus-visible/use-focus-visible.ts'

/** The second argument of `onValueChange`. */
export interface NativeSelectChangeDetails {
  reason: 'input'
  event: ChangeEvent<HTMLSelectElement>
}

export interface UseNativeSelectOptions {
  /** Native `disabled`. A disabled Field disables the select too. */
  disabled?: boolean | undefined
  /**
   * Called with the chosen option's value on every change. It only reports: the value lives in
   * your form state, or in the native select when you don't pass `value` (ADR-0029, item 0).
   */
  onValueChange?: ((value: string, details: NativeSelectChangeDetails) => void) | undefined
}

/** Spread on the `<select>`. */
export interface NativeSelectPartProps extends FieldStateAttributes {
  /**
   * The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-native-select`. Add a width
   * class or your own next to it with `mergeProps`: class names join.
   */
  className: 'kv-native-select'
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

export interface UseNativeSelectResult {
  selectProps: NativeSelectPartProps
  isInvalid: boolean
  isRequired: boolean
  isDisabled: boolean
  isFocusVisible: boolean
}

/**
 * A native select's props for your own `<select>`, wired to the nearest Field (ADR-0037, item
 * 2; contract: native-select.a11y.md). It holds no value: spread your form library's props
 * next to it.
 *
 * @example
 * const select = useNativeSelect({ onValueChange: (value) => form.setValue('municipality', value) })
 * <select {...select.selectProps} name="municipality">…</select>
 */
export function useNativeSelect({
  disabled = false,
  onValueChange,
}: UseNativeSelectOptions = {}): UseNativeSelectResult {
  const field = useContext(FieldContext)
  const { isFocusVisible, focusVisibleProps } = useFocusVisible()
  const isInvalid = field?.state.isInvalid ?? false
  const isRequired = field?.state.isRequired ?? false
  const isDisabled = (field?.state.isDisabled ?? false) || disabled
  const controlProps = field?.controlProps

  const selectProps = useMemo<NativeSelectPartProps>(
    () => ({
      ...controlProps,
      className: 'kv-native-select',
      ...(isDisabled ? { disabled: true, 'data-disabled': '' } : {}),
      ...(isFocusVisible ? { 'data-focus-visible': '' } : {}),
      onChange: (event: ChangeEvent<HTMLSelectElement>) => {
        onValueChange?.(event.currentTarget.value, { reason: 'input', event })
      },
      ...focusVisibleProps,
    }),
    [controlProps, isDisabled, isFocusVisible, onValueChange, focusVisibleProps],
  )

  return { selectProps, isInvalid, isRequired, isDisabled, isFocusVisible }
}
