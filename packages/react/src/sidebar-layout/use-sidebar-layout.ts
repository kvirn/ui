export type SidebarLayoutSidebarWidth = 'sm' | 'md'

export interface UseSidebarLayoutOptions {
  /** The sidebar track from `64rem`: `'sm'` 16rem or `'md'` 20rem (default). */
  sidebarWidth?: SidebarLayoutSidebarWidth | undefined
}

/** Spread on one part's element. Only the part's class: SidebarLayout adds no role, ARIA or state. */
export interface SidebarLayoutPartProps<
  ClassName extends string =
    | 'kv-sidebar-layout'
    | 'kv-sidebar-layout kv-sidebar-layout--sidebar-sm'
    | 'kv-sidebar-layout-sidebar'
    | 'kv-sidebar-layout-content',
> {
  /**
   * The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-sidebar-layout`,
   * `.kv-sidebar-layout-sidebar`. Add a class of your own next to it with `mergeProps`: class
   * names join.
   */
  className: ClassName
}

export interface UseSidebarLayoutResult {
  rootProps: SidebarLayoutPartProps<
    'kv-sidebar-layout' | 'kv-sidebar-layout kv-sidebar-layout--sidebar-sm'
  >
  sidebarProps: SidebarLayoutPartProps<'kv-sidebar-layout-sidebar'>
  contentProps: SidebarLayoutPartProps<'kv-sidebar-layout-content'>
}

const sidebarProps = Object.freeze({ className: 'kv-sidebar-layout-sidebar' } as const)
const contentProps = Object.freeze({ className: 'kv-sidebar-layout-content' } as const)

// The same objects every time, frozen, so nothing a consumer does can change another layout.
const sidebarLayoutProps: Record<SidebarLayoutSidebarWidth, UseSidebarLayoutResult> = {
  sm: Object.freeze({
    rootProps: Object.freeze({ className: 'kv-sidebar-layout kv-sidebar-layout--sidebar-sm' }),
    sidebarProps,
    contentProps,
  }),
  md: Object.freeze({
    rootProps: Object.freeze({ className: 'kv-sidebar-layout' }),
    sidebarProps,
    contentProps,
  }),
}

/**
 * A sidebar layout's part classes for your own elements (contract: sidebar-layout.a11y.md). It
 * adds no role, ARIA or `tabindex`: the side follows DOM order, and `<main>` and `<nav>` are
 * yours to choose.
 *
 * @example
 * const layout = useSidebarLayout({ sidebarWidth: 'sm' })
 * <div {...layout.rootProps}>
 *   <nav {...layout.sidebarProps} aria-label="I det här avsnittet">…</nav>
 *   <div {...layout.contentProps}>…</div>
 * </div>
 */
export function useSidebarLayout({
  sidebarWidth = 'md',
}: UseSidebarLayoutOptions = {}): UseSidebarLayoutResult {
  return sidebarLayoutProps[sidebarWidth]
}
