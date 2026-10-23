import type {
  AddressResult,
  AddressSearchHelpTextProps,
  AddressSearchListProps,
  AddressSearchNoticeProps,
  AddressSearchOptionProps,
  AddressSearchProps,
  AddressSearchRootProps,
  GeocoderProvider,
  UseAddressSearchResult,
} from '@kvirn-ui/map'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow, PropRow } from '../components/api-block.tsx'

/** The options of the Root and of `useAddressSearch`: the Root passes all of these to the hook. */
const optionRows = propRows<
  Pick<
    AddressSearchRootProps,
    | 'geocoder'
    | 'onResult'
    | 'minLength'
    | 'debounce'
    | 'timeoutMilliseconds'
    | 'country'
    | 'limitToCountry'
    | 'describePick'
    | 'initialText'
    | 'disabled'
    | 'id'
    | 'messages'
  >
>({
  geocoder: {
    type: 'GeocoderProvider',
    description:
      'The service that finds addresses, as an object (see GeocoderProvider below). Make it once, outside your component. Its name is shown in the privacy notice. Geocoders come from @kvirn-ui/map: kvirnGeocoder (from @kvirn-ui/map/kvirn), nominatim (@kvirn-ui/map/nominatim) and googlePlaces (@kvirn-ui/map/google-places). You can also write your own. Nothing is sent before the visitor types and, on request, presses Search. What is typed, and the visitor’s IP address, reach this service, so name it in your privacy notice. KvirnUI recommends neither Nominatim nor Google for forms that residents fill in: read their terms first.',
  },
  onResult: {
    type: '(result: AddressResult | null) => void',
    default: '–',
    description:
      'Called once with the address the visitor picks, with its position. Called with null when the visitor clears the field with Clear after a pick. It never moves focus. With a map, call show(result) and clearResult() on it. In a form, write result.address into your address boxes.',
  },
  minLength: {
    type: 'number',
    default: '3',
    description:
      'The fewest characters, after trimming spaces, before a search is sent. Below it, as you type, nothing is sent or said. On request, Enter or Search says how many characters are needed. The Kvirn map service needs at least 2.',
  },
  debounce: {
    type: 'number | false',
    default: '400',
    description:
      'Milliseconds of no typing before a search as you type. false, or a geocoder without suggest: true, searches on request: Enter or the Search button.',
  },
  timeoutMilliseconds: {
    type: 'number',
    default: '10000',
    description:
      'How long to wait for an answer, in milliseconds. After that the search counts as failed and the error text shows.',
  },
  country: {
    type: 'string',
    default: '–',
    description:
      'A country as an ISO 3166-1 code, such as SE. It is sent to the geocoder, which ranks that country first. Results in other countries are still listed.',
  },
  limitToCountry: {
    type: 'boolean',
    default: 'false',
    description:
      'With country: drops the results that have an address in another country, for a form that can’t record one.',
  },
  describePick: {
    type: '(result: AddressResult, messages) => { rejected: string } | { announcement: string }',
    default: '–',
    description:
      'Decides what a pick means before onResult runs. { rejected } keeps the list open, restores the text the visitor typed, shows that text on the status line and announces it, and onResult is not called. { announcement } is announced instead of the picked text.',
  },
  initialText: {
    type: 'string',
    default: '–',
    description: 'The text the input starts with, for a field that already holds a value.',
  },
  disabled: {
    type: 'boolean',
    default: 'false',
    description: 'Disables the field and the Search button.',
  },
  id: {
    type: 'string',
    default: '–',
    description: 'The id of the input. Without one the field makes its own.',
  },
  messages: {
    type: 'Partial<KvirnMessages["addressSearch"]>',
    default: '–',
    description:
      'Changes the texts of this field only. See Strings below for every key and its English text.',
  },
})

export const addressSearchRows = {
  ...propRows<Pick<AddressSearchProps, 'label'>>({
    label: {
      type: 'ReactNode',
      default: 'addressSearch.label',
      description:
        'The visible label. Write it for the task, such as “Find your address”. It is the field’s name for a screen reader, so keep it visible.',
    },
  }),
  ...optionRows,
}

export const rootRows = optionRows

export const rootAttributes: AttributeRow[] = [
  {
    name: 'data-status',
    values: 'idle, too-short, searching, results, empty, error, offline, selected or rejected',
    meaning:
      'What the search is doing, for your styles. A search that finds nothing is empty, not an error. rejected means describePick turned a pick down.',
  },
]

export const labelRows: Readonly<Record<string, PropRow>> = {
  children: {
    type: 'ReactNode',
    default: 'addressSearch.label',
    description: 'The label text. Without children it shows the addressSearch.label text.',
  },
}

export const helpTextRows = propRows<Pick<AddressSearchHelpTextProps, 'children'>>({
  children: {
    type: 'ReactNode',
    default: 'the help text',
    description:
      'The instruction under the field. Without children it says to press Search (on request) or to choose from the list (as you type).',
  },
})

export const noticeRows = propRows<Pick<AddressSearchNoticeProps, 'children'>>({
  children: {
    type: 'ReactNode',
    default: 'the privacy notice',
    description:
      'Without children it says where the typed text goes, with the geocoder’s name, then shows the geocoder’s attribution (its credit text). If you replace it, say both yourself.',
  },
})

export const statusAttributes: AttributeRow[] = [
  {
    name: 'data-state',
    values: 'too-short, searching, empty, error, offline or rejected',
    meaning: 'Which message the line shows, for your styles.',
  },
]

export const listRows = propRows<Pick<AddressSearchListProps, 'children'>>({
  children: {
    type: '(item: AddressSuggestion) => ReactNode',
    default: '–',
    description:
      'Renders one AddressSearch.Option per address: (item) => <AddressSearch.Option item={item} />. The options show only while the list is open.',
  },
})

export const optionRowsApi = propRows<Pick<AddressSearchOptionProps, 'item' | 'children'>>({
  item: {
    type: 'AddressSuggestion',
    description: 'One of the addresses the list hands you.',
  },
  children: {
    type: 'ReactNode',
    default: 'the address label',
    description:
      'The content of the option. Without children it shows the geocoder’s label, which is also what fills the field and what a screen reader reads.',
  },
})

export const geocoderRows = propRows<
  Pick<GeocoderProvider, 'name' | 'attribution' | 'suggest' | 'search' | 'resolve' | 'structured'>
>({
  name: {
    type: 'string',
    default: '–',
    description:
      'Who receives the typed text. It is named in the privacy notice, so write it as a person says it: “Kvirn’s map service”. Without a name the notice says “an address service”.',
  },
  attribution: {
    type: 'string',
    default: '–',
    description:
      'The credit text that the service’s terms ask for. It is shown after the privacy notice.',
  },
  suggest: {
    type: 'boolean',
    default: 'false',
    description:
      'true only if the service’s terms allow a search at each pause in typing. Then the field searches as you type. Otherwise it searches on request.',
  },
  search: {
    type: '(query: string, options: { signal, locale, intent }) => Promise<AddressSuggestion[]>',
    description:
      'Finds addresses for the text. signal is cancelled when a new search starts, locale is the page’s language, and intent is "suggest" (a pause in typing) or "submit" (Enter or Search). Return a list; an empty list means nothing was found, and a rejected promise shows the error text.',
  },
  resolve: {
    type: '(suggestion, options: { signal, locale }) => Promise<AddressResult>',
    default: '–',
    description:
      'Adds the position to a suggestion that has none. It is called once, when the visitor picks. Without it, every suggestion needs a position in search, or picking it shows the error text.',
  },
  structured: {
    type: '(parts, options) => Promise<AddressResult | null>',
    default: '–',
    description:
      'Looks up an address whose parts are known. AddressInput uses it for a house number. AddressSearch does not call it.',
  },
})

export const addressResultRows = propRows<
  Pick<AddressResult, 'id' | 'label' | 'position' | 'bounds' | 'address' | 'precision'>
>({
  id: { type: 'string', description: 'A stable id, used as the option’s key.' },
  label: {
    type: 'string',
    description:
      'The address as one line of text, with the town: “Drottninggatan 6, 111 51 Stockholm”. It is the option’s name, the text that fills the field and the address in the announcement after a pick.',
  },
  position: {
    type: '{ longitude: number; latitude: number }',
    description: 'Where the address is.',
  },
  bounds: {
    type: '{ west, south, east, north }',
    default: '–',
    description: 'The box around the place, for a street or an area. A map fits its view to it.',
  },
  address: {
    type: '{ line1, postalCode, city, country }',
    default: '–',
    description:
      'The parts of a postal address, for filling in a form. country is a two-letter ISO 3166-1 code in upper case, such as SE. A result without it fills nothing in a form.',
  },
  precision: {
    type: "'address' | 'street' | 'place'",
    default: '–',
    description:
      'How exact the result is: an address with a house number, a street without one, or a place such as a town. Left out when the service can’t tell.',
  },
})

export const useAddressSearchHook: ApiHook = {
  name: 'useAddressSearch',
  intro:
    'The state and props behind the field, for when you draw your own. It takes the same options as AddressSearch.Root and needs a KvirnProvider. It returns everything useAutocomplete returns (inputProps, popupProps, listProps, getOptionProps and the open state), plus the values below. The words in the result are the same texts as the parts show.',
  options: optionRows,
  result: propRows<
    Pick<
      UseAddressSearchResult,
      | 'status'
      | 'results'
      | 'isOnRequest'
      | 'search'
      | 'submitProps'
      | 'statusProps'
      | 'statusText'
      | 'labelText'
      | 'helpText'
      | 'noticeText'
      | 'attribution'
      | 'submitText'
    >
  >({
    status: {
      type: 'AddressSearchState',
      description:
        'What the search is doing: idle, too-short, searching, results, empty, error, offline, selected or rejected (describePick turned a pick down).',
    },
    results: {
      type: 'readonly AddressSuggestion[]',
      description: 'The latest answer. Earlier results stay listed while the next search runs.',
    },
    isOnRequest: {
      type: 'boolean',
      description: 'True when only Enter or the Search button sends a search.',
    },
    search: { type: '() => void', description: 'Searches now, as Enter and Search do.' },
    submitProps: {
      type: 'object',
      description:
        'Spread on the Search button. Show the button only while isOnRequest is true. It is a type="button" and never submits a form.',
    },
    statusProps: {
      type: 'object',
      description: 'Spread on the line above the suggestions. It carries data-state.',
    },
    statusText: {
      type: 'string | undefined',
      description: 'The words for the status line. There are none for idle, results and selected.',
    },
    labelText: { type: 'string', description: 'The default label text.' },
    helpText: {
      type: 'string',
      description: 'The default help text for the current mode.',
    },
    noticeText: { type: 'string', description: 'The default privacy notice text.' },
    attribution: {
      type: 'string | undefined',
      description: 'The geocoder’s credit text, to show after the notice.',
    },
    submitText: { type: 'string', description: 'The default text of the Search button.' },
  }),
}
