/** Spread on one part's element. Only the part's class: the behaviour is the Disclosure's. */
export interface AccordionPartProps<
  Name extends 'accordion' | 'accordion-item' | 'accordion-heading' =
    | 'accordion'
    | 'accordion-item'
    | 'accordion-heading',
> {
  /**
   * The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-accordion`. Add a class of
   * your own next to it with `mergeProps`: class names join.
   */
  className: `kv-${Name}`
}

export interface UseAccordionResult {
  rootProps: AccordionPartProps<'accordion'>
  itemProps: AccordionPartProps<'accordion-item'>
  headingProps: AccordionPartProps<'accordion-heading'>
}

// The same objects every time, frozen, so nothing a consumer does can change another accordion.
const accordionProps: UseAccordionResult = Object.freeze({
  rootProps: Object.freeze({ className: 'kv-accordion' }),
  itemProps: Object.freeze({ className: 'kv-accordion-item' }),
  headingProps: Object.freeze({ className: 'kv-accordion-heading' }),
})

/**
 * An accordion's container classes for your own elements (contract: accordion.a11y.md). Each item
 * is a `useDisclosure()` whose trigger sits inside a heading of the level your page needs. The
 * items are independent: opening one never closes another.
 *
 * @example
 * const accordion = useAccordion()
 * const disclosure = useDisclosure()
 * <div {...accordion.itemProps}>
 *   <h3 {...accordion.headingProps}>
 *     <button {...disclosure.triggerProps}>Hur ansöker jag?</button>
 *   </h3>
 *   <div {...disclosure.panelProps}>Du ansöker på Mina sidor.</div>
 * </div>
 */
export function useAccordion(): UseAccordionResult {
  return accordionProps
}
