import type {
  InputGroupAddonProps,
  InputGroupRootProps,
  UseInputGroupOptions,
  UseInputGroupResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

/** The props InputGroup.Root documents: its own, and `render`. */
export type InputGroupRootDocumentedProps = Pick<
  InputGroupRootProps,
  'invalid' | 'disabled' | 'render'
>

export const inputGroupRootRows = propRows<InputGroupRootDocumentedProps>({
  invalid: {
    type: 'boolean',
    default: 'the Field’s invalid',
    description:
      'Draws the invalid edge (data-invalid). It changes only the look: the input needs aria-invalid too, which a Field sets for you.',
  },
  disabled: {
    type: 'boolean',
    default: 'the Field’s disabled',
    description:
      'Draws the disabled edge (data-disabled) and stops a click from focusing the input. The input needs native disabled too, which a Field sets for you.',
  },
  render: {
    type: 'RenderProp<ComponentPropsWithRef<"div">, InputGroupState>',
    default: '–',
    description:
      'Changes the element. A function receives the props and { isInvalid, isDisabled, isFocusVisible }.',
  },
})

export const inputGroupRootAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-input-group',
    values: 'always',
    meaning: 'The part class. It draws the edge, the radius and the focus ring of the box.',
  },
  {
    name: 'data-invalid',
    values: 'present or absent',
    meaning: 'The box is invalid, from the invalid prop or the Field.',
  },
  {
    name: 'data-disabled',
    values: 'present or absent',
    meaning: 'The box is disabled, from the disabled prop or the Field.',
  },
  {
    name: 'data-focus-visible',
    values: 'present or absent',
    meaning: 'The input inside has keyboard focus, so the ring is drawn around the box.',
  },
]

export const inputGroupAddonRows = propRows<Pick<InputGroupAddonProps, 'render'>>({
  render: {
    type: 'RenderProp<ComponentPropsWithRef<"span">, InputGroupState>',
    default: '–',
    description:
      'Changes the element. A function receives the props and { isInvalid, isDisabled, isFocusVisible } of the box.',
  },
})

export const inputGroupAddonAttributes: readonly AttributeRow[] = [
  { name: 'kv-input-group-addon', values: 'always', meaning: 'The part class.' },
  {
    name: 'aria-hidden',
    values: '"true"',
    meaning: 'Always set. An addon is visual only, so the label must say what it shows.',
  },
]

export const useInputGroupHook: ApiHook = {
  name: 'useInputGroup',
  options: propRows<UseInputGroupOptions>({
    invalid: inputGroupRootRows.invalid,
    disabled: inputGroupRootRows.disabled,
  }),
  result: propRows<UseInputGroupResult>({
    rootProps: {
      type: 'InputGroupRootPartProps',
      default: '–',
      description:
        'Spread on the box, a <div>: class, state, and the handlers that focus the input on a press and track keyboard focus.',
    },
    addonProps: {
      type: 'InputGroupAddonPartProps',
      default: '–',
      description: 'Spread on a unit or an icon: class and aria-hidden.',
    },
    isInvalid: { type: 'boolean', default: '–', description: 'Whether the box is invalid.' },
    isDisabled: { type: 'boolean', default: '–', description: 'Whether the box is disabled.' },
    isFocusVisible: {
      type: 'boolean',
      default: '–',
      description: 'Whether the input inside has keyboard focus.',
    },
  }),
}
