import type { AddressProps } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { AttributeRow } from '../components/api-block.tsx'

export const addressRows = propRows<Pick<AddressProps, 'ref'>>({
  ref: {
    type: 'Ref<HTMLElement>',
    default: '–',
    description: 'Reaches the <address> element.',
  },
})

export const addressAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-address',
    values: 'always',
    meaning:
      'The part class. The default theme uses it to undo the browser’s italic. Your className joins it.',
  },
]
