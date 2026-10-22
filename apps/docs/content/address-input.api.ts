import type {
  AddressInputCountryProps,
  AddressInputLine1Props,
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
  Pick<AddressInputRootProps, 'country' | 'autoComplete' | 'geocoder' | 'onLookupResult' | 'ref'>
>({
  country: {
    type: 'string',
    default: '–',
    description:
      'The address’s country as an ISO 3166-1 alpha-2 code, such as SE. It picks the postal code’s mask, width and keypad: SE, FI and NO have a mask, and any other country has none. Without it: the provider’s country, then the country the page’s language implies (Swedish SE, Finnish FI, Norwegian NO). English implies none. It is the address’s country, not the page’s, and changing it never rewrites what was typed. With an AddressInput.Country it is the country listed first and the starting country. Without one, the lookup offers only addresses in this country.',
  },
  autoComplete: {
    type: 'string',
    default: '–',
    description:
      '"off" turns autofill off for every box (someone else’s address). Anything else, such as "section-postal" or "shipping", goes before each box’s purpose, so two addresses on one page stay apart. A box’s own autoComplete wins.',
  },
  geocoder: {
    type: 'GeocoderProvider',
    default: '–',
    description:
      'Turns the address lookup on: AddressInput.Line1 becomes a combobox that suggests addresses and stays free text. What is typed in Line1, and the visitor’s IP address, reach this geocoder, and nothing is sent before minLength characters. Geocoders come from @kvirn-ui/map (kvirnGeocoder, nominatim, googlePlaces). Without it, Line1 is a plain text box and AddressInput makes no network call.',
  },
  onLookupResult: {
    type: '(result: AddressResult) => void',
    default: '–',
    description:
      'Called after a choice that filled in the boxes, with the whole result, for its position or id. Not called when the text is cleared, or for a place with no postal address.',
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

export const addressInputLine1Rows = propRows<
  Pick<
    AddressInputLine1Props,
    | 'value'
    | 'defaultValue'
    | 'onValueChange'
    | 'autoComplete'
    | 'ref'
    | 'messages'
    | 'minLength'
    | 'debounce'
    | 'timeoutMilliseconds'
  >
>({
  ...lineRows,
  messages: {
    type: 'AddressInputLine1Messages',
    default: '–',
    description:
      'With a geocoder: replaces the lookup’s texts for this box. The keys are those of addressInput, and submit, privacy, privacyUnnamed, tooShort, searching, resultCount and pickedFilled from addressSearch.',
  },
  minLength: {
    type: 'number',
    default: '3',
    description:
      'With a geocoder: the fewest characters, trimmed, before a search is sent. Nothing is sent below it.',
  },
  debounce: {
    type: 'number | false',
    default: '400',
    description:
      'With a geocoder that suggests as you type: the milliseconds of no typing before a search. false: search only when the user presses Enter or Search. A geocoder that does not allow search as you type is always searched on request.',
  },
  timeoutMilliseconds: {
    type: 'number',
    default: '10000',
    description:
      'With a geocoder: how long to wait for an answer. After that it counts as an error.',
  },
})
export const addressInputLine2Rows = lineRows
export const addressInputCityRows = lineRows

export const addressInputCountryRows = propRows<
  Pick<AddressInputCountryProps, 'value' | 'defaultValue' | 'onChange' | 'ref'>
>({
  value: {
    type: 'string',
    default: '–',
    description:
      'Controlled: the country as an ISO 3166-1 alpha-2 code from your form state, such as SE. Pass it with onChange.',
  },
  defaultValue: {
    type: 'string',
    default: 'the Root’s country',
    description:
      'Uncontrolled: the starting country. Without it: the Root’s country, then the provider’s.',
  },
  onChange: {
    type: '(event: ChangeEvent<HTMLSelectElement>) => void',
    default: '–',
    description:
      'Called when the country changes, by the user or by a choice in another country. event.currentTarget.value is the code.',
  },
  ref: {
    type: 'Ref<HTMLSelectElement>',
    default: '–',
    description: 'Reaches the <select>.',
  },
})

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

export const addressInputLine1Attributes: readonly AttributeRow[] = [
  ...textLineAttributes('kv-address-input-line1', 'address-line1'),
  {
    name: 'role, aria-autocomplete, aria-expanded, aria-controls, aria-activedescendant',
    values: 'with a geocoder',
    meaning:
      'The ARIA 1.2 combobox: role combobox and aria-autocomplete "list". aria-expanded is true while the list is open. The role is fixed while mounted: without a geocoder it is a textbox.',
  },
  {
    name: 'aria-describedby',
    values: 'with a geocoder',
    meaning:
      'Lists, in this order: the privacy notice above the box, the lookup’s help text (with the country searched), the note after a choice, your help text, then the error.',
  },
  {
    name: 'kv-address-lookup-notice, kv-address-lookup-status, kv-address-lookup-submit, kv-address-input-lookup-note',
    values: 'with a geocoder',
    meaning:
      'The classes of the privacy notice, the status line in the list, the Search button and the note after a choice.',
  },
]
export const addressInputLine2Attributes = textLineAttributes(
  'kv-address-input-line2',
  'address-line2',
)
export const addressInputCityAttributes = textLineAttributes(
  'kv-address-input-city',
  'address-level2',
)

export const addressInputCountryAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-listbox-native, kv-address-input-country',
    values: 'always',
    meaning: 'The part classes. The Country field is as wide as its content.',
  },
  {
    name: 'autocomplete',
    values: '"country", or "off"',
    meaning: 'The autofill purpose (1.3.5 Identify Input Purpose), after the Root’s prefix.',
  },
]

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
      'The digit keypad for a masked code. For a country with no mask, a keyboard that starts in capital letters. The text is kept as typed.',
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
    'Use it for markup of your own. Give getInputProps(part) and postalCodeMask to a TextInput, each in its own Field inside a plain Fieldset. It holds no value and never moves focus. It does not look addresses up: the lookup is the Root’s geocoder.',
  options: propRows<UseAddressInputOptions>({
    country: {
      ...addressInputRootRows.country,
      description:
        'The address’s country as an ISO 3166-1 alpha-2 code, such as SE. It picks the postal code’s mask, width and keypad: SE, FI and NO have a mask, and any other country has none. Without it: the provider’s country, then the country the page’s language implies (Swedish SE, Finnish FI, Norwegian NO). English implies none. Changing it never rewrites what was typed.',
    },
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
      type: "(part: 'line1' | 'line2' | 'postalCode' | 'city' | 'country') => AddressInputInputPartProps",
      default: '–',
      description:
        'The props of one box: its class, its autofill purpose with the Root’s prefix, and the attributes of the box. Spread them on a TextInput next to the Field’s own wiring. "country" is for a select of your own: it gives the class and the autofill purpose only.',
    },
  }),
}
