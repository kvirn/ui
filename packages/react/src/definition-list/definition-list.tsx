'use client'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import {
  createElement,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import type { ComponentPropsWithRef, HTMLAttributes, ReactElement, Ref } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { DefinitionListRowContext } from './definition-list-context.ts'
import { useDefinitionList } from './use-definition-list.ts'
import type { DefinitionListPartProps } from './use-definition-list.ts'

export type { DefinitionListPartProps } from './use-definition-list.ts'

interface DefinitionListPartComponentProps extends HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement> | undefined
}

export type DefinitionListRootProps = DefinitionListPartComponentProps
export type DefinitionListRowProps = DefinitionListPartComponentProps
export type DefinitionListTermProps = DefinitionListPartComponentProps
export type DefinitionListDescriptionProps = DefinitionListPartComponentProps
export type DefinitionListActionsProps = DefinitionListPartComponentProps

/** `children` replace the text `definitionList.change`; the term's text is still added to the name. */
export interface DefinitionListChangeProps extends ComponentPropsWithRef<'a'> {
  /** Per-instance message overrides: `{ change: 'Redigera' }`. */
  messages?: Partial<KvirnMessages['definitionList']> | undefined
}

/**
 * Internal. One part: one element. The part's class joins a prop's own class names (mergeProps),
 * so a prop can't remove it and the theme keeps styling the list.
 */
function useDefinitionListPart(
  { ref, ...otherProps }: DefinitionListPartComponentProps,
  partProps: DefinitionListPartProps,
  defaultElement: 'dl' | 'div' | 'dt' | 'dd',
  extraProps: { id?: string } = {},
): ReactElement {
  const elementRef = useMergedRef(ref, null)
  return createElement(defaultElement, {
    ...mergeProps(otherProps, partProps),
    ...extraProps,
    ref: elementRef,
  })
}

/** The list: one `<dl class="kv-definition-list">`. Its direct children are Rows. */
export function DefinitionListRoot(props: DefinitionListRootProps): ReactElement {
  return useDefinitionListPart(props, useDefinitionList().rootProps, 'dl')
}
DefinitionListRoot.displayName = 'DefinitionList.Root'

/** One term with its descriptions: a `<div>`, which keeps them together inside the `<dl>`. */
export function DefinitionListRow(props: DefinitionListRowProps): ReactElement {
  const generatedTermId = useId()
  const [ownTermId, registerTermId] = useState<string | undefined>(undefined)
  const termId = ownTermId ?? generatedTermId
  const row = useDefinitionListPart(props, useDefinitionList().rowProps, 'div')
  return (
    <DefinitionListRowContext.Provider value={{ termId, registerTermId }}>
      {row}
    </DefinitionListRowContext.Provider>
  )
}
DefinitionListRow.displayName = 'DefinitionList.Row'

/**
 * The label: a `<dt>`. Its id (from the Row, or your own `id`) names the Change link, so it needs
 * text.
 */
export function DefinitionListTerm(props: DefinitionListTermProps): ReactElement {
  const row = useContext(DefinitionListRowContext)
  const ownId = props.id
  const registerTermId = row?.registerTermId
  useLayoutEffect(() => {
    registerTermId?.(ownId)
    return () => registerTermId?.(undefined)
  }, [registerTermId, ownId])
  return useDefinitionListPart(
    props,
    useDefinitionList().termProps,
    'dt',
    row === null || ownId !== undefined ? {} : { id: row.termId },
  )
}
DefinitionListTerm.displayName = 'DefinitionList.Term'

/** The answer: a `<dd>`. */
export function DefinitionListDescription(props: DefinitionListDescriptionProps): ReactElement {
  return useDefinitionListPart(props, useDefinitionList().descriptionProps, 'dd')
}
DefinitionListDescription.displayName = 'DefinitionList.Description'

/** The row's actions: a `<dd>` holding links such as Change. */
export function DefinitionListActions(props: DefinitionListActionsProps): ReactElement {
  return useDefinitionListPart(props, useDefinitionList().actionsProps, 'dd')
}
DefinitionListActions.displayName = 'DefinitionList.Actions'

/**
 * The row's change link: `<a class="kv-link kv-definition-list-change">` with the text "Change"
 * and the accessible name "Change" plus the Term's text. Give it the `href` of the step where the
 * answer is changed.
 */
export function DefinitionListChange({
  messages,
  children,
  ref,
  ...otherProps
}: DefinitionListChangeProps): ReactElement {
  const row = useContext(DefinitionListRowContext)
  const ownId = useId()
  const list = useDefinitionList({ messages })
  const elementRef = useMergedRef(ref, null)
  useEffect(() => {
    if (row === null) {
      warnOnce(
        'definition-list-change-outside-row',
        'DefinitionList.Change is outside a Row, so its name has no term: it is just "Change". Put it in a DefinitionList.Actions inside a DefinitionList.Row that has a DefinitionList.Term.',
      )
    }
  }, [row])
  const termId = row?.termId
  const latestTermId = useRef(termId)
  useLayoutEffect(() => {
    latestTermId.current = termId
  }, [termId])
  useEffect(() => {
    // A Term with its own id reports it in a layout effect, which re-renders the Row. Reading
    // the latest id after that, not this render's, keeps it from being reported as missing.
    queueMicrotask(() => {
      const id = latestTermId.current
      if (id !== undefined && document.getElementById(id) === null) {
        warnOnce(
          `definition-list-term-missing:${id}`,
          `A DefinitionList.Change names itself from the term with id "${id}", but the document has no element with that id, so its name is just "Change". Put a DefinitionList.Term in the same Row (WCAG 2.4.4, 4.1.2).`,
        )
      }
    })
  }, [termId])
  const changeProps =
    row === null
      ? { className: 'kv-link kv-definition-list-change' as const }
      : list.getChangeProps({ id: ownId, termId: row.termId })
  return createElement(
    'a',
    { ...mergeProps(otherProps, changeProps), ref: elementRef },
    children ?? list.changeLabel,
  )
}
DefinitionListChange.displayName = 'DefinitionList.Change'

/**
 * Rows of a term, a description and optional actions, as one native description list (contract:
 * definition-list.a11y.md): a check-your-answers page, a contact card, a case card. Read-only. With
 * `@kvirn-ui/theme`, the rows have dividers and stack below `40rem`.
 *
 * @example
 * <DefinitionList.Root>
 *   <DefinitionList.Row>
 *     <DefinitionList.Term>Namn</DefinitionList.Term>
 *     <DefinitionList.Description>Anna Svensson</DefinitionList.Description>
 *     <DefinitionList.Actions>
 *       <DefinitionList.Change href="/steg/1" />
 *     </DefinitionList.Actions>
 *   </DefinitionList.Row>
 * </DefinitionList.Root>
 */
export const DefinitionList = {
  Root: DefinitionListRoot,
  Row: DefinitionListRow,
  Term: DefinitionListTerm,
  Description: DefinitionListDescription,
  Actions: DefinitionListActions,
  Change: DefinitionListChange,
} as const
