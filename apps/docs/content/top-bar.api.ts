import type { TopBarProps, UseTopBarOptions, UseTopBarResult } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

export const topBarRows = propRows<Pick<TopBarProps, 'variant'>>({
  variant: {
    type: "'primary' | 'secondary' | 'accent'",
    default: 'none',
    description:
      'The fill. None adds no class and no fill: the page’s colours. primary, secondary or accent adds kv-top-bar--<variant>: a full-width fill with its on-colour text, links, focus ring and current navigation bar.',
  },
})

export const topBarAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-top-bar',
    values: 'always',
    meaning:
      'The part class. The default theme lays out the two sides and wraps them onto their own rows when there is no room, as at 320 pixels wide.',
  },
  {
    name: 'kv-top-bar--primary',
    values: 'variant="primary"',
    meaning: 'The primary fill with its on-colour. The default adds no class.',
  },
  {
    name: 'kv-top-bar--secondary',
    values: 'variant="secondary"',
    meaning: 'The secondary fill with its on-colour.',
  },
  {
    name: 'kv-top-bar--accent',
    values: 'variant="accent"',
    meaning: 'The accent fill with its on-colour.',
  },
]

export const useTopBarHook: ApiHook = {
  name: 'useTopBar',
  options: propRows<UseTopBarOptions>({
    variant: {
      type: "'primary' | 'secondary' | 'accent'",
      default: 'none',
      description: 'The fill. Adds kv-top-bar--<variant> to topBarProps.className.',
    },
  }),
  result: propRows<UseTopBarResult>({
    topBarProps: {
      type: 'TopBarPartProps',
      default: '–',
      description:
        'Spread on your element: only the class. It adds no role, ARIA or tabindex, and the same frozen object comes back every time.',
    },
  }),
}
