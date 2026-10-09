import { getActiveHeading, getTableOfContentsTree } from '@kvirn-ui/core'
import type { HeadingPosition, TableOfContentsEntry, TableOfContentsNode } from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { useEnv } from '../provider/use-env.ts'
import { useMessages } from '../provider/use-messages.ts'

export type { TableOfContentsEntry, TableOfContentsNode }

export interface UseTableOfContentsOptions {
  /**
   * The headings of the page, in document order: `{ id: 'avgift', label: 'Avgift', level: 2 }`.
   * The `id` is the heading's own, unique on the page, and the link is `#id`. Keep the array in
   * one place (a constant, or `useMemo`): the observer is keyed by the ids, so a new array of the
   * same ids changes nothing, but the tree is worked out again.
   */
  items: readonly TableOfContentsEntry[]
  /**
   * The top of the area a heading is read in, in px from the top of the viewport: the current
   * heading is the last one in the top 20% of the space below it, or the first one visible before
   * that. Default `0`. With a sticky header, give its height here **and** as the headings'
   * `scroll-padding-top` on `html` (technique C43): a link then lands the heading on the line. If they differ, a heading you
   * jump to lands below the line, and the one above it stays current.
   */
  offset?: number | undefined
  /**
   * The id of a visible heading that names the landmark. It becomes `aria-labelledby` and
   * replaces the message as the name, never both. An empty or whitespace-only id counts as none.
   */
  labelledBy?: string | undefined
  /** Per-instance message overrides: `{ label: 'Innehåll' }`. */
  messages?: Partial<KvirnMessages['tableOfContents']> | undefined
}

/** Spread on the `<nav>`. */
export interface TableOfContentsRootPartProps {
  /**
   * The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-table-of-contents`. Add your
   * own class next to it with `mergeProps`: class names join.
   */
  className: 'kv-table-of-contents'
  /** The message `tableOfContents.label`. Absent when `labelledBy` names the landmark instead. */
  'aria-label'?: string
  /** From `labelledBy`. */
  'aria-labelledby'?: string
}

/** Spread on the `<ul>`, at the top level and for every nested list. The role keeps the list announced where `list-style: none` removes it. */
export interface TableOfContentsListPartProps {
  className: 'kv-table-of-contents-list'
  role: 'list'
}

/** Spread on the `<li>`. Only the part's class. */
export interface TableOfContentsItemPartProps {
  className: 'kv-table-of-contents-item'
}

/** Spread on an `<a>`. `getLinkProps(item)` gives it for one entry. */
export interface TableOfContentsLinkPartProps {
  /** The part's class: the `kv-link` of every link. The theme makes it a contents item inside `kv-table-of-contents-item`. */
  className: 'kv-link'
  /** `#id`: a plain hash link, so it works before the script has run and in a server-rendered page. */
  href: string
  /** `location` on the link of the heading being read, and on no other. */
  'aria-current'?: 'location'
  /** Present on the same link, for your own styles. */
  'data-current'?: ''
}

export interface UseTableOfContentsResult {
  rootProps: TableOfContentsRootPartProps
  listProps: TableOfContentsListPartProps
  itemProps: TableOfContentsItemPartProps
  /** The entries nested by their levels. Draw one `<ul>` per list of nodes and one `<li>` per node. */
  tree: TableOfContentsNode[]
  /**
   * The id of the heading being read: the last one above the line, or the first one visible
   * before that. `undefined` while none is visible, on the server and during hydration, and where there is no
   * `IntersectionObserver`.
   */
  activeId: string | undefined
  /** The props of one entry's link, with `aria-current="location"` when it is the current one. */
  getLinkProps: (item: TableOfContentsEntry) => TableOfContentsLinkPartProps
}

// Internal. The same objects every time, frozen, so nothing a consumer does can change another
// list. The parts use them too, also outside a root.
export const tableOfContentsListProps: TableOfContentsListPartProps = Object.freeze({
  className: 'kv-table-of-contents-list',
  role: 'list',
})
export const tableOfContentsItemProps: TableOfContentsItemPartProps = Object.freeze({
  className: 'kv-table-of-contents-item',
})

/** Never part of a valid id, so the ids joined with it can be split again. */
const idSeparator = '\n'

/** Internal. The props of an entry's link, with or without the current mark. */
export function getTableOfContentsLinkProps(
  item: TableOfContentsEntry,
  activeId: string | undefined,
): TableOfContentsLinkPartProps {
  return {
    className: 'kv-link',
    href: `#${item.id}`,
    ...(item.id === activeId
      ? { 'aria-current': 'location' as const, 'data-current': '' as const }
      : {}),
  }
}

/**
 * A table of contents for a long page: the nested list of its headings, and which one the reader
 * is in (contract: table-of-contents.a11y.md). Spread the props on your own `<nav>`, `<ul>`,
 * `<li>` and `<a>`.
 *
 * - **A plain hash link:** `getLinkProps(item)` gives `href="#id"`, so the browser scrolls (with the
 *   page's own `scroll-padding-top` and its reduced-motion setting) and sets its focus starting point.
 *   Nothing moves focus, nothing is announced, and nothing scrolls by itself.
 * - **The current heading** is the last one above the line (the top 20% of the viewport below `offset`), or the first one visible before that. It is only
 *   found in the browser: on the server, during hydration and where there is no
 *   `IntersectionObserver`, the list renders and nothing is current.
 * - **A heading that is missing** from the page warns in development and is skipped. One that is
 *   `display: none` is skipped too.
 *
 * @example
 * const contents = useTableOfContents({ items, offset: 64, labelledBy: 'contents-title' })
 * <nav {...contents.rootProps}>
 *   <ul {...contents.listProps}>
 *     {contents.tree.map((node) => (
 *       <li key={node.item.id} {...contents.itemProps}>
 *         <a {...contents.getLinkProps(node.item)}>{node.item.label}</a>
 *       </li>
 *     ))}
 *   </ul>
 * </nav>
 */
export function useTableOfContents({
  items,
  offset = 0,
  labelledBy,
  messages,
}: UseTableOfContentsOptions): UseTableOfContentsResult {
  const env = useEnv()
  const tableOfContentsMessages = useMessages('tableOfContents', messages)
  const [activeId, setActiveId] = useState<string | undefined>(undefined)
  const tree = useMemo(() => getTableOfContentsTree(items), [items])
  // The effect is keyed by the ids, never by the array: a new array of the same ids is no change.
  const idsKey = items.map((item) => item.id).join(idSeparator)

  useEffect(() => {
    if (env === undefined) {
      return undefined
    }
    const { window: hostWindow, document: hostDocument } = env
    if (!('IntersectionObserver' in hostWindow)) {
      return undefined
    }
    const ids = idsKey === '' ? [] : idsKey.split(idSeparator)
    const line = Number.isFinite(offset) ? offset : 0
    const scrollingElement = hostDocument.scrollingElement ?? hostDocument.documentElement

    // Where every heading that is rendered is now. The headings are found by id each time, so a
    // heading that the page mounted again, or added after the list, is followed too.
    const recompute = () => {
      const positions: HeadingPosition[] = []
      for (const id of ids) {
        const heading = hostDocument.getElementById(id)
        // A heading that isn't rendered (display: none) reads 0, which would look like it is
        // above the line.
        if (heading !== null && heading.getClientRects().length > 0) {
          positions.push({ id, top: heading.getBoundingClientRect().top })
        }
      }
      // A page that fits has no end to scroll to. At the end of one that scrolls, the last
      // heading is current: a last section shorter than the viewport can't reach the line.
      const canScroll = scrollingElement.scrollHeight - scrollingElement.clientHeight > 1
      const isAtEnd =
        canScroll &&
        scrollingElement.scrollTop + scrollingElement.clientHeight >=
          scrollingElement.scrollHeight - 1
      setActiveId(
        getActiveHeading({
          headings: positions,
          offset: line,
          isAtEnd,
          viewportHeight: hostDocument.documentElement.clientHeight,
        }),
      )
    }

    // One frame at most between a wake-up and the measuring, however often they come.
    let frame: number | undefined
    const wake = () => {
      if (frame === undefined) {
        frame = hostWindow.requestAnimationFrame(() => {
          frame = undefined
          recompute()
        })
      }
    }

    // A heading crossing the line wakes the measuring. The scroll listener wakes it too, because
    // an IntersectionObserver is not told about the last pixels of a scroll, where the last
    // section ends.
    const observer = new hostWindow.IntersectionObserver(wake, {
      rootMargin: `${-line}px 0px 0px 0px`,
      threshold: [0, 1],
    })
    for (const id of ids) {
      const heading = hostDocument.getElementById(id)
      if (heading === null) {
        warnOnce(
          `table-of-contents-missing-heading:${id}`,
          `A <TableOfContents.Root> lists "#${id}", but no element on the page has that id, so its link goes nowhere and the section can't be reached from the list (WCAG 2.4.1). Give the heading that id (it must be unique on the page), or remove the entry.`,
        )
      } else {
        observer.observe(heading)
      }
    }
    hostWindow.addEventListener('scroll', wake, { passive: true })
    hostWindow.addEventListener('resize', wake, { passive: true })
    // The page may already be scrolled: an initial #hash has been followed by the browser.
    recompute()

    return () => {
      observer.disconnect()
      hostWindow.removeEventListener('scroll', wake)
      hostWindow.removeEventListener('resize', wake)
      if (frame !== undefined) {
        hostWindow.cancelAnimationFrame(frame)
      }
    }
  }, [env, idsKey, offset])

  const name = tableOfContentsMessages.label
  const labelledById = labelledBy !== undefined && labelledBy.trim() !== '' ? labelledBy : undefined
  const rootProps = useMemo<TableOfContentsRootPartProps>(
    () => ({
      className: 'kv-table-of-contents',
      ...(labelledById === undefined
        ? { 'aria-label': name }
        : { 'aria-labelledby': labelledById }),
    }),
    [labelledById, name],
  )
  const getLinkProps = useCallback(
    (item: TableOfContentsEntry) => getTableOfContentsLinkProps(item, activeId),
    [activeId],
  )

  return useMemo(
    () => ({
      rootProps,
      listProps: tableOfContentsListProps,
      itemProps: tableOfContentsItemProps,
      tree,
      activeId,
      getLinkProps,
    }),
    [rootProps, tree, activeId, getLinkProps],
  )
}
