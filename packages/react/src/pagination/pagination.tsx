'use client'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react'
import type { ElementType, HTMLAttributes, ReactElement, ReactNode, Ref, RefCallback } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { LinkRoot } from '../link/link.tsx'
import type { LinkProps } from '../link/link.tsx'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import type { RegisteredLinkComponent } from '../provider/register.ts'
import { useFormat } from '../provider/use-format.ts'
import { usePagination } from './use-pagination.ts'
import type {
  PaginationEllipsisPartProps,
  PaginationItemPartProps,
  PaginationListPartProps,
  PaginationRootPartProps,
  PaginationStatusPartProps,
} from './use-pagination.ts'

interface PaginationPartComponentProps extends HTMLAttributes<HTMLElement> {
  /** The rendered element. */
  ref?: Ref<HTMLElement> | undefined
}

export interface PaginationRootProps extends PaginationPartComponentProps {
  /**
   * The landmark's accessible name, from your translations: `Sidor`. Replaces the message
   * `pagination.label`, set as `aria-label`.
   */
  label?: string | undefined
  /** Per-instance message overrides: `{ next: 'Nästa' }`. */
  messages?: Partial<KvirnMessages['pagination']> | undefined
}
export type PaginationListProps = PaginationPartComponentProps
export type PaginationItemProps = PaginationPartComponentProps
export type PaginationEllipsisProps = PaginationPartComponentProps

export interface PaginationStatusProps extends PaginationPartComponentProps {
  /** The page you are on, from 1. */
  page: number
  /** How many pages there are. */
  total: number
  /** Your own text. Replaces the message `pagination.status`, so its language is yours to set. */
  children?: ReactNode
  /** Per-instance message overrides for this status. */
  messages?: Partial<KvirnMessages['pagination']> | undefined
}

export type PaginationLinkProps<Component extends ElementType = RegisteredLinkComponent> = Omit<
  LinkProps<Component>,
  'current' | 'messages'
> & {
  /**
   * The page this link goes to, from 1. It becomes the link's text and, with the message, its
   * name (`Sida 2`). Your own `children` replace both: the visible text is then the name (2.5.3).
   */
  page: number
  /** This link is the current page. It stays a link, and gets `aria-current="page"`. */
  current?: boolean | undefined
  /** Per-instance message overrides for this link: `{ page: ({ page }) => `Sida ${page}` }`. */
  messages?: Partial<KvirnMessages['pagination']> | undefined
}

export type PaginationPreviousProps<Component extends ElementType = RegisteredLinkComponent> = Omit<
  LinkProps<Component>,
  'current' | 'messages'
> & {
  /** Your own text. Replaces the message `pagination.previous`, so its language is yours to set. */
  children?: ReactNode
  /** Per-instance message overrides: `{ previous: 'Tillbaka' }`. */
  messages?: Partial<KvirnMessages['pagination']> | undefined
}
export type PaginationNextProps<Component extends ElementType = RegisteredLinkComponent> =
  PaginationPreviousProps<Component>

/** Empty, whitespace-only or boolean children fall through to the message. */
function hasOwnText(children: ReactNode): boolean {
  if (children === undefined || children === null || typeof children === 'boolean') {
    return false
  }
  return typeof children !== 'string' || children.trim() !== ''
}

/** Internal. One part: one element. The part's props join the consumer's (mergeProps). */
function renderPaginationPart(
  otherProps: PaginationPartComponentProps,
  defaultElement: 'nav' | 'ul' | 'li' | 'span',
  partProps:
    | PaginationRootPartProps
    | PaginationListPartProps
    | PaginationItemPartProps
    | PaginationEllipsisPartProps
    | PaginationStatusPartProps,
  elementRef: RefCallback<HTMLElement>,
  children?: ReactNode,
): ReactElement {
  return createElement(defaultElement, {
    // The part's class joins a prop's class names, so a prop can't remove it and the theme keeps
    // styling the pagination.
    ...mergeProps(otherProps, partProps),
    ref: elementRef,
    ...(children === undefined ? {} : { children }),
  })
}

// Internal. The Root counts the Status parts in it. A ref, not state: the Status registers in a
// layout effect, which runs before the Root's effect reads the count.
const PaginationStatusContext = createContext<(() => () => void) | null>(null)

/**
 * The landmark: one `<nav class="kv-pagination">`, named by the message `pagination.label` or
 * your `label`. Put a `Pagination.List` in it.
 */
export function PaginationRoot({
  label,
  messages,
  ref,
  ...otherProps
}: PaginationRootProps): ReactElement {
  const pagination = usePagination({ label, messages })
  const mergedRef = useMergedRef(ref, null)
  const statusCount = useRef(0)
  const registerStatus = useCallback(() => {
    statusCount.current += 1
    return () => {
      statusCount.current -= 1
    }
  }, [])
  useEffect(() => {
    if (statusCount.current === 0) {
      warnOnce(
        'pagination-status-missing',
        'A <Pagination.Root> has no <Pagination.Status>. Below 40rem the theme hides the page numbers, so a narrow screen shows only Previous and Next and the reader loses where they are. Render a Pagination.Status with the page and the total (WCAG 1.3.1, 2.4.8).',
      )
    }
  }, [])
  return (
    <PaginationStatusContext.Provider value={registerStatus}>
      {renderPaginationPart(otherProps, 'nav', pagination.rootProps, mergedRef)}
    </PaginationStatusContext.Provider>
  )
}
PaginationRoot.displayName = 'Pagination.Root'

/** A `<ul class="kv-pagination-list">`: Previous, the pages, the status and Next, each in an `Item`. */
export function PaginationList({ ref, ...otherProps }: PaginationListProps): ReactElement {
  const pagination = usePagination()
  const mergedRef = useMergedRef(ref, null)
  return renderPaginationPart(otherProps, 'ul', pagination.listProps, mergedRef)
}
PaginationList.displayName = 'Pagination.List'

/** An `<li class="kv-pagination-item">`: one link, the gap or the status. */
export function PaginationItem({ ref, ...otherProps }: PaginationItemProps): ReactElement {
  const pagination = usePagination()
  const mergedRef = useMergedRef(ref, null)
  return renderPaginationPart(otherProps, 'li', pagination.itemProps, mergedRef)
}
PaginationItem.displayName = 'Pagination.Item'

/**
 * A gap in the page numbers: the text `…`, in an `Item`. It is not focusable and not a link.
 * Your own children replace the text.
 */
export function PaginationEllipsis({
  children,
  ref,
  ...otherProps
}: PaginationEllipsisProps): ReactElement {
  const pagination = usePagination()
  const mergedRef = useMergedRef(ref, null)
  return renderPaginationPart(
    otherProps,
    'span',
    pagination.ellipsisProps,
    mergedRef,
    hasOwnText(children) ? children : '…',
  )
}
PaginationEllipsis.displayName = 'Pagination.Ellipsis'

/**
 * The status text for a narrow screen: `Sida 2 av 9` from the message `pagination.status`, in
 * an `Item`. The theme shows it, with Previous and Next, instead of the page links below 40rem.
 */
export function PaginationStatus({
  page,
  total,
  messages,
  children,
  ref,
  ...otherProps
}: PaginationStatusProps): ReactElement {
  const pagination = usePagination({ messages })
  const mergedRef = useMergedRef(ref, null)
  const registerStatus = useContext(PaginationStatusContext)
  useLayoutEffect(() => registerStatus?.(), [registerStatus])
  return renderPaginationPart(
    otherProps,
    'span',
    pagination.statusProps,
    mergedRef,
    hasOwnText(children) ? children : pagination.getStatus(page, total),
  )
}
PaginationStatus.displayName = 'Pagination.Status'

/**
 * A page link: a thin wrapper over `Link.Root`, so a native `<a href>` rendered by the app's
 * registered router link. Its text is the page number, its name `Sida 2` (`current` adds `aria-current`, not
 * words), so the visible number is in the name (2.5.3). With your own `children` there is no
 * `aria-label`: the visible text is the name.
 */
export function PaginationLink<Component extends ElementType = RegisteredLinkComponent>(
  props: PaginationLinkProps<Component>,
): ReactElement
export function PaginationLink({
  page,
  current,
  messages,
  children,
  ...otherProps
}: PaginationLinkProps<'a'>): ReactElement {
  const pagination = usePagination({ messages })
  const format = useFormat()
  const ownText = hasOwnText(children)
  return (
    <LinkRoot
      {...mergeProps(
        {
          className: 'kv-pagination-link',
          ...(ownText ? {} : { 'aria-label': pagination.getPageLabel(page) }),
        },
        otherProps,
      )}
      current={current === true ? 'page' : undefined}
    >
      {ownText ? children : format.number(page)}
    </LinkRoot>
  )
}
PaginationLink.displayName = 'Pagination.Link'

/** The link to the previous page, with the words `Föregående sida` and an arrow the theme draws. */
export function PaginationPrevious<Component extends ElementType = RegisteredLinkComponent>(
  props: PaginationPreviousProps<Component>,
): ReactElement
export function PaginationPrevious({
  messages,
  children,
  ...otherProps
}: PaginationPreviousProps<'a'>): ReactElement {
  const pagination = usePagination({ messages })
  return (
    <LinkRoot {...mergeProps({ className: 'kv-pagination-previous', rel: 'prev' }, otherProps)}>
      {hasOwnText(children) ? children : pagination.previousLabel}
    </LinkRoot>
  )
}
PaginationPrevious.displayName = 'Pagination.Previous'

/** The link to the next page, with the words `Nästa sida` and an arrow the theme draws. */
export function PaginationNext<Component extends ElementType = RegisteredLinkComponent>(
  props: PaginationNextProps<Component>,
): ReactElement
export function PaginationNext({
  messages,
  children,
  ...otherProps
}: PaginationNextProps<'a'>): ReactElement {
  const pagination = usePagination({ messages })
  return (
    <LinkRoot {...mergeProps({ className: 'kv-pagination-next', rel: 'next' }, otherProps)}>
      {hasOwnText(children) ? children : pagination.nextLabel}
    </LinkRoot>
  )
}
PaginationNext.displayName = 'Pagination.Next'

/**
 * A row of page links (contract: pagination.a11y.md): a labelled `<nav>` around a list with
 * Previous, page numbers, gaps and Next. Pages are URLs, so each is a native link rendered by
 * your registered router link, never a button: Back, sharing and opening in a new tab work. The
 * current page is a link with `aria-current="page"` and a filled shape, not colour alone. Which
 * numbers and gaps to show is yours to decide. Below 40rem the theme shows Previous, the
 * `Status` text and Next only.
 *
 * @example
 * <Pagination.Root>
 *   <Pagination.List>
 *     <Pagination.Item><Pagination.Previous href="?sida=1" /></Pagination.Item>
 *     <Pagination.Item><Pagination.Link page={1} href="?sida=1" /></Pagination.Item>
 *     <Pagination.Item><Pagination.Link page={2} href="?sida=2" current /></Pagination.Item>
 *     <Pagination.Item><Pagination.Ellipsis /></Pagination.Item>
 *     <Pagination.Item><Pagination.Link page={9} href="?sida=9" /></Pagination.Item>
 *     <Pagination.Item><Pagination.Status page={2} total={9} /></Pagination.Item>
 *     <Pagination.Item><Pagination.Next href="?sida=3" /></Pagination.Item>
 *   </Pagination.List>
 * </Pagination.Root>
 */
export const Pagination = {
  Root: PaginationRoot,
  List: PaginationList,
  Item: PaginationItem,
  Link: PaginationLink,
  Previous: PaginationPrevious,
  Next: PaginationNext,
  Ellipsis: PaginationEllipsis,
  Status: PaginationStatus,
} as const
