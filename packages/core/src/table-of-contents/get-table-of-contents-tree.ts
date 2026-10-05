/** One heading of a page, as a table of contents lists it. */
export interface TableOfContentsEntry {
  /** The heading's `id`. The link is `#id`, so it must be unique on the page. */
  id: string
  /** The link's text: the heading's own text. */
  label: string
  /**
   * The heading's level, `2` for an `<h2>`. Only the order of the levels matters: a deeper level
   * nests under the entry above it.
   */
  level: number
}

/** An entry and the entries nested under it. */
export interface TableOfContentsNode {
  item: TableOfContentsEntry
  children: TableOfContentsNode[]
}

/**
 * The nesting of a table of contents, from the headings' levels (Plan 0049). Pure: no DOM.
 *
 * - **The parent** of an entry is the nearest entry above it with a smaller level.
 * - **A skipped level nests one step:** an `h4` right under an `h2` is its child, so the indent
 *   never jumps two steps.
 * - **A first entry, or one shallower than every open entry, is a root.** The page doesn't have
 *   to start at its top level.
 * - The entries are kept as given, in document order. Empty gives `[]`.
 *
 * @example
 * getTableOfContentsTree([{ id: 'a', label: 'A', level: 2 }, { id: 'b', label: 'B', level: 3 }])
 * // [{ item: A, children: [{ item: B, children: [] }] }]
 */
export function getTableOfContentsTree(
  items: readonly TableOfContentsEntry[],
): TableOfContentsNode[] {
  const roots: TableOfContentsNode[] = []
  // The open entries from a root down to the latest entry, each deeper than the one before.
  const path: TableOfContentsNode[] = []
  for (const item of items) {
    const node: TableOfContentsNode = { item, children: [] }
    // Close every open entry that is as deep as this one, or deeper: it is not this one's parent.
    let parent = path.at(-1)
    while (parent !== undefined && parent.item.level >= item.level) {
      path.pop()
      parent = path.at(-1)
    }
    if (parent === undefined) {
      roots.push(node)
    } else {
      parent.children.push(node)
    }
    path.push(node)
  }
  return roots
}
