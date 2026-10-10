import { useMemo } from 'react'
import type { ChangeEvent, ChangeEventHandler } from 'react'
import { useFieldControl } from '../field/use-field-control.ts'
import type {
  FieldControlOptions,
  FieldControlState,
  InputControlPartProps,
} from '../field/use-field-control.ts'

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

export interface UseTextareaOptions extends FieldControlOptions<TextareaChangeDetails> {
  /** The box's height in lines, and its minimum when the theme lets it grow. Default 5. */
  rows?: number | undefined
  /**
   * Called with the new value on every change. It only reports: the value lives in your form
   * state, or in the native `<textarea>` when you don't pass `value`.
   */
  onValueChange?: ((value: string, details: TextareaChangeDetails) => void) | undefined
}

/** Spread on the `<textarea>`. */
export interface TextareaPartProps extends InputControlPartProps {
  /** The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-textarea`. */
  className: 'kv-textarea'
  rows: number
  onChange: ChangeEventHandler<HTMLTextAreaElement>
}

export interface UseTextareaResult extends FieldControlState {
  textareaProps: TextareaPartProps
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
  const { controlProps, ...state } = useFieldControl({ disabled })

  const textareaProps = useMemo<TextareaPartProps>(
    () => ({
      ...controlProps,
      className: 'kv-textarea',
      rows,
      onChange: (event: ChangeEvent<HTMLTextAreaElement>) => {
        onValueChange?.(event.currentTarget.value, { reason: 'input', event })
      },
    }),
    [controlProps, rows, onValueChange],
  )

  return { textareaProps, ...state }
}
