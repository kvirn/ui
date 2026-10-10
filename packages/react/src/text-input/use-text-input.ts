import type { MaskRejection } from '@kvirn-ui/core'
import { useEffect, useMemo } from 'react'
import type { ChangeEvent, ChangeEventHandler, CompositionEvent } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { useFieldControl } from '../field/use-field-control.ts'
import type {
  FieldControlOptions,
  FieldControlState,
  InputControlPartProps,
} from '../field/use-field-control.ts'

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

export interface UseTextInputOptions extends FieldControlOptions<TextInputChangeDetails> {
  /** Default `'text'`. */
  type?: TextInputType | undefined
  /**
   * Called with the new value on every change. It only reports: the value lives in your form
   * state, or in the native input when you don't pass `value`.
   */
  onValueChange?: ((value: string, details: TextInputChangeDetails) => void) | undefined
}

/** Spread on the `<input>`. */
export interface TextInputPartProps extends InputControlPartProps {
  /**
   * The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-input`. Add a width class
   * next to it, for example `kv-input--width-10`, with `mergeProps`: class names join.
   */
  className: 'kv-input'
  type: TextInputType
  onChange: ChangeEventHandler<HTMLInputElement>
}

export interface UseTextInputResult extends FieldControlState {
  inputProps: TextInputPartProps
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
  const { controlProps, ...state } = useFieldControl({ disabled })

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
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        onValueChange?.(event.currentTarget.value, { reason: 'input', event })
      },
    }),
    [controlProps, type, onValueChange],
  )

  return { inputProps, ...state }
}
