import type { SectionRootProps, UseSectionResult } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { AttributeRow } from '../components/api-block.tsx'

export const sectionRows = propRows<Pick<SectionRootProps, 'className' | 'as'>>({
  className: {
    type: 'string',
    default: '–',
    description:
      'Your own classes. They join kv-section and never replace it, so the theme keeps styling the section.',
  },
  as: {
    type: "'div' | 'section' | 'aside' | 'nav' | 'footer' | 'header' | 'article' | 'li'",
    default: "'div'",
    description:
      'Changes the element: aside, section or nav with aria-labelledby, header or footer, article, or li in a list of sections. Section adds no role. Another tag warns once in development.',
  },
})

export const sectionAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-section',
    values: 'always',
    meaning: 'The part class. The default theme styles it.',
  },
  {
    name: 'kv-section--surface | kv-section--canvas',
    values: 'class you add',
    meaning: 'The background: surface (the default) or canvas, which looks like the page again.',
  },
  {
    name: 'kv-section--padding-none | -sm | -md | -lg',
    values: 'class you add',
    meaning:
      'The padding. md is the default. none is for a frame whose children pad themselves, and for media.',
  },
]

export const useSectionResult = propRows<UseSectionResult>({
  rootProps: {
    type: "{ className: 'kv-section' }",
    default: '–',
    description: 'Spread on your element.',
  },
})
