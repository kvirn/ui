import type { UseVisuallyHiddenResult, VisuallyHiddenProps } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { AttributeRow } from '../components/api-block.tsx'

export type VisuallyHiddenDocumentedProps = Pick<VisuallyHiddenProps, 'as'>

export const visuallyHiddenRows = propRows<VisuallyHiddenDocumentedProps>({
  as: {
    type: "'span' | 'div' | 'p' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'",
    default: "'span'",
    description:
      'Changes the element, for example as="h2" for a hidden heading. The element’s own semantics apply. There is no h1: the page’s title is visible.',
  },
})

export const visuallyHiddenAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-visually-hidden',
    values: 'always',
    meaning: 'The part class. The default theme clips the element and keeps it in the page.',
  },
]

export const useVisuallyHiddenRows = propRows<UseVisuallyHiddenResult>({
  visuallyHiddenProps: {
    type: 'VisuallyHiddenPartProps',
    default: '–',
    description:
      'Spread on your own element: only className "kv-visually-hidden". Join your own class with mergeProps.',
  },
})
