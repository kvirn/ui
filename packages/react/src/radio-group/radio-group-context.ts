import { createContext } from 'react'
import type { ChangeEventHandler } from 'react'

// Internal. How a RadioGroup hands each Radio inside it the props it derives from the group's
// `value` (ADR-0029, item 0): nothing is stored, the group only computes.

/** What a RadioGroup puts on one of its radios. */
export interface RadioGroupItemProps {
  /** The group's `name`: every radio shares it, so the browser groups them. */
  name: string
  /** From the group's `value`: controlled. */
  checked?: boolean
  /** From the group's `defaultValue`: uncontrolled. */
  defaultChecked?: boolean
  /** Reports the group's next value. */
  onChange: ChangeEventHandler<HTMLInputElement>
  /** The group is invalid. Styling only: a radio never gets `aria-invalid` (ADR-0029, item 10). */
  'data-invalid'?: ''
  'data-disabled'?: ''
}

export interface RadioGroupContextValue {
  getRadioProps: (value: string) => RadioGroupItemProps
}

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null)
