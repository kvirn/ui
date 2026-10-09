import type { HeadingProps, UseHeadingOptions, UseHeadingResult } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

const sizeType =
  "'display' | 'heading-1' | 'heading-2' | 'heading-3' | 'heading-4' | 'heading-5' | 'heading-6'"

export const headingRows = propRows<Pick<HeadingProps, 'as' | 'size'>>({
  as: {
    type: "'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'",
    description:
      'The element, and so the level the page’s outline needs: as="h2" renders an <h2>. Heading can’t know where it sits, so it is required. A string, so it works from a Server Component. For a legend or another element, use useHeading with your own element.',
  },
  size: {
    type: sizeType,
    default: 'the element’s own level',
    description:
      'The look, apart from the level. as="h4" looks like heading-4 unless you say otherwise. It never changes the element.',
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
      default: 'the element’s own level',
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
