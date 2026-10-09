import type { ScrollAreaProps, UseScrollAreaOptions, UseScrollAreaResult } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

const regionRow = {
  type: "'overflow' | 'always'",
  default: "'overflow'",
  description:
    'overflow: a named region only while the content doesn’t fit. always: a named region whether it scrolls or not. It is a Tab stop only while it scrolls, in both.',
} as const

export const scrollAreaRows = propRows<Pick<ScrollAreaProps, 'region' | 'as' | 'ref'>>({
  region: regionRow,
  as: {
    type: "'div' | 'section'",
    default: "'div'",
    description:
      'Changes the element. It is a region while it scrolls either way, so section adds nothing. No landmark element and no list. A string, so it works from a Server Component.',
  },
  ref: {
    type: 'Ref<HTMLElement>',
    default: '–',
    description: 'Reaches the element, whichever it is.',
  },
})

export const scrollAreaAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-scroll-region kv-scroll-area',
    values: 'always',
    meaning: 'The part classes. The default theme sets overflow, the focus ring and the edges.',
  },
  {
    name: 'role',
    values: 'region, while it scrolls or with region="always"',
    meaning: 'Not a region when everything fits: no role, no name.',
  },
  {
    name: 'tabindex',
    values: '0, only while it overflows',
    meaning: 'Makes the area a Tab stop so a keyboard user can scroll it. Your own tabIndex wins.',
  },
  {
    name: 'data-overflowing',
    values: 'present while the content doesn’t fit',
    meaning: 'The area scrolls. It stays while the area holds focus.',
  },
  {
    name: 'aria-label | aria-labelledby',
    values: 'yours',
    meaning: 'Applied once the area is a region. A name on a plain <div> is not allowed.',
  },
]

export const useScrollAreaHook: ApiHook = {
  name: 'useScrollArea',
  options: propRows<UseScrollAreaOptions>({ region: regionRow }),
  result: propRows<UseScrollAreaResult>({
    scrollAreaProps: {
      type: 'ScrollAreaPartProps',
      default: '–',
      description:
        'Spread on the element that scrolls: the classes, role, tabIndex, data-overflowing and a ref. Name it yourself with aria-labelledby or aria-label.',
    },
    isOverflowing: {
      type: 'boolean',
      default: '–',
      description:
        'The content is wider or taller than the area. It stays true while the area holds focus.',
    },
    isRegion: {
      type: 'boolean',
      default: '–',
      description: 'The area has role="region" now: it overflows, or region is always.',
    },
    element: {
      type: 'HTMLElement | null',
      default: '–',
      description: 'The scroll element, once it is mounted.',
    },
  }),
}
