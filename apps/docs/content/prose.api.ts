import type { ProseRootProps, UseProseResult } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { AttributeRow } from '../components/api-block.tsx'

export type ProseDocumentedProps = Pick<ProseRootProps, 'as' | 'ref'>

export const proseRows = propRows<ProseDocumentedProps>({
  as: {
    type: "'div' | 'article' | 'section'",
    default: "'div'",
    description:
      'Changes the element: article for a self-contained piece, or section with aria-labelledby for a named region. Prose adds no role.',
  },
  ref: {
    type: 'Ref<HTMLElement>',
    default: '–',
    description: 'Reaches the element, whichever it is.',
  },
})

export const proseAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-prose',
    values: 'always',
    meaning: 'The part class. Your className joins it.',
  },
  {
    name: 'kv-prose--small',
    values: 'class you add',
    meaning: '14px text. Only for notes and metadata, never for essential content. Theme option.',
  },
  {
    name: 'kv-prose--large',
    values: 'class you add',
    meaning: '18px text for long resident-facing reading. Theme option.',
  },
  {
    name: 'kv-prose--xl',
    values: 'class you add',
    meaning: '20px text, 18px below 40rem. Theme option.',
  },
  {
    name: 'kv-prose--2xl',
    values: 'class you add',
    meaning: '24px text, 18px below 40rem. Theme option.',
  },
  {
    name: 'kv-prose--full',
    values: 'class you add',
    meaning: 'Removes the 70ch line length. Theme option.',
  },
  {
    name: 'id',
    values: 'generated, in a Field or Fieldset only',
    meaning: 'The description’s id, which the control or group lists in aria-describedby.',
  },
  {
    name: 'data-invalid',
    values: 'present or absent, in a Field or Fieldset only',
    meaning: 'The host is invalid.',
  },
  {
    name: 'data-disabled',
    values: 'present or absent, in a Field or Fieldset only',
    meaning: 'The host is disabled.',
  },
]

export const useProseResultRows = propRows<UseProseResult>({
  rootProps: {
    type: 'ProsePartProps',
    default: '–',
    description: 'Spread on your element. It is only the class: { className: "kv-prose" }.',
  },
})
