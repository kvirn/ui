import type {
  SidebarLayoutRootProps,
  SidebarLayoutSidebarProps,
  UseSidebarLayoutOptions,
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
export const sidebarLayoutPartRows = propRows<
  Pick<SidebarLayoutSidebarProps, 'className' | 'render'>
>({
  className: classNameRow,
  render: {
    type: 'RenderProp<SidebarLayoutElementProps, SidebarLayoutState>',
    default: '–',
    description:
      'Changes the element: <nav aria-label>, <aside aria-labelledby>, <section aria-labelledby> or <main>. Its own semantics apply, and SidebarLayout adds no role. A function receives the props, with a callback ref, and an empty state.',
  },
})

export const sidebarLayoutRootRows = propRows<
  Pick<SidebarLayoutRootProps, 'sidebarWidth' | 'className' | 'render'>
>({
  sidebarWidth: {
    type: "'sm' | 'md'",
    default: "'md'",
    description:
      'The width of the side column from 64rem: sm is 16rem, md 20rem. Below 64rem the parts are stacked in DOM order.',
  },
  ...sidebarLayoutPartRows,
})

export const sidebarLayoutRootAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-sidebar-layout',
    values: 'always',
    meaning: 'The part class. The default theme styles it.',
  },
  {
    name: 'kv-sidebar-layout--sidebar-sm',
    values: 'added by sidebarWidth',
    meaning: 'The narrower side column. md, the default, adds no class.',
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
  options: propRows<UseSidebarLayoutOptions>({
    sidebarWidth: {
      type: "'sm' | 'md'",
      default: "'md'",
      description: 'The width of the side column from 64rem.',
    },
  }),
  result: propRows<UseSidebarLayoutResult>({
    rootProps: {
      type: 'SidebarLayoutPartProps',
      default: '–',
      description: 'Spread on the layout’s element: only className, with the width’s modifier.',
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
