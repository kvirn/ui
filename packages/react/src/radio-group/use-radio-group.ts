import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { RadioGroupItemProps, RadioGroupRevealItemProps } from './radio-group-context.ts'

export type { RadioGroupItemProps, RadioGroupRevealItemProps } from './radio-group-context.ts'

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
  /**
   * The props for the content that belongs to the radio with this value: `id`, `hidden` unless
   * that radio is checked, and `data-state`. Put it right after the radio's field.
   */
  getRevealProps: (value: string) => RadioGroupRevealItemProps
  /**
   * Call from an effect when a reveal for this value is mounted: the radio then gets
   * `aria-controls`. Returns the cleanup.
   */
  registerReveal: (value: string) => () => void
  /**
   * `true` once, if the user (not your `value`) has just checked this radio: the moment to
   * announce that a field appeared.
   */
  consumeUserChoice: (value: string) => boolean
  /** Call when the surrounding form resets: an uncontrolled group goes back to `defaultValue`. */
  resetSelection: () => void
}

function getRevealId(base: string, value: string): string {
  return `${base}-reveal-${encodeURIComponent(value)}`
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
  const revealIdBase = useId()
  // UI state only, to show the reveal of an uncontrolled group; the browser owns the checked state.
  const [mirroredValue, setMirroredValue] = useState<string | null>(defaultValue ?? null)
  const [revealValues, setRevealValues] = useState<ReadonlySet<string>>(() => new Set())
  const userChoice = useRef<string | null>(null)
  const selectedValue = value === undefined ? mirroredValue : value

  useEffect(() => {
    userChoice.current = null
  })

  const getRadioProps = useCallback(
    (itemValue: string): RadioGroupItemProps => ({
      name: resolvedName,
      ...(revealValues.has(itemValue)
        ? { 'aria-controls': getRevealId(revealIdBase, itemValue) }
        : {}),
      ...(value === undefined
        ? defaultValue === undefined
          ? {}
          : { defaultChecked: defaultValue === itemValue }
        : { checked: value === itemValue }),
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        // A native radio reports only when it becomes checked.
        userChoice.current = itemValue
        setMirroredValue(itemValue)
        onValueChange?.(itemValue, { reason: 'input', event })
      },
      ...(invalid ? { 'data-invalid': '' as const } : {}),
      ...(disabled ? { 'data-disabled': '' as const } : {}),
    }),
    [
      resolvedName,
      value,
      defaultValue,
      onValueChange,
      invalid,
      disabled,
      revealIdBase,
      revealValues,
    ],
  )

  const getRevealProps = useCallback(
    (itemValue: string): RadioGroupRevealItemProps => {
      const isOpen = selectedValue === itemValue
      return {
        className: 'kv-radio-group-reveal',
        id: getRevealId(revealIdBase, itemValue),
        ...(isOpen ? {} : { hidden: true as const }),
        'data-state': isOpen ? 'open' : 'closed',
      }
    },
    [revealIdBase, selectedValue],
  )

  const registerReveal = useCallback((itemValue: string) => {
    setRevealValues((current) => new Set(current).add(itemValue))
    return () => {
      setRevealValues((current) => {
        const next = new Set(current)
        next.delete(itemValue)
        return next
      })
    }
  }, [])

  const consumeUserChoice = useCallback((itemValue: string) => {
    const chosen = userChoice.current === itemValue
    userChoice.current = null
    return chosen
  }, [])

  const resetSelection = useCallback(() => {
    setMirroredValue(defaultValue ?? null)
  }, [defaultValue])

  return {
    name: resolvedName,
    getRadioProps,
    getRevealProps,
    registerReveal,
    consumeUserChoice,
    resetSelection,
  }
}
