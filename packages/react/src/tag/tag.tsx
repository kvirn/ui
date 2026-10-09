'use client'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { Children, createElement, useContext, useEffect, useLayoutEffect } from 'react'
import type { ButtonHTMLAttributes, HTMLAttributes, ReactElement, ReactNode, Ref } from 'react'
import { Button } from '../button/button.tsx'
import type { ButtonProps } from '../button/button.tsx'
import { warnOnce } from '../dev/dev-warning.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { useMessages } from '../provider/use-messages.ts'
import { TagGroupContext } from './tag-group-context.ts'
import { removeButtonAttribute, useTagGroup } from './use-tag-group.ts'
import type { UseTagGroupOptions } from './use-tag-group.ts'

const joinClass = (className: string | undefined, partClass: string) =>
  className === undefined ? partClass : `${className} ${partClass}`

function useTagGroupContext(part: string) {
  const context = useContext(TagGroupContext)
  if (context === null) {
    throw new Error(`${part} must be rendered inside TagGroup.Root`)
  }
  return context
}

export interface TagGroupRootProps extends HTMLAttributes<HTMLDivElement>, UseTagGroupOptions {
  ref?: Ref<HTMLDivElement> | undefined
}

/**
 * A group of tags: a label, a list of tags and an empty text, with the focus rule for removal
 * (contract: tag.a11y.md). It holds no state: you keep the tags and remove one in `onRemove`.
 *
 * @example
 * <TagGroup.Root>
 *   <TagGroup.Label>Valda filter</TagGroup.Label>
 *   <TagGroup.List>
 *     <Tag.Root><Tag.Remove onRemove={() => remove('2025')}>År: 2025</Tag.Remove></Tag.Root>
 *   </TagGroup.List>
 *   <TagGroup.Empty>Inga filter valda</TagGroup.Empty>
 * </TagGroup.Root>
 */
export function TagGroupRoot({
  announceRemoval,
  focusFallback,
  messages,
  className,
  ...divProps
}: TagGroupRootProps): ReactElement {
  const group = useTagGroup({ announceRemoval, focusFallback, messages })
  return (
    <TagGroupContext.Provider value={group}>
      <div {...divProps} className={joinClass(className, 'kv-tag-group')} />
    </TagGroupContext.Provider>
  )
}
TagGroupRoot.displayName = 'TagGroup.Root'

export interface TagGroupLabelProps extends HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement> | undefined
}

/** The group's name and the default focus fallback after the last tag goes. */
export function TagGroupLabel({ className, ref, ...otherProps }: TagGroupLabelProps): ReactElement {
  const group = useTagGroupContext('TagGroup.Label')
  const mergedRef = useMergedRef(ref, group.labelRef)
  return createElement('span', {
    ...otherProps,
    id: group.labelId,
    className: joinClass(className, 'kv-tag-group-label'),
    ref: mergedRef,
  })
}
TagGroupLabel.displayName = 'TagGroup.Label'

export interface TagGroupListProps extends HTMLAttributes<HTMLUListElement> {
  ref?: Ref<HTMLUListElement> | undefined
}

/** The list of tags. It isn't rendered while it has no tag, so no empty list is announced. */
export function TagGroupList({
  children,
  className,
  ref,
  ...listProps
}: TagGroupListProps): ReactElement | null {
  const group = useTagGroupContext('TagGroup.List')
  const mergedRef = useMergedRef(ref, group.listRef)
  const hasItems = Children.toArray(children).length > 0
  const { setHasItems } = group
  useLayoutEffect(() => {
    setHasItems(hasItems)
  }, [hasItems, setHasItems])
  if (!hasItems) {
    return null
  }
  return (
    <ul
      role="list"
      {...listProps}
      aria-labelledby={group.labelId}
      className={joinClass(className, 'kv-tag-group-list')}
      ref={mergedRef}
    >
      {children}
    </ul>
  )
}
TagGroupList.displayName = 'TagGroup.List'

/** Text shown while the list has no tag. It is not announced. */
export function TagGroupEmpty({
  className,
  ...paragraphProps
}: HTMLAttributes<HTMLParagraphElement>) {
  const group = useTagGroupContext('TagGroup.Empty')
  if (group.hasItems) {
    return null
  }
  return <p {...paragraphProps} className={joinClass(className, 'kv-tag-group-empty')} />
}
TagGroupEmpty.displayName = 'TagGroup.Empty'

export interface TagGroupClearAllProps extends ButtonProps {
  /** Remove every tag. Your state must change in the same event. */
  onClear: () => void
}

/**
 * The button that removes every tag, shown while the list has one. Its text defaults to
 * `filters.clearAll`, which is for filter groups: pass your own children elsewhere. Focus goes to the group's fallback afterwards. Announce the result yourself.
 */
export function TagGroupClearAll({
  onClear,
  onClick,
  children,
  ...buttonProps
}: TagGroupClearAllProps): ReactElement | null {
  const group = useTagGroupContext('TagGroup.ClearAll')
  const filtersMessages = useMessages('filters')
  if (!group.hasItems) {
    return null
  }
  return (
    <Button
      {...buttonProps}
      onClick={(event) => {
        onClick?.(event)
        group.prepareClear()
        onClear()
      }}
    >
      {children ?? filtersMessages.clearAll}
    </Button>
  )
}
TagGroupClearAll.displayName = 'TagGroup.ClearAll'

/** One tag: a list item that holds a static `Tag.Label` or a removable `Tag.Remove`. */
export function TagRoot({ className, ...itemProps }: HTMLAttributes<HTMLLIElement>): ReactElement {
  return <li {...itemProps} className={joinClass(className, 'kv-tag')} />
}
TagRoot.displayName = 'Tag.Root'

/** The text of a static tag. A locked filter is a static tag, never a disabled button. */
export function TagLabel({
  className,
  ...spanProps
}: HTMLAttributes<HTMLSpanElement>): ReactElement {
  return <span {...spanProps} className={joinClass(className, 'kv-tag-label')} />
}
TagLabel.displayName = 'Tag.Label'

export interface TagRemoveProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick' | 'children' | 'type'
> {
  ref?: Ref<HTMLButtonElement> | undefined
  /** The tag's text, also drawn in the button. */
  children: ReactNode
  /**
   * The text the accessible name `Remove {label}` uses. Defaults to `children` when that is a
   * string: give it when the visible text is richer, and keep it equal to what is shown (2.5.3).
   */
  label?: string | undefined
  /** Remove the tag. Your state must change in the same event: focus is placed after the render. */
  onRemove: () => void
  /** Replaces the `tag` messages for this tag. Default: the group's. */
  messages?: Partial<KvirnMessages['tag']> | undefined
}

/**
 * The whole removable chip, one `<button>` named `Remove {label}` (contract: tag.a11y.md).
 * Enter and Space remove it; Delete and Backspace do nothing. Inside a `TagGroup`, focus moves
 * to the next remove button, else the previous, else the group's fallback.
 */
export function TagRemove({
  children,
  label,
  onRemove,
  messages: instanceMessages,
  className,
  ...buttonProps
}: TagRemoveProps): ReactElement {
  const group = useTagGroupContext('Tag.Remove')
  const ownMessages = useMessages('tag', instanceMessages)
  const tagMessages = instanceMessages === undefined ? group.messages : ownMessages
  const text = label ?? (typeof children === 'string' ? children : undefined)
  useEffect(() => {
    if (text === undefined) {
      warnOnce(
        'tag-remove-label',
        'Tag.Remove has children that are not a string and no `label`, so it has no accessible name that contains its text. Pass `label` with the visible text.',
      )
    }
  }, [text])
  return (
    <button
      {...buttonProps}
      {...{ [removeButtonAttribute]: '' }}
      type="button"
      aria-label={text === undefined ? undefined : tagMessages.remove({ label: text })}
      className={joinClass(className, 'kv-tag-remove')}
      onClick={(event) => {
        group.prepareRemoval(event.currentTarget, text)
        onRemove()
      }}
    >
      {children}
      <span className="kv-tag-remove-icon" aria-hidden="true" />
    </button>
  )
}
TagRemove.displayName = 'Tag.Remove'

/** A removable or plain-text chip, drawn by the theme (`kv-tag`). */
export const Tag = {
  Root: TagRoot,
  Label: TagLabel,
  Remove: TagRemove,
} as const

/** A labelled list of tags with the focus rule for removal, an empty text and Clear all. */
export const TagGroup = {
  Root: TagGroupRoot,
  Label: TagGroupLabel,
  List: TagGroupList,
  Empty: TagGroupEmpty,
  ClearAll: TagGroupClearAll,
} as const
