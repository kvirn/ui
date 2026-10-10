/** Spread on the stack's element. Only its class: Stack adds no role, ARIA or state. */
export interface StackPartProps {
  /** `.kv-stack`. Add a gap class (`kv-stack--gap-4`) or one of your own with `mergeProps`: class names join. */
  className: 'kv-stack'
}

export interface UseStackResult {
  stackProps: StackPartProps
}

// The same object every time, frozen, so nothing a consumer does can change another stack.
const result: UseStackResult = Object.freeze({
  stackProps: Object.freeze({ className: 'kv-stack' }),
})

/**
 * A stack's class for your own element (contract: stack.a11y.md). It adds no role, ARIA or
 * `tabindex`.
 *
 * @example
 * const stack = useStack()
 * <div {...mergeProps({ className: 'kv-stack--gap-8' }, stack.stackProps)}>…</div>
 */
export function useStack(): UseStackResult {
  return result
}
