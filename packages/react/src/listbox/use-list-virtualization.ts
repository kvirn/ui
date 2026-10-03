import { createListVirtualizer, defaultListOverscan } from '@kvirn-ui/core'
import type { ListboxEntry, VirtualListItem } from '@kvirn-ui/core'
import { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef } from 'react'
import type { CSSProperties, RefObject } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'

// Internal. The virtualization that Listbox, Combobox and Autocomplete share (contracts: the "Virtualization" sections of listbox.a11y.md,
// combobox.a11y.md and autocomplete.a11y.md). `useListbox` and `useComboboxMachine` call it
// with what their machine says, and the popup parts (`Listbox.List`, `Listbox.Option`) render what
// it returns.

/**
 * `virtualize` for a flat list: render only the options that are scrolled into view, plus the
 * active and the chosen option, and keep the size of the list known to assistive technology
 * (`aria-setsize`, `aria-posinset`). `true` uses the defaults. Off by default: unrendered options
 * can't be found with find in page, aren't printed and are out of reach of a screen reader's
 * browse mode, so filter first (a Combobox) and virtualize only a list that stays long.
 */
export type ListboxVirtualizeOption =
  | boolean
  | {
      /** The block size, in pixels, of an option that hasn't been measured. Default 44. */
      estimateSize?: number | undefined
      /** Options rendered beyond the visible ones, on each side. Default 5. */
      overscan?: number | undefined
    }

/** The estimate of an option's height before it is measured: the default theme's control height. */
export const defaultOptionEstimateSize = 44

/**
 * Spread on the one element inside the list that has the size of all the options, so the list
 * scrolls as far as the whole list. The geometry is inline on purpose: a
 * virtualized list lays out without a theme.
 */
export interface ListboxVirtualSizerPartProps {
  className: 'kv-listbox-virtual-sizer'
  style: CSSProperties
}

/** What a rendered option gets besides `ListboxOptionPartProps` while the list is virtualized. */
export interface ListboxVirtualOptionPartProps {
  /** For the virtualizer to find the option's place when it measures it. */
  'data-index': number
  /** The number of options in the whole list, not only the rendered ones. */
  'aria-setsize': number
  /** The option's place in the whole list, starting at 1. */
  'aria-posinset': number
  /** Where the option goes: absolutely positioned in the sizer, with inline geometry only. */
  style: CSSProperties
}

export interface ListboxVirtualization {
  /** The options to render, in order: the visible ones, a few more, and the active and chosen option. */
  items: readonly VirtualListItem[]
  sizerProps: ListboxVirtualSizerPartProps
  /** `undefined` for an option that isn't rendered now. */
  getOptionProps(entry: { index: number }): ListboxVirtualOptionPartProps | undefined
  /** The `ref` of every rendered option: it measures the option, so options that wrap get their real height. */
  measureElement: (element: Element | null) => void
}

/** What the hooks' machines can say about the options the user is on. */
export interface VirtualizationMachine {
  getRequiredRenderKeys(): string[]
  getEntry(key: string): { index: number } | undefined
}

/** The indexes that must always be rendered: the active option, then the chosen ones. */
export function getRequiredIndexes(machine: VirtualizationMachine): readonly number[] {
  return machine.getRequiredRenderKeys().flatMap((key) => {
    const entry = machine.getEntry(key)
    return entry === undefined ? [] : [entry.index]
  })
}

/** The index of the first chosen option that is in the list, or `undefined`. */
export function getFirstSelectedIndex(
  machine: Pick<VirtualizationMachine, 'getEntry'>,
  selectedKeys: readonly string[],
): number | undefined {
  for (const key of selectedKeys) {
    const entry = machine.getEntry(key)
    if (entry !== undefined) {
      return entry.index
    }
  }
  return undefined
}

export interface UseListVirtualizationOptions {
  virtualize: ListboxVirtualizeOption | undefined
  /** The list has groups: they aren't virtualized, so everything renders. */
  hasGroups: boolean
  /** The popup is open and renders options, so there is something to virtualize. */
  isOpen: boolean
  /** Every option, in order. Their keys keep a measured height with its option when the list is filtered. */
  entries: readonly ListboxEntry<unknown>[]
  getRequiredIndexes: () => readonly number[]
  /** The active option's index, once the user has moved. */
  activeIndex: number | undefined
  /** The first chosen option's index: the popup opens scrolled to it when no option is active. */
  initialScrollIndex: number | undefined
  /** `false` while the pointer moved the active option: it is already under the pointer. */
  shouldScrollToActive: () => boolean
  /** The `role="listbox"` element: it is the scroll element. */
  listRef: RefObject<HTMLElement | null>
}

/**
 * Virtualizes the options of an open, flat list. Returns `undefined` when `virtualize` is off,
 * the popup is closed or the list has groups (then every option renders, with a development
 * warning for the groups).
 *
 * The virtualizer lives while the popup is open, so every opening starts at the top (or at the
 * chosen option). Key moves call `scrollToIndex`, and the active option is always rendered, so
 * `aria-activedescendant` points at an element that is in the DOM in the same commit.
 */
export function useListVirtualization(
  options: UseListVirtualizationOptions,
): ListboxVirtualization | undefined {
  const {
    virtualize,
    hasGroups,
    isOpen,
    entries,
    activeIndex,
    initialScrollIndex,
    shouldScrollToActive,
    listRef,
  } = options
  const isWanted = virtualize !== undefined && virtualize !== false
  const isActive = isWanted && !hasGroups && isOpen
  const settings: { estimateSize?: number | undefined; overscan?: number | undefined } =
    typeof virtualize === 'object' ? virtualize : {}
  const estimateSize =
    settings.estimateSize !== undefined && settings.estimateSize > 0
      ? settings.estimateSize
      : defaultOptionEstimateSize
  const overscan =
    settings.overscan !== undefined && settings.overscan >= 0
      ? Math.floor(settings.overscan)
      : defaultListOverscan
  const [, rerender] = useReducer((count: number) => count + 1, 0)

  useEffect(() => {
    if (isWanted && hasGroups) {
      warnOnce(
        'listbox-virtualize-groups',
        'virtualize does not work with groups: a partly rendered group would give a screen reader the wrong group, so the list renders in full. Remove groups, or remove virtualize and filter the list instead.',
      )
    }
  }, [isWanted, hasGroups])

  // One virtualizer for each time the popup opens. What changes while it is open goes in through
  // `setOptions` on every render, as the library's own adapters do.
  const getScrollElement = useCallback(() => listRef.current, [listRef])
  const virtualizer = useMemo(
    () =>
      isActive
        ? createListVirtualizer({
            count: 0,
            getScrollElement,
            estimateSize: () => defaultOptionEstimateSize,
            getRequiredIndexes: () => [],
            onChange: rerender,
          })
        : undefined,
    [isActive, getScrollElement],
  )
  const getItemKey = useMemo(() => (index: number) => entries[index]?.key ?? index, [entries])
  const optionSize = useMemo(() => () => estimateSize, [estimateSize])
  virtualizer?.setOptions({
    count: entries.length,
    estimateSize: optionSize,
    getItemKey,
    getRequiredIndexes: options.getRequiredIndexes,
    overscan,
    initialSize: estimateSize * 10,
  })

  // The scroll element is in the document by now, and the popup is shown: it can be measured.
  useLayoutEffect(() => virtualizer?.mount(), [virtualizer])

  const latest = useRef({ shouldScrollToActive, activeIndex, initialScrollIndex })
  useLayoutEffect(() => {
    latest.current = { shouldScrollToActive, activeIndex, initialScrollIndex }
  })

  // A key moved the active option: scroll to it. It is rendered already, so it is in the DOM
  // when `aria-activedescendant` points at it. A pointer moved it: it is under the pointer.
  useLayoutEffect(() => {
    if (virtualizer !== undefined && activeIndex !== undefined) {
      if (latest.current.shouldScrollToActive()) {
        virtualizer.scrollToIndex(activeIndex, { align: 'auto' })
      }
    }
  }, [virtualizer, activeIndex])

  // The popup opened with no option active: show the chosen one, as the plain list does.
  useLayoutEffect(() => {
    if (virtualizer === undefined) {
      return
    }
    const { activeIndex: active, initialScrollIndex: chosen } = latest.current
    if (active === undefined && chosen !== undefined) {
      virtualizer.scrollToIndex(chosen, { align: 'auto' })
    }
  }, [virtualizer])

  if (virtualizer === undefined) {
    return undefined
  }
  const items = virtualizer.getVirtualItems()
  const itemByIndex = new Map(items.map((item) => [item.index, item]))
  const size = entries.length
  return {
    items,
    sizerProps: {
      className: 'kv-listbox-virtual-sizer',
      style: { position: 'relative', blockSize: virtualizer.getTotalSize() },
    },
    getOptionProps: (entry) => {
      const item = itemByIndex.get(entry.index)
      if (item === undefined) {
        return undefined
      }
      return {
        'data-index': entry.index,
        'aria-setsize': size,
        'aria-posinset': entry.index + 1,
        style: {
          position: 'absolute',
          insetInline: 0,
          insetBlockStart: 0,
          transform: `translateY(${item.start}px)`,
        },
      }
    },
    measureElement: virtualizer.measureElement,
  }
}
