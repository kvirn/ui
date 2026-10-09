import type { KbdProps, UseKbdResult } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

export type KbdDocumentedProps = Pick<KbdProps, 'as'>

export const kbdRows = propRows<KbdDocumentedProps>({
  as: {
    type: "'kbd' | 'samp'",
    default: "'kbd'",
    description:
      'Changes the element to samp for text a program prints. Nothing else names keyboard input.',
  },
})

export const kbdAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-kbd',
    values: 'always',
    meaning: 'The part class. A className you pass is joined with it, never replaces it.',
  },
]

const useKbdResultRows = propRows<UseKbdResult>({
  element: { type: "'kbd'", default: '–', description: 'The element: always kbd.' },
  rootProps: {
    type: 'KbdPartProps',
    default: '–',
    description: 'Spread on the element: only the class kv-kbd. No role, ARIA or state.',
  },
})

export const useKbdHook: ApiHook = {
  name: 'useKbd',
  intro: 'Takes no options.',
  result: useKbdResultRows,
}
