import type { GridItemProps, GridRootProps, UseGridResult } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

const classNameDescription =
  'Your own classes. They join the part’s class and never replace it, so the theme keeps styling the layout.'

export const gridRootRows = propRows<Pick<GridRootProps, 'className' | 'as'>>({
  className: {
    type: 'string',
    default: '–',
    description: `${classNameDescription} Add kv-grid--cols-1 to -12 for a number of columns, kv-grid--fit-sm, -md or -lg for as many as fit, kv-grid--gap-n for the space, and a breakpoint for a wider screen: kv-grid--md-cols-2.`,
  },
  as: {
    type: "'div' | 'ul' | 'ol'",
    default: "'div'",
    description:
      'Changes the element: ul or ol with li children for a list whose count is announced. A list gets role="list", because Safari drops the role when the list style is removed.',
  },
})

export const gridItemRows = propRows<Pick<GridItemProps, 'className' | 'as'>>({
  className: {
    type: 'string',
    default: '–',
    description: `${classNameDescription} Add kv-grid-item--span-n for the columns it covers, start-n and end-n for the lines, row-span-n for rows, and a breakpoint: kv-grid-item--lg-span-8.`,
  },
  as: {
    type: "'div' | 'li' | 'article' | 'section'",
    default: "'div'",
    description:
      'Changes the element: li inside a ul or ol Root, article, or section with a name. Grid adds no role.',
  },
})

export const gridRootAttributes: readonly AttributeRow[] = [
  { name: 'kv-grid', values: 'always', meaning: 'The part class. The default theme styles it.' },
  {
    name: 'kv-grid--cols-n',
    values: 'you add it',
    meaning:
      'n equal columns, 1 to 12. The default is one column. A bare cols-n (n above 1), flow-col without rows-n or auto-cols-min|max keeps its tracks at 320px, so content overflows or overlaps (1.4.10): start at cols-1 or fit-* and add columns with a breakpoint form, kv-grid--lg-cols-3.',
  },
  {
    name: 'kv-grid--fit-sm | -md | -lg',
    values: 'you add it',
    meaning: 'As many columns as fit, none narrower than 14rem, 18rem or 24rem.',
  },
  {
    name: 'kv-grid--gap-n',
    values: 'you add it',
    meaning: 'The space between cells. The default is the space-6 step; gap-0 removes it.',
  },
  {
    name: 'kv-grid--sm-… | md | lg | xl | 2xl',
    values: 'you add it',
    meaning:
      'Any of the above from a breakpoint (40, 48, 64, 80 and 96rem) of the grid’s own width: kv-grid--lg-cols-12.',
  },
]

export const gridItemAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-grid-item',
    values: 'always',
    meaning: 'The part class. The default theme styles it.',
  },
  {
    name: 'kv-grid-item--span-n | start-n | end-n | row-span-n',
    values: 'you add it',
    meaning:
      'The columns and rows a cell covers, or the line it starts or ends at. Keep line placement in DOM order: reading and focus order follow the DOM.',
  },
  {
    name: 'kv-grid-item--lg-span-8',
    values: 'you add it',
    meaning: 'Any of the above from a breakpoint of the grid’s own width.',
  },
]

export const useGridHook: ApiHook = {
  name: 'useGrid',
  intro: 'Gives the classes for your own elements. They add no role, ARIA or tabindex.',
  result: propRows<UseGridResult>({
    containerProps: {
      type: 'GridPartProps',
      default: '–',
      description:
        'Spread on an element that wraps only the grid element: it is the container the breakpoints answer to. Only className.',
    },
    rootProps: {
      type: 'GridPartProps',
      default: '–',
      description: 'Spread on the grid’s element: only className.',
    },
    itemProps: {
      type: 'GridPartProps',
      default: '–',
      description: 'Spread on a cell’s element: only className.',
    },
  }),
}
