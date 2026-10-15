import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { apiHookPart, apiPartId } from './api-ids.ts'
import { CodeBlock } from './code-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { StringsBlock } from './strings-block.tsx'
import { UseCase } from './use-case.tsx'
import {
  attributionRows,
  baseMapSwitchRows,
  clusterPopupPlacesRows,
  clusterPopupRows,
  detailsPartRows,
  detailsRows,
  layerRows,
  layersRows,
  listAttributes,
  listRows,
  maplibreRows,
  markerRows,
  markersAttributes,
  markersRows,
  memoryProviderRows,
  overlayRows,
  placeRows,
  rasterStyleRows,
  rootRows,
  skipRows,
  sourceRows,
  useMapHook,
  useMapStateHook,
  viewportAttributes,
} from '../content/map.api.ts'
import { MapTypesMap } from '../examples/map/map-types.tsx'
import { FamilyMap } from '../examples/map/make-it-your-own.tsx'
import { OwnListMap } from '../examples/map/own-list.tsx'
import { PollingStationMap } from '../examples/map/clusters.tsx'
import { RecyclingMap } from '../examples/map/default.tsx'
import { WasteMap } from '../examples/map/layers.tsx'
import { MapPicturesAlert } from '../examples/map/use-docs-provider.tsx'
import { PreschoolMap } from '../examples/map/preschools.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type MapExampleSources = Record<
  'default' | 'preschools' | 'layers' | 'clusters' | 'own-list' | 'make-it-your-own' | 'map-types',
  string
>

const installLines = `pnpm add @kvirn-ui/map
pnpm add maplibre-gl`

const styleLines = `import '@kvirn-ui/theme/theme.css'
import '@kvirn-ui/theme/map.css'
import 'maplibre-gl/dist/maplibre-gl.css'`

const providerLines = `import { maplibre, rasterStyle } from '@kvirn-ui/map/maplibre'

// Create it once, outside your component. The tile address is yours.
export const provider = maplibre({
  style: rasterStyle({
    tiles: ['https://tiles.example.org/{z}/{x}/{y}.png'],
    attribution: '© Example municipality',
  }),
})`

const importLines = `import { Map, createMemoryProvider, useMap, useMapState } from '@kvirn-ui/map'
import { maplibre, rasterStyle } from '@kvirn-ui/map/maplibre'
import { createMapWorker } from '@kvirn-ui/map/worker'`

const rootAttributes = [
  {
    name: '--kv-map-block-size',
    values: 'a length',
    meaning:
      'The height of the map. The default is clamp(15rem, 60vh, 40rem). Set it on the Root or on any element around it.',
  },
]

const detailsAttributes = [
  {
    name: '--kv-map-popup-inline-size',
    values: 'a length',
    meaning: 'The width of a popup. The default is 22rem, and it never goes past the map.',
  },
  {
    name: '--kv-map-popup-radius',
    values: 'a length',
    meaning: 'The corner radius of a popup. The default is the theme’s medium radius.',
  },
  {
    name: 'kv-map-details-footer',
    values: 'a class',
    meaning:
      'Put it on a row of your own actions at the end of the popup. It stays at the bottom while the content scrolls.',
  },
]

const parts: ApiPart[] = [
  {
    name: 'Map.Root',
    renders: (
      <>
        <code>&lt;div class=&quot;kv-map&quot;&gt;</code>. It owns the camera, the open place and
        the map type, and it takes every attribute of a <code>&lt;div&gt;</code>. It is a container,
        so the layout changes at 40rem of the map’s own width, not the page’s. Put{' '}
        <code>Map.Skip</code>, <code>Map.Viewport</code>, <code>Map.List</code> and the popups
        inside. Also exported as <code>MapRoot</code>.
      </>
    ),
    props: rootRows,
    attributes: rootAttributes,
  },
  {
    name: 'Map.Skip',
    renders: (
      <>
        A skip link (<Link href="/components/skip-link">SkipLink</Link>) to the list. Put it before
        the viewport.
      </>
    ),
    props: skipRows,
  },
  {
    name: 'Map.Viewport',
    renders: (
      <>
        <code>&lt;div role=&quot;region&quot; tabindex=&quot;0&quot;&gt;</code>, named by the Root’s{' '}
        <code>label</code> and described as a map. The engine draws into it, and the markers,
        controls, layers and attribution are its children. It takes every attribute of a{' '}
        <code>&lt;div&gt;</code> except the role, the tab index and the <code>aria-*</code> it sets.
        It shows the keyboard hint, the loading and failed messages, and the gesture hint.
      </>
    ),
    attributes: viewportAttributes,
  },
  {
    name: 'Map.Markers',
    renders: (
      <>
        <code>&lt;div role=&quot;group&quot;&gt;</code> of buttons, one per place and one per
        cluster in the map view. They are one Tab stop. It renders nothing while nothing is in view.
      </>
    ),
    props: markersRows,
    attributes: markersAttributes,
  },
  {
    name: 'Map.Marker, Map.Cluster',
    renders: (
      <>
        One native <code>&lt;button&gt;</code> each, a large touch target (44 pixels by default). A
        cluster has <code>aria-haspopup=&quot;dialog&quot;</code>. Pressing a marker opens its
        details, and pressing a cluster opens its popup. Use <code>Map.Markers</code>, which renders
        them.
      </>
    ),
    props: markerRows,
  },
  {
    name: 'Map.Controls',
    renders: (
      <>
        <code>&lt;div role=&quot;group&quot;&gt;</code> of buttons: zoom in, zoom out, four pan
        buttons and Whole map, in that order. Each is the single-pointer alternative to a drag or a
        two-finger gesture. It takes every attribute of a <code>&lt;div&gt;</code>.
      </>
    ),
  },
  {
    name: 'Map.Overlay',
    renders: (
      <>
        <code>&lt;div class=&quot;kv-map-overlay&quot;&gt;</code> for chrome of your own that floats
        over the map, such as a search box or a legend. Put it inside <code>Map.Viewport</code> and
        position it with your own classes. A marker reached by keyboard is moved out from under it.
      </>
    ),
    props: overlayRows,
  },
  {
    name: 'Map.Attribution',
    renders: (
      <>
        A <code>&lt;p&gt;</code> named “Map data”, with the text and links of the active map type.
        Native links.
      </>
    ),
    props: attributionRows,
  },
  {
    name: 'Map.BaseMapSwitch',
    renders: (
      <>
        A button showing the current map type that opens a popover of preview tiles, one native
        radio each. It renders nothing with fewer than two map types. It takes every attribute of a{' '}
        <code>&lt;div&gt;</code>.
      </>
    ),
    props: baseMapSwitchRows,
  },
  {
    name: 'Map.Layers',
    renders: (
      <>
        A card titled “Show on the map” that collapses behind a button, and one native checkbox per
        layer, named with its count: “Hotels 100”. While collapsed, the button says how many layers
        are hidden. A layer’s <code>description</code> is the checkbox’s help text. It renders
        nothing without layers.
      </>
    ),
    props: layersRows,
  },
  {
    name: 'Map.List',
    renders: (
      <>
        A heading that states the count, then a <code>&lt;ul&gt;</code> with a button per place in
        the map view. It is hidden while a place’s details are open. It is the equivalent of the map
        for people who do not use it.
      </>
    ),
    props: listRows,
    attributes: listAttributes,
  },
  {
    name: 'Map.Details',
    renders: (
      <>
        <code>&lt;dialog open&gt;</code>, a non-modal popup anchored to the open place’s marker:
        above it, below when there is no room, and scrolling inside the room it has. It has no focus
        trap. Focus moves to its title, and Escape or Close returns it to the marker or the list row
        that opened it. It renders nothing while no place is open.
      </>
    ),
    props: detailsRows,
    attributes: detailsAttributes,
  },
  {
    name: 'Map.DetailsImage, Map.DetailsTitle, Map.DetailsBody, Map.DetailsAddress, Map.DetailsClose',
    renders: (
      <>
        The parts of a popup, for when you rearrange it. The picture is an <code>&lt;img&gt;</code>{' '}
        with the place’s <code>alt</code>, the title is an <code>&lt;h3&gt;</code> that names the
        dialog and takes focus, and Close is an icon button named “Close” plus the title. The
        picture, body and address render nothing when the place has none.
      </>
    ),
    props: detailsPartRows,
  },
  {
    name: 'Map.ClusterPopup',
    renders: (
      <>
        <code>&lt;dialog open&gt;</code> with the places of a cluster, in the same frame as the
        details. Only one of the two popups is open at a time. It renders nothing while no cluster
        is open.
      </>
    ),
    props: clusterPopupRows,
  },
  {
    name: 'Map.ClusterPopupPlaces',
    renders: (
      <>
        A <code>&lt;ul&gt;</code> with a button per place and its address under it. Past 50 places
        it shows only the rows in view and is one Tab stop.
      </>
    ),
    props: clusterPopupPlacesRows,
  },
  {
    name: 'Map.ClusterPopupTitle, Map.ClusterPopupClose',
    renders: (
      <>
        The title (an <code>&lt;h3&gt;</code>, which takes focus and names the dialog) and the Close
        button of a cluster popup. The title takes <code>as</code>.
      </>
    ),
  },
  {
    name: 'MapPlace',
    renders: 'nothing: it is the object you pass in places.',
    props: placeRows,
  },
  {
    name: 'MapLayer',
    renders: 'nothing: it is the object you pass in layers.',
    props: layerRows,
  },
  {
    name: 'MapPlaceSource',
    renders: 'nothing: it is the object you pass in source, for a very large set of places.',
    props: sourceRows,
  },
  {
    name: 'maplibre',
    renders: (
      <>
        nothing: <code>maplibre(options)</code> from <code>@kvirn-ui/map/maplibre</code> returns the
        provider for MapLibre GL. MapLibre is an optional peer: install it only for this adapter.
        These are its options.
      </>
    ),
    props: maplibreRows,
  },
  {
    name: 'rasterStyle',
    renders: (
      <>
        nothing: <code>rasterStyle(options)</code> from <code>@kvirn-ui/map/maplibre</code> returns
        a MapLibre style from your own tile addresses, for <code>maplibre({'{ style }'})</code>.
        These are its options.
      </>
    ),
    props: rasterStyleRows,
  },
  {
    name: 'createMemoryProvider',
    renders: (
      <>
        nothing: <code>createMemoryProvider(options)</code> returns a provider with no engine. It
        keeps the camera, draws nothing and sends nothing, so it suits tests and pages with no
        picture. The examples on this page use it. These are its options.
      </>
    ),
    props: memoryProviderRows,
  },
  {
    name: 'createMapWorker',
    renders: (
      <>
        nothing: a function from <code>@kvirn-ui/map/worker</code> that you pass as{' '}
        <code>indexIn</code>. The map creates the Web Worker when it builds the index of a large{' '}
        <code>source</code> and stops it afterwards, so you own nothing. The entry is ESM only.
      </>
    ),
  },
]

export function MapPage({ contract, sources }: { contract: Contract; sources: MapExampleSources }) {
  return (
    <ComponentPage
      title="Map"
      lead="You choose where the map pictures come from. Nothing is requested from anyone until a map with a provider is on the page."
      status="in-progress"
      packageName="@kvirn-ui/map"
      pattern="None: there is no APG pattern for a map. The markers use the Toolbar’s arrow keys."
      whenToUse={
        <>
          <MapPicturesAlert />
          <ul>
            <li>
              Use it when the question is where a place is: the nearest preschool, the recycling
              stations in a district, the polling station for an address. The same places are always
              in a list, so nobody has to use the map to reach one.
            </li>
            <li>
              Not for a single address: write it as text, with a link to a map service. Not for a
              long list with no question about where: use a list or a{' '}
              <Link href="/components/table">Table</Link>.
            </li>
            <li>
              Tiles (the map pictures) are your choice. The library names no tile server, and it has
              no default. A visitor’s browser asks your tile host for each picture, so the host sees
              the visitor’s IP address: name it in your privacy notice. A provider is the code that
              draws the map, such as MapLibre. Nothing is requested until a <code>Map.Root</code>{' '}
              with a provider is on the page.
            </li>
            <li>
              There is no address search yet. A visitor finds a place by the markers, the list and
              the layers. Address search is planned, over a geocoding service (it turns a typed
              address into a position) that you would choose.
            </li>
            <li>
              It is its own package, <code>@kvirn-ui/map</code>. Its styles are an opt-in import,{' '}
              <code>@kvirn-ui/theme/map.css</code>, after <code>theme.css</code>, so a site without
              maps does not pay for them. MapLibre is an optional peer. The install lines are in the{' '}
              <Link href="#api">API reference</Link>.
            </li>
          </ul>
        </>
      }
      example={
        <>
          <ExampleFrame headingId="example" code={sources['default']}>
            <RecyclingMap />
          </ExampleFrame>
          <p>
            The examples on this page start as a plain background and make no request to a map
            server. Press “Load map pictures” and your browser asks OpenStreetMap’s tile servers for
            the pictures, so your IP address reaches them. If you then choose the Satellite or
            Terrain map type, your IP address and the area you view go to Esri or OpenTopoMap
            instead. Move the map with the mouse, the arrow keys or the buttons, press a marker or a
            name in the list, and watch the list follow the view.
          </p>
        </>
      }
      useCases={
        <>
          <UseCase
            id="preschool"
            title="Finding a preschool near you"
            why={
              <>
                A parent looks for a preschool close to home. The list gives each name and address,
                and your own line under it, such as opening hours. A popup opens with a picture, the
                address and a few words, anchored to the place on the map.
              </>
            }
            code={sources['preschools']}
            propsUsed={[
              { part: 'Map.List', prop: 'children' },
              { part: 'MapPlace', prop: 'image' },
              { part: 'MapPlace', prop: 'description' },
            ]}
            note={
              <Note kind="reminder">
                Describe every picture in <code>image.alt</code>, or use an empty <code>alt</code>{' '}
                when it only decorates. Without it a screen reader user gets no idea what the
                picture shows (1.1.1 Non-text Content).
              </Note>
            }
          >
            <PreschoolMap />
          </UseCase>
          <UseCase
            id="waste"
            title="Showing only the kinds of place you want"
            why={
              <>
                A resident wants the hazardous waste depot, not the recycling stations. Layers let
                them show or hide each kind. Each layer’s checkbox says how many places it holds.
                Hiding a layer takes its markers and rows away and announces the new count, and
                focus stays on the checkbox. The card starts open; set{' '}
                <code>defaultOpen={'{false}'}</code> for a long list of layers, so it does not cover
                the map.
              </>
            }
            code={sources['layers']}
            propsUsed={[
              { part: 'Map.Root', prop: 'layers' },
              { part: 'MapPlace', prop: 'layer' },
            ]}
            note={
              <Note kind="reminder">
                Every layer has a name in the checkbox and in the list, so colour is never the only
                difference (1.4.1 Use of Color). If you give layers their own marker pictures, give
                each an icon or a shape too, not only another colour.
              </Note>
            }
          >
            <WasteMap />
          </UseCase>
          <UseCase
            id="polling-stations"
            title="Many places close together"
            why={
              <>
                On election day the map shows every polling station in the municipality. Where
                several are close, the map groups them in one button with the number on it. Pressing
                it opens a popup that lists them, and choosing one opens its details, so no place
                hides behind another. Zoom in with the + button and the groups split.
              </>
            }
            code={sources['clusters']}
            propsUsed={[
              { part: 'Map.Root', prop: 'cluster' },
              { part: 'Map.ClusterPopup', prop: 'children' },
            ]}
          >
            <PollingStationMap />
          </UseCase>
          <UseCase
            id="own-list"
            title="A list of your own"
            why={
              <>
                Your service already has a list with more than names: a distance, a filter, a link
                to book. Build it from <code>useMapState</code> and point <code>Map.Skip</code> at
                its heading. Opening a place from your list works like the library’s: focus moves to
                the title, and closing returns it to your button.
              </>
            }
            code={sources['own-list']}
            propsUsed={[
              { part: 'Map.Skip', prop: 'href' },
              {
                part: apiHookPart('useMapState', 'result'),
                label: 'useMapState (result)',
                prop: 'select',
              },
            ]}
            note={
              <Note kind="reminder">
                Without Map.List you must give people another way to reach and open every place. The
                library cannot check this (1.1.1 Non-text Content, 2.1.1 Keyboard, 2.5.7 Dragging
                Movements).
              </Note>
            }
          >
            <OwnListMap />
          </UseCase>
          <UseCase
            id="map-types"
            title="Letting people choose the map type"
            why={
              <>
                Some residents read a street map more easily than a plain one, or the other way
                round. Give the map two or more map types and add <code>Map.BaseMapSwitch</code>: a
                button that opens a small choice with a preview of each. The choice is announced,
                and the places, the list and the keyboard work the same on every map type. With
                fewer than two map types the switch renders nothing. See{' '}
                <Link href={`#${apiPartId('Map.BaseMapSwitch')}`}>Map.BaseMapSwitch</Link> in the
                API.
              </>
            }
            code={sources['map-types']}
            propsUsed={[
              { part: 'Map.BaseMapSwitch', prop: 'children' },
              { part: 'Map.BaseMapSwitch', prop: 'icon' },
            ]}
            note={
              <Note kind="reminder">
                Give each map type a clear label and its own attribution. The label names the choice
                for a screen reader, and the attribution must change with the map type (1.1.1
                Non-text Content).
              </Note>
            }
          >
            <MapTypesMap />
          </UseCase>
          <UseCase
            id="make-it-your-own"
            title="Make it your own"
            why={
              <>
                A municipality shows its places for children and families: playgrounds, libraries
                and swimming halls. A resident sees a different shape and colour for each kind, the
                library names on the map, a popup with opening hours and a link for directions, and
                switches that say how many places each kind holds. You write the markup; names,
                focus, announcements and keyboard come from the parts, so they keep working.
              </>
            }
            code={sources['make-it-your-own']}
            propsUsed={[
              { part: 'Map.Markers', prop: 'children' },
              { part: 'Map.Markers', prop: 'markerClassName' },
              { part: 'Map.Layers', prop: 'children' },
              { part: 'Map.Details', prop: 'children' },
              { part: 'Map.ClusterPopupPlaces', prop: 'renderPlace' },
            ]}
            note={
              <Note kind="reminder">
                A custom popup must keep <code>titleProps</code> on its title and a Close button, so
                focus and the dialog’s name still work. Wrap a whole template, in the details or the
                cluster popup, in <code>kv-map-details-content</code> to get the popup’s padding. A
                custom switch must name each layer and call <code>setLayerHidden</code>. A custom
                marker is decoration: its name comes from <code>label</code>, and the shape, not
                only the colour, tells the layers apart (1.4.1 Use of Color).
              </Note>
            }
          >
            <FamilyMap />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          messageNamespace="map"
          linkToStrings
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Keep a list of every place, and name the map with <code>label</code>. Without a
                list, someone who cannot use the map cannot reach a place (2.1.1 Keyboard).
              </Note>
            ),
            keyboard: (
              <Note kind="tip">
                Only the map itself takes keys, and only while it has focus. Combinations with
                Control, Command or Alt are never taken, so the browser’s own zoom keeps working
                (2.1.4 Character Key Shortcuts).
              </Note>
            ),
            testing: (
              <Note kind="tip">
                No row has passed yet. Test with the assistive technology your residents use before
                you rely on the map, and keep the list.
              </Note>
            ),
            'known-issues': (
              <Note kind="tip">
                If an issue here affects your service, list it in your accessibility statement with
                its workaround.
              </Note>
            ),
          }}
        />
      }
      contractSections={contractSectionList(contract)}
      api={
        <>
          <p>
            Install the package. Install MapLibre only if you use its adapter. Import the styles
            once, after the theme.
          </p>
          <CodeBlock language="bash" code={installLines} />
          <CodeBlock language="tsx" code={styleLines} />
          <Note kind="recipe" more={<CodeBlock language="tsx" code={providerLines} />}>
            Create the provider once, outside your component, so the instance stays the same between
            renders. Use a tile host you have an agreement with, and say so in your privacy notice.
          </Note>
          <ApiBlock
            importLine={importLines}
            parts={parts}
            hooks={[useMapHook, useMapStateHook]}
            strings={
              <StringsBlock
                namespace="map"
                component="Map"
                layout="table"
                keys={[
                  {
                    key: 'roleDescription',
                    meaning: 'The role a screen reader says for the map region.',
                  },
                  {
                    key: 'summary',
                    meaning: 'Read after the map’s name: how many places are drawn.',
                    values: { count: 12 },
                  },
                  {
                    key: 'keyboardHint',
                    meaning: 'The hint on the map until the next interaction.',
                  },
                  { key: 'skipToList', meaning: 'The text of the skip link.' },
                  { key: 'controlsLabel', meaning: 'The name of the group of control buttons.' },
                  { key: 'markersLabel', meaning: 'The name of the group of markers.' },
                  { key: 'zoomIn', meaning: 'The name of the zoom in button.' },
                  { key: 'zoomOut', meaning: 'The name of the zoom out button.' },
                  {
                    key: 'zoomLimitIn',
                    meaning: 'Announced when the map cannot zoom in any further.',
                  },
                  {
                    key: 'zoomLimitOut',
                    meaning: 'Announced when the map cannot zoom out any further.',
                  },
                  {
                    key: 'reset',
                    meaning: 'The text of the button that returns to the start view.',
                  },
                  { key: 'panNorth', meaning: 'The name of the pan north button.' },
                  { key: 'panSouth', meaning: 'The name of the pan south button.' },
                  { key: 'panEast', meaning: 'The name of the pan east button.' },
                  { key: 'panWest', meaning: 'The name of the pan west button.' },
                  {
                    key: 'placesInView',
                    meaning:
                      'Announced after the view settles, and the list’s heading, when some places are out of view.',
                    values: { count: 12 },
                  },
                  {
                    key: 'placesAll',
                    meaning: 'Announced, and the list’s heading, when every place is in view.',
                    values: { count: 12 },
                  },
                  { key: 'loading', meaning: 'Shown in the viewport while the map loads.' },
                  {
                    key: 'tilesFailedTitle',
                    meaning: 'Shown, and announced once, when the tiles fail.',
                  },
                  {
                    key: 'tilesFailedBody',
                    meaning: 'Shown under the failed title: the list still works.',
                  },
                  {
                    key: 'gestureTouch',
                    meaning: 'The hint when one finger is used on a touch screen.',
                  },
                  {
                    key: 'gestureWheel',
                    meaning: 'The hint when the wheel is used without the modifier key.',
                    values: { modifier: 'Ctrl' },
                  },
                  { key: 'detailsClose', meaning: 'The first part of the popup’s Close name.' },
                  {
                    key: 'listEmpty',
                    meaning: 'Shown in place of the list when no place is in view.',
                  },
                  {
                    key: 'indexing',
                    meaning: 'Announced once while the index of a large source builds.',
                  },
                  { key: 'attributionLabel', meaning: 'The name of the attribution text.' },
                  { key: 'baseMapLabel', meaning: 'The name and legend of the map type switch.' },
                  {
                    key: 'baseMapChanged',
                    meaning: 'Announced when the visitor changes the map type.',
                    values: { label: 'Satellite' },
                  },
                  {
                    key: 'clusterLabel',
                    meaning: 'The name of a cluster button.',
                    values: { count: 12 },
                  },
                  {
                    key: 'clusterLayerLabel',
                    meaning: 'The name of a cluster button when it belongs to a layer.',
                    values: { count: 12, layer: 'Hotels' },
                  },
                  {
                    key: 'clusterTitle',
                    meaning: 'The title of a cluster popup.',
                    values: { count: 12 },
                  },
                  {
                    key: 'clusterLayerTitle',
                    meaning: 'The title of a cluster popup when it belongs to a layer.',
                    values: { count: 12, layer: 'Hotels' },
                  },
                  {
                    key: 'clusterClose',
                    meaning: 'The first part of a cluster popup’s Close name.',
                  },
                  { key: 'layersLegend', meaning: 'The title of the layers card and its button.' },
                  {
                    key: 'layersHiddenValue',
                    meaning: 'After the title while the card is collapsed and layers are hidden.',
                    values: { count: 3 },
                  },
                  {
                    key: 'layerCountValue',
                    meaning: 'The count after a layer’s name in its checkbox.',
                    values: { count: 100 },
                  },
                ]}
              >
                <p>
                  The map’s texts are English in every language for now. Your map’s{' '}
                  <code>label</code>, your layer names and your place data are yours, so write them
                  in the page’s language.
                </p>
              </StringsBlock>
            }
          />
        </>
      }
    />
  )
}
