import { MapAttribution } from './map-attribution.tsx'
import { MapBaseMapSwitch } from './map-base-map-switch.tsx'
import {
  MapClusterPopup,
  MapClusterPopupClose,
  MapClusterPopupPlaces,
  MapClusterPopupTitle,
} from './map-cluster-popup.tsx'
import { MapControls } from './map-controls.tsx'
import {
  MapDetails,
  MapDetailsAddress,
  MapDetailsBody,
  MapDetailsClose,
  MapDetailsImage,
  MapDetailsTitle,
} from './map-details.tsx'
import { MapLayers } from './map-layers.tsx'
import { MapList } from './map-list.tsx'
import { MapCluster, MapMarker, MapMarkers } from './map-markers.tsx'
import { MapOverlay } from './map-overlay.tsx'
import { MapRoot } from './map-root.tsx'
import { MapSkip } from './map-skip.tsx'
import { MapViewport } from './map-viewport.tsx'

export { useMapState } from './map-context.ts'
export { MapAttribution } from './map-attribution.tsx'
export type { MapAttributionProps } from './map-attribution.tsx'
export { MapBaseMapSwitch } from './map-base-map-switch.tsx'
export type { MapBaseMapSwitchProps, MapBaseMapSwitchState } from './map-base-map-switch.tsx'
export {
  MapClusterPopup,
  MapClusterPopupClose,
  MapClusterPopupPlaces,
  MapClusterPopupTitle,
} from './map-cluster-popup.tsx'
export type {
  MapClusterPopupCloseProps,
  MapClusterPopupPlacesProps,
  MapClusterPopupProps,
  MapClusterPopupState,
  MapClusterPopupTitleProps,
} from './map-cluster-popup.tsx'
export { MapControls } from './map-controls.tsx'
export { MapLayers } from './map-layers.tsx'
export type { MapLayersProps, MapLayersState } from './map-layers.tsx'
export {
  MapDetails,
  MapDetailsAddress,
  MapDetailsBody,
  MapDetailsClose,
  MapDetailsImage,
  MapDetailsTitle,
} from './map-details.tsx'
export type {
  MapDetailsAddressProps,
  MapDetailsBodyProps,
  MapDetailsCloseProps,
  MapDetailsImageProps,
  MapDetailsProps,
  MapDetailsState,
  MapDetailsTitleProps,
} from './map-details.tsx'
export { MapList } from './map-list.tsx'
export type { MapListProps } from './map-list.tsx'
export { MapCluster, MapMarker, MapMarkers } from './map-markers.tsx'
export type {
  MapClusterProps,
  MapClusterState,
  MapMarkerProps,
  MapMarkerState,
  MapMarkersProps,
} from './map-markers.tsx'
export { MapOverlay } from './map-overlay.tsx'
export type { MapOverlayProps } from './map-overlay.tsx'
export { MapRoot } from './map-root.tsx'
export type { MapRootProps } from './map-root.tsx'
export { MapSkip } from './map-skip.tsx'
export type { MapSkipProps } from './map-skip.tsx'
export { MapViewport } from './map-viewport.tsx'
export type { MapViewportProps } from './map-viewport.tsx'

export const Map = {
  Root: MapRoot,
  Skip: MapSkip,
  Viewport: MapViewport,
  Markers: MapMarkers,
  Marker: MapMarker,
  Cluster: MapCluster,
  Controls: MapControls,
  Overlay: MapOverlay,
  Attribution: MapAttribution,
  BaseMapSwitch: MapBaseMapSwitch,
  Layers: MapLayers,
  List: MapList,
  Details: MapDetails,
  DetailsImage: MapDetailsImage,
  DetailsTitle: MapDetailsTitle,
  DetailsBody: MapDetailsBody,
  DetailsAddress: MapDetailsAddress,
  DetailsClose: MapDetailsClose,
  ClusterPopup: MapClusterPopup,
  ClusterPopupTitle: MapClusterPopupTitle,
  ClusterPopupPlaces: MapClusterPopupPlaces,
  ClusterPopupClose: MapClusterPopupClose,
} as const
