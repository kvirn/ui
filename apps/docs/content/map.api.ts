import type {
  MapAttributionProps,
  MapBaseMapSwitchProps,
  MapClusterPopupPlacesProps,
  MapClusterPopupProps,
  MapDetailsProps,
  MapLayer,
  MapLayersProps,
  MapListProps,
  MapMarkersProps,
  MapOverlayProps,
  MapPlace,
  MapPlaceSource,
  MapSkipProps,
  UseMapOptions,
  UseMapResult,
} from '@kvirn-ui/map'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow, PropRow } from '../components/api-block.tsx'

/** The options of the Root and of `useMap`: the Root passes all of these to the hook. */
export const rootRows = propRows<UseMapOptions>({
  provider: {
    type: 'MapProvider',
    description:
      'The engine adapter that draws the map: maplibre({ style }), createMemoryProvider() or your own. Keep the same instance between renders.',
  },
  label: {
    type: 'string',
    description:
      'The map’s name, which a screen reader reads for the map region. Write it in your language: “Map of preschools”.',
  },
  initialView: {
    type: '{ center: { longitude, latitude }, zoom }',
    description:
      'Where the map starts, and where the Whole map button returns to. Changing the prop later does not move the camera.',
  },
  places: {
    type: 'readonly MapPlace[]',
    default: '–',
    description:
      'The places, up to a few thousand. Keep the array the same between renders. For more, use source.',
  },
  source: {
    type: 'MapPlaceSource',
    default: '–',
    description:
      'The places as columns, for tens of thousands to millions. No object exists for a place until a marker, a row or a popup needs it. Use it instead of places, and keep it the same between renders.',
  },
  indexIn: {
    type: "'main' | (() => MapIndexer)",
    default: "'main'",
    description:
      '“main” builds the index of a large source on the page, in slices of 8 ms. Pass createMapWorker from @kvirn-ui/map/worker to build it in a Web Worker instead.',
  },
  baseMap: {
    type: 'string',
    default: '–',
    description:
      'The id of the active map type. Set it to control the map type yourself and update it in onBaseMapChange. Without it the map keeps its own.',
  },
  defaultBaseMap: {
    type: 'string',
    default: 'The provider’s, else the first',
    description: 'The map type to start on when baseMap is not set.',
  },
  onBaseMapChange: {
    type: '(id: string) => void',
    default: '–',
    description: 'Called with the id when a visitor picks a map type.',
  },
  layers: {
    type: 'readonly MapLayer[]',
    default: '–',
    description:
      'The groups of places. A place joins one with its layer. Keep the array the same between renders.',
  },
  hiddenLayers: {
    type: 'readonly string[]',
    default: '–',
    description:
      'The ids of the hidden layers. Set it to control them yourself and update it in onHiddenLayersChange.',
  },
  defaultHiddenLayers: {
    type: 'readonly string[]',
    default: '[]',
    description: 'The layers that start hidden when hiddenLayers is not set.',
  },
  onHiddenLayersChange: {
    type: '(ids: readonly string[]) => void',
    default: '–',
    description: 'Called with the ids that are now hidden when a visitor shows or hides a layer.',
  },
  cluster: {
    type: 'boolean | { radius?: number }',
    default: 'true',
    description:
      'Groups nearby places of one layer into a cluster. The radius is 64 CSS pixels, so two clusters stay about 44 pixels (one target) apart. false turns clustering off, and a layer with cluster: false is never clustered. A cluster holds places of one layer only.',
  },
  messages: {
    type: 'Partial<KvirnMessages["map"]>',
    default: '–',
    description:
      'Changes the map’s texts for this map. See Strings below for every key and its English text.',
  },
})

export const skipRows = propRows<MapSkipProps>({
  children: {
    type: 'ReactNode',
    default: 'map.skipToList',
    description: 'The link text.',
  },
  href: {
    type: 'string',
    default: '–',
    description:
      'The target when you build your own list instead of Map.List, such as #my-list-heading. The link goes to the open place’s title while a place is open, else to Map.List, else to href. With none of them it renders nothing.',
  },
})

export const viewportAttributes: AttributeRow[] = [
  {
    name: 'data-status',
    values: 'loading | ready | failed',
    meaning:
      'On the viewport. Loading shows a spinner and the loading message, and failed shows that the tiles could not load. The list keeps working in both.',
  },
  {
    name: 'data-dismissed',
    values: 'present or absent',
    meaning: 'On the keyboard hint, once Escape has hidden it.',
  },
  {
    name: 'data-gesture',
    values: 'touch | wheel',
    meaning:
      'On the gesture hint: the gesture the engine ignored so that the page can scroll (one finger, or the wheel without Control or Command).',
  },
]

export const markersRows = propRows<
  Pick<
    MapMarkersProps,
    'children' | 'label' | 'markerClassName' | 'cluster' | 'clusterLabel' | 'clusterClassName'
  >
>({
  children: {
    type: '(place, { selected, highlighted, layer }) => ReactNode',
    default: '–',
    description:
      'The content of a marker: a 16 pixel icon, or a name chip in kv-map-marker-label. It is decoration inside the one button, so it is not read. The name comes from label.',
  },
  label: {
    type: '(place, layer) => string',
    default: 'The place’s name',
    description:
      'The marker’s accessible name. Put the information in it, such as the layer: “Torget recycling station, Recycling stations”.',
  },
  markerClassName: {
    type: 'string | ((place, layer) => string)',
    default: '–',
    description: 'A class on every marker, or one per place, for example one per layer.',
  },
  cluster: {
    type: '(cluster, { opened, layer }) => ReactNode',
    default: 'The number of places',
    description: 'The content of a cluster’s button.',
  },
  clusterLabel: {
    type: '(cluster, layer) => string',
    default: 'map.clusterLabel',
    description:
      'The cluster’s accessible name. The default is the number of places, with the layer’s name when it has one.',
  },
  clusterClassName: {
    type: 'string | ((cluster, layer) => string)',
    default: '–',
    description: 'A class on every cluster, or one per cluster, for example one per layer.',
  },
})

export const markersAttributes: AttributeRow[] = [
  {
    name: 'data-selected',
    values: 'present or absent',
    meaning: 'On a marker whose details are open.',
  },
  {
    name: 'data-highlighted',
    values: 'present or absent',
    meaning: 'On a marker while its list row is hovered, and on the row while the marker is.',
  },
  {
    name: 'aria-expanded',
    values: 'true | false',
    meaning: 'On a marker or cluster while its popup is open.',
  },
]

export const markerRows = {
  place: {
    type: 'MapPlace',
    description:
      'On Map.Marker: the place the button stands for. Use Map.Markers, which renders the set.',
  },
  cluster: {
    type: 'MapCluster',
    description:
      'On Map.Cluster: the cluster the button stands for. Use Map.Markers, which renders the set.',
  },
} as const

export const overlayRows = propRows<Pick<MapOverlayProps, 'as'>>({
  as: {
    type: 'ElementType',
    default: "'div'",
    description: 'Another tag or component to render.',
  },
})

export const attributionRows = propRows<Pick<MapAttributionProps, 'children'>>({
  children: {
    type: 'ReactNode | ((baseMap) => ReactNode)',
    default: 'The active map type’s attribution',
    description:
      'The text and links your tile or data licence asks for. It renders nothing without text.',
  },
})

export const baseMapSwitchRows = propRows<Pick<MapBaseMapSwitchProps, 'icon' | 'children'>>({
  icon: {
    type: '(baseMap) => ReactNode',
    default: 'A plain preview',
    description: 'A decorative preview of a map type, such as a small tile image. It is not read.',
  },
  children: {
    type: '({ baseMaps, baseMap, setBaseMap, label }) => ReactNode',
    default: '–',
    description:
      'Replaces the button and the tiles, for example with a native select in a Field. Give your control a visible label and render it outside Map.Viewport.',
  },
})

export const layersRows = propRows<
  Pick<
    MapLayersProps,
    'icon' | 'layerClassName' | 'children' | 'collapsible' | 'defaultOpen' | 'open' | 'onOpenChange'
  >
>({
  icon: {
    type: '(layer) => ReactNode',
    default: '–',
    description:
      'A decorative swatch before the layer’s name, such as the layer’s marker icon. It is not read: the name and count are.',
  },
  layerClassName: {
    type: '(layer) => string | undefined',
    default: '–',
    description: 'A class on each layer’s row, so a swatch can match its markers.',
  },
  children: {
    type: '({ layers, hiddenLayerIds, setLayerHidden, counts }) => ReactNode',
    default: '–',
    description: 'Replaces the checkboxes, for example with a switch per layer.',
  },
  collapsible: {
    type: 'boolean',
    default: 'true',
    description:
      'Lets the visitor collapse the card behind its title. `false` keeps it always open, with no button.',
  },
  defaultOpen: {
    type: 'boolean',
    default: 'true',
    description:
      'Whether the layers start shown. Set `false` for a long list of layers, so the card does not cover the map.',
  },
  open: {
    type: 'boolean',
    default: '–',
    description: 'Controlled: whether the layers are shown. Pair it with `onOpenChange`.',
  },
  onOpenChange: {
    type: '(open: boolean) => void',
    default: '–',
    description: 'Called when the visitor opens or closes the card, with the new state.',
  },
})

export const listRows = propRows<Pick<MapListProps, 'icon' | 'rowClassName' | 'children'>>({
  icon: {
    type: '(place) => ReactNode',
    default: '–',
    description: 'A decorative swatch before each row, such as the place’s marker icon.',
  },
  rowClassName: {
    type: '(place) => string | undefined',
    default: '–',
    description: 'A class on each row.',
  },
  children: {
    type: '(place) => ReactNode',
    default: '–',
    description:
      'Extra facts under the name, such as opening hours. Keep them non-interactive: the whole row is one button. A node with the class kv-map-list-aside sits at the row’s end.',
  },
})

export const listAttributes: AttributeRow[] = [
  {
    name: 'data-highlighted',
    values: 'present or absent',
    meaning: 'On a row while its marker is hovered.',
  },
  {
    name: 'data-virtualized',
    values: 'present or absent',
    meaning:
      'On the scroll element past 50 places. Only the rows in view are rendered, each with aria-setsize and aria-posinset, and the list is one Tab stop.',
  },
]

export const detailsRows = propRows<Pick<MapDetailsProps, 'as' | 'children'>>({
  as: {
    type: 'ElementType',
    default: "'dialog'",
    description: 'Another tag or component to render. The default is an open, non-modal dialog.',
  },
  children: {
    type: 'ReactNode | ((state) => ReactNode)',
    default: '–',
    description:
      'Without children: the picture, the title with Close, the body and the address, each only when the place has it. With nodes: exactly those, in your order, from the Map.Details parts or your own markup. With a function: the whole template, from { place, close, titleProps, side }. Keep a Map.DetailsTitle or put titleProps on your heading: it names the dialog.',
  },
})

export const detailsPartRows = {
  as: {
    type: 'ElementType',
    default: 'img, h3, p, p',
    description:
      'On DetailsImage, DetailsTitle, DetailsBody and DetailsAddress: another tag for the part, such as h2 for the title. DetailsClose has no as.',
  },
  children: {
    type: 'ReactNode',
    default: 'The place’s own text',
    description:
      'On DetailsTitle (the place’s name), DetailsBody (its description) and DetailsAddress (its address). DetailsClose shows a close icon.',
  },
} as const

export const clusterPopupRows = propRows<Pick<MapClusterPopupProps, 'as' | 'children'>>({
  as: {
    type: 'ElementType',
    default: "'dialog'",
    description: 'Another tag or component to render. The default is an open, non-modal dialog.',
  },
  children: {
    type: 'ReactNode | ((state) => ReactNode)',
    default: '–',
    description:
      'Without children: the title with Close, then one button per place. With nodes: exactly those, from the Map.ClusterPopup parts. With a function: the whole template, from { cluster, close, select, titleProps, side }, where select(placeId) closes the popup and opens that place’s details.',
  },
})

export const clusterPopupPlacesRows = propRows<Pick<MapClusterPopupPlacesProps, 'renderPlace'>>({
  renderPlace: {
    type: '(place, select) => ReactNode',
    default: 'A button with the name and the address under it',
    description: 'Replaces a row. Call select to open that place’s details.',
  },
})

export const placeRows = propRows<MapPlace>({
  id: { type: 'string', description: 'A stable id, used for the marker, the row and the focus.' },
  name: {
    type: 'string',
    description: 'The place’s name: the marker’s name, the list row’s text and the popup’s title.',
  },
  position: { type: '{ longitude: number; latitude: number }', description: 'Where it is.' },
  layer: {
    type: 'string',
    default: '–',
    description: 'The id of the layer the place belongs to.',
  },
  address: {
    type: 'string',
    default: '–',
    description: 'Shown under the name in the list and in the popup.',
  },
  description: { type: 'string', default: '–', description: 'The body of the popup.' },
  image: {
    type: '{ src: string; alt: string }',
    default: '–',
    description:
      'The picture at the top of the popup. alt is required and in your language: use an empty string when the picture only decorates.',
  },
  data: {
    type: 'Data',
    default: '–',
    description: 'Your own object for the place, handed back to every render function.',
  },
})

export const layerRows = propRows<MapLayer>({
  id: { type: 'string', description: 'The id a place names in its layer.' },
  label: { type: 'string', description: 'The layer’s name, in the checkbox and in cluster names.' },
  description: {
    type: 'string',
    default: '–',
    description: 'Help text for the layer’s checkbox.',
  },
  cluster: {
    type: 'boolean',
    default: 'true',
    description: 'false: places of this layer are never grouped into clusters.',
  },
})

export const sourceRows = propRows<MapPlaceSource>({
  count: { type: 'number', description: 'How many places there are.' },
  positions: {
    type: 'Float64Array',
    description: 'Longitude and latitude of every place, interleaved: length count × 2.',
  },
  layers: {
    type: 'Uint16Array',
    default: '–',
    description:
      'For each place, the index of its layer in layers, or NO_LAYER (from @kvirn-ui/core) for none.',
  },
  get: {
    type: '(index: number) => MapPlace | Promise<MapPlace>',
    description:
      'The place at an index, built when a marker, a row or a popup needs it. It may return a promise (a server call); a failed one is not tried again. placesToSource(places, layers) from @kvirn-ui/core shows the shape.',
  },
})

export const maplibreRows = {
  style: {
    type: 'string | StyleSpecification',
    default: '–',
    description:
      'A MapLibre style document, or the URL of one. There is no default: you choose the tile source. Use style or baseMaps.',
  },
  baseMaps: {
    type: 'readonly { id, label, attribution?, style }[]',
    default: '–',
    description:
      'Instead of style: a list of map types the visitor can switch between with Map.BaseMapSwitch.',
  },
  defaultBaseMap: {
    type: 'string',
    default: 'The first',
    description: 'With baseMaps: the id to start on.',
  },
  workerUrl: {
    type: 'string',
    default: '–',
    description:
      'The URL of maplibre-gl/dist/maplibre-gl-worker.mjs. A bundler that pre-bundles dependencies (Vite in development) needs it.',
  },
  attribution: {
    type: 'string',
    default: '–',
    description: 'Attribution that the style’s sources do not already carry.',
  },
} as const

export const rasterStyleRows = {
  tiles: {
    type: 'string[]',
    description: 'URL templates with {z}, {x} and {y} from your tile host. The library names none.',
  },
  attribution: {
    type: 'string',
    description: 'The source’s licence text. Show it with Map.Attribution.',
  },
  tileSize: { type: 'number', default: '256', description: 'The size of a tile in pixels.' },
  minzoom: { type: 'number', default: '–', description: 'The lowest zoom the source has.' },
  maxzoom: { type: 'number', default: '–', description: 'The highest zoom the source has.' },
} as const

export const memoryProviderRows = {
  size: {
    type: '{ width: number; height: number }',
    default: '{ width: 800, height: 600 }',
    description:
      'The size the camera works with, in pixels. The provider draws nothing, so it cannot read the real size.',
  },
  baseMaps: {
    type: 'readonly MapBaseMap[]',
    default: '–',
    description:
      'Map types to list, so Map.BaseMapSwitch and Map.Attribution have something to show.',
  },
  defaultBaseMap: { type: 'string', default: '–', description: 'The map type to start on.' },
} as const

/** A hook’s result has no required props, so every row shows a dash instead of “Required”. */
const withDash = <Rows extends Record<string, PropRow>>(rows: Rows): Rows =>
  Object.fromEntries(
    Object.entries(rows).map(([key, row]) => [key, { default: '–', ...row }]),
  ) as Rows

const hookResultRows = withDash(
  propRows<
    Pick<
      UseMapResult,
      | 'placesInView'
      | 'visiblePlaces'
      | 'visibleCount'
      | 'placesInViewCount'
      | 'getPlaceInView'
      | 'indexing'
      | 'layerCounts'
      | 'layers'
      | 'hiddenLayerIds'
      | 'setLayerHidden'
      | 'markersInView'
      | 'selectedPlace'
      | 'openedCluster'
      | 'select'
      | 'close'
      | 'openCluster'
      | 'clusterMarkerId'
      | 'baseMaps'
      | 'baseMap'
      | 'setBaseMap'
      | 'zoomIn'
      | 'zoomOut'
      | 'reset'
      | 'view'
      | 'status'
      | 'messages'
      | 'ids'
      | 'show'
      | 'searchResult'
      | 'clearResult'
      | 'setHighlightedPlaceId'
    >
  >({
    placesInView: {
      type: 'MapPlace[]',
      description:
        'The places in the map view, on a visible layer. It builds every place, so use it for a short list only.',
    },
    visiblePlaces: {
      type: 'MapPlace[]',
      description: 'Every place on a visible layer. It builds every place too.',
    },
    visibleCount: { type: 'number', description: 'How many places are on a visible layer.' },
    placesInViewCount: { type: 'number', description: 'How many of them are in the map view.' },
    getPlaceInView: {
      type: '(index: number) => MapPlace | undefined',
      description:
        'The place at a position in the list of places in view, in source order. Use it with placesInViewCount for a long list.',
    },
    indexing: {
      type: 'boolean',
      description:
        'True while the index of a large source is being built. Markers appear when it is done.',
    },
    layerCounts: { type: 'Record<string, number>', description: 'How many places each layer has.' },
    layers: { type: 'readonly MapLayer[]', description: 'The layers you passed.' },
    hiddenLayerIds: { type: 'readonly string[]', description: 'The ids of the hidden layers.' },
    setLayerHidden: {
      type: '(layerId: string, hidden: boolean) => void',
      description:
        'Shows or hides a layer. It closes a popup of a place or cluster on that layer and announces the new count.',
    },
    markersInView: {
      type: 'MapMarkerItem[]',
      description: 'The places and clusters drawn as markers.',
    },
    selectedPlace: {
      type: 'MapPlace | null',
      description: 'The place whose details are open.',
    },
    openedCluster: { type: 'MapCluster | null', description: 'The cluster whose popup is open.' },
    select: {
      type: '(placeId: string, openerId?: string) => void',
      description:
        'Opens a place’s details. Focus moves to the title, and closing returns it to the element with openerId.',
    },
    close: { type: '() => void', description: 'Closes the details.' },
    openCluster: {
      type: '(clusterId: string | null, openerId?: string) => void',
      description: 'Opens a cluster’s popup, or closes it with null.',
    },
    clusterMarkerId: {
      type: '(clusterId: string) => string',
      description: 'The id of a cluster’s button, for openCluster.',
    },
    baseMaps: { type: 'readonly MapBaseMap[]', description: 'The provider’s map types.' },
    baseMap: { type: 'string | null', description: 'The active map type’s id.' },
    setBaseMap: {
      type: '(id: string) => void',
      description: 'Changes the map type, keeps the camera and announces the change.',
    },
    zoomIn: { type: '() => void', description: 'Zooms in one step, or announces the limit.' },
    zoomOut: { type: '() => void', description: 'Zooms out one step, or announces the limit.' },
    reset: { type: '() => void', description: 'Returns to initialView.' },
    view: { type: 'MapView', description: 'The camera: center and zoom.' },
    status: {
      type: "'loading' | 'ready' | 'failed'",
      description: 'Whether the tiles have loaded.',
    },
    messages: {
      type: 'ResolvedMessages',
      description: 'The map’s texts, with your overrides applied.',
    },
    ids: {
      type: 'object',
      description:
        'The ids the parts use, such as details (for aria-controls) and listHeading (for your own list’s skip link).',
    },
    show: {
      type: '(target: MapPlace | AddressResult) => void',
      description:
        'Centres the map on a place or an address, or fits the address’s bounds, without moving focus. A place also opens its details. An address draws the result pin and announces that the map shows it once the view settles.',
    },
    searchResult: {
      type: 'AddressResult | null',
      description: 'The address that show drew a pin for, until clearResult.',
    },
    clearResult: {
      type: '() => void',
      description: 'Removes the result pin. It announces nothing.',
    },
    setHighlightedPlaceId: {
      type: '(placeId: string | null) => void',
      description: 'Highlights a marker and its row, as hovering one does.',
    },
  }),
)

export const useMapHook: ApiHook = {
  name: 'useMap',
  intro:
    'The state behind Map.Root: it takes the same options and returns the same object as useMapState. Map.Root calls it for you, so you rarely need it.',
  options: rootRows,
}

export const useMapStateHook: ApiHook = {
  name: 'useMapState',
  intro:
    'Reads the map’s state inside Map.Root, so you can build a part the library does not render, such as your own list of places. It throws outside Map.Root. This is a selection of what it returns.',
  result: hookResultRows,
}
