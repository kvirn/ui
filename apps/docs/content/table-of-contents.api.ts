import type {
  TableOfContentsLinkProps,
  TableOfContentsListProps,
  TableOfContentsRootProps,
  UseTableOfContentsOptions,
  UseTableOfContentsResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

const itemsRow = {
  type: 'readonly { id: string; label: string; level: number }[]',
  description:
    'The headings of the page in document order. The id is the heading’s own and unique, and the link is #id. The level is the heading’s level, 2 for an h2: a deeper level nests under the entry above it. Keep the array in one place: a constant, or useMemo.',
} as const

const offsetRow = {
  type: 'number',
  default: '0',
  description:
    'The top of the area a heading is read in, in px from the top of the viewport. The current heading is the last one in the top fifth of the space below it. With a sticky header, use its height here and as scroll-padding-top on html.',
} as const

const messagesRow = {
  type: "Partial<KvirnMessages['tableOfContents']>",
  default: '–',
  description: 'Overrides the message tableOfContents.label for this list. See Strings.',
} as const

export const tableOfContentsRootRows = propRows<
  Pick<TableOfContentsRootProps, 'items' | 'offset' | 'messages' | 'aria-labelledby' | 'children'>
>({
  items: itemsRow,
  offset: offsetRow,
  'aria-labelledby': {
    type: 'string',
    default: '–',
    description:
      'The id of a visible title that names the landmark. It replaces the message label, never both.',
  },
  messages: messagesRow,
  children: {
    type: 'ReactNode | ((state: { tree: TableOfContentsNode[]; activeId: string | undefined }) => ReactNode)',
    default: '–',
    description:
      'Draws your own list instead of the built one. It isn’t called when items is empty, so a title drawn in it goes too.',
  },
})

export const tableOfContentsRootAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-table-of-contents',
    values: 'always',
    meaning: 'The part class. The default theme styles it.',
  },
  {
    name: 'aria-label',
    values: 'the label message, or absent',
    meaning: 'The name when there is no aria-labelledby. An aria-label of your own wins.',
  },
]

export const tableOfContentsListRows = propRows<Pick<TableOfContentsListProps, 'as'>>({
  as: {
    type: "'ul' | 'ol'",
    default: "'ul'",
    description: 'Changes the element to ol for a numbered contents list. role="list" stays.',
  },
})

export const tableOfContentsListAttributes: readonly AttributeRow[] = [
  { name: 'kv-table-of-contents-list', values: 'always', meaning: 'The part class.' },
]

export const tableOfContentsItemAttributes: readonly AttributeRow[] = [
  { name: 'kv-table-of-contents-item', values: 'always', meaning: 'The part class.' },
]

export const tableOfContentsLinkRows = propRows<
  Pick<TableOfContentsLinkProps, 'item' | 'children'>
>({
  item: {
    type: '{ id: string; label: string; level: number }',
    description: 'The entry the link is for, such as node.item. Its id makes the link #id.',
  },
  children: {
    type: 'ReactNode',
    default: 'the entry’s label',
    description: 'Your own text for the link. Without it the link shows the entry’s label.',
  },
})

export const tableOfContentsLinkAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-link',
    values: 'always',
    meaning: 'The class of every link. The default theme makes it a contents item in the list.',
  },
  {
    name: 'aria-current',
    values: '"location" or absent',
    meaning: 'Set on the link of the heading being read, and on no other. Not passed directly.',
  },
  {
    name: 'data-current',
    values: 'present or absent',
    meaning: 'Present on the same link, for your own styles.',
  },
  {
    name: 'data-focus-visible',
    values: 'present or absent',
    meaning: 'The link has keyboard focus (:focus-visible).',
  },
]

export const useTableOfContentsHook: ApiHook = {
  name: 'useTableOfContents',
  options: propRows<UseTableOfContentsOptions>({
    items: itemsRow,
    offset: offsetRow,
    labelledBy: {
      type: 'string',
      default: '–',
      description:
        'The id of a visible title that names the landmark, as aria-labelledby. It replaces the message label.',
    },
    messages: messagesRow,
  }),
  result: propRows<UseTableOfContentsResult>({
    rootProps: {
      type: 'TableOfContentsRootPartProps',
      default: '–',
      description: 'Spread on the <nav>: the class and its name.',
    },
    listProps: {
      type: 'TableOfContentsListPartProps',
      default: '–',
      description: 'Spread on every <ul>, nested ones too: the class and role="list".',
    },
    itemProps: {
      type: 'TableOfContentsItemPartProps',
      default: '–',
      description: 'Spread on every <li>: the class.',
    },
    tree: {
      type: 'TableOfContentsNode[]',
      default: '–',
      description:
        'The entries nested by their levels: draw one <ul> per list and one <li> per node.',
    },
    activeId: {
      type: 'string | undefined',
      default: '–',
      description:
        'The id of the heading being read. Undefined while no heading is on screen, on the server, during hydration and without IntersectionObserver.',
    },
    getLinkProps: {
      type: '(item: TableOfContentsEntry) => TableOfContentsLinkPartProps',
      default: '–',
      description: 'The props of one <a>: class, href="#id" and aria-current on the current one.',
    },
  }),
}
