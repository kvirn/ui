/** Spread on one part's element. Only the part's class: Card adds no role, ARIA or state. */
export interface CardPartProps<
  Name extends 'card' | 'card-header' | 'card-body' | 'card-footer' =
    | 'card'
    | 'card-header'
    | 'card-body'
    | 'card-footer',
> {
  /**
   * The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-card`, `.kv-card-body`. Add
   * a modifier class of your own next to it with `mergeProps`: class names join.
   */
  className: `kv-${Name}`
}

export interface UseCardResult {
  rootProps: CardPartProps<'card'>
  headerProps: CardPartProps<'card-header'>
  bodyProps: CardPartProps<'card-body'>
  footerProps: CardPartProps<'card-footer'>
}

// The same objects every time, frozen, so nothing a consumer does can change another card.
const cardProps: UseCardResult = Object.freeze({
  rootProps: Object.freeze({ className: 'kv-card' }),
  headerProps: Object.freeze({ className: 'kv-card-header' }),
  bodyProps: Object.freeze({ className: 'kv-card-body' }),
  footerProps: Object.freeze({ className: 'kv-card-footer' }),
})

/**
 * A card's part classes for your own elements (contract: card.a11y.md). A card is a
 * plain container: pick the element (`<section aria-labelledby>`, `<article>`, `<li>`) and the
 * heading level yourself. Header and Footer are never `<header>` or `<footer>`.
 *
 * @example
 * const card = useCard()
 * <section {...card.rootProps} aria-labelledby={headingId}>
 *   <div {...card.bodyProps}>
 *     <h2 id={headingId}>Kontakta oss</h2>
 *   </div>
 * </section>
 */
export function useCard(): UseCardResult {
  return cardProps
}
