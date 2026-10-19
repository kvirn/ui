import type { GridItemProps, GridRootProps, UseGridResult } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

const classNameDescription =
  'Your own classes. They join the part’s class and never replace it, so the theme keeps styling the layout.'

export const gridRootRows = propRows<Pick<GridRootProps, 'className' | 'as' | 'ref'>>({
  className: {
    type: 'string',
    default: '–',
    description: `${classNameDescription} Add kv-grid--cols-1 to -12 for a number of columns, kv-grid--fit-sm, -md or -lg for as many as fit, kv-grid--gap-n for the space, and a breakpoint for a wider grid: kv-grid--md-cols-2.`,
  },
  as: {
    type: "'div' | 'ul' | 'ol'",
    default: "'div'",
    description:
      'Changes the element: ul or ol with li children for a list whose count is announced. A list gets role="list", because Safari drops the list role when the bullets are removed. In JavaScript, an element outside the list is replaced by a div and warns once in development.',
  },
  ref: {
    type: 'Ref<HTMLElement>',
    default: '–',
    description: 'Reaches the grid element, not the wrapper around it.',
  },
})

export const gridItemRows = propRows<Pick<GridItemProps, 'className' | 'as' | 'ref'>>({
  className: {
    type: 'string',
    default: '–',
    description: `${classNameDescription} Add kv-grid-item--span-n for the columns it covers, start-n and end-n for the column lines, row-span-n for rows, and a breakpoint: kv-grid-item--lg-span-8.`,
  },
  as: {
    type: "'div' | 'li' | 'article' | 'section' | 'nav' | 'aside' | 'main'",
    default: "'div'",
    description:
      'Changes the element: li inside a ul or ol Root, article, section, nav or aside with a name, or main (one per page, never the default). Grid adds no role of its own: the element’s meaning applies.',
  },
  ref: {
    type: 'Ref<HTMLElement>',
    default: '–',
    description: 'Reaches the element, whichever it is.',
  },
})

export const gridRootAttributes: readonly AttributeRow[] = [
  { name: 'kv-grid', values: 'always', meaning: 'The part class. The default theme styles it.' },
  {
    name: 'kv-grid-container',
    values: 'always',
    meaning: 'On the internal wrapper around the grid element. The breakpoints measure its width.',
  },
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
    meaning:
      'The space between cells. n is 0 to 6, 8, 10, 12 or 16. The default gap is 1.5rem; gap-0 removes it.',
  },
  {
    name: 'kv-grid--gap-x-n | kv-grid--gap-y-n',
    values: 'you add it',
    meaning: 'The space between columns only, or between rows only.',
  },
  {
    name: 'kv-grid--rows-n | flow-row | flow-col | auto-rows-… | auto-cols-…',
    values: 'you add it',
    meaning:
      'Explicit rows (1 to 12), the direction new cells fill in, and the size of rows or columns the grid adds itself. They change how cells are placed, not the order of the DOM.',
  },
  {
    name: 'kv-grid--items-… | justify-items-… | place-items-… | content-… | justify-…',
    values: 'you add it',
    meaning:
      'Where cells sit inside their area (start, center, end, stretch), and where the whole set of tracks sits inside the grid.',
  },
  {
    name: 'kv-grid--sm-… | --md-… | --lg-… | --xl-… | --2xl-…',
    values: 'you add it',
    meaning:
      'Any of the above from a breakpoint of the grid’s own width: sm 40rem, md 48rem, lg 64rem, xl 80rem, 2xl 96rem. For example kv-grid--lg-cols-12.',
  },
]

export const gridItemAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-grid-item',
    values: 'always',
    meaning: 'The part class. The default theme styles it.',
  },
  {
    name: 'kv-grid-item--span-n | span-full | start-n | end-n | row-span-n | row-start-n | row-end-n',
    values: 'you add it',
    meaning:
      'The columns and rows a cell covers, or the line it starts or ends at. Keep line placement in DOM order: reading and focus order follow the DOM.',
  },
  {
    name: 'kv-grid-item--self-… | justify-self-… | place-self-…',
    values: 'you add it',
    meaning: 'Where one cell sits inside its own area, in place of what the Root chose.',
  },
  {
    name: 'kv-grid-item--subgrid | rows-subgrid',
    values: 'you add it',
    meaning:
      'The cell becomes a grid that shares the columns (or rows) of its parent, so its own cells line up with the cells around it.',
  },
  {
    name: 'kv-grid-item--lg-span-8',
    values: 'you add it',
    meaning: 'Any of the above from a breakpoint of the grid’s own width, as for the Root.',
  },
]

export const useGridHook: ApiHook = {
  name: 'useGrid',
  intro:
    'Gives the classes for your own elements. It takes no options, and the classes add no role, ARIA or tabindex. On your own ul or ol, add role="list" yourself, which Grid.Root does for you.',
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
