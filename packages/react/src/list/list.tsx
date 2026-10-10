import type { ComponentPropsWithRef, ReactElement } from 'react'
import { createElement } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { resolveAsTag } from '../render/as-prop.ts'
import type { AsTag } from '../render/as-prop.ts'
import { renderPart } from '../render/render-part.ts'

const listTags = ['ul', 'ol'] as const

export type ListMarker = 'none' | 'bullet' | 'decimal'
export type ListGap = '2' | '4' | '6' | '8'

export interface ListOwnProps {
  /** `'none'` (default), `'bullet'` or `'decimal'`. `'decimal'` is for `as="ol"`. */
  marker?: ListMarker | undefined
  /** The space between items, a `space` step in the theme. Default `'4'`. */
  gap?: ListGap | undefined
}

/** `as` is `ul` (default) or `ol`. Without a marker the list gets `role="list"`. */
export type ListRootProps = AsTag<(typeof listTags)[number], 'ul', ListOwnProps>

export type ListItemProps = ComponentPropsWithRef<'li'>

/**
 * The one native list (contract: list.a11y.md): `<ul class="kv-list">`, or `<ol>` with `as="ol"`.
 * Its children are `List.Item`. Usable in a server component.
 *
 * @example
 * <List.Root>
 *   <List.Item><Link.Root href="/bygglov">Bygglov</Link.Root></List.Item>
 *   <List.Item><Link.Root href="/avfall">Avfall</Link.Root></List.Item>
 * </List.Root>
 */
export function ListRoot({
  as,
  marker = 'none',
  gap = '4',
  ...otherProps
}: ListRootProps): ReactElement {
  const tag = resolveAsTag({ part: 'List.Root', as, allowedTags: listTags })
  if (marker === 'decimal' && tag !== 'ol') {
    warnOnce(
      'list-decimal-on-ul',
      'A List.Root with marker="decimal" renders a <ul>, so its numbers say nothing about order to assistive technology (WCAG 1.3.1). Use as="ol", or marker="bullet".',
    )
  }
  const className = [
    'kv-list',
    marker === 'none' ? undefined : `kv-list--${marker}`,
    gap === '4' ? undefined : `kv-list--gap-${gap}`,
  ]
    .filter((name) => name !== undefined)
    .join(' ')
  // A prop's own `role` wins. WebKit and VoiceOver drop the list role under `list-style: none`.
  return renderPart({
    as: tag,
    defaultElement: 'ul',
    partProps: {
      ...(marker === 'none' ? { role: 'list' } : {}),
      ...mergeProps(otherProps, { className }),
    },
  })
}
ListRoot.displayName = 'List.Root'

/** One `<li>`, with no class and no role of its own: the list's CSS styles it by position. */
export function ListItem(props: ListItemProps): ReactElement {
  return createElement('li', props)
}
ListItem.displayName = 'List.Item'

/** `List.Root` and `List.Item`. Nothing else: a link is a `Link.Root` inside a `List.Item`. */
export const List = {
  Root: ListRoot,
  Item: ListItem,
} as const
