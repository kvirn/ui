import { en } from '@kvirn-ui/i18n/en'
import { KvirnProvider } from '@kvirn-ui/react'
import { Map } from '@kvirn-ui/map'
import type { MapRootProps } from '@kvirn-ui/map'
import contract from '../../../../../packages/map/src/map.a11y.md?raw'
import guide from '../../../../../packages/map/src/map.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useArgs } from 'storybook/preview-api'
import { fn } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import {
  baseMapIds,
  CustomMarkersDemo,
  initialView,
  layeredArgs,
  MapDemo,
  MapEverythingDemo,
  MapLayeredDemo,
  MapRenderFunctionPopupDemo,
  MapOwnListDemo,
  MapSelectSwitchDemo,
  places,
  type MapDemoProps,
} from './map.fixture.tsx'
import { ManyPlacesDemo } from './map-many.fixture.tsx'
import type { ManyPlacesDemoProps } from './map-many.fixture.tsx'
import { RichPopupDemo } from './map-rich-popup.tsx'

// Map: the viewport, markers, controls and place list (contract: map.a11y.md). Default
// is the plain map, like the docs site; each customization has its own story and Everything has
// them all. Default and CustomBaseMapSwitch load real OpenStreetMap, Esri and OpenTopoMap tiles,
// so they are tagged `!test`. The other stories use a plain background style: no network call.

const meta = {
  title: 'Map/Map',
  component: Map.Root,
  args: {
    label: 'Map of preschools',
    baseMap: 'standard',
    defaultBaseMap: 'standard',
    showBaseMapSwitch: true,
    showList: true,
    onBaseMapChange: fn(),
    initialView,
    places,
    cluster: true,
    messages: {},
  },
  argTypes: {
    label: {
      control: 'text',
      description:
        "The map's accessible name, set on the viewport. Required, and in your language: the library does not translate it.",
    },
    showBaseMapSwitch: {
      control: 'boolean',
      description:
        'Story only, not a prop: whether the page renders `Map.BaseMapSwitch`. Showing or hiding a part is composition: you render it or you do not.',
    },
    showList: {
      control: 'boolean',
      description:
        'Story only, not a prop: whether the page renders `Map.List`. Default on here. Without it you must give another way to reach every place: the list is the map for screen reader and keyboard users (see OwnList).',
    },
    offline: { table: { disable: true } },
    provider: {
      control: false,
      description:
        'Required: the engine adapter. `maplibre({ style | baseMaps, workerUrl })`, `createMemoryProvider()` or your own `MapProvider`. Keep it stable between renders.',
    },
    baseMap: {
      control: 'select',
      options: [undefined, ...baseMapIds],
      description:
        'The active map type, by id. Set it to control the map: update it in `onBaseMapChange` (the radios do it here). Unset, the map keeps its own and `defaultBaseMap` starts it.',
    },
    defaultBaseMap: {
      control: 'select',
      options: [undefined, ...baseMapIds],
      description:
        'The map type to start on when `baseMap` is unset (clear that control to try it). Default: the provider’s, else the first. Remounts the map.',
    },
    onBaseMapChange: {
      control: false,
      description:
        'Called with the id when the visitor picks a map type. Not called by a prop change.',
    },
    initialView: {
      control: 'object',
      description:
        'Required: where the map starts and where Whole map returns to, `{ center: { longitude, latitude }, zoom }`. Later changes do not move the camera, so the story remounts the map.',
    },
    places: {
      control: 'object',
      description:
        'The places, `{ id, name, position: { longitude, latitude }, address?, description?, image?: { src, alt } }`: `name` is the popup title, `description` its body, `image.alt` is yours (empty when decorative). Each is a marker and a list row. Default none. Keep the array stable.',
    },
    layers: {
      control: 'object',
      description:
        'The layers, `{ id, label, description?, cluster? }`. A place joins one by `layer`. `Map.Layers` shows a checkbox for each, and `cluster: false` keeps a layer out of clusters. Keep the array stable.',
    },
    hiddenLayers: {
      control: false,
      description:
        'The ids of the hidden layers. Set it to control which layers show, and update it in `onHiddenLayersChange`. Unset, the map keeps its own.',
    },
    defaultHiddenLayers: {
      control: 'object',
      description:
        'The layers to start hidden when `hiddenLayers` is unset. All layers show by default. Remounts the map.',
    },
    onHiddenLayersChange: {
      control: false,
      description: 'Called with the next hidden ids when the visitor toggles a layer.',
    },
    cluster: {
      control: 'boolean',
      description:
        'Group places that would overlap into clusters: pressing one opens `Map.ClusterPopup` with its places. Default on, radius 64 CSS pixels; pass `{ radius }` to change it, `false` to turn it off.',
    },
    messages: {
      control: 'object',
      description:
        'Per-instance overrides of the `map` strings, such as `{ zoomIn: "Closer" }`. Default: the provider’s catalog.',
    },
    children: {
      control: false,
      description:
        'The parts: `Map.Skip`, `Map.Viewport` (with `Map.Markers`, `Map.Controls`, `Map.Attribution`), `Map.BaseMapSwitch`, `Map.Layers`, `Map.List`, `Map.Details` and `Map.ClusterPopup` with `Map.DetailsImage`, `Map.DetailsTitle`, `Map.DetailsBody`, `Map.DetailsAddress` and `Map.DetailsClose`.',
    },
    className: {
      control: false,
      description: 'Joins `kv-map` on the root `div`. Root also takes every other `div` prop.',
    },
  },
  globals: { locale: 'en' },
  parameters: {
    layout: 'padded',
    a11yContract: contract,
    docs: {
      description: { component: usageGuide(guide) },
      ...showSource('map/map.fixture.tsx', 'MapDemo').docs,
    },
  },
  // The map announces the places in view and a changed map type through the provider's live region.
  decorators: [
    (Story) => (
      <KvirnProvider locale="en" messages={en}>
        <Story />
      </KvirnProvider>
    ),
  ],
} satisfies Meta<MapRootProps & { offline: boolean; showBaseMapSwitch: boolean; showList: boolean }>

export default meta
type Story = StoryObj<MapDemoProps>

function renderMap(args: MapDemoProps) {
  const [, updateArgs] = useArgs<MapDemoProps>()
  return (
    <MapDemo
      {...args}
      onBaseMapChange={(id) => {
        args.onBaseMapChange?.(id)
        if (args.baseMap !== undefined) {
          updateArgs({ baseMap: id })
        }
      }}
    />
  )
}

function renderWith(Demo: typeof MapDemo) {
  return function render(args: MapDemoProps) {
    const [, updateArgs] = useArgs<MapDemoProps>()
    return (
      <Demo
        {...args}
        onBaseMapChange={(id) => {
          args.onBaseMapChange?.(id)
          if (args.baseMap !== undefined) {
            updateArgs({ baseMap: id })
          }
        }}
      />
    )
  }
}

/**
 * The plain map, as on the docs site: default markers, controls, attribution, the list and the
 * details, with real tiles (OpenStreetMap, Esri satellite, OpenTopoMap). Every option is a
 * control. It calls those third parties, so it is not run in tests: Offline covers the same map.
 * The stories below add one customization each, and Everything adds them all.
 */
export const Default: Story = { render: renderMap, tags: ['!test'] }

/** The same plain map on a background style with no tile source: no network, markers on flat colour. */
export const Offline: Story = { render: renderMap, args: { offline: true } }

/**
 * Focus the map and try the keys in the Keyboard table: arrows pan, plus and minus zoom, Tab
 * enters the markers, and Enter opens a place's details.
 */
export const Keyboard: Story = { render: renderMap, args: { offline: true } }

/**
 * Layers with icons (`Map.Layers` `icon`), clusters per layer and a pin per layer on the default
 * parts: 100 fuel stations and 100 hotels.
 */
export const LayersAndClusters: Story = {
  render: renderWith(MapLayeredDemo),
  args: { ...layeredArgs, offline: true },
}

/** `Map.Layers` with `defaultOpen={false}` and a layer hidden: the title row shows "1 hidden". */
export const LayersCollapsed: Story = {
  render: renderWith(MapLayeredDemo),
  args: {
    ...layeredArgs,
    offline: true,
    layersDefaultOpen: false,
    defaultHiddenLayers: ['hotels'],
    // The 44px title row sits over the top-left corner, so the view starts clear of the stations there.
    initialView: {
      ...initialView,
      center: { ...initialView.center, latitude: initialView.center.latitude + 0.0149 },
    },
  },
}

/** No `Map.List`: a list of your own, built from `useMapState`, with `Map.Skip href` pointing at it. */
export const OwnList: Story = { render: renderWith(MapOwnListDemo), args: { offline: true } }

/**
 * `Map.BaseMapSwitch` with a render function: a native select in a Field with a visible label. It
 * switches between real tiles, so it is not run in tests.
 */
export const CustomBaseMapSwitch: Story = {
  render: renderWith(MapSelectSwitchDemo),
  tags: ['!test'],
}

/**
 * `Map.Details` with children: the parts (image, title, close, body, address) composed with the
 * consumer's own facts from `place.data` (category, rating, hours, facilities, links) and own
 * classes. Omitted fields still render nothing: the ice cream kiosk has no image or body.
 */
export const CustomPopup: Story = {
  render: renderWith(RichPopupDemo),
  args: { offline: true },
}

/** The render function form: the whole template from `{ place, close, titleProps, side }`. */
export const RenderFunctionPopup: Story = {
  render: renderWith(MapRenderFunctionPopupDemo),
  args: { offline: true },
}

/**
 * A pin per layer and a ring per cluster, made with `Map.Markers` children, `cluster`,
 * `markerClassName`, `clusterClassName`, `label` and `clusterLabel`. The content is decorative:
 * the buttons are named by the labels, and the shapes differ by layer as well as by colour.
 */
export const CustomMarkers: Story = {
  render: renderWith(CustomMarkersDemo),
  args: { ...layeredArgs, offline: true },
  parameters: showSource('map/map.fixture.tsx', 'CustomMarkersDemo'),
}

/**
 * Every customization on one map, offline: layers with icons and a collapsed Layers card with a
 * hidden layer, cluster and marker render functions with their classes and labels, a custom
 * popup, a select for the map type, the page's own list with `Map.Skip href`, own classes and a
 * `messages` override ("Closer" and "Farther"). Show code is the real demo.
 */
export const Everything: Story = {
  render: renderWith(MapEverythingDemo),
  args: {
    ...layeredArgs,
    offline: true,
    // The collapsed Layers title row sits over the top-left corner, so the view starts clear of the stations there.
    initialView: {
      ...initialView,
      center: { ...initialView.center, latitude: initialView.center.latitude + 0.0149 },
    },
  },
  parameters: showSource('map/map.fixture.tsx', 'MapEverythingDemo'),
}

type ManyStory = StoryObj<ManyPlacesDemoProps>

const manyLabel = 'Map of fuel stations and hotels'

const manyArgTypes = {
  count: {
    control: 'select',
    options: [10_000, 100_000, 1_000_000],
    description:
      'Story only: how many places the generated `source` holds (seeded, clumped around Nordic cities).',
  },
  indexIn: {
    control: 'inline-radio',
    options: ['main', 'worker'],
    description:
      'Where the cluster index is built: `main` in 8 ms slices, or `worker` with `createMapWorker()` from `@kvirn-ui/map/worker`.',
  },
  // The demo builds these itself from the generated source; `cluster={false}` would draw every place.
  ...Object.fromEntries(
    [
      'showBaseMapSwitch',
      'provider',
      'baseMap',
      'defaultBaseMap',
      'onBaseMapChange',
      'initialView',
      'places',
      'layers',
      'hiddenLayers',
      'onHiddenLayersChange',
      'cluster',
      'children',
      'className',
    ].map((name) => [name, { table: { disable: true } }]),
  ),
} as const

/**
 * A `source` of columns instead of `places`: positions in a Float64Array and a layer per place in
 * a Uint16Array, with `get(index)` building a place only when it is shown. The map says "Loading
 * the places" while the index builds, then shows clusters. Change `count` and `indexIn` to compare.
 * A million places is slow to build in tests, so it is not run there: ManyPlacesSmall covers it.
 */
export const ManyPlaces: ManyStory = {
  render: (args) => <ManyPlacesDemo {...args} />,
  args: { count: 1_000_000, indexIn: 'main', label: manyLabel },
  argTypes: manyArgTypes,
  tags: ['!test'],
  parameters: showSource('map/map-many.fixture.tsx', 'ManyPlacesDemo'),
}

/** 50,000 places on the main thread, zoomed out so `Map.List` is long and virtualized. */
export const ManyPlacesSmall: ManyStory = {
  render: (args) => <ManyPlacesDemo {...args} />,
  args: { count: 50_000, indexIn: 'main', label: manyLabel, showList: true },
  argTypes: manyArgTypes,
  parameters: showSource('map/map-many.fixture.tsx', 'ManyPlacesDemo'),
}
