import type {
  FieldsetLegendProps,
  FieldsetRootProps,
  UseFieldsetOptions,
  UseFieldsetResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

export const fieldsetRootRows = propRows<
  Pick<FieldsetRootProps, 'invalid' | 'required' | 'disabled' | 'group' | 'messages'>
>({
  invalid: {
    type: 'boolean',
    default: 'false',
    description:
      'Sets data-invalid on the fieldset’s own parts and shows its Fieldset.ErrorMessage. It does not pass down to the Fields inside.',
  },
  required: {
    type: 'boolean',
    default: 'false',
    description: 'Sets data-required and removes the optional text from the legend.',
  },
  disabled: {
    type: 'boolean',
    default: 'false',
    description: 'Native disabled on the <fieldset>, which disables every control inside it.',
  },
  group: {
    type: 'boolean',
    default: 'false',
    description:
      'One question answered with several controls. The legend takes the optional text and the Fields inside drop theirs.',
  },
  messages: {
    type: "Partial<KvirnMessages['field']>",
    default: '–',
    description: 'Overrides field.optional and field.errorPrefix for this fieldset.',
  },
})

export const fieldsetRootAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-fieldset',
    values: 'always',
    meaning: 'The part class. The default theme styles it.',
  },
  { name: 'data-invalid', values: 'present or absent', meaning: 'The fieldset is invalid.' },
  { name: 'data-required', values: 'present or absent', meaning: 'The fieldset is required.' },
  { name: 'data-disabled', values: 'present or absent', meaning: 'The fieldset is disabled.' },
  {
    name: 'aria-describedby',
    values: 'ids',
    meaning:
      'Every description and help text in DOM order, then the error, then your own ids. Only rendered parts are listed.',
  },
]

export const fieldsetLegendRows = propRows<Pick<FieldsetLegendProps, 'marker'>>({
  marker: {
    type: "'optional' | 'none'",
    default: "'optional' in a group, 'none' otherwise",
    description:
      'Whether the legend ends with the optional text. It shows only when the fieldset is not required.',
  },
})

export const fieldsetLegendAttributes: readonly AttributeRow[] = [
  { name: 'kv-fieldset-legend', values: 'always', meaning: 'The part class.' },
  {
    name: 'kv-fieldset-legend--heading',
    values: 'class you add',
    meaning: 'The legend is the page’s heading: put the heading inside it. Theme option.',
  },
  {
    name: 'kv-field-optional',
    values: 'on the span inside the legend',
    meaning: 'The optional text. It is part of the group’s name.',
  },
  {
    name: 'data-invalid, data-required, data-disabled',
    values: 'present or absent',
    meaning: 'The state of the fieldset.',
  },
]

export const fieldsetProseAttributes: readonly AttributeRow[] = [
  { name: 'kv-prose', values: 'always', meaning: 'The class that styles the text for reading.' },
  { name: 'data-invalid', values: 'present or absent', meaning: 'The fieldset is invalid.' },
  { name: 'data-disabled', values: 'present or absent', meaning: 'The fieldset is disabled.' },
]

export const fieldsetHelpTextAttributes: readonly AttributeRow[] = [
  { name: 'kv-field-help-text', values: 'always', meaning: 'The part class: 14px in the theme.' },
  { name: 'data-invalid', values: 'present or absent', meaning: 'The fieldset is invalid.' },
  { name: 'data-disabled', values: 'present or absent', meaning: 'The fieldset is disabled.' },
]

export const fieldsetErrorMessageAttributes: readonly AttributeRow[] = [
  { name: 'kv-field-error-message', values: 'always', meaning: 'The part class.' },
  {
    name: 'kv-field-error-prefix',
    values: 'on a span inside',
    meaning:
      'The prefix text, for example “Error:”. The theme hides it visually, not from screen readers.',
  },
  { name: 'data-invalid', values: 'always', meaning: 'The part only renders while invalid.' },
  { name: 'data-disabled', values: 'present or absent', meaning: 'The fieldset is disabled.' },
]

export const useFieldsetHook: ApiHook = {
  name: 'useFieldset',
  options: propRows<UseFieldsetOptions>({
    id: {
      type: 'string',
      default: 'generated',
      description: 'The fieldset’s id. The description and error ids are derived from it.',
    },
    invalid: { type: 'boolean', default: 'false', description: 'Marks the fieldset as invalid.' },
    required: {
      type: 'boolean',
      default: 'false',
      description: 'data-required, and no optional text in the legend.',
    },
    disabled: {
      type: 'boolean',
      default: 'false',
      description: 'Native disabled on the <fieldset>.',
    },
    group: {
      type: 'boolean',
      default: 'false',
      description: 'One question answered with several controls.',
    },
    hasDescription: {
      type: 'boolean',
      default: 'false',
      description:
        'You render one description with descriptionProps, so aria-describedby lists it.',
    },
    descriptions: {
      type: 'readonly string[]',
      default: '–',
      description:
        'The names of the descriptions you render with getDescriptionProps(name), in render order. aria-describedby lists them in this order, then the error.',
    },
    hasErrorMessage: {
      type: 'boolean',
      default: 'true',
      description: 'false when you render no error message for an invalid fieldset.',
    },
    marker: {
      type: "'optional' | 'none'",
      default: "'optional' in a group, 'none' otherwise",
      description: 'Whether the legend’s optional text shows.',
    },
    messages: {
      type: "Partial<KvirnMessages['field']>",
      default: '–',
      description: 'Per-instance message overrides.',
    },
  }),
  result: propRows<UseFieldsetResult>({
    fieldsetProps: {
      type: 'FieldsetRootPartProps',
      default: '–',
      description: 'Spread on the <fieldset>: class, id, aria-describedby, disabled and state.',
    },
    legendProps: {
      type: 'FieldsetLegendPartProps',
      default: '–',
      description: 'Spread on the <legend>, the first child of the fieldset.',
    },
    descriptionProps: {
      type: 'FieldDescriptionPartProps',
      default: '–',
      description: 'For the one description (hasDescription).',
    },
    getDescriptionProps: {
      type: '(name: string) => FieldDescriptionPartProps',
      default: '–',
      description: 'For the description with this name. Its id is listed in descriptions.',
    },
    errorMessageProps: {
      type: 'FieldErrorMessagePartProps',
      default: '–',
      description: 'Spread on the error message, which you render only while invalid.',
    },
    descriptionId: {
      type: 'string',
      default: '–',
      description: 'The base id the description ids are derived from.',
    },
    errorMessageId: { type: 'string', default: '–', description: 'The error message’s id.' },
    isInvalid: { type: 'boolean', default: '–', description: 'Whether the fieldset is invalid.' },
    isRequired: { type: 'boolean', default: '–', description: 'Whether the fieldset is required.' },
    isDisabled: { type: 'boolean', default: '–', description: 'Whether the fieldset is disabled.' },
    isGroup: { type: 'boolean', default: '–', description: 'Whether group is on.' },
    marker: {
      type: "'optional' | 'none'",
      default: '–',
      description: 'The resolved legend marker.',
    },
    optionalMarker: {
      type: 'string | undefined',
      default: '–',
      description: 'The legend’s optional text, or undefined when it shows none.',
    },
    errorPrefix: {
      type: 'string',
      default: '–',
      description: 'The resolved field.errorPrefix text. Start the error message with it.',
    },
  }),
}
