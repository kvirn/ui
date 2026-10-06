/** `'spaced'` (default): a row with a gap. `'attached'`: one joined strip, like a segmented control. */
export type ButtonGroupLayout = 'spaced' | 'attached'

export interface UseButtonGroupOptions {
  /**
   * Whether the group has a name (`aria-label` or `aria-labelledby`). A named group gets
   * `role="group"`. An unnamed one gets no role, so it adds no empty group to the accessibility
   * tree.
   */
  isNamed?: boolean | undefined
  /**
   * `'attached'` joins the buttons into one strip: they touch, share borders and only the outer
   * corners are rounded. Default `'spaced'`. It changes the look only: no role, key or ARIA.
   */
  layout?: ButtonGroupLayout | undefined
}

/** Spread on a `<div>`. */
export interface ButtonGroupPartProps {
  /**
   * `.kv-button-group`, and `.kv-button-group--attached` for `layout: 'attached'`. Add a class of
   * your own next to it with `mergeProps`: class names join.
   */
  className: 'kv-button-group' | 'kv-button-group kv-button-group--attached'
  role?: 'group'
}

export interface UseButtonGroupResult {
  groupProps: ButtonGroupPartProps
}

// The same objects every time, frozen, so nothing a consumer does can change another group.
const groupProps = {
  spaced: Object.freeze({ className: 'kv-button-group' }),
  attached: Object.freeze({ className: 'kv-button-group kv-button-group--attached' }),
} as const satisfies Record<ButtonGroupLayout, ButtonGroupPartProps>

const results = {
  spaced: {
    plain: Object.freeze({ groupProps: groupProps.spaced }),
    named: Object.freeze({ groupProps: Object.freeze({ ...groupProps.spaced, role: 'group' }) }),
  },
  attached: {
    plain: Object.freeze({ groupProps: groupProps.attached }),
    named: Object.freeze({ groupProps: Object.freeze({ ...groupProps.attached, role: 'group' }) }),
  },
} as const satisfies Record<ButtonGroupLayout, Record<'plain' | 'named', UseButtonGroupResult>>

/**
 * A button group's props for your own element (contract: button-group.a11y.md): the class, and
 * `role="group"` when it has a name. It holds no state and handles no keys: Tab moves through the
 * buttons as usual. In a Toolbar, the buttons are its items.
 *
 * @example
 * const group = useButtonGroup({ isNamed: true, layout: 'attached' })
 * <div {...group.groupProps} aria-label="Ärendet">…</div>
 */
export function useButtonGroup({
  isNamed = false,
  layout = 'spaced',
}: UseButtonGroupOptions = {}): UseButtonGroupResult {
  // A value from untyped code falls back to the default look instead of throwing.
  return (results[layout] ?? results.spaced)[isNamed ? 'named' : 'plain']
}
