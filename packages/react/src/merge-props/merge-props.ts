import type { CSSProperties, Ref, RefCallback } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'

type MergeTwo<Left, Right> = {
  [Key in keyof Left | keyof Right]: Key extends keyof Right
    ? Key extends keyof Left
      ? undefined extends Right[Key]
        ? Exclude<Right[Key], undefined> | Left[Key]
        : Right[Key]
      : Right[Key]
    : Key extends keyof Left
      ? Left[Key]
      : never
}

/** The result of `mergeProps`: per key, the later object's type wins. */
export type MergedProps<PropObjects extends readonly object[]> = PropObjects extends readonly [
  infer First,
  ...infer Rest extends readonly object[],
]
  ? Rest extends readonly []
    ? First
    : MergeTwo<First, MergedProps<Rest>>
  : {}

type AnyFunction = (...values: never[]) => unknown

const isEventHandlerKey = (key: string) => /^on[A-Z]/.test(key)

const describeId = (id: unknown) => (typeof id === 'string' ? id : JSON.stringify(id))

function chainHandlers(first: AnyFunction, second: AnyFunction): AnyFunction {
  return (...values: never[]) => {
    first(...values)
    second(...values)
  }
}

function joinClassNames(first: unknown, second: unknown): unknown {
  const classNames = [first, second].filter(
    (className): className is string => typeof className === 'string' && className !== '',
  )
  return classNames.length === 0 ? second : classNames.join(' ')
}

function mergeStyles(first: unknown, second: unknown): unknown {
  if (typeof first !== 'object' || first === null) {
    return second
  }
  return { ...(first as CSSProperties), ...(second as CSSProperties) }
}

/** Sets one ref and returns how to clear it: its own cleanup, or setting it to `null`. */
function attachRef<Instance>(ref: Ref<Instance>, instance: Instance): () => void {
  if (typeof ref === 'function') {
    const cleanup = ref(instance)
    return typeof cleanup === 'function' ? cleanup : () => ref(null)
  }
  if (ref !== null) {
    ref.current = instance
    return () => {
      ref.current = null
    }
  }
  return () => {}
}

/** Internal. One callback ref that sets both refs, and clears both on detach. */
export function mergeRefs<Instance>(
  first: Ref<Instance>,
  second: Ref<Instance>,
): RefCallback<Instance> {
  return (instance) => {
    const cleanups = [first, second].map((ref) => attachRef(ref, instance))
    return () => {
      for (const cleanup of cleanups) {
        cleanup()
      }
    }
  }
}

function mergeValue(key: string, first: unknown, second: unknown): unknown {
  if (second === undefined) {
    return first
  }
  if (first === undefined) {
    return second
  }
  if (isEventHandlerKey(key) && typeof first === 'function' && typeof second === 'function') {
    return chainHandlers(first as AnyFunction, second as AnyFunction)
  }
  switch (key) {
    case 'className':
      return joinClassNames(first, second)
    case 'style':
      return mergeStyles(first, second)
    case 'ref':
      return mergeRefs(first as Ref<unknown>, second as Ref<unknown>)
    case 'id':
      if (first !== second) {
        const firstId = describeId(first)
        const secondId = describeId(second)
        warnOnce(
          `merge-props-id:${firstId}:${secondId}`,
          `mergeProps got two different ids, "${firstId}" and "${secondId}". The later one ("${secondId}") wins, so anything that pointed at "${firstId}" (a label, aria-describedby) now points at nothing.`,
        )
      }
      return second
    default:
      return second
  }
}

/**
 * Merges prop objects for one element, left to right (architecture: locality of behaviour):
 *
 * - Event handlers (`onX`) are chained and called in argument order.
 * - `className`s are joined and `style`s are merged, the later object winning per property.
 * - Refs are merged, so every ref gets the element.
 * - Any other prop: the later defined value wins. `undefined` never overrides.
 * - Two different `id`s give a dev warning.
 *
 * @example <button {...mergeProps({ className: 'save' }, button.buttonProps)} />
 */
export function mergeProps<PropObjects extends readonly object[]>(
  ...propObjects: PropObjects
): MergedProps<PropObjects> {
  const merged: Record<string, unknown> = {}
  for (const propObject of propObjects) {
    for (const [key, value] of Object.entries(propObject)) {
      merged[key] = mergeValue(key, merged[key], value)
    }
  }
  return merged as MergedProps<PropObjects>
}
