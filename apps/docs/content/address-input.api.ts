import type {
  AddressInputLineProps,
  AddressInputPostalCodeProps,
  AddressInputRootProps,
  UseAddressInputOptions,
  UseAddressInputResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'
import { textInputRows } from './text-input.api.ts'

export const addressInputRootRows = propRows<
  Pick<AddressInputRootProps, 'country' | 'autoComplete' | 'ref'>
>({
  country: {
    type: 'string',
    default: '–',
    description:
      'The address’s country as an ISO 3166-1 alpha-2 code, such as SE. It picks the postal code’s mask, width and keypad: SE, FI and NO have a mask, any other country takes letters and digits. Without it: the provider’s country, then the country the page’s language implies (Swedish SE, Finnish FI, Norwegian NO). English implies none. It is the address’s country, not the page’s, and changing it never rewrites what was typed.',
  },
  autoComplete: {
    type: 'string',
    default: '–',
    description:
      '"off" turns autofill off for every box (someone else’s address). Anything else, such as "section-postal" or "shipping", goes before each box’s purpose, so two addresses on one page stay apart. A box’s own autoComplete wins.',
  },
  ref: {
    type: 'Ref<HTMLDivElement>',
    default: '–',
    description: 'Reaches the <div>.',
  },
})

const lineRows = propRows<
  Pick<AddressInputLineProps, 'value' | 'defaultValue' | 'onValueChange' | 'autoComplete' | 'ref'>
>({
  value: textInputRows.value,
  defaultValue: textInputRows.defaultValue,
  onValueChange: {
    type: '(value: string, details: TextInputChangeDetails) => void',
    default: '–',
    description: 'Reports each change. onChange still works.',
  },
  autoComplete: {
    type: 'string',
    default: 'the box’s purpose',
    description:
      'The autofill purpose, with the Root’s prefix in front. Yours wins, so "off" turns autofill off for one box.',
  },
  ref: {
    type: 'Ref<HTMLInputElement>',
    default: '–',
    description: 'Reaches the <input>.',
  },
})

export const addressInputLine1Rows = lineRows
export const addressInputLine2Rows = lineRows
export const addressInputCityRows = lineRows

export const addressInputPostalCodeRows = propRows<
  Pick<
    AddressInputPostalCodeProps,
    | 'value'
    | 'defaultValue'
    | 'onValueChange'
    | 'mask'
    | 'announceRejections'
    | 'messages'
    | 'autoComplete'
    | 'ref'
  >
>({
  value: textInputRows.value,
  defaultValue: textInputRows.defaultValue,
  onValueChange: textInputRows.onValueChange,
  mask: {
    type: 'MaskInput | false',
    default: 'the country’s postal code mask',
    description:
      'Replaces the country’s mask. false: no mask, the box takes what is typed. Your own mask’s keypad and direction win over the country’s.',
  },
  announceRejections: textInputRows.announceRejections,
  messages: textInputRows.messages,
  autoComplete: {
    type: 'string',
    default: '"postal-code"',
    description: 'The autofill purpose, with the Root’s prefix in front. Yours wins.',
  },
  ref: {
    type: 'Ref<HTMLInputElement>',
    default: '–',
    description: 'Reaches the <input>.',
  },
})

export const addressInputRootAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-address-input',
    values: 'always',
    meaning:
      'The layout class: the boxes stacked, with the postal code and the city side by side when there is room.',
  },
]

const sharedFieldAttributes: readonly AttributeRow[] = [
  {
    name: 'id, aria-describedby',
    values: 'in a Field',
    meaning:
      'From the Field. aria-describedby lists the help text, then the error, and your own ids after them.',
  },
  {
    name: 'aria-invalid, aria-required',
    values: '"true" or absent',
    meaning: 'In a Field with invalid or required.',
  },
  {
    name: 'data-invalid, data-required, data-disabled',
    values: 'present or absent',
    meaning: 'The state of the Field.',
  },
]

function textLineAttributes(partClass: string, token: string): readonly AttributeRow[] {
  return [
    { name: `kv-input, ${partClass}`, values: 'always', meaning: 'The part classes.' },
    {
      name: 'autocomplete',
      values: `"${token}", or "off"`,
      meaning: 'The autofill purpose (1.3.5 Identify Input Purpose), after the Root’s prefix.',
    },
    {
      name: 'spellcheck, autocorrect',
      values: '"false", "off"',
      meaning: 'A street or a town is not a word to correct.',
    },
    ...sharedFieldAttributes,
  ]
}

export const addressInputLine1Attributes = textLineAttributes(
  'kv-address-input-line1',
  'address-line1',
)
export const addressInputLine2Attributes = textLineAttributes(
  'kv-address-input-line2',
  'address-line2',
)
export const addressInputCityAttributes = textLineAttributes(
  'kv-address-input-city',
  'address-level2',
)

export const addressInputPostalCodeAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-input, kv-address-input-postal-code',
    values: 'always',
    meaning: 'The part classes.',
  },
  {
    name: 'kv-input--numeric, kv-input--width-6, -4 or -10',
    values: 'SE and FI: numeric and 6; NO: numeric and 4; any other country: 10',
    meaning: 'Tabular figures, and a box as wide as the longest postal code the country writes.',
  },
  {
    name: 'inputmode, autocapitalize',
    values: '"numeric" with a mask; "text" and "characters" without',
    meaning:
      'The digit keypad for a masked code, and upper case letters for a country with no mask.',
  },
  {
    name: 'dir',
    values: '"ltr"',
    meaning: 'A postal code is read left to right in every direction.',
  },
  {
    name: 'autocomplete',
    values: '"postal-code", or "off"',
    meaning: 'The autofill purpose (1.3.5 Identify Input Purpose), after the Root’s prefix.',
  },
  ...sharedFieldAttributes,
]

export const useAddressInputHook: ApiHook = {
  name: 'useAddressInput',
  intro:
    'Use it for markup of your own. Give getInputProps(part) and postalCodeMask to a TextInput, each in its own Field inside a plain Fieldset. It holds no value and never moves focus.',
  options: propRows<UseAddressInputOptions>({
    country: addressInputRootRows.country,
    autoComplete: addressInputRootRows.autoComplete,
  }),
  result: propRows<UseAddressInputResult>({
    country: {
      type: 'string | undefined',
      default: '–',
      description: 'The country that applies, in upper case, or undefined when no source says.',
    },
    postalCodeMask: {
      type: 'MaskInput | undefined',
      default: '–',
      description:
        'The postal code mask of the country for SE, FI and NO, and undefined for any other country. Give it to a TextInput’s mask.',
    },
    rootProps: {
      type: 'AddressInputRootPartProps',
      default: '–',
      description: 'Spread on the <div> that holds the boxes: the class kv-address-input.',
    },
    getInputProps: {
      type: "(part: 'line1' | 'line2' | 'postalCode' | 'city') => AddressInputInputPartProps",
      default: '–',
      description:
        'The props of one box: its class, its autofill purpose with the Root’s prefix, and the attributes of the box. Spread them on a TextInput next to the Field’s own wiring.',
    },
  }),
}
