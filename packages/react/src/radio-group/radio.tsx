'use client'
import { createElement, useContext, useRef } from 'react'
import type { ComponentPropsWithRef, ReactElement } from 'react'
import { FieldContext } from '../field/field-context.ts'
import { joinIds } from '../field/field-state.ts'
import { useControlWarnings } from '../field/use-control-warnings.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { useRadio } from './use-radio.ts'

export interface RadioProps extends Omit<
  ComponentPropsWithRef<'input'>,
  'type' | 'checked' | 'defaultChecked' | 'value'
> {
  /** What a form submit sends when checked, and this option's value inside a RadioGroup. */
  value?: string | undefined
  /** Outside a RadioGroup only: whether this radio is checked. The group sets it otherwise. */
  checked?: boolean | undefined
  /** Outside a RadioGroup only. The group's `defaultValue` sets it otherwise. */
  defaultChecked?: boolean | undefined
}

/**
 * A native `<input type="radio">`, wired to its Field and RadioGroup: the label names it, and
 * the option's help text describes it (contract: radio-group.a11y.md). Put it directly in
 * `Field.Root`, before the label, inside a `RadioGroup.Root`, and write it `RadioGroup.Radio`.
 * The group gives it its `name` and its checked state from `value`, and reports the change. The
 * browser does the keys: one Tab stop, the arrow keys move and check. It never gets
 * `aria-invalid` and has no `data-focus-visible`: style focus with `:focus-visible`.
 *
 * @example
 * <Field.Root>
 *   <RadioGroup.Radio value="sv" />
 *   <Field.Label>Svenska</Field.Label>
 * </Field.Root>
 */
export function Radio({
  value,
  name,
  checked,
  defaultChecked,
  disabled,
  id,
  'aria-describedby': ownDescribedBy,
  ref,
  ...otherProps
}: RadioProps): ReactElement {
  const field = useContext(FieldContext)
  const radio = useRadio({ value, name, checked, defaultChecked, disabled })
  const elementRef = useRef<HTMLInputElement | null>(null)
  const mergedRef = useMergedRef(ref, elementRef)
  useControlWarnings({ elementRef, isInField: field !== null, id, componentName: 'Radio' })

  // Inside a Field, the Field's id wins, and your own aria-describedby ids come after its ids.
  const ownId = field === null ? { id } : {}
  const describedBy = joinIds(radio.inputProps['aria-describedby'], ownDescribedBy)

  return createElement('input', {
    ...mergeProps(otherProps, ownId, radio.inputProps),
    'aria-describedby': describedBy,
    ref: mergedRef,
  })
}
Radio.displayName = 'Radio'
