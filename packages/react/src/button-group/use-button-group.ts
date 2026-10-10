export interface UseButtonGroupOptions {
  /**
   * Whether the group has a name (`aria-label` or `aria-labelledby`). A named group gets
   * `role="group"`. An unnamed one gets no role, so it adds no empty group to the accessibility
   * tree.
   */
  isNamed?: boolean | undefined
}

/** Spread on a `<div>`. */
export interface ButtonGroupPartProps {
  /**
   * `.kv-button-group`. Add `kv-button-group--attached` to join the buttons into one strip, or a
   * class of your own, with `mergeProps`: class names join.
   */
  className: 'kv-button-group'
  role?: 'group'
}

export interface UseButtonGroupResult {
  groupProps: ButtonGroupPartProps
}

// The same objects every time, frozen, so nothing a consumer does can change another group.
const plain: UseButtonGroupResult = Object.freeze({
  groupProps: Object.freeze({ className: 'kv-button-group' }),
})
const named: UseButtonGroupResult = Object.freeze({
  groupProps: Object.freeze({ className: 'kv-button-group', role: 'group' }),
})

/**
 * A button group's props for your own element (contract: button-group.a11y.md): the class, and
 * `role="group"` when it has a name. It holds no state and handles no keys: Tab moves through the
 * buttons as usual. In a Toolbar, the buttons are its items.
 *
 * @example
 * const group = useButtonGroup({ isNamed: true })
 * <div {...group.groupProps} aria-label="Ärendet">…</div>
 */
export function useButtonGroup({
  isNamed = false,
}: UseButtonGroupOptions = {}): UseButtonGroupResult {
  return isNamed ? named : plain
}
