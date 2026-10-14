import type { UseVisuallyHiddenResult, VisuallyHiddenProps } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

export type VisuallyHiddenDocumentedProps = Pick<VisuallyHiddenProps, 'as'>

export const visuallyHiddenRows = propRows<VisuallyHiddenDocumentedProps>({
  as: {
    type: "'span' | 'div' | 'p' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'",
    default: "'span'",
    description:
      'Changes the element, for example as="h2" for a hidden heading. The element’s own meaning applies. There is no h1: the page’s title is visible. In JavaScript, an element outside the list is replaced by a span and warns once in development.',
  },
})

export const visuallyHiddenAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-visually-hidden',
    values: 'always',
    meaning:
      'The part class. The default theme clips the element to a tiny box and keeps it in the page. Your className joins it.',
  },
]

export const useVisuallyHiddenHook: ApiHook = {
  name: 'useVisuallyHidden',
  intro:
    'Use it on an element of your own. It takes no options, and it adds no role, ARIA or tabindex.',
  result: propRows<UseVisuallyHiddenResult>({
    visuallyHiddenProps: {
      type: 'VisuallyHiddenPartProps',
      default: '–',
      description:
        'Spread on your element: only the className "kv-visually-hidden". Join a class of your own with mergeProps.',
    },
  }),
}
