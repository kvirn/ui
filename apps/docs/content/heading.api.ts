import type { HeadingProps, UseHeadingOptions, UseHeadingResult } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

const sizeType =
  "'display' | 'heading-1' | 'heading-2' | 'heading-3' | 'heading-4' | 'heading-5' | 'heading-6'"

export const headingRows = propRows<Pick<HeadingProps, 'level' | 'size' | 'render'>>({
  level: {
    type: '1 | 2 | 3 | 4 | 5 | 6',
    description:
      'The level the page’s outline needs. It decides the element: 2 renders <h2>. Heading can’t know where it sits, so it is required.',
  },
  size: {
    type: sizeType,
    default: 'the level’s own',
    description:
      'The look, apart from the level. level 4 looks like heading-4 unless you say otherwise. It never changes the element.',
  },
  render: {
    type: 'RenderProp<HeadingElementProps, HeadingState>',
    default: '–',
    description:
      'Changes the element. An element that isn’t a heading loses the heading role: give it role="heading" and aria-level. A function receives the props and { level, size }.',
  },
})

export const headingAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-heading',
    values: 'always',
    meaning: 'The part class. The default theme sets the heading colour and font.',
  },
  {
    name: 'kv-heading--display | kv-heading--heading-1 … kv-heading--heading-6',
    values: 'always, one of them',
    meaning: 'The look: the size you give, or the one of the level’s own number.',
  },
]

export const useHeadingHook: ApiHook = {
  name: 'useHeading',
  options: propRows<UseHeadingOptions>({
    level: {
      type: '1 | 2 | 3 | 4 | 5 | 6',
      description: 'The level, which the element follows.',
    },
    size: {
      type: sizeType,
      default: 'the level’s own',
      description: 'The look, when it isn’t the level’s.',
    },
  }),
  result: propRows<UseHeadingResult>({
    element: {
      type: "'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'",
      default: '–',
      description: 'The element for the level: "h2" for 2.',
    },
    size: {
      type: sizeType,
      default: '–',
      description: 'The size that applies: the one given, or the level’s own.',
    },
    rootProps: {
      type: '{ className: string }',
      default: '–',
      description: 'Spread on your heading element: kv-heading and the size class.',
    },
  }),
}
