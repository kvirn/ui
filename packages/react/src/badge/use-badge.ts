export type BadgeVariant = 'neutral' | 'primary' | 'info' | 'success' | 'warning' | 'danger'

/** Spread on the Badge's element. Only the part's class: Badge adds no role, ARIA or state. */
export interface BadgePartProps {
  /**
   * The part's class, for `@kvirn-ui/theme` and your own CSS: `kv-badge`, plus
   * `kv-badge--<variant>` for every variant but `neutral`. Add a class of your own next to it with
   * `mergeProps`: class names join.
   */
  className: string
}

export interface UseBadgeOptions {
  /** The role of the badge: `neutral` (default), `primary`, `info`, `success`, `warning` or `danger`. The words are yours: the colour is never the only cue. */
  variant?: BadgeVariant | undefined
}

export interface UseBadgeResult {
  /** The element: always `'span'`. */
  element: 'span'
  rootProps: BadgePartProps
}

// One frozen result per variant, so nothing a consumer does can change another badge.
const badges = Object.fromEntries(
  (['neutral', 'primary', 'info', 'success', 'warning', 'danger'] as const).map((variant) => [
    variant,
    Object.freeze({
      element: 'span',
      rootProps: Object.freeze({
        className: variant === 'neutral' ? 'kv-badge' : `kv-badge kv-badge--${variant}`,
      }),
    } satisfies UseBadgeResult),
  ]),
) as Record<BadgeVariant, UseBadgeResult>

/**
 * Badge's element and class for your own element (contract: badge.a11y.md).
 *
 * @example
 * const badge = useBadge({ variant: 'success' })
 * <span {...badge.rootProps}>Beviljad</span>
 */
export function useBadge({ variant = 'neutral' }: UseBadgeOptions = {}): UseBadgeResult {
  return badges[variant]
}
