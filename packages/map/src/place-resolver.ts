import type { MapPlace, MapPlaceSource } from '@kvirn-ui/core'

export interface PlaceResolver<Data> {
  /** The place at a source index, or `undefined` while an async `get` is pending. */
  get: (index: number) => MapPlace<Data> | undefined
  /** A place by its id, once it has been resolved (or at once for the `places` array). */
  find: (id: string) => MapPlace<Data> | undefined
  indexOf: (id: string) => number | undefined
}

/** Caches `source.get`, so a place is built once and a promise is awaited once; `onResolve` runs when one arrives. */
export function createPlaceResolver<Data>(
  source: MapPlaceSource<Data>,
  places: readonly MapPlace<Data>[] | undefined,
  onResolve: () => void,
): PlaceResolver<Data> {
  const cache = new Map<number, MapPlace<Data>>()
  const pending = new Set<number>()
  const indexById = new Map<string, number>()
  let isScanned = false

  const remember = (index: number, place: MapPlace<Data>) => {
    cache.set(index, place)
    indexById.set(place.id, index)
  }

  const get = (index: number) => {
    const cached = cache.get(index)
    if (cached) {
      return cached
    }
    if (pending.has(index)) {
      return undefined
    }
    const result = source.get(index)
    if (result instanceof Promise) {
      pending.add(index)
      result.then(
        (place) => {
          pending.delete(index)
          remember(index, place)
          onResolve()
        },
        () => undefined,
      )
      return undefined
    }
    remember(index, result)
    return result
  }

  const indexOf = (id: string) => {
    const known = indexById.get(id)
    if (known !== undefined || isScanned || !places) {
      return known
    }
    isScanned = true
    places.forEach((place, index) => indexById.set(place.id, index))
    return indexById.get(id)
  }

  return {
    get,
    indexOf,
    find: (id) => {
      const index = indexOf(id)
      return index === undefined ? undefined : get(index)
    },
  }
}
