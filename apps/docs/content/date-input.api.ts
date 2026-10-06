import type {
  DateInputBoxProps,
  DateInputRootProps,
  UseDateInputOptions,
  UseDateInputResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

/** The props DateInput.Root documents: its own. The rest are the props of a `<div>`. */
export type DateInputRootDocumentedProps = Pick<
  DateInputRootProps,
  | 'name'
  | 'value'
  | 'defaultValue'
  | 'onValueChange'
  | 'autoComplete'
  | 'order'
  | 'required'
  | 'disabled'
  | 'readOnly'
  | 'autoAdvance'
  | 'invalidParts'
  | 'messages'
  | 'render'
>

export const dateInputRootRows = propRows<DateInputRootDocumentedProps>({
  name: {
    type: 'string',
    default: '–',
    description:
      'A prefix for the boxes’ name: "birth" gives birth-day, birth-month and birth-year. Without it a form submit sends nothing.',
  },
  value: {
    type: 'DateInputValue',
    default: '–',
    description:
      'Controlled: { year, month, day }, all strings ("" for an empty box). Pair it with onValueChange.',
  },
  defaultValue: {
    type: 'Partial<DateInputValue>',
    default: '–',
    description:
      'Uncontrolled: the text each box starts with. The native inputs keep it after that.',
  },
  onValueChange: {
    type: '(value: DateInputValue, details: DateInputChangeDetails) => void',
    default: '–',
    description:
      'Called with the whole date, as typed, after every change in any box. details is { reason: "input", part, event }. It only reports and never parses.',
  },
  autoComplete: {
    type: "'bday'",
    default: '–',
    description:
      'For a date of birth only: the boxes get bday-day, bday-month and bday-year (1.3.5).',
  },
  order: {
    type: 'readonly DateInputPart[]',
    default: 'The locale’s',
    description:
      'The order of the boxes when the Root renders them itself. Your own children are the order you write them.',
  },
  required: {
    type: 'boolean',
    default: 'The Fieldset’s',
    description: 'aria-required on the three boxes.',
  },
  disabled: {
    type: 'boolean',
    default: 'The Fieldset’s',
    description: 'Native disabled on the three boxes.',
  },
  readOnly: { type: 'boolean', default: '–', description: 'Native readOnly on the three boxes.' },
  autoAdvance: {
    type: 'boolean',
    default: 'true',
    description:
      'Focus moves to the next box, with its text selected, when the user’s typing fills a box. Turns the visible hint under the boxes on. false turns both off: typing never moves focus.',
  },
  invalidParts: {
    type: 'readonly DateInputPart[]',
    default: '–',
    description:
      'The wrong boxes: aria-invalid and data-invalid on those only. With your own children, set invalid on each box instead.',
  },
  messages: {
    type: "Partial<KvirnMessages['dateInput']>",
    default: '–',
    description: 'Replaces the three labels and the auto-advance hint for this date.',
  },
  render: {
    type: 'RenderProp<ComponentPropsWithRef<"div">, DateInputState>',
    default: '–',
    description:
      'Changes the element. A function receives the props and { order, isRequired, isDisabled }.',
  },
})

/** Day, Month and Year take the props of a TextInput except the ones DateInput owns. */
export type DateInputBoxDocumentedProps = Pick<DateInputBoxProps, 'invalid'>

export const dateInputBoxRows = propRows<DateInputBoxDocumentedProps>({
  invalid: {
    type: 'boolean',
    default: 'false',
    description:
      'This box is wrong: aria-invalid and data-invalid on its input, label and field. The Fieldset’s invalid marks none of the boxes.',
  },
})

export const dateInputRootAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-date-input',
    values: 'always',
    meaning: 'The part class: the row of boxes. The default theme styles it.',
  },
  {
    name: 'kv-field-help-text',
    values: 'on the hint',
    meaning:
      'The auto-advance hint is a paragraph with this class, right after the row, while autoAdvance is on. It is part of the Fieldset’s description.',
  },
]

export const dateInputBoxAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-date-input-day',
    values: 'on the box’s Field',
    meaning:
      'Next to kv-field, so the theme sizes the box. kv-date-input-month and kv-date-input-year likewise.',
  },
  {
    name: 'kv-input',
    values: 'on the input',
    meaning:
      'The text input’s class. inputmode="numeric", spellcheck="false", no maxlength or pattern.',
  },
  {
    name: 'data-invalid',
    values: 'present or absent',
    meaning: 'On the input, its label and its field when this box is invalid.',
  },
  {
    name: 'aria-invalid',
    values: '"true" or absent',
    meaning: 'On the input when this box is invalid. Not passed directly.',
  },
  {
    name: 'autocomplete',
    values: '"bday-day", "bday-month", "bday-year" or absent',
    meaning: 'Set when the Root has autoComplete="bday".',
  },
]

export const useDateInputHook: ApiHook = {
  name: 'useDateInput',
  options: propRows<UseDateInputOptions>({
    name: { type: 'string', default: '–', description: 'A prefix for the three inputs’ name.' },
    value: {
      type: 'DateInputValue',
      default: '–',
      description: 'Controlled: all three as strings.',
    },
    defaultValue: {
      type: 'Partial<DateInputValue>',
      default: '–',
      description: 'Uncontrolled: the text each box starts with.',
    },
    onValueChange: {
      type: '(value: DateInputValue, details: DateInputChangeDetails) => void',
      default: '–',
      description: 'Called with the whole date after every change. It only reports.',
    },
    autoComplete: {
      type: "'bday'",
      default: '–',
      description: 'For a date of birth: bday-day, bday-month and bday-year.',
    },
    order: {
      type: 'readonly DateInputPart[]',
      default: 'The locale’s',
      description: 'Replaces the order from Intl for the provider’s locale.',
    },
    readOnly: { type: 'boolean', default: 'false', description: 'Native readOnly on the inputs.' },
    autoAdvance: {
      type: 'boolean',
      default: 'true',
      description:
        'Move focus to the next box when typing fills one. Render autoAdvanceHint while it is on.',
    },
    messages: {
      type: "Partial<KvirnMessages['dateInput']>",
      default: '–',
      description: 'Replaces the labels and the hint.',
    },
  }),
  result: propRows<UseDateInputResult>({
    order: {
      type: 'readonly DateInputPart[]',
      default: '–',
      description:
        'The order of the boxes: year, month, day for sv-SE; day, month, year for sv-FI, fi, nb and en. Read it to write the example in the help text.',
    },
    labels: {
      type: 'Record<DateInputPart, string>',
      default: '–',
      description: 'The resolved labels of the three boxes.',
    },
    autoAdvanceHint: {
      type: 'string | undefined',
      default: '–',
      description:
        'The hint while autoAdvance is on, undefined when it is off. Render it as visible text in the group’s description.',
    },
    rootProps: {
      type: 'DateInputRootPartProps',
      default: '–',
      description: 'Spread on the row: the class kv-date-input.',
    },
    getBoxProps: {
      type: '(part) => DateInputBoxPartProps',
      default: '–',
      description: 'Spread on a box’s Field.Root: the class kv-date-input-<part>.',
    },
    getInputProps: {
      type: '(part) => DateInputInputPartProps',
      default: '–',
      description:
        'Spread on a box’s input: name, inputMode, spellCheck, autoComplete, value or defaultValue, onChange and the ref the hook needs.',
    },
  }),
}
