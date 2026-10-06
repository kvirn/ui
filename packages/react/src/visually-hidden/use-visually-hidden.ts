/** Spread on the element. Only the part's class: VisuallyHidden adds no role, ARIA or state. */
export interface VisuallyHiddenPartProps {
  /**
   * The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-visually-hidden`. Add a class
   * of your own next to it with `mergeProps`: class names join.
   */
  className: 'kv-visually-hidden'
}

export interface UseVisuallyHiddenResult {
  visuallyHiddenProps: VisuallyHiddenPartProps
}

// The same object every time, frozen, so nothing a consumer does can change another element.
const visuallyHidden: UseVisuallyHiddenResult = Object.freeze({
  visuallyHiddenProps: Object.freeze({ className: 'kv-visually-hidden' }),
})

/**
 * The class for your own element (contract: visually-hidden.a11y.md). The text stays in the
 * accessibility tree, so never put anything focusable in it.
 *
 * @example
 * const { visuallyHiddenProps } = useVisuallyHidden()
 * <span {...visuallyHiddenProps}>, 3 resultat</span>
 */
export function useVisuallyHidden(): UseVisuallyHiddenResult {
  return visuallyHidden
}
