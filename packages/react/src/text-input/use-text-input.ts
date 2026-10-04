import type { MaskRejection } from '@kvirn-ui/core'
import { useContext, useEffect, useMemo } from 'react'
import type { ChangeEvent, ChangeEventHandler, CompositionEvent, FocusEventHandler } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { FieldContext } from '../field/field-context.ts'
import type { FieldStateAttributes } from '../field/field-state.ts'
import { useFocusVisible } from '../focus-visible/use-focus-visible.ts'

/**
 * The text-like input types. Never `number` or `date`: for numbers use NumberInput,
 * and for dates DateInput.
 */
export type TextInputType = 'text' | 'email' | 'tel' | 'url' | 'password' | 'search'

/** The second argument of `onValueChange`. */
export interface TextInputChangeDetails {
  reason: 'input'
  /**
   * The change event. A masked input also reports at `compositionend`, when it applies the mask
   * to what an IME or dead key composed: then it is the `CompositionEvent`.
   */
  event: ChangeEvent<HTMLInputElement> | CompositionEvent<HTMLInputElement>
  /** Masks only: the value without literals and separators. */
  unmaskedValue?: string | undefined
  /** Masks only: the shape is complete. It doesn't mean the number exists. */
  isComplete?: boolean | undefined
  /** Number masks only: whether the number is within `min` and `max`. Never clamped. */
  isWithinRange?: boolean | undefined
  /** Masks only: the characters the user entered that the mask dropped, by reason. */
  rejected?: readonly MaskRejection[] | undefined
}

export interface UseTextInputOptions {
  /** Default `'text'`. */
  type?: TextInputType | undefined
  /** Native `disabled`. A disabled Field disables the input too. */
  disabled?: boolean | undefined
  /**
   * Called with the new value on every change. It only reports: the value lives in your form
   * state, or in the native input when you don't pass `value`.
   */
  onValueChange?: ((value: string, details: TextInputChangeDetails) => void) | undefined
}

/** Spread on the `<input>`. */
export interface TextInputPartProps extends FieldStateAttributes {
  /**
   * The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-input`. Add a width class
   * next to it, for example `kv-input--width-10`, with `mergeProps`: class names join.
   */
  className: 'kv-input'
  type: TextInputType
  /** From the Field: the control's id. */
  id?: string
  'aria-describedby'?: string
  'aria-invalid'?: 'true'
  'aria-required'?: 'true'
  disabled?: true
  /** While it has focus, however it got it. The theme's sign that the script has run. */
  'data-focused'?: ''
  'data-focus-visible'?: ''
  onChange: ChangeEventHandler<HTMLInputElement>
  onFocus: FocusEventHandler<HTMLElement>
  onBlur: FocusEventHandler<HTMLElement>
}

export interface UseTextInputResult {
  inputProps: TextInputPartProps
  isInvalid: boolean
  isRequired: boolean
  isDisabled: boolean
  isFocusVisible: boolean
}

/**
 * A text input's props for your own `<input>`, wired to the nearest Field (contract:
 * text-input.a11y.md). It holds no value: spread your form library's props next to it.
 *
 * @example
 * const input = useTextInput({ type: 'tel', onValueChange: (value) => form.setValue('phone', value) })
 * <input {...input.inputProps} name="phone" autoComplete="tel" />
 */
export function useTextInput({
  type = 'text',
  disabled = false,
  onValueChange,
}: UseTextInputOptions = {}): UseTextInputResult {
  const field = useContext(FieldContext)
  const { isFocused, isFocusVisible, focusVisibleProps } = useFocusVisible()
  const isInvalid = field?.state.isInvalid ?? false
  const isRequired = field?.state.isRequired ?? false
  const isDisabled = (field?.state.isDisabled ?? false) || disabled
  const controlProps = field?.controlProps

  useEffect(() => {
    const askedType: string = type
    if (askedType === 'number' || askedType === 'date') {
      warnOnce(
        `text-input-type-${askedType}`,
        askedType === 'number'
          ? 'A TextInput has type="number". It changes on scroll, drops leading zeros and rounds silently. Use NumberInput for a quantity or an amount, or a TextInput with a mask for a code.'
          : 'A TextInput has type="date". Its format and picker follow the browser, not the page language. Use DateInput: three fields for day, month and year.',
      )
    }
  }, [type])

  const inputProps = useMemo<TextInputPartProps>(
    () => ({
      ...controlProps,
      className: 'kv-input',
      type,
      ...(isDisabled ? { disabled: true, 'data-disabled': '' } : {}),
      ...(isFocused ? { 'data-focused': '' } : {}),
      ...(isFocusVisible ? { 'data-focus-visible': '' } : {}),
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        onValueChange?.(event.currentTarget.value, { reason: 'input', event })
      },
      ...focusVisibleProps,
    }),
    [controlProps, type, isDisabled, isFocused, isFocusVisible, onValueChange, focusVisibleProps],
  )

  return { inputProps, isInvalid, isRequired, isDisabled, isFocusVisible }
}
