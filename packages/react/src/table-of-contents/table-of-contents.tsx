'use client'
import { createElement, useContext, useEffect } from 'react'
import type { ComponentPropsWithRef, HTMLAttributes, ReactElement, ReactNode, Ref } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { useFocusVisible } from '../focus-visible/use-focus-visible.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { resolveAsTag } from '../render/as-prop.ts'
import type { AsTag } from '../render/as-prop.ts'
import { renderPart } from '../render/render-part.ts'
import { TableOfContentsContext } from './table-of-contents-context.ts'
import {
  getTableOfContentsLinkProps,
  tableOfContentsItemProps,
  tableOfContentsListProps,
  useTableOfContents,
} from './use-table-of-contents.ts'
import type {
  TableOfContentsEntry,
  TableOfContentsNode,
  UseTableOfContentsOptions,
} from './use-table-of-contents.ts'

export type { TableOfContentsEntry, TableOfContentsNode } from './use-table-of-contents.ts'

const listTags = ['ul', 'ol'] as const

/** What the function child of `TableOfContents.Root` receives. */
export interface TableOfContentsChildrenState {
  /** The id of the heading being read, or `undefined` while no heading is on screen. */
  activeId: string | undefined
  /** The entries nested by their levels: draw a list of the nodes, an item for each. */
  tree: TableOfContentsNode[]
}

interface TableOfContentsPartComponentProps extends HTMLAttributes<HTMLElement> {
  /** The rendered element. */
  ref?: Ref<HTMLElement> | undefined
}

/** Always a `<nav>`: the landmark is the part's purpose. */
export interface TableOfContentsRootProps
  extends
    Omit<TableOfContentsPartComponentProps, 'children'>,
    Omit<UseTableOfContentsOptions, 'labelledBy'> {
  /**
   * Without children, the Root draws the whole nested list from `items`. A function draws your own
   * instead and gets `{ tree, activeId }`. It isn't called when `items` is empty: the Root then
   * renders nothing, so a title you draw in it goes too.
   */
  children?: ReactNode | ((state: TableOfContentsChildrenState) => ReactNode) | undefined
}

/** `as` is `ul` (default) or `ol` for a numbered contents list. */
export type TableOfContentsListProps = AsTag<(typeof listTags)[number], 'ul'>
export type TableOfContentsItemProps = TableOfContentsPartComponentProps

export interface TableOfContentsLinkProps extends Omit<
  ComponentPropsWithRef<'a'>,
  'href' | 'aria-current'
> {
  /**
   * The entry this link is for: `node.item` from the function child. Its `id` makes the link
   * `#id` and its `label` is the text, unless you give children.
   */
  item: TableOfContentsEntry
}

type TableOfContentsPart = 'List' | 'Item' | 'Link'

function warnOutsideRoot(part: TableOfContentsPart): void {
  warnOnce(
    `table-of-contents-${part.toLowerCase()}-outside-root`,
    `A TableOfContents.${part} is outside a TableOfContents.Root, so it is not in a named navigation landmark and no heading is ever marked as current in it. Put it inside <TableOfContents.Root>.`,
  )
}

/** Internal. Warns once per part when it is not inside a Root (the context is `null`). */
function useWarnOutsideRoot(part: TableOfContentsPart, isOutsideRoot: boolean): void {
  useEffect(() => {
    if (isOutsideRoot) {
      warnOutsideRoot(part)
    }
  }, [isOutsideRoot, part])
}

/** Empty, whitespace-only or boolean children fall through to the entry's label. */
function hasOwnText(children: ReactNode): boolean {
  if (children === undefined || children === null || typeof children === 'boolean') {
    return false
  }
  return typeof children !== 'string' || children.trim() !== ''
}

/**
 * A `<ul class="kv-table-of-contents-list">`. For a nested level, put another
 * `TableOfContents.List` inside a `TableOfContents.Item`: the lists nest natively, so the depth is
 * announced.
 */
export function TableOfContentsList({
  as,
  ref,
  ...otherProps
}: TableOfContentsListProps): ReactElement {
  const contents = useContext(TableOfContentsContext)
  useWarnOutsideRoot('List', contents === null)
  const mergedRef = useMergedRef(ref, null)
  return renderPart({
    as: resolveAsTag({ part: 'TableOfContents.List', as, allowedTags: listTags }),
    defaultElement: 'ul',
    // The part's class joins a prop's own class names, so a prop can't remove it and the theme
    // keeps styling the list.
    partProps: { ...mergeProps(otherProps, tableOfContentsListProps), ref: mergedRef },
  })
}
TableOfContentsList.displayName = 'TableOfContents.List'

/** An `<li class="kv-table-of-contents-item">`: a `TableOfContents.Link`, and optionally a nested list. */
export function TableOfContentsItem({
  ref,
  ...otherProps
}: TableOfContentsItemProps): ReactElement {
  const contents = useContext(TableOfContentsContext)
  useWarnOutsideRoot('Item', contents === null)
  const mergedRef = useMergedRef(ref, null)
  return createElement('li', {
    ...mergeProps(otherProps, tableOfContentsItemProps),
    ref: mergedRef,
  })
}
TableOfContentsItem.displayName = 'TableOfContents.Item'

/**
 * The link to one heading: `<a class="kv-link" href="#id">` with the entry's label, and
 * `aria-current="location"` while it is the heading being read. It is always a plain hash link
 * (never your registered router link), so it works before the script has run, and the browser
 * scrolls with the page's own `scroll-padding-top`. Nothing moves focus.
 */
export function TableOfContentsLink({
  item,
  children,
  ref,
  ...otherProps
}: TableOfContentsLinkProps): ReactElement {
  const contents = useContext(TableOfContentsContext)
  const { isFocusVisible, focusVisibleProps } = useFocusVisible()
  useWarnOutsideRoot('Link', contents === null)
  const mergedRef = useMergedRef(ref, null)
  const linkProps =
    contents === null ? getTableOfContentsLinkProps(item, undefined) : contents.getLinkProps(item)
  return createElement(
    'a',
    {
      ...mergeProps(otherProps, linkProps, {
        ...(isFocusVisible ? { 'data-focus-visible': '' } : {}),
        ...focusVisibleProps,
      }),
      ref: mergedRef,
    },
    hasOwnText(children) ? children : item.label,
  )
}
TableOfContentsLink.displayName = 'TableOfContents.Link'

/** The whole nested list of a tree, from the parts. */
function renderTree(nodes: readonly TableOfContentsNode[]): ReactElement {
  return (
    <TableOfContentsList>
      {nodes.map((node) => (
        <TableOfContentsItem key={node.item.id}>
          <TableOfContentsLink item={node.item} />
          {node.children.length > 0 ? renderTree(node.children) : null}
        </TableOfContentsItem>
      ))}
    </TableOfContentsList>
  )
}

/**
 * The landmark: one `<nav class="kv-table-of-contents">` around the nested list of a page's
 * headings, drawn from `items` (contract: table-of-contents.a11y.md). It names itself with the
 * message `tableOfContents.label` ("På den här sidan"), or with your own visible title through
 * `aria-labelledby`, which is preferred, and never both. Empty `items` render nothing, so there
 * is no empty landmark.
 */
export function TableOfContentsRoot({
  items,
  offset,
  messages,
  children,
  ref,
  'aria-labelledby': labelledBy,
  ...otherProps
}: TableOfContentsRootProps): ReactElement | null {
  const contents = useTableOfContents({ items, offset, labelledBy, messages })
  const mergedRef = useMergedRef(ref, null)
  if (items.length === 0) {
    return null
  }
  const { tree, activeId } = contents
  const content =
    typeof children === 'function' ? children({ tree, activeId }) : (children ?? renderTree(tree))
  return (
    <TableOfContentsContext.Provider value={contents}>
      {createElement(
        'nav',
        {
          // Your own props come last, so an `aria-label` of yours names the landmark in place of
          // the message. The part's class still joins yours.
          ...mergeProps(contents.rootProps, otherProps),
          ref: mergedRef,
        },
        content,
      )}
    </TableOfContentsContext.Provider>
  )
}
TableOfContentsRoot.displayName = 'TableOfContents.Root'

/**
 * The headings of a long page as a named `<nav>` of plain `#id` links, with the one the reader is
 * in marked `aria-current="location"` (contract: table-of-contents.a11y.md). Give it the `items`
 * (the page's headings, in order, with their ids). It is never sticky, never scrolls by itself, and
 * never moves focus or announces a change. With `@kvirn-ui/theme`, the links are navigation items:
 * the heading being read is a solid fill, and the headings above it the quiet trail.
 *
 * @example
 * <h2 id="contents-title">På den här sidan</h2>
 * <TableOfContents.Root
 *   aria-labelledby="contents-title"
 *   offset={64}
 *   items={[
 *     { id: 'avgift', label: 'Avgift', level: 2 },
 *     { id: 'avgift-bostad', label: 'Bostäder', level: 3 },
 *     { id: 'ansok', label: 'Så ansöker du', level: 2 },
 *   ]}
 * />
 */
export const TableOfContents = {
  Root: TableOfContentsRoot,
  List: TableOfContentsList,
  Item: TableOfContentsItem,
  Link: TableOfContentsLink,
} as const
