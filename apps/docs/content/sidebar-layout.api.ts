import type {
  SidebarLayoutRootProps,
  SidebarLayoutSidebarProps,
  UseSidebarLayoutResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

const classNameRow = {
  type: 'string',
  default: '–',
  description:
    'Your own classes. They join the part’s class and never replace it, so the theme keeps styling the layout.',
}

/** The same two rows for the Sidebar and the Content: they take the attributes of one element and nothing else. */
export const sidebarLayoutPartRows = propRows<Pick<SidebarLayoutSidebarProps, 'className' | 'as'>>({
  className: classNameRow,
  as: {
    type: "Sidebar: 'div' | 'nav' | 'aside'. Content: 'div' | 'main' | 'section' | 'article'",
    default: "'div'",
    description:
      'Changes the element: nav or aside with a name on the Sidebar, main, section with a name or article on the Content. SidebarLayout adds no role. Root takes no as.',
  },
})

export const sidebarLayoutRootRows = propRows<Pick<SidebarLayoutRootProps, 'className'>>({
  className: {
    ...classNameRow,
    description: `${classNameRow.description} Add kv-sidebar-layout--sidebar-sm for a 16rem side column from 64rem. The default is 20rem, and below 64rem the parts are stacked in DOM order.`,
  },
})

export const sidebarLayoutRootAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-sidebar-layout',
    values: 'always',
    meaning: 'The part class. The default theme styles it.',
  },
  {
    name: 'kv-sidebar-layout--sidebar-sm',
    values: 'you add it',
    meaning: 'The narrower side column, 16rem. The default is 20rem.',
  },
]

export const sidebarLayoutSidebarAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-sidebar-layout-sidebar',
    values: 'always',
    meaning: 'The part class. The default theme styles it.',
  },
]

export const sidebarLayoutContentAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-sidebar-layout-content',
    values: 'always',
    meaning: 'The part class. The default theme styles it.',
  },
]

export const useSidebarLayoutHook: ApiHook = {
  name: 'useSidebarLayout',
  intro: 'Gives the classes for your own elements. They add no role, ARIA or tabindex.',
  result: propRows<UseSidebarLayoutResult>({
    rootProps: {
      type: 'SidebarLayoutPartProps',
      default: '–',
      description: 'Spread on the layout’s element: only className.',
    },
    sidebarProps: {
      type: 'SidebarLayoutPartProps',
      default: '–',
      description: 'Spread on the side column’s element: only className.',
    },
    contentProps: {
      type: 'SidebarLayoutPartProps',
      default: '–',
      description: 'Spread on the content column’s element: only className.',
    },
  }),
}
