'use client'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useContext, useEffect, useId } from 'react'
import type { ComponentPropsWithRef, HTMLAttributes, ReactElement, Ref, RefCallback } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { SummaryListRowContext } from './summary-list-context.ts'
import { useSummaryList } from './use-summary-list.ts'
import type { SummaryListPartProps } from './use-summary-list.ts'

export type { SummaryListPartProps } from './use-summary-list.ts'

/** What `render` receives as its second argument. A summary list has no state, so it's empty. */
export type SummaryListState = Record<string, never>

/** What a `render` function gets to spread: your attributes, the part's class and a callback ref. */
export interface SummaryListElementProps extends HTMLAttributes<HTMLElement> {
  ref: RefCallback<HTMLElement>
}

interface SummaryListPartComponentProps extends HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement> | undefined
  /** Change the element, for example `render={<ul />}` on the Root. Its own semantics apply. */
  render?: RenderProp<SummaryListElementProps, SummaryListState> | undefined
}

export type SummaryListRootProps = SummaryListPartComponentProps
export type SummaryListRowProps = SummaryListPartComponentProps
export type SummaryListKeyProps = SummaryListPartComponentProps
export type SummaryListValueProps = SummaryListPartComponentProps
export type SummaryListActionsProps = SummaryListPartComponentProps

/** What a `render` function of the Change link gets to spread. */
export interface SummaryListChangeElementProps extends Omit<ComponentPropsWithRef<'a'>, 'ref'> {
  ref: RefCallback<HTMLAnchorElement>
}

/** `children` replace the text `summaryList.change`; the key's text is still added to the name. */
export interface SummaryListChangeProps extends ComponentPropsWithRef<'a'> {
  /** Per-instance message overrides: `{ change: 'Redigera' }`. */
  messages?: Partial<KvirnMessages['summaryList']> | undefined
  /** Change the element: `render={<a />}`, or your router's link. */
  render?: RenderProp<SummaryListChangeElementProps, SummaryListState> | undefined
}

const summaryListState: SummaryListState = Object.freeze({})

/**
 * Internal. One part: one element. The part's class joins a prop's and a render element's own
 * class names (mergeProps), so neither can remove it and the theme keeps styling the list.
 */
function useSummaryListPart(
  { render, ref, ...otherProps }: SummaryListPartComponentProps,
  partProps: SummaryListPartProps,
  defaultElement: 'dl' | 'div' | 'dt' | 'dd',
  extraProps: { id?: string } = {},
): ReactElement {
  const elementRef = useMergedRef(ref, null)
  return renderPart({
    render,
    defaultElement,
    partProps: { ...mergeProps(otherProps, partProps), ...extraProps, ref: elementRef },
    state: summaryListState,
  })
}

/** The list: one `<dl class="kv-summary-list">`. Its direct children are Rows. */
export function SummaryListRoot(props: SummaryListRootProps): ReactElement {
  return useSummaryListPart(props, useSummaryList().rootProps, 'dl')
}
SummaryListRoot.displayName = 'SummaryList.Root'

/** One key with its values: a `<div>`, which keeps them together inside the `<dl>`. */
export function SummaryListRow(props: SummaryListRowProps): ReactElement {
  const keyId = useId()
  const row = useSummaryListPart(props, useSummaryList().rowProps, 'div')
  return <SummaryListRowContext.Provider value={{ keyId }}>{row}</SummaryListRowContext.Provider>
}
SummaryListRow.displayName = 'SummaryList.Row'

/** The label: a `<dt>`. Its id (from the Row) names the Change link, so it needs text. */
export function SummaryListKey(props: SummaryListKeyProps): ReactElement {
  const row = useContext(SummaryListRowContext)
  return useSummaryListPart(
    props,
    useSummaryList().keyProps,
    'dt',
    row === null ? {} : { id: row.keyId },
  )
}
SummaryListKey.displayName = 'SummaryList.Key'

/** The answer: a `<dd>`. */
export function SummaryListValue(props: SummaryListValueProps): ReactElement {
  return useSummaryListPart(props, useSummaryList().valueProps, 'dd')
}
SummaryListValue.displayName = 'SummaryList.Value'

/** The row's actions: a `<dd>` holding links such as Change. */
export function SummaryListActions(props: SummaryListActionsProps): ReactElement {
  return useSummaryListPart(props, useSummaryList().actionsProps, 'dd')
}
SummaryListActions.displayName = 'SummaryList.Actions'

/**
 * The row's change link: `<a class="kv-link kv-summary-list-change">` with the text "Change"
 * and the accessible name "Change" plus the Key's text. Give it the `href` of the step where the
 * answer is changed.
 */
export function SummaryListChange({
  messages,
  children,
  render,
  ref,
  ...otherProps
}: SummaryListChangeProps): ReactElement {
  const row = useContext(SummaryListRowContext)
  const ownId = useId()
  const list = useSummaryList({ messages })
  const elementRef = useMergedRef(ref, null)
  useEffect(() => {
    if (row === null) {
      warnOnce(
        'summary-list-change-outside-row',
        'SummaryList.Change is outside a Row, so its name has no key: it is just "Change". Put it in a SummaryList.Actions inside a SummaryList.Row that has a SummaryList.Key.',
      )
    }
  }, [row])
  const changeProps =
    row === null
      ? { className: 'kv-link kv-summary-list-change' as const }
      : list.getChangeProps({ id: ownId, keyId: row.keyId })
  return renderPart({
    render,
    defaultElement: 'a',
    partProps: {
      ...mergeProps(otherProps, changeProps),
      ref: elementRef,
      children: children ?? list.changeLabel,
    },
    state: summaryListState,
  })
}
SummaryListChange.displayName = 'SummaryList.Change'

/**
 * Rows of a label, a value and optional actions, as one native description list (contract:
 * summary-list.a11y.md): a check-your-answers page, a contact card, a case card. Read-only. With
 * `@kvirn-ui/theme`, the rows have dividers and stack below `40rem`.
 *
 * @example
 * <SummaryList.Root>
 *   <SummaryList.Row>
 *     <SummaryList.Key>Namn</SummaryList.Key>
 *     <SummaryList.Value>Anna Svensson</SummaryList.Value>
 *     <SummaryList.Actions>
 *       <SummaryList.Change href="/steg/1" />
 *     </SummaryList.Actions>
 *   </SummaryList.Row>
 * </SummaryList.Root>
 */
export const SummaryList = {
  Root: SummaryListRoot,
  Row: SummaryListRow,
  Key: SummaryListKey,
  Value: SummaryListValue,
  Actions: SummaryListActions,
  Change: SummaryListChange,
} as const
