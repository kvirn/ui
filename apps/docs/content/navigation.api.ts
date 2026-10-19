import type {
  NavigationLabelProps,
  NavigationListProps,
  NavigationRootProps,
  UseNavigationOptions,
  UseNavigationResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

export const navigationRootRows = propRows<Pick<NavigationRootProps, 'label'>>({
  label: {
    type: 'string',
    default: '–',
    description:
      'The accessible name, from your translations. Set as aria-label. Where a visible heading names it, leave it out and pass aria-labelledby instead.',
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

export const navigationListRows = propRows<Pick<NavigationListProps, 'as'>>({
  as: {
    type: "'ul' | 'ol'",
    default: "'ul'",
    description:
      'Changes the element. Use ol when the order is the meaning. Another tag warns once in development and falls back to ul.',
  },
})

export const navigationLabelRows = propRows<Pick<NavigationLabelProps, 'as'>>({
  as: {
    type: "'span' | 'p'",
    default: "'span'",
    description:
      'Changes the element. It stays a name, never a heading. Another tag warns once in development and falls back to span.',
  },
})

export const navigationListAttributes: readonly AttributeRow[] = [
  { name: 'kv-navigation-list', values: 'always', meaning: 'The part class.' },
  {
    name: 'role',
    values: '"list"',
    meaning:
      'Always set. Safari with VoiceOver drops the list role from a list without markers, so it is written out.',
  },
  {
    name: 'aria-labelledby',
    values: 'the id of a Navigation.Label, or yours',
    meaning:
      'Set from the Navigation.Label in the same item, unless you pass aria-label or aria-labelledby yourself.',
  },
  {
    name: 'hidden',
    values: 'present or absent',
    meaning:
      'Yours. A group you collapse is rendered with hidden: its links leave the Tab order and the accessibility tree.',
  },
]

export const navigationItemAttributes: readonly AttributeRow[] = [
  { name: 'kv-navigation-item', values: 'always', meaning: 'The part class.' },
]

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
