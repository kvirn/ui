import { createContext } from 'react'
import type { ChangeEventHandler } from 'react'

// Internal. How a RadioGroup hands each Radio inside it the props it derives from the group's
// `value`: nothing is stored, the group only computes.

/** What a RadioGroup puts on one of its radios. */
export interface RadioGroupItemProps {
  /** The group's `name`: every radio shares it, so the browser groups them. */
  name: string
  /** From the group's `value`: controlled. */
  checked?: boolean
  /** From the group's `defaultValue`: uncontrolled. */
  defaultChecked?: boolean
  /** The id of this option's `RadioGroup.Reveal`, while one is mounted. */
  'aria-controls'?: string
  /** Reports the group's next value. */
  onChange: ChangeEventHandler<HTMLInputElement>
  /** The group is invalid. Styling only: a radio never gets `aria-invalid`. */
  'data-invalid'?: ''
  'data-disabled'?: ''
}

/** What a RadioGroup puts on one `RadioGroup.Reveal`. */
export interface RadioGroupRevealItemProps {
  className: 'kv-radio-group-reveal'
  id: string
  hidden?: true
  'data-state': 'open' | 'closed'
}

export interface RadioGroupContextValue {
  getRadioProps: (value: string) => RadioGroupItemProps
  getRevealProps: (value: string) => RadioGroupRevealItemProps
  registerReveal: (value: string) => () => void
  consumeUserChoice: (value: string) => boolean
  resetSelection: () => void
}

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null)
