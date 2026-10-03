/** Spread on the Kbd's element. Only the part's class: Kbd adds no role, ARIA or state. */
export interface KbdPartProps {
  /**
   * The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-kbd`. Add a class of your own
   * next to it with `mergeProps`: class names join.
   */
  className: 'kv-kbd'
}

export interface UseKbdResult {
  /** The element: always `'kbd'`. */
  element: 'kbd'
  rootProps: KbdPartProps
}

// The same object every time, frozen, so nothing a consumer does can change another key.
const kbdProps: UseKbdResult = Object.freeze({
  element: 'kbd',
  rootProps: Object.freeze({ className: 'kv-kbd' }),
})

/**
 * Kbd's element and class for your own element (contract: kbd.a11y.md).
 *
 * @example
 * const kbd = useKbd()
 * <kbd {...kbd.rootProps}>Tab</kbd>
 */
export function useKbd(): UseKbdResult {
  return kbdProps
}
