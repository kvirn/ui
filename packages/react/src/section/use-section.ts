/** Spread on the Panel's element. Only the part's class: Panel adds no role, ARIA or state. */
export interface PanelPartProps {
  /**
   * The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-panel`. Add a modifier class
   * of your own next to it with `mergeProps`: class names join.
   */
  className: 'kv-panel'
}

export interface UsePanelResult {
  rootProps: PanelPartProps
}

// The same object every time, frozen, so nothing a consumer does can change another panel.
const panelProps: UsePanelResult = Object.freeze({
  rootProps: Object.freeze({ className: 'kv-panel' }),
})

/**
 * A panel's class for your own element (ADR-0044, contract: panel.a11y.md). A panel is a plain
 * container for a region of the page: pick the element (`<aside aria-labelledby>`,
 * `<section aria-labelledby>`, `<nav aria-labelledby>`, `<li>`) and the heading level yourself.
 * A landmark needs a name.
 *
 * @example
 * const panel = usePanel()
 * <nav {...panel.rootProps} aria-label="Ärenden">…</nav>
 */
export function usePanel(): UsePanelResult {
  return panelProps
}
