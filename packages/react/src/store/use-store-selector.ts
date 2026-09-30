import { useRef, useSyncExternalStore } from 'react'
import type { ReadableStore } from '@kvirn-ui/core'

interface SelectionCache<State, Selected> {
  state: State
  selector: (state: State) => Selected
  selected: Selected
}

/**
 * Subscribes to a core store and re-renders only when the selected slice changes
 * (ADR-0003). Uses React's own `useSyncExternalStore`, so it is concurrent- and SSR-safe.
 */
export function useStoreSelector<State, Selected>(
  store: ReadableStore<State>,
  selector: (state: State) => Selected,
  isEqual: (previous: Selected, next: Selected) => boolean = Object.is,
): Selected {
  const cacheRef = useRef<SelectionCache<State, Selected> | null>(null)

  const getSelection = () => {
    const state = store.getState()
    const cache = cacheRef.current
    if (cache !== null && Object.is(cache.state, state) && cache.selector === selector) {
      return cache.selected
    }
    const nextSelected = selector(state)
    const selected =
      cache !== null && isEqual(cache.selected, nextSelected) ? cache.selected : nextSelected
    cacheRef.current = { state, selector, selected }
    return selected
  }

  return useSyncExternalStore(store.subscribe, getSelection, getSelection)
}
