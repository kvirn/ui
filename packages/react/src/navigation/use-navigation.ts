import { useMemo } from 'react'

export interface UseNavigationOptions {
  /**
   * The navigation's accessible name, from your translations: `Huvudmeny`. It becomes
   * `aria-label`. Where a visible heading names it, leave this out and put `aria-labelledby`
   * on your element instead. An empty or whitespace-only label counts as none.
   */
  label?: string | undefined
}

/** Spread on the `<nav>`. */
export interface NavigationRootPartProps {
  /**
   * The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-navigation`. Add your own
   * class next to it with `mergeProps`: class names join.
   */
  className: 'kv-navigation'
  /** From `label`. Absent when there is none. */
  'aria-label'?: string
}

/** Spread on the `<ul>`, at the top level and for every nested list. Only the part's class. */
export interface NavigationListPartProps {
  className: 'kv-navigation-list'
}

/** Spread on the `<li>`. Only the part's class. */
export interface NavigationItemPartProps {
  className: 'kv-navigation-item'
}

export interface UseNavigationResult {
  rootProps: NavigationRootPartProps
  listProps: NavigationListPartProps
  itemProps: NavigationItemPartProps
}

// The same objects every time, frozen, so nothing a consumer does can change another navigation.
const listProps: NavigationListPartProps = Object.freeze({ className: 'kv-navigation-list' })
const itemProps: NavigationItemPartProps = Object.freeze({ className: 'kv-navigation-item' })

/** An empty or whitespace-only label is no name. */
export function hasLabel(label: string | undefined): label is string {
  return label !== undefined && label.trim() !== ''
}

/**
 * A navigation's part classes and its name for your own elements (contract:
 * navigation.a11y.md). A navigation is a labelled `<nav>` landmark around a list of links, so
 * it adds no role, no state and no behaviour: the links own the keys, and `current` stays on
 * each `Link`. Nest another `<ul class="kv-navigation-list">` inside an `<li>` for a sub-list.
 *
 * @example
 * const navigation = useNavigation({ label: 'Huvudmeny' })
 * <nav {...navigation.rootProps}>
 *   <ul {...navigation.listProps}>
 *     <li {...navigation.itemProps}><a href="/start">Start</a></li>
 *   </ul>
 * </nav>
 */
export function useNavigation({ label }: UseNavigationOptions = {}): UseNavigationResult {
  const name = hasLabel(label) ? label : undefined
  const rootProps = useMemo<NavigationRootPartProps>(
    () => ({ className: 'kv-navigation', ...(name === undefined ? {} : { 'aria-label': name }) }),
    [name],
  )
  return useMemo(() => ({ rootProps, listProps, itemProps }), [rootProps])
}
