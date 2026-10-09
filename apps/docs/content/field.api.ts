import type {
  FieldLabelProps,
  FieldRootProps,
  UseFieldOptions,
  UseFieldResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

export const fieldRootRows = propRows<
  Pick<FieldRootProps, 'invalid' | 'required' | 'disabled' | 'controlId' | 'messages'>
>({
  invalid: {
    type: 'boolean',
    default: 'false',
    description:
      'Sets aria-invalid on the control and data-invalid on every part, and shows the Field.ErrorMessage. You decide when: KvirnUI holds no form state.',
  },
  required: {
    type: 'boolean',
    default: 'false',
    description:
      'Sets aria-required on the control and removes the optional text from the label. Never native required: pass that on the control too if you want the browser’s validation.',
  },
  disabled: {
    type: 'boolean',
    default: 'false',
    description: 'Native disabled on the control and data-disabled on every part.',
  },
  controlId: {
    type: 'string',
    default: 'generated',
    description:
      'The control’s id, for example to link to it from an error summary. The ids of the label, description and error are derived from it.',
  },
  messages: {
    type: "Partial<KvirnMessages['field']>",
    default: '–',
    description: 'Overrides field.optional and field.errorPrefix for this field.',
  },
})

export const fieldRootAttributes: readonly AttributeRow[] = [
  { name: 'kv-field', values: 'always', meaning: 'The part class. The default theme styles it.' },
  { name: 'data-invalid', values: 'present or absent', meaning: 'The field is invalid.' },
  { name: 'data-required', values: 'present or absent', meaning: 'The field is required.' },
  { name: 'data-disabled', values: 'present or absent', meaning: 'The field is disabled.' },
]

export const fieldLabelRows = propRows<Pick<FieldLabelProps, 'marker'>>({
  marker: {
    type: "'optional' | 'none'",
    default: "'optional'",
    description:
      'Whether the label ends with the optional text when the field is not required. Inside a group Fieldset the Field default is ‘none’.',
  },
})

export const fieldLabelAttributes: readonly AttributeRow[] = [
  { name: 'kv-field-label', values: 'always', meaning: 'The part class.' },
  {
    name: 'kv-field-optional',
    values: 'on the span inside the label',
    meaning: 'The optional text, for example “(optional)”. It is part of the accessible name.',
  },
  {
    name: 'data-invalid, data-required, data-disabled',
    values: 'present or absent',
    meaning: 'The state of the field.',
  },
]

export const fieldProseAttributes: readonly AttributeRow[] = [
  { name: 'kv-prose', values: 'always', meaning: 'The class that styles the text for reading.' },
  { name: 'data-invalid', values: 'present or absent', meaning: 'The field is invalid.' },
  { name: 'data-disabled', values: 'present or absent', meaning: 'The field is disabled.' },
]

export const fieldHelpTextAttributes: readonly AttributeRow[] = [
  { name: 'kv-field-help-text', values: 'always', meaning: 'The part class: 14px in the theme.' },
  { name: 'data-invalid', values: 'present or absent', meaning: 'The field is invalid.' },
  { name: 'data-disabled', values: 'present or absent', meaning: 'The field is disabled.' },
]

export const fieldErrorMessageAttributes: readonly AttributeRow[] = [
  { name: 'kv-field-error-message', values: 'always', meaning: 'The part class.' },
  {
    name: 'kv-field-error-prefix',
    values: 'on a span inside',
    meaning:
      'The prefix text, for example “Error:”. The theme hides it visually, not from screen readers.',
  },
  { name: 'data-invalid', values: 'always', meaning: 'The part only renders while invalid.' },
  { name: 'data-disabled', values: 'present or absent', meaning: 'The field is disabled.' },
]

export const useFieldHook: ApiHook = {
  name: 'useField',
  options: propRows<UseFieldOptions>({
    id: {
      type: 'string',
      default: 'generated',
      description: 'The control’s id. The description and error ids are derived from it.',
    },
    invalid: { type: 'boolean', default: 'false', description: 'Marks the field as invalid.' },
    required: {
      type: 'boolean',
      default: 'false',
      description: 'aria-required on the control, and no optional text in the label.',
    },
    disabled: {
      type: 'boolean',
      default: 'false',
      description: 'Native disabled on the control.',
    },
    hasDescription: {
      type: 'boolean',
      default: 'false',
      description:
        'You render one description with descriptionProps, so the control’s aria-describedby lists it from the first render.',
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
      description: 'false when you render no error message for an invalid field.',
    },
    marker: {
      type: "'optional' | 'none'",
      default: "'optional'",
      description:
        'Whether the optional text shows. Inside a group Fieldset the default is ‘none’.',
    },
    messages: {
      type: "Partial<KvirnMessages['field']>",
      default: '–',
      description: 'Per-instance message overrides.',
    },
  }),
  result: propRows<UseFieldResult>({
    rootProps: {
      type: 'FieldRootPartProps',
      default: '–',
      description: 'Spread on the container.',
    },
    labelProps: {
      type: 'FieldLabelPartProps',
      default: '–',
      description: 'Spread on the <label>: class, id and htmlFor.',
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
    controlProps: {
      type: 'FieldControlPartProps',
      default: '–',
      description:
        'Spread on the control: id, aria-describedby, aria-invalid, aria-required, disabled and data-* state.',
    },
    controlId: { type: 'string', default: '–', description: 'The control’s id.' },
    labelId: {
      type: 'string',
      default: '–',
      description: 'The label’s id, for an aria-labelledby from another part.',
    },
    descriptionId: {
      type: 'string',
      default: '–',
      description: 'The base id the description ids are derived from.',
    },
    errorMessageId: { type: 'string', default: '–', description: 'The error message’s id.' },
    isInvalid: { type: 'boolean', default: '–', description: 'Whether the field is invalid.' },
    isRequired: { type: 'boolean', default: '–', description: 'Whether the field is required.' },
    isDisabled: { type: 'boolean', default: '–', description: 'Whether the field is disabled.' },
    marker: {
      type: "'optional' | 'none'",
      default: '–',
      description: 'The resolved marker: your option, else ‘none’ in a group Fieldset.',
    },
    optionalMarker: {
      type: 'string | undefined',
      default: '–',
      description:
        'The text to render after the label and a space, or undefined when the label shows none.',
    },
    errorPrefix: {
      type: 'string',
      default: '–',
      description: 'The resolved field.errorPrefix text. Start the error message with it.',
    },
  }),
}
