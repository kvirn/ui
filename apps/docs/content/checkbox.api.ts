import type { CheckboxProps, UseCheckboxOptions, UseCheckboxResult } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

/** The props Checkbox documents: its own, and the native ones whose behaviour it changes. */
export type CheckboxDocumentedProps = Pick<
  CheckboxProps,
  'checked' | 'defaultChecked' | 'indeterminate' | 'value' | 'name' | 'disabled' | 'onCheckedChange'
>

export const checkboxRows = propRows<CheckboxDocumentedProps>({
  checked: {
    type: 'boolean',
    default: '–',
    description:
      'Controlled: the state from your form logic. Pair it with onCheckedChange. The checkbox never copies it into state of its own.',
  },
  defaultChecked: {
    type: 'boolean',
    default: '–',
    description: 'Uncontrolled: the browser keeps the state, and a form submit sends it.',
  },
  indeterminate: {
    type: 'boolean',
    default: 'false',
    description:
      'The mixed state, set as the DOM property after render. A click never clears it: you pass false once the user has chosen.',
  },
  value: {
    type: 'string',
    default: '–',
    description:
      'What a form submit sends when checked, and the option’s value in a CheckboxGroup.',
  },
  name: {
    type: 'string',
    default: '–',
    description:
      'The name a form submit uses. In a CheckboxGroup, the group’s name is the default and yours wins.',
  },
  disabled: {
    type: 'boolean',
    default: 'false',
    description:
      'Native disabled: skipped by Tab. A disabled Field disables the checkbox too, and the group can too.',
  },
  onCheckedChange: {
    type: '(checked: boolean, details: CheckboxChangeDetails) => void',
    default: '–',
    description:
      'Called on every change with the new state and { reason: "input", event }. It only reports. onChange still works too.',
  },
})

export const checkboxAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-checkbox',
    values: 'always',
    meaning: 'The part class. The default theme styles it.',
  },
  {
    name: 'data-state',
    values: '"checked", "unchecked" or "indeterminate"',
    meaning: 'Follows the props when controlled, and the native state after each change when not.',
  },
  {
    name: 'data-invalid',
    values: 'present or absent',
    meaning: 'The Field or the CheckboxGroup is invalid.',
  },
  {
    name: 'data-required',
    values: 'present or absent',
    meaning: 'The Field is required.',
  },
  {
    name: 'data-disabled',
    values: 'present or absent',
    meaning: 'The Field, the group or the disabled prop disables it.',
  },
  {
    name: 'data-focus-visible',
    values: 'present or absent',
    meaning: 'The checkbox has keyboard focus (:focus-visible).',
  },
  {
    name: 'aria-invalid',
    values: '"true" or absent',
    meaning:
      'Set when its Field is invalid. A checkbox in an invalid group gets only data-invalid.',
  },
  {
    name: 'aria-required',
    values: '"true" or absent',
    meaning: 'Set when its Field is required. Not passed directly.',
  },
]

export const useCheckboxHook: ApiHook = {
  name: 'useCheckbox',
  options: propRows<UseCheckboxOptions>({
    checked: {
      type: 'boolean',
      default: '–',
      description: 'Controlled: the state from your form logic.',
    },
    defaultChecked: {
      type: 'boolean',
      default: '–',
      description: 'Uncontrolled: the browser keeps the state.',
    },
    indeterminate: {
      type: 'boolean',
      default: 'false',
      description: 'The mixed state, set as the DOM property. You clear it, a click does not.',
    },
    value: {
      type: 'string',
      default: '–',
      description: 'The value a form submit sends, and the option’s value in a CheckboxGroup.',
    },
    name: {
      type: 'string',
      default: '–',
      description:
        'The name a form submit uses. In a CheckboxGroup, the group’s name is the default.',
    },
    disabled: { type: 'boolean', default: 'false', description: 'Native disabled.' },
    onCheckedChange: {
      type: '(checked: boolean, details: CheckboxChangeDetails) => void',
      default: '–',
      description: 'Called with the new checked state on every change. It only reports.',
    },
  }),
  result: propRows<UseCheckboxResult>({
    inputProps: {
      type: 'CheckboxPartProps',
      default: '–',
      description:
        'Spread on an <input type="checkbox">: class, type, Field wiring, state attributes and handlers. Includes a ref that sets the DOM indeterminate property, so merge it with yours.',
    },
    isIndeterminate: { type: 'boolean', default: '–', description: 'The indeterminate option.' },
    isInvalid: {
      type: 'boolean',
      default: '–',
      description: 'Whether the Field or the CheckboxGroup is invalid.',
    },
    isRequired: { type: 'boolean', default: '–', description: 'Whether the Field is required.' },
    isDisabled: { type: 'boolean', default: '–', description: 'Whether the checkbox is disabled.' },
    isFocusVisible: {
      type: 'boolean',
      default: '–',
      description: 'Whether the checkbox has keyboard (:focus-visible) focus.',
    },
  }),
}
