'use client'
import { getCharacterCount } from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import {
  createElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ComponentPropsWithRef, ReactElement } from 'react'
import { CharacterCount } from '../character-count/character-count.tsx'
import { warnOnce } from '../dev/dev-warning.ts'
import { FieldContext } from '../field/field-context.ts'
import { joinIds } from '../field/field-state.ts'
import { useControlWarnings } from '../field/use-control-warnings.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { useTextarea } from './use-textarea.ts'
import type { TextareaChangeDetails } from './use-textarea.ts'

export type { TextareaChangeDetails } from './use-textarea.ts'

export interface TextareaProps extends Omit<
  ComponentPropsWithRef<'textarea'>,
  'value' | 'defaultValue' | 'dir'
> {
  /** Controlled: the value from your form state. */
  value?: string | undefined
  /** Uncontrolled: the native box keeps the value, and a form submit sends it. */
  defaultValue?: string | undefined
  /** Reports each change, with `{ reason: 'input', event }`. `onChange` still works too. */
  onValueChange?: ((value: string, details: TextareaChangeDetails) => void) | undefined
  /**
   * Shows how many characters are left under the box, with `maxLength` as the limit. The limit
   * is then **not** written as the native `maxlength`, so a pasted text is never cut: the user
   * sees "N tecken för mycket" and shortens it. Over the limit is a warning (`data-over`), never
   * an error: your form decides on submit. `onValueChange` details then get `length`, `limit`
   * and `isOverLimit`. Needs `maxLength` and a `KvirnProvider` for the announcement.
   */
  characterCount?: boolean | undefined
  /**
   * With `characterCount`: counts a text your own way, such as the way your server does. Default:
   * the characters the user sees (`å` as `a` plus a combining ring, or an emoji, is one).
   */
  countCharacters?: ((value: string) => number) | undefined
  /** With `characterCount`: per-instance overrides for the count's texts. */
  messages?: Partial<KvirnMessages['characterCount']> | undefined
}

/**
 * A native multi-line `<textarea>`, wired to its Field: the label names it, and the description,
 * help text and error describe it (contract: textarea.a11y.md). It holds no form state: pass `value`
 * and `onValueChange`, or `defaultValue` and `name` for a plain form, or spread your form
 * library's props. The text direction is the page's, from the provider (there is no `dir` prop).
 * `rows` is 5 unless you set it. With `characterCount` and `maxLength` a count
 * of the characters left follows the box.
 *
 * @example
 * <Field.Root required>
 *   <Field.Label>Beskriv din situation</Field.Label>
 *   <Textarea name="situation" maxLength={1000} characterCount />
 * </Field.Root>
 */
export function Textarea({
  disabled,
  rows,
  onValueChange,
  characterCount = false,
  countCharacters,
  messages,
  maxLength,
  value,
  defaultValue,
  id,
  'aria-describedby': ownDescribedBy,
  ref,
  ...otherProps
}: TextareaProps): ReactElement {
  const field = useContext(FieldContext)
  const countId = useId()
  const elementRef = useRef<HTMLTextAreaElement | null>(null)
  const mergedRef = useMergedRef(ref, elementRef)
  const limit = characterCount ? maxLength : undefined
  const hasCount = limit !== undefined
  const isControlled = value !== undefined

  // The native box keeps an uncontrolled value. Only a count needs to know it, so only a count
  // keeps it in state: without `characterCount` the component adds no state of its own.
  const [typedValue, setTypedValue] = useState(defaultValue ?? '')
  const currentValue = value ?? typedValue
  const count = useMemo(
    () =>
      limit === undefined
        ? undefined
        : getCharacterCount({ value: currentValue, limit, countCharacters }),
    [limit, currentValue, countCharacters],
  )
  const isOverLimit = count?.isOver ?? false

  const reportValueChange = useCallback(
    (nextValue: string, details: TextareaChangeDetails) => {
      if (limit === undefined) {
        onValueChange?.(nextValue, details)
        return
      }
      if (!isControlled) {
        setTypedValue(nextValue)
      }
      const next = getCharacterCount({ value: nextValue, limit, countCharacters })
      onValueChange?.(nextValue, {
        ...details,
        length: next.length,
        limit: next.limit,
        isOverLimit: next.isOver,
      })
    },
    [limit, countCharacters, isControlled, onValueChange],
  )
  const textarea = useTextarea({ disabled, rows, onValueChange: reportValueChange })

  useControlWarnings({ elementRef, isInField: field !== null, id, componentName: 'Textarea' })
  useEffect(() => {
    if (characterCount && maxLength === undefined) {
      warnOnce(
        'textarea-character-count-without-limit',
        'A Textarea has characterCount but no maxLength, so it has no limit to count against and renders no count. Set maxLength to the limit the form allows: it is the count’s limit and is not written as the native attribute (WCAG 3.3.8).',
      )
    }
  }, [characterCount, maxLength])

  // The native box keeps an uncontrolled value, and some changes fire no input event. Read it
  // from the element: once on mount, because the browser may have restored a form's values; on
  // `pageshow`, because a page restored from the back/forward cache restores them again; and after
  // a form reset, once the browser has put the default back.
  useEffect(() => {
    const element = elementRef.current
    if (!hasCount || isControlled || element === null) {
      return undefined
    }
    const readValue = () => {
      setTypedValue(element.value)
    }
    readValue()
    window.addEventListener('pageshow', readValue)
    const form = element.form
    let resetTimer: ReturnType<typeof setTimeout> | undefined
    const onReset = () => {
      resetTimer = setTimeout(readValue)
    }
    form?.addEventListener('reset', onReset)
    return () => {
      window.removeEventListener('pageshow', readValue)
      form?.removeEventListener('reset', onReset)
      clearTimeout(resetTimer)
    }
  }, [hasCount, isControlled])

  // Inside a Field, the Field's id wins, and your own aria-describedby ids come after its ids.
  // The Field lists the count itself, as one of its descriptions. Outside a Field the box lists
  // it (the count registers with a Field only, never with a Fieldset around the box).
  const isOutsideField = field === null
  const ownId = isOutsideField ? { id } : {}
  const describedBy = joinIds(
    textarea.textareaProps['aria-describedby'],
    ownDescribedBy,
    hasCount && isOutsideField ? countId : undefined,
  )

  const element = createElement('textarea', {
    ...mergeProps(otherProps, ownId, textarea.textareaProps),
    // With a count, maxLength is the count's limit: the native attribute would cut a paste.
    ...(maxLength !== undefined && !characterCount ? { maxLength } : {}),
    ...(isControlled ? { value } : {}),
    ...(defaultValue !== undefined && !isControlled ? { defaultValue } : {}),
    ...(isOverLimit ? { 'data-over': '' } : {}),
    'aria-describedby': describedBy,
    ref: mergedRef,
  })
  if (limit === undefined) {
    return element
  }
  return (
    <>
      {element}
      <CharacterCount
        id={countId}
        value={currentValue}
        limit={limit}
        countCharacters={countCharacters}
        announceChanges={textarea.isFocused}
        messages={messages}
      />
    </>
  )
}
Textarea.displayName = 'Textarea'
