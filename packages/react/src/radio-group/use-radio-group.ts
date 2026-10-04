import { useCallback, useId } from 'react'
import type { ChangeEvent } from 'react'
import type { RadioGroupItemProps } from './radio-group-context.ts'

export type { RadioGroupItemProps } from './radio-group-context.ts'

/** The second argument of `onValueChange`. */
export interface RadioGroupChangeDetails {
  reason: 'input'
  event: ChangeEvent<HTMLInputElement>
}

export interface UseRadioGroupOptions {
  /** The `name` every radio shares. Default: generated. */
  name?: string | undefined
  /** Controlled: the value of the checked radio from your form logic. `null`: none checked. */
  value?: string | null | undefined
  /** Uncontrolled: the value checked at the start. The browser keeps the state after that. */
  defaultValue?: string | undefined
  /**
   * Called with the value of the radio the user chose. It only reports: the group stores
   * nothing.
   */
  onValueChange?: ((value: string, details: RadioGroupChangeDetails) => void) | undefined
  /** `data-invalid` on every radio, for styling. No `aria-invalid`: the group's error describes it. */
  invalid?: boolean | undefined
  /** `data-disabled` on every radio. The `<fieldset disabled>` does the disabling. */
  disabled?: boolean | undefined
}

export interface UseRadioGroupResult {
  /** The shared `name`: the one given, else a generated one. */
  name: string
  /** The props for the radio with this value: `name`, `checked`, `onChange` and `data-*`. */
  getRadioProps: (value: string) => RadioGroupItemProps
}

/**
 * The value logic of a group of radios, for your own fieldset (contract:
 * radio-group.a11y.md). Pair it with `useFieldset({ group: true })` for the legend, help text and
 * error. The browser does the keys: radios that share a `name` are one Tab stop, and the arrow
 * keys move and check. It holds no state: it derives each radio's props from `value`.
 *
 * @example
 * const group = useRadioGroup({ value, onValueChange: setValue })
 * <input type="radio" value="sv" {...group.getRadioProps('sv')} />
 */
export function useRadioGroup({
  name,
  value,
  defaultValue,
  onValueChange,
  invalid = false,
  disabled = false,
}: UseRadioGroupOptions = {}): UseRadioGroupResult {
  const generatedName = useId()
  const resolvedName = name ?? generatedName

  const getRadioProps = useCallback(
    (itemValue: string): RadioGroupItemProps => ({
      name: resolvedName,
      ...(value === undefined
        ? defaultValue === undefined
          ? {}
          : { defaultChecked: defaultValue === itemValue }
        : { checked: value === itemValue }),
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        // A native radio reports only when it becomes checked.
        onValueChange?.(itemValue, { reason: 'input', event })
      },
      ...(invalid ? { 'data-invalid': '' as const } : {}),
      ...(disabled ? { 'data-disabled': '' as const } : {}),
    }),
    [resolvedName, value, defaultValue, onValueChange, invalid, disabled],
  )

  return { name: resolvedName, getRadioProps }
}
