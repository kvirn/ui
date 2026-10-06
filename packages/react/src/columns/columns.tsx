import type { HTMLAttributes, ReactElement, Ref } from 'react'
import { mergeProps } from '../merge-props/merge-props.ts'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { useColumns } from './use-columns.ts'
import type { UseColumnsOptions } from './use-columns.ts'

/** What `render` receives as its second argument. Columns has no state, so it's empty. */
export type ColumnsState = Record<string, never>

/** What a `render` function gets to spread: your attributes, the class and the ref. */
export interface ColumnsElementProps extends HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement> | undefined
}

export interface ColumnsProps extends HTMLAttributes<HTMLElement>, UseColumnsOptions {
  /** The rendered element, whichever it is. */
  ref?: Ref<HTMLElement> | undefined
  /** Change the element: `render={<ul />}` with `<li>` children, so the list and its count are announced. Its own semantics apply: Columns adds no role. */
  render?: RenderProp<ColumnsElementProps, ColumnsState> | undefined
}

const columnsState: ColumnsState = Object.freeze({})

/**
 * One `<div class="kv-columns">`: as many columns as fit, none narrower than `minColumnWidth`, one at 320px. DOM order is the visual order (contract: columns.a11y.md). Usable in a server component.
 *
 * @example
 * <Columns render={<ul />} minColumnWidth="md" gap="6">
 *   <li><Card.Root>…</Card.Root></li>
 * </Columns>
 */
export function Columns({
  render,
  minColumnWidth,
  gap,
  ...otherProps
}: ColumnsProps): ReactElement {
  // The class joins a prop's and a render element's own class names (mergeProps), so neither
  // can remove it and the theme keeps styling the layout.
  return renderPart({
    render,
    defaultElement: 'div',
    partProps: mergeProps(otherProps, useColumns({ minColumnWidth, gap }).columnsProps),
    state: columnsState,
  })
}
Columns.displayName = 'Columns'
