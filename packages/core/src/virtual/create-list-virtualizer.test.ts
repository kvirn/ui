import { describe, expect, it } from 'vite-plus/test'
import { createListVirtualizer } from './create-list-virtualizer.ts'
import type { ListVirtualizerOptions } from './create-list-virtualizer.ts'

// Contract: listbox.a11y.md, combobox.a11y.md and autocomplete.a11y.md › Virtualization. The
// machine runs without a DOM: nothing is mounted, so the window is the `initialSize` from the top.

const itemSize = 40

function create(overrides: Partial<ListVirtualizerOptions> = {}) {
  return createListVirtualizer({
    count: 1000,
    getScrollElement: () => null,
    estimateSize: () => itemSize,
    getRequiredIndexes: () => [],
    initialSize: 400,
    overscan: 2,
    onChange: () => {},
    ...overrides,
  })
}

const indexesOf = (virtualizer: ReturnType<typeof create>) =>
  virtualizer.getVirtualItems().map((item) => item.index)

describe('createListVirtualizer: the window', () => {
  it('renders the items from the top that fit the size, plus the overscan', () => {
    const virtualizer = create()
    const indexes = indexesOf(virtualizer)
    expect(indexes[0]).toBe(0)
    expect(indexes.length).toBeGreaterThanOrEqual(10)
    expect(indexes.length).toBeLessThan(20)
    expect(indexes).toEqual(Array.from({ length: indexes.length }, (_, index) => index))
    expect(virtualizer.isRendered(0)).toBe(true)
    expect(virtualizer.isRendered(500)).toBe(false)
  })

  it('gives every item its position and size', () => {
    const [first, second] = create().getVirtualItems()
    expect(first).toMatchObject({ index: 0, start: 0, end: itemSize, size: itemSize })
    expect(second).toMatchObject({ index: 1, start: itemSize, end: itemSize * 2, size: itemSize })
  })

  it('keys an item with getItemKey, and by its index without one', () => {
    expect(create().getVirtualItems()[3]?.key).toBe(3)
    const keyed = create({ getItemKey: (index) => `ort-${index}` })
    expect(keyed.getVirtualItems()[3]?.key).toBe('ort-3')
  })

  it('has the full size of the list, however few items are rendered', () => {
    expect(create().getTotalSize()).toBe(1000 * itemSize)
  })

  it('renders nothing for an empty list', () => {
    const virtualizer = create({ count: 0 })
    expect(virtualizer.getVirtualItems()).toEqual([])
    expect(virtualizer.getSegments()).toEqual([])
    expect(virtualizer.getTotalSize()).toBe(0)
  })
})

describe('createListVirtualizer: required indexes', () => {
  it('renders required indexes far outside the window', () => {
    const virtualizer = create({ getRequiredIndexes: () => [999, 500] })
    const indexes = indexesOf(virtualizer)
    expect(indexes).toContain(500)
    expect(indexes).toContain(999)
    expect(indexes).toContain(0)
    expect(virtualizer.isRendered(500)).toBe(true)
    expect(virtualizer.isRendered(999)).toBe(true)
    expect(virtualizer.isRendered(501)).toBe(false)
    const far = virtualizer.getVirtualItems().find((item) => item.index === 500)
    expect(far).toMatchObject({ start: 500 * itemSize, size: itemSize })
  })

  it('lists the items in order, once each, whether a required index is inside the window or not', () => {
    const virtualizer = create({ getRequiredIndexes: () => [999, 2, 500, 2, 500] })
    const indexes = indexesOf(virtualizer)
    expect(indexes).toEqual([...new Set(indexes)].sort((first, second) => first - second))
    expect(indexes.filter((index) => index === 2)).toHaveLength(1)
  })

  it('follows the required indexes when they change without a setOptions', () => {
    let required: readonly number[] = [300]
    const virtualizer = create({ getRequiredIndexes: () => required })
    expect(indexesOf(virtualizer)).toContain(300)
    required = [700]
    const indexes = indexesOf(virtualizer)
    expect(indexes).toContain(700)
    expect(indexes).not.toContain(300)
  })

  it('follows the required indexes after a setOptions with a new reader', () => {
    const virtualizer = create({ getRequiredIndexes: () => [300] })
    expect(virtualizer.isRendered(300)).toBe(true)
    virtualizer.setOptions({ getRequiredIndexes: () => [800] })
    expect(virtualizer.isRendered(800)).toBe(true)
    expect(virtualizer.isRendered(300)).toBe(false)
  })

  it('ignores an index outside the list or one that is not a whole number', () => {
    const virtualizer = create({ count: 50, getRequiredIndexes: () => [-1, 1.5, 50, 4000, 49] })
    const indexes = indexesOf(virtualizer)
    expect(indexes).toContain(49)
    expect(indexes.every((index) => Number.isInteger(index) && index >= 0 && index < 50)).toBe(true)
  })
})

describe('createListVirtualizer: segments', () => {
  it('adds up to the total size: items and the gaps between them', () => {
    const virtualizer = create({ getRequiredIndexes: () => [500, 999] })
    const segments = virtualizer.getSegments()
    const sum = segments.reduce(
      (total, segment) => total + (segment.type === 'item' ? segment.item.size : segment.size),
      0,
    )
    expect(sum).toBe(virtualizer.getTotalSize())
  })

  it('puts a gap between the window and a required item, and after the last item', () => {
    const virtualizer = create({ getRequiredIndexes: () => [500] })
    const segments = virtualizer.getSegments()
    const types = segments.map((segment) => segment.type)
    const firstGap = segments.findIndex((segment) => segment.type === 'gap')
    expect(types[0]).toBe('item')
    expect(firstGap).toBeGreaterThan(0)
    const gap = segments[firstGap]
    const before = segments[firstGap - 1]
    const after = segments[firstGap + 1]
    expect(gap?.type === 'gap' ? gap.size : 0).toBe(
      (after?.type === 'item' ? after.item.start : 0) -
        (before?.type === 'item' ? before.item.end : 0),
    )
    expect(after?.type === 'item' ? after.item.index : -1).toBe(500)
    expect(types.at(-1)).toBe('gap')
  })

  it('has no gap between items that follow each other', () => {
    const virtualizer = create({ count: 10, initialSize: 10_000, getRequiredIndexes: () => [] })
    expect(virtualizer.getSegments().every((segment) => segment.type === 'item')).toBe(true)
  })

  it('is one gap when nothing is rendered but the list is not empty', () => {
    const virtualizer = create({ initialSize: 0 })
    expect(virtualizer.getVirtualItems()).toEqual([])
    expect(virtualizer.getSegments()).toEqual([{ type: 'gap', size: 1000 * itemSize }])
  })
})

describe('createListVirtualizer: setOptions', () => {
  it('follows a changed count: the total, the items and the required indexes', () => {
    const virtualizer = create({ getRequiredIndexes: () => [999] })
    expect(virtualizer.getTotalSize()).toBe(1000 * itemSize)
    expect(virtualizer.isRendered(999)).toBe(true)

    virtualizer.setOptions({ count: 5 })
    expect(virtualizer.getTotalSize()).toBe(5 * itemSize)
    expect(indexesOf(virtualizer)).toEqual([0, 1, 2, 3, 4])
    expect(virtualizer.isRendered(999)).toBe(false)

    virtualizer.setOptions({ count: 5000 })
    expect(virtualizer.getTotalSize()).toBe(5000 * itemSize)
    expect(virtualizer.isRendered(999)).toBe(true)
  })

  it('keeps the segments equal to the total size after a change', () => {
    const virtualizer = create({ getRequiredIndexes: () => [40] })
    virtualizer.setOptions({ count: 60 })
    const sum = virtualizer
      .getSegments()
      .reduce(
        (total, segment) => total + (segment.type === 'item' ? segment.item.size : segment.size),
        0,
      )
    expect(sum).toBe(60 * itemSize)
  })
})

describe('createListVirtualizer: mount', () => {
  it('mounts and unmounts without a scroll element', () => {
    const virtualizer = create()
    const unmount = virtualizer.mount()
    expect(indexesOf(virtualizer)[0]).toBe(0)
    expect(() => unmount()).not.toThrow()
  })
})
