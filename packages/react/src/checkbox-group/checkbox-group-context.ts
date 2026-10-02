import { createContext } from 'react'
import type { ChangeEventHandler } from 'react'

// Internal. How a CheckboxGroup hands each Checkbox inside it the props it derives from the
// group's `value` (ADR-0029, item 0): nothing is stored, the group only computes.

/** What a CheckboxGroup puts on one of its checkboxes. */
export interface CheckboxGroupItemProps {
  /** The group's `name`, when it has one. */
  name?: string
  /** From the group's `value`: controlled. */
  checked?: boolean
  /** From the group's `defaultValue`: uncontrolled. */
  defaultChecked?: boolean
  /** Reports the group's next value. */
  onChange: ChangeEventHandler<HTMLInputElement>
  /** The group is invalid. Styling only: a checkbox in a group never gets `aria-invalid`. */
  'data-invalid'?: ''
  'data-disabled'?: ''
}

export interface CheckboxGroupContextValue {
  getCheckboxProps: (value: string) => CheckboxGroupItemProps
}

export const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null)
