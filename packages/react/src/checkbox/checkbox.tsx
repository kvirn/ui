'use client'
import { createElement, useContext, useRef } from 'react'
import type { ComponentPropsWithRef, ReactElement } from 'react'
import { FieldContext } from '../field/field-context.ts'
import { joinIds } from '../field/field-state.ts'
import { useControlWarnings } from '../field/use-control-warnings.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { useCheckbox } from './use-checkbox.ts'
import type { CheckboxChangeDetails } from './use-checkbox.ts'

export type { CheckboxChangeDetails, CheckboxDataState } from './use-checkbox.ts'

export interface CheckboxProps extends Omit<
  ComponentPropsWithRef<'input'>,
  'type' | 'checked' | 'defaultChecked' | 'value'
> {
  /** Controlled: the state from your form logic. Pair it with `onCheckedChange`. */
  checked?: boolean | undefined
  /** Uncontrolled: the native input keeps the state, and a form submit sends it. */
  defaultChecked?: boolean | undefined
  /**
   * The mixed state, set as the DOM property after render. The prop decides: a click checks the
   * box, and you pass `false` once the user has chosen.
   */
  indeterminate?: boolean | undefined
  /** What a form submit sends when checked, and the item's value inside a CheckboxGroup. */
  value?: string | undefined
  /** Reports each change, with `{ reason: 'input', event }`. `onChange` still works too. */
  onCheckedChange?: ((checked: boolean, details: CheckboxChangeDetails) => void) | undefined
}

/**
 * A native `<input type="checkbox">`, wired to its Field and CheckboxGroup: the label names it,
 * and the option's help text and the error describe it (contract: checkbox.a11y.md). It holds no
 * form state: pass `checked` and `onCheckedChange`, or `defaultChecked` and `name` for a plain
 * form, or spread your form library's props. Put it directly in `Field.Root`, before the label.
 *
 * @example
 * <Field.Root required invalid={errors.declaration !== undefined}>
 *   <Checkbox name="declaration" />
 *   <Field.Label>Jag intygar att uppgifterna är korrekta</Field.Label>
 *   <Field.ErrorMessage>{errors.declaration}</Field.ErrorMessage>
 * </Field.Root>
 */
export function Checkbox({
  checked,
  defaultChecked,
  indeterminate,
  value,
  name,
  disabled,
  onCheckedChange,
  id,
  'aria-describedby': ownDescribedBy,
  ref,
  ...otherProps
}: CheckboxProps): ReactElement {
  const field = useContext(FieldContext)
  const checkbox = useCheckbox({
    checked,
    defaultChecked,
    indeterminate,
    value,
    name,
    disabled,
    onCheckedChange,
  })
  const elementRef = useRef<HTMLInputElement | null>(null)
  const { ref: hookRef, ...inputProps } = checkbox.inputProps
  const mergedRef = useMergedRef(useMergedRef(ref, hookRef), elementRef)
  useControlWarnings({ elementRef, isInField: field !== null, id, componentName: 'Checkbox' })

  // Inside a Field, the Field's id wins, and your own aria-describedby ids come after its ids.
  const ownId = field === null ? { id } : {}
  const describedBy = joinIds(inputProps['aria-describedby'], ownDescribedBy)

  return createElement('input', {
    ...mergeProps(otherProps, ownId, inputProps),
    'aria-describedby': describedBy,
    ref: mergedRef,
  })
}
Checkbox.displayName = 'Checkbox'
