import { useMemo, useState } from 'react'
import type { ComponentPropsWithRef, ReactElement } from 'react'
import { joinClassNames } from './class-names.ts'
import { MapContext, MapListPresenceContext } from './map-context.ts'
import { useMap } from './use-map.ts'
import type { UseMapOptions, UseMapResult } from './use-map.ts'

export interface MapRootProps<Data = unknown>
  extends ComponentPropsWithRef<'div'>, Omit<UseMapOptions<Data>, 'messages'> {
  messages?: UseMapOptions<Data>['messages']
}

/**
 * Owns the map's state and mounts the engine into `Map.Viewport`. Put `Map.Skip`,
 * `Map.Viewport` and, beside it, `Map.List` and `Map.Details` inside.
 *
 * @example
 * <Map.Root provider={provider} label="Map of preschools" places={places} initialView={view}>
 *   <Map.Skip />
 *   <Map.Viewport><Map.Markers /><Map.Controls /></Map.Viewport>
 *   <Map.List /><Map.Details />
 * </Map.Root>
 */
export function MapRoot<Data = unknown>({
  provider,
  label,
  places,
  source,
  indexIn,
  initialView,
  baseMap,
  defaultBaseMap,
  onBaseMapChange,
  layers,
  hiddenLayers,
  defaultHiddenLayers,
  onHiddenLayersChange,
  cluster,
  messages,
  children,
  ...otherProps
}: MapRootProps<Data>): ReactElement {
  const map = useMap<Data>({
    provider,
    label,
    places,
    source,
    indexIn,
    initialView,
    baseMap,
    defaultBaseMap,
    onBaseMapChange,
    layers,
    hiddenLayers,
    defaultHiddenLayers,
    onHiddenLayersChange,
    cluster,
    messages,
  })
  const [hasList, setHasList] = useState(false)
  const listPresence = useMemo(() => ({ hasList, setHasList }), [hasList])
  return (
    <MapContext.Provider value={map as UseMapResult}>
      <MapListPresenceContext.Provider value={listPresence}>
        <div {...otherProps} className={joinClassNames('kv-map', otherProps.className)}>
          {children}
        </div>
      </MapListPresenceContext.Provider>
    </MapContext.Provider>
  )
}
MapRoot.displayName = 'Map.Root'
