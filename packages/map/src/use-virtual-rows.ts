import { createListVirtualizer } from '@kvirn-ui/core'
import { useLayoutEffect, useMemo, useReducer, useRef } from 'react'
import type { CSSProperties, KeyboardEvent } from 'react'
import { hasModifier } from './has-modifier.ts'

// A list this short renders in full: nothing is lost to find in page, print or browse mode.
export const VIRTUALIZE_FROM = 50

export interface VirtualRow {
  index: number
  key: string
  /** The distance from the start of the list, for a virtual row. */
  start: number
}

export interface UseVirtualRowsOptions {
  count: number
  /** The block size, in pixels, of a row that hasn't been measured. */
  estimateSize: number
  getKey: (index: number) => string
  /** The rows that stay rendered wherever they are scrolled: the one with focus. */
  getRequiredIndexes: () => readonly number[]
  /** The element that scrolls and holds the list. */
  scrollElement: HTMLElement | null
  /** The row to scroll to when the list mounts. */
  initialIndex?: number | undefined
  /** The row the user is on or came from, or -1: the one Tab stop while virtual. */
  activeIndex: number
  /** A key moved to a row: make it the active one. */
  onActiveChange: (index: number) => void
}

export interface VirtualRows {
  isVirtual: boolean
  /** The rows to render, in order, by index: the window and the required ones. */
  rows: readonly VirtualRow[]
  /** Spread on the scroll element: the arrows, Home, End, PageUp and PageDown between the rows while virtual. */
  onKeyDown: ((event: KeyboardEvent<HTMLElement>) => void) | undefined
  /** Spread on the list element inside the scroll element: it has the size of all the rows. */
  listStyle: CSSProperties | undefined
  /** Spread on a rendered row's element. */
  getRowProps: (row: VirtualRow) => {
    'data-index'?: number
    'aria-setsize'?: number
    'aria-posinset'?: number
    style?: CSSProperties | undefined
    ref?: (element: Element | null) => void
  }
}

/**
 * Renders only the rows scrolled into view of a long list, by index, with `aria-setsize` and
 * `aria-posinset` so assistive technology still knows the whole size. The list is as tall as all
 * the rows and each rendered row is placed in it.
 */
export function useVirtualRows({
  count,
  estimateSize,
  getKey,
  getRequiredIndexes,
  scrollElement,
  initialIndex,
  activeIndex,
  onActiveChange,
}: UseVirtualRowsOptions): VirtualRows {
  const isVirtual = count > VIRTUALIZE_FROM
  const [, rerender] = useReducer((renders: number) => renders + 1, 0)
  const virtualizer = useMemo(
    () =>
      isVirtual
        ? createListVirtualizer({
            count: 0,
            getScrollElement: () => null,
            estimateSize: () => 0,
            getRequiredIndexes: () => [],
            onChange: rerender,
          })
        : undefined,
    [isVirtual],
  )
  const estimate = useMemo(() => () => estimateSize, [estimateSize])
  virtualizer?.setOptions({
    getScrollElement: () => scrollElement,
    count,
    estimateSize: estimate,
    getItemKey: getKey,
    getRequiredIndexes,
    initialSize: estimateSize * 10,
  })
  useLayoutEffect(() => virtualizer?.mount(), [virtualizer, scrollElement])
  const initialIndexRef = useRef(initialIndex)
  useLayoutEffect(() => {
    if (virtualizer && initialIndexRef.current !== undefined) {
      virtualizer.scrollToIndex(initialIndexRef.current, { align: 'center' })
    }
  }, [virtualizer])

  // A virtual list is one Tab stop, the active row (else the first rendered one): Tab can't reach
  // rows that aren't rendered, so the arrow keys do. Set on the DOM because a row's buttons may be the consumer's.
  const firstRenderedIndex = virtualizer?.getVirtualItems()[0]?.index
  const tabStopIndex = activeIndex >= 0 ? activeIndex : firstRenderedIndex
  const pendingFocusIndex = useRef<number | null>(null)
  useLayoutEffect(() => {
    if (!virtualizer || !scrollElement) {
      return
    }
    for (const row of scrollElement.querySelectorAll<HTMLElement>('[data-index]')) {
      const isStop = Number(row.dataset['index']) === tabStopIndex
      for (const button of row.querySelectorAll('button')) {
        button.tabIndex = isStop ? 0 : -1
      }
    }
    const target = pendingFocusIndex.current
    if (target !== null) {
      const button = scrollElement.querySelector<HTMLElement>(`[data-index="${target}"] button`)
      if (button) {
        pendingFocusIndex.current = null
        button.focus()
      }
    }
  })

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const target = event.target as HTMLElement
    const row = target.closest<HTMLElement>('[data-index]')
    if (!virtualizer || !row || hasModifier(event) || target.matches('input, textarea, select')) {
      return
    }
    const current = Number(row.dataset['index'])
    const pageSize = Math.max(1, Math.floor(event.currentTarget.clientHeight / estimateSize))
    const moves: Record<string, number> = {
      ArrowDown: current + 1,
      ArrowUp: current - 1,
      Home: 0,
      End: count - 1,
      PageDown: current + pageSize,
      PageUp: current - pageSize,
    }
    const wanted = moves[event.key]
    if (wanted === undefined) {
      return
    }
    event.preventDefault()
    const next = Math.min(count - 1, Math.max(0, wanted))
    pendingFocusIndex.current = next
    virtualizer.scrollToIndex(next)
    onActiveChange(next)
  }

  if (!virtualizer) {
    return {
      isVirtual: false,
      rows: Array.from({ length: count }, (_, index) => ({
        index,
        key: getKey(index),
        start: 0,
      })),
      onKeyDown: undefined,
      listStyle: undefined,
      getRowProps: () => ({}),
    }
  }
  const rows = virtualizer
    .getVirtualItems()
    .map((item) => ({ index: item.index, key: getKey(item.index), start: item.start }))
  return {
    isVirtual: true,
    rows,
    onKeyDown: handleKeyDown,
    listStyle: { position: 'relative', blockSize: virtualizer.getTotalSize() },
    getRowProps: (row) => ({
      'data-index': row.index,
      'aria-setsize': count,
      'aria-posinset': row.index + 1,
      style: {
        position: 'absolute',
        insetInline: 0,
        insetBlockStart: 0,
        transform: `translateY(${row.start}px)`,
      },
      ref: virtualizer.measureElement,
    }),
  }
}
