import type { BadgeProps, UseBadgeOptions, UseBadgeResult } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

export type BadgeDocumentedProps = Pick<BadgeProps, 'variant' | 'render'>

export const badgeRows = propRows<BadgeDocumentedProps>({
  variant: {
    type: "'neutral' | 'primary' | 'info' | 'success' | 'warning' | 'danger'",
    default: "'neutral'",
    description:
      'The role of the badge, which gives it a class the theme colours. The words are yours: the colour is never the only cue.',
  },
  render: {
    type: 'RenderProp<BadgeElementProps, BadgeState>',
    default: '–',
    description:
      'Changes the element, for example <strong />, and its own semantics apply. A function receives the props to spread and { variant }.',
  },
})

export const badgeAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-badge',
    values: 'always',
    meaning: 'The part class. The default theme draws a pill.',
  },
  {
    name: 'kv-badge--primary, --info, --success, --warning, --danger',
    values: 'from variant',
    meaning: 'Added for every variant but neutral. Theme variants.',
  },
]

export const useBadgeHook: ApiHook = {
  name: 'useBadge',
  options: propRows<UseBadgeOptions>({
    variant: {
      type: "'neutral' | 'primary' | 'info' | 'success' | 'warning' | 'danger'",
      default: "'neutral'",
      description: 'The role of the badge.',
    },
  }),
  result: propRows<UseBadgeResult>({
    element: { type: "'span'", default: '–', description: 'The element to render: always a span.' },
    rootProps: {
      type: 'BadgePartProps',
      default: '–',
      description: 'Spread on the element: the class kv-badge, plus kv-badge--variant.',
    },
  }),
}
