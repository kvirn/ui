export type ContainerSize = 'page' | 'reading' | 'form'

export interface UseContainerOptions {
  /**
   * The measure: `'page'` (default) is centred, at most `80rem` wide, with inline padding.
   * `'reading'` (`45rem`) and `'form'` (`40rem`) are start-aligned and add no padding.
   */
  size?: ContainerSize | undefined
}

/** Spread on the container's element. Only its class: Container adds no role, ARIA or state. */
export interface ContainerPartProps {
  /**
   * `.kv-container`, and one modifier for a size other than `'page'`. Add a class of your own
   * next to it with `mergeProps`: class names join.
   */
  className: 'kv-container' | `kv-container kv-container--${Exclude<ContainerSize, 'page'>}`
}

export interface UseContainerResult {
  containerProps: ContainerPartProps
}

// The same objects every time, frozen, so nothing a consumer does can change another container.
const containerProps: Record<ContainerSize, UseContainerResult> = {
  page: Object.freeze({ containerProps: Object.freeze({ className: 'kv-container' }) }),
  reading: Object.freeze({
    containerProps: Object.freeze({ className: 'kv-container kv-container--reading' }),
  }),
  form: Object.freeze({
    containerProps: Object.freeze({ className: 'kv-container kv-container--form' }),
  }),
}

/**
 * A container's class for your own element (contract: container.a11y.md). It adds no role,
 * ARIA or `tabindex`: pick the element yourself.
 *
 * @example
 * const container = useContainer({ size: 'reading' })
 * <main {...container.containerProps}>…</main>
 */
export function useContainer({ size = 'page' }: UseContainerOptions = {}): UseContainerResult {
  return containerProps[size]
}
