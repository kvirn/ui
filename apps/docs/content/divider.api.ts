import type { DividerProps } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { AttributeRow } from '../components/api-block.tsx'

export const dividerRows = propRows<Pick<DividerProps, 'ref'>>({
  ref: {
    type: 'Ref<HTMLHRElement>',
    default: '–',
    description: 'Reaches the <hr> element.',
  },
})

export const dividerAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-divider',
    values: 'always',
    meaning:
      'The part class. The default theme draws the line and its margin with it. Your className joins it.',
  },
]
