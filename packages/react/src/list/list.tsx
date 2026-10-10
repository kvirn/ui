import type { ComponentPropsWithRef, ReactElement } from 'react'
import { createElement } from 'react'
import { mergeProps } from '../merge-props/merge-props.ts'
import { listRole, resolveAsTag } from '../render/as-prop.ts'
import type { AsTag } from '../render/as-prop.ts'
import { renderPart } from '../render/render-part.ts'

const listTags = ['ul', 'ol'] as const

/**
 * `as` is `ul` (default) or `ol`. The list always gets `role="list"`: WebKit and VoiceOver drop
 * the list role under `list-style: none`, and a consumer's own `role` wins.
 */
export type ListRootProps = AsTag<(typeof listTags)[number], 'ul'>

export type ListItemProps = ComponentPropsWithRef<'li'>

/**
 * The one native list (contract: list.a11y.md): `<ul class="kv-list">`, or `<ol>` with `as="ol"`. The class has no marker: add
 * `kv-list--bullet` or `kv-list--decimal`, and `kv-list--gap-2|6|8` for another gap.
 * Its children are `List.Item`. Usable in a server component.
 *
 * @example
 * <List.Root>
 *   <List.Item><Link.Root href="/bygglov">Bygglov</Link.Root></List.Item>
 *   <List.Item><Link.Root href="/avfall">Avfall</Link.Root></List.Item>
 * </List.Root>
 */
export function ListRoot({ as, ...otherProps }: ListRootProps): ReactElement {
  const tag = resolveAsTag({ part: 'List.Root', as, allowedTags: listTags })
  return renderPart({
    as: tag,
    defaultElement: 'ul',
    partProps: { ...listRole(tag ?? 'ul'), ...mergeProps(otherProps, { className: 'kv-list' }) },
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
