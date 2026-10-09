import type {
  SummaryListActionsProps,
  SummaryListChangeProps,
  SummaryListKeyProps,
  SummaryListRootProps,
  SummaryListRowProps,
  SummaryListValueProps,
  UseSummaryListOptions,
  UseSummaryListResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

const refRow = {
  type: 'Ref<HTMLElement>',
  default: '–',
  description: 'Reaches the element, whichever it is.',
}

const partRows = propRows<Pick<SummaryListRootProps, 'ref'>>({
  ref: refRow,
})

export const rootRows = partRows
export const rowRows = propRows<Pick<SummaryListRowProps, 'ref'>>(partRows)
export const keyRows = propRows<Pick<SummaryListKeyProps, 'ref'>>(partRows)
export const valueRows = propRows<Pick<SummaryListValueProps, 'ref'>>(partRows)
export const actionsRows = propRows<Pick<SummaryListActionsProps, 'ref'>>(partRows)

export const changeRows = propRows<Pick<SummaryListChangeProps, 'messages' | 'ref'>>({
  messages: {
    type: "Partial<KvirnMessages['summaryList']>",
    default: '–',
    description:
      'Per-instance override of the visible text, such as { change: "Add" }. The key is still added to the accessible name.',
  },
  ref: {
    type: 'Ref<HTMLAnchorElement>',
    default: '–',
    description: 'Reaches the link.',
  },
})

export const rootAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-summary-list',
    values: 'always',
    meaning: 'The part class. The default theme styles it.',
  },
]

export const rowAttributes: readonly AttributeRow[] = [
  { name: 'kv-summary-list-row', values: 'always', meaning: 'The part class.' },
]

export const keyAttributes: readonly AttributeRow[] = [
  { name: 'kv-summary-list-key', values: 'always', meaning: 'The part class.' },
  {
    name: 'id',
    values: 'generated, inside a Row',
    meaning: 'The Row gives the Key an id, which names the Change link.',
  },
]

export const valueAttributes: readonly AttributeRow[] = [
  { name: 'kv-summary-list-value', values: 'always', meaning: 'The part class.' },
]

export const actionsAttributes: readonly AttributeRow[] = [
  { name: 'kv-summary-list-actions', values: 'always', meaning: 'The part class.' },
]

export const changeAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-link',
    values: 'always',
    meaning: 'The Link class, so the link looks like every other link.',
  },
  { name: 'kv-summary-list-change', values: 'always', meaning: 'The part class.' },
  {
    name: 'aria-labelledby',
    values: 'the link’s id, then the Key’s id',
    meaning: 'Builds the name: “Change” plus the key. Without a Row it is left off.',
  },
]

export const useSummaryListHook: ApiHook = {
  name: 'useSummaryList',
  options: propRows<UseSummaryListOptions>({
    messages: {
      type: "Partial<KvirnMessages['summaryList']>",
      default: '–',
      description: 'Per-instance override of the visible text of the Change link.',
    },
  }),
  result: propRows<UseSummaryListResult>({
    rootProps: {
      type: 'SummaryListPartProps<"summary-list">',
      default: '–',
      description: 'Spread on the <dl>: the class only.',
    },
    rowProps: {
      type: 'SummaryListPartProps<"summary-list-row">',
      default: '–',
      description: 'Spread on the <div> of a row.',
    },
    keyProps: {
      type: 'SummaryListPartProps<"summary-list-key">',
      default: '–',
      description: 'Spread on the <dt>. Give it the id you pass to getChangeProps.',
    },
    valueProps: {
      type: 'SummaryListPartProps<"summary-list-value">',
      default: '–',
      description: 'Spread on a <dd> that holds an answer.',
    },
    actionsProps: {
      type: 'SummaryListPartProps<"summary-list-actions">',
      default: '–',
      description: 'Spread on the <dd> that holds the links.',
    },
    changeLabel: {
      type: 'string',
      default: '–',
      description: 'The text “Change”, in the language of the provider: the link’s visible text.',
    },
    getChangeProps: {
      type: '(ids: { id: string; keyId: string }) => SummaryListChangePartProps',
      default: '–',
      description:
        'The link’s class, its own id and aria-labelledby, so its name is “Change” plus the key. id is the link’s, keyId the id of the row’s <dt>.',
    },
  }),
}
