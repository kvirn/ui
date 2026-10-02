/** Spread on the Prose's element. Only the part's class: Prose adds no role, ARIA or state. */
export interface ProsePartProps {
  /**
   * The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-prose`. Add a class of your own
   * next to it with `mergeProps`: class names join.
   */
  className: 'kv-prose'
}

export interface UseProseResult {
  rootProps: ProsePartProps
}

// The same object every time, frozen, so nothing a consumer does can change another prose block.
const proseProps: UseProseResult = Object.freeze({
  rootProps: Object.freeze({ className: 'kv-prose' }),
})

/**
 * Prose's class for your own element (contract: prose.a11y.md). The theme styles the headings,
 * paragraphs, lists and links inside it for reading.
 *
 * @example
 * const prose = useProse()
 * <article {...prose.rootProps}>…</article>
 */
export function useProse(): UseProseResult {
  return proseProps
}
