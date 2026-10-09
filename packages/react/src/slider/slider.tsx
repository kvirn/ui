'use client'
import { createElement, useContext, useRef } from 'react'
import type { ComponentPropsWithRef, ReactElement } from 'react'
import { FieldContext } from '../field/field-context.ts'
import { joinIds } from '../field/field-state.ts'
import { useControlWarnings } from '../field/use-control-warnings.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { useSlider } from './use-slider.ts'
import type { SliderChangeDetails } from './use-slider.ts'

export type { SliderChangeDetails } from './use-slider.ts'

export interface SliderProps extends Omit<
  ComponentPropsWithRef<'input'>,
  'type' | 'role' | 'required' | 'readOnly' | 'value' | 'defaultValue' | 'min' | 'max' | 'step'
> {
  /** Controlled: the number from your form logic. Pair it with `onValueChange`. */
  value?: number | undefined
  /** Uncontrolled: the native input keeps the number, and a form submit sends it. */
  defaultValue?: number | undefined
  /** The lowest value (`0` by default). */
  min?: number | undefined
  /** The highest value (`100` by default). */
  max?: number | undefined
  /** The distance between values (`1` by default). */
  step?: number | undefined
  /** Reports each change, with `{ reason: 'input', event }`. `onChange` still works too. */
  onValueChange?: ((value: number, details: SliderChangeDetails) => void) | undefined
  /** The value as a screen reader speaks it, with its unit: `(km) => \`${km} km\``. */
  valueText?: ((value: number) => string) | undefined
}

/**
 * A native `<input type="range">`, wired to its Field: the label names it, and the help text
 * describes it (contract: slider.a11y.md). For an approximate value; an exact one is a
 * NumberInput. It holds no form state: pass `value` and `onValueChange`, or `defaultValue` and
 * `name` for a plain form. Say the unit in `valueText`.
 *
 * @example
 * <Field.Root>
 *   <Field.Label>Avstånd i kilometer</Field.Label>
 *   <Slider name="distance" max={50} step={5} valueText={(km) => `${km} km`} />
 * </Field.Root>
 */
export function Slider({
  value,
  defaultValue,
  min,
  max,
  step,
  name,
  disabled,
  onValueChange,
  valueText,
  id,
  'aria-describedby': ownDescribedBy,
  'aria-labelledby': ariaLabelledBy,
  ref,
  ...otherProps
}: SliderProps): ReactElement {
  const field = useContext(FieldContext)
  const control = useSlider({
    value,
    defaultValue,
    min,
    max,
    step,
    name,
    disabled,
    onValueChange,
    valueText,
    'aria-labelledby': ariaLabelledBy,
  })
  const elementRef = useRef<HTMLInputElement | null>(null)
  const { ref: hookRef, ...inputProps } = control.inputProps
  const mergedRef = useMergedRef(useMergedRef(ref, hookRef), elementRef)
  useControlWarnings({
    elementRef,
    isInField: field !== null && ariaLabelledBy === undefined,
    id,
    componentName: 'Slider',
  })

  // Inside a Field, the Field's id wins, and your own aria-describedby ids come after its ids.
  const ownId = field === null || ariaLabelledBy !== undefined ? { id } : {}
  const describedBy = joinIds(inputProps['aria-describedby'], ownDescribedBy)

  return createElement('input', {
    ...mergeProps(otherProps, ownId, inputProps),
    'aria-describedby': describedBy,
    ref: mergedRef,
  })
}
Slider.displayName = 'Slider'
