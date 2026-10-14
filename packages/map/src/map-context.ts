import { createContext, useContext } from 'react'
import type { UseMapResult } from './use-map.ts'

/** Set by Map.Root for its parts. */
export const MapContext = createContext<UseMapResult | null>(null)

/** Whether a `Map.List` is mounted, so `Map.Skip` never points at a missing target. */
export const MapListPresenceContext = createContext<{
  hasList: boolean
  setHasList: (hasList: boolean) => void
} | null>(null)

export function useMapContext<Data = unknown>(partName: string): UseMapResult<Data> {
  const map = useContext(MapContext)
  if (map === null) {
    throw new Error(`Map.${partName} must be rendered inside Map.Root.`)
  }
  return map as UseMapResult<unknown> as UseMapResult<Data>
}

/**
 * The map's state for a part you write yourself, such as your own list of places. Call it in a
 * descendant of `Map.Root`.
 */
export function useMapState<Data = unknown>(): UseMapResult<Data> {
  return useMapContext<Data>('useMapState')
}
