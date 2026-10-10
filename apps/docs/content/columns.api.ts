import type { ColumnsProps, UseColumnsResult } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

export const columnsRows = propRows<Pick<ColumnsProps, 'as' | 'className'>>({
  className: {
    type: 'string',
    default: '–',
    description:
      'Your own classes. They join the part’s class and never replace it, so the theme keeps styling the layout. Add kv-columns--min-sm or -lg for the narrowest column, and kv-columns--gap-4 or -8 for the space.',
  },
  as: {
    type: "'div' | 'ul' | 'ol'",
    default: "'div'",
    description:
      'Changes the element: ul or ol with li children for a list whose count is announced. Columns adds no role.',
  },
})

export const columnsAttributes: readonly AttributeRow[] = [
  { name: 'kv-columns', values: 'always', meaning: 'The part class. The default theme styles it.' },
  {
    name: 'kv-columns--min-sm | -lg',
    values: 'you add it',
    meaning: 'The narrowest column: 14rem or 24rem. The default is 18rem.',
  },
  {
    name: 'kv-columns--gap-4 | -8',
    values: 'you add it',
    meaning: 'The space between columns. The default is the space-6 step.',
  },
]

export const useColumnsHook: ApiHook = {
  name: 'useColumns',
  intro: 'Gives the class for your own element. It adds no role, ARIA or tabindex.',
  result: propRows<UseColumnsResult>({
    columnsProps: {
      type: 'ColumnsPartProps',
      default: '–',
      description: 'Spread on your element: only className. The same frozen object every time.',
    },
  }),
}
