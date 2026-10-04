import { masks } from '@kvirn-ui/core'
import type { Mask, NumberMaskOptions } from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useMemo } from 'react'
import type {
  ChangeEventHandler,
  CompositionEventHandler,
  FocusEvent,
  FocusEventHandler,
  RefCallback,
} from 'react'
import { useMaskedInput } from '../mask/use-mask.ts'
import type { MaskInputPartProps } from '../mask/use-mask.ts'
import type { TextInputChangeDetails, TextInputPartProps } from '../text-input/use-text-input.ts'
import { useTextInput } from '../text-input/use-text-input.ts'

export interface UseNumberInputOptions {
  /** Digits after the decimal mark. Default 0: no decimal mark is accepted. */
  decimals?: number | undefined
  /** Accept a leading minus sign. Default `false`. The keypad then shows text, because iOS's numeric pads have no minus. */
  allowNegative?: boolean | undefined
  /** Group the whole digits in threes with the provider's separator. Default `false`. */
  grouping?: boolean | undefined
  /** Lower limit. Reported as `details.isWithinRange`, never clamped and never a `min` attribute. */
  min?: number | undefined
  /** Upper limit. Reported as `details.isWithinRange`, never clamped and never a `max` attribute. */
  max?: number | undefined
  /** Native `disabled`. A disabled Field disables the input too. */
  disabled?: boolean | undefined
  /**
   * Called with the masked value on every change. `details.unmaskedValue` is the machine form
   * (`-1234.5`), and `details.isWithinRange` reports `min` and `max`. It only reports: the value
   * lives in your form state, or in the native input.
   */
  onValueChange?: ((value: string, details: TextInputChangeDetails) => void) | undefined
  /**
   * Announce, politely and at most once every few seconds, when a character is left out.
   * Default `true`. Needs a `KvirnProvider`: without one nothing is announced.
   */
  announceRejections?: boolean | undefined
  /** Per-instance overrides for the rejection announcements. */
  messages?: Partial<KvirnMessages['mask']> | undefined
}

/** Spread on the `<input>`. The attributes are the mask's suggestions: put yours after them. */
export interface NumberInputPartProps extends Omit<
  TextInputPartProps,
  'className' | 'type' | 'onChange' | 'onFocus'
> {
  /**
   * The part's classes, for `@kvirn-ui/theme` and your own CSS: `.kv-input` and
   * `.kv-input--numeric` (tabular figures). Add a width class next to them, for example
   * `kv-input--width-10`, with `mergeProps`: class names join.
   */
  className: 'kv-input kv-input--numeric'
  /** A text box, never `type="number"`. */
  type: 'text'
  /** `numeric`, `decimal`, or `text` when negatives are allowed. */
  inputMode?: MaskInputPartProps['inputMode']
  spellCheck: false
  onChange: ChangeEventHandler<HTMLInputElement>
  onFocus: FocusEventHandler<HTMLInputElement>
  onCompositionStart: CompositionEventHandler<HTMLInputElement>
  onCompositionEnd: CompositionEventHandler<HTMLInputElement>
  /** Tracks the value before each edit, to tell what the user inserted. */
  ref: RefCallback<HTMLInputElement>
}

export interface UseNumberInputResult {
  inputProps: NumberInputPartProps
  /** The `masks.number()` the options describe, before the provider's locale is applied. */
  mask: Mask
  /** Formats a stored (unmasked) number for display, in the provider's locale. */
  format: (unmaskedValue: string) => string
  /** The machine form of a displayed number: `1 250,50` becomes `1250.50`. */
  unmask: (value: string) => string
  isInvalid: boolean
  isRequired: boolean
  isDisabled: boolean
  isFocusVisible: boolean
}

/**
 * A number input's props for your own `<input>`: a text box with `masks.number()` built in, in
 * the provider's locale, wired to the nearest Field (contract: number-input.a11y.md). It holds no
 * value, never steps with the arrow keys and never clamps: spread your form library's props
 * next to it, and put the format in a visible hint when there are decimals (3.3.2).
 *
 * @example
 * const rent = useNumberInput({ decimals: 2, grouping: true, onValueChange: (value, details) => form.setValue('rent', details.unmaskedValue) })
 * <input {...mergeProps(rent.inputProps, { name: 'rent', autoComplete: 'off' })} />
 */
export function useNumberInput({
  decimals,
  allowNegative,
  grouping,
  min,
  max,
  disabled,
  onValueChange,
  announceRejections,
  messages,
}: UseNumberInputOptions = {}): UseNumberInputResult {
  const mask = useMemo(() => {
    const options: NumberMaskOptions = {
      ...(decimals === undefined ? {} : { decimals }),
      ...(allowNegative === undefined ? {} : { allowNegative }),
      ...(grouping === undefined ? {} : { grouping }),
      ...(min === undefined ? {} : { min }),
      ...(max === undefined ? {} : { max }),
    }
    return masks.number(options)
  }, [decimals, allowNegative, grouping, min, max])

  // The mask reports the change, so the text input's own handler has nothing to report.
  const input = useTextInput({ disabled })
  const masked = useMaskedInput({ mask, onValueChange, announceRejections, messages })
  const { inputMode, onChange, onFocus, onCompositionStart, onCompositionEnd, ref } =
    masked.inputProps
  const fieldProps = input.inputProps

  const inputProps = useMemo<NumberInputPartProps>(
    () => ({
      ...fieldProps,
      className: 'kv-input kv-input--numeric',
      type: 'text',
      spellCheck: false,
      ...(inputMode === undefined ? {} : { inputMode }),
      onChange,
      onFocus: (event: FocusEvent<HTMLInputElement>) => {
        fieldProps.onFocus(event)
        onFocus(event)
      },
      onCompositionStart,
      onCompositionEnd,
      ref,
    }),
    [fieldProps, inputMode, onChange, onFocus, onCompositionStart, onCompositionEnd, ref],
  )

  return {
    inputProps,
    mask,
    format: masked.format,
    unmask: masked.unmask,
    isInvalid: input.isInvalid,
    isRequired: input.isRequired,
    isDisabled: input.isDisabled,
    isFocusVisible: input.isFocusVisible,
  }
}
