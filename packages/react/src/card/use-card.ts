/** Spread on one part's element. Only the stable part name: Card adds no role, ARIA or state. */
export interface CardPartProps<
  Name extends 'card' | 'card-header' | 'card-body' | 'card-footer' =
    | 'card'
    | 'card-header'
    | 'card-body'
    | 'card-footer',
> {
  /** For `@kvirn-ui/theme` and your own CSS: `[data-kv='card']`, `[data-kv='card-body']`. */
  'data-kv': Name
}

export interface UseCardResult {
  rootProps: CardPartProps<'card'>
  headerProps: CardPartProps<'card-header'>
  bodyProps: CardPartProps<'card-body'>
  footerProps: CardPartProps<'card-footer'>
}

// The same objects every time, frozen, so nothing a consumer does can change another card.
const cardProps: UseCardResult = Object.freeze({
  rootProps: Object.freeze({ 'data-kv': 'card' }),
  headerProps: Object.freeze({ 'data-kv': 'card-header' }),
  bodyProps: Object.freeze({ 'data-kv': 'card-body' }),
  footerProps: Object.freeze({ 'data-kv': 'card-footer' }),
})

/**
 * A card's part names for your own elements (ADR-0020, contract: card.a11y.md). A card is a
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
