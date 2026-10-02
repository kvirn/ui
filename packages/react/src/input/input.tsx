'use client'
import { useContext, useEffect, useRef } from 'react'
import type { ComponentPropsWithRef, ReactElement } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { FieldContext } from '../field/field-context.ts'
import { joinIds } from '../field/field-state.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { useInput } from './use-input.ts'
import type { InputChangeDetails, InputType } from './use-input.ts'

export type { InputChangeDetails, InputType } from './use-input.ts'

/** What `render` receives as its second argument. */
export interface InputState {
  isInvalid: boolean
  isRequired: boolean
  isDisabled: boolean
  isFocusVisible: boolean
}

export interface InputProps extends Omit<
  ComponentPropsWithRef<'input'>,
  'type' | 'value' | 'defaultValue'
> {
  /** Default `'text'`. Never `number` or `date` (ADR-0030). */
  type?: InputType | undefined
  /** Controlled: the value from your form state. */
  value?: string | undefined
  /** Uncontrolled: the native input keeps the value, and a form submit sends it. */
  defaultValue?: string | undefined
  /** Reports each change, with `{ reason: 'input', event }`. `onChange` still works too. */
  onValueChange?: ((value: string, details: InputChangeDetails) => void) | undefined
  render?: RenderProp<ComponentPropsWithRef<'input'>, InputState> | undefined
}

function hasNameSource(input: HTMLInputElement): boolean {
  return (
    input.hasAttribute('aria-label') ||
    input.hasAttribute('aria-labelledby') ||
    input.hasAttribute('title') ||
    (input.labels?.length ?? 0) > 0
  )
}

/**
 * A native text `<input>`, wired to its Field: the label names it, and the hint and error
 * describe it (ADR-0029, contract: input.a11y.md). It holds no form state: pass `value` and
 * `onValueChange`, or `defaultValue` and `name` for a plain form, or spread your form library's
 * props. Numbers are text with `inputMode` (ADR-0030).
 *
 * @example
 * <Field.Root>
 *   <Field.Label>Antal barn</Field.Label>
 *   <Input name="children" inputMode="numeric" spellCheck={false} className="kv-input--width-2" />
 * </Field.Root>
 */
export function Input({
  type,
  disabled,
  onValueChange,
  id,
  'aria-describedby': ownDescribedBy,
  render,
  ref,
  ...otherProps
}: InputProps): ReactElement {
  const field = useContext(FieldContext)
  const input = useInput({ type, disabled, onValueChange })
  const elementRef = useRef<HTMLInputElement | null>(null)
  const mergedRef = useMergedRef(ref, elementRef)

  useEffect(() => {
    if (field !== null && id !== undefined) {
      warnOnce(
        'input-id-in-field',
        `An Input inside a Field got id="${id}", which is ignored so the Field's label and hint stay linked. Set the id with controlId on Field.Root.`,
      )
    }
  }, [field, id])
  useEffect(() => {
    const element = elementRef.current
    if (element === null || hasNameSource(element)) {
      return
    }
    if (field !== null) {
      warnOnce(
        'input-in-field-without-label',
        'An Input in a Field has no Field.Label, so it has no accessible name (WCAG 1.3.1, 4.1.2). Add <Field.Label> to the Field.',
      )
    } else {
      warnOnce(
        'input-without-name',
        'An Input has no accessible name. A placeholder isn’t a label: it disappears when the user types (WCAG 3.3.2). Put it in a Field with a Field.Label, or give it aria-labelledby.',
      )
    }
  })

  // Inside a Field, the Field's id wins, and your own aria-describedby ids come after its ids.
  const ownId = field === null ? { id } : {}
  const describedBy = joinIds(input.inputProps['aria-describedby'], ownDescribedBy)

  return renderPart({
    render,
    defaultElement: 'input',
    partProps: {
      ...mergeProps(otherProps, ownId, input.inputProps),
      'aria-describedby': describedBy,
      ref: mergedRef,
    },
    state: {
      isInvalid: input.isInvalid,
      isRequired: input.isRequired,
      isDisabled: input.isDisabled,
      isFocusVisible: input.isFocusVisible,
    },
  })
}
