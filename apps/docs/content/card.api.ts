import type { CardRootProps, UseCardResult } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { AttributeRow } from '../components/api-block.tsx'

/** The same two rows for every part: a Card part takes the attributes of one `<div>` and nothing else. */
export const cardPartRows = propRows<Pick<CardRootProps, 'className' | 'render'>>({
  className: {
    type: 'string',
    default: '–',
    description:
      'Your own classes. They join the part’s class and never replace it, so the theme keeps styling the card.',
  },
  render: {
    type: 'RenderProp<CardElementProps, CardState>',
    default: '–',
    description:
      'Changes the element: <article>, <section aria-labelledby>, <aside aria-labelledby> or <li>. Its own semantics apply, and Card adds no role. A function receives the props, with a callback ref, and an empty state.',
  },
})

export const cardRootAttributes: readonly AttributeRow[] = [
  { name: 'kv-card', values: 'always', meaning: 'The part class. The default theme styles it.' },
  {
    name: 'kv-card--radius-lg | -md | -none',
    values: 'class you add',
    meaning: 'The radius. lg is the default, md suits a card inside a card.',
  },
  {
    name: 'kv-card--padding-none | -sm | -md | -lg',
    values: 'class you add',
    meaning: 'The padding of every part. md is the default.',
  },
  {
    name: 'kv-card--dividers',
    values: 'class you add',
    meaning: 'A subtle line between the parts.',
  },
]

export const cardHeaderAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-card-header',
    values: 'always',
    meaning: 'The part class. The default theme styles it.',
  },
  {
    name: 'kv-card-header--padding-none | -sm | -md | -lg',
    values: 'class you add',
    meaning: 'This part’s padding, instead of the Root’s. none is for full-bleed media.',
  },
]

export const cardBodyAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-card-body',
    values: 'always',
    meaning: 'The part class. The default theme styles it.',
  },
  {
    name: 'kv-card-body--padding-none | -sm | -md | -lg',
    values: 'class you add',
    meaning: 'This part’s padding, instead of the Root’s.',
  },
]

export const cardFooterAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-card-footer',
    values: 'always',
    meaning: 'The part class. The default theme styles it.',
  },
  {
    name: 'kv-card-footer--padding-none | -sm | -md | -lg',
    values: 'class you add',
    meaning: 'This part’s padding, instead of the Root’s.',
  },
]

export const useCardResult = propRows<UseCardResult>({
  rootProps: {
    type: "{ className: 'kv-card' }",
    default: '–',
    description: 'Spread on the Root’s element.',
  },
  headerProps: {
    type: "{ className: 'kv-card-header' }",
    default: '–',
    description: 'Spread on the Header’s element.',
  },
  bodyProps: {
    type: "{ className: 'kv-card-body' }",
    default: '–',
    description: 'Spread on the Body’s element.',
  },
  footerProps: {
    type: "{ className: 'kv-card-footer' }",
    default: '–',
    description: 'Spread on the Footer’s element.',
  },
})
