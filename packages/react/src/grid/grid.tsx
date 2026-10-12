'use client'
import { createContext, useContext, useEffect } from 'react'
import type { ReactElement } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { listRole, resolveAsTag } from '../render/as-prop.ts'
import type { AsTag } from '../render/as-prop.ts'
import { renderPart } from '../render/render-part.ts'
import { useGrid } from './use-grid.ts'

const rootTags = ['div', 'ul', 'ol'] as const
const itemTags = ['div', 'li', 'article', 'section', 'nav', 'aside', 'main'] as const

/**
 * `as` is `div` (default), or `ul` or `ol` with `<li>` children, so the list and its count are
 * announced. Every prop, the ref and `className` go to the grid element, not to the container
 * around it.
 */
export type GridRootProps = AsTag<(typeof rootTags)[number], 'div'>

/**
 * `as` is `div` (default), `li` inside a `ul` or `ol` Root, `article`, `section` with a name, `nav`
 * with a name for navigation, `aside` with a name for related content, or `main` (one per page,
 * never the default). Its own semantics apply: a landmark needs a name.
 */
export type GridItemProps = AsTag<(typeof itemTags)[number], 'div'>

// Only a marker: the Item reads its class from the hook, not from the Root.
const GridRootContext = createContext(false)

/**
 * The grid: an internal `<div class="kv-grid-container">` (the query container, so `lg-cols-3`
 * answers the grid's own width) around the grid element `<div class="kv-grid">`. Every prop goes
 * to the grid element. Any direct child is a cell.
 */
export function GridRoot({ as, ...otherProps }: GridRootProps): ReactElement {
  const tag = resolveAsTag({ part: 'Grid.Root', as, allowedTags: rootTags })
  const grid = useGrid()
  return (
    <GridRootContext.Provider value={true}>
      <div className={grid.containerProps.className}>
        {renderPart({
          as: tag,
          defaultElement: 'div',
          // A prop's own `role` wins. WebKit and VoiceOver drop the list role under `list-style: none`.
          partProps: { ...listRole(tag), ...mergeProps(otherProps, grid.rootProps) },
        })}
      </div>
    </GridRootContext.Provider>
  )
}
GridRoot.displayName = 'Grid.Root'

/** A cell with its own placement classes (`kv-grid-item--md-span-2`). Optional: any child is a cell. */
export function GridItem({ as, ...otherProps }: GridItemProps): ReactElement {
  const isInsideRoot = useContext(GridRootContext)
  useEffect(() => {
    if (!isInsideRoot) {
      warnOnce(
        'grid-item-outside-root',
        'A Grid.Item is outside a Grid.Root, so the theme draws no grid. Put it inside Grid.Root.',
      )
    }
  }, [isInsideRoot])
  return renderPart({
    as: resolveAsTag({ part: 'Grid.Item', as, allowedTags: itemTags }),
    defaultElement: 'div',
    partProps: mergeProps(otherProps, useGrid().itemProps),
  })
}
GridItem.displayName = 'Grid.Item'

/**
 * Explicit column tracks (contract: grid.a11y.md), chosen with classes: `kv-grid--cols-12`,
 * `kv-grid--md-cols-2`, `kv-grid--fit-md`, `kv-grid--gap-4`, and `kv-grid-item--lg-span-8` on an
 * Item. DOM order is the visual, reading and focus order. No role, ARIA, text or behaviour, apart
 * from `role="list"` on a `ul` or `ol` Root.
 *
 * @example
 * <Grid.Root className="kv-grid--cols-1 kv-grid--lg-cols-12">
 *   <Grid.Item className="kv-grid-item--lg-span-8">…</Grid.Item>
 *   <Grid.Item className="kv-grid-item--lg-span-4">…</Grid.Item>
 * </Grid.Root>
 */
export const Grid = { Root: GridRoot, Item: GridItem } as const
