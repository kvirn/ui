import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useMemo } from 'react'
import { useMessages } from '../provider/use-messages.ts'

export interface UseDefinitionListOptions {
  /** Per-instance message overrides: `{ change: 'Redigera' }`. */
  messages?: Partial<KvirnMessages['definitionList']> | undefined
}

/** Spread on one part's element. Only the part's class: DefinitionList adds no role, ARIA or state. */
export interface DefinitionListPartProps<
  Name extends
    | 'definition-list'
    | 'definition-list-row'
    | 'definition-list-term'
    | 'definition-list-description'
    | 'definition-list-actions' =
    | 'definition-list'
    | 'definition-list-row'
    | 'definition-list-term'
    | 'definition-list-description'
    | 'definition-list-actions',
> {
  /**
   * The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-definition-list`. Add a class of
   * your own next to it with `mergeProps`: class names join.
   */
  className: `kv-${Name}`
}

/** Spread on the Change `<a>`, with the `href` and the text `changeLabel`. */
export interface DefinitionListChangePartProps {
  className: 'kv-link kv-definition-list-change'
  id: string
  /**
   * The link's own id, then the row's Term id: the name is "Change" plus the term's text, so the
   * purpose is clear out of context (2.4.4) and the visible text starts the name (2.5.3).
   */
  'aria-labelledby': string
}

export interface UseDefinitionListResult {
  rootProps: DefinitionListPartProps<'definition-list'>
  rowProps: DefinitionListPartProps<'definition-list-row'>
  termProps: DefinitionListPartProps<'definition-list-term'>
  descriptionProps: DefinitionListPartProps<'definition-list-description'>
  actionsProps: DefinitionListPartProps<'definition-list-actions'>
  /** The message `definitionList.change`: the visible text of the Change link. */
  changeLabel: string
  /** `id` is the link's own, `termId` the id you gave the row's `<dt>`. */
  getChangeProps: (ids: { id: string; termId: string }) => DefinitionListChangePartProps
}

// The same objects every time, frozen, so nothing a consumer does can change another list.
const classProps = Object.freeze({
  rootProps: Object.freeze({ className: 'kv-definition-list' }),
  rowProps: Object.freeze({ className: 'kv-definition-list-row' }),
  termProps: Object.freeze({ className: 'kv-definition-list-term' }),
  descriptionProps: Object.freeze({ className: 'kv-definition-list-description' }),
  actionsProps: Object.freeze({ className: 'kv-definition-list-actions' }),
} as const)

/**
 * A description list's part classes and the Change link's props for your own elements (contract:
 * definition-list.a11y.md). The list is a native `<dl>` with a `<div>` per row.
 *
 * @example
 * const list = useDefinitionList()
 * <dl {...list.rootProps}>
 *   <div {...list.rowProps}>
 *     <dt {...list.termProps} id={termId}>Namn</dt>
 *     <dd {...list.descriptionProps}>Anna Svensson</dd>
 *     <dd {...list.actionsProps}>
 *       <a {...list.getChangeProps({ id: changeId, termId })} href="/steg/1">{list.changeLabel}</a>
 *     </dd>
 *   </div>
 * </dl>
 */
export function useDefinitionList({
  messages,
}: UseDefinitionListOptions = {}): UseDefinitionListResult {
  const definitionListMessages = useMessages('definitionList', messages)
  const changeLabel = definitionListMessages.change
  return useMemo(
    () => ({
      ...classProps,
      changeLabel,
      getChangeProps: ({ id, termId }) => ({
        className: 'kv-link kv-definition-list-change',
        id,
        'aria-labelledby': `${id} ${termId}`,
      }),
    }),
    [changeLabel],
  )
}
