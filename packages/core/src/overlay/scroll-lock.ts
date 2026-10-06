export interface ScrollLock {
  /** Locks for `id`. Returns `true` only when this is the first lock, the moment to freeze scrolling. */
  acquire: (id: string) => boolean
  /** Unlocks `id`. Returns `true` only when it was the last lock, the moment to restore scrolling. */
  release: (id: string) => boolean
}

/** Ref-counts scroll locks by id, so stacked modals freeze the page once and restore it once. */
export function createScrollLock(): ScrollLock {
  const ids = new Set<string>()
  return {
    acquire: (id) => {
      const isFirst = ids.size === 0
      ids.add(id)
      return isFirst
    },
    release: (id) => ids.delete(id) && ids.size === 0,
  }
}
