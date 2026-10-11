export type TopBarVariant = 'primary' | 'secondary' | 'accent'

export interface UseTopBarOptions {
  /**
   * The fill. None by default: the page's colours. `primary`, `secondary` or `accent` adds
   * `kv-top-bar--<variant>`: that fill with its on-colour text, links, focus ring and current bar.
   */
  variant?: TopBarVariant | undefined
}

/** Spread on the bar's element. Only its class: TopBar adds no role, ARIA or state. */
export interface TopBarRootPartProps {
  /**
   * `.kv-top-bar`, and one modifier for a variant. Add a class of your own next to it with
   * `mergeProps`: class names join.
   */
  className: 'kv-top-bar' | `kv-top-bar kv-top-bar--${TopBarVariant}`
}

export interface UseTopBarResult {
  rootProps: TopBarRootPartProps
}

// The same objects every time, frozen, so nothing a consumer does can change another bar.
const topBarProps = {
  none: Object.freeze({ rootProps: Object.freeze({ className: 'kv-top-bar' }) }),
  primary: Object.freeze({
    rootProps: Object.freeze({ className: 'kv-top-bar kv-top-bar--primary' }),
  }),
  secondary: Object.freeze({
    rootProps: Object.freeze({ className: 'kv-top-bar kv-top-bar--secondary' }),
  }),
  accent: Object.freeze({
    rootProps: Object.freeze({ className: 'kv-top-bar kv-top-bar--accent' }),
  }),
} as const satisfies Record<TopBarVariant | 'none', UseTopBarResult>

/**
 * A top bar's class for your own element (contract: top-bar.a11y.md). It adds no role, ARIA or
 * `tabindex`: a `Navigation` inside it is the landmark.
 *
 * @example
 * const topBar = useTopBar({ variant: 'accent' })
 * <div {...topBar.rootProps}>…</div>
 */
export function useTopBar({ variant }: UseTopBarOptions = {}): UseTopBarResult {
  return topBarProps[variant ?? 'none']
}
