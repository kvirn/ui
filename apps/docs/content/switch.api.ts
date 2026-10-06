import type { SwitchProps, UseSwitchOptions, UseSwitchResult } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

/** The props Switch documents: its own, and the native ones whose behaviour it changes. */
export type SwitchDocumentedProps = Pick<
  SwitchProps,
  'checked' | 'defaultChecked' | 'value' | 'name' | 'disabled' | 'onCheckedChange' | 'render'
>

export const switchRows = propRows<SwitchDocumentedProps>({
  checked: {
    type: 'boolean',
    default: '–',
    description:
      'Controlled: the state from your settings logic. Pair it with onCheckedChange. The switch never copies it into state of its own.',
  },
  defaultChecked: {
    type: 'boolean',
    default: '–',
    description: 'Uncontrolled: the browser keeps the state, and a form submit sends it.',
  },
  value: {
    type: 'string',
    default: '"on"',
    description: 'What a form submit sends when the switch is on.',
  },
  name: {
    type: 'string',
    default: '–',
    description: 'The name a form submit uses. An off switch sends nothing.',
  },
  disabled: {
    type: 'boolean',
    default: 'false',
    description:
      'Native disabled: skipped by Tab. A disabled Field disables the switch too. Never disable the switch the user has just pressed: focus is lost.',
  },
  onCheckedChange: {
    type: '(checked: boolean, details: SwitchChangeDetails) => void',
    default: '–',
    description:
      'Called on every change with the new state and { reason: "input", event }. It only reports. onChange still works too.',
  },
  render: {
    type: 'RenderProp<ComponentPropsWithRef<"input">, SwitchState>',
    default: '–',
    description:
      'Changes the element, which must still be an <input type="checkbox">. A function receives the props and { isInvalid, isDisabled, isFocusVisible }.',
  },
})

export const switchAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-switch',
    values: 'always',
    meaning: 'The part class. The default theme styles it.',
  },
  {
    name: 'role',
    values: '"switch"',
    meaning: 'Set on the native checkbox, so a screen reader says “on” and “off”.',
  },
  {
    name: 'data-state',
    values: '"checked" or "unchecked"',
    meaning: 'Follows the props when controlled, and the native state after each change when not.',
  },
  {
    name: 'data-invalid',
    values: 'present or absent',
    meaning: 'The Field is invalid.',
  },
  {
    name: 'data-disabled',
    values: 'present or absent',
    meaning: 'The Field or the disabled prop disables it.',
  },
  {
    name: 'data-focus-visible',
    values: 'present or absent',
    meaning: 'The switch has keyboard focus (:focus-visible).',
  },
  {
    name: 'aria-invalid',
    values: '"true" or absent',
    meaning: 'Set when its Field is invalid.',
  },
]

export const useSwitchHook: ApiHook = {
  name: 'useSwitch',
  options: propRows<UseSwitchOptions>({
    checked: {
      type: 'boolean',
      default: '–',
      description: 'Controlled: the state from your settings logic.',
    },
    defaultChecked: {
      type: 'boolean',
      default: '–',
      description: 'Uncontrolled: the browser keeps the state.',
    },
    value: {
      type: 'string',
      default: '"on"',
      description: 'The value a form submit sends when the switch is on.',
    },
    name: {
      type: 'string',
      default: '–',
      description: 'The name a form submit uses.',
    },
    disabled: { type: 'boolean', default: 'false', description: 'Native disabled.' },
    onCheckedChange: {
      type: '(checked: boolean, details: SwitchChangeDetails) => void',
      default: '–',
      description: 'Called with the new checked state on every change. It only reports.',
    },
  }),
  result: propRows<UseSwitchResult>({
    inputProps: {
      type: 'SwitchPartProps',
      default: '–',
      description:
        'Spread on an <input type="checkbox">: class, type, role, Field wiring, state attributes and handlers.',
    },
    isInvalid: { type: 'boolean', default: '–', description: 'Whether the Field is invalid.' },
    isDisabled: { type: 'boolean', default: '–', description: 'Whether the switch is disabled.' },
    isFocusVisible: {
      type: 'boolean',
      default: '–',
      description: 'Whether the switch has keyboard (:focus-visible) focus.',
    },
  }),
}
