import type {
  CharacterCountProps,
  TextareaProps,
  UseCharacterCountOptions,
  UseTextareaOptions,
  UseTextareaResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

/** The props Textarea documents: its own, and the native ones whose behaviour it changes. */
export type TextareaDocumentedProps = Pick<
  TextareaProps,
  | 'value'
  | 'defaultValue'
  | 'onValueChange'
  | 'characterCount'
  | 'countCharacters'
  | 'messages'
  | 'maxLength'
  | 'rows'
  | 'disabled'
>

export const textareaRows = propRows<TextareaDocumentedProps>({
  value: {
    type: 'string',
    default: '–',
    description: 'Controlled: the value from your form state.',
  },
  defaultValue: {
    type: 'string',
    default: '–',
    description: 'Uncontrolled: the native box keeps the value and a form submit sends it.',
  },
  onValueChange: {
    type: '(value: string, details: TextareaChangeDetails) => void',
    default: '–',
    description:
      'Called on every change. details has reason: "input" and the event, and with characterCount also length, limit and isOverLimit.',
  },
  characterCount: {
    type: 'boolean',
    default: 'false',
    description:
      'Shows how many characters are left under the box, with maxLength as the limit. Without maxLength it warns in development and shows nothing.',
  },
  maxLength: {
    type: 'number',
    default: '–',
    description:
      'With characterCount: the limit the count measures, not written as the native maxlength, so a paste is never cut. Without it: the native attribute.',
  },
  countCharacters: {
    type: '(value: string) => number',
    default: '–',
    description:
      'With characterCount: counts the text your own way, for example as your server does. Default: the characters the user sees.',
  },
  messages: {
    type: "Partial<KvirnMessages['characterCount']>",
    default: '–',
    description: 'With characterCount: overrides the count’s texts for this box.',
  },
  rows: {
    type: 'number',
    default: '5',
    description:
      'The height in lines. Where the browser supports it the box grows with its text and rows is its minimum.',
  },
  disabled: {
    type: 'boolean',
    default: 'false',
    description: 'Native disabled. A disabled Field disables the box too.',
  },
})

export const textareaAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-textarea',
    values: 'always',
    meaning: 'The part class. The default theme styles it.',
  },
  {
    name: 'id, aria-describedby',
    values: 'in a Field',
    meaning:
      'From the Field. aria-describedby lists the descriptions, the count and the help texts in DOM order, then the error, and your own ids after them.',
  },
  {
    name: 'aria-invalid',
    values: '"true" or absent',
    meaning: 'In a Field with invalid. Never set by the count: over the limit is a warning.',
  },
  {
    name: 'aria-required',
    values: '"true" or absent',
    meaning: 'In a Field with required.',
  },
  {
    name: 'data-invalid, data-required, data-disabled',
    values: 'present or absent',
    meaning: 'The state of the Field.',
  },
  {
    name: 'data-focused',
    values: 'present or absent',
    meaning: 'The box has focus, however it got it.',
  },
  {
    name: 'data-focus-visible',
    values: 'present or absent',
    meaning: 'The box has keyboard focus.',
  },
  {
    name: 'data-over',
    values: 'present or absent',
    meaning: 'With characterCount: the text is longer than the limit.',
  },
]

export const useTextareaHook: ApiHook = {
  name: 'useTextarea',
  options: propRows<UseTextareaOptions>({
    disabled: {
      type: 'boolean',
      default: 'false',
      description: 'Native disabled. A disabled Field disables the box too.',
    },
    rows: { type: 'number', default: '5', description: 'The height in lines.' },
    onValueChange: {
      type: '(value: string, details: TextareaChangeDetails) => void',
      default: '–',
      description: 'Called on every change. It only reports: the value lives in your form state.',
    },
  }),
  result: propRows<UseTextareaResult>({
    textareaProps: {
      type: 'TextareaPartProps',
      default: '–',
      description:
        'Spread on a <textarea>: class, rows, the Field’s id, aria-describedby and state, and the handlers.',
    },
    isInvalid: { type: 'boolean', default: '–', description: 'Whether the Field is invalid.' },
    isRequired: { type: 'boolean', default: '–', description: 'Whether the Field is required.' },
    isDisabled: { type: 'boolean', default: '–', description: 'Whether the box is disabled.' },
    isFocused: { type: 'boolean', default: '–', description: 'Whether the box has focus.' },
    isFocusVisible: {
      type: 'boolean',
      default: '–',
      description: 'Whether the box has keyboard focus.',
    },
  }),
}

export type CharacterCountDocumentedProps = Pick<
  CharacterCountProps,
  | 'value'
  | 'limit'
  | 'countCharacters'
  | 'announceFrom'
  | 'announcementDebounceMilliseconds'
  | 'announceChanges'
  | 'messages'
  | 'id'
>

export const characterCountRows = propRows<CharacterCountDocumentedProps>({
  value: {
    type: 'string',
    description: 'The text the count is about: the value of your box.',
  },
  limit: {
    type: 'number',
    description: 'The most characters the text may have. At least 1.',
  },
  countCharacters: {
    type: '(value: string) => number',
    default: '–',
    description:
      'Counts the text your own way, so the count and your server agree. Default: the characters the user sees.',
  },
  announceFrom: {
    type: 'number',
    default: '0.8',
    description: 'A share of the limit, 0 to 1, from which the count is announced.',
  },
  announcementDebounceMilliseconds: {
    type: 'number',
    default: '500',
    description:
      'How long typing must pause before the count is announced. Crossing the limit is announced at once.',
  },
  announceChanges: {
    type: 'boolean',
    default: 'true',
    description:
      'Whether a change may be announced. Pass whether your box has focus, so a text set from code is silent.',
  },
  messages: {
    type: "Partial<KvirnMessages['characterCount']>",
    default: '–',
    description: 'Overrides the count’s texts: limit, remaining and over.',
  },
  id: {
    type: 'string',
    default: 'generated',
    description:
      'Outside a Field (also directly in a Fieldset): the id to list in your control’s aria-describedby. In a Field the Field gives it.',
  },
})

export const characterCountAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-field-help-text, kv-character-count',
    values: 'always',
    meaning: 'The part classes: a help text’s look, and the count’s own.',
  },
  {
    name: 'data-over',
    values: 'present or absent',
    meaning: 'The text is longer than the limit. The theme adds weight 600 and a warning icon.',
  },
  {
    name: 'data-near',
    values: 'present or absent',
    meaning: 'From the announce threshold, and over the limit.',
  },
  {
    name: 'data-invalid, data-required, data-disabled',
    values: 'present or absent',
    meaning: 'The state of the Field the count is in.',
  },
]

export const useCharacterCountRows = propRows<UseCharacterCountOptions>({
  value: characterCountRows.value,
  limit: characterCountRows.limit,
  countCharacters: characterCountRows.countCharacters,
  announceFrom: characterCountRows.announceFrom,
  announcementDebounceMilliseconds: characterCountRows.announcementDebounceMilliseconds,
  announceChanges: characterCountRows.announceChanges,
  messages: characterCountRows.messages,
  id: characterCountRows.id,
  ref: {
    type: 'Ref<HTMLParagraphElement>',
    default: '–',
    description: 'The element’s ref. Pass it here: the hook also needs the element.',
  },
})
