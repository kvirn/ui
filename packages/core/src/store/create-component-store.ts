import { Store } from '@tanstack/store'

/**
 * The only module allowed to import `@tanstack/store`. Components depend on
 * this wrapper, so the underlying store can be swapped without API changes.
 */

export type Listener = () => void

/** Read side of a store: what adapters such as `useStoreSelector` subscribe to. */
export interface ReadableStore<State> {
  getState: () => State
  subscribe: (listener: Listener) => () => void
}

export interface StoreUpdater<State> {
  getState: () => State
  update: (updater: (state: State) => State) => void
}

export interface ComponentStore<State, Actions> extends ReadableStore<State> {
  /** Typed, verb-named actions. There is deliberately no public `setState`. */
  actions: Actions
}

export function createComponentStore<State, Actions>(
  initialState: State,
  defineActions: (storeUpdater: StoreUpdater<State>) => Actions,
): ComponentStore<State, Actions> {
  const store = new Store(initialState)

  const getState = () => store.state
  const update = (updater: (state: State) => State) => {
    store.setState(updater)
  }
  const subscribe = (listener: Listener) => {
    const subscription = store.subscribe(() => listener())
    return typeof subscription === 'function' ? subscription : () => subscription.unsubscribe()
  }

  return { getState, subscribe, actions: defineActions({ getState, update }) }
}
