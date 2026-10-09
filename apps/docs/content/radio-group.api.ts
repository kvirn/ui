import type {
  FieldsetLegendProps,
  RadioGroupRootProps,
  RadioProps,
  UseRadioGroupOptions,
  UseRadioGroupResult,
  UseRadioOptions,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

export type RadioGroupRootDocumentedProps = Pick<
  RadioGroupRootProps,
  | 'name'
  | 'value'
  | 'defaultValue'
  | 'onValueChange'
  | 'invalid'
  | 'required'
  | 'disabled'
  | 'messages'
>

export const radioGroupRootRows = propRows<RadioGroupRootDocumentedProps>({
  name: {
    type: 'string',
    default: 'generated',
    description:
      'The name every radio shares, so the browser groups them and a form submit sends the choice.',
  },
  value: {
    type: 'string | null',
    default: '–',
    description:
      'Controlled: the value of the checked radio, from your form state. null means controlled with nothing chosen.',
  },
  defaultValue: {
    type: 'string',
    default: '–',
    description:
      'Uncontrolled: the value checked at the start. The browser keeps the state after that.',
  },
  onValueChange: {
    type: '(value: string, details: { reason: "input"; event }) => void',
    default: '–',
    description: 'Called with the value of the radio the user chose. The group never stores it.',
  },
  invalid: {
    type: 'boolean',
    default: 'false',
    description:
      'Marks the group and every radio with data-invalid, and shows the ErrorMessage. A radio never gets aria-invalid.',
  },
  required: {
    type: 'boolean',
    default: 'false',
    description:
      'Sets data-required and removes the optional text from the legend. Neither a group nor a radio has aria-required, so say what is required in the legend.',
  },
  disabled: {
    type: 'boolean',
    default: 'false',
    description:
      'Native fieldset disabled: every radio is disabled and skipped by Tab and the arrow keys. Every radio also gets data-disabled.',
  },
  messages: {
    type: 'Partial<KvirnMessages["field"]>',
    default: '–',
    description: 'Overrides the legend’s optional text and the error prefix for this group.',
  },
})

export const radioGroupRootAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-radio-group',
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
    meaning: 'The group is invalid. Also on the legend, the help text, the error and every radio.',
  },
  {
    name: 'data-required',
    values: 'present or absent',
    meaning: 'The group is required. Also on the legend.',
  },
  {
    name: 'data-disabled',
    values: 'present or absent',
    meaning: 'The group is disabled. Also on every radio.',
  },
  {
    name: 'aria-describedby',
    values: 'ids',
    meaning:
      'Set for you: every description and help text in DOM order, then the error. Your own ids come after.',
  },
]

export type RadioDocumentedProps = Pick<
  RadioProps,
  'value' | 'checked' | 'defaultChecked' | 'disabled'
>

export const radioRows = propRows<RadioDocumentedProps>({
  value: {
    type: 'string',
    default: '–',
    description:
      'What a form submit sends when this radio is checked, and its value inside the group. Give every radio one.',
  },
  checked: {
    type: 'boolean',
    default: '–',
    description: 'Outside a RadioGroup only. In a group, the group’s value sets it.',
  },
  defaultChecked: {
    type: 'boolean',
    default: '–',
    description: 'Outside a RadioGroup only. In a group, the group’s defaultValue sets it.',
  },
  disabled: {
    type: 'boolean',
    default: 'false',
    description: 'Native disabled: this radio is skipped by Tab and the arrow keys.',
  },
})

export const radioAttributes: readonly AttributeRow[] = [
  { name: 'kv-radio', values: 'always', meaning: 'The part class. The default theme styles it.' },
  {
    name: 'data-state',
    values: '"checked" or "unchecked"',
    meaning:
      'Only when the checked state is known from props. For an uncontrolled radio, style :checked.',
  },
  {
    name: 'data-invalid',
    values: 'present or absent',
    meaning: 'The group or the Field is invalid.',
  },
  {
    name: 'data-disabled',
    values: 'present or absent',
    meaning: 'The radio, the group or the Field is disabled.',
  },
]

export type RadioGroupLegendDocumentedProps = Pick<FieldsetLegendProps, 'marker'>

export const radioGroupLegendRows = propRows<RadioGroupLegendDocumentedProps>({
  marker: {
    type: "'optional' | 'none'",
    default: "'optional' in a group that isn’t required, else 'none'",
    description: 'Whether the legend ends with the optional text, for example “(optional)”.',
  },
})

export const radioGroupLegendAttributes: readonly AttributeRow[] = [
  { name: 'kv-fieldset-legend', values: 'always', meaning: 'The part class.' },
  { name: 'data-invalid', values: 'present or absent', meaning: 'The group is invalid.' },
  { name: 'data-required', values: 'present or absent', meaning: 'The group is required.' },
  { name: 'data-disabled', values: 'present or absent', meaning: 'The group is disabled.' },
]

export const radioGroupProseAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-prose',
    values: 'always',
    meaning: 'The part class. The default theme sets it at 16px.',
  },
  { name: 'data-invalid', values: 'present or absent', meaning: 'The group is invalid.' },
  { name: 'data-disabled', values: 'present or absent', meaning: 'The group is disabled.' },
]

export const radioGroupHelpTextAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-field-help-text',
    values: 'always',
    meaning: 'The part class. The default theme sets it at 14px.',
  },
  { name: 'data-invalid', values: 'present or absent', meaning: 'The group is invalid.' },
  { name: 'data-disabled', values: 'present or absent', meaning: 'The group is disabled.' },
]

export const radioGroupErrorMessageAttributes: readonly AttributeRow[] = [
  { name: 'kv-field-error-message', values: 'always', meaning: 'The part class.' },
  {
    name: 'data-invalid',
    values: 'always',
    meaning: 'It renders only while the group is invalid.',
  },
  { name: 'data-disabled', values: 'present or absent', meaning: 'The group is disabled.' },
]

export const useRadioRows = propRows<UseRadioOptions>({
  value: {
    type: 'string',
    default: '–',
    description:
      'What a form submit sends when checked, and the option’s value inside a RadioGroup.',
  },
  name: {
    type: 'string',
    default: '–',
    description:
      'The name that groups the radios. Inside a RadioGroup, the group’s name is the default.',
  },
  disabled: {
    type: 'boolean',
    default: 'false',
    description: 'Native disabled: skipped by Tab and by the arrow keys.',
  },
  checked: { type: 'boolean', default: '–', description: 'Controlled outside a RadioGroup.' },
  defaultChecked: {
    type: 'boolean',
    default: '–',
    description: 'Uncontrolled outside a RadioGroup.',
  },
})

export const useRadioGroupHook: ApiHook = {
  name: 'useRadioGroup',
  options: propRows<UseRadioGroupOptions>({
    name: { type: 'string', default: 'generated', description: 'The name every radio shares.' },
    value: {
      type: 'string | null',
      default: '–',
      description: 'Controlled: the value of the checked radio. null means nothing is checked.',
    },
    defaultValue: {
      type: 'string',
      default: '–',
      description: 'Uncontrolled: the value checked at the start.',
    },
    onValueChange: {
      type: '(value: string, details: { reason: "input"; event }) => void',
      default: '–',
      description: 'Called with the value of the radio the user chose. It only reports.',
    },
    invalid: {
      type: 'boolean',
      default: 'false',
      description: 'data-invalid on every radio, for styling. No aria-invalid.',
    },
    disabled: {
      type: 'boolean',
      default: 'false',
      description: 'data-disabled on every radio. A <fieldset disabled> does the disabling.',
    },
  }),
  result: propRows<UseRadioGroupResult>({
    name: {
      type: 'string',
      default: '–',
      description: 'The shared name: the one given, else a generated one.',
    },
    getRadioProps: {
      type: '(value: string) => RadioGroupItemProps',
      default: '–',
      description:
        'The props for the radio with this value: name, checked or defaultChecked, onChange and the data attributes.',
    },
  }),
}
