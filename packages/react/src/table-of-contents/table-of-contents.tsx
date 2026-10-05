'use client'
import { useContext, useEffect } from 'react'
import type {
  ComponentPropsWithRef,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  Ref,
  RefCallback,
} from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { useFocusVisible } from '../focus-visible/use-focus-visible.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
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

/** What `render` receives as its second argument, for every part. */
export interface TableOfContentsState {
  /** The id of the heading being read, or `undefined` before the first heading. */
  activeId: string | undefined
}

/** What the function child of `TableOfContents.Root` receives. */
export interface TableOfContentsChildrenState extends TableOfContentsState {
  /** The entries nested by their levels: draw a list of the nodes, an item for each. */
  tree: TableOfContentsNode[]
}

/**
 * What a `render` function of Root, List or Item gets to spread: your attributes, the part's
 * props and a callback ref, which fits any element.
 */
export interface TableOfContentsElementProps extends HTMLAttributes<HTMLElement> {
  ref: RefCallback<HTMLElement>
}

interface TableOfContentsPartComponentProps extends HTMLAttributes<HTMLElement> {
  /** The rendered element. */
  ref?: Ref<HTMLElement> | undefined
  /** Change the element. Its own semantics apply. */
  render?: RenderProp<TableOfContentsElementProps, TableOfContentsState> | undefined
}

export interface TableOfContentsRootProps
  extends
    Omit<TableOfContentsPartComponentProps, 'children' | 'render'>,
    Omit<UseTableOfContentsOptions, 'labelledBy'> {
  /**
   * Without children, the Root draws the whole nested list from `items`. A function draws your own
   * instead and gets `{ tree, activeId }`. It isn't called when `items` is empty: the Root then
   * renders nothing, so a title you draw in it goes too.
   */
  children?: ReactNode | ((state: TableOfContentsChildrenState) => ReactNode) | undefined
  /**
   * Change the element. It must stay a `<nav>` (or have `role="navigation"`), otherwise the
   * landmark is gone.
   */
  render?: RenderProp<TableOfContentsElementProps, TableOfContentsState> | undefined
}

export type TableOfContentsListProps = TableOfContentsPartComponentProps
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
  /** Change the element. It must stay an `<a>` with an `href`. */
  render?: RenderProp<ComponentPropsWithRef<'a'>, TableOfContentsState> | undefined
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
  render,
  ref,
  ...otherProps
}: TableOfContentsListProps): ReactElement {
  const contents = useContext(TableOfContentsContext)
  useWarnOutsideRoot('List', contents === null)
  const mergedRef = useMergedRef(ref, null)
  return renderPart({
    render,
    defaultElement: 'ul',
    // The part's class joins a prop's and a render element's own class names, so neither can
    // remove it and the theme keeps styling the list.
    partProps: { ...mergeProps(otherProps, tableOfContentsListProps), ref: mergedRef },
    state: { activeId: contents?.activeId },
  })
}
TableOfContentsList.displayName = 'TableOfContents.List'

/** An `<li class="kv-table-of-contents-item">`: a `TableOfContents.Link`, and optionally a nested list. */
export function TableOfContentsItem({
  render,
  ref,
  ...otherProps
}: TableOfContentsItemProps): ReactElement {
  const contents = useContext(TableOfContentsContext)
  useWarnOutsideRoot('Item', contents === null)
  const mergedRef = useMergedRef(ref, null)
  return renderPart({
    render,
    defaultElement: 'li',
    partProps: { ...mergeProps(otherProps, tableOfContentsItemProps), ref: mergedRef },
    state: { activeId: contents?.activeId },
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
  render,
  ref,
  ...otherProps
}: TableOfContentsLinkProps): ReactElement {
  const contents = useContext(TableOfContentsContext)
  const { isFocusVisible, focusVisibleProps } = useFocusVisible()
  useWarnOutsideRoot('Link', contents === null)
  const mergedRef = useMergedRef(ref, null)
  const linkProps =
    contents === null ? getTableOfContentsLinkProps(item, undefined) : contents.getLinkProps(item)
  return renderPart({
    render,
    defaultElement: 'a',
    partProps: {
      ...mergeProps(otherProps, linkProps, {
        ...(isFocusVisible ? { 'data-focus-visible': '' } : {}),
        ...focusVisibleProps,
      }),
      children: hasOwnText(children) ? children : item.label,
      ref: mergedRef,
    },
    state: { activeId: contents?.activeId },
  })
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
  render,
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
      {renderPart({
        render,
        defaultElement: 'nav',
        // Your own props come last, so an `aria-label` of yours names the landmark in place of
        // the message. The part's class still joins yours.
        partProps: {
          ...mergeProps(contents.rootProps, otherProps),
          children: content,
          ref: mergedRef,
        },
        state: { activeId },
      })}
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
