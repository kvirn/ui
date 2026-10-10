'use client'
import { createContext, useContext, useEffect } from 'react'
import type { HTMLAttributes, ReactElement, Ref } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { resolveAsTag } from '../render/as-prop.ts'
import type { AsTag } from '../render/as-prop.ts'
import { renderPart } from '../render/render-part.ts'
import { useSidebarLayout } from './use-sidebar-layout.ts'
import type { SidebarLayoutPartProps } from './use-sidebar-layout.ts'

const sidebarTags = ['div', 'nav', 'aside'] as const
const contentTags = ['div', 'main', 'section', 'article'] as const

interface SidebarLayoutDivProps extends HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement> | undefined
}

/** Always a `<div>`: the layout adds no role, and its parts carry the landmarks. */
export interface SidebarLayoutRootProps extends SidebarLayoutDivProps {}

/**
 * `as` is `div` (default), `nav` with a name for navigation, or `aside` with a name for related
 * content. Its own semantics apply: a landmark needs a name.
 */
export type SidebarLayoutSidebarProps = AsTag<(typeof sidebarTags)[number], 'div'>

/**
 * `as` is `div` (default), `main` (one per page), `section` with a name, or `article`. Its own
 * semantics apply.
 */
export type SidebarLayoutContentProps = AsTag<(typeof contentTags)[number], 'div'>

// Only a marker: the parts read their classes from the hook, not from the Root.
const SidebarLayoutRootContext = createContext(false)

/**
 * Internal. One part: one element. The part's class joins a prop's own class names (mergeProps),
 * so a prop can't remove it and the theme keeps styling the layout.
 */
function renderSidebarLayoutPart(
  props: SidebarLayoutDivProps,
  partProps: SidebarLayoutPartProps,
  as?: (typeof sidebarTags)[number] | (typeof contentTags)[number],
): ReactElement {
  return renderPart({
    as,
    defaultElement: 'div',
    partProps: mergeProps(props, partProps),
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
export function SidebarLayoutRoot(props: SidebarLayoutRootProps): ReactElement {
  return (
    <SidebarLayoutRootContext.Provider value={true}>
      {renderSidebarLayoutPart(props, useSidebarLayout().rootProps)}
    </SidebarLayoutRootContext.Provider>
  )
}
SidebarLayoutRoot.displayName = 'SidebarLayout.Root'

/** The side column from `64rem`, stacked in DOM order below. A `<div>`: `as="nav"` with `aria-label` for navigation. */
export function SidebarLayoutSidebar({ as, ...props }: SidebarLayoutSidebarProps): ReactElement {
  useWarnOutsideRoot('Sidebar')
  return renderSidebarLayoutPart(
    props,
    useSidebarLayout().sidebarProps,
    resolveAsTag({ part: 'SidebarLayout.Sidebar', as, allowedTags: sidebarTags }),
  )
}
SidebarLayoutSidebar.displayName = 'SidebarLayout.Sidebar'

/** The content column. A `<div>`, never `<main>` by default: a page has one `main`. */
export function SidebarLayoutContent({ as, ...props }: SidebarLayoutContentProps): ReactElement {
  useWarnOutsideRoot('Content')
  return renderSidebarLayoutPart(
    props,
    useSidebarLayout().contentProps,
    resolveAsTag({ part: 'SidebarLayout.Content', as, allowedTags: contentTags }),
  )
}
SidebarLayoutContent.displayName = 'SidebarLayout.Content'

/**
 * A side column and a content column (contract: sidebar-layout.a11y.md): stacked below `64rem`,
 * side by side from it. DOM order is the visual, reading and focus order, so write the part that
 * comes first at inline start first. Every part is one `<div>` with no role, ARIA, text or
 * behaviour, and the Sidebar and Content take `as`.
 *
 * @example
 * <SidebarLayout.Root className="kv-sidebar-layout--sidebar-sm">
 *   <SidebarLayout.Sidebar as="nav" aria-label="I det här avsnittet">…</SidebarLayout.Sidebar>
 *   <SidebarLayout.Content as="main" id="main">…</SidebarLayout.Content>
 * </SidebarLayout.Root>
 */
export const SidebarLayout = {
  Root: SidebarLayoutRoot,
  Sidebar: SidebarLayoutSidebar,
  Content: SidebarLayoutContent,
} as const
