import type { ReactElement } from 'react'
import { mergeProps } from '../merge-props/merge-props.ts'
import { listRole, resolveAsTag } from '../render/as-prop.ts'
import type { AsTag } from '../render/as-prop.ts'
import { renderPart } from '../render/render-part.ts'
import { useColumns } from './use-columns.ts'
import type { UseColumnsOptions } from './use-columns.ts'

const columnsTags = ['div', 'ul', 'ol'] as const

/**
 * `as` is `div` (default), or `ul` or `ol` with `<li>` children, so the list and its count are
 * announced. Its own semantics apply, and Columns adds `role="list"` to a `ul` or `ol`.
 */
export type ColumnsProps = AsTag<(typeof columnsTags)[number], 'div', UseColumnsOptions>

/**
 * One `<div class="kv-columns">`: as many columns as fit, none narrower than `minColumnWidth`, one at 320px. DOM order is the visual order (contract: columns.a11y.md). Usable in a server component.
 *
 * @example
 * <Columns as="ul" minColumnWidth="md" gap="6">
 *   <li><Card.Root>…</Card.Root></li>
 * </Columns>
 */
export function Columns({ as, minColumnWidth, gap, ...otherProps }: ColumnsProps): ReactElement {
  // The class joins a prop's own class names (mergeProps), so a prop can't remove it and the
  // theme keeps styling the layout.
  const tag = resolveAsTag({ part: 'Columns', as, allowedTags: columnsTags })
  const columnsProps = useColumns({ minColumnWidth, gap }).columnsProps
  return renderPart({
    as: tag,
    defaultElement: 'div',
    // A prop's own `role` wins. WebKit and VoiceOver drop the list role under `list-style: none`.
    partProps: { ...listRole(tag), ...mergeProps(otherProps, columnsProps) },
  })
}
Columns.displayName = 'Columns'
