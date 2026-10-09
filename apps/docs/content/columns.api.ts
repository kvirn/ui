import type { ColumnsProps, UseColumnsOptions, UseColumnsResult } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

export const columnsRows = propRows<
  Pick<ColumnsProps, 'minColumnWidth' | 'gap' | 'as' | 'className'>
>({
  minColumnWidth: {
    type: "'sm' | 'md' | 'lg'",
    default: "'md'",
    description:
      'The narrowest a column gets before the row wraps: sm is 14rem, md 18rem, lg 24rem. On a screen narrower than that there is one column.',
  },
  gap: {
    type: "'4' | '6' | '8'",
    default: "'6'",
    description: 'The space between columns and between rows, a space step in the theme.',
  },
  className: {
    type: 'string',
    default: '–',
    description:
      'Your own classes. They join the part’s class and never replace it, so the theme keeps styling the layout.',
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
    values: 'added by minColumnWidth',
    meaning: 'The narrowest column. md, the default, adds no class.',
  },
  {
    name: 'kv-columns--gap-4 | -8',
    values: 'added by gap',
    meaning: 'The space between columns. 6, the default, adds no class.',
  },
]

export const useColumnsHook: ApiHook = {
  name: 'useColumns',
  intro: 'Gives the class for your own element. It adds no role, ARIA or tabindex.',
  options: propRows<UseColumnsOptions>({
    minColumnWidth: {
      type: "'sm' | 'md' | 'lg'",
      default: "'md'",
      description: 'The narrowest a column gets before the row wraps.',
    },
    gap: {
      type: "'4' | '6' | '8'",
      default: "'6'",
      description: 'The space between columns and rows.',
    },
  }),
  result: propRows<UseColumnsResult>({
    columnsProps: {
      type: 'ColumnsPartProps',
      default: '–',
      description:
        'Spread on your element: only className. The same frozen object for the same choices.',
    },
  }),
}
