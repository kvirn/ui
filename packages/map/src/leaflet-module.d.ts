// Leaflet ships no types and @types/leaflet is not a dependency: this is the part the adapter uses.
declare module 'leaflet' {
  export type LatLngTuple = [number, number]

  export interface LatLng {
    lat: number
    lng: number
  }

  export interface Point {
    x: number
    y: number
  }

  export interface LatLngBounds {
    getSouthWest: () => LatLng
    getNorthEast: () => LatLng
  }

  export interface LeafletEvent {
    type: string
    error?: unknown
  }

  export interface Evented {
    on: (type: string, listener: (event: LeafletEvent) => void) => this
    off: (type: string, listener: (event: LeafletEvent) => void) => this
  }

  export interface TileLayer extends Evented {
    addTo: (map: LeafletMap) => this
    remove: () => this
  }

  export interface TileLayerOptions {
    tileSize?: number
    zoomOffset?: number
    minZoom?: number
    maxZoom?: number
    subdomains?: string | string[]
    detectRetina?: boolean
    attribution?: string
  }

  export interface MapOptions {
    center?: LatLngTuple
    zoom?: number
    zoomControl?: boolean
    attributionControl?: boolean
    keyboard?: boolean
    dragging?: boolean
    scrollWheelZoom?: boolean
    doubleClickZoom?: boolean
    boxZoom?: boolean
    touchZoom?: boolean | 'center'
    tapHold?: boolean
    zoomSnap?: number
    zoomAnimation?: boolean
    fadeAnimation?: boolean
    markerZoomAnimation?: boolean
    inertia?: boolean
    worldCopyJump?: boolean
  }

  export interface LeafletMap extends Evented {
    getCenter: () => LatLng
    getZoom: () => number
    setView: (
      center: LatLngTuple,
      zoom: number,
      options?: { animate?: boolean; duration?: number },
    ) => this
    setZoomAround: (
      point: Point | LatLngTuple,
      zoom: number,
      options?: { animate?: boolean },
    ) => this
    panBy: (offset: LatLngTuple, options?: { animate?: boolean }) => this
    fitBounds: (
      bounds: [LatLngTuple, LatLngTuple],
      options?: { padding?: LatLngTuple; animate?: boolean },
    ) => this
    mouseEventToContainerPoint: (event: MouseEvent) => Point
    latLngToContainerPoint: (position: LatLngTuple) => Point
    containerPointToLatLng: (point: LatLngTuple) => LatLng
    getPanes: () => { mapPane: HTMLElement }
    invalidateSize: () => this
    remove: () => this
  }

  export function map(container: HTMLElement, options?: MapOptions): LeafletMap
  export function tileLayer(urlTemplate: string, options?: TileLayerOptions): TileLayer
}
