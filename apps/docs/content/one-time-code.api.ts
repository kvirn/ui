import type {
  OneTimeCodeRootProps,
  OneTimeCodeSlotProps,
  UseOneTimeCodeOptions,
  UseOneTimeCodeResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow, PropRow } from '../components/api-block.tsx'

/** The props OneTimeCode.Root documents: the hook’s options. The rest are a `<div>`’s. */
export type OneTimeCodeRootDocumentedProps = Pick<
  OneTimeCodeRootProps,
  | 'pattern'
  | 'value'
  | 'defaultValue'
  | 'onValueChange'
  | 'onComplete'
  | 'disabled'
  | 'announceRejections'
  | 'messages'
>

const optionRows = {
  pattern: {
    type: 'string',
    default: "'999999'",
    description:
      'One symbol per position: 9 a digit, * a letter or digit, a a letter, A an upper-case letter, & an upper-case letter or digit, - a separator between two of them. ASCII only. An invalid pattern throws a RangeError, also in production.',
  },
  value: {
    type: 'string',
    default: '–',
    description:
      'Controlled: the value from your state, with its separators (ABCD-1234). Pair it with onValueChange.',
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
      'Called with the masked value on every change. details has reason, event and the mask’s unmaskedValue, isComplete and rejected. It only reports.',
  },
  onComplete: {
    type: '(value: string, unmaskedValue: string) => void',
    default: '–',
    description:
      'Called when a change leaves the code complete and different: the last character, a paste or an autofill. It never submits and never moves focus.',
  },
  disabled: {
    type: 'boolean',
    default: 'false',
    description: 'Native disabled. A disabled Field disables the input too.',
  },
  announceRejections: {
    type: 'boolean',
    default: 'true',
    description:
      'Announces, politely and throttled, when the mask drops a character (4.1.3). Needs a KvirnProvider.',
  },
  messages: {
    type: "Partial<KvirnMessages['mask']>",
    default: '–',
    description: 'Replaces the rejection messages for this code.',
  },
} satisfies Record<keyof UseOneTimeCodeOptions, PropRow>

export const oneTimeCodeRootRows = propRows<OneTimeCodeRootDocumentedProps>({
  ...optionRows,
})

export type OneTimeCodeSlotDocumentedProps = Pick<OneTimeCodeSlotProps, 'index'>

export const oneTimeCodeSlotRows = propRows<OneTimeCodeSlotDocumentedProps>({
  index: {
    type: 'number',
    description:
      'The position in the pattern this slot draws, from 0 to pattern.length - 1. A - in the pattern is a separator slot, so render one slot per position, separators included.',
  },
})

export const oneTimeCodeRootAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-one-time-code',
    values: 'always',
    meaning: 'The part class: the row. The default theme styles it.',
  },
  {
    name: 'data-complete',
    values: 'present or absent',
    meaning: 'Every character slot is filled.',
  },
  {
    name: 'data-invalid',
    values: 'present or absent',
    meaning: 'The Field is invalid. Also on every slot.',
  },
  {
    name: 'data-disabled',
    values: 'present or absent',
    meaning: 'The Field or the disabled prop disables it. Also on every slot.',
  },
  {
    name: 'data-ready',
    values: 'present or absent',
    meaning:
      'The hook has started and read the input’s value. The theme draws the slots only then: until then it shows the plain input.',
  },
  {
    name: 'data-character-count',
    values: 'number',
    meaning: 'The character symbols in the pattern (8 for ****-****). The theme reads it.',
  },
  {
    name: 'data-separator-count',
    values: 'number',
    meaning: 'The - in the pattern (1 for ****-****, 0 for none). The theme reads it.',
  },
]

export const oneTimeCodeInputAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-one-time-code-input',
    values: 'always',
    meaning: 'The part class: the one native input.',
  },
  {
    name: 'autocomplete',
    values: '"one-time-code"',
    meaning:
      'Always, with type="text", spellcheck="false", autocorrect="off" and dir="ltr". No maxlength, no pattern, never type="password".',
  },
  {
    name: 'inputmode',
    values: '"numeric" or absent',
    meaning: 'Only when every character symbol of the pattern is 9.',
  },
  {
    name: 'autocapitalize',
    values: '"characters" or absent',
    meaning: 'Unless a symbol is a or *.',
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
  {
    name: 'data-invalid, data-required, data-disabled',
    values: 'present or absent',
    meaning: 'From the Field, with aria-invalid, aria-required and native disabled.',
  },
]

export const oneTimeCodeSlotAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-one-time-code-slot',
    values: 'on a character slot',
    meaning: 'Draws one character. aria-hidden="true", never focusable.',
  },
  {
    name: 'kv-one-time-code-separator',
    values: 'on a separator slot',
    meaning: 'The pattern’s -. It has no state and is never filled, active or selected.',
  },
  { name: 'data-filled', values: 'present or absent', meaning: 'The slot holds a character.' },
  {
    name: 'data-active',
    values: 'present or absent',
    meaning: 'Where the next character goes, while the input has focus and nothing is selected.',
  },
  {
    name: 'data-caret',
    values: '"before" or "after"',
    meaning: 'On the active slot: the caret is before its character, or after the last one.',
  },
  {
    name: 'data-selected',
    values: 'present or absent',
    meaning: 'The input’s selection covers this slot’s character.',
  },
  { name: 'data-invalid', values: 'present or absent', meaning: 'The Field is invalid.' },
]

export const useOneTimeCodeHook: ApiHook = {
  name: 'useOneTimeCode',
  options: propRows<UseOneTimeCodeOptions>(optionRows),
  result: propRows<UseOneTimeCodeResult>({
    rootProps: {
      type: 'OneTimeCodeRootPartProps',
      default: '–',
      description: 'Spread on the row: class and the data-* the theme reads.',
    },
    inputProps: {
      type: 'OneTimeCodeInputPartProps',
      default: '–',
      description:
        'Spread on one <input>: class, the autofill attributes, Field wiring, value and handlers, and the ref the hook needs.',
    },
    getSlotProps: {
      type: '(index: number) => OneTimeCodeSlotPartProps',
      default: '–',
      description: 'Spread on the slot at a position of the pattern, separators included.',
    },
    slots: {
      type: 'readonly OneTimeCodeSlotState[]',
      default: '–',
      description:
        'One entry per position: { kind, character, isFilled, isActive, caret, isSelected }. Use it to render the slots.',
    },
    value: {
      type: 'string',
      default: '–',
      description: 'The value the input shows now, with its separators.',
    },
    pattern: { type: 'string', default: '–', description: 'The pattern in use.' },
    characterCount: {
      type: 'number',
      default: '–',
      description: 'How many characters the code has: the pattern without its separators.',
    },
    isComplete: { type: 'boolean', default: '–', description: 'Every character slot is filled.' },
    isReady: {
      type: 'boolean',
      default: '–',
      description: 'The hook has started and read the input’s value.',
    },
    isInvalid: { type: 'boolean', default: '–', description: 'Whether the Field is invalid.' },
    isDisabled: { type: 'boolean', default: '–', description: 'Whether the input is disabled.' },
  }),
}
