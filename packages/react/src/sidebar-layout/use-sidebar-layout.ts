/** Spread on one part's element. Only the part's class: SidebarLayout adds no role, ARIA or state. */
export interface SidebarLayoutPartProps<
  ClassName extends string =
    | 'kv-sidebar-layout'
    | 'kv-sidebar-layout-sidebar'
    | 'kv-sidebar-layout-content',
> {
  /**
   * The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-sidebar-layout`,
   * `.kv-sidebar-layout-sidebar`. Add a class of your own next to it with `mergeProps`: class
   * names join. `kv-sidebar-layout--sidebar-sm` narrows the sidebar.
   */
  className: ClassName
}

export interface UseSidebarLayoutResult {
  rootProps: SidebarLayoutPartProps<'kv-sidebar-layout'>
  sidebarProps: SidebarLayoutPartProps<'kv-sidebar-layout-sidebar'>
  contentProps: SidebarLayoutPartProps<'kv-sidebar-layout-content'>
}

// The same object every time, frozen, so nothing a consumer does can change another layout.
const result: UseSidebarLayoutResult = Object.freeze({
  rootProps: Object.freeze({ className: 'kv-sidebar-layout' }),
  sidebarProps: Object.freeze({ className: 'kv-sidebar-layout-sidebar' }),
  contentProps: Object.freeze({ className: 'kv-sidebar-layout-content' }),
})

/**
 * A sidebar layout's part classes for your own elements (contract: sidebar-layout.a11y.md). It
 * adds no role, ARIA or `tabindex`: the side follows DOM order, and `<main>` and `<nav>` are
 * yours to choose.
 *
 * @example
 * const layout = useSidebarLayout()
 * <div {...layout.rootProps}>
 *   <nav {...layout.sidebarProps} aria-label="I det här avsnittet">…</nav>
 *   <div {...layout.contentProps}>…</div>
 * </div>
 */
export function useSidebarLayout(): UseSidebarLayoutResult {
  return result
}
