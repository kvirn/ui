import type { NumberInputProps, UseNumberInputOptions, UseNumberInputResult } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

/** The props NumberInput documents: its own, and the native ones whose behaviour it changes. */
export type NumberInputDocumentedProps = Pick<
  NumberInputProps,
  | 'value'
  | 'defaultValue'
  | 'onValueChange'
  | 'decimals'
  | 'allowNegative'
  | 'grouping'
  | 'min'
  | 'max'
  | 'mask'
  | 'announceRejections'
  | 'messages'
  | 'disabled'
>

export const numberInputRows = propRows<NumberInputDocumentedProps>({
  value: {
    type: 'string',
    default: '–',
    description: 'Controlled: the number as shown, for example 1 250,50.',
  },
  defaultValue: {
    type: 'string',
    default: '–',
    description:
      'Uncontrolled: the native input keeps the value and a form submit sends it as shown.',
  },
  onValueChange: {
    type: '(value: string, details: TextInputChangeDetails) => void',
    default: '–',
    description:
      'Called on every change with the number as shown. details has reason, event, unmaskedValue (the machine form, -1234.5), isWithinRange, isComplete and rejected.',
  },
  decimals: {
    type: 'number',
    default: '0',
    description: 'Digits after the decimal mark. With 0 no decimal mark is accepted.',
  },
  allowNegative: {
    type: 'boolean',
    default: 'false',
    description: 'Accepts a leading minus sign. The on-screen keyboard then shows text.',
  },
  grouping: {
    type: 'boolean',
    default: 'false',
    description: 'Groups the whole digits in threes with the page language’s separator.',
  },
  min: {
    type: 'number',
    default: '–',
    description:
      'Lower limit. Reported as details.isWithinRange, never clamped and never a min attribute.',
  },
  max: {
    type: 'number',
    default: '–',
    description:
      'Upper limit. Reported as details.isWithinRange, never clamped and never a max attribute.',
  },
  mask: {
    type: 'MaskInput | false',
    default: '–',
    description:
      'Replaces the number mask. false: a plain numeric text box that leaves nothing out and reports no mask details. A name, a pattern or a finished mask shapes the value instead.',
  },
  announceRejections: {
    type: 'boolean',
    default: 'true',
    description:
      'Announces, politely and at most once every few seconds, when a character is left out. Needs a KvirnProvider.',
  },
  messages: {
    type: "Partial<KvirnMessages['mask']>",
    default: '–',
    description: 'Overrides the texts of the announcements for this input.',
  },
  disabled: {
    type: 'boolean',
    default: 'false',
    description: 'Native disabled. A disabled Field disables the input too.',
  },
})

export const numberInputAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-input, kv-input--numeric',
    values: 'always',
    meaning: 'The part classes. kv-input--numeric uses tabular figures.',
  },
  {
    name: 'kv-input--width-2, -4, -6, -10, -20',
    values: 'class you add',
    meaning: 'A width that fits the answer. A width is a hint, never a limit.',
  },
  {
    name: 'type, spellcheck',
    values: '"text", "false"',
    meaning: 'Always a text box, never type="number", and never a spinbutton.',
  },
  {
    name: 'inputmode',
    values: '"numeric", "decimal" or "text"',
    meaning:
      'The on-screen keyboard: numeric for whole numbers, decimal with decimals, text when negatives are allowed. Your own inputMode wins.',
  },
  {
    name: 'id, aria-describedby',
    values: 'in a Field',
    meaning:
      'From the Field. aria-describedby lists the descriptions and help texts in DOM order, then the error, and your own ids after them.',
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
    name: 'data-focused',
    values: 'present or absent',
    meaning: 'The input has focus, however it got it.',
  },
  {
    name: 'data-focus-visible',
    values: 'present or absent',
    meaning: 'The input has keyboard focus.',
  },
]

export const useNumberInputHook: ApiHook = {
  name: 'useNumberInput',
  options: propRows<UseNumberInputOptions>({
    decimals: numberInputRows.decimals,
    allowNegative: numberInputRows.allowNegative,
    grouping: numberInputRows.grouping,
    min: numberInputRows.min,
    max: numberInputRows.max,
    mask: numberInputRows.mask,
    disabled: numberInputRows.disabled,
    onValueChange: numberInputRows.onValueChange,
    announceRejections: numberInputRows.announceRejections,
    messages: numberInputRows.messages,
  }),
  result: propRows<UseNumberInputResult>({
    inputProps: {
      type: 'NumberInputPartProps',
      default: '–',
      description:
        'Spread on an <input>: classes, type, the Field’s id, aria-describedby and state, and the handlers. Put your own props after them.',
    },
    mask: {
      type: 'Mask | undefined',
      default: '–',
      description: 'The mask that runs, before the locale is applied. undefined with mask={false}.',
    },
    format: {
      type: '(unmaskedValue: string) => string',
      default: '–',
      description: 'Formats a stored number for display, in the page’s language.',
    },
    unmask: {
      type: '(value: string) => string',
      default: '–',
      description: 'The machine form of a displayed number: 1 250,50 becomes 1250.50.',
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
