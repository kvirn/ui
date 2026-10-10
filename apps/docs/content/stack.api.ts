import type { StackProps, UseStackResult } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

export type StackDocumentedProps = Pick<StackProps, 'className' | 'as' | 'ref'>

export const stackRows = propRows<StackDocumentedProps>({
  className: {
    type: 'string',
    default: '–',
    description:
      'Your own classes. They join the part’s class and never replace it, so the theme keeps styling the layout. Add a gap class: kv-stack--gap-2, kv-stack--gap-4 or kv-stack--gap-8.',
  },
  as: {
    type: "'div' | 'ul' | 'ol' | 'li' | 'section' | 'form'",
    default: "'div'",
    description:
      'Changes the element: ul or ol with li children for a list, li inside one, section with aria-labelledby for a region, or form. Stack adds no role. There is no main, nav or aside: use Container or Section.',
  },
  ref: {
    type: 'Ref<HTMLElement>',
    default: '–',
    description: 'Reaches the element, whichever it is.',
  },
})

export const stackAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-stack',
    values: 'always',
    meaning: 'The part class. Your className joins it.',
  },
  {
    name: 'kv-stack--gap-2',
    values: 'you add it',
    meaning: 'The smallest space step between children.',
  },
  {
    name: 'kv-stack--gap-4',
    values: 'you add it',
    meaning: 'A small space step between children.',
  },
  {
    name: 'kv-stack--gap-8',
    values: 'you add it',
    meaning: 'A large space step between children.',
  },
]

export const useStackHook: ApiHook = {
  name: 'useStack',
  intro:
    'Use it when you can’t use as, for example on a component of your own. It adds no role, ARIA or tabindex, and it returns the same frozen object every time.',
  result: propRows<UseStackResult>({
    stackProps: {
      type: 'StackPartProps',
      default: '–',
      description:
        'Spread on your element: only a className. Join a class of your own with mergeProps.',
    },
  }),
}
