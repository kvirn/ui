import type {
  DefinitionListActionsProps,
  DefinitionListChangeProps,
  DefinitionListTermProps,
  DefinitionListRootProps,
  DefinitionListRowProps,
  DefinitionListDescriptionProps,
  UseDefinitionListOptions,
  UseDefinitionListResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

const refRow = {
  type: 'Ref<HTMLElement>',
  default: '–',
  description: 'Reaches the element, whichever it is.',
}

const partRows = propRows<Pick<DefinitionListRootProps, 'ref'>>({
  ref: refRow,
})

export const rootRows = partRows
export const rowRows = propRows<Pick<DefinitionListRowProps, 'ref'>>(partRows)
export const termRows = propRows<Pick<DefinitionListTermProps, 'ref'>>(partRows)
export const descriptionRows = propRows<Pick<DefinitionListDescriptionProps, 'ref'>>(partRows)
export const actionsRows = propRows<Pick<DefinitionListActionsProps, 'ref'>>(partRows)

export const changeRows = propRows<Pick<DefinitionListChangeProps, 'messages' | 'ref'>>({
  messages: {
    type: "Partial<KvirnMessages['definitionList']>",
    default: '–',
    description:
      'Per-instance override of the visible text, such as { change: "Add" }. The term is still added to the accessible name.',
  },
  ref: {
    type: 'Ref<HTMLAnchorElement>',
    default: '–',
    description: 'Reaches the link.',
  },
})

export const rootAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-definition-list',
    values: 'always',
    meaning: 'The part class. The default theme styles it.',
  },
]

export const rowAttributes: readonly AttributeRow[] = [
  { name: 'kv-definition-list-row', values: 'always', meaning: 'The part class.' },
]

export const termAttributes: readonly AttributeRow[] = [
  { name: 'kv-definition-list-term', values: 'always', meaning: 'The part class.' },
  {
    name: 'id',
    values: 'generated, inside a Row',
    meaning: 'The Row gives the Term an id, which names the Change link.',
  },
]

export const valueAttributes: readonly AttributeRow[] = [
  { name: 'kv-definition-list-description', values: 'always', meaning: 'The part class.' },
]

export const actionsAttributes: readonly AttributeRow[] = [
  { name: 'kv-definition-list-actions', values: 'always', meaning: 'The part class.' },
]

export const changeAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-link',
    values: 'always',
    meaning: 'The Link class, so the link looks like every other link.',
  },
  { name: 'kv-definition-list-change', values: 'always', meaning: 'The part class.' },
  {
    name: 'aria-labelledby',
    values: 'the link’s id, then the Term’s id',
    meaning: 'Builds the name: “Change” plus the term. Without a Row it is left off.',
  },
]

export const useDefinitionListHook: ApiHook = {
  name: 'useDefinitionList',
  options: propRows<UseDefinitionListOptions>({
    messages: {
      type: "Partial<KvirnMessages['definitionList']>",
      default: '–',
      description: 'Per-instance override of the visible text of the Change link.',
    },
  }),
  result: propRows<UseDefinitionListResult>({
    rootProps: {
      type: 'DefinitionListPartProps<"definition-list">',
      default: '–',
      description: 'Spread on the <dl>: the class only.',
    },
    rowProps: {
      type: 'DefinitionListPartProps<"definition-list-row">',
      default: '–',
      description: 'Spread on the <div> of a row.',
    },
    termProps: {
      type: 'DefinitionListPartProps<"definition-list-term">',
      default: '–',
      description: 'Spread on the <dt>. Give it the id you pass to getChangeProps.',
    },
    descriptionProps: {
      type: 'DefinitionListPartProps<"definition-list-description">',
      default: '–',
      description: 'Spread on a <dd> that holds an answer.',
    },
    actionsProps: {
      type: 'DefinitionListPartProps<"definition-list-actions">',
      default: '–',
      description: 'Spread on the <dd> that holds the links.',
    },
    changeLabel: {
      type: 'string',
      default: '–',
      description: 'The text “Change”, in the language of the provider: the link’s visible text.',
    },
    getChangeProps: {
      type: '(ids: { id: string; termId: string }) => DefinitionListChangePartProps',
      default: '–',
      description:
        'The link’s class, its own id and aria-labelledby, so its name is “Change” plus the term. id is the link’s, termId the id of the row’s <dt>.',
    },
  }),
}
