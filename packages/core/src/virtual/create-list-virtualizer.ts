import {
  Virtualizer,
  defaultRangeExtractor,
  elementScroll,
  measureElement as measureElementSize,
  observeElementOffset,
  observeElementRect,
} from '@tanstack/virtual-core'
import type { Range, VirtualItem, VirtualizerOptions } from '@tanstack/virtual-core'

// The only place that imports @tanstack/virtual-core. It wraps the library's
// `Virtualizer` for a vertical list of options or rows, and owns the accessibility rules of a
// virtualized list: what the user is on is always rendered, and the size of the
// list is always known. Nothing here reads `window` or `document`: the scroll element is handed in.

/** Items rendered beyond the visible ones, on each side. */
export const defaultListOverscan = 5

/** How many items fit the window before the scroll element has been measured. */
const initialItemCount = 10

export interface ListVirtualizerOptions {
  /** The number of items in the whole list. */
  count: number
  /** The element that scrolls: the `role="listbox"` of a list, the scroll region of a table. */
  getScrollElement: () => HTMLElement | null
  /** The block size of an item that hasn't been measured. A measured item (`measureElement`) uses its real size. */
  estimateSize: (index: number) => number
  /**
   * The indexes that are always rendered, even when they are out of view: the active, the
   * selected and the focused item. `aria-activedescendant` and focus can only point at an
   * element that is in the DOM. Read on every `getVirtualItems()`, so it may change at any time.
   */
  getRequiredIndexes: () => readonly number[]
  /** A stable key per item, so a measured size follows the item when the list is filtered. Default: the index. */
  getItemKey?: ((index: number) => string | number) | undefined
  /** Items rendered beyond the visible ones, on each side. Default 5. */
  overscan?: number | undefined
  /** Space at the start of the scroll element that covers items, such as a sticky table header. Scrolling to an item keeps it clear of that. */
  scrollPaddingStart?: number | undefined
  /**
   * How far the first item is from the start of the scroll element: content above the list that
   * scrolls with it, such as a table's caption and head. The window and scrolling account for it,
   * so the right items are rendered at every scroll position. The offsets of the items and the
   * segments stay relative to the list, and `getTotalSize()` is the list's alone. Default 0.
   */
  scrollMargin?: number | undefined
  /**
   * The block size of the scroll element, used until the real one has been measured (before
   * `mount`, during server rendering). Default: ten items of `estimateSize(0)`.
   */
  initialSize?: number | undefined
  /** Called when the items to render or their positions changed, after a scroll or a measurement. */
  onChange: () => void
}

/** One rendered item and where it goes. */
export interface VirtualListItem {
  index: number
  key: string | number
  /** The offset of its start from the start of the list. */
  start: number
  end: number
  size: number
}

/** The rendered items and the empty space between them, in order. */
export type VirtualSegment = { type: 'item'; item: VirtualListItem } | { type: 'gap'; size: number }

export interface ListVirtualizer {
  /** The items to render, in order: the window and the required indexes. */
  getVirtualItems(): readonly VirtualListItem[]
  /** The items and the gaps between them, in order. Their sizes add up to `getTotalSize()`. */
  getSegments(): readonly VirtualSegment[]
  /** The block size of the whole list. */
  getTotalSize(): number
  isRendered(index: number): boolean
  /** Scrolls the item into view (`'auto'`, the default, only scrolls when it is out of view). */
  scrollToIndex(index: number, options?: { align?: 'auto' | 'start' | 'center' | 'end' }): void
  /** Hand it every rendered item's element, as a `ref`: it reads `data-index` and watches the size. */
  measureElement: (element: Element | null) => void
  setOptions(options: Partial<ListVirtualizerOptions>): void
  /** Starts watching the scroll element. Returns how to stop. Call it once the scroll element is in the document. */
  mount(): () => void
}

/** The required indexes that are in the list, once each, in order. */
function normalizeRequired(indexes: readonly number[], count: number): readonly number[] {
  const valid = new Set<number>()
  for (const index of indexes) {
    if (Number.isInteger(index) && index >= 0 && index < count) {
      valid.add(index)
    }
  }
  return [...valid].sort((first, second) => first - second)
}

/** The library's range with the required indexes added, in order and once each. */
function createRangeExtractor(required: readonly number[]): (range: Range) => number[] {
  return (range) => {
    const indexes = defaultRangeExtractor(range)
    if (required.length === 0) {
      return indexes
    }
    const merged = new Set(indexes)
    for (const index of required) {
      merged.add(index)
    }
    return [...merged].sort((first, second) => first - second)
  }
}

/** The library's item in our terms: offsets from the start of the list, without the scroll margin. */
function toListItem(item: VirtualItem, scrollMargin: number): VirtualListItem {
  return {
    index: item.index,
    key: typeof item.key === 'bigint' ? String(item.key) : item.key,
    start: item.start - scrollMargin,
    end: item.end - scrollMargin,
    size: item.size,
  }
}

/**
 * A virtualizer for a vertical list: it says which items to render for what is scrolled into
 * view, and keeps the active, selected and focused items rendered wherever they are.
 *
 * - The scroll element is yours (`getScrollElement`), and `mount()` starts watching its size and
 *   scroll position. Until then, and without a DOM, the window is `initialSize` from the top.
 * - `getVirtualItems()` is the window with `getRequiredIndexes()` merged in, in order. Render
 *   those, each placed at its `start`, in a container as tall as `getTotalSize()`. A table renders
 *   `getSegments()` instead: its rows with a spacer row for each gap.
 * - `scrollToIndex` for a key move, before `aria-activedescendant` or focus points at the item.
 *
 * @example
 * const virtualizer = createListVirtualizer({
 *   count: items.length,
 *   getScrollElement: () => listElement,
 *   estimateSize: () => 44,
 *   getRequiredIndexes: () => [activeIndex],
 *   onChange: rerender,
 * })
 * const stop = virtualizer.mount()
 */
export function createListVirtualizer(initialOptions: ListVirtualizerOptions): ListVirtualizer {
  let options = initialOptions
  let required: readonly number[] = []
  let requiredSignature = ''
  let rangeExtractor = createRangeExtractor(required)

  /** What the library gets: our options in its terms, with the extractor that adds the required indexes. */
  const toLibraryOptions = (): VirtualizerOptions<HTMLElement, Element> => ({
    count: options.count,
    getScrollElement: options.getScrollElement,
    estimateSize: options.estimateSize,
    ...(options.getItemKey === undefined ? {} : { getItemKey: options.getItemKey }),
    overscan: options.overscan ?? defaultListOverscan,
    ...(options.scrollPaddingStart === undefined
      ? {}
      : { scrollPaddingStart: options.scrollPaddingStart }),
    scrollMargin: options.scrollMargin ?? 0,
    initialRect: {
      width: 0,
      height: options.initialSize ?? options.estimateSize(0) * initialItemCount,
    },
    rangeExtractor,
    scrollToFn: elementScroll,
    // A scroll element that isn't laid out yet (a popup that isn't shown) measures 0: keep the
    // size we had, so the first items still render and can make the element visible.
    observeElementRect: (instance, callback) =>
      observeElementRect(instance, (rect) => {
        if (rect.height > 0) {
          callback(rect)
        }
      }),
    observeElementOffset,
    // An item inside an element that isn't shown yet (a popup that opens in this commit) measures 0.
    // Keep the estimate until it has a real size, which the library measures again when it appears.
    measureElement: (element, entry, instance) => {
      const size = measureElementSize(element, entry, instance)
      return size > 0 ? size : options.estimateSize(instance.indexFromElement(element))
    },
    onChange: () => options.onChange(),
  })

  /**
   * Reads the required indexes, and gives the library a new extractor when they changed: it only
   * calls the extractor again when its own inputs (the extractor included) changed, and a new
   * active option doesn't move the window.
   */
  const syncRequired = (): boolean => {
    const next = normalizeRequired(options.getRequiredIndexes(), options.count)
    const signature = next.join(',')
    if (signature === requiredSignature) {
      return false
    }
    requiredSignature = signature
    required = next
    rangeExtractor = createRangeExtractor(required)
    return true
  }

  syncRequired()
  const virtualizer = new Virtualizer<HTMLElement, Element>(toLibraryOptions())

  let source: readonly VirtualItem[] | undefined
  let sourceMargin = 0
  let items: readonly VirtualListItem[] = []
  let renderedIndexes = new Set<number>()
  let segmentsOf: readonly VirtualListItem[] | undefined
  let segmentsTotal = -1
  let segments: readonly VirtualSegment[] = []

  const getVirtualItems = (): readonly VirtualListItem[] => {
    if (syncRequired()) {
      virtualizer.setOptions(toLibraryOptions())
    }
    const current = virtualizer.getVirtualItems()
    const margin = options.scrollMargin ?? 0
    if (current !== source || margin !== sourceMargin) {
      source = current
      sourceMargin = margin
      items = current.map((item) => toListItem(item, margin))
      renderedIndexes = new Set(items.map((item) => item.index))
    }
    return items
  }

  return {
    getVirtualItems,
    getSegments: () => {
      const currentItems = getVirtualItems()
      const total = virtualizer.getTotalSize()
      if (currentItems === segmentsOf && total === segmentsTotal) {
        return segments
      }
      const next: VirtualSegment[] = []
      let cursor = 0
      for (const item of currentItems) {
        if (item.start > cursor) {
          next.push({ type: 'gap', size: item.start - cursor })
        }
        next.push({ type: 'item', item })
        cursor = item.end
      }
      if (total > cursor) {
        next.push({ type: 'gap', size: total - cursor })
      }
      segmentsOf = currentItems
      segmentsTotal = total
      segments = next
      return segments
    },
    getTotalSize: () => virtualizer.getTotalSize(),
    isRendered: (index) => {
      getVirtualItems()
      return renderedIndexes.has(index)
    },
    scrollToIndex: (index, { align = 'auto' } = {}) => {
      // The library measures lazily: make sure the positions match the current count first.
      virtualizer.getTotalSize()
      virtualizer.scrollToIndex(index, { align })
    },
    measureElement: (element) => virtualizer.measureElement(element),
    setOptions: (changes) => {
      // An option that is left out, or `undefined`, keeps what it was.
      options = {
        count: changes.count ?? options.count,
        getScrollElement: changes.getScrollElement ?? options.getScrollElement,
        estimateSize: changes.estimateSize ?? options.estimateSize,
        getRequiredIndexes: changes.getRequiredIndexes ?? options.getRequiredIndexes,
        getItemKey: changes.getItemKey ?? options.getItemKey,
        overscan: changes.overscan ?? options.overscan,
        scrollPaddingStart: changes.scrollPaddingStart ?? options.scrollPaddingStart,
        scrollMargin: changes.scrollMargin ?? options.scrollMargin,
        initialSize: changes.initialSize ?? options.initialSize,
        onChange: changes.onChange ?? options.onChange,
      }
      syncRequired()
      virtualizer.setOptions(toLibraryOptions())
    },
    mount: () => {
      const unmount = virtualizer._didMount()
      virtualizer._willUpdate()
      return unmount
    },
  }
}
