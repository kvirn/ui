import type { StackProps, UseStackOptions, UseStackResult } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

export type StackDocumentedProps = Pick<StackProps, 'gap' | 'render' | 'ref'>

export const stackRows = propRows<StackDocumentedProps>({
  gap: {
    type: "'2' | '4' | '6' | '8'",
    default: "'6'",
    description:
      'The space between children, a space step in the theme. Use a smaller gap inside a group and a larger one between sections.',
  },
  render: {
    type: 'RenderProp<StackElementProps, StackState>',
    default: '–',
    description:
      'Changes the element, for example <ul /> with <li> children or <form />. Its own semantics apply: Stack adds no role. A function receives the props and the state, which is empty.',
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
    meaning: 'The part class. Your className and a render element’s own class join it.',
  },
  {
    name: 'kv-stack--gap-2',
    values: 'gap="2"',
    meaning: 'The smallest space step between children.',
  },
  { name: 'kv-stack--gap-4', values: 'gap="4"', meaning: 'A small space step between children.' },
  { name: 'kv-stack--gap-8', values: 'gap="8"', meaning: 'A large space step between children.' },
]

export const useStackHook: ApiHook = {
  name: 'useStack',
  intro:
    'Use it when you can’t use render, for example on a component of your own. It adds no role, ARIA or tabindex, and it returns the same frozen object for each gap.',
  options: propRows<UseStackOptions>({
    gap: {
      type: "'2' | '4' | '6' | '8'",
      default: "'6'",
      description: 'The space between children, as on Stack. "6" adds no modifier class.',
    },
  }),
  result: propRows<UseStackResult>({
    stackProps: {
      type: 'StackPartProps',
      default: '–',
      description:
        'Spread on your element: only a className. Join a class of your own with mergeProps.',
    },
  }),
}
