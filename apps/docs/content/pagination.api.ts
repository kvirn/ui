import type {
  PaginationEllipsisProps,
  PaginationItemProps,
  PaginationLinkProps,
  PaginationListProps,
  PaginationNextProps,
  PaginationPreviousProps,
  PaginationRootProps,
  PaginationStatusProps,
  UsePaginationOptions,
  UsePaginationResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

const renderRow = {
  type: 'RenderProp<PaginationElementProps, PaginationPartState>',
  default: '–',
  description: 'Changes the element. Its own semantics apply.',
}

const messagesRow = {
  type: "Partial<KvirnMessages['pagination']>",
  default: '–',
  description: 'Per-instance message overrides.',
}

export const paginationRootRows = propRows<
  Pick<PaginationRootProps, 'label' | 'messages' | 'render'>
>({
  label: {
    type: 'string',
    default: 'the message pagination.label',
    description:
      'The accessible name, from your translations. Set as aria-label. An empty or whitespace-only label counts as none. Name two paginations on one page differently.',
  },
  messages: messagesRow,
  render: {
    ...renderRow,
    description: 'Changes the element, which must stay a <nav> or have role="navigation".',
  },
})

export const paginationRootAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-pagination',
    values: 'always',
    meaning: 'The part class. The default theme styles it.',
  },
  {
    name: 'aria-label',
    values: 'the label, or absent',
    meaning: 'From label or the message. Not set when you pass aria-labelledby.',
  },
]

export const paginationListRows = propRows<Pick<PaginationListProps, 'render'>>({
  render: renderRow,
})

export const paginationListAttributes: readonly AttributeRow[] = [
  { name: 'kv-pagination-list', values: 'always', meaning: 'The part class.' },
]

export const paginationItemRows = propRows<Pick<PaginationItemProps, 'render'>>({
  render: renderRow,
})

export const paginationItemAttributes: readonly AttributeRow[] = [
  { name: 'kv-pagination-item', values: 'always', meaning: 'The part class.' },
]

export const paginationLinkRows = propRows<
  Pick<PaginationLinkProps, 'page' | 'current' | 'messages' | 'children'>
>({
  page: {
    type: 'number',
    description:
      'The page this link goes to, from 1. It is the link’s text, through the locale’s number format, and with the message its name: Page 2.',
  },
  current: {
    type: 'boolean',
    default: 'false',
    description:
      'This link is the current page. It stays a link, and gets aria-current="page" and the name Page 2 (the current state is aria-current, not repeated in the name).',
  },
  messages: {
    ...messagesRow,
    description: 'Overrides pagination.page and pagination.currentPage for this link.',
  },
  children: {
    type: 'ReactNode',
    default: 'the page number',
    description:
      'Your own text. It replaces the number. The name stays the message, so keep the visible text in it (2.5.3).',
  },
})

export const paginationLinkAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-pagination-link',
    values: 'always',
    meaning: 'The part class, next to kv-link.',
  },
  {
    name: 'aria-label',
    values: '"Page 2"',
    meaning: 'From the messages page and currentPage.',
  },
  {
    name: 'aria-current',
    values: '"page" or absent',
    meaning: 'From current.',
  },
]

export const paginationPreviousRows = propRows<
  Pick<PaginationPreviousProps, 'messages' | 'children'>
>({
  messages: {
    ...messagesRow,
    description: 'Overrides pagination.previous for this link.',
  },
  children: {
    type: 'ReactNode',
    default: 'the message pagination.previous',
    description: 'Your own text. Its language is yours to set.',
  },
})

export const paginationPreviousAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-pagination-previous',
    values: 'always',
    meaning: 'The part class, next to kv-link. The theme draws the arrow.',
  },
  { name: 'rel', values: '"prev"', meaning: 'Always set.' },
]

export const paginationNextRows = propRows<Pick<PaginationNextProps, 'messages' | 'children'>>({
  messages: {
    ...messagesRow,
    description: 'Overrides pagination.next for this link.',
  },
  children: {
    type: 'ReactNode',
    default: 'the message pagination.next',
    description: 'Your own text. Its language is yours to set.',
  },
})

export const paginationNextAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-pagination-next',
    values: 'always',
    meaning: 'The part class, next to kv-link. The theme draws the arrow.',
  },
  { name: 'rel', values: '"next"', meaning: 'Always set.' },
]

export const paginationEllipsisRows = propRows<
  Pick<PaginationEllipsisProps, 'children' | 'render'>
>({
  children: {
    type: 'ReactNode',
    default: '…',
    description: 'Your own text for the gap.',
  },
  render: renderRow,
})

export const paginationEllipsisAttributes: readonly AttributeRow[] = [
  { name: 'kv-pagination-ellipsis', values: 'always', meaning: 'The part class.' },
]

export const paginationStatusRows = propRows<
  Pick<PaginationStatusProps, 'page' | 'total' | 'messages' | 'children' | 'render'>
>({
  page: {
    type: 'number',
    description: 'The page you are on, from 1.',
  },
  total: {
    type: 'number',
    description: 'How many pages there are.',
  },
  messages: {
    ...messagesRow,
    description: 'Overrides pagination.status for this status.',
  },
  children: {
    type: 'ReactNode',
    default: 'the message pagination.status',
    description: 'Your own text. Its language is yours to set.',
  },
  render: renderRow,
})

export const paginationStatusAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-pagination-status',
    values: 'always',
    meaning: 'The part class. The default theme shows it below 40rem, instead of the page links.',
  },
]

export const usePaginationHook: ApiHook = {
  name: 'usePagination',
  options: propRows<UsePaginationOptions>({
    label: {
      type: 'string',
      default: 'the message pagination.label',
      description: 'The accessible name, set as aria-label. An empty label counts as none.',
    },
    messages: {
      type: "Partial<KvirnMessages['pagination']>",
      default: '–',
      description: 'Per-instance message overrides: { next: "Nästa" }.',
    },
  }),
  result: propRows<UsePaginationResult>({
    rootProps: {
      type: 'PaginationRootPartProps',
      default: '–',
      description: 'Spread on the <nav>: the class and aria-label.',
    },
    listProps: {
      type: 'PaginationListPartProps',
      default: '–',
      description: 'Spread on the <ul>: the class.',
    },
    itemProps: {
      type: 'PaginationItemPartProps',
      default: '–',
      description: 'Spread on every <li>: the class.',
    },
    ellipsisProps: {
      type: 'PaginationEllipsisPartProps',
      default: '–',
      description: 'Spread on the gap’s <span>: the class.',
    },
    statusProps: {
      type: 'PaginationStatusPartProps',
      default: '–',
      description: 'Spread on the status <span>: the class.',
    },
    label: {
      type: 'string',
      default: '–',
      description: 'The resolved name of the landmark.',
    },
    previousLabel: {
      type: 'string',
      default: '–',
      description: 'The message pagination.previous: the text of the Previous link.',
    },
    nextLabel: {
      type: 'string',
      default: '–',
      description: 'The message pagination.next: the text of the Next link.',
    },
    getPageLabel: {
      type: '(page: number) => string',
      default: '–',
      description:
        'The name of a page link: Page 2. The current page gets aria-current="page" instead of a longer name.',
    },
    getStatus: {
      type: '(page: number, total: number) => string',
      default: '–',
      description: 'The status text: Page 2 of 9.',
    },
  }),
}
