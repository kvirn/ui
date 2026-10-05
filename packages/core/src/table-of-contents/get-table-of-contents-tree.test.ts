import { describe, expect, test } from 'vite-plus/test'
import { getTableOfContentsTree } from './get-table-of-contents-tree.ts'
import type { TableOfContentsEntry, TableOfContentsNode } from './get-table-of-contents-tree.ts'

// Plan 0049: the nesting of a table of contents, from the headings' levels. Pure: no DOM.

const entry = (id: string, level: number): TableOfContentsEntry => ({
  id,
  label: id.toUpperCase(),
  level,
})

/** A tree as nested objects of ids, so a test reads as the shape it expects. */
function shape(nodes: readonly TableOfContentsNode[]): unknown[] {
  return nodes.map((node) =>
    node.children.length === 0 ? node.item.id : { [node.item.id]: shape(node.children) },
  )
}

const treeOf = (...entries: TableOfContentsEntry[]) => shape(getTableOfContentsTree(entries))

describe('getTableOfContentsTree', () => {
  test('no entries give an empty tree', () => {
    expect(getTableOfContentsTree([])).toEqual([])
  })

  test('entries of one level are siblings, in order', () => {
    expect(treeOf(entry('a', 2), entry('b', 2), entry('c', 2))).toEqual(['a', 'b', 'c'])
  })

  test('a deeper level nests under the entry above it', () => {
    expect(treeOf(entry('a', 2), entry('b', 3), entry('c', 2))).toEqual([{ a: ['b'] }, 'c'])
  })

  test('a level that returns goes back to the right parent', () => {
    expect(
      treeOf(entry('a', 2), entry('b', 3), entry('c', 4), entry('d', 3), entry('e', 2)),
    ).toEqual([{ a: [{ b: ['c'] }, 'd'] }, 'e'])
  })

  test('a skipped level nests one step: an h4 right under an h2 is its child', () => {
    expect(treeOf(entry('a', 2), entry('b', 4), entry('c', 2))).toEqual([{ a: ['b'] }, 'c'])
  })

  test('after a skipped level, a level in between is a child of the same parent', () => {
    expect(treeOf(entry('a', 2), entry('b', 4), entry('c', 3))).toEqual([{ a: ['b', 'c'] }])
  })

  test('a first entry that is deeper than the next one is a root', () => {
    expect(treeOf(entry('a', 3), entry('b', 2), entry('c', 3))).toEqual(['a', { b: ['c'] }])
  })

  test('descending levels are all roots', () => {
    expect(treeOf(entry('a', 4), entry('b', 3), entry('c', 2))).toEqual(['a', 'b', 'c'])
  })

  test('an entry shallower than every open one is a root', () => {
    expect(treeOf(entry('a', 3), entry('b', 4), entry('c', 3), entry('d', 2))).toEqual([
      { a: ['b'] },
      'c',
      'd',
    ])
  })

  test('the entries themselves are kept, in document order', () => {
    const first = entry('a', 2)
    const second = entry('b', 3)
    const third = entry('c', 2)
    const tree = getTableOfContentsTree([first, second, third])
    expect(tree[0]?.item).toBe(first)
    expect(tree[0]?.children[0]?.item).toBe(second)
    expect(tree[1]?.item).toBe(third)
    expect(tree[1]?.children).toEqual([])
  })

  test('the list it is given is not changed', () => {
    const entries = Object.freeze([entry('a', 2), entry('b', 3)])
    expect(() => getTableOfContentsTree(entries)).not.toThrow()
    expect(entries).toHaveLength(2)
  })
})
