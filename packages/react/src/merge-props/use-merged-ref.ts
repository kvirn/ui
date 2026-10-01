import { useCallback } from 'react'
import type { Ref, RefCallback } from 'react'
import { mergeRefs } from './merge-props.ts'

/**
 * Internal. One stable callback ref that sets every given ref, for a part's own ref next to
 * the consumer's. Stable while the refs are, so React doesn't detach and re-attach it on
 * every render.
 */
export function useMergedRef<Instance>(
  consumerRef: Ref<Instance> | undefined,
  ownRef: Ref<Instance>,
): RefCallback<Instance> {
  return useCallback(
    (instance: Instance | null) => mergeRefs(consumerRef ?? null, ownRef)(instance),
    [consumerRef, ownRef],
  )
}
