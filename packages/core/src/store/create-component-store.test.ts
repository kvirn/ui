import { describe, expect, it, vi } from 'vite-plus/test'
import { createComponentStore } from './create-component-store.ts'

const createCounterStore = () =>
  createComponentStore({ count: 0 }, ({ update }) => ({
    increment: () => update((state) => ({ count: state.count + 1 })),
  }))

describe('createComponentStore', () => {
  it('exposes the initial state', () => {
    expect(createCounterStore().getState()).toEqual({ count: 0 })
  })

  it('changes state only through actions', () => {
    const counterStore = createCounterStore()
    counterStore.actions.increment()
    expect(counterStore.getState()).toEqual({ count: 1 })
    expect(counterStore).not.toHaveProperty('setState')
  })

  it('notifies subscribers and stops after unsubscribe', () => {
    const counterStore = createCounterStore()
    const listener = vi.fn<() => void>()
    const unsubscribe = counterStore.subscribe(listener)

    counterStore.actions.increment()
    expect(listener).toHaveBeenCalledTimes(1)

    unsubscribe()
    counterStore.actions.increment()
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('keeps a stable subscribe function for useSyncExternalStore', () => {
    const counterStore = createCounterStore()
    expect(counterStore.subscribe).toBe(counterStore.subscribe)
  })
})
