import type { Mask, MaskInput } from '@kvirn-ui/core'
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
import type { TextInputChangeDetails, TextInputPartProps } from '../text-input/use-text-input.ts'
import { useTextInput } from '../text-input/use-text-input.ts'

/**
 * The mask that runs when `mask` isn't passed. `false` until the telephone mask keeps Unicode
 * digits and a dot: today it would refuse a number typed on an Arabic keyboard. Then this is
 * `'telephone'`, and nothing else changes.
 */
export const defaultPhoneMask: MaskInput | false = false

export interface UsePhoneInputOptions {
  /**
   * `false` (the default): no mask, so no correctly typed number is ever refused. A name such as
   * `'telephone'` (digits, `+`, space, `-`, `(` and `)`; the rest is left out and announced), a
   * `{ pattern }`, a `RegExp` or a finished mask from `masks` shapes the value instead. The value
   * is never formatted either way.
   */
  mask?: MaskInput | false | undefined
  /** Native `disabled`. A disabled Field disables the input too. */
  disabled?: boolean | undefined
  /**
   * Called with the text as the user wrote it on every change. It only reports: the value lives
   * in your form state, or in the native input. Normalise it to E.164 on the server.
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

/** Spread on the `<input>`. The attributes are suggestions: put yours after them. */
export interface PhoneInputPartProps extends Omit<
  TextInputPartProps,
  'className' | 'type' | 'onChange' | 'onFocus'
> {
  /**
   * The part's classes, for `@kvirn-ui/theme` and your own CSS: `.kv-input`, `.kv-input--numeric`
   * (tabular figures) and `.kv-phone-input` (20 characters wide). A `kv-input--width-*` class of
   * yours wins: join it with `mergeProps`.
   */
  className: 'kv-input kv-input--numeric kv-phone-input'
  type: 'tel'
  inputMode: 'tel'
  spellCheck: false
  /** The number stays left to right in a right-to-left page, so `+46` stays first. */
  dir: 'ltr'
  /** The full number, which is what autofill stores. */
  autoComplete: 'tel'
  onChange: ChangeEventHandler<HTMLInputElement>
  onFocus: FocusEventHandler<HTMLInputElement>
  onCompositionStart: CompositionEventHandler<HTMLInputElement>
  onCompositionEnd: CompositionEventHandler<HTMLInputElement>
  /** Tracks the value before each edit, to tell what the user inserted. */
  ref: RefCallback<HTMLInputElement>
}

export interface UsePhoneInputResult {
  inputProps: PhoneInputPartProps
  /** The mask that runs, before the provider's locale is applied. `undefined` when there is none. */
  mask: Mask | undefined
  isInvalid: boolean
  isRequired: boolean
  isDisabled: boolean
  isFocusVisible: boolean
}

/**
 * A phone number input's props for your own `<input>`: `type="tel"`, the phone keypad, no
 * spell-check, left to right, `autocomplete="tel"`, wired to the nearest Field (contract:
 * phone-input.a11y.md). It never formats: the value is what the user wrote. It holds no value:
 * spread your form library's props next to it.
 *
 * @example
 * const phone = usePhoneInput({ onValueChange: (value) => form.setValue('phone', value) })
 * <input {...mergeProps(phone.inputProps, { name: 'phone' })} />
 */
export function usePhoneInput({
  mask: maskOption = defaultPhoneMask,
  disabled,
  onValueChange,
  announceRejections,
  messages,
}: UsePhoneInputOptions = {}): UsePhoneInputResult {
  // With a mask, the mask reports the change, so the text input's own handler has nothing to
  // report. Without one the text input reports a plain change.
  const hasMask = maskOption !== false
  const input = useTextInput({
    type: 'tel',
    disabled,
    onValueChange: hasMask ? undefined : onValueChange,
  })
  const masked = useMaskedInput({
    mask: hasMask ? maskOption : undefined,
    onValueChange,
    announceRejections,
    messages,
  })
  const {
    onChange: maskOnChange,
    onFocus,
    onCompositionStart,
    onCompositionEnd,
    ref,
  } = masked.inputProps
  const fieldProps = input.inputProps
  const onChange = hasMask ? maskOnChange : fieldProps.onChange

  const inputProps = useMemo<PhoneInputPartProps>(
    () => ({
      ...fieldProps,
      className: 'kv-input kv-input--numeric kv-phone-input',
      type: 'tel',
      inputMode: 'tel',
      spellCheck: false,
      dir: 'ltr',
      autoComplete: 'tel',
      onChange,
      onFocus: (event: FocusEvent<HTMLInputElement>) => {
        fieldProps.onFocus(event)
        onFocus(event)
      },
      onCompositionStart,
      onCompositionEnd,
      ref,
    }),
    [fieldProps, onChange, onFocus, onCompositionStart, onCompositionEnd, ref],
  )

  return {
    inputProps,
    mask: masked.mask,
    isInvalid: input.isInvalid,
    isRequired: input.isRequired,
    isDisabled: input.isDisabled,
    isFocusVisible: input.isFocusVisible,
  }
}
