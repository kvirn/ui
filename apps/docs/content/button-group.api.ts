import type { ButtonGroupProps, UseButtonGroupOptions, UseButtonGroupResult } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

/** ButtonGroup's own props. The name comes from the native aria-label and aria-labelledby. */
export type ButtonGroupDocumentedProps = Pick<ButtonGroupProps, 'layout' | 'render'>

export const buttonGroupRows = propRows<ButtonGroupDocumentedProps>({
  layout: {
    type: '"spaced" | "attached"',
    default: '"spaced"',
    description:
      '"attached" joins the buttons into one strip, like a segmented control. It changes the look only.',
  },
  render: {
    type: 'RenderProp<ComponentPropsWithRef<"div">, ButtonGroupState>',
    default: '–',
    description:
      'Changes the element. It gets the class and, with a name, the role. A function receives the props and { isNamed, layout }.',
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
    values: 'layout="attached"',
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
    layout: {
      type: '"spaced" | "attached"',
      default: '"spaced"',
      description: 'The class modifier: "attached" adds kv-button-group--attached.',
    },
  }),
  result: propRows<UseButtonGroupResult>({
    groupProps: {
      type: 'ButtonGroupPartProps',
      default: '–',
      description:
        'Spread on a <div>: the class (with the attached modifier) and role="group" when named.',
    },
  }),
}
