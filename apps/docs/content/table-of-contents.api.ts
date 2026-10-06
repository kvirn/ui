import type {
  TableOfContentsItemProps,
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
    'The headings of the page in document order. The id is the heading’s own and unique, and the link is #id. Keep the array in one place: a constant, or useMemo.',
} as const

const offsetRow = {
  type: 'number',
  default: '0',
  description:
    'The line, in px from the top of the viewport, a heading has to reach to become the current one. With a sticky header, use its height here and as scroll-padding-top on html.',
} as const

const messagesRow = {
  type: 'Partial<{ label: string }>',
  default: '–',
  description: 'Per-instance text overrides. See Strings.',
} as const

export const tableOfContentsRootRows = propRows<
  Pick<
    TableOfContentsRootProps,
    'items' | 'offset' | 'messages' | 'aria-labelledby' | 'children' | 'render'
  >
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
    type: '(state: { tree, activeId }) => ReactNode',
    default: '–',
    description:
      'Draws your own list instead of the built one. It isn’t called when items is empty, so a title drawn in it goes too.',
  },
  render: {
    type: 'RenderProp<TableOfContentsElementProps, TableOfContentsState>',
    default: '–',
    description: 'Changes the element, which must stay a <nav> or have role="navigation".',
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

export const tableOfContentsListRows = propRows<Pick<TableOfContentsListProps, 'render'>>({
  render: {
    type: 'RenderProp<TableOfContentsElementProps, TableOfContentsState>',
    default: '–',
    description: 'Changes the element. Its own semantics apply.',
  },
})

export const tableOfContentsListAttributes: readonly AttributeRow[] = [
  { name: 'kv-table-of-contents-list', values: 'always', meaning: 'The part class.' },
]

export const tableOfContentsItemRows = propRows<Pick<TableOfContentsItemProps, 'render'>>({
  render: {
    type: 'RenderProp<TableOfContentsElementProps, TableOfContentsState>',
    default: '–',
    description: 'Changes the element. Its own semantics apply.',
  },
})

export const tableOfContentsItemAttributes: readonly AttributeRow[] = [
  { name: 'kv-table-of-contents-item', values: 'always', meaning: 'The part class.' },
]

export const tableOfContentsLinkRows = propRows<
  Pick<TableOfContentsLinkProps, 'item' | 'children' | 'render'>
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
  render: {
    type: 'RenderProp<ComponentPropsWithRef<"a">, TableOfContentsState>',
    default: '–',
    description: 'Changes the element, which must stay an <a> with an href.',
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
      description: 'Spread on every <ul>, nested ones too: the class.',
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
        'The id of the heading being read. Undefined before the first heading, on the server, during hydration and without IntersectionObserver.',
    },
    getLinkProps: {
      type: '(item: TableOfContentsEntry) => TableOfContentsLinkPartProps',
      default: '–',
      description: 'The props of one <a>: class, href="#id" and aria-current on the current one.',
    },
  }),
}
