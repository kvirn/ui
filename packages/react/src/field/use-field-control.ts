import { useContext, useMemo } from 'react'
import type { FocusEventHandler } from 'react'
import { useFocusVisible } from '../focus-visible/use-focus-visible.ts'
import { FieldContext } from './field-context.ts'
import type { FieldStateAttributes } from './field-state.ts'

/** The options every native input control shares. */
export interface FieldControlOptions<TDetails> {
  /** Native `disabled`. A disabled Field disables the control too. */
  disabled?: boolean | undefined
  /**
   * Called with the new value on every change. It only reports: the value lives in your form
   * state, or in the native control when you don't pass `value`.
   */
  onValueChange?: ((value: string, details: TDetails) => void) | undefined
}

/** The state every native input control reports next to its props. */
export interface FieldControlState {
  isInvalid: boolean
  isRequired: boolean
  isDisabled: boolean
  /** While the control has focus, however it got it. */
  isFocused: boolean
  isFocusVisible: boolean
}

/** Internal. What the Field and the focus tracking put on every native input control. */
export interface InputControlPartProps extends FieldStateAttributes {
  /** From the Field: the control's id. */
  id?: string
  'aria-describedby'?: string
  'aria-invalid'?: 'true'
  'aria-required'?: 'true'
  disabled?: true
  /** While it has focus, however it got it. The theme's sign that the script has run. */
  'data-focused'?: ''
  'data-focus-visible'?: ''
  onFocus: FocusEventHandler<HTMLElement>
  onBlur: FocusEventHandler<HTMLElement>
}

export interface UseFieldControlResult extends FieldControlState {
  controlProps: InputControlPartProps
}

/**
 * Internal. The wiring of a native input control to the nearest Field and to the focus tracking:
 * what `TextInput`, `Textarea`, `NumberInput` and `PhoneInput` share. Without a Field it still works.
 */
export function useFieldControl({
  disabled = false,
}: { disabled?: boolean | undefined } = {}): UseFieldControlResult {
  const field = useContext(FieldContext)
  const { isFocused, isFocusVisible, focusVisibleProps } = useFocusVisible()
  const isInvalid = field?.state.isInvalid ?? false
  const isRequired = field?.state.isRequired ?? false
  const isDisabled = (field?.state.isDisabled ?? false) || disabled
  const fieldControlProps = field?.controlProps

  const controlProps = useMemo<InputControlPartProps>(
    () => ({
      ...fieldControlProps,
      ...(isDisabled ? { disabled: true, 'data-disabled': '' } : {}),
      ...(isFocused ? { 'data-focused': '' } : {}),
      ...(isFocusVisible ? { 'data-focus-visible': '' } : {}),
      ...focusVisibleProps,
    }),
    [fieldControlProps, isDisabled, isFocused, isFocusVisible, focusVisibleProps],
  )

  return { controlProps, isInvalid, isRequired, isDisabled, isFocused, isFocusVisible }
}
