import type {
  PhoneInputCountryProps,
  PhoneInputNumberProps,
  PhoneInputRootProps,
  UsePhoneInputOptions,
  UsePhoneInputResult,
  UsePhoneInputRootOptions,
  UsePhoneInputRootResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

export const phoneInputRootRows = propRows<
  Pick<PhoneInputRootProps, 'country' | 'defaultCountry' | 'onCountryChange' | 'ref'>
>({
  country: {
    type: 'string',
    default: '–',
    description:
      'Controlled: the country as an ISO 3166-1 alpha-2 code, such as SE. Pair it with onCountryChange, or the select can’t be changed. Without it: defaultCountry and the user’s choice, then the provider’s country, then the country the page’s language implies (Swedish SE, Finnish FI, Norwegian NO).',
  },
  defaultCountry: {
    type: 'string',
    default: '–',
    description: 'Uncontrolled: the country the select starts on, before the user changes it.',
  },
  onCountryChange: {
    type: "(country: string, details: { reason: 'input'; event: ChangeEvent<HTMLSelectElement>; callingCode: string | undefined }) => void",
    default: '–',
    description:
      'Called when the user picks another country. It only reports: it never rewrites or prefixes the number. callingCode is digits only, such as 46.',
  },
  ref: {
    type: 'Ref<HTMLDivElement>',
    default: '–',
    description: 'Reaches the <div>.',
  },
})

export const phoneInputCountryRows = propRows<
  Pick<PhoneInputCountryProps, 'onChange' | 'disabled' | 'ref'>
>({
  onChange: {
    type: 'ChangeEventHandler<HTMLSelectElement>',
    default: '–',
    description:
      'The native change handler. It runs before the Root’s onCountryChange, which is the one to use to follow the country.',
  },
  disabled: {
    type: 'boolean',
    default: 'false',
    description: 'Native disabled. A disabled Field disables the select too.',
  },
  ref: {
    type: 'Ref<HTMLSelectElement>',
    default: '–',
    description: 'Reaches the <select>.',
  },
})

export const phoneInputNumberRows = propRows<
  Pick<
    PhoneInputNumberProps,
    | 'value'
    | 'defaultValue'
    | 'onValueChange'
    | 'mask'
    | 'announceRejections'
    | 'messages'
    | 'autoComplete'
    | 'disabled'
    | 'ref'
  >
>({
  value: {
    type: 'string',
    default: '–',
    description:
      'Controlled: the number from your form state, as the user wrote it, such as +46 70-174 06 05. Pair it with onValueChange.',
  },
  defaultValue: {
    type: 'string',
    default: '–',
    description:
      'Uncontrolled: the native input keeps the value, and a form submit sends it as written.',
  },
  onValueChange: {
    type: '(value: string, details: PhoneInputChangeDetails) => void',
    default: '–',
    description:
      'Called on every change with the number as shown. It is never formatted and never has the calling code added. details has reason, event, country and callingCode (digits only, such as 46) of the Root, and with a mask also unmaskedValue, isComplete and rejected. Make the number E.164 on the server.',
  },
  mask: {
    type: 'MaskInput | false',
    default: 'false',
    description:
      'No mask by default, so a number typed correctly is never refused. "telephone" leaves out everything except digits, +, space, - , ( and ), and says so politely. A { pattern }, a RegExp or a finished mask from masks replaces it. No mask formats the number.',
  },
  announceRejections: {
    type: 'boolean',
    default: 'true',
    description:
      'With a mask: announces, politely and at most once every few seconds, when a character is left out. Needs a KvirnProvider.',
  },
  messages: {
    type: "Partial<KvirnMessages['mask']>",
    default: '–',
    description: 'With a mask: overrides the texts of the announcements for this input.',
  },
  autoComplete: {
    type: 'string',
    default: "'tel'",
    description:
      'The autofill purpose. tel is the full number, which is what autofill stores. Next to a PhoneInput.Country it is tel-national. Yours wins: mobile tel, or off for someone else’s number.',
  },
  disabled: {
    type: 'boolean',
    default: 'false',
    description: 'Native disabled. A disabled Field disables the input too.',
  },
  ref: {
    type: 'Ref<HTMLInputElement>',
    default: '–',
    description: 'Reaches the <input>.',
  },
})

export const phoneInputRootAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-phone-input-group',
    values: 'always',
    meaning:
      'The layout class. The country select and the number sit side by side when there is room and stack when there is not.',
  },
]

export const phoneInputCountryAttributes: readonly AttributeRow[] = [
  {
    name: 'autocomplete',
    values: '"tel-country-code"',
    meaning:
      'Tells autofill this is the country code of a phone number (1.3.5 Identify Input Purpose).',
  },
  {
    name: 'kv-listbox-native, kv-phone-input-country',
    values: 'always',
    meaning: 'The part classes: the look of a native select, sized to its content.',
  },
  {
    name: 'id, aria-describedby, aria-invalid, aria-required, disabled',
    values: 'in its own Field',
    meaning:
      'From its Field. In the number’s Field it takes only disabled, and a name from aria-label.',
  },
]

export const phoneInputNumberAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-input, kv-input--numeric, kv-phone-input',
    values: 'always',
    meaning:
      'The part classes. kv-input--numeric uses tabular figures, and kv-phone-input makes the box 20 characters wide, never wider than its container.',
  },
  {
    name: 'kv-input--width-2, -4, -6, -10, -20',
    values: 'class you add',
    meaning: 'A width of your own. It wins over kv-phone-input. A width is a hint, never a limit.',
  },
  {
    name: 'type, inputmode, spellcheck, dir',
    values: '"tel", "tel", "false", "ltr"',
    meaning:
      'A phone input with the phone keypad, no spell check, and left to right so +46 stays first. Your own inputMode, spellCheck and dir win.',
  },
  {
    name: 'autocomplete',
    values: '"tel", or "tel-national" next to a Country',
    meaning:
      'The autofill purpose (1.3.5 Identify Input Purpose). The Number learns of a Country after mount, so server-rendered markup has "tel" until then.',
  },
  {
    name: 'id, aria-describedby',
    values: 'in a Field',
    meaning:
      'From the Field. Your own aria-describedby ids come after the Field’s, and your own id is ignored in a Field: use controlId on Field.Root.',
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
  {
    name: 'data-focused, data-focus-visible',
    values: 'present or absent',
    meaning: 'The input has focus, and the input has keyboard focus.',
  },
  {
    name: 'pattern, maxlength',
    values: 'never',
    meaning: 'PhoneInput never limits what the user writes.',
  },
]

export const usePhoneInputHook: ApiHook = {
  name: 'usePhoneInput',
  intro:
    'Use it for an <input> of your own. Call it in a component inside the Field, because it reads the nearest Field. It holds no value.',
  options: propRows<UsePhoneInputOptions>({
    mask: phoneInputNumberRows.mask,
    disabled: phoneInputNumberRows.disabled,
    onValueChange: {
      type: '(value: string, details: TextInputChangeDetails) => void',
      default: '–',
      description:
        'Called with the text as the user wrote it on every change. It only reports. Make the number E.164 on the server.',
    },
    announceRejections: phoneInputNumberRows.announceRejections,
    messages: phoneInputNumberRows.messages,
  }),
  result: propRows<UsePhoneInputResult>({
    inputProps: {
      type: 'PhoneInputPartProps',
      default: '–',
      description:
        'Spread on an <input>: the classes, type="tel", inputmode, spellcheck, dir, autocomplete, the Field’s id, aria-describedby and state, and the handlers. Put your own props after them.',
    },
    mask: {
      type: 'Mask | undefined',
      default: '–',
      description: 'The mask that runs, before the locale is applied. undefined with no mask.',
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

export const usePhoneInputRootHook: ApiHook = {
  name: 'usePhoneInputRoot',
  intro:
    'Holds the country of a phone number for your own markup. It holds no number and never rewrites one.',
  options: propRows<UsePhoneInputRootOptions>({
    country: phoneInputRootRows.country,
    defaultCountry: phoneInputRootRows.defaultCountry,
    onCountryChange: phoneInputRootRows.onCountryChange,
  }),
  result: propRows<UsePhoneInputRootResult>({
    country: {
      type: 'string | undefined',
      default: '–',
      description: 'The country that applies, in upper case, or undefined when no source says.',
    },
    callingCode: {
      type: 'string | undefined',
      default: '–',
      description: 'Its calling code, digits only, such as 46.',
    },
    selectCountry: {
      type: '(country: string, event: ChangeEvent<HTMLSelectElement>) => void',
      default: '–',
      description:
        'Call it from the change event of your select. It reports to onCountryChange and, when the country is not controlled, remembers the choice.',
    },
    rootProps: {
      type: 'PhoneInputRootPartProps',
      default: '–',
      description: 'Spread on the <div> that holds the parts: the class kv-phone-input-group.',
    },
  }),
}
