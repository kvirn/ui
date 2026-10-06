'use client'
import { createContext, useContext, useEffect } from 'react'
import type { HTMLAttributes, ReactElement, Ref } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { useSidebarLayout } from './use-sidebar-layout.ts'
import type { SidebarLayoutPartProps, UseSidebarLayoutOptions } from './use-sidebar-layout.ts'

/** What `render` receives as its second argument. A sidebar layout has no state, so it's empty. */
export type SidebarLayoutState = Record<string, never>

/** What a `render` function gets to spread: your attributes, the part's class and the ref. */
export interface SidebarLayoutElementProps extends HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement> | undefined
}

interface SidebarLayoutPartComponentProps extends HTMLAttributes<HTMLElement> {
  /** The rendered element, whichever it is: `<div>`, `<nav>`, `<aside>` or `<main>`. */
  ref?: Ref<HTMLElement> | undefined
  /**
   * Change the element: `render={<nav aria-label="I det här avsnittet" />}` or
   * `render={<main />}`. Its own semantics apply. SidebarLayout adds no role, and a landmark
   * needs a name.
   */
  render?: RenderProp<SidebarLayoutElementProps, SidebarLayoutState> | undefined
}

export interface SidebarLayoutRootProps
  extends SidebarLayoutPartComponentProps, UseSidebarLayoutOptions {}
export type SidebarLayoutSidebarProps = SidebarLayoutPartComponentProps
export type SidebarLayoutContentProps = SidebarLayoutPartComponentProps

const sidebarLayoutState: SidebarLayoutState = Object.freeze({})

// Only a marker: the parts read their classes from the hook, not from the Root.
const SidebarLayoutRootContext = createContext(false)

/**
 * Internal. One part: one element. The part's class joins a prop's and a render element's own
 * class names (mergeProps), so neither can remove it and the theme keeps styling the layout.
 */
function renderSidebarLayoutPart(
  { render, ...otherProps }: SidebarLayoutPartComponentProps,
  partProps: SidebarLayoutPartProps,
): ReactElement {
  return renderPart({
    render,
    defaultElement: 'div',
    partProps: mergeProps(otherProps, partProps),
    state: sidebarLayoutState,
  })
}

/** Internal. Warns once when a part is used outside a Root. */
function useWarnOutsideRoot(partName: 'Sidebar' | 'Content'): void {
  const isInsideRoot = useContext(SidebarLayoutRootContext)
  useEffect(() => {
    if (!isInsideRoot) {
      warnOnce(
        `sidebar-layout-${partName.toLowerCase()}-outside-root`,
        `A SidebarLayout.${partName} is outside a SidebarLayout.Root, so the theme draws no two-column layout. Put it inside SidebarLayout.Root.`,
      )
    }
  }, [isInsideRoot, partName])
}

/**
 * The layout's container: one `<div class="kv-sidebar-layout">`. Its two parts are direct
 * children, and whichever comes first in the DOM is at inline start.
 */
export function SidebarLayoutRoot({
  sidebarWidth,
  ...props
}: SidebarLayoutRootProps): ReactElement {
  return (
    <SidebarLayoutRootContext.Provider value={true}>
      {renderSidebarLayoutPart(props, useSidebarLayout({ sidebarWidth }).rootProps)}
    </SidebarLayoutRootContext.Provider>
  )
}
SidebarLayoutRoot.displayName = 'SidebarLayout.Root'

/** The side column from `64rem`, stacked in DOM order below. A `<div>`: `render={<nav aria-label />}` for navigation. */
export function SidebarLayoutSidebar(props: SidebarLayoutSidebarProps): ReactElement {
  useWarnOutsideRoot('Sidebar')
  return renderSidebarLayoutPart(props, useSidebarLayout().sidebarProps)
}
SidebarLayoutSidebar.displayName = 'SidebarLayout.Sidebar'

/** The content column. A `<div>`, never `<main>` by default: a page has one `main`. */
export function SidebarLayoutContent(props: SidebarLayoutContentProps): ReactElement {
  useWarnOutsideRoot('Content')
  return renderSidebarLayoutPart(props, useSidebarLayout().contentProps)
}
SidebarLayoutContent.displayName = 'SidebarLayout.Content'

/**
 * A side column and a content column (contract: sidebar-layout.a11y.md): stacked below `64rem`,
 * side by side from it. DOM order is the visual, reading and focus order, so write the part that
 * comes first at inline start first. Every part is one `<div>` with no role, ARIA, text or
 * behaviour, and `render` changes the element.
 *
 * @example
 * <SidebarLayout.Root sidebarWidth="sm">
 *   <SidebarLayout.Sidebar render={<nav aria-label="I det här avsnittet" />}>…</SidebarLayout.Sidebar>
 *   <SidebarLayout.Content render={<main id="main" />}>…</SidebarLayout.Content>
 * </SidebarLayout.Root>
 */
export const SidebarLayout = {
  Root: SidebarLayoutRoot,
  Sidebar: SidebarLayoutSidebar,
  Content: SidebarLayoutContent,
} as const
