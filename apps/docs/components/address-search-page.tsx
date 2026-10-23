import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { CodeBlock } from './code-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { StringsBlock } from './strings-block.tsx'
import type { StringKeySpec } from './strings-block.tsx'
import { UseCase } from './use-case.tsx'
import {
  addressResultRows,
  addressSearchRows,
  geocoderRows,
  helpTextRows,
  labelRows,
  listRows,
  noticeRows,
  optionRowsApi,
  rootAttributes,
  rootRows,
  statusAttributes,
  useAddressSearchHook,
} from '../content/address-search.api.ts'
import { ChangeOfAddressSearch } from '../examples/address-search/change-of-address.tsx'
import { DefaultAddressSearch } from '../examples/address-search/default.tsx'
import { FaultAddressSearch } from '../examples/address-search/report-a-fault.tsx'
import { RecyclingStationSearch } from '../examples/address-search/recycling-station.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type AddressSearchExampleSources = Record<
  'default' | 'recycling-station' | 'report-a-fault' | 'change-of-address',
  string
>

const installLines = `pnpm add @kvirn-ui/map`

const styleLines = `import '@kvirn-ui/theme/theme.css'
// Only when the search sits beside a map:
import '@kvirn-ui/theme/map.css'`

const importLines = `import { AddressSearch, useAddressSearch } from '@kvirn-ui/map'
import { kvirnGeocoder } from '@kvirn-ui/map/kvirn' // or /nominatim, /google-places`

const partsLines = `<AddressSearch.Root geocoder={geocoder} onResult={onResult}>
  <AddressSearch.Label>Find your address</AddressSearch.Label>
  <AddressSearch.Control>
    <AddressSearch.Input />
    <AddressSearch.Clear />
    <AddressSearch.Submit />
  </AddressSearch.Control>
  <AddressSearch.HelpText />
  <AddressSearch.Notice />
  <AddressSearch.Popup>
    <AddressSearch.Status />
    <AddressSearch.List>{(item) => <AddressSearch.Option item={item} />}</AddressSearch.List>
  </AddressSearch.Popup>
</AddressSearch.Root>`

const ownGeocoderLines = `const geocoder: GeocoderProvider = {
  name: 'our address register',
  search: async (query, { signal }) => {
    const response = await fetch(\`/api/addresses?q=\${encodeURIComponent(query)}\`, { signal })
    if (!response.ok) throw new Error('Address search failed')
    return response.json() // AddressResult[]: { id, label, position: { longitude, latitude } }
  },
}`

const parts: ApiPart[] = [
  {
    name: 'AddressSearch',
    renders: (
      <>
        The whole field, with the parts below in their default order: Label, Control (with Input,
        Clear and Submit), HelpText, Notice and Popup (with Status and List). It takes the props of{' '}
        <code>AddressSearch.Root</code> and <code>label</code>, and no children. On its own or
        beside a map, wrap it in a <code>&lt;search&gt;</code> element. Inside a form, leave{' '}
        <code>&lt;search&gt;</code> out.
      </>
    ),
    props: addressSearchRows,
  },
  {
    name: 'AddressSearch.Root',
    renders: (
      <>
        A <Link href="/components/field">Field.Root</Link>, which is a{' '}
        <code>&lt;div class=&quot;kv-address-search&quot;&gt;</code>, that owns the search. Put the
        parts below inside it. It takes the props of <code>Field.Root</code> except{' '}
        <code>messages</code>, <code>controlId</code> and <code>disabled</code>, which the options
        below set. Also exported as <code>AddressSearchRoot</code>.
      </>
    ),
    props: rootRows,
    attributes: rootAttributes,
  },
  {
    name: 'AddressSearch.Label',
    renders: (
      <>
        A <code>&lt;label for&gt;</code>, the visible name of the field. It takes the props of{' '}
        <code>Field.Label</code>. By default it shows no required or optional marker.
      </>
    ),
    props: labelRows,
  },
  {
    name: 'AddressSearch.Control',
    renders: (
      <>
        The box around the input, Clear and Submit. The popup is placed against it. It takes the
        props of <Link href="/components/autocomplete">Autocomplete.Control</Link>.
      </>
    ),
  },
  {
    name: 'AddressSearch.Input',
    renders: (
      <>
        An <code>&lt;input type=&quot;text&quot;&gt;</code> with the role <code>combobox</code>,
        with browser autofill turned off. It takes the props of <code>Autocomplete.Input</code>.
        Enter with no suggestion chosen searches, and never sends a form.
      </>
    ),
  },
  {
    name: 'AddressSearch.Clear',
    renders: (
      <>
        A <code>&lt;button type=&quot;button&quot; tabindex=&quot;-1&quot;&gt;</code>, so it is not
        a Tab stop. It empties the text, calls <code>onResult(null)</code> after a pick and keeps
        focus on the input. It takes the props of <code>Autocomplete.Clear</code>.
      </>
    ),
  },
  {
    name: 'AddressSearch.Submit',
    renders: (
      <>
        The Search button: a native <code>&lt;button type=&quot;button&quot;&gt;</code> named by the{' '}
        <code>addressSearch.submit</code> text. It renders only when the search runs on request, and
        it never sends a form. It takes the attributes of a <code>&lt;button&gt;</code>. Its
        children replace the text “Search”.
      </>
    ),
  },
  {
    name: 'AddressSearch.HelpText',
    renders: (
      <>
        A <code>&lt;p&gt;</code>, the field’s help text. The input is described by it. It takes the
        props of <code>Field.HelpText</code>.
      </>
    ),
    props: helpTextRows,
  },
  {
    name: 'AddressSearch.Notice',
    renders: (
      <>
        A <code>&lt;p&gt;</code> that says where the typed text goes, then shows the geocoder’s
        credit text. The input is described by it, after the help text, so a screen reader reads it
        when the field gets focus. It takes the props of <code>Field.HelpText</code>.
      </>
    ),
    props: noticeRows,
  },
  {
    name: 'AddressSearch.Popup',
    renders: (
      <>
        The popup that holds the status line and the list. It takes the props of{' '}
        <code>Autocomplete.Popup</code>.
      </>
    ),
  },
  {
    name: 'AddressSearch.Status',
    renders: (
      <>
        A <code>&lt;div&gt;</code> above the suggestions, in plain text with an icon: searching, too
        short, nothing found, error, offline or a pick turned down. It is not a live region. The
        same words are said through the Announcer, so they are not read twice. It renders nothing
        while the list is closed or there is no message.
      </>
    ),
    attributes: statusAttributes,
  },
  {
    name: 'AddressSearch.List',
    renders: (
      <>
        The <code>listbox</code> of suggestions, named by the label. It takes the props of{' '}
        <code>Autocomplete.List</code>.
      </>
    ),
    props: listRows,
  },
  {
    name: 'AddressSearch.Option',
    renders: (
      <>
        One suggestion, a <code>&lt;div role=&quot;option&quot;&gt;</code>. Its text is the
        geocoder’s <code>label</code>. It takes the props of <code>Autocomplete.Option</code>.
      </>
    ),
    props: optionRowsApi,
  },
  {
    name: 'GeocoderProvider',
    renders: (
      <>
        nothing: it is the object you pass in <code>geocoder</code>. KvirnUI names no service and
        has no default. To search your own register, write the object yourself: see the recipe under
        “Report a fault near an address”.
      </>
    ),
    props: geocoderRows,
  },
  {
    name: 'AddressResult',
    renders: (
      <>
        nothing: it is the object <code>onResult</code> gets. A suggestion in the list has the same
        fields, and can leave out <code>position</code> when <code>resolve</code> adds it.
      </>
    ),
    props: addressResultRows,
  },
]

export function AddressSearchPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: AddressSearchExampleSources
}) {
  return (
    <ComponentPage
      title="AddressSearch"
      lead="You get the address the visitor picks, with its position, and decide what happens next. You choose the geocoder (the service that finds addresses), and nothing is sent to it until the visitor types."
      packageName="@kvirn-ui/map"
      pattern="APG Combobox (editable, list autocomplete)"
      whenToUse={
        <ul>
          <li>
            Use it when a visitor knows an address and the answer should appear in your service: on
            a map, such as the recycling stations around their home, or in a form, where it fills in
            the address boxes. The visitor types a street, a postal code or a place, and picks an
            address from a list.
          </li>
          <li>
            In a form, <Link href="/components/address-input">AddressInput</Link> with a geocoder
            also suggests addresses in its street box. Use AddressSearch for a search of its own,
            above the boxes or beside a map. Not for an address the visitor knows by heart: use
            AddressInput alone, since a lookup adds a step and a third party.
          </li>
          <li>
            Not for anything other than addresses, such as case numbers or people: use a{' '}
            <Link href="/components/combobox">Combobox</Link> over your own data. Not for searching
            the pages of a site.
          </li>
          <li>
            A geocoder that says it allows search as you type (<code>suggest: true</code>) is
            searched about 0.4 seconds after the last key, and the field has no Search button. Any
            other geocoder is searched when the visitor presses Enter or Search, and typing sends
            nothing. <code>{'debounce={false}'}</code> turns search as you type off for any
            geocoder.
          </li>
          <li>
            What the visitor types, and their IP address, go to the geocoder you choose. Choose one
            whose terms allow your use. A public Nominatim server does not allow search as you type,
            and Google’s terms limit how you may show and keep its results. KvirnUI recommends
            neither for forms that residents fill in. It names no service and has no default.
          </li>
        </ul>
      }
      example={
        <>
          <ExampleFrame headingId="example" code={sources['default']}>
            <DefaultAddressSearch />
          </ExampleFrame>
          <p>
            The examples on this page send what you type to geo.kvirn.com, Kvirn’s own address
            service, hosted in the EU and setting no cookies. Your text and your IP address reach
            it, and only once you type (in the fault example, once you press Enter or Search). Don’t
            type your own address. Try a Swedish street and town, such as Drottninggatan 6,
            Stockholm. The map example also loads its map from geo.kvirn.com as soon as it is shown.
          </p>
          <Note kind="tip">
            Name your address service in your privacy notice: the text typed and the visitor’s IP
            address reach it (GDPR). The field already says where the text goes. A screen reader
            reads that notice when the field gets focus.
          </Note>
        </>
      }
      useCases={
        <>
          <UseCase
            id="recycling-station"
            title="Find recycling stations near your home"
            why={
              <>
                A resident types their address. The map moves to it and draws a pin, and the list
                under the map shows the recycling stations now in view. The zoom out button shows
                more. Picking an address does not move focus, so the resident stays in the field.
                The search sits inside <code>Map.Root</code>, before the map, and calls{' '}
                <code>show</code> and <code>clearResult</code> from{' '}
                <Link href="/components/map#api-usemapstate">useMapState</Link>. Once the map has
                moved, a screen reader says “The map shows the address.” and how many places are in
                view. See <Link href="#announcements-read-aloud">What a screen reader reads</Link>.
              </>
            }
            code={sources['recycling-station']}
            propsUsed={[
              { part: 'AddressSearch', prop: 'geocoder' },
              { part: 'AddressSearch', prop: 'onResult' },
            ]}
            note={
              <Note kind="reminder">
                Keep the <Link href="/components/map">Map</Link> list on the page. The pin is
                decoration. The list and the details are how everyone reaches a place (2.1.1
                Keyboard, 1.1.1 Non-text Content).
              </Note>
            }
          >
            <RecyclingStationSearch />
          </UseCase>
          <UseCase
            id="report-a-fault"
            title="Report a fault near an address"
            why={
              <>
                A resident reports a broken street light. They search for the street, and the town
                if they know it, and the report keeps the address and its position. This geocoder
                allows search as you type, but <code>debounce=&#123;false&#125;</code> makes the
                field search on request: typing sends nothing, the field has a Search button, and
                the text is sent only when the resident presses Enter or Search. The resident then
                picks an address from the list.
              </>
            }
            code={sources['report-a-fault']}
            propsUsed={[
              { part: 'AddressSearch', prop: 'geocoder' },
              { part: 'AddressSearch', prop: 'debounce' },
              { part: 'AddressSearch', prop: 'label' },
              { part: 'AddressSearch', prop: 'messages' },
              { part: 'AddressSearch', prop: 'onResult' },
            ]}
            note={
              <Note kind="recipe" more={<CodeBlock language="tsx" code={ownGeocoderLines} />}>
                To search your own register instead of a public service, write the geocoder
                yourself. Pass <code>signal</code> to <code>fetch</code>, so a new search cancels
                the old one. Give each address a full <code>label</code> with the town.
              </Note>
            }
          >
            <FaultAddressSearch />
          </UseCase>
          <UseCase
            id="change-of-address"
            title="Report a change of address with a search above the boxes"
            why={
              <>
                A resident reports a new address. They search first, and a pick fills the street,
                the postal code and the town. The example leaves line 2 alone. The boxes stay
                editable, so the resident can correct them or skip the search. Enter in the search
                looks up and does not send the form: the Report the change button does. A pick that
                has no postal address, such as a park, is turned down with <code>describePick</code>
                : the list stays open and a message says that nothing is filled in. Only a real
                address says that the boxes are filled in. The box validation is left out here; see{' '}
                <Link href="/components/address-input#errors-per-box">
                  Fix the boxes that are wrong
                </Link>{' '}
                on the AddressInput page. After a pick, a screen reader says “Chosen:”, the address,
                and “The address is filled in below. Check it before you continue.” See{' '}
                <Link href="#announcements-read-aloud">What a screen reader reads</Link>.
              </>
            }
            code={sources['change-of-address']}
            propsUsed={[
              { part: 'AddressSearch', prop: 'geocoder' },
              { part: 'AddressSearch', prop: 'label' },
              { part: 'AddressSearch', prop: 'messages' },
              { part: 'AddressSearch', prop: 'describePick' },
              { part: 'AddressSearch', prop: 'onResult' },
            ]}
            note={
              <Note kind="reminder">
                Keep the address boxes editable and the search optional. A lookup can fail or find
                nothing, and nobody should have to type an address twice (3.3.7 Redundant Entry).
              </Note>
            }
          >
            <ChangeOfAddressSearch />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          messageNamespace="addressSearch"
          linkToStrings
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Put the search where its result lands: before the map, or above the address boxes.
                The reading order and the Tab order then follow the task (2.4.3 Focus Order).
              </Note>
            ),
            keyboard: (
              <Note kind="tip">
                Enter with no suggestion chosen searches and never sends the form around the field.
                The form’s own submit button sends it. Keep that button visible, so the form can
                always be sent with the keyboard.
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
            Install the package. Import the theme once. The map’s styles are needed only when the
            search sits beside a map, and then MapLibre is needed too: see the{' '}
            <Link href="/components/map#api">Map</Link> page.
          </p>
          <CodeBlock language="bash" code={installLines} />
          <CodeBlock language="tsx" code={styleLines} />
          <Note kind="recipe" more={<CodeBlock language="tsx" code={partsLines} />}>
            To change a text or add a class, build the field from its parts. AddressSearch is these
            parts in this order. Keep it: the input is described by the help text, then the notice.
          </Note>
          <ApiBlock
            importLine={importLines}
            parts={parts}
            hook={useAddressSearchHook}
            strings={
              <>
                <StringsBlock namespace="addressSearch" component="AddressSearch" keys={stringKeys}>
                  <p>
                    The texts exist in all five languages. Have a native speaker review the Swedish,
                    Finnish and Norwegian ones before you launch. The geocoder’s name and the
                    addresses it returns are yours, so write them in the page’s language.
                  </p>
                </StringsBlock>
                <StringsBlock namespace="map" keys={mapStringKeys}>
                  <p>
                    This text belongs to the Map. It is said when a pick moves the map beside the
                    field, and <code>messages</code> on <code>Map.Root</code> or the provider
                    replaces it.
                  </p>
                </StringsBlock>
              </>
            }
          />
        </>
      }
    />
  )
}

const stringKeys: StringKeySpec<'addressSearch'>[] = [
  { key: 'label', meaning: 'The default label of the field.' },
  {
    key: 'helpSuggest',
    meaning: 'The help text when the search runs as you type.',
    values: { min: 3 },
  },
  {
    key: 'helpRequest',
    meaning: 'The help text when the search runs on request (Enter or Search).',
  },
  {
    key: 'submit',
    meaning: 'The name of the Search button, which shows only when the search runs on request.',
  },
  {
    key: 'privacy',
    meaning: 'The notice that says where the typed text goes, with the name of the service.',
    values: { service: 'the Kvirn map service' },
  },
  { key: 'privacyUnnamed', meaning: 'The notice when the geocoder has no name.' },
  {
    key: 'tooShort',
    meaning:
      'Shown and announced when the search runs on request and the text is shorter than minLength.',
    values: { min: 3 },
  },
  {
    key: 'searching',
    meaning:
      'Shown and announced when a request is on its way. It is left out when the answer is quick.',
  },
  {
    key: 'resultCount',
    meaning: 'Announced with the number of addresses found.',
    values: { count: 2 },
  },
  {
    key: 'noResults',
    meaning: 'Shown and announced when nothing is found. It is not an error.',
    values: { query: 'Storgatn' },
  },
  {
    key: 'error',
    meaning: 'Shown and announced when the search fails or takes too long.',
  },
  {
    key: 'offline',
    meaning: 'Shown and announced when the visitor is offline. No request is sent.',
  },
  {
    key: 'picked',
    meaning: 'Announced after a pick.',
    values: { label: 'Drottninggatan 6, 111 51 Stockholm' },
  },
  {
    key: 'pickedFilled',
    meaning:
      'Announced after a pick when the result fills in a form. Pass it as picked, for one field.',
    values: { label: 'Drottninggatan 6, 111 51 Stockholm' },
  },
]

const mapStringKeys: StringKeySpec<'map'>[] = [
  {
    key: 'addressShown',
    meaning:
      'Announced when the map has moved to the picked address. The places in view follow it.',
  },
]
