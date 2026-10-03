/** Spread on the Section's element. Only the part's class: Section adds no role, ARIA or state. */
export interface SectionPartProps {
  /**
   * The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-section`. Add a modifier class
   * of your own next to it with `mergeProps`: class names join.
   */
  className: 'kv-section'
}

export interface UseSectionResult {
  rootProps: SectionPartProps
}

// The same object every time, frozen, so nothing a consumer does can change another section.
const sectionProps: UseSectionResult = Object.freeze({
  rootProps: Object.freeze({ className: 'kv-section' }),
})

/**
 * A section's class for your own element (contract: section.a11y.md). A section is a plain
 * container for a region of the page: pick the element (`<aside aria-labelledby>`,
 * `<section aria-labelledby>`, `<nav aria-labelledby>`, `<li>`) and the heading level yourself.
 * A landmark needs a name.
 *
 * @example
 * const section = useSection()
 * <nav {...section.rootProps} aria-label="Ärenden">…</nav>
 */
export function useSection(): UseSectionResult {
  return sectionProps
}
