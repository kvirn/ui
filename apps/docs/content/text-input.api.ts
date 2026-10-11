import type { TextInputProps, UseTextInputOptions, UseTextInputResult } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

export const textInputRows = propRows<
  Pick<
    TextInputProps,
    'type' | 'value' | 'defaultValue' | 'onValueChange' | 'mask' | 'announceRejections' | 'messages'
  >
>({
  type: {
    type: "'text' | 'email' | 'tel' | 'url' | 'password' | 'search'",
    default: "'text'",
    description:
      'The input type. number and date are not accepted: use NumberInput and DateInput. A search type gives the searchbox role.',
  },
  value: {
    type: 'string',
    default: '–',
    description: 'Controlled: the value from your form state. Pass it with onValueChange.',
  },
  defaultValue: {
    type: 'string',
    default: '–',
    description: 'Uncontrolled: the native input keeps the value, and a form submit sends it.',
  },
  onValueChange: {
    type: '(value: string, details: TextInputChangeDetails) => void',
    default: '–',
    description:
      'Reports each change. details has reason and event, and with a mask also unmaskedValue, isComplete, isWithinRange and rejected. onChange still works.',
  },
  mask: {
    type: 'MaskInput',
    default: '–',
    description:
      'Shapes what the user types: a name such as "postal-code", { preset, country? }, { pattern }, a RegExp or a mask from masks. The input stays native. Say the format in a help text.',
  },
  announceRejections: {
    type: 'boolean',
    default: 'true',
    description:
      'With a mask: announces politely, at most once every few seconds, when it drops characters. Needs a KvirnProvider.',
  },
  messages: {
    type: "Partial<KvirnMessages['mask']>",
    default: '–',
    description: 'With a mask: per-instance overrides for the rejection announcements.',
  },
})

export const textInputAttributes: readonly AttributeRow[] = [
  { name: 'kv-input', values: 'always', meaning: 'The part class. The default theme styles it.' },
  {
    name: 'kv-input--width-2, -4, -6, -10, -20',
    values: 'class you add',
    meaning: 'A width that fits the expected answer. Never a limit: no maxlength comes from it.',
  },
  {
    name: 'kv-input--numeric',
    values: 'class you add',
    meaning: 'Tabular figures, for a code made of digits. Theme option.',
  },
  { name: 'data-invalid', values: 'present or absent', meaning: 'The Field is invalid.' },
  { name: 'data-required', values: 'present or absent', meaning: 'The Field is required.' },
  {
    name: 'data-disabled',
    values: 'present or absent',
    meaning: 'The input is disabled, by the Field or its own disabled.',
  },
  { name: 'data-focused', values: 'present or absent', meaning: 'The input has focus.' },
  {
    name: 'data-focus-visible',
    values: 'present or absent',
    meaning: 'The input has keyboard focus.',
  },
  {
    name: 'aria-invalid, aria-required, aria-describedby',
    values: 'from the Field',
    meaning: 'Set by the Field. Your own aria-describedby ids come after the Field’s.',
  },
]

export const useTextInputHook: ApiHook = {
  name: 'useTextInput',
  options: propRows<UseTextInputOptions>({
    type: {
      type: "'text' | 'email' | 'tel' | 'url' | 'password' | 'search'",
      default: "'text'",
      description: 'The input type.',
    },
    disabled: {
      type: 'boolean',
      default: 'false',
      description: 'Native disabled. A disabled Field disables the input too.',
    },
    onValueChange: {
      type: '(value: string, details: TextInputChangeDetails) => void',
      default: '–',
      description: 'Called with the new value on every change. It only reports.',
    },
  }),
  result: propRows<UseTextInputResult>({
    inputProps: {
      type: 'TextInputPartProps',
      default: '–',
      description:
        'Spread on an <input>: class, type, the Field’s id and aria attributes, state and handlers.',
    },
    isInvalid: { type: 'boolean', default: '–', description: 'Whether the Field is invalid.' },
    isRequired: { type: 'boolean', default: '–', description: 'Whether the Field is required.' },
    isDisabled: { type: 'boolean', default: '–', description: 'Whether the input is disabled.' },
    isFocused: { type: 'boolean', default: '–', description: 'Whether the input has focus.' },
    isFocusVisible: {
      type: 'boolean',
      default: '–',
      description: 'Whether the input has keyboard focus.',
    },
  }),
}
