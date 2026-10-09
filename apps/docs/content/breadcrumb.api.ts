import type {
  BreadcrumbRootProps,
  UseBreadcrumbOptions,
  UseBreadcrumbResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

export const breadcrumbRootRows = propRows<Pick<BreadcrumbRootProps, 'label' | 'messages'>>({
  label: {
    type: 'string',
    default: 'the message breadcrumb.label',
    description:
      'The accessible name, from your translations. Set as aria-label. An empty or whitespace-only label counts as none. Where a visible heading names the trail, pass aria-labelledby instead.',
  },
  messages: {
    type: "Partial<KvirnMessages['breadcrumb']>",
    default: '–',
    description: 'Overrides breadcrumb.label for this trail.',
  },
})

export const breadcrumbRootAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-breadcrumb',
    values: 'always',
    meaning: 'The part class. The default theme styles it.',
  },
  {
    name: 'aria-label',
    values: 'the label, or absent',
    meaning: 'From label or the message. Not set when you pass aria-labelledby.',
  },
]

export const breadcrumbListAttributes: readonly AttributeRow[] = [
  { name: 'kv-breadcrumb-list', values: 'always', meaning: 'The part class.' },
]

export const breadcrumbItemAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-breadcrumb-item',
    values: 'always',
    meaning:
      'The part class. The default theme draws the separator before every item but the first.',
  },
]

export const breadcrumbLinkAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-breadcrumb-link',
    values: 'always',
    meaning: 'The part class, next to kv-link.',
  },
]

export const breadcrumbCurrentAttributes: readonly AttributeRow[] = [
  { name: 'kv-breadcrumb-current', values: 'always', meaning: 'The part class.' },
  {
    name: 'aria-current',
    values: '"page"',
    meaning: 'Always set. Mark no other item in the trail.',
  },
]

export const useBreadcrumbHook: ApiHook = {
  name: 'useBreadcrumb',
  options: propRows<UseBreadcrumbOptions>({
    label: {
      type: 'string',
      default: 'the message breadcrumb.label',
      description: 'The accessible name, set as aria-label. An empty label counts as none.',
    },
    messages: {
      type: "Partial<KvirnMessages['breadcrumb']>",
      default: '–',
      description: 'Per-instance message overrides: { label: "Du är här" }.',
    },
  }),
  result: propRows<UseBreadcrumbResult>({
    rootProps: {
      type: 'BreadcrumbRootPartProps',
      default: '–',
      description: 'Spread on the <nav>: the class and aria-label.',
    },
    listProps: {
      type: 'BreadcrumbListPartProps',
      default: '–',
      description: 'Spread on the <ol>: the class.',
    },
    itemProps: {
      type: 'BreadcrumbItemPartProps',
      default: '–',
      description: 'Spread on every <li>: the class.',
    },
    currentProps: {
      type: 'BreadcrumbCurrentPartProps',
      default: '–',
      description: 'Spread on the current page’s <span>: the class and aria-current="page".',
    },
    label: {
      type: 'string',
      default: '–',
      description: 'The resolved name of the landmark.',
    },
  }),
}
