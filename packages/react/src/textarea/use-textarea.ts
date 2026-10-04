import { useContext, useMemo } from 'react'
import type { ChangeEvent, ChangeEventHandler, FocusEventHandler } from 'react'
import { FieldContext } from '../field/field-context.ts'
import type { FieldStateAttributes } from '../field/field-state.ts'
import { useFocusVisible } from '../focus-visible/use-focus-visible.ts'

/** The second argument of `onValueChange`. */
export interface TextareaChangeDetails {
  reason: 'input'
  /** The change event. */
  event: ChangeEvent<HTMLTextAreaElement>
  /** With `characterCount`: the characters in the text, counted as the count counts them. */
  length?: number | undefined
  /** With `characterCount`: the limit (`maxLength`). */
  limit?: number | undefined
  /** With `characterCount`: the text is longer than the limit. It is a warning, never an error. */
  isOverLimit?: boolean | undefined
}

export interface UseTextareaOptions {
  /** Native `disabled`. A disabled Field disables the box too. */
  disabled?: boolean | undefined
  /** The box's height in lines, and its minimum when the theme lets it grow. Default 5. */
  rows?: number | undefined
  /**
   * Called with the new value on every change. It only reports: the value lives in your form
   * state, or in the native `<textarea>` when you don't pass `value`.
   */
  onValueChange?: ((value: string, details: TextareaChangeDetails) => void) | undefined
}

/** Spread on the `<textarea>`. */
export interface TextareaPartProps extends FieldStateAttributes {
  /** The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-textarea`. */
  className: 'kv-textarea'
  rows: number
  /** From the Field: the control's id. */
  id?: string
  'aria-describedby'?: string
  'aria-invalid'?: 'true'
  'aria-required'?: 'true'
  disabled?: true
  /** While it has focus, however it got it. The theme's sign that the script has run. */
  'data-focused'?: ''
  'data-focus-visible'?: ''
  onChange: ChangeEventHandler<HTMLTextAreaElement>
  onFocus: FocusEventHandler<HTMLElement>
  onBlur: FocusEventHandler<HTMLElement>
}

export interface UseTextareaResult {
  textareaProps: TextareaPartProps
  isInvalid: boolean
  isRequired: boolean
  isDisabled: boolean
  isFocused: boolean
  isFocusVisible: boolean
}

/**
 * A multi-line text box's props for your own `<textarea>`, wired to the nearest Field (contract:
 * textarea.a11y.md). It holds no value: spread your form library's props next to it. For a
 * count of the characters left, render a `CharacterCount` after the box.
 *
 * @example
 * const { textareaProps } = useTextarea({ onValueChange: (value) => form.setValue('story', value) })
 * <textarea {...textareaProps} name="story" />
 */
export function useTextarea({
  disabled = false,
  rows = 5,
  onValueChange,
}: UseTextareaOptions = {}): UseTextareaResult {
  const field = useContext(FieldContext)
  const { isFocused, isFocusVisible, focusVisibleProps } = useFocusVisible()
  const isInvalid = field?.state.isInvalid ?? false
  const isRequired = field?.state.isRequired ?? false
  const isDisabled = (field?.state.isDisabled ?? false) || disabled
  const controlProps = field?.controlProps

  const textareaProps = useMemo<TextareaPartProps>(
    () => ({
      ...controlProps,
      className: 'kv-textarea',
      rows,
      ...(isDisabled ? { disabled: true, 'data-disabled': '' } : {}),
      ...(isFocused ? { 'data-focused': '' } : {}),
      ...(isFocusVisible ? { 'data-focus-visible': '' } : {}),
      onChange: (event: ChangeEvent<HTMLTextAreaElement>) => {
        onValueChange?.(event.currentTarget.value, { reason: 'input', event })
      },
      ...focusVisibleProps,
    }),
    [controlProps, rows, isDisabled, isFocused, isFocusVisible, onValueChange, focusVisibleProps],
  )

  return { textareaProps, isInvalid, isRequired, isDisabled, isFocused, isFocusVisible }
}
