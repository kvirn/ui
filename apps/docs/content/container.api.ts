import type { ContainerProps, UseContainerOptions, UseContainerResult } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

export type ContainerDocumentedProps = Pick<ContainerProps, 'size' | 'as' | 'ref'>

export const containerRows = propRows<ContainerDocumentedProps>({
  size: {
    type: "'page' | 'reading' | 'form'",
    default: "'page'",
    description:
      'The measure. "page" is centred, at most 80rem wide, with inline padding. "reading" (45rem) and "form" (40rem) are start-aligned and add no padding.',
  },
  as: {
    type: "'div' | 'main' | 'section' | 'article'",
    default: "'div'",
    description:
      'Changes the element: main (one per page), section with a name, or article. Container adds no role of its own: the element’s meaning applies. In JavaScript, an element outside the list is replaced by a div and warns once in development.',
  },
  ref: {
    type: 'Ref<HTMLElement>',
    default: '–',
    description: 'Reaches the element, whichever it is.',
  },
})

export const containerAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-container',
    values: 'always',
    meaning: 'The part class. The default theme styles it. Your className joins it.',
  },
  {
    name: 'kv-container--reading',
    values: 'size="reading"',
    meaning: 'A 45rem measure for prose.',
  },
  {
    name: 'kv-container--form',
    values: 'size="form"',
    meaning: 'A 40rem measure for one form.',
  },
]

export const useContainerHook: ApiHook = {
  name: 'useContainer',
  intro:
    'Use it to give an element or component of your own the container classes. It adds no role, ARIA or tabindex, and it returns the same frozen object for each size.',
  options: propRows<UseContainerOptions>({
    size: {
      type: "'page' | 'reading' | 'form'",
      default: "'page'",
      description: 'The measure, as on Container.',
    },
  }),
  result: propRows<UseContainerResult>({
    containerProps: {
      type: 'ContainerPartProps',
      default: '–',
      description:
        'Spread on your element: only a className. Join a class of your own with mergeProps.',
    },
  }),
}
