import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useMemo } from 'react'
import { useMessages } from '../provider/use-messages.ts'

export interface UseSummaryListOptions {
  /** Per-instance message overrides: `{ change: 'Redigera' }`. */
  messages?: Partial<KvirnMessages['summaryList']> | undefined
}

/** Spread on one part's element. Only the part's class: SummaryList adds no role, ARIA or state. */
export interface SummaryListPartProps<
  Name extends
    | 'summary-list'
    | 'summary-list-row'
    | 'summary-list-key'
    | 'summary-list-value'
    | 'summary-list-actions' =
    | 'summary-list'
    | 'summary-list-row'
    | 'summary-list-key'
    | 'summary-list-value'
    | 'summary-list-actions',
> {
  /**
   * The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-summary-list`. Add a class of
   * your own next to it with `mergeProps`: class names join.
   */
  className: `kv-${Name}`
}

/** Spread on the Change `<a>`, with the `href` and the text `changeLabel`. */
export interface SummaryListChangePartProps {
  className: 'kv-link kv-summary-list-change'
  id: string
  /**
   * The link's own id, then the row's Key id: the name is "Change" plus the key's text, so the
   * purpose is clear out of context (2.4.4) and the visible text starts the name (2.5.3).
   */
  'aria-labelledby': string
}

export interface UseSummaryListResult {
  rootProps: SummaryListPartProps<'summary-list'>
  rowProps: SummaryListPartProps<'summary-list-row'>
  keyProps: SummaryListPartProps<'summary-list-key'>
  valueProps: SummaryListPartProps<'summary-list-value'>
  actionsProps: SummaryListPartProps<'summary-list-actions'>
  /** The message `summaryList.change`: the visible text of the Change link. */
  changeLabel: string
  /** `id` is the link's own, `keyId` the id you gave the row's `<dt>`. */
  getChangeProps: (ids: { id: string; keyId: string }) => SummaryListChangePartProps
}

// The same objects every time, frozen, so nothing a consumer does can change another list.
const classProps = Object.freeze({
  rootProps: Object.freeze({ className: 'kv-summary-list' }),
  rowProps: Object.freeze({ className: 'kv-summary-list-row' }),
  keyProps: Object.freeze({ className: 'kv-summary-list-key' }),
  valueProps: Object.freeze({ className: 'kv-summary-list-value' }),
  actionsProps: Object.freeze({ className: 'kv-summary-list-actions' }),
} as const)

/**
 * A summary list's part classes and the Change link's props for your own elements (contract:
 * summary-list.a11y.md). The list is a native `<dl>` with a `<div>` per row.
 *
 * @example
 * const list = useSummaryList()
 * <dl {...list.rootProps}>
 *   <div {...list.rowProps}>
 *     <dt {...list.keyProps} id={keyId}>Namn</dt>
 *     <dd {...list.valueProps}>Anna Svensson</dd>
 *     <dd {...list.actionsProps}>
 *       <a {...list.getChangeProps({ id: changeId, keyId })} href="/steg/1">{list.changeLabel}</a>
 *     </dd>
 *   </div>
 * </dl>
 */
export function useSummaryList({ messages }: UseSummaryListOptions = {}): UseSummaryListResult {
  const summaryListMessages = useMessages('summaryList', messages)
  const changeLabel = summaryListMessages.change
  return useMemo(
    () => ({
      ...classProps,
      changeLabel,
      getChangeProps: ({ id, keyId }) => ({
        className: 'kv-link kv-summary-list-change',
        id,
        'aria-labelledby': `${id} ${keyId}`,
      }),
    }),
    [changeLabel],
  )
}
