import type {
  NavigationItemProps,
  NavigationLabelProps,
  NavigationListProps,
  NavigationRootProps,
  UseNavigationOptions,
  UseNavigationResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

export const navigationRootRows = propRows<Pick<NavigationRootProps, 'label' | 'render'>>({
  label: {
    type: 'string',
    default: '–',
    description:
      'The accessible name, from your translations. Set as aria-label. Where a visible heading names it, leave it out and pass aria-labelledby instead.',
  },
  render: {
    type: 'RenderProp<NavigationElementProps, NavigationState>',
    default: '–',
    description: 'Changes the element, which must stay a <nav> or have role="navigation".',
  },
})

export const navigationRootAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-navigation',
    values: 'always',
    meaning: 'The part class. The default theme styles it.',
  },
  {
    name: 'kv-navigation--horizontal',
    values: 'class you add',
    meaning: 'The top level as a row that wraps. A look only: the keys and roles don’t change.',
  },
  {
    name: 'aria-label',
    values: 'the label, or absent',
    meaning: 'From label. Not set when you pass aria-labelledby.',
  },
]

export const navigationListRows = propRows<Pick<NavigationListProps, 'render'>>({
  render: {
    type: 'RenderProp<NavigationElementProps, NavigationState>',
    default: '–',
    description: 'Changes the element. Its own semantics apply.',
  },
})

export const navigationListAttributes: readonly AttributeRow[] = [
  { name: 'kv-navigation-list', values: 'always', meaning: 'The part class.' },
  {
    name: 'hidden',
    values: 'present or absent',
    meaning:
      'Yours. A group you collapse is rendered with hidden: its links leave the Tab order and the accessibility tree.',
  },
]

export const navigationItemRows = propRows<Pick<NavigationItemProps, 'render'>>({
  render: {
    type: 'RenderProp<NavigationElementProps, NavigationState>',
    default: '–',
    description: 'Changes the element. Its own semantics apply.',
  },
})

export const navigationItemAttributes: readonly AttributeRow[] = [
  { name: 'kv-navigation-item', values: 'always', meaning: 'The part class.' },
]

export const navigationLabelRows = propRows<Pick<NavigationLabelProps, 'render'>>({
  render: {
    type: 'RenderProp<NavigationElementProps, NavigationState>',
    default: '–',
    description: 'Changes the element. It stays plain text: give it no role and no tabindex.',
  },
})

export const navigationLabelAttributes: readonly AttributeRow[] = [
  { name: 'kv-navigation-label', values: 'always', meaning: 'The part class.' },
  {
    name: 'id',
    values: 'generated, or yours',
    meaning:
      'What the nested Navigation.List points at with aria-labelledby. The list gets it when it has no aria-label or aria-labelledby of its own, and only after the page hydrates.',
  },
]

export const useNavigationHook: ApiHook = {
  name: 'useNavigation',
  options: propRows<UseNavigationOptions>({
    label: {
      type: 'string',
      default: '–',
      description: 'The accessible name, set as aria-label. An empty label counts as none.',
    },
  }),
  result: propRows<UseNavigationResult>({
    rootProps: {
      type: 'NavigationRootPartProps',
      default: '–',
      description: 'Spread on the <nav>: the class and aria-label.',
    },
    listProps: {
      type: 'NavigationListPartProps',
      default: '–',
      description: 'Spread on every <ul>, nested ones too: the class.',
    },
    itemProps: {
      type: 'NavigationItemPartProps',
      default: '–',
      description: 'Spread on every <li>: the class.',
    },
    labelProps: {
      type: 'NavigationLabelPartProps',
      default: '–',
      description:
        'Spread on your own group label: the class. Give the label an id and point your list’s aria-labelledby at it yourself.',
    },
  }),
}
