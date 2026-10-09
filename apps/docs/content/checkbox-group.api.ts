import type {
  CheckboxGroupRootProps,
  FieldsetLegendProps,
  UseCheckboxGroupOptions,
  UseCheckboxGroupResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

export type CheckboxGroupRootDocumentedProps = Pick<
  CheckboxGroupRootProps,
  | 'name'
  | 'value'
  | 'defaultValue'
  | 'onValueChange'
  | 'invalid'
  | 'required'
  | 'disabled'
  | 'messages'
>

export const checkboxGroupRootRows = propRows<CheckboxGroupRootDocumentedProps>({
  name: {
    type: 'string',
    default: '–',
    description: 'The name every checkbox in the group submits under. A Checkbox’s own name wins.',
  },
  value: {
    type: 'readonly string[]',
    default: '–',
    description:
      'Controlled: the values of the checked boxes, from your form state. The group never stores it.',
  },
  defaultValue: {
    type: 'readonly string[]',
    default: '–',
    description:
      'Uncontrolled: the values checked at the start. The browser keeps the state after that.',
  },
  onValueChange: {
    type: '(value: string[], details: { reason: "input"; event }) => void',
    default: '–',
    description:
      'Called when a box changes. Controlled, it is value with the box’s value added at the end or removed. Uncontrolled, it is read from the checked boxes in DOM order.',
  },
  invalid: {
    type: 'boolean',
    default: 'false',
    description:
      'Marks the group and every checkbox with data-invalid, and shows the ErrorMessage. It sets no aria-invalid and does not make the Fields inside invalid.',
  },
  required: {
    type: 'boolean',
    default: 'false',
    description:
      'Sets data-required and removes the optional text from the legend. A group has no aria-required, so say what is required in the legend.',
  },
  disabled: {
    type: 'boolean',
    default: 'false',
    description:
      'Native fieldset disabled: every checkbox is disabled and skipped by Tab. Every checkbox also gets data-disabled.',
  },
  messages: {
    type: 'Partial<KvirnMessages["field"]>',
    default: '–',
    description: 'Overrides the legend’s optional text and the error prefix for this group.',
  },
})

export const checkboxGroupRootAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-checkbox-group',
    values: 'always',
    meaning: 'The part class. It sits next to kv-fieldset.',
  },
  {
    name: 'kv-fieldset',
    values: 'always',
    meaning: 'The fieldset class the default theme styles.',
  },
  {
    name: 'data-invalid',
    values: 'present or absent',
    meaning:
      'The group is invalid. Also on the legend, the help text, the error and every checkbox.',
  },
  {
    name: 'data-required',
    values: 'present or absent',
    meaning: 'The group is required. Also on the legend.',
  },
  {
    name: 'data-disabled',
    values: 'present or absent',
    meaning: 'The group is disabled. Also on every checkbox.',
  },
  {
    name: 'aria-describedby',
    values: 'ids',
    meaning:
      'Set for you: every description and help text in DOM order, then the error. Your own ids come after.',
  },
]

export type CheckboxGroupLegendDocumentedProps = Pick<FieldsetLegendProps, 'marker'>

export const checkboxGroupLegendRows = propRows<CheckboxGroupLegendDocumentedProps>({
  marker: {
    type: "'optional' | 'none'",
    default: "'optional' in a group that isn’t required, else 'none'",
    description: 'Whether the legend ends with the optional text, for example “(optional)”.',
  },
})

export const checkboxGroupLegendAttributes: readonly AttributeRow[] = [
  { name: 'kv-fieldset-legend', values: 'always', meaning: 'The part class.' },
  { name: 'data-invalid', values: 'present or absent', meaning: 'The group is invalid.' },
  { name: 'data-required', values: 'present or absent', meaning: 'The group is required.' },
  { name: 'data-disabled', values: 'present or absent', meaning: 'The group is disabled.' },
]

export const checkboxGroupProseAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-prose',
    values: 'always',
    meaning: 'The part class. The default theme sets it at 16px.',
  },
  { name: 'data-invalid', values: 'present or absent', meaning: 'The group is invalid.' },
  { name: 'data-disabled', values: 'present or absent', meaning: 'The group is disabled.' },
]

export const checkboxGroupHelpTextAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-field-help-text',
    values: 'always',
    meaning: 'The part class. The default theme sets it at 14px.',
  },
  { name: 'data-invalid', values: 'present or absent', meaning: 'The group is invalid.' },
  { name: 'data-disabled', values: 'present or absent', meaning: 'The group is disabled.' },
]

export const checkboxGroupErrorMessageAttributes: readonly AttributeRow[] = [
  { name: 'kv-field-error-message', values: 'always', meaning: 'The part class.' },
  {
    name: 'data-invalid',
    values: 'always',
    meaning: 'It renders only while the group is invalid.',
  },
  { name: 'data-disabled', values: 'present or absent', meaning: 'The group is disabled.' },
]

export const useCheckboxGroupHook: ApiHook = {
  name: 'useCheckboxGroup',
  options: propRows<UseCheckboxGroupOptions>({
    name: {
      type: 'string',
      default: '–',
      description: 'The name every checkbox in the group submits under.',
    },
    value: {
      type: 'readonly string[]',
      default: '–',
      description: 'Controlled: the values of the checked boxes.',
    },
    defaultValue: {
      type: 'readonly string[]',
      default: '–',
      description: 'Uncontrolled: the values checked at the start.',
    },
    onValueChange: {
      type: '(value: string[], details: { reason: "input"; event }) => void',
      default: '–',
      description: 'Called with the next values when a box changes. It only reports.',
    },
    invalid: {
      type: 'boolean',
      default: 'false',
      description: 'data-invalid on every box, for styling. No aria-invalid.',
    },
    disabled: {
      type: 'boolean',
      default: 'false',
      description: 'data-disabled on every box. A <fieldset disabled> does the disabling.',
    },
  }),
  result: propRows<UseCheckboxGroupResult>({
    name: { type: 'string | undefined', default: '–', description: 'The name, as given.' },
    groupRef: {
      type: 'RefCallback<HTMLFieldSetElement>',
      default: '–',
      description:
        'Attach it to your <fieldset>, so an uncontrolled group can read its checked boxes when it reports.',
    },
    getCheckboxProps: {
      type: '(value: string) => CheckboxGroupItemProps',
      default: '–',
      description:
        'Spread on the <input type="checkbox"> with this value: name, checked or defaultChecked, onChange and the data attributes.',
    },
  }),
}
