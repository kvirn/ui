export type StackGap = '2' | '4' | '6' | '8'

export interface UseStackOptions {
  /** The space between children, a `space` step in the theme. Default `'6'`. */
  gap?: StackGap | undefined
}

/** Spread on the stack's element. Only its class: Stack adds no role, ARIA or state. */
export interface StackPartProps {
  /**
   * `.kv-stack`, and one modifier for a gap other than the default `'6'`. Add a class of your
   * own next to it with `mergeProps`: class names join.
   */
  className: 'kv-stack' | `kv-stack kv-stack--gap-${Exclude<StackGap, '6'>}`
}

export interface UseStackResult {
  stackProps: StackPartProps
}

// The same objects every time, frozen, so nothing a consumer does can change another stack.
const stackProps: Record<StackGap, UseStackResult> = {
  '2': Object.freeze({ stackProps: Object.freeze({ className: 'kv-stack kv-stack--gap-2' }) }),
  '4': Object.freeze({ stackProps: Object.freeze({ className: 'kv-stack kv-stack--gap-4' }) }),
  '6': Object.freeze({ stackProps: Object.freeze({ className: 'kv-stack' }) }),
  '8': Object.freeze({ stackProps: Object.freeze({ className: 'kv-stack kv-stack--gap-8' }) }),
}

/**
 * A stack's class for your own element (contract: stack.a11y.md). It adds no role, ARIA or
 * `tabindex`.
 *
 * @example
 * const stack = useStack({ gap: '8' })
 * <div {...stack.stackProps}>…</div>
 */
export function useStack({ gap = '6' }: UseStackOptions = {}): UseStackResult {
  return stackProps[gap]
}
