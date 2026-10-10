import type { ButtonGroupProps, UseButtonGroupOptions, UseButtonGroupResult } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

/** ButtonGroup's own props. The name comes from the native aria-label and aria-labelledby. */
export type ButtonGroupDocumentedProps = Pick<ButtonGroupProps, 'className'>

export const buttonGroupRows = propRows<ButtonGroupDocumentedProps>({
  className: {
    type: 'string',
    default: '–',
    description:
      'Your own classes. They join the part’s class and never replace it. Add kv-button-group--attached to join the buttons into one strip, like a segmented control.',
  },
})

export const buttonGroupAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-button-group',
    values: 'always',
    meaning: 'The part class. The default theme lays the buttons in a row, stacked below 40rem.',
  },
  {
    name: 'kv-button-group--attached',
    values: 'you add it',
    meaning: 'The buttons touch and share borders. Only the outer corners are rounded.',
  },
  {
    name: 'role="group"',
    values: 'only with a name',
    meaning: 'Set when aria-label or aria-labelledby is given. Not passed directly.',
  },
  {
    name: 'aria-label, aria-labelledby',
    values: 'you set one',
    meaning: 'The name of the group. Required in a Toolbar.',
  },
]

export const useButtonGroupHook: ApiHook = {
  name: 'useButtonGroup',
  options: propRows<UseButtonGroupOptions>({
    isNamed: {
      type: 'boolean',
      default: 'false',
      description:
        'Whether the group has a name (aria-label or aria-labelledby). A named group gets role="group".',
    },
  }),
  result: propRows<UseButtonGroupResult>({
    groupProps: {
      type: 'ButtonGroupPartProps',
      default: '–',
      description: 'Spread on a <div>: the class and role="group" when named.',
    },
  }),
}
