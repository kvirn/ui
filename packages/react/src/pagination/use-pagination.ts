import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useMemo } from 'react'
import { useMessages } from '../provider/use-messages.ts'

export interface UsePaginationOptions {
  /**
   * The landmark's accessible name, from your translations. Replaces the message
   * `pagination.label` (`Sidor`). An empty or whitespace-only label counts as none.
   */
  label?: string | undefined
  /** Per-instance message overrides: `{ next: 'Nästa' }`. */
  messages?: Partial<KvirnMessages['pagination']> | undefined
}

/** Spread on the `<nav>`. */
export interface PaginationRootPartProps {
  /**
   * The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-pagination`. Add your own
   * class next to it with `mergeProps`: class names join.
   */
  className: 'kv-pagination'
  /** From `label`, or the message `pagination.label`. */
  'aria-label': string
}

/** Spread on the `<ul>`. The role keeps the list announced where `list-style: none` removes it. */
export interface PaginationListPartProps {
  className: 'kv-pagination-list'
  role: 'list'
}

/** Spread on each `<li>`. Only the part's class. */
export interface PaginationItemPartProps {
  className: 'kv-pagination-item'
}

/** Spread on the gap's `<span>`. */
export interface PaginationEllipsisPartProps {
  className: 'kv-pagination-ellipsis'
}

/** Spread on the status `<span>`. */
export interface PaginationStatusPartProps {
  className: 'kv-pagination-status'
}

export interface UsePaginationResult {
  rootProps: PaginationRootPartProps
  listProps: PaginationListPartProps
  itemProps: PaginationItemPartProps
  ellipsisProps: PaginationEllipsisPartProps
  statusProps: PaginationStatusPartProps
  /** The resolved name of the landmark. */
  label: string
  /** The message `pagination.previous`: the text of the Previous link. */
  previousLabel: string
  /** The message `pagination.next`: the text of the Next link. */
  nextLabel: string
  /** The name of a page link: `Sida 2`. The current page's state is `aria-current`, not the name. */
  getPageLabel: (page: number) => string
  /** The text `Sida 2 av 9`. */
  getStatus: (page: number, total: number) => string
}

const listProps: PaginationListPartProps = Object.freeze({
  className: 'kv-pagination-list',
  role: 'list',
})
const itemProps: PaginationItemPartProps = Object.freeze({ className: 'kv-pagination-item' })
const ellipsisProps: PaginationEllipsisPartProps = Object.freeze({
  className: 'kv-pagination-ellipsis',
})
const statusProps: PaginationStatusPartProps = Object.freeze({ className: 'kv-pagination-status' })

/**
 * Pagination's part props, its name and its words for your own elements (contract:
 * pagination.a11y.md): a labelled `<nav>` around a list of links, with the current page marked
 * `aria-current="page"`. Pages are URLs, so every page is a link and none is a button.
 *
 * @example
 * const pagination = usePagination()
 * <nav {...pagination.rootProps}>
 *   <ul {...pagination.listProps}>
 *     <li {...pagination.itemProps}>
 *       <a href="?sida=3" aria-label={pagination.getPageLabel(3)}>3</a>
 *     </li>
 *   </ul>
 * </nav>
 */
export function usePagination({ label, messages }: UsePaginationOptions = {}): UsePaginationResult {
  const paginationMessages = useMessages('pagination', messages)
  const name = label !== undefined && label.trim() !== '' ? label : paginationMessages.label
  const rootProps = useMemo<PaginationRootPartProps>(
    () => ({ className: 'kv-pagination', 'aria-label': name }),
    [name],
  )
  const { previous, next, status, page } = paginationMessages

  return useMemo(
    () => ({
      rootProps,
      listProps,
      itemProps,
      ellipsisProps,
      statusProps,
      label: name,
      previousLabel: previous,
      nextLabel: next,
      getPageLabel: (pageNumber) => page({ page: pageNumber }),
      getStatus: (pageNumber, total) => status({ page: pageNumber, total }),
    }),
    [rootProps, name, previous, next, status, page],
  )
}
