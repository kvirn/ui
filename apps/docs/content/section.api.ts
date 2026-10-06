import type { SectionRootProps, UseSectionResult } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { AttributeRow } from '../components/api-block.tsx'

export const sectionRows = propRows<Pick<SectionRootProps, 'className' | 'render'>>({
  className: {
    type: 'string',
    default: '–',
    description:
      'Your own classes. They join kv-section and never replace it, so the theme keeps styling the section.',
  },
  render: {
    type: 'RenderProp<SectionElementProps, SectionState>',
    default: '–',
    description:
      'Changes the element: <aside aria-labelledby>, <section aria-labelledby>, <nav aria-labelledby> or <li>. Its own semantics apply, and Section adds no role. A function receives the props, with a callback ref, and an empty state.',
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
