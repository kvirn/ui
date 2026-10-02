import type { MaskRejection } from '@kvirn-ui/core'
import { useContext, useEffect, useMemo } from 'react'
import type { ChangeEvent, ChangeEventHandler, CompositionEvent, FocusEventHandler } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { FieldContext } from '../field/field-context.ts'
import type { FieldStateAttributes } from '../field/field-state.ts'
import { useFocusVisible } from '../focus-visible/use-focus-visible.ts'

/**
 * The text-like input types. Never `number` or `date` (ADR-0030): for numbers use `inputMode`,
 * and for dates DateInput.
 */
export type InputType = 'text' | 'email' | 'tel' | 'url' | 'password' | 'search'

/** The second argument of `onValueChange`. */
export interface InputChangeDetails {
  reason: 'input'
  /**
   * The change event. A masked input also reports at `compositionend`, when it applies the mask
   * to what an IME or dead key composed: then it is the `CompositionEvent`.
   */
  event: ChangeEvent<HTMLInputElement> | CompositionEvent<HTMLInputElement>
  /** Masks only: the value without literals and separators. */
  unmaskedValue?: string | undefined
  /** Masks only: the shape is complete. It doesn't mean the number exists (ADR-0032, item 4). */
  isComplete?: boolean | undefined
  /** Number masks only: whether the number is within `min` and `max`. Never clamped. */
  isWithinRange?: boolean | undefined
  /** Masks only: the characters the user entered that the mask dropped, by reason. */
  rejected?: readonly MaskRejection[] | undefined
}

export interface UseInputOptions {
  /** Default `'text'`. */
  type?: InputType | undefined
  /** Native `disabled`. A disabled Field disables the input too. */
  disabled?: boolean | undefined
  /**
   * Called with the new value on every change. It only reports: the value lives in your form
   * state, or in the native input when you don't pass `value` (ADR-0029, item 0).
   */
  onValueChange?: ((value: string, details: InputChangeDetails) => void) | undefined
}

/** Spread on the `<input>`. */
export interface InputPartProps extends FieldStateAttributes {
  /**
   * The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-input`. Add a width class
   * next to it, for example `kv-input--width-10`, with `mergeProps`: class names join.
   */
  className: 'kv-input'
  type: InputType
  /** From the Field: the control's id. */
  id?: string
  'aria-describedby'?: string
  'aria-invalid'?: 'true'
  'aria-required'?: 'true'
  disabled?: true
  'data-focus-visible'?: ''
  onChange: ChangeEventHandler<HTMLInputElement>
  onFocus: FocusEventHandler<HTMLElement>
  onBlur: FocusEventHandler<HTMLElement>
}

export interface UseInputResult {
  inputProps: InputPartProps
  isInvalid: boolean
  isRequired: boolean
  isDisabled: boolean
  isFocusVisible: boolean
}

/**
 * A text input's props for your own `<input>`, wired to the nearest Field (ADR-0029, contract:
 * input.a11y.md). It holds no value: spread your form library's props next to it.
 *
 * @example
 * const input = useInput({ type: 'tel', onValueChange: (value) => form.setValue('phone', value) })
 * <input {...input.inputProps} name="phone" autoComplete="tel" />
 */
export function useInput({
  type = 'text',
  disabled = false,
  onValueChange,
}: UseInputOptions = {}): UseInputResult {
  const field = useContext(FieldContext)
  const { isFocusVisible, focusVisibleProps } = useFocusVisible()
  const isInvalid = field?.state.isInvalid ?? false
  const isRequired = field?.state.isRequired ?? false
  const isDisabled = (field?.state.isDisabled ?? false) || disabled
  const controlProps = field?.controlProps

  useEffect(() => {
    const askedType: string = type
    if (askedType === 'number' || askedType === 'date') {
      warnOnce(
        `input-type-${askedType}`,
        askedType === 'number'
          ? 'An Input has type="number". It changes on scroll, drops leading zeros and rounds silently (ADR-0030). Use type="text" with inputMode="numeric" (or "decimal") and spellCheck={false}, and validate in your form.'
          : 'An Input has type="date". Its format and picker follow the browser, not the page language (ADR-0030). Use DateInput: three fields for day, month and year.',
      )
    }
  }, [type])

  const inputProps = useMemo<InputPartProps>(
    () => ({
      ...controlProps,
      className: 'kv-input',
      type,
      ...(isDisabled ? { disabled: true, 'data-disabled': '' } : {}),
      ...(isFocusVisible ? { 'data-focus-visible': '' } : {}),
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        onValueChange?.(event.currentTarget.value, { reason: 'input', event })
      },
      ...focusVisibleProps,
    }),
    [controlProps, type, isDisabled, isFocusVisible, onValueChange, focusVisibleProps],
  )

  return { inputProps, isInvalid, isRequired, isDisabled, isFocusVisible }
}
