import type { SliderProps, UseSliderOptions, UseSliderResult } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

/** The props Slider documents: its own, and the native ones whose behaviour it changes. */
export type SliderDocumentedProps = Pick<
  SliderProps,
  | 'value'
  | 'defaultValue'
  | 'min'
  | 'max'
  | 'step'
  | 'name'
  | 'disabled'
  | 'valueText'
  | 'onValueChange'
  | 'aria-labelledby'
  | 'render'
>

export const sliderRows = propRows<SliderDocumentedProps>({
  value: {
    type: 'number',
    default: '–',
    description:
      'Controlled: the number from your form logic. Pair it with onValueChange. The slider never copies it into state of its own.',
  },
  defaultValue: {
    type: 'number',
    default: 'halfway',
    description: 'Uncontrolled: the browser keeps the number, and a form submit sends it.',
  },
  min: { type: 'number', default: '0', description: 'The lowest value.' },
  max: { type: 'number', default: '100', description: 'The highest value.' },
  step: { type: 'number', default: '1', description: 'The distance between values.' },
  name: { type: 'string', default: '–', description: 'The name a form submit uses.' },
  disabled: {
    type: 'boolean',
    default: 'false',
    description: 'Native disabled: skipped by Tab. A disabled Field disables the slider too.',
  },
  valueText: {
    type: '(value: number) => string',
    default: 'the number in the provider’s locale',
    description:
      'What aria-valuetext says. Give it the unit, such as “15 km”, or a screen reader says only the number.',
  },
  onValueChange: {
    type: '(value: number, details: SliderChangeDetails) => void',
    default: '–',
    description:
      'Called on every change with the new number and { reason: "input", event }. It only reports. onChange still works too.',
  },
  'aria-labelledby': {
    type: 'string',
    default: '–',
    description:
      'Names the slider by another element, and opts it out of its Field: no id, description or invalid state from it. For a slider beside a NumberInput that owns the Field.',
  },
  render: {
    type: 'RenderProp<ComponentPropsWithRef<"input">, SliderState>',
    default: '–',
    description:
      'Changes the element, which must still be an <input type="range">. A function receives the props and { isInvalid, isDisabled, isFocusVisible, value }.',
  },
})

export const sliderAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-slider',
    values: 'always',
    meaning: 'The part class. The default theme styles it.',
  },
  {
    name: 'aria-valuetext',
    values: 'always',
    meaning: 'From valueText, or the number in the provider’s locale.',
  },
  {
    name: 'data-invalid',
    values: 'present or absent',
    meaning: 'The Field is invalid.',
  },
  {
    name: 'data-disabled',
    values: 'present or absent',
    meaning: 'The Field or the disabled prop disables it.',
  },
  {
    name: 'data-focus-visible',
    values: 'present or absent',
    meaning: 'The slider has keyboard focus (:focus-visible).',
  },
  {
    name: 'aria-invalid',
    values: '"true" or absent',
    meaning: 'Set when its Field is invalid.',
  },
]

export const useSliderHook: ApiHook = {
  name: 'useSlider',
  options: propRows<UseSliderOptions>({
    value: { type: 'number', default: '–', description: 'Controlled: the number from your logic.' },
    defaultValue: {
      type: 'number',
      default: 'halfway',
      description: 'Uncontrolled: the browser keeps the number.',
    },
    min: { type: 'number', default: '0', description: 'The lowest value.' },
    max: { type: 'number', default: '100', description: 'The highest value.' },
    step: { type: 'number', default: '1', description: 'The distance between values.' },
    name: { type: 'string', default: '–', description: 'The name a form submit uses.' },
    disabled: { type: 'boolean', default: 'false', description: 'Native disabled.' },
    onValueChange: {
      type: '(value: number, details: SliderChangeDetails) => void',
      default: '–',
      description: 'Called with the new number on every change. It only reports.',
    },
    valueText: {
      type: '(value: number) => string',
      default: 'the number in the provider’s locale',
      description: 'What aria-valuetext says.',
    },
    'aria-labelledby': {
      type: 'string',
      default: '–',
      description: 'Names the slider by another element and opts it out of its Field.',
    },
  }),
  result: propRows<UseSliderResult>({
    inputProps: {
      type: 'SliderPartProps',
      default: '–',
      description:
        'Spread on an <input>: class, type, range, Field wiring, aria-valuetext, state attributes and handlers.',
    },
    isInvalid: { type: 'boolean', default: '–', description: 'Whether the Field is invalid.' },
    isDisabled: { type: 'boolean', default: '–', description: 'Whether the slider is disabled.' },
    isFocusVisible: {
      type: 'boolean',
      default: '–',
      description: 'Whether the slider has keyboard (:focus-visible) focus.',
    },
    value: { type: 'number', default: '–', description: 'The current number.' },
    valueText: { type: 'string', default: '–', description: 'What aria-valuetext says.' },
  }),
}
