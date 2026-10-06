import type { UseVisuallyHiddenResult, VisuallyHiddenProps } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { AttributeRow } from '../components/api-block.tsx'

export type VisuallyHiddenDocumentedProps = Pick<VisuallyHiddenProps, 'render'>

export const visuallyHiddenRows = propRows<VisuallyHiddenDocumentedProps>({
  render: {
    type: 'RenderProp<VisuallyHiddenElementProps, VisuallyHiddenState>',
    default: '–',
    description:
      'Changes the element, for example render={<h2 />}. The rendered element’s own semantics apply. A function receives the props and an empty state.',
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
