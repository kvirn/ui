'use client'
import { createContext, createElement, Fragment, useContext, useRef } from 'react'
import type { ElementType, HTMLAttributes, ReactElement, ReactNode, Ref } from 'react'
import type { Shortcut } from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { Kbd } from '../kbd/kbd.tsx'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { useMessages } from '../provider/use-messages.ts'
import type { AsComponent } from '../render/as-prop.ts'
import { renderPart } from '../render/render-part.ts'
import { SkipPanelContext } from './skip-panel-context.ts'
import {
  useSkipPanel,
  useSkipPanelGroup,
  useSkipPanelHint,
  useSkipPanelLink,
  useSkipPanelShortcut,
} from './use-skip-panel.ts'
import type { UseSkipPanelKeysResult, UseSkipPanelOptions } from './use-skip-panel.ts'

interface SkipPanelPartComponentProps<Element extends HTMLElement> extends HTMLAttributes<Element> {
  ref?: Ref<Element> | undefined
}

const GroupLabelContext = createContext<ReturnType<typeof useSkipPanelGroup>['labelProps'] | null>(
  null,
)

export interface SkipPanelRootComponentProps
  extends UseSkipPanelOptions, SkipPanelPartComponentProps<HTMLDivElement> {}

/** The skip panel: one `<div class="kv-skip-panel">`. Put it first in the body. */
export function SkipPanelRoot({
  reopenShortcut,
  shortcutsEnabled,
  ref,
  ...otherProps
}: SkipPanelRootComponentProps): ReactElement {
  const skipPanel = useSkipPanel({ reopenShortcut, shortcutsEnabled })
  const elementRef = useMergedRef(ref, skipPanel.rootRef as Ref<HTMLDivElement>)
  return (
    <SkipPanelContext.Provider value={skipPanel.context}>
      {createElement('div', {
        ...mergeProps(otherProps, skipPanel.rootProps),
        ref: elementRef,
      })}
    </SkipPanelContext.Provider>
  )
}
SkipPanelRoot.displayName = 'SkipPanel.Root'

/** A `<div role="group">` named by its Label. */
export function SkipPanelGroup({
  ref,
  ...otherProps
}: SkipPanelPartComponentProps<HTMLDivElement>): ReactElement {
  const { groupProps, labelProps } = useSkipPanelGroup()
  const elementRef = useMergedRef(ref, null)
  return (
    <GroupLabelContext.Provider value={labelProps}>
      {createElement('div', { ...mergeProps(otherProps, groupProps), ref: elementRef })}
    </GroupLabelContext.Provider>
  )
}
SkipPanelGroup.displayName = 'SkipPanel.Group'

export interface SkipPanelLabelProps extends SkipPanelPartComponentProps<HTMLSpanElement> {
  /**
   * Which default text to show when there are no children: `skip` is `skipPanel.skipToLabel`,
   * `shortcuts` is `skipPanel.shortcutsLabel`, or `skipPanel.actionsLabel` while shortcuts are off.
   */
  kind?: 'skip' | 'shortcuts' | undefined
  messages?: Partial<KvirnMessages['skipPanel']> | undefined
}

/** The group's visible name: one `<span>`, never a heading. */
export function SkipPanelLabel({
  kind = 'skip',
  messages,
  children,
  ref,
  ...otherProps
}: SkipPanelLabelProps): ReactElement {
  const labelProps = useContext(GroupLabelContext)
  const context = useContext(SkipPanelContext)
  const skipPanelMessages = useMessages('skipPanel', messages)
  const elementRef = useMergedRef(ref, null)
  const shortcutsText =
    context?.shortcutsEnabled === false
      ? skipPanelMessages.actionsLabel
      : skipPanelMessages.shortcutsLabel
  return createElement(
    'span',
    {
      ...mergeProps(otherProps, labelProps ?? { className: 'kv-skip-panel__label' }),
      ref: elementRef,
    },
    children ?? (kind === 'skip' ? skipPanelMessages.skipToLabel : shortcutsText),
  )
}
SkipPanelLabel.displayName = 'SkipPanel.Label'

const listProps = { className: 'kv-skip-panel__list', role: 'list' } as const

/** A `<ul role="list">`. */
export function SkipPanelList({
  ref,
  ...otherProps
}: SkipPanelPartComponentProps<HTMLUListElement>): ReactElement {
  const elementRef = useMergedRef(ref, null)
  return createElement('ul', { ...mergeProps(otherProps, listProps), ref: elementRef })
}
SkipPanelList.displayName = 'SkipPanel.List'

/** A `<li>`. */
export function SkipPanelItem({
  ref,
  ...otherProps
}: SkipPanelPartComponentProps<HTMLLIElement>): ReactElement {
  const elementRef = useMergedRef(ref, null)
  return createElement('li', {
    ...mergeProps(otherProps, { className: 'kv-skip-panel__item' }),
    ref: elementRef,
  })
}
SkipPanelItem.displayName = 'SkipPanel.Item'

interface SkipPanelLinkOwnProps {
  /** A same-page address, `#main`: the id of the element the link jumps to. */
  href: string
  /** Your own text. Replaces the message `skipPanel.mainContent`. */
  children?: ReactNode
  messages?: Partial<KvirnMessages['skipPanel']> | undefined
}

export type SkipPanelLinkProps<Component extends ElementType = 'a'> = AsComponent<
  Component,
  SkipPanelLinkOwnProps
>

/** A bypass link in the list: it focuses its target, as `SkipLink` does. */
export function SkipPanelLink<Component extends ElementType = 'a'>(
  props: SkipPanelLinkProps<Component>,
): ReactElement
export function SkipPanelLink({
  as,
  href,
  messages,
  children,
  ref,
  ...otherProps
}: SkipPanelLinkProps<'a'>): ReactElement {
  const { linkProps, label } = useSkipPanelLink({ href, messages })
  const elementRef = useMergedRef(ref, null)
  return renderPart({
    as,
    defaultElement: 'a',
    partProps: {
      ...mergeProps(otherProps, linkProps),
      ref: elementRef,
      children: children ?? label,
    },
  })
}
SkipPanelLink.displayName = 'SkipPanel.Link'

function KeyCaps({ keys, joiner }: UseSkipPanelKeysResult): ReactElement | null {
  if (keys.length === 0) {
    return null
  }
  return (
    <Kbd>
      {keys.map(({ key, text }, index) => (
        <Fragment key={`${key.type}:${text}`}>
          {index > 0 ? joiner : null}
          <Kbd>{text}</Kbd>
        </Fragment>
      ))}
    </Kbd>
  )
}

interface SkipPanelShortcutOwnProps {
  /** The chord. It runs this row page-wide while the Root is mounted and `shortcutsEnabled`. */
  shortcut: Shortcut
  children?: ReactNode
}

/** `as` is a component that renders an `<a href>` or a button, such as a router link. */
export type SkipPanelShortcutProps<Component extends ElementType = 'button'> = AsComponent<
  Component,
  SkipPanelShortcutOwnProps
>

/** A row: your text, then the key caps of its chord. A `<button>` unless `as` says otherwise. */
export function SkipPanelShortcut<Component extends ElementType = 'button'>(
  props: SkipPanelShortcutProps<Component>,
): ReactElement
export function SkipPanelShortcut({
  as,
  shortcut,
  children,
  ref,
  ...otherProps
}: SkipPanelShortcutProps<'button'>): ReactElement {
  const ownRef = useRef<HTMLElement | null>(null)
  const elementRef = useMergedRef(ref, ownRef)
  const { shortcutProps, ...keys } = useSkipPanelShortcut({ shortcut, elementRef: ownRef })
  return renderPart({
    as,
    defaultElement: 'button',
    partProps: {
      ...(as === undefined ? { type: 'button' } : {}),
      ...mergeProps(otherProps, shortcutProps),
      ref: elementRef,
      children: (
        <>
          {children}
          {keys.keys.length > 0 ? ' ' : null}
          <KeyCaps {...keys} />
        </>
      ),
    },
  })
}
SkipPanelShortcut.displayName = 'SkipPanel.Shortcut'

/** The arrow-key sentence, then "Press Alt + Shift + K to open this list again." with a `reopenShortcut`. */
export function SkipPanelHint({
  ref,
  ...otherProps
}: SkipPanelPartComponentProps<HTMLParagraphElement>): ReactElement {
  const { hintProps, arrowHint, sentence, ...keys } = useSkipPanelHint()
  const elementRef = useMergedRef(ref, null)
  return (
    <p {...mergeProps(otherProps, hintProps)} ref={elementRef}>
      <span id={arrowHint.id}>{arrowHint.text}</span>
      {sentence === undefined ? null : (
        <>
          {' '}
          {sentence.before}
          <KeyCaps {...keys} />
          {sentence.after}
        </>
      )}
    </p>
  )
}
SkipPanelHint.displayName = 'SkipPanel.Hint'

/**
 * A skip panel with keyboard shortcuts (contract: skip-panel.a11y.md). The first Tab shows a
 * list of where to skip to and the shortcuts the site offers.
 *
 * @example
 * <SkipPanel.Root reopenShortcut={{ key: 'k', alt: true, shift: true }}>
 *   <SkipPanel.Group>
 *     <SkipPanel.Label />
 *     <SkipPanel.List>
 *       <SkipPanel.Item><SkipPanel.Link href="#main" /></SkipPanel.Item>
 *     </SkipPanel.List>
 *   </SkipPanel.Group>
 *   <SkipPanel.Hint />
 * </SkipPanel.Root>
 */
export const SkipPanel = {
  Root: SkipPanelRoot,
  Group: SkipPanelGroup,
  Label: SkipPanelLabel,
  List: SkipPanelList,
  Item: SkipPanelItem,
  Link: SkipPanelLink,
  Shortcut: SkipPanelShortcut,
  Hint: SkipPanelHint,
} as const
