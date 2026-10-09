'use client'
import { createElement, useContext, useRef } from 'react'
import type { ComponentPropsWithRef, ReactElement } from 'react'
import { FieldContext } from '../field/field-context.ts'
import { joinIds } from '../field/field-state.ts'
import { useControlWarnings } from '../field/use-control-warnings.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { useSwitch } from './use-switch.ts'
import type { SwitchChangeDetails } from './use-switch.ts'

export type { SwitchChangeDetails, SwitchDataState } from './use-switch.ts'

export interface SwitchProps extends Omit<
  ComponentPropsWithRef<'input'>,
  'type' | 'role' | 'required' | 'checked' | 'defaultChecked' | 'value'
> {
  /** Controlled: the state from your form logic. Pair it with `onCheckedChange`. */
  checked?: boolean | undefined
  /** Uncontrolled: the native input keeps the state, and a form submit sends it. */
  defaultChecked?: boolean | undefined
  /** What a form submit sends when on (`on` by default). */
  value?: string | undefined
  /** Reports each change, with `{ reason: 'input', event }`. `onChange` still works too. */
  onCheckedChange?: ((checked: boolean, details: SwitchChangeDetails) => void) | undefined
}

/**
 * A native `<input type="checkbox" role="switch">`, wired to its Field: the label names it, and
 * the help text and the error describe it (contract: switch.a11y.md). A setting that takes
 * effect at once. It holds no form state: pass `checked` and `onCheckedChange`, or
 * `defaultChecked` and `name` for a plain form. Put it directly in `Field.Root`,
 * before the label.
 *
 * @example
 * <Field.Root>
 *   <Switch name="sms" checked={sms} onCheckedChange={setSms} />
 *   <Field.Label marker="none">Få meddelanden som sms</Field.Label>
 * </Field.Root>
 */
export function Switch({
  checked,
  defaultChecked,
  value,
  name,
  disabled,
  onCheckedChange,
  id,
  'aria-describedby': ownDescribedBy,
  ref,
  ...otherProps
}: SwitchProps): ReactElement {
  const field = useContext(FieldContext)
  const control = useSwitch({ checked, defaultChecked, value, name, disabled, onCheckedChange })
  const elementRef = useRef<HTMLInputElement | null>(null)
  const { ref: hookRef, ...inputProps } = control.inputProps
  const mergedRef = useMergedRef(useMergedRef(ref, hookRef), elementRef)
  useControlWarnings({ elementRef, isInField: field !== null, id, componentName: 'Switch' })

  // Inside a Field, the Field's id wins, and your own aria-describedby ids come after its ids.
  const ownId = field === null ? { id } : {}
  const describedBy = joinIds(inputProps['aria-describedby'], ownDescribedBy)

  return createElement('input', {
    ...mergeProps(otherProps, ownId, inputProps),
    'aria-describedby': describedBy,
    ref: mergedRef,
  })
}
Switch.displayName = 'Switch'
