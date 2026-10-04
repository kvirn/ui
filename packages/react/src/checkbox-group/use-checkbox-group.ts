import { useCallback, useRef } from 'react'
import type { ChangeEvent, RefCallback } from 'react'
import type { CheckboxChangeDetails } from '../checkbox/use-checkbox.ts'
import type { CheckboxGroupItemProps } from './checkbox-group-context.ts'

export type { CheckboxGroupItemProps } from './checkbox-group-context.ts'

/** The second argument of the group's `onValueChange`: the same as a single checkbox's. */
export type CheckboxGroupChangeDetails = CheckboxChangeDetails

export interface UseCheckboxGroupOptions {
  /** The `name` every checkbox in the group submits under. A checkbox's own `name` wins. */
  name?: string | undefined
  /** Controlled: the values of the checked boxes, from your form logic. */
  value?: readonly string[] | undefined
  /** Uncontrolled: the values checked at the start. The browser keeps the state after that. */
  defaultValue?: readonly string[] | undefined
  /**
   * Called with the next values when a box changes. Controlled, it's `value` with the box's
   * value added at the end or removed. Uncontrolled, it's read from the group's checked boxes.
   * It only reports: the group stores nothing.
   */
  onValueChange?: ((value: string[], details: CheckboxGroupChangeDetails) => void) | undefined
  /** `data-invalid` on every box, for styling. No `aria-invalid`: the group's error describes it. */
  invalid?: boolean | undefined
  /** `data-disabled` on every box. The `<fieldset disabled>` does the disabling. */
  disabled?: boolean | undefined
}

export interface UseCheckboxGroupResult {
  /** The group's `name`, as given. */
  name: string | undefined
  /**
   * Attach to the group's `<fieldset>`, so an uncontrolled group can read its checked boxes
   * when it reports `onValueChange`.
   */
  groupRef: RefCallback<HTMLFieldSetElement>
  /** The props for the checkbox with this value: `name`, `checked`, `onChange` and `data-*`. */
  getCheckboxProps: (value: string) => CheckboxGroupItemProps
}

/** Internal. `value` with `itemValue` added at the end, or removed. */
function nextValue(value: readonly string[], itemValue: string, isChecked: boolean): string[] {
  if (isChecked) {
    return value.includes(itemValue) ? [...value] : [...value, itemValue]
  }
  return value.filter((entry) => entry !== itemValue)
}

/** Internal. The values of the checked boxes of the group, in DOM order. */
function checkedValues(root: HTMLElement | null, name: string | undefined): string[] {
  if (root === null) {
    return []
  }
  return [...root.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')]
    .filter((box) => box.checked && (name === undefined || box.name === name))
    .map((box) => box.value)
}

/**
 * The value logic of a group of checkboxes, for your own fieldset (contract:
 * checkbox-group.a11y.md). Pair it with `useFieldset({ group: true })` for the legend, help text and
 * error. It holds no state: it derives each box's props from `value` and reports the next value.
 *
 * @example
 * const group = useCheckboxGroup({ name: 'contact', value, onValueChange: setValue })
 * <fieldset ref={group.groupRef}>
 *   <input type="checkbox" value="email" {...group.getCheckboxProps('email')} />
 * </fieldset>
 */
export function useCheckboxGroup({
  name,
  value,
  defaultValue,
  onValueChange,
  invalid = false,
  disabled = false,
}: UseCheckboxGroupOptions = {}): UseCheckboxGroupResult {
  const elementRef = useRef<HTMLFieldSetElement | null>(null)
  const groupRef = useCallback((element: HTMLFieldSetElement | null) => {
    elementRef.current = element
  }, [])

  const getCheckboxProps = useCallback(
    (itemValue: string): CheckboxGroupItemProps => ({
      ...(name === undefined ? {} : { name }),
      ...(value === undefined
        ? defaultValue === undefined
          ? {}
          : { defaultChecked: defaultValue.includes(itemValue) }
        : { checked: value.includes(itemValue) }),
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        if (onValueChange === undefined) {
          return
        }
        const next =
          value === undefined
            ? checkedValues(elementRef.current, name)
            : nextValue(value, itemValue, event.currentTarget.checked)
        onValueChange(next, { reason: 'input', event })
      },
      ...(invalid ? { 'data-invalid': '' as const } : {}),
      ...(disabled ? { 'data-disabled': '' as const } : {}),
    }),
    [name, value, defaultValue, onValueChange, invalid, disabled],
  )

  return { name, groupRef, getCheckboxProps }
}
